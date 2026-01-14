# Verificar si ya se está ejecutando como administrador
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "Solicitando permisos de administrador..." -ForegroundColor Yellow
    Start-Process powershell.exe -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    exit
}

Write-Host "`n=== Instalando DLL en TradeStation ===" -ForegroundColor Cyan
Write-Host "Con permisos de administrador`n" -ForegroundColor Green

$sourceDLL = "$PSScriptRoot\..\dll\AInsideLicenseBridgeCpp\Release\AInsideLicenseBridgeCpp.dll"
$targetPath = "C:\Program Files (x86)\TradeStation 10.0\Program\AInsideLicenseBridgeCpp.dll"

# Verificar que existe el archivo fuente
if (-not (Test-Path $sourceDLL)) {
    Write-Host "[ERROR] No se encontro la DLL en: $sourceDLL" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "Fuente: $sourceDLL" -ForegroundColor Gray
Write-Host "Destino: $targetPath`n" -ForegroundColor Gray

# Copiar DLL
try {
    Copy-Item -Path $sourceDLL -Destination $targetPath -Force
    Write-Host "[OK] DLL instalada correctamente" -ForegroundColor Green
    
    # Verificar que se copio
    if (Test-Path $targetPath) {
        $fileInfo = Get-Item $targetPath
        Write-Host "`nArchivo: $($fileInfo.Name)" -ForegroundColor Gray
        Write-Host "Tamaño: $($fileInfo.Length) bytes" -ForegroundColor Gray
        Write-Host "Fecha: $($fileInfo.LastWriteTime)" -ForegroundColor Gray
    }
} catch {
    Write-Host "[ERROR] No se pudo copiar la DLL: $_" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "`n[EXITO] Instalacion completada" -ForegroundColor Green
Write-Host "Ahora puedes usar la estrategia en TradeStation`n" -ForegroundColor Cyan

pause
