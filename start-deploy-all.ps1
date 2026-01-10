# One-command deploy: DB migrations + Edge Functions + Frontend
# Usage:
#   .\start-deploy-all.ps1
#   .\start-deploy-all.ps1 -SkipVercel
#   .\start-deploy-all.ps1 -IncludeAllMigrations

$ErrorActionPreference = 'Stop'
$script = Join-Path $PSScriptRoot "scripts\deploy-all.ps1"
& $script @args
