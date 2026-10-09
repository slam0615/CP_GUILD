"""Media Grabber — 貼上 YouTube / Instagram / TikTok 網址，取得原生解析度的影片、照片與字幕。

後端：FastAPI + yt-dlp（影片 / 字幕）+ gallery-dl（Instagram / TikTok 照片）。
"""

from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import tempfile
import urllib.request
from pathlib import Path
from urllib.parse import quote, urlparse

import yt_dlp
from fastapi import FastAPI, HTTPException, Query
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from starlette.background import BackgroundTask

BASE_DIR = Path(__file__).resolve().parent
COOKIES_FILE = os.environ.get("COOKIES_FILE")  # Netscape 格式 cookies.txt（Instagram 通常需要登入）
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
)

# 只接受這三個平台的網址，避免被當成任意網址抓取器
PLATFORM_HOSTS = {
    "youtube": ("youtube.com", "youtu.be", "youtube-nocookie.com"),
    "instagram": ("instagram.com", "instagr.am"),
    "tiktok": ("tiktok.com",),
}

# 圖片 / 直連影片代理只允許這些 CDN（防止 SSRF）
PROXY_HOSTS = {
    "instagram": ("cdninstagram.com", "fbcdn.net"),
    "tiktok": ("tiktokcdn.com", "tiktokcdn-us.com", "tiktokcdn-eu.com", "tiktokv.com",
               "tiktokv.us", "tiktokv.eu", "ibyteimg.com", "byteoversea.com", "muscdn.com"),
    "youtube": ("ytimg.com", "ggpht.com", "googleusercontent.com", "googlevideo.com"),
}
REFERERS = {
    "instagram": "https://www.instagram.com/",
    "tiktok": "https://www.tiktok.com/",
    "youtube": "https://www.youtube.com/",
}
IMAGE_EXTS = {"jpg", "jpeg", "png", "webp", "heic", "avif", "gif"}

app = FastAPI(title="Media Grabber")


# ---------------------------------------------------------------- helpers

def _host_matches(host: str, suffixes: tuple[str, ...]) -> bool:
    host = (host or "").lower().rstrip(".")
    return any(host == s or host.endswith("." + s) for s in suffixes)


def detect_platform(url: str) -> str:
    parsed = urlparse(url.strip())
    if parsed.scheme not in ("http", "https"):
        raise HTTPException(400, "請輸入 http(s) 開頭的網址")
    for name, hosts in PLATFORM_HOSTS.items():
        if _host_matches(parsed.hostname or "", hosts):
            return name
    raise HTTPException(400, "目前只支援 YouTube、Instagram、TikTok 的網址")


def ydl_opts(**extra) -> dict:
    opts = {
        "quiet": True,
        "noprogress": True,
        "no_warnings": True,
        "noplaylist": True,  # YouTube 網址帶 &list= 時只抓單支影片
        "extractor_retries": 2,
        "http_headers": {"User-Agent": USER_AGENT},
        # 新版 YouTube 需要 JS runtime 解簽章；deno 與 node 任一可用即可
        "js_runtimes": {"deno": {}, "node": {}},
    }
    if COOKIES_FILE:
        opts["cookiefile"] = COOKIES_FILE
    opts.update(extra)
    return opts


def clean_error(exc: Exception) -> str:
    msg = re.sub(r"\x1b\[[0-9;]*m", "", str(exc))
    msg = msg.replace("ERROR: ", "").strip()
    if re.search(r"login|log in|cookies|rate-limit|sign in", msg, re.I):
        msg += "\n（提示：此內容可能需要登入，請設定 COOKIES_FILE 環境變數指向 cookies.txt）"
    return msg[:800]


def human_size(n: float | None) -> str | None:
    if not n:
        return None
    for unit in ("B", "KB", "MB", "GB"):
        if n < 1024:
            return f"{n:.0f} {unit}" if unit in ("B", "KB") else f"{n:.1f} {unit}"
        n /= 1024
    return f"{n:.1f} TB"


def safe_filename(name: str, default: str = "media") -> str:
    name = re.sub(r'[\\/:*?"<>|\r\n\t]+', "_", name or "").strip(" .")
    return (name or default)[:150]


