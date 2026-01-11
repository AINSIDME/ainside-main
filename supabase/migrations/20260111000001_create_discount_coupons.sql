-- Tabla para cupones de descuento
CREATE TABLE IF NOT EXISTS public.discount_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_percent INTEGER NOT NULL DEFAULT 50, -- 50% de descuento
  duration_months INTEGER NOT NULL DEFAULT 12, -- Válido por 12 meses
  max_uses INTEGER NOT NULL DEFAULT 1, -- Número máximo de usos (1 = uso único)
  current_uses INTEGER NOT NULL DEFAULT 0, -- Contador de usos actuales
  is_active BOOLEAN NOT NULL DEFAULT true, -- Si el cupón está activo
  created_by UUID REFERENCES auth.users(id), -- Admin que creó el cupón
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ, -- Fecha de expiración opcional
  notes TEXT -- Notas del admin sobre el cupón
);

-- Agregar campo coupon_code a la tabla purchases
ALTER TABLE public.purchases 
ADD COLUMN IF NOT EXISTS coupon_code TEXT,
ADD COLUMN IF NOT EXISTS coupon_discount_percent INTEGER,
ADD COLUMN IF NOT EXISTS coupon_duration_months INTEGER,
ADD COLUMN IF NOT EXISTS coupon_applied_at TIMESTAMPTZ;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_discount_coupons_code ON public.discount_coupons(code);
CREATE INDEX IF NOT EXISTS idx_discount_coupons_active ON public.discount_coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_purchases_coupon_code ON public.purchases(coupon_code);

-- RLS Policies
ALTER TABLE public.discount_coupons ENABLE ROW LEVEL SECURITY;

-- Solo el admin específico puede ver todos los cupones
CREATE POLICY "Admin can view all coupons"
ON public.discount_coupons
FOR SELECT
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'jonathangolubok@gmail.com'
);

-- Solo el admin puede crear cupones
CREATE POLICY "Admin can create coupons"
ON public.discount_coupons
FOR INSERT
TO authenticated
WITH CHECK (
  auth.jwt() ->> 'email' = 'jonathangolubok@gmail.com'
);

-- Solo el admin puede actualizar cupones
CREATE POLICY "Admin can update coupons"
ON public.discount_coupons
FOR UPDATE
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'jonathangolubok@gmail.com'
);

-- Solo el admin puede eliminar cupones
CREATE POLICY "Admin can delete coupons"
ON public.discount_coupons
FOR DELETE
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'jonathangolubok@gmail.com'
);

-- Función para validar y aplicar un cupón
CREATE OR REPLACE FUNCTION public.validate_coupon(coupon_code_input TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  coupon_record RECORD;
  result JSON;
BEGIN
  -- Buscar el cupón
  SELECT * INTO coupon_record
  FROM public.discount_coupons
  WHERE UPPER(code) = UPPER(coupon_code_input);

  -- Si no existe
  IF NOT FOUND THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'COUPON_NOT_FOUND',
      'message', 'Cupón no encontrado'
    );
  END IF;

  -- Verificar si está activo
  IF NOT coupon_record.is_active THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'COUPON_INACTIVE',
      'message', 'Cupón inactivo'
    );
  END IF;

  -- Verificar si ha expirado
  IF coupon_record.expires_at IS NOT NULL AND coupon_record.expires_at < NOW() THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'COUPON_EXPIRED',
      'message', 'Cupón expirado'
    );
  END IF;

  -- Verificar usos disponibles
  IF coupon_record.current_uses >= coupon_record.max_uses THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'COUPON_EXHAUSTED',
      'message', 'Cupón ya utilizado'
    );
  END IF;

  -- Cupón válido
  RETURN json_build_object(
    'valid', true,
    'code', coupon_record.code,
    'discount_percent', coupon_record.discount_percent,
    'duration_months', coupon_record.duration_months,
    'uses_remaining', coupon_record.max_uses - coupon_record.current_uses
  );
END;
$$;

-- Función para marcar un cupón como usado
CREATE OR REPLACE FUNCTION public.mark_coupon_as_used(coupon_code_input TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_rows INTEGER;
BEGIN
  -- Incrementar el contador de usos
  UPDATE public.discount_coupons
  SET 
    current_uses = current_uses + 1,
    is_active = CASE 
      WHEN current_uses + 1 >= max_uses THEN false 
      ELSE is_active 
    END
  WHERE UPPER(code) = UPPER(coupon_code_input)
    AND is_active = true
    AND current_uses < max_uses
    AND (expires_at IS NULL OR expires_at > NOW());
  
  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  
  RETURN updated_rows > 0;
END;
$$;

-- Grants para las funciones
GRANT EXECUTE ON FUNCTION public.validate_coupon(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mark_coupon_as_used(TEXT) TO authenticated;

-- Comentarios
COMMENT ON TABLE public.discount_coupons IS 'Sistema de cupones de descuento con uso único';
COMMENT ON FUNCTION public.validate_coupon(TEXT) IS 'Valida si un cupón es válido y retorna sus detalles';
COMMENT ON FUNCTION public.mark_coupon_as_used(TEXT) IS 'Marca un cupón como usado e incrementa el contador';
