# Публикация прототипа на GitHub Pages.
#
# Зачем это нужно: рабочая папка (эта) и локальная копия репозитория
# PushistiyAvocado/my_website — два разных каталога. GitHub Pages собирается
# только из репозитория, поэтому правки нужно сначала синхронизировать туда,
# затем закоммитить и запушить. Скрипт делает всё это одной командой.
#
# Использование:
#   .\deploy.cmd                        — синхронизировать, закоммитить, запушить
#   .\deploy.cmd "Правки в маршруте"    — своё сообщение коммита
#   .\deploy.ps1 -NoPush                — только синхронизировать файлы (без коммита)
#   .\deploy.ps1 -Mirror                — синхронизировать с удалением лишних файлов в репозитории
#   .\deploy.ps1 -Destination "D:\my_website"  — если копия репозитория лежит в другом месте
#
# После push GitHub Actions выкладывает содержимое ./prototype на Pages
# (1–2 минуты). На сайте нажмите Ctrl+F5, иначе браузер отдаст старый CSS/JS из кэша.

param(
  [string]$Message = 'Обновление прототипа',
  [string]$Destination = 'E:\Building web site\Real_estate\my_website',
  [switch]$NoPush,
  [switch]$Mirror
)

$ErrorActionPreference = 'Continue'
$source = Split-Path -Parent $MyInvocation.MyCommand.Path

# Черновики и служебные каталоги, которые не должны попадать в репозиторий.
# Отчёт статических проверок _check.txt — исключение, он копируется отдельно ниже.
$excludeFiles = @('_*.txt', '_dom.html')
$excludeDirs = @('.git', '_tmpc*', 'node_modules', '.vscode')

if (-not (Test-Path (Join-Path $Destination '.git'))) {
  Write-Host "Копия репозитория не найдена: $Destination" -ForegroundColor Red
  Write-Host 'Укажите путь ключом -Destination или поправьте значение по умолчанию в deploy.ps1.'
  exit 1
}

Write-Host "Синхронизирую файлы: $source" -ForegroundColor Green
Write-Host "                 ->  $Destination" -ForegroundColor Green

$roboArgs = @($source, $Destination, '/E', '/R:1', '/W:1', '/NFL', '/NDL', '/NJH', '/NJS', '/NP')
if ($Mirror) { $roboArgs += '/MIR' }
$roboArgs += '/XD'
$roboArgs += $excludeDirs
$roboArgs += '/XF'
$roboArgs += $excludeFiles

& robocopy @roboArgs | Out-Null
$roboCode = $LASTEXITCODE
if ($roboCode -ge 8) {
  Write-Host "robocopy не смог скопировать файлы (код $roboCode)." -ForegroundColor Red
  exit $roboCode
}

# Отчёт статических проверок в репозитории нужен, поэтому копируем его отдельно.
$checkReport = Join-Path $source '_check.txt'
if (Test-Path $checkReport) {
  Copy-Item $checkReport (Join-Path $Destination '_check.txt') -Force
}

Push-Location $Destination
try {
  & git add -A 2>&1 | Out-Null

  & git diff --cached --quiet 2>&1 | Out-Host
  if ($LASTEXITCODE -eq 0) {
    Write-Host 'Файлы уже совпадают с репозиторием — коммитить нечего.' -ForegroundColor Yellow
    exit 0
  }

  if ($NoPush) {
    Write-Host 'Файлы синхронизированы и добавлены в индекс, но -NoPush: коммит и push пропущены.' -ForegroundColor Yellow
    exit 0
  }

  # Сообщение коммита пишем в файл в UTF-8 без BOM, чтобы GitHub показывал русский текст корректно.
  $tmp = Join-Path $env:TEMP ('deploy-msg-' + [guid]::NewGuid().ToString('N') + '.txt')
  [System.IO.File]::WriteAllText($tmp, $Message, (New-Object System.Text.UTF8Encoding($false)))
  try {
    & git commit -F $tmp 2>&1 | Out-Host
    $commitCode = $LASTEXITCODE
  }
  finally {
    Remove-Item $tmp -Force -ErrorAction SilentlyContinue
  }
  if ($commitCode -ne 0) {
    Write-Host 'git commit завершился с ошибкой.' -ForegroundColor Red
    exit $commitCode
  }

  & git push origin main 2>&1 | ForEach-Object { Write-Host ("  " + $_) -ForegroundColor DarkGray }
  if ($LASTEXITCODE -ne 0) {
    Write-Host 'git push завершился с ошибкой (нет доступа к GitHub?).' -ForegroundColor Red
    exit $LASTEXITCODE
  }

  Write-Host ''
  Write-Host 'Готово: изменения отправлены.' -ForegroundColor Green
  Write-Host 'GitHub Pages обновится за 1–2 минуты. На сайте нажмите Ctrl+F5.' -ForegroundColor Green
  Write-Host 'Статус сборки: https://github.com/PushistiyAvocado/my_website/actions'
}
finally {
  Pop-Location
}
