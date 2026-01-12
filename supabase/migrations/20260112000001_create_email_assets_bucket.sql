-- Create private storage bucket for email assets (token card hero image)
-- This bucket is intended to remain private. The Edge Function uses a signed URL.

INSERT INTO storage.buckets (id, name, public)
VALUES ('email-assets', 'email-assets', false)
ON CONFLICT (id)
DO UPDATE SET name = EXCLUDED.name, public = false;

-- Allow service_role to manage objects in this bucket (needed for signed URLs + uploads)
DROP POLICY IF EXISTS "Service role can manage email assets" ON storage.objects;
CREATE POLICY "Service role can manage email assets"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'email-assets');
