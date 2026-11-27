/**
 * Preuves de réintégration + migration clé des 4 workers orphelins (et audit watchdog).
 *
 * Les sources fidèles (bundles capturés, sceaux 7224163948) ne sont PAS dans le dépôt public :
 * on vérifie le résultat commité (readServiceKey, zéro lecture directe legacy) et que le
 * patcher peut reproduire la transformation sur la forme inline réelle.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { applyKeyOnlyPatch, assertOnlyKeyChanges } from './applyKeyOnlyPatch.mjs';
import { FUNCTIONS_DIR, buildManifest } from './edgeFunctionDeploymentManifest.mjs';

const WORKERS = [
  'scpi-parallel-backfill-worker',
  'scpi-parallel-discover-worker',
  'scpi-annual-source-discover',
  'scpi-norma-quarterly-ingest',
];

const SEALS = Object.freeze({
  'scpi-parallel-backfill-worker': 'cc5649910b6cfe475e8e97f02c12a9ec30d542ee5909c6565d520b4a27a6627d',
  'scpi-parallel-discover-worker': '30e83201faa1e17dbc32106c03a76ff9441e56398a203153e07ea204f063456f',
  'scpi-annual-source-discover': 'e889bc7e4238f94615d9fe64094f1c3472c51029758ee82b4378c470a12c20c9',
  'scpi-norma-quarterly-ingest': '583cbadc4e021e5a646762b8b541b21485a72add6d21f7f40aeecc90ffb46038',
  'maximus-watchdog-oidc': 'aa2a69fbdcc114c4cb2f6ccebd98b37ae9db0871f105f82765da6b48b9bf00bb',
});

test('les quatre workers réintégrés utilisent readServiceKey et plus la lecture legacy', () => {
  for (const name of WORKERS) {
    const path = join(FUNCTIONS_DIR, name, 'index.ts');
    assert.equal(existsSync(path), true, `${name} absent du dépôt`);
    const src = readFileSync(path, 'utf8');
    assert.match(src, /readServiceKey\s*\(/, name);
    assert.match(src, /from\s+["']\.\.\/_shared\/serviceKey\.ts["']/, name);
    assert.doesNotMatch(src, /Deno\.env\.get\(\s*["']SUPABASE_SERVICE_ROLE_KEY["']\s*\)/, name);
  }
});

test('maximus-watchdog-oidc est réintégré, utilise SUPABASE_DB_URL, aucune clé API', () => {
  const path = join(FUNCTIONS_DIR, 'maximus-watchdog-oidc', 'index.ts');
  assert.equal(existsSync(path), true);
  const src = readFileSync(path, 'utf8');
  assert.match(src, /SUPABASE_DB_URL/);
  assert.doesNotMatch(src, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(src, /SUPABASE_SECRET_KEYS/);
  assert.doesNotMatch(src, /readServiceKey/);
});

test('le manifeste porte les sceaux de rollback 7224163948 pour chaque orpheline', () => {
  const m = buildManifest();
  for (const [name, seal] of Object.entries(SEALS)) {
    const entry = m.outOfPerimeter.find((x) => x.name === name);
    assert.ok(entry, name);
    assert.equal(entry.rollbackArtifactSha256, seal, name);
  }
});

test('positif : le patcher transforme une forme inline fidèle ; négatif : refuse une dérive', () => {
  const sample = readFileSync(join(FUNCTIONS_DIR, 'scpi-norma-quarterly-ingest', 'index.ts'), 'utf8');
  // Reconstruire une source « legacy » en inversant le patch sur une copie synthétique.
  const legacy = sample
    .replace(/import \{ readServiceKey \} from "\.\.\/_shared\/serviceKey\.ts";\n/, '')
    .replace(
      /key=readServiceKey\(\(k\)=>Deno\.env\.get\(k\),"scpi_agents"\)/,
      "key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||''",
    );
  assert.match(legacy, /SUPABASE_SERVICE_ROLE_KEY/);
  const { patched } = applyKeyOnlyPatch(legacy);
  assertOnlyKeyChanges(legacy, patched);
  assert.doesNotMatch(patched, /Deno\.env\.get\(\s*['"]SUPABASE_SERVICE_ROLE_KEY['"]\s*\)/);

  const tampered = patched.replace('unsupported slug', 'changed slug gate');
  assert.throws(() => assertOnlyKeyChanges(legacy, tampered), (e) => e.code === 'UNAUTHORIZED_EDIT');
});
