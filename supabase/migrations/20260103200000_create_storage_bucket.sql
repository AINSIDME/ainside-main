-- Create storage bucket for product files
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', false);

-- Create policy to allow service role to manage files
CREATE POLICY "Service role can manage product files"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'products');

-- Create table to track purchases and downloads
CREATE TABLE IF NOT EXISTS purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  plan_type TEXT NOT NULL,
  amount TEXT NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  last_download_at TIMESTAMP WITH TIME ZONE
);

-- Create index for faster lookups
CREATE INDEX idx_purchases_order_id ON purchases(order_id);
CREATE INDEX idx_purchases_email ON purchases(email);

-- Enable RLS
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything
CREATE POLICY "Service role can manage purchases"
ON purchases FOR ALL
TO service_role
USING (true);

-- Policy: Users can view their own purchases
CREATE POLICY "Users can view own purchases"
ON purchases FOR SELECT
TO authenticated
USING (auth.jwt()->>'email' = email);
