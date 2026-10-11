# ⭐ 偶像資料庫 Idol Archive

把 X (Twitter) 上關於偶像的貼文收進**自己電腦裡的資料庫**，之後就能用關鍵字、日期、標籤、帳號快速回溯，不用再靠 X 那個不好用的搜尋。

- 只需要 Python 3.9 以上，**不用安裝任何套件**
- 資料都存在本機的 `data/archive.db`（SQLite），不會上傳到任何地方
- 有網頁介面（搜尋、時間軸、標籤、備註、看圖）和指令列兩種用法

## 快速開始

```bash
cd idol-archive

# 1. 把資料放進來（三種方式擇一或混用，下面詳細說明）
python3 idol_archive.py add https://x.com/某偶像/status/1234567890 --tags 生日,2024

# 2. 開啟網頁介面
python3 idol_archive.py serve
# 用瀏覽器打開 http://127.0.0.1:8765
```

## 三種收集資料的方式

### ① X 官方封存檔（免費，推薦先做）

X 可以把**你自己的貼文**和**你按過讚的貼文**整包下載：

1. X 設定 → 「你的帳號」→「下載你的資料封存檔」，等 X 寄信通知（通常 1～2 天）
2. 下載後解壓縮，然後：

```bash
# 全部匯入，並加上標籤
python3 idol_archive.py import-archive ~/Downloads/twitter-2026-10-11-xxxx --tags 封存

# 只匯入提到偶像的貼文（任一關鍵字符合即可）
python3 idol_archive.py import-archive ~/Downloads/twitter-xxxx --match "偶像名,暱稱,#官方tag" --tags 偶像名
```

> 按讚資料只有內文、沒有作者和圖片；日期則由貼文 ID 推算（精確到秒）。
> 如果想補上作者，可以把那則網址再 `add` 一次，資料會自動合併。
> X 官方封存檔**不包含書籤**。

### ② 貼文網址（免費）

看到想留存的貼文就複製網址加入，也可以在網頁介面左上角貼上網址。

```bash
python3 idol_archive.py add https://x.com/idol/status/111 https://x.com/idol/status/222 --tags 演唱會
python3 idol_archive.py add --file 網址清單.txt --tags 書籤  # 一行一個網址
```

這是透過 X 公開的嵌入 (oEmbed) 服務取得內文和作者，不用登入。限制：拿不到圖片原檔（介面上會顯示「含圖片，點此看原文」）、讚數和轉推數。

### ③ X 官方 API（需付費方案）

想把偶像帳號的貼文**整批自動抓下來**，就要用 X 官方 API。免費方案目前幾乎不能讀取貼文，需要付費方案（Basic 以上，價格以 X 開發者網站為準）。

```bash
export X_BEARER_TOKEN="你的 Bearer Token"   # Windows PowerShell: $env:X_BEARER_TOKEN="..."

# 抓某帳號的貼文（X 只提供最近約 3200 則）；再次執行只會抓新的
python3 idol_archive.py api-user idol_official --tags 本人 --no-retweets

# 搜尋最近 7 天的貼文
python3 idol_archive.py api-search '"偶像名" OR #偶像tag -is:retweet' --tags 粉絲情報
```

建議定期執行（例如每週一次），這樣就算時間軸超過 3200 則，舊的也都已經存在你這裡了。

## 搜尋

網頁介面和指令列使用同一種搜尋語法：

| 寫法 | 意思 |
| --- | --- |
| `生日 直播` | 同時包含「生日」**和**「直播」 |
| `生日\|誕生日\|birthday` | 包含其中**任一個** |
| `演唱會 -取消` | 包含「演唱會」但**不含**「取消」 |
| `"new single"` | 完整片語 |

- 全形／半形、英文大小寫視為相同（`ＬＩＶＥ` 搜得到 `live`）
- 標籤和備註也會一起被搜尋

```bash
python3 idol_archive.py search 生日 --from 2023-01 --to 2023-12 --media
python3 idol_archive.py search --tag 演唱會 --author idol_official --oldest -n 100
python3 idol_archive.py stats   # 總數、帳號、標籤、每月數量長條圖
```

## 整理

```bash
python3 idol_archive.py tag 1234567890 演唱會 名場面        # 加標籤（-r 移除）
python3 idol_archive.py note 1234567890 "第一次唱新曲"      # 寫備註
```

網頁介面上可以直接在每則貼文下方加標籤、寫備註、刪除，也可以點左側的時間軸只看某個月。

## 備份圖片／匯出

```bash
# 把圖片和影片下載到 data/media/，原文被刪掉也還看得到
python3 idol_archive.py download-media

# 匯出（csv 可直接用 Excel 開啟）
python3 idol_archive.py export csv 全部.csv
python3 idol_archive.py export html 2024演唱會.html --tag 演唱會 --from 2024
```

要備份或換電腦時，複製整個 `data/` 資料夾就好。

## 注意事項

- 請只收集公開內容供個人整理使用，並遵守 X 的服務條款；本工具沒有爬蟲功能，只使用官方提供的封存檔、嵌入服務和 API。
- 網頁介面預設只在本機 (`127.0.0.1`) 開啟，其他人連不到。
- 時間以 UTC 顯示（台灣時間 = UTC + 8 小時）。

## 測試

```bash
python3 -m unittest test_idol_archive.py
```
