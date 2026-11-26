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
  digestDeployRequest,
  stampDeployRequest,
} from './restoreProtocol.mjs';
import {
  redactedMetadata,
  redactedBody,
} from './fixtures/providerFunctionBody.mjs';
import {
  parseMultipartFunctionBody,
  readbackFromProviderReads,
} from './collectReadback.mjs';
import { PRODUCTION_PROJECT_REF } from './edgeFunctionDeploymentManifest.mjs';

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

// Projet d'exercice utilisé par les tests : jamais la production, et explicitement autorisé
// dans l'appel — la liste réelle du dépôt reste vide (aucun projet non-prod approuvé à ce jour).
const DRILL_REF = 'disposable-project-ref-0001';
const TEST_AUTHORIZED = [DRILL_REF];

function readbackFor(overrides = {}) {
  const meta = redactedMetadata(overrides.metadata ?? {});
  const body = redactedBody({ metadata: meta, files: overrides.files });
  const parsed = parseMultipartFunctionBody(body.buffer, body.contentType);
  return readbackFromProviderReads(
    { metadata: meta, body: parsed, requestedSlug: meta.slug },
    { projectRef: overrides.projectRef ?? DRILL_REF, fetchedAt: '2026-11-26T09:30:00Z' },
  );
}

/** Cible de test : projet d'exercice autorisé, production déclarée explicitement. */
const drillTarget = (overrides = {}) => ({
  expectedProjectRef: DRILL_REF,
  productionProjectRef: PRODUCTION_PROJECT_REF,
  authorizedProjectRefs: TEST_AUTHORIZED,
  ...overrides,
});

test('une restauration identique passe : bundle, dépendances, entrypoint et verify_jwt', () => {
  const root = freshRoot();
  seedCapture(root);
  const { seal } = loadCapturedArtifact(root, SLUG);
  const verdict = verifyRestoredAgainstSeal(seal, readbackFor(), drillTarget());
  assert.equal(verdict.verdict, 'PASS');
  assert.deepEqual(verdict.reasons, []);
  assert.equal(verdict.compared.restoreProjectRef, DRILL_REF);
  // Un PASS de comparaison n'est pas une preuve d'exercice.
  assert.equal(verdict.exercisedProof, false);
});

test('une restauration dont verify_jwt a changé échoue', () => {
  const root = freshRoot();
  seedCapture(root);
  const { seal } = loadCapturedArtifact(root, SLUG);
  const verdict = verifyRestoredAgainstSeal(
    seal,
    readbackFor({ metadata: { verify_jwt: true } }),
    drillTarget(),
  );
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
  const verdict = verifyRestoredAgainstSeal(seal, readbackFor({ files }), drillTarget());
  assert.equal(verdict.verdict, 'FAIL');
  assert.ok(verdict.reasons.includes('RESTORED_DEPENDENCIES_MISMATCH'));
});

test('une restauration sur une autre fonction échoue', () => {
  const root = freshRoot();
  seedCapture(root);
  const { seal } = loadCapturedArtifact(root, SLUG);
  const verdict = verifyRestoredAgainstSeal(
    seal,
    { ...readbackFor(), slug: 'autre-fonction' },
    drillTarget(),
  );
  assert.equal(verdict.verdict, 'FAIL');
  assert.ok(verdict.reasons.includes('RESTORED_OTHER_FUNCTION'));
});

test('une relecture absente ne produit jamais PASS', () => {
  const root = freshRoot();
  seedCapture(root);
  const { seal } = loadCapturedArtifact(root, SLUG);
  const verdict = verifyRestoredAgainstSeal(seal, null, drillTarget());
  assert.equal(verdict.verdict, 'FAIL');
  assert.deepEqual(verdict.reasons, ['RESTORED_READBACK_MISSING']);
  assert.equal(verdict.contentComparison, 'NOT_ATTEMPTED');
});

// --- Défaut du lot 14 : relire la production ne prouve aucune restauration -------------

