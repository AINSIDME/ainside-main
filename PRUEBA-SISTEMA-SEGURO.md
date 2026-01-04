# Guía de Prueba del Sistema de Descargas Seguras

## ✅ Lo que ya está listo:

1. **Email de prueba enviado** a jonathangolubok@gmail.com
   - ID: ad7f9d0d-f3e0-47e3-a0ec-0a175a067c15
   - Contiene enlaces seguros con formato: `https://ainside.me/download?order=TEST-001&plan=micro-sp500&file=plan`

2. **Funciones desplegadas:**
   - ✅ `capture-payment` - Guarda compras y envía emails
   - ✅ `download` - Verifica compras y genera URLs temporales
   - ✅ `create-test-purchase` - Crea registros de prueba

3. **Base de datos lista:**
   - ✅ Tabla `purchases` creada
   - ✅ Bucket `products` en Storage configurado (privado)

## 📋 Pasos para completar la prueba:

### 1. Crear registro de prueba en Supabase

Opción A - Desde el Dashboard Web:
```
1. Ve a: https://supabase.com/dashboard/project/odlxhgatqyodxdessxts/editor
2. Click en la tabla "purchases"
3. Click "Insert row"
4. Llena los campos:
   - order_id: TEST-001
   - email: jonathangolubok@gmail.com
   - plan_name: Contrato Micro - S&P 500 (MES) - Suscripcion Mensual
   - plan_type: micro-sp500
   - amount: 99.00
   - currency: USD
   - status: completed
5. Click "Save"
```

Opción B - Desde SQL Editor:
```sql
INSERT INTO purchases (order_id, email, plan_name, plan_type, amount, currency, status)
VALUES ('TEST-001', 'jonathangolubok@gmail.com', 'Contrato Micro - S&P 500 (MES) - Suscripcion Mensual', 'micro-sp500', '99.00', 'USD', 'completed');
```

### 2. Subir archivos de prueba a Supabase Storage

```
1. Ve a: https://supabase.com/dashboard/project/odlxhgatqyodxdessxts/storage/buckets/products
2. Crea carpeta: micro-sp500
3. Sube dentro de micro-sp500/:
   - micro-sp500-plan.pdf (cualquier PDF de prueba)
   - micro-sp500-files.zip (cualquier ZIP de prueba)
```

### 3. Probar los enlaces del email

```
1. Revisa tu email en jonathangolubok@gmail.com
2. Click en "Descargar Guia PDF"
   - Debería verificar el Order ID TEST-001
   - Generar URL temporal (válida 1 hora)
   - Descargar el archivo automáticamente
3. Click en "Descargar Archivos (ZIP)"
   - Mismo proceso
```

## 🔍 Qué verificar:

✅ Los enlaces NO muestran el archivo directamente  
✅ Verifican que existe el Order ID en la base de datos  
✅ Generan una URL firmada temporal de Supabase Storage  
✅ Redirigen automáticamente a la descarga  
✅ Si el Order ID no existe, muestran página de error  

## 🚨 Si algo falla:

**Error: "Download Not Found"**
- El registro TEST-001 no existe en la tabla purchases
- Verificar en: https://supabase.com/dashboard/project/odlxhgatqyodxdessxts/editor

**Error: "File Not Available"**
- Los archivos no están en Storage
- Verificar en: https://supabase.com/dashboard/project/odlxhgatqyodxdessxts/storage/buckets/products

**Enlaces no funcionan:**
- El redirect en _redirects podría no estar aplicado
- Vercel/Netlify necesita rebuild del sitio

## 📝 Diferencia con el sistema anterior:

**ANTES:**
```
https://ainside.me/downloads/micro-sp500/micro-sp500-plan.pdf
❌ Archivo público, cualquiera podía descargarlo
```

**AHORA:**
```
https://ainside.me/download?order=TEST-001&plan=micro-sp500&file=plan
  ↓ Verifica Order ID en base de datos
  ↓ Genera URL firmada temporal (1 hora)
https://odlxhgatqyodxdessxts.supabase.co/storage/v1/object/sign/products/micro-sp500/micro-sp500-plan.pdf?token=XXXXXXX
✅ Protegido, expira en 1 hora
```
