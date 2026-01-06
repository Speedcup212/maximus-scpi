/*
  # Correction de la fonction notify_new_lead

  1. Changements
    - Gestion dynamique des colonnes selon la table
    - Support de toutes les variations de colonnes entre tables
    - Meilleure gestion des erreurs

  2. Sécurité
    - Pas de blocage des insertions en cas d'erreur
    - Log des erreurs pour debug
*/

-- Fonction corrigée avec gestion des colonnes optionnelles
CREATE OR REPLACE FUNCTION notify_new_lead()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  lead_payload jsonb;
  request_id bigint;
  v_nom text;
  v_prenom text;
  v_email text;
  v_telephone text;
  v_montant text;
  v_commentaire text;
  v_source text;
BEGIN
  -- Extraire les valeurs de manière sécurisée
  BEGIN
    v_nom := (row_to_json(NEW)::jsonb->>'nom');
  EXCEPTION WHEN OTHERS THEN
    v_nom := '';
  END;

  BEGIN
    v_prenom := (row_to_json(NEW)::jsonb->>'prenom');
  EXCEPTION WHEN OTHERS THEN
    v_prenom := '';
  END;

  v_email := (row_to_json(NEW)::jsonb->>'email');

  BEGIN
    v_telephone := (row_to_json(NEW)::jsonb->>'telephone');
  EXCEPTION WHEN OTHERS THEN
    v_telephone := '';
  END;

  -- Montant : essayer plusieurs colonnes
  BEGIN
    v_montant := COALESCE(
      (row_to_json(NEW)::jsonb->>'montant'),
      (row_to_json(NEW)::jsonb->>'montant_investissement'),
      ''
    );
  EXCEPTION WHEN OTHERS THEN
    v_montant := '';
  END;

  -- Commentaire : essayer plusieurs colonnes
  BEGIN
    v_commentaire := COALESCE(
      (row_to_json(NEW)::jsonb->>'commentaire'),
      (row_to_json(NEW)::jsonb->>'message'),
      ''
    );
  EXCEPTION WHEN OTHERS THEN
    v_commentaire := '';
  END;

  BEGIN
    v_source := COALESCE((row_to_json(NEW)::jsonb->>'source'), 'Web');
  EXCEPTION WHEN OTHERS THEN
    v_source := 'Web';
  END;

  -- Construire le payload JSON
  lead_payload := jsonb_build_object(
    'nom', COALESCE(v_nom, ''),
    'prenom', COALESCE(v_prenom, ''),
    'email', v_email,
    'telephone', COALESCE(v_telephone, ''),
    'montant', COALESCE(v_montant, ''),
    'commentaire', COALESCE(v_commentaire, ''),
    'source', v_source
  );

  -- Appel HTTP asynchrone via pg_net
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
    
    RAISE LOG 'Email notification request queued with ID: %, payload: %', request_id, lead_payload;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Failed to queue email notification: %, payload was: %', SQLERRM, lead_payload;
  END;

  RETURN NEW;
END;
$$;

-- Les triggers restent inchangés
COMMENT ON FUNCTION notify_new_lead() IS 'Envoie automatiquement un email à maximusscpi@gmail.com pour chaque nouveau lead. Gère dynamiquement les différentes structures de tables.';