def content_disposition(filename: str) -> str:
    ascii_name = filename.encode("ascii", "ignore").decode() or "download"
    ascii_name = ascii_name.replace('"', "")
    return f'attachment; filename="{ascii_name}"; filename*=UTF-8\'\'{quote(filename)}'


# ---------------------------------------------------------------- info building

def build_video_options(info: dict) -> list[dict]:
    formats = info.get("formats") or []
    videos = [f for f in formats if f.get("vcodec") not in (None, "none") and f.get("height")]
    has_audio_only = any(
        f.get("acodec") not in (None, "none") and f.get("vcodec") == "none" for f in formats
    )

    options: list[dict] = []
    if videos or info.get("url"):
        top = max(videos, key=lambda f: (f.get("height") or 0, f.get("fps") or 0, f.get("tbr") or 0),
                  default=None)
        label = "最高畫質（原生解析度）"
        if top:
            label += f" · {top.get('width') or '?'}×{top.get('height')}"
            if top.get("fps"):
                label += f" {round(top['fps'])}fps"
        options.append({"selector": "bv*+ba/b", "label": label, "best": True})

    # 每個解析度挑一個最好的版本（同高度依 fps、位元率排序）
    by_height: dict[int, dict] = {}
    for f in videos:
        h = f["height"]
        key = (f.get("fps") or 0, f.get("tbr") or 0)
        cur = by_height.get(h)
        if cur is None or key > ((cur.get("fps") or 0), (cur.get("tbr") or 0)):
            by_height[h] = f
    for h in sorted(by_height, reverse=True):
        f = by_height[h]
        video_only = f.get("acodec") in (None, "none")
        selector = f"{f['format_id']}+ba/{f['format_id']}" if video_only and has_audio_only else f["format_id"]
        codec = (f.get("vcodec") or "").split(".")[0]
        parts = [f"{f.get('width') or '?'}×{h}"]
        if f.get("fps"):
            parts.append(f"{round(f['fps'])}fps")
        if codec:
            parts.append(codec)
        size = human_size(f.get("filesize") or f.get("filesize_approx"))
        if size:
            parts.append(size)
        options.append({"selector": selector, "label": " · ".join(parts), "best": False})
    return options


def build_audio_option(info: dict) -> dict | None:
    audios = [f for f in info.get("formats") or []
              if f.get("acodec") not in (None, "none") and f.get("vcodec") == "none"]
    if not audios:
        return None
    best = max(audios, key=lambda f: f.get("abr") or f.get("tbr") or 0)
    label = f"最佳音訊 · {best.get('ext')}"
    if best.get("abr"):
        label += f" · {round(best['abr'])}kbps"
    return {"selector": "ba/b", "label": label}


def build_subtitles(info: dict) -> list[dict]:
    subs: list[dict] = []
    orig_lang = info.get("language")
    for auto, key in ((False, "subtitles"), (True, "automatic_captions")):
        for lang, tracks in (info.get(key) or {}).items():
            if lang == "live_chat" or not tracks:
                continue
            if auto and not (lang.endswith("-orig") or lang == orig_lang):
                # 自動翻譯字幕有上百種語言；只保留原文自動字幕，其餘標記為翻譯
                translated = True
            else:
                translated = False
            exts = sorted({t.get("ext") for t in tracks if t.get("ext")})
            subs.append({
                "lang": lang,
                "name": tracks[0].get("name") or lang,
                "auto": auto,
                "translated": translated,
                "exts": exts,
            })
    return subs


def best_thumbnail(info: dict) -> dict | None:
    thumbs = [t for t in info.get("thumbnails") or [] if t.get("url")]
    if not thumbs:
        return {"url": info["thumbnail"]} if info.get("thumbnail") else None
    # 有尺寸的以面積排序，否則依 preference / 清單順序（yt-dlp 會把最好的放後面）
    return max(enumerate(thumbs), key=lambda it: (
        (it[1].get("width") or 0) * (it[1].get("height") or 0),
        it[1].get("preference") or 0,
        it[0],
    ))[1]


def summarize_entry(info: dict, index: int | None) -> dict:
    thumb = best_thumbnail(info)
    return {
        "index": index,
        "id": info.get("id"),
        "title": info.get("title") or info.get("description") or info.get("id"),
        "duration": info.get("duration"),
        "thumbnail": thumb.get("url") if thumb else None,
        "thumbnail_size": (f"{thumb['width']}×{thumb['height']}"
                           if thumb and thumb.get("width") and thumb.get("height") else None),
        "videos": build_video_options(info),
        "audio": build_audio_option(info),
        "subtitles": build_subtitles(info),
    }


