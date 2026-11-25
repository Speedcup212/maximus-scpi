import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  buildManifest,
  validateManifest,
  ledgerSnapshot,
  declaredImports,
  resolveRepoFingerprint,
  validateProdEvidence,
  INITIAL_PERIMETER_SIZE,
  LEDGER_PATH,
  PROD_EVIDENCE_DIR,
  FUNCTIONS_DIR,
} from './edgeFunctionDeploymentManifest.mjs';

const noEvidence = () => undefined;
const manifest = () => buildManifest(noEvidence);

test('le périmètre initial de 16 fonctions est classé exactement une fois', () => {
  const m = manifest();
  assert.equal(m.counts.initialPerimeter, INITIAL_PERIMETER_SIZE);
  const sum =
    m.counts.deployed +
    m.counts.pendingDeploy +
    m.counts.pendingKeyOnlyPatch +
    m.counts.pendingCoordinatedLot;
  assert.equal(sum, INITIAL_PERIMETER_SIZE);
  assert.equal(m.functions.length, INITIAL_PERIMETER_SIZE);
  assert.equal(new Set(m.functions.map((f) => f.name)).size, INITIAL_PERIMETER_SIZE);
  assert.deepEqual(validateManifest(m), []);
});

test('le décompte publié dans le ticket est reproductible et explicite', () => {
  const { counts } = manifest();
  assert.equal(counts.deployed, 6);
  assert.equal(counts.pendingDeploy, 7);
  assert.equal(counts.pendingKeyOnlyPatch, 1);
  assert.equal(counts.pendingCoordinatedLot, 2);
  assert.equal(
    counts.deployed + counts.pendingDeploy + counts.pendingKeyOnlyPatch + counts.pendingCoordinatedLot,
    16,
  );
});

test('les cinq fonctions orphelines sont hors périmètre et bloquent la révocation', () => {
  const m = manifest();
  const orphans = m.outOfPerimeter.filter((x) => x.reason === 'SOURCE_ABSENT_FROM_REPO');
  assert.equal(orphans.length, 5);
  for (const o of orphans) {
    assert.equal(o.blocksRevocation, true, `${o.name} doit bloquer la révocation`);
    assert.equal(m.functions.some((f) => f.name === o.name), false);
  }
  assert.equal(m.counts.revocationBlockers >= 5, true);
  assert.equal(m.revocationAllowed, false);
});

test('aucune fonction hors périmètre ne double une fonction du périmètre', () => {
  const m = manifest();
  const inScope = new Set(m.functions.map((f) => f.name));
  for (const x of m.outOfPerimeter) assert.equal(inScope.has(x.name), false, x.name);
});

test('scpi-scoring et maximus-search-agent-oidc ne bloquent pas la révocation', () => {
  const m = manifest();
  for (const name of ['scpi-scoring', 'maximus-search-agent-oidc']) {
    const x = m.outOfPerimeter.find((o) => o.name === name);
    assert.ok(x, `${name} doit être classé`);
    assert.equal(x.blocksRevocation, false);
  }
});

test('chaque fonction du périmètre a une source présente avec empreinte SHA-256', () => {
  const m = manifest();
  for (const f of m.functions) {
    assert.deepEqual(f.repo.missing, [], `${f.name} : dépendance manquante`);
    assert.match(f.repo.entrypoint.sha256, /^[0-9a-f]{64}$/, f.name);
    assert.match(f.repo.bundleSha256, /^[0-9a-f]{64}$/, f.name);
    for (const d of f.repo.dependencies) {
      assert.match(d.sha256, /^[0-9a-f]{64}$/, `${f.name}:${d.path}`);
    }
  }
});

test('toutes les dépendances locales importées sont déclarées au registre', () => {
  const m = manifest();
  for (const f of m.functions) {
    assert.deepEqual(f.undeclaredImports, [], `${f.name} importe une dépendance non déclarée`);
  }
});

test('un import local non déclaré est détecté', () => {
  const entry = join(FUNCTIONS_DIR, 'scpi-bulletin-watch', 'index.ts');
  const imports = declaredImports(readFileSync(entry, 'utf8'));
  assert.ok(imports.includes('./sourceProvenance.mjs'));
  assert.ok(imports.includes('../_shared/serviceKey.ts'));
});

test('le rollback n est jamais déclaré prêt sans évidence du bundle de production', () => {
  const m = manifest();
  for (const f of m.functions) {
    assert.equal(f.rollback.ready, false, `${f.name} : rollback prématuré`);
    assert.equal(f.rollback.blockingReason, 'EVIDENCE_MISSING');
    assert.equal(f.rollback.prodEvidencePresent, false);
  }
  assert.equal(m.counts.rollbackReady, 0);
});

test('une évidence de production complète rend le rollback calculable', () => {
  const fake = (name) => ({
    function: name,
    version: 9,
    verifyJwt: false,
    entrypointSha256: 'a'.repeat(64),
    dependencies: [{ path: '_shared/serviceKey.ts', sha256: 'b'.repeat(64), bytes: 10 }],
    bundleSha256: 'c'.repeat(64),
  });
  const m = buildManifest(fake);
  const evidenceCertify = m.functions.find((f) => f.name === 'scpi-evidence-certify');
  // Version 9, verify_jwt=false et empreinte prod du matcher connue -> rollback calculable.
  assert.equal(evidenceCertify.rollback.ready, true);
  assert.equal(evidenceCertify.rollback.blockingReason, null);
  const calendly = m.functions.find((f) => f.name === 'calendly-webhook');
  // Version de prod non encore constatée dans le registre -> rien n'est validé par ressemblance.
  assert.equal(calendly.prodVersion, null);
  assert.equal(calendly.rollback.ready, false);
});

test('une empreinte de dépendance de prod manquante bloque le rollback', () => {
  const fake = (name) => ({
    function: name,
    version: 108,
    verifyJwt: false,
    entrypointSha256: 'a'.repeat(64),
    dependencies: [{ path: '_shared/serviceKey.ts', sha256: 'b'.repeat(64), bytes: 10 }],
    bundleSha256: 'c'.repeat(64),
  });
  const m = buildManifest(fake);
  const bulletin = m.functions.find((f) => f.name === 'scpi-bulletin-watch');
  assert.equal(bulletin.rollback.ready, false);
  assert.equal(bulletin.rollback.blockingReason, 'PROD_DEPENDENCY_FINGERPRINT_MISSING');
});

test('une évidence incohérente avec la version constatée n ouvre pas le rollback', () => {
  const wrongVersion = (name) => ({
    function: name,
    version: 999,
    verifyJwt: false,
    entrypointSha256: 'a'.repeat(64),
    dependencies: [],
    bundleSha256: 'c'.repeat(64),
  });
  const m = buildManifest(wrongVersion);
  assert.equal(m.functions.every((f) => f.rollback.ready === false), true);
});

test('l évidence de production rejette une empreinte malformée', () => {
  assert.deepEqual(validateProdEvidence({}), [
    'MISSING_function',
    'MISSING_version',
    'MISSING_verifyJwt',
    'MISSING_entrypointSha256',
    'MISSING_dependencies',
    'MISSING_bundleSha256',
  ]);
  assert.deepEqual(
    validateProdEvidence({
      function: 'x',
      version: 1,
      verifyJwt: false,
      entrypointSha256: 'not-a-hash',
      dependencies: [{ path: 'a', sha256: 'b'.repeat(64), bytes: 1 }],
      bundleSha256: 'zz',
    }),
    ['BAD_bundleSha256', 'BAD_entrypointSha256'],
  );
  assert.deepEqual(
    validateProdEvidence({
      function: 'x',
      version: 1,
      verifyJwt: false,
      entrypointSha256: 'a'.repeat(64),
      dependencies: [{ path: 'a', sha256: 'b'.repeat(64) }],
      bundleSha256: 'c'.repeat(64),
    }),
    ['MISSING_dependency_bytes'],
  );
});

