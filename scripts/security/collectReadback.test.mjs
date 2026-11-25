import test from 'node:test';
import assert from 'node:assert/strict';
import {
  readbackFromManagementApi,
  bundleFingerprintFromEntries,
  mergeReadbackIntoEvidence,
  fetchReadback,
} from './collectReadback.mjs';
import {
  PRODUCTION_PROJECT_REF,
  readbackConfigSha256,
  validateReadback,
  EVIDENCE_SCHEMA_VERSION,
} from './edgeFunctionDeploymentManifest.mjs';

const SLUG = 'scpi-evidence-certify';

/** Réponse type de `GET /v1/projects/{ref}/functions/{slug}`, réduite à ce qui compte. */
const payloadFor = (overrides = {}) => ({
  slug: SLUG,
  version: 9,
  verify_jwt: false,
  entrypoint_path: `supabase/functions/${SLUG}/index.ts`,
  files: [
    { name: `supabase/functions/${SLUG}/index.ts`, content: 'export default serve(handler);\n' },
    { name: `supabase/functions/${SLUG}/matcher.mjs`, content: 'export const match = () => true;\n' },
  ],
  ...overrides,
});

test('une réponse fournisseur complète produit un readback exploitable', () => {
  const rb = readbackFromManagementApi(payloadFor(), { fetchedAt: '2026-11-25T00:30:00Z' });
  assert.equal(rb.projectRef, PRODUCTION_PROJECT_REF);
  assert.equal(rb.slug, SLUG);
  assert.equal(rb.version, 9);
  assert.equal(rb.verifyJwt, false);
  assert.equal(rb.dependencies.length, 1);
  assert.equal(rb.dependencies[0].path, 'matcher.mjs');
  assert.match(rb.entrypointSha256, /^[0-9a-f]{64}$/);
  assert.match(rb.bundleSha256, /^[0-9a-f]{64}$/);
  assert.match(rb.configSha256, /^[0-9a-f]{64}$/);
  // L'empreinte de configuration lie EXACTEMENT les champs qu'elle prétend couvrir.
  assert.equal(rb.configSha256, readbackConfigSha256({
    projectRef: rb.projectRef,
    slug: rb.slug,
    version: rb.version,
    verifyJwt: rb.verifyJwt,
    entrypointPath: rb.entrypointPath,
  }));
  // Un readback cohérent passe la validation de forme du manifeste.
  const observed = {
    version: rb.version,
    verifyJwt: rb.verifyJwt,
    entrypointSha256: rb.entrypointSha256,
    dependencies: rb.dependencies,
    bundleSha256: rb.bundleSha256,
    readback: rb,
  };
  assert.deepEqual(validateReadback(observed, SLUG), []);
});

test('un readback sans contenu d entrypoint échoue au lieu de renseigner du vide', () => {
  assert.throws(
    () => readbackFromManagementApi(payloadFor({ files: [] })),
    /READBACK_PAYLOAD_WITHOUT_ENTRYPOINT_CONTENT/,
  );
});

test('un readback sans version ou sans verify_jwt échoue explicitement', () => {
  assert.throws(() => readbackFromManagementApi(payloadFor({ version: null })), /WITHOUT_VERSION/);
  assert.throws(() => readbackFromManagementApi(payloadFor({ verify_jwt: undefined })), /WITHOUT_VERIFY_JWT/);
  assert.throws(() => readbackFromManagementApi(payloadFor({ slug: '' })), /WITHOUT_SLUG/);
  assert.throws(() => readbackFromManagementApi(null), /NOT_AN_OBJECT/);
});

test('la configuration change l empreinte même quand le code est identique', () => {
  const base = readbackFromManagementApi(payloadFor(), { fetchedAt: '2026-11-25T00:30:00Z' });
  const jwtChanged = readbackFromManagementApi(payloadFor({ verify_jwt: true }), { fetchedAt: '2026-11-25T00:30:00Z' });
  const versionChanged = readbackFromManagementApi(payloadFor({ version: 10 }), { fetchedAt: '2026-11-25T00:30:00Z' });

  // Le code est le même : c'est précisément le cas que le contrôle a signalé.
  assert.equal(base.bundleSha256, jwtChanged.bundleSha256);
  assert.equal(base.bundleSha256, versionChanged.bundleSha256);
  // La configuration, elle, diffère : une signature qui ne couvrirait que le code serait aveugle.
  assert.notEqual(base.configSha256, jwtChanged.configSha256);
  assert.notEqual(base.configSha256, versionChanged.configSha256);
});

