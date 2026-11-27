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

const REPO = join(FUNCTIONS_DIR, '..', '..');

function hasCommit(sha) {
  try {
    execFileSync('git', ['cat-file', '-e', `${sha}^{commit}`], { cwd: REPO, stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/** Rend un commit disponible ; retourne false si l'historique reste inaccessible. */
function ensureCommit(sha) {
  if (hasCommit(sha)) return true;
  try {
    execFileSync('git', ['fetch', '--depth=1', 'origin', sha], {
      cwd: REPO,
      stdio: 'ignore',
      timeout: 60_000,
    });
  } catch {
    return false;
  }
  return hasCommit(sha);
}

function showFile(sha, path) {
  return execFileSync('git', ['show', `${sha}:${path}`], { cwd: REPO, encoding: 'utf8' });
}

test('le patch est l inverse exact du diff clé appliqué au fichier réel du dépôt', () => {
  // Preuve disponible dans tout clone, sans historique git : en retirant du fichier actuel
  // (post-#457) l'import et en restaurant la résolution legacy, on retrouve le fichier
  // d'avant migration ; réappliquer le patch doit rendre les octets d'origine.
  const current = readFileSync(join(FUNCTIONS_DIR, 'scpi-certified-promote', 'index.ts'), 'utf8');
  const preMigration = current
    .split('\n')
    .filter((l) => l !== SERVICE_KEY_IMPORT)
    .map((l) => l.replace(
      /readServiceKey\(\(k\) => Deno\.env\.get\(k\), "scpi_agents"\)/,
      'Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""',
    ))
    .join('\n');
  assert.notEqual(preMigration, current, 'la reconstruction d avant migration a échoué');
  assert.doesNotMatch(preMigration, /readServiceKey/);

  const { patched, changes } = applyKeyOnlyPatch(preMigration);
  assert.equal(patched, current, 'le patch ne restitue pas les octets du fichier du dépôt');
  assert.equal(changes.filter((c) => c.kind === 'KEY_RESOLUTION_REPLACED').length, 1);
  assert.equal(changes.filter((c) => c.kind === 'SERVICE_KEY_IMPORT_ADDED').length, 1);
});

test('appliqué au fichier d avant migration, le patch reproduit exactement le diff clé de #457', (t) => {
  // Deuxième couche de preuve, quand l'historique git est joignable : le fichier reconstruit
  // ci-dessus doit être identique, à l'octet près, à celui de dfc6b309 (dernier main avant #457).
  const path = 'supabase/functions/scpi-certified-promote/index.ts';
  if (!ensureCommit('dfc6b309') || !ensureCommit('675ab161')) {
    t.diagnostic('historique git incomplet : prouvé par aller-retour sur le fichier du dépôt');
    return;
  }
  const before = showFile('dfc6b309', path);
  const after = showFile('675ab161', path);
  const { patched } = applyKeyOnlyPatch(before);
  assert.equal(patched, after);
  assert.equal(after, readFileSync(join(FUNCTIONS_DIR, 'scpi-certified-promote', 'index.ts'), 'utf8'));
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

const ORPHAN_INLINE_SHAPE = [
  'import "jsr:@supabase/functions-js/edge-runtime.d.ts";',
  'import { createClient } from "npm:@supabase/supabase-js@2";',
  "Deno.serve(async(req:Request)=>{if(req.method!=='POST')return Response.json({error:'POST required'},{status:405});const base=Deno.env.get('SUPABASE_URL')||'',key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';if(!base||!key)return Response.json({error:'runtime config missing'},{status:500});const db=createClient(base,key,{auth:{persistSession:false,autoRefreshToken:false}});return Response.json({ok:true});});",
  '',
].join('\n');

test('le patch reconnaît la forme inline minifiée des workers orphelins', () => {
  const { patched, changes } = applyKeyOnlyPatch(ORPHAN_INLINE_SHAPE);
  assert.equal(changes[0].form, 'inline');
  assert.match(patched, /key=readServiceKey\(\(k\)=>Deno\.env\.get\(k\),"scpi_agents"\)/);
  assert.doesNotMatch(patched, /Deno\.env\.get\(['"]SUPABASE_SERVICE_ROLE_KEY['"]\)/);
  assert.match(patched, /import \{ readServiceKey \} from "\.\.\/_shared\/serviceKey\.ts";/);
  assertOnlyKeyChanges(ORPHAN_INLINE_SHAPE, patched);
});

test('le patch refuse une dérive métier sur une ligne inline', () => {
  const { patched } = applyKeyOnlyPatch(ORPHAN_INLINE_SHAPE);
  const tampered = patched.replace('runtime config missing', 'changed message');
  assert.throws(
    () => assertOnlyKeyChanges(ORPHAN_INLINE_SHAPE, tampered),
    (e) => e.code === 'UNAUTHORIZED_EDIT',
  );
});
