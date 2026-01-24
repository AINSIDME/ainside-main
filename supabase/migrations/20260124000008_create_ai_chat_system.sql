-- Create chat_conversations table
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  messages JSONB DEFAULT '[]'::jsonb,
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_rate_limits table
CREATE TABLE IF NOT EXISTS chat_rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL, -- IP address o session_id
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(identifier)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chat_conversations_session ON chat_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_created ON chat_conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_rate_limits_identifier ON chat_rate_limits(identifier);
CREATE INDEX IF NOT EXISTS idx_chat_rate_limits_blocked ON chat_rate_limits(blocked_until) WHERE blocked_until IS NOT NULL;

-- Enable RLS
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rate_limits ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything
DROP POLICY IF EXISTS "Service role full access to chat_conversations" ON chat_conversations;
CREATE POLICY "Service role full access to chat_conversations"
  ON chat_conversations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access to chat_rate_limits" ON chat_rate_limits;
CREATE POLICY "Service role full access to chat_rate_limits"
  ON chat_rate_limits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: Admins can view all
DROP POLICY IF EXISTS "Admins can view chat conversations" ON chat_conversations;
CREATE POLICY "Admins can view chat conversations"
  ON chat_conversations
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'jonathangolubok@gmail.com'
  );

-- Function to clean old rate limits (más de 24 horas)
CREATE OR REPLACE FUNCTION clean_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM chat_rate_limits
  WHERE created_at < NOW() - INTERVAL '24 hours'
    AND (blocked_until IS NULL OR blocked_until < NOW());
END;
$$;

-- Function to clean old conversations (más de 7 días)
CREATE OR REPLACE FUNCTION clean_old_conversations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM chat_conversations
  WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$;
