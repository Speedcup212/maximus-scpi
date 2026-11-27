/**
 * Manifeste machine-vérifiable du lot de migration des clés Supabase.
 *
 * Objet : remplacer un « manifeste en prose » par une source de vérité contrôlable en CI,
 * afin de garantir trois propriétés exigées par le contrôle indépendant du ticket #459 :
 *
 *  1. Périmètre réconcilié — les 16 fonctions du lot initial sont classées exactement une
 *     fois (déployées / restantes / patch clé-seule / lot lead coordonné), et les fonctions
 *     hors périmètre (sources absentes du dépôt, non déployées, non modifiées) sont
 *     explicitement séparées au lieu d'être fondues dans le décompte.
 *  2. Rollback exact — un rollback n'est déclaré « prêt » que si les empreintes du bundle
 *     RÉELLEMENT déployé (version, verify_jwt, entrypoint, dépendances) ont été fournies par
 *     la source de vérité de production. Un `git checkout <ancien commit>` seul ne suffit
 *     pas : il ignore les dérives constatées en production.
 *  3. Preuve par fonction — chaque fonction porte son mécanisme d'authentification, ses
 *     tests positif/négatif attendus et le filtre de log qui prouve SA résolution de clé
 *     (des logs agrégés ne prouvent rien fonction par fonction).
 *
 * Le script ne déploie rien, ne lit aucun secret et n'écrit aucun fichier par défaut :
 * il calcule des empreintes sur les sources du dépôt et valide leur cohérence.
 *
 * Usages :
 *   node scripts/security/edgeFunctionDeploymentManifest.mjs --json
 *       Émet le manifeste complet (JSON) sur stdout.
 *   node scripts/security/edgeFunctionDeploymentManifest.mjs --check
 *       Recalcule les empreintes et échoue (exit 1) si le registre commité ne correspond
 *       plus aux sources du dépôt.
 */
import { createHash, verify as cryptoVerify, createPublicKey } from 'node:crypto';
import { readFileSync, existsSync, realpathSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, sep } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = resolve(HERE, '..', '..');
export const FUNCTIONS_DIR = join(REPO_ROOT, 'supabase', 'functions');
export const LEDGER_PATH = join(HERE, 'edgeFunctionDeploymentManifest.json');

export const MANIFEST_VERSION = 'security-edge-manifest-v4';
export const EVIDENCE_SCHEMA_VERSION = 'security-prod-evidence-v3';
export const ATTESTATION_SCHEMA_VERSION = 'rollback-attestation-v3';
export const TRUST_ANCHOR_SCHEMA_VERSION = 'rollback-verifier-anchor-v1';

/**
 * Projet Supabase de production. Une évidence qui décrit un autre projet ne prouve rien
 * sur celui qu'on migre : le readback porte donc son `projectRef`, comparé à cette valeur.
 */
export const PRODUCTION_PROJECT_REF = 'ygvsddcpohsnaowofuwc';

/**
 * Ancienneté maximale d'un readback fournisseur par rapport à l'instant où le contrôle
 * indépendant l'a vérifié.
 *
 * La fraîcheur est mesurée contre `attestation.verifiedAt`, **jamais contre l'horloge du
 * CI** : une évidence commitée doit rester reproductible, sinon `--check` deviendrait faux
 * avec le temps au lieu de signaler un vrai défaut.
 */
export const MAX_READBACK_AGE_MS = 24 * 60 * 60 * 1000;

/** Sources de readback admises : une lecture fournisseur, jamais une ressaisie manuelle. */
export const READBACK_SOURCES = Object.freeze([
  'supabase-management-api:GET /v1/projects/{ref}/functions/{slug}',
  'supabase-cli:functions download --project-ref {ref}',
]);

/**
 * Source du **contenu** du bundle, distincte de celle des métadonnées.
 *
 * Le contrôle du 26/11 (#459) a établi que `GET /functions/{slug}` ne rend **que des
 * métadonnées** : ni `files`, ni octets. Un readback qui ne nomme pas la lecture des octets
 * ne dit donc pas d'où vient le contenu qu'il prétend avoir identifié.
 */
export const READBACK_BUNDLE_SOURCES = Object.freeze([
  'supabase-management-api:GET /v1/projects/{ref}/functions/{slug}/body',
  'supabase-cli:functions download --project-ref {ref}',
]);

/** État fournisseur d'un déploiement vivant. */
export const READBACK_ACTIVE_STATUS = 'ACTIVE';

/**
 * Ancre de confiance des attestations — **chemin figé dans le dépôt**, jamais pris dans
 * l'environnement.
 *
 * Le contrôle du 25/11 a établi que le chemin hors dépôt n'est pas une frontière de
 * confiance : un opérateur qui écrit l'évidence et l'attestation peut inventer les deux
 * identités et les deux SHA. Seule une **signature vérifiée contre une clé publique épinglée
 * ici** distingue une attestation d'un document forgé. Le fichier ne contient que des clés
 * publiques ; la clé privée ne quitte jamais le poste du vérificateur.
 *
 * Aucune variable d'environnement ne peut redésigner cette ancre : `MAXIMUS_ROLLBACK_
 * EVIDENCE_ROOT` déplace les *documents*, pas la *racine de confiance*.
 */
export const TRUST_ANCHOR_PATH = join(HERE, 'rollbackVerifierTrustAnchor.json');

/**
 * Racine des attestations de vérification indépendante.
 *
 * Ces attestations ne peuvent pas vivre dans le dépôt : ce dépôt est **public** et,
 * surtout, un fichier versionné dans la même PR que l'évidence n'est pas une
 * vérification indépendante. La racine est donc fournie hors dépôt (session
 * interactive / contrôle indépendant) et le module refuse explicitement une racine
 * située dans `REPO_ROOT`.
 */
export const EVIDENCE_ROOT_ENV = 'MAXIMUS_ROLLBACK_EVIDENCE_ROOT';
export const INITIAL_PERIMETER_SIZE = 16;
export const PROD_EVIDENCE_DIR = join(HERE, 'prod-bundles');

/** États d'avancement d'une fonction du périmètre initial. */
export const DEPLOY_STATES = Object.freeze([
  'DEPLOYED',
  'PENDING_DEPLOY',
  'PENDING_KEY_ONLY_PATCH',
  'PENDING_COORDINATED_LOT',
]);

/** Raisons d'exclusion du périmètre initial (jamais du déploiement en général). */
export const EXCLUSION_REASONS = Object.freeze([
  'SOURCE_ABSENT_FROM_REPO',
  'NOT_DEPLOYED_NOT_CALLED',
  'UNCHANGED_BY_MIGRATION',
  'VERIFY_JWT_USER_SESSION',
]);

/**
 * Registre. Chaque entrée du périmètre porte son état, son `verify_jwt` constaté en
 * production, sa cible, son authentification interne et ses dépendances locales.
 */
