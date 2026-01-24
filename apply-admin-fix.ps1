# Script para aplicar la migración de permisos de admin
# Este script soluciona el problema de no poder ver los registros de clientes

Write-Host "=== Aplicando Fix de Permisos Admin ===" -ForegroundColor Cyan
Write-Host ""

# Instrucciones
Write-Host "OPCIÓN 1: Aplicar vía Supabase CLI (Recomendado)" -ForegroundColor Green
Write-Host "----------------------------------------------------" -ForegroundColor Gray
Write-Host "1. Asegúrate de tener Supabase CLI instalado"
Write-Host "2. Ejecuta: supabase db push" -ForegroundColor Yellow
Write-Host ""

Write-Host "OPCIÓN 2: Aplicar manualmente en Supabase Dashboard" -ForegroundColor Green
Write-Host "-----------------------------------------------------" -ForegroundColor Gray
Write-Host "1. Ve a: https://app.supabase.com/project/_/sql" -ForegroundColor Yellow
Write-Host "2. Abre el archivo: supabase\migrations\20260124000001_fix_admin_access_to_all_tables.sql"
Write-Host "3. Copia TODO el contenido del archivo"
Write-Host "4. Pégalo en el SQL Editor de Supabase"
Write-Host "5. Haz clic en 'Run' (Ejecutar)"
Write-Host ""

Write-Host "OPCIÓN 3: Aplicar directamente con este script" -ForegroundColor Green
Write-Host "-------------------------------------------------" -ForegroundColor Gray
Write-Host "Necesitas configurar las variables de entorno primero:" -ForegroundColor Yellow
Write-Host '  $env:SUPABASE_URL = "https://tu-proyecto.supabase.co"' -ForegroundColor Gray
Write-Host '  $env:SUPABASE_SERVICE_KEY = "tu-service-role-key"' -ForegroundColor Gray
Write-Host ""

# Verificar si hay variables de entorno
$supabaseUrl = $env:SUPABASE_URL
$serviceKey = $env:SUPABASE_SERVICE_KEY

if ($supabaseUrl -and $serviceKey) {
    Write-Host "✓ Variables de entorno detectadas" -ForegroundColor Green
    Write-Host "¿Quieres aplicar la migración ahora? (S/N): " -NoNewline -ForegroundColor Yellow
    $response = Read-Host
    
    if ($response -eq 'S' -or $response -eq 's') {
        Write-Host ""
        Write-Host "Leyendo archivo de migración..." -ForegroundColor Cyan
        
        $migrationFile = Join-Path $PSScriptRoot "supabase\migrations\20260124000001_fix_admin_access_to_all_tables.sql"
        
        if (-not (Test-Path $migrationFile)) {
            Write-Host "ERROR: No se encontró el archivo de migración" -ForegroundColor Red
            Write-Host "Ruta esperada: $migrationFile" -ForegroundColor Gray
            exit 1
        }
        
        $sqlContent = Get-Content $migrationFile -Raw
        
        Write-Host "Aplicando migración..." -ForegroundColor Cyan
        
        try {
            $headers = @{
                "apikey" = $serviceKey
                "Authorization" = "Bearer $serviceKey"
                "Content-Type" = "text/plain"
            }
            
            $url = "$supabaseUrl/rest/v1/rpc/exec_sql"
            
            # Ejecutar SQL directamente
            $body = @{
                query = $sqlContent
            } | ConvertTo-Json
            
            $response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $body
            
            Write-Host ""
            Write-Host "✓ Migracion aplicada exitosamente!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Ahora recarga tu panel de admin en el navegador:" -ForegroundColor Cyan
            Write-Host "  http://localhost:5173/admin/control" -ForegroundColor Yellow
            Write-Host ""
            
        } catch {
            Write-Host ""
            Write-Host "ERROR: No se pudo aplicar la migracion automaticamente" -ForegroundColor Red
            Write-Host "Detalles: $($_.Exception.Message)" -ForegroundColor Gray
            Write-Host ""
            Write-Host "Por favor usa la OPCION 2 (manual) arriba." -ForegroundColor Yellow
        }
    } else {
        Write-Host "Operacion cancelada." -ForegroundColor Gray
    }
} else {
    Write-Host "⚠ Variables de entorno no configuradas" -ForegroundColor Yellow
    Write-Host "Por favor usa la OPCIÓN 1 o 2 arriba." -ForegroundColor Cyan
}

Write-Host ""
Write-Host "=== Pasos Siguientes ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Aplica la migración usando una de las opciones arriba" -ForegroundColor White
Write-Host "2. Recarga tu panel de admin en el navegador" -ForegroundColor White
Write-Host "3. Deberías ver todos los registros de clientes" -ForegroundColor White
Write-Host ""
Write-Host "Si aun no funciona, abre la consola del navegador (F12)" -ForegroundColor Yellow
Write-Host "y comparteme los mensajes de error." -ForegroundColor Yellow
Write-Host ""
