@echo off
setlocal

REM Default-URL
if "%BASE_URL%"=="" set BASE_URL=http://localhost:5000

REM ===== prüfen, ob Frontend bereits läuft =====
call :isUp "%BASE_URL%"
if %ERRORLEVEL% EQU 0 (
  echo Frontend laeuft bereits unter %BASE_URL%.
  set FE_STARTED=0
) else (
  echo Frontend nicht erreichbar – starte Client in neuem Fenster...
  start "COFFEEAPP-FE" cmd /c "cd /d ""%~dp0client"" && npm start"
  set FE_STARTED=1
  REM kurze Wartezeit, damit Dev-Server hochkommt (optional anpassen)
  timeout /t 5 >nul
)

echo Installiere Playwright (nur beim ersten Mal relevant)...
call npm i -D playwright
call npx playwright install

echo Fuehre Browser-Kompatibilitaetstest gegen %BASE_URL% aus...
node serverNew\tests\browser-compatibility.mjs
set ERR=%ERRORLEVEL%

REM ===== nur schliessen, wenn WIR es gestartet haben =====
if "%FE_STARTED%"=="1" (
  taskkill /FI "WINDOWTITLE eq COFFEEAPP-FE" /T /F >nul 2>&1
)

endlocal & exit /b %ERR%

:isUp
  setlocal
  set "URL=%~1"
  REM nutze curl wenn vorhanden, sonst PowerShell
  where curl >nul 2>nul
  if %ERRORLEVEL% EQU 0 (
    curl -sf -I "%URL%" >nul 2>&1
  ) else (
    powershell -NoProfile -Command "try { (Invoke-WebRequest -UseBasicParsing -Uri '%URL%' -TimeoutSec 2) | Out-Null; exit 0 } catch { exit 1 }"
  )
  endlocal & exit /b %ERRORLEVEL%

