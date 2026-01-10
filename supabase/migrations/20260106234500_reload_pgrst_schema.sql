-- Force PostgREST to reload schema cache.
-- This helps when new tables are created but the schema cache hasn't refreshed yet.

DO $$
BEGIN
  PERFORM pg_notify('pgrst', 'reload schema');
END $$;
