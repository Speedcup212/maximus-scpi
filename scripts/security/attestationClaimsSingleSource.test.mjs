/**
 * Une seule source pour les affirmations d'attestation.
 *
 * Le défaut corrigé ici est concret et a été reproduit avant correction : le handoff
 * annonçait « les 11 affirmations » (deux fois : §11 étape E et §11.3 étape E) alors que
 * `crossCheckAttestation` en exige 22. Un contrôle indépendant suivant le document signait
 * donc un payload incomplet, et le gate répondait onze `MISSING_attestation_claim_*`.
 *
 * Ces tests ne vérifient pas une valeur recopiée : ils comparent au **contrôleur réel**
 * (`crossCheckAttestation`) et au **document réel** (le handoff). Si l'un des deux dérive,
 * le test échoue.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { generateKeyPairSync, sign } from 'node:crypto';
import {
  ATTESTATION_REQUIRED_CLAIMS,
  ATTESTATION_SCHEMA_VERSION,
  buildAttestationClaims,
  canonicalJsonSha256,
  crossCheckAttestation,
  resolvesInsideRepo,
  REPO_ROOT,
  PRODUCTION_PROJECT_REF,
} from './edgeFunctionDeploymentManifest.mjs';

const HANDOFF = join(REPO_ROOT, 'docs', 'security', 'HANDOFF_SUPABASE_API_KEYS_MIGRATION.md');
const SCRIPT = join(REPO_ROOT, 'scripts', 'security', 'edgeFunctionDeploymentManifest.mjs');

/** Évidence complète et cohérente, entièrement fictive : aucune valeur de production. */
const evidence = () => ({
  schemaVersion: 'security-prod-evidence-v3',
  stage: 'POST_DEPLOY',
  function: 'scpi-certified-promote',
  observed: {
    version: 12,
    verifyJwt: false,
    entrypointSha256: 'a'.repeat(64),
    dependencies: [],
    bundleSha256: 'b'.repeat(64),
    readback: {
      source: 'supabase-management-api:GET /v1/projects/{ref}/functions/{slug}',
      bundleSource: 'supabase-management-api:GET /v1/projects/{ref}/functions/{slug}/body',
      fetchedAt: '2026-11-27T00:00:00Z',
      projectRef: PRODUCTION_PROJECT_REF,
      slug: 'scpi-certified-promote',
      status: 'ACTIVE',
      version: 12,
      verifyJwt: false,
      providerEntrypointPath: 'file:///tmp/user_fn_x/source/index.ts',
      entrypointPath: 'scpi-certified-promote/index.ts',
      entrypointSha256: 'a'.repeat(64),
      providerEzbrSha256: 'c'.repeat(64),
      dependencies: [],
      bundleSha256: 'b'.repeat(64),
      configSha256: 'd'.repeat(64),
    },
  },
  rollbackTarget: {
    phase: 'PRE_MIGRATION',
    version: 11,
    verifyJwt: false,
    entrypointSha256: 'e'.repeat(64),
    dependencies: [],
    bundleSha256: 'f'.repeat(64),
  },
  custody: {
    artifactRef: 'vault/scpi-certified-promote-v11.bin',
    artifactSha256: '1'.repeat(64),
    owner: 'independent-controller',
    holdsRestorableArtifact: true,
    bindsToBundleSha256: 'f'.repeat(64),
    bindsToFunction: 'scpi-certified-promote',
    bindsToVersion: 11,
  },
  restoreDrill: {
    performedAt: '2026-11-27T00:00:00Z',
    performedBy: 'operator',
    result: 'PASS',
    destination: 'disposable-project',
    journalRef: 'vault/journal.json',
    journalSha256: '2'.repeat(64),
    restoredEntrypointSha256: 'e'.repeat(64),
    restoredBundleSha256: 'f'.repeat(64),
  },
  attestation: { verifier: 'chatgpt', verifierIdentity: 'chatgpt-independent-controller' },
});

