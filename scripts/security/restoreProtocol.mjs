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
import { PRODUCTION_PROJECT_REF } from './edgeFunctionDeploymentManifest.mjs';

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
 * Objet du plan de restauration — deux questions distinctes, deux jeux de conditions.
 *
 *  - `ROLLBACK_EVIDENCE` : reconstituer l'état **antérieur** de la fonction migrée. La cible
 *    doit alors être le bundle d'avant migration, et restaurer le bundle déjà déployé ne
 *    défait rien (`ROLLBACK_TARGET_EQUALS_OBSERVED_BUNDLE`).
 *  - `RESTORE_DRILL` : prouver qu'on sait **restaurer les octets capturés** dans un
 *    environnement hors production autorisé. C'est l'exercice prescrit par l'arbitrage du
 *    26/11. La cible légitime **est** le bundle observé (c'est précisément lui qu'on capture
 *    et qu'on rejoue) ; exiger autre chose fermerait l'exercice au lieu de le contrôler.
 */
export const RESTORE_PLAN_PURPOSES = Object.freeze(['ROLLBACK_EVIDENCE', 'RESTORE_DRILL']);

/**
 * Projets **hors production** explicitement autorisés comme cible d'un exercice de restauration.
 *
 * La liste est **vide**, et c'est l'état correct : l'inventaire du 26/11 établit qu'aucun
 * projet MaximusSCPI hors production n'existe, et le mandat interdit d'en créer un sans accord
 * du propriétaire. Un identifiant fourni en argument ne vaut donc **pas** autorisation : sans
 * cette liste, `--restored-project-ref <n'importe quoi>` suffirait à déclarer un exercice
 * « vérifié » dans un projet qui n'a jamais été approuvé.
 *
 * Peuplement = décision explicite du propriétaire, dans un commit relu (même régime que
 * l'ancre de confiance : un document ou une variable d'environnement ne crée pas une
 * autorisation). **Ne jamais élargir cette liste pour débloquer un test.**
 */
export const AUTHORIZED_RESTORE_PROJECT_REFS = Object.freeze([]);

/** Raisons pour lesquelles une cible de restauration est refusée, nommées pour être citables. */
export const RESTORE_TARGET_REFUSALS = Object.freeze([
  'RESTORE_TARGET_MISSING',
  'RESTORE_TARGET_IS_PRODUCTION_PROJECT',
  'RESTORE_TARGET_IS_SOURCE_PROJECT',
  'RESTORE_TARGET_NOT_AUTHORIZED',
]);

/**
 * Autorise — ou refuse — un projet comme cible d'exercice de restauration.
 *
 * ## Le défaut que cette garde ferme
 *
 * Relire la **production** et comparer au sceau de sa propre capture donne `PASS` sur tous les
 * champs de contenu : même slug, mêmes octets, même `verify_jwt`, mêmes dépendances. Un
 * « exercice de restauration » qui ne quitte jamais la production passait donc comme une preuve
 * de restauration, alors qu'aucun déploiement n'avait eu lieu. Le seul champ qui distingue deux
 * lectures est le **projet** : il doit donc être contrôlé explicitement, et pas seulement
 * journalisé.
 *
 * Trois refus, dans cet ordre de lecture :
 *
 *  1. le projet cible doit être nommé (`RESTORE_TARGET_MISSING`) ;
 *  2. il ne peut pas être le projet de production ni le projet d'origine de la capture
 *     (`RESTORE_TARGET_IS_PRODUCTION_PROJECT`, `RESTORE_TARGET_IS_SOURCE_PROJECT`) ;
 *  3. il doit figurer dans `AUTHORIZED_RESTORE_PROJECT_REFS` (`RESTORE_TARGET_NOT_AUTHORIZED`).
 *
 * @param {{projectRef: string, sourceProjectRef?: string, productionProjectRef: string,
 *   authorizedProjectRefs?: string[]}} input
 * @returns {{ok: boolean, reasons: string[]}}
 */
export function authorizeRestoreTarget(input) {
  const {
    projectRef,
    sourceProjectRef = null,
    productionProjectRef = PRODUCTION_PROJECT_REF,
    authorizedProjectRefs = AUTHORIZED_RESTORE_PROJECT_REFS,
  } = input ?? {};
  const reasons = [];

  if (typeof projectRef !== 'string' || projectRef.trim() === '') {
    return { ok: false, reasons: ['RESTORE_TARGET_MISSING'] };
  }
  const target = projectRef.trim();
  // Défaut = la production réelle du dépôt : un appelant qui omet ce champ ne désarme pas le
  // contrôle, il retombe sur la valeur qui ferme le gate (`fail-closed`).
  if (target === productionProjectRef) reasons.push('RESTORE_TARGET_IS_PRODUCTION_PROJECT');
  if (sourceProjectRef && target === sourceProjectRef) reasons.push('RESTORE_TARGET_IS_SOURCE_PROJECT');
  // La liste est une constante du dépôt : on ne l'élargit ni par argument, ni par variable
  // d'environnement. Un appelant qui veut un contrôle positif doit la passer explicitement,
  // ce qui rend le test possible sans jamais ouvrir le chemin d'exécution réel.
  if (!authorizedProjectRefs.includes(target)) reasons.push('RESTORE_TARGET_NOT_AUTHORIZED');

  return { ok: reasons.length === 0, reasons: [...new Set(reasons)] };
}

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
 * Le plan **refuse aussi une destination non autorisée**. Une cible nommée en argument n'est
 * pas une autorisation : sans cette garde, un plan se déclarait `PREPARED` pour n'importe quel
 * identifiant de projet, et le seul champ qui distingue un exercice d'une relecture de la
 * production n'était jamais contrôlé.
 *
 * Chaque étape nomme une commande **réellement exécutable** (`command`), pas une intention :
 * un plan qui indique un outil inexistant, ou un drapeau qu'un outil ignore silencieusement,
 * envoie l'opérateur vers un échec non diagnostiqué.
 *
 * @param {{readback: object, deployRequest: object, equivalence: object, custody: object,
 *   target: {phase?: string, bundleSha256?: string, projectRef?: string}, purpose?: string,
 *   productionProjectRef?: string, authorizedRestoreProjectRefs?: string[]}} input
 * @returns {object}
 */
export function buildRestorePlan(input) {
  const { readback, deployRequest, equivalence, custody, target } = input ?? {};
  const purpose = input?.purpose ?? 'ROLLBACK_EVIDENCE';
  const blockers = [];

  if (!RESTORE_PLAN_PURPOSES.includes(purpose)) blockers.push('RESTORE_PLAN_UNKNOWN_PURPOSE');

  if (!equivalence || equivalence.verdict !== 'PASS') {
    blockers.push('EQUIVALENCE_NOT_PROVEN');
  }
  if (!custody || custody.holdsRestorableArtifact !== true) blockers.push('MISSING_custody');
  if (!target || target.phase !== 'PRE_MIGRATION') blockers.push('ROLLBACK_TARGET_NOT_PRE_MIGRATION');

  // Destination de l'exercice : contrôlée ici aussi, et non seulement dans le CLI. Un plan est
  // la pièce que lit l'opérateur ; un plan « préparé » vers un projet non autorisé serait une
  // invitation à déployer au mauvais endroit.
  //
  // Seul `RESTORE_DRILL` déploie vers un projet : un plan de rollback porte une cible de
  // *bundle*, pas une destination d'exercice, et n'a donc rien à autoriser.
  const targetAuthorization = purpose === 'RESTORE_DRILL'
    ? authorizeRestoreTarget({
      projectRef: target?.projectRef,
      sourceProjectRef: readback?.projectRef ?? null,
      productionProjectRef: input?.productionProjectRef ?? PRODUCTION_PROJECT_REF,
      authorizedProjectRefs: input?.authorizedRestoreProjectRefs ?? AUTHORIZED_RESTORE_PROJECT_REFS,
    })
    : { ok: true, reasons: [], applicable: false };
  for (const reason of targetAuthorization.reasons) {
    // `RESTORE_TARGET_MISSING` n'est pas une faute de saisie mais une décision manquante :
    // il est nommé tel quel pour que le blocage soit lisible sans lire le code.
    if (!blockers.includes(reason)) blockers.push(reason);
  }

  const targetIsObserved = Boolean(
    target && readback && typeof target.bundleSha256 === 'string'
      && target.bundleSha256 === readback.bundleSha256,
  );
  if (purpose === 'ROLLBACK_EVIDENCE') {
    // Restaurer la version qui tourne déjà ne défait rien : c'est le défaut corrigé au lot 8.
    if (targetIsObserved) blockers.push('ROLLBACK_TARGET_EQUALS_OBSERVED_BUNDLE');
  }
  if (purpose === 'RESTORE_DRILL') {
    // Un exercice porte sur une cible connue : rejouer autre chose ne prouverait pas que
    // l'artefact capturé est restaurable.
    if (target && readback && !targetIsObserved) {
      blockers.push('RESTORE_DRILL_TARGET_NOT_OBSERVED_BUNDLE');
    }
  }

  return {
    schemaVersion: RESTORE_PLAN_VERSION,
    purpose,
    function: readback?.slug ?? null,
    projectRef: readback?.projectRef ?? null,
    targetProjectRef: target?.projectRef ?? null,
    // La cible de l'exercice est jugée ici : un plan « préparé » vers un projet non autorisé
    // serait une invitation à déployer au mauvais endroit.
    targetAuthorization,
    // Séparation nette : ce module ne peut produire que du PRÉPARÉ.
    state: blockers.length === 0 ? 'PREPARED' : 'BLOCKED',
    blockers,
    operations: [
      {
        step: 1,
        kind: 'read-only',
        action: 'Capturer les octets, les métadonnées et la configuration de la version déployée',
        tool: 'scripts/security/collectReadback.mjs --capture',
        command: `MAXIMUS_ROLLBACK_EVIDENCE_ROOT=<racine-hors-dépôt> SUPABASE_ACCESS_TOKEN=<jeton> `
          + `node scripts/security/collectReadback.mjs --capture ${readback?.slug ?? '<slug>'}`,
        expectedProof: 'sceau <slug>.seal.json : artifactSha256, bundleSha256, configSha256, version',
      },
      {
        step: 2,
        kind: 'offline',
        action: 'Reconditionner en requête de déploiement conforme et prouver l\'équivalence',
        tool: 'scripts/security/prepareRestore.mjs',
        command: 'MAXIMUS_ROLLBACK_EVIDENCE_ROOT=<même racine> SUPABASE_ACCESS_TOKEN=<jeton> '
          + `node scripts/security/prepareRestore.mjs --function ${readback?.slug ?? '<slug>'} `
          + `--target-project-ref ${readback?.projectRef ?? '<ref>'}`,
        expectedProof: 'verdict PASS : ensemble de chemins, octets par fichier, configuration',
      },
      {
        step: 3,
        kind: 'write-non-prod',
        action: 'Déployer le bundle reconditionné dans un environnement hors production autorisé',
        tool: 'POST /v1/projects/{ref}/functions/deploy?slug=<slug>',
        command: `node scripts/security/prepareRestore.mjs --function ${readback?.slug ?? '<slug>'} `
          + '--target-project-ref <projet-jetable> --emit-deploy-request',
        expectedProof: 'requête de déploiement conforme, digest identique au plan préparé',
      },
      {
        step: 4,
        kind: 'proof',
        action: 'Relire l\'environnement restauré et comparer au sceau de capture',
        tool: 'scripts/security/prepareRestore.mjs --verify-restored',
        command: 'MAXIMUS_ROLLBACK_EVIDENCE_ROOT=<même racine> SUPABASE_ACCESS_TOKEN=<jeton> '
          + `node scripts/security/prepareRestore.mjs --function ${readback?.slug ?? '<slug>'} `
          + '--restored-project-ref <projet-jetable> --verify-restored',
        expectedProof: 'RESTORED_MATCHES_SEAL avec bundleSha256 et configSha256 identiques au sceau',
      },
      {
        step: 5,
        kind: 'independent-proof',
        action: 'Faire attester la restauration par le contrôle indépendant (signature ed25519)',
        tool: 'attestation hors dépôt, clé publique épinglée dans rollbackVerifierTrustAnchor.json',
        command: 'aucune commande de dépôt : la signature est produite hors dépôt avec la clé privée '
          + 'du vérificateur, puis sa clé publique est publiée par PR relue.',
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
      // Empreinte de la requête **telle qu'elle sera écrite**, destination comprise : le
      // digest estampillé de l'étape C doit égaler celui-ci, sinon la destination a changé
      // entre la préparation et l'émission.
      ? digestDeployRequest(
        purpose === 'RESTORE_DRILL' && target?.projectRef
          ? stampDeployRequest(deployRequest, target.projectRef)
          : deployRequest,
      )
      : null,
  };
}

/**
 * Estampille une requête de déploiement avec la destination **autorisée** de l'exercice.
 *
 * Fonction pure : elle ne décide pas de l'autorisation (c'est `authorizeRestoreTarget`, qui
 * s'applique avant), elle inscrit la décision dans la requête. La destination est donc un
 * champ **décidé**, jamais recopié du projet de capture — recopier le projet de capture
 * faisait nommer la production au fichier que l'opérateur envoie réellement.
 *
 * @param {object} deployRequest Requête produite par `buildDeployRequest`.
 * @param {string} targetProjectRef Projet cible validé par l'appelant.
 * @returns {object} Requête estampillée, prête à être écrite hors dépôt.
 */
export function stampDeployRequest(deployRequest, targetProjectRef) {
  return {
    ...deployRequest,
    projectRef: targetProjectRef,
    urlTemplate: String(deployRequest?.urlTemplate ?? '').replace('{ref}', targetProjectRef),
  };
}

/**
 * Empreinte stable d'une requête de déploiement, sans publier aucun contenu de source.
 *
 * Elle permet de prouver que le plan exécuté est exactement le plan préparé : un digest
 * différent signale que la requête a été modifiée entre la préparation et l'exécution.
 *
 * Le `projectRef` **fait partie** de l'empreinte. Il en était exclu, si bien qu'estampiller
 * une requête vers un autre projet ne changeait pas le digest : la preuve « le plan exécuté
 * est le plan préparé » ne liait pas la destination, c'est-à-dire précisément le champ dont
 * l'absence de contrôle constituait le défaut du lot 14.
 *
 * @param {object} request Requête produite par `buildDeployRequest`.
 * @returns {string} SHA-256 hexadécimal.
 */
export function digestDeployRequest(request) {
  const canon = {
    method: request?.method ?? null,
    slug: request?.slug ?? null,
    projectRef: request?.projectRef ?? null,
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
