@echo off
setlocal

REM Backend Unit Tests für serverNew

echo Installiere Test-Abhängigkeiten...
call npm i -D dotenv

REM Defaults für Backend URL setzen, falls nicht gesetzt
if "%BACKEND_URL%"=="" set BACKEND_URL=http://localhost:3000

echo Verwende BACKEND_URL=%BACKEND_URL%
echo.

echo Fuehre Backend Unit Tests aus...
node serverNew\tests\backend-unit-tests.mjs

if %ERRORLEVEL% neq 0 (
    echo.
    echo Tests fehlgeschlagen!
    pause
    exit /b 1
) else (
    echo.
    echo Alle Tests erfolgreich!
    pause
)

endlocal