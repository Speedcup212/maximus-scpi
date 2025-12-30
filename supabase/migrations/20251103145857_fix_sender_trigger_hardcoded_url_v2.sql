/*
  # Fix Sender trigger with hardcoded project URL

  1. Changes
    - Use hardcoded Supabase project URL (eldvbqqgelifxkbyytip.supabase.co)
    - Remove dynamic URL detection that was failing
    - Simplified error handling
  
  2. Security
    - Uses pg_net for async HTTP calls
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

  -- Make HTTP call to Edge Function (hardcoded URL)
  SELECT net.http_post(
    url := 'https://eldvbqqgelifxkbyytip.supabase.co/functions/v1/sender-add-contact',
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
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