const PERIMETER = [
  {
    name: 'calendly-webhook',
    deployState: 'PENDING_DEPLOY',
    prodVersion: null,
    prodVerifyJwt: false,
    targetVerifyJwt: false,
    auth: 'HMAC-SHA256 Calendly (calendly-webhook-signature)',
    sharedDeps: ['_shared/serviceKey.ts'],
    localDeps: [],
    positiveTest: 'HMAC valide -> 200',
    negativeTest: 'HMAC absent/invalide -> 401',
  },
  {
    name: 'send-simulation-email',
    deployState: 'PENDING_DEPLOY',
    prodVersion: null,
    prodVerifyJwt: false,
    targetVerifyJwt: false,
    auth: 'Contrôles serveur (request_id UUID, <15 min, <=3/24 h)',
    sharedDeps: ['_shared/serviceKey.ts'],
    localDeps: ['logic.ts'],
    positiveTest: 'request_id valide -> 200',
    negativeTest: 'request_id invalide/absent -> 400/429',
  },
  {
    name: 'scpi-release-certification-oidc',
    deployState: 'PENDING_DEPLOY',
    prodVersion: null,
    prodVerifyJwt: false,
    targetVerifyJwt: false,
    auth: 'GitHub OIDC (aud maximus-scpi-release-certification-*)',
    sharedDeps: ['_shared/serviceKey.ts'],
    localDeps: [],
    positiveTest: 'token OIDC valide -> 200',
    negativeTest: 'sans/pseudo token -> 401/403',
  },
  {
    name: 'scpi-corum-document-oidc',
    deployState: 'PENDING_DEPLOY',
    prodVersion: null,
    prodVerifyJwt: false,
    targetVerifyJwt: false,
    auth: 'GitHub OIDC (aud maximus-corum-documents-*)',
    sharedDeps: ['_shared/serviceKey.ts'],
    localDeps: [],
    positiveTest: 'token OIDC valide -> 200',
    negativeTest: 'sans/pseudo token -> 401/403',
  },
  {
    name: 'scpi-bulletin-replay-oidc',
    deployState: 'PENDING_DEPLOY',
    prodVersion: null,
    prodVerifyJwt: false,
    targetVerifyJwt: false,
    auth: 'GitHub OIDC (aud maximus-scpi-bulletin-replay-*)',
    sharedDeps: ['_shared/serviceKey.ts'],
    localDeps: [],
    positiveTest: 'token OIDC valide -> 200',
    negativeTest: 'sans/pseudo token -> 401/403',
  },
  {
    name: 'maximus-agent-audit-oidc',
    deployState: 'PENDING_DEPLOY',
    prodVersion: null,
    prodVerifyJwt: false,
    targetVerifyJwt: false,
    auth: 'GitHub OIDC (aud maximus-parallel-audit-*) + SUPABASE_DB_URL',
    sharedDeps: [],
    localDeps: [],
    inlineKeyResolution: true,
    positiveTest: 'token OIDC valide -> 200',
    negativeTest: 'sans/pseudo token -> 401/403',
  },
  {
    name: 'maximus-scpi-ocr-oidc',
    deployState: 'PENDING_DEPLOY',
    prodVersion: null,
    prodVerifyJwt: false,
    targetVerifyJwt: false,
    auth: 'GitHub OIDC (aud maximus-scpi-ocr-*) + SUPABASE_DB_URL',
    sharedDeps: [],
    localDeps: ['historicalIdentity.mjs'],
    inlineKeyResolution: true,
    positiveTest: 'token OIDC valide -> 200',
    negativeTest: 'sans/pseudo token -> 401/403',
  },
  {
    name: 'scpi-certified-promote',
    deployState: 'PENDING_KEY_ONLY_PATCH',
    prodVersion: 12,
    prodVerifyJwt: false,
    targetVerifyJwt: false,
    auth: 'x-cron-token (SHA-256 comparé à scpi_bulletin_runtime_config)',
    sharedDeps: ['_shared/serviceKey.ts'],
    localDeps: [],
    positiveTest: 'x-cron-token valide -> 200/204',
    negativeTest: 'x-cron-token absent -> 401',
    notes:
      'Patch clé-seule sur le bundle prod v12 : import readServiceKey + remplacement de la '
      + 'résolution. Le code du dépôt porte en plus une garde prix (drift métier) qui ne doit '
      + 'PAS être déployée pendant la migration.',
    deployGuard: 'NEVER_DEPLOY_REPO_ENTRYPOINT_VERBATIM',
    entrypointDrift:
      'Garde prix absente du bundle prod v12 : WITHDRAWAL_MISLABELLED_AS_SUBSCRIPTION, '
      + 'CAPITALISATION_PARTS_MISMATCH, MATERIAL_TOF_QA_REQUIRED, TOF_OUT_OF_RANGE, '
      + 'DEBT_OUT_OF_RANGE, FORBIDDEN_ASPIM_TOF.',
  },
  {
    name: 'scpi-news-watch',
    deployState: 'DEPLOYED',
    prodVersion: 18,
    prodVerifyJwt: false,
    targetVerifyJwt: false,
    auth: 'x-cron-token (SHA-256 comparé à scpi_bulletin_runtime_config)',
    sharedDeps: ['_shared/serviceKey.ts'],
    localDeps: [],
    positiveTest: 'x-cron-token du cron réel -> 200',
    negativeTest: 'x-cron-token absent -> 401',
    notes:
      'Test positif non validé : le 401 observé provenait d\'un test avec le secret Vault '
      + 'dormant, pas du jeton du cron. Preuve de résolution de clé non acquise.',
  },
  {
    name: 'scpi-evidence-certify',
    deployState: 'DEPLOYED',
    prodVersion: 9,
    prodVerifyJwt: false,
    targetVerifyJwt: false,
    auth: 'x-cron-token (SHA-256 comparé à scpi_bulletin_runtime_config)',
    sharedDeps: ['_shared/serviceKey.ts'],
    localDeps: ['matcher.mjs'],
    positiveTest: 'x-cron-token valide + UUID inexistant -> 200 processed=0',
    negativeTest: 'sans jeton -> 401',
    prodDependencyOverrides: {
      'matcher.mjs': {
        sha256: '88c46bc36396a1906db5b5a625f1e336d81036a22101990e527dcc7414623b8c',
        bytes: 13355,
        reason:
          'Bundle v9 conservé avec le matcher de production (drift de 29 caractères vs '
          + 'dépôt) pour ne pas modifier le métier pendant la migration des clés.',
      },
    },
  },
  {
    name: 'scpi-bulletin-watch',
    deployState: 'DEPLOYED',
    prodVersion: 108,
    prodVerifyJwt: false,
    targetVerifyJwt: false,
    auth: 'x-cron-token (SHA-256 comparé à scpi_bulletin_runtime_config)',
    sharedDeps: ['_shared/serviceKey.ts'],
    localDeps: ['sourceProvenance.mjs'],
    positiveTest: 'x-cron-token valide + slug inconnu -> 404 unknown_slug',
    negativeTest: 'sans jeton -> 401',
    prodDependencyOverrides: {
      'sourceProvenance.mjs': {
        sha256: null,
        bytes: null,
        reason:
          'Bundle v108 déployé avec le sourceProvenance.mjs de production ; l\'empreinte '
          + 'de prod n\'a pas encore été fournie, le rollback exact reste donc à compléter.',
      },
    },
  },
  {
    name: 'scpi-source-link-inspect',
    deployState: 'DEPLOYED',
    prodVersion: 12,
    prodVerifyJwt: false,
    targetVerifyJwt: false,
    auth: 'x-cron-token (SHA-256 comparé à scpi_bulletin_runtime_config)',
    sharedDeps: ['_shared/serviceKey.ts'],
    localDeps: [],
    positiveTest: 'x-cron-token valide + paramètres manquants -> 400',
    negativeTest: 'sans jeton -> 401',
  },
  {
    name: 'scpi-annual-safe-extract',
    deployState: 'DEPLOYED',
    prodVersion: 12,
    prodVerifyJwt: false,
    targetVerifyJwt: false,
    auth: 'x-annual-token (SHA-256 comparé à annual_cron_token_sha256)',
    sharedDeps: ['_shared/serviceKey.ts'],
    localDeps: [],
    positiveTest: 'x-annual-token valide + slug invalide -> 400',
    negativeTest: 'sans jeton -> 401',
  },
  {
    name: 'scpi-annual-report-backfill',
    deployState: 'DEPLOYED',
    prodVersion: 11,
    prodVerifyJwt: false,
    targetVerifyJwt: false,
    auth: 'x-annual-token (SHA-256 comparé à annual_cron_token_sha256)',
    sharedDeps: ['_shared/serviceKey.ts'],
    localDeps: [],
    positiveTest: 'x-annual-token valide + slug manquant -> 400',
    negativeTest: 'sans jeton -> 401',
  },
  {
    name: 'send-lead-notification',
    deployState: 'PENDING_COORDINATED_LOT',
    prodVersion: 17,
    prodVerifyJwt: false,
    targetVerifyJwt: false,
    auth: 'requireApiKey (publishable OU secret)',
    sharedDeps: ['_shared/auth.ts'],
    localDeps: [],
    positiveTest: 'apikey publishable -> 200',
    negativeTest: 'apikey absente/inconnue -> 401/503',
    notes:
      'Prod v17 lit encore directement la clé legacy. Bascule uniquement dans le lot '
      + 'coordonné avec le swap anon frontend.',
  },
  {
    name: 'sender-add-contact',
    deployState: 'PENDING_COORDINATED_LOT',
    prodVersion: 7,
    prodVerifyJwt: true,
    targetVerifyJwt: false,
    auth: 'requireApiKey (publishable OU secret)',
    sharedDeps: ['_shared/auth.ts'],
    localDeps: [],
    positiveTest: 'apikey publishable -> 200',
    negativeTest: 'apikey absente/inconnue -> 401/503',
    notes:
      'Prod v7 est verify_jwt=true : une clé publishable (non JWT) y est rejetée. La bascule '
      + 'en verify_jwt=false se fait au même moment que le swap anon, jamais avant.',
  },
];

const OUT_OF_PERIMETER = [
  {
    name: 'scpi-parallel-backfill-worker',
    reason: 'SOURCE_ABSENT_FROM_REPO',
    prodVersion: 11,
    keyConsumer: 'SUPABASE_SERVICE_ROLE_KEY (lecture directe)',
    blocksRevocation: true,
  },
  {
    name: 'scpi-parallel-discover-worker',
    reason: 'SOURCE_ABSENT_FROM_REPO',
    prodVersion: 11,
    keyConsumer: 'SUPABASE_SERVICE_ROLE_KEY (lecture directe)',
    blocksRevocation: true,
  },
  {
    name: 'scpi-annual-source-discover',
    reason: 'SOURCE_ABSENT_FROM_REPO',
    prodVersion: 9,
    keyConsumer: 'SUPABASE_SERVICE_ROLE_KEY (lecture directe)',
    blocksRevocation: true,
  },
  {
    name: 'scpi-norma-quarterly-ingest',
    reason: 'SOURCE_ABSENT_FROM_REPO',
    prodVersion: 11,
    keyConsumer: 'SUPABASE_SERVICE_ROLE_KEY (lecture directe)',
    blocksRevocation: true,
  },
  {
    name: 'maximus-watchdog-oidc',
    reason: 'SOURCE_ABSENT_FROM_REPO',
    prodVersion: 7,
    keyConsumer: 'SUPABASE_DB_URL (dépendances indirectes à confirmer)',
    blocksRevocation: true,
  },
  {
    name: 'scpi-scoring',
    reason: 'NOT_DEPLOYED_NOT_CALLED',
    prodVersion: null,
    keyConsumer: 'readServiceKey (code prêt, jamais déployé)',
    blocksRevocation: false,
  },
  {
    name: 'maximus-search-agent-oidc',
    reason: 'UNCHANGED_BY_MIGRATION',
    prodVersion: null,
    keyConsumer: 'inchangé par la migration',
    blocksRevocation: false,
  },
  {
    name: 'client-access-admin',
    reason: 'VERIFY_JWT_USER_SESSION',
    prodVersion: null,
    keyConsumer: 'session utilisateur (verify_jwt=true, hors swap anon)',
    blocksRevocation: false,
  },
  {
    name: 'client-surveillance',
    reason: 'VERIFY_JWT_USER_SESSION',
    prodVersion: null,
    keyConsumer: 'session utilisateur (verify_jwt=true, hors swap anon)',
    blocksRevocation: false,
  },
];

/**
 * Évidence de production d'une fonction — schéma v2.
 *
 * Trois défauts du schéma v1 sont corrigés ici, sur constat du contrôle indépendant :
 *
 *  1. **Une déclaration cohérente n'est pas une vérification.** En v1, `ready` pouvait
 *     devenir vrai avec des SHA-256 inventés : `validateProdEvidence` ne vérifiait que la
 *     présence des champs et leur cohérence interne. Désormais `ready` exige une
 *     **attestation de vérification indépendante** lue **hors du dépôt**, dont l'empreinte
 *     est recalculée et dont chaque affirmation est recoupée avec l'évidence.
 *  2. **Le bundle restauré n'était pas le bundle de rollback.** En v1, la restauration était
 *     comparée au bundle **déployé** — donc, pour une fonction déjà migrée, on « restaurait »
 *     le bundle post-migration, ce qui ne défait rien. Désormais `rollbackTarget` est
 *     distinct de `observed`, exige `phase: PRE_MIGRATION` et une identité différente pour
 *     une fonction déjà migrée.
 *  3. **Le réalisateur du test pouvait être son propre vérificateur.** L'attestation exige
 *     une identité de vérificateur distincte de l'opérateur (`performedBy`).
 *
 * Aucun de ces champs ne doit contenir de valeur de clé, de jeton ou de contenu de source.
 */
