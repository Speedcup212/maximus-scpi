# Production bundle evidence — rollback exact et restaurable

Ce dossier contient **une évidence JSON par fonction** du périmètre de migration des clés
(`scripts/security/edgeFunctionDeploymentManifest.mjs`), et rien d'autre.

## Pourquoi

Le rollback « `git checkout <ancien commit>` » est insuffisant : il ignore les dérives
constatées en production (`matcher.mjs` de `scpi-evidence-certify`,
`sourceProvenance.mjs` de `scpi-bulletin-watch`).

Une empreinte est une **identité**, jamais une **sauvegarde**. Constater le SHA-256 d'un
bundle déployé ne permet pas de le restaurer : le contenu n'est pas conservé, et une
restauration n'a jamais été exercée. Un rollback n'est donc déclaré `ready` que si
l'évidence réunit trois preuves distinctes :

1. **Identité** — empreintes du bundle réellement déployé.
2. **Garde** (`custody`) — un artefact restaurable réellement conservé, hors dépôt.
3. **Restauration testée** (`restoreDrill`) — une restauration effectuée **hors
   production**, qui a reproduit l'entrypoint *et* le bundle d'origine.

## Format

Un fichier `scripts/security/prod-bundles/<nom-de-fonction>.json` :

```jsonc
{
  "function": "scpi-evidence-certify",
  "version": 9,
  "verifyJwt": false,
  "entrypointSha256": "<sha256 hex du index.ts déployé>",
  "dependencies": [
    { "path": "scpi-evidence-certify/matcher.mjs", "sha256": "<…>", "bytes": 13355 },
    { "path": "_shared/serviceKey.ts", "sha256": "<…>", "bytes": 1481 }
  ],
  "bundleSha256": "<empreinte agrégée fournie par la plateforme>",

  // Garde : où vit l'artefact restaurable, et son empreinte. Pas de contenu ici.
  "custody": {
    "artifactRef": "<pointeur hors dépôt, ex. coffre/artefact CI>",
    "artifactSha256": "<sha256 hex de l'artefact conservé>",
    "owner": "<responsable de la garde>",
    "holdsRestorableArtifact": true
  },

  // Restauration exercée hors production, reproduisant identité et bundle.
  "restoreDrill": {
    "performedAt": "2026-11-25T00:00:00Z",
    "performedBy": "<opérateur ou job>",
    "destination": "staging-non-prod",   // staging-non-prod | local-replay | disposable-project
    "result": "PASS",                    // PASS | FAIL
    "restoredEntrypointSha256": "<doit égaler entrypointSha256>",
    "restoredBundleSha256": "<doit égaler bundleSha256>"
  }
}
```

## Règles (toutes bloquantes)

- **Aucune valeur de clé, aucun jeton, aucun JWT**, et **aucun contenu de source** ne doit
  figurer dans ces fichiers. Un test (`edgeFunctionDeploymentManifest.test.mjs`) échoue si
  un motif assimilable à une clé y apparaît. Le dépôt est **public** : un bundle brut ne
  doit jamais y être publié, seulement des empreintes et des pointeurs.
- **Des empreintes seules ne suffisent jamais.** Sans bloc `custody`, le rollback échoue en
  `MISSING_custody` ; avec `holdsRestorableArtifact: false`, en `CUSTODY_NOT_RESTORABLE`.
- **Une restauration doit être exercée, hors production.** `destination: "production"` est
  refusé (`RESTORE_DRILL_ON_PRODUCTION`) ; un `result` autre que `PASS` laisse le rollback
  bloqué (`RESTORE_DRILL_NOT_PASSED`) ; une empreinte restaurée différente de l'empreinte
  constatée est refusée (`RESTORE_DRILL_ENTRYPOINT_MISMATCH`, `RESTORE_DRILL_BUNDLE_MISMATCH`).
- La `version` et le `verifyJwt` doivent correspondre à ce que le registre constate en
  production, sinon l'évidence est rejetée (`PROD_BUNDLE_EVIDENCE_INCONSISTENT`).
- Toute dépendance de prod sans empreinte laisse `rollback.ready = false` avec
  `PROD_DEPENDENCY_FINGERPRINT_MISSING`.

## Qui produit ces fichiers

La lecture du bundle déployé passe par le connecteur Supabase (`get_edge_function`), qui
est la source de vérité de production. Les empreintes sont calculées sur le contenu
retourné, hors dépôt. L'artefact restaurable est déposé dans le coffre d'artefacts
(`custody.artifactRef`) ; ce dossier ne contient que l'évidence.

## Contrôle

```bash
node --test scripts/security/edgeFunctionDeploymentManifest.test.mjs
node scripts/security/edgeFunctionDeploymentManifest.mjs --check
```
