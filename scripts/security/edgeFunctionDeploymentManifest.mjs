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
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, sep } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = resolve(HERE, '..', '..');
export const FUNCTIONS_DIR = join(REPO_ROOT, 'supabase', 'functions');
export const LEDGER_PATH = join(HERE, 'edgeFunctionDeploymentManifest.json');

export const MANIFEST_VERSION = 'security-edge-manifest-v2';
export const EVIDENCE_SCHEMA_VERSION = 'security-prod-evidence-v2';
export const ATTESTATION_SCHEMA_VERSION = 'rollback-attestation-v1';

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
    'schemaVersion', 'function', 'observed', 'rollbackTarget', 'custody', 'restoreDrill',
    'attestation',
  ],
  observedFields: ['version', 'verifyJwt', 'entrypointSha256', 'dependencies', 'bundleSha256'],
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
  attestationFields: ['schemaVersion', 'attestationSha256', 'verifier', 'verifierIdentity'],
  /** Une restauration ne se prouve jamais sur la production elle-même. */
  restoreDestinations: ['staging-non-prod', 'local-replay', 'disposable-project'],
  restoreResults: ['PASS', 'FAIL'],
  /** Une fonction déjà migrée ne peut être « restaurée » que vers son bundle d'avant. */
  rollbackPhases: ['PRE_MIGRATION'],
});

/** Ce que l'attestation externe doit affirmer, et que l'évidence doit recouper. */
export const ATTESTATION_REQUIRED_CLAIMS = Object.freeze([
  'function', 'observedBundleSha256', 'rollbackTargetBundleSha256',
  'custodyArtifactSha256', 'custodyArtifactRef', 'restoreJournalSha256',
  'restoredBundleSha256', 'restoreDestination', 'restoreResult',
  'verifier', 'verifierIdentity', 'operator', 'independentOfOperator', 'verifiedAt',
]);

const HEX64 = /^[0-9a-f]{64}$/;

function sha256File(relPath) {
  const abs = join(FUNCTIONS_DIR, relPath);
  if (!existsSync(abs)) return null;
  return createHash('sha256').update(readFileSync(abs)).digest('hex');
}

function bundleFingerprint(entries) {
  const lines = entries
    .slice()
    .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))
    .map((e) => `${e.path}\n${e.sha256 ?? 'MISSING'}\n`)
    .join('');
  return createHash('sha256').update(lines).digest('hex');
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

function inRepo(p) {
  const abs = resolve(p);
  return abs === REPO_ROOT || abs.startsWith(REPO_ROOT + sep);
}

/**
 * Charge une attestation de vérification indépendante.
 *
 * Elle est cherchée **hors du dépôt** (`MAXIMUS_ROLLBACK_EVIDENCE_ROOT`) : une attestation
 * commitée dans la même PR que l'évidence qu'elle valide ne prouve aucune indépendance.
 * Le module ne la fabrique jamais : absente, la vérification échoue et `ready` reste faux.
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
  if (inRepo(root)) {
    return { attestation: null, source: root, reason: 'EVIDENCE_ROOT_INSIDE_REPO' };
  }
  const p = join(root, 'attestations', `${name}.json`);
  if (!existsSync(p)) {
    return { attestation: null, source: p, reason: 'ATTESTATION_MISSING' };
  }
  try {
    return { attestation: JSON.parse(readFileSync(p, 'utf8')), source: p, reason: null };
  } catch {
    return { attestation: null, source: p, reason: 'ATTESTATION_UNREADABLE' };
  }
}

/**
 * Confronte l'évidence déclarée à une attestation externe.
 *
 * Chaque affirmation de l'attestation doit se retrouver, à l'identique, dans l'évidence :
 * c'est le recoupement qui interdit de rendre `ready` une évidence inventée. L'attestation
 * porte aussi l'indépendance du vérificateur, impossible à satisfaire en auto-déclaration.
 *
 * @param {object} evidence Évidence de production.
 * @param {object|null} attestation Attestation externe (ou null).
 * @returns {string[]} Codes d'erreur (vide = recoupement réussi).
 */
