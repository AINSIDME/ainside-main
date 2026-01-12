-- Device locks: bind a paid license seat to a specific PC (HWID)
-- The device secret is issued once, stored hashed, and only reissued by support.

CREATE TABLE IF NOT EXISTS public.device_locks (
  hwid TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  order_id TEXT NOT NULL,
  secret_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_device_locks_email ON public.device_locks(email);
CREATE INDEX IF NOT EXISTS idx_device_locks_order_id ON public.device_locks(order_id);

ALTER TABLE public.device_locks ENABLE ROW LEVEL SECURITY;

-- Only service role can read/write device locks
DO $$
BEGIN
  CREATE POLICY "Service role can manage device locks"
    ON public.device_locks
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Refresh PostgREST schema cache
DO $$
BEGIN
  PERFORM pg_notify('pgrst', 'reload schema');
EXCEPTION
  WHEN undefined_function THEN
    NULL;
END $$;