test('un faux PASS sur production est rejeté : sans déploiement, aucun PASS n est possible', () => {
  const root = freshRoot();
  seedCapture(root);
  const { seal } = loadCapturedArtifact(root, SLUG);
  // La relecture est celle de la production : c'est le bundle dont le sceau a été pris, donc
  // TOUS les champs de contenu sont identiques par construction.
  const productionReadback = readbackFor({ projectRef: PRODUCTION_PROJECT_REF });
  assert.equal(productionReadback.bundleSha256, seal.bundleSha256, 'le contenu est bien identique');

  const verdict = verifyRestoredAgainstSeal(seal, productionReadback, drillTarget({
    expectedProjectRef: PRODUCTION_PROJECT_REF,
  }));
  assert.equal(verdict.verdict, 'FAIL');
  assert.ok(verdict.reasons.includes('RESTORE_TARGET_IS_PRODUCTION_PROJECT'));
  // Le contenu n'a même pas été comparé : un PASS de contenu serait ici trompeur.
  assert.equal(verdict.contentComparison, 'NOT_ATTEMPTED');
});

test('une cible non autorisée est refusée même si son contenu est identique au sceau', () => {
  const root = freshRoot();
  seedCapture(root);
  const { seal } = loadCapturedArtifact(root, SLUG);
  const readback = readbackFor({ projectRef: 'projet-jamais-approuve' });
  const verdict = verifyRestoredAgainstSeal(seal, readback, drillTarget({
    expectedProjectRef: 'projet-jamais-approuve',
  }));
  assert.equal(verdict.verdict, 'FAIL');
  assert.ok(verdict.reasons.includes('RESTORE_TARGET_NOT_AUTHORIZED'));
});

test('le projet réellement lu doit être celui annoncé, sinon le verdict échoue', () => {
  const root = freshRoot();
  seedCapture(root);
  const { seal } = loadCapturedArtifact(root, SLUG);
  // Le fournisseur a répondu pour un autre projet que celui demandé : chaque projet pris
  // isolément serait autorisé, mais la relecture ne porte pas sur la cible de l'exercice.
  const readback = readbackFor({ projectRef: 'disposable-project-ref-0002' });
  const verdict = verifyRestoredAgainstSeal(seal, readback, drillTarget({
    expectedProjectRef: DRILL_REF,
    authorizedProjectRefs: [DRILL_REF, 'disposable-project-ref-0002'],
  }));
  assert.equal(verdict.verdict, 'FAIL');
  assert.ok(verdict.reasons.includes('RESTORED_PROJECT_REF_MISMATCH'));
});

test('une version fournisseur différente est tracée, jamais comparée à l identique', () => {
  const root = freshRoot();
  seedCapture(root);
  const { seal } = loadCapturedArtifact(root, SLUG);
  // Un redéploiement crée une version fournisseur neuve sans changer les octets : l'exiger
  // égale ferait échouer tout exercice valide, l'ignorer la rendrait invisible.
  const verdict = verifyRestoredAgainstSeal(
    seal,
    readbackFor({ metadata: { version: 13 } }),
    drillTarget(),
  );
  assert.equal(verdict.verdict, 'PASS');
  assert.equal(verdict.versionTrace.sealVersion, 12);
  assert.equal(verdict.versionTrace.restoredVersion, 13);
  assert.equal(verdict.versionTrace.differs, true);
});

// --- Plan : l exercice de restauration n est plus refusé par la règle de rollback -------

