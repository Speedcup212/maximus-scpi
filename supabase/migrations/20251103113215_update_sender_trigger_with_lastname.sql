/*
  # Mise à jour du trigger Sender avec prénom + nom

  1. Modifications
    - Le trigger envoie maintenant `firstname` ET `lastname` séparément
    - Utilise `prenom` pour firstname et `nom` pour lastname
    - Permet une meilleure personnalisation dans Sender.net

  2. Logique
    - firstname = prenom (ou nom en fallback si prenom vide)
    - lastname = nom (ou chaîne vide si nom vide)
*/

-- Supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS notify_sender_new_pdf_lead() CASCADE;

-- Créer la nouvelle fonction avec support prénom + nom
CREATE OR REPLACE FUNCTION notify_sender_new_pdf_lead()
RETURNS TRIGGER AS $$
DECLARE
  request_id bigint;
  payload jsonb;
  function_url text;
  anon_key text;
BEGIN
  -- Construire l'URL de l'Edge Function
  function_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/sender-add-contact';
  anon_key := current_setting('app.settings.supabase_anon_key', true);

  -- Préparer le payload avec prénom et nom séparés
  payload := jsonb_build_object(
    'email', NEW.email,
    'firstname', COALESCE(NEW.prenom, NEW.nom, ''),
    'lastname', COALESCE(NEW.nom, ''),
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recréer le trigger
DROP TRIGGER IF EXISTS on_pdf_lead_created_notify_sender ON leads_pdf_comparatif;

CREATE TRIGGER on_pdf_lead_created_notify_sender
  AFTER INSERT ON leads_pdf_comparatif
  FOR EACH ROW
  EXECUTE FUNCTION notify_sender_new_pdf_lead();

COMMENT ON FUNCTION notify_sender_new_pdf_lead() IS 'Fonction qui envoie automatiquement les nouveaux leads du guide PDF à Sender.net avec prénom et nom séparés pour une meilleure personnalisation des emails';
