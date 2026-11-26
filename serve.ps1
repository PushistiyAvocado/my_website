# Локальный запуск прототипа для проверки в браузере.
# Использование: правый клик -> "Выполнить с помощью PowerShell",
# либо в терминале: powershell -NoProfile -ExecutionPolicy Bypass -File .\serve.ps1
# Ключи: -Port 5173 (порт), -NoBrowser (не открывать браузер).
# Остановить: Ctrl+C в этом окне (сервер погасится сам).

param(
  [int]$Port = 5173,
  [switch]$NoBrowser
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

$url = "http://127.0.0.1:$Port/index.html"

$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) {
  Write-Host 'Python не найден. Прототип работает и без сервера:' -ForegroundColor Yellow
  Write-Host "  $root\prototype\index.html"
  Write-Host 'Откройте этот файл двойным кликом.'
  Read-Host 'Нажмите Enter, чтобы закрыть'
  exit 1
}

Write-Host "Запускаю статический сервер на $url" -ForegroundColor Green
$server = Start-Process -FilePath $python.Source `
  -ArgumentList '-m', 'http.server', $Port, '--directory', './prototype' `
  -PassThru -WindowStyle Hidden

try {
  Start-Sleep -Seconds 2
  Write-Host "Главная:   $url"
  Write-Host "Каталог:   http://127.0.0.1:$Port/catalog.html"
  Write-Host 'Остановить: Ctrl+C' -ForegroundColor DarkGray
  if (-not $NoBrowser) { Start-Process $url }
  $server | Wait-Process
}
finally {
  if ($server -and -not $server.HasExited) {
    Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue
    Write-Host 'Сервер остановлен.' -ForegroundColor DarkGray
  }
}
