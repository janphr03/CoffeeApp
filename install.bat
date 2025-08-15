@echo off
setlocal EnableExtensions

REM --- Client ---
pushd "%~dp0client"
call npm install --legacy-peer-deps
if errorlevel 1 goto :err

popd

REM --- Server ---
pushd "%~dp0serverNew"
call npm install --include=dev
if errorlevel 1 goto :err
call npm i -D @types/cors @types/express-session supertest @types/supertest tsx
if errorlevel 1 goto :err
popd

echo.
echo ✅ Fertig. Client und Server installiert.
pause
exit /b 0

:err
echo ❌ Fehler (ErrorLevel %ERRORLEVEL%). Abbruch.
pause
exit /b 1