test('le plan RESTORE_DRILL accepte le bundle observé, le plan ROLLBACK_EVIDENCE le refuse', () => {
  const bundle = 'c'.repeat(64);
  const common = {
    readback: { slug: SLUG, projectRef: 'p', bundleSha256: bundle },
    deployRequest: {},
    equivalence: { verdict: 'PASS' },
    custody: { holdsRestorableArtifact: true },
    target: { phase: 'PRE_MIGRATION', bundleSha256: bundle, projectRef: DRILL_REF },
    productionProjectRef: PRODUCTION_PROJECT_REF,
    authorizedRestoreProjectRefs: TEST_AUTHORIZED,
  };
  const drill = buildRestorePlan({ ...common, purpose: 'RESTORE_DRILL' });
  assert.equal(drill.state, 'PREPARED');
  assert.deepEqual(drill.blockers, []);
  assert.equal(drill.targetAuthorization.ok, true);

  // Le plan de rollback ne déploie vers aucun projet : l'absence de destination autorisée
  // ne le bloque pas, et il reste bloqué pour sa propre raison.
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

test('CLI : aucune destination n est autorisée, la préparation refuse donc de réussir', () => {
  const root = freshRoot();
  seedCapture(root);
  // `AUTHORIZED_RESTORE_PROJECT_REFS` est vide dans le dépôt : aucun projet hors production
  // n'a été approuvé. Le CLI doit donc sortir en 1 et nommer la raison, plutôt que de
  // produire un rapport « préparé » vers un projet que personne n'a autorisé.
  assert.throws(
    () => execFileSync(process.execPath, [
      join(HERE, 'prepareRestore.mjs'),
      '--function', SLUG,
      '--target-project-ref', 'disposable-project-ref-0001',
    ], {
      env: { ...process.env, MAXIMUS_ROLLBACK_EVIDENCE_ROOT: root },
      encoding: 'utf8',
      stdio: 'pipe',
    }),
    (err) => /RESTORE_TARGET_NOT_AUTHORIZED/.test(String(err.stderr)),
  );
});

test('CLI : le reconditionnement reste prouvé même quand la destination manque', () => {
  const root = freshRoot();
  seedCapture(root);
  // Le blocage CLI porte sur la **destination**, pas sur les octets : le reconditionnement
  // reste un fait vérifiable, et c'est ce qui permettra de l'exercer dès qu'un projet sera
  // autorisé. Le CLI, lui, refuse avant d'écrire quoi que ce soit.
  const { preparation } = prepareFromCaptured(loadCapturedArtifact(root, SLUG));
  assert.equal(preparation.state, 'PREPARED');
  assert.equal(preparation.equivalence.verdict, 'PASS');

  const plan = buildRestorePlan({
    readback: {
      slug: SLUG,
      projectRef: preparation.sourceProjectRef,
      bundleSha256: preparation.bundleSha256,
    },
    deployRequest: {},
    equivalence: preparation.equivalence,
    custody: { holdsRestorableArtifact: true },
    target: {
      phase: 'PRE_MIGRATION',
      bundleSha256: preparation.bundleSha256,
      projectRef: 'disposable-project-ref-0001',
    },
    purpose: 'RESTORE_DRILL',
    productionProjectRef: PRODUCTION_PROJECT_REF,
  });
  assert.equal(plan.state, 'BLOCKED');
  assert.ok(plan.blockers.includes('RESTORE_TARGET_NOT_AUTHORIZED'));
  assert.equal(plan.targetAuthorization.ok, false);
});

test('CLI : une préparation refusée n écrit aucun rapport', () => {
  const root = freshRoot();
  seedCapture(root);
  assert.throws(
    () => execFileSync(process.execPath, [
      join(HERE, 'prepareRestore.mjs'), '--function', SLUG,
      '--target-project-ref', 'disposable-project-ref-0001',
    ], {
      env: { ...process.env, MAXIMUS_ROLLBACK_EVIDENCE_ROOT: root },
      encoding: 'utf8',
      stdio: 'pipe',
    }),
    (err) => /Cible refusée/.test(String(err.stderr)),
  );
  // Le refus intervient avant l'écriture : aucun rapport réutilisable ne subsiste.
  assert.equal(existsSync(join(root, 'preparations', `${SLUG}.json`)), false);
});

test('CLI : --verify-restored refuse la production avant toute lecture fournisseur', () => {
  const root = freshRoot();
  // Aucun artefact n'est semé et aucun jeton n'est fourni : si le CLI atteignait la lecture,
  // il échouerait sur `CAPTURE_SEAL_MISSING`, pas sur la cible. Le refus de cible doit donc
  // intervenir en premier — une relecture de la production ne doit jamais être tentée.
  assert.throws(
    () => execFileSync(process.execPath, [
      join(HERE, 'prepareRestore.mjs'),
      '--function', SLUG,
      '--restored-project-ref', PRODUCTION_PROJECT_REF,
      '--verify-restored',
    ], {
      env: { ...process.env, MAXIMUS_ROLLBACK_EVIDENCE_ROOT: root, SUPABASE_ACCESS_TOKEN: '' },
      encoding: 'utf8',
      stdio: 'pipe',
    }),
    (err) => {
      const stderr = String(err.stderr);
      assert.match(stderr, /RESTORE_TARGET_IS_PRODUCTION_PROJECT/);
      assert.doesNotMatch(stderr, /CAPTURE_SEAL_MISSING/, 'la lecture a été tentée');
      return true;
    },
  );
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
      '--target-project-ref', PRODUCTION_PROJECT_REF,
    ], {
      env: { ...process.env, MAXIMUS_ROLLBACK_EVIDENCE_ROOT: root },
      encoding: 'utf8',
      stdio: 'pipe',
    }),
    (err) => {
      const stderr = String(err.stderr);
      assert.match(stderr, /RESTORE_TARGET_IS_PRODUCTION_PROJECT/);
      // Le projet d'origine de la capture est aussi refusé nommément, pas seulement la
      // constante de production : la règle porte sur les deux.
      assert.match(stderr, /RESTORE_TARGET_IS_SOURCE_PROJECT/);
      return true;
    },
  );
});

