#!/usr/bin/env node
/**
 * Étape 2 du protocole de restauration : **reconditionner et prouver l'équivalence**.
 *
 * ## Pourquoi ce CLI existe
 *
 * Le plan produit par `restoreProtocol.mjs` décrivait cette étape par une commande qui
 * n'existait pas (`restoreProtocol.mjs --custody … --target …`) : le module est une
 * bibliothèque, sans point d'entrée. Un opérateur suivant le plan obtenait un silence, pas
 * un résultat. Le handoff n'était donc pas exécutable sur son étape centrale.
 *
 * Ce programme lit le sceau de capture écrit par
 * `collectReadback.mjs --capture` (hors dépôt), relit l'artefact multipart brut scellé,
 * reconditionne le bundle en requête de déploiement conforme et **prouve** l'équivalence
 * contre le readback d'origine. Il ne prend aucune décision de sécurité : il applique les
 * gardes déjà testées de `restoreProtocol.mjs`.
 *
 * ## Ce qu'il n'écrit jamais
 *
 *  - aucun contenu de source sur stdout : seulement des empreintes, des tailles et des codes ;
 *  - rien dans le dépôt : toutes les sorties vont sous `MAXIMUS_ROLLBACK_EVIDENCE_ROOT`,
 *    refusé s'il désigne le dépôt (il est public) ;
 *  - rien en production : `--emit-deploy-request` écrit un **fichier de requête** local que
 *    la session interactive utilise pour son projet jetable, aucun appel n'est émis ici.
 *
 * ## Modes
 *
 *   --function <slug> --target-project-ref <ref>     Préparer + prouver (reconditionnement).
 *   --function <slug> --emit-deploy-request          Écrire la requête de déploiement prête.
 *   --function <slug> --restored-project-ref <ref> --verify-restored
 *                                                    Relire le projet restauré et comparer au sceau.
 *
 * Le mode `--verify-restored` effectue **deux** lectures fournisseur sur le projet restauré
 * (métadonnées + corps) : c'est la seule façon de lier la version restaurée aux octets
 * restaurés, et donc de comparer `bundleSha256` et `configSha256` au sceau.
 *
 * Aucun jeton n'est accepté en argument (il apparaîtrait dans `ps`) : uniquement par
 * `SUPABASE_ACCESS_TOKEN`.
 */

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  assertEvidenceRootOutsideRepo,
  captureProviderArtifact,
  parseMultipartFunctionBody,
  readbackFromProviderReads,
  MAXIMUS_EVIDENCE_ROOT_ENV,
} from './collectReadback.mjs';
import {
  buildDeployRequest,
  proveRepackEquivalence,
  buildRestorePlan,
  digestDeployRequest,
  stampDeployRequest,
  authorizeRestoreTarget,
  AUTHORIZED_RESTORE_PROJECT_REFS,
} from './restoreProtocol.mjs';
import {
  REPO_ROOT,
  buildManifest,
  PRODUCTION_PROJECT_REF,
} from './edgeFunctionDeploymentManifest.mjs';

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

/** Version du document de préparation écrit hors dépôt. */
export const RESTORE_PREPARATION_VERSION = 'rollback-restore-preparation-v1';

/**
 * Lit le sceau de capture et les octets scellés d'une fonction.
 *
 * Le sceau est la seule pièce publiable ; les octets restent dans la racine de conservation.
 * On vérifie leur empreinte **avant** de les interpréter : un artefact altéré depuis la
 * capture ne doit pas produire un reconditionnement « réussi ».
 *
 * @param {string} evidenceRoot Racine hors dépôt.
 * @param {string} slug Nom de la fonction.
 * @returns {{seal: object, bytes: Buffer}}
 */
export function loadCapturedArtifact(evidenceRoot, slug) {
  const artifactPath = resolve(evidenceRoot, 'artifacts', `${slug}.multipart.bin`);
  const sealPath = resolve(evidenceRoot, 'artifacts', `${slug}.seal.json`);
  if (!existsSync(sealPath)) throw new Error(`CAPTURE_SEAL_MISSING:${slug}`);
  if (!existsSync(artifactPath)) throw new Error(`CAPTURE_BYTES_MISSING:${slug}`);
  const seal = JSON.parse(readFileSync(sealPath, 'utf8'));
  const bytes = readFileSync(artifactPath);
  if (sha256(bytes) !== seal.artifactSha256) throw new Error('CAPTURE_BYTES_TAMPERED');
  if (bytes.length !== seal.artifactBytes) throw new Error('CAPTURE_BYTES_LENGTH_MISMATCH');
  return { seal, bytes };
}

