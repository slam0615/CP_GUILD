@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
title Media Grabber

rem ---- 檢查 Python ----
where python >nul 2>nul
if errorlevel 1 (
  echo [!] 找不到 Python，正在用 winget 安裝...
  winget install -e --id Python.Python.3.12 --accept-source-agreements --accept-package-agreements
  echo.
  echo 安裝完成後請「關閉此視窗再重新雙擊」一次。
  pause & exit /b
)

rem ---- 檢查 ffmpeg（合併高畫質影音軌用）----
where ffmpeg >nul 2>nul
if errorlevel 1 (
  echo [!] 找不到 ffmpeg，正在用 winget 安裝...
  winget install -e --id Gyan.FFmpeg --accept-source-agreements --accept-package-agreements
  set NEED_RESTART=1
)

rem ---- 檢查 deno / node（yt-dlp 解 YouTube 簽章用）----
where deno >nul 2>nul
if errorlevel 1 (
  where node >nul 2>nul
  if errorlevel 1 (
    echo [!] 找不到 deno，正在用 winget 安裝...
    winget install -e --id DenoLand.Deno --accept-source-agreements --accept-package-agreements
    set NEED_RESTART=1
  )
)
if defined NEED_RESTART (
  echo.
  echo 工具安裝完成，請「關閉此視窗再重新雙擊」一次。
  pause & exit /b
)

rem ---- 建立虛擬環境並安裝套件 ----
if not exist ".venv\Scripts\python.exe" (
  echo 第一次執行，正在安裝套件（約 1 分鐘）...
  python -m venv .venv || (pause & exit /b)
)
".venv\Scripts\python.exe" -m pip install -q --upgrade pip
".venv\Scripts\python.exe" -m pip install -q -U -r requirements.txt || (pause & exit /b)

rem ---- 第一次執行時在桌面建立捷徑 ----
set "LNK=%USERPROFILE%\Desktop\Media Grabber.lnk"
if not exist "%LNK%" (
  powershell -NoProfile -Command "$s=(New-Object -ComObject WScript.Shell).CreateShortcut([Environment]::GetFolderPath('Desktop')+'\Media Grabber.lnk');$s.TargetPath='%~f0';$s.WorkingDirectory='%~dp0';$s.Save()"
  echo 已在桌面建立「Media Grabber」捷徑。
)

rem ---- 伺服器啟動後自動打開瀏覽器 ----
start "" /b powershell -NoProfile -WindowStyle Hidden -Command "for($i=0;$i -lt 60;$i++){try{Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8000/ -TimeoutSec 1 | Out-Null; Start-Process 'http://127.0.0.1:8000/'; break}catch{Start-Sleep 1}}"

echo.
echo  Media Grabber 已啟動：http://127.0.0.1:8000
echo  使用期間請保持此視窗開啟，關閉視窗即停止。
echo.
if exist cookies.txt set "COOKIES_FILE=%~dp0cookies.txt"
".venv\Scripts\python.exe" -m uvicorn app:app --host 127.0.0.1 --port 8000
pause
