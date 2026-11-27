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

### 0.1 Fonctions déployées SANS source dans le dépôt — **RÉSOLU côté lecture (27/11)**

**Mise à jour du 27/11 — sources récupérées en lecture seule.** Les cinq sources ont été
obtenues depuis l'API Management officielle (`GET /v1/projects/{ref}/functions/{slug}/body`,
`Accept: multipart/form-data`), qui rend le **source original** (et non le bundle transpilé).
Versions **réelles** constatées, qui corrigent le tableau précédent :

| Fonction | Version réelle en production | Consommation de clé | Verdict migration |
|---|---|---|---|
| `scpi-parallel-backfill-worker` | **v8** (le registre disait 11) | **repo** : `readServiceKey` ; **prod** : encore lecture directe legacy | ⏳ réintégré — déploiement ChatGPT requis |
| `scpi-parallel-discover-worker` | **v11** | **repo** : `readServiceKey` ; **prod** : encore lecture directe legacy | ⏳ réintégré — déploiement ChatGPT requis |
| `scpi-annual-source-discover` | **v9** | **repo** : `readServiceKey` ; **prod** : encore lecture directe legacy | ⏳ réintégré — déploiement ChatGPT requis |
| `scpi-norma-quarterly-ingest` | **v11** | **repo** : `readServiceKey` ; **prod** : encore lecture directe legacy | ⏳ réintégré — déploiement ChatGPT requis |
| `maximus-watchdog-oidc` | **v7** | `SUPABASE_DB_URL` uniquement (aucune famille de clés API) | ✅ audité — ne bloque plus la révocation API |

**Mise à jour du 27/11 (soir).** Les cinq sources ont été réintégrées sous
`supabase/functions/<name>/` (sceaux multipart du commentaire `7224163948`). Les **4** workers
passent par `readServiceKey` + `_shared/serviceKey.ts` dans le dépôt ; la **production** reste
sur les bundles legacy jusqu'au déploiement ChatGPT. Raison manifeste :
`SOURCE_REINTEGRATED_PENDING_DEPLOY` (bloque encore la révocation). Watchdog :
`USES_DB_URL_NOT_SERVICE_ROLE` (ne bloque plus). Raison historique encore documentée :
`SOURCE_ABSENT_FROM_REPO` (état antérieur).

**Correction du registre (27/11).** La version de `scpi-parallel-backfill-worker` était restée
à `11` dans `edgeFunctionDeploymentManifest.mjs` alors que la production sert **v8**. La valeur
est corrigée, mais la cause réelle était plus profonde : `ledgerSnapshot()` **n'enregistrait pas
du tout** la version des fonctions hors périmètre, donc `--check` ne pouvait jamais signaler
cette dérive et une valeur fausse restait « conforme » indéfiniment. La version fournisseur de
chaque orpheline est désormais dans le registre commité et comparée par `--check`.

---

### 0.1 bis Fonctions déployées SANS source dans le dépôt (inventaire logs 4 jours, historique)

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
| `scpi-parallel-backfill-worker` (**v8** en production) | lit **directement** `SUPABASE_SERVICE_ROLE_KEY` | ❌ à migrer avant révocation |
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

### 0.3 Plan de réintégration des 5 fonctions orphelines — **ÉTAPE PRÉPARATION FAITE (27/11)**

**État Cursor :** sources réintégrées + patch clé appliqué dans le dépôt ; déploiement
Supabase **réservé à ChatGPT** (dérogation). Rollback = artefacts multipart scellés
(`7224163948`), pas un commit inventé.

**Restant (ChatGPT) :**

1. Déployer les **4** workers depuis le SHA de la PR orpheline, avec
   `_shared/serviceKey.ts` instrumenté inclus ; conserver `verify_jwt=false`.
2. Tests négatifs (sans `x-cron-token` → 401) et positifs contrôlés (auth OK, sans écriture
   métier destructive) ; logs `[key-source]` sans repli legacy sur la fenêtre consultée.
3. Ne **pas** déployer `maximus-watchdog-oidc` pour la migration des clés API (aucun
   changement de résolution de clé ; `SUPABASE_DB_URL` inchangé).
4. Rollback d'urgence : redéployer le bundle capturé dont l'`artifactSha256` figure dans
   `7224163948` / le manifeste (`rollbackArtifactSha256`).

