# Production bundle evidence — rollback exact, restaurable et vérifié

Ce dossier contient **une évidence JSON par fonction** du périmètre de migration des clés
(`scripts/security/edgeFunctionDeploymentManifest.mjs`), et rien d'autre.

## Pourquoi

Le rollback « `git checkout <ancien commit>` » est insuffisant : il ignore les dérives
constatées en production (`matcher.mjs` de `scpi-evidence-certify`,
`sourceProvenance.mjs` de `scpi-bulletin-watch`).

Une empreinte est une **identité**, jamais une **sauvegarde**. Constater le SHA-256 d'un
bundle déployé ne permet pas de le restaurer : le contenu n'est pas conservé, et une
restauration n'a jamais été exercée.

Trois corrections ont été apportées après contrôle indépendant :

1. **Une déclaration cohérente n'est pas une vérification.** Avec le schéma v1, des SHA-256
   inventés rendaient `rollback.ready = true`. Le schéma v2 exige une **attestation de
   vérification indépendante** lue **hors du dépôt**, dont l'empreinte est recalculée et
   dont chaque affirmation est recoupée avec l'évidence.
2. **Restaurer le bundle déployé ne défait rien.** v1 comparait la restauration au bundle
   **déployé** ; pour une fonction déjà migrée, cela « restaurait » la sauvegarde
   post-migration. v2 exige un `rollbackTarget` **distinct** de `observed`, en
   `phase: PRE_MIGRATION`, avec une identité de bundle différente.
3. **L'opérateur ne peut pas être son propre vérificateur.** L'attestation doit déclarer
   `independentOfOperator: true` et une `verifierIdentity` distincte de `performedBy`.

