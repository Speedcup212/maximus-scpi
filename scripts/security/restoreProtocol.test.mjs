import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDeployRequest,
  proveRepackEquivalence,
  buildRestorePlan,
  digestDeployRequest,
  deployPathToRegistryPath,
  bundleFingerprintFromRequest,
  DEPLOY_URL,
  DEPLOY_METHOD,
  RESTORE_PLAN_VERSION,
  REPACK_REFUSALS,
  EQUIVALENCE_FAILURES,
  authorizeRestoreTarget,
  AUTHORIZED_RESTORE_PROJECT_REFS,
  RESTORE_TARGET_REFUSALS,
} from './restoreProtocol.mjs';
import { PRODUCTION_PROJECT_REF } from './edgeFunctionDeploymentManifest.mjs';
import {
  parseMultipartFunctionBody,
  readbackFromProviderReads,
} from './collectReadback.mjs';
import {
  redactedMetadata,
  redactedBody,
  REDACTED_FILES_FOR_TEST,
} from './fixtures/providerFunctionBody.mjs';

const SLUG = 'scpi-certified-promote';

/** Bundle réel au format fournisseur, tel que le collecteur l'obtient. */
function fixture() {
  const meta = redactedMetadata();
  const body = redactedBody({ metadata: meta });
  const parsed = parseMultipartFunctionBody(body.buffer, body.contentType);
  const readback = readbackFromProviderReads(
    { metadata: meta, body: parsed, requestedSlug: meta.slug },
    { fetchedAt: '2026-11-25T00:30:00Z' },
  );
  return { meta, parsed, readback };
}

/** Reconditionnement + preuve, sur la fixture saine. */
function prepared() {
  const { meta, parsed, readback } = fixture();
  const repack = buildDeployRequest({
    metadata: { ...meta, projectRef: readback.projectRef },
    files: parsed.files,
  });
  const equivalence = proveRepackEquivalence({ readback, deployRequest: repack.request });
  return { meta, parsed, readback, repack, equivalence };
}

