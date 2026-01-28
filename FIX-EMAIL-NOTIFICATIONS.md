# 🔧 Configuración de RESEND_API_KEY para Notificaciones

## ⚠️ Problema Actual
Las notificaciones por email no llegan porque falta configurar el `RESEND_API_KEY` en Supabase.

## ✅ Solución - Configurar RESEND_API_KEY

### Paso 1: Obtener tu API Key de Resend

1. Ve a: https://resend.com/api-keys
2. Copia tu API Key (empieza con `re_...`)

### Paso 2: Configurar en Supabase

1. Ve a: https://supabase.com/dashboard/project/odlxhgatqyodxdessxts/settings/functions
2. En la sección **"Environment variables"**
3. Agrega un nuevo secreto:
   - **Name**: `RESEND_API_KEY`
   - **Value**: `re_tu_api_key_aqui`
4. Guarda

### Paso 3: Redesplegar las funciones

Después de configurar la variable, ejecuta:

```powershell
supabase functions deploy notify-new-message
supabase functions deploy send-contact-email
```

O desde el dashboard, en cada función haz clic en "Redeploy".

## 🧪 Probar que Funciona

1. Envía un mensaje de prueba desde: https://ainside.me/contact
2. Verifica tu email (jonathangolubok@gmail.com)
3. Verifica los logs: https://supabase.com/dashboard/project/odlxhgatqyodxdessxts/functions/notify-new-message/logs

## 🔍 Verificar Logs

Si después de configurar aún no funciona, revisa los logs:

### Logs de notify-new-message:
https://supabase.com/dashboard/project/odlxhgatqyodxdessxts/functions/notify-new-message/logs

### Logs de send-contact-email:
https://supabase.com/dashboard/project/odlxhgatqyodxdessxts/functions/send-contact-email/logs

## 🆘 Solución Alternativa (Si no tienes Resend)

Si no tienes cuenta de Resend, puedes usar SendGrid o Gmail SMTP. Edita la función para usar otro servicio:

### Opción 1: Crear cuenta gratuita de Resend
- https://resend.com/signup
- Plan gratuito: 3,000 emails/mes
- Muy fácil de configurar

### Opción 2: Usar SendGrid
- Configura `SENDGRID_API_KEY` en vez de `RESEND_API_KEY`
- La función ya tiene soporte para SendGrid

## 📧 Verificar que Resend esté configurado correctamente

Si tienes Resend, asegúrate de:
1. ✅ Verificar tu dominio en Resend
2. ✅ Configurar SPF/DKIM records
3. ✅ Email "from" debe ser de tu dominio verificado

---

**Próximo paso**: Configurar RESEND_API_KEY en Supabase Environment Variables
