-- Revert auto-sync from auth.users to hwid_registrations
-- OTP users are for authentication only, NOT clients with purchases

-- Drop the trigger
DROP TRIGGER IF EXISTS on_auth_user_created_sync_hwid ON auth.users;

-- Drop the trigger function
DROP FUNCTION IF EXISTS sync_auth_user_to_hwid_registrations();

-- Delete fake OTP registrations (keep only real PayPal purchases)
DELETE FROM hwid_registrations
WHERE order_id LIKE 'OTP-%'
AND notes = 'Auto-synced from auth.users (OTP user)';

-- Verify cleanup
DO $$
DECLARE
  remaining_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO remaining_count FROM hwid_registrations;
  RAISE NOTICE 'Remaining hwid_registrations (real purchases only): %', remaining_count;
END $$;