/**
 * Reconditionne un artefact capturé et prouve l'équivalence contre son readback d'origine.
 *
 * Fonction pure vis-à-vis du réseau : elle ne lit que l'artefact local. C'est ce qui permet
 * de la tester sur la fixture expurgée et de l'exécuter hors ligne dans la session.
 *
 * @param {{seal: object, bytes: Buffer}} captured
 * @returns {{preparation: object}}
 */
export function prepareFromCaptured(captured) {
  const { seal, bytes } = captured;
  const parsed = parseMultipartFunctionBody(bytes, seal.contentType);

  // Le readback d'origine est reconstruit depuis les octets scellés, pas depuis le sceau :
  // les empreintes de celui-ci ne servent qu'à contrôler l'intégrité de l'artefact.
  const readback = readbackFromProviderReads(
    {
      metadata: {
        slug: seal.function,
        name: seal.function,
        status: seal.status,
        version: seal.version,
        verify_jwt: seal.verifyJwt,
        entrypoint_path: seal.providerEntrypointPath,
        ezbr_sha256: seal.providerEzbrSha256,
      },
      body: parsed,
      requestedSlug: seal.function,
    },
    { projectRef: seal.projectRef, fetchedAt: seal.capturedAt },
  );

  // Le sceau et la reconstruction doivent décrire le même bundle : un désaccord signalerait
  // que le sceau a été édité indépendamment des octets.
  if (readback.bundleSha256 !== seal.bundleSha256) throw new Error('SEAL_BUNDLE_SHA256_MISMATCH');
  if (readback.configSha256 !== seal.configSha256) throw new Error('SEAL_CONFIG_SHA256_MISMATCH');

  const repack = buildDeployRequest({
    // Le projet d'origine est la **source** de la capture, jamais la destination du
    // déploiement. Recopier `seal.projectRef` ici produisait un fichier de requête qui nommait
    // la production : un opérateur l'envoyant tel quel aurait déployé dans le projet qu'on
    // cherche précisément à ne pas toucher. La destination reste donc **non décidée** jusqu'à
    // l'émission, où elle est contrôlée puis estampillée.
    //
    // `parsed.metadata` est celui du **corps** : il ne porte ni `slug` ni `version` (voir
    // `identityFromBodyMetadata`). Le reconditionnement a besoin de l'identité du registre, qui
    // vient du readback reconstruit — elle est déjà contrôlée contre les octets ci-dessus.
    metadata: {
      ...parsed.metadata,
      slug: readback.slug,
      name: readback.slug,
      version: readback.version,
      verify_jwt: readback.verifyJwt,
      // Le corps nomme l'entrypoint `deno2_entrypoint_path` : `entrypoint_path` est le nom
      // utilisé par `GET /functions/{slug}` et par le reconditionnement.
      entrypoint_path: parsed.metadata?.entrypoint_path ?? parsed.metadata?.deno2_entrypoint_path,
      // Le corps ne transporte pas d'import map : l'absence de ce champ dans la partie
      // `metadata` ne doit pas être lue comme « import map inconnue ».
      import_map_path: parsed.metadata?.import_map_path ?? null,
      projectRef: null,
    },
    files: parsed.files,
  });
  if (!repack.ok) {
    return {
      preparation: {
        schemaVersion: RESTORE_PREPARATION_VERSION,
        function: seal.function,
        state: 'BLOCKED',
        repackReasons: repack.reasons,
        equivalence: null,
        deployRequestDigest: null,
      },
    };
  }

  const equivalence = proveRepackEquivalence({
    readback,
    deployRequest: repack.request,
  });

  const preparation = {
    schemaVersion: RESTORE_PREPARATION_VERSION,
    function: seal.function,
    sourceProjectRef: seal.projectRef,
    capturedAt: seal.capturedAt,
    version: seal.version,
    verifyJwt: seal.verifyJwt,
    // Identité du bundle : jamais de contenu, uniquement des empreintes.
    bundleSha256: readback.bundleSha256,
    configSha256: readback.configSha256,
    artifactSha256: seal.artifactSha256,
    state: equivalence.verdict === 'PASS' ? 'PREPARED' : 'BLOCKED',
    repackReasons: [],
    equivalence: {
      verdict: equivalence.verdict,
      reasons: equivalence.reasons,
      files: equivalence.files,
      recomputedBundleSha256: equivalence.recomputedBundleSha256,
    },
    deployRequestDigest: digestDeployRequest(repack.request),
  };

  return {
    preparation,
    // La requête elle-même n'est rendue qu'à l'appelant : elle contient du source et ne doit
    // être écrite que hors dépôt, en mode `--emit-deploy-request`.
    deployRequest: repack.request,
  };
}

