console.log('⚠️  EJECUTA ESTE SQL MANUALMENTE EN EL DASHBOARD DE SUPABASE:\n');
console.log('URL: https://supabase.com/dashboard/project/odlxhgatqyodxdessxts/sql/new\n');
console.log('--- COPIA Y PEGA ESTE SQL ---\n');

const sql = `
-- Permitir al admin ver cupones
DROP POLICY IF EXISTS "Admins can view coupons" ON public.discount_coupons;  
CREATE POLICY "Admins can view coupons"
ON public.discount_coupons
FOR SELECT
TO authenticated
USING (
  auth.email() IN ('jonathangolubok@gmail.com')
);

-- Permitir al admin crear cupones
DROP POLICY IF EXISTS "Admins can create coupons" ON public.discount_coupons;
CREATE POLICY "Admins can create coupons"
ON public.discount_coupons
FOR INSERT
TO authenticated
WITH CHECK (
  auth.email() IN ('jonathangolubok@gmail.com')
);

-- Permitir al admin modificar cupones
DROP POLICY IF EXISTS "Admins can update coupons" ON public.discount_coupons;
CREATE POLICY "Admins can update coupons"
ON public.discount_coupons
FOR UPDATE
TO authenticated
USING (
  auth.email() IN ('jonathangolubok@gmail.com')
)
WITH CHECK (
  auth.email() IN ('jonathangolubok@gmail.com')
);

-- Permitir al admin eliminar cupones
DROP POLICY IF EXISTS "Admins can delete coupons" ON public.discount_coupons;
CREATE POLICY "Admins can delete coupons"
ON public.discount_coupons
FOR DELETE
TO authenticated
USING (
  auth.email() IN ('jonathangolubok@gmail.com')
);
`;

console.log(sql);
console.log('\n--- FIN DEL SQL ---\n');
console.log('Esto te permitirá crear, ver, modificar y eliminar cupones sin necesitar 2FA.\n');
