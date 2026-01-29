-- Permitir a admins específicos leer cupones directamente
-- Solo para VISUALIZACIÓN - crear/editar/eliminar sigue requiriendo edge function

DROP POLICY IF EXISTS "Admins can view coupons" ON public.discount_coupons;

CREATE POLICY "Admins can view coupons"
ON public.discount_coupons
FOR SELECT
TO authenticated
USING (
  (auth.jwt() ->> 'email')::text = 'jonathangolubok@gmail.com'
);
