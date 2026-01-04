-- Crear tabla para logs de acceso al panel de administración
CREATE TABLE IF NOT EXISTS admin_access_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_admin_logs_email ON admin_access_logs(admin_email);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON admin_access_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_access_logs(action);

-- Habilitar Row Level Security
ALTER TABLE admin_access_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Solo service role puede insertar logs
DROP POLICY IF EXISTS "Service role can insert logs" ON admin_access_logs;
CREATE POLICY "Service role can insert logs"
  ON admin_access_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Solo service role puede leer logs
DROP POLICY IF EXISTS "Service role can read logs" ON admin_access_logs;
CREATE POLICY "Service role can read logs"
  ON admin_access_logs
  FOR SELECT
  TO service_role
  USING (true);

-- Comentarios para documentación
COMMENT ON TABLE admin_access_logs IS 'Registro de todos los intentos de acceso al panel de administración con verificación 2FA';
COMMENT ON COLUMN admin_access_logs.admin_email IS 'Email del administrador que intenta acceder';
COMMENT ON COLUMN admin_access_logs.action IS 'Tipo de acción: 2fa_verification_success, 2fa_verification_failed, etc.';
COMMENT ON COLUMN admin_access_logs.ip_address IS 'Dirección IP desde donde se realizó el intento';
COMMENT ON COLUMN admin_access_logs.user_agent IS 'User agent del navegador';
COMMENT ON COLUMN admin_access_logs.created_at IS 'Fecha y hora del evento';
