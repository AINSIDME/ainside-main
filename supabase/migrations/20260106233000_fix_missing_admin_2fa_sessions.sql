-- Fix: ensure admin_2fa_sessions exists in production.
-- Some environments may have migration history marked applied while the table is missing.

CREATE TABLE IF NOT EXISTS public.admin_2fa_sessions (
  token text PRIMARY KEY,
  user_id uuid NOT NULL,
  admin_email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  revoked boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS admin_2fa_sessions_user_id_idx ON public.admin_2fa_sessions (user_id);
CREATE INDEX IF NOT EXISTS admin_2fa_sessions_expires_at_idx ON public.admin_2fa_sessions (expires_at);

ALTER TABLE public.admin_2fa_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can insert 2FA sessions" ON public.admin_2fa_sessions;
CREATE POLICY "Service role can insert 2FA sessions"
  ON public.admin_2fa_sessions
  FOR INSERT
  TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can read 2FA sessions" ON public.admin_2fa_sessions;
CREATE POLICY "Service role can read 2FA sessions"
  ON public.admin_2fa_sessions
  FOR SELECT
  TO service_role
  USING (true);

DROP POLICY IF EXISTS "Service role can update 2FA sessions" ON public.admin_2fa_sessions;
CREATE POLICY "Service role can update 2FA sessions"
  ON public.admin_2fa_sessions
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can delete 2FA sessions" ON public.admin_2fa_sessions;
CREATE POLICY "Service role can delete 2FA sessions"
  ON public.admin_2fa_sessions
  FOR DELETE
  TO service_role
  USING (true);

COMMENT ON TABLE public.admin_2fa_sessions IS 'Server-issued admin 2FA session tokens used by Edge Functions to authorize admin actions.';