export const PROD_BUNDLE_EVIDENCE_SCHEMA = Object.freeze({
  schemaVersion: EVIDENCE_SCHEMA_VERSION,
  requiredFields: [
    'schemaVersion', 'stage', 'function', 'observed', 'rollbackTarget', 'custody',
    'restoreDrill', 'attestation',
  ],
  /**
   * Readiness pré-déploiement ≠ validation post-déploiement.
   *
   * Pour une fonction **pas encore migrée**, le bundle à sauvegarder *est* celui qui tourne :
   * exiger `observed ≠ rollbackTarget` interdirait toute préparation avant intervention.
   * Le `stage` rend explicite ce que l'évidence prétend prouver, et `validateManifest`
   * refuse un stage incohérent avec l'état réel de la fonction.
   */
  stages: ['PRE_DEPLOY', 'POST_DEPLOY'],
  observedFields: ['version', 'verifyJwt', 'entrypointSha256', 'dependencies', 'bundleSha256', 'readback'],
  /**
   * Readback fournisseur : la seule source qui dise ce que la prod contient *maintenant*.
   *
   * Un `observed` recopié depuis le registre du dépôt ne prouve rien : il compare une
   * croyance à elle-même. Le readback est donc une lecture provider datée, portant le
   * **projet cible** et une empreinte de **configuration** en plus du code — le contrôle
   * du 25/11 a établi qu'une égalité de SHA de code ne prouve pas l'égalité de configuration.
   */
  readbackFields: [
    'source', 'bundleSource', 'fetchedAt', 'projectRef', 'slug', 'status', 'version', 'verifyJwt',
    'providerEntrypointPath', 'entrypointPath', 'entrypointSha256', 'providerEzbrSha256',
    'dependencies', 'bundleSha256', 'configSha256',
  ],
  /** Ce que la configuration couvre, et qui n'est pas du code. */
  readbackConfigFields: ['projectRef', 'slug', 'version', 'verifyJwt', 'entrypointPath'],
  rollbackTargetFields: [
    'phase', 'version', 'verifyJwt', 'entrypointSha256', 'dependencies', 'bundleSha256',
  ],
  dependencyFields: ['path', 'sha256', 'bytes'],
  custodyFields: [
    'artifactRef', 'artifactSha256', 'owner', 'holdsRestorableArtifact',
    'bindsToBundleSha256', 'bindsToFunction', 'bindsToVersion',
  ],
  restoreDrillFields: [
    'performedAt', 'performedBy', 'result', 'destination', 'journalRef', 'journalSha256',
    'restoredEntrypointSha256', 'restoredBundleSha256',
  ],
  attestationFields: [
    'schemaVersion', 'attestationSha256', 'verifier', 'verifierIdentity', 'signature',
  ],
  /** Champ de signature : clé publique épinglée + valeur. La clé privée est hors dépôt. */
  attestationSignatureFields: ['keyId', 'algorithm', 'value'],
  attestationSignatureAlgorithms: ['ed25519'],
  /** Une restauration ne se prouve jamais sur la production elle-même. */
  restoreDestinations: ['staging-non-prod', 'local-replay', 'disposable-project'],
  /**
   * Toutes les destinations ci-dessus ne prouvent pas la même chose.
   *
   * Un `local-replay` reconstruit le bundle **en mémoire** à partir des octets conservés : il
   * prouve que les octets sont lisibles et reconditionnables, mais il ne traverse **aucune**
   * plateforme de déploiement. Il n'exerce donc ni la résolution des dépendances par le
   * fournisseur, ni la pose de `verify_jwt`, ni le démarrage de la fonction. C'est utile, et
   * c'est conservé comme preuve partielle — mais ce n'est pas une restauration exercée.
   *
   * Seules les destinations où le bundle est **réellement déployé** sur un projet hors
   * production autorisé prouvent qu'on saurait revenir en arrière.
   */
  restoreDestinationsProvingRestore: ['staging-non-prod', 'disposable-project'],
  restoreResults: ['PASS', 'FAIL'],
  /** Une fonction déjà migrée ne peut être « restaurée » que vers son bundle d'avant. */
  rollbackPhases: ['PRE_MIGRATION'],
});

/**
 * Ce que l'attestation externe doit affirmer, et que l'évidence doit recouper.
 *
 * Le contrôle du 25/11 a établi qu'« une égalité de SHA de code seule ne prouve pas
 * l'égalité de configuration » : la signature couvre donc aussi le **projet cible**, la
 * **configuration** observée et l'**identité du readback** qui l'a produite.
 */
export const ATTESTATION_REQUIRED_CLAIMS = Object.freeze([
  'schemaVersion', 'function', 'stage', 'observedBundleSha256', 'rollbackTargetBundleSha256',
  'custodyArtifactSha256', 'custodyArtifactRef', 'restoreJournalSha256',
  'restoredBundleSha256', 'restoreDestination', 'restoreResult',
  'projectRef', 'observedVersion', 'observedVerifyJwt', 'observedConfigSha256',
  'readbackSource', 'readbackFetchedAt',
  'verifier', 'verifierIdentity', 'operator', 'independentOfOperator', 'verifiedAt',
]);

const HEX64 = /^[0-9a-f]{64}$/;

function sha256File(relPath) {
  const abs = join(FUNCTIONS_DIR, relPath);
  if (!existsSync(abs)) return null;
  return createHash('sha256').update(readFileSync(abs)).digest('hex');
}

/**
 * Empreinte canonique d'un bundle : liste triée `chemin + empreinte`.
 *
 * Exportée parce que le collecteur et les tests doivent **recalculer** cette empreinte pour
 * prouver qu'elle correspond au contenu déclaré ; une empreinte recopiée n'est qu'une
 * affirmation.
 */
export function bundleFingerprint(entries) {
  const lines = entries
    .slice()
    .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))
    .map((e) => `${e.path}\n${e.sha256 ?? 'MISSING'}\n`)
    .join('');
  return createHash('sha256').update(lines).digest('hex');
}

/**
 * Empreinte de **configuration** d'un bundle déployé, distincte de son empreinte de code.
 *
 * Le contrôle du 25/11 : « une égalité de SHA de code seule ne prouve pas l'égalité de
 * configuration ». Deux bundles au code identique peuvent tourner avec un `verify_jwt`
 * différent, dans un autre projet, sous une autre version : ce sont ces champs — et eux
 * seuls — que `configSha256` lie, pour que la signature les couvre explicitement.
 *
 * @param {{projectRef: string, slug: string, version: number|string, verifyJwt: boolean, entrypointPath?: string}} config
 * @returns {string} SHA-256 hexadécimal canonique.
 */
export function readbackConfigSha256(config) {
  const picked = Object.fromEntries(
    PROD_BUNDLE_EVIDENCE_SCHEMA.readbackConfigFields.map((f) => [f, config?.[f] ?? null]),
  );
  return canonicalJsonSha256(picked);
}

/** Résolution des empreintes de dépôt pour une fonction du périmètre. */
export function resolveRepoFingerprint(fn) {
  const entryPath = `${fn.name}/index.ts`;
  const entrySha = sha256File(entryPath);
  const dependencies = fn.sharedDeps.map((p) => ({ path: p, sha256: sha256File(p) }));
  for (const p of fn.localDeps) {
    dependencies.push({ path: `${fn.name}/${p}`, sha256: sha256File(`${fn.name}/${p}`) });
  }
  const entrypoint = { path: entryPath, sha256: entrySha };
  const missing = [entrypoint, ...dependencies]
    .filter((e) => !e.sha256)
    .map((e) => e.path);
  return {
    entrypoint,
    dependencies,
    bundleSha256: bundleFingerprint([entrypoint, ...dependencies]),
    missing,
  };
}

/** Dépendances locales importées par l'entrypoint (pour détecter un registre incomplet). */
export function declaredImports(entrySource) {
  const specs = new Set();
  const re = /from\s+["'](\.[^"']+)["']/g;
  let m;
  while ((m = re.exec(entrySource)) !== null) specs.add(m[1]);
  const dyn = /import\(\s*["'](\.[^"']+)["']\s*\)/g;
  while ((m = dyn.exec(entrySource)) !== null) specs.add(m[1]);
  return [...specs];
}

function normalizeImport(fnName, spec) {
  if (spec.startsWith('../_shared/')) return spec.replace('../', '');
  if (spec.startsWith('./')) return `${fnName}/${spec.slice(2)}`;
  return spec;
}

/** Évidence de production : un fichier JSON par fonction, sous `prod-bundles/`. */
export function readProdEvidence(name) {
  const p = join(PROD_EVIDENCE_DIR, `${name}.json`);
  if (!existsSync(p)) return undefined;
  try {
    return JSON.parse(readFileSync(p, 'utf8'));
  } catch {
    return undefined;
  }
}

/** Empreinte SHA-256 canonique d'un objet JSON (clés triées) : elle lie le contenu. */
export function canonicalJsonSha256(value) {
  const canon = (v) => {
    if (Array.isArray(v)) return v.map(canon);
    if (v && typeof v === 'object') {
      return Object.fromEntries(
        Object.keys(v).sort().map((k) => [k, canon(v[k])]),
      );
    }
    return v;
  };
  return createHash('sha256').update(JSON.stringify(canon(value))).digest('hex');
}

/**
 * Résolution réelle (liens symboliques suivis) d'un chemin qui peut ne pas exister encore.
 *
 * `path.resolve` ne fait que normaliser : `../` et un lien symbolique restent invisibles.
 * On remonte donc au premier ancêtre existant, on le résout avec `realpath`, puis on
 * recompose. Un dossier absent ne peut pas être un lien vers le dépôt, mais un ancêtre
 * existant peut l'être — c'est précisément ce cas que v1 laissait passer.
 */
