-- Create table for HWID registrations
CREATE TABLE IF NOT EXISTS hwid_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  hwid TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  
  CONSTRAINT unique_hwid UNIQUE (hwid),
  CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'transferred'))
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_hwid_order_id ON hwid_registrations(order_id);
CREATE INDEX IF NOT EXISTS idx_hwid_hwid ON hwid_registrations(hwid);
CREATE INDEX IF NOT EXISTS idx_hwid_email ON hwid_registrations(email);

-- Add RLS policies
ALTER TABLE hwid_registrations ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role full access
CREATE POLICY "Service role has full access"
  ON hwid_registrations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: Users can view their own registrations
CREATE POLICY "Users can view their own registrations"
  ON hwid_registrations
  FOR SELECT
  USING (auth.jwt() ->> 'email' = email);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_hwid_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_hwid_updated_at ON hwid_registrations;
CREATE TRIGGER set_hwid_updated_at
  BEFORE UPDATE ON hwid_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_hwid_updated_at();

-- Insert sample data (optional - remove in production)
-- INSERT INTO hwid_registrations (order_id, email, name, hwid, status)
-- VALUES (
--   'ORDER-20260104-TEST1',
--   'test@example.com',
--   'Test User',
--   '12345678-1234-1234-1234-123456789012',
--   'active'
-- );
