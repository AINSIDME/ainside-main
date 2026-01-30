# 🔒 Guía de Seguridad - AInside

## ⚠️ REGLAS DE ORO (NUNCA ROMPER)

### 1. NUNCA hardcodear keys en el código
```javascript
// ❌ MAL - NUNCA HACER ESTO
const key = "eyJhbGciOiJIUzI1NiIs...";

// ✅ BIEN - Usar variables de entorno
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

### 2. Archivos que NUNCA deben tener keys hardcodeadas:
- ❌ `*.html` (test-payment.html, etc.)
- ❌ `*.js` / `*.ts` (archivos de código fuente)
- ❌ `*.py` (scripts de Python)
- ❌ `*.ps1` (scripts de PowerShell)
- ❌ `*.cjs` / `*.mjs` (scripts de Node)

### 3. Tipos de keys y su exposición:

| Key Type | ¿Público OK? | Ubicación correcta |
|----------|--------------|-------------------|
| `VITE_SUPABASE_URL` | ✅ SÍ | `.env`, código frontend |
| `VITE_SUPABASE_ANON_KEY` | ✅ SÍ | `.env`, código frontend |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ **NUNCA** | Solo Edge Functions (Supabase env) |
| `STRIPE_SECRET_KEY` | ❌ **NUNCA** | Solo Edge Functions |
| `JWT_SECRET` | ❌ **NUNCA** | Solo Supabase dashboard |

## 🛡️ Qué hacer si expones un key accidentalmente

### Paso 1: NO ENTRAR EN PÁNICO
- Git guarda el historial completo
- Simplemente borrar el archivo NO es suficiente
- **El key sigue visible en el historial de commits**

### Paso 2: Rotar el key INMEDIATAMENTE
1. **Service Role Key**: Supabase Dashboard → Settings → JWT Keys → Generate random secret
2. **Stripe Keys**: Stripe Dashboard → Developers → API Keys → Roll secret key
3. **JWT Secret**: Supabase Dashboard → Settings → JWT Keys → Generate random secret

### Paso 3: Limpiar el repositorio
```powershell
# OPCIÓN 1: Eliminar del tracking (para archivos nuevos)
git rm --cached archivo-con-key.js
echo "archivo-con-key.js" >> .gitignore
git add .gitignore
git commit -m "security: remove exposed keys from tracking"
git push origin master

# OPCIÓN 2: Limpiar HISTORIAL COMPLETO (si ya fue commiteado antes)
# Usa git filter-branch para eliminar el archivo de TODO el historial
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch archivo-con-key.js" \
  --prune-empty --tag-name-filter cat -- --all

# Limpiar referencias locales
Remove-Item .git/refs/original -Recurse -Force
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push para actualizar el remoto
git push origin --force --all
git push origin --force --tags

# ⚠️ ADVERTENCIA: Force push reescribe el historial
# Todos los colaboradores deben hacer `git clone` de nuevo
```

### Paso 4: Verificar con GitGuardian
- Ve a tu email o dashboard de GitGuardian
- Marca los incidentes como "Revoked" una vez que hayas rotado las keys
- GitGuardian dejará de alertar sobre esos keys específicos

### Paso 5: Notificar si es crítico
- Si el key tenía acceso a datos sensibles
- Si el key era de producción
- Si el repositorio es público

## 📝 Checklist antes de cada commit

Antes de hacer `git commit`, revisa:

- [ ] ¿Hay algún `eyJ...` (JWT) en los archivos modificados?
- [ ] ¿Hay alguna key de Stripe (`sk_live_`, `rk_live_`)?
- [ ] ¿Hay contraseñas o API keys en los archivos?
- [ ] ¿Los archivos `.env` están en `.gitignore`?

**Comando rápido para verificar:**
```powershell
# Buscar JWTs expuestos
git diff | Select-String "eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+"

# Buscar "service_role" hardcodeado
git diff | Select-String "service_role.*eyJ"
```

## 🔧 Configuración correcta de .env

### Desarrollo local (.env.local)
```env
VITE_SUPABASE_URL=https://odlxhgatqyodxdessxts.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ... (anon key - público OK)
```

### Producción (Vercel/variables de entorno)
```env
VITE_SUPABASE_URL=https://odlxhgatqyodxdessxts.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ... (anon key - público OK)
```

### Edge Functions (Supabase auto-configura)
- `SUPABASE_URL` → Se configura automáticamente
- `SUPABASE_SERVICE_ROLE_KEY` → Se configura automáticamente
- **NUNCA** necesitas hardcodear estos valores

## 🚫 Archivos que SIEMPRE deben estar en .gitignore

```gitignore
# Archivos de entorno
.env
.env.local
.env.production
.env*.local

# Keys privadas
*.pem
*.key
license-private.b64

# Scripts con keys hardcodeadas
execute-migration.cjs
diagnose-notifications.ps1
test-payment.html
scripts/*-test-*.py

# Builds antiguos con keys expuestas
AInside-TradeStation-FINAL-*/
dist/
build/

# Admin secrets
admin-2fa-secret.json
admin-2fa-qr.png
```

## ✅ Cómo usar keys correctamente

### En el Frontend (React/TypeScript)
```typescript
// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### En Edge Functions (Deno)
```typescript
// supabase/functions/mi-funcion/index.ts
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseKey)
```

### En scripts de testing (NUNCA COMMITEAR)
```javascript
// test-local.js (en .gitignore)
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!key) {
  throw new Error('Set SUPABASE_SERVICE_ROLE_KEY env var first')
}
```

## 🔍 Auditoría de seguridad rápida

```powershell
# Buscar JWTs en el código
Select-String -Path "src/**/*.ts*" -Pattern "eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+"

# Buscar "service_role" hardcodeado
Select-String -Path "**/*.{ts,js,py,ps1}" -Pattern "service_role.*eyJ"

# Ver qué está siendo trackeado por Git
git ls-files | Select-String "\.env|test-payment|execute-migration"
```

## 📚 Recursos adicionales

- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)
- [Git Secrets - Prevenir commits con secrets](https://github.com/awslabs/git-secrets)
- [GitGuardian - Detector automático](https://www.gitguardian.com/)

---

**Última actualización**: 30 de enero de 2026
**Responsable de seguridad**: Jonathan Golubok (jonathangolubok@gmail.com)
