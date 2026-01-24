-- Migración para permitir acceso completo de admins a todas las tablas necesarias
-- Fecha: 2026-01-24

-- ============================================================================
-- POLÍTICAS PARA hwid_registrations
-- ============================================================================

-- Eliminar políticas existentes que puedan estar causando problemas
DROP POLICY IF EXISTS "Admins can view all registrations" ON public.hwid_registrations;
DROP POLICY IF EXISTS "Admin full access to hwid_registrations" ON public.hwid_registrations;

-- Crear política para que admins vean TODOS los registros
CREATE POLICY "Admins can view all registrations"
ON public.hwid_registrations
FOR SELECT
TO authenticated
USING (
  -- Admin específico
  auth.jwt() ->> 'email' = 'jonathangolubok@gmail.com'
);

-- Política para que admins puedan modificar registros
CREATE POLICY "Admins can modify all registrations"
ON public.hwid_registrations
FOR ALL
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'jonathangolubok@gmail.com'
)
WITH CHECK (
  auth.jwt() ->> 'email' = 'jonathangolubok@gmail.com'
);

-- ============================================================================
-- POLÍTICAS PARA purchases
-- ============================================================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Admins can view all purchases" ON public.purchases;
DROP POLICY IF EXISTS "Admin full access to purchases" ON public.purchases;

-- Crear política para que admins vean TODAS las compras
CREATE POLICY "Admins can view all purchases"
ON public.purchases
FOR SELECT
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'jonathangolubok@gmail.com'
);

-- Política para que admins puedan modificar compras
CREATE POLICY "Admins can modify all purchases"
ON public.purchases
FOR ALL
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'jonathangolubok@gmail.com'
)
WITH CHECK (
  auth.jwt() ->> 'email' = 'jonathangolubok@gmail.com'
);

-- ============================================================================
-- POLÍTICAS PARA client_connections
-- ============================================================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Admins can view all connections" ON public.client_connections;
DROP POLICY IF EXISTS "Admin full access to connections" ON public.client_connections;

-- Crear política para que admins vean TODAS las conexiones
CREATE POLICY "Admins can view all connections"
ON public.client_connections
FOR SELECT
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'jonathangolubok@gmail.com'
);

-- Política para que admins puedan modificar conexiones
CREATE POLICY "Admins can modify all connections"
ON public.client_connections
FOR ALL
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'jonathangolubok@gmail.com'
)
WITH CHECK (
  auth.jwt() ->> 'email' = 'jonathangolubok@gmail.com'
);

-- ============================================================================
-- COMENTARIOS Y VERIFICACIÓN
-- ============================================================================

COMMENT ON POLICY "Admins can view all registrations" ON public.hwid_registrations IS 
'Permite a los administradores ver todos los registros de HWID sin restricciones RLS';

COMMENT ON POLICY "Admins can view all purchases" ON public.purchases IS 
'Permite a los administradores ver todas las compras sin restricciones RLS';

COMMENT ON POLICY "Admins can view all connections" ON public.client_connections IS 
'Permite a los administradores ver todas las conexiones de clientes sin restricciones RLS';

-- Mostrar todas las políticas activas
DO $$
BEGIN
  RAISE NOTICE 'Políticas RLS actualizadas exitosamente para acceso de administradores';
END $$;