/**
 * Compare une relecture du projet restauré au sceau de capture.
 *
 * ## Deux questions distinctes, dans cet ordre
 *
 *  1. **La cible est-elle légitime ?** Contrôlée avant toute comparaison de contenu. Relire la
 *     production donne `PASS` sur *tous* les champs de contenu — même slug, mêmes octets, même
 *     `verify_jwt`, mêmes dépendances — puisque c'est le bundle dont le sceau a été pris. Sans
 *     ce contrôle, un simple readback de la production se présentait comme une restauration
 *     vérifiée alors qu'aucun déploiement n'avait eu lieu. Le contrôle porte sur le projet
 *     **réellement lu** (`readback.projectRef`), jamais sur celui annoncé en argument.
 *  2. **Le contenu relu est-il identique ?** Comparaison des champs couverts par la
 *     configuration, à l'exclusion de `configSha256` brut (il lie le `projectRef`, donc il
 *     diffère légitimement entre deux projets) et de la **version fournisseur** (un
 *     redéploiement en crée une nouvelle sans changer les octets) : la version est **tracée**
 *     séparément, pas comparée.
 *
 * Un `PASS` ici ne prouve **que** l'égalité de contenu relue. Il ne prouve ni le déploiement,
 * ni le démarrage, ni la configuration exercée : ces preuves viennent des tests
 * d'authentification exécutés dans le projet d'exercice (§11.4), que ce module ne produit pas.
 *
 * @param {object} seal Sceau de capture.
 * @param {object} readback Readback du projet restauré.
 * @param {{expectedProjectRef?: string|null, productionProjectRef: string,
 *   authorizedProjectRefs?: string[]}} [target] Cible attendue et politique d'autorisation.
 * @returns {{verdict: 'PASS'|'FAIL', reasons: string[], compared: object,
 *   contentComparison: string, targetAuthorization: object}}
 */
