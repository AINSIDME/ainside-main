# Launch Vite dev server for ainside-main
# Usage: Right-click > Run with PowerShell, or execute from terminal

param(
    [string]$ProjectPath = $PSScriptRoot
)

$ProjectPath = (Resolve-Path -LiteralPath $ProjectPath).Path
Write-Host "Starting dev server in: $ProjectPath" -ForegroundColor Cyan

if (-not (Test-Path $ProjectPath)) {
    Write-Error "Project path not found: $ProjectPath"
    exit 1
}

Push-Location $ProjectPath

# Ensure Node.js and npm are available
$npm = Get-Command npm -ErrorAction SilentlyContinue
if (-not $npm) {
    Write-Error "npm not found. Please install Node.js from https://nodejs.org/"
    Pop-Location
    exit 1
}

# Install dependencies if node_modules missing
if (-not (Test-Path (Join-Path $ProjectPath 'node_modules'))) {
    Write-Host "Installing dependencies (npm install)..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) { Write-Error "npm install failed"; Pop-Location; exit $LASTEXITCODE }
}

Write-Host "Launching Vite (npm run dev)..." -ForegroundColor Green
npm run dev
$code = $LASTEXITCODE
Pop-Location
exit $code
