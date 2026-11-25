# Handoff — Bascule Supabase (Cursor exécute, ChatGPT contrôle)

> Objet : exécution des étapes Supabase de la migration clés API (déploiement Edge Functions + migration Vault).
> Exécutant : Cursor / DeepSeek (ticket #459). Contrôle indépendant : ChatGPT (commentaires #459).
> Date : 2026-11-24 (révision 3 — réconcilié avec l'inventaire réel de production via logs + observation ChatGPT).
> Statut : **PR #457 fusionnée** (`main`), **compteur 69/69 PASS_100 maintenu**, **PR #458 non fusionnée**.

---

## 0. État réel de `verify_jwt` par famille (corrigé vs révision 2)

L'inventaire réel (logs `function_edge_logs` + observation ChatGPT) montre que **toutes
les fonctions ne sont pas à `verify_jwt=false`** comme l'affirmait la révision 2 :

| Famille | `verify_jwt` en prod | Mécanisme d'authentification effectif |
|---|---|---|
| Cron / ingestion | **false** | en-tête `x-cron-token` / `x-annual-token` comparé au SHA-256 de `scpi_bulletin_runtime_config` |
| GitHub OIDC | **false** | `jwtVerify` OIDC (issuer GitHub, audience + `workflow_ref` + `repository_id` épinglés) |
| Webhook Calendly | **false** | HMAC-SHA256 `calendly-webhook-signature` (`CALENDLY_WEBHOOK_SIGNING_KEY`) |
| `send-simulation-email` | **false** | contrôles serveur (request_id UUID, <15 min, ≤3/24 h, champs bornés) |
| **`sender-add-contact`** | **true** (v7, constaté ChatGPT 24-25/11) | prod lit encore directement la clé legacy ; la garde `requireApiKey` (`legacyJwt:false`) n'est **pas encore** déployée en prod |
| `send-lead-notification` | **false** (v17, constaté ChatGPT 25/11) | prod lit encore directement la clé legacy ; garde `requireApiKey` non déployée |
| `scpi-scoring` | non déployée | — |

**Conséquence** : pour que le frontend bascule sur la clé publishable `sb_publishable_*`
(non JWT), les fonctions `sender-add-contact` et `send-lead-notification` doivent être
déployées avec `--no-verify-jwt` **au moment où** la garde `requireApiKey` + les variables
`SUPABASE_PUBLISHABLE_KEYS`/`SUPABASE_SECRET_KEYS` sont actives, **en coordination avec le
swap anon frontend** — sinon `verify_jwt=true` rejette la clé publishable (non JWT).

**Règle de déploiement** : les **14 fonctions backend** (cron/OIDC/Calendly/serveur) se
déploient avec `--no-verify-jwt` pour **préserver** `verify_jwt=false` (déployer sans le
flag les ferait repasser à `true` et casserait cron/OIDC/Calendly). Les **2 fonctions lead**
(`sender-add-contact`, `send-lead-notification`) se déploient avec `--no-verify-jwt`
**uniquement dans le lot coordonné** de bascule du frontend sur la clé publishable.

> `verify_jwt=true` reste exigé pour `client-access-admin` et `client-surveillance`
> (`withSupabase({ auth: "user" })`) — hors périmètre de cette migration.

### 0.1 Fonctions déployées SANS source dans le dépôt (inventaire logs 4 jours)

Les logs révèlent 5 fonctions **invoquées en production** dont le code n'existe **ni dans
`supabase/functions/` ni dans l'historique git** (déployées hors dépôt) :

| Fonction | Dernière version observée | Appelant observé |
|---|---|---|
| `scpi-parallel-backfill-worker` | v8 (logs) / v11 (source) | `pg_net` |
| `scpi-parallel-discover-worker` | v7 (logs) / v11 (source) | `pg_net` |
| `scpi-annual-source-discover` | v9 | (non déterminé) |
| `scpi-norma-quarterly-ingest` | v7 (logs) / v11 (source) | (non déterminé) |
| `maximus-watchdog-oidc` | v7 | GitHub Actions OIDC (`maximus-watchdog.yml`) |

**Conséquence** : ces fonctions ne sont **pas** modifiables/restaurables depuis le dépôt
actuel. Leur consommation éventuelle de la clé legacy n'est pas vérifiable sans récupérer
leur source. À **traiter avant révocation** (les identifier via `supabase functions list`
puis récupérer/archiver leur source), sinon la révocation pourrait les casser sans
possibilité de rollback depuis le repo.

**Lecture de la source réellement déployée (contrôle ChatGPT 25/11, `get_edge_function`)** :

| Fonction | Consommation de clé (source déployée) | Verdict migration |
|---|---|---|
| `scpi-parallel-backfill-worker` (v11) | lit **directement** `SUPABASE_SERVICE_ROLE_KEY` | ❌ à migrer avant révocation |
| `scpi-parallel-discover-worker` (v11) | lit **directement** `SUPABASE_SERVICE_ROLE_KEY` | ❌ à migrer avant révocation |
| `scpi-annual-source-discover` (v9) | lit **directement** `SUPABASE_SERVICE_ROLE_KEY` | ❌ à migrer avant révocation |
| `scpi-norma-quarterly-ingest` (v11) | lit **directement** `SUPABASE_SERVICE_ROLE_KEY` | ❌ à migrer avant révocation |
| `maximus-watchdog-oidc` (v7) | `SUPABASE_DB_URL` (aucune référence directe aux deux familles de clés dans les fichiers récupérés) | ⚠️ vérifier dépendances indirectes |

> **BLOQUANT révocation** : les **4** fonctions `scpi-parallel-backfill-worker`,
> `scpi-parallel-discover-worker`, `scpi-annual-source-discover`,
> `scpi-norma-quarterly-ingest` lisent **directement** `SUPABASE_SERVICE_ROLE_KEY` (legacy)
> et ne passent pas par `readServiceKey`/`SUPABASE_SECRET_KEYS`. Tant qu'elles ne sont pas
> migrées et testées, **la révocation de la clé legacy est interdite** (elle les casserait
> sans rollback possible depuis le repo). Leurs sources sont **récupérables** via le
> connecteur ChatGPT. Réintégration fidèle au dépôt à préparer, avec rollback basé sur les
> **bundles effectivement déployés** (pas uniquement un ancien commit).

---

### 0.2 État d'avancement du déploiement (journal 25/11)

Exécution Supabase **réservée à ChatGPT** (dérogation de responsabilité ; Cursor conserve
GitHub/Netlify + tests + manifeste). **Option A retenue (Q2, ChatGPT 25/11)** : épingler le
code et les dépendances au SHA de la branche validée (`74e87e93`), **sans fusion préalable**
de #458. Le module partagé `_shared/serviceKey.ts` instrumenté (`[key-source]`) **doit être
inclus dans chaque bundle déployé** ; un log de résolution ne prouve pas à lui seul le
succès des appels.

| Fonction | Statut | Version | Notes |
|---|---|---|---|
| `scpi-source-link-inspect` | ✅ déployée (24/11) | v12 | `verify_jwt=false` conservé |
| `scpi-evidence-certify` | ✅ déployée (25/11) | v8→v9 | `verify_jwt=false` conservé ; **drift `matcher.mjs` conservé (voir §2.6)** |
| `scpi-news-watch` | ✅ déployée (25/11) | v17→v18 | test positif non validé (voir §0.4 : fausse alerte de jeton) |
| `scpi-bulletin-watch` | ✅ déployée (25/11) | v107→v108 | `sourceProvenance.mjs` prod conservé |
| `scpi-annual-safe-extract` | ✅ déployée (25/11) | v11→v12 | — |
| `scpi-annual-report-backfill` | ✅ déployée (25/11) | v10→v11 | — |
| 7 fonctions backend restantes (§2.7.3) | ⏳ en attente | — | `--no-verify-jwt` |
| `scpi-certified-promote` | ⚠️ **patch clé uniquement requis** | v12 (prod) | outillé et vérifié (§2.8) |
| `sender-add-contact` / `send-lead-notification` | ⏳ lot coordonné (§2.1) | — | avec swap anon frontend |
| 5 fonctions sans source dans le dépôt | ❌ à réintégrer avant révocation | — | hors périmètre (§2.7.2) |

**Avancement réconcilié (vérifié par test, §2.7.1) : 6 déployées + 7 restantes + 1 patch
clé-seule + 2 lot coordonné = 16/16 du périmètre initial**, plus **5** consommateurs/proches
hors périmètre qui bloquent la révocation (§2.7.2).

---

### 0.3 Plan de réintégration des 5 fonctions orphelines (hors dépôt)

Ces fonctions n'existent **ni** dans `supabase/functions/` **ni** dans l'historique git. Leur
réintégration est un **prérequis bloquant à la révocation** de la clé legacy (§0.1). Elle se
fait **fidèlement au dépôt** et **jamais** à l'aveugle : la source réellement déployée sert
de base de vérité, pas un commit ancien.

**Ordre (exécution Supabase = ChatGPT ; préparation/relecture = Cursor)** :

1. **Récupérer** chaque source via `get_edge_function` (déjà partiellement fait pour
   l'analyse des clés) et la **committer** dans `supabase/functions/<name>/` (avec ses
   dépendances locales — `_shared`, fichiers `.mjs` — fidèles au bundle déployé).
2. **Migrer** la résolution de clé : remplacer toute lecture directe
   `Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")` par `readServiceKey((k) => Deno.env.get(k), name)`
   depuis `_shared/serviceKey.ts` (instrumentée `[key-source]`, repli legacy transitoire).
   Pour `maximus-watchdog-oidc` : auditer les **dépendances indirectes** de `SUPABASE_DB_URL`
   (aucune famille de clés en lecture directe constatée, à confirmer avant toute action).
3. **Tester** en positif/négatif : appel authentifié → 200 ; clé manquante/incorrecte →
   401/503 fail-closed ; aucun repli legacy observé dans les logs (`[key-source]`).
4. **Redéployer** `--no-verify-jwt` (ou en conservant le `verify_jwt` constaté) et vérifier
   l'incrément de version.
5. **Rollback** : basé sur le **bundle effectivement déployé** (récupéré à l'étape 1),
   pas sur un commit ancien — restaurer le bundle de prod en cas de régression.

> **Règle** : tant que les 4 consommateurs (`scpi-parallel-backfill-worker`,
> `scpi-parallel-discover-worker`, `scpi-annual-source-discover`,
> `scpi-norma-quarterly-ingest`) n'ont pas basculé sur `readServiceKey`/`SUPABASE_SECRET_KEYS`
> **et** été testés en production, **ne pas révoquer** `SUPABASE_SERVICE_ROLE_KEY`.

---

### 0.4 Divergence jeton `scpi-news-watch` — FAUSSE ALERTE (résolu 25/11)

Constat ChatGPT (test 78904) : `scpi-news-watch` renvoie 401 quand on l'appelle avec le
**secret Vault `scpi_news_cron_token`**. Diagnostic Cursor (lecture seule SQL + historique) :

1. **Appelant réel** : le cron `scpi-news-watch-daily` (`cron.job` jobid 1, `15 5 * * *`,
   `active=true`) appelle la fonction avec l'en-tête
   `x-cron-token` = `(select value from scpi_news_runtime_config where key='cron_token_plain')`
   (migration `20260922100100_scpi_news_monitoring.sql`, inchangée depuis le 22/09).
2. **Cohérence vérifiée** : `encode(extensions.digest(cron_token_plain,'sha256'),'hex')
   = cron_token_sha256` → **`true`** (les deux clés sont cohérentes, créées ensemble le
   22/09 09:47:21). Le mécanisme d'authentification du cron est **sain**.
3. **Le secret Vault `scpi_news_cron_token`** (créé 09:44:56) est un **artefact dormant**,
   **non référencé** par le cron actuel. Il ne correspond pas à `cron_token_sha256` —
   c'est attendu : ce n'est **pas** le jeton utilisé par l'appelant réel.
4. **Le 401 du test ChatGPT est donc un faux positif** : il a testé avec la mauvaise source
   (Vault) au lieu du `cron_token_plain` de `scpi_news_runtime_config`.

**Conclusion : aucune modification de config à faire.** Ne **pas** tourner/écrire le jeton
news à l'aveugle. Le test positif doit être refait avec le `cron_token_plain` du runtime
config (sans exposer sa valeur), ou considéré validé par la cohérence `true` + le cron actif.
Le secret Vault `scpi_news_cron_token` est à documenter comme dormant (aucune action de
rotation pendant la migration des clés).

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

### 2.1 Fonctions lead avec garde `apikey` (2 fonctions — bascule COORDONNÉE)

Ces 2 fonctions embarquent (dans le repo, post-#457) `requireApiKey` avec `{ legacyJwt: false }`
et **ne lisent plus** `SUPABASE_SERVICE_ROLE_KEY` (elles n'utilisent que `RESEND_API_KEY` /
`BREVO_API_KEY`). En production, leurs versions déployées lisent **encore** directement la
clé legacy. État prod constaté (ChatGPT 25/11) : `sender-add-contact` v7 = `verify_jwt=true`,
`send-lead-notification` v17 = `verify_jwt=false`. Le passage à la clé publishable
`sb_publishable_*` (non JWT) exige de **redéployer** ces fonctions avec la garde + les clés
nouvelles, `sender-add-contact` passant à `verify_jwt=false` **en même temps** que le swap
anon frontend — jamais en avance (sinon `verify_jwt=true` rejetterait la nouvelle clé) ni
en retard. Ne pas désactiver une garde sans vérifier la protection applicative et les refus
d'accès effectifs.

| Fonction | Garde | Accepte | Dépendance partagée | `verify_jwt` prod |
|---|---|---|---|---|
| `send-lead-notification` | `requireApiKey` | publishable **OU** secret | `_shared/auth.ts` | **false** (v17, constaté 25/11) |
| `sender-add-contact` | `requireApiKey` | publishable **OU** secret | `_shared/auth.ts` | **true** (v7, constaté) |

Commande (lot coordonné avec le swap anon frontend, §6) :

```bash
supabase functions deploy send-lead-notification --no-verify-jwt --project-ref ygvsddcpohsnaowofuwc
supabase functions deploy sender-add-contact    --no-verify-jwt --project-ref ygvsddcpohsnaowofuwc
```

> ⚠️ Ne déployer `--no-verify-jwt` QUE si les variables `SUPABASE_PUBLISHABLE_KEYS` /
> `SUPABASE_SECRET_KEYS` sont bien injectées, sinon ces fonctions renvoient **503**
> (`authentication_not_configured`, fail-closed). Le basculement à `verify_jwt=false`
> **supprime** la validation JWT plateforme : la garde `apikey` devient la SEULE
> authentification — à activer uniquement dans le lot coordonné (§6), jamais seul.

> `scpi-scoring` reste **non déployé** (cf. §2.4) : hors lot obligatoire.

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
| `send-lead-notification` | `supabase/functions/send-lead-notification/index.ts` | `_shared/auth.ts` | ✅ | **false** (v17, constaté 25/11) | `requireApiKey` (publishable OU secret) |
| `sender-add-contact` | `supabase/functions/sender-add-contact/index.ts` | `_shared/auth.ts` | ✅ | **true** (v7, constaté) → false (lot coordonné) | `requireApiKey` (publishable OU secret) |
| `scpi-scoring` | `supabase/functions/scpi-scoring/index.ts` | `_shared/auth.ts`, `_shared/serviceKey.ts` | ❌ | — (non déployée) | `requirePublishableKey` / `requireSecretKey` |

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

### 2.6 Drift `matcher.mjs` de `scpi-evidence-certify` (à réconcilier séparément)

Lors du déploiement v9 de `scpi-evidence-certify` (ChatGPT 25/11), un écart a été constaté
entre le `matcher.mjs` du dépôt et celui effectivement déployé en production :

- **Dépôt** : blob `de01e6c2466701c6e250b00d3fa1312b5d1b9bc5` (13165 octets, LF, 309 lignes),
  `MATCHER_REVISION = "2026-11-10-explicit-zero-unit-consistent"`. Identique sur `main`
  (`675ab161`), `dfc6b309` et la branche #458 (`74e87e93`).
- **Production (v8)** : `matcher.mjs` = **13136 caractères / 13355 octets UTF-8** (lecture
  `get_edge_function`, ChatGPT 25/11). SHA-256 sur contenu UTF-8 exact :
  `88c46bc36396a1906db5b5a625f1e336d81036a22101990e527dcc7414623b8c`.
  Empreinte du bundle (distincte) : `e8b532ae590aff173759a2b8662c6355a5f0bcecac9d4e21b16c68180cca69bb`.
- Écart : ~29 caractères de moins en prod que dans le dépôt (à comparer **en octets**, pas
  en nombre de caractères, avant de conclure).

**Décision conservatoire (déjà appliquée par ChatGPT)** : le bundle v9 **conserve
strictement** le `matcher.mjs` v8 de prod (13136 caractères), pour ne pas introduire de
modification métier pendant la migration des clés. Seuls `index.ts` (lignes de résolution
de clé + import) et `_shared/serviceKey.ts` instrumenté diffèrent du v8.

**À réconcilier séparément (hors chemin critique des clés)** :
1. Récupérer le `matcher.mjs` **réellement déployé** (13136 car.) via le connecteur ChatGPT
   et le **réintégrer au dépôt** (ou déterminer la nature exacte des 29 caractères d'écart).
2. Ne **jamais écraser** le matcher de prod avec la version dépôt sans avoir tranché
   l'écart : le contenu de prod peut porter une correction métier absente du dépôt (ou
   l'inverse — le dépôt peut porter les règles RECOVERY-200 de zéro explicite jamais
   déployées). Comparer d'abord, décider ensuite.
3. Toute évolution du matcher relève d'un chantier distinct, hors migration des clés.

### 2.7 Manifeste machine-vérifiable : périmètre réconcilié, rollback exact, preuve par fonction

Le manifeste n'est plus un tableau en prose : il est **calculé depuis les sources du dépôt**
par `scripts/security/edgeFunctionDeploymentManifest.mjs`, validé par 21 tests
(`scripts/security/edgeFunctionDeploymentManifest.test.mjs`) et **bloquant en CI**.

```bash
node --test scripts/security/edgeFunctionDeploymentManifest.test.mjs
node scripts/security/edgeFunctionDeploymentManifest.mjs --check   # échoue si dérive
```

#### 2.7.1 Décompte réconcilié (16 = 6 + 7 + 1 + 2)

Le contrôle indépendant du 25/11 signalait un décompte incohérent (« 6/16 + 7 + 1 = 14 »).
La réconciliation est désormais **explicite et testée** :

| État | Nombre | Fonctions |
|---|---|---|
| `DEPLOYED` | **6** | `scpi-source-link-inspect` v12, `scpi-evidence-certify` v9, `scpi-news-watch` v18, `scpi-bulletin-watch` v108, `scpi-annual-safe-extract` v12, `scpi-annual-report-backfill` v11 |
| `PENDING_DEPLOY` | **7** | `calendly-webhook`, `send-simulation-email`, `scpi-release-certification-oidc`, `scpi-corum-document-oidc`, `scpi-bulletin-replay-oidc`, `maximus-agent-audit-oidc`, `maximus-scpi-ocr-oidc` |
| `PENDING_KEY_ONLY_PATCH` | **1** | `scpi-certified-promote` (§2.8) |
| `PENDING_COORDINATED_LOT` | **2** | `send-lead-notification`, `sender-add-contact` (§2.1) |
| **Total périmètre initial** | **16** | — |

**Les deux fonctions qui manquaient au décompte** sont précisément les deux du **lot lead
coordonné** (`send-lead-notification`, `sender-add-contact`) : elles n'étaient comptées ni
dans « déployées », ni dans « 7 restantes », ni dans le patch. Elles ne peuvent pas être
déployées seules (elles exigent le swap anon simultané), d'où un état distinct plutôt qu'une
ligne dans « restantes ».

#### 2.7.2 Périmètre vs hors périmètre (ne plus mélanger)

Les 4 consommateurs legacy « hors dépôt » et 5 autres fonctions ne font **pas** partie des 16
et sont classés séparément dans le manifeste :

| Fonction | Raison | Bloque la révocation |
|---|---|---|
| `scpi-parallel-backfill-worker` | `SOURCE_ABSENT_FROM_REPO` | ✅ oui |
| `scpi-parallel-discover-worker` | `SOURCE_ABSENT_FROM_REPO` | ✅ oui |
| `scpi-annual-source-discover` | `SOURCE_ABSENT_FROM_REPO` | ✅ oui |
| `scpi-norma-quarterly-ingest` | `SOURCE_ABSENT_FROM_REPO` | ✅ oui |
| `maximus-watchdog-oidc` | `SOURCE_ABSENT_FROM_REPO` (dépendances `SUPABASE_DB_URL` à confirmer) | ✅ oui |
| `scpi-scoring` | `NOT_DEPLOYED_NOT_CALLED` | ❌ non |
| `maximus-search-agent-oidc` | `UNCHANGED_BY_MIGRATION` | ❌ non |
| `client-access-admin` | `VERIFY_JWT_USER_SESSION` | ❌ non |
| `client-surveillance` | `VERIFY_JWT_USER_SESSION` | ❌ non |

Un test échoue si une fonction figure à la fois dans le périmètre et hors périmètre, ou si
une fonction sans source dans le dépôt ne bloque pas la révocation.

#### 2.7.3 Preuve par fonction (les logs agrégés ne suffisent pas)

Chaque fonction porte dans le manifeste son **mécanisme d'authentification interne**, son
**test positif attendu**, son **test négatif attendu**, et le **filtre de log** qui prouve
**sa** résolution de clé :

| Fonction | Résolution attendue (log) | Test positif | Test négatif |
|---|---|---|---|
| `calendly-webhook` | `[key-source] … SUPABASE_SECRET_KEYS (name=scpi_agents)` | HMAC valide → 200 | HMAC absent/invalide → 401 |
| `send-simulation-email` | idem | request_id valide → 200 | request_id invalide → 400/429 |
| `scpi-release-certification-oidc` | idem | token OIDC valide → 200 | sans/pseudo token → 401/403 |
| `scpi-corum-document-oidc` | idem | token OIDC valide → 200 | sans/pseudo token → 401/403 |
| `scpi-bulletin-replay-oidc` | idem | token OIDC valide → 200 | sans/pseudo token → 401/403 |
| `maximus-agent-audit-oidc` | résolution inline (`SUPABASE_SECRET_KEYS`→legacy) | token OIDC valide → 200 | sans/pseudo token → 401/403 |
| `maximus-scpi-ocr-oidc` | résolution inline | token OIDC valide → 200 | sans/pseudo token → 401/403 |

**Règle de preuve** : un déploiement n'est déclaré « clé prouvée » que si le log de **cette**
fonction (filtré par son nom dans `function_edge_logs`) montre la résolution
`SUPABASE_SECRET_KEYS` **et zéro** `repli legacy` **dans la même fenêtre**, plus un test
positif et un test négatif de cette fonction. Un agrégat multi-fonctions ne vaut pas preuve.

```bash
supabase functions deploy <fn> --no-verify-jwt --project-ref ygvsddcpohsnaowofuwc
```

**Contrôles par déploiement** : version incrémentée ; `verify_jwt=false` conservé ; readback
du bundle exact vs source épinglée ; log `[key-source]` **de la fonction** ; compteur strict
69/69 après chaque lot.

#### 2.7.4 Rollback exact — condition `ready` calculée, pas déclarative

Le contrôle indépendant a invalidé le rollback « `git checkout dfc6b309` » seul. Le
manifeste exige désormais, **pour chaque fonction**, une évidence du **bundle réellement
déployé** :

```jsonc
// scripts/security/prod-bundles/<fonction>.json  (un fichier par fonction)
{
  "function": "scpi-evidence-certify",
  "version": 9,                 // version constatée en production
  "verifyJwt": false,           // état verify_jwt constaté
  "entrypointSha256": "…64 hex…",
  "dependencies": [ { "path": "…", "sha256": "…64 hex…", "bytes": 0 } ],
  "bundleSha256": "…64 hex…"
}
```

Règles appliquées par le manifeste :

1. `rollback.ready` n'est **jamais** vrai sans fichier d'évidence de production.
2. La `version` et le `verifyJwt` de l'évidence doivent **correspondre** à ce que le registre
   a constaté en prod — une évidence pour une autre version est rejetée.
3. Les dépendances de prod dont l'empreinte manque (`matcher.mjs` pour
   `scpi-evidence-certify`, `sourceProvenance.mjs` pour `scpi-bulletin-watch`) maintiennent
   `ready = false` avec `PROD_DEPENDENCY_FINGERPRINT_MISSING`.
4. Une fonction encore `PENDING_*` ne peut pas avoir un rollback `ready` (test bloquant).
5. `revocationAllowed` exige : **0** fonction hors périmètre bloquante, **16/16**
   `DEPLOYED`, et **16/16** rollback `ready`. Aujourd'hui : `false`.

Un fichier d'évidence est refusé s'il contient une valeur assimilable à une clé
(`sb_secret_*`, `sb_publishable_*`, JWT `eyJ…`) — test dédié.

**État actuel : `rollbackReady = 0/16`, `revocationAllowed = false`.** C'est le résultat
attendu : le rollback exact dépend d'une lecture de production que seul le connecteur
fournit, et cette lecture n'a pas encore été consignée pour les 16 fonctions.

### 2.8 `scpi-certified-promote` — patch clé uniquement (drift métier à ne PAS embarquer)

**Drift constaté (ChatGPT 25/11)** : le code du dépôt (`main` @ `675ab161`) contient une
**modification métier de contrôle des prix** absente du bundle prod v12 : la garde
`WITHDRAWAL_MISLABELLED_AS_SUBSCRIPTION` (comparaison `prix_souscription` vs
`prix_retrait` vs anciens) et les contrôles `CAPITALISATION_PARTS_MISMATCH`,
`MATERIAL_TOF_QA_REQUIRED`, `TOF_OUT_OF_RANGE`, `DEBT_OUT_OF_RANGE`, `FORBIDDEN_ASPIM_TOF`.
Le bundle prod v12 ne les porte pas.

**Précision d'attribution (vérifiée 25/11)** : ces gardes sont **déjà présentes dans
`dfc6b309`** (dernier `main` avant #457) — `git show dfc6b309:…/scpi-certified-promote/index.ts`
contient les 6 marqueurs. Le drift est donc **dépôt ↔ production**, et **non** introduit par
la PR #457. La PR #457 n'a modifié ce fichier qu'à hauteur de **2 lignes** (import +
résolution de clé), ce que la CI vérifie désormais à l'octet près.

**Patch outillé et vérifié** — `scripts/security/applyKeyOnlyPatch.mjs` applique ce patch
sur le **bundle prod réellement déployé** (jamais sur le fichier du dépôt) et **refuse**
toute autre modification :

```bash
# 1. Sauvegarder le bundle prod v12 lu via get_edge_function (hors dépôt).
# 2. Prévisualiser le patch (n'écrit rien).
node scripts/security/applyKeyOnlyPatch.mjs --source <prod-v12.ts> --diff
# 3. Produire le bundle patché + son rapport de changements.
node scripts/security/applyKeyOnlyPatch.mjs --source <prod-v12.ts> --out <patched.ts> \
  --report <report.json>
```

Garanties codées (tests `scripts/security/applyKeyOnlyPatch.test.mjs`, 14 PASS) :

| Garde-fou | Comportement |
|---|---|
| Source vide | `EMPTY_SOURCE` (refus) |
| Déjà patché (contient `readServiceKey`) | `ALREADY_PATCHED` (refus) |
| Aucune résolution legacy reconnue | `LEGACY_RESOLUTION_NOT_FOUND` (refus) |
| Plusieurs résolutions legacy | `AMBIGUOUS_LEGACY_RESOLUTION` (refus, aucun choix arbitraire) |
| Toute autre ligne modifiée | `UNAUTHORIZED_EDIT` (refus) |
| Ligne insérée/supprimée hors import | `UNEXPECTED_LINE_DELTA` (refus) |
| Fidélité au diff #457 | appliqué à `dfc6b309`, le patch reproduit **à l'octet près** `675ab161` |

Les tests vérifient aussi qu'**aucune** des 6 gardes financières n'est introduite par le
patch, et qu'aucune valeur de clé n'y apparaît.

**Rollback** : restaurer le bundle prod v12 (sauvegardé avant patch). La source de vérité
est le bundle déployé, pas un commit — voir §2.7 pour la condition `ready`.

**À réconcilier séparément (hors migration)** : décider, hors chemin critique, si les 6
gardes financières du dépôt doivent être déployées (chantier distinct, avec tests métier
dédiés). Rien n'est déployé ici à ce titre.

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

> **Prérequis exécution (Cursor)** : `supabase functions deploy/list` exigent un
> `SUPABASE_ACCESS_TOKEN` (jeton personnel `sbp_…`) ou un `supabase login`. Sans ce jeton,
> l'exécutant ne peut ni lister ni déployer les Edge Functions (blocage à lever par le
> propriétaire).

1. ✅ Code backend fusionné (`675ab161`).
2. **Cursor** : inventorier les fonctions réelles (`supabase functions list`) et confirmer
   le `verify_jwt` effectif de chaque fonction (§2.0).
3. **Cursor** : déployer les **14** fonctions à authentification interne (§2.2) avec
   `--no-verify-jwt` (préserve `false`).
4. **Cursor** : au moment du swap anon frontend, déployer `sender-add-contact` +
   `send-lead-notification` (§2.1) avec `--no-verify-jwt`, en coordination avec le frontend.
5. **Cursor** : migration Vault **reportée** (patron dormant, cf. §3) — pas de `db push`.
6. Vérifier 69/69 après chaque lot.
7. **Cursor** : fusionner la PR #458 puis basculer GitHub Actions / Netlify (après CI verte).
8. Tests réels leads / Calendly / simulateurs / comparateur / connexions / agents.
9. Révocation des anciennes clés **en dernier**, après validation complète et retrait des replis (§7.5).

### 6.1 Manifeste du swap anon frontend (préparé, non exécuté)

Le frontend lit **exclusivement** `import.meta.env.VITE_SUPABASE_ANON_KEY` (jamais
`VITE_SUPABASE_ANON_KEY_NEW`). Le swap vers la clé publishable est donc un **repoint de
variable de build Netlify**, pas un changement de code : faire pointer
`VITE_SUPABASE_ANON_KEY` sur la valeur de la clé publishable (rollback = repoint vers la
valeur legacy). `VITE_SUPABASE_ANON_KEY_NEW` sert de copie de bascule et n'est **pas**
câblée dans le code frontend.

Consommateurs frontend (runtime navigateur) :

| Fichier | Usage | Compatible clé publishable (`apikey`) |
|---|---|---|
| `src/lib/supabase.ts` | client Supabase principal (PostgREST + Auth) | ✅ (PostgREST accepte `sb_publishable_*`) |
| `src/utils/supabaseRest.ts` | helper REST | ✅ |
| `src/utils/leadTracker.ts` | `fetch` → `send-lead-notification` | ⚠️ `verify_jwt=false` déjà en prod (v17) ; nécessite migration de sa résolution de clé + `SUPABASE_PUBLISHABLE_KEYS` |
| `src/components/OptimizedScpiLandingPage.tsx` | `fetch` → `sender-add-contact` | ⚠️ `verify_jwt=true` en prod (v7) → bascule `--no-verify-jwt` requise |
| `src/components/OptimizedThematicLandingPage.tsx` | `fetch` → `sender-add-contact` | ⚠️ `verify_jwt=true` en prod (v7) → bascule `--no-verify-jwt` requise |
| `src/utils/scpiScoringService.ts` | `fetch` → `scpi-scoring` | n/a (fonction non déployée, non appelée) |
| `public/merci-landing-page.calendly.html` | placeholder `VITE_SUPABASE_ANON_KEY_PLACEHOLDER` injecté par `scripts/inject-env-vars.js` | ✅ (replace string simple, non JWT) |

**Point critique d'ordre (corrigé 25/11, contrôle ChatGPT)** :
- `sender-add-contact` v7 = `verify_jwt=true` en prod → une clé publishable (non JWT)
  envoyée en `apikey` y est **rejetée** tant que `verify_jwt=true`.
- `send-lead-notification` v17 = `verify_jwt=false` en prod → accepte déjà la clé en
  `apikey`, **mais** lit encore directement la clé legacy.
- **Les deux** fonctions lisent encore directement `SUPABASE_SERVICE_ROLE_KEY` (legacy),
  pas via `readServiceKey`/`readPublishableKey`. Leur bascule nécessite donc (i) la
  migration de leur résolution de clé et (ii) l'injection de `SUPABASE_PUBLISHABLE_KEYS`
  / `SUPABASE_SECRET_KEYS`. Ne pas désactiver une garde sans vérifier la protection
  applicative et les refus d'accès effectifs.

**Ordre du lot coordonné (swap anon)** :
1. ChatGPT déploie `sender-add-contact` (en `--no-verify-jwt`) **et** `send-lead-notification`
   (conserve `verify_jwt=false`), toutes deux avec résolution de clé migrée et
   `SUPABASE_PUBLISHABLE_KEYS`/`SUPABASE_SECRET_KEYS` injectées (§2.1).
2. Netlify : repoint `VITE_SUPABASE_ANON_KEY` = clé publishable (le `_NEW` déjà créé).
3. Redéploiement frontend ; vérifier leads (Resend+Brevo), comparateur, simulateurs, Calendly.
4. Contrôle 69/69.

> `client-access-admin` / `client-surveillance` (`verify_jwt=true`, session utilisateur)
> ne sont pas impactées par le swap anon : elles s'authentifient via le JWT utilisateur,
> la clé anon n'y joue qu'en `apikey`.

---

## 7. Consommateurs résiduels de la clé legacy `SUPABASE_SERVICE_ROLE_KEY`

Recensement exhaustif des **derniers** consommateurs à basculer **avant** toute révocation
de la clé legacy. La clé sert **deux usages distincts** qu'il ne faut pas confondre :
(i) credential Supabase (PostgREST/Admin) ; (ii) **secret HMAC interne** (signature du
dispatch d'ingestion Netlify).

### 7.1 HMAC interne (usage NON credential — SÉPARATION PRÉPARÉE)

La séparation est **codée** (fichier partagé `netlify/functions/_ingest-hmac.ts`, helpers
`signIngestDispatch` / `verifyIngestSignature` / `ingestHmacSecrets`), testée
(`src/tests/ingestHmacSeparation.test.ts`, 9 tests PASS), mais **non déployée**.

| Fichier | Rôle | Secret de signature |
|---|---|---|
| `netlify/functions/scpi-ingest-scheduled.ts` | **signataire** (cron `30 3 * * *`) | `INGEST_HMAC_SECRET` (préféré) → repli `SUPABASE_SERVICE_ROLE_KEY` |
| `netlify/functions/scpi-ingest-background.mts` | **vérificateur** | accepte `INGEST_HMAC_SECRET` **et** `SUPABASE_SERVICE_ROLE_KEY` (double fenêtre transitoire) |
| `netlify/functions/_ingest-hmac.ts` | helpers HMAC partagés | — |

Signature : `HMAC-SHA256(secret, "${timestamp}:scpi-ingest")`, envoyée en
`x-maximus-timestamp` + `x-maximus-signature`, fenêtre anti-rejeu de 5 min, comparaison
en temps constant (`timingSafeEqual` sur **tous** les secrets, sans sortie anticipée).

**Ordre de bascule (sans interruption du cron) :**

1. Créer la variable Netlify `INGEST_HMAC_SECRET` (nouvelle valeur aléatoire **dédiée**,
   scope `Builds, Functions, Runtime`), à côté de `SUPABASE_SERVICE_ROLE_KEY_NEW`.
2. Déployer **les deux fonctions ensemble** (elles partent dans le même deploy Netlify) :
   `scpi-ingest-scheduled` et `scpi-ingest-background`.
3. Effet : le signataire signe désormais avec `INGEST_HMAC_SECRET` ; le vérificateur
   accepte la nouvelle **et** l'ancienne signature (aucune coupure pendant la rotation).
4. Vérifier le prochain run `30 3 * * *` (log `[scpi-ingest-background]` sans
   « invocation rejected »).
5. **Après** révocation du legacy uniquement : retirer le repli `SUPABASE_SERVICE_ROLE_KEY`
   de `ingestHmacSecrets` et supprimer l'acceptation double du vérificateur.

> **Ne pas révoquer `SUPABASE_SERVICE_ROLE_KEY` tant que ce HMAC n'est pas basculé.**
> La clé legacy sert ici de **secret de signature**, pas de credential Supabase : elle
> est lue indépendamment de `_invite-utils` (`createAdminClient`), qui, lui, utilise
> déjà `SUPABASE_SERVICE_ROLE_KEY_NEW` en priorité.

### 7.2 Consumers « credential » (PostgREST / Admin)

| Consommateur | Fichier(s) | Résolution actuelle | Bascule |
|---|---|---|---|
| Netlify `lead-fallback` | `netlify/functions/lead-fallback.ts` | `SUPABASE_SERVICE_ROLE_KEY_NEW` → repli legacy | ✅ déjà `_NEW` en premier |
| Netlify `_invite-utils` | `netlify/functions/_invite-utils.ts` | `SUPABASE_SERVICE_ROLE_KEY_NEW` → repli legacy | ✅ déjà `_NEW` en premier |
| Netlify `scpi-progressive-publisher` | `netlify/functions/scpi-progressive-publisher.mts` | `_NEW` → repli legacy | ✅ déjà `_NEW` en premier |
| Netlify `funnel-event` | `netlify/functions/funnel-event.ts` | `_NEW` → repli legacy | ✅ déjà `_NEW` en premier |
| Plugin de release | `plugins/maximus-scpi-native-release/release.mjs` | `SUPABASE_SERVICE_ROLE_KEY_NEW` → repli legacy ; `normalizeSecretHeaders` accepte `sb_secret_*` **et** `sb_publishable_*` | ✅ code prêt (test 4/4 PASS) |
| GitHub Actions (3 workflows) | `scpi-autonomous-certified-release.yml`, `scpi-autonomous-progressive-release.yml`, `maximus-candidate-postdeploy-activation.yml` | `SUPABASE_SERVICE_ROLE_KEY_NEW` **et** `VITE_SUPABASE_ANON_KEY_NEW` | ✅ code prêt |
| Scripts locaux (hors runtime) | `scripts/scpi-candidates/*.mjs`, `scripts/scpi-agents/*.mjs`, `scpi-ingestion/src/supabase.ts`, divers `*.ts` | `SUPABASE_SERVICE_ROLE_KEY` (env locale) | hors périmètre runtime ; migrer les `.env.local` au moment de la révocation |
| Edge Functions | `supabase/functions/**` | `readServiceKey(scpi_agents)` / inline | ✅ cette PR |

### 7.3 État de la bascule GitHub/Netlify (constat du 24/11)

- **Secret GitHub Actions `VITE_SUPABASE_ANON_KEY_NEW` ✅ présent** (créé 2026-11-24) —
  confirmé via `gh secret list` (`VITE_SUPABASE_ANON_KEY_NEW`, `SUPABASE_SERVICE_ROLE_KEY_NEW`,
  `VITE_SUPABASE_ANON_KEY` legacy conservé). Le swap anon côté Actions est **débloqué** et
  **codé** dans les 3 workflows (`SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY_NEW }}`).
- **CI PR #458 ✅ verte** : `build`, `check`, `browser` (×2), `verify-official-bulletins`
  tous **pass**. (Le deploy-preview Netlify affiche « canceled » : déploiement d'aperçu
  annulé, sans lien avec la validité du code.)
- **Netlify** : ✅ validé par ChatGPT le 24/11 — le scope `Builds` couvre les plugins de
  build (`onPostBuild` / `onSuccess`) ; le scope `Post processing` n'est **pas** nécessaire.
  Aucune modification supplémentaire des variables n'est requise. Le plugin `release.mjs`
  lit `_NEW` **avec repli legacy** ; la preuve d'utilisation effective (logs `[key-source]`,
  cf. §7.7) confirme que le repli n'est pas déclenché.
- **HMAC interne** : voir §7.1 (séparé), §7.4 (test réel) et §7.5 (suppression du repli).

### 7.4 Test réel du nouveau HMAC (après déploiement Netlify)

Une fois `INGEST_HMAC_SECRET` créé **et** les deux fonctions redéployées :

1. **Vérifier la résolution** : le signataire (`scpi-ingest-scheduled`) doit signer avec
   `INGEST_HMAC_SECRET` (log : aucun message `INGEST_HMAC_SECRET manquant`).
2. **Attendre le prochain run planifié** (`30 3 * * *`) et vérifier, dans les logs de
   `scpi-ingest-background`, **l'absence** de `invocation rejected` et la présence du
   JSON `processed` normal.
3. **Test manuel de non-régression du repli** (avant révocation) : révoquer temporairement
   `INGEST_HMAC_SECRET` n'est pas nécessaire — le test unitaire `ingestHmacSeparation.test.ts`
   couvre déjà la double fenêtre (signature legacy acceptée pendant la transition).
4. **Contre-test négatif** : un POST direct vers `.netlify/functions/scpi-ingest-background`
   **sans** en-têtes `x-maximus-*` doit rester ignoré (« invocation rejected »), confirmant
   que la garde HMAC est bien en place.
5. **Preuve** : un run cron vert avec la signature dédiée suffit ; ne pas tenter de
   déclencher une écriture d'ingestion manuelle hors du chemin planifié.

### 7.5 Suppression du repli HMAC legacy (AVANT ou AU MOMENT de la révocation)

⚠️ **Attention** : la révocation de la clé Supabase `SUPABASE_SERVICE_ROLE_KEY` **ne
neutralise pas** son utilisation comme ancien secret HMAC — la chaîne reste présente
dans l'environnement Netlify tant qu'elle n'est pas supprimée. Le retrait du repli HMAC
doit donc être **effectif avant ou au moment** de la révocation (jamais après), sinon le
cron continuerait d'accepter une signature forgée avec l'ancienne valeur.

Étape finale, à appliquer **avant ou au moment de** la révocation de
`SUPABASE_SERVICE_ROLE_KEY` :

1. Dans `netlify/functions/_ingest-hmac.ts`, réduire `ingestHmacSecrets` au seul
   `INGEST_HMAC_SECRET` :
   ```ts
   export function ingestHmacSecrets(getEnv) {
     const dedicated = getEnv(INGEST_HMAC_SECRET_VAR);
     return dedicated ? [dedicated] : [];
   }
   ```
2. Supprimer la référence à `SUPABASE_SERVICE_ROLE_KEY` dans ce fichier (commentaires
   et code), et la constante d'erreur correspondante dans `scpi-ingest-scheduled.ts`.
3. Mettre à jour `ingestHmacSeparation.test.ts` : les cas « repli legacy » / « double
   fenêtre » deviennent des cas « rejet sans secret dédié ».
4. Redéployer `scpi-ingest-scheduled` + `scpi-ingest-background` ensemble.
5. Vérifier le run cron suivant (aucune régression), **puis** révoquer la clé legacy.

> Tant que `SUPABASE_SERVICE_ROLE_KEY` n'est **pas** révoquée, laisser le repli en place.
> Le retrait du repli HMAC et la révocation Supabase sont **deux opérations distinctes** :
> la seconde ne couvre pas la première.

### 7.6 Tests fonctionnels de production (après chaque lot de déploiement)

Matrice minimale à rejouer après chaque étape (Edge Functions, Netlify, GitHub, HMAC) :

| Surface | Vérification | Signal attendu |
|---|---|---|
| Lead « PDF » / magnétique | soumettre un lead via `OptimizedScpiLandingPage` / `LeadMagnetEmailForm` | e-mail Resend reçu (`send-lead-notification` 200) + contact Brevo (`sender-add-contact` 200) |
| Webhook Calendly | événement de test Calendly (ou replay) | `calendly-webhook` accepte la signature HMAC (pas de 401/403) |
| Simulateurs | ouvrir simulateur direct / crédit / démembrement | rendu + aucune erreur réseau, cohérence des prix |
| Comparateur | recherche / filtres / multi-sélection | données identiques aux fiches SEO |
| Connexion / espace client | `client-access-admin` / `client-surveillance` | session utilisateur OK (verify_jwt=true conservé) |
| Agents / ingestion | run cron `scpi-ingest-*`, `scpi-bulletin-watch`, `scpi-news-watch` | pas de `unauthorized` / `invocation rejected` |
| Release Netlify | build production `main` | plugin `onSuccessRelease` OK, cohorte 69/69 |

Contrôle **69/69** (`watchdog_observations`) après chaque lot : `strict_pass=69`,
`strict_fail=0`, `runner_state='IDLE'`.

### 7.7 Preuve d'utilisation effective de la nouvelle clé (sans exposer sa valeur)

Le motif `NOUVELLE || legacy` peut masquer un repli silencieux : si la nouvelle variable
est absente/vide, le code retombe sur la clé legacy et tout « fonctionne » jusqu'à la
révocation. Pour **exclure ce masquage**, la résolution des clés journalise désormais la
**source** (nom de variable) et une **empreinte SHA-256 tronquée à 12 hex** — jamais la
valeur.

**Instrumentation ajoutée** (logs `[key-source]`) :

| Point de résolution | Fichier | Journal attendu (nouvelle clé) |
|---|---|---|
| Edge Functions (service) | `supabase/functions/_shared/serviceKey.ts` | `[key-source] service key résolue depuis SUPABASE_SECRET_KEYS (name=scpi_agents)` |
| Netlify admin client | `netlify/functions/_invite-utils.ts` | `[key-source] service <- SUPABASE_SERVICE_ROLE_KEY_NEW (fp=…)` |
| Netlify `lead-fallback` | `netlify/functions/lead-fallback.ts` | `[key-source] service <- SUPABASE_SERVICE_ROLE_KEY_NEW (fp=…)` |
| Netlify `funnel-event` | `netlify/functions/funnel-event.ts` | `[key-source] service <- SUPABASE_SERVICE_ROLE_KEY_NEW (fp=…)` |
| Netlify `scpi-progressive-publisher` | `netlify/functions/scpi-progressive-publisher.mts` | `service <- …_NEW` **et** `anon <- VITE_SUPABASE_ANON_KEY_NEW` |
| Plugin Netlify release | `plugins/maximus-scpi-native-release/release.mjs` | `release service <- SUPABASE_SERVICE_ROLE_KEY_NEW` / `release anon <- VITE_SUPABASE_ANON_KEY_NEW` |

Un log `repli legacy` (niveau `warn`) signale que la nouvelle variable n'est pas visible
dans ce scope → **à corriger avant révocation**. Un log `aucune clé` (niveau `error`)
signale une configuration incomplète.

**Vérification croisée par ChatGPT (sans jamais copier la valeur dans le chat) :**

1. Calculer localement l'empreinte attendue de la nouvelle clé :
   `printf %s "$VALEUR" | sha256sum | cut -c1-12` (ou équivalent).
2. Comparer cette empreinte au champ `fp=` du log `[key-source]` du scope concerné.
   - Égal → la **nouvelle clé** est réellement consommée (preuve).
   - Différent ou `repli legacy` → la clé utilisée n'est pas la nouvelle (blocage).
3. **GitHub Actions** (aucun repli) : les 3 workflows pointent directement sur
   `SUPABASE_SERVICE_ROLE_KEY_NEW` / `VITE_SUPABASE_ANON_KEY_NEW` ; un run vert des RPC
   `maximus_prepared_release_slugs` / `scpi_indicators` avec `_NEW` est la preuve d'usage.
4. **Edge Functions** : la présence du log `SUPABASE_SECRET_KEYS (name=scpi_agents)`
   (au lieu du `warn` `repli legacy`) prouve que la clé `sb_secret_*` est active.

> L'empreinte est une troncature non réversible d'une clé à haute entropie : elle
> n'expose pas la valeur et ne peut pas être réutilisée pour s'authentifier.

---

## 8. Non-négociables (rappel)

- Aucun nouveau chantier. Aucun `supabase db push` global. Aucune révocation de clé.
- Maintien strict de **69/69 PASS_100** (`strict_pass=69`, `strict_fail=0`, `runner_state='IDLE'`).
- Toute fonction en `verify_jwt=false` doit avoir une authentification interne effective
  (cron/OIDC/Calendly/garde `apikey`) — jamais une fonction ouverte sans contrôle.
