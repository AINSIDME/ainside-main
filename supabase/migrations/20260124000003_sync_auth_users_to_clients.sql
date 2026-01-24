-- Sincronizar usuarios de auth.users con la tabla clients automáticamente

-- Función que se ejecuta cuando se crea un nuevo usuario en Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insertar el nuevo usuario en la tabla clients si no existe
  INSERT INTO public.clients (
    id,
    email,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que se activa al crear un usuario en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- Migrar usuarios existentes de auth.users a clients
INSERT INTO public.clients (id, email, created_at, updated_at)
SELECT 
  id,
  email,
  created_at,
  NOW() as updated_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.clients)
ON CONFLICT (id) DO NOTHING;

-- Comentario de confirmación
COMMENT ON FUNCTION public.handle_new_auth_user() IS 'Sincroniza automáticamente usuarios de auth.users a clients';
