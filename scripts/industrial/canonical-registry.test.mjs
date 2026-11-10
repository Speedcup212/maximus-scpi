// RECOVERY-200 / chantier D — registre canonique des sociétés de gestion (migration 20261110).
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {normalizeAlias} from './admission.mjs';

const sql = fs.readFileSync('supabase/migrations/20261110_recovery200_canonical_registry.sql', 'utf8');
const managersBlock = sql.slice(sql.indexOf('insert into scpi_internal.management_companies'), sql.indexOf('on conflict (manager_id)'));
const managerIds = [...managersBlock.matchAll(/\('([a-z0-9-]+)', '/g)].map(m => m[1]);
const aliasBlock = sql.slice(sql.indexOf('from (values'), sql.indexOf(') as a(raw, manager_id'));
const aliases = [...aliasBlock.matchAll(/\('((?:[^']|'')+)', '([a-z0-9-]+)', '(certain|probable)', '/g)]
  .map(m => ({raw: m[1].replace(/''/g, "'"), manager: m[2], confidence: m[3]}));
const manifest = JSON.parse(fs.readFileSync('scripts/industrial/fees/fee-sources.json', 'utf8'));

test('every alias points to a declared management company and keys are unique', () => {
  assert.ok(managerIds.length >= 30);
  const keys = aliases.map(a => normalizeAlias(a.raw));
  assert.equal(new Set(keys).size, keys.length);
  for (const alias of aliases) assert.ok(managerIds.includes(alias.manager), alias.raw);
});

test('every management company named in the 69-SCPI manifest resolves to one canonical company', () => {
  const byKey = new Map(aliases.map(a => [normalizeAlias(a.raw), a.manager]));
  const unresolved = [...new Set(manifest.funds.map(f => f.manager))].filter(name => !byKey.has(normalizeAlias(name)));
  assert.deepEqual(unresolved, []);
  assert.equal(byKey.get(normalizeAlias('Præmia REIM France')), 'praemia-reim-france');
  assert.equal(byKey.get(normalizeAlias('SOFIDY')), 'sofidy');
  assert.equal(byKey.get(normalizeAlias('La Française Real Estate Managers')), byKey.get(normalizeAlias('La Française REM')));
});

test('uncertain group links are flagged probable, never certain', () => {
  const probable = aliases.filter(a => a.confidence === 'probable').map(a => a.raw).sort();
  assert.deepEqual(probable, ['BNP Paribas AM', 'CONSULTIM Asset Management', 'Tikehau Investment Management']);
});
