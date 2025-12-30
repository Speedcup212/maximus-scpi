/*
  # Cr\u00e9ation du trigger pour Sender.net

  1. Fonction trigger
    - Fonction PL/pgSQL qui se d\u00e9clenche apr\u00e8s insertion dans leads_pdf_comparatif
    - Appelle l'Edge Function sender-add-contact via pg_net
    - Envoie l'email et le nom du lead \u00e0 Sender.net

  2. Trigger
    - Se d\u00e9clenche AFTER INSERT sur leads_pdf_comparatif
    - Ex\u00e9cute la fonction pour chaque nouveau lead

  3. S\u00e9curit\u00e9
    - Utilise pg_net pour les appels HTTP asynchrones
    - Gestion des erreurs avec journalisation
*/

-- Cr\u00e9er la fonction trigger qui appelle l'Edge Function Sender.net
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

  -- Pr\u00e9parer le payload avec les donn\u00e9es du lead
  payload := jsonb_build_object(
    'email', NEW.email,
    'firstname', COALESCE(NEW.nom, ''),
    'fields', jsonb_build_object(
      'source', 'Guide Comparatif PDF',
      'date_telechargement', NEW.created_at::text
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

-- Supprimer le trigger existant s'il existe
DROP TRIGGER IF EXISTS on_pdf_lead_created_notify_sender ON leads_pdf_comparatif;

-- Cr\u00e9er le trigger
CREATE TRIGGER on_pdf_lead_created_notify_sender
  AFTER INSERT ON leads_pdf_comparatif
  FOR EACH ROW
  EXECUTE FUNCTION notify_sender_new_pdf_lead();

-- Commentaire explicatif
COMMENT ON FUNCTION notify_sender_new_pdf_lead() IS 'Fonction qui envoie automatiquement les nouveaux leads du guide PDF \u00e0 Sender.net pour la s\u00e9quence d''emails automatique';
