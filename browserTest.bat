@echo off
setlocal

REM Optional: BASE_URL hier setzen (CMD-Syntax), sonst Default 3000
if "%BASE_URL%"=="" set BASE_URL=http://localhost:5000

echo Installiere Playwright (nur beim ersten Mal relevant)...
call npm i -D playwright
call npx playwright install

echo Fuehre Browser-Kompatibilitaetstest gegen %BASE_URL% aus...
node serverNew\tests\browser-compatibility.mjs

endlocal