/**
 * Protocole de sauvegarde et de restauration d'un bundle déployé — **planification et
 * preuve d'équivalence**, sans aucune écriture en production.
 *
 * ## Le défaut que ce module corrige
 *
 * Le contrôle du 26/11 (#459) a demandé de vérifier le mécanisme de restauration
 * réellement supporté par le fournisseur, plutôt que de supposer que la réponse
 * `GET /functions/{slug}/body` est « directement rejouable » sur un endpoint de
 * déploiement. Elle ne l'est pas :
 *
 *  1. **Les noms de fichiers ne sont pas des chemins de déploiement.** Le corps renvoie
 *     chaque fichier sous son URI temporaire de déploiement
 *     (`file:///tmp/user_fn_…/source/index.ts`). Un `file` nommé ainsi n'a aucun sens
 *     pour l'endpoint de déploiement, qui attend des chemins **relatifs à la racine du
 *     bundle**. Rejouer le multipart tel quel produit une erreur, ou pire un bundle faux.
 *  2. **La partie métadonnées du corps n'est pas la métadonnée de déploiement.**
 *     L'endpoint de déploiement exige `metadata.name` et `metadata.entrypoint_path`
 *     **relatif** ; le corps rend des métadonnées de *lecture* (id, version, status,
 *     ezbr_sha256…) et un `entrypoint_path` absolu.
 *  3. **`verify_jwt` ne se déduit pas du contenu.** C'est un champ de configuration : un
 *     reconditionnement qui l'omet retombe sur la valeur par défaut du fournisseur
 *     (`true`) et change silencieusement la sécurité de la fonction. Le périmètre mélange
 *     les deux valeurs, donc ce champ doit être transporté explicitement.
 *
 * Ce module ne « suppose » donc rien : il **reconditionne** (repack) le bundle lu en une
 * requête de déploiement conforme, puis **prouve** que le reconditionnement est sans perte
 * -- octet pour octet, fichier pour fichier, configuration comprise. Sans cette preuve, un
 * reconditionnement n'est qu'une réécriture plausible, pas une restauration.
 *
 * ## Ce que ce module ne fait pas, volontairement
 *
 *  - il n'émet **aucune** requête réseau et ne déploie rien ;
 *  - il ne lit, ne calcule et n'affiche aucun secret ;
 *  - il ne publie aucun contenu de source : uniquement des empreintes et des tailles ;
 *  - il n'invente jamais un verdict : sans les octets d'origine, il refuse (`*_MISSING`).
 */

import { createHash } from 'node:crypto';
import { normalizeBundlePaths } from './collectReadback.mjs';

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

/**
 * Endpoint de **déploiement** (création ou mise à jour) d'une Edge Function.
 *
 * Distinct des deux endpoints de lecture : c'est `POST …/functions/deploy?slug=…` en
 * `multipart/form-data`, avec une partie `metadata` JSON et une partie `file` par fichier.
 * Référence : `supabase.com/docs/reference/api/v1-deploy-a-function`.
 */
export const DEPLOY_URL = 'https://api.supabase.com/v1/projects/{ref}/functions/deploy?slug={slug}';

/** Le déploiement est un `POST` : il n'existe aucun endpoint de « rollback » par version. */
export const DEPLOY_METHOD = 'POST';

/** Version du schéma de plan de restauration produit ici. */
export const RESTORE_PLAN_VERSION = 'rollback-restore-plan-v1';

/** Ce que le fournisseur exige dans la partie `metadata` du déploiement. */
export const DEPLOY_METADATA_REQUIRED = Object.freeze(['name', 'entrypoint_path']);

/**
 * Champs de métadonnées de déploiement qui **changent le comportement** de la fonction.
 *
 * `verify_jwt` est le cas critique : l'omettre retombe sur `true`, ce qui ferme une fonction
 * conçue pour être publique (`verify_jwt=false`) ou, inversement, laisse croire qu'une
 * fonction protégée l'est encore. Les cinq fonctions du périmètre qui sont en
 * `verify_jwt=false` seraient donc modifiées par une restauration « fidèle » en apparence.
 */
export const DEPLOY_CONFIG_FIELDS = Object.freeze(['verify_jwt', 'import_map_path']);

/** Raisons pour lesquelles un reconditionnement est refusé, nommées pour être citables. */
export const REPACK_REFUSALS = Object.freeze([
  'REPACK_WITHOUT_METADATA',
  'REPACK_WITHOUT_SLUG',
  'REPACK_WITHOUT_ENTRYPOINT_PATH',
  'REPACK_WITHOUT_VERIFY_JWT',
  'REPACK_IMPORT_MAP_UNSUPPORTED',
  'REPACK_WITHOUT_FILES',
  'REPACK_FILE_WITHOUT_NAME',
  'REPACK_FILE_WITHOUT_CONTENT',
  'REPACK_FILE_NOT_UTF8',
  'REPACK_EMPTY_FILE',
  'REPACK_DUPLICATE_DEPLOY_PATH',
  'REPACK_ENTRYPOINT_NOT_UNIQUE',
]);

/** Raisons pour lesquelles une preuve d'équivalence échoue. */
export const EQUIVALENCE_FAILURES = Object.freeze([
  'EQUIVALENCE_WITHOUT_DEPLOY_REQUEST',
  'EQUIVALENCE_WITHOUT_ORIGINAL_READBACK',
  'EQUIVALENCE_PATH_SET_MISMATCH',
  'EQUIVALENCE_BYTES_CHANGED',
  'EQUIVALENCE_ENTRYPOINT_MISMATCH',
  'EQUIVALENCE_CONFIG_CHANGED',
  'EQUIVALENCE_BUNDLE_SHA256_MISMATCH',
]);

/** Un état de restauration n'est jamais « prêt » sans que ces trois preuves existent. */
export const RESTORE_PRECONDITIONS = Object.freeze([
  'custody.holdsRestorableArtifact',
  'restoreDrill.result === "PASS"',
  'restoreDrill.destination !== "production"',
]);

/**
 * Répertoire d'un chemin fournisseur (les URI de déploiement sont toujours absolues).
 * @param {string} p
 * @returns {string}
 */
function providerDirname(p) {
  const i = p.lastIndexOf('/');
  return i === -1 ? '' : p.slice(0, i);
}

/**
 * Reconditionne un bundle lu chez le fournisseur en **requête de déploiement** conforme.
 *
 * Entrée = exactement ce que `parseMultipartFunctionBody` a produit (métadonnées de lecture
 * + fichiers nommés par leur URI temporaire). Sortie = ce que `POST …/deploy` attend :
 * `metadata.name`, `metadata.entrypoint_path` **relatif**, `verify_jwt` transporté
 * explicitement, et des fichiers nommés par un chemin **relatif à la racine du bundle**.
 *
 * Le chemin de déploiement est dérivé de la **même** normalisation que le collecteur
 * (`normalizeBundlePaths`), puis débarrassé du préfixe `<slug>/` : ainsi le bundle restauré
 * et le bundle observé ont la même identité de fichiers, sans que l'identité du registre
 * (`scpi-x/index.ts`) ne soit confondue avec la disposition de déploiement (`index.ts`).
 *
 * @param {{metadata: object, files: Array<{name: string, content: string, bytes?: number}>}} bundle
 * @returns {{ok: boolean, reasons: string[], request?: object}}
 */
export function buildDeployRequest(bundle) {
  const reasons = [];
  const metadata = bundle?.metadata;
  const files = bundle?.files;

  if (!metadata || typeof metadata !== 'object') {
    return { ok: false, reasons: ['REPACK_WITHOUT_METADATA'] };
  }
  const slug = metadata.slug ?? metadata.name;
  if (typeof slug !== 'string' || slug === '') {
    return { ok: false, reasons: ['REPACK_WITHOUT_SLUG'] };
  }
  if (typeof metadata.entrypoint_path !== 'string' || metadata.entrypoint_path === '') {
    return { ok: false, reasons: ['REPACK_WITHOUT_ENTRYPOINT_PATH'] };
  }
  // La configuration fait partie du bundle restauré : l'omettre produirait un déploiement
  // dont la sécurité diffère de celle qu'on prétend restaurer.
  if (typeof metadata.verify_jwt !== 'boolean') {
    return { ok: false, reasons: ['REPACK_WITHOUT_VERIFY_JWT'] };
  }
  // Aucun fichier d'import map n'est transporté par le corps : un reconditionnement ne peut
  // donc pas reconstituer une fonction qui en déclarerait un.
  if (metadata.import_map_path !== null && metadata.import_map_path !== undefined) {
    return { ok: false, reasons: ['REPACK_IMPORT_MAP_UNSUPPORTED'] };
  }
  if (!Array.isArray(files) || files.length === 0) {
    return { ok: false, reasons: ['REPACK_WITHOUT_FILES'] };
  }

  for (const f of files) {
    if (typeof f?.name !== 'string' || f.name === '') {
      return { ok: false, reasons: ['REPACK_FILE_WITHOUT_NAME'] };
    }
    if (typeof f.content !== 'string') return { ok: false, reasons: ['REPACK_FILE_WITHOUT_CONTENT'] };
  }

  const mapping = normalizeBundlePaths({
    entrypointProviderPath: metadata.entrypoint_path,
    filePaths: files.map((f) => f.name),
    slug,
  });

  const deployFiles = [];
  const seen = new Map();
  for (const f of files) {
    const registryPath = mapping.get(f.name);
    const content = f.content;

    // Un contenu non UTF-8 ne survivrait pas à un aller-retour par chaîne : le
    // reconditionnement altérerait les octets sans le dire.
    if (Buffer.byteLength(content, 'utf8') !== Buffer.from(content, 'utf8').length) {
      return { ok: false, reasons: [`REPACK_FILE_NOT_UTF8:${f.name}`] };
    }
    if (content === '') return { ok: false, reasons: [`REPACK_EMPTY_FILE:${registryPath}`] };

    const deployPath = registryPath.startsWith(`${slug}/`)
      ? registryPath.slice(slug.length + 1)
      : registryPath;

    // La forme relative n'est pas re-vérifiée ici : `normalizeBundlePaths` l'impose en amont
    // (`assertRelativeShape` refuse une racine absolue ou un `..`). Ajouter ici un second
    // contrôle équivalent produirait une branche inatteignable — donc une garde qu'aucun
    // test ne pourrait faire échouer, ce qui n'est pas une preuve. La propriété réellement
    // vérifiable est testée dans `restoreProtocol.test.mjs` (« le corps GET n'est PAS
    // rejouable ») et dans `collectReadback.test.mjs` (`PROVIDER_PATH_NOT_NORMALIZABLE`).
    if (seen.has(deployPath)) {
      return { ok: false, reasons: [`REPACK_DUPLICATE_DEPLOY_PATH:${deployPath}`] };
    }
    seen.set(deployPath, true);

    deployFiles.push({
      name: deployPath,
      content,
      bytes: Buffer.byteLength(content, 'utf8'),
      sha256: sha256(Buffer.from(content, 'utf8')),
    });
  }

  const entrypointRegistry = `${slug}/index.ts`;
  const entryDeploy = entrypointRegistry.slice(slug.length + 1);
  const entryMatches = deployFiles.filter((f) => f.name === entryDeploy);
  if (entryMatches.length !== 1) {
    return { ok: false, reasons: [`REPACK_ENTRYPOINT_NOT_UNIQUE:${entryDeploy}`] };
  }

  deployFiles.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

  return {
    ok: true,
    reasons: [],
    request: {
      method: DEPLOY_METHOD,
      urlTemplate: DEPLOY_URL,
      projectRef: metadata.projectRef ?? null,
      slug,
      metadata: {
        name: slug,
        entrypoint_path: entryDeploy,
        verify_jwt: metadata.verify_jwt,
      },
      files: deployFiles,
      sourceVersion: Number.isInteger(metadata.version) ? metadata.version : null,
    },
  };
}

/**
 * Prouve qu'un reconditionnement est **sans perte** par rapport au readback d'origine.
 *
 * Trois égalités sont exigées, et aucune ne se déduit des autres :
 *
 *  1. **Ensemble de chemins** : chaque fichier dépendance du readback doit exister dans la
 *     requête de déploiement, à son chemin de registre, et inversement.
 *  2. **Octets** : le SHA-256 et la taille de chaque fichier reconditionné doivent égaler
 *     ceux du readback. Une réécriture « équivalente en intention » échoue ici.
 *  3. **Configuration** : `verify_jwt` et l'entrypoint doivent être identiques. Un bundle au
 *     code exact mais à la configuration différente n'est pas une restauration.
 *
 * @param {{readback: object, deployRequest: object}} input
 * @returns {{verdict: 'PASS'|'FAIL', reasons: string[], files: Array<object>}}
 */
export function proveRepackEquivalence(input) {
  const readback = input?.readback;
  const request = input?.deployRequest;

  if (!request || !Array.isArray(request.files)) {
    return { verdict: 'FAIL', reasons: ['EQUIVALENCE_WITHOUT_DEPLOY_REQUEST'], files: [] };
  }
  if (!readback || typeof readback !== 'object') {
    return { verdict: 'FAIL', reasons: ['EQUIVALENCE_WITHOUT_ORIGINAL_READBACK'], files: [] };
  }

  const reasons = [];
  const slug = readback.slug;
  const expected = new Map();
  expected.set(`${slug}/index.ts`, readback.entrypointSha256);
  for (const dep of readback.dependencies ?? []) expected.set(dep.path, dep.sha256);

  const observed = new Map();
  for (const f of request.files) {
    const registryPath = deployPathToRegistryPath(f.name, slug);
    observed.set(registryPath, f.sha256);
  }

  const expectedPaths = [...expected.keys()].sort();
  const observedPaths = [...observed.keys()].sort();
  if (expectedPaths.join('\u0000') !== observedPaths.join('\u0000')) {
    reasons.push('EQUIVALENCE_PATH_SET_MISMATCH');
  }

  const files = expectedPaths.map((path) => {
    const want = expected.get(path);
    const got = observed.get(path);
    const match = typeof got === 'string' && got === want;
    if (!match) reasons.push(`EQUIVALENCE_BYTES_CHANGED:${path}`);
    return { path, expectedSha256: want ?? null, deploySha256: got ?? null, match };
  });

  // L'entrypoint de déploiement doit être exactement celui du registre, sans préfixe slug.
  if (request.metadata?.entrypoint_path !== 'index.ts') {
    reasons.push('EQUIVALENCE_ENTRYPOINT_MISMATCH');
  }

  // La configuration doit être transportée et identique ; une absence est un échec, pas un
  // défaut de valeur par défaut.
  if (typeof request.metadata?.verify_jwt !== 'boolean') {
    reasons.push('EQUIVALENCE_CONFIG_CHANGED');
  } else if (request.metadata.verify_jwt !== readback.verifyJwt) {
    reasons.push('EQUIVALENCE_CONFIG_CHANGED');
  }

  // Empreinte agrégée : recalculée depuis la requête, comparée au bloc observé.
  const recomputed = bundleFingerprintFromRequest(request.files, slug);
  if (readback.bundleSha256 && recomputed !== readback.bundleSha256) {
    if (!reasons.includes('EQUIVALENCE_BUNDLE_SHA256_MISMATCH')) {
      reasons.push('EQUIVALENCE_BUNDLE_SHA256_MISMATCH');
    }
  }

  return {
    verdict: reasons.length === 0 ? 'PASS' : 'FAIL',
    reasons: [...new Set(reasons)],
    files,
    recomputedBundleSha256: recomputed,
  };
}

/**
 * Chemin de **déploiement** → chemin du **registre**.
 *
 * L'inverse exact de la dérivation faite dans `buildDeployRequest`, et la seule règle
 * correcte pour comparer les deux identités. Une dépendance locale du bundle
 * (`matcher.mjs`) appartient à la fonction : son identité de registre est
 * `<slug>/matcher.mjs`, jamais `matcher.mjs`. Seul `_shared/…` reste à la racine.
 *
 * Le premier symptôme d'une règle incomplète avait été un `EQUIVALENCE_PATH_SET_MISMATCH`
 * sur `matcher.mjs` : omettre ce préfixe faisait croire à un bundle différent.
 *
 * @param {string} deployPath
 * @param {string} slug
 * @returns {string}
 */
export function deployPathToRegistryPath(deployPath, slug) {
  if (deployPath.startsWith(`${slug}/`)) return deployPath;
  if (deployPath.startsWith('_shared/')) return deployPath;
  return `${slug}/${deployPath}`;
}

/**
 * Empreinte agrégée d'un bundle **de déploiement**, exprimée dans la convention du registre.
 *
 * La règle d'agrégation doit rester identique à `bundleFingerprint` du manifeste, sinon
 * deux empreintes différentes décriraient le même contenu et le gate refuserait à tort.
 * Seuls les chemins changent (`index.ts` → `<slug>/index.ts`) : c'est une identité de
 * fichiers, pas un contenu différent.
 *
 * @param {Array<{name: string, sha256: string}>} files
 * @param {string} slug
 * @returns {string}
 */
export function bundleFingerprintFromRequest(files, slug) {
  const entries = files.map((f) => ({
    path: deployPathToRegistryPath(f.name, slug),
    sha256: f.sha256,
  }));
  const lines = entries
    .slice()
    .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))
    .map((e) => `${e.path}\n${e.sha256 ?? 'MISSING'}\n`)
    .join('');
  return sha256(Buffer.from(lines, 'utf8'));
}

/**
 * Construit le plan de restauration remis à la session interactive.
 *
 * Le plan **refuse** de se déclarer prêt sans preuve : il distingue explicitement ce qui est
 * *préparé* (le reconditionnement prouvé) de ce qui doit être *exécuté* puis *vérifié* par
 * le contrôle indépendant. Une restauration non exercée reste `PREPARED`, jamais `READY`.
 *
 * @param {{readback: object, deployRequest: object, equivalence: object, custody: object, target: object}} input
 * @returns {object}
 */
