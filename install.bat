@echo off
REM 1) In den Client-Ordner
cd /d "%~dp0client" || (
  echo Konnte nicht in den Client-Ordner wechseln.
  pause & exit /b 1
)

REM 2) Client mit legacy peer deps installieren
npm install --legacy-peer-deps || (
  echo Client-Installation mit --legacy-peer-deps fehlgeschlagen.
  pause & exit /b 1
)

REM 3) (Wie gewuenscht) Danach noch ein normales npm install
npm install || (
  echo Client-Installation (zweiter Durchlauf) fehlgeschlagen.
  pause & exit /b 1
)

REM 4) Zurueck ins Projekt-Root
cd /d "%~dp0" || (
  echo Konnte nicht ins Projekt-Root wechseln.
  pause & exit /b 1
)

REM 5) In den Server-Ordner
cd /d "%~dp0serverNew" || (
  echo Konnte nicht in den Server-Ordner wechseln.
  pause & exit /b 1
)

REM 6) Server installieren
npm install || (
  echo Server-Installation fehlgeschlagen.
  pause & exit /b 1
)

REM 7) Zurueck ins Projekt-Root
cd /d "%~dp0"

echo.
echo Fertig. Client und Server installiert.
pause
