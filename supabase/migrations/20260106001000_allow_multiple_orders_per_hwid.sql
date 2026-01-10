-- Allow the same HWID to be registered for multiple purchases (different PayPal Order IDs)
-- while still keeping each order_id unique.

ALTER TABLE IF EXISTS public.hwid_registrations
  DROP CONSTRAINT IF EXISTS unique_hwid;

-- Keep existing index for lookups
-- (idx_hwid_hwid) remains useful.

-- Refresh PostgREST schema cache
DO $$
BEGIN
  PERFORM pg_notify('pgrst', 'reload schema');
EXCEPTION
  WHEN undefined_function THEN
    -- ignore in environments without PostgREST
    NULL;
END $$;
