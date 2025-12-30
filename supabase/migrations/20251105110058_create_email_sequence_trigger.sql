/*
  # Create Email Sequence Trigger for New PDF Leads

  1. Changes
    - Create function to start email sequence when new lead is added to leads_pdf_comparatif
    - Create trigger to call this function automatically
    - Function will:
      - Insert new record in email_sequences table
      - Set initial sequence_step to 0 (welcome email)
      - Calculate next_email_at for immediate sending
      - Store lead metadata (name, email, etc.)

  2. Security
    - Function runs with SECURITY DEFINER to bypass RLS
    - Only triggers on INSERT to leads_pdf_comparatif table
*/

-- Create function to start email sequence
CREATE OR REPLACE FUNCTION start_email_sequence()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert new email sequence
  INSERT INTO email_sequences (
    lead_id,
    email,
    sequence_step,
    last_email_sent_at,
    next_email_at,
    status,
    metadata,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    0,
    NULL,
    now(), -- Send welcome email immediately
    'active',
    jsonb_build_object(
      'firstname', COALESCE(NEW.prenom, ''),
      'lastname', COALESCE(NEW.nom, ''),
      'prenom', COALESCE(NEW.prenom, ''),
      'nom', COALESCE(NEW.nom, ''),
      'consent_marketing', COALESCE(NEW.consent_marketing, false),
      'consent_data', COALESCE(NEW.consent_data, false)
    ),
    now(),
    now()
  );

  RETURN NEW;
END;
$$;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS trigger_start_email_sequence ON leads_pdf_comparatif;

-- Create trigger
CREATE TRIGGER trigger_start_email_sequence
  AFTER INSERT ON leads_pdf_comparatif
  FOR EACH ROW
  EXECUTE FUNCTION start_email_sequence();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON email_sequences TO service_role;
GRANT ALL ON leads_pdf_comparatif TO service_role;