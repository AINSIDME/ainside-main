# Script para aplicar la migracion de permisos de admin

Write-Host "=== Aplicando Fix de Permisos Admin ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "SOLUCION: Aplicar manualmente en Supabase Dashboard" -ForegroundColor Green
Write-Host "-----------------------------------------------------" -ForegroundColor Gray
Write-Host ""
Write-Host "PASOS A SEGUIR:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Ve a: https://app.supabase.com" -ForegroundColor White
Write-Host "2. Selecciona tu proyecto" -ForegroundColor White
Write-Host "3. Click en 'SQL Editor' en el menu lateral izquierdo" -ForegroundColor White
Write-Host "4. Abre este archivo en tu editor:" -ForegroundColor White
Write-Host "   ainside-main\supabase\migrations\20260124000001_fix_admin_access_to_all_tables.sql" -ForegroundColor Cyan
Write-Host "5. COPIA TODO el contenido del archivo SQL" -ForegroundColor White
Write-Host "6. PEGALO en el SQL Editor de Supabase" -ForegroundColor White
Write-Host "7. Click en el boton 'RUN' (Ejecutar)" -ForegroundColor White
Write-Host "8. Espera el mensaje de exito" -ForegroundColor White
Write-Host ""

Write-Host "Despues de aplicar la migracion:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Recarga tu panel de admin: http://localhost:5173/admin/control" -ForegroundColor White
Write-Host "2. Presiona Ctrl + Shift + R para recargar completamente" -ForegroundColor White
Write-Host "3. Deberias ver todos tus clientes registrados" -ForegroundColor White
Write-Host ""

Write-Host "=== ALTERNATIVA: Ver archivo de migracion ===" -ForegroundColor Cyan
Write-Host ""

$migrationFile = Join-Path $PSScriptRoot "supabase\migrations\20260124000001_fix_admin_access_to_all_tables.sql"

if (Test-Path $migrationFile) {
    Write-Host "El archivo de migracion existe en:" -ForegroundColor Green
    Write-Host $migrationFile -ForegroundColor Gray
    Write-Host ""
    Write-Host "¿Quieres abrir el archivo ahora? (S/N): " -NoNewline -ForegroundColor Yellow
    $response = Read-Host
    
    if ($response -eq 'S' -or $response -eq 's') {
        Start-Process notepad.exe -ArgumentList $migrationFile
        Write-Host "Archivo abierto en Notepad" -ForegroundColor Green
    }
} else {
    Write-Host "ERROR: No se encontro el archivo de migracion" -ForegroundColor Red
    Write-Host "Ruta esperada: $migrationFile" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Si necesitas ayuda, abre la consola del navegador (F12)" -ForegroundColor Yellow
Write-Host "y comparteme los mensajes de error." -ForegroundColor Yellow
Write-Host ""
