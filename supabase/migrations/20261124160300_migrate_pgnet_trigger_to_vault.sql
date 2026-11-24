/*
  # Migration clés API — pg_net via Supabase Vault

  Remplace la clé `service_role` (JWT en dur provenant de l'ancien projet
  eldvbqqgelifxkybytip, aujourd'hui supprimé) par la clé secrète nommée
  `pgnet_webhooks`, lue depuis Supabase Vault, et porte l'authentification sur
  l'en-tête `apikey` (les nouvelles clés sb_secret_* ne sont pas des JWTs et ne
  peuvent pas être envoyées en `Authorization: Bearer ...`).

  Prérequis : créer le secret `pgnet_webhooks` dans Supabase Vault
  (Dashboard → Database → Vault → Secrets → Add a new secret).
  Aucune valeur de clé n'est stockée dans ce fichier.
*/

CREATE OR REPLACE FUNCTION public.notify_sender_new_pdf_lead()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  request_id bigint;
  payload jsonb;
  api_key text;
BEGIN
  -- Clé pg_net lue depuis Vault (jamais en dur dans le dépôt).
  SELECT decrypted_secret INTO api_key
    FROM vault.decrypted_secrets
   WHERE name = 'pgnet_webhooks'
   LIMIT 1;

  IF api_key IS NULL OR api_key = '' THEN
    RAISE WARNING 'pgnet_webhooks absent du Vault : notification sender ignorée';
    RETURN NEW;
  END IF;

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

  SELECT net.http_post(
    url := 'https://ygvsddcpohsnaowofuwc.supabase.co/functions/v1/sender-add-contact',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', api_key
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