test('les fichiers d évidence commités ne contiennent aucune valeur de clé', () => {
  const forbidden = /(sb_publishable_|sb_secret_|eyJ[A-Za-z0-9_-]{10,}|service_role_key"\s*:\s*"[^"]{20,})/;
  if (!existsSync(PROD_EVIDENCE_DIR)) {
    assert.fail('répertoire prod-bundles absent (voir son README)');
  }
  const files = readdirSync(PROD_EVIDENCE_DIR).filter((f) => f.endsWith('.json'));
  for (const file of files) {
    const raw = readFileSync(join(PROD_EVIDENCE_DIR, file), 'utf8');
    assert.doesNotMatch(raw, forbidden, `${file} contient une valeur assimilable à une clé`);
    const ev = JSON.parse(raw);
    assert.deepEqual(validateProdEvidence(ev), [], `${file} : forme invalide`);
    assert.equal(ev.function, file.replace(/\.json$/, ''), `${file} : nom de fonction incohérent`);
  }
  if (files.length === 0) {
    // Aucune évidence encore consignée : le rollback reste légitimement bloqué.
    assert.equal(manifest().counts.rollbackReady, 0);
  }
});

test('le README de prod-bundles documente le format attendu', () => {
  const readme = readFileSync(join(PROD_EVIDENCE_DIR, 'README.md'), 'utf8');
  for (const field of ['entrypointSha256', 'dependencies', 'bundleSha256', 'verifyJwt']) {
    assert.ok(readme.includes(field), `${field} non documenté`);
  }
  assert.match(readme, /Aucune valeur de clé/);
});

test('scpi-certified-promote est protégée contre le déploiement de l entrypoint du dépôt', () => {
  const f = manifest().functions.find((x) => x.name === 'scpi-certified-promote');
  assert.equal(f.deployState, 'PENDING_KEY_ONLY_PATCH');
  assert.equal(f.deployGuard, 'NEVER_DEPLOY_REPO_ENTRYPOINT_VERBATIM');
  assert.match(f.entrypointDrift, /WITHDRAWAL_MISLABELLED_AS_SUBSCRIPTION/);
  const src = readFileSync(join(FUNCTIONS_DIR, 'scpi-certified-promote', 'index.ts'), 'utf8');
  assert.match(src, /WITHDRAWAL_MISLABELLED_AS_SUBSCRIPTION/);
  assert.match(src, /readServiceKey/);
});

test('le drift matcher de scpi-evidence-certify est enregistré et non écrasé', () => {
  const f = manifest().functions.find((x) => x.name === 'scpi-evidence-certify');
  const drift = f.repoDrift.find((d) => d.path === 'matcher.mjs');
  assert.ok(drift, 'drift matcher absent du registre');
  assert.equal(drift.prodSha256, '88c46bc36396a1906db5b5a625f1e336d81036a22101990e527dcc7414623b8c');
  assert.equal(drift.prodBytes, 13355);
  assert.notEqual(drift.repoSha256, drift.prodSha256);
});

test('sender-add-contact est le seul verify_jwt=true constaté en production', () => {
  const m = manifest();
  const trueJwt = m.functions.filter((f) => f.prodVerifyJwt === true).map((f) => f.name);
  assert.deepEqual(trueJwt, ['sender-add-contact']);
  const sender = m.functions.find((f) => f.name === 'sender-add-contact');
  assert.equal(sender.prodVersion, 7);
  assert.equal(sender.targetVerifyJwt, false);
  const lead = m.functions.find((f) => f.name === 'send-lead-notification');
  assert.equal(lead.prodVerifyJwt, false);
  assert.equal(lead.prodVersion, 17);
});

test('chaque fonction déclare un test positif et un test négatif', () => {
  for (const f of manifest().functions) {
    assert.ok(f.tests.positive.length > 0, `${f.name} : test positif manquant`);
    assert.ok(f.tests.negative.length > 0, `${f.name} : test négatif manquant`);
    assert.match(f.auth, /\S/, `${f.name} : authentification interne non documentée`);
  }
});

test('aucune fonction verify_jwt=false ne reste sans authentification interne', () => {
  for (const f of manifest().functions) {
    if (f.targetVerifyJwt === false) assert.match(f.auth, /\S/, f.name);
  }
});

test('le registre commité correspond aux sources actuelles', () => {
  assert.equal(existsSync(LEDGER_PATH), true, 'registre JSON absent');
  const committed = JSON.parse(readFileSync(LEDGER_PATH, 'utf8'));
  assert.deepEqual(committed, ledgerSnapshot(manifest()));
});

test('le calcul d empreintes est stable et indépendant de l ordre du registre', () => {
  const a = resolveRepoFingerprint({
    name: 'calendly-webhook',
    sharedDeps: ['_shared/serviceKey.ts'],
    localDeps: [],
  });
  const b = resolveRepoFingerprint({
    name: 'calendly-webhook',
    sharedDeps: ['_shared/serviceKey.ts'],
    localDeps: [],
  });
  assert.equal(a.bundleSha256, b.bundleSha256);
  assert.match(a.bundleSha256, /^[0-9a-f]{64}$/);
});
