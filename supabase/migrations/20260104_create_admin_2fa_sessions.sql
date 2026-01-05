-- Admin 2FA sessions used to authorize admin-only Edge Functions
-- NOTE: apply this in Supabase SQL Editor, then redeploy functions.

create table if not exists public.admin_2fa_sessions (
  token text primary key,
  user_id uuid not null,
  admin_email text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked boolean not null default false
);

create index if not exists admin_2fa_sessions_user_id_idx on public.admin_2fa_sessions (user_id);
create index if not exists admin_2fa_sessions_expires_at_idx on public.admin_2fa_sessions (expires_at);

-- Optional hardening: keep table private by default
alter table public.admin_2fa_sessions enable row level security;

-- Policy: allow only service_role to manage 2FA sessions
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
