<#
.SYNOPSIS
  Собирает последние посты публичного Telegram-канала и пишет их в
  prototype/assets/js/telegram-data.js (window.HZ_TELEGRAM).

.DESCRIPTION
  Сайт статический (GitHub Pages, без сервера и без Node.js), поэтому браузер
  не может запросить t.me напрямую:
    * у веб-превью канала (https://t.me/s/<канал>) нет CORS-заголовков —
      fetch из браузера блокируется;
    * Bot API требует токен, который нельзя держать в клиентском коде.
  Поэтому лента собирается заранее — по запросу в GitHub Actions
  (.github/workflows/telegram.yml) или локальным запуском — и публикуется
  как обычный JS-файл.
  Годится только публичный канал с включённым веб-превью.

.PARAMETER Channel
  @username, username или ссылка t.me/username. Если не задан — берётся из
  переменной окружения TELEGRAM_CHANNEL, затем из scripts/telegram-channel.txt.

.PARAMETER OutFile
  Куда писать результат. По умолчанию prototype/assets/js/telegram-data.js

.PARAMETER MaxPosts
  Сколько последних постов сохранить (по умолчанию 50 — фактически всё, что
  отдаёт веб-превью канала; 0 и меньше = 1).

.PARAMETER MaxChars
  Обрезка текста поста в символах (по умолчанию 700, 0 — не обрезать).

.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\fetch-telegram.ps1 -Channel '@my_channel'

.NOTES
  Файл должен оставаться в UTF-8 с BOM: Windows PowerShell 5.1 иначе ломает
  кириллицу в комментариях и сообщениях.
#>
[CmdletBinding()]
param(
  [string]$Channel = '',
  [string]$OutFile = '',
  [int]$MaxPosts = 50,
  [int]$MaxChars = 700
)

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
if (-not $OutFile) { $OutFile = Join-Path $root 'prototype/assets/js/telegram-data.js' }
$channelFile = Join-Path $PSScriptRoot 'telegram-channel.txt'

function ConvertTo-ChannelName {
  param([string]$Value)
  if (-not $Value) { return '' }
  $v = $Value.Trim()
  $v = $v -replace '^https?://', ''
  $v = $v -replace '^(www\.)?t\.me/', ''
  $v = $v -replace '^s/', ''
  $v = $v -replace '^@', ''
  $v = $v -replace '[?#].*$', ''
  $v = $v.Trim('/').Trim()
  if ($v -notmatch '^[A-Za-z0-9_]{4,64}$') { return '' }
  return $v
}

function Get-FirstValue {
  param([string]$Text, [string]$Pattern)
  if (-not $Text) { return '' }
  $m = [regex]::Match($Text, $Pattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)
  if ($m.Success) { return $m.Groups[1].Value.Trim() }
  return ''
}

function ConvertTo-RuCount {
  param([string]$Value)
  if (-not $Value) { return '' }
  $v = $Value.Trim()
  if ($v -match '^([0-9]+(?:\.[0-9]+)?)K$') { return ($matches[1] -replace '\.', ',') + ' тыс.' }
  if ($v -match '^([0-9]+(?:\.[0-9]+)?)M$') { return ($matches[1] -replace '\.', ',') + ' млн' }
  return $v
}

# ---------- 1. Какой канал обновляем ----------
$name = ConvertTo-ChannelName $Channel
if (-not $name) { $name = ConvertTo-ChannelName $env:TELEGRAM_CHANNEL }
if (-not $name -and (Test-Path -LiteralPath $channelFile)) {
  foreach ($line in [IO.File]::ReadAllLines($channelFile)) {
    $t = $line.Trim()
    if (-not $t -or $t.StartsWith('#')) { continue }
    $name = ConvertTo-ChannelName $t
    if ($name) { break }
  }
}

if (-not $name) {
  Write-Host 'Telegram: канал не задан.'
  Write-Host 'Укажите @username одной строкой в scripts/telegram-channel.txt,'
  Write-Host 'либо в переменной репозитория TELEGRAM_CHANNEL, либо параметром -Channel.'
  if (Test-Path -LiteralPath $OutFile) {
    Write-Host 'telegram-data.js уже существует — не трогаем: блок на сайте остаётся в прежнем состоянии.'
  } else {
    # Файл нужен всегда: index.html и catalog.html подключают его как обычный скрипт,
    # без файла страница получает 404. Пустой объект — это честное «канал ещё не подключён»:
    # initTelegram() увидит пустой channel и оставит демо-карточку и заглушки.
    $stub = @'
/* Лента Telegram-канала ещё не собрана: канал не задан.
   Файл-заглушка создан scripts/fetch-telegram.ps1, чтобы страницы не получали 404.
   Впишите @username в scripts/telegram-channel.txt и запустите скрипт
   (или workflow «Telegram channel feed») — файл перезапишется реальными постами. */
window.HZ_TELEGRAM = {
  channel: '', title: '', url: '', photo: '', subscribers: '',
  source: '', updatedAt: '', posts: []
};
'@
    $dir = Split-Path -Parent $OutFile
    if ($dir -and -not (Test-Path -LiteralPath $dir)) {
      New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    [IO.File]::WriteAllText($OutFile, $stub + "`n", (New-Object System.Text.UTF8Encoding($false)))
    Write-Host ('Telegram: записан пустой telegram-data.js (заглушка) -> ' + $OutFile)
  }
  exit 0
}

# ---------- 2. Загрузка веб-превью канала ----------
try {
  [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
} catch {
  # В PowerShell 7 на Linux настройка не нужна и может быть недоступна.
}

$url = 'https://t.me/s/' + $name
Write-Host ('Telegram: запрашиваю ' + $url)

$html = ''
try {
  $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 40 -Headers @{
    'User-Agent'      = 'Mozilla/5.0 (compatible; KseniaSiteBot/1.0; +https://pushistiyavocado.github.io/my_website/)'
    'Accept-Language' = 'ru,en;q=0.8'
  }
  $html = [string]$resp.Content
} catch {
  Write-Host ('Telegram: не удалось загрузить канал — ' + $_.Exception.Message)
  exit 1
}

if (-not $html -or $html -notmatch 'tgme_widget_message') {
  Write-Host 'Telegram: постов не найдено. Канал закрытый, удалён или у него выключено веб-превью.'
  exit 1
}

# ---------- 3. Очистка HTML поста ----------
# Оставляем только безопасное подмножество разметки Telegram: br, b, strong, i,
# em, u, s, del, code, pre, blockquote и ссылки http(s)/mailto. Всё остальное —
# включая script/style/iframe/on*-атрибуты — вырезается, потому что этот текст
# затем вставляется в страницу через innerHTML.
function ConvertTo-PlainPostText {
  param(
    [string]$Html,
    [int]$MaxChars = 0
  )
  if (-not $Html) { return '' }

  # Смайлы-картинки -> сам символ: <i class="emoji"><b>🏠</b></i>
  $Html = [regex]::Replace($Html, '<i class="emoji"[^>]*>\s*<b>(.*?)</b>\s*</i>', '$1')
  $Html = [regex]::Replace($Html, '</?tg-emoji[^>]*>', '')

  # Ссылки: сохраняем href и подпись, в тексте оставляем маркер.
  $hrefs = New-Object System.Collections.Generic.List[string]
  $labels = New-Object System.Collections.Generic.List[string]
  $sb = New-Object System.Text.StringBuilder
  $pos = 0
  $anchorMatches = [regex]::Matches($Html, '<a\s[^>]*?href="([^"]+)"[^>]*?>(.*?)</a>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
  foreach ($m in $anchorMatches) {
    [void]$sb.Append($Html.Substring($pos, $m.Index - $pos))
    $href = $m.Groups[1].Value
    $label = [regex]::Replace($m.Groups[2].Value, '<[^>]*>', '').Trim()
    if ($href -match '^(https?://|mailto:)' -and $label) {
      $hrefs.Add($href)
      $labels.Add($label)
      [void]$sb.Append('@@TG_LINK_' + ($hrefs.Count - 1) + '@@')
    } elseif ($label) {
      [void]$sb.Append($label)
    }
    $pos = $m.Index + $m.Length
  }
  [void]$sb.Append($Html.Substring($pos))
  $Html = $sb.ToString()

  # Переносы строк приводим к единому виду.
  $Html = [regex]::Replace($Html, '<br\s*/?>', '<br>')

  # Разрешённые теги прячем в маркеры, все прочие теги удаляем.
  $allowed = @('b', 'strong', 'i', 'em', 'u', 's', 'del', 'code', 'pre', 'blockquote', 'br')
  foreach ($t in $allowed) {
    $Html = $Html.Replace('<' + $t + '>', '@@TG_T_' + $t + '@@')
    $Html = $Html.Replace('</' + $t + '>', '@@TG_TC_' + $t + '@@')
  }
  $Html = [regex]::Replace($Html, '<[^>]*>', '')
  foreach ($t in $allowed) {
    $Html = $Html.Replace('@@TG_T_' + $t + '@@', '<' + $t + '>')
    $Html = $Html.Replace('@@TG_TC_' + $t + '@@', '</' + $t + '>')
  }

  # Возвращаем ссылки уже безопасными.
  for ($i = 0; $i -lt $hrefs.Count; $i++) {
    $safeHref = $hrefs[$i].Replace('"', '%22')
    $Html = $Html.Replace('@@TG_LINK_' + $i + '@@', '<a href="' + $safeHref + '" target="_blank" rel="noopener nofollow">' + $labels[$i] + '</a>')
  }

  $Html = $Html.Trim()
  $Html = [regex]::Replace($Html, '\s*\r?\n\s*', ' ')
  $Html = [regex]::Replace($Html, '(\s*<br>\s*){3,}', '<br><br>')
  $Html = [regex]::Replace($Html, '^(<br>)+|(<br>)+$', '')

  if ($MaxChars -gt 0 -and $Html.Length -gt $MaxChars) {
    $cut = $Html.Substring(0, $MaxChars)
    $space = $cut.LastIndexOf(' ')
    if ($space -gt [int]($MaxChars * 0.6)) { $cut = $cut.Substring(0, $space) }
    # не оставляем незакрытый тег и висячий перенос строки на месте обрыва
    $cut = [regex]::Replace($cut, '<[^>]*$', '')
    $cut = [regex]::Replace($cut, '(\s|<br>)+$', '')
    $Html = $cut + '…'
  }

  # Балансируем теги: после обрезки (или из-за небрежной разметки в самом посте)
  # могут остаться незакрытые b/i/a. Иначе браузер «протянет» их на соседние
  # элементы страницы.
  $open = New-Object System.Collections.Generic.List[string]
  foreach ($m in [regex]::Matches($Html, '</?([a-z]+)[^>]*>')) {
    $tag = $m.Groups[1].Value
    if ($m.Value.StartsWith('</')) {
      $idx = $open.LastIndexOf($tag)
      if ($idx -ge 0) { $open.RemoveAt($idx) }
    } elseif ($tag -ne 'br') {
      $open.Add($tag)
    }
  }
  for ($i = $open.Count - 1; $i -ge 0; $i--) {
    $Html = $Html + '</' + $open[$i] + '>'
  }

  return $Html.Trim()
}

# ---------- 4. Разбор постов ----------
if ($MaxPosts -lt 1) { $MaxPosts = 1 }

$blockPattern = '<div class="tgme_widget_message[^"]*" data-post="([^"]+)"[\s\S]*?(?=<div class="tgme_widget_message[^"]*" data-post=|\z)'
$all = New-Object System.Collections.Generic.List[object]

foreach ($block in [regex]::Matches($html, $blockPattern)) {
  $path = $block.Groups[1].Value.Trim()
  if (-not $path) { continue }
  $body = $block.Value

  $text = ConvertTo-PlainPostText -Html (Get-FirstValue $body 'class="tgme_widget_message_text js-message_text"[^>]*>(.*?)</div>') -MaxChars $MaxChars
  $photo = Get-FirstValue $body 'tgme_widget_message_photo_wrap[^"]*"[^>]*style="[^"]*background-image:url\(''([^'']+)'''
  if (-not $photo) {
    $photo = Get-FirstValue $body 'tgme_widget_message_video_thumb"[^>]*style="[^"]*background-image:url\(''([^'']+)'''
  }
  if (-not $text -and -not $photo) { continue }

  if ($photo.StartsWith('//')) { $photo = 'https:' + $photo }

  $id = $path
  $slash = $path.LastIndexOf('/')
  if ($slash -ge 0) { $id = $path.Substring($slash + 1) }

  $all.Add([pscustomobject]@{
    id       = $id
    url      = 'https://t.me/' + $path
    datetime = (Get-FirstValue $body '<time datetime="([^"]+)"')
    views    = (ConvertTo-RuCount (Get-FirstValue $body 'tgme_widget_message_views">([^<]+)<'))
    photo    = $photo
    text     = $text
  })
}

if ($all.Count -eq 0) {
  Write-Host 'Telegram: в веб-превью не нашлось ни текста, ни фото постов.'
  exit 1
}

# Оставляем MaxPosts последних записей и ставим свежие сверху.
$posts = New-Object System.Collections.Generic.List[object]
$start = $all.Count - $MaxPosts
if ($start -lt 0) { $start = 0 }
for ($i = $all.Count - 1; $i -ge $start; $i--) { $posts.Add($all[$i]) }

# ---------- 5. Данные канала ----------
$title = Get-FirstValue $html 'class="tgme_channel_info_header_title"><span dir="auto">(.*?)</span>'
if (-not $title) { $title = Get-FirstValue $html '<meta property="og:title" content="([^"]+)"' }
if (-not $title) { $title = $name }

$channelPhoto = Get-FirstValue $html 'class="tgme_page_photo_image[^"]*"[^>]*>\s*<img src="([^"]+)"'
if (-not $channelPhoto) { $channelPhoto = Get-FirstValue $html '<meta property="og:image" content="([^"]+)"' }
if ($channelPhoto.StartsWith('//')) { $channelPhoto = 'https:' + $channelPhoto }

$subscribers = ConvertTo-RuCount (Get-FirstValue $html 'class="counter_value">([^<]+)</span>\s*<span class="counter_type">subscribers')

$data = [pscustomobject]@{
  channel     = $name
  title       = $title
  url         = ('https://t.me/' + $name)
  photo       = $channelPhoto
  subscribers = $subscribers
  source      = $url
  updatedAt   = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
  posts       = $posts
}

$json = ConvertTo-Json -InputObject $data -Depth 6

$header = @'
/* Лента Telegram-канала для блока главной «Новые объекты и короткие разборы — в канале».
   Файл собран автоматически: scripts/fetch-telegram.ps1
   Обновление: вручную — Actions → «Telegram channel feed» → Run workflow,
   либо локально scripts/fetch-telegram.ps1. Расписания нет.
   Ручные правки будут перезаписаны следующим запуском.

   Почему файл, а не запрос к t.me из браузера: у веб-превью канала нет
   CORS-заголовков, а Bot API требует секретный токен — на статическом
   хостинге (GitHub Pages) ни то, ни другое невозможно. */
window.HZ_TELEGRAM =
'@

# ConvertTo-Json экранирует <, > и & как \u003c, \u003e, \u0026 — в JSON это
# допустимо, но диффы становятся нечитаемыми. Возвращаем символы обратно:
# внутри строк JSON они разрешены как есть.
$json = $json -replace '\\u003c', '<' -replace '\\u003e', '>' -replace '\\u0026', '&'

$content = $header + "`n" + $json + ";`n"

$dir = Split-Path -Parent $OutFile
if ($dir -and -not (Test-Path -LiteralPath $dir)) {
  New-Item -ItemType Directory -Path $dir -Force | Out-Null
}
[IO.File]::WriteAllText($OutFile, $content, (New-Object System.Text.UTF8Encoding($false)))

Write-Host ('Telegram: сохранено постов — ' + $posts.Count + ', канал @' + $name + ' -> ' + $OutFile)
