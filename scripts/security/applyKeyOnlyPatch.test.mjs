import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import {
  applyKeyOnlyPatch,
  assertOnlyKeyChanges,
  PatchError,
  SERVICE_KEY_IMPORT,
} from './applyKeyOnlyPatch.mjs';
import { FUNCTIONS_DIR } from './edgeFunctionDeploymentManifest.mjs';

const PROD_V12_SHAPE = [
  'import "jsr:@supabase/functions-js/edge-runtime.d.ts";',
  'import { createClient } from "npm:@supabase/supabase-js@2";',
  '',
  'const CORS = { "Access-Control-Allow-Origin": "*" };',
  '',
  'Deno.serve(async (req: Request) => {',
  '  const base = Deno.env.get("SUPABASE_URL") || "";',
  '  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";',
  '  const db = createClient(base, key, { auth: { persistSession: false } });',
  '  const guard = "PROD_V12_BUSINESS_GUARD_PLACEHOLDER";',
  '  return Response.json({ ok: true, guard });',
  '});',
  '',
].join('\n');

test('le patch remplace uniquement la résolution de clé et ajoute l import', () => {
  const { patched, changes } = applyKeyOnlyPatch(PROD_V12_SHAPE);
  assert.equal(changes.length, 2);
  assert.equal(changes[0].kind, 'KEY_RESOLUTION_REPLACED');
  assert.equal(changes[1].kind, 'SERVICE_KEY_IMPORT_ADDED');
  assert.match(patched, /const key = readServiceKey\(\(k\) => Deno\.env\.get\(k\), "scpi_agents"\);/);
  assert.match(patched, /import \{ readServiceKey \} from "\.\.\/_shared\/serviceKey\.ts";/);
  assert.doesNotMatch(patched, /Deno\.env\.get\("SUPABASE_SERVICE_ROLE_KEY"\)/);
});

