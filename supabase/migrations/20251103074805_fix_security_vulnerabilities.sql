/*
  # Correction des vulnérabilités de sécurité

  1. Sécurité des fonctions
    - Fixer le search_path de notify_sender_new_pdf_lead (SECURITY DEFINER)
    - Empêcher l'injection via search_path mutable

  2. Sécurité RLS
    - Corriger la politique leads_pdf_comparatif pour permettre INSERT anonyme
    - La politique actuelle bloque les insertions depuis le formulaire public

  3. Notes
    - Une fonction SECURITY DEFINER avec search_path mutable est vulnérable
    - Les formulaires publics nécessitent une politique anon INSERT
*/

-- 1. Recréer la fonction avec search_path fixe pour éviter les vulnérabilités
DROP FUNCTION IF EXISTS public.notify_sender_new_pdf_lead() CASCADE;

CREATE OR REPLACE FUNCTION public.notify_sender_new_pdf_lead()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- ← FIX: search_path fixe
AS $$
DECLARE
  request_id bigint;
  payload jsonb;
  function_url text;
  anon_key text;
BEGIN
  -- Construire l'URL de l'Edge Function
  function_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/sender-add-contact';
  anon_key := current_setting('app.settings.supabase_anon_key', true);

  -- Préparer le payload avec les données du lead
  payload := jsonb_build_object(
    'email', NEW.email,
    'firstname', COALESCE(NEW.prenom, NEW.nom, ''),
    'fields', jsonb_build_object(
      'prenom', COALESCE(NEW.prenom, ''),
      'nom', COALESCE(NEW.nom, ''),
      'source', COALESCE(NEW.source, 'Guide Comparatif PDF'),
      'date_telechargement', NEW.created_at::text,
      'consentement_date', NEW.consentement_date::text,
      'consentement_marketing', NEW.consentement_marketing::text
    )
  );

  -- Log pour debugging
  RAISE NOTICE 'Calling Sender.net Edge Function with payload: %', payload;

  -- Faire l'appel HTTP via pg_net
  SELECT net.http_post(
    url := function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || anon_key
    ),
    body := payload
  ) INTO request_id;

  RAISE NOTICE 'Sender.net notification sent with request_id: %', request_id;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log l'erreur mais ne bloque pas l'insertion du lead
  RAISE WARNING 'Error calling Sender.net Edge Function: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Recréer le trigger
DROP TRIGGER IF EXISTS on_lead_pdf_created ON leads_pdf_comparatif;

CREATE TRIGGER on_lead_pdf_created
  AFTER INSERT ON leads_pdf_comparatif
  FOR EACH ROW
  EXECUTE FUNCTION notify_sender_new_pdf_lead();

-- 2. Corriger les politiques RLS pour leads_pdf_comparatif
-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Service role can insert leads" ON leads_pdf_comparatif;
DROP POLICY IF EXISTS "Authenticated users can read all leads" ON leads_pdf_comparatif;

-- Permettre INSERT anonyme (pour le formulaire public)
CREATE POLICY "Allow anonymous form submissions"
  ON leads_pdf_comparatif
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Permettre lecture par utilisateurs authentifiés uniquement
CREATE POLICY "Authenticated users can read leads"
  ON leads_pdf_comparatif
  FOR SELECT
  TO authenticated
  USING (true);

-- Permettre mise à jour par utilisateurs authentifiés uniquement
CREATE POLICY "Authenticated users can update leads"
  ON leads_pdf_comparatif
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Permettre suppression par utilisateurs authentifiés uniquement
CREATE POLICY "Authenticated users can delete leads"
  ON leads_pdf_comparatif
  FOR DELETE
  TO authenticated
  USING (true);

-- 3. Ajouter un commentaire de sécurité
COMMENT ON FUNCTION public.notify_sender_new_pdf_lead() IS 
'Trigger function secured with fixed search_path to prevent injection attacks. 
Notifies Sender.net when a new PDF lead is created.';
