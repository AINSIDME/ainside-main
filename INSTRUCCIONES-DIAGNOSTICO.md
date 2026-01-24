# Instrucciones para Diagnosticar el Problema de Registro de Clientes

## 🔍 Pasos para Diagnóstico

### 1. Abrir la Consola del Navegador
1. Ve a: http://localhost:5173/admin/control
2. Presiona **F12** para abrir las Herramientas de Desarrollador
3. Ve a la pestaña **"Console"** (Consola)

### 2. Verificar Logs
Busca mensajes que empiecen con:
- `[AdminControl]`
- Cualquier error en rojo

### 3. Información a Proporcionar

Necesito que me des:

#### A. Los logs de la consola
Copia todo lo que veas en la consola, especialmente:
```
[AdminControl] Fetching clients...
[AdminControl] 2FA Token: ...
[AdminControl] Access Token: ...
[AdminControl] Response data: ...
[AdminControl] Response error: ...
```

#### B. Estado de autenticación
- ¿Estás logueado con tu cuenta de admin? (¿Cuál email?)
- ¿Completaste la verificación 2FA?
- ¿Hace cuánto completaste el 2FA? (debe ser menos de 12 horas)

#### C. Estado de la base de datos
¿Has registrado clientes mediante:
- Compras reales con PayPal
- Registro manual de HWID
- La página `/register`

### 4. Verificar Variables de Entorno

Verifica que tengas configurado en tu archivo `.env` (en la raíz del proyecto):

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
VITE_ADMIN_EMAILS=tu-email@ejemplo.com
```

### 5. Posibles Causas del Problema

| Problema | Síntoma | Solución |
|----------|---------|----------|
| **No hay datos** | Meta muestra 0 registros | Registra clientes reales |
| **Error 2FA** | Mensaje "2FA required/expired" | Renueva 2FA en `/admin/verify-2fa` |
| **Error RLS** | "row-level security policy" | Verifica políticas en Supabase |
| **Error de permisos** | "Forbidden" o "Unauthorized" | Verifica VITE_ADMIN_EMAILS |
| **Error de función** | Error 500 | Verifica logs de Edge Functions |

### 6. Comandos de Depuración

#### Ver estado de las Edge Functions
```powershell
# En el panel de Supabase Dashboard:
# https://app.supabase.com/project/_/functions
```

#### Verificar políticas RLS
```sql
-- Ejecuta esto en SQL Editor de Supabase:
SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('hwid_registrations', 'purchases', 'client_connections');
```

### 7. Solución Rápida: Crear Cliente de Prueba

Si quieres verificar que el panel funciona, haz clic en el botón **"Crear cliente demo"** en el panel de admin.

---

## 📞 Información a Proporcionar

Para resolver tu problema, dame:

1. ✅ **Logs completos de la consola del navegador**
2. ✅ **Email con el que estás logueado**
3. ✅ **Mensajes de error exactos** (si los hay)
4. ✅ **Si ves el contador de "Meta"** (Registros HWID, Conexiones, Compras)
5. ✅ **Si has registrado clientes reales o solo estás probando**
