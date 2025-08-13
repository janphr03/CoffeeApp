@echo off
echo ===========================================
echo Starting CoffeeSpots Application
echo ===========================================

echo.
echo Starting Backend Server...
cd /d "%~dp0serverNew"
start cmd /k "npm run dev"

echo.
echo Starting Frontend...
cd /d "%~dp0client"
start cmd /k "npm start"

echo.
echo ===========================================
echo Both servers are starting...
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5000
echo ===========================================
echo.
echo Press any key to close this window...
pause >nul