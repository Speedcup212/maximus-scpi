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
} from './restoreProtocol.mjs';
import { REPO_ROOT, buildManifest } from './edgeFunctionDeploymentManifest.mjs';

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
    metadata: { ...parsed.metadata, projectRef: seal.projectRef },
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
 * @param {object} seal Sceau de capture.
 * @param {object} readback Readback du projet restauré.
 * @returns {{verdict: 'PASS'|'FAIL', reasons: string[], compared: object}}
 */
export function verifyRestoredAgainstSeal(seal, readback) {
  const reasons = [];
  if (!readback || typeof readback !== 'object') {
    return { verdict: 'FAIL', reasons: ['RESTORED_READBACK_MISSING'], compared: {} };
  }
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
      restoreProjectRef: readback.projectRef,
      sealProjectRef: seal.projectRef,
      version: readback.version,
      bundleSha256: readback.bundleSha256,
      verifyJwt: readback.verifyJwt,
    },
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
    const { seal } = loadCapturedArtifact(evidenceRoot, slug);
    const caps = await captureProviderArtifact(slug, {
      token: process.env.SUPABASE_ACCESS_TOKEN ?? '',
      projectRef: restoredRef,
    });
    const verdict = verifyRestoredAgainstSeal(seal, caps.readback);
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
    // La requête contient du source : elle n'est écrite que hors dépôt.
    const dir = resolve(evidenceRoot, 'deploy-requests');
    const p = writeJson(dir, `${slug}.deploy-request.json`, prepared.deployRequest);
    process.stdout.write(`${JSON.stringify({
      schemaVersion: RESTORE_PREPARATION_VERSION,
      function: slug,
      state: 'EMITTED',
      deployRequestPath: p,
      deployRequestDigest: preparation.deployRequestDigest,
      endpoint: prepared.deployRequest.urlTemplate,
      note: 'Requête destinée au seul environnement hors production autorisé.',
    }, null, 2)}\n`);
    return 0;
  }

  const targetRef = option(argv, '--target-project-ref');
  if (targetRef && targetRef === captured.seal.projectRef) {
    // Rejouer dans le projet d'origine n'est pas une restauration : c'est une écriture en
    // production, précisément ce qui est interdit.
    console.error('TARGET_IS_PRODUCTION_PROJECT : la cible doit être hors production.');
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
    target: { phase: 'PRE_MIGRATION', bundleSha256: captured.seal.bundleSha256 },
    purpose: 'RESTORE_DRILL',
  });

  const out = {
    ...preparation,
    plan: { purpose: plan.purpose, state: plan.state, blockers: plan.blockers },
  };
  writeJson(resolve(evidenceRoot, 'preparations'), `${slug}.json`, out);
  process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
  return preparation.state === 'PREPARED' ? 0 : 1;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main(process.argv.slice(2))
    .then((code) => process.exit(code))
    .catch((err) => {
      console.error(`Erreur : ${err.message}`);
      process.exit(1);
    });
}