export function verifyRestoredAgainstSeal(seal, readback, target = {}) {
  if (!readback || typeof readback !== 'object') {
    return {
      verdict: 'FAIL',
      reasons: ['RESTORED_READBACK_MISSING'],
      compared: {},
      contentComparison: 'NOT_ATTEMPTED',
      targetAuthorization: { ok: false, reasons: ['RESTORE_TARGET_MISSING'] },
    };
  }

  const observedProjectRef = readback.projectRef ?? null;
  const expectedProjectRef = target.expectedProjectRef ?? observedProjectRef;

  // Étape 1 — la cible, jugée sur le projet effectivement lu : une relecture de la production
  // reste une relecture de la production, quel que soit l'argument fourni.
  const authorization = authorizeRestoreTarget({
    projectRef: observedProjectRef,
    sourceProjectRef: seal.projectRef,
    productionProjectRef: target.productionProjectRef,
    authorizedProjectRefs: target.authorizedProjectRefs ?? AUTHORIZED_RESTORE_PROJECT_REFS,
  });

  const reasons = [...authorization.reasons];

  // Le projet lu doit être celui qu'on prétend avoir relu : sans cette égalité, un readback
  // autorisé d'un autre projet servirait à valider l'exercice d'une cible différente.
  if (observedProjectRef !== expectedProjectRef) reasons.push('RESTORED_PROJECT_REF_MISMATCH');

  if (reasons.length > 0) {
    // Arrêt net : comparer le contenu de la production à sa propre capture ne produirait
    // qu'un `PASS` trompeur, exactement le faux positif relevé le 26/11.
    return {
      verdict: 'FAIL',
      reasons: [...new Set(reasons)],
      compared: {
        restoreProjectRef: observedProjectRef,
        expectedProjectRef,
        sealProjectRef: seal.projectRef,
      },
      contentComparison: 'NOT_ATTEMPTED',
      targetAuthorization: authorization,
    };
  }

  // Étape 2 — le contenu, désormais comparable.
  if (readback.slug !== seal.function) reasons.push('RESTORED_OTHER_FUNCTION');
  if (readback.bundleSha256 !== seal.bundleSha256) reasons.push('RESTORED_BUNDLE_SHA256_MISMATCH');
  if (readback.verifyJwt !== seal.verifyJwt) reasons.push('RESTORED_VERIFY_JWT_MISMATCH');

  // `configSha256` lie version + verify_jwt + slug + projet + entrypoint : il change donc
  // légitimement avec le projet cible. On compare sa **configuration** décomposée, pas son
  // empreinte, qui ne peut pas être égale entre deux projets distincts.
  if (readback.entrypointPath !== seal.entrypointPath && seal.entrypointPath) {
    reasons.push('RESTORED_ENTRYPOINT_MISMATCH');
  }
  const restoredDeps = (readback.dependencies ?? []).map((d) => `${d.path}:${d.sha256}`).sort();
  const sealDeps = (seal.dependencies ?? []).map((d) => `${d.path}:${d.sha256}`).sort();
  if (restoredDeps.join('\u0000') !== sealDeps.join('\u0000')) {
    reasons.push('RESTORED_DEPENDENCIES_MISMATCH');
  }
  if (readback.entrypointSha256 !== seal.entrypointSha256) {
    reasons.push('RESTORED_ENTRYPOINT_SHA256_MISMATCH');
  }

  return {
    verdict: reasons.length === 0 ? 'PASS' : 'FAIL',
    reasons,
    compared: {
      restoreProjectRef: observedProjectRef,
      expectedProjectRef,
      sealProjectRef: seal.projectRef,
      version: readback.version,
      bundleSha256: readback.bundleSha256,
      verifyJwt: readback.verifyJwt,
    },
    contentComparison: 'ATTEMPTED',
    // Tracée, jamais comparée : un redéploiement légitime change la version fournisseur
    // sans changer les octets. La comparer à l'identique ferait échouer tout exercice
    // valide ; l'ignorer la rendrait invisible. On la consigne donc à part.
    versionTrace: {
      sealVersion: seal.version ?? null,
      restoredVersion: readback.version ?? null,
      differs: (seal.version ?? null) !== (readback.version ?? null),
    },
    targetAuthorization: authorization,
    // Le `PASS` de comparaison n'est pas une preuve d'exercice : le déploiement et les tests
    // d'authentification restent à faire, et c'est l'attestation qui les couvre.
    exercisedProof: false,
  };
}

function usage() {
  console.error('Usage :');
  console.error('  MAXIMUS_ROLLBACK_EVIDENCE_ROOT=<dir-hors-dépôt> SUPABASE_ACCESS_TOKEN=… '
    + 'node scripts/security/prepareRestore.mjs --function <nom> --target-project-ref <ref>');
  console.error('  … --function <nom> --emit-deploy-request');
  console.error('  MAXIMUS_ROLLBACK_EVIDENCE_ROOT=<dir> SUPABASE_ACCESS_TOKEN=… '
    + 'node scripts/security/prepareRestore.mjs --function <nom> '
    + '--restored-project-ref <ref> --verify-restored');
  console.error('La cible doit figurer dans AUTHORIZED_RESTORE_PROJECT_REFS '
    + '(restoreProtocol.mjs) : un identifiant fourni en argument n\'est pas une autorisation.');
}

