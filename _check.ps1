$ErrorActionPreference = 'Stop'
$root = Join-Path $PSScriptRoot 'prototype'
$outPath = Join-Path $PSScriptRoot '_check.txt'
$lines = New-Object System.Collections.Generic.List[string]
$void = @('area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr')

$required = @{
  'index.html' = @('#search-form','#s-type','#s-city','#s-district','#s-rooms','#s-price-min','#s-price-max','#s-area-min','#search-result','#listings-grid','#actual','#mobile-menu','#dialog-consult','#toast','#route-detail')
  'catalog.html' = @('#catalog-grid','#catalog-count','#active-filters','#catalog-pagination','#catalog-sort','#filters-submit','#filters','#f-type','#f-city','#f-district','#f-rooms','#f-price-min','#f-price-max','#f-area-min','#f-area-max','#f-plot-min','#f-floor-min','#catalog-top','#mobile-menu','#dialog-consult','#toast')
  'telegram.html' = @('#main','#tg-top','#tg-list','#mobile-menu','#dialog-consult','#toast')
}

$pages = @('index.html','catalog.html','telegram.html')

foreach ($name in $pages) {
  $path = Join-Path $root $name
  $raw = [IO.File]::ReadAllText($path)
  $text = [regex]::Replace($raw, '(?s)<!--.*?-->', '')
  $text = [regex]::Replace($text, '(?s)<script\b[^>]*>.*?</script>', '<script></script>')
  $text = [regex]::Replace($text, '(?s)<style\b[^>]*>.*?</style>', '<style></style>')

  $stack = New-Object System.Collections.ArrayList
  $errs = New-Object System.Collections.ArrayList
  foreach ($m in [regex]::Matches($text, '<(/?)([a-zA-Z][A-Za-z0-9-]*)([^>]*)>')) {
    $isClose = $m.Groups[1].Value -eq '/'
    $tag = $m.Groups[2].Value.ToLower()
    $attrs = $m.Groups[3].Value
    $line = ([regex]::Matches($text.Substring(0, $m.Index), "`n")).Count + 1
    if ($void -contains $tag) { continue }
    if ($attrs.TrimEnd().EndsWith('/')) { continue }
    if (-not $isClose) {
      [void]$stack.Add([pscustomobject]@{ Tag = $tag; Line = $line })
      continue
    }
    if ($stack.Count -eq 0) { [void]$errs.Add("stray close </$tag> at line $line"); continue }
    $top = $stack[$stack.Count - 1]
    if ($top.Tag -eq $tag) {
      $stack.RemoveAt($stack.Count - 1)
    } else {
      $idx = -1
      for ($i = $stack.Count - 1; $i -ge 0; $i--) { if ($stack[$i].Tag -eq $tag) { $idx = $i; break } }
      if ($idx -ge 0) {
        for ($i = $stack.Count - 1; $i -gt $idx; $i--) {
          [void]$errs.Add("unclosed <$($stack[$i].Tag)> opened at line $($stack[$i].Line)")
          $stack.RemoveAt($i)
        }
        $stack.RemoveAt($idx)
      } else {
        [void]$errs.Add("stray close </$tag> at line $line")
      }
    }
  }
  foreach ($s in $stack) { [void]$errs.Add("unclosed <$($s.Tag)> opened at line $($s.Line)") }

  $lines.Add("== $name : nesting errors = $($errs.Count)")
  foreach ($e in $errs) { $lines.Add("   $e") }

  $ids = @{}
  foreach ($m in [regex]::Matches($text, '\sid="([^"]+)"')) {
    $id = $m.Groups[1].Value
    if ($ids.ContainsKey($id)) { $ids[$id] = $ids[$id] + 1 } else { $ids[$id] = 1 }
  }
  $dups = @($ids.Keys | Where-Object { $ids[$_] -gt 1 })
  $lines.Add('   duplicate ids: ' + $(if ($dups.Count) { $dups -join ', ' } else { 'none' }))

  $missing = @()
  foreach ($need in $required[$name]) {
    if (-not $ids.ContainsKey($need.Substring(1))) { $missing += $need }
  }
  $lines.Add('   missing required ids: ' + $(if ($missing.Count) { $missing -join ', ' } else { 'none' }))

  $attrsList = @('data-header','data-open-menu','data-close-menu','data-fav','data-quick-type','data-open-filters','data-close-filters','data-reset-filters','data-demo-form','data-form-result','data-icon','data-open-dialog','data-close-dialog','data-step','data-close','data-clear','data-page')
  $counts = @()
  foreach ($a in $attrsList) {
    $counts += ($a + '=' + [regex]::Matches($text, [regex]::Escape($a)).Count)
  }
  $lines.Add('   ' + ($counts -join ' | '))
}
# --- ids referenced from app.js: report per page ---
$jsDir = Join-Path $root 'assets\js'
$appJs = [IO.File]::ReadAllText((Join-Path $jsDir 'app.js'))
$refs = @([regex]::Matches($appJs, "\`$\('#([A-Za-z0-9_-]+)'\)") |
  ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique)
