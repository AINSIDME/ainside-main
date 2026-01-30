# Configuración SMTP con Gmail para Supabase

## 🎯 Beneficios
- ✅ **500 emails/día gratis** (vs 2/hora con Supabase)
- ✅ Emails más confiables (mejor deliverability)
- ✅ Tu propio remitente personalizado

---

## 📋 PASO 1: Crear App Password en Gmail

### 1.1 Habilitar verificación en 2 pasos (si no la tienes)
1. Ve a: https://myaccount.google.com/security
2. En "Signing in to Google", click **"2-Step Verification"**
3. Sigue los pasos para habilitarla

### 1.2 Crear App Password
1. Ve a: https://myaccount.google.com/apppasswords
2. Si te pide login, ingresa tu cuenta de Gmail
3. En "Select app", elige **"Mail"**
4. En "Select device", elige **"Other (Custom name)"**
5. Escribe: `AInside Supabase`
6. Click **"Generate"**
7. **COPIA LA CONTRASEÑA DE 16 CARACTERES** (ej: `abcd efgh ijkl mnop`)
   - Elimina los espacios: `abcdefghijklmnop`
   - Guárdala temporalmente

---

## 📋 PASO 2: Configurar SMTP en Supabase

1. Ve a: https://supabase.com/dashboard/project/odlxhgatqyodxdessxts/settings/auth

2. Scroll hasta **"SMTP Settings"**

3. Click **"Enable Custom SMTP"**

4. Ingresa estos datos:

```
Sender email: tu-email@gmail.com
Sender name: AInside

Host: smtp.gmail.com
Port: 587

Username: tu-email@gmail.com
Password: [LA CONTRASEÑA DE 16 CARACTERES QUE COPIASTE]
```

5. Click **"Save"**

---

## 🧪 PASO 3: Probar

1. Ve a: https://ainside.me/login
2. Ingresa tu email
3. Click "Enviar código"
4. Revisa tu bandeja de entrada

**Deberías recibir el email en segundos** ✅

---

## ⚠️ Notas Importantes

- La App Password es diferente a tu contraseña de Gmail
- No compartas la App Password (como cualquier contraseña)
- Si cambias tu contraseña de Gmail, la App Password sigue funcionando
- Puedes revocar la App Password en cualquier momento desde: https://myaccount.google.com/apppasswords

---

## 🆘 Problemas Comunes

**"Invalid credentials"**
- Verifica que copiaste la App Password correctamente
- Asegúrate de eliminar los espacios
- Verifica que el username sea tu email completo

**"Authentication failed"**
- Verifica que la verificación en 2 pasos esté habilitada
- Espera 1 minuto después de crear la App Password

**Emails no llegan**
- Revisa spam/promociones
- Verifica que el "Sender email" sea correcto
