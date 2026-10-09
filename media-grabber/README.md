# Media Grabber

貼上網址，擷取 **原生解析度** 的影片 / Shorts / 照片 / 外掛字幕檔。

| 平台 | 影片 | 照片 | 字幕 |
|---|---|---|---|
| YouTube（影片、Shorts） | ✅ 最高到 4K/8K、HDR、60fps | ✅ 原尺寸封面 (maxres) | ✅ 手動字幕、自動字幕、自動翻譯字幕 |
| Instagram（貼文、Reels、輪播） | ✅ | ✅ 輪播原圖 | — |
| TikTok（影片、照片貼文） | ✅ 原檔（視平台提供） | ✅ 照片貼文原圖 | ✅ 若影片有字幕 |

## 運作方式

- **yt-dlp**：解析影片格式與字幕。YouTube 的高解析度是影音分離的 DASH 串流，伺服器會下載
  最高畫質的影像軌 + 音軌，用 ffmpeg **只重新封裝（remux）不重新編碼**，所以畫質與原始檔完全相同。
  能放進 mp4 就輸出 mp4，不相容時輸出 mkv。
- **gallery-dl**：抓 Instagram / TikTok 的原圖（yt-dlp 不處理純照片貼文）。
- 字幕可下載平台原始格式（vtt / srv3 / json3 / ttml…），或由 ffmpeg 轉成 **srt**。
- 圖片與直連影片經由 `/api/proxy` 轉發（加上正確 Referer、強制以附件下載），只允許三個平台的 CDN 網域。

## 本機執行

需要 Python 3.10+、ffmpeg，以及 deno 或 Node.js 20+（yt-dlp 解 YouTube 簽章用）。

```bash
cd media-grabber
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000
```

打開 http://localhost:8000

### Docker

```bash
docker build -t media-grabber media-grabber
docker run -p 8000:8000 media-grabber
```

## Instagram 需要登入時（cookies）

Instagram（以及 YouTube 年齡限制影片、雲端主機 IP 被要求登入時）需要帳號 cookies：

1. 用瀏覽器擴充（例如 "Get cookies.txt LOCALLY"）匯出 Netscape 格式的 `cookies.txt`
2. 啟動時指定：`COOKIES_FILE=/path/to/cookies.txt uvicorn app:app ...`
   （Docker：`-v $PWD/cookies.txt:/cookies.txt -e COOKIES_FILE=/cookies.txt`）

建議用小帳號的 cookies，不要用主帳號。

## 維護

各平台常改版，抓不到時先更新：

```bash
pip install -U "yt-dlp[default]" gallery-dl
```

## API

| 方法 | 路徑 | 說明 |
|---|---|---|
| POST | `/api/info` | `{"url": "..."}` → 標題、可選畫質、字幕清單、照片清單 |
| GET | `/api/download?url=&fmt=&item=` | 下載影片 / 音訊（`fmt` 為 yt-dlp format selector，`item` 為輪播第幾則） |
| GET | `/api/subtitle?url=&lang=&ext=&auto=` | 下載字幕，`ext=srt` 會自動轉檔 |
| GET | `/api/proxy?url=&filename=` | 代理下載平台 CDN 上的原圖 / 直連影片 |

## 注意

僅供下載你擁有權利或已獲授權的內容（例如自己的作品、備份），請遵守各平台服務條款與當地著作權法。
若部署到公開網路，建議加上登入或流量限制，避免被濫用。
