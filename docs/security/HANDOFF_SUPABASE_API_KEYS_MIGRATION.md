# Handoff — Bascule Supabase (ChatGPT exécute)

> Objet : exécution des étapes Supabase de la migration clés API (déploiement Edge Functions + migration Vault).
> Préparé par : DeepSeek (Cursor). Exécuté par : ChatGPT (accès Supabase en écriture).
> Date : 2026-11-24 (révision 2 — réconcilié avec l'état réel de production).
> Statut : **PR #457 fusionnée** (`main`), **compteur 69/69 PASS_100 maintenu**.

---

## 0. Précision capitale sur `verify_jwt` (correction de la révision 1)

La révision 1 indiquait que les fonctions backend « gardent `verify_jwt` actif » et
devaient être déployées **sans** `--no-verify-jwt`. **C'est faux.** La consultation
directe des Edge Functions de production montre que les fonctions concernées sont
**déjà** configurées avec `verify_jwt=false`.

Leur sécurité ne repose **pas** sur la validation JWT de la plateforme, mais sur une
**authentification interne propre** :

| Famille | Mécanisme interne | Exemples |
|---|---|---|
| Cron / ingestion | en-tête `x-cron-token` / `x-annual-token` comparé au SHA-256 stocké dans `scpi_bulletin_runtime_config` | `scpi-news-watch`, `scpi-bulletin-watch`, `scpi-certified-promote`, `scpi-evidence-certify`, `scpi-source-link-inspect`, `scpi-annual-safe-extract`, `scpi-annual-report-backfill` |
| GitHub Actions | jeton OIDC `jwtVerify` (issuer `token.actions.githubusercontent.com`, audience + `workflow_ref` + `repository_id` épinglés) | `scpi-release-certification-oidc`, `scpi-corum-document-oidc`, `scpi-bulletin-replay-oidc`, `maximus-agent-audit-oidc`, `maximus-scpi-ocr-oidc`, `maximus-search-agent-oidc` |
| Webhook Calendly | signature HMAC-SHA256 sur `calendly-webhook-signature` (`CALENDLY_WEBHOOK_SIGNING_KEY`) | `calendly-webhook` |
| Contrôles serveur (sans appelant) | `request_id` UUID, `form_type`, fraîcheur < 15 min, ≤ 3 envois/24 h, champs bornés | `send-simulation-email` |
| Garde `apikey` (`_shared/auth.ts`) | `requireApiKey` / `requirePublishableKey` / `requireSecretKey` | `send-lead-notification`, `sender-add-contact`, `scpi-scoring` |

**Règle de déploiement (à ne jamais violer) : les 17 fonctions concernées se déploient
TOUTES avec `--no-verify-jwt`** (`verify_jwt=false`), pour **préserver** la configuration
effective de production. Déployer sans ce flag ferait basculer `verify_jwt` à `true` et
**casserait** les cron, les appels OIDC GitHub et le webhook Calendly (aucun d'eux
n'envoie de JWT utilisateur Supabase).

> `verify_jwt=true` ne reste exigé QUE pour les fonctions à session utilisateur
> (`client-access-admin`, `client-surveillance`) qui utilisent `withSupabase({ auth: "user" })`.
> Elles ne sont **pas** concernées par cette migration (non modifiées par la PR #457).

---

## 1. Références de commits validés

| Objet | Référence |
|---|---|
| PR #457 fusionnée (source de vérité du code backend) | `675ab1617e749d1d9418f6bb123185b974f2dd39` (`main`) |
| **Base de rollback** (dernier `main` AVANT la migration, = « véritable version précédente ») | `dfc6b309` (PR #456) |
| Commit de la branche de travail | `9fdec3a9a5975d892d892069ca25902b8d85ec91` |
| PR #458 (swap GitHub Actions / Netlify — NE PAS fusionner avant la fin) | branche `security/github-actions-netlify-key-swap` |
| Projet Supabase | `ygvsddcpohsnaowofuwc` (URL `https://ygvsddcpohsnaowofuwc.supabase.co`) |

Les fichiers à déployer ci-dessous correspondent **exactement** au contenu de `main`
(`675ab161`). Aucune autre modification de code n'est requise pour les étapes Supabase.

---

## 2. Déploiement des Edge Functions

### 2.0 Vérification préalable (lecture seule, avant tout déploiement)

```bash
supabase functions list --project-ref ygvsddcpohsnaowofuwc
```

Confirmer que les fonctions listées au §2.3 sont déjà à `verify_jwt=false`. Si une
fonction apparaît à `verify_jwt=true`, la **signaler** (ne pas la redéployer sans
validation) : c'est une divergence avec l'état décrit et elle doit être tranchée.

### 2.1 Fonctions avec garde `apikey` (3 fonctions)

Ces 3 fonctions embarquent une garde `require*Key` avec `{ legacyJwt: false }` :
`verify_jwt` DOIT être désactivé et remplacé par la garde `apikey`.

| Fonction | Garde | Accepte | Dépendance partagée |
|---|---|---|---|
| `send-lead-notification` | `requireApiKey` | publishable **OU** secret | `_shared/auth.ts` |
| `sender-add-contact` | `requireApiKey` | publishable **OU** secret | `_shared/auth.ts` |
| `scpi-scoring` | `requirePublishableKey` (simulation) / `requireSecretKey` (`save_to_db=true`) | publishable (lecture) / secret (écriture) | `_shared/auth.ts`, `_shared/serviceKey.ts` |

Commandes (CLI Supabase) :

```bash
supabase functions deploy send-lead-notification --no-verify-jwt --project-ref ygvsddcpohsnaowofuwc
supabase functions deploy sender-add-contact    --no-verify-jwt --project-ref ygvsddcpohsnaowofuwc
supabase functions deploy scpi-scoring          --no-verify-jwt --project-ref ygvsddcpohsnaowofuwc   # voir §2.4 (optionnel)
```

> ⚠️ Ne déployer `--no-verify-jwt` QUE si les variables `SUPABASE_PUBLISHABLE_KEYS` /
> `SUPABASE_SECRET_KEYS` sont bien injectées, sinon les fonctions renvoient **503**
> (`authentication_not_configured`, fail-closed). Sans clé configurée, elles refusent
> toute requête : c'est le comportement attendu, jamais une ouverture.

### 2.2 Fonctions à authentification interne (14 fonctions — cron / OIDC / Calendly)

Elles changent uniquement la **source** de la clé Supabase (`readServiceKey(…, "scpi_agents")`)
ou la résolution OIDC inline. Leur `verify_jwt` **reste `false`** (leur authentification
est interne, cf. §0). Elles se déploient **avec** `--no-verify-jwt`.

```bash
supabase functions deploy calendly-webhook                --no-verify-jwt --project-ref ygvsddcpohsnaowofuwc
supabase functions deploy send-simulation-email           --no-verify-jwt --project-ref ygvsddcpohsnaowofuwc
supabase functions deploy scpi-certified-promote          --no-verify-jwt --project-ref ygvsddcpohsnaowofuwc
supabase functions deploy scpi-news-watch                 --no-verify-jwt --project-ref ygvsddcpohsnaowofuwc
supabase functions deploy scpi-evidence-certify           --no-verify-jwt --project-ref ygvsddcpohsnaowofuwc
supabase functions deploy scpi-bulletin-watch             --no-verify-jwt --project-ref ygvsddcpohsnaowofuwc
supabase functions deploy scpi-source-link-inspect        --no-verify-jwt --project-ref ygvsddcpohsnaowofuwc
supabase functions deploy scpi-annual-safe-extract        --no-verify-jwt --project-ref ygvsddcpohsnaowofuwc
supabase functions deploy scpi-annual-report-backfill     --no-verify-jwt --project-ref ygvsddcpohsnaowofuwc
supabase functions deploy scpi-release-certification-oidc --no-verify-jwt --project-ref ygvsddcpohsnaowofuwc
supabase functions deploy scpi-corum-document-oidc        --no-verify-jwt --project-ref ygvsddcpohsnaowofuwc
supabase functions deploy scpi-bulletin-replay-oidc       --no-verify-jwt --project-ref ygvsddcpohsnaowofuwc
supabase functions deploy maximus-agent-audit-oidc        --no-verify-jwt --project-ref ygvsddcpohsnaowofuwc
supabase functions deploy maximus-scpi-ocr-oidc           --no-verify-jwt --project-ref ygvsddcpohsnaowofuwc
```

> `maximus-search-agent-oidc` **n'est pas modifié** par la PR #457 (absent du diff) :
> ne pas le redéployer, il reste tel quel en `verify_jwt=false` avec son OIDC GitHub.

### 2.3 Manifeste exact de déploiement (une ligne par fonction)

Colonnes : **Auth interne** = mécanisme qui protège la fonction hors `verify_jwt`.
**Dép. prod** = déjà déployée en production. **Rollback** = fichier(s) à restaurer
depuis `dfc6b309` (cf. §5).

| Fonction | Fichier source | Dépendances partagées | Dép. prod | verify_jwt | Auth interne |
|---|---|---|---|---|---|
| `calendly-webhook` | `supabase/functions/calendly-webhook/index.ts` | `_shared/serviceKey.ts` | ✅ | false | HMAC-SHA256 Calendly (`calendly-webhook-signature` vs `CALENDLY_WEBHOOK_SIGNING_KEY`) |
| `send-simulation-email` | `supabase/functions/send-simulation-email/index.ts` (+ `logic.ts`) | `_shared/serviceKey.ts` | ✅ | false | Contrôles serveur (request_id UUID, `lead_simulation_email`, <15 min, ≤3/24h) |
| `scpi-certified-promote` | `supabase/functions/scpi-certified-promote/index.ts` | `_shared/serviceKey.ts` | ✅ | false | `x-cron-token` = SHA-256(`cron_token_sha256`) |
| `scpi-news-watch` | `supabase/functions/scpi-news-watch/index.ts` | `_shared/serviceKey.ts` | ✅ | false | `x-cron-token` = SHA-256(`cron_token_sha256`) |
| `scpi-evidence-certify` | `supabase/functions/scpi-evidence-certify/index.ts` | `_shared/serviceKey.ts` | ✅ | false | `x-cron-token` = SHA-256(`cron_token_sha256`) |
| `scpi-bulletin-watch` | `supabase/functions/scpi-bulletin-watch/index.ts` | `_shared/serviceKey.ts` | ✅ | false | `x-cron-token` = SHA-256(`cron_token_sha256`) |
| `scpi-source-link-inspect` | `supabase/functions/scpi-source-link-inspect/index.ts` | `_shared/serviceKey.ts` | ✅ | false | `x-cron-token` = SHA-256(`cron_token_sha256`) |
| `scpi-annual-safe-extract` | `supabase/functions/scpi-annual-safe-extract/index.ts` | `_shared/serviceKey.ts` | ✅ | false | `x-annual-token` = SHA-256(`annual_cron_token_sha256`) |
| `scpi-annual-report-backfill` | `supabase/functions/scpi-annual-report-backfill/index.ts` | `_shared/serviceKey.ts` | ✅ | false | `x-annual-token` = SHA-256(`annual_cron_token_sha256`) |
| `scpi-release-certification-oidc` | `supabase/functions/scpi-release-certification-oidc/index.ts` | `_shared/serviceKey.ts` | ✅ | false | GitHub OIDC (`jwtVerify`, aud `maximus-scpi-release-certification-…`) |
| `scpi-corum-document-oidc` | `supabase/functions/scpi-corum-document-oidc/index.ts` | `_shared/serviceKey.ts` | ✅ | false | GitHub OIDC (aud `maximus-corum-documents-…`) |
| `scpi-bulletin-replay-oidc` | `supabase/functions/scpi-bulletin-replay-oidc/index.ts` | `_shared/serviceKey.ts` | ✅ | false | GitHub OIDC (aud `maximus-scpi-bulletin-replay-…`) |
| `maximus-agent-audit-oidc` | `supabase/functions/maximus-agent-audit-oidc/index.ts` | résolution inline `serviceKey()` + `storageAuth()` | ✅ | false | GitHub OIDC (aud `maximus-parallel-audit-…`) ; DB directe via `SUPABASE_DB_URL` |
| `maximus-scpi-ocr-oidc` | `supabase/functions/maximus-scpi-ocr-oidc/index.ts` (+ `historicalIdentity.mjs`) | résolution inline | ✅ | false | GitHub OIDC (aud `maximus-scpi-ocr-…`) ; DB directe via `SUPABASE_DB_URL` |
| `send-lead-notification` | `supabase/functions/send-lead-notification/index.ts` | `_shared/auth.ts` | ✅ | false | `requireApiKey` (publishable OU secret) |
| `sender-add-contact` | `supabase/functions/sender-add-contact/index.ts` | `_shared/auth.ts` | ✅ | false | `requireApiKey` (publishable OU secret) |
| `scpi-scoring` | `supabase/functions/scpi-scoring/index.ts` | `_shared/auth.ts`, `_shared/serviceKey.ts` | ❌ | false | `requirePublishableKey` / `requireSecretKey` |

### 2.4 Justification de `scpi-scoring` (absente de la production)

`scpi-scoring` **n'existe pas** dans les Edge Functions déployées en production. Elle
existe dans le dépôt depuis `be6d032a` mais n'a **jamais** été déployée, et — point
déterminant — **aucun code frontend de production ne l'appelle** :

- Le frontend calcule les scores via `getOrComputeScoresForScpis()` (`scpiScoringService.ts`) :
  `scpi_bulletins.maximus_score` → `scores_scpi` → repli local `scoreScpiBatch()`.
- `calculateScpiScoresViaEdgeFunction()` (le seul appelant de `/functions/v1/scpi-scoring`)
  est **défini mais jamais invoqué** (aucun appel en dehors de `scpiScoringExample.ts`,
  fichier d'exemple de développement).

**Conséquence : le déploiement de `scpi-scoring` n'est PAS requis pour cette migration.**
La PR #457 y a ajouté la séparation de privilèges (`save_to_db=true` → `requireSecretKey`,
simulation → `requirePublishableKey`) pour rendre le chemin prêt à l'emploi **si** on
décide un jour de basculer le scoring côté serveur. Deux options acceptables :

1. **Déférer** (recommandé) : ne pas déployer `scpi-scoring` ; le scoring reste 100 %
   local/DB comme aujourd'hui. Aucun impact sur le 69/69 ni sur le comparateur.
2. **Déployer en option** (si une bascule serveur est décidée) : uniquement après
   injection de `SUPABASE_PUBLISHABLE_KEYS` + `SUPABASE_SECRET_KEYS` et validation
   des smoke tests §4.1.

Quelle que soit l'option, `scpi-scoring` ne fait **pas** partie du chemin critique de
la migration des clés.

### 2.5 Ordre de dépendance

1. Déployer d'abord les fonctions **§2.2** (source de clé) — aucune dépendance de garde.
2. Puis les fonctions **§2.1** (`--no-verify-jwt`). Les gardes ne s'activent que si les
   variables `SUPABASE_PUBLISHABLE_KEYS` / `SUPABASE_SECRET_KEYS` sont présentes.
3. `scpi-scoring` en dernier, seulement si l'option « déployer » du §2.4 est retenue.

---

## 3. Migration Vault — un patron dormant, pas un flux actif (correction)

### 3.0 État réel de production : aucun trigger pg_net actif

La vérification en base (lecture seule) confirme : **aucun trigger** ne pointe vers
`public.notify_sender_new_pdf_lead`, et **aucune** fonction `notify_*` n'existe dans
`public`. Le flux pg_net vers `sender-add-contact` n'est **pas** le circuit de capture
utilisé en production.

### 3.1 Circuit réel de capture des leads (production)

La capture se fait **directement depuis le frontend**, sans trigger pg_net :

1. `leadSubmitter.submitLead()` écrit dans `public.contact_submissions` (client anon Supabase).
2. `leadTracker` / `leadSubmitter` → `send-lead-notification` (e-mail Resend) via
   `fetch`/`supabase.functions.invoke`.
3. `OptimizedScpiLandingPage` / `OptimizedThematicLandingPage` / `LeadMagnetEmailForm`
   → `sender-add-contact` (contact Brevo) via `functionHeaders(VITE_SUPABASE_ANON_KEY)`.

C'est pourquoi `sender-add-contact` utilise `requireApiKey` (qui accepte une clé
**publishable**, cf. §4.1) : elle est appelée par le navigateur avec la clé anon.

### 3.2 Vérifications préalables (lecture seule)

```sql
-- Le secret Vault existe (déjà confirmé présent le 2026-11-24).
SELECT id, name, created_at FROM vault.secrets WHERE name = 'pgnet_webhooks';
-- pg_net est installé.
SELECT extname, extversion FROM pg_extension WHERE extname = 'pg_net';
```

### 3.3 Dry-run transactionnel (SQL Editor write-capable)

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

### 3.4 Application réelle (optionnelle, idempotente, sans effet runtime)

Ré-exécuter **le même bloc** sans `BEGIN; … ROLLBACK;` (ou exécuter
`supabase/migrations/20261124160300_migrate_pgnet_trigger_to_vault.sql`). Le
`CREATE OR REPLACE FUNCTION` est idempotent.

> **Cette étape est facultative** : le patron n'est pas consommé par le flux actif.
> Elle élimine du dépôt l'ancienne clé `service_role` en dur (projet supprimé
> `eldvbqqgelifxkybytip`) et documente le patron « pg_net → Vault → `apikey` » pour un
> usage futur. Elle ne change **rien** au comportement de production aujourd'hui.
>
> ⚠️ N'utiliser **jamais** `supabase db push` global (divergence d'historique locale/prod documentée).

---

## 4. Tests fonctionnels et de sécurité (après déploiement)

### 4.1 Smoke tests Edge Functions — corrigés (clés publishable et secrète)

```bash
# 1. sender-add-contact : clé publishable → 200 (ACCEPTÉE, circuit frontend).
curl -i -X POST https://ygvsddcpohsnaowofuwc.supabase.co/functions/v1/sender-add-contact \
  -H "apikey: $SB_PUBLISHABLE" -H "Content-Type: application/json" \
  -d '{"email":"smoke@example.com","firstname":"T","lastname":"T","fields":{"source":"smoke"}}'

# 2. sender-add-contact : clé secrète → 200 (ACCEPTÉE, appel Netlify/pg_net).
curl -i -X POST https://ygvsddcpohsnaowofuwc.supabase.co/functions/v1/sender-add-contact \
  -H "apikey: $SB_SECRET" -H "Content-Type: application/json" \
  -d '{"email":"smoke@example.com","firstname":"T","lastname":"T","fields":{"source":"smoke"}}'

# 3. scpi-scoring : simulation (save_to_db=false) → clé publishable acceptée.
curl -i -X POST https://ygvsddcpohsnaowofuwc.supabase.co/functions/v1/scpi-scoring \
  -H "apikey: $SB_PUBLISHABLE" -H "Content-Type: application/json" \
  -d '{"scpi_data":[{"nom":"SMOKE"}],"save_to_db":false}'

# 4. scpi-scoring : persistance (save_to_db=true) → exige une clé secrète.
curl -i -X POST https://ygvsddcpohsnaowofuwc.supabase.co/functions/v1/scpi-scoring \
  -H "apikey: $SB_SECRET" -H "Content-Type: application/json" \
  -d '{"scpi_data":[{"nom":"SMOKE"}],"save_to_db":true}'
```

**Contre-tests NÉGATIFS (doivent échouer)** :

- `apikey` absente → **401** (`unauthorized`) ; si aucune clé n'est configurée → **503**
  (`authentication_not_configured`).
- Clé inconnue / invalide → **401**.
- **Clé publishable sur `scpi-scoring` avec `save_to_db=true`** → **401**
  (`requireSecretKey` n'accepte que les clés secrètes).
- **Clé secrète sur `scpi-scoring` en simulation `requirePublishableKey`** → **401**
  (l'endpoint de simulation n'accepte que la clé publishable).

> **Correction de la révision 1** : le test « clé publishable sur `sender-add-contact`
> → rejet » était **faux**. `sender-add-contact` utilise `requireApiKey`, qui accepte
> **volontairement** publishable **et** secret (elle est appelée par le navigateur avec
> la clé anon). La distinction publishable/exclue-ne s'applique qu'à `requireSecretKey`
> (`scpi-scoring` `save_to_db=true`) et `requirePublishableKey`.

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

**La véritable version précédente est `dfc6b309`** (dernier `main` avant la PR #457),
**pas** une variante « `verify_jwt=true` » qui n'a jamais existé en production.

### 5.1 Rollback de code (restauration exacte de `dfc6b309`)

Pour une fonction donnée `<name>` :

```bash
git checkout dfc6b309 -- supabase/functions/<name>
supabase functions deploy <name> --no-verify-jwt --project-ref ygvsddcpohsnaowofuwc
```

Fonctions et fichiers de la restauration :

| Fonction | `git checkout dfc6b309 --` |
|---|---|
| 14 backend (§2.2) | `supabase/functions/<name>/index.ts` (+ `logic.ts` pour `send-simulation-email`) |
| `send-lead-notification` | `supabase/functions/send-lead-notification/index.ts` |
| `sender-add-contact` | `supabase/functions/sender-add-contact/index.ts` |

> ⚠️ **Restauration = retrait de la garde** : `sender-add-contact` et
> `send-lead-notification` **n'avaient aucune garde** avant la PR #457. Restaurer
> `dfc6b309` **rouvre** ces deux endpoints (ils n'exigent plus de clé). Ce rollback
> n'est acceptable qu'en urgence, avec la clé legacy toujours active, et doit être
> suivi d'une re-correction.

### 5.2 Rollback de configuration (sans changement de code, recommandé)

Le code de `main` (`675ab161`) utilise `readServiceKey` qui **replie** sur
`SUPABASE_SERVICE_ROLE_KEY` (legacy). Tant que cette clé n'est **pas révoquée**,
le repli fonctionne : aucun redéploiement n'est nécessaire. Pour revenir en arrière,
il suffit de **ne pas** configurer `SUPABASE_SECRET_KEYS` (les fonctions continuent
sur la clé legacy).

- **Migration Vault** : restaurer l'ancienne fonction à JWT en dur **uniquement** si le
  flux pg_net réactivé exigeait l'ancien mécanisme (bloc SQL dans le runbook §6).
- **Frontend/Netlify** : re-déployer la version précédente ; les clés legacy restent
  actives jusqu'à l'étape de révocation finale.

> Ne **jamais** restaurer une clé compromise en dur dans le code.

---

## 6. Ordre de bascule global (rappel)

1. ✅ Code backend fusionné (`675ab161`).
2. **ChatGPT** : déployer les **14** fonctions à authentification interne (§2.2) puis
   les fonctions à garde `apikey` (§2.1), **toutes** avec `--no-verify-jwt`.
3. **ChatGPT** : dry-run SQL puis application **optionnelle** de la migration Vault (§3).
4. Vérifier 69/69 après chaque lot.
5. **DeepSeek** : bascule GitHub Actions / Netlify (PR #458 prête, NON fusionnée).
6. Tests réels leads / Calendly / simulateurs / comparateur / connexions / agents.
7. Révocation des anciennes clés **en dernier**, après validation complète.

---

## 7. Consommateurs résiduels de la clé legacy `SUPABASE_SERVICE_ROLE_KEY`

Recensement exhaustif des **derniers** consommateurs à basculer **avant** toute révocation
de la clé legacy. La clé sert **deux usages distincts** qu'il ne faut pas confondre :
(i) credential Supabase (PostgREST/Admin) ; (ii) **secret HMAC interne** (signature du
dispatch d'ingestion Netlify).

### 7.1 HMAC interne (usage NON credential — à traiter séparément)

| Fichier | Rôle | Usage de la clé |
|---|---|---|
| `netlify/functions/scpi-ingest-scheduled.ts` | **signataire** (cron `30 3 * * *`) | `createHmac('sha256', SUPABASE_SERVICE_ROLE_KEY)` sur `${timestamp}:scpi-ingest` → envoie `x-maximus-timestamp` + `x-maximus-signature` |
| `netlify/functions/scpi-ingest-background.mts` | **vérificateur** | `createHmac('sha256', SUPABASE_SERVICE_ROLE_KEY)` + `timingSafeEqual`, fenêtre de 5 min |

La **même valeur** est lue des deux côtés. Conséquence opérationnelle :

- La clé legacy sert ici de **secret de signature**, pas de credential Supabase.
- Une bascule doit être **atomique sur les deux fonctions** (ou utiliser un secret
  dédié `INGEST_HMAC_SECRET`), sinon le cron signe avec l'ancienne clé pendant que le
  vérificateur attend la nouvelle → **rejets systématiques** de l'ingestion planifiée.
- **Ne pas révoquer `SUPABASE_SERVICE_ROLE_KEY` avant d'avoir migré ce HMAC.**

### 7.2 Consumers « credential » (PostgREST / Admin)

| Consommateur | Fichier(s) | Résolution actuelle | Bascule |
|---|---|---|---|
| Netlify `lead-fallback` | `netlify/functions/lead-fallback.ts` | `SUPABASE_SERVICE_ROLE_KEY_NEW` → repli legacy | ✅ déjà `_NEW` en premier |
| Netlify `_invite-utils` | `netlify/functions/_invite-utils.ts` | `SUPABASE_SERVICE_ROLE_KEY_NEW` → repli legacy | ✅ déjà `_NEW` en premier |
| Netlify `scpi-progressive-publisher` | `netlify/functions/scpi-progressive-publisher.mts` | `_NEW` → repli legacy | ✅ déjà `_NEW` en premier |
| Netlify `funnel-event` | `netlify/functions/funnel-event.ts` | `_NEW` → repli legacy | ✅ déjà `_NEW` en premier |
| Plugin de release | `plugins/maximus-scpi-native-release/release.mjs` | `SUPABASE_SERVICE_ROLE_KEY` seul | ⚠️ à basculer sur `_NEW` |
| GitHub Actions (3 workflows) | `scpi-autonomous-certified-release.yml`, `scpi-autonomous-progressive-release.yml`, `maximus-candidate-postdeploy-activation.yml` | `secrets.SUPABASE_SERVICE_ROLE_KEY_NEW` | ✅ déjà `_NEW` |
| Scripts locaux (hors runtime) | `scripts/scpi-candidates/*.mjs`, `scripts/scpi-agents/*.mjs`, `scpi-ingestion/src/supabase.ts`, divers `*.ts` | `SUPABASE_SERVICE_ROLE_KEY` (env locale) | hors périmètre runtime ; migrer les `.env.local` au moment de la révocation |
| Edge Functions | `supabase/functions/**` | `readServiceKey(scpi_agents)` / inline | ✅ cette PR |

### 7.3 Points d'attention pour la bascule GitHub/Netlify

- **Secret GitHub Actions `VITE_SUPABASE_ANON_KEY_NEW` absent** : seul
  `SUPABASE_SERVICE_ROLE_KEY_NEW` existe côté Actions. Le swap de la clé anon côté
  Actions est donc **bloqué** jusqu'à création de ce secret.
- **Netlify** : `SUPABASE_SERVICE_ROLE_KEY_NEW` est en scope `Builds, Functions, Runtime`
  (PAS `Post processing`) → vérifier la portée avant le swap du plugin de release.
- **HMAC interne** : voir §7.1 — migrer le secret de signature **avant** toute révocation.

---

## 8. Non-négociables (rappel)

- Aucun nouveau chantier. Aucun `supabase db push` global. Aucune révocation de clé.
- Maintien strict de **69/69 PASS_100** (`strict_pass=69`, `strict_fail=0`, `runner_state='IDLE'`).
- Toute fonction en `verify_jwt=false` doit avoir une authentification interne effective
  (cron/OIDC/Calendly/garde `apikey`) — jamais une fonction ouverte sans contrôle.
