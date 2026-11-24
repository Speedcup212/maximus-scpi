# Handoff — Bascule Supabase (ChatGPT exécute)

> Objet : exécution des étapes Supabase de la migration clés API (déploiement Edge Functions + migration Vault).
> Préparé par : DeepSeek (Cursor). Exécuté par : ChatGPT (accès Supabase en écriture).
> Date : 2026-11-24.

---

## 1. Références de commits validés

| Objet | Référence |
|---|---|
| PR #457 fusionnée (source de vérité du code backend) | `675ab1617e749d1d9418f6bb123185b974f2dd39` (`main`) |
| Commit de la branche de travail | `9fdec3a9a5975d892d892069ca25902b8d85ec91` |
| PR #458 (swap GitHub Actions / Netlify — NE PAS fusionner avant la fin) | branche `security/github-actions-netlify-key-swap`, commit `882e01b3930d62178626c255524ae6bfb5cea336` |
| Projet Supabase | `ygvsddcpohsnaowofuwc` (URL `https://ygvsddcpohsnaowofuwc.supabase.co`) |

Les fichiers à déployer ci-dessous correspondent **exactement** au contenu de `main` (`675ab161`).
Aucune autre modification de code n'est requise pour les étapes Supabase.

---

## 2. Déploiement des Edge Functions

### 2.1 Fonctions à déployer avec `--no-verify-jwt` (3 fonctions)

Ces 3 fonctions embarquent une garde `require*Key` avec `{ legacyJwt: false }` :
`verify_jwt` DOIT être désactivé et remplacé par la garde `apikey`.

| Fonction | Garde | Dépendance partagée |
|---|---|---|
| `send-lead-notification` | `requireApiKey` | `_shared/auth.ts` |
| `sender-add-contact` | `requireApiKey` | `_shared/auth.ts` |
| `scpi-scoring` | `requirePublishableKey` (lecture) / `requireSecretKey` (write) | `_shared/auth.ts`, `_shared/serviceKey.ts` |

Commandes (CLI Supabase) :

```bash
supabase functions deploy send-lead-notification --no-verify-jwt --project-ref ygvsddcpohsnaowofuwc
supabase functions deploy sender-add-contact    --no-verify-jwt --project-ref ygvsddcpohsnaowofuwc
supabase functions deploy scpi-scoring          --no-verify-jwt --project-ref ygvsddcpohsnaowofuwc
```

> Si tu passes par l'API de gestion, chaque déploiement doit positionner
> `verify_jwt=false` dans `config.toml` de la fonction (équivalent du flag `--no-verify-jwt`).

### 2.2 Fonctions à déployer SANS `--no-verify-jwt` (14 fonctions)

Elles changent uniquement la **source** de la clé (`readServiceKey(…, "scpi_agents")`)
ou la résolution OIDC inline. Leur `verify_jwt` reste actif (mode legacy de la garde).

`calendly-webhook`, `send-simulation-email`, `scpi-certified-promote`,
`scpi-news-watch`, `scpi-evidence-certify`, `scpi-bulletin-watch`,
`scpi-source-link-inspect`, `scpi-annual-safe-extract`, `scpi-annual-report-backfill`,
`scpi-release-certification-oidc`, `scpi-corum-document-oidc`,
`scpi-bulletin-replay-oidc`, `maximus-agent-audit-oidc`, `maximus-scpi-ocr-oidc`.

