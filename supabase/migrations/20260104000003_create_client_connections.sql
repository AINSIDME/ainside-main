-- Create client_connections table for real-time monitoring
CREATE TABLE IF NOT EXISTS client_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hwid TEXT NOT NULL UNIQUE,
  plan_name TEXT DEFAULT 'Basic',
  strategies_active TEXT[] DEFAULT '{}',
  strategies_available TEXT[] DEFAULT '{"Scalping Pro", "Trend Following", "Mean Reversion", "Breakout Strategy", "Grid Trading"}',
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_client_connections_hwid ON client_connections(hwid);
CREATE INDEX IF NOT EXISTS idx_client_connections_last_seen ON client_connections(last_seen);

-- Enable RLS
ALTER TABLE client_connections ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role has full access" ON client_connections
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create function to update last_seen automatically
CREATE OR REPLACE FUNCTION update_client_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_client_connections_timestamp ON client_connections;
CREATE TRIGGER update_client_connections_timestamp
  BEFORE UPDATE ON client_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_client_last_seen();