const testAnchor = () => {
  const { publicKey } = generateKeyPairSync('ed25519');
  return {
    schemaVersion: 'rollback-verifier-anchor-v1',
    verifiers: [{
      identity: 'chatgpt-independent-controller',
      algorithm: 'ed25519',
      keyId: 'k1',
      publicKeyPem: publicKey.export({ type: 'spki', format: 'pem' }).toString(),
      revokedKeyIds: [],
    }],
  };
};

/** Signe des affirmations comme le ferait le contrôle indépendant. */
const signClaims = (claims, privateKey) => {
  const payload = canonicalJsonSha256(claims);
  return {
    ...claims,
    attestationSha256: payload,
    signature: {
      keyId: 'k1',
      algorithm: 'ed25519',
      value: sign(null, Buffer.from(payload, 'utf8'), privateKey).toString('base64'),
    },
  };
};

const keyPair = () => generateKeyPairSync('ed25519');

test('les affirmations produites passent le contrôleur réel sans aucun MISSING_*', () => {
  const ev = evidence();
  const { publicKey, privateKey } = keyPair();
  const anchor = {
    schemaVersion: 'rollback-verifier-anchor-v1',
    verifiers: [{
      identity: 'chatgpt-independent-controller',
      algorithm: 'ed25519',
      keyId: 'k1',
      publicKeyPem: publicKey.export({ type: 'spki', format: 'pem' }).toString(),
      revokedKeyIds: [],
    }],
  };
  const claims = buildAttestationClaims(ev, { verifiedAt: '2026-11-27T01:00:00Z' });
  const errors = crossCheckAttestation(ev, signClaims(claims, privateKey), anchor);
  assert.deepEqual(errors, [], `le contrôleur refuse les affirmations émises : ${errors.join(', ')}`);
  assert.equal(claims.schemaVersion, ATTESTATION_SCHEMA_VERSION);
});

test('le payload incomplet du handoff (11 affirmations) est bien refusé — le défaut est réel', () => {
  const ev = evidence();
  const { publicKey, privateKey } = keyPair();
  const anchor = {
    schemaVersion: 'rollback-verifier-anchor-v1',
    verifiers: [{
      identity: 'chatgpt-independent-controller',
      algorithm: 'ed25519',
      keyId: 'k1',
      publicKeyPem: publicKey.export({ type: 'spki', format: 'pem' }).toString(),
      revokedKeyIds: [],
    }],
  };
  // Exactement les onze affirmations que la prose du handoff décrivait avant correction.
  const eleven = {
    schemaVersion: ATTESTATION_SCHEMA_VERSION,
    function: ev.function,
    stage: ev.stage,
    observedBundleSha256: ev.observed.bundleSha256,
    rollbackTargetBundleSha256: ev.rollbackTarget.bundleSha256,
    custodyArtifactSha256: ev.custody.artifactSha256,
    custodyArtifactRef: ev.custody.artifactRef,
    restoreJournalSha256: ev.restoreDrill.journalSha256,
    restoredBundleSha256: ev.restoreDrill.restoredBundleSha256,
    restoreDestination: ev.restoreDrill.destination,
    restoreResult: ev.restoreDrill.result,
  };
  const errors = crossCheckAttestation(ev, signClaims(eleven, privateKey), anchor);
  const missing = errors.filter((e) => e.startsWith('MISSING_attestation_claim_'));
  assert.equal(
    missing.length,
    ATTESTATION_REQUIRED_CLAIMS.length - 11,
    'le nombre d affirmations manquantes doit valoir exactement la différence de décompte',
  );
  // Une signature valide ne sauve pas un payload incomplet : c'est le point.
  assert.ok(!errors.includes('ATTESTATION_SIGNATURE_INVALID'));
});