```bash
supabase functions deploy calendly-webhook               --project-ref ygvsddcpohsnaowofuwc
supabase functions deploy send-simulation-email          --project-ref ygvsddcpohsnaowofuwc
supabase functions deploy scpi-certified-promote         --project-ref ygvsddcpohsnaowofuwc
supabase functions deploy scpi-news-watch                --project-ref ygvsddcpohsnaowofuwc
supabase functions deploy scpi-evidence-certify          --project-ref ygvsddcpohsnaowofuwc
supabase functions deploy scpi-bulletin-watch            --project-ref ygvsddcpohsnaowofuwc
supabase functions deploy scpi-source-link-inspect       --project-ref ygvsddcpohsnaowofuwc
supabase functions deploy scpi-annual-safe-extract       --project-ref ygvsddcpohsnaowofuwc
supabase functions deploy scpi-annual-report-backfill    --project-ref ygvsddcpohsnaowofuwc
supabase functions deploy scpi-release-certification-oidc --project-ref ygvsddcpohsnaowofuwc
supabase functions deploy scpi-corum-document-oidc       --project-ref ygvsddcpohsnaowofuwc
supabase functions deploy scpi-bulletin-replay-oidc      --project-ref ygvsddcpohsnaowofuwc
supabase functions deploy maximus-agent-audit-oidc       --project-ref ygvsddcpohsnaowofuwc
supabase functions deploy maximus-scpi-ocr-oidc          --project-ref ygvsddcpohsnaowofuwc
```

> Les fonctions OIDC (`maximus-agent-audit-oidc`, `maximus-scpi-ocr-oidc`) gardent leur
> vérification OIDC GitHub : ne PAS les passer en `verify_jwt=false`.

### 2.3 Ordre de dépendance

1. Déployer d'abord les fonctions **2.2** (source de clé) — aucune dépendance de garde.
2. Puis les fonctions **2.1** (`--no-verify-jwt`) — les gardes ne s'activent que si les
   variables `SUPABASE_PUBLISHABLE_KEYS` / `SUPABASE_SECRET_KEYS` sont présentes.
   ⚠️ Ne déployer `--no-verify-jwt` QUE si ces variables sont bien injectées, sinon les
   fonctions renvoient **503** (fail-closed, comportement attendu).

---

## 3. Dry-run puis application de la migration Vault

### 3.1 Vérifications préalables (lecture seule)

```sql
-- Le secret Vault existe (déjà confirmé présent le 2026-11-24).
SELECT id, name, created_at FROM vault.secrets WHERE name = 'pgnet_webhooks';
-- pg_net est installé.
SELECT extname, extversion FROM pg_extension WHERE extname = 'pg_net';
```

### 3.2 Dry-run transactionnel (SQL Editor write-capable)

```sql
BEGIN;
SET LOCAL check_function_bodies = on;

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
    headers := jsonb_build_object('Content-Type', 'application/json', 'apikey', api_key),
    body := payload
  ) INTO request_id;
  RAISE NOTICE 'Sender notification sent - request_id: %, email: %, group: LM_SCPI_SansFrais', request_id, NEW.email;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Sender call failed: % (email: %)', SQLERRM, NEW.email;
  RETURN NEW;
END;
$function$;

ROLLBACK;  -- annule : ne persiste rien
```

### 3.3 Application réelle

Ré-exécuter **le même bloc** sans `BEGIN; … ROLLBACK;` (ou exécuter le fichier
`supabase/migrations/20261124160300_migrate_pgnet_trigger_to_vault.sql`). Le
`CREATE OR REPLACE FUNCTION` est idempotent.

> ⚠️ N'utiliser **jamais** `supabase db push` global (divergence d'historique locale/prod documentée).

---

## 4. Tests fonctionnels et de sécurité (après déploiement)

### 4.1 Smoke tests Edge Functions (clé secrète)