/** Lit une option `--nom valeur` sans jamais accepter de jeton. */
function option(argv, name) {
  const i = argv.indexOf(name);
  if (i === -1) return null;
  const v = argv[i + 1];
  return v && !v.startsWith('--') ? v : null;
}

function writeJson(dir, name, value) {
  mkdirSync(dir, { recursive: true });
  const p = resolve(dir, name);
  writeFileSync(p, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  return p;
}

async function main(argv) {
  const slug = option(argv, '--function');
  if (!slug) { usage(); return 2; }

  const known = buildManifest(() => undefined).functions.map((f) => f.name);
  if (!known.includes(slug)) {
    console.error(`Fonction hors périmètre : ${slug}`);
    return 2;
  }

  const evidenceRoot = process.env[MAXIMUS_EVIDENCE_ROOT_ENV] ?? '';
  const rootCheck = assertEvidenceRootOutsideRepo(evidenceRoot, REPO_ROOT);
  if (!rootCheck.ok) {
    console.error(`Conservation refusée : ${rootCheck.reason}`);
    return 1;
  }

  // --- Mode relecture du projet restauré ------------------------------------------------
  if (argv.includes('--verify-restored')) {
    const restoredRef = option(argv, '--restored-project-ref');
    if (!restoredRef) { usage(); return 2; }

    // Le garde-fou de la branche préparation ne protégeait pas cette branche : `--target-project-ref`
    // y était contrôlé, `--restored-project-ref` ne l'était pas. Une relecture de la production
    // passait donc comme vérification de restauration, sans aucun déploiement. La cible est
    // contrôlée ici, **avant** toute lecture fournisseur : refuser après avoir lu ne servirait
    // qu'à produire un journal d'un exercice qui n'a pas eu lieu.
    const earlyTargetCheck = authorizeRestoreTarget({
      projectRef: restoredRef,
      sourceProjectRef: null,
      productionProjectRef: PRODUCTION_PROJECT_REF,
      authorizedProjectRefs: AUTHORIZED_RESTORE_PROJECT_REFS,
    });
    if (!earlyTargetCheck.ok) {
      console.error(`Cible refusée : ${earlyTargetCheck.reasons.join(', ')}`);
      return 1;
    }

    const { seal } = loadCapturedArtifact(evidenceRoot, slug);
    const caps = await captureProviderArtifact(slug, {
      token: process.env.SUPABASE_ACCESS_TOKEN ?? '',
      projectRef: restoredRef,
    });
    // Seconde barrière, sur le projet **réellement lu** : un fournisseur peut répondre pour un
    // autre projet que celui demandé, et c'est cette valeur-là qui doit être autorisée.
    const verdict = verifyRestoredAgainstSeal(seal, caps.readback, {
      expectedProjectRef: restoredRef,
      productionProjectRef: PRODUCTION_PROJECT_REF,
      authorizedProjectRefs: AUTHORIZED_RESTORE_PROJECT_REFS,
    });
    const out = {
      schemaVersion: 'rollback-restore-verification-v1',
      function: slug,
      restoredProjectRef: restoredRef,
      verifiedAt: new Date().toISOString(),
      ...verdict,
    };
    writeJson(resolve(evidenceRoot, 'restorations'), `${slug}.${restoredRef}.json`, out);
    process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
    return verdict.verdict === 'PASS' ? 0 : 1;
  }

  // --- Modes préparation / émission de requête ------------------------------------------
  const captured = loadCapturedArtifact(evidenceRoot, slug);
  const prepared = prepareFromCaptured(captured);
  const { preparation } = prepared;

  if (argv.includes('--emit-deploy-request')) {
    if (preparation.state !== 'PREPARED') {
      process.stdout.write(`${JSON.stringify(preparation, null, 2)}\n`);
      console.error('Requête non émise : reconditionnement bloqué.');
      return 1;
    }

    // La requête doit nommer la destination **autorisée** de l'exercice. Sans ce contrôle,
    // le fichier émis décrivait un projet non décidé (historiquement la production) et un
    // opérateur pouvait l'envoyer tel quel. La cible est vérifiée ici, avant écriture.
    const emitTargetRef = option(argv, '--target-project-ref');
    const emitTargetCheck = authorizeRestoreTarget({
      projectRef: emitTargetRef,
      sourceProjectRef: captured.seal.projectRef,
      productionProjectRef: PRODUCTION_PROJECT_REF,
      authorizedProjectRefs: AUTHORIZED_RESTORE_PROJECT_REFS,
    });
    if (!emitTargetCheck.ok) {
      process.stdout.write(`${JSON.stringify({
        schemaVersion: RESTORE_PREPARATION_VERSION,
        function: slug,
        state: 'TARGET_REFUSED',
        targetProjectRef: emitTargetRef,
        reasons: emitTargetCheck.reasons,
      }, null, 2)}\n`);
      console.error(`Requête non émise : ${emitTargetCheck.reasons.join(', ')}`);
      return 1;
    }

    const request = stampDeployRequest(prepared.deployRequest, emitTargetRef);
    const emittedDigest = digestDeployRequest(request);

    // La requête contient du source : elle n'est écrite que hors dépôt.
    const dir = resolve(evidenceRoot, 'deploy-requests');
    const p = writeJson(dir, `${slug}.deploy-request.json`, request);
    process.stdout.write(`${JSON.stringify({
      schemaVersion: RESTORE_PREPARATION_VERSION,
      function: slug,
      state: 'EMITTED',
      deployRequestPath: p,
      // Digest de la requête **estampillée**, destination comprise. Il diffère donc
      // normalement de `preparation.deployRequestDigest` (calculé avant que la destination
      // soit décidée) : l'égalité qui compte est celle du plan préparé **pour cette cible**.
      deployRequestDigest: emittedDigest,
      targetProjectRef: emitTargetRef,
      endpoint: request.urlTemplate,
      note: 'Requête destinée au seul environnement hors production autorisé.',
    }, null, 2)}\n`);
    return 0;
  }

  const targetRef = option(argv, '--target-project-ref');
  // Même règle que la branche `--verify-restored` : la cible doit être nommée, distincte du
  // projet d'origine et explicitement autorisée. Un simple `!==` sur la production laissait
  // passer n'importe quel identifiant — donc un exercice dans un projet jamais approuvé.
  const targetCheck = authorizeRestoreTarget({
    projectRef: targetRef,
    sourceProjectRef: captured.seal.projectRef,
    productionProjectRef: PRODUCTION_PROJECT_REF,
    authorizedProjectRefs: AUTHORIZED_RESTORE_PROJECT_REFS,
  });
  if (!targetCheck.ok) {
    console.error(`Cible refusée : ${targetCheck.reasons.join(', ')}`);
    return 1;
  }

  const plan = buildRestorePlan({
    readback: {
      slug,
      projectRef: captured.seal.projectRef,
      bundleSha256: captured.seal.bundleSha256,
    },
    deployRequest: prepared.deployRequest,
    equivalence: preparation.equivalence,
    custody: { holdsRestorableArtifact: true },
    target: {
      phase: 'PRE_MIGRATION',
      bundleSha256: captured.seal.bundleSha256,
      projectRef: targetRef,
    },
    purpose: 'RESTORE_DRILL',
    productionProjectRef: PRODUCTION_PROJECT_REF,
    authorizedRestoreProjectRefs: AUTHORIZED_RESTORE_PROJECT_REFS,
  });

  const out = {
    ...preparation,
    plan: {
      purpose: plan.purpose,
      state: plan.state,
      blockers: plan.blockers,
      targetAuthorized: plan.targetAuthorization.ok,
      targetAuthorizationReasons: plan.targetAuthorization.reasons,
    },
  };
  writeJson(resolve(evidenceRoot, 'preparations'), `${slug}.json`, out);
  process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
  // Le reconditionnement prouvé reste `PREPARED` (c'est un fait sur les octets), mais la
  // commande ne réussit que si le **plan** est préparé : sans destination autorisée, l'étape
  // ne mène à aucun exercice, et un code 0 ferait croire le contraire à un enchaînement `&&`.
  return preparation.state === 'PREPARED' && plan.state === 'PREPARED' ? 0 : 1;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main(process.argv.slice(2))
    .then((code) => process.exit(code))
    .catch((err) => {
      console.error(`Erreur : ${err.message}`);
      process.exit(1);
    });
}
