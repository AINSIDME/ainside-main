-- Sync auth.users to hwid_registrations
-- This ensures OTP users appear in admin panel

-- First, insert missing users from auth.users to hwid_registrations
INSERT INTO hwid_registrations (
  order_id,
  email,
  name,
  hwid,
  status,
  notes,
  created_at
)
SELECT 
  'OTP-' || SUBSTRING(id::text, 1, 8) as order_id,
  COALESCE(email, 'unknown@example.com') as email,
  COALESCE(
    raw_user_meta_data->>'name',
    raw_user_meta_data->>'full_name',
    SPLIT_PART(email, '@', 1)
  ) as name,
  'HWID-' || SUBSTRING(id::text, 1, 12) as hwid,
  'active' as status,
  'Auto-synced from auth.users (OTP user)' as notes,
  created_at
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM hwid_registrations hr 
  WHERE hr.email = auth.users.email
)
AND email IS NOT NULL;

-- Create trigger function to sync new auth users to hwid_registrations
CREATE OR REPLACE FUNCTION sync_auth_user_to_hwid_registrations()
RETURNS TRIGGER AS $$
BEGIN
  -- Only insert if email doesn't already exist in hwid_registrations
  IF NOT EXISTS (SELECT 1 FROM hwid_registrations WHERE email = NEW.email) THEN
    INSERT INTO hwid_registrations (
      order_id,
      email,
      name,
      hwid,
      status,
      notes,
      created_at
    ) VALUES (
      'OTP-' || SUBSTRING(NEW.id::text, 1, 8),
      NEW.email,
      COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'full_name',
        SPLIT_PART(NEW.email, '@', 1)
      ),
      'HWID-' || SUBSTRING(NEW.id::text, 1, 12),
      'active',
      'Auto-synced from auth.users (OTP user)',
      NEW.created_at
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS on_auth_user_created_sync_hwid ON auth.users;
CREATE TRIGGER on_auth_user_created_sync_hwid
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_auth_user_to_hwid_registrations();

-- Grant necessary permissions to admin
DROP POLICY IF EXISTS "Admin can manage hwid_registrations" ON hwid_registrations;
CREATE POLICY "Admin can manage hwid_registrations"
  ON hwid_registrations
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'jonathangolubok@gmail.com'
  );

-- Verify the sync worked
DO $$
DECLARE
  auth_count INTEGER;
  hwid_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO auth_count FROM auth.users WHERE email IS NOT NULL;
  SELECT COUNT(*) INTO hwid_count FROM hwid_registrations;
  
  RAISE NOTICE 'Auth users with email: %', auth_count;
  RAISE NOTICE 'HWID registrations total: %', hwid_count;
  RAISE NOTICE 'Sync completed successfully!';
END $$;
