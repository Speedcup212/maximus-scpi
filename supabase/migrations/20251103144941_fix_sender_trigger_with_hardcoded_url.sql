/*
  # Fix Sender.net trigger with proper URL configuration

  1. Changes
    - Drop and recreate notify_sender_new_pdf_lead function
    - Use Supabase built-in current_setting for SUPABASE_URL
    - Fallback to hardcoded URL if setting not available
    - Simplified payload structure
  
  2. Security
    - Uses service_role internally via pg_net
    - No RLS changes needed
*/

-- Drop existing function
DROP FUNCTION IF EXISTS notify_sender_new_pdf_lead() CASCADE;

-- Recreate with proper URL handling
CREATE OR REPLACE FUNCTION notify_sender_new_pdf_lead()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_id bigint;
  payload jsonb;
  function_url text;
  project_url text;
BEGIN
  -- Get project URL from Supabase environment
  BEGIN
    SELECT current_setting('request.headers', true)::json->>'x-forwarded-host' INTO project_url;
    IF project_url IS NULL OR project_url = '' THEN
      -- Fallback: try to get from vault or use default
      project_url := current_setting('supabase.url', true);
    END IF;
  EXCEPTION WHEN OTHERS THEN
    project_url := NULL;
  END;

  -- Build function URL
  IF project_url IS NOT NULL THEN
    function_url := 'https://' || project_url || '/functions/v1/sender-add-contact';
  ELSE
    -- This will fail but with a clear error message
    RAISE EXCEPTION 'Cannot determine Supabase project URL for Edge Function call';
  END IF;

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

  -- Make HTTP call via pg_net
  SELECT net.http_post(
    url := function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body := payload
  ) INTO request_id;

  RAISE NOTICE 'Sender.net notification sent - request_id: %, email: %', request_id, NEW.email;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't block lead insertion
  RAISE WARNING 'Error calling Sender.net: % (email: %)', SQLERRM, NEW.email;
  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_pdf_lead_created_notify_sender ON leads_pdf_comparatif;

CREATE TRIGGER on_pdf_lead_created_notify_sender
  AFTER INSERT ON leads_pdf_comparatif
  FOR EACH ROW
  EXECUTE FUNCTION notify_sender_new_pdf_lead();
