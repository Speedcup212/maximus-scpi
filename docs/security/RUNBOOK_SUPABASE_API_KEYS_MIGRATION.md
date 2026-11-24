# Runbook — Migration des clés API Supabase (legacy JWT → `sb_publishable` / `sb_secret`)

> Branche de travail : `security/api-key-migration-20261124`
> Projet Supabase : `ygvsddcpohsnaowofuwc` (MaximusSCPI)
> Statut : **préparation** — aucune clé legacy n'est révoquée tant que la bascule n'est pas validée.
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
| `github_actions` | Workflows CI (3 fichiers) | GitHub → Repo → **Settings → Secrets and variables → Actions** | secret `SUPABASE_SERVICE_ROLE_KEY` (remplace la valeur legacy) |
| `netlify` | Netlify Functions + plugin de release | Netlify → Site → **Site configuration → Environment variables** | `SUPABASE_SERVICE_ROLE_KEY` (scopes Build **et** Functions) |
| `scpi_agents` | 15 Edge Functions backend | **Aucune saisie** — déjà dans `SUPABASE_SECRET_KEYS` | lue par le code : `SUPABASE_SECRET_KEYS["scpi_agents"]` |
| `pgnet_webhooks` | Trigger PostgreSQL `notify_sender_new_pdf_lead()` via `pg_net` | Supabase → **Database → Vault → Secrets → Add a new secret** | nom de secret Vault : `pgnet_webhooks` |

### 2.2 La clé publishable

| Consommateur | Interface | Variable |
|---|---|---|
| Frontend (Vite) | Netlify → **Site configuration → Environment variables** | `VITE_SUPABASE_ANON_KEY` (valeur = `sb_publishable_…`) |

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
- `auth.ts` → `requirePublishableKey` (frontend-only) et `requireApiKey`
  (frontend + backend pg_net/Netlify). En mode legacy, ces gardes sont des **no-op** :
  elles ne s'activent que lorsqu'une clé est présente dans `SUPABASE_PUBLISHABLE_KEYS`
  / `SUPABASE_SECRET_KEYS`.

15 fonctions migrées vers `readServiceKey(…, "scpi_agents")` :
`scpi-scoring`, `send-simulation-email`, `calendly-webhook`, `scpi-certified-promote`,
`scpi-news-watch`, `scpi-evidence-certify`, `scpi-bulletin-watch`, `scpi-source-link-inspect`,
`scpi-annual-safe-extract`, `scpi-annual-report-backfill`, `maximus-scpi-ocr-oidc`,
`maximus-agent-audit-oidc`, `scpi-release-certification-oidc`, `scpi-corum-document-oidc`,
`scpi-bulletin-replay-oidc`.

Garde `requireApiKey` ajoutée aux fonctions appelées par plusieurs consommateurs :
`send-lead-notification` (frontend + Netlify `lead-fallback`) et `sender-add-contact`
(frontend + pg_net).

### 3.3 PostgreSQL — pg_net via Vault

Migration `supabase/migrations/20261124000000_migrate_pgnet_trigger_to_vault.sql` :
`notify_sender_new_pdf_lead()` lit `pgnet_webhooks` depuis `vault.decrypted_secrets` et
envoie `apikey` (plus de `Authorization: Bearer`). **La clé `service_role` en dur du
projet supprimé `eldvbqqgelifxkybytip` est éliminée.**

### 3.4 Netlify — `lead-fallback`

`netlify/functions/lead-fallback.ts` envoie désormais `apikey` (clé `netlify`) vers
`send-lead-notification`, avec repli sans en-tête pour rester compatible transitoirement.

### 3.5 Page HTML Calendly

`public/merci-landing-page.calendly.html` : la clé anon en dur est remplacée par les
placeholders `VITE_SUPABASE_URL_PLACEHOLDER` / `VITE_SUPABASE_ANON_KEY_PLACEHOLDER`,
injectés au build par `scripts/inject-env-vars.js` (mécanisme déjà existant).

---

## 4. Tests de compatibilité

- `src/tests/supabaseAuthHeaders.test.ts` — 19 tests : les helpers frontend ne produisent
  plus de `Authorization: Bearer`, la résolution des clés nommées (`scpi_agents`, `default`,
  repli legacy), et les gardes `requirePublishableKey` / `requireApiKey`.
- Commande : `npx vitest run src/tests/supabaseAuthHeaders.test.ts`.
- Vérification statique : `git grep 'Bearer ${' src` ne doit plus remonter d'en-tête anon.

---

## 5. Procédure de bascule (P3 — validée avant exécution, aucune révocation automatique)

> Toutes les étapes ci-dessous sont **gated** : à n'exécuter qu'après validation finale de l'utilisateur.

### Étape 0 — Vérifier les prérequis
1. 69/69 PASS_100 confirmé (watchdog `strict_fail = 0`).
2. Clés `sb_publishable` + 4 `sb_secret` créées (fait).

### Étape 1 — Enregistrer les clés dans les interfaces (actions manuelles dashboard)

1. **Supabase Vault** : secret `pgnet_webhooks` = valeur de la clé `pgnet_webhooks`.
2. **Netlify → Environment variables** :
   - `SUPABASE_SERVICE_ROLE_KEY` = valeur de la clé `netlify`.
   - `VITE_SUPABASE_ANON_KEY` = valeur de la clé publishable.
3. **GitHub → Secrets → Actions** :
   - `SUPABASE_SERVICE_ROLE_KEY` = valeur de la clé `github_actions`.
   - `VITE_SUPABASE_ANON_KEY` = valeur de la clé publishable.

### Étape 2 — Déployer le code (backend d'abord, puis frontend)

1. `supabase db push` (applique la migration pg_net Vault) — **après** l'Étape 1.1.
2. Redéployer les Edge Functions modifiées avec `--no-verify-jwt` (uniquement celles qui
   utilisent `requireApiKey` / `requirePublishableKey`) :
   - `send-lead-notification`, `sender-add-contact`, `scpi-scoring`.
3. Déployer le frontend (Netlify) avec la clé publishable injectée.

> Les 12 autres Edge Functions restent en `verify_jwt` inchangé : elles ne changent que
> la *source* de la clé de service (`scpi_agents`), pas leur modèle d'authentification.

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
- **Edge Functions** : les gardes `requireApiKey`/`requirePublishableKey` redeviennent des
  no-op si `SUPABASE_PUBLISHABLE_KEYS`/`SUPABASE_SECRET_KEYS` sont absentes ; le repli
  `SUPABASE_SERVICE_ROLE_KEY` reste fonctionnel tant que la clé legacy n'est pas révoquée.
- **pg_net** : re-créer la fonction avec `current_setting('app.settings.service_role_key')`
  (l'ancienne migration) tant que le secret Vault n'est pas supprimé.
- Aucune donnée n'est transformée : les rollbacks sont des restaurations de code/config.

---

## 7. Sécurité et non-négociables

- Aucune valeur de clé n'est reproduite dans ce runbook, les logs, le chat ou le dépôt.
- `verify_jwt` n'est jamais désactivé sans le garde `requireApiKey`/`requirePublishableKey` testé.
- Les clés legacy sont **révoquées en dernier**, uniquement après validation complète de la bascule.
- Aucune nouvelle SCPI, aucun nouvel orchestrateur, aucune régression des 69/69.
