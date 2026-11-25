# Production bundle evidence — rollback exact

Ce dossier contient **une évidence JSON par fonction** du périmètre de migration des clés
(`scripts/security/edgeFunctionDeploymentManifest.mjs`), et rien d'autre.

## Pourquoi

Le rollback « `git checkout <ancien commit>` » est insuffisant : il ignore les dérives
constatées en production (`matcher.mjs` de `scpi-evidence-certify`,
`sourceProvenance.mjs` de `scpi-bulletin-watch`). Un rollback n'est donc déclaré `ready`
que si l'on dispose des empreintes du **bundle réellement déployé**.

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
  "bundleSha256": "<empreinte agrégée fournie par la plateforme, si disponible>"
}
```

Règles :

- **Aucune valeur de clé, aucun jeton, aucun JWT** ne doit figurer dans ces fichiers. Un test
  (`edgeFunctionDeploymentManifest.test.mjs`) échoue si un motif assimilable à une clé y
  apparaît.
- La `version` et le `verifyJwt` doivent correspondre à ce que le registre constate en
  production, sinon l'évidence est rejetée (`PROD_BUNDLE_EVIDENCE_INCONSISTENT`).
- Toute dépendance de prod sans empreinte laisse `rollback.ready = false` avec
  `PROD_DEPENDENCY_FINGERPRINT_MISSING`. C'est volontaire : un rollback incomplet ne doit
  pas être déclaré prêt.

## Qui produit ces fichiers

La lecture du bundle déployé passe par le connecteur Supabase (`get_edge_function`), qui
est la source de vérité de production. Les empreintes sont calculées sur le contenu
retourné, hors dépôt, puis consignées ici.

## Contrôle

```bash
node --test scripts/security/edgeFunctionDeploymentManifest.test.mjs
node scripts/security/edgeFunctionDeploymentManifest.mjs --check
```
