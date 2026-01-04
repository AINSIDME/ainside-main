# GUÍA RÁPIDA - Configuración del Sistema de Descargas Seguras

## ✅ ARCHIVOS CREADOS

Los siguientes archivos están listos en la carpeta `temp-products`:

```
temp-products/
├── micro-sp500/
│   ├── micro-sp500-plan.pdf
│   └── micro-sp500-files.zip
├── micro-gold/
│   ├── micro-gold-plan.pdf
│   └── micro-gold-files.zip
├── mini-sp500/
│   ├── mini-sp500-plan.pdf
│   └── mini-sp500-files.zip
└── mini-gold/
    ├── mini-gold-plan.pdf
    └── mini-gold-files.zip
```

## 📝 PASOS PARA COMPLETAR LA CONFIGURACIÓN

### Paso 1: Crear registros en la base de datos

1. Ve a: https://supabase.com/dashboard/project/odlxhgatqyodxdessxts/sql/new
2. Copia y pega el contenido del archivo: `setup-test-database.sql`
3. Click en "RUN" para ejecutar el SQL
4. Deberías ver 4 registros creados (TEST-001, TEST-002, TEST-003, TEST-004)

### Paso 2: Subir archivos a Supabase Storage

1. Ve a: https://supabase.com/dashboard/project/odlxhgatqyodxdessxts/storage/buckets/products

2. Para cada plan, crea la carpeta y sube los archivos:

   **micro-sp500:**
   - Click "New folder" → nombre: `micro-sp500`
   - Entra a la carpeta `micro-sp500`
   - Click "Upload file" → selecciona `temp-products\micro-sp500\micro-sp500-plan.pdf`
   - Click "Upload file" → selecciona `temp-products\micro-sp500\micro-sp500-files.zip`

   **micro-gold:**
   - Click "New folder" → nombre: `micro-gold`
   - Entra a la carpeta `micro-gold`
   - Sube: `temp-products\micro-gold\micro-gold-plan.pdf`
   - Sube: `temp-products\micro-gold\micro-gold-files.zip`

   **mini-sp500:**
   - Click "New folder" → nombre: `mini-sp500`
   - Entra a la carpeta `mini-sp500`
   - Sube: `temp-products\mini-sp500\mini-sp500-plan.pdf`
   - Sube: `temp-products\mini-sp500\mini-sp500-files.zip`

   **mini-gold:**
   - Click "New folder" → nombre: `mini-gold`
   - Entra a la carpeta `mini-gold`
   - Sube: `temp-products\mini-gold\mini-gold-plan.pdf`
   - Sube: `temp-products\mini-gold\mini-gold-files.zip`

### Paso 3: Enviar emails de prueba

Ejecuta el script para enviar emails de prueba con los enlaces seguros:

```powershell
.\send-examples.ps1
```

Esto te enviará 8 emails (4 planes × 2 ciclos) a jonathangolubok@gmail.com

### Paso 4: Probar las descargas

1. Abre cualquiera de los emails recibidos
2. Click en los botones "Descargar Guia PDF" o "Descargar Archivos (ZIP)"
3. El sistema debería:
   - ✅ Verificar que el Order ID existe (TEST-001, TEST-002, etc.)
   - ✅ Generar una URL temporal firmada (válida 1 hora)
   - ✅ Descargar el archivo automáticamente

## 🔒 SEGURIDAD VERIFICADA

Intenta acceder directamente a:
```
https://ainside.me/downloads/micro-sp500/micro-sp500-plan.pdf
```

Deberías obtener un error 404 porque los archivos ya NO están en la carpeta pública.

Los archivos ahora solo son accesibles mediante:
```
https://ainside.me/download?order=TEST-001&plan=micro-sp500&file=plan
```

Y solo funcionan si el Order ID existe en la base de datos.

## ✅ CHECKLIST FINAL

- [ ] 4 registros TEST creados en la tabla `purchases`
- [ ] 8 archivos subidos a Supabase Storage (4 PDFs + 4 ZIPs)
- [ ] Emails de prueba enviados
- [ ] Enlaces de descarga funcionando
- [ ] Enlaces directos bloqueados (404)
- [ ] System probado exitosamente

## 🎉 ¡LISTO!

Una vez completados estos pasos, el sistema de descargas seguras estará 100% funcional.

Las compras reales a través de PayPal funcionarán automáticamente porque la función `capture-payment` ya:
1. Guarda cada compra en la tabla `purchases`
2. Envía el email con enlaces seguros
3. Los enlaces verifican la compra antes de permitir la descarga