test('le patch préserve intégralement le code métier du bundle de production', () => {
  const { patched } = applyKeyOnlyPatch(PROD_V12_SHAPE);
  assert.match(patched, /PROD_V12_BUSINESS_GUARD_PLACEHOLDER/);
  assert.match(patched, /Deno\.serve\(async \(req: Request\)/);
  assert.match(patched, /createClient\(base, key/);
  // Aucune garde financière du dépôt ne doit être introduite par le patch.
  for (const needle of [
    'CAPITALISATION_PARTS_MISMATCH',
    'MATERIAL_TOF_QA_REQUIRED',
    'TOF_OUT_OF_RANGE',
    'DEBT_OUT_OF_RANGE',
    'FORBIDDEN_ASPIM_TOF',
  ]) {
    assert.equal(patched.includes(needle), false, `${needle} introduit par le patch`);
  }
});

test('le patch est idempotent au sens où il refuse une seconde application', () => {
  const { patched } = applyKeyOnlyPatch(PROD_V12_SHAPE);
  assert.throws(() => applyKeyOnlyPatch(patched), (e) => e instanceof PatchError && e.code === 'ALREADY_PATCHED');
});

test('le patch refuse une source vide', () => {
  assert.throws(() => applyKeyOnlyPatch(''), (e) => e.code === 'EMPTY_SOURCE');
  assert.throws(() => applyKeyOnlyPatch(null), (e) => e.code === 'EMPTY_SOURCE');
});

test('le patch refuse un bundle sans résolution legacy reconnaissable', () => {
  const src = 'Deno.serve(() => new Response("ok"));\n';
  assert.throws(() => applyKeyOnlyPatch(src), (e) => e.code === 'LEGACY_RESOLUTION_NOT_FOUND');
});

test('le patch refuse une résolution ambiguë plutôt que de choisir au hasard', () => {
  const src = [
    'const a = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";',
    'const b = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";',
  ].join('\n');
  assert.throws(() => applyKeyOnlyPatch(src), (e) => e.code === 'AMBIGUOUS_LEGACY_RESOLUTION');
});

test('le patch refuse un bundle qui lit déjà la nouvelle clé', () => {
  const src = 'const raw = Deno.env.get("SUPABASE_SECRET_KEYS");\nconst key = readServiceKey((k) => Deno.env.get(k), "scpi_agents");\n';
  assert.throws(() => applyKeyOnlyPatch(src), (e) => e.code === 'ALREADY_PATCHED');
});

test('assertOnlyKeyChanges détecte une modification métier cachée', () => {
  const { patched } = applyKeyOnlyPatch(PROD_V12_SHAPE);
  const tampered = patched.replace('PROD_V12_BUSINESS_GUARD_PLACEHOLDER', 'REMOVED_GUARD');
  assert.throws(
    () => assertOnlyKeyChanges(PROD_V12_SHAPE, tampered),
    (e) => e.code === 'UNAUTHORIZED_EDIT',
  );
});

test('assertOnlyKeyChanges accepte le patch légitime', () => {
  const { patched } = applyKeyOnlyPatch(PROD_V12_SHAPE);
  const touched = assertOnlyKeyChanges(PROD_V12_SHAPE, patched);
  assert.deepEqual(touched.map((c) => c.kind).sort(), ['INSERTED_IMPORT', 'KEY_LINE']);
});

test('assertOnlyKeyChanges refuse un bundle qui supprime des lignes', () => {
  const { patched } = applyKeyOnlyPatch(PROD_V12_SHAPE);
  const shortened = patched.split('\n').filter((l) => !l.includes('const CORS')).join('\n');
  assert.throws(() => assertOnlyKeyChanges(PROD_V12_SHAPE, shortened), (e) => e.code === 'UNEXPECTED_LINE_DELTA');
});

test('le bundle prod simulé ne porte pas les gardes financières du dépôt', () => {
  const repoSource = readFileSync(join(FUNCTIONS_DIR, 'scpi-certified-promote', 'index.ts'), 'utf8');
  for (const needle of [
    'WITHDRAWAL_MISLABELLED_AS_SUBSCRIPTION',
    'CAPITALISATION_PARTS_MISMATCH',
    'MATERIAL_TOF_QA_REQUIRED',
    'TOF_OUT_OF_RANGE',
    'DEBT_OUT_OF_RANGE',
    'FORBIDDEN_ASPIM_TOF',
  ]) {
    assert.match(repoSource, new RegExp(needle), `le dépôt doit porter ${needle}`);
    assert.equal(PROD_V12_SHAPE.includes(needle), false, `le bundle prod simulé ne doit pas porter ${needle}`);
  }
});

test('appliqué au fichier d avant migration, le patch reproduit exactement le diff clé de #457', () => {
  // Preuve de fidélité : le patch clé-seul appliqué au fichier de dfc6b309 doit produire,
  // à l'octet près, le fichier de 675ab161 (la PR #457 n'a modifié que ces deux lignes).
  const before = execFileSync('git', ['show', 'dfc6b309:supabase/functions/scpi-certified-promote/index.ts'], {
    cwd: join(FUNCTIONS_DIR, '..', '..'),
    encoding: 'utf8',
  });
  const after = execFileSync('git', ['show', '675ab161:supabase/functions/scpi-certified-promote/index.ts'], {
    cwd: join(FUNCTIONS_DIR, '..', '..'),
    encoding: 'utf8',
  });
  const { patched } = applyKeyOnlyPatch(before);
  assert.equal(patched, after);
});

test('le nom de clé cible est paramétrable sans altérer le reste', () => {
  const { patched } = applyKeyOnlyPatch(PROD_V12_SHAPE, { name: 'default' });
  assert.match(patched, /readServiceKey\(\(k\) => Deno\.env\.get\(k\), "default"\)/);
});

test('le patch n introduit aucune valeur de clé', () => {
  const { patched } = applyKeyOnlyPatch(PROD_V12_SHAPE);
  assert.doesNotMatch(patched, /sb_secret_[A-Za-z0-9]/);
  assert.doesNotMatch(patched, /sb_publishable_[A-Za-z0-9]/);
  assert.doesNotMatch(patched, /eyJ[A-Za-z0-9_-]{10,}/);
  assert.ok(patched.includes(SERVICE_KEY_IMPORT));
});
