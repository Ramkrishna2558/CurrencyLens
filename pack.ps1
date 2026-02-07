# XRate — Package for Chrome Web Store
# Run: .\pack.ps1

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$outFile = Join-Path $root 'XRate.zip'

# Files to include in the extension package
$include = @(
    'manifest.json',
    'background.js',
    'currencies.js',
    'content.js',
    'content.css',
    'popup.html',
    'popup.js',
    'popup.css',
    'icons\icon16.png',
    'icons\icon48.png',
    'icons\icon128.png'
)

# Verify all files exist
$missing = @()
foreach ($f in $include) {
    $full = Join-Path $root $f
    if (-not (Test-Path $full)) { $missing += $f }
}
if ($missing.Count -gt 0) {
    Write-Host "Missing files:" -ForegroundColor Red
    $missing | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
    Write-Host ""
    Write-Host "TIP: Open generate-icons.html in a browser to create the icon PNGs." -ForegroundColor Cyan
    exit 1
}

# Remove old zip if it exists
if (Test-Path $outFile) { Remove-Item $outFile }

# Create zip
$tempDir = Join-Path $env:TEMP "XRate_pack_$(Get-Date -Format 'yyyyMMddHHmmss')"
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $tempDir 'icons') -Force | Out-Null

foreach ($f in $include) {
    Copy-Item (Join-Path $root $f) (Join-Path $tempDir $f)
}

Compress-Archive -Path (Join-Path $tempDir '*') -DestinationPath $outFile -Force
Remove-Item $tempDir -Recurse -Force

$size = [math]::Round((Get-Item $outFile).Length / 1KB, 1)
Write-Host "Packaged: $outFile ($size KB)" -ForegroundColor Green
