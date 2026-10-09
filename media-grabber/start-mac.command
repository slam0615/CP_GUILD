#!/bin/bash
# 雙擊即可啟動 Media Grabber（macOS）
cd "$(dirname "$0")" || exit 1
DIR="$(pwd)"

need_brew() {
  if ! command -v brew >/dev/null 2>&1; then
    echo "[!] 需要 Homebrew 來安裝 $1，請先到 https://brew.sh 安裝後再雙擊一次。"
    read -r -p "按 Enter 關閉…"; exit 1
  fi
}

command -v python3 >/dev/null 2>&1 || { need_brew python; brew install python; }
command -v ffmpeg  >/dev/null 2>&1 || { need_brew ffmpeg; brew install ffmpeg; }
if ! command -v deno >/dev/null 2>&1 && ! command -v node >/dev/null 2>&1; then
  need_brew deno; brew install deno
fi

if [ ! -x .venv/bin/python ]; then
  echo "第一次執行，正在安裝套件（約 1 分鐘）…"
  python3 -m venv .venv || { read -r -p "建立虛擬環境失敗，按 Enter 關閉…"; exit 1; }
fi
.venv/bin/python -m pip install -q --upgrade pip
.venv/bin/python -m pip install -q -U -r requirements.txt || { read -r -p "安裝失敗，按 Enter 關閉…"; exit 1; }

# 第一次執行時在桌面建立捷徑
LINK="$HOME/Desktop/Media Grabber.command"
if [ ! -e "$LINK" ]; then
  ln -s "$DIR/start-mac.command" "$LINK" && echo "已在桌面建立「Media Grabber」捷徑。"
fi

[ -f cookies.txt ] && export COOKIES_FILE="$DIR/cookies.txt"

# 伺服器啟動後自動打開瀏覽器
( for _ in $(seq 60); do
    curl -s -o /dev/null http://127.0.0.1:8000/ && { open http://127.0.0.1:8000/; break; }
    sleep 1
  done ) &

echo
echo " Media Grabber 已啟動：http://127.0.0.1:8000"
echo " 使用期間請保持此視窗開啟，關閉視窗即停止。"
echo
exec .venv/bin/python -m uvicorn app:app --host 127.0.0.1 --port 8000
