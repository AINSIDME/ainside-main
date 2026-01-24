-- Add missing columns to admin_access_logs table
ALTER TABLE admin_access_logs 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '{}'::jsonb;

-- Create index for user_id
CREATE INDEX IF NOT EXISTS idx_admin_logs_user_id ON admin_access_logs(user_id);

-- Update RLS policy to allow admins to read their logs
DROP POLICY IF EXISTS "Admins can view logs" ON admin_access_logs;
CREATE POLICY "Admins can view logs"
  ON admin_access_logs
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'jonathangolubok@gmail.com'
  );
