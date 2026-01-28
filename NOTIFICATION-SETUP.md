# Sistema de Notificaciones por Email - Mensajes de Contacto

## 🎯 Objetivo
Enviar un email automáticamente a **jonathangolubok@gmail.com** cada vez que llegue un nuevo mensaje al formulario de contacto de https://ainside.me/admin/messages

## ✅ Completado

### 1. Edge Function creada y desplegada
✅ `supabase/functions/notify-new-message/index.ts` - Desplegada exitosamente
- Envía emails con Resend
- Diseño profesional con los datos del mensaje
- Botones de acción (responder, ver en admin)

### 2. Migración SQL creada
✅ `supabase/migrations/20260128000001_create_contact_notification_trigger.sql`
- Habilita extensión `pg_net`
- Crea función `notify_admin_new_message()`
- Crea trigger `on_contact_message_created`

## 📋 Siguiente Paso: Aplicar la Migración

### Opción A: Mediante SQL Editor de Supabase (RECOMENDADO)

1. **Abre el SQL Editor**:
   https://supabase.com/dashboard/project/odlxhgatqyodxdessxts/sql/new

2. **Copia el contenido** de:
   `supabase/migrations/20260128000001_create_contact_notification_trigger.sql`

3. **Pega en el editor** y haz clic en **"Run"**

4. **Verifica** que se ejecute sin errores

### Opción B: Mediante Supabase CLI

```powershell
cd ainside-main
supabase db push --linked
```

## 🔧 Configuración Requerida en Supabase

Después de aplicar la migración, debes configurar el service role key en Supabase:

1. Ve a: https://supabase.com/dashboard/project/odlxhgatqyodxdessxts/settings/api
2. Copia el **service_role key** (secret)
3. Ve a: https://supabase.com/dashboard/project/odlxhgatqyodxdessxts/settings/database
4. En "Custom Postgres Configuration" o mediante SQL, ejecuta:

```sql
ALTER DATABASE postgres SET app.service_role_key = 'tu-service-role-key-aqui';
```

**Nota**: Si no configuras esto, el trigger intentará usar el anon key como fallback (menos seguro pero funcional para pruebas).

## 🧪 Cómo Probar

1. **Envía un mensaje de prueba** desde: https://ainside.me/contact

2. **Verifica** que:
   - El mensaje aparezca en https://ainside.me/admin/messages
   - Recibas un email en jonathangolubok@gmail.com

3. **Revisa logs** (si necesario):
   ```sql
   SELECT * FROM net._http_response ORDER BY created DESC LIMIT 10;
   ```

## 📧 Formato del Email

El email que recibirás incluirá:
- **Nombre** del remitente
- **Email** del remitente (configurado como reply-to)
- **Organización** (si proporcionó)
- **Asunto** del mensaje
- **Mensaje** completo
- **Botón** para responder directamente
- **Botón** para ver en el panel admin

## 🔍 Troubleshooting

### Si no recibes emails:

1. **Verifica que RESEND_API_KEY esté configurado** en las Edge Functions:
   https://supabase.com/dashboard/project/odlxhgatqyodxdessxts/settings/functions

2. **Revisa los logs de la Edge Function**:
   https://supabase.com/dashboard/project/odlxhgatqyodxdessxts/functions/notify-new-message/logs

3. **Verifica que el trigger esté activo**:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_contact_message_created';
   ```

4. **Prueba la función manualmente**:
   ```sql
   INSERT INTO contact_messages (name, email, subject, message)
   VALUES ('Test User', 'test@example.com', 'Test Subject', 'Test message');
   ```

## 📝 Notas Técnicas

- **Trigger**: Se ejecuta DESPUÉS de cada INSERT en `contact_messages`
- **Async**: La notificación se envía de forma asíncrona (no bloquea el insert)
- **Error handling**: Si falla el envío del email, el mensaje se guarda igual
- **pg_net**: Usa la extensión nativa de Postgres para hacer HTTP requests
- **Security**: La función usa SECURITY DEFINER con permisos de service_role

## 🎨 Personalización

Si deseas cambiar:
- **Email de destino**: Edita línea 224 de `notify-new-message/index.ts`
- **Diseño del email**: Edita el HTML en la función `sendAdminNotification()`
- **Condiciones del trigger**: Modifica la migración SQL

---

**Estado**: ✅ Edge Function desplegada | ⏳ Migración pendiente de aplicar
**Próximo paso**: Aplicar la migración SQL en Supabase Dashboard
