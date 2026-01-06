/*
  # Activation de pg_net et Configuration des Triggers Email

  1. Extensions
    - Active l'extension `pg_net` pour les appels HTTP asynchrones

  2. Fonction de Notification
    - Fonction PostgreSQL qui appelle l'Edge Function via pg_net
    - Envoi d'email automatique à maximusscpi@gmail.com

  3. Triggers
    - Trigger sur `leads` : notification automatique
    - Trigger sur `crm_leads` : notification automatique
    - Trigger sur `google_ads_comete_leads` : notification automatique

  4. Sécurité
    - Exécution asynchrone (pas de blocage des insertions)
    - Gestion des erreurs sans interrompre le processus
*/

-- Activer l'extension pg_net si pas encore activée
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Fonction qui envoie la notification email via Edge Function
CREATE OR REPLACE FUNCTION notify_new_lead()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  lead_payload jsonb;
  request_id bigint;
BEGIN
  -- Construire le payload JSON
  lead_payload := jsonb_build_object(
    'nom', COALESCE(NEW.nom, ''),
    'prenom', COALESCE(NEW.prenom, ''),
    'email', NEW.email,
    'telephone', COALESCE(NEW.telephone, ''),
    'montant', COALESCE(NEW.montant, NEW.montant_investissement::text, ''),
    'commentaire', COALESCE(NEW.commentaire, NEW.message, ''),
    'creneau', NEW.creneau,
    'profil_risque', NEW.profil_risque,
    'profil_esg', NEW.profil_esg,
    'horizon', COALESCE(NEW.horizon, NEW.horizon_placement, ''),
    'objectifs', COALESCE(NEW.objectifs, NEW.objectif_investissement, ''),
    'tmi', NEW.tmi,
    'source', COALESCE(NEW.source, 'Web')
  );

  -- Appel HTTP asynchrone via pg_net
  -- Note: L'URL sera complétée avec le bon domaine Supabase automatiquement
  BEGIN
    SELECT INTO request_id
      net.http_post(
        url := 'https://' || current_setting('app.settings.project_ref', true) || '.supabase.co/functions/v1/send-lead-notification',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
        ),
        body := lead_payload
      );
    
    RAISE LOG 'Email notification request queued with ID: %', request_id;
  EXCEPTION
    WHEN OTHERS THEN
      -- Log l'erreur mais ne bloque pas l'insertion
      RAISE WARNING 'Failed to queue email notification: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- Supprimer les anciens triggers s'ils existent
DROP TRIGGER IF EXISTS trigger_notify_new_lead ON leads;
DROP TRIGGER IF EXISTS trigger_notify_new_crm_lead ON crm_leads;
DROP TRIGGER IF EXISTS trigger_notify_new_google_ads_lead ON google_ads_comete_leads;

-- Créer les triggers pour chaque table
CREATE TRIGGER trigger_notify_new_lead
  AFTER INSERT ON leads
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_lead();

CREATE TRIGGER trigger_notify_new_crm_lead
  AFTER INSERT ON crm_leads
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_lead();

CREATE TRIGGER trigger_notify_new_google_ads_lead
  AFTER INSERT ON google_ads_comete_leads
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_lead();

-- Documentation
COMMENT ON FUNCTION notify_new_lead() IS 'Envoie automatiquement un email à maximusscpi@gmail.com pour chaque nouveau lead via Edge Function send-lead-notification';
COMMENT ON TRIGGER trigger_notify_new_lead ON leads IS 'Notification email automatique pour nouveaux leads (table leads)';
COMMENT ON TRIGGER trigger_notify_new_crm_lead ON crm_leads IS 'Notification email automatique pour nouveaux leads (table crm_leads)';
COMMENT ON TRIGGER trigger_notify_new_google_ads_lead ON google_ads_comete_leads IS 'Notification email automatique pour nouveaux leads Google Ads';