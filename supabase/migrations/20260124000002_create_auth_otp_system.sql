-- Migración: Sistema de autenticación con código OTP por email
-- Fecha: 2026-01-24

-- Tabla para almacenar códigos OTP temporales
CREATE TABLE IF NOT EXISTS public.auth_otp_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_auth_otp_email ON public.auth_otp_codes(email);
CREATE INDEX IF NOT EXISTS idx_auth_otp_code ON public.auth_otp_codes(code);
CREATE INDEX IF NOT EXISTS idx_auth_otp_expires ON public.auth_otp_codes(expires_at);

-- RLS: Solo el sistema puede leer/escribir
ALTER TABLE public.auth_otp_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Solo service_role puede acceder
CREATE POLICY "Service role full access"
ON public.auth_otp_codes
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Función para limpiar códigos expirados (ejecutar periódicamente)
CREATE OR REPLACE FUNCTION clean_expired_otp_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.auth_otp_codes
  WHERE expires_at < NOW() - INTERVAL '1 hour'
    OR (used = TRUE AND created_at < NOW() - INTERVAL '24 hours');
END;
$$;

-- Comentarios
COMMENT ON TABLE public.auth_otp_codes IS 'Códigos OTP temporales para autenticación sin contraseña por email';
COMMENT ON FUNCTION clean_expired_otp_codes IS 'Limpia códigos OTP expirados o usados hace más de 24 horas';
