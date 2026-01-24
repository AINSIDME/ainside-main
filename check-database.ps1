# Script para verificar los datos en Supabase
# Ejecuta este script para ver cuántos clientes reales tienes registrados

Write-Host "=== Diagnóstico de Base de Datos ===" -ForegroundColor Cyan
Write-Host ""

# Lee las variables de entorno de Supabase
$envFile = Join-Path $PSScriptRoot "supabase\.env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2])
        }
    }
}

$supabaseUrl = $env:SUPABASE_URL
$serviceKey = $env:SUPABASE_SERVICE_ROLE_KEY

if (-not $supabaseUrl -or -not $serviceKey) {
    Write-Host "ERROR: No se encontraron las credenciales de Supabase" -ForegroundColor Red
    Write-Host "Verifica que el archivo supabase\.env exista y contenga:" -ForegroundColor Yellow
    Write-Host "  - SUPABASE_URL" -ForegroundColor Yellow
    Write-Host "  - SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Yellow
    exit 1
}

Write-Host "Conectando a: $supabaseUrl" -ForegroundColor Green
Write-Host ""

# Función para hacer consultas
function Invoke-SupabaseQuery {
    param (
        [string]$Table,
        [string]$Select = "*",
        [string]$Count = $null
    )
    
    $headers = @{
        "apikey" = $serviceKey
        "Authorization" = "Bearer $serviceKey"
        "Content-Type" = "application/json"
    }
    
    $params = "select=$Select"
    if ($Count) {
        $headers["Prefer"] = "count=$Count"
    }
    
    $url = "$supabaseUrl/rest/v1/$Table`?$params"
    
    try {
        $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
        return $response
    } catch {
        Write-Host "Error consultando $Table`: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Función para obtener conteo
function Get-TableCount {
    param ([string]$Table)
    
    $headers = @{
        "apikey" = $serviceKey
        "Authorization" = "Bearer $serviceKey"
        "Content-Type" = "application/json"
        "Prefer" = "count=exact"
    }
    
    $url = "$supabaseUrl/rest/v1/$Table`?select=id"
    
    try {
        $response = Invoke-WebRequest -Uri $url -Headers $headers -Method Head
        $count = $response.Headers["Content-Range"]
        if ($count -match '/(\d+)$') {
            return [int]$matches[1]
        }
        return 0
    } catch {
        return 0
    }
}

# Verificar tablas
Write-Host "📊 Conteo de registros:" -ForegroundColor Cyan
Write-Host "------------------------" -ForegroundColor Gray

$tables = @(
    @{Name="hwid_registrations"; Label="Registros HWID"},
    @{Name="purchases"; Label="Compras"},
    @{Name="client_connections"; Label="Conexiones"}
)

foreach ($table in $tables) {
    $count = Get-TableCount -Table $table.Name
    $color = if ($count -gt 0) { "Green" } else { "Yellow" }
    Write-Host "  $($table.Label): " -NoNewline
    Write-Host "$count" -ForegroundColor $color
}

Write-Host ""
Write-Host "📋 Detalles de registros HWID:" -ForegroundColor Cyan
Write-Host "-------------------------------" -ForegroundColor Gray

$registrations = Invoke-SupabaseQuery -Table "hwid_registrations" -Select "order_id,email,name,hwid,status,created_at"

if ($registrations -and $registrations.Count -gt 0) {
    foreach ($reg in $registrations) {
        Write-Host ""
        Write-Host "  Order ID: $($reg.order_id)" -ForegroundColor White
        Write-Host "  Email: $($reg.email)" -ForegroundColor Gray
        Write-Host "  Nombre: $($reg.name)" -ForegroundColor Gray
        Write-Host "  HWID: $($reg.hwid)" -ForegroundColor Gray
        Write-Host "  Estado: $($reg.status)" -ForegroundColor $(if ($reg.status -eq 'active') {'Green'} else {'Yellow'})
        Write-Host "  Fecha: $($reg.created_at)" -ForegroundColor Gray
    }
} else {
    Write-Host "  ⚠️  No hay registros HWID en la base de datos" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "💰 Detalles de compras:" -ForegroundColor Cyan
Write-Host "-----------------------" -ForegroundColor Gray

$purchases = Invoke-SupabaseQuery -Table "purchases" -Select "order_id,email,plan_name,status,amount,currency,created_at"

if ($purchases -and $purchases.Count -gt 0) {
    foreach ($purchase in $purchases) {
        Write-Host ""
        Write-Host "  Order ID: $($purchase.order_id)" -ForegroundColor White
        Write-Host "  Email: $($purchase.email)" -ForegroundColor Gray
        Write-Host "  Plan: $($purchase.plan_name)" -ForegroundColor Gray
        Write-Host "  Estado: $($purchase.status)" -ForegroundColor $(if ($purchase.status -eq 'completed') {'Green'} else {'Yellow'})
        Write-Host "  Monto: $($purchase.amount) $($purchase.currency)" -ForegroundColor Gray
        Write-Host "  Fecha: $($purchase.created_at)" -ForegroundColor Gray
    }
} else {
    Write-Host "  ⚠️  No hay compras en la base de datos" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Fin del diagnóstico ===" -ForegroundColor Cyan
Write-Host ""

if (($registrations -and $registrations.Count -gt 0) -or ($purchases -and $purchases.Count -gt 0)) {
    Write-Host "✅ Tienes datos en la base de datos" -ForegroundColor Green
    Write-Host "Si no los ves en el panel de admin, verifica:" -ForegroundColor Yellow
    Write-Host "  1. Que estés autenticado correctamente" -ForegroundColor Yellow
    Write-Host "  2. Que hayas completado la verificación 2FA" -ForegroundColor Yellow
    Write-Host "  3. Que no haya errores en la consola del navegador (F12)" -ForegroundColor Yellow
} else {
    Write-Host "⚠️  No hay datos en la base de datos" -ForegroundColor Yellow
    Write-Host "Para crear clientes de prueba, usa el botón 'Crear cliente demo' en el panel de admin" -ForegroundColor Cyan
}