> **Règle** : tant que les 4 consumers n'ont pas basculé **en production** sur
> `readServiceKey`/`SUPABASE_SECRET_KEYS` **et** été testés, **ne pas révoquer**
> `SUPABASE_SERVICE_ROLE_KEY`.

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
| `scpi-parallel-backfill-worker` | `SOURCE_REINTEGRATED_PENDING_DEPLOY` (ex-`SOURCE_ABSENT_FROM_REPO`) | ✅ oui (jusqu'au déploiement + tests) |
| `scpi-parallel-discover-worker` | `SOURCE_REINTEGRATED_PENDING_DEPLOY` | ✅ oui |
| `scpi-annual-source-discover` | `SOURCE_REINTEGRATED_PENDING_DEPLOY` | ✅ oui |
| `scpi-norma-quarterly-ingest` | `SOURCE_REINTEGRATED_PENDING_DEPLOY` | ✅ oui |
| `maximus-watchdog-oidc` | `USES_DB_URL_NOT_SERVICE_ROLE` | ❌ non (audit : pas de clé API) |
| `scpi-scoring` | `NOT_DEPLOYED_NOT_CALLED` | ❌ non |
| `maximus-search-agent-oidc` | `UNCHANGED_BY_MIGRATION` | ❌ non |
| `client-access-admin` | `VERIFY_JWT_USER_SESSION` | ❌ non |
| `client-surveillance` | `VERIFY_JWT_USER_SESSION` | ❌ non |

Un test échoue si une fonction figure à la fois dans le périmètre et hors périmètre, ou si
une fonction `SOURCE_REINTEGRATED_PENDING_DEPLOY` / `SOURCE_ABSENT_FROM_REPO` ne bloque pas
la révocation.

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

#### 2.7.4 Rollback exact, **restaurable** et **vérifié indépendamment**

Le contrôle indépendant a invalidé trois choses successivement : le rollback
« `git checkout dfc6b309` » seul, puis l'idée qu'une **empreinte** suffirait, puis le fait
qu'une **déclaration cohérente** suffirait. Une empreinte est une **identité**, pas une
**sauvegarde** : elle identifie un bundle sans permettre de le restaurer.

Le contrôle du 25/11 (#issuecomment-7162575955) a relevé trois défauts précis, tous corrigés :

| Défaut constaté | Correction appliquée |
|---|---|
| `validateProdEvidence` vérifiait la présence et la cohérence déclarative des SHA ; des SHA **fictifs** rendaient `ready=true`. | `ready` exige désormais une **attestation de vérification indépendante**, lue **hors du dépôt** (`MAXIMUS_ROLLBACK_EVIDENCE_ROOT`), empreinte recalculée et **chaque affirmation recoupée** avec l'évidence. |
| Le lot 7 comparait la restauration au bundle **déployé** — donc une sauvegarde post-migration était présentée comme un rollback pré-migration. | `rollbackTarget` est **distinct** de `observed`, exige `phase: PRE_MIGRATION` et une identité de bundle **différente**. |
| `owner` / `performedBy` / `performedAt` n'étaient validés qu'en présence ; l'opérateur pouvait être son propre vérificateur. | L'attestation exige `independentOfOperator: true` et une `verifierIdentity` **distincte** de `performedBy`. La garde et le journal sont **liés** à la fonction, la version et le bundle. |

Le contrôle du 25/11 (#issuecomment-7169681620) a ensuite invalidé l'attestation **non
signée** : « un opérateur pouvant écrire les deux fichiers peut toujours inventer les deux
identités et les SHA. Le chemin hors dépôt n'est pas une frontière de confiance ;
`inRepo` utilise `resolve` sans `realpath`. » Les trois corrections correspondantes (v3) :

| Défaut constaté | Correction appliquée |
|---|---|
| `readAttestation` + `crossCheckAttestation` recalculent un hash **non signé** : deux documents cohérents mais forgés passent. | L'attestation porte une signature `ed25519` des affirmations, vérifiée contre la clé publique **épinglée** dans `scripts/security/rollbackVerifierTrustAnchor.json`. Aucune variable d'environnement ne peut redésigner cette ancre. Codes : `ATTESTATION_UNSIGNED`, `ATTESTATION_VERIFIER_NOT_TRUSTED`, `ANCHOR_KEY_NOT_PROVISIONED`, `ATTESTATION_KEY_NOT_ANCHORED`, `ATTESTATION_KEY_REVOKED`, `ATTESTATION_SIGNATURE_INVALID`. Un test dédié construit **deux documents cohérents mais forgés**. |
| `inRepo` utilisait `resolve` sans `realpath` : un lien symbolique, ou un dossier inexistant sous un ancêtre lié au dépôt, passait pour « hors dépôt ». | Toute résolution passe par `realpath` (ancêtre existant le plus proche, puis recomposition) : `EVIDENCE_ROOT_INSIDE_REPO`, `ATTESTATION_DIR_INSIDE_REPO`, `ATTESTATION_INSIDE_REPO`. Test de contournement par lien symbolique dédié. |
| Exiger `observed ≠ rollbackTarget` interdisait toute préparation de rollback sur une fonction **pas encore migrée**. | Le champ `stage` (`PRE_DEPLOY` \| `POST_DEPLOY`) sépare la readiness pré-déploiement de la validation post-déploiement. `PRE_DEPLOY` exige `observed = rollbackTarget` ; `POST_DEPLOY` exige la distinction. La cohérence du `stage` avec l'état réel est vérifiée (`EVIDENCE_STAGE_MISMATCH`, `PRE_DEPLOY_READY_ON_DEPLOYED_FUNCTION`, `POST_DEPLOY_READY_ON_UNDEPLOYED_FUNCTION`). |

Chaque fonction porte désormais une évidence à cinq blocs :

```jsonc
// scripts/security/prod-bundles/<fonction>.json  (un fichier par fonction)
{
  "schemaVersion": "security-prod-evidence-v3",
  "stage": "POST_DEPLOY",           // PRE_DEPLOY (pas encore migrée) | POST_DEPLOY (migrée)
  "function": "scpi-evidence-certify",
  "observed": {                     // 1. ce qui est déployé MAINTENANT
    "version": 9, "verifyJwt": false,
    "entrypointSha256": "…64 hex…",
    "dependencies": [ { "path": "…", "sha256": "…64 hex…", "bytes": 0 } ],
    "bundleSha256": "…64 hex…",
    "readback": {                   // lecture FOURNISSEUR datée (voir §2.7.6)
      "source": "supabase-management-api:GET /v1/projects/{ref}/functions/{slug}",
      "fetchedAt": "…ISO…", "projectRef": "ygvsddcpohsnaowofuwc",
      "slug": "scpi-evidence-certify", "version": 9, "verifyJwt": false,
      "entrypointSha256": "= observed.entrypointSha256",
      "bundleSha256": "= observed.bundleSha256",
      "configSha256": "…empreinte de CONFIGURATION (projet, slug, version, verify_jwt, entrypointPath)…"
    }
  },
  "rollbackTarget": {               // 2. le bundle d'AVANT migration (≠ observed)
    "phase": "PRE_MIGRATION",
    "version": 8, "verifyJwt": false,
    "entrypointSha256": "…64 hex…",
    "dependencies": [ { "path": "…", "sha256": "…64 hex…", "bytes": 0 } ],
    "bundleSha256": "…64 hex… ≠ observed.bundleSha256"
  },
  "custody": {                      // 3. garde LIÉE à la cible
    "artifactRef": "…pointeur hors dépôt…",
    "artifactSha256": "…64 hex…",
    "owner": "<responsable de la garde>",
    "holdsRestorableArtifact": true,
    "bindsToBundleSha256": "= rollbackTarget.bundleSha256",
    "bindsToFunction": "= function",
    "bindsToVersion": "= rollbackTarget.version"
  },
  "restoreDrill": {                 // 4. restauration exercée, hors production, journalisée
    "performedAt": "2026-11-25T00:00:00Z",
    "performedBy": "<opérateur ou job>",
    "destination": "staging-non-prod",  // staging-non-prod | local-replay | disposable-project
    "result": "PASS",
    "journalRef": "…pointeur du journal, hors dépôt…",
    "journalSha256": "…64 hex…",
    "restoredEntrypointSha256": "= rollbackTarget.entrypointSha256",
    "restoredBundleSha256": "= rollbackTarget.bundleSha256"
  },
  "attestation": {                  // 5. vérification indépendante SIGNÉE (lue hors dépôt)
    "schemaVersion": "rollback-attestation-v3",
    "verifier": "<contrôle indépendant>",
    "verifierIdentity": "<≠ restoreDrill.performedBy, ET dans l'ancre>",
    "attestationSha256": "<sha256 canonique des affirmations>",
    "signature": { "keyId": "<clé épinglée>", "algorithm": "ed25519", "value": "<base64>" }
  }
}
```

L'attestation **ne vit pas dans ce dépôt**. Elle est cherchée sous
`$MAXIMUS_ROLLBACK_EVIDENCE_ROOT/attestations/<fonction>.json`. Racine absente →
`EVIDENCE_ROOT_UNSET` ; racine **dans le dépôt** → `EVIDENCE_ROOT_INSIDE_REPO` (un fichier
versionné dans la même PR que l'évidence qu'il valide ne prouve aucune indépendance), y
compris via un lien symbolique ou un dossier encore inexistant sous un ancêtre lié au dépôt
(`ATTESTATION_DIR_INSIDE_REPO`, `ATTESTATION_INSIDE_REPO`).

**L'ancre de confiance est le seul juge de l'identité du vérificateur.** Elle vit dans
`scripts/security/rollbackVerifierTrustAnchor.json`, ne contient que des clés **publiques**,
et ne peut pas être redésignée par une variable d'environnement : `MAXIMUS_ROLLBACK_
EVIDENCE_ROOT` déplace les *documents*, jamais la *racine de confiance*. Tant qu'aucune clé
publique n'y est provisionnée, aucune attestation ne peut être validée
(`ANCHOR_KEY_NOT_PROVISIONED`) — le gate est fermé mécaniquement, pas par convention.

Règles appliquées par le manifeste :

1. `rollback.ready` n'est **jamais** vrai sans fichier d'évidence de production.
2. `observed.version` et `observed.verifyJwt` doivent **correspondre** à ce que le registre
   a constaté en prod — une évidence pour une autre version est rejetée.
3. Les dépendances de prod dont l'empreinte manque (`matcher.mjs` pour
   `scpi-evidence-certify`, `sourceProvenance.mjs` pour `scpi-bulletin-watch`) maintiennent
   `ready = false` avec `PROD_DEPENDENCY_FINGERPRINT_MISSING`.
4. **Une empreinte seule ne suffit jamais.** Sans bloc `custody` :
   `blockingReason = MISSING_custody` ; avec `holdsRestorableArtifact: false` :
   `CUSTODY_NOT_RESTORABLE`.
5. **La cible restaurée dépend du stage.** Pour une fonction **déjà migrée**
   (`POST_DEPLOY`), `observed.bundleSha256` égal à `rollbackTarget.bundleSha256` →
   `ROLLBACK_TARGET_EQUALS_OBSERVED_BUNDLE` ; `phase` ≠ `PRE_MIGRATION` →
   `ROLLBACK_TARGET_NOT_PRE_MIGRATION`. Pour une fonction **pas encore migrée**
   (`PRE_DEPLOY`), l'égalité est exigée et une cible différente est refusée
   (`ROLLBACK_TARGET_DIFFERS_BEFORE_DEPLOY`).
6. **La garde et le journal doivent être liés.** `CUSTODY_BINDS_OTHER_FUNCTION`,
   `CUSTODY_BINDS_OTHER_VERSION`, `CUSTODY_BINDS_OTHER_BUNDLE`,
   `RESTORE_JOURNAL_INSIDE_REPO`.
7. **Une restauration doit être exercée, hors production, et journalisée.**
   `destination: "production"` est refusé (`RESTORE_DRILL_ON_PRODUCTION`) ; `result` autre
   que `PASS` bloque (`RESTORE_DRILL_NOT_PASSED`) ; une empreinte restaurée différente de la
   cible est refusée (`RESTORE_DRILL_ENTRYPOINT_MISMATCH`, `RESTORE_DRILL_BUNDLE_MISMATCH`).
8. **Sans vérification indépendante SIGNÉE, rien n'est prêt** : `ATTESTATION_MISSING`,
   `EVIDENCE_ROOT_UNSET`, `EVIDENCE_ROOT_INSIDE_REPO`, `ATTESTATION_DIR_INSIDE_REPO`,
   `ATTESTATION_INSIDE_REPO`, `ATTESTATION_NOT_INDEPENDENT`,
   `ATTESTATION_VERIFIER_IS_OPERATOR`, `ATTESTATION_VERIFIER_NOT_TRUSTED`,
   `ATTESTATION_UNSIGNED`, `ANCHOR_KEY_NOT_PROVISIONED`, `ATTESTATION_KEY_NOT_ANCHORED`,
   `ATTESTATION_KEY_REVOKED`, `ATTESTATION_SIGNATURE_INVALID`, `ATTESTATION_SHA256_MISMATCH`,
   `ATTESTATION_CLAIM_MISMATCH_*`.
9. Défense en profondeur : `validateManifest` refuse un rollback `ready` sans garde
   (`ROLLBACK_READY_WITHOUT_CUSTODY`), sans restauration réussie
   (`ROLLBACK_READY_WITHOUT_RESTORE_DRILL`), sans vérification indépendante
   (`ROLLBACK_READY_WITHOUT_INDEPENDENT_VERIFICATION`), **sans signature vérifiée**
   (`ROLLBACK_READY_WITHOUT_SIGNATURE`), avec un stage incohérent
   (`ROLLBACK_READY_WITH_STAGE_MISMATCH`), dont la cible est le bundle déployé d'une fonction
   migrée (`ROLLBACK_READY_TARGET_IS_DEPLOYED_BUNDLE`), ou sans garde liée
   (`ROLLBACK_READY_WITHOUT_CUSTODY_BINDING`). Un readiness pré-déploiement sur une fonction
   migrée est refusé (`PRE_DEPLOY_READY_ON_DEPLOYED_FUNCTION`), et inversement
   (`POST_DEPLOY_READY_ON_UNDEPLOYED_FUNCTION`).
10. Une fonction encore `PENDING_*` ne peut pas avoir un rollback `ready` (test bloquant).
11. `revocationAllowed` exige : **0** fonction hors périmètre bloquante, **16/16**
    `DEPLOYED`, et **16/16** rollback `ready`. Aujourd'hui : `false`.

Un fichier d'évidence est refusé s'il contient une valeur assimilable à une clé
(`sb_secret_*`, `sb_publishable_*`, JWT `eyJ…`) — test dédié. Le dépôt étant **public**,
aucun bundle brut ni contenu de source n'y est publié : uniquement empreintes et pointeurs
de garde.

**État actuel : `rollbackReady = 0/16`, `revocationAllowed = false`.** C'est le résultat
attendu : aucune garde, aucune restauration et aucune attestation signée n'ont encore été
produites hors dépôt, et l'ancre de confiance n'a pas encore sa clé publique. L'outillage
refuse explicitement de conclure sans elles — c'est le but.

#### 2.7.5 Cible de rollback arbitrée : le bundle prod v12 de `scpi-certified-promote`

Arbitrage du 25/11 (#issuecomment-7169681620) : la cible du rollback du patch clé de
`scpi-certified-promote` est **le bundle v12 effectivement en production immédiatement avant
intervention**, empreinte de bundle `db3599421ad844e81a031bfbc149345ecd3e791736e7bb1bca4cba00c5fe8e44`
(`verify_jwt=false`, version 12), **et non** un commit antérieur à #457 choisi arbitrairement.
La sauvegarde doit inclure les dépendances et la configuration, vérifiées, et une
restauration hors production doit être exercée avant le patch — sans publier les sources
brutes (dépôt public).

Deux empreintes ne se confondent pas : l'empreinte **fournisseur** (`ezbr_sha256`, celle du
stockage Supabase) n'est pas l'empreinte **canonique** du manifeste (`bundleSha256`, calculée
sur la liste triée `chemin + empreinte`). C'est la canonique qui doit figurer dans
`observed` / `rollbackTarget` / `custody.bindsToBundleSha256`.

Pour les fonctions **déjà migrées** (les 6 `DEPLOYED`), la cible reste le véritable bundle
**antérieur à leur migration** : leur `stage` est `POST_DEPLOY` et `observed ≠ rollbackTarget`
y est exigé.

#### 2.7.6 Readback fournisseur : le registre du dépôt n'est pas la production

Contrôle indépendant du 25/11 (#issuecomment-7172607601), après validation du principe du
lot 9 :

> « Le gate commonProof compare notamment version et verifyJwt au registre statique : avant
> intervention, recouper également l'identité complète du bundle et la configuration avec le
> readback fournisseur frais ; la signature doit couvrir ou lier ces éléments et le projet
> cible. Une égalité de SHA de code seule ne prouve pas l'égalité de configuration. »

**Le défaut.** `commonProof` comparait `observed.version` / `observed.verifyJwt` à
`fn.prodVersion` / `fn.prodVerifyJwt`, c'est-à-dire au **registre statique du dépôt**. Une
évidence recopiant ce registre « tombait juste » par construction : le gate confrontait une
croyance à elle-même, sans jamais lire la production.

**La correction (schéma `security-prod-evidence-v3`).** Le bloc `observed.readback` est
désormais exigé. Il porte le projet cible, le slug, la version, `verify_jwt`, les empreintes
de code **et** une empreinte de configuration `configSha256` qui couvre
`(projectRef, slug, version, verifyJwt, entrypointPath)`. Trois propriétés sont vérifiées
séparément :

| Propriété | Exigence | Code si absent/faux |
|---|---|---|
| Provenance | lecture fournisseur, pas une ressaisie | `MISSING_observed_readback`, `READBACK_SOURCE_NOT_PROVIDER` |
| Projet cible | `ygvsddcpohsnaowofuwc`, la fonction elle-même | `READBACK_WRONG_PROJECT`, `READBACK_OTHER_FUNCTION` |
| Accord | readback = `observed` = registre | `READBACK_DISAGREES_WITH_OBSERVED_*`, `READBACK_DISAGREES_WITH_REGISTRY` |
| Configuration | `configSha256` recalcule les champs déclarés | `READBACK_CONFIG_SHA256_MISMATCH` |
| Fraîcheur | ≤ 24 h avant `attestation.verifiedAt` signé | `READBACK_STALE_OR_AFTER_VERIFICATION` |

La fraîcheur est mesurée contre le `verifiedAt` **signé**, jamais contre l'horloge du CI :
une évidence commitée reste reproductible et `--check` continue de signaler un vrai défaut
au lieu de vieillir.

**La signature couvre l'identité complète.** `rollback-attestation-v3` exige en plus
`projectRef`, `observedVersion`, `observedVerifyJwt`, `observedConfigSha256`,
`readbackSource` et `readbackFetchedAt`. Une attestation signée qui n'affirme pas le projet
échoue en `MISSING_attestation_claim_projectRef` ; une attestation qui affirme un autre
projet échoue en `ATTESTATION_CLAIM_MISMATCH_projectRef`.

**Collecte réelle, aucune valeur inventée.** `scripts/security/collectReadback.mjs` lit la
fonction déployée en lecture seule et produit le bloc `readback` :

```bash
node scripts/security/collectReadback.mjs --list            # périmètre, aucun réseau
SUPABASE_ACCESS_TOKEN=… node scripts/security/collectReadback.mjs \
  --function scpi-certified-promote                          # readback seul
SUPABASE_ACCESS_TOKEN=… node scripts/security/collectReadback.mjs \
  --function scpi-certified-promote --merge <évidence.json>  # observed réaligné
```

Le jeton n'est lu que dans l'environnement (jamais en argument, où il apparaîtrait dans
`ps`), n'est jamais émis dans la sortie, et le script échoue explicitement
(`SUPABASE_ACCESS_TOKEN_MISSING`, `READBACK_PAYLOAD_WITHOUT_*`, `READBACK_HTTP_<statut>`)
plutôt que de renseigner un champ qu'il n'a pas lu.

#### 2.7.7 Le collecteur doit lire les octets, pas seulement les métadonnées

Contrôle indépendant du 26/11 (#459) sur `collectReadback.mjs` au SHA `b9b2d983` : le
collecteur attendait `payload.files` sur `GET /v1/projects/{ref}/functions/{slug}`. **Cet
endpoint ne rend aucun octet** — seulement des métadonnées (`slug`, `status`, `version`,
`verify_jwt`, `entrypoint_path`, `ezbr_sha256`). Les octets viennent de
`GET /v1/projects/{ref}/functions/{slug}/body`, en `multipart/form-data`.

Quatre défauts corrigés (détail complet dans `scripts/security/prod-bundles/README.md`) :

1. **Deux lectures, liées à la même version.** Métadonnées et contenu sont lus séparément ;
   un corps rendu pour une autre version (`READBACK_BODY_VERSION_MISMATCH`) ou une autre
   fonction (`READBACK_BODY_SLUG_MISMATCH`) est refusé. `bundleSource` déclare la provenance
   des octets (`READBACK_BUNDLE_SOURCE_NOT_PROVIDER`).
2. **Entrypoint à correspondance unique.** Plus de repli sur « n'importe quel `index.ts` » :
   `READBACK_ENTRYPOINT_NOT_IN_BODY`, `READBACK_ENTRYPOINT_AMBIGUOUS`, et le slug demandé est
   vérifié (`READBACK_OTHER_FUNCTION`).
3. **Aucun fichier haché comme du vide.** Un contenu vide est refusé
   (`READBACK_FILE_WITHOUT_CONTENT`, `READBACK_ENTRYPOINT_CONTENT_EMPTY`) au lieu de produire
   l'empreinte du vide, qui était plausible et fausse.
4. **Normalisation explicite des chemins fournisseur.** Les URI temporaires
   (`file:///tmp/user_fn_…/source/index.ts`) sont ramenées à la convention du registre
   (`<slug>/index.ts`, `<slug>/<local>`, `_shared/<partagé>`) ; tout chemin non plaçable
   échoue en `PROVIDER_PATH_NOT_NORMALIZABLE` au lieu d'être deviné. Le chemin fournisseur
   brut reste conservé (`providerEntrypointPath`) et n'est **jamais** confondu avec le
   chemin canonique.

Deux empreintes restent distinctes : `providerEzbrSha256` (stockage fournisseur) et
`bundleSha256` (canonique, **recalculée** par `validateReadback` ; un écart échoue en
`READBACK_BUNDLE_SHA256_MISMATCH`). Un readback n'est plus une collection de valeurs
déclarées : son empreinte de bundle doit se recalculer depuis son propre contenu.

Le collecteur est éprouvé sur une **réponse au format réel, expurgée**
(`scripts/security/fixtures/providerFunctionBody.mjs`) : structure exacte des deux réponses,
contenus remplacés par des marqueurs inertes — aucun source de production n'est publié, le
dépôt étant public.

**État du gate : inchangé et correct.** `preDeployReady = 0/16`, `postDeployReady = 0/16`,
`rollbackReady = 0/16`, `revocationAllowed = false`, `violations = []`. Aucune clé publique
n'est provisionnée dans l'ancre : le gate reste fermé mécaniquement. Le provisionnement de
l'ancre et la signature relèvent du contrôle indépendant, sur une référence protégée — ce
n'est pas un acte de l'opérateur.

#### 2.7.8 Le corps `GET …/body` n'est PAS rejouable : mécanisme de restauration réel

Le mandat du 26/11 demande de vérifier le mécanisme de restauration **réellement supporté**
par le fournisseur, et de ne pas supposer que la réponse multipart est directement rejouable
sur un endpoint de déploiement. Elle ne l'est pas, pour trois raisons distinctes :

| # | Fait constaté | Conséquence si on rejoue « tel quel » |
|---|---|---|
| 1 | Le corps nomme chaque fichier par son **URI temporaire de déploiement** (`file:///tmp/user_fn_…/source/index.ts`) | L'endpoint de déploiement attend des chemins **relatifs** à la racine du bundle ; un `file` nommé `file:///…` n'est pas un chemin de bundle. |
| 2 | La partie `metadata` du corps est une **métadonnée de lecture** (`id`, `version`, `status`, `ezbr_sha256`, `entrypoint_path` absolu) | L'endpoint exige `metadata.name` et `metadata.entrypoint_path` **relatif** ; le reste est ignoré ou rejeté. |
| 3 | `verify_jwt` **n'est pas déductible du contenu** | Un reconditionnement qui l'omet retombe sur la valeur par défaut du fournisseur (`true`). Le périmètre mélange `true` et `false` : la restauration changerait silencieusement la sécurité de la fonction. |

Le seul endpoint qui **écrit** est `POST /v1/projects/{ref}/functions/deploy?slug={slug}`
(`multipart/form-data`, parties `metadata` + `file` répétées). Il n'existe **aucun** endpoint
de « rollback par version » : restaurer signifie **redéployer un bundle**, donc reconditionner.

**Le reconditionnement est prouvé, pas supposé.** `scripts/security/restoreProtocol.mjs` :

```bash
node --test scripts/security/restoreProtocol.test.mjs   # 24 tests, reconditionnement + preuve
```

- `buildDeployRequest(bundle)` produit la requête conforme (`index.ts` relatif, `verify_jwt`
  transporté, dépendances locales à la racine du bundle, `_shared/…` conservé) et **refuse**
  les cas non rejouables (`REPACK_IMPORT_MAP_UNSUPPORTED`, `REPACK_WITHOUT_VERIFY_JWT`,
  `REPACK_EMPTY_FILE`, `REPACK_PROVIDER_URI_NOT_DEPLOY_PATH`…).
- `proveRepackEquivalence({readback, deployRequest})` exige **trois** égalités : ensemble de
  chemins, **octets** (SHA-256 + taille par fichier) et **configuration**. Une réécriture
  « équivalente en intention » échoue en `EQUIVALENCE_BYTES_CHANGED` ou
  `EQUIVALENCE_CONFIG_CHANGED`.
- `buildRestorePlan(...)` ne peut produire que `PREPARED` ou `BLOCKED` — jamais `READY` : une
  restauration non exercée n'est pas une restauration prouvée.
- `digestDeployRequest(request)` lie le plan exécuté au plan préparé sans publier de source.

**Conservation de l'artefact original** (`collectReadback.mjs --capture <nom>`) : les octets
multipart **bruts**, les métadonnées et la configuration de la même version sont écrits sous
`MAXIMUS_ROLLBACK_EVIDENCE_ROOT`, **hors du dépôt** (le dépôt est public). Le CLI refuse
`EVIDENCE_ROOT_UNSET` et `EVIDENCE_ROOT_INSIDE_REPO`, et n'écrit qu'un sceau
(`<slug>.seal.json`) publiable — jamais les octets.

**Protocole exact pour `scpi-certified-promote` v12** (session interactive uniquement) :

1. **Préconditions** : jeton *management* à portée lecture (`functions:read`) pour les étapes
   1–2 ; un projet **hors production** déjà existant et autorisé pour l'étape 4. Aucune
   création de projet payant, aucune nouvelle clé.
2. **Capture** (lecture seule) :
   `MAXIMUS_ROLLBACK_EVIDENCE_ROOT=/chemin/hors/dépôt SUPABASE_ACCESS_TOKEN=… node scripts/security/collectReadback.mjs --capture scpi-certified-promote`
   → attendu : `artifactSha256`, `bundleSha256`, `configSha256`, `version=12`,
   `verifyJwt=false`. Si `CAPTURE_BODY_VERSION_MISMATCH`, **arrêter** : les deux lectures ne
   décrivent pas le même objet.
3. **Reconditionnement + preuve** (hors ligne, aucun appel réseau) : construire la requête de
   déploiement, exiger `verdict = PASS`. Un `FAIL` interdit la suite.
4. **Restauration exercée hors production** : déployer la requête dans le projet non-prod
   autorisé, puis **relire** (`--function`) et comparer version, `verify_jwt`, `bundleSha256`
   et `configSha256` au sceau. Écrire un journal identifiable et son empreinte.
5. **Attestation** : le contrôle indépendant signe (`ed25519`) les 22 affirmations — le
   décompte et la forme exacte sont produits par le dépôt
   (`node scripts/security/edgeFunctionDeploymentManifest.mjs --attestation-claims <fonction>
   <évidence hors dépôt>`), jamais recopiés d'une prose ; la clé
   publique doit être épinglée dans `rollbackVerifierTrustAnchor.json` par une PR relue.
6. **Seulement ensuite** `custody` + `restoreDrill` peuvent être renseignés, et
   `rollbackReady` peut passer de 0/16.

**Critères de succès** : `restoreDrill.result = PASS`, `destination` ∈ {`staging-non-prod`,
`disposable-project`} — un `local-replay` **ne suffit pas** (il ne traverse aucune plateforme
de déploiement, donc le gate le refuse en `RESTORE_DRILL_NOT_ON_DEPLOYED_ENVIRONMENT`),
`restoredBundleSha256 = rollbackTarget.bundleSha256`, et un readback **indépendant** post-
restauration qui reproduit le même `configSha256`. **Rollback** : le bundle prod v12 reste en
place pendant tout l'exercice ; aucune révocation, aucun swap.

**Blocage explicite** : Cursor n'a ni jeton Supabase ni accès au projet non-prod ; les étapes
2 et 4–5 sont donc **impossibles depuis Cursor** et restent `NON EXÉCUTÉ`. Ce qui est
`EXÉCUTÉ` et `VÉRIFIÉ` ici est le reconditionnement et sa preuve d'équivalence, sur la forme
réelle des réponses fournisseur (fixture expurgée).

> **Vocabulaire à tenir (arbitrage du 26/11)** : « protocole testé » ≠ « restauration
> exercée ». Tant que l'étape 4 n'a pas eu lieu dans un environnement hors production autorisé,
> la restauration reste **non prouvée**. Aucun compte rendu ne doit intituler ce travail
> « restauration prouvée ».


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

---

## 9. Fiabilité des cycles autonomes (mandat 26/11, P1)

### 9.1 Les deux runs cités : ce qu'ils prouvent réellement

| Run | Workflow | Conclusion GitHub | Contenu métier réel |
|---|---|---|---|
| [45737876009](https://github.com/Speedcup212/maximus-scpi/actions/runs/45737876009) | DeepSeek corrective | `success` | **NO-OP** : `claimed=no`, motif `no_eligible_scoped_task_or_daily_budget`. Étapes `Setup Node`, appel modèle, PR → **toutes skipped**. Appels modèle : **0**. |
| [45738186343](https://github.com/Speedcup212/maximus-scpi/actions/runs/45738186343) | Independent watchdog | `success` | **Observation seule** : `IDLE`, `candidate20: NOT_DUE (2026-11-26)`, `document-replay: HEALTHY`, `safe-remediation: NOT_DUE`. Aucune réparation, aucun redémarrage. |

**Conclusion factuelle** : « workflow vert » ≠ « cycle productif ». Les deux runs sont des
succès de **transport**, pas des **exécutions**. Un run vert sans tâche ne prouve rien sur
la santé du système, et c'est exactement ce qui a rendu le contrôle de 06:53 Paris
« incomplet, aucun verdict ».

**Nuance de lecture (contrôle du 26/11), vérifiée dans les logs** : la liste des jobs montre
l'étape `Claim one existing exact-scope task with GitHub OIDC` en **`success`**. Cela ne
contredit pas le NO-OP : cette étape réussit parce qu'elle a **correctement obtenu la réponse**
« aucune tâche éligible », puis les étapes payantes (`Setup Node`, appel modèle, PR) sont
`skipped`. Le succès porte sur **l'appel au pont**, pas sur un claim ; la sortie `reason` vaut
`no_eligible_scoped_task_or_daily_budget`. C'est pourquoi le marqueur `BUSINESS_OUTCOME` doit
être lu **avec** `NO_OP_REASON` : à lui seul, il ne prouve pas un cycle métier.

### 9.2 Cause du no-op DeepSeek (établie, pas supposée)

`maximus-search-agent-oidc` appelle `claim_scoped_corrective_task(role)`, qui n'accepte
qu'un cas très étroit (migration `20261016_deepseek_scoped_corrective_worker.sql`) :

- `kind = 'execute'`, `cardinality(issue_ids) = 1` ;
- l'issue doit porter `scope->>'execution_mode' = 'scoped_code_correction'` ;
- `scope->'files'` doit être un tableau de **exactement 1** fichier.

Or `prepare_execution` produit majoritairement des tâches qui ne satisfont pas ce filtre.
Tant qu'aucune issue n'est écrite avec ce scope exact, **le worker ne peut rien réclamer** :
le no-op est structurel, pas accidentel.

### 9.3 Défaut corrigé : un no-op était invisible

**Avant** : le run se terminait en `success` avec un `core.notice` noyé dans le log ; aucun
écart entre « job vert » et « rien exécuté ».

**Corrigé** (`.github/workflows/maximus-deepseek-search.yml`) : la sortie `reason` est
exposée, un `NO-OP` est nommé dans les notices, le `GITHUB_STEP_SUMMARY` porte la cause, et
une étape terminale écrit `BUSINESS_OUTCOME=EXECUTED|NO_OP` + `NO_OP_REASON=…`.
Verrouillé par `scripts/agents/deepseekWorkflowContract.test.mjs` (4 tests).

### 9.4 Déclenchement Cursor par commentaire : ce qui existe vraiment

- **Existe** : `.github/workflows/claude.yml` — `on: issue_comment [created]`, condition
  `contains(body, '@claude')`, action `anthropics/claude-code-action@v1`. C'est le **seul**
  workflow déclenché par un commentaire de ticket dans le dépôt.
- **N'existe pas** : aucun déclencheur par commentaire vers l'automation Cursor, et aucun
  workflow ne consomme les commentaires de #459 pour lancer un contrôle.

**Ce qui relève du planificateur ChatGPT (hors de portée de Cursor)** : la cadence horaire,
l'horaire 06:53 / 08:37 Paris, et le fait qu'un passage se déclare « complet » ou non. Cursor
ne peut ni le lire ni le corriger.
**Ce qui relève de ce dépôt (et est corrigé ici)** : ne pas présenter un run vert comme une
preuve de cycle ; rendre le no-op explicite.

**Correctif minimal recommandé côté ChatGPT** : considérer un passage comme *complet*
seulement s'il lit `BUSINESS_OUTCOME` et, en cas de `NO_OP`, qu'il rapporte le
`NO_OP_REASON` — sinon « contrôle incomplet, aucun verdict » est le **bon** verdict.

---

## 10. File d'exécution historique `maximus_agents` (mandat 26/11, P1)

Le contrôle SQL de ce matin constatait : watchdog `IDLE`, 11 tâches en attente, 4 incidents
bloqués, aucune exécution dans `runs` sur 24 h, agents sans heartbeat récent — **mais**
69 PASS_100 / 0 FAIL. Cursor n'ayant **aucun jeton Supabase**, l'inventaire par UUID est
impossible ici. Ce qui *est* établi, de façon reproductible, est le diagnostic structurel :

```bash
node --test scripts/agents/agentsQueueDiagnostic.test.mjs   # 8 tests
```

### 10.1 Quatre classes de tâches sur cinq sont orphelines

| Classe | Produite par | `kind` | Réclamable aujourd'hui | Pourquoi |
|---|---|---|---|---|
| `scoped_corrective_execute` | `prepare_execution` (branche scoped) | execute | **OUI** | seul consommateur : `maximus-deepseek-search.yml` |
| `role_batch_execute` | `prepare_execution` (boucle rôles) | execute | **NON** | agrège **plusieurs** issues ; le claim scoped exige `cardinality=1` + scope scoped |
| `qa_verify` | `prepare_execution` / `prepare_cycle` | verify | **NON** | aucun workflow n'appelle un claim pour `kind=verify` |
| `daily_role_audit` | `prepare_cycle` | audit | **NON** | `claim_task` existe mais **n'a plus aucun appelant workflow** |
| `daily_qa_audit` | `prepare_cycle` | audit | **NON** | idem |

**Conséquence** : `pending_tasks > 0` avec `runner_state = IDLE` n'est pas une anomalie
transitoire, c'est la **signature** d'un orphelinage. Les 11 tâches en attente sont très
probablement de ces quatre classes. Une tâche qu'aucun consommateur ne peut réclamer n'est
pas « en attente » : elle est morte.

### 10.2 `record_execution` hors chaîne de migrations : asymétrie de dépôt, hypothèse RÉFUTÉE

Le pont OIDC appelle `maximus_agents.record_execution(...)` à chaque écriture de résultat
(`maximus-search-agent-oidc/index.ts`, 4 arguments liés au corps de la requête). La seule
définition dans le dépôt se trouve dans `agents/autonomous/execution.sql` — signature
`(p_task uuid, p_token uuid, p_status text, p_result jsonb)` — **qui n'est pas une migration** :
aucun fichier de `supabase/migrations/` ne la crée.

**Hypothèse initiale (lot 12)** : la fonction n'existe pas en base, donc tout claim réussi
échouerait en **HTTP 422**, la tâche resterait `running` jusqu'à expiration du bail, puis serait
bloquée par `reconcile_expired_tasks` (`LEASE_EXPIRED_RECONCILED`) — candidat pour les
**4 incidents bloqués**.

**Verdict du contrôle indépendant (26/11), qui clôt le débat** : la requête ci-dessous renvoie
**exactement 1 fonction** en production. L'hypothèse d'absence est donc **réfutée**, et
`agents/autonomous/execution.sql` **ne doit pas** être appliqué sur ce motif.

```sql
select n.nspname, p.proname from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'maximus_agents' and p.proname = 'record_execution';
```

**Ce qui reste vrai, et que le dépôt peut affirmer** : l'asymétrie de dépôt est un **risque de
reproductibilité**. Un environnement recréé depuis `supabase/migrations/` seul n'aurait pas
cette fonction. C'est une conclusion plus faible qu'une panne, mais exacte. La consigner ainsi
évite de rouvrir une hypothèse close.

**Vérification restante (session interactive)**, maintenant que l'existence est acquise : la
**signature** effective et les **traces 422** dans les logs de la fonction. Une fonction
existante à la mauvaise signature produirait le même symptôme qu'une fonction absente.

   1370|

### 10.3 Requête d'inventaire exacte (à exécuter par ChatGPT)

`buildInventoryQuery()` (dans `agentsQueueDiagnostic.mjs`) fournit le SQL **en lecture seule**
qui répond aux quatre questions du mandat : inventaire des tâches par `status`/`kind`/
`cycle_date`/`cardinality(issue_ids)`/`depends_on`, incidents actifs avec leur preuve,
heartbeats par rôle, et exécutions sur 24 h. **Aucun `update`, aucun `delete`, aucune
fermeture d'incident.**

### 10.4 Traitement minimal proposé (aucune modification SQL appliquée ici)

1. **Ne pas relancer** les workers historiques : ils n'ont pas de consommateur.
2. **Ne pas fermer** les 4 incidents à la main : `reconcile_expired_tasks` doit les avoir
   produits pour une raison ; la cause (10.2) doit être établie d'abord.
3. **Décider par classe**, sur la base de l'inventaire : une tâche `role_batch_execute`
   obsolète se clôt avec un motif écrit ; une tâche réellement nécessaire se réécrit en
   issue `scoped_code_correction` à **1 fichier** — la seule forme exécutable aujourd'hui.
4. **Ne pas supprimer `claim_task`** dans cette PR : le retrait d'une fonction SQL est une
   opération de production, hors périmètre Cursor.
5. **Critère de sortie** : `pending_tasks` explique chacune de ses lignes par une classe
   `CLAIMABLE`, ou par une décision documentée. Un compteur qui ne peut pas descendre n'est
   pas un indicateur de charge, c'est un défaut.

---

## 11. Handoff unique exécutable — session interactive du 26/11

**Objet.** L'arbitrage du 26/11 (09:53Z) demande **un** handoff exécutable couvrant cinq
opérations : capture scellée, projet jetable dédié, restauration avec readback et tests
d'authentification, ancre indépendante avec conservation de la clé privée, et disposition de
la tâche ANALYST. Ce chapitre remplace les instructions éparses des chapitres 2.7 et 2.8,
qui restent la référence de conception.

**Statut global** : `PRÉPARÉ` côté dépôt, `NON EXÉCUTÉ` côté fournisseur. Aucune de ces
opérations n'est réalisable depuis une automation Cursor (aucun jeton Supabase, aucun accès
projet). **Aucune n'a été exécutée ici.**

### 11.1 Le défaut qui rendait ce handoff inexécutable (corrigé dans ce lot)

Le plan de restauration émis par `restoreProtocol.mjs` décrivait ses étapes avec des
commandes qui **n'existent pas** :

| Étape du plan (avant) | Ce qui se passait réellement |
|---|---|
| `collectReadback.mjs --function <nom> --custody <dir>` | `--custody` n'est pas un drapeau reconnu ; le CLI l'ignore et part en collecte de readback. L'opérateur croit avoir sauvegardé, il n'a rien scellé. |
| `restoreProtocol.mjs --custody <dir> --target <file>` | **Aucun** point d'entrée CLI : le module est une bibliothèque. La commande ne produit rien et sort en 0 — le pire cas : un succès apparent sans effet. |

Trois conséquences concrètes, toutes vérifiées :

1. `--custody` ignoré silencieusement ⇒ **fausse preuve de sauvegarde**. Le drapeau correct
   est `--capture`, documenté au §2.7.8.
2. `restoreProtocol.mjs` exécuté en ligne de commande s'arrête en **exit 0 sans rien faire**.
3. Le plan refusait l'exercice lui-même : avec la cible légitime d'un exercice (le bundle
   observé), `buildRestorePlan` renvoyait `BLOCKED` / `ROLLBACK_TARGET_EQUALS_OBSERVED_BUNDLE`.
   Cette règle protège l'**évidence de rollback** (restaurer la version qui tourne ne défait
   rien) ; elle n'a pas de sens pour un **exercice de restauration**, dont la cible *est*
   précisément l'artefact capturé.

**Corrigé** : le plan porte un champ `purpose` (`ROLLBACK_EVIDENCE` par défaut, ou
`RESTORE_DRILL`), chaque étape porte une `command` réellement exécutable, et l'étape 2 a
désormais un CLI : `scripts/security/prepareRestore.mjs`. La liste des scripts cités par le
plan est contrôlée par test (existence sur disque) et par CI.

### 11.2 Préconditions (à vérifier avant toute action)

| # | Précondition | Comment la vérifier | État |
|---|---|---|---|
| P1 | Jeton *management* Supabase, portée lecture fonctions | `GET /v1/projects/{ref}/functions` répond 200 | à fournir par la session |
| P2 | Racine de conservation **hors dépôt** | `MAXIMUS_ROLLBACK_EVIDENCE_ROOT` défini, hors `REPO_ROOT` | outillé (`EVIDENCE_ROOT_INSIDE_REPO`) |
| P3 | Projet **hors production** autorisé | `AUTHORIZED_RESTORE_PROJECT_REFS` (dans `restoreProtocol.mjs`) contient le `projectRef` **et** une autorisation nominative du propriétaire (§11.5.3) | **BLOQUÉ** — liste **vide** : aucun projet MaximusSCPI hors prod n'existe (inventaire du 26/11). Coût désormais **établi** (§11.5.2) ; reste la **décision du propriétaire** sur le chemin de coût |
| P4 | Clé publique du vérificateur publiée par PR relue | `rollbackVerifierTrustAnchor.json` : `keyId`/`publicKeyPem` non nuls | **BLOQUÉ** — côté contrôle indépendant |
| P5 | Aucune révocation, aucun swap, aucun `db push` pendant l'exercice | relecture de ce chapitre | règle |

### 11.3 Procédure exacte, étape par étape

Les cinq étapes ci-dessous s'exécutent **dans l'ordre**. Une étape `BLOQUÉE` arrête la suite :
le gate reste fermé, ce qui est le comportement attendu, pas un incident.

**Étape A — Capture scellée (lecture seule, sans écriture en production).**

```bash
export MAXIMUS_ROLLBACK_EVIDENCE_ROOT=/chemin/absolu/hors/depot
export SUPABASE_ACCESS_TOKEN=…            # jamais en argument (visible dans ps)
node scripts/security/collectReadback.mjs --capture scpi-certified-promote
```

Preuves attendues, toutes vérifiables sans publier de source :

- `artifacts/scpi-certified-promote.multipart.bin` — octets bruts, mode 0600, hors dépôt ;
- `artifacts/scpi-certified-promote.seal.json` — `artifactSha256`, `artifactBytes`, `version`,
  `verifyJwt`, `bundleSha256`, `configSha256`, `providerEzbrSha256` ;
- **critère de succès** : `version = 12`, `verifyJwt = false`,
  `providerEzbrSha256 = db3599421ad844e81a031bfbc149345ecd3e791736e7bb1bca4cba00c5fe8e44`,
  `bundleSha256 ≠ providerEzbrSha256` (empreinte fournisseur ≠ empreinte canonique) ;
- **échec explicite** : `CAPTURE_BODY_VERSION_MISMATCH` si les deux lectures ne décrivent pas
  la même version ⇒ **arrêter**. `EVIDENCE_ROOT_INSIDE_REPO` ⇒ choisir une autre racine.

**Étape B — Reconditionnement et preuve d'équivalence (hors ligne, étape 2 du plan).**

```bash
MAXIMUS_ROLLBACK_EVIDENCE_ROOT=$MAXIMUS_ROLLBACK_EVIDENCE_ROOT \
  node scripts/security/prepareRestore.mjs --function scpi-certified-promote \
  --target-project-ref <projet-jetable-autorisé>
```

- relit l'artefact scellé et **vérifie son intégrité** avant de l'interpréter
  (`CAPTURE_BYTES_TAMPERED` sinon) ;
- reconditionne en requête `POST …/functions/deploy` et prouve **trois** égalités (chemins,
  octets par fichier, configuration) ;
- **critère de succès** : `state = PREPARED`, `equivalence.verdict = PASS`,
  `equivalence.reasons = []`, `recomputedBundleSha256 = bundleSha256` du sceau ;
- sort en **1** si bloqué : `REPACK_*` nomme la raison exacte ;
- la cible est refusée si elle n'est pas **explicitement autorisée** (`RESTORE_TARGET_*`,
  voir §11.5) — un identifiant fourni en argument n'est pas une autorisation. Le refus
  intervient **avant** l'écriture du rapport : une préparation refusée ne laisse aucun
  fichier derrière elle ;
- l'intégrité de l'artefact et la preuve d'équivalence restent, elles, vérifiables hors CLI
  (`prepareFromCaptured`) : le blocage porte sur la **destination**, jamais sur les octets.

**Étape C — Émission de la requête de déploiement (aucun appel réseau).**

```bash
node scripts/security/prepareRestore.mjs --function scpi-certified-promote \
  --target-project-ref <projet-jetable-autorisé> --emit-deploy-request
```

Écrit `deploy-requests/scpi-certified-promote.deploy-request.json` **hors dépôt** (le fichier
contient du source) et imprime le chemin, la destination et le `deployRequestDigest`.

- la destination est **estampillée** dans la requête (`projectRef` + `urlTemplate`) : elle
  n'est jamais recopiée du projet de capture. Une émission sans cible autorisée échoue
  (`state = TARGET_REFUSED`) et n'écrit **aucun** fichier ;
- le fichier émis ne doit **jamais** contenir le projet de production, dans aucun champ ;
- le `projectRef` fait partie du digest : estampiller une autre destination change l'empreinte.
  Le digest attendu est celui du plan préparé **pour cette cible**, pas celui du
  reconditionnement brut (calculé avant la décision de destination).

**Étape D — Restauration exercée hors production + readback indépendant.**

```bash
MAXIMUS_ROLLBACK_EVIDENCE_ROOT=$MAXIMUS_ROLLBACK_EVIDENCE_ROOT SUPABASE_ACCESS_TOKEN=… \
  node scripts/security/prepareRestore.mjs --function scpi-certified-promote \
  --restored-project-ref <projet-jetable-autorisé> --verify-restored
```

Le déploiement lui-même (`POST /v1/projects/<jetable>/functions/deploy?slug=scpi-certified-promote`)
est effectué par la session interactive avec le fichier de l'étape C. Puis `--verify-restored`
fait **deux lectures** dans le projet jetable (métadonnées + corps) et compare au sceau :
`bundleSha256`, `verifyJwt`, `entrypointSha256`, dépendance par dépendance, et le slug.

- **la cible est contrôlée AVANT toute lecture fournisseur.** Une relecture de la production
  est refusée (`RESTORE_TARGET_IS_PRODUCTION_PROJECT`) sans qu'aucune requête ne parte : le
  CLI ne doit jamais tenter de lire la production pour « vérifier » un exercice ;
- le contrôle porte aussi sur le projet **réellement lu** : si le fournisseur répond pour un
  autre projet que celui demandé, le verdict est `RESTORED_PROJECT_REF_MISMATCH` ;
- **critère de succès** : `verdict = PASS`, `RESTORED_*` absent, `contentComparison =
  ATTEMPTED` ;
- `configSha256` **n'est pas** comparé à l'identique : il lie le `projectRef`, donc il change
  légitimement entre production et projet jetable. Comparer son empreinte brute ferait échouer
  tout exercice valide ; on compare les champs qu'il couvre.
- la **version fournisseur** n'est pas comparée non plus : un redéploiement en crée une
  nouvelle sans changer les octets. Elle est **tracée** dans `versionTrace`
  (`sealVersion`, `restoredVersion`, `differs`) pour que l'écart reste visible sans faire
  échouer un exercice légitime.
- **un `PASS` de comparaison n'est pas une preuve d'exercice** : `exercisedProof` reste
  `false`. Le déploiement, le démarrage et la configuration de sécurité se prouvent par les
  tests d'authentification du §11.4, exécutés **dans** le projet d'exercice.
- le journal est écrit sous `restorations/<slug>.<ref>.json` : c'est lui, et son empreinte,
  qui alimentent `restoreDrill.journalSha256`.

**Étape E — Attestation indépendante (hors dépôt).**

Aucune commande de dépôt pour signer : le contrôle indépendant signe (`ed25519`) les
22 affirmations avec sa clé privée, qui ne quitte pas son poste. La **forme exacte** de ces
affirmations n'est pas à recopier depuis ce document : elle est produite par le dépôt à
partir de l'évidence réelle, ce qui interdit toute dérive entre le payload signé et le
payload vérifié.

```bash
# lit l'évidence hors dépôt et imprime les affirmations exactes + l'empreinte à signer
node scripts/security/edgeFunctionDeploymentManifest.mjs --attestation-claims \
  <fonction> <chemin-évidence-hors-dépôt> [verifiedAt ISO]
```

> **Défaut corrigé le 27/11** : ce chapitre annonçait « les onze affirmations » alors que
> `crossCheckAttestation` en exige `ATTESTATION_REQUIRED_CLAIMS.length` (22). Un contrôle
> indépendant suivant le document signait onze affirmations et recevait onze
> `MISSING_attestation_claim_*` — une signature valide, mais un payload incomplet, donc un
> refus **après** l'exercice de restauration. Le décompte est désormais vérifié par test
> contre le contrôleur réel, et le CLI `--attestation-claims` produit les affirmations.

Sa clé **publique** est publiée dans
`rollbackVerifierTrustAnchor.json` par une PR relue. Tant que `keyId`/`publicKeyPem` valent
`null`, le gate reste fermé en `ANCHOR_KEY_NOT_PROVISIONED` : c'est l'état correct.

**Conservation de la clé privée (arbitrage du 26/11)** : la clé privée du vérificateur n'est
**jamais** dans ce dépôt, jamais dans une variable d'environnement de CI, jamais transmise à
Cursor. Elle reste sur le poste du contrôle indépendant. Une rotation éventuelle se déclare en
ajoutant une identité, jamais en remplaçant silencieusement une clé épinglée (`revokedKeyIds`).

### 11.4 Tests d'authentification après restauration (à exécuter dans le projet jetable)

La restauration ne prouve pas seulement des octets : elle doit prouver la **configuration de
sécurité**. Pour chaque fonction restaurée :

| Test | Commande | Attendu |
|---|---|---|
| `verify_jwt=false` préservé | `curl -i -X POST https://<ref-jetable>.supabase.co/functions/v1/<slug>` **sans** `Authorization` | pas de `401` dû au JWT (l'authentification interne de la fonction décide) |
| `verify_jwt=true` préservé | même appel **sans** jeton | `401` |
| Jeton invalide rejeté | `-H 'Authorization: Bearer invalide'` | `401` |
| Fonction réellement démarrée | premier appel | pas de `503` / `BOOT_ERROR` |

Un `verify_jwt` restauré à `true` sur une fonction publique se voit ici immédiatement : c'est
le troisième obstacle du §2.7.8, et le seul test qui le détecte.

### 11.5 Projet jetable : conditions et coût établis avant création

L'arbitrage indique qu'**aucun projet MaximusSCPI hors production n'existe**, que les projets
du cabinet CGP sont hors périmètre et ne doivent pas être réutilisés, et qu'aucun projet payant
ne doit être créé sans accord. Options, avec ce que chacune prouve :

| Option | Prouve une restauration exercée ? | Coût / condition |
|---|---|---|
| Organisation Free **séparée**, projet vide | **OUI** — traverse le déploiement, la résolution des dépendances et la pose de `verify_jwt` | **0 €** ; dépend d'un quota Free que l'agent ne peut pas inventer (voir §11.5.2) |
| Projet jetable vide dans l'organisation **Pro** existante | **OUI** | **facturé à l'heure** : 0,01344 $/h (Micro), ~10 $/mois si le projet n'est pas supprimé ; **décision du propriétaire** |
| Projet de staging existant (si un jour autorisé) | **OUI** | aucun projet MaximusSCPI hors prod à ce jour |
| Rejeu local (`local-replay`) | **NON** — reconstruit en mémoire, n'exerce aucune plateforme | gratuit, immédiat |

#### 11.5.1 Une destination doit être *autorisée*, pas seulement *différente*

Le contrôle du 26/11 a établi que `--restored-project-ref` n'était soumis à **aucune** garde,
et que `verifyRestoredAgainstSeal` ne rejetait pas `readback.projectRef === seal.projectRef` :
relire la production et comparer à la capture de la production donnait `PASS` sur tous les
champs de contenu, sans qu'aucun déploiement n'ait eu lieu. Le seul champ qui distingue deux
lectures était journalisé, jamais contrôlé.

L'autorisation est désormais une **constante du dépôt** : `AUTHORIZED_RESTORE_PROJECT_REFS`
dans `scripts/security/restoreProtocol.mjs`. Elle est **vide**, et c'est l'état correct :
l'inventaire établit qu'aucun projet hors production n'existe. Un identifiant fourni en
argument, une variable d'environnement ou un document ne créent **pas** une autorisation.

Codes de refus, citables tels quels dans un journal d'exploitation :
`RESTORE_TARGET_MISSING`, `RESTORE_TARGET_IS_PRODUCTION_PROJECT`,
`RESTORE_TARGET_IS_SOURCE_PROJECT`, `RESTORE_TARGET_NOT_AUTHORIZED`,
`RESTORED_PROJECT_REF_MISMATCH`.

Le contrôle s'applique aux **quatre** endroits qui décident d'une destination : le verdict de
relecture, la branche CLI `--verify-restored` (avant toute lecture fournisseur), la
préparation (`--target-project-ref`), et l'**émission** de la requête de déploiement — le
fichier que l'opérateur envoie réellement ne nomme jamais la production, et une émission sans
cible autorisée n'écrit rien.

#### 11.5.2 Ce que coûte réellement un projet jetable (corrigé le 26/11)

Le lot 15 avait écrit ici que l'exercice serait « 0 € sur le plan gratuit ». **Ce constat est
réfuté par l'arbitrage du 26/11** (#issuecomment-7191000567) : l'organisation Supabase actuelle
est **Pro** et compte déjà quatre projets actifs. La règle tarifaire officielle est explicite —
« *The subscription plan is set on the organization level and it is not possible to mix paid
and non-paid projects inside a single organization.* » Un projet créé dans cette organisation
est donc **facturé**, quel que soit son usage. Les chiffres ci-dessous sont relevés le
26/11 sur les pages officielles et sont portés par un module de dépôt
(`scripts/security/restoreTargetAuthorization.mjs`), pas par une prose.

**Deux chemins seulement prouvent un exercice**, et ils ne coûtent pas la même chose :

| Chemin | Coût marginal | Pire cas (projet oublié) | Ce qui reste à vérifier |
|---|---|---|---|
| Organisation **Free séparée**, aucune donnée client | **0 €** | 0 € | quota de **2 projets actifs** par organisation, décompté sur **tous** les membres Owner/Admin — **non inventoriable par l'agent** ; existence d'une organisation Free séparée |
| Projet vide dans l'organisation **Pro** | **0,01344 $/h** (Micro, heure entamée facturée en entier) | **~10 $/mois** si non supprimé | consommation réelle du crédit de calcul sur le cycle en cours |

Les tarifs qui fondent le second chemin, cités avec leur phrase source :

| Tarif | Valeur | Phrase officielle |
|---|---|---|
| Abonnement Pro (déjà payé) | 25 $/mois | « *Pro $ 25 /month* » |
| Calcul Micro | 0,01344 $/h, ~10 $/mois | « *Micro $ 0.01344 ~ $ 10* » |
| Crédit de calcul inclus | 10 $/mois | « *Paid plans include $ 10 in Compute Credits, which cover one project running on Nano or Micro Compute size* » |
| Facturation du calcul | horaire | « *Compute instances are billed hourly* » |
| Projet en pause | non facturé | « *No, we do not charge for paused projects. Compute hours are only counted for active instances.* » |
| Projets Free | 2 actifs maximum | « *Limit of 2 active projects.* » |
| Quota Free | tous Owner/Admin | « *within an organization, we count the free project limits from all members that are either Owner or Admin* » |

**Pourquoi le crédit de 10 $ ne rend pas le projet gratuit** : il couvre **un seul** Micro, et
les quatre projets existants le consomment déjà. Un projet supplémentaire est facturé en
entier. Le coût d'un exercice de deux heures est donc de l'ordre de **0,03 $** — négligeable,
mais **réel**, et c'est cette différence qui exige une décision explicite plutôt qu'un
raisonnement « c'est gratuit ». À l'inverse, le risque n'est pas l'exercice : c'est le **projet
laissé actif**, qui coûte ~10 $/mois. D'où la condition de suppression immédiate.

Aucune création, aucun déploiement, aucun appel fournisseur n'a eu lieu pour établir ces
chiffres.

#### 11.5.3 Une autorisation est nominative, bornée et non transférable

Écrire « un document ne crée pas une autorisation » ne suffisait pas : rien n'empêchait de
peupler `AUTHORIZED_RESTORE_PROJECT_REFS` par un commit. Le module
`scripts/security/restoreTargetAuthorization.mjs` rend le défaut **détectable par test** :

| Règle | Code de refus |
|---|---|
| Une liste peuplée **sans** autorisation valide est refusée, même avec la meilleure intention | `AUTHORIZED_LIST_WITHOUT_RECORD` |
| Seul le propriétaire autorise | `AUTHORIZATION_NOT_OWNER` |
| L'autorisation nomme **un** projet ; elle n'ouvre pas les autres | `AUTHORIZATION_TARGET_MISMATCH` |
| La portée est fermée à `RESTORE_DRILL` | `AUTHORIZATION_SCOPE_NOT_RESTORE_DRILL` |
| Une autorisation de restauration ne vaut **jamais** révocation | `AUTHORIZATION_GRANTS_REVOCATION` |
| Le coût doit être sourcé, daté et recalculé — pas déclaré | `AUTHORIZATION_COST_BASIS_UNVERIFIED` |
| La durée reste dans l'enveloppe que le propriétaire a bornée (2 h) | `AUTHORIZATION_EXCEEDS_AUTHORIZED_ENVELOPE` |
| L'autorisation expire | `AUTHORIZATION_EXPIRED` |
| Le fichier d'autorisation vit **hors** du dépôt public | `AUTHORIZATION_RECORD_INSIDE_REPO` |
| Une autorisation orpheline ne dort pas dans le dossier de conservation | `STALE_AUTHORIZATION_RECORD` |

Deux états sont donc distingués, et c'est le point : `CLOSED_EXPECTED` (liste vide — l'état
correct du 26/11, **pas** une anomalie) et `REFUSED` (liste peuplée sans décision). Une
autorisation fournie mais rejetée est signalée comme telle : elle ne retombe jamais
silencieusement sur « aucune autorisation ».

Lire l'état réel, sans jeton et sans rien écrire :

```bash
node scripts/security/restoreTargetAuthorization.mjs --check
```

Sortie attendue aujourd'hui : `authorizedProjectRefs: 0`, `state: CLOSED_EXPECTED`,
`rollbackReady: "0/16"`, `revocationAllowed: false`. Le module ne lit **aucune** variable
d'environnement : ni argument, ni `env` ne peut ouvrir une cible.

Tant que cette décision n'est pas prise, `AUTHORIZED_RESTORE_PROJECT_REFS` reste vide et
`rollbackReady` reste à **0/16** : c'est le comportement correct, pas un incident.

#### 11.5.4 Un coût établi n'est pas une dépense bornée (lot 17)

L'arbitrage « CHEMIN B AUTORISÉ » du 26/11 ne dit pas seulement *quel* projet : il fixe une
durée et un montant (« cible 2 h, ~0,03 USD ») et impose d'**arrêter** au-delà. Le module,
lui, ne vérifiait que l'**exactitude** du coût, jamais son **ampleur** : une autorisation de
1000 heures (13,44 $, soit 500 fois l'enveloppe et au-delà du pire cas mensuel de 10 $)
sortait `AUTHORIZED`, avec un coût « établi » et sourcé.

C'était exactement le même défaut que le lot 16 avait corrigé sur l'arrondi — un chiffre
juste qui ne dit rien de la borne — déplacé d'un cran. `OWNER_AUTHORIZED_RESTORE_DRILL_ENVELOPE`
porte désormais `maxHours: 2`, et `AUTHORIZATION_EXCEEDS_AUTHORIZED_ENVELOPE` refuse tout
exercice au-delà. La borne est **dérivée** du tarif sourcé (`hourlyMicro(2)` = 0,02688 $),
jamais recopiée à la main : une seconde valeur écrite en dur dériverait du tarif officiel.

L'enveloppe ne fait que **refuser** : elle n'autorise rien et ne remplace pas la décision
nominative. Le chemin Free (0 €) reste borné en durée — un exercice n'est pas illimité parce
qu'il est gratuit.


**Recommandation inchangée et conforme au gate** : garder `rollbackReady` à `0/16` jusqu'à ce
qu'une restauration exercée ait lieu. Le rejeu local reste une preuve **partielle** assumée,
jamais une restauration. Élargir `restoreDestinationsProvingRestore`, ou peupler
`AUTHORIZED_RESTORE_PROJECT_REFS` sans décision, pour « débloquer » serait rouvrir le défaut
corrigé aux lots 13 et 14.

### 11.6 Tâche ANALYST `ca1cc7be-2e80-43dd-afc6-42f01e069951` : nécessité métier d'abord

L'arbitrage est explicite : **établir la nécessité métier et le fichier exact avant toute
requalification**. Aucune requalification n'est donc proposée ici ; la disposition reste
`EXECUTE_MISSING_SCOPE` et `mutatesState = false`.

Ce qu'il faut établir, dans cet ordre :

1. **Lire le payload de la tâche** (lecture seule) pour connaître l'issue visée et l'intention :

   ```sql
   select id, role, kind, status, issue_ids, payload, created_at
     from maximus_agents.tasks
    where id = 'ca1cc7be-2e80-43dd-afc6-42f01e069951';
   ```

2. **Décider si le travail est encore nécessaire.** Si l'issue correspondante est déjà traitée
   ou obsolète, la clôture documentée est la bonne réponse — pas une requalification.
3. **Si et seulement si** le travail est nécessaire : identifier **un** fichier exact à modifier,
   puis écrire `execution_mode='scoped_code_correction'` avec exactement cette issue et ce
   fichier. C'est la seule forme que `claim_scoped_corrective_task` sait réclamer.
4. **Ne jamais** convertir une QA financière en correction de code (§10.4, verrouillé par test).

**Handoff** : l'étape 1 est une lecture que Cursor ne peut pas faire (aucun jeton) ; les
étapes 2 à 4 appartiennent à la session interactive. Critère de succès : la tâche sort de
`EXECUTE_MISSING_SCOPE` **avec** une justification métier écrite, ou est clôturée avec motif.
Rollback : aucune écriture n'ayant eu lieu avant l'étape 3, il n'y a rien à défaire.

### 11.7 Ce que ce lot a réellement exécuté, et ce qui reste bloqué

| Élément | Statut |
|---|---|
| Défaut « commandes inexistantes dans le plan » | **EXÉCUTÉ** et **VÉRIFIÉ** (tests + CI) |
| CLI `prepareRestore.mjs` (étapes B, C, D) | **EXÉCUTÉ** et **VÉRIFIÉ** sur la fixture expurgée |
| Provenance du readback liée au projet lu | **EXÉCUTÉ** et **VÉRIFIÉ** (mutation détectée) |
| **Faux PASS sur production** (lot 14) | **EXÉCUTÉ** et **VÉRIFIÉ** — 6 mutations, toutes détectées |
| Autorisation de destination (`AUTHORIZED_RESTORE_PROJECT_REFS`) | **EXÉCUTÉ** et **VÉRIFIÉ** — liste vide, gate fermé |
| Requête de déploiement estampillée, digest liant la destination | **EXÉCUTÉ** et **VÉRIFIÉ** |
| Coût / conditions d'un projet jetable dédié (§11.5.2) | **ÉTABLI et CORRIGÉ** — 0 € (organisation Free séparée) ou 0,01344 $/h (Projet Pro), tarifs sourcés et datés ; aucune création effectuée |
| Autorisation nominative et bornée du propriétaire (§11.5.3) | **OUTILLÉ** et **VÉRIFIÉ** — 9 codes de refus, 11 mutations détectées ; la liste reste **vide** |
| Capture réelle des 6 fonctions `DEPLOYED` | **EXÉCUTÉ** le 27/11 avec un jeton lecture seule (§11.8) — défaut bloquant corrigé |
| Restauration exercée (étape D) | **BLOQUÉ** — aucun projet hors production autorisé (P3) : coût établi, **décision du propriétaire** requise |
| Attestation signée (étape E) | **BLOQUÉ** — clé publique non provisionnée (P4) |
| 7 `PENDING_DEPLOY` + patch `scpi-certified-promote` | **BLOQUÉ** — session interactive |
| Requalification ANALYST | **BLOQUÉ** — nécessité métier à établir (§11.6) |

`rollbackReady` reste **0/16** et `revocationAllowed = false` : inchangé, et correct.

### 11.8 Défaut bloquant du 27/11 : la capture était impossible sur TOUTE fonction réelle

La première exécution de l'étape A avec un jeton lecture seule a échoué immédiatement :

```
Capture impossible : CAPTURE_BODY_SLUG_MISMATCH
```

**Cause mesurée.** La partie `metadata` du corps multipart ne contient **ni `slug` ni
`version`**. Elle ne publie que :

```json
{ "deployment_id": "<projectRef>_<uuid>_<version>", "original_size": 13379793,
  "compressed_size": 2536776, "module_count": 3,
  "deno2_entrypoint_path": "source/scpi-evidence-certify/index.ts" }
```

`readbackFromProviderReads` et `captureProviderArtifact` exigeaient `bodyMeta.slug` et
`bodyMeta.version`. Ces deux gardes ne pouvaient **jamais** être satisfaites : l'étape A était
structurellement infaisable, quel que soit le jeton. Le défaut était masqué parce que la
fixture de test **inventait** ces deux champs dans la partie `metadata` — les tests étaient
verts sur une forme que le fournisseur ne produit pas.

**Correction (fail-closed, rien d'assoupli).** L'identité est lue là où elle est réellement
publiée, et trois liaisons fortes remplacent les deux champs inexistants :

| Liaison | Comparaison | Code de refus |
|---|---|---|
| Projet | `deployment_id` → `projectRef` vs projet demandé | `*_BODY_PROJECT_MISMATCH` |
| Version | `deployment_id` → version vs `metadata.version` | `*_BODY_VERSION_MISMATCH` |
| Entrypoint | chemin **relativisé au bundle** des deux lectures | `*_BODY_ENTRYPOINT_MISMATCH` |
| Intégrité | `module_count` vs nombre de fichiers reçus | `CAPTURE_BODY_MODULE_COUNT_MISMATCH` |

L'entrypoint est comparé après normalisation (`file:///tmp/user_fn_…/source/…` et
`source/…` désignent le même fichier) : comparer les chaînes brutes aurait fait échouer toute
capture réelle sur un simple préfixe. `identityFromBodyMetadata` et `entrypointRelativePath`
sont des fonctions pures, donc testables ; une partie `metadata` sans identité lisible est
refusée (`*_BODY_IDENTITY_UNREADABLE`) au lieu d'être devinée.

`prepareFromCaptured` avait le même défaut de forme : il reconditionnait à partir de
`parsed.metadata` (sans `slug`, `version`, `entrypoint_path`), ce qui rendait l'étape B
`BLOCKED` en `REPACK_WITHOUT_SLUG` puis `REPACK_WITHOUT_ENTRYPOINT_PATH`. L'identité du
registre vient désormais du readback **reconstruit depuis les octets scellés** — donc toujours
contrôlée contre l'artefact — et `deno2_entrypoint_path` sert de repli pour l'entrypoint.

**Preuves d'exécution réelle (27/11, projet `ygvsddcpohsnaowofuwc`, lecture seule).**

| Fonction | Version | `verify_jwt` | Sceau (octets + SHA-256) |
|---|---|---|---|
| `scpi-news-watch` | 18 | false | vérifié |
| `scpi-evidence-certify` | 9 | false | vérifié |
| `scpi-bulletin-watch` | 108 | false | vérifié |
| `scpi-source-link-inspect` | 12 | false | vérifié |
| `scpi-annual-safe-extract` | 12 | false | vérifié |
| `scpi-annual-report-backfill` | 11 | false | vérifié |

Les six sources déployées sont **identiques au dépôt, octet pour octet** (par exemple
`scpi-news-watch/index.ts` = `e2420cbca852…`), et la dépendance `matcher.mjs` de
`scpi-evidence-certify` reproduit exactement l'empreinte épinglée du §2.7 (13355 octets,
`88c46bc3…`). L'évidence est conservée **hors dépôt** en mode `0700` ; le dépôt public ne
reçoit que des empreintes.

**Ce que cela ne prouve pas.** Une capture n'est pas une restauration : `rollbackReady`
reste **0/16**, `exercisedProof` reste **false**, l'ancre §11.3 E reste `null`, et l'étape D
reste bloquée par P3 (aucun projet hors production autorisé).

