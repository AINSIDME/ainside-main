# Build and preview production build for ainside-main
# Usage: Right-click > Run with PowerShell, or execute from terminal

param(
    [string]$ProjectPath = $PSScriptRoot
)

$ProjectPath = (Resolve-Path -LiteralPath $ProjectPath).Path
Write-Host "Building and previewing in: $ProjectPath" -ForegroundColor Cyan

if (-not (Test-Path $ProjectPath)) {
    Write-Error "Project path not found: $ProjectPath"
    exit 1
}

Push-Location $ProjectPath

$npm = Get-Command npm -ErrorAction SilentlyContinue
if (-not $npm) {
    Write-Error "npm not found. Please install Node.js from https://nodejs.org/"
    Pop-Location
    exit 1
}

if (-not (Test-Path (Join-Path $ProjectPath 'node_modules'))) {
    Write-Host "Installing dependencies (npm install)..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) { Write-Error "npm install failed"; Pop-Location; exit $LASTEXITCODE }
}

Write-Host "Building (npm run build)..." -ForegroundColor Green
npm run build
if ($LASTEXITCODE -ne 0) { Write-Error "Build failed"; Pop-Location; exit $LASTEXITCODE }

Write-Host "Starting preview server (npm run preview)..." -ForegroundColor Green
npm run preview
$code = $LASTEXITCODE
Pop-Location
exit $code