test('CLI : la requête n est pas émise vers la production ni vers un projet non autorisé', () => {
  const root = freshRoot();
  seedCapture(root);
  // Sans destination autorisée, l'émission doit échouer : c'est le fichier que l'opérateur
  // envoie réellement, donc celui qui ne doit jamais nommer un projet non approuvé.
  for (const ref of [PRODUCTION_PROJECT_REF, 'un-projet-invente']) {
    assert.throws(
      () => execFileSync(process.execPath, [
        join(HERE, 'prepareRestore.mjs'), '--function', SLUG,
        '--emit-deploy-request', '--target-project-ref', ref,
      ], {
        env: { ...process.env, MAXIMUS_ROLLBACK_EVIDENCE_ROOT: root },
        encoding: 'utf8',
        stdio: 'pipe',
      }),
      (err) => /Requête non émise/.test(String(err.stderr)),
    );
  }
  // Rien n'a été écrit : une requête refusée ne laisse pas de fichier réutilisable.
  assert.equal(existsSync(join(root, 'deploy-requests', `${SLUG}.deploy-request.json`)), false);
});

test('CLI : une requête émise ne nomme jamais la production et publie son digest', () => {
  const root = freshRoot();
  seedCapture(root);
  const { preparation, deployRequest } = prepareFromCaptured(loadCapturedArtifact(root, SLUG));

  // Le reconditionnement ne décide d'aucune destination : c'est ce qui empêche le fichier de
  // requête de nommer la production par recopie du projet de capture.
  assert.equal(deployRequest.projectRef, null);

  // L'estampillage est une fonction pure : le test l'exerce directement, sans variable
  // d'environnement capable d'élargir l'autorisation en exécution réelle.
  const stamped = stampDeployRequest(deployRequest, DRILL_REF);
  assert.equal(stamped.projectRef, DRILL_REF);
  assert.match(stamped.urlTemplate, new RegExp(DRILL_REF));
  assert.doesNotMatch(
    JSON.stringify({ ...stamped, files: undefined }),
    new RegExp(PRODUCTION_PROJECT_REF),
  );
  // Le digest lie la destination : changer le projet change l'empreinte.
  assert.notEqual(digestDeployRequest(stamped), digestDeployRequest(deployRequest));
  assert.equal(digestDeployRequest(stamped), digestDeployRequest(stampDeployRequest(deployRequest, DRILL_REF)));
  // Le rapport de préparation ne publie aucun contenu de source.
  assert.doesNotMatch(JSON.stringify(preparation), /REDACTED — source/);
});

test('le digest du plan préparé égale celui de la requête émise pour la même cible', () => {
  const root = freshRoot();
  seedCapture(root);
  const { preparation, deployRequest } = prepareFromCaptured(loadCapturedArtifact(root, SLUG));

  const plan = buildRestorePlan({
    readback: {
      slug: SLUG,
      projectRef: preparation.sourceProjectRef,
      bundleSha256: preparation.bundleSha256,
    },
    deployRequest,
    equivalence: preparation.equivalence,
    custody: { holdsRestorableArtifact: true },
    target: {
      phase: 'PRE_MIGRATION',
      bundleSha256: preparation.bundleSha256,
      projectRef: DRILL_REF,
    },
    purpose: 'RESTORE_DRILL',
    productionProjectRef: PRODUCTION_PROJECT_REF,
    authorizedRestoreProjectRefs: TEST_AUTHORIZED,
  });
  assert.equal(plan.state, 'PREPARED');
  // C'est l'égalité que l'opérateur vérifie entre l'étape B (plan) et l'étape C (émission).
  // Elle ne tient que parce que le plan estampille lui aussi sa cible avant de hacher.
  assert.equal(
    plan.deployRequestDigest,
    digestDeployRequest(stampDeployRequest(deployRequest, DRILL_REF)),
  );
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
