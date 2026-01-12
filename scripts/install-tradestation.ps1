# TradeStation Installation Helper Script
# Run this after building the C++ DLL in Visual Studio

param(
    [string]$TradestationPath = "C:\Program Files (x86)\TradeStation 10.0\Program"
)

Write-Host "=== AInside TradeStation License System Installer ===" -ForegroundColor Cyan
Write-Host ""

# Verify we're in the right directory
if (-not (Test-Path "dll\AInsideLicenseBridgeCpp\Release\AInsideLicenseBridgeCpp.dll")) {
    Write-Host "ERROR: DLL not found. Please build the project first:" -ForegroundColor Red
    Write-Host "  1. Open dll\AInsideLicenseBridgeCpp\AInsideLicenseBridgeCpp.vcxproj in Visual Studio" -ForegroundColor Yellow
    Write-Host "  2. Select configuration: Release | Win32" -ForegroundColor Yellow
    Write-Host "  3. Build -> Build Solution" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

if (-not (Test-Path "license-public.pem")) {
    Write-Host "ERROR: license-public.pem not found in repo root" -ForegroundColor Red
    exit 1
}

# Check if TradeStation path exists
if (-not (Test-Path $TradestationPath)) {
    Write-Host "WARNING: TradeStation path not found: $TradestationPath" -ForegroundColor Yellow
    Write-Host "Please specify correct path:" -ForegroundColor Yellow
    Write-Host "  .\scripts\install-tradestation.ps1 -TradestationPath 'C:\Your\Path'" -ForegroundColor Yellow
    Write-Host ""
    
    # Try to find it
    $possible = @(
        "C:\Program Files (x86)\TradeStation 10.0\Program",
        "C:\Program Files\TradeStation 10.0\Program",
        "C:\TradeStation 10.0\Program"
    )
    
    foreach ($p in $possible) {
        if (Test-Path $p) {
            Write-Host "Found possible location: $p" -ForegroundColor Green
            $confirm = Read-Host "Use this path? (Y/N)"
            if ($confirm -eq "Y" -or $confirm -eq "y") {
                $TradestationPath = $p
                break
            }
        }
    }
    
    if (-not (Test-Path $TradestationPath)) {
        Write-Host "Could not locate TradeStation. Exiting." -ForegroundColor Red
        exit 1
    }
}

Write-Host "TradeStation folder: $TradestationPath" -ForegroundColor Green
Write-Host ""

# Copy DLL
Write-Host "Copying DLL..." -ForegroundColor Cyan
try {
    Copy-Item "dll\AInsideLicenseBridgeCpp\Release\AInsideLicenseBridgeCpp.dll" -Destination $TradestationPath -Force
    Write-Host "  [OK] AInsideLicenseBridgeCpp.dll" -ForegroundColor Green
} catch {
    Write-Host "  [FAIL] Could not copy DLL: $_" -ForegroundColor Red
    Write-Host "  Try running PowerShell as Administrator" -ForegroundColor Yellow
    exit 1
}

# Copy public key
Write-Host "Copying public key..." -ForegroundColor Cyan
try {
    Copy-Item "license-public.pem" -Destination $TradestationPath -Force
    Write-Host "  [OK] license-public.pem" -ForegroundColor Green
} catch {
    Write-Host "  [FAIL] Could not copy PEM: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Installation Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Activate license (one-time):" -ForegroundColor White
Write-Host "       python scripts\HWID.py --activate" -ForegroundColor Yellow
Write-Host ""
Write-Host "  2. Start local service (must run while trading):" -ForegroundColor White
Write-Host "       python scripts\HWID.py --service" -ForegroundColor Yellow
Write-Host ""
Write-Host "  3. Import function into TradeStation:" -ForegroundColor White
Write-Host "       Open tradestation\AInsideLicenseGuard.txt" -ForegroundColor Yellow
Write-Host "       Copy into new Function in EasyLanguage Editor" -ForegroundColor Yellow
Write-Host ""
Write-Host "  4. See full guide: INSTALL-TRADESTATION.md" -ForegroundColor White
Write-Host ""
