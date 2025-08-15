REM (Optional) sicherstellen, dass Runner/Deps vorhanden sind
@echo off
cd /d "%~dp0serverNew" || (
    echo Konnte nicht nach serverNew wechseln.
    pause
    exit /b 1
)
npx tsx tests/integrationTests.ts
echo.
echo ✅ Tests fertig.
exit /b %ERRORLEVEL%
