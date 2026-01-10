param(
  [switch]$SkipVercel,
  [switch]$IncludeAllMigrations
)

$ErrorActionPreference = 'Stop'

function Write-Step([string]$msg) {
  Write-Host "`n=== $msg ===" -ForegroundColor Cyan
}

function Ensure-Command([string]$name, [string]$installHint) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "Missing command '$name'. $installHint"
  }
}

function Invoke-Checked {
  param(
    [Parameter(Mandatory = $true)][string]$Command,
    [Parameter()][string[]]$CommandArgs = @()
  )

  & $Command @CommandArgs
  if ($LASTEXITCODE -ne 0) {
    throw "Command failed ($LASTEXITCODE): $Command $($CommandArgs -join ' ')"
  }
}

Write-Step "Deploy ALL (DB + Functions + Frontend)"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

Write-Host "Working directory: $repoRoot" -ForegroundColor Gray

Ensure-Command "supabase" "Install with: npm install -g supabase"
Ensure-Command "npm" "Install Node.js + npm first"

Write-Step "Build frontend"
npm run build
if ($LASTEXITCODE -ne 0) {
  throw "Command failed ($LASTEXITCODE): npm run build"
}

Write-Step "Push DB migrations"
try {
  if ($IncludeAllMigrations) {
    Invoke-Checked "supabase" @("db", "push", "--include-all", "--yes")
  } else {
    Invoke-Checked "supabase" @("db", "push", "--yes")
  }
} catch {
  $msg = $_.Exception.Message
  # If migrations are out-of-order, retry once with --include-all
  if (-not $IncludeAllMigrations -and ($msg -match "--include-all")) {
    Write-Host "DB push requested --include-all; retrying..." -ForegroundColor Yellow
    Invoke-Checked "supabase" @("db", "push", "--include-all", "--yes")
  } else {
    throw
  }
}

Write-Step "Deploy Edge Functions"
$functions = @(
  "verify-admin-2fa",
  "toggle-strategy",
  "test-product-email",
  "send-contact-email",
  "request-download-email-otp",
  "register-hwid",
  "market-data",
  "get-plans",
  "get-clients-status",
  "generate-download-link",
  "download-hwid-tool",
  "create-test-purchase",
  "create-payment",
  "client-heartbeat",
  "change-client-plan",
  "capture-payment"
)

Invoke-Checked "supabase" (@("functions", "deploy") + $functions)

if ($SkipVercel) {
  Write-Host "Skipping Vercel deploy (SkipVercel=true)." -ForegroundColor Yellow
  exit 0
}

Write-Step "Deploy frontend to Vercel (prod)"
# This requires Vercel to be already linked/login OR a VERCEL_TOKEN to be set.
# Recommended:
#   vercel login
#   vercel link
# Optional non-interactive (CI): set env VERCEL_TOKEN

$token = $env:VERCEL_TOKEN

# Prefer installed vercel; otherwise fall back to npx.
$vercelCmd = Get-Command vercel -ErrorAction SilentlyContinue
if ($vercelCmd) {
  if ($token) {
    Invoke-Checked "vercel" @("--prod", "--yes", "--token", $token)
  } else {
    Invoke-Checked "vercel" @("--prod", "--yes")
  }
} else {
  if ($token) {
    Invoke-Checked "npx" @("--yes", "vercel@latest", "--prod", "--yes", "--token", $token)
  } else {
    Invoke-Checked "npx" @("--yes", "vercel@latest", "--prod", "--yes")
  }
}

Write-Host "`n✅ Deploy ALL complete." -ForegroundColor Green
