@echo off
title Integrated OS Simulation Platform Launcher
echo ========================================================
echo   INTEGRATED OS SIMULATION AND RESOURCE MANAGEMENT
echo ========================================================
echo.

echo [1/2] Starting Frontend Vite Server...
start "OS Sim Frontend (Port 5173)" cmd /k "cd /d %~dp0\frontend && npm run dev"

echo [2/2] Starting Backend API Server...
start "OS Sim Backend (Port 5000)" cmd /k "cd /d %~dp0\backend && npm start"

echo.
echo ========================================================
echo System launched successfully!
echo - Open your browser to: http://localhost:5173
echo - Backend API running at: http://localhost:5000
echo - Login credentials: admin / admin123
echo ========================================================
echo.
pause
