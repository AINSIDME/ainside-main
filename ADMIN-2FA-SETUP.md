# 🔐 Configuración de Autenticación 2FA para Panel de Administración

## 📱 Configurar Google Authenticator

### Para jonathangolubok@gmail.com:

1. **Abre Google Authenticator** en tu teléfono
2. **Escanea este código QR** o ingresa la clave manual:

```
Clave secreta: JBSWY3DPEHPK3PXP
```

**Código QR:**
```
https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=otpauth://totp/AInside:jonathangolubok@gmail.com?secret=JBSWY3DPEHPK3PXP&issuer=AInside
```

3. **Configuración manual en Google Authenticator:**
   - Nombre de la cuenta: AInside Admin
   - Tu clave: JBSWY3DPEHPK3PXP
   - Tipo de clave: Basada en tiempo

---

## 🔄 Cambiar Secretos de Seguridad (IMPORTANTE)

### Los secretos actuales son de EJEMPLO. Debes cambiarlos:

**1. Generar nuevos secretos:**

Ejecuta esto en Node.js o un generador online:
```javascript
const crypto = require('crypto');
const base32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
let secret = '';
for (let i = 0; i < 16; i++) {
  secret += base32[Math.floor(Math.random() * 32)];
}
console.log(secret);
```

**2. Actualizar en Supabase Function:**

Edita: `supabase/functions/verify-admin-2fa/index.ts`

```typescript
const ADMIN_2FA_SECRETS: Record<string, string> = {
  'jonathangolubok@gmail.com': 'TU_NUEVO_SECRETO_AQUI',
  'admin@ainside.me': 'OTRO_NUEVO_SECRETO_AQUI'
}
```

**3. Redesplegar la función:**
```bash
cd C:\Users\jonat\Downloads\ainside-main\ainside-main
supabase functions deploy verify-admin-2fa
```

---

## 🗄️ Crear Tabla de Logs de Acceso

Ejecuta en Supabase SQL Editor:

```sql
-- Tabla para logs de acceso al panel de administración
CREATE TABLE IF NOT EXISTS admin_access_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_admin_logs_email ON admin_access_logs(admin_email);
CREATE INDEX idx_admin_logs_created ON admin_access_logs(created_at DESC);

-- Habilitar Row Level Security
ALTER TABLE admin_access_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Solo service role puede insertar
CREATE POLICY "Service role can insert logs"
  ON admin_access_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Solo service role puede leer
CREATE POLICY "Service role can read logs"
  ON admin_access_logs
  FOR SELECT
  TO service_role
  USING (true);
```

---

## 🚀 Desplegar Sistema 2FA

### 1. Desplegar Supabase Function:

```powershell
cd C:\Users\jonat\Downloads\ainside-main\ainside-main
supabase functions deploy verify-admin-2fa
```

### 2. Verificar que la función esté activa:

Ve a: https://supabase.com/dashboard/project/odlxhgatqyodxdessxts/functions

Deberías ver `verify-admin-2fa` en la lista.

### 3. Probar el sistema:

1. Ve a: https://ainside.me/admin/control
2. Si no estás logueado → Te redirige a /login
3. Después de login → Te redirige a /admin/verify-2fa
4. Ingresa código de Google Authenticator
5. Si es correcto → Acceso al panel de control

---

## 🔒 Características de Seguridad

✅ **Autenticación de 2 factores obligatoria**
✅ **Bloqueo después de 3 intentos fallidos (15 minutos)**
✅ **Sesión 2FA válida por 4 horas máximo**
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

## ⚠️ IMPORTANTE - Antes de Producción

1. **Genera secretos únicos nuevos** (no uses los de ejemplo)
2. **Guarda los secretos en lugar seguro** (1Password, LastPass, etc.)
3. **Configura Google Authenticator en tu teléfono**
4. **Prueba el login completo antes de desplegar**
5. **Crea backup de los códigos de recuperación**

---

## 🆘 Recuperación de Acceso

Si pierdes acceso a Google Authenticator:

1. Accede a Supabase Functions
2. Edita `verify-admin-2fa/index.ts`
3. Genera nuevo secreto
4. Redespliega la función
5. Configura Google Authenticator con el nuevo secreto

---

## 📱 Generar Código QR Personalizado

Para cada administrador, genera su QR:

```
https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=otpauth://totp/AInside:[EMAIL]?secret=[SECRET]&issuer=AInside
```

Reemplaza:
- `[EMAIL]` con el email del admin
- `[SECRET]` con su secreto único
