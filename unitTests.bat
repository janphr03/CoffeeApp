@echo off
setlocal EnableExtensions

REM === Vom Repo-Root (dieses Script liegt in CoffeeApp) starten ===
pushd "%~dp0" || exit /b 1

REM Optional: falls serverNew/node_modules fehlt → kurz installieren
if not exist "serverNew\node_modules" (
  echo Installing serverNew dependencies...
  call npm --prefix serverNew install || exit /b 1
)

REM Muster aus dem ersten Argument (z.B. "middleware")
set "PATTERN=%~1"

if "%PATTERN%"=="" (
  echo Running ALL serverNew tests ...
  call npm --prefix serverNew test -- --runInBand
) else (
  echo Running serverNew tests matching "%PATTERN%" ...
  call npm --prefix serverNew test -- -t "%PATTERN%" --runInBand
)

set ERR=%ERRORLEVEL%
popd
exit /b %ERR%