Le contrôle du 25/11 (#issuecomment-7169681620) a ensuite établi que **le chemin hors dépôt
n'est pas une frontière de confiance** : un opérateur qui écrit l'évidence **et**
l'attestation peut inventer les deux identités et les deux empreintes, et `resolve` seul ne
détecte ni `..` masqué par un lien symbolique ni un dossier encore inexistant sous un ancêtre
lié au dépôt. Trois corrections supplémentaires (v3) :

4. **Une empreinte recalculée n'est pas une signature.** L'attestation porte une signature
   `ed25519` des affirmations, vérifiée contre une clé **publique épinglée dans
   `scripts/security/rollbackVerifierTrustAnchor.json`**. Aucune variable d'environnement ne
   peut redésigner cette ancre : `MAXIMUS_ROLLBACK_EVIDENCE_ROOT` déplace les *documents*,
   jamais la *racine de confiance*. Sans clé provisionnée → `ANCHOR_KEY_NOT_PROVISIONED`.
5. **La frontière du dépôt est résolue réellement.** Chaque chemin d'attestation passe par
   `realpath` : `EVIDENCE_ROOT_INSIDE_REPO`, `ATTESTATION_DIR_INSIDE_REPO`,
   `ATTESTATION_INSIDE_REPO`.
6. **Readiness pré-déploiement ≠ validation post-déploiement.** Le champ `stage` déclare ce
   que l'évidence prétend prouver. Pour une fonction **pas encore migrée**, `observed` peut
   être égal à `rollbackTarget` (le rollback revient à l'état courant) ; pour une fonction
   **déjà migrée**, la cible doit être distincte (`ROLLBACK_TARGET_EQUALS_OBSERVED_BUNDLE`).
   `validateManifest` refuse un `stage` incohérent avec l'état réel
   (`EVIDENCE_STAGE_MISMATCH`, `PRE_DEPLOY_READY_ON_DEPLOYED_FUNCTION`).
3. **L'opérateur ne peut pas être son propre vérificateur.** L'attestation doit déclarer
   `independentOfOperator: true` et une `verifierIdentity` distincte de `performedBy`.

## Format

Un fichier `scripts/security/prod-bundles/<nom-de-fonction>.json` :

```jsonc
{
  "schemaVersion": "security-prod-evidence-v3",
  "stage": "POST_DEPLOY",              // PRE_DEPLOY (pas encore migrée) | POST_DEPLOY (migrée)
  "function": "scpi-evidence-certify",

  // 1. IDENTITÉ constatée en production (ce qui tourne maintenant)…
  "observed": {
    "version": 9,
    "verifyJwt": false,
    "entrypointSha256": "<sha256 hex du index.ts déployé>",
    "dependencies": [
      { "path": "scpi-evidence-certify/matcher.mjs", "sha256": "<…>", "bytes": 13355 },
      { "path": "_shared/serviceKey.ts", "sha256": "<…>", "bytes": 1481 }
    ],
    "bundleSha256": "<empreinte agrégée du bundle déployé>",

    // …et la LECTURE FOURNISSEUR qui l'atteste, datée, dans le bon projet.
    // DEUX lectures distinctes : métadonnées et contenu. L'endpoint de métadonnées ne rend
    // aucun octet — c'est le défaut relevé le 26/11 (#459).
    "readback": {
      "source": "supabase-management-api:GET /v1/projects/{ref}/functions/{slug}",
      "bundleSource": "supabase-management-api:GET /v1/projects/{ref}/functions/{slug}/body",
      "fetchedAt": "2026-11-25T00:30:00Z",
      "projectRef": "ygvsddcpohsnaowofuwc",
      "slug": "scpi-evidence-certify",
      "status": "ACTIVE",                    // non ACTIVE = pas un déploiement vivant
      "version": 9,
      "verifyJwt": false,
      // Chemin brut du fournisseur (URI temporaire de déploiement), conservé pour la trace…
      "providerEntrypointPath": "file:///tmp/user_fn_…/source/index.ts",
      // …et chemin canonique du registre : les deux ne se confondent jamais.
      "entrypointPath": "scpi-evidence-certify/index.ts",
      "entrypointSha256": "<= observed.entrypointSha256>",
      "dependencies": [ { "path": "_shared/serviceKey.ts", "sha256": "<…>", "bytes": 0 } ],
      "bundleSha256": "<= observed.bundleSha256>  (RECALCULABLE depuis le contenu déclaré)",
      // Empreinte de STOCKAGE du fournisseur : distincte de la canonique ci-dessus.
      "providerEzbrSha256": "<ezbr_sha256 renvoyé par le fournisseur>",
      "configSha256": "<empreinte de CONFIGURATION : projet, slug, version, verify_jwt, entrypointPath>"
    }
  },

  // 2. CIBLE DE ROLLBACK : le bundle d'AVANT migration, distinct du bundle déployé.
  "rollbackTarget": {
    "phase": "PRE_MIGRATION",          // seul valeur acceptée
    "version": 8,
    "verifyJwt": false,
    "entrypointSha256": "<sha256 hex de l'entrypoint pré-migration>",
    "dependencies": [ { "path": "…", "sha256": "<…>", "bytes": 0 } ],
    "bundleSha256": "<empreinte du bundle pré-migration — ≠ observed.bundleSha256>"
  },

  // 3. GARDE : l'artefact restaurable existe, hors dépôt, et il est LIÉ à la cible.
  "custody": {
    "artifactRef": "<pointeur hors dépôt, ex. coffre/artefact CI>",
    "artifactSha256": "<sha256 hex de l'artefact conservé>",
    "owner": "<responsable de la garde>",
    "holdsRestorableArtifact": true,
    "bindsToBundleSha256": "<doit égaler rollbackTarget.bundleSha256>",
    "bindsToFunction": "<doit égaler function>",
    "bindsToVersion": "<doit égaler rollbackTarget.version>"
  },

  // 4. RESTAURATION EXERCÉE hors production, avec journal identifiable.
  "restoreDrill": {
    "performedAt": "2026-11-25T00:00:00Z",
    "performedBy": "<opérateur ou job>",
    "destination": "staging-non-prod",   // staging-non-prod | local-replay | disposable-project
    "result": "PASS",                    // PASS | FAIL
    "journalRef": "<pointeur du journal de restauration, HORS dépôt>",
    "journalSha256": "<sha256 hex du journal>",
    "restoredEntrypointSha256": "<doit égaler rollbackTarget.entrypointSha256>",
    "restoredBundleSha256": "<doit égaler rollbackTarget.bundleSha256>"
  },

  // 5. VÉRIFICATION INDÉPENDANTE (attestation lue hors dépôt, jamais commitée ici).
  "attestation": {
    "schemaVersion": "rollback-attestation-v2",
    "verifier": "<contrôle indépendant>",
    "verifierIdentity": "<identité ≠ restoreDrill.performedBy, ET présente dans l'ancre>",
    "attestationSha256": "<sha256 canonique des affirmations>",
    "signature": {
      "keyId": "<keyId publié dans rollbackVerifierTrustAnchor.json>",
      "algorithm": "ed25519",
      "value": "<signature base64 des affirmations canoniques>"
    }
  }
}
```

## Ancre de confiance : `scripts/security/rollbackVerifierTrustAnchor.json`

C'est le **seul** endroit qui autorise une identité de vérification. Le fichier ne contient
que des clés **publiques** — jamais une clé privée — et se modifie par PR relue.

- Identité absente de l'ancre → `ATTESTATION_VERIFIER_NOT_TRUSTED`.
- `keyId` non publié ou différent → `ANCHOR_KEY_NOT_PROVISIONED` / `ATTESTATION_KEY_NOT_ANCHORED`.
- `keyId` révoqué → `ATTESTATION_KEY_REVOKED`.
- Signature invalide → `ATTESTATION_SIGNATURE_INVALID` ; absente → `ATTESTATION_UNSIGNED`.

**État actuel : aucune clé publique n'est provisionnée** (`keyId` et `publicKeyPem` à `null`).
Le gate est donc fermé mécaniquement : c'est le résultat correct tant que le contrôle
indépendant n'a pas publié sa clé publique.

## Attestation : où elle vit, et pourquoi pas ici

L'attestation n'est pas lue dans ce dossier. Elle est cherchée sous la racine désignée par
`MAXIMUS_ROLLBACK_EVIDENCE_ROOT`, dans `<racine>/attestations/<fonction>.json`.

- Racine absente → `EVIDENCE_ROOT_UNSET`.
- Racine située **dans le dépôt** → `EVIDENCE_ROOT_INSIDE_REPO` : un fichier versionné dans
  la même PR que l'évidence qu'il valide ne prouve aucune indépendance.
- Fichier absent → `ATTESTATION_MISSING`.

Contenu attendu de l'attestation (toutes les affirmations sont recoupées avec l'évidence) :

```jsonc
{
  "schemaVersion": "rollback-attestation-v3",
  "function": "…",
  "stage": "…",                       // = evidence.stage
  "observedBundleSha256": "…",        // = observed.bundleSha256
  "rollbackTargetBundleSha256": "…",  // = rollbackTarget.bundleSha256
  "custodyArtifactSha256": "…",       // = custody.artifactSha256
  "custodyArtifactRef": "…",          // = custody.artifactRef
  "restoreJournalSha256": "…",        // = restoreDrill.journalSha256
  "restoredBundleSha256": "…",        // = restoreDrill.restoredBundleSha256
  "restoreDestination": "…",          // = restoreDrill.destination
  "restoreResult": "PASS",            // = restoreDrill.result
  // Identité COMPLÈTE : un SHA de code ne prouve pas la configuration.
  "projectRef": "ygvsddcpohsnaowofuwc", // = observed.readback.projectRef
  "observedVersion": 9,               // = observed.version
  "observedVerifyJwt": false,         // = observed.verifyJwt
  "observedConfigSha256": "…",        // = observed.readback.configSha256
  "readbackSource": "…",              // = observed.readback.source
  "readbackFetchedAt": "…",           // = observed.readback.fetchedAt
  "verifier": "…",                    // = attestation.verifier
  "verifierIdentity": "…",            // ≠ restoreDrill.performedBy, ET dans l'ancre
  "operator": "…",                    // = restoreDrill.performedBy
  "independentOfOperator": true,      // obligatoire
  "verifiedAt": "2026-11-25T01:00:00Z",
  "attestationSha256": "<sha256 canonique des clés ci-dessus sauf attestationSha256>",
  "signature": {                      // vérifiée contre la clé publique épinglée
    "keyId": "…",
    "algorithm": "ed25519",
    "value": "<signature base64 de la même empreinte canonique>"
  }
}
```

Le message signé est exactement l'empreinte canonique `attestationSha256` : signer et
vérifier portent donc sur le même octet. **La signature couvre le projet cible, la version,
`verify_jwt` et l'empreinte de configuration**, pas seulement le SHA du code : le contrôle
du 25/11 a établi qu'« une égalité de SHA de code seule ne prouve pas l'égalité de
configuration ».

## Readback fournisseur : la seule pièce qui dise ce que la prod contient

`observed` ne doit **jamais** être recopié du registre du dépôt : ce serait comparer une
croyance à elle-même. Le bloc `observed.readback` est produit par une **lecture réelle** :

```bash
# Lecture seule, aucune écriture, aucun secret sur la ligne de commande.
SUPABASE_ACCESS_TOKEN=… node scripts/security/collectReadback.mjs \
  --function scpi-evidence-certify
# Aligne `observed` sur la lecture, sans toucher au reste de l'évidence :
SUPABASE_ACCESS_TOKEN=… node scripts/security/collectReadback.mjs \
  --function scpi-evidence-certify --merge scripts/security/prod-bundles/scpi-evidence-certify.json
node scripts/security/collectReadback.mjs --list   # périmètre, sans appel réseau
```

Le jeton n'est lu que dans `SUPABASE_ACCESS_TOKEN`, jamais en argument (il apparaîtrait
dans `ps` et l'historique). Le script n'écrit aucun fichier par défaut et n'invente aucune
valeur : sans jeton ou sans réponse exploitable, il échoue en nommant le motif.

Codes bloquants du readback :

| Code | Signification |
|------|---------------|
| `MISSING_observed_readback` | `observed` n'est attesté par aucune lecture |
| `READBACK_WRONG_PROJECT` | la lecture porte sur un autre projet que `ygvsddcpohsnaowofuwc` |
| `READBACK_OTHER_FUNCTION` | la lecture décrit une autre fonction |
| `READBACK_SOURCE_NOT_PROVIDER` | la source n'est pas une lecture fournisseur |
| `READBACK_DISAGREES_WITH_OBSERVED_*` | `observed` contredit la lecture |
| `READBACK_DISAGREES_WITH_REGISTRY` | la lecture contredit l'état constaté au registre |
| `READBACK_CONFIG_SHA256_MISMATCH` | `configSha256` ne lie pas les champs déclarés |
| `READBACK_STALE_OR_AFTER_VERIFICATION` | lecture périmée (> 24 h) ou postérieure à `verifiedAt` |
| `READBACK_BUNDLE_SOURCE_NOT_PROVIDER` | la provenance des **octets** n'est pas une lecture fournisseur |
| `READBACK_STATUS_NOT_ACTIVE` | la fonction n'est pas `ACTIVE` : ce n'est pas un déploiement vivant |
| `READBACK_ENTRYPOINT_PATH_NOT_REGISTRY_SHAPE` | le chemin canonique n'est pas `<slug>/index.ts` |
| `READBACK_BUNDLE_SHA256_MISMATCH` | l'empreinte de bundle ne se recalcule pas depuis le contenu déclaré |
| `BAD_readback_providerEzbrSha256` | empreinte de stockage fournisseur absente ou malformée |

La **fraîcheur** est mesurée contre l'`attestation.verifiedAt` signé, jamais contre
l'horloge du CI : une évidence commitée reste ainsi reproductible, et `--check` signale un
vrai défaut au lieu de vieillir.

## Règles (toutes bloquantes)

- **Aucune valeur de clé, aucun jeton, aucun JWT**, et **aucun contenu de source** ne doit
  figurer dans ces fichiers. Un test (`edgeFunctionDeploymentManifest.test.mjs`) échoue si
  un motif assimilable à une clé y apparaît. Le dépôt est **public** : un bundle brut ne
  doit jamais y être publié, seulement des empreintes et des pointeurs.
- **Des empreintes seules ne suffisent jamais.** Sans bloc `custody`, le rollback échoue en
  `MISSING_custody` ; avec `holdsRestorableArtifact: false`, en `CUSTODY_NOT_RESTORABLE`.
- **`observed` doit venir d'un readback fournisseur.** Sans bloc `readback`, l'évidence
  échoue en `MISSING_observed_readback` ; une lecture d'un autre projet échoue en
  `READBACK_WRONG_PROJECT`. Comparer `observed` au registre statique du dépôt ne prouve
  rien : c'est une croyance confrontée à elle-même.
- **La cible restaurée doit être le bundle d'avant migration — sauf préparation.**
  Pour une fonction **déjà migrée** (`stage: POST_DEPLOY`), `observed.bundleSha256` égal à
  `rollbackTarget.bundleSha256` est refusé (`ROLLBACK_TARGET_EQUALS_OBSERVED_BUNDLE`) ; une
  `phase` autre que `PRE_MIGRATION` aussi (`ROLLBACK_TARGET_NOT_PRE_MIGRATION`). Pour une
  fonction **pas encore migrée** (`stage: PRE_DEPLOY`), l'égalité est au contraire exigée —
  le rollback doit ramener à l'état courant — et une cible différente est refusée
  (`ROLLBACK_TARGET_DIFFERS_BEFORE_DEPLOY`). Un `stage` qui contredit l'état réel de la
  fonction bloque en `EVIDENCE_STAGE_MISMATCH`.
- **La garde doit être liée.** Un `bindsToFunction` / `bindsToVersion` /
  `bindsToBundleSha256` divergent produit `CUSTODY_BINDS_OTHER_FUNCTION` /
  `CUSTODY_BINDS_OTHER_VERSION` / `CUSTODY_BINDS_OTHER_BUNDLE`.
- **Une restauration doit être exercée, hors production, et journalisée.** `production` est
  refusé (`RESTORE_DRILL_ON_PRODUCTION`) ; un `result` autre que `PASS` bloque
  (`RESTORE_DRILL_NOT_PASSED`) ; une empreinte restaurée différente de la cible est refusée
  (`RESTORE_DRILL_ENTRYPOINT_MISMATCH`, `RESTORE_DRILL_BUNDLE_MISMATCH`) ; un journal dans
  le dépôt est refusé (`RESTORE_JOURNAL_INSIDE_REPO`).
- **Sans vérification indépendante et signée, rien n'est prêt.** `ATTESTATION_MISSING`,
  `EVIDENCE_ROOT_UNSET`, `EVIDENCE_ROOT_INSIDE_REPO`, `ATTESTATION_DIR_INSIDE_REPO`,
  `ATTESTATION_INSIDE_REPO`, `ATTESTATION_NOT_INDEPENDENT`,
  `ATTESTATION_VERIFIER_IS_OPERATOR`, `ATTESTATION_VERIFIER_NOT_TRUSTED`,
  `ATTESTATION_UNSIGNED`, `ANCHOR_KEY_NOT_PROVISIONED`, `ATTESTATION_KEY_NOT_ANCHORED`,
  `ATTESTATION_KEY_REVOKED`, `ATTESTATION_SIGNATURE_INVALID`, `ATTESTATION_SHA256_MISMATCH`
  et `ATTESTATION_CLAIM_MISMATCH_*` bloquent tous le rollback.
- La `observed.version` et `observed.verifyJwt` doivent correspondre à ce que le registre
  constate en production, sinon l'évidence est rejetée.
- Toute dépendance de prod sans empreinte laisse `rollback.ready = false` avec
  `PROD_DEPENDENCY_FINGERPRINT_MISSING`.

## Qui produit ces fichiers

La lecture du bundle déployé passe par le connecteur Supabase (`get_edge_function`), qui
est la source de vérité de production. Les empreintes sont calculées sur le contenu
retourné, hors dépôt. L'artefact restaurable est déposé dans le coffre d'artefacts
(`custody.artifactRef`) ; ce dossier ne contient que l'évidence. L'attestation est produite
par le contrôle indépendant, sous `MAXIMUS_ROLLBACK_EVIDENCE_ROOT`, jamais ici.

## Contrôle

```bash
node --test scripts/security/edgeFunctionDeploymentManifest.test.mjs
node scripts/security/edgeFunctionDeploymentManifest.mjs --check
```

L'état attendu aujourd'hui est `rollbackReady = 0/16` : aucune garde, aucune restauration et
aucune attestation n'ont encore été produites hors dépôt. C'est le résultat correct, pas un
défaut d'outillage.

---

## Correction du lot 9 : « le registre n'est pas la production »

Le contrôle indépendant du 25/11 (#issuecomment-7172607601) a validé le principe du lot 9
mais relevé un défaut de fond, et demandé d'arrêter les itérations de schéma sans preuve
opérationnelle :

> « Le gate commonProof compare notamment version et verifyJwt au registre statique : avant
> intervention, recouper également l'identité complète du bundle et la configuration avec le
> readback fournisseur frais ; la signature doit couvrir ou lier ces éléments et le projet
> cible. Une égalité de SHA de code seule ne prouve pas l'égalité de configuration. »

Trois corrections (schéma v3) :

7. **Le readback fournisseur remplace la comparaison au registre.** `observed.readback`
   porte `projectRef`, `slug`, `version`, `verifyJwt`, les empreintes de code **et**
   `configSha256`. Une évidence sans lecture fournisseur reste fermée
   (`MISSING_observed_readback`), et une lecture d'un autre projet est refusée
   (`READBACK_WRONG_PROJECT`).
8. **La configuration est liée séparément du code.** `configSha256` couvre projet, slug,
   version, `verify_jwt` et chemin d'entrypoint : deux bundles au code identique mais à la
   configuration différente produisent des empreintes différentes. Une empreinte recalculée
   qui ne correspond pas aux champs déclarés échoue en `READBACK_CONFIG_SHA256_MISMATCH`.
9. **La signature couvre l'identité complète.** `rollback-attestation-v3` exige
   `projectRef`, `observedVersion`, `observedVerifyJwt`, `observedConfigSha256`,
   `readbackSource` et `readbackFetchedAt`. Une attestation signée qui n'affirme pas le
   projet échoue en `MISSING_attestation_claim_projectRef` ; une attestation qui affirme un
   autre projet échoue en `ATTESTATION_CLAIM_MISMATCH_projectRef`.

**Collecte réelle, pas de valeur inventée.** `scripts/security/collectReadback.mjs` lit la
fonction déployée (API de management, lecture seule) et produit le bloc `readback`. Il ne
déploie rien, n'écrit rien par défaut et échoue explicitement plutôt que de renseigner un
champ qu'il n'a pas lu.

**Aucune clé n'est provisionnée** : `rollbackVerifierTrustAnchor.json` porte toujours
`keyId: null` / `publicKeyPem: null`. Le gate reste donc fermé mécaniquement, et le
provisionnement de l'ancre est un acte du contrôle indépendant, sur une référence protégée.

---

## Correction du lot 11 : « le collecteur ne collectait pas ce qu'il annonçait »

Contrôle indépendant du 26/11 (#459) sur `collectReadback.mjs` au SHA `b9b2d983` :

> « Le collecteur attend `payload.files` dans la réponse JSON de GET `/functions/{slug}` ;
> la disponibilité de ces octets via cet endpoint précis n'est pas démontrée. […] Le
> collecteur accepte en outre un fallback sur n'importe quel `index.ts` et hache les
> dépendances sans contenu comme chaîne vide. Ces deux comportements ne sont pas compatibles
> avec une preuve exhaustive fail-closed. Exiger le contenu réel de chaque fichier, une
> correspondance unique de l'entrypoint et du slug demandé, et une normalisation explicite
> des chemins fournisseur vers le registre ; tester sur une réponse réelle expurgée, sans
> publier les sources privées. »

Le constat est exact et vérifié contre la documentation du fournisseur :

| Endpoint | Ce qu'il rend réellement |
|---|---|
| `GET /v1/projects/{ref}/functions/{slug}` | **métadonnées seulement** : `id`, `slug`, `status`, `version`, `verify_jwt`, `entrypoint_path`, `ezbr_sha256`… — **aucun** `files`, **aucun** octet |
| `GET /v1/projects/{ref}/functions/{slug}/body` | `multipart/form-data` : une partie JSON de métadonnées + **une partie par fichier** |

### Les quatre défauts corrigés

1. **Une seule lecture pour deux objets distincts.** Le collecteur lisait les métadonnées et
   prétendait en tirer le contenu. Il fait désormais **deux** lectures et **lie les deux à la
   même version** : un corps rendu pour la v11 ne peut pas attester la v12
   (`READBACK_BODY_VERSION_MISMATCH`), ni une autre fonction (`READBACK_BODY_SLUG_MISMATCH`).
2. **Entrypoint deviné.** Le repli « n'importe quel `index.ts` » est supprimé. La
   correspondance avec `entrypoint_path` doit être **unique** (`READBACK_ENTRYPOINT_NOT_IN_BODY`,
   `READBACK_ENTRYPOINT_AMBIGUOUS`), et le slug demandé est vérifié (`READBACK_OTHER_FUNCTION`).
3. **Contenu vide haché comme du vide.** Hacher `''` produisait une empreinte plausible pour
   un fichier absent. Tout fichier doit porter un contenu réel, en octets UTF-8 exacts ;
   un fichier vide est refusé (`READBACK_FILE_WITHOUT_CONTENT`, `READBACK_ENTRYPOINT_CONTENT_EMPTY`).
4. **Chemins fournisseur non normalisés.** Les URI temporaires de déploiement
   (`file:///tmp/user_fn_…/source/index.ts`) ne contiennent pas le slug : les comparer au
   registre donnait des identités incomparables. `normalizeBundlePaths` applique une règle
   **explicite et unique** — racine = répertoire de l'`entrypoint_path`, entrypoint →
   `<slug>/index.ts`, dépendance locale → `<slug>/<rel>`, dépendance partagée →
   `_shared/<rel>` — et **refuse** (`PROVIDER_PATH_NOT_NORMALIZABLE`) tout chemin qu'elle ne
   sait pas placer plutôt que de le deviner.

### Ce que le readback ne publie jamais

Aucun contenu de source : le dépôt est **public**. Le readback ne porte que des **empreintes**
et des **tailles**. Deux empreintes restent distinctes et ne se confondent pas :

- `providerEzbrSha256` — l'empreinte de **stockage** du fournisseur (`ezbr_sha256`) ;
- `bundleSha256` — l'empreinte **canonique** du manifeste, **recalculée** depuis l'entrypoint
  et les dépendances déclarés. `validateReadback` la recalcule et refuse un écart
  (`READBACK_BUNDLE_SHA256_MISMATCH`) : une empreinte recopiée n'est qu'une affirmation.

### Éprouvé sur une réponse au format réel, expurgée

`scripts/security/fixtures/providerFunctionBody.mjs` reproduit la **forme exacte** des deux
réponses (métadonnées JSON, corps multipart avec URI temporaires) pour la fonction
`scpi-certified-promote` v12. Les contenus de fichiers y sont des **marqueurs inertes**, pas
du code de production : seule la structure est réelle. Les tests vérifient la mécanique,
jamais des valeurs de production.

Les quatre défauts sont couverts par des tests qui **échouent** quand la garde correspondante
est retirée (mutation vérifiée) : lecture de contenu non effectuée, entrypoint non unique,
contenu vide accepté, chemins non normalisés.