test('l empreinte de bundle du collecteur suit la même règle que le registre', () => {
  const entries = [
    { path: 'b.mjs', sha256: '2'.repeat(64) },
    { path: 'a.mjs', sha256: '1'.repeat(64) },
  ];
  // Indépendante de l'ordre : une renumérotation de fichiers ne doit pas changer l'identité.
  assert.equal(
    bundleFingerprintFromEntries(entries),
    bundleFingerprintFromEntries([...entries].reverse()),
  );
});

test('le merge réaligne observed sur la lecture sans muter l évidence d origine', () => {
  const rb = readbackFromManagementApi(payloadFor(), { fetchedAt: '2026-11-25T00:30:00Z' });
  const evidence = {
    schemaVersion: EVIDENCE_SCHEMA_VERSION,
    stage: 'POST_DEPLOY',
    function: SLUG,
    observed: { version: 8, verifyJwt: true, entrypointSha256: 'f'.repeat(64), dependencies: [], bundleSha256: 'e'.repeat(64) },
    rollbackTarget: { phase: 'PRE_MIGRATION' },
  };
  const merged = mergeReadbackIntoEvidence(evidence, rb);
  assert.equal(merged.observed.version, 9);
  assert.equal(merged.observed.verifyJwt, false);
  assert.equal(merged.observed.bundleSha256, rb.bundleSha256);
  assert.deepEqual(merged.observed.readback, rb);
  // La cible de rollback n'est jamais touchée par une lecture d'état courant.
  assert.deepEqual(merged.rollbackTarget, evidence.rollbackTarget);
  // L'entrée n'est pas mutée : le merge ne « corrige » pas silencieusement un fichier.
  assert.equal(evidence.observed.version, 8);
});

test('une lecture qui n est pas un readback lié est refusée avant tout usage', () => {
  const rb = readbackFromManagementApi(payloadFor(), { fetchedAt: '2026-11-25T00:30:00Z' });
  // Un observed qui diverge de la lecture ne peut pas être présenté comme attesté par elle.
  const divergent = { version: 8, verifyJwt: false, entrypointSha256: rb.entrypointSha256, dependencies: rb.dependencies, bundleSha256: rb.bundleSha256, readback: rb };
  const errors = validateReadback(divergent, SLUG);
  assert.ok(errors.includes('READBACK_DISAGREES_WITH_OBSERVED_version'), errors.join(','));
});

test('sans jeton, la collecte échoue sans jamais appeler le fournisseur', async () => {
  let called = false;
  const fetchImpl = async () => { called = true; return { ok: true, json: async () => payloadFor() }; };
  await assert.rejects(
    () => fetchReadback(SLUG, { token: '', fetchImpl }),
    /SUPABASE_ACCESS_TOKEN_MISSING/,
  );
  assert.equal(called, false, 'aucun appel réseau ne doit partir sans jeton');
});

test('une réponse HTTP en erreur remonte un code explicite, jamais un readback vide', async () => {
  const fetchImpl = async () => ({ ok: false, status: 403, json: async () => ({}) });
  await assert.rejects(() => fetchReadback(SLUG, { token: 'jeton-de-test', fetchImpl }), /READBACK_HTTP_403/);
});

test('la collecte n émet jamais le jeton dans le readback produit', async () => {
  const secret = 'sbp_jeton-de-test-qui-ne-doit-pas-fuir';
  const fetchImpl = async () => ({ ok: true, json: async () => payloadFor() });
  const rb = await fetchReadback(SLUG, { token: secret, fetchImpl });
  assert.doesNotMatch(JSON.stringify(rb), new RegExp(secret));
});