export function crossCheckAttestation(evidence, attestation) {
  if (!attestation || typeof attestation !== 'object') return ['ATTESTATION_MISSING'];
  const errors = [];
  const { attestationFields, requiredFields } = PROD_BUNDLE_EVIDENCE_SCHEMA;

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

  // L'empreinte de l'attestation doit correspondre à son contenu réel.
  const { attestationSha256, ...claims } = attestation;
  if (canonicalJsonSha256(claims) !== attestationSha256) {
    errors.push('ATTESTATION_SHA256_MISMATCH');
  }

  // Recoupement champ par champ : l'attestation doit confirmer l'évidence, pas la doubler.
  const expect = {
    function: evidence.function,
    observedBundleSha256: evidence.observed?.bundleSha256,
    rollbackTargetBundleSha256: evidence.rollbackTarget?.bundleSha256,
    custodyArtifactSha256: evidence.custody?.artifactSha256,
    custodyArtifactRef: evidence.custody?.artifactRef,
    restoreJournalSha256: evidence.restoreDrill?.journalSha256,
    restoredBundleSha256: evidence.restoreDrill?.restoredBundleSha256,
    restoreDestination: evidence.restoreDrill?.destination,
    restoreResult: evidence.restoreDrill?.result,
    operator: evidence.restoreDrill?.performedBy,
    verifier: evidence.attestation?.verifier,
  };
  for (const [claim, want] of Object.entries(expect)) {
    if (attestation[claim] !== want) errors.push(`ATTESTATION_CLAIM_MISMATCH_${claim}`);
  }
  if (typeof attestation.verifiedAt !== 'string' || Number.isNaN(Date.parse(attestation.verifiedAt))) {
    errors.push('BAD_attestation_verifiedAt');
  }
  if (requiredFields.length === 0) errors.push('SCHEMA_EMPTY');
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
  const { observedFields, rollbackTargetFields, custodyFields, restoreDrillFields } =
    PROD_BUNDLE_EVIDENCE_SCHEMA;
  if (!evidence || typeof evidence !== 'object') return ['NOT_AN_OBJECT'];
  for (const field of PROD_BUNDLE_EVIDENCE_SCHEMA.requiredFields) {
    if (!(field in evidence)) errors.push(`MISSING_${field}`);
  }
  if ('schemaVersion' in evidence && evidence.schemaVersion !== PROD_BUNDLE_EVIDENCE_SCHEMA.schemaVersion) {
    errors.push('BAD_schemaVersion');
  }

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
  if (evidence.observed && evidence.rollbackTarget
    && evidence.observed.bundleSha256 === evidence.rollbackTarget.bundleSha256) {
    errors.push('ROLLBACK_TARGET_EQUALS_OBSERVED_BUNDLE');
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
      if ('journalRef' in r && typeof r.journalRef === 'string' && inRepo(r.journalRef)) {
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
 */
export function buildManifest(prodEvidence = readProdEvidence, attestationReader = readAttestation) {
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
        ? crossCheckAttestation(evidence, attestation.attestation)
        : [attestation.reason ?? 'ATTESTATION_MISSING'])
      : ['EVIDENCE_MISSING'];
    const overrides = fn.prodDependencyOverrides ?? {};
    const overridesComplete = Object.values(overrides).every(
      (o) => typeof o.sha256 === 'string' && o.sha256.length === 64,
    );
    // Un rollback n'est restaurable que si l'évidence démontre la garde d'un artefact ET
    // une restauration testée, toutes deux confirmées par une vérification indépendante.
    const custodyRestorable = evidence?.custody?.holdsRestorableArtifact === true;
    const drillPassed = evidence?.restoreDrill?.result === 'PASS';
    const rollbackReady = Boolean(
      evidence
        && evidenceErrors.length === 0
        && attestationErrors.length === 0
        && evidence.observed.version === fn.prodVersion
        && evidence.observed.verifyJwt === fn.prodVerifyJwt
        && overridesComplete
        && custodyRestorable
        && drillPassed,
    );

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
        prodVersionSeen: evidence?.observed?.version ?? null,
        prodVerifyJwtSeen: evidence?.observed?.verifyJwt ?? null,
        prodEntrypointSha256: evidence?.observed?.entrypointSha256 ?? null,
        prodBundleSha256: evidence?.observed?.bundleSha256 ?? null,
        evidenceErrors,
        attestationErrors,
        attestationSource: attestation.source,
        // Identité constatée ≠ sauvegarde. Ces preuves sont exigées séparément, et la
        // cible restaurée doit être le bundle d'AVANT migration, pas celui déployé.
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
          journalSha256: evidence?.restoreDrill?.journalSha256 ?? null,
        },
        independentlyVerified: attestationErrors.length === 0,
        verifier: attestation.attestation?.verifier ?? null,
        fingerprintsOnly: !evidence?.custody && !evidence?.restoreDrill,
        ready: rollbackReady,
        blockingReason: rollbackReady
          ? null
          : evidenceErrors.length > 0
            ? evidenceErrors[0]
            : attestationErrors.length > 0
              ? attestationErrors[0]
              : !overridesComplete
                ? 'PROD_DEPENDENCY_FINGERPRINT_MISSING'
                : !custodyRestorable
                  ? 'CUSTODY_NOT_RESTORABLE'
                  : !drillPassed
                    ? 'RESTORE_DRILL_NOT_PASSED'
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
    rollbackReady: functions.filter((f) => f.rollback.ready).length,
  };

  return {
    version: MANIFEST_VERSION,
    generatedFrom: 'supabase/functions (empreintes calculées sur les sources du dépôt)',
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
    // bundle de rollback distinct, ni vérification indépendante.
    if (f.rollback.ready) {
      if (!f.rollback.custodyProof?.holdsRestorableArtifact) {
        v('ROLLBACK_READY_WITHOUT_CUSTODY', f.name);
      }
      if (f.rollback.restoreDrill?.result !== 'PASS') {
        v('ROLLBACK_READY_WITHOUT_RESTORE_DRILL', f.name);
      }
      if (!f.rollback.independentlyVerified) {
        v('ROLLBACK_READY_WITHOUT_INDEPENDENT_VERIFICATION', f.name);
      }
      if (f.rollback.rollbackTarget?.equalsObserved) {
        v('ROLLBACK_READY_TARGET_IS_DEPLOYED_BUNDLE', f.name);
      }
      if (!f.rollback.rollbackTarget?.bundleSha256
        || f.rollback.custodyProof?.bindsToBundleSha256 !== f.rollback.rollbackTarget.bundleSha256) {
        v('ROLLBACK_READY_WITHOUT_CUSTODY_BINDING', f.name);
      }
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
    process.exit(0);
  }

  if (mode === '--json') {
    process.stdout.write(`${JSON.stringify(ledgerSnapshot(manifest), null, 2)}\n`);
    process.exit(violations.length > 0 ? 1 : 0);
  }

  console.log(JSON.stringify({ counts: manifest.counts, violations }, null, 2));
  process.exit(violations.length > 0 ? 1 : 0);
}