function realpathBestEffort(p, depth = 0) {
  const abs = resolve(p);
  try {
    return realpathSync(abs);
  } catch {
    if (depth > 40) return abs;
    const parent = dirname(abs);
    if (parent === abs) return abs;
    return join(realpathBestEffort(parent, depth + 1), abs.slice(parent.length + 1));
  }
}

function resolveRepoRoot() {
  return realpathBestEffort(REPO_ROOT);
}

/** Un chemin réellement situé dans le dépôt, liens symboliques résolus. */
export function resolvesInsideRepo(p) {
  if (typeof p !== 'string' || p.trim() === '') return false;
  const real = realpathBestEffort(p);
  const root = resolveRepoRoot();
  return real === root || real.startsWith(root + sep);
}

/**
 * Lit un document JSON hors dépôt en vérifiant que sa lecture ne traverse pas le dépôt.
 * @returns {{value: object|null, reason: string|null}}
 */
function readJsonOutsideRepo(p) {
  if (resolvesInsideRepo(p)) return { value: null, reason: 'EVIDENCE_DOCUMENT_INSIDE_REPO' };
  let raw;
  try {
    raw = readFileSync(p, 'utf8');
  } catch {
    return { value: null, reason: 'DOCUMENT_UNREADABLE' };
  }
  try {
    return { value: JSON.parse(raw), reason: null };
  } catch {
    return { value: null, reason: 'DOCUMENT_UNREADABLE' };
  }
}

/**
 * Charge l'ancre de confiance **épinglée dans le dépôt**.
 *
 * Aucune variable d'environnement ne peut la redésigner : c'est la racine de confiance, pas
 * un document. Elle ne contient que des clés publiques et des noms d'identités autorisés.
 */
export function readTrustAnchor(path = TRUST_ANCHOR_PATH) {
  if (!existsSync(path)) return { anchor: null, reason: 'TRUST_ANCHOR_MISSING' };
  try {
    const anchor = JSON.parse(readFileSync(path, 'utf8'));
    if (anchor?.schemaVersion !== TRUST_ANCHOR_SCHEMA_VERSION) {
      return { anchor: null, reason: 'TRUST_ANCHOR_BAD_SCHEMA' };
    }
    if (!Array.isArray(anchor.verifiers) || anchor.verifiers.length === 0) {
      return { anchor: null, reason: 'TRUST_ANCHOR_NO_VERIFIER' };
    }
    return { anchor, reason: null };
  } catch {
    return { anchor: null, reason: 'TRUST_ANCHOR_UNREADABLE' };
  }
}

/** Identité de vérification autorisée par l'ancre (clé publique épinglée). */
export function trustedVerifier(anchor, verifierIdentity) {
  if (!anchor || !verifierIdentity) return null;
  return anchor.verifiers.find((v) => v.identity === verifierIdentity) ?? null;
}

/**
 * Vérifie la signature d'une attestation contre la clé publique épinglée.
 *
 * Le message signé est l'empreinte canonique des affirmations, exactement celle que
 * `crossCheckAttestation` recalcule : signer et vérifier portent donc sur le même octet.
 * Une clé privée qui fuit ne suffit pas à forger : l'identité doit aussi figurer dans
 * l'ancre, et les revocations y sont datées.
 *
 * @param {object} attestation Attestation revendiquée.
 * @param {object|null} anchor Ancre de confiance lue.
 * @returns {string[]} Codes d'erreur (vide = signature valide).
 */
export function verifyAttestationSignature(attestation, anchor) {
  if (!anchor) return ['TRUST_ANCHOR_MISSING'];
  const sig = attestation?.signature;
  if (!sig || typeof sig !== 'object') return ['ATTESTATION_UNSIGNED'];
  const { attestationSignatureFields, attestationSignatureAlgorithms } = PROD_BUNDLE_EVIDENCE_SCHEMA;
  const missing = attestationSignatureFields.filter((f) => typeof sig[f] !== 'string' || sig[f] === '');
  if (missing.length > 0) return missing.map((f) => `MISSING_attestation_signature_${f}`);
  if (!attestationSignatureAlgorithms.includes(sig.algorithm)) {
    return ['UNSUPPORTED_attestation_signature_algorithm'];
  }
  const verifier = trustedVerifier(anchor, attestation.verifierIdentity);
  if (!verifier) return ['ATTESTATION_VERIFIER_NOT_TRUSTED'];
  if (verifier.revokedKeyIds?.includes(sig.keyId) || anchor.revokedKeyIds?.includes(sig.keyId)) {
    return ['ATTESTATION_KEY_REVOKED'];
  }
  // Identité autorisée mais clé publique non encore publiée : rien n'est vérifiable, donc
  // rien n'est prêt. C'est l'état normal avant que le contrôle indépendant provisionne sa clé.
  if (typeof verifier.publicKeyPem !== 'string' || verifier.publicKeyPem.trim() === ''
    || typeof verifier.keyId !== 'string' || verifier.keyId.trim() === '') {
    return ['ANCHOR_KEY_NOT_PROVISIONED'];
  }
  if (verifier.keyId !== sig.keyId) return ['ATTESTATION_KEY_NOT_ANCHORED'];

  const payload = canonicalJsonSha256(
    Object.fromEntries(
      Object.entries(attestation).filter(([k]) => k !== 'signature' && k !== 'attestationSha256'),
    ),
  );
  try {
    const key = createPublicKey({ key: verifier.publicKeyPem, format: 'pem' });
    const ok = cryptoVerify(null, Buffer.from(payload, 'utf8'), key, Buffer.from(sig.value, 'base64'));
    return ok ? [] : ['ATTESTATION_SIGNATURE_INVALID'];
  } catch {
    return ['ATTESTATION_SIGNATURE_UNVERIFIABLE'];
  }
}

/**
 * Charge une attestation de vérification indépendante.
 *
 * Elle est cherchée **hors du dépôt** (`MAXIMUS_ROLLBACK_EVIDENCE_ROOT`), et chaque chemin
 * intermédiaire est résolu réellement : un dossier absent créé sous un lien symbolique vers
 * le dépôt était accepté en v2 (`resolve` seul). Le module ne la fabrique jamais : absente
 * ou forgée, la vérification échoue et `ready` reste faux.
 *
 * @param {string} name Nom de la fonction.
 * @param {{root?: string|null}} [options]
 * @returns {{attestation: object|null, source: string, reason: string|null}}
 */
export function readAttestation(name, options = {}) {
  const root = options.root !== undefined ? options.root : (process.env[EVIDENCE_ROOT_ENV] ?? null);
  if (!root) {
    return { attestation: null, source: 'NONE', reason: 'EVIDENCE_ROOT_UNSET' };
  }
  if (resolvesInsideRepo(root)) {
    return { attestation: null, source: root, reason: 'EVIDENCE_ROOT_INSIDE_REPO' };
  }
  const dir = join(root, 'attestations');
  if (resolvesInsideRepo(dir)) {
    return { attestation: null, source: dir, reason: 'ATTESTATION_DIR_INSIDE_REPO' };
  }
  const p = join(dir, `${name}.json`);
  if (resolvesInsideRepo(p)) {
    return { attestation: null, source: p, reason: 'ATTESTATION_INSIDE_REPO' };
  }
  if (!existsSync(p)) {
    return { attestation: null, source: p, reason: 'ATTESTATION_MISSING' };
  }
  if (!statSync(p).isFile()) {
    return { attestation: null, source: p, reason: 'ATTESTATION_NOT_A_FILE' };
  }
  const { value, reason } = readJsonOutsideRepo(p);
  if (!value) return { attestation: null, source: p, reason: reason ?? 'ATTESTATION_UNREADABLE' };
  return { attestation: value, source: p, reason: null };
}

/**
 * Confronte l'évidence déclarée à une attestation externe **signée**.
 *
 * Une attestation auto-déclarée est un document, pas une vérification : le v2 recalculait
 * une empreinte non signée, donc un opérateur écrivant les deux fichiers pouvait inventer
 * les deux identités et les deux SHA. Le v3 exige en plus une **signature vérifiée contre la
 * clé publique épinglée** de l'ancre de confiance, et un `stage` identique de part et d'autre.
 *
 * @param {object} evidence Évidence de production.
 * @param {object|null} attestation Attestation externe (ou null).
 * @param {object|null} [anchor] Ancre de confiance épinglée (lue si omise).
 * @returns {string[]} Codes d'erreur (vide = recoupement et signature validés).
 */
