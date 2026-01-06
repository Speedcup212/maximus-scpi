/*
  # Fix Function Search Path Security Vulnerability

  1. Security Fix
    - Drop and recreate `notify_brevo_new_pdf_lead` function with immutable search_path
    - Set explicit `search_path = ''` to prevent role mutable search_path vulnerability
    - This prevents potential SQL injection attacks through search_path manipulation

  2. Changes
    - Function behavior remains identical
    - Only security configuration is updated
    - No data changes or structural modifications
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS public.notify_brevo_new_pdf_lead() CASCADE;

-- Recreate with secure search_path
CREATE OR REPLACE FUNCTION public.notify_brevo_new_pdf_lead()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  brevo_api_key text;
  brevo_url text := 'https://api.brevo.com/v3/contacts';
  request_body jsonb;
  http_response jsonb;
BEGIN
  -- Get API key from environment
  brevo_api_key := current_setting('app.brevo_api_key', true);
  
  IF brevo_api_key IS NULL OR brevo_api_key = '' THEN
    RAISE WARNING 'Brevo API key not configured';
    RETURN NEW;
  END IF;

  -- Build request body with all contact information
  request_body := jsonb_build_object(
    'email', NEW.email,
    'attributes', jsonb_build_object(
      'PRENOM', COALESCE(NEW.prenom, ''),
      'NOM', COALESCE(NEW.nom, ''),
      'CONSENT_NEWSLETTER', COALESCE(NEW.consent_newsletter, false),
      'CONSENT_PARTNER', COALESCE(NEW.consent_partner, false),
      'SOURCE', 'PDF_COMPARATIF'
    ),
    'listIds', jsonb_build_array(8),
    'updateEnabled', true
  );

  -- Make HTTP request to Brevo API using pg_net
  SELECT INTO http_response
    extensions.http_post(
      brevo_url,
      request_body::text,
      'application/json',
      jsonb_build_object(
        'api-key', brevo_api_key
      )::text
    );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error calling Brevo API: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS trigger_notify_brevo_pdf_lead ON public.leads_pdf_comparatif;

CREATE TRIGGER trigger_notify_brevo_pdf_lead
  AFTER INSERT ON public.leads_pdf_comparatif
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_brevo_new_pdf_lead();
