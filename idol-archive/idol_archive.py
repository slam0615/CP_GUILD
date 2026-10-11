#!/usr/bin/env python3
"""偶像資料庫 (Idol Archive) — 把 X (Twitter) 上的貼文收進本機資料庫，方便搜尋、標籤與回溯。

只使用 Python 標準函式庫，不需安裝任何套件。

資料來源：
  1. X 官方「下載你的資料」封存檔（自己的貼文、按讚的貼文）        -> import-archive
  2. 貼文網址（逐筆或從文字檔批次加入，透過公開 oEmbed 取得內容）  -> add
  3. X 官方 API（需付費方案的 Bearer Token，可抓偶像帳號的時間軸）  -> api-user / api-search

用法請見 README.md，或執行 `python3 idol_archive.py -h`。
"""
from __future__ import annotations

import argparse
import csv
import html
import json
import mimetypes
import os
import re
import shutil
import sqlite3
import sys
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

HERE = Path(__file__).resolve().parent
DEFAULT_DB = Path(os.environ.get("IDOL_ARCHIVE_DB", HERE / "data" / "archive.db"))
TWITTER_EPOCH_MS = 1288834974657
USER_AGENT = "Mozilla/5.0 (idol-archive)"

SCHEMA = """
CREATE TABLE IF NOT EXISTS tweets (
    id              TEXT PRIMARY KEY,
    author_username TEXT NOT NULL DEFAULT '',
    author_name     TEXT NOT NULL DEFAULT '',
    text            TEXT NOT NULL DEFAULT '',
    created_at      TEXT NOT NULL DEFAULT '',   -- ISO 8601, UTC
    url             TEXT NOT NULL DEFAULT '',
    lang            TEXT NOT NULL DEFAULT '',
    reply_to        TEXT NOT NULL DEFAULT '',
    likes           INTEGER,
    retweets        INTEGER,
    media           TEXT NOT NULL DEFAULT '[]', -- JSON: [{type, url, local}]
    source          TEXT NOT NULL DEFAULT '',
    note            TEXT NOT NULL DEFAULT '',
    search_text     TEXT NOT NULL DEFAULT '',
    added_at        TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_tweets_created ON tweets(created_at);
CREATE INDEX IF NOT EXISTS idx_tweets_author ON tweets(author_username);
CREATE TABLE IF NOT EXISTS tags (
    tweet_id TEXT NOT NULL REFERENCES tweets(id) ON DELETE CASCADE,
    tag      TEXT NOT NULL,
    PRIMARY KEY (tweet_id, tag)
);
CREATE INDEX IF NOT EXISTS idx_tags_tag ON tags(tag);
CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT);
"""

TWEET_FIELDS = ("author_username", "author_name", "text", "created_at", "url", "lang",
                "reply_to", "likes", "retweets", "media", "source")


# ---------------------------------------------------------------------------
# 工具函式
# ---------------------------------------------------------------------------

def normalize(s: str) -> str:
    """搜尋用正規化：全形轉半形、英文轉小寫（ＡＢＣ / abc / ABC 都能互相搜到）。"""
    return unicodedata.normalize("NFKC", s or "").lower()


def snowflake_time(tweet_id: str) -> str:
    """從貼文 ID 推算發文時間（2010 年 11 月之後的貼文適用）。"""
    try:
        ms = (int(tweet_id) >> 22) + TWITTER_EPOCH_MS
    except ValueError:
        return ""
    if ms < TWITTER_EPOCH_MS + 1000:
        return ""
    return datetime.fromtimestamp(ms / 1000, tz=timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def parse_twitter_date(s: str) -> str:
    """'Wed Oct 10 20:19:24 +0000 2018' 或 ISO 字串 -> ISO UTC。"""
    if not s:
        return ""
    for fmt in ("%a %b %d %H:%M:%S %z %Y", "%Y-%m-%dT%H:%M:%S.%f%z", "%Y-%m-%dT%H:%M:%S%z"):
        try:
            return datetime.strptime(s.replace("Z", "+0000"), fmt).astimezone(timezone.utc) \
                .strftime("%Y-%m-%dT%H:%M:%SZ")
        except ValueError:
            continue
    return ""


STATUS_RE = re.compile(r"(?:twitter\.com|x\.com)/(?:#!/)?(\w+|i/web|i)/status(?:es)?/(\d+)", re.I)


def parse_status_url(url: str) -> tuple[str, str] | None:
    """回傳 (username, tweet_id)；username 可能是空字串。"""
    m = STATUS_RE.search(url)
    if not m:
        return None
    user = m.group(1)
    if user.lower() in ("i", "i/web"):
        user = ""
    return user, m.group(2)


def expand_urls(text: str, entities: dict | None) -> str:
    """把 t.co 短網址換回原本的網址，並移除指向圖片本身的 t.co 連結。"""
    if not entities:
        return text
    for u in entities.get("urls", []) or []:
        short = u.get("url")
        full = u.get("expanded_url") or u.get("expandedUrl")
        if short and full:
            text = text.replace(short, full)
    for m in entities.get("media", []) or []:
        if m.get("url"):
            text = text.replace(m["url"], "")
    return text.strip()


def http_get_json(url: str, headers: dict | None = None, timeout: int = 30):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, **(headers or {})})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8")), resp.headers


