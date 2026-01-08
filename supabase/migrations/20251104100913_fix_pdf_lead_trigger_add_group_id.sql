/*
  # Fix PDF Lead Trigger - Add group_id

  1. Changes
    - Update the notify_sender_new_pdf_lead function to include group_id
    - Set group_id to 'LM_SCPI_SansFrais' for all PDF leads
    
  2. Purpose
    - Ensure PDF leads are added to the correct Sender.net group
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
  anon_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsZHZicXFnZWxpZnhrYnl5dGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc4NjE1NzAsImV4cCI6MjA0MzQzNzU3MH0.T3wTU9c-F8Qs-UWS-3pYvDkWHp-3sKMOvuN6aw_fiqk';
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

  -- Make authenticated HTTP call to Edge Function
  SELECT net.http_post(
    url := 'https://ygvsddcpohsnaowofuwc.supabase.co/functions/v1/sender-add-contact',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || anon_key
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
