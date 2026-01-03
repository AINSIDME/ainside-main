# Contact Form Setup - AIinside.me

## 📋 Overview
Sistema profesional de formulario de contacto con:
- ✅ Mensajes guardados en Supabase
- ✅ Notificaciones por email
- ✅ Panel de administración en Supabase
- ✅ Validación de datos
- ✅ Estado de carga

## 🚀 Deployment

### 1. Desplegar infraestructura:
```powershell
.\deploy-contact.ps1
```

Esto creará:
- Tabla `contact_messages` en Supabase
- Edge Function `send-contact-email`
- Políticas de seguridad (RLS)

### 2. Configurar servicio de email (OPCIONAL):

#### Opción A: Resend (Recomendado)
```powershell
# 1. Crear cuenta en https://resend.com (gratis: 100 emails/día)
# 2. Obtener API key
# 3. Configurar secret:
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxx
```

#### Opción B: SendGrid
```powershell
# 1. Crear cuenta en https://sendgrid.com (gratis: 100 emails/día)
# 2. Obtener API key
# 3. Configurar secret:
supabase secrets set SENDGRID_API_KEY=SG.xxxxxxxxxx
```

**Nota:** Los mensajes se guardan en la base de datos incluso sin configurar email.

## 📊 Ver Mensajes

### Dashboard de Supabase:
1. Ve a https://supabase.com
2. Selecciona tu proyecto
3. Ve a `Table Editor`
4. Busca la tabla `contact_messages`

### Campos de la tabla:
- `id`: UUID único
- `name`: Nombre del contacto
- `email`: Email del contacto
- `organization`: Organización (opcional)
- `subject`: Asunto del mensaje
- `message`: Contenido del mensaje
- `created_at`: Fecha de creación
- `read`: Marcado como leído (boolean)
- `replied`: Marcado como respondido (boolean)

## 🔒 Seguridad

### Row Level Security (RLS):
- ✅ **Inserción pública**: Cualquiera puede enviar mensajes desde el formulario
- ✅ **Lectura autenticada**: Solo usuarios autenticados pueden ver mensajes
- ✅ **Actualización autenticada**: Solo usuarios autenticados pueden marcar como leído/respondido

### CORS:
- Configurado para aceptar requests desde cualquier origen
- En producción, considera restringir a tu dominio específico

## 📧 Emails Recibidos

Los emails llegarán a: **inquiries@ainside.me**

Formato del email:
```
Asunto: Contact Form: [Subject del usuario]

De: [Nombre] ([Email])
Organización: [Si proporcionó]

Mensaje:
[Contenido del mensaje]
```

## 🧪 Testing

### Test local:
```powershell
# Iniciar dev server
npm run dev

# Ir a http://localhost:8080/contact
# Llenar y enviar formulario
```

### Test en producción:
```
https://ainside.me/contact
```

### Verificar logs:
```powershell
supabase functions logs send-contact-email
```

## 🐛 Troubleshooting

### "Failed to send message"
- Verifica que la Edge Function esté desplegada: `supabase functions list`
- Revisa los logs: `supabase functions logs send-contact-email`
- Confirma que el proyecto no esté pausado en Supabase

### Emails no llegan
- Verifica que configuraste `RESEND_API_KEY` o `SENDGRID_API_KEY`
- Revisa los logs de la función
- Los mensajes SÍ se guardan en la base de datos aunque el email falle

### Error de permisos
- Verifica que RLS esté habilitado
- Confirma que las políticas se crearon correctamente
- Revisa la configuración de anon key

## 📚 Archivos Importantes

```
supabase/
├── functions/
│   └── send-contact-email/
│       └── index.ts              # Edge Function para procesar mensajes
├── migrations/
│   └── create_contact_messages.sql  # Migración de base de datos

src/
└── pages/
    └── Contact.tsx               # Componente del formulario

deploy-contact.ps1                 # Script de despliegue
```

## 💡 Mejoras Futuras

- [ ] Dashboard de administración en la web
- [ ] Auto-responder al usuario
- [ ] Integración con CRM
- [ ] Filtros anti-spam
- [ ] Notificaciones en tiempo real
- [ ] Estadísticas de mensajes

## 📞 Soporte

Si tienes problemas, revisa:
1. Logs de Supabase
2. Console del navegador (F12)
3. Estado del proyecto en Supabase dashboard