# ---------------------------------------------------------------------------
# 資料庫
# ---------------------------------------------------------------------------

class Archive:
    def __init__(self, path: Path | str = DEFAULT_DB):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.media_dir = self.path.parent / "media"
        self.db = sqlite3.connect(str(self.path), check_same_thread=False)
        self.db.row_factory = sqlite3.Row
        self.db.execute("PRAGMA foreign_keys = ON")
        self.db.executescript(SCHEMA)

    # ---- 寫入 ----
    def upsert(self, t: dict, tags: list[str] | None = None) -> bool:
        """新增或合併一則貼文。既有欄位不會被空值覆蓋。回傳是否為新貼文。"""
        tid = str(t["id"])
        if not t.get("created_at"):
            t["created_at"] = snowflake_time(tid)
        if isinstance(t.get("media"), list):
            t["media"] = json.dumps(t["media"], ensure_ascii=False)
        row = self.db.execute("SELECT * FROM tweets WHERE id = ?", (tid,)).fetchone()
        if row is None:
            vals = {f: t.get(f) for f in TWEET_FIELDS}
            for f in TWEET_FIELDS:
                if vals[f] is None and f not in ("likes", "retweets"):
                    vals[f] = "[]" if f == "media" else ""
            vals["note"] = t.get("note", "")
            self.db.execute(
                f"INSERT INTO tweets (id, {', '.join(vals)}, added_at) "
                f"VALUES (?, {', '.join('?' * len(vals))}, ?)",
                (tid, *vals.values(), datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")))
            new = True
        else:
            updates = {}
            for f in TWEET_FIELDS:
                v = t.get(f)
                if v in (None, "", "[]"):
                    continue
                if f == "media":
                    v = self._merge_media(row["media"], v)
                elif f == "source":
                    srcs = [x for x in row["source"].split(",") if x]
                    v = ",".join(srcs + [v] if v not in srcs else srcs)
                if v != row[f]:
                    updates[f] = v
            if updates:
                self.db.execute(
                    f"UPDATE tweets SET {', '.join(f'{k} = ?' for k in updates)} WHERE id = ?",
                    (*updates.values(), tid))
            new = False
        for tag in tags or []:
            self.add_tag(tid, tag, refresh=False)
        self.refresh_search(tid)
        return new

    @staticmethod
    def _merge_media(old_json: str, new_json: str) -> str:
        old = json.loads(old_json or "[]")
        new = json.loads(new_json or "[]")
        by_url = {m["url"]: m for m in old}
        for m in new:
            if m["url"] in by_url:
                by_url[m["url"]] = {**m, **{k: v for k, v in by_url[m["url"]].items() if v}}
            else:
                by_url[m["url"]] = m
        return json.dumps(list(by_url.values()), ensure_ascii=False)

    def refresh_search(self, tid: str):
        row = self.db.execute("SELECT * FROM tweets WHERE id = ?", (tid,)).fetchone()
        if not row:
            return
        tags = [r[0] for r in self.db.execute("SELECT tag FROM tags WHERE tweet_id = ?", (tid,))]
        blob = "\n".join([row["text"], row["author_username"], row["author_name"],
                          row["note"], " ".join(tags)])
        self.db.execute("UPDATE tweets SET search_text = ? WHERE id = ?", (normalize(blob), tid))

    def add_tag(self, tid: str, tag: str, refresh: bool = True):
        tag = tag.strip().lstrip("#")
        if tag:
            self.db.execute("INSERT OR IGNORE INTO tags (tweet_id, tag) VALUES (?, ?)", (tid, tag))
            if refresh:
                self.refresh_search(tid)

    def remove_tag(self, tid: str, tag: str):
        self.db.execute("DELETE FROM tags WHERE tweet_id = ? AND tag = ?", (tid, tag))
        self.refresh_search(tid)

    def set_note(self, tid: str, note: str):
        self.db.execute("UPDATE tweets SET note = ? WHERE id = ?", (note, tid))
        self.refresh_search(tid)

    def delete(self, tid: str):
        self.db.execute("DELETE FROM tweets WHERE id = ?", (tid,))

    def commit(self):
        self.db.commit()

    def get_meta(self, key: str) -> str | None:
        r = self.db.execute("SELECT value FROM meta WHERE key = ?", (key,)).fetchone()
        return r[0] if r else None

    def set_meta(self, key: str, value: str):
        self.db.execute("INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)", (key, value))

    # ---- 查詢 ----
    def search(self, q: str = "", author: str = "", tag: str = "", date_from: str = "",
               date_to: str = "", has_media: bool = False, source: str = "",
               order: str = "desc", limit: int = 50, offset: int = 0) -> tuple[list[dict], int]:
        """關鍵字以空白分隔（全部都要符合）；前面加 - 表示排除；用 "雙引號" 包住片語；
        `A|B` 表示 A 或 B。"""
        where, args = [], []
        for term in tokenize_query(q):
            neg = term.startswith("-") and len(term) > 1
            if neg:
                term = term[1:]
            alts = [normalize(a) for a in term.split("|") if a]
            if not alts:
                continue
            clause = "(" + " OR ".join("search_text LIKE ? ESCAPE '\\'" for _ in alts) + ")"
            where.append(("NOT " if neg else "") + clause)
            args += [f"%{like_escape(a)}%" for a in alts]
        if author:
            where.append("(lower(author_username) = ? OR author_name LIKE ?)")
            args += [author.lstrip("@").lower(), f"%{author}%"]
        if tag:
            where.append("id IN (SELECT tweet_id FROM tags WHERE tag = ?)")
            args.append(tag.lstrip("#"))
        if date_from:
            where.append("created_at >= ?")
            args.append(date_from)
        if date_to:
            where.append("created_at < ?")
            args.append(_next_day(date_to))
        if has_media:
            where.append("media != '[]'")
        if source:
            where.append("source LIKE ?")
            args.append(f"%{source}%")
        sql_where = ("WHERE " + " AND ".join(where)) if where else ""
        total = self.db.execute(f"SELECT COUNT(*) FROM tweets {sql_where}", args).fetchone()[0]
        direction = "ASC" if order == "asc" else "DESC"
        rows = self.db.execute(
            f"SELECT * FROM tweets {sql_where} ORDER BY created_at {direction}, id {direction} "
            f"LIMIT ? OFFSET ?", (*args, limit, offset)).fetchall()
        return [self._row_to_dict(r) for r in rows], total

    def _row_to_dict(self, r: sqlite3.Row) -> dict:
        d = {k: r[k] for k in r.keys() if k != "search_text"}
        d["media"] = json.loads(d["media"] or "[]")
        d["tags"] = [x[0] for x in self.db.execute(
            "SELECT tag FROM tags WHERE tweet_id = ? ORDER BY tag", (r["id"],))]
        return d

    def stats(self) -> dict:
        q = self.db.execute
        return {
            "total": q("SELECT COUNT(*) FROM tweets").fetchone()[0],
            "with_media": q("SELECT COUNT(*) FROM tweets WHERE media != '[]'").fetchone()[0],
            "range": list(q("SELECT MIN(created_at), MAX(created_at) FROM tweets "
                            "WHERE created_at != ''").fetchone()),
            "authors": [dict(r) for r in q(
                "SELECT author_username AS username, MAX(author_name) AS name, COUNT(*) AS n "
                "FROM tweets WHERE author_username != '' GROUP BY lower(author_username) "
                "ORDER BY n DESC LIMIT 100")],
            "tags": [dict(r) for r in q(
                "SELECT tag, COUNT(*) AS n FROM tags GROUP BY tag ORDER BY n DESC, tag")],
            "months": [dict(r) for r in q(
                "SELECT substr(created_at, 1, 7) AS month, COUNT(*) AS n FROM tweets "
                "WHERE created_at != '' GROUP BY month ORDER BY month")],
        }


def tokenize_query(q: str) -> list[str]:
    """以空白切開查詢字串，"雙引號" 內的空白視為片語的一部分。"""
    return [(a or b).replace('"', "") for a, b in re.findall(r'(-?"[^"]+")|(\S+)', q or "")]


def like_escape(s: str) -> str:
    return s.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def _next_day(d: str) -> str:
    """把 'YYYY-MM-DD' / 'YYYY-MM' / 'YYYY' 轉為「隔天/隔月/隔年」作為不含的上限。"""
    try:
        if len(d) == 4:
            return f"{int(d) + 1:04d}"
        if len(d) == 7:
            y, m = map(int, d.split("-"))
            return f"{y + (m == 12):04d}-{m % 12 + 1:02d}"
        dt = datetime.strptime(d[:10], "%Y-%m-%d")
        return datetime.fromordinal(dt.toordinal() + 1).strftime("%Y-%m-%d")
    except ValueError:
        return d


# ---------------------------------------------------------------------------
# 匯入：X 官方封存檔
# ---------------------------------------------------------------------------

def read_ytd_js(path: Path) -> list:
    """讀取封存檔中的 `window.YTD.xxx.part0 = [...]` 檔案。"""
    raw = path.read_text(encoding="utf-8")
    return json.loads(raw[raw.index("=") + 1:].strip().rstrip(";"))


def _ytd_files(data_dir: Path, *names: str) -> list[Path]:
    out = []
    for name in names:
        out += sorted(data_dir.glob(f"{name}.js")) + sorted(data_dir.glob(f"{name}-part*.js"))
    return out


def parse_archive(root: Path) -> list[tuple[dict, str]]:
    """解析封存檔，回傳 [(tweet_dict, kind)]，kind 為 'tweet' 或 'like'。"""
    root = Path(root)
    data_dir = root / "data" if (root / "data").is_dir() else root
    owner_user, owner_name = "", ""
    for f in _ytd_files(data_dir, "account"):
        acc = read_ytd_js(f)[0]["account"]
        owner_user, owner_name = acc.get("username", ""), acc.get("accountDisplayName", "")
    local_media = {}
    media_folder = data_dir / "tweets_media"
    if media_folder.is_dir():
        for p in media_folder.iterdir():
            local_media.setdefault(p.name.split("-", 1)[0], []).append(p)

    out = []
    for f in _ytd_files(data_dir, "tweets", "tweet"):
        for item in read_ytd_js(f):
            tw = item.get("tweet", item)
            tid = tw.get("id_str") or tw.get("id")
            media = []
            for m in (tw.get("extended_entities") or tw.get("entities") or {}).get("media", []):
                murl = m.get("media_url_https") or m.get("media_url")
                if m.get("type") in ("video", "animated_gif"):
                    vs = [v for v in m.get("video_info", {}).get("variants", [])
                          if v.get("content_type") == "video/mp4"]
                    if vs:
                        murl = max(vs, key=lambda v: int(v.get("bitrate", 0)))["url"]
                media.append({"type": m.get("type", "photo"), "url": murl, "local": ""})
            for p in local_media.get(str(tid), []):
                rel = str(p.resolve())
                kind = "video" if p.suffix.lower() == ".mp4" else "photo"
                media.append({"type": kind, "url": "file:" + p.name, "local": rel})
            text = expand_urls(html.unescape(tw.get("full_text") or tw.get("text") or ""),
                               tw.get("entities"))
            out.append(({
                "id": str(tid),
                "author_username": owner_user,
                "author_name": owner_name,
                "text": text,
                "created_at": parse_twitter_date(tw.get("created_at", "")),
                "url": f"https://x.com/{owner_user or 'i/web'}/status/{tid}",
                "lang": tw.get("lang", ""),
                "reply_to": tw.get("in_reply_to_screen_name") or "",
                "likes": _int(tw.get("favorite_count")),
                "retweets": _int(tw.get("retweet_count")),
                "media": media,
                "source": "archive",
            }, "tweet"))
    for f in _ytd_files(data_dir, "like"):
        for item in read_ytd_js(f):
            lk = item.get("like", item)
            tid = str(lk.get("tweetId", ""))
            if not tid:
                continue
            parsed = parse_status_url(lk.get("expandedUrl", "")) or ("", tid)
            out.append(({
                "id": tid,
                "author_username": parsed[0],
                "text": html.unescape(lk.get("fullText", "") or ""),
                "url": lk.get("expandedUrl") or f"https://x.com/i/web/status/{tid}",
                "source": "like",
            }, "like"))
    return out


def _int(v):
    try:
        return int(v)
    except (TypeError, ValueError):
        return None


# ---------------------------------------------------------------------------
# 匯入：貼文網址（oEmbed）
# ---------------------------------------------------------------------------

def parse_oembed(data: dict, tweet_id: str) -> dict:
    """解析 publish.twitter.com/oembed 的回應。"""
    h = data.get("html", "")
    m = re.search(r"<p[^>]*>(.*?)</p>", h, re.S)
    body = m.group(1) if m else ""
    lang_m = re.search(r'<p[^>]*lang="([^"]+)"', h)
    media = []
    # 內文中的 pic.twitter.com 連結代表有圖片/影片，但 oEmbed 不提供原始檔網址
    if re.search(r"pic\.(twitter|x)\.com/", body):
        media.append({"type": "unknown", "url": f"https://x.com/i/status/{tweet_id}/photo/1",
                      "local": ""})
    body = re.sub(r"<a[^>]*>(pic\.(?:twitter|x)\.com/\S+?)</a>", "", body)
    body = re.sub(r'<a[^>]*href="([^"]+)"[^>]*>[^<]*…?</a>',
                  lambda mm: mm.group(1) if "t.co/" not in mm.group(1) else mm.group(0), body)
    body = re.sub(r"<br\s*/?>", "\n", body)
    text = html.unescape(re.sub(r"<[^>]+>", "", body)).strip()
    author_url = data.get("author_url", "")
    username = author_url.rstrip("/").rsplit("/", 1)[-1] if author_url else ""
    return {
        "id": tweet_id,
        "author_username": username,
        "author_name": data.get("author_name", ""),
        "text": text,
        "url": f"https://x.com/{username or 'i/web'}/status/{tweet_id}",
        "lang": lang_m.group(1) if lang_m else "",
        "media": media,
        "source": "url",
    }


def fetch_by_url(url: str) -> dict:
    parsed = parse_status_url(url)
    if not parsed:
        raise ValueError(f"看起來不是貼文網址：{url}")
    user, tid = parsed
    canonical = f"https://twitter.com/{user or 'i/web'}/status/{tid}"
    api = "https://publish.twitter.com/oembed?" + urllib.parse.urlencode(
        {"url": canonical, "omit_script": "1", "dnt": "true", "lang": "zh-tw"})
    data, _ = http_get_json(api)
    return parse_oembed(data, tid)


# ---------------------------------------------------------------------------
# 匯入：X API v2（需 Bearer Token）
# ---------------------------------------------------------------------------

API_BASE = "https://api.x.com/2"
API_TWEET_PARAMS = {
    "max_results": "100",
    "tweet.fields": "created_at,lang,public_metrics,entities,referenced_tweets,in_reply_to_user_id,"
                    "note_tweet,author_id",
    "expansions": "attachments.media_keys,author_id",
    "media.fields": "url,preview_image_url,type,variants",
    "user.fields": "username,name",
}


def _bearer() -> str:
    tok = os.environ.get("X_BEARER_TOKEN", "").strip()
    if not tok:
        sys.exit("請先設定環境變數 X_BEARER_TOKEN（X 開發者後台取得的 Bearer Token）。")
    return tok


def api_get(path: str, params: dict) -> dict:
    url = f"{API_BASE}{path}?{urllib.parse.urlencode(params)}"
    while True:
        try:
            data, _ = http_get_json(url, {"Authorization": f"Bearer {_bearer()}"})
            return data
        except urllib.error.HTTPError as e:
            if e.code == 429:
                reset = int(e.headers.get("x-rate-limit-reset", time.time() + 60))
                wait = max(5, reset - int(time.time()) + 2)
                print(f"  已達 API 速率上限，等待 {wait} 秒後繼續…", file=sys.stderr)
                time.sleep(wait)
                continue
            detail = e.read().decode("utf-8", "replace")[:500]
            sys.exit(f"X API 錯誤 {e.code}：{detail}")


def parse_api_page(page: dict) -> list[dict]:
    inc = page.get("includes", {})
    media_by_key = {m["media_key"]: m for m in inc.get("media", [])}
    users = {u["id"]: u for u in inc.get("users", [])}
    out = []
    for tw in page.get("data", []) or []:
        u = users.get(tw.get("author_id"), {})
        note = tw.get("note_tweet") or {}
        text = note.get("text") or tw.get("text", "")
        text = expand_urls(html.unescape(text), note.get("entities") or tw.get("entities"))
        media = []
        for k in (tw.get("attachments") or {}).get("media_keys", []):
            m = media_by_key.get(k)
            if not m:
                continue
            murl = m.get("url") or m.get("preview_image_url")
            if m.get("type") in ("video", "animated_gif"):
                vs = [v for v in m.get("variants", []) if v.get("content_type") == "video/mp4"]
                if vs:
                    murl = max(vs, key=lambda v: int(v.get("bit_rate", 0)))["url"]
            if murl:
                media.append({"type": m.get("type", "photo"), "url": murl, "local": ""})
        refs = {r["type"]: r["id"] for r in tw.get("referenced_tweets", []) or []}
        pm = tw.get("public_metrics", {})
        username = u.get("username", "")
        out.append({
            "id": tw["id"],
            "author_username": username,
            "author_name": u.get("name", ""),
            "text": text,
            "created_at": parse_twitter_date(tw.get("created_at", "")),
            "url": f"https://x.com/{username or 'i/web'}/status/{tw['id']}",
            "lang": tw.get("lang", ""),
            "reply_to": refs.get("replied_to", ""),
            "likes": pm.get("like_count"),
            "retweets": pm.get("retweet_count"),
            "media": media,
            "source": "api",
        })
    return out


def api_fetch(arc: Archive, path: str, params: dict, tags: list[str], max_pages: int,
              meta_key: str) -> tuple[int, int]:
    since = arc.get_meta(meta_key)
    if since:
        params["since_id"] = since
    new = seen = 0
    newest = since
    token = None
    for _ in range(max_pages):
        if token:
            params["pagination_token" if "/users/" in path else "next_token"] = token
        page = api_get(path, dict(params))
        for t in parse_api_page(page):
            seen += 1
            new += arc.upsert(t, tags)
            if not newest or int(t["id"]) > int(newest):
                newest = t["id"]
        arc.commit()
        token = page.get("meta", {}).get("next_token")
        print(f"  已處理 {seen} 則…", file=sys.stderr)
        if not token:
            break
    if newest:
        arc.set_meta(meta_key, newest)
        arc.commit()
    return new, seen


# ---------------------------------------------------------------------------
# 圖片/影片下載
# ---------------------------------------------------------------------------

def download_media(arc: Archive, only_missing: bool = True) -> tuple[int, int]:
    arc.media_dir.mkdir(parents=True, exist_ok=True)
    ok = fail = 0
    rows = arc.db.execute("SELECT id, media FROM tweets WHERE media != '[]'").fetchall()
    for r in rows:
        media = json.loads(r["media"])
        changed = False
        for i, m in enumerate(media):
            if only_missing and m.get("local") and Path(m["local"]).exists():
                continue
            url = m.get("url", "")
            if not url.startswith("http") or m.get("type") == "unknown":
                continue
            fetch_url = url
            if "pbs.twimg.com/media/" in url and "?" not in url:
                fetch_url = url + "?name=orig"
            ext = Path(urllib.parse.urlparse(url).path).suffix or ".jpg"
            dest = arc.media_dir / f"{r['id']}_{i}{ext}"
            try:
                req = urllib.request.Request(fetch_url, headers={"User-Agent": USER_AGENT})
                with urllib.request.urlopen(req, timeout=60) as resp:
                    dest.write_bytes(resp.read())
                m["local"] = str(dest.resolve())
                changed = True
                ok += 1
            except (urllib.error.URLError, OSError) as e:
                print(f"  下載失敗 {url}：{e}", file=sys.stderr)
                fail += 1
        if changed:
            arc.db.execute("UPDATE tweets SET media = ? WHERE id = ?",
                           (json.dumps(media, ensure_ascii=False), r["id"]))
            arc.commit()
    return ok, fail


# ---------------------------------------------------------------------------
# 匯出
# ---------------------------------------------------------------------------

def export(arc: Archive, fmt: str, out: Path, **filters):
    rows, _ = arc.search(limit=10_000_000, order="asc", **filters)
    if fmt == "json":
        out.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
    elif fmt == "csv":
        with out.open("w", newline="", encoding="utf-8-sig") as f:  # utf-8-sig 讓 Excel 正確顯示中文
            w = csv.writer(f)
            w.writerow(["日期", "帳號", "名稱", "內容", "標籤", "備註", "按讚", "轉推", "媒體", "網址"])
            for r in rows:
                w.writerow([r["created_at"], r["author_username"], r["author_name"], r["text"],
                            " ".join(r["tags"]), r["note"], r["likes"], r["retweets"],
                            " ".join(m["url"] for m in r["media"]), r["url"]])
    elif fmt == "html":
        parts = []
        for r in rows:
            imgs = "".join(
                f'<img src="{html.escape(m["local"] and Path(m["local"]).as_uri() or m["url"])}">'
                for m in r["media"] if m["type"] == "photo")
            parts.append(
                f'<article><header><b>{html.escape(r["author_name"])}</b> '
                f'@{html.escape(r["author_username"])} · '
                f'<a href="{html.escape(r["url"])}">{html.escape(r["created_at"][:16].replace("T", " "))}</a>'
                f'</header><p>{html.escape(r["text"])}</p>{imgs}'
                f'<footer>{" ".join("#" + html.escape(t) for t in r["tags"])} '
                f'{html.escape(r["note"])}</footer></article>')
        out.write_text(
            "<!doctype html><meta charset='utf-8'><title>偶像資料匯出</title><style>"
            "body{font-family:sans-serif;max-width:720px;margin:auto;padding:16px}"
            "article{border-bottom:1px solid #ddd;padding:12px 0}p{white-space:pre-wrap}"
            "img{max-width:48%;margin:2px}footer{color:#888;font-size:.9em}</style>"
            + "".join(parts), encoding="utf-8")
    return len(rows)


# ---------------------------------------------------------------------------
# 網頁介面
# ---------------------------------------------------------------------------

def make_handler(arc: Archive):
    ui_path = HERE / "web" / "index.html"

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, fmt, *args):
            pass

        def _send(self, code: int, body: bytes, ctype: str):
            self.send_response(code)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)

        def _json(self, obj, code: int = 200):
            self._send(code, json.dumps(obj, ensure_ascii=False).encode("utf-8"),
                       "application/json; charset=utf-8")

        def do_GET(self):
            u = urllib.parse.urlparse(self.path)
            qs = {k: v[-1] for k, v in urllib.parse.parse_qs(u.query).items()}
            if u.path in ("/", "/index.html"):
                return self._send(200, ui_path.read_bytes(), "text/html; charset=utf-8")
            if u.path == "/api/search":
                rows, total = arc.search(
                    q=qs.get("q", ""), author=qs.get("author", ""), tag=qs.get("tag", ""),
                    date_from=qs.get("from", ""), date_to=qs.get("to", ""),
                    has_media=qs.get("media") == "1", source=qs.get("source", ""),
                    order=qs.get("order", "desc"), limit=min(int(qs.get("limit", 50)), 500),
                    offset=int(qs.get("offset", 0)))
                for r in rows:
                    for m in r["media"]:
                        if m.get("local"):
                            m["local_url"] = "/media?id=" + urllib.parse.quote(r["id"]) + \
                                             "&path=" + urllib.parse.quote(m["local"])
                return self._json({"total": total, "items": rows})
            if u.path == "/api/stats":
                return self._json(arc.stats())
            if u.path == "/media":
                # 只允許讀取資料庫中有登記的本機檔案
                row = arc.db.execute("SELECT media FROM tweets WHERE id = ?",
                                     (qs.get("id", ""),)).fetchone()
                allowed = {m.get("local") for m in json.loads(row["media"])} if row else set()
                p = qs.get("path", "")
                if p and p in allowed and Path(p).is_file():
                    ctype = mimetypes.guess_type(p)[0] or "application/octet-stream"
                    return self._send(200, Path(p).read_bytes(), ctype)
                return self._send(404, b"not found", "text/plain")
            self._send(404, b"not found", "text/plain")

        def do_POST(self):
            if self.headers.get("Origin") and not re.match(
                    r"https?://(127\.0\.0\.1|localhost)(:\d+)?$", self.headers["Origin"]):
                return self._json({"error": "forbidden"}, 403)
            length = int(self.headers.get("Content-Length", 0))
            try:
                body = json.loads(self.rfile.read(length) or b"{}")
            except json.JSONDecodeError:
                return self._json({"error": "bad json"}, 400)
            path = urllib.parse.urlparse(self.path).path
            tid = str(body.get("id", ""))
            try:
                if path == "/api/tag":
                    arc.add_tag(tid, body["tag"])
                elif path == "/api/untag":
                    arc.remove_tag(tid, body["tag"])
                elif path == "/api/note":
                    arc.set_note(tid, body.get("note", ""))
                elif path == "/api/delete":
                    arc.delete(tid)
                elif path == "/api/add":
                    t = fetch_by_url(body["url"])
                    tags = [x for x in re.split(r"[\s,，]+", body.get("tags", "")) if x]
                    arc.upsert(t, tags)
                    arc.commit()
                    return self._json({"ok": True, "id": t["id"]})
                else:
                    return self._json({"error": "not found"}, 404)
                arc.commit()
                return self._json({"ok": True})
            except Exception as e:  # noqa: BLE001 — 錯誤訊息回傳給介面顯示
                return self._json({"error": str(e)}, 400)

    return Handler


