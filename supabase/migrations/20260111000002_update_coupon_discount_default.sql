-- Actualizar el descuento por defecto de cupones de 30% a 50%
ALTER TABLE public.discount_coupons ALTER COLUMN discount_percent SET DEFAULT 50;

-- Comentario
COMMENT ON COLUMN public.discount_coupons.discount_percent IS 'Porcentaje de descuento del cupón (por defecto 50%)';
