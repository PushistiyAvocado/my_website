@echo off
rem Restart the prototype server on http://127.0.0.1:5173
rem 1) stops whatever listens on that port (a stale python http.server)
rem 2) runs serve.ps1 again, which opens the browser
cd /d "%~dp0"
set PORT=5173
echo Stopping any server on port %PORT% ...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$p = %PORT%; Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }"
timeout /t 1 /nobreak >nul
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1" -Port %PORT%
echo.
echo Server stopped. Press any key to close.
pause >nul