# ---------------------------------------------------------------------------
# 指令列
# ---------------------------------------------------------------------------

def split_tags(s: str | None) -> list[str]:
    return [t for t in re.split(r"[\s,，]+", s or "") if t]


def main(argv=None):
    p = argparse.ArgumentParser(description="偶像資料庫：整理、搜尋 X (Twitter) 貼文")
    p.add_argument("--db", default=str(DEFAULT_DB), help=f"資料庫路徑（預設 {DEFAULT_DB}）")
    sub = p.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("import-archive", help="匯入 X 官方『下載你的資料』封存檔（已解壓縮的資料夾）")
    s.add_argument("path")
    s.add_argument("--tags", help="加到每則貼文的標籤，用逗號或空白分隔")
    s.add_argument("--match", help="只匯入含有這些關鍵字之一的貼文（逗號分隔），例如偶像名字")
    s.add_argument("--skip-likes", action="store_true", help="不匯入按讚的貼文")
    s.add_argument("--skip-tweets", action="store_true", help="不匯入自己的貼文")

    s = sub.add_parser("add", help="用貼文網址加入（可一次多個，或用 --file 讀取網址清單）")
    s.add_argument("urls", nargs="*")
    s.add_argument("--file", help="每行一個網址的文字檔")
    s.add_argument("--tags")
    s.add_argument("--note", default="")

    s = sub.add_parser("api-user", help="用 X API 抓某帳號的貼文（需 X_BEARER_TOKEN，最多約最近 3200 則）")
    s.add_argument("username")
    s.add_argument("--tags")
    s.add_argument("--max-pages", type=int, default=32, help="每頁 100 則，預設最多 32 頁")
    s.add_argument("--no-replies", action="store_true")
    s.add_argument("--no-retweets", action="store_true")

    s = sub.add_parser("api-search", help="用 X API 搜尋近 7 天貼文（需 X_BEARER_TOKEN）")
    s.add_argument("query", help='X 搜尋語法，例如 "偶像名 OR #hashtag -is:retweet"')
    s.add_argument("--tags")
    s.add_argument("--max-pages", type=int, default=5)

    s = sub.add_parser("search", help="搜尋已收錄的貼文")
    s.add_argument("query", nargs="?", default="")
    s.add_argument("--author")
    s.add_argument("--tag")
    s.add_argument("--from", dest="date_from", help="起始日期 YYYY-MM-DD / YYYY-MM / YYYY")
    s.add_argument("--to", dest="date_to", help="結束日期（含）")
    s.add_argument("--media", action="store_true", help="只看有圖片/影片的")
    s.add_argument("--oldest", action="store_true", help="由舊到新排序")
    s.add_argument("-n", "--limit", type=int, default=20)

    s = sub.add_parser("tag", help="幫貼文加標籤（用 -r 移除）")
    s.add_argument("id")
    s.add_argument("tags", nargs="+")
    s.add_argument("-r", "--remove", action="store_true")

    s = sub.add_parser("note", help="幫貼文寫備註")
    s.add_argument("id")
    s.add_argument("note")

    sub.add_parser("stats", help="顯示統計")

    s = sub.add_parser("download-media", help="把圖片/影片下載到本機（避免原文刪除後消失）")
    s.add_argument("--all", action="store_true", help="重新下載全部")

    s = sub.add_parser("export", help="匯出成 csv / json / html")
    s.add_argument("format", choices=["csv", "json", "html"])
    s.add_argument("output")
    s.add_argument("--query", default="")
    s.add_argument("--author")
    s.add_argument("--tag")
    s.add_argument("--from", dest="date_from")
    s.add_argument("--to", dest="date_to")

    s = sub.add_parser("serve", help="開啟網頁介面")
    s.add_argument("--port", type=int, default=8765)
    s.add_argument("--host", default="127.0.0.1")

    a = p.parse_args(argv)
    arc = Archive(a.db)

    if a.cmd == "import-archive":
        matches = [normalize(m) for m in split_tags(a.match)]
        new = total = 0
        for t, kind in parse_archive(Path(a.path)):
            if (kind == "like" and a.skip_likes) or (kind == "tweet" and a.skip_tweets):
                continue
            if matches and not any(m in normalize(t["text"] + t.get("author_username", ""))
                                   for m in matches):
                continue
            total += 1
            for m in t.get("media", []):
                if m.get("local"):  # 把封存檔裡的圖片複製進資料庫資料夾，之後刪掉封存檔也不影響
                    arc.media_dir.mkdir(parents=True, exist_ok=True)
                    dest = arc.media_dir / Path(m["local"]).name
                    if not dest.exists():
                        shutil.copy2(m["local"], dest)
                    m["local"] = str(dest.resolve())
            new += arc.upsert(t, split_tags(a.tags))
        arc.commit()
        print(f"完成：處理 {total} 則，新增 {new} 則。")

    elif a.cmd == "add":
        urls = list(a.urls)
        if a.file:
            urls += [ln.strip() for ln in Path(a.file).read_text(encoding="utf-8").splitlines()
                     if ln.strip() and not ln.startswith("#")]
        if not urls:
            sys.exit("請提供至少一個網址。")
        ok = 0
        for i, url in enumerate(urls, 1):
            try:
                t = fetch_by_url(url)
                if a.note:
                    t["note"] = a.note
                arc.upsert(t, split_tags(a.tags))
                if a.note:
                    arc.set_note(t["id"], a.note)
                arc.commit()
                ok += 1
                print(f"[{i}/{len(urls)}] ✓ @{t['author_username']} {t['text'][:40]!r}")
            except Exception as e:  # noqa: BLE001
                print(f"[{i}/{len(urls)}] ✗ {url}：{e}", file=sys.stderr)
            if len(urls) > 1:
                time.sleep(1)  # 對公開端點保持禮貌
        print(f"完成：成功 {ok} / {len(urls)}。")

    elif a.cmd == "api-user":
        user = api_get(f"/users/by/username/{a.username.lstrip('@')}", {})
        if "data" not in user:
            sys.exit(f"找不到帳號：{user}")
        uid = user["data"]["id"]
        params = dict(API_TWEET_PARAMS)
        excl = [x for x, on in (("replies", a.no_replies), ("retweets", a.no_retweets)) if on]
        if excl:
            params["exclude"] = ",".join(excl)
        new, seen = api_fetch(arc, f"/users/{uid}/tweets", params, split_tags(a.tags),
                              a.max_pages, f"since:user:{uid}")
        print(f"完成：取得 {seen} 則，新增 {new} 則。")

    elif a.cmd == "api-search":
        params = dict(API_TWEET_PARAMS, query=a.query)
        new, seen = api_fetch(arc, "/tweets/search/recent", params, split_tags(a.tags),
                              a.max_pages, f"since:search:{a.query}")
        print(f"完成：取得 {seen} 則，新增 {new} 則。")

    elif a.cmd == "search":
        rows, total = arc.search(a.query, a.author or "", a.tag or "", a.date_from or "",
                                 a.date_to or "", a.media, order="asc" if a.oldest else "desc",
                                 limit=a.limit)
        print(f"共 {total} 則符合（顯示 {len(rows)} 則）\n")
        for r in rows:
            tags = " ".join("#" + t for t in r["tags"])
            media = f" [媒體×{len(r['media'])}]" if r["media"] else ""
            print(f"{r['created_at'][:16].replace('T', ' ')}  @{r['author_username']}{media}  {tags}")
            print("  " + r["text"].replace("\n", "\n  "))
            if r["note"]:
                print(f"  📝 {r['note']}")
            print(f"  {r['url']}   (id: {r['id']})\n")

    elif a.cmd == "tag":
        for t in a.tags:
            (arc.remove_tag if a.remove else arc.add_tag)(a.id, t)
        arc.commit()
        print("已更新標籤。")

    elif a.cmd == "note":
        arc.set_note(a.id, a.note)
        arc.commit()
        print("已更新備註。")

    elif a.cmd == "stats":
        st = arc.stats()
        print(f"總共 {st['total']} 則（含媒體 {st['with_media']} 則）")
        if st["range"][0]:
            print(f"時間範圍：{st['range'][0][:10]} ～ {st['range'][1][:10]}")
        print("\n帳號：" + "、".join(f"@{x['username']}({x['n']})" for x in st["authors"][:15]))
        print("標籤：" + "、".join(f"#{x['tag']}({x['n']})" for x in st["tags"][:30]))
        print("\n每月數量：")
        peak = max((m["n"] for m in st["months"]), default=1)
        for m in st["months"]:
            print(f"  {m['month']}  {'█' * max(1, round(m['n'] / peak * 40))} {m['n']}")

    elif a.cmd == "download-media":
        ok, fail = download_media(arc, only_missing=not a.all)
        print(f"完成：下載 {ok} 個檔案，失敗 {fail} 個。檔案位於 {arc.media_dir}")

    elif a.cmd == "export":
        n = export(arc, a.format, Path(a.output), q=a.query, author=a.author or "",
                   tag=a.tag or "", date_from=a.date_from or "", date_to=a.date_to or "")
        print(f"已匯出 {n} 則到 {a.output}")

    elif a.cmd == "serve":
        srv = ThreadingHTTPServer((a.host, a.port), make_handler(arc))
        print(f"網頁介面已啟動：http://{a.host}:{a.port}  （按 Ctrl+C 結束）")
        try:
            srv.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
