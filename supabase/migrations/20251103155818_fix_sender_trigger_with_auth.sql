/*
  # Fix Sender trigger - Add authentication header

  1. Problem identified
    - Trigger calls Edge Function without authentication
    - Edge Function requires Authorization header with anon key
    - Call fails silently
  
  2. Solution
    - Add anon key to HTTP headers
    - Use Supabase service_role key for internal calls
    
  3. Security
    - Uses SECURITY DEFINER for elevated privileges
    - No RLS changes
*/

DROP FUNCTION IF EXISTS notify_sender_new_pdf_lead() CASCADE;

CREATE OR REPLACE FUNCTION notify_sender_new_pdf_lead()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_id bigint;
  payload jsonb;
  anon_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsZHZicXFnZWxpZnhrYnl5dGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc4NjE1NzAsImV4cCI6MjA0MzQzNzU3MH0.T3wTU9c-F8Qs-UWS-3pYvDkWHp-3sKMOvuN6aw_fiqk';
BEGIN
  -- Build payload
  payload := jsonb_build_object(
    'email', NEW.email,
    'firstname', COALESCE(NEW.prenom, ''),
    'lastname', COALESCE(NEW.nom, ''),
    'fields', jsonb_build_object(
      'source', COALESCE(NEW.source, 'Guide Comparatif PDF'),
      'date_telechargement', NEW.created_at::text
    )
  );

  -- Make authenticated HTTP call to Edge Function
  SELECT net.http_post(
    url := 'https://ygvsddcpohsnaowofuwc.supabase.co/functions/v1/sender-add-contact',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || anon_key
    ),
    body := payload
  ) INTO request_id;

  RAISE NOTICE 'Sender notification sent - request_id: %, email: %', request_id, NEW.email;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Sender call failed: % (email: %)', SQLERRM, NEW.email;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_pdf_lead_created_notify_sender
  AFTER INSERT ON leads_pdf_comparatif
  FOR EACH ROW
  EXECUTE FUNCTION notify_sender_new_pdf_lead();