```bash
# 1. sender-add-contact : clé secrète valide → 200 ; clé publishable → 401/503 (rejet).
curl -i -X POST https://ygvsddcpohsnaowofuwc.supabase.co/functions/v1/sender-add-contact \
  -H "apikey: $SB_SECRET" -H "Content-Type: application/json" \
  -d '{"email":"smoke@example.com","firstname":"T","lastname":"T","fields":{"source":"smoke"}}'

# 2. scpi-scoring : persistance (save_to_db=true) exige une clé secrète.
curl -i -X POST https://ygvsddcpohsnaowofuwc.supabase.co/functions/v1/scpi-scoring \
  -H "apikey: $SB_SECRET" -H "Content-Type: application/json" \
  -d '{"scpi_data":[{"nom":"SMOKE"}],"save_to_db":true}'

# 3. Contre-tests NÉGATIFS (doivent échouer) :
#    - apikey absente → 401/503.
#    - clé publishable sur scpi-scoring avec save_to_db=true → 401 (requireSecretKey).
#    - clé secrète sur endpoint frontend-only requirePublishableKey → 401.
```

### 4.2 Tests unitaires (déjà validés localement, exécutés en CI)

```bash
npx vitest run src/tests/supabaseAuthHeaders.test.ts src/tests/scpiScoringPrivilegeSeparation.test.ts
node --test scripts/scpi-candidates/stagedReleaseActivation.test.mjs scripts/scpi-candidates/autonomousPreparedRelease.test.mjs scripts/agents/controlEvidenceRouting.test.mjs
```

État constaté local : **368 PASS / 3 échecs préexistants** (markup drift hors périmètre) ;
contrats scripts **32/32 PASS**.

### 4.3 Contrôle 69/69 après CHAQUE étape

```sql
SELECT strict_pass, strict_fail, runner_state, control_enabled, observed_at
  FROM maximus_agents.watchdog_observations
 ORDER BY observed_at DESC NULLS LAST, id DESC LIMIT 1;
```

Attendu : `strict_pass=69`, `strict_fail=0`, `runner_state='IDLE'`.

---

## 5. Rollback immédiat (en cas de régression)

- **Edge Functions** : redéployer depuis `675ab161` sans `--no-verify-jwt` et avec
  `legacyJwt: true` (les gardes redeviennent des no-op seulement si les variables de clés
  sont absentes). Le repli `SUPABASE_SERVICE_ROLE_KEY` reste fonctionnel.
- **Migration Vault** : restaurer l'ancienne fonction à JWT en dur **uniquement** si le
  flux pg_net réactivé exigeait l'ancien mécanisme (bloc SQL de remplacement dans le runbook §6).
- **Frontend/Netlify** : re-déployer la version précédente ; les clés legacy restent actives
  jusqu'à l'étape de révocation finale.

> Ne **jamais** restaurer une clé compromise en dur dans le code.

---

## 6. Ordre de bascule global (rappel)

1. ✅ Code backend fusionné (`675ab161`).
2. **ChatGPT** : déployer les 14 Edge Functions (source de clé), puis les 3 avec `--no-verify-jwt`.
3. **ChatGPT** : dry-run SQL puis application de la migration Vault.
4. Vérifier 69/69 après chaque lot.
5. **DeepSeek** : bascule GitHub Actions / Netlify (PR #458 prête, NON fusionnée).
6. Tests réels leads / Calendly / simulateurs / comparateur / connexions / agents.
7. Révocation des anciennes clés **en dernier**, après validation complète.

---

## 7. Points d'attention restants (pour la bascule GitHub/Netlify)

- **Secret GitHub Actions `VITE_SUPABASE_ANON_KEY_NEW` absent** : seul
  `SUPABASE_SERVICE_ROLE_KEY_NEW` existe côté Actions. Le swap de la clé anon côté Actions
  est donc **bloqué** jusqu'à création de ce secret.
- **Netlify** : `SUPABASE_SERVICE_ROLE_KEY_NEW` est en scope `Builds, Functions, Runtime`
  (PAS `Post processing`) → vérifier la portée avant le swap du plugin de release.
- **HMAC interne** (`scpi-ingest-scheduled`/`scpi-ingest-background`) : utilise la variable
  `SUPABASE_SERVICE_ROLE_KEY` comme secret de signature interne, pas comme credential
  Supabase. À migrer séparément (hors périmètre API-key) avant révocation du legacy.
