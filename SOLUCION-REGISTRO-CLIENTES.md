# 🔧 SOLUCIÓN: No Puedo Ver el Registro de Clientes

## 🎯 Problema Identificado

Tienes registros de clientes en la base de datos, pero NO los ves en el panel de administración.

**Causa:** Las políticas de Row Level Security (RLS) están bloqueando el acceso a los datos, incluso para administradores.

---

## ✅ SOLUCIÓN RÁPIDA (Recomendada)

### Paso 1: Aplicar Migración de Permisos

Ejecuta **UNO** de estos métodos:

#### **Método A: Supabase Dashboard (Más Fácil)**

1. Ve a tu proyecto en Supabase: https://app.supabase.com
2. Click en **"SQL Editor"** en el menú lateral
3. Abre el archivo: `supabase\migrations\20260124000001_fix_admin_access_to_all_tables.sql`
4. **Copia TODO el contenido** del archivo
5. **Pégalo** en el SQL Editor
6. Click en **"Run"** (Ejecutar)
7. Espera el mensaje de éxito

#### **Método B: Usando PowerShell**

```powershell
cd "c:\Users\jonat\Downloads\ainside-main\ainside-main"
.\apply-admin-fix.ps1
```

#### **Método C: Supabase CLI**

```bash
cd ainside-main
supabase db push
```

### Paso 2: Recargar el Panel de Admin

1. Ve a: http://localhost:5173/admin/control
2. Presiona **Ctrl + Shift + R** (recarga completa)
3. Los clientes deberían aparecer ahora

---

## 🔍 Si Aún No Funciona

### Verificar en la Consola del Navegador

1. Abre el navegador en: http://localhost:5173/admin/control
2. Presiona **F12** para abrir DevTools
3. Ve a la pestaña **"Console"**
4. Busca mensajes que empiecen con `[AdminControl]`

#### Posibles Errores y Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| `2FA required` | Token 2FA expirado | Ve a `/admin/verify-2fa` y renueva |
| `Forbidden` | Email no autorizado | Verifica `VITE_ADMIN_EMAILS` en `.env` |
| `row-level security policy` | Políticas RLS no aplicadas | Aplica la migración (Paso 1) |
| `Failed to fetch registrations` | Error en la base de datos | Verifica los logs de Edge Functions |

### Verificar Variables de Entorno

Crea o edita el archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
VITE_ADMIN_EMAILS=jonathangolubok@gmail.com
```

**Importante:** Después de modificar `.env`, debes **reiniciar el servidor**:

```powershell
# Detén el servidor (Ctrl+C en la terminal)
# Luego reinicia:
npm run dev
```

---

## 📊 Verificar Datos en la Base de Datos

Para confirmar que tienes datos reales:

### Método 1: Desde Supabase Dashboard

1. Ve a: https://app.supabase.com/project/_/editor
2. Click en la tabla `hwid_registrations`
3. Deberías ver tus clientes listados

### Método 2: Usar SQL Editor

```sql
-- Ver registros HWID
SELECT order_id, email, name, hwid, status, created_at
FROM hwid_registrations
ORDER BY created_at DESC;

-- Ver compras
SELECT order_id, email, plan_name, status, amount, created_at
FROM purchases
ORDER BY created_at DESC;

-- Ver conexiones
SELECT hwid, plan_name, last_seen
FROM client_connections
ORDER BY last_seen DESC;
```

---

## 🔐 Lo Que Hicimos Para Solucionar

La migración `20260124000001_fix_admin_access_to_all_tables.sql` hace lo siguiente:

1. **Crea políticas RLS explícitas** para tu email de administrador
2. **Permite acceso completo** a estas tablas:
   - `hwid_registrations` (registros de clientes)
   - `purchases` (compras)
   - `client_connections` (estado de conexión)
3. **Mantiene la seguridad** - solo tu email puede acceder

---

## 📞 Información de Debug

Si necesitas más ayuda, proporciona:

1. **Logs de la consola del navegador** (F12 → Console)
2. **Email con el que estás logueado**
3. **Resultado de este query SQL:**

```sql
-- Ejecuta esto en SQL Editor de Supabase
SELECT 
  (SELECT COUNT(*) FROM hwid_registrations) as registrations,
  (SELECT COUNT(*) FROM purchases) as purchases,
  (SELECT COUNT(*) FROM client_connections) as connections;
```

4. **Valor de tu variable de entorno:**
```powershell
# Ejecuta en PowerShell:
cd "c:\Users\jonat\Downloads\ainside-main\ainside-main"
Get-Content .env | Select-String "VITE_ADMIN_EMAILS"
```

---

## ✨ Después de Solucionar

Una vez que funcione, deberías ver:

- ✅ Lista de todos los clientes registrados
- ✅ Estado online/offline
- ✅ Información de compras y planes
- ✅ Contador de registros totales (Meta)
- ✅ Botones de acción (cambiar plan, desconectar, etc.)

---

**Fecha de esta solución:** 24 de enero de 2026
