# 🔐 Configuración de Autenticación 2FA (Admin) – Supabase Edge Functions

Este proyecto usa un flujo 2FA **server-side**:

- El admin debe estar autenticado con Supabase (JWT en `Authorization`).
- Luego debe validar TOTP en `verify-admin-2fa`.
- Si es correcto, el servidor emite un token y lo guarda en `admin_2fa_sessions`.
- Las Edge Functions críticas exigen `x-admin-2fa-token` + sesión Supabase.

> Importante: **NO** se guardan secretos 2FA en el repo. Se configuran con Supabase Secrets.

---

## ✅ Paso 1 — Configurar Secrets en Supabase

En Supabase Dashboard → **Project Settings → Functions → Secrets**, define:

1) **Allowlist de admins**

- `ADMIN_EMAILS` = `jonathangolubok@gmail.com`

2) **Secretos TOTP** (elige una opción)

Opción A (recomendada): secreto por email

- `ADMIN_2FA_SECRETS_JSON` =

```json
{
  "jonathangolubok@gmail.com": "BASE32_SECRET_1"
}
```

Opción B (más simple, menos ideal): secreto compartido

- `ADMIN_2FA_SHARED_SECRET` = `BASE32_SECRET`

> Nota: `SUPABASE_URL`, `SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` normalmente ya están disponibles en el runtime de Supabase Edge Functions.

---

## ✅ Paso 2 — Aplicar Migraciones en Supabase

En Supabase Dashboard → SQL Editor, aplica estas migraciones del repo:

- `supabase/migrations/20260104_create_admin_logs.sql`
- `supabase/migrations/20260104_create_admin_2fa_sessions.sql`

Estas crean:

- `admin_access_logs` (logs 2FA)
- `admin_2fa_sessions` (tokens 2FA server-side)

Ambas con RLS habilitado y policies solo para `service_role`.

---

## ✅ Paso 3 — Desplegar Edge Functions

Desde la carpeta del proyecto:

```powershell
cd C:\Users\jonat\Downloads\ainside-main\ainside-main
supabase functions deploy
```

## ✅ Paso 3.1 — Generar tu secreto TOTP (local)

Genera un secreto fuerte (BASE32) para tu cuenta admin:

```powershell
cd C:\Users\jonat\Downloads\ainside-main\ainside-main
node .\scripts\generate-admin-totp.mjs jonathangolubok@gmail.com AInside
```

El script imprime:

- `BASE32 Secret`
- `OTPAuth URI`
- un `QR URL` (para escanear desde el teléfono)
- y el `ADMIN_2FA_SECRETS_JSON` listo para pegar.

## ✅ Paso 3.2 — Setear secrets con CLI (opcional, recomendado)

Si tienes Supabase CLI logueado y el proyecto linkeado, puedes setear secrets así:

```powershell
supabase secrets set ADMIN_EMAILS="jonathangolubok@gmail.com"
supabase secrets set ADMIN_2FA_SECRETS_JSON="{\"jonathangolubok@gmail.com\":\"BASE32_SECRET_1\"}"
```

Luego redeploy:

```powershell
supabase functions deploy verify-admin-2fa get-clients-status toggle-strategy change-client-plan
```

Funciones relevantes para Admin 2FA:

- `verify-admin-2fa`
- `get-clients-status`
- `toggle-strategy`
- `change-client-plan`

## ✅ Paso 4 — Probar el flujo

1. Ve a: https://ainside.me/admin/control
2. Si no estás logueado → Te redirige a /login
3. Después de login → Te redirige a /admin/verify-2fa
4. Ingresa código de Google Authenticator
5. Si el código es correcto → acceso a `/admin/control`

---

## 🔒 Seguridad implementada

✅ **Autenticación de 2 factores obligatoria**
✅ **Bloqueo después de 3 intentos fallidos (15 minutos)**
✅ **Sesión 2FA válida por 1 hora máximo** (server + client)
✅ **Logs de todos los intentos de acceso**
✅ **Códigos TOTP cambian cada 30 segundos**
✅ **Solo emails autorizados en lista blanca**

---

## 📊 Ver Logs de Acceso

En Supabase SQL Editor:

```sql
-- Ver todos los logs
SELECT * FROM admin_access_logs 
ORDER BY created_at DESC 
LIMIT 50;

-- Ver solo intentos fallidos
SELECT * FROM admin_access_logs 
WHERE action = '2fa_verification_failed'
ORDER BY created_at DESC;

-- Ver accesos por email
SELECT 
  admin_email,
  COUNT(*) as total_attempts,
  COUNT(*) FILTER (WHERE action = '2fa_verification_success') as successful,
  COUNT(*) FILTER (WHERE action = '2fa_verification_failed') as failed
FROM admin_access_logs
GROUP BY admin_email;
```

---

## ⚠️ Antes de producción

1. **Genera secretos únicos nuevos** (no reuses secretos)
2. **Guarda los secretos en lugar seguro** (1Password, etc.)
3. **Configura Google Authenticator en tu teléfono**
4. **Prueba el login completo antes de desplegar**
5. **Crea backup de los códigos de recuperación**

---

## 🆘 Recuperación de acceso

Si pierdes acceso a Google Authenticator:

1. Cambia `ADMIN_2FA_SECRETS_JSON` (o `ADMIN_2FA_SHARED_SECRET`) en Supabase Secrets
2. Redeploy `verify-admin-2fa`
3. Reconfigura Google Authenticator con el nuevo secreto

---

## 📱 Generar Código QR Personalizado

Para cada administrador, genera su QR:

```
https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=otpauth://totp/AInside:[EMAIL]?secret=[SECRET]&issuer=AInside
```

Reemplaza:
- `[EMAIL]` con el email del admin
- `[SECRET]` con su secreto único
