-- Fix: ensure client_connections exists in production.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.client_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hwid text NOT NULL UNIQUE,
  plan_name text DEFAULT 'Basic',
  strategies_active text[] DEFAULT '{}',
  strategies_available text[] DEFAULT '{"Scalping Pro", "Trend Following", "Mean Reversion", "Breakout Strategy", "Grid Trading"}',
  last_seen timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_connections_hwid ON public.client_connections(hwid);
CREATE INDEX IF NOT EXISTS idx_client_connections_last_seen ON public.client_connections(last_seen);

ALTER TABLE public.client_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role has full access" ON public.client_connections;
CREATE POLICY "Service role has full access" ON public.client_connections
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.update_client_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_client_connections_timestamp ON public.client_connections;
CREATE TRIGGER update_client_connections_timestamp
  BEFORE UPDATE ON public.client_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_client_last_seen();

-- Force PostgREST to reload schema cache.
DO $$
BEGIN
  PERFORM pg_notify('pgrst', 'reload schema');
END $$;
