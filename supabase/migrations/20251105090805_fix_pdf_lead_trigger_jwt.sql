/*
  # Fix PDF Lead Trigger - Use Service Role Key
  
  1. Changes
    - Update trigger to use service_role key for authenticated backend calls
    - Ensure the edge function is called with proper authorization
    
  2. Security
    - Service role key allows backend-to-backend communication
*/

CREATE OR REPLACE FUNCTION public.notify_sender_new_pdf_lead()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  request_id bigint;
  payload jsonb;
  service_role_key text := current_setting('app.settings.service_role_key', true);
BEGIN
  -- Build payload with group_id
  payload := jsonb_build_object(
    'email', NEW.email,
    'firstname', COALESCE(NEW.prenom, ''),
    'lastname', COALESCE(NEW.nom, ''),
    'group_id', 'LM_SCPI_SansFrais',
    'fields', jsonb_build_object(
      'source', COALESCE(NEW.source, 'Guide Comparatif PDF'),
      'date_telechargement', NEW.created_at::text
    )
  );

  -- Make authenticated HTTP call to Edge Function with service role
  SELECT net.http_post(
    url := 'https://ygvsddcpohsnaowofuwc.supabase.co/functions/v1/sender-add-contact',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || COALESCE(
        service_role_key,
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsZHZicXFnZWxpZnhrYnl5dGlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNzg2MTU3MCwiZXhwIjoyMDQzNDM3NTcwfQ.YB0h_2vKOp0H4jQZ8lLCJxQFGm8jJXzMfEPyqGxE3dM'
      )
    ),
    body := payload
  ) INTO request_id;

  RAISE NOTICE 'Sender notification sent - request_id: %, email: %, group: LM_SCPI_SansFrais', request_id, NEW.email;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Sender call failed: % (email: %)', SQLERRM, NEW.email;
  RETURN NEW;
END;
$function$;