$lines.Add("== app.js refers to $($refs.Count) ids")

foreach ($name in @('index.html','catalog.html')) {
  $raw = [IO.File]::ReadAllText((Join-Path $root $name))
  $pageIds = @([regex]::Matches($raw, '\sid="([^"]+)"') | ForEach-Object { $_.Groups[1].Value })
  $absent = @($refs | Where-Object { $pageIds -notcontains $_ })
  $lines.Add("== $name : ids from app.js missing on page = " +
    $(if ($absent.Count) { $absent -join ', ' } else { 'none' }))

  $badAnchors = @()
  foreach ($m in [regex]::Matches($raw, 'href="#([^"]+)"')) {
    $id = $m.Groups[1].Value
    if ($id -and $pageIds -notcontains $id) { $badAnchors += "#$id" }
  }
  $lines.Add('   anchors without target = ' + $(if ($badAnchors.Count) { ($badAnchors | Sort-Object -Unique) -join ', ' } else { 'none' }))

  $openDialogs = [regex]::Matches($raw, '<dialog\b[^>]*\sopen\b').Count
  $lines.Add("   dialog[open] count = $openDialogs (expected 0)")
}

# --- telegram.html намеренно не содержит каталога, поэтому проверка
#     «id из app.js отсутствует на странице» к ней неприменима.
# --- telegram.html: якоря, диалоги и маркеры-заглушки ---
$raw = [IO.File]::ReadAllText((Join-Path $root 'telegram.html'))
$pageIds = @([regex]::Matches($raw, '\sid="([^"]+)"') | ForEach-Object { $_.Groups[1].Value })
$badAnchors = @()
foreach ($m in [regex]::Matches($raw, 'href="#([^"]+)"')) {
  $id = $m.Groups[1].Value
  if ($id -and $pageIds -notcontains $id) { $badAnchors += "#$id" }
}
$lines.Add('== telegram.html: anchors without target = ' +
  $(if ($badAnchors.Count) { ($badAnchors | Sort-Object -Unique) -join ', ' } else { 'none' }))
$lines.Add("   dialog[open] count = " + [regex]::Matches($raw, '<dialog\b[^>]*\sopen\b').Count + ' (expected 0)')
$leftovers = @([regex]::Matches($raw, '<!--\s*[A-Z-]*-PART\s*-->') | ForEach-Object { $_.Value })
$lines.Add('   leftover placeholders = ' + $(if ($leftovers.Count) { $leftovers -join ', ' } else { 'none' }))

$orphans = @()
foreach ($r in $refs) {
  $found = $false
  foreach ($name in $pages) {
    $raw = [IO.File]::ReadAllText((Join-Path $root $name))
    if ($raw -match ('\sid="' + [regex]::Escape($r) + '"')) { $found = $true; break }
  }
  if (-not $found) { $orphans += $r }
}
$lines.Add('== ids used in app.js but absent on BOTH pages = ' +
  $(if ($orphans.Count) { $orphans -join ', ' } else { 'none' }))

# --- JS bracket balance (rough syntax sanity check) ---
foreach ($f in @('data.js','icons.js','app.js')) {
  $src = [IO.File]::ReadAllText((Join-Path $jsDir $f))
  $noStr = [regex]::Replace($src, '(?s)/\*.*?\*/', '')
  $noStr = [regex]::Replace($noStr, '(?m)^\s*//.*$', '')
  $noStr = [regex]::Replace($noStr, "'(\\.|[^'\\])*'", "''")
  $noStr = [regex]::Replace($noStr, '"(\\.|[^"\\])*"', '""')
  $ob = [regex]::Matches($noStr, '\{').Count; $cb = [regex]::Matches($noStr, '\}').Count
  $op = [regex]::Matches($noStr, '\(').Count; $cp = [regex]::Matches($noStr, '\)').Count
  $osb = [regex]::Matches($noStr, '\[').Count; $csb = [regex]::Matches($noStr, '\]').Count
  $lines.Add("== $f : braces $ob/$cb, parens $op/$cp, brackets $osb/$csb" +
    $(if (($ob -eq $cb) -and ($op -eq $cp) -and ($osb -eq $csb)) { ' OK' } else { ' <-- MISMATCH' }))
}

# --- CSS sanity ---
$css = [IO.File]::ReadAllText((Join-Path $root 'assets\css\site.css'))
$lines.Add('== site.css: "-clamp(" count = ' + [regex]::Matches($css, '-clamp\(').Count + ' (expected 0)')
$lines.Add('== site.css: braces ' + [regex]::Matches($css, '\{').Count + '/' + [regex]::Matches($css, '\}').Count)

[IO.File]::WriteAllLines($outPath, $lines, (New-Object System.Text.UTF8Encoding($false)))
Write-Output 'check written'
