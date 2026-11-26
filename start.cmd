@echo off
rem Double-click this file to run the prototype on http://127.0.0.1:5173
rem (calls serve.ps1 next to it). Close this window or press Ctrl+C to stop.
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
echo.
echo Server stopped. Press any key to close.
pause >nul