export function crossCheckAttestation(evidence, attestation, anchor = readTrustAnchor().anchor) {
  if (!attestation || typeof attestation !== 'object') return ['ATTESTATION_MISSING'];
  const errors = [];
  const { attestationFields, requiredFields, stages } = PROD_BUNDLE_EVIDENCE_SCHEMA;

  for (const f of attestationFields) {
    if (!(f in attestation)) errors.push(`MISSING_attestation_${f}`);
  }
  for (const f of ATTESTATION_REQUIRED_CLAIMS) {
    if (!(f in attestation)) errors.push(`MISSING_attestation_claim_${f}`);
  }
  if (attestation.schemaVersion !== ATTESTATION_SCHEMA_VERSION) {
    errors.push('BAD_attestation_schemaVersion');
  }
  if (errors.length > 0) return errors;

  // Le déclarant ne peut pas être son propre vérificateur.
  if (attestation.independentOfOperator !== true) errors.push('ATTESTATION_NOT_INDEPENDENT');
  if (attestation.verifierIdentity === evidence.restoreDrill.performedBy) {
    errors.push('ATTESTATION_VERIFIER_IS_OPERATOR');
  }

  // La signature porte sur les affirmations : sans elle, tout le reste est déclaratif.
  errors.push(...verifyAttestationSignature(attestation, anchor));

  // L'empreinte déclarée doit correspondre au contenu réel des affirmations (sans signature).
  if (typeof attestation.attestationSha256 !== 'string' || !HEX64.test(attestation.attestationSha256)) {
    errors.push('BAD_attestation_attestationSha256');
  } else {
    const claims = Object.fromEntries(
      Object.entries(attestation).filter(([k]) => k !== 'signature' && k !== 'attestationSha256'),
    );
    if (canonicalJsonSha256(claims) !== attestation.attestationSha256) {
      errors.push('ATTESTATION_SHA256_MISMATCH');
    }
  }

  // Recoupement champ par champ : l'attestation doit confirmer l'évidence, pas la doubler.
  // Les affirmations portent aussi l'identité COMPLÈTE du bundle : projet cible, version,
  // verify_jwt, empreinte de configuration et readback qui les a constatés. Une signature
  // qui ne couvrirait que le SHA de code laisserait changer la configuration sans la voir.
  const expect = {
    function: evidence.function,
    stage: evidence.stage,
    observedBundleSha256: evidence.observed?.bundleSha256,
    rollbackTargetBundleSha256: evidence.rollbackTarget?.bundleSha256,
    custodyArtifactSha256: evidence.custody?.artifactSha256,
    custodyArtifactRef: evidence.custody?.artifactRef,
    restoreJournalSha256: evidence.restoreDrill?.journalSha256,
    restoredBundleSha256: evidence.restoreDrill?.restoredBundleSha256,
    restoreDestination: evidence.restoreDrill?.destination,
    restoreResult: evidence.restoreDrill?.result,
    projectRef: evidence.observed?.readback?.projectRef,
    observedVersion: evidence.observed?.version,
    observedVerifyJwt: evidence.observed?.verifyJwt,
    observedConfigSha256: evidence.observed?.readback?.configSha256,
    readbackSource: evidence.observed?.readback?.source,
    readbackFetchedAt: evidence.observed?.readback?.fetchedAt,
    operator: evidence.restoreDrill?.performedBy,
    verifier: evidence.attestation?.verifier,
  };
  for (const [claim, want] of Object.entries(expect)) {
    if (attestation[claim] !== want) errors.push(`ATTESTATION_CLAIM_MISMATCH_${claim}`);
  }
  if (!stages.includes(attestation.stage)) errors.push('BAD_attestation_stage');
  if (typeof attestation.verifiedAt !== 'string' || Number.isNaN(Date.parse(attestation.verifiedAt))) {
    errors.push('BAD_attestation_verifiedAt');
  }
  if (requiredFields.length === 0) errors.push('SCHEMA_EMPTY');
  return errors;
}

/**
 * Valide le bloc `readback` : la lecture fournisseur qui atteste ce que la production
 * contient réellement, dans le bon projet, à l'instant daté.
 *
 * Trois défauts sont refusés ici, tous relevés par le contrôle indépendant du 25/11 :
 *
 *  1. **Comparer le registre à lui-même.** Sans readback, `observed.version` /
 *     `observed.verifyJwt` recopiaient le registre statique du dépôt : le gate ne comparait
 *     qu'une croyance à elle-même (`commonProof` recoupait `fn.prodVersion`).
 *  2. **Oublier le projet cible.** Une évidence décrivant un autre projet que celui qu'on
 *     migre ne prouve rien sur la migration réelle (`READBACK_WRONG_PROJECT`).
 *  3. **Prendre l'égalité du code pour l'égalité de configuration.** `configSha256` lie
 *     version, `verify_jwt`, slug, projet et chemin d'entrypoint ; une empreinte
 *     recalculée qui ne correspond pas au contenu déclaré est refusée.
 *
 * @param {object} observed Bloc `observed` de l'évidence.
 * @param {string} evidenceFunction Nom de fonction déclaré par l'évidence.
 * @returns {string[]} Codes d'erreur (vide = readback exploitable).
 */
export function validateReadback(observed, evidenceFunction) {
  const errors = [];
  const rb = observed?.readback;
  if (!rb || typeof rb !== 'object') return ['MISSING_observed_readback'];

  for (const f of PROD_BUNDLE_EVIDENCE_SCHEMA.readbackFields) {
    if (!(f in rb)) errors.push(`MISSING_readback_${f}`);
  }
  if (errors.length > 0) return errors;

  if (!READBACK_SOURCES.some((s) => typeof rb.source === 'string' && rb.source.startsWith(s.split('{')[0].trim()))) {
    errors.push('READBACK_SOURCE_NOT_PROVIDER');
  }
  // Le contenu vient d'une lecture séparée : sans elle, le readback ne dit pas d'où
  // proviennent les octets dont il publie l'empreinte.
  if (!READBACK_BUNDLE_SOURCES.some(
    (s) => typeof rb.bundleSource === 'string' && rb.bundleSource.startsWith(s.split('{')[0].trim()),
  )) {
    errors.push('READBACK_BUNDLE_SOURCE_NOT_PROVIDER');
  }
  if (rb.status !== READBACK_ACTIVE_STATUS) errors.push('READBACK_STATUS_NOT_ACTIVE');
  if (typeof rb.providerEntrypointPath !== 'string' || rb.providerEntrypointPath === '') {
    errors.push('READBACK_WITHOUT_PROVIDER_ENTRYPOINT');
  }
  // Le chemin canonique doit être celui du registre pour ce slug : un chemin d'une autre
  // fonction rendrait l'identité incomparable au dépôt.
  if (rb.entrypointPath !== `${evidenceFunction}/index.ts`) {
    errors.push('READBACK_ENTRYPOINT_PATH_NOT_REGISTRY_SHAPE');
  }
  if (!HEX64.test(rb.providerEzbrSha256 ?? '')) errors.push('BAD_readback_providerEzbrSha256');
  if (typeof rb.fetchedAt !== 'string' || Number.isNaN(Date.parse(rb.fetchedAt))) {
    errors.push('BAD_readback_fetchedAt');
  }
  if (rb.projectRef !== PRODUCTION_PROJECT_REF) errors.push('READBACK_WRONG_PROJECT');
  if (rb.slug !== evidenceFunction) errors.push('READBACK_OTHER_FUNCTION');
  if (!Number.isInteger(rb.version) || rb.version <= 0) errors.push('BAD_readback_version');
  if (typeof rb.verifyJwt !== 'boolean') errors.push('BAD_readback_verifyJwt');
  for (const [key, code] of [
    ['entrypointSha256', 'BAD_readback_entrypointSha256'],
    ['bundleSha256', 'BAD_readback_bundleSha256'],
    ['configSha256', 'BAD_readback_configSha256'],
  ]) {
    if (!HEX64.test(rb[key])) errors.push(code);
  }
  checkDependencies(rb.dependencies, errors, 'readback');

  // L'empreinte de bundle doit être **recalculable** depuis l'entrypoint et les dépendances
  // déclarés. Sans ce recalcul, `bundleSha256` resterait une valeur déclarée : une empreinte
  // recopiée ne prouve pas le contenu qu'elle prétend résumer.
  if (HEX64.test(rb.entrypointSha256 ?? '')
    && HEX64.test(rb.bundleSha256 ?? '')
    && Array.isArray(rb.dependencies)
    && rb.dependencies.every((d) => typeof d?.path === 'string' && HEX64.test(d?.sha256 ?? ''))) {
    const recomputedBundle = bundleFingerprint([
      { path: `${evidenceFunction}/index.ts`, sha256: rb.entrypointSha256 },
      ...rb.dependencies.map((d) => ({ path: d.path, sha256: d.sha256 })),
    ]);
    if (recomputedBundle !== rb.bundleSha256) errors.push('READBACK_BUNDLE_SHA256_MISMATCH');
  }

  // Le readback n'est pas un commentaire : il doit décrire le MÊME objet que `observed`.
  // Sans cette égalité, on pourrait lire la prod d'un côté et déclarer autre chose de l'autre.
  for (const field of ['version', 'verifyJwt', 'entrypointSha256', 'bundleSha256']) {
    if (field in observed && rb[field] !== observed[field]) {
      errors.push(`READBACK_DISAGREES_WITH_OBSERVED_${field}`);
    }
  }

  // L'empreinte de configuration doit correspondre aux champs qu'elle prétend couvrir.
  if (HEX64.test(rb.configSha256 ?? '')) {
    const recomputed = readbackConfigSha256({
      projectRef: rb.projectRef,
      slug: rb.slug,
      version: rb.version,
      verifyJwt: rb.verifyJwt,
      entrypointPath: rb.entrypointPath ?? null,
    });
    if (recomputed !== rb.configSha256) errors.push('READBACK_CONFIG_SHA256_MISMATCH');
  }
  return errors;
}

/**
 * Vérifie la forme de l'évidence de production (aucune valeur de clé n'y figure) et,
 * surtout, que l'évidence prouve une **restauration possible d'un bundle de rollback
 * distinct** — et non seulement l'identité du bundle actuellement déployé.
 *
 * Le contrôle de forme ne suffit jamais à ouvrir un rollback : la vérification
 * indépendante est faite séparément par `crossCheckAttestation`.
 */
