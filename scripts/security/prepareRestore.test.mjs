import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import {
  loadCapturedArtifact,
  prepareFromCaptured,
  verifyRestoredAgainstSeal,
  RESTORE_PREPARATION_VERSION,
} from './prepareRestore.mjs';
import {
  buildRestorePlan,
  RESTORE_PLAN_PURPOSES,
} from './restoreProtocol.mjs';
import {
  redactedMetadata,
  redactedBody,
} from './fixtures/providerFunctionBody.mjs';
import {
  parseMultipartFunctionBody,
  readbackFromProviderReads,
} from './collectReadback.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..', '..');
const SLUG = 'scpi-certified-promote';
const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

/**
 * Capture réelle simulée : les octets multipart sont ceux de la fixture expurgée, et le
 * sceau est produit par les mêmes dérivations que `captureProviderArtifact`. On ne réécrit
 * pas le sceau à la main : un sceau bricolé ne testerait que le test.
 */
function seedCapture(root) {
  const meta = redactedMetadata();
  const body = redactedBody({ metadata: meta });
  const dir = join(root, 'artifacts');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${SLUG}.multipart.bin`), body.buffer);

  // Dérivations identiques à celles du collecteur, depuis les octets réellement écrits.
  const parsed = parseMultipartFunctionBody(body.buffer, body.contentType);
  const readback = readbackFromProviderReads(
    { metadata: meta, body: parsed, requestedSlug: meta.slug },
    { fetchedAt: '2026-11-26T09:00:00Z' },
  );
  writeFileSync(join(dir, `${SLUG}.seal.json`), JSON.stringify({
    schemaVersion: 'rollback-custody-artifact-v1',
    function: meta.slug,
    projectRef: readback.projectRef,
    capturedAt: readback.fetchedAt,
    version: meta.version,
    verifyJwt: meta.verify_jwt,
    status: meta.status,
    providerEntrypointPath: meta.entrypoint_path,
    providerEzbrSha256: meta.ezbr_sha256,
    contentType: body.contentType,
    artifactBytes: body.buffer.length,
    artifactSha256: sha256(body.buffer),
    entrypointSha256: readback.entrypointSha256,
    bundleSha256: readback.bundleSha256,
    configSha256: readback.configSha256,
    dependencies: readback.dependencies,
  }, null, 2));
  return { meta, buffer: body.buffer };
}

/** Racine de conservation neuve par test : aucun état ne fuit d'un test à l'autre. */
function freshRoot() {
  return mkdtempSync(join(tmpdir(), 'maximus-restore-'));
}

test('l artefact capturé est relu et son intégrité est contrôlée avant interprétation', () => {
  const root = freshRoot();
  seedCapture(root);
  const { seal, bytes } = loadCapturedArtifact(root, SLUG);
  assert.equal(seal.function, SLUG);
  assert.equal(bytes.length, seal.artifactBytes);
  assert.equal(sha256(bytes), seal.artifactSha256);
});

test('un artefact altéré depuis la capture est refusé, jamais reconditionné', () => {
  const root = freshRoot();
  seedCapture(root);
  const p = join(root, 'artifacts', `${SLUG}.multipart.bin`);
  const bytes = readFileSync(p);
  bytes[bytes.length - 3] = 0x21; // un octet changé suffit
  writeFileSync(p, bytes);
  assert.throws(() => loadCapturedArtifact(root, SLUG), /CAPTURE_BYTES_TAMPERED/);
});

test('un sceau absent n est pas remplacé par une valeur implicite', () => {
  const root = freshRoot();
  mkdirSync(join(root, 'artifacts'), { recursive: true });
  assert.throws(() => loadCapturedArtifact(root, SLUG), /CAPTURE_SEAL_MISSING/);
});

test('la préparation reconditionne et prouve l équivalence en mode PREPARED', () => {
  const root = freshRoot();
  seedCapture(root);
  const { preparation } = prepareFromCaptured(loadCapturedArtifact(root, SLUG));
  assert.equal(preparation.schemaVersion, RESTORE_PREPARATION_VERSION);
  assert.equal(preparation.state, 'PREPARED');
  assert.equal(preparation.equivalence.verdict, 'PASS');
  assert.deepEqual(preparation.equivalence.reasons, []);
  // L'empreinte de bundle reste celle de la capture : le reconditionnement ne l'altère pas.
  assert.equal(preparation.equivalence.recomputedBundleSha256, preparation.bundleSha256);
  assert.match(preparation.deployRequestDigest, /^[0-9a-f]{64}$/);
});

test('la préparation ne publie aucun contenu de source', () => {
  const root = freshRoot();
  seedCapture(root);
  const { preparation, deployRequest } = prepareFromCaptured(loadCapturedArtifact(root, SLUG));
  const published = JSON.stringify(preparation);
  assert.doesNotMatch(published, /REDACTED — source/, 'aucun contenu ne doit sortir du rapport');
  // La requête, elle, contient le source : c'est pourquoi elle n'est écrite que hors dépôt.
  assert.ok(deployRequest.files.some((f) => f.content.length > 0));
});

test('un sceau incohérent avec les octets est refusé au lieu d être moyenné', () => {
  const root = freshRoot();
  seedCapture(root);
  const sealPath = join(root, 'artifacts', `${SLUG}.seal.json`);
  const seal = JSON.parse(readFileSync(sealPath, 'utf8'));
  seal.bundleSha256 = 'b'.repeat(64);
  writeFileSync(sealPath, JSON.stringify(seal, null, 2));
  assert.throws(
    () => prepareFromCaptured(loadCapturedArtifact(root, SLUG)),
    /SEAL_BUNDLE_SHA256_MISMATCH/,
  );
});

// --- Étape 4 : relecture du projet restauré -------------------------------------------

function readbackFor(overrides = {}) {
  const meta = redactedMetadata(overrides.metadata ?? {});
  const body = redactedBody({ metadata: meta, files: overrides.files });
  const parsed = parseMultipartFunctionBody(body.buffer, body.contentType);
  return readbackFromProviderReads(
    { metadata: meta, body: parsed, requestedSlug: meta.slug },
    { projectRef: overrides.projectRef ?? 'disposable-project-ref-0001', fetchedAt: '2026-11-26T09:30:00Z' },
  );
}

test('une restauration identique passe : bundle, dépendances, entrypoint et verify_jwt', () => {
  const root = freshRoot();
  seedCapture(root);
  const { seal } = loadCapturedArtifact(root, SLUG);
  const verdict = verifyRestoredAgainstSeal(seal, readbackFor());
  assert.equal(verdict.verdict, 'PASS');
  assert.deepEqual(verdict.reasons, []);
  assert.equal(verdict.compared.restoreProjectRef, 'disposable-project-ref-0001');
});

test('une restauration dont verify_jwt a changé échoue', () => {
  const root = freshRoot();
  seedCapture(root);
  const { seal } = loadCapturedArtifact(root, SLUG);
  const verdict = verifyRestoredAgainstSeal(seal, readbackFor({ metadata: { verify_jwt: true } }));
  assert.equal(verdict.verdict, 'FAIL');
  assert.ok(verdict.reasons.includes('RESTORED_VERIFY_JWT_MISMATCH'));
});

test('une restauration dont une dépendance diffère échoue', () => {
  const root = freshRoot();
  seedCapture(root);
  const { seal } = loadCapturedArtifact(root, SLUG);
  const files = [
    { name: redactedMetadata().entrypoint_path, content: '// REDACTED — source de production non publiée (dépôt public)\nexport default serve(redactedHandler);\n' },
    { name: redactedMetadata().entrypoint_path.replace('index.ts', 'matcher.mjs'), content: '// contenu différent\n' },
    { name: redactedMetadata().entrypoint_path.replace('index.ts', '_shared/serviceKey.ts'), content: '// REDACTED — dépendance partagée non publiée\nexport const resolveKey = () => null;\n' },
  ];
  const verdict = verifyRestoredAgainstSeal(seal, readbackFor({ files }));
  assert.equal(verdict.verdict, 'FAIL');
  assert.ok(verdict.reasons.includes('RESTORED_DEPENDENCIES_MISMATCH'));
});

test('une restauration sur une autre fonction échoue', () => {
  const root = freshRoot();
  seedCapture(root);
  const { seal } = loadCapturedArtifact(root, SLUG);
  const verdict = verifyRestoredAgainstSeal(seal, { ...readbackFor(), slug: 'autre-fonction' });
  assert.equal(verdict.verdict, 'FAIL');
  assert.ok(verdict.reasons.includes('RESTORED_OTHER_FUNCTION'));
});

test('une relecture absente ne produit jamais PASS', () => {
  const root = freshRoot();
  seedCapture(root);
  const { seal } = loadCapturedArtifact(root, SLUG);
  const verdict = verifyRestoredAgainstSeal(seal, null);
  assert.equal(verdict.verdict, 'FAIL');
  assert.deepEqual(verdict.reasons, ['RESTORED_READBACK_MISSING']);
});

// --- Plan : l exercice de restauration n est plus refusé par la règle de rollback -------

test('le plan RESTORE_DRILL accepte le bundle observé, le plan ROLLBACK_EVIDENCE le refuse', () => {
  const bundle = 'c'.repeat(64);
  const common = {
    readback: { slug: SLUG, projectRef: 'p', bundleSha256: bundle },
    deployRequest: {},
    equivalence: { verdict: 'PASS' },
    custody: { holdsRestorableArtifact: true },
    target: { phase: 'PRE_MIGRATION', bundleSha256: bundle },
  };
  const drill = buildRestorePlan({ ...common, purpose: 'RESTORE_DRILL' });
  assert.equal(drill.state, 'PREPARED');
  assert.deepEqual(drill.blockers, []);

  const rollback = buildRestorePlan({ ...common, purpose: 'ROLLBACK_EVIDENCE' });
  assert.equal(rollback.state, 'BLOCKED');
  assert.ok(rollback.blockers.includes('ROLLBACK_TARGET_EQUALS_OBSERVED_BUNDLE'));
});

test('un exercice dont la cible n est pas l artefact capturé est bloqué', () => {
  const plan = buildRestorePlan({
    readback: { slug: SLUG, projectRef: 'p', bundleSha256: 'c'.repeat(64) },
    deployRequest: {},
    equivalence: { verdict: 'PASS' },
    custody: { holdsRestorableArtifact: true },
    target: { phase: 'PRE_MIGRATION', bundleSha256: 'd'.repeat(64) },
    purpose: 'RESTORE_DRILL',
  });
  assert.equal(plan.state, 'BLOCKED');
  assert.ok(plan.blockers.includes('RESTORE_DRILL_TARGET_NOT_OBSERVED_BUNDLE'));
});

test('un objet de plan inconnu est bloqué au lieu de retomber sur un défaut', () => {
  const plan = buildRestorePlan({
    readback: { slug: SLUG, projectRef: 'p', bundleSha256: 'c'.repeat(64) },
    deployRequest: {},
    equivalence: { verdict: 'PASS' },
    custody: { holdsRestorableArtifact: true },
    target: { phase: 'PRE_MIGRATION', bundleSha256: 'c'.repeat(64) },
    purpose: 'SOMETHING_ELSE',
  });
  assert.equal(plan.state, 'BLOCKED');
  assert.ok(plan.blockers.includes('RESTORE_PLAN_UNKNOWN_PURPOSE'));
  assert.deepEqual([...RESTORE_PLAN_PURPOSES], ['ROLLBACK_EVIDENCE', 'RESTORE_DRILL']);
});

test('le plan par défaut reste un plan de rollback, jamais un exercice', () => {
  const plan = buildRestorePlan({
    readback: { slug: SLUG, projectRef: 'p', bundleSha256: 'c'.repeat(64) },
    deployRequest: {},
    equivalence: { verdict: 'PASS' },
    custody: { holdsRestorableArtifact: true },
    target: { phase: 'PRE_MIGRATION', bundleSha256: 'c'.repeat(64) },
  });
  assert.equal(plan.purpose, 'ROLLBACK_EVIDENCE');
  assert.equal(plan.state, 'BLOCKED');
});

// --- Le plan doit citer des commandes réellement exécutables ---------------------------

test('chaque étape du plan porte une commande, et aucun outil cité n est inexistant', () => {
  const plan = buildRestorePlan({
    readback: { slug: SLUG, projectRef: 'p', bundleSha256: 'c'.repeat(64) },
    deployRequest: {},
    equivalence: { verdict: 'PASS' },
    custody: { holdsRestorableArtifact: true },
    target: { phase: 'PRE_MIGRATION', bundleSha256: 'c'.repeat(64) },
    purpose: 'RESTORE_DRILL',
  });
  for (const op of plan.operations) {
    assert.equal(typeof op.command, 'string', `étape ${op.step} sans commande`);
    assert.ok(op.command.length > 0);
    // Les scripts de dépôt cités doivent exister : un plan qui nomme un fichier absent
    // envoie l'opérateur vers un échec qu'aucun diagnostic ne couvre.
    for (const m of op.command.matchAll(/scripts\/security\/[\w.-]+\.mjs/g)) {
      assert.ok(existsSync(join(REPO_ROOT, m[0])), `script cité inexistant : ${m[0]}`);
    }
  }
});

test('le plan ne cite plus les drapeaux fantômes qui rendaient l étape 2 inexécutable', () => {
  const plan = buildRestorePlan({
    readback: { slug: SLUG, projectRef: 'p', bundleSha256: 'c'.repeat(64) },
    deployRequest: {},
    equivalence: { verdict: 'PASS' },
    custody: { holdsRestorableArtifact: true },
    target: { phase: 'PRE_MIGRATION', bundleSha256: 'c'.repeat(64) },
    purpose: 'RESTORE_DRILL',
  });
  const all = plan.operations.map((o) => `${o.tool} ${o.command}`).join('\n');
  assert.doesNotMatch(all, /--custody/);
  assert.doesNotMatch(all, /restoreProtocol\.mjs --/);
  assert.match(all, /prepareRestore\.mjs/);
});

// --- CLI de bout en bout ---------------------------------------------------------------

test('CLI : la préparation écrit un rapport hors dépôt et sort en 0', () => {
  const root = freshRoot();
  seedCapture(root);
  const out = execFileSync(process.execPath, [
    join(HERE, 'prepareRestore.mjs'),
    '--function', SLUG,
    '--target-project-ref', 'disposable-project-ref-0001',
  ], {
    env: { ...process.env, MAXIMUS_ROLLBACK_EVIDENCE_ROOT: root },
    encoding: 'utf8',
  });
  const report = JSON.parse(out);
  assert.equal(report.state, 'PREPARED');
  assert.equal(report.plan.purpose, 'RESTORE_DRILL');
  assert.equal(report.plan.state, 'PREPARED');
  assert.ok(existsSync(join(root, 'preparations', `${SLUG}.json`)));
  assert.doesNotMatch(out, /REDACTED — source/);
});

test('CLI : une racine de conservation dans le dépôt est refusée', () => {
  assert.throws(
    () => execFileSync(process.execPath, [
      join(HERE, 'prepareRestore.mjs'), '--function', SLUG,
      '--target-project-ref', 'x',
    ], {
      env: { ...process.env, MAXIMUS_ROLLBACK_EVIDENCE_ROOT: REPO_ROOT },
      encoding: 'utf8',
      stdio: 'pipe',
    }),
    (err) => /EVIDENCE_ROOT_INSIDE_REPO/.test(String(err.stderr)),
  );
});

test('CLI : la cible ne peut pas être le projet d origine', () => {
  const root = freshRoot();
  seedCapture(root);
  assert.throws(
    () => execFileSync(process.execPath, [
      join(HERE, 'prepareRestore.mjs'), '--function', SLUG,
      '--target-project-ref', 'ygvsddcpohsnaowofuwc',
    ], {
      env: { ...process.env, MAXIMUS_ROLLBACK_EVIDENCE_ROOT: root },
      encoding: 'utf8',
      stdio: 'pipe',
    }),
    (err) => /TARGET_IS_PRODUCTION_PROJECT/.test(String(err.stderr)),
  );
});

test('CLI : la requête de déploiement n est émise que hors dépôt et seulement si préparée', () => {
  const root = freshRoot();
  seedCapture(root);
  const out = execFileSync(process.execPath, [
    join(HERE, 'prepareRestore.mjs'), '--function', SLUG, '--emit-deploy-request',
  ], {
    env: { ...process.env, MAXIMUS_ROLLBACK_EVIDENCE_ROOT: root },
    encoding: 'utf8',
  });
  const res = JSON.parse(out);
  assert.equal(res.state, 'EMITTED');
  assert.match(res.deployRequestPath, new RegExp(`^${root.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
  assert.ok(existsSync(res.deployRequestPath));
  // Le rapport ne contient que des empreintes : le source est dans le fichier de requête.
  assert.doesNotMatch(out, /REDACTED — source/);
});

test('CLI : une fonction hors périmètre est refusée', () => {
  const root = freshRoot();
  assert.throws(
    () => execFileSync(process.execPath, [
      join(HERE, 'prepareRestore.mjs'), '--function', 'fonction-inconnue',
    ], {
      env: { ...process.env, MAXIMUS_ROLLBACK_EVIDENCE_ROOT: root },
      encoding: 'utf8',
      stdio: 'pipe',
    }),
    (err) => /Fonction hors périmètre/.test(String(err.stderr)),
  );
});
