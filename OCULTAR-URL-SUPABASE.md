# 🔒 OCULTAR URL DE SUPABASE

## El problema

La URL de Supabase se ve en el navegador en las llamadas de red (DevTools → Network).

## ✅ Solución Implementada

### 1. Para PRODUCCIÓN (Vercel/ainside.me)

Ya está configurado el proxy en `vercel.json`. Solo necesitas:

**En Vercel Dashboard:**
1. Ve a tu proyecto → Settings → Environment Variables
2. Cambia o agrega:
   ```
   VITE_SUPABASE_URL = https://ainside.me/api/supabase
   ```
3. Redeploya el proyecto

**Resultado:** Los usuarios verán `ainside.me/api/supabase` en lugar de la URL de Supabase.

---

### 2. Para DESARROLLO LOCAL (localhost)

La URL de Supabase SIEMPRE se verá en desarrollo local porque:
- Las herramientas de desarrollador (DevTools) muestran todas las peticiones
- No hay forma de ocultarlo completamente del lado del cliente
- Es normal y esperado

**Si aún quieres usar el proxy localmente:**

Crea archivo `.env.local`:
```env
VITE_SUPABASE_URL=http://localhost:3000/api/supabase
```

Y configura un proxy local (usando nginx, http-proxy-middleware, etc.)

---

## 🔐 Seguridad

**IMPORTANTE:** La URL de Supabase NO es un secreto sensible porque:

✅ Solo expones el endpoint público (anon key)
✅ La seguridad está en las políticas RLS de Supabase
✅ La service_role_key NUNCA está en el cliente
✅ Todas las APIs usan autenticación JWT

**Lo que SÍ debes proteger:**
- ❌ Service Role Key (nunca en el cliente)
- ❌ Credenciales de admin
- ❌ Tokens de sesión

---

## 📊 Verificación

### En Producción
Abre DevTools → Network → busca peticiones a Supabase:
- ✅ Debería ver: `ainside.me/api/supabase`
- ❌ No debería ver: `odlxhgatqyodxdessxts.supabase.co`

### En Desarrollo
Es NORMAL ver la URL real de Supabase en localhost.

---

## 🎯 Conclusión

- **Producción:** URL oculta mediante proxy en Vercel ✅
- **Desarrollo:** URL visible (es normal) ⚠️
- **Seguridad:** No compromete la seguridad del sistema ✅

La configuración ya está lista. Solo necesitas configurar la variable de entorno en Vercel.
