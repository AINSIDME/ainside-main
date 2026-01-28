# Script para aplicar la migración del trigger de notificaciones
# Ejecuta el SQL directamente en Supabase

$migrationSQL = Get-Content "supabase\migrations\20260128000001_create_contact_notification_trigger.sql" -Raw

Write-Host "Aplicando migracion: Trigger de notificacion de mensajes..." -ForegroundColor Cyan
Write-Host ""

# Nota: Este SQL debe ejecutarse manualmente en el SQL Editor de Supabase Dashboard
# https://supabase.com/dashboard/project/odlxhgatqyodxdessxts/sql/new

Write-Host "INSTRUCCIONES:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Abre: https://supabase.com/dashboard/project/odlxhgatqyodxdessxts/sql/new" -ForegroundColor White
Write-Host "2. Copia y pega el siguiente SQL:" -ForegroundColor White
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor DarkGray
Write-Host $migrationSQL -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor DarkGray
Write-Host ""
Write-Host "3. Haz clic en 'Run' para ejecutar" -ForegroundColor White
Write-Host "4. Verifica que se ejecute sin errores" -ForegroundColor White
Write-Host ""
Write-Host "Resultado: La migracion creara:" -ForegroundColor Cyan
Write-Host "   - Extension pg_net (si no existe)" -ForegroundColor Gray
Write-Host "   - Funcion notify_admin_new_message()" -ForegroundColor Gray
Write-Host "   - Trigger on_contact_message_created" -ForegroundColor Gray
Write-Host ""
Write-Host "Resultado: Recibiras un email en jonathangolubok@gmail.com cada vez que llegue un mensaje" -ForegroundColor Green
Write-Host ""

# Copiar SQL al portapapeles si está disponible
try {
    Set-Clipboard -Value $migrationSQL
    Write-Host "SQL copiado al portapapeles!" -ForegroundColor Green
} catch {
    Write-Host "No se pudo copiar al portapapeles automaticamente" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Presiona cualquier tecla para continuar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
