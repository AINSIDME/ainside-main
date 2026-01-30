# Script para instalar Git hooks de seguridad

Write-Host "Instalando Git hooks de seguridad..." -ForegroundColor Cyan

$hooksDir = ".git/hooks"
$preCommitHook = "$hooksDir/pre-commit"

if (-not (Test-Path ".git")) {
    Write-Host "Error: No se encontro .git" -ForegroundColor Red
    exit 1
}

$hookContent = @'
#!/bin/sh
powershell.exe -ExecutionPolicy Bypass -File .git/hooks/pre-commit.ps1
'@

Set-Content -Path $preCommitHook -Value $hookContent -Encoding UTF8

if (Get-Command "icacls" -ErrorAction SilentlyContinue) {
    icacls $preCommitHook /grant Everyone:RX | Out-Null
}

Write-Host ""
Write-Host "Git hooks instalados correctamente" -ForegroundColor Green
Write-Host ""
Write-Host "Hooks activos:" -ForegroundColor Cyan
Write-Host "- pre-commit: Verifica keys expuestas antes de cada commit"
Write-Host ""
Write-Host "Proteccion activada contra commits con keys expuestas" -ForegroundColor Green
