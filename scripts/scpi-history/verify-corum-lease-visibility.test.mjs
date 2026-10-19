import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const raw = JSON.parse(readFileSync(new URL('../../src/data/scpi_complet.json', import.meta.url), 'utf8'));
const cases = [
  ['CORUM Origin', 6.05],
  ['CORUM XL', 7.45],
  ['CORUM Eurion', 6.36],
  ['CORUM USA', 8.88],
];
test('CORUM T2 2026 : toutes les durées locatives sourcées sans WALT inventée', () => {
  for (const [name, expectedWalb] of cases) {
    const r = raw.find((row) => row['Nom SCPI'] === name);
    assert.ok(r, name + ' absent');
    assert.equal(r.WALB, expectedWalb, name);
    assert.equal(r.WALT, undefined, name + ' ne doit pas contenir de WALT fictive');
    assert.equal(r.maximus_walb_reference_date, '2026-06-30');
    assert.match(r.maximus_walb_definition, /proxy WALB|pondération non communiquée/);
    assert.match(r.maximus_walb_source_url, /^https:\/\/www\.corum\.fr\//);
  }
});
test('L’interface affiche côte à côte les deux indicateurs et leur statut explicite', () => {
  const get = (path) => readFileSync(new URL('../../' + path, import.meta.url), 'utf8');
  const card = get('src/components/trajectory/ScpiLeaseDurations.tsx');
  const modal = get('src/components/fintech/AnalysisDetailModal.tsx');
  const trajectory = get('src/components/trajectory/ScpiTrajectoryPanel.tsx');
  const mapping = get('src/data/scpiData.ts');
  assert.match(card, /Engagement locatif \(assimilable WALB\)/);
  assert.match(card, /Non publiée/);
  assert.match(card, /Aucune WALT distincte vérifiée/);
  assert.match(card, /Bulletin officiel CORUM/);
  assert.match(card, /scpi-walb/);
  assert.match(card, /scpi-walt/);
  assert.match(modal, /<ScpiLeaseDurations/);
  assert.match(trajectory, /<ScpiLeaseDurations/);
  assert.match(mapping, /walbSourceUrl:/);
});
