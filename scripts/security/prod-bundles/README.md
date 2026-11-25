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
  "schemaVersion": "security-prod-evidence-v2",
  "stage": "POST_DEPLOY",              // PRE_DEPLOY (pas encore migrée) | POST_DEPLOY (migrée)
  "function": "scpi-evidence-certify",

  // 1. IDENTITÉ constatée en production (ce qui tourne maintenant).
  "observed": {
    "version": 9,
    "verifyJwt": false,
    "entrypointSha256": "<sha256 hex du index.ts déployé>",
    "dependencies": [
      { "path": "scpi-evidence-certify/matcher.mjs", "sha256": "<…>", "bytes": 13355 },
      { "path": "_shared/serviceKey.ts", "sha256": "<…>", "bytes": 1481 }
    ],
    "bundleSha256": "<empreinte agrégée du bundle déployé>"
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
  "schemaVersion": "rollback-attestation-v2",
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
vérifier portent donc sur le même octet.

## Règles (toutes bloquantes)

- **Aucune valeur de clé, aucun jeton, aucun JWT**, et **aucun contenu de source** ne doit
  figurer dans ces fichiers. Un test (`edgeFunctionDeploymentManifest.test.mjs`) échoue si
  un motif assimilable à une clé y apparaît. Le dépôt est **public** : un bundle brut ne
  doit jamais y être publié, seulement des empreintes et des pointeurs.
- **Des empreintes seules ne suffisent jamais.** Sans bloc `custody`, le rollback échoue en
  `MISSING_custody` ; avec `holdsRestorableArtifact: false`, en `CUSTODY_NOT_RESTORABLE`.
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