test('le corps GET n\'est PAS rejouable : les noms fournisseur ne sont pas des chemins de déploiement', () => {
  const { parsed } = fixture();
  // Les noms rendus par le fournisseur sont des URI temporaires absolues.
  for (const f of parsed.files) {
    assert.match(f.name, /^file:\/\/\/tmp\//);
  }
  const repack = buildDeployRequest({ metadata: redactedMetadata(), files: parsed.files });
  assert.equal(repack.ok, true);
  // …et aucun ne doit survivre dans la requête de déploiement.
  for (const f of repack.request.files) {
    assert.doesNotMatch(f.name, /^file:\/\//);
    assert.doesNotMatch(f.name, /^\//);
  }
});

test('le reconditionnement produit la forme exacte attendue par POST …/deploy', () => {
  const { repack } = prepared();
  assert.equal(repack.ok, true);
  assert.deepEqual(repack.reasons, []);
  assert.equal(repack.request.method, DEPLOY_METHOD);
  assert.equal(repack.request.method, 'POST');
  assert.match(repack.request.urlTemplate, /\/v1\/projects\/\{ref\}\/functions\/deploy\?slug=\{slug\}$/);
  assert.equal(repack.request.urlTemplate, DEPLOY_URL);
  // metadata.name et metadata.entrypoint_path sont les deux champs exigés par le fournisseur.
  assert.equal(repack.request.metadata.name, SLUG);
  assert.equal(repack.request.metadata.entrypoint_path, 'index.ts');
  // verify_jwt est transporté explicitement : ce n'est pas déductible du contenu.
  assert.equal(repack.request.metadata.verify_jwt, false);
  assert.deepEqual(
    repack.request.files.map((f) => f.name),
    ['_shared/serviceKey.ts', 'index.ts', 'matcher.mjs'],
  );
});

test('l\'entrypoint de déploiement est relatif, la dépendance locale reste dans la fonction', () => {
  const { repack } = prepared();
  assert.equal(repack.request.metadata.entrypoint_path, 'index.ts');
  // Une dépendance locale appartient à la fonction : elle est déployée à sa racine.
  assert.ok(repack.request.files.some((f) => f.name === 'matcher.mjs'));
  // Une dépendance partagée garde son chemin _shared.
  assert.ok(repack.request.files.some((f) => f.name === '_shared/serviceKey.ts'));
});

test('l\'équivalence est prouvée : chemins, octets et configuration', () => {
  const { equivalence } = prepared();
  assert.equal(equivalence.verdict, 'PASS');
  assert.deepEqual(equivalence.reasons, []);
  assert.ok(equivalence.files.length >= 3);
  for (const f of equivalence.files) assert.equal(f.match, true);
});

test('l\'empreinte agrégée du bundle reconditionné égale celle du readback', () => {
  const { equivalence, readback, repack } = prepared();
  assert.equal(equivalence.recomputedBundleSha256, readback.bundleSha256);
  // Et elle est stable si on la recalcule indépendamment.
  assert.equal(bundleFingerprintFromRequest(repack.request.files, SLUG), readback.bundleSha256);
});

// --- Mutations : chaque garde doit être réellement capable d'échouer -------------------

test('mutation : un octet changé est détecté', () => {
  const { readback, repack } = prepared();
  const tampered = {
    ...repack.request,
    files: repack.request.files.map((f) => (
      f.name === 'matcher.mjs' ? { ...f, sha256: 'f'.repeat(64) } : f
    )),
  };
  const eq = proveRepackEquivalence({ readback, deployRequest: tampered });
  assert.equal(eq.verdict, 'FAIL');
  assert.ok(eq.reasons.some((r) => r.startsWith('EQUIVALENCE_BYTES_CHANGED:scpi-certified-promote/matcher.mjs')));
});

test('mutation : un fichier manquant est détecté', () => {
  const { readback, repack } = prepared();
  const tampered = {
    ...repack.request,
    files: repack.request.files.filter((f) => f.name !== '_shared/serviceKey.ts'),
  };
  const eq = proveRepackEquivalence({ readback, deployRequest: tampered });
  assert.equal(eq.verdict, 'FAIL');
  assert.ok(eq.reasons.includes('EQUIVALENCE_PATH_SET_MISMATCH'));
});

test('mutation : un fichier en trop est détecté', () => {
  const { readback, repack } = prepared();
  const tampered = {
    ...repack.request,
    files: [...repack.request.files, { name: 'extra.ts', sha256: 'e'.repeat(64), bytes: 1 }],
  };
  const eq = proveRepackEquivalence({ readback, deployRequest: tampered });
  assert.equal(eq.verdict, 'FAIL');
  assert.ok(eq.reasons.includes('EQUIVALENCE_PATH_SET_MISMATCH'));
});

test('mutation : une configuration verify_jwt différente est détectée', () => {
  const { readback, repack } = prepared();
  const tampered = {
    ...repack.request,
    metadata: { ...repack.request.metadata, verify_jwt: true },
  };
  const eq = proveRepackEquivalence({ readback, deployRequest: tampered });
  assert.equal(eq.verdict, 'FAIL');
  assert.ok(eq.reasons.includes('EQUIVALENCE_CONFIG_CHANGED'));
});

test('mutation : une configuration verify_jwt absente n\'est pas une valeur par défaut acceptable', () => {
  const { readback, repack } = prepared();
  const { verify_jwt, ...withoutVerify } = repack.request.metadata;
  const eq = proveRepackEquivalence({
    readback,
    deployRequest: { ...repack.request, metadata: withoutVerify },
  });
  assert.equal(eq.verdict, 'FAIL');
  assert.ok(eq.reasons.includes('EQUIVALENCE_CONFIG_CHANGED'));
});

test('mutation : un entrypoint de déploiement préfixé par le slug est refusé', () => {
  const { readback, repack } = prepared();
  const eq = proveRepackEquivalence({
    readback,
    deployRequest: {
      ...repack.request,
      metadata: { ...repack.request.metadata, entrypoint_path: `${SLUG}/index.ts` },
    },
  });
  assert.equal(eq.verdict, 'FAIL');
  assert.ok(eq.reasons.includes('EQUIVALENCE_ENTRYPOINT_MISMATCH'));
});

test('mutation : le reconditionnement refuse des métadonnées sans verify_jwt', () => {
  const { parsed } = fixture();
  const { verify_jwt, ...meta } = redactedMetadata();
  const repack = buildDeployRequest({ metadata: meta, files: parsed.files });
  assert.equal(repack.ok, false);
  assert.deepEqual(repack.reasons, ['REPACK_WITHOUT_VERIFY_JWT']);
});

test('mutation : le reconditionnement refuse une import map non transportée', () => {
  const { parsed } = fixture();
  const repack = buildDeployRequest({
    metadata: { ...redactedMetadata(), import_map_path: 'file:///tmp/x/import_map.json' },
    files: parsed.files,
  });
  assert.equal(repack.ok, false);
  assert.deepEqual(repack.reasons, ['REPACK_IMPORT_MAP_UNSUPPORTED']);
});

test('mutation : le reconditionnement refuse un fichier vide', () => {
  const files = [
    ...REDACTED_FILES_FOR_TEST.slice(1),
    { name: REDACTED_FILES_FOR_TEST[0].name, content: '' },
  ];
  const repack = buildDeployRequest({ metadata: redactedMetadata(), files });
  assert.equal(repack.ok, false);
  assert.ok(repack.reasons.some((r) => r.startsWith('REPACK_EMPTY_FILE:')));
});

test('mutation : le reconditionnement refuse une métadonnée absente', () => {
  const repack = buildDeployRequest({ metadata: null, files: [] });
  assert.equal(repack.ok, false);
  assert.deepEqual(repack.reasons, ['REPACK_WITHOUT_METADATA']);
});

test('une requête absente ou un readback absent ne produit jamais PASS', () => {
  const { readback, repack } = prepared();
  assert.deepEqual(
    proveRepackEquivalence({ readback, deployRequest: null }),
    { verdict: 'FAIL', reasons: ['EQUIVALENCE_WITHOUT_DEPLOY_REQUEST'], files: [] },
  );
  assert.deepEqual(
    proveRepackEquivalence({ readback: null, deployRequest: repack.request }),
    { verdict: 'FAIL', reasons: ['EQUIVALENCE_WITHOUT_ORIGINAL_READBACK'], files: [] },
  );
});

// --- Plan de restauration : « préparé » n'est jamais « prêt » -------------------------

test('le plan distingue explicitement PREPARED de READY', () => {
  const { readback, repack, equivalence } = prepared();
  const plan = buildRestorePlan({
    readback,
    deployRequest: repack.request,
    equivalence,
    custody: { holdsRestorableArtifact: true },
    target: { phase: 'PRE_MIGRATION', bundleSha256: 'a'.repeat(64) },
  });
  assert.equal(plan.schemaVersion, RESTORE_PLAN_VERSION);
  assert.equal(plan.state, 'PREPARED');
  // Ce module ne peut structurellement pas produire READY : la restauration reste à exercer.
  assert.notEqual(plan.state, 'READY');
  assert.deepEqual(plan.blockers, []);
  // Chaque étape exécutable est distincte : capture, reconditionnement, déploiement non-prod,
  // relecture de l'environnement restauré, puis attestation indépendante.
  assert.deepEqual(plan.operations.map((o) => o.kind), [
    'read-only', 'offline', 'write-non-prod', 'proof', 'independent-proof',
  ]);
  assert.deepEqual(plan.operations.map((o) => o.step), [1, 2, 3, 4, 5]);
  assert.equal(plan.providerConstraints.multipartGetNotReplayable, true);
});

test('le plan reste BLOCKED sans équivalence prouvée', () => {
  const { readback, repack, equivalence } = prepared();
  const plan = buildRestorePlan({
    readback,
    deployRequest: repack.request,
    equivalence: { verdict: 'FAIL', reasons: ['x'] },
    custody: { holdsRestorableArtifact: true },
    target: { phase: 'PRE_MIGRATION', bundleSha256: 'a'.repeat(64) },
  });
  assert.equal(plan.state, 'BLOCKED');
  assert.ok(plan.blockers.includes('EQUIVALENCE_NOT_PROVEN'));
});

test('le plan reste BLOCKED si la cible de rollback est le bundle déjà déployé', () => {
  const { readback, repack, equivalence } = prepared();
  const plan = buildRestorePlan({
    readback,
    deployRequest: repack.request,
    equivalence,
    custody: { holdsRestorableArtifact: true },
    target: { phase: 'PRE_MIGRATION', bundleSha256: readback.bundleSha256 },
  });
  assert.equal(plan.state, 'BLOCKED');
  assert.ok(plan.blockers.includes('ROLLBACK_TARGET_EQUALS_OBSERVED_BUNDLE'));
});

test('le plan reste BLOCKED sans garde d\'artefact restaurable', () => {
  const { readback, repack, equivalence } = prepared();
  const plan = buildRestorePlan({
    readback,
    deployRequest: repack.request,
    equivalence,
    custody: { holdsRestorableArtifact: false },
    target: { phase: 'PRE_MIGRATION', bundleSha256: 'a'.repeat(64) },
  });
  assert.ok(plan.blockers.includes('MISSING_custody'));
});

test('le digest de requête est stable et change si un octet change', () => {
  const { repack } = prepared();
  const d1 = digestDeployRequest(repack.request);
  const d2 = digestDeployRequest(JSON.parse(JSON.stringify(repack.request)));
  assert.equal(d1, d2);
  const tampered = {
    ...repack.request,
    files: repack.request.files.map((f) => (
      f.name === 'index.ts' ? { ...f, sha256: '0'.repeat(64) } : f
    )),
  };
  assert.notEqual(digestDeployRequest(tampered), d1);
});

test('le digest ne publie aucun contenu de source', () => {
  const { repack } = prepared();
  const canonical = JSON.stringify(repack.request.files.map((f) => ({
    name: f.name, sha256: f.sha256, bytes: f.bytes,
  })));
  for (const f of repack.request.files) {
    assert.equal(canonical.includes(f.content), false);
  }
});

test('deployPathToRegistryPath sépare dépendance locale et dépendance partagée', () => {
  assert.equal(deployPathToRegistryPath('index.ts', SLUG), `${SLUG}/index.ts`);
  assert.equal(deployPathToRegistryPath('matcher.mjs', SLUG), `${SLUG}/matcher.mjs`);
  assert.equal(deployPathToRegistryPath('_shared/serviceKey.ts', SLUG), '_shared/serviceKey.ts');
  // Un chemin déjà exprimé dans la convention du registre n'est pas re-préfixé.
  assert.equal(deployPathToRegistryPath(`${SLUG}/index.ts`, SLUG), `${SLUG}/index.ts`);
});

test('les codes de refus et d\'échec sont nommés et exportés', () => {
  assert.ok(REPACK_REFUSALS.includes('REPACK_WITHOUT_VERIFY_JWT'));
  assert.ok(EQUIVALENCE_FAILURES.includes('EQUIVALENCE_CONFIG_CHANGED'));
  assert.ok(EQUIVALENCE_FAILURES.includes('EQUIVALENCE_BYTES_CHANGED'));
  // Chaque refus de cible est citable tel quel dans un journal d'exploitation.
  assert.deepEqual(
    [...RESTORE_TARGET_REFUSALS],
    [
      'RESTORE_TARGET_MISSING',
      'RESTORE_TARGET_IS_PRODUCTION_PROJECT',
      'RESTORE_TARGET_IS_SOURCE_PROJECT',
      'RESTORE_TARGET_NOT_AUTHORIZED',
    ],
  );
});

// --- Autorisation de la cible d'exercice (défaut du lot 14) ---------------------------

test('aucune destination hors production n est autorisée par défaut dans le dépôt', () => {
  // L'inventaire du 26/11 établit qu'aucun projet MaximusSCPI hors production n'existe. La
  // liste est donc vide, et cette vacuité est le comportement correct — pas un oubli.
  assert.deepEqual([...AUTHORIZED_RESTORE_PROJECT_REFS], []);
});

test('un identifiant fourni en argument n est jamais une autorisation', () => {
  const verdict = authorizeRestoreTarget({
    projectRef: 'un-projet-invente',
    sourceProjectRef: 'source-ref',
    productionProjectRef: 'prod-ref',
  });
  assert.equal(verdict.ok, false);
  assert.deepEqual(verdict.reasons, ['RESTORE_TARGET_NOT_AUTHORIZED']);
});

test('la production et le projet d origine sont refusés nommément, avant la liste', () => {
  const production = authorizeRestoreTarget({
    projectRef: 'prod-ref',
    sourceProjectRef: 'prod-ref',
    productionProjectRef: 'prod-ref',
    authorizedProjectRefs: ['prod-ref'],
  });
  assert.equal(production.ok, false);
  // Un projet figurant dans la liste ne devient pas acceptable pour autant : les deux refus
  // absolus s'appliquent d'abord. C'est ce qui interdit de « débloquer » en s'ajoutant.
  assert.ok(production.reasons.includes('RESTORE_TARGET_IS_PRODUCTION_PROJECT'));
  assert.ok(production.reasons.includes('RESTORE_TARGET_IS_SOURCE_PROJECT'));
});

test('une cible absente n est pas remplacée par un défaut implicite', () => {
  assert.deepEqual(
    authorizeRestoreTarget({ productionProjectRef: 'prod-ref' }),
    { ok: false, reasons: ['RESTORE_TARGET_MISSING'] },
  );
  assert.deepEqual(
    authorizeRestoreTarget({ projectRef: '   ', productionProjectRef: 'prod-ref' }),
    { ok: false, reasons: ['RESTORE_TARGET_MISSING'] },
  );
});

test('une cible explicitement autorisée passe, et la production reste le défaut du contrôle', () => {
  const ok = authorizeRestoreTarget({
    projectRef: 'disposable-project-ref-0001',
    sourceProjectRef: 'source-ref',
    productionProjectRef: 'prod-ref',
    authorizedProjectRefs: ['disposable-project-ref-0001'],
  });
  assert.deepEqual(ok, { ok: true, reasons: [] });

  // Sans `productionProjectRef`, le contrôle retombe sur la production du dépôt : il ne se
  // désarme pas quand l'appelant omet le champ (`fail-closed`).
  const failClosed = authorizeRestoreTarget({
    projectRef: PRODUCTION_PROJECT_REF,
    authorizedProjectRefs: [PRODUCTION_PROJECT_REF],
  });
  assert.ok(failClosed.reasons.includes('RESTORE_TARGET_IS_PRODUCTION_PROJECT'));
});

test('un plan RESTORE_DRILL vers un projet non autorisé est bloqué, pas seulement journalisé', () => {
  const bundle = 'c'.repeat(64);
  const plan = buildRestorePlan({
    readback: { slug: SLUG, projectRef: 'p', bundleSha256: bundle },
    deployRequest: {},
    equivalence: { verdict: 'PASS' },
    custody: { holdsRestorableArtifact: true },
    target: { phase: 'PRE_MIGRATION', bundleSha256: bundle, projectRef: 'un-projet-invente' },
    purpose: 'RESTORE_DRILL',
    productionProjectRef: PRODUCTION_PROJECT_REF,
  });
  assert.equal(plan.state, 'BLOCKED');
  assert.ok(plan.blockers.includes('RESTORE_TARGET_NOT_AUTHORIZED'));
  assert.equal(plan.targetAuthorization.ok, false);
  assert.equal(plan.targetProjectRef, 'un-projet-invente');
});

test('un plan RESTORE_DRILL sans destination nommée est bloqué', () => {
  const bundle = 'c'.repeat(64);
  const plan = buildRestorePlan({
    readback: { slug: SLUG, projectRef: 'p', bundleSha256: bundle },
    deployRequest: {},
    equivalence: { verdict: 'PASS' },
    custody: { holdsRestorableArtifact: true },
    target: { phase: 'PRE_MIGRATION', bundleSha256: bundle },
    purpose: 'RESTORE_DRILL',
    productionProjectRef: PRODUCTION_PROJECT_REF,
  });
  assert.equal(plan.state, 'BLOCKED');
  assert.ok(plan.blockers.includes('RESTORE_TARGET_MISSING'));
});
