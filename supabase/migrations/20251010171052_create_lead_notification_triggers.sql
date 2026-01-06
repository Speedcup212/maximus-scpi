/*
  # Triggers de Notification Email pour Nouveaux Leads

  1. Fonctions
    - Fonction PostgreSQL `notify_new_lead()` qui appelle l'Edge Function `send-lead-notification`
    - Compatible avec toutes les tables de leads

  2. Triggers
    - Trigger sur table `leads` : envoi email automatique à chaque insertion
    - Trigger sur table `crm_leads` : envoi email automatique à chaque insertion
    - Trigger sur table `google_ads_comete_leads` : envoi email automatique à chaque insertion

  3. Configuration
    - Les emails sont envoyés à: maximusscpi@gmail.com
    - Service utilisé: Resend (via Edge Function)
    - Exécution asynchrone pour ne pas bloquer les insertions

  4. Sécurité
    - Les triggers utilisent l'invocation sécurisée des Edge Functions
    - Pas d'impact sur les performances des insertions (appel asynchrone)
*/

-- Fonction PostgreSQL qui appelle l'Edge Function pour envoyer un email
CREATE OR REPLACE FUNCTION notify_new_lead()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  lead_payload jsonb;
  function_url text;
  anon_key text;
BEGIN
  -- Préparer le payload JSON avec les données du lead
  lead_payload := jsonb_build_object(
    'nom', COALESCE(NEW.nom, NEW.prenom || ' ' || NEW.nom, ''),
    'email', NEW.email,
    'telephone', NEW.telephone,
    'montant', COALESCE(NEW.montant, NEW.montant_investissement::text, ''),
    'commentaire', COALESCE(NEW.commentaire, NEW.message, ''),
    'creneau', NEW.creneau,
    'profil_risque', NEW.profil_risque,
    'profil_esg', NEW.profil_esg,
    'scpi', COALESCE(NEW.scpi, NEW.scpi_interessees, '[]'),
    'portfolio_selection', NEW.portfolio_selection,
    'horizon', COALESCE(NEW.horizon, NEW.horizon_placement, ''),
    'objectifs', COALESCE(NEW.objectifs, NEW.objectif_investissement, ''),
    'tmi', NEW.tmi,
    'source', NEW.source
  );

  -- URL de l'Edge Function (sera remplacée automatiquement par Supabase)
  function_url := current_setting('app.settings.api_url', true) || '/functions/v1/send-lead-notification';
  anon_key := current_setting('app.settings.anon_key', true);

  -- Appel HTTP à l'Edge Function (asynchrone via pg_net si disponible)
  BEGIN
    PERFORM
      net.http_post(
        url := function_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || anon_key
        ),
        body := lead_payload
      );
  EXCEPTION
    WHEN OTHERS THEN
      -- Log l'erreur mais ne bloque pas l'insertion
      RAISE WARNING 'Failed to send lead notification: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- Trigger pour la table "leads"
DROP TRIGGER IF EXISTS trigger_notify_new_lead ON leads;
CREATE TRIGGER trigger_notify_new_lead
  AFTER INSERT ON leads
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_lead();

-- Trigger pour la table "crm_leads"
DROP TRIGGER IF EXISTS trigger_notify_new_crm_lead ON crm_leads;
CREATE TRIGGER trigger_notify_new_crm_lead
  AFTER INSERT ON crm_leads
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_lead();

-- Trigger pour la table "google_ads_comete_leads"
DROP TRIGGER IF EXISTS trigger_notify_new_google_ads_lead ON google_ads_comete_leads;
CREATE TRIGGER trigger_notify_new_google_ads_lead
  AFTER INSERT ON google_ads_comete_leads
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_lead();

-- Commentaires pour documentation
COMMENT ON FUNCTION notify_new_lead() IS 'Envoie un email de notification à maximusscpi@gmail.com pour chaque nouveau lead';
COMMENT ON TRIGGER trigger_notify_new_lead ON leads IS 'Notification email automatique pour nouveaux leads';
COMMENT ON TRIGGER trigger_notify_new_crm_lead ON crm_leads IS 'Notification email automatique pour nouveaux leads CRM';
COMMENT ON TRIGGER trigger_notify_new_google_ads_lead ON google_ads_comete_leads IS 'Notification email automatique pour nouveaux leads Google Ads';