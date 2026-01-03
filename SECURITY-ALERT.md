# ALERTA DE SEGURIDAD - API KEY EXPUESTA

## Problema Detectado
La Resend API Key estaba expuesta en GitHub.
- Repositorio: AINSIDME/ainside-main
- Fecha: 3 de Enero 2026, 19:08:03 UTC
- Estado: CORREGIDO

## PASOS URGENTES A SEGUIR:

### 1. REVOCAR LA API KEY INMEDIATAMENTE (5 minutos)
   
   Ve a: https://resend.com/api-keys
   
   - Click en la key actual
   - Click "Delete" o "Revoke"
   - Confirma la revocación

### 2. CREAR NUEVA API KEY
   
   En la misma página:
   - Click "Create API Key"
   - Nombre: "Production Key - Secure"
   - Permisos: "Full Access" o "Send emails"
   - Copia la nueva key (la verás solo una vez)

### 3. ACTUALIZAR EN SUPABASE (NO EN GIT)
   
   Ejecuta en PowerShell:
   ```powershell
   supabase secrets set RESEND_API_KEY=tu_nueva_key_aqui
   ```

### 4. LIMPIAR LOS SCRIPTS LOCALES
   
   Ejecuta el script de limpieza:
   ```powershell
   .\cleanup-exposed-keys.ps1
   ```

### 5. LIMPIAR EL HISTORIAL DE GIT
   
   Opciones:
   
   A) Método rápido (requiere forzar push):
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch setup-complete.ps1 send-examples.ps1 create-test-products.ps1" \
     --prune-empty --tag-name-filter cat -- --all
   
   git push origin --force --all
   ```
   
   B) Método GitHub (recomendado):
   - Ve a: https://github.com/AINSIDME/ainside-main/settings
   - Sección "Danger Zone"
   - "Delete this repository"
   - Vuelve a crear el repositorio y sube solo el código limpio

## Archivos que contienen la key (ELIMINAR DE GIT):
- setup-complete.ps1
- send-examples.ps1  
- create-test-products.ps1
- send-test-emails.ps1
- create-test-purchase.ps1

## IMPORTANTE:
- Las Edge Functions de Supabase ya usan RESEND_API_KEY desde secrets (seguro)
- Solo los scripts de prueba locales tienen la key hardcodeada
- Una vez actualizada en Supabase, todo seguirá funcionando

## Verificación Post-Limpieza:
1. Confirma que la key antigua está revocada en Resend
2. Confirma que la nueva key funciona en Supabase
3. Elimina todos los archivos .ps1 con keys del repositorio
6. Verifica que no queden keys en el repositorio de GitHub

## Prevención Futura:
- NUNCA incluir API keys en el código
- Siempre usar variables de entorno o secrets
- Agregar *.ps1 con keys al .gitignore
- Usar archivos .env.local (no commiteados)
