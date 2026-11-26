@echo off
rem Publish the prototype to GitHub Pages.
rem 1) mirrors this folder into the local clone of PushistiyAvocado/my_website
rem 2) commits and pushes to origin/main (GitHub Actions deploys ./prototype)
rem Usage: deploy.cmd ["commit message"]
rem Then open the site and press Ctrl+F5 (Pages build takes 1-2 minutes).
cd /d "%~dp0"
set "MSG=%~1"
if "%MSG%"=="" (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy.ps1"
) else (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy.ps1" -Message "%MSG%"
)
echo.
echo Done. Press any key to close.
pause >nul
