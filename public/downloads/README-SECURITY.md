# Sistema de Descargas Seguras

## Descripción
Los archivos de productos ya NO están disponibles públicamente. Ahora usamos un sistema de descargas seguras con:

1. **Supabase Storage** - Almacenamiento privado (bucket `products`)
2. **Verificación de compra** - Los enlaces requieren un Order ID válido
3. **URLs firmadas temporales** - Expiran en 1 hora
4. **Tracking de descargas** - Registramos cuándo se descargan los archivos

## Estructura de archivos en Supabase Storage

```
products/ (bucket)
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

## Cómo funciona

1. **Compra exitosa**: 
   - PayPal procesa el pago
   - Se guarda en tabla `purchases` (order_id, email, plan_type, etc.)
   - Se envía email con enlaces especiales

2. **Enlaces en el email**:
   ```
   https://ainside.me/download?order=XXX&plan=micro-sp500&file=plan
   https://ainside.me/download?order=XXX&plan=micro-sp500&file=files
   ```

3. **Al hacer clic**:
   - Verifica que el order_id existe en la base de datos
   - Verifica que el plan_type coincide
   - Genera URL firmada temporal (1 hora de validez)
   - Registra la descarga en `last_download_at`
   - Redirige automáticamente a la descarga

## Configuración necesaria

### 1. Crear bucket en Supabase
```sql
-- Ya incluido en migration
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', false);
```

### 2. Subir archivos a Supabase Storage
Desde el Dashboard de Supabase:
- Ve a Storage > products
- Crea carpetas: micro-sp500, micro-gold, mini-sp500, mini-gold
- Sube los archivos PDF y ZIP a cada carpeta

### 3. Desplegar funciones
```bash
supabase functions deploy capture-payment
supabase functions deploy download
```

### 4. Aplicar migración
```bash
supabase db push
```

## Ventajas de seguridad

✅ Los archivos NO son accesibles directamente por URL
✅ Requiere Order ID válido de una compra real
✅ Los enlaces expiran en 1 hora
✅ Se registra quién y cuándo descarga
✅ Se puede revocar acceso borrando el registro de compra
✅ Protección contra compartir enlaces

## Para testing

Los Order IDs que empiezan con `TEST-` también funcionan durante desarrollo.