test('le handoff ne peut plus annoncer un décompte faux', () => {
  const doc = readFileSync(HANDOFF, 'utf8');
  const counts = [...doc.matchAll(/(\d+)\s+affirmations/g)].map((m) => Number(m[1]));
  assert.ok(counts.length > 0, 'le handoff doit citer le décompte des affirmations');
  for (const n of counts) {
    assert.equal(
      n,
      ATTESTATION_REQUIRED_CLAIMS.length,
      `le handoff annonce ${n} affirmations, le contrôleur en exige ${ATTESTATION_REQUIRED_CLAIMS.length}`,
    );
  }
});

test('chaque affirmation exigée est produite, et aucune affirmation superflue', () => {
  const claims = buildAttestationClaims(evidence(), { verifiedAt: '2026-11-27T01:00:00Z' });
  assert.deepEqual(Object.keys(claims).sort(), [...ATTESTATION_REQUIRED_CLAIMS].sort());
  for (const f of ATTESTATION_REQUIRED_CLAIMS) {
    assert.ok(f in claims, `affirmation exigée non produite : ${f}`);
  }
});

test('une évidence incomplète produit des affirmations nulles, jamais des champs omis', () => {
  // Un champ omis donne MISSING_attestation_claim_* ; un champ nul donne un MISMATCH nommé.
  const claims = buildAttestationClaims({ function: 'x', stage: 'POST_DEPLOY' }, { verifiedAt: 'z' });
  for (const f of ATTESTATION_REQUIRED_CLAIMS) assert.ok(f in claims, `champ omis : ${f}`);
  assert.equal(claims.projectRef, null);
  assert.equal(claims.observedConfigSha256, null);
});

test('le CLI émet les affirmations depuis une évidence hors dépôt', () => {
  const root = join('/tmp', `attestation-claims-${process.pid}`);
  mkdirSync(root, { recursive: true });
  const p = join(root, 'scpi-certified-promote.json');
  try {
    writeFileSync(p, JSON.stringify(evidence()), 'utf8');
    assert.equal(resolvesInsideRepo(p), false, 'le dossier de test doit être hors du dépôt');
    const out = execFileSync(process.execPath, [SCRIPT, '--attestation-claims', 'scpi-certified-promote', p, '2026-11-27T01:00:00Z'], { encoding: 'utf8' });
    const parsed = JSON.parse(out);
    assert.equal(parsed.claimCount, ATTESTATION_REQUIRED_CLAIMS.length);
    assert.equal(parsed.attestationSha256, canonicalJsonSha256(parsed.claims));
    assert.equal(parsed.claims.verifiedAt, '2026-11-27T01:00:00Z');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('le CLI refuse une évidence située dans le dépôt', () => {
  // Une évidence versionnée ne prouverait rien de plus que le fichier lui-même.
  const inside = join(REPO_ROOT, 'scripts', 'security', 'prod-bundles', 'README.md');
  assert.ok(existsSync(inside));
  assert.throws(
    () => execFileSync(process.execPath, [SCRIPT, '--attestation-claims', 'x', inside], { encoding: 'utf8', stdio: 'pipe' }),
    (err) => String(err.stderr).includes('EVIDENCE_DOCUMENT_INSIDE_REPO'),
  );
});

test('le CLI refuse une évidence qui décrit une autre fonction', () => {
  const root = join('/tmp', `attestation-claims-other-${process.pid}`);
  mkdirSync(root, { recursive: true });
  const p = join(root, 'x.json');
  try {
    writeFileSync(p, JSON.stringify(evidence()), 'utf8');
    assert.throws(
      () => execFileSync(process.execPath, [SCRIPT, '--attestation-claims', 'autre-fonction', p], { encoding: 'utf8', stdio: 'pipe' }),
      (err) => String(err.stderr).includes('EVIDENCE_OTHER_FUNCTION'),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('l ancre de test est bien formée (garde du harnais lui-même)', () => {
  assert.equal(testAnchor().verifiers[0].algorithm, 'ed25519');
});