export function buildRestorePlan(input) {
  const { readback, deployRequest, equivalence, custody, target } = input ?? {};
  const blockers = [];

  if (!equivalence || equivalence.verdict !== 'PASS') {
    blockers.push('EQUIVALENCE_NOT_PROVEN');
  }
  if (!custody || custody.holdsRestorableArtifact !== true) blockers.push('MISSING_custody');
  if (!target || target.phase !== 'PRE_MIGRATION') blockers.push('ROLLBACK_TARGET_NOT_PRE_MIGRATION');
  // Restaurer la version qui tourne déjà ne défait rien : c'est le défaut corrigé au lot 8.
  if (target && readback && target.bundleSha256 === readback.bundleSha256) {
    blockers.push('ROLLBACK_TARGET_EQUALS_OBSERVED_BUNDLE');
  }

  return {
    schemaVersion: RESTORE_PLAN_VERSION,
    function: readback?.slug ?? null,
    projectRef: readback?.projectRef ?? null,
    // Séparation nette : ce module ne peut produire que du PRÉPARÉ.
    state: blockers.length === 0 ? 'PREPARED' : 'BLOCKED',
    blockers,
    operations: [
      {
        step: 1,
        kind: 'read-only',
        action: 'Collecter les octets, les métadonnées et la configuration liées à la version',
        tool: 'scripts/security/collectReadback.mjs --function <nom> --custody <dir-hors-dépôt>',
        expectedProof: 'artifactSha256 + custody.json scellé hors dépôt',
      },
      {
        step: 2,
        kind: 'offline',
        action: 'Reconditionner en requête de déploiement conforme et prouver l\'équivalence',
        tool: 'scripts/security/restoreProtocol.mjs --custody <dir> --target <évidence-cible>',
        expectedProof: 'verdict PASS avec ensemble de chemins, octets et configuration',
      },
      {
        step: 3,
        kind: 'write-non-prod',
        action: 'Déployer le bundle reconditionné dans un environnement hors production autorisé',
        tool: 'POST /v1/projects/{ref}/functions/deploy?slug=<slug> (projet jetable ou staging)',
        expectedProof: 'readback indépendant post-restauration : version, verify_jwt, bundleSha256',
      },
      {
        step: 4,
        kind: 'proof',
        action: 'Faire attester la restauration par le contrôle indépendant (signature ed25519)',
        tool: 'attestation hors dépôt, clé publique épinglée dans rollbackVerifierTrustAnchor.json',
        expectedProof: 'signature valide + 11 affirmations recoupées',
      },
    ],
    providerConstraints: {
      deployMethod: DEPLOY_METHOD,
      deployUrlTemplate: DEPLOY_URL,
      multipartGetNotReplayable: true,
      note: 'La réponse GET …/body n\'est pas une requête de déploiement : noms de fichiers '
        + 'fournisseur (URI temporaires), métadonnées de lecture, et verify_jwt absent du corps.',
    },
    deployRequestDigest: deployRequest
      ? digestDeployRequest(deployRequest)
      : null,
  };
}

/**
 * Empreinte stable d'une requête de déploiement, sans publier aucun contenu de source.
 *
 * Elle permet de prouver que le plan exécuté est exactement le plan préparé : un digest
 * différent signale que la requête a été modifiée entre la préparation et l'exécution.
 *
 * @param {object} request Requête produite par `buildDeployRequest`.
 * @returns {string} SHA-256 hexadécimal.
 */
export function digestDeployRequest(request) {
  const canon = {
    method: request?.method ?? null,
    slug: request?.slug ?? null,
    metadata: request?.metadata ?? null,
    files: (request?.files ?? [])
      .map((f) => ({ name: f.name, sha256: f.sha256 ?? null, bytes: f.bytes ?? null }))
      .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0)),
  };
  return sha256(Buffer.from(stableStringify(canon), 'utf8'));
}

/** Sérialisation JSON à clés triées : deux objets équivalents donnent le même digest. */
function stableStringify(value) {
  const canon = (v) => {
    if (Array.isArray(v)) return v.map(canon);
    if (v && typeof v === 'object') {
      return Object.fromEntries(Object.keys(v).sort().map((k) => [k, canon(v[k])]));
    }
    return v;
  };
  return JSON.stringify(canon(value));
}