def extract_with_ytdlp(url: str) -> dict:
    with yt_dlp.YoutubeDL(ydl_opts(skip_download=True)) as ydl:
        info = ydl.extract_info(url, download=False)
        info = ydl.sanitize_info(info)

    meta = {
        "title": info.get("title"),
        "uploader": info.get("uploader") or info.get("channel") or info.get("uploader_id"),
        "webpage_url": info.get("webpage_url") or url,
    }
    if info.get("_type") == "playlist" or info.get("entries"):
        entries = [e for e in info.get("entries") or [] if e]
        items = [summarize_entry(e, i) for i, e in enumerate(entries, start=1)]
    else:
        items = [summarize_entry(info, None)]
    return {**meta, "items": items}


def extract_with_gallerydl(url: str) -> list[dict]:
    """用 gallery-dl 取得 Instagram / TikTok 的原圖（含輪播）與直連影片。"""
    exe = shutil.which("gallery-dl")
    if not exe:
        return []
    cmd = [exe, "-j", "--config-ignore", "-o", f"user-agent={USER_AGENT}"]
    if COOKIES_FILE:
        cmd += ["--cookies", COOKIES_FILE]
    cmd.append(url)
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=90)
        data = json.loads(proc.stdout or "[]")
    except (subprocess.TimeoutExpired, json.JSONDecodeError, OSError):
        return []

    files, seen = [], set()
    for msg in data if isinstance(data, list) else []:
        if not (isinstance(msg, list) and len(msg) >= 3 and msg[0] == 3):
            continue
        file_url, kw = msg[1], msg[2] if isinstance(msg[2], dict) else {}
        if not isinstance(file_url, str) or not file_url.startswith("http") or file_url in seen:
            continue
        seen.add(file_url)
        ext = (kw.get("extension") or Path(urlparse(file_url).path).suffix.lstrip(".") or "").lower()
        kind = "image" if ext in IMAGE_EXTS else ("video" if ext in ("mp4", "mov", "webm") else None)
        if not kind:
            continue
        num = kw.get("num") or len(files) + 1
        base = kw.get("shortcode") or kw.get("post_shortcode") or kw.get("id") or "media"
        files.append({
            "kind": kind,
            "url": file_url,
            "ext": ext,
            "width": kw.get("width"),
            "height": kw.get("height"),
            "filename": safe_filename(f"{base}_{num}.{ext}"),
        })
    return files


# ---------------------------------------------------------------- API

class InfoRequest(BaseModel):
    url: str


@app.post("/api/info")
async def api_info(req: InfoRequest):
    url = req.url.strip()
    platform = detect_platform(url)

    result: dict = {"platform": platform, "url": url, "items": [], "files": []}
    ytdlp_error = None
    try:
        result.update(await run_in_threadpool(extract_with_ytdlp, url))
    except Exception as exc:  # yt-dlp 對純照片貼文會丟錯，交給 gallery-dl
        ytdlp_error = clean_error(exc)

    if platform in ("instagram", "tiktok"):
        files = await run_in_threadpool(extract_with_gallerydl, url)
        has_ytdlp_video = any(item["videos"] for item in result["items"])
        # yt-dlp 已能處理影片時，只從 gallery-dl 補照片
        result["files"] = [f for f in files if f["kind"] == "image" or not has_ytdlp_video]

    if not result["items"] and not result["files"]:
        raise HTTPException(422, ytdlp_error or "找不到可下載的內容")
    result["warning"] = ytdlp_error if ytdlp_error and result["files"] else None
    return result


def _cleanup(path: str):
    shutil.rmtree(path, ignore_errors=True)


def _download(url: str, selector: str, item: int | None, workdir: str) -> Path:
    opts = ydl_opts(
        format=selector,
        outtmpl=os.path.join(workdir, "%(title).120B [%(id)s].%(ext)s"),
        # 只做封裝（remux），不重新編碼 → 保留原生畫質
        merge_output_format="mp4/mkv",
        restrictfilenames=False,
        windowsfilenames=True,
    )
    if item:
        opts["noplaylist"] = False
        opts["playlist_items"] = str(item)
    with yt_dlp.YoutubeDL(opts) as ydl:
        ydl.download([url])
    files = [p for p in Path(workdir).iterdir() if p.is_file() and not p.name.endswith((".part", ".ytdl"))]
    if not files:
        raise RuntimeError("下載失敗，沒有產生檔案")
    return max(files, key=lambda p: p.stat().st_size)