export function validateProdEvidence(evidence) {
  const errors = [];
  const { observedFields, rollbackTargetFields, custodyFields, restoreDrillFields, stages } =
    PROD_BUNDLE_EVIDENCE_SCHEMA;
  if (!evidence || typeof evidence !== 'object') return ['NOT_AN_OBJECT'];
  for (const field of PROD_BUNDLE_EVIDENCE_SCHEMA.requiredFields) {
    if (!(field in evidence)) errors.push(`MISSING_${field}`);
  }
  if ('schemaVersion' in evidence && evidence.schemaVersion !== PROD_BUNDLE_EVIDENCE_SCHEMA.schemaVersion) {
    errors.push('BAD_schemaVersion');
  }
  if ('stage' in evidence && !stages.includes(evidence.stage)) errors.push('BAD_stage');

  const hexField = (obj, key, code) => {
    if (!(key in obj)) return;
    if (!HEX64.test(obj[key])) errors.push(code);
  };

  if ('observed' in evidence) {
    const o = evidence.observed;
    if (!o || typeof o !== 'object') {
      errors.push('BAD_observed');
    } else {
      for (const f of observedFields) if (!(f in o)) errors.push(`MISSING_observed_${f}`);
      hexField(o, 'entrypointSha256', 'BAD_observed_entrypointSha256');
      hexField(o, 'bundleSha256', 'BAD_observed_bundleSha256');
      checkDependencies(o.dependencies, errors, 'observed');
      // L'identité observée ne vaut que si un readback fournisseur la confirme.
      errors.push(...validateReadback(o, evidence.function));
    }
  }

  if ('rollbackTarget' in evidence) {
    const t = evidence.rollbackTarget;
    if (!t || typeof t !== 'object') {
      errors.push('BAD_rollbackTarget');
    } else {
      for (const f of rollbackTargetFields) if (!(f in t)) errors.push(`MISSING_rollbackTarget_${f}`);
      hexField(t, 'entrypointSha256', 'BAD_rollbackTarget_entrypointSha256');
      hexField(t, 'bundleSha256', 'BAD_rollbackTarget_bundleSha256');
      checkDependencies(t.dependencies, errors, 'rollbackTarget');
      if ('phase' in t && !PROD_BUNDLE_EVIDENCE_SCHEMA.rollbackPhases.includes(t.phase)) {
        errors.push('ROLLBACK_TARGET_NOT_PRE_MIGRATION');
      }
    }
  }

  // La cible de rollback doit être un bundle réellement distinct de ce qui est déployé.
  //
  // Distinction séparée par stage : AVANT intervention, la sauvegarde à restaurer *est* le
  // bundle observé (rollback = revenir à l'état courant), et l'exiger distinct interdirait
  // toute préparation. APRÈS migration, une cible identique au bundle déployé ne défait rien
  // et reste refusée. Le sens inverse — un PRE_DEPLOY prétendant avoir déjà migré — est
  // refusé par `validateManifest`, qui connaît l'état réel de chaque fonction.
  if (evidence.observed && evidence.rollbackTarget) {
    const same = evidence.observed.bundleSha256 === evidence.rollbackTarget.bundleSha256;
    if (same && evidence.stage === 'POST_DEPLOY') {
      errors.push('ROLLBACK_TARGET_EQUALS_OBSERVED_BUNDLE');
    }
    if (!same && evidence.stage === 'PRE_DEPLOY' && evidence.rollbackTarget.phase === 'PRE_MIGRATION'
      && evidence.observed.bundleSha256 && evidence.rollbackTarget.bundleSha256) {
      errors.push('ROLLBACK_TARGET_DIFFERS_BEFORE_DEPLOY');
    }
  }

  // Garde de l'artefact : sans artefact conservé et lié, aucune restauration n'est possible.
  if ('custody' in evidence) {
    const c = evidence.custody;
    if (!c || typeof c !== 'object') {
      errors.push('BAD_custody');
    } else {
      for (const f of custodyFields) if (!(f in c)) errors.push(`MISSING_custody_${f}`);
      hexField(c, 'artifactSha256', 'BAD_custody_artifactSha256');
      if ('holdsRestorableArtifact' in c && c.holdsRestorableArtifact !== true) {
        errors.push('CUSTODY_NOT_RESTORABLE');
      }
      if ('artifactRef' in c && (typeof c.artifactRef !== 'string' || c.artifactRef.trim() === '')) {
        errors.push('BAD_custody_artifactRef');
      }
      // La garde doit désigner CETTE fonction dans CETTE version, pas un artefact générique.
      if ('bindsToFunction' in c && c.bindsToFunction !== evidence.function) {
        errors.push('CUSTODY_BINDS_OTHER_FUNCTION');
      }
      if ('bindsToVersion' in c && evidence.rollbackTarget
        && c.bindsToVersion !== evidence.rollbackTarget.version) {
        errors.push('CUSTODY_BINDS_OTHER_VERSION');
      }
      if ('bindsToBundleSha256' in c && evidence.rollbackTarget
        && c.bindsToBundleSha256 !== evidence.rollbackTarget.bundleSha256) {
        errors.push('CUSTODY_BINDS_OTHER_BUNDLE');
      }
    }
  }

  // Restauration réellement effectuée, hors production, reproduisant le bundle de rollback.
  if ('restoreDrill' in evidence) {
    const r = evidence.restoreDrill;
    if (!r || typeof r !== 'object') {
      errors.push('BAD_restoreDrill');
    } else {
      for (const f of restoreDrillFields) if (!(f in r)) errors.push(`MISSING_restoreDrill_${f}`);
      if (!PROD_BUNDLE_EVIDENCE_SCHEMA.restoreDestinations.includes(r.destination)) {
        errors.push('RESTORE_DRILL_ON_PRODUCTION');
      }
      if (!PROD_BUNDLE_EVIDENCE_SCHEMA.restoreResults.includes(r.result)) {
        errors.push('BAD_restoreDrill_result');
      }
      if ('journalRef' in r && (typeof r.journalRef !== 'string' || r.journalRef.trim() === '')) {
        errors.push('BAD_restoreDrill_journalRef');
      }
      if ('journalRef' in r && typeof r.journalRef === 'string' && resolvesInsideRepo(r.journalRef)) {
        errors.push('RESTORE_JOURNAL_INSIDE_REPO');
      }
      hexField(r, 'journalSha256', 'BAD_restoreDrill_journalSha256');
      const target = evidence.rollbackTarget;
      if (target && 'restoredEntrypointSha256' in r
        && r.restoredEntrypointSha256 !== target.entrypointSha256) {
        errors.push('RESTORE_DRILL_ENTRYPOINT_MISMATCH');
      }
      if (target && 'restoredBundleSha256' in r
        && r.restoredBundleSha256 !== target.bundleSha256) {
        errors.push('RESTORE_DRILL_BUNDLE_MISMATCH');
      }
    }
  }
  return errors;
}

function checkDependencies(deps, errors, scope) {
  if (Array.isArray(deps)) {
    for (const d of deps) {
      for (const f of PROD_BUNDLE_EVIDENCE_SCHEMA.dependencyFields) {
        if (!(f in d)) errors.push(`MISSING_${scope}_dependency_${f}`);
      }
      if ('sha256' in d && !HEX64.test(d.sha256)) errors.push(`BAD_${scope}_dependency_sha256`);
    }
  } else if (deps !== undefined) {
    errors.push(`BAD_${scope}_dependencies`);
  }
}

/**
 * Construit le manifeste complet à partir des sources du dépôt.
 * @param {(name: string) => object|undefined} [prodEvidence] Lecteur d'évidence de prod par nom.
 * @param {(name: string) => {attestation: object|null, source: string, reason: string|null}} [attestationReader]
 * @param {object|null} [trustAnchor] Ancre de confiance épinglée (lue depuis le dépôt si omise).
 */
