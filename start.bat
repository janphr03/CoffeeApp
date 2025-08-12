@echo off
setlocal

REM Backend starten
echo ==== Starte Backend ====
cd /d "%~dp0serverNew"
call npm run dev

REM Falls npm run dev blockiert (z.B. Development-Server), musst du hier abbrechen oder in neuem Fenster starten.
REM Für automatisches Weiterlaufen im Hintergrund:
REM start cmd /k "cd /d "%~dp0serverNew" && npm run dev"

REM Frontend bauen und starten
echo ==== Baue und starte Frontend ====
cd /d "%~dp0client"
call npm run build
call npm start

endlocal
pause