@app.get("/api/download")
async def api_download(url: str, fmt: str = Query("bv*+ba/b", max_length=200), item: int | None = None):
    detect_platform(url)
    if not re.fullmatch(r"[\w*+/\-.\[\]<>=:,?!]+", fmt):
        raise HTTPException(400, "格式參數不合法")
    workdir = tempfile.mkdtemp(prefix="grab_")
    try:
        path = await run_in_threadpool(_download, url, fmt, item, workdir)
    except Exception as exc:
        _cleanup(workdir)
        raise HTTPException(502, clean_error(exc))
    return FileResponse(path, filename=path.name, background=BackgroundTask(_cleanup, workdir),
                        headers={"Content-Disposition": content_disposition(path.name)})


def _download_subtitle(url: str, lang: str, ext: str, auto: bool, item: int | None, workdir: str) -> Path:
    convert = ext == "srt"
    opts = ydl_opts(
        skip_download=True,
        writesubtitles=not auto,
        writeautomaticsub=auto,
        subtitleslangs=[lang],
        subtitlesformat="vtt/best" if convert else ext,
        outtmpl=os.path.join(workdir, "%(title).120B [%(id)s].%(ext)s"),
        windowsfilenames=True,
    )
    if convert:
        opts["postprocessors"] = [{"key": "FFmpegSubtitlesConvertor", "format": "srt"}]
    if item:
        opts["noplaylist"] = False
        opts["playlist_items"] = str(item)
    with yt_dlp.YoutubeDL(opts) as ydl:
        ydl.download([url])
    files = [p for p in Path(workdir).iterdir() if p.is_file()]
    if convert:
        files = [p for p in files if p.suffix == ".srt"] or files
    if not files:
        raise RuntimeError("找不到這個語言的字幕")
    return files[0]


@app.get("/api/subtitle")
async def api_subtitle(url: str, lang: str = Query(..., max_length=40), ext: str = Query("srt", max_length=10),
                       auto: bool = False, item: int | None = None):
    detect_platform(url)
    if not re.fullmatch(r"[\w\-]+", lang) or not re.fullmatch(r"\w+", ext):
        raise HTTPException(400, "參數不合法")
    workdir = tempfile.mkdtemp(prefix="sub_")
    try:
        path = await run_in_threadpool(_download_subtitle, url, lang, ext, auto, item, workdir)
    except Exception as exc:
        _cleanup(workdir)
        raise HTTPException(502, clean_error(exc))
    return FileResponse(path, filename=path.name, background=BackgroundTask(_cleanup, workdir),
                        headers={"Content-Disposition": content_disposition(path.name)})


@app.get("/api/proxy")
def api_proxy(url: str, filename: str = "media", inline: bool = False):
    """代理下載 CDN 上的原圖 / 直連影片（加上正確的 Referer，並強制以附件下載）。"""
    host = urlparse(url).hostname or ""
    platform = next((p for p, hosts in PROXY_HOSTS.items() if _host_matches(host, hosts)), None)
    if not url.startswith("https://") or not platform:
        raise HTTPException(400, "不允許的來源網址")
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Referer": REFERERS[platform]})
    try:
        resp = urllib.request.urlopen(req, timeout=30)
    except Exception as exc:
        raise HTTPException(502, f"來源下載失敗：{exc}")

    def stream():
        with resp:
            while chunk := resp.read(256 * 1024):
                yield chunk

    headers = {"Cache-Control": "private, max-age=3600"}
    if not inline:
        headers["Content-Disposition"] = content_disposition(safe_filename(filename))
    if resp.headers.get("Content-Length"):
        headers["Content-Length"] = resp.headers["Content-Length"]
    return StreamingResponse(stream(), media_type=resp.headers.get("Content-Type", "application/octet-stream"),
                             headers=headers)


app.mount("/", StaticFiles(directory=BASE_DIR / "static", html=True), name="static")