export function buildManifest(
  prodEvidence = readProdEvidence,
  attestationReader = readAttestation,
  trustAnchor = readTrustAnchor().anchor,
) {
  const functions = PERIMETER.map((fn) => {
    const repo = resolveRepoFingerprint(fn);
    const entrySource = sha256File(`${fn.name}/index.ts`)
      ? readFileSync(join(FUNCTIONS_DIR, fn.name, 'index.ts'), 'utf8')
      : '';
    const declared = declaredImports(entrySource)
      .map((s) => normalizeImport(fn.name, s))
      .filter((p) => !p.endsWith('.ts') || p.startsWith('_shared/') || p.includes('/'));
    const known = new Set([
      ...fn.sharedDeps,
      ...fn.localDeps.map((p) => `${fn.name}/${p}`),
    ]);
    const undeclaredImports = declared.filter((p) => !known.has(p));

    const evidence = prodEvidence(fn.name) ?? null;
    const evidenceErrors = evidence ? validateProdEvidence(evidence) : ['EVIDENCE_MISSING'];
    const attestation = evidence ? attestationReader(fn.name) : { attestation: null, source: 'NONE', reason: 'EVIDENCE_MISSING' };
    const attestationErrors = evidence
      ? (attestation.attestation
        ? crossCheckAttestation(evidence, attestation.attestation, trustAnchor)
        : [attestation.reason ?? 'ATTESTATION_MISSING'])
      : ['EVIDENCE_MISSING'];
    const overrides = fn.prodDependencyOverrides ?? {};
    const overridesComplete = Object.values(overrides).every(
      (o) => typeof o.sha256 === 'string' && o.sha256.length === 64,
    );
    // Un rollback n'est restaurable que si l'évidence démontre la garde d'un artefact ET
    // une restauration testée, toutes deux confirmées par une attestation **signée**.
    const custodyRestorable = evidence?.custody?.holdsRestorableArtifact === true;
    const drillPassed = evidence?.restoreDrill?.result === 'PASS';
    // Un rejeu local reconstruit le bundle sans traverser la plateforme de déploiement : il
    // prouve la lisibilité des octets, pas qu'une restauration soit possible. Le compter
    // comme équivalent rendrait `rollbackReady` atteignable sans aucun environnement
    // fournisseur — exactement ce que l'arbitrage du 26/11 exclut.
    const drillDestination = evidence?.restoreDrill?.destination ?? null;
    const drillProvesRestore = PROD_BUNDLE_EVIDENCE_SCHEMA
      .restoreDestinationsProvingRestore.includes(drillDestination);
    const signatureVerified = Boolean(
      evidence && attestation.attestation
      && verifyAttestationSignature(attestation.attestation, trustAnchor).length === 0,
    );

    // État réel de la fonction, confronté au `stage` que l'évidence revendique : une
    // évidence PRE_DEPLOY sur une fonction déjà migrée prétendrait que rien n'a changé.
    const expectedStage = fn.deployState === 'DEPLOYED' ? 'POST_DEPLOY' : 'PRE_DEPLOY';
    const stageMatchesDeployState = evidence ? evidence.stage === expectedStage : false;
    const targetsDistinct = Boolean(
      evidence?.observed?.bundleSha256
      && evidence.observed.bundleSha256 !== evidence.rollbackTarget?.bundleSha256,
    );

    // Le readback est la seule pièce qui dise ce que la prod contient *maintenant*. Il doit
    // se recouper avec le registre (une lecture qui contredit le registre n'est pas
    // exploitable), être postérieur au constat qu'il soutient et assez récent pour que le
    // contrôle indépendant l'ait vu, et lier la configuration que la signature couvre.
    //
    // La fraîcheur se mesure contre le `verifiedAt` de l'**attestation signée**, jamais
    // contre `evidence.attestation` (un stub déclaratif) ni contre l'horloge du CI : une
    // évidence commitée doit rester reproductible, sinon `--check` deviendrait faux avec le
    // temps au lieu de signaler un défaut réel.
    const readback = evidence?.observed?.readback ?? null;
    // Le readback doit confirmer le registre. Pour une fonction pas encore déployée, le
    // registre ne connaît aucune version (`prodVersion: null`) et aucun readback ne peut
    // exister : la readiness reste donc hors d'atteinte, ce qui est l'état correct — on ne
    // prépare pas la restauration d'un bundle qui n'a jamais tourné.
    const readbackMatchesRegistry = Boolean(readback
      && readback.version === fn.prodVersion
      && readback.verifyJwt === fn.prodVerifyJwt
      && readback.slug === fn.name
      && readback.projectRef === PRODUCTION_PROJECT_REF);
    const verifiedAtMs = Date.parse(attestation.attestation?.verifiedAt ?? '');
    const readbackMs = Date.parse(readback?.fetchedAt ?? '');
    const readbackFresh = Boolean(
      Number.isFinite(readbackMs)
      && Number.isFinite(verifiedAtMs)
      && readbackMs <= verifiedAtMs
      && verifiedAtMs - readbackMs <= MAX_READBACK_AGE_MS,
    );
    const readbackConfigBound = Boolean(
      readback && HEX64.test(readback.configSha256 ?? '')
      && readback.configSha256 === readbackConfigSha256({
        projectRef: readback.projectRef,
        slug: readback.slug,
        version: readback.version,
        verifyJwt: readback.verifyJwt,
        entrypointPath: readback.entrypointPath ?? null,
      }),
    );

    const commonProof = evidence
      && evidenceErrors.length === 0
      && attestationErrors.length === 0
      && signatureVerified
      && stageMatchesDeployState
      // L'identité vient du **readback fournisseur**, pas du registre du dépôt : comparer
      // `observed` au registre statique reviendrait à confronter une croyance à elle-même.
      && evidence.observed.version === fn.prodVersion
      && evidence.observed.verifyJwt === fn.prodVerifyJwt
      && readbackMatchesRegistry
      && readbackFresh
      && readbackConfigBound
      && overridesComplete
      && custodyRestorable
      && drillPassed
      // La destination doit réellement exercer un déploiement hors production.
      && drillProvesRestore;

    // Readiness AVANT intervention : le bundle sauvegardé est celui qui tourne, la
    // restauration prouve seulement qu'on saurait revenir à l'état courant.
    const preDeployReady = Boolean(commonProof && evidence.stage === 'PRE_DEPLOY' && !targetsDistinct);
    // Validation APRÈS migration : la cible restaurée doit être distincte de ce qui tourne.
    const postDeployReady = Boolean(commonProof && evidence.stage === 'POST_DEPLOY' && targetsDistinct);
    const rollbackReady = fn.deployState === 'DEPLOYED' ? postDeployReady : preDeployReady;

    return {
      name: fn.name,
      deployState: fn.deployState,
      prodVersion: fn.prodVersion,
      prodVerifyJwt: fn.prodVerifyJwt,
      targetVerifyJwt: fn.targetVerifyJwt,
      auth: fn.auth,
      inlineKeyResolution: Boolean(fn.inlineKeyResolution),
      deployGuard: fn.deployGuard ?? null,
      tests: { positive: fn.positiveTest, negative: fn.negativeTest },
      repo,
      entrypointDrift: fn.entrypointDrift ?? null,
      repoDrift: Object.entries(overrides).map(([path, o]) => ({
        path,
        prodSha256: o.sha256,
        repoSha256:
          repo.dependencies.find((d) => d.path.endsWith(path))?.sha256 ?? null,
        prodBytes: o.bytes,
        reason: o.reason,
      })),
      undeclaredImports,
      rollback: {
        strategy: 'RESTORE_CUSTODIED_PROD_BUNDLE',
        prodEvidencePresent: Boolean(evidence),
        stageDeclared: evidence?.stage ?? null,
        stageExpected: expectedStage,
        stageMatchesDeployState,
        prodVersionSeen: evidence?.observed?.version ?? null,
        prodVerifyJwtSeen: evidence?.observed?.verifyJwt ?? null,
        prodEntrypointSha256: evidence?.observed?.entrypointSha256 ?? null,
        prodBundleSha256: evidence?.observed?.bundleSha256 ?? null,
        readback: {
          present: Boolean(evidence?.observed?.readback),
          source: evidence?.observed?.readback?.source ?? null,
          fetchedAt: evidence?.observed?.readback?.fetchedAt ?? null,
          projectRef: evidence?.observed?.readback?.projectRef ?? null,
          version: evidence?.observed?.readback?.version ?? null,
          verifyJwt: evidence?.observed?.readback?.verifyJwt ?? null,
          bundleSha256: evidence?.observed?.readback?.bundleSha256 ?? null,
          configSha256: evidence?.observed?.readback?.configSha256 ?? null,
          matchesRegistry: readbackMatchesRegistry,
          fresh: readbackFresh,
          configBound: readbackConfigBound,
        },
        evidenceErrors,
        attestationErrors,
        attestationSource: attestation.source,
        // Identité constatée ≠ sauvegarde. Ces preuves sont exigées séparément, et pour une
        // fonction déjà migrée la cible restaurée doit être le bundle d'AVANT migration.
        custodyProof: {
          artifactRef: evidence?.custody?.artifactRef ?? null,
          artifactSha256: evidence?.custody?.artifactSha256 ?? null,
          holdsRestorableArtifact: evidence?.custody?.holdsRestorableArtifact === true,
          bindsToBundleSha256: evidence?.custody?.bindsToBundleSha256 ?? null,
        },
        rollbackTarget: {
          phase: evidence?.rollbackTarget?.phase ?? null,
          version: evidence?.rollbackTarget?.version ?? null,
          bundleSha256: evidence?.rollbackTarget?.bundleSha256 ?? null,
          equalsObserved: Boolean(
            evidence?.observed?.bundleSha256
            && evidence.observed.bundleSha256 === evidence.rollbackTarget?.bundleSha256,
          ),
        },
        restoreDrill: {
          performedAt: evidence?.restoreDrill?.performedAt ?? null,
          performedBy: evidence?.restoreDrill?.performedBy ?? null,
          destination: evidence?.restoreDrill?.destination ?? null,
          result: evidence?.restoreDrill?.result ?? null,
          // Un PASS local-replay est une preuve partielle : le bundle a été reconstruit,
          // pas déployé. Ce champ dit lequel des deux, pour qu'aucun lecteur ne confonde.
          provesRestore: drillProvesRestore,
          journalSha256: evidence?.restoreDrill?.journalSha256 ?? null,
        },
        independentlyVerified: attestationErrors.length === 0,
        signatureVerified,
        verifier: attestation.attestation?.verifier ?? null,
        verifierKeyId: attestation.attestation?.signature?.keyId ?? null,
        fingerprintsOnly: !evidence?.custody && !evidence?.restoreDrill,
        preDeployReady,
        postDeployReady,
        ready: rollbackReady,
        blockingReason: rollbackReady
          ? null
          : evidenceErrors.length > 0
            ? evidenceErrors[0]
            : attestationErrors.length > 0
              ? attestationErrors[0]
              : !signatureVerified
                ? 'ATTESTATION_SIGNATURE_NOT_VERIFIED'
                : !stageMatchesDeployState
                  ? 'EVIDENCE_STAGE_MISMATCH'
                  : !readback
                    ? 'MISSING_observed_readback'
                    : !readbackMatchesRegistry
                      ? 'READBACK_DISAGREES_WITH_REGISTRY'
                      : !readbackConfigBound
                        ? 'READBACK_CONFIG_NOT_BOUND'
                        : !readbackFresh
                          ? 'READBACK_STALE_OR_AFTER_VERIFICATION'
                          : !overridesComplete
                            ? 'PROD_DEPENDENCY_FINGERPRINT_MISSING'
                            : !custodyRestorable
                              ? 'CUSTODY_NOT_RESTORABLE'
                              : !drillPassed
                                ? 'RESTORE_DRILL_NOT_PASSED'
                                // Un PASS obtenu par rejeu local n'exerce aucun déploiement.
                                : !drillProvesRestore
                                  ? 'RESTORE_DRILL_NOT_ON_DEPLOYED_ENVIRONMENT'
                                  : fn.deployState === 'DEPLOYED' && !targetsDistinct
                                  ? 'ROLLBACK_TARGET_EQUALS_OBSERVED_BUNDLE'
                                  : 'PROD_BUNDLE_EVIDENCE_INCONSISTENT',
      },
      notes: fn.notes ?? null,
    };
  });

  const counts = {
    initialPerimeter: PERIMETER.length,
    deployed: functions.filter((f) => f.deployState === 'DEPLOYED').length,
    pendingDeploy: functions.filter((f) => f.deployState === 'PENDING_DEPLOY').length,
    pendingKeyOnlyPatch: functions.filter((f) => f.deployState === 'PENDING_KEY_ONLY_PATCH').length,
    pendingCoordinatedLot: functions.filter((f) => f.deployState === 'PENDING_COORDINATED_LOT').length,
    outOfPerimeter: OUT_OF_PERIMETER.length,
    revocationBlockers: OUT_OF_PERIMETER.filter((f) => f.blocksRevocation).length,
    // Deux readiness distinctes : préparer le rollback d'une fonction non encore migrée
    // n'autorise rien, et valider une fonction migrée est le seul état qui compte ensuite.
    preDeployReady: functions.filter((f) => f.rollback.preDeployReady).length,
    postDeployReady: functions.filter((f) => f.rollback.postDeployReady).length,
    rollbackReady: functions.filter((f) => f.rollback.ready).length,
  };

  return {
    version: MANIFEST_VERSION,
    generatedFrom: 'supabase/functions (empreintes calculées sur les sources du dépôt)',
    trustAnchor: {
      path: 'scripts/security/rollbackVerifierTrustAnchor.json',
      present: Boolean(trustAnchor),
      verifierIdentities: (trustAnchor?.verifiers ?? []).map((v) => v.identity),
    },
    counts,
    functions,
    outOfPerimeter: OUT_OF_PERIMETER,
    revocationAllowed: counts.revocationBlockers === 0
      && functions.every((f) => f.deployState === 'DEPLOYED')
      && functions.every((f) => f.rollback.ready),
  };
}

