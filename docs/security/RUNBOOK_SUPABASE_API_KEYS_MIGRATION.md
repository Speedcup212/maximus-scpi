# Runbook — Migration des clés API Supabase (legacy JWT → `sb_publishable` / `sb_secret`)

> Branche de travail : `security/api-key-migration-20261124` — PR [#457](https://github.com/Speedcup212/maximus-scpi/pull/457)
> Projet Supabase : `ygvsddcpohsnaowofuwc` (MaximusSCPI)
> Statut : **préparation** — aucune clé legacy n'est révoquée, aucune bascule en production tant que la compatibilité n'est pas validée.
> Contrainte permanente : maintien des **69/69 PASS_100** et **zéro interruption de service**.

---

## 1. Contexte et modèle de clés

| Génération | Clé | Nature | En-tête |
|---|---|---|---|
| Legacy | `anon` / `service_role` | JWT HS256 signé par le secret JWT partagé | `Authorization: Bearer …` (ou `apikey`) |
| Nouvelle | `sb_publishable_…` | clé API opaque, sûre côté client | `apikey` uniquement |
| Nouvelle | `sb_secret_…` | clé API opaque, backend uniquement | `apikey` uniquement |

Règle critique : **une clé `sb_publishable`/`sb_secret` n'est pas un JWT** — la passer en
`Authorization: Bearer …` échoue avec « Invalid JWT ». Elle se porte exclusivement sur `apikey`.

Les quatre clés secrètes nommées ont été créées dans le dashboard. Elles sont injectées
automatiquement dans les Edge Functions via `SUPABASE_SECRET_KEYS` (objet JSON nommé) et
`SUPABASE_PUBLISHABLE_KEYS`.

---

## 2. Inventaire des dépendances et emplacement de chaque clé

### 2.1 Carte des clés → consommateur

| Clé (nom) | Consommateur | Interface d'enregistrement | Variable / emplacement |
|---|---|---|---|
| `github_actions` | Workflows CI (3 fichiers) | GitHub → Repo → **Settings → Secrets and variables → Actions** | secret `SUPABASE_SERVICE_ROLE_KEY_NEW` ✅ créé (24/11) ; `SUPABASE_SERVICE_ROLE_KEY` (legacy) conservé |
| `netlify` | Netlify Functions + plugin de release | Netlify → Site → **Site configuration → Environment variables** | `SUPABASE_SERVICE_ROLE_KEY_NEW` ✅ créé (protégée, prod only) ; `SUPABASE_SERVICE_ROLE_KEY` conservé |
| `scpi_agents` | 15 Edge Functions backend (13 `readServiceKey` + 2 OIDC inline) | **Aucune saisie** — déjà dans `SUPABASE_SECRET_KEYS` | lue par le code : `SUPABASE_SECRET_KEYS["scpi_agents"]` |
| `pgnet_webhooks` | (voir §8 — trigger pg_net absent en prod) | Supabase → **Database → Vault → Secrets → Add a new secret** | nom de secret Vault : `pgnet_webhooks` ✅ présent |

### 2.2 La clé publishable

| Consommateur | Interface | Variable |
|---|---|---|
| Frontend (Vite) | Netlify → **Site configuration → Environment variables** | `VITE_SUPABASE_ANON_KEY_NEW` ✅ créé (correspondance exacte avec la clé publishable) ; `VITE_SUPABASE_ANON_KEY` (legacy) conservé |

### 2.3 Workflows GitHub concernés

- `.github/workflows/scpi-autonomous-progressive-release.yml`
- `.github/workflows/scpi-autonomous-certified-release.yml`
- `.github/workflows/maximus-candidate-postdeploy-activation.yml`

Ils consomment `secrets.SUPABASE_SERVICE_ROLE_KEY` et `secrets.VITE_SUPABASE_ANON_KEY`.

---

## 3. Modifications de code déjà effectuées (branche `security/api-key-migration-20261124`)

### 3.1 Frontend — suppression des `Authorization: Bearer <anon>`

Nouveau helper : `src/utils/supabaseAuthHeaders.ts` (`restHeaders`, `functionHeaders`)
qui porte la clé sur `apikey` uniquement. Cinq appels corrigés :

- `src/utils/supabaseRest.ts` — lecture PostgREST
- `src/utils/leadTracker.ts` — notification admin
- `src/utils/scpiScoringService.ts` — appel `scpi-scoring`
- `src/components/OptimizedScpiLandingPage.tsx` — `sender-add-contact`
- `src/components/OptimizedThematicLandingPage.tsx` — `sender-add-contact`

Les JWT utilisateur (sessions) sont préservés partout où `@supabase/supabase-js` gère déjà
`Authorization: Bearer <access_token>` — ces corrections ne touchent que les clés anon.

### 3.2 Edge Functions — lecture des clés nommées

Helpers partagés dans `supabase/functions/_shared/` :

- `serviceKey.ts` → `readServiceKey(getEnv, name)` : lit `SUPABASE_SECRET_KEYS[name]`,
  puis `default`, puis repli transitoire sur `SUPABASE_SERVICE_ROLE_KEY`.
- `auth.ts` → trois gardes **fail-closed** (signature : `guard(req, getEnv, { legacyJwt })`) :
  - `requirePublishableKey` (frontend-only : n'accepte que `sb_publishable_*`),
  - `requireSecretKey` (endpoint **privé** : n'accepte que `sb_secret_*`, rejette toute clé
    publique),
  - `requireApiKey` (frontend + backend pg_net/Netlify : `sb_publishable_*` OU `sb_secret_*`).
  Règle : la garde ne laisse passer SANS contrôle que si `legacyJwt === true` (verify_jwt
  actif) ET que les variables de clés sont **absentes**. Une config **absente** avec
  `legacyJwt === false`, **vide** (`{}`) ou **invalide** → refus **503** (jamais permissif).
  Clé manquante/incorrecte → **401**. `legacyJwt` doit refléter l'état réel de `verify_jwt`.

13 fonctions migrées vers `readServiceKey(…, "scpi_agents")` :
`scpi-scoring`, `send-simulation-email`, `calendly-webhook`, `scpi-certified-promote`,
`scpi-news-watch`, `scpi-evidence-certify`, `scpi-bulletin-watch`, `scpi-source-link-inspect`,
`scpi-annual-safe-extract`, `scpi-annual-report-backfill`, `scpi-release-certification-oidc`,
`scpi-corum-document-oidc`, `scpi-bulletin-replay-oidc`.

> **Les deux fonctions OIDC restantes sont finalisées par résolution inline** (pas d'import
> `readServiceKey`, pour préserver les tests de contrat qui exécutent le code en VM) :
> `maximus-agent-audit-oidc` (helper top-level `serviceKey()` + `storageAuth()`) et
> `maximus-scpi-ocr-oidc` (résolution inline dans le bloc `original`, seul bloc exécuté en VM).
> Elles lisent `SUPABASE_SECRET_KEYS["scpi_agents"]` → `default` → repli `SUPABASE_SERVICE_ROLE_KEY`,
> et **ne portent plus une clé opaque `sb_secret_*` en `Authorization: Bearer`** (en-tête
> conditionnel : `apikey` seul pour une clé opaque, `apikey` + `Bearer` pour le JWT legacy).
> Les contrats `controlEvidenceRouting.test.mjs` et `ocrArchiveBridge.test.mjs` restent PASS.

Garde `requireApiKey` ajoutée aux fonctions appelées par plusieurs consommateurs :
`send-lead-notification` (frontend + Netlify `lead-fallback`) et `sender-add-contact`
(frontend + pg_net).

### 3.2bis — Séparation des autorisations dans `scpi-scoring`

La fonction `scpi-scoring` sépare désormais strictement :
- **simulation publique** (lecture seule, `save_to_db` absent/false) → `requirePublishableKey` ;
- **persistance backend** (`save_to_db=true`) → `requireSecretKey` **uniquement**.

Une clé publishable (publique, embarquée dans le frontend) ne peut **jamais** déclencher une
écriture privilégiée (`scores_scpi.insert`). L'insertion utilise `readServiceKey(scpi_agents)`.

### 3.3 PostgreSQL — pg_net via Vault

Migration `supabase/migrations/20261124160300_migrate_pgnet_trigger_to_vault.sql` :
`notify_sender_new_pdf_lead()` lit `pgnet_webhooks` depuis `vault.decrypted_secrets` et
envoie `apikey` (plus de `Authorization: Bearer`). **La clé `service_role` en dur du
projet supprimé `eldvbqqgelifxkybytip` est éliminée du dépôt.**

> ⚠️ Constat de réconciliation (§8) : ce trigger pg_net **n'est plus actif en production**.
> La migration est donc idempotente et sans effet sur le runtime actuel ; elle documente et
> restaure le patron « pg_net → Vault → `apikey` » pour tout futur usage.

### 3.4 Netlify — `lead-fallback`

`netlify/functions/lead-fallback.ts` envoie désormais `apikey` (clé `netlify`) vers
`send-lead-notification`. La résolution de clé est **explicite** :
`SUPABASE_SERVICE_ROLE_KEY_NEW` (nouvelle clé) **puis** repli transitoire sur
`SUPABASE_SERVICE_ROLE_KEY` (legacy). La nouvelle variable est donc référencée et utilisée
en priorité dès la bascule Netlify.

### 3.5 Page HTML Calendly

`public/merci-landing-page.calendly.html` : la clé anon en dur est remplacée par les
placeholders `VITE_SUPABASE_URL_PLACEHOLDER` / `VITE_SUPABASE_ANON_KEY_PLACEHOLDER`,
injectés au build par `scripts/inject-env-vars.js` (mécanisme déjà existant).

---

## 4. Tests de compatibilité et de sécurité

### 4.1 Suites dédiées — 36 tests PASS (`supabaseAuthHeaders` + `scpiScoringPrivilegeSeparation`)

- Les helpers frontend ne produisent plus de `Authorization: Bearer`.
- Résolution des clés nommées (`scpi_agents`, `default`, repli legacy).
- **Matrice d'authentification demandée** (fail-closed) :
  1. **Appel sans clé** → 401 (dès qu'une clé est configurée).
  2. **Clé invalide** → 401.
  3. **Clé publique (`sb_publishable`) sur un endpoint privé** → 401 (`requireSecretKey`).
  4. **JWT utilisateur invalide** sur `Authorization` → ne contourne jamais le contrôle
     `apikey` ; un `apikey` valide reste accepté (l'endpoint s'authentifie par clé, pas par
     session utilisateur).
  5. **Config absente + `legacyJwt=false`** → 503 (jamais permissif).
  6. **Config vide (`{}`) ou JSON invalide** → 503, même en mode legacy.
- **Compatibilité simultanée** ancienne/nouvelle clés : `readServiceKey` préfère la
  nouvelle clé, replie sur `SUPABASE_SERVICE_ROLE_KEY` (legacy). En mode legacy (`legacyJwt:
  true`) avec variables absentes, la garde reste un no-op (verify_jwt protège).
- **`scpiScoringPrivilegeSeparation`** : une clé publishable ne peut pas déclencher
  `save_to_db=true` ; l'écriture est réservée à `requireSecretKey`.

Commande : `npx vitest run src/tests/supabaseAuthHeaders.test.ts src/tests/scpiScoringPrivilegeSeparation.test.ts`.

### 4.2 Garde anti « permissif par défaut »

Les gardes ne laissent passer SANS contrôle que si **`legacyJwt === true`** (verify_jwt actif)
**ET** que les variables de clés sont **absentes**. Dans tous les autres cas, elles refusent
**(fail-closed)** : config absente en mode `legacyJwt=false` → 503, config vide/invalide →
503, clé incorrecte → 401. Invariant de déploiement (commenté dans `auth.ts`) :
**`verify_jwt = false` n'est autorisé QUE si une garde est en place, avec `legacyJwt=false`,
ET que les clés correspondantes sont effectivement configurées.** Aucune fonction n'est
basculée en `verify_jwt = false` sans garde de remplacement testée.

### 4.3 Tests préexistants en échec (sans lien avec cette PR)

Trois échecs Vitest existaient **avant** cette branche (confirmé par `git stash` contre la
base `dfc6b309`). Ils relèvent tous d'une **dérive de markup** : les composants source ont
été refactorés mais les tests de correspondance textuelle n'ont pas été mis à jour.

| Test | Fichier | Cause racine | Lien avec la PR |
|---|---|---|---|
| `clientPositionForm` | `src/tests/clientPositionForm.test.ts` | `ClientDashboard.tsx` ne contient plus l'extrait `Date d'achat … type="date" required` / `disabled={saving || !canAddPosition}` attendu par le test | **Aucun** (fichiers hors périmètre) |
| `clientPositionEditDate` | `src/tests/clientPositionEditDate.test.ts` | même cause : markup du formulaire d'édition refactoré (`canSaveEditedPosition`, `type="date" required`) | **Aucun** |
| `clientTrajectoryReuse` | `src/tests/clientTrajectoryReuse.test.ts` | `ClientScpiCard.tsx` ne contient plus `<div><p …>TOF publié</p>` : `indexOf` → `-1` | **Aucun** |

Aucun de ces trois tests ne touche `supabase/`, les helpers d'auth, ni les clés API.
Suite globale constatée : **368 PASS / 3 échecs préexistants** (42 fichiers, 371 tests).

### 4.4 CI GitHub — régression détectée puis corrigée

Le premier push de la PR a déclenché deux familles de tests de contrat qui exécutent le code
réel des fonctions OIDC / vérifient leur contenu littéral :

| Job CI | Test | Cause | Correction |
|---|---|---|---|
| `contract` | `controlEvidenceRouting.test.mjs:350` | `assert.match(edge,/SUPABASE_SERVICE_ROLE_KEY/)` ne trouvait plus le littéral dans `maximus-agent-audit-oidc` | résolution inline avec repli `SUPABASE_SERVICE_ROLE_KEY` (littéral conservé) |
| `pdf-ocr (1,2,3)` | `ocrArchiveBridge.test.mjs` | `ReferenceError: readServiceKey is not defined` (exécution du code OCR en VM) | résolution inline dans le bloc exécuté en VM |

**Résolution finale** : les deux fonctions OIDC sont **compatibles** (voir §3.2) sans importer
`readServiceKey` (préservant les contrats) et sans affaiblir l'authentification (en-tête
`Bearer` supprimé pour les clés opaques). Tous les checks CI sont **PASS** et le statut de
fusion est **CLEAN**.

---

## 5. Procédure de bascule (P3 — gated, aucune révocation automatique)

> Toutes les étapes ci-dessous sont **gated** : à n'exécuter qu'après validation finale de l'utilisateur.

### Étape 0 — Vérifier les prérequis
1. 69/69 PASS_100 confirmé (watchdog `strict_fail = 0`).
2. Clés `sb_publishable` + 4 `sb_secret` créées (fait).

### Étape 1 — Enregistrer les clés dans les interfaces (actions manuelles dashboard)

1. **Supabase Vault** : ✅ secret `pgnet_webhooks` **déjà enregistré** (présence confirmée le
   2026-11-24, description « Notifications SQL et webhooks MaximusSCPI »). Ne sera consommé
   que si le flux pg_net est réactivé (voir §8.5).
2. **Netlify → Environment variables** : ✅ fait
   - `SUPABASE_SERVICE_ROLE_KEY_NEW` = clé `netlify` (protégée, contexte Production uniquement).
   - `VITE_SUPABASE_ANON_KEY_NEW` = clé publishable (correspondance exacte vérifiée).
   - Anciennes variables `SUPABASE_SERVICE_ROLE_KEY` / `VITE_SUPABASE_ANON_KEY` **conservées**.
3. **GitHub → Secrets → Actions** : ✅ `SUPABASE_SERVICE_ROLE_KEY_NEW` créé (24/11) ; `SUPABASE_SERVICE_ROLE_KEY` (legacy) conservé.
   - À l'étape de swap (après run CI vert), pointer les workflows sur `SUPABASE_SERVICE_ROLE_KEY_NEW`.

### Étape 2 — Déployer le code (backend d'abord, puis frontend)

#### 2a. Dry-run transactionnel de la migration Vault (SQL Editor write-capable)

```sql
BEGIN;
SET LOCAL check_function_bodies = on;  -- force la validation du corps PL/pgSQL

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

Si le dry-run passe (aucune erreur de syntaxe ni de référence d'objet), ré-exécuter le même
bloc **sans** `BEGIN; … ROLLBACK;` pour appliquer réellement. Le `CREATE OR REPLACE FUNCTION`
est idempotent.

#### 2b. Ordre de bascule — les Edge Functions acceptent les nouvelles clés AVANT les webhooks SQL

L'ordre est imposé pour éviter qu'un appelant SQL (pg_net) envoie une clé `sb_secret_*` à une
Edge Function qui ne sait pas encore la lire :

1. **Déployer les Edge Functions** (elles lisent déjà `SUPABASE_SECRET_KEYS`/`SUPABASE_PUBLISHABLE_KEYS`) :
   ```bash
   supabase functions deploy send-lead-notification --no-verify-jwt --project-ref ygvsddcpohsnaowofuwc
   supabase functions deploy sender-add-contact    --no-verify-jwt --project-ref ygvsddcpohsnaowofuwc
   supabase functions deploy scpi-scoring          --no-verify-jwt --project-ref ygvsddcpohsnaowofuwc
   ```
   > `--no-verify-jwt` impose `legacyJwt=false` : la garde est la SEULE auth (fail-closed).
2. **Vérifier** que `sender-add-contact` accepte une clé secrète (curl smoke test) et rejette
   une clé publishable (401/503).
3. **Appliquer la migration Vault** (2a) — désormais la clé `pgnet_webhooks` envoyée par
   pg_net sera acceptée par `sender-add-contact`.
4. **Réactiver le trigger pg_net** uniquement si le flux est réutilisé (actuellement absent).
5. **Déployer le frontend Netlify** (clé publishable injectée).

> Les fonctions restantes conservent leur modèle d'authentification inchangé : elles ne
> changent que la *source* de la clé de service (`scpi_agents`). Les deux fonctions OIDC
> (`maximus-agent-audit-oidc`, `maximus-scpi-ocr-oidc`) gardent leur vérification JWT GitHub
> OIDC et ne passent pas en `verify_jwt = false`.

### Étape 3 — Vérifier après bascule

- Formulaires de leads (PDF, simulateur) → insertion + notification + ajout Brevo.
- Calendly → webhook `calendly-webhook` + `send-lead-notification`.
- Simulations → `send-simulation-email`.
- Agents SCPI → `scpi-agents` (scoring, certification, watch).
- Comparateur → hydratation PostgREST via `apikey`.
- 69/69 PASS_100 toujours intact.

### Étape 4 — Désactivation des clés legacy (dernier, après stabilisation)

1. Révoquer `anon` et `service_role` dans **Dashboard → Settings → API Keys**.
2. Faire pivoter le **JWT secret** (Settings → Auth → JWT) conformément à la doc officielle
   (migration asymétrique pour ne pas déconnecter les sessions utilisateurs).

---

## 6. Rollback

- **Frontend** : re-déployer la version précédente (les clés legacy restent actives jusqu'à l'Étape 4).
- **Edge Functions** : deux options selon la cause de l'échec :
  - Si les clés nouvelles restent configurées, les gardes continuent d'accepter les clés
    `sb_publishable_*`/`sb_secret_*` (aucune action).
  - Pour revenir au modèle legacy (`verify_jwt` actif), redéployer **sans** `--no-verify-jwt`
    ET avec `legacyJwt: true` (les gardes redeviennent des no-op seulement si les variables
    de clés sont absentes). Le repli `SUPABASE_SERVICE_ROLE_KEY` reste fonctionnel tant que
    la clé legacy n'est pas révoquée.
- **Netlify `lead-fallback`** : `SUPABASE_SERVICE_ROLE_KEY_NEW` est déjà le premier choix ;
  supprimer cette variable revient au repli `SUPABASE_SERVICE_ROLE_KEY` sans redéploiement.
- **pg_net (rollback SQL)** — restaurer l'ancienne fonction à JWT en dur si le flux
  réactivé exigeait l'ancien mécanisme :
  ```sql
  CREATE OR REPLACE FUNCTION public.notify_sender_new_pdf_lead()
  RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
  AS $function$
  DECLARE request_id bigint; payload jsonb; api_key text;
  BEGIN
    api_key := current_setting('app.settings.service_role_key', true);
    payload := jsonb_build_object(
      'email', NEW.email, 'firstname', COALESCE(NEW.prenom, ''),
      'lastname', COALESCE(NEW.nom, ''), 'group_id', 'LM_SCPI_SansFrais',
      'fields', jsonb_build_object('source', COALESCE(NEW.source, 'Guide Comparatif PDF'),
                                   'date_telechargement', NEW.created_at::text)
    );
    SELECT net.http_post(
      url := 'https://ygvsddcpohsnaowofuwc.supabase.co/functions/v1/sender-add-contact',
      headers := jsonb_build_object('Content-Type', 'application/json',
                                    'apikey', api_key),
      body := payload
    ) INTO request_id;
    RETURN NEW;
  END;
  $function$;
  ```
- Aucune donnée n'est transformée : les rollbacks sont des restaurations de code/config.

---

## 7. Bascule service par service (variables temporaires distinctes)

Pour ne jamais remplacer un secret de production avant validation, la bascule est **staged**
par consommateur, avec des variables temporaires dédiées :

| Ordre | Consommateur | Variable temp. (nouvelle clé) | Variable legacy conservée | Bascule |
|---|---|---|---|---|
| 1 | `scpi_agents` (15 Edge Fn : 13 `readServiceKey` + 2 OIDC inline) | `SUPABASE_SECRET_KEYS["scpi_agents"]` (auto) | `SUPABASE_SERVICE_ROLE_KEY` | repli automatique (`readServiceKey` / résolution inline) |
| 2 | `netlify` | `SUPABASE_SERVICE_ROLE_KEY_NEW` | `SUPABASE_SERVICE_ROLE_KEY` | swap manuel après test de `lead-fallback` |
| 3 | `github_actions` | `SUPABASE_SERVICE_ROLE_KEY_NEW` | `SUPABASE_SERVICE_ROLE_KEY` | swap manuel après un run CI vert |
| 4 | Frontend (Vite) | `VITE_SUPABASE_ANON_KEY_NEW` | `VITE_SUPABASE_ANON_KEY` | swap manuel après vérif comparateur |
| 5 | `pgnet_webhooks` (Vault) | secret Vault `pgnet_webhooks` | `app.settings.service_role_key` | n/a tant que le trigger n'est pas réactivé |

**Règle** : chaque étape introduit la nouvelle clé sous une variable distincte, valide
(smoke test), puis supprime l'ancienne. On ne révoque la clé legacy globale (`anon` /
`service_role`) qu'à l'Étape 4, une fois toutes les surfaces validées.

---

## 8. Réconciliation de l'historique des migrations SQL

### 8.1 Constat

- **Production** (`supabase_migrations.schema_migrations`) : 305 versions appliquées, la
  dernière étant `20261124082433` (`fix_buroboutic_t3_tof_proof_valid_grant`, commit
  `8cde850b` / PR #455).
- **Dépôt local** : 159 fichiers à préfixe timestamp 14 chiffres + 151 fichiers à nom
  descriptif (sans préfixe). Les timestamps locaux (ex. `20260925090000_…`) **ne
  correspondent pas** aux versions appliquées (ex. `20260925065915 create_scpi_indicator_history`).
- Le fichier local `20261123_fix_buroboutic_t3_tof_proof_valid_grant.sql` (8 chiffres) ne
  correspond pas à la version appliquée `20261124082433` : nom appliqué régénéré hors CLI.

**Conclusion : l'historique local et la base sont divergents** (migrations appliquées via
SQL Editor avec timestamps régénérés, pas via `supabase db push`).

### 8.2 Conséquence opérationnelle

`supabase db push` est **dangereux** ici : il rejouerait ~159 migrations locales considérées
« manquantes » alors qu'elles sont déjà appliquées sous d'autres versions. **Ne pas l'utiliser.**

### 8.3 Déploiement sûr de la migration

Appliquer la migration **isolément** via SQL Editor (write-capable), jamais par `db push`.
C'est un `CREATE OR REPLACE FUNCTION` idempotent.

### 8.4 Dry-run (à exécuter en write-capable, AVANT application réelle)

```sql
BEGIN;
SET LOCAL check_function_bodies = on;   -- force la validation du corps PL/pgSQL
<contenu de 20261124160300_migrate_pgnet_trigger_to_vault.sql>
ROLLBACK;                                 -- annule : ne persiste rien
```

- Le dry-run vérifie la syntaxe et les références d'objets (`net.http_post` et
  `vault.decrypted_secrets` **existent** — confirmé en lecture seule), sans persister.
- Le MCP Supabase de cette session est en **lecture seule** (`read_only=true`) : le dry-run
  ci-dessus doit être lancé depuis le SQL Editor du dashboard (write-capable).

### 8.5 Trigger pg_net absent en production

Vérification en base (lecture seule) : **aucun trigger** sur `leads_pdf_comparatif` et
**aucune** fonction `notify_*` dans `public`. Le flux de capture actuel appelle directement
les Edge Functions `sender-add-contact` / `send-lead-notification` depuis le frontend (pas de
pg_net). La migration pg_net est donc **sans effet runtime** (fonction orpheline), mais
préserve le patron Vault pour l'avenir. ✅ Le secret Vault `pgnet_webhooks` est **enregistré**
(confirmé présent le 2026-11-24) ; il ne sera consommé que si ce flux est réactivé.

---

## 9. Sécurité et non-négociables

- Aucune valeur de clé n'est reproduite dans ce runbook, les logs, le chat ou le dépôt.
  Le scan de secrets (commit `cc2c42fb` + working tree) ne remonte **aucune** clé réelle
  (`sb_publishable_*`/`sb_secret_*`), **aucun** JWT `eyJ…` dans le code hors migrations
  legacy de projet supprimé.
- `verify_jwt` n'est jamais désactivé sans garde testée (`requireApiKey`/`requirePublishableKey`/
  `requireSecretKey`) et sans clés configurées.
- Les clés legacy sont **révoquées en dernier**, uniquement après validation complète.
- Aucune nouvelle SCPI, aucun nouvel orchestrateur, aucune régression des 69/69.

---

## 10. Checklist finale par service (avant fusion)

| Service | Action | Variable nouvelle | Garde / auth | Statut |
|---|---|---|---|---|
| Frontend Vite (PostgREST) | `restHeaders`/`functionHeaders` sur `apikey` | `VITE_SUPABASE_ANON_KEY_NEW` | clé publishable | ✅ code + test |
| Frontend Vite (`scpi-scoring` simulation) | `functionHeaders` sur `apikey` | `VITE_SUPABASE_ANON_KEY_NEW` | `requirePublishableKey` | ✅ code + test |
| `scpi-scoring` persistance (`save_to_db`) | `readServiceKey(scpi_agents)` | `SUPABASE_SECRET_KEYS["scpi_agents"]` | `requireSecretKey` | ✅ code + test |
| `send-lead-notification` | `requireApiKey` | publishable OU secret | `requireApiKey` (`legacyJwt=false`) | ✅ code |
| `sender-add-contact` | `requireApiKey` | publishable OU secret | `requireApiKey` (`legacyJwt=false`) | ✅ code |
| Netlify `lead-fallback` | envoi `apikey` | `SUPABASE_SERVICE_ROLE_KEY_NEW` → repli legacy | clé secrète | ✅ code |
| GitHub Actions (3 workflows) | `SUPABASE_SERVICE_ROLE_KEY_NEW` | secret créé (24/11) | clé secrète | ✅ secret présent ; swap après run vert |
| pg_net → Vault (`notify_sender_new_pdf_lead`) | `vault.decrypted_secrets` `pgnet_webhooks` | secret Vault `pgnet_webhooks` | `apikey` (plus de Bearer) | ✅ migration prête ; dry-run §2a |
| 15 Edge Fn `scpi_agents` | `readServiceKey(…, "scpi_agents")` | `SUPABASE_SECRET_KEYS["scpi_agents"]` | repli `SUPABASE_SERVICE_ROLE_KEY` | ✅ code |
| 2 OIDC (audit + ocr) | résolution inline | `SUPABASE_SECRET_KEYS["scpi_agents"]` | JWT GitHub OIDC conservé | ✅ contrats PASS |
| Calendly HTML | placeholders injectés au build | `VITE_SUPABASE_ANON_KEY_PLACEHOLDER` | clé publishable | ✅ code |

**Non-fusion / non-révocation** : la PR reste **non fusionnée**, aucune clé legacy n'est
révoquée, aucun `db push` global, 69/69 PASS_100 maintenu.
