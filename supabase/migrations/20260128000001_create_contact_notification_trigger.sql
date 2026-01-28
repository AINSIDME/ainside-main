-- Enable pg_net extension if not already enabled
-- This extension is required to make HTTP calls from PostgreSQL triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create trigger to notify admin on new contact message
-- This will send an email notification to jonathangolubok@gmail.com whenever a new message arrives

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_contact_message_created ON contact_messages;
DROP FUNCTION IF EXISTS notify_admin_new_message();

-- Create function that calls the Edge Function
CREATE OR REPLACE FUNCTION notify_admin_new_message()
RETURNS TRIGGER AS $$
DECLARE
  supabase_url text;
  service_role_key text;
  request_id bigint;
BEGIN
  -- Get Supabase URL and service role key
  supabase_url := 'https://odlxhgatqyodxdessxts.supabase.co';
  
  -- Get service role key from app settings (set this via Supabase dashboard)
  BEGIN
    service_role_key := current_setting('app.service_role_key', true);
  EXCEPTION WHEN OTHERS THEN
    -- Fallback: use anon key for testing (less secure)
    service_role_key := current_setting('app.anon_key', true);
  END;

  -- Call the Edge Function asynchronously using pg_net extension
  SELECT net.http_post(
    url := supabase_url || '/functions/v1/notify-new-message',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'contact_messages',
      'schema', 'public',
      'record', row_to_json(NEW),
      'old_record', NULL
    )
  ) INTO request_id;
  
  -- Log the request (optional, for debugging)
  RAISE NOTICE 'Notification request sent with ID: %', request_id;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the insert
  RAISE WARNING 'Failed to send notification: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires after insert on contact_messages
CREATE TRIGGER on_contact_message_created
  AFTER INSERT ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_new_message();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION notify_admin_new_message() TO service_role;
GRANT EXECUTE ON FUNCTION notify_admin_new_message() TO authenticated;

-- Add comments for documentation
COMMENT ON TRIGGER on_contact_message_created ON contact_messages IS 
  'Automatically sends email notification to admin (jonathangolubok@gmail.com) when a new contact message is received';

COMMENT ON FUNCTION notify_admin_new_message() IS 
  'Calls the notify-new-message Edge Function to send admin notification email via pg_net HTTP POST';