/** Invariants bloquants. Retourne la liste des violations (vide = conforme). */
export function validateManifest(manifest) {
  const violations = [];
  const v = (code, detail) => violations.push({ code, detail });

  if (manifest.version !== MANIFEST_VERSION) v('VERSION_UNKNOWN', manifest.version);

  const names = manifest.functions.map((f) => f.name);
  if (new Set(names).size !== names.length) v('DUPLICATE_FUNCTION', 'registre');
  if (manifest.counts.initialPerimeter !== INITIAL_PERIMETER_SIZE) {
    v('PERIMETER_SIZE', String(manifest.counts.initialPerimeter));
  }
  const sum = manifest.counts.deployed
    + manifest.counts.pendingDeploy
    + manifest.counts.pendingKeyOnlyPatch
    + manifest.counts.pendingCoordinatedLot;
  if (sum !== manifest.counts.initialPerimeter) {
    v('PERIMETER_SUM_MISMATCH', `${sum} != ${manifest.counts.initialPerimeter}`);
  }
  const stateSum = manifest.functions.reduce((acc, f) => acc + 1, 0);
  if (stateSum !== manifest.counts.initialPerimeter) v('STATE_TOTAL_MISMATCH', String(stateSum));

  for (const f of manifest.functions) {
    if (!DEPLOY_STATES.includes(f.deployState)) v('UNKNOWN_STATE', `${f.name}:${f.deployState}`);
    if (f.repo.missing.length > 0) v('SOURCE_MISSING', `${f.name}:${f.repo.missing.join(',')}`);
    if (f.undeclaredImports.length > 0) {
      v('UNDECLARED_DEPENDENCY', `${f.name}:${f.undeclaredImports.join(',')}`);
    }
    if (f.deployState !== 'DEPLOYED' && f.rollback.ready) {
      v('ROLLBACK_READY_BEFORE_DEPLOY', f.name);
    }
    // Défense en profondeur : même si l'évidence passait la validation de forme, un
    // rollback ne peut pas être `ready` sans garde d'artefact, restauration testée,
    // cible pré-migration distincte, vérification **signée** et stage cohérent.
    if (f.rollback.ready) {
      if (!f.rollback.custodyProof?.holdsRestorableArtifact) {
        v('ROLLBACK_READY_WITHOUT_CUSTODY', f.name);
      }
      if (f.rollback.restoreDrill?.result !== 'PASS') {
        v('ROLLBACK_READY_WITHOUT_RESTORE_DRILL', f.name);
      }
      // Un PASS de rejeu local ne prouve pas qu'on saurait redéployer : le gate ne doit pas
      // s'ouvrir sans une restauration exercée sur un environnement de déploiement.
      if (f.rollback.restoreDrill?.provesRestore !== true) {
        v('ROLLBACK_READY_WITHOUT_EXERCISED_RESTORE', f.name);
      }
      if (!f.rollback.independentlyVerified) {
        v('ROLLBACK_READY_WITHOUT_INDEPENDENT_VERIFICATION', f.name);
      }
      // Une empreinte recalculée n'est pas une signature : sans ancre de confiance,
      // l'opérateur qui écrit les deux documents reste son propre vérificateur.
      if (!f.rollback.signatureVerified) {
        v('ROLLBACK_READY_WITHOUT_SIGNATURE', f.name);
      }
      if (!f.rollback.stageMatchesDeployState) {
        v('ROLLBACK_READY_WITH_STAGE_MISMATCH', f.name);
      }
      // Une identité comparée au registre du dépôt ne prouve rien sur la production :
      // sans readback fournisseur frais et lié à la configuration, rien n'est prêt.
      if (!f.rollback.readback?.present) {
        v('ROLLBACK_READY_WITHOUT_PROVIDER_READBACK', f.name);
      }
      if (!f.rollback.readback?.matchesRegistry) {
        v('ROLLBACK_READY_WITH_READBACK_REGISTRY_MISMATCH', f.name);
      }
      if (!f.rollback.readback?.fresh) {
        v('ROLLBACK_READY_WITH_STALE_READBACK', f.name);
      }
      if (!f.rollback.readback?.configBound) {
        v('ROLLBACK_READY_WITHOUT_CONFIG_BINDING', f.name);
      }
      // Une fonction déjà migrée ne peut pas désigner son propre bundle comme cible.
      if (f.deployState === 'DEPLOYED' && f.rollback.rollbackTarget?.equalsObserved) {
        v('ROLLBACK_READY_TARGET_IS_DEPLOYED_BUNDLE', f.name);
      }
      if (!f.rollback.rollbackTarget?.bundleSha256
        || f.rollback.custodyProof?.bindsToBundleSha256 !== f.rollback.rollbackTarget.bundleSha256) {
        v('ROLLBACK_READY_WITHOUT_CUSTODY_BINDING', f.name);
      }
    }
    // Readiness pré-déploiement réservée aux fonctions pas encore migrées ; validation
    // post-déploiement réservée aux fonctions déjà migrées.
    if (f.rollback.preDeployReady && f.deployState === 'DEPLOYED') {
      v('PRE_DEPLOY_READY_ON_DEPLOYED_FUNCTION', f.name);
    }
    if (f.rollback.postDeployReady && f.deployState !== 'DEPLOYED') {
      v('POST_DEPLOY_READY_ON_UNDEPLOYED_FUNCTION', f.name);
    }
    if (f.deployGuard === 'NEVER_DEPLOY_REPO_ENTRYPOINT_VERBATIM'
      && !f.repoDrift.length && !f.entrypointDrift) {
      v('PROTECTED_FUNCTION_WITHOUT_DRIFT_RECORD', f.name);
    }
  }

  for (const x of manifest.outOfPerimeter) {
    if (!EXCLUSION_REASONS.includes(x.reason)) v('UNKNOWN_EXCLUSION_REASON', `${x.name}:${x.reason}`);
    if (manifest.functions.some((f) => f.name === x.name)) {
      v('FUNCTION_IN_BOTH_SCOPES', x.name);
    }
    if (x.reason === 'SOURCE_ABSENT_FROM_REPO' && !x.blocksRevocation) {
      v('ORPHAN_WITHOUT_REVOCATION_BLOCK', x.name);
    }
  }

  if (manifest.revocationAllowed) {
    if (manifest.counts.revocationBlockers !== 0) v('REVOCATION_WITH_BLOCKERS', 'compteur');
    if (manifest.counts.rollbackReady !== manifest.counts.initialPerimeter) {
      v('REVOCATION_WITHOUT_ROLLBACK', 'rollback incomplet');
    }
  }
  return violations;
}

/** Empreintes attendues du registre commité (sans les champs volatils). */
export function ledgerSnapshot(manifest) {
  return {
    version: manifest.version,
    counts: manifest.counts,
    functions: manifest.functions.map((f) => ({
      name: f.name,
      deployState: f.deployState,
      prodVersion: f.prodVersion,
      entrypointSha256: f.repo.entrypoint.sha256,
      dependencies: f.repo.dependencies.map((d) => ({ path: d.path, sha256: d.sha256 })),
      bundleSha256: f.repo.bundleSha256,
      rollbackReady: f.rollback.ready,
    })),
    outOfPerimeter: manifest.outOfPerimeter.map((x) => ({
      name: x.name,
      reason: x.reason,
      blocksRevocation: x.blocksRevocation,
    })),
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const mode = process.argv[2];
  const manifest = buildManifest();
  const violations = validateManifest(manifest);

  if (mode === '--check') {
    if (violations.length > 0) {
      console.error('Manifeste non conforme :');
      for (const x of violations) console.error(` - ${x.code}: ${x.detail}`);
      process.exit(1);
    }
    const expected = ledgerSnapshot(manifest);
    if (!existsSync(LEDGER_PATH)) {
      console.error(`Registre absent : ${LEDGER_PATH}`);
      process.exit(1);
    }
    const committed = JSON.parse(readFileSync(LEDGER_PATH, 'utf8'));
    if (JSON.stringify(committed) !== JSON.stringify(expected)) {
      console.error('Dérive : le registre commité ne correspond plus aux sources du dépôt.');
      console.error('Régénérer avec : node scripts/security/edgeFunctionDeploymentManifest.mjs --json > '
        + 'scripts/security/edgeFunctionDeploymentManifest.json');
      process.exit(1);
    }
    console.log('Manifeste conforme : périmètre et empreintes cohérents.');
    console.log(`Ancre de confiance : ${manifest.trustAnchor.present ? 'présente' : 'absente'} — `
      + `vérificateurs déclarés : ${manifest.trustAnchor.verifierIdentities.join(', ') || 'aucun'}.`);
    console.log(`Rollback : pré-déploiement ${manifest.counts.preDeployReady}/${manifest.counts.initialPerimeter}, `
      + `post-déploiement ${manifest.counts.postDeployReady}/${manifest.counts.initialPerimeter}, `
      + `ready ${manifest.counts.rollbackReady}/${manifest.counts.initialPerimeter} `
      + `(revocationAllowed=${manifest.revocationAllowed}).`);
    process.exit(0);
  }

  if (mode === '--json') {
    process.stdout.write(`${JSON.stringify(ledgerSnapshot(manifest), null, 2)}\n`);
    process.exit(violations.length > 0 ? 1 : 0);
  }

  console.log(JSON.stringify({ counts: manifest.counts, violations }, null, 2));
  process.exit(violations.length > 0 ? 1 : 0);
}
