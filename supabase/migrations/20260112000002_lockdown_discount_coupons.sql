-- Lock down discount_coupons so browser clients cannot manage coupons.
-- All admin operations should go through Edge Functions with service role + admin 2FA.

ALTER TABLE public.discount_coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can view all coupons" ON public.discount_coupons;
DROP POLICY IF EXISTS "Admin can create coupons" ON public.discount_coupons;
DROP POLICY IF EXISTS "Admin can update coupons" ON public.discount_coupons;
DROP POLICY IF EXISTS "Admin can delete coupons" ON public.discount_coupons;

-- Optional explicit policy for service_role (service role typically bypasses RLS anyway).
DROP POLICY IF EXISTS "Service role can manage coupons" ON public.discount_coupons;
CREATE POLICY "Service role can manage coupons"
ON public.discount_coupons
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
