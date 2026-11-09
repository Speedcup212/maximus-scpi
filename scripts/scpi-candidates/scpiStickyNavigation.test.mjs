import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = path => readFileSync(new URL('../../' + path, import.meta.url), 'utf8');

test('un seul menu sticky de six rubriques sur le gabarit commun', () => {
  const page = read('src/components/OptimizedScpiLandingPage.tsx');
  const app = read('src/ScpiApp.tsx');
  const navigation = read('src/components/ScpiDecisionHubPortal.tsx');
  assert.match(page, /<ScpiDecisionHubPortal/);
  assert.doesNotMatch(app, /<ScpiDecisionHubPortal/);
  assert.match(navigation, /sticky top-16/);
  assert.match(navigation, /aria-label="Navigation dans la fiche SCPI"/);
  for (const id of ['scpi-synthese','radar-scpi','trajectoire-scpi',
    'scpi-patrimoine','scpi-risques-frais','scpi-documents']) {
    assert.ok(navigation.includes("id: '" + id + "'"), 'Menu item missing: ' + id);
  }
  assert.match(navigation, /document\.getElementById\('radar-scpi'\)/);
  assert.match(navigation, /window\.history\.replaceState/);
  assert.match(navigation, /MAX_SELECTION_SIZE = 6/);
  assert.match(navigation, /aria-current=/);
});

test('sections et sources sont accessibles sans bloc documentaire devant le titre', () => {
  const page = read('src/components/OptimizedScpiLandingPage.tsx');
  assert.match(page, /id="scpi-synthese"/);
  assert.match(page, /id="scpi-patrimoine"/);
  assert.match(page, /id="scpi-risques-frais"/);
  assert.match(page, /id="scpi-documents"/);
  assert.match(page, /id="scpi-simulateur"/);
  const title = page.indexOf('id="scpi-synthese"');
  const sources = page.indexOf('<ScpiPublicationQualityNotice');
  assert.ok(title > 0 && sources > title, 'Sources must follow the SCPI title');
  assert.ok(sources > page.indexOf('id="scpi-documents"'), 'Sources must live in Documents');
  assert.match(page, /data-testid="scpi-sources-details"/);
  assert.match(page, /data-testid="scpi-financial-details"/);
  assert.ok(page.indexOf('<ScpiVisualAnalysis') < page.indexOf('id="scpi-patrimoine"'));
  assert.ok(page.indexOf('id="scpi-patrimoine"') < page.indexOf('id="scpi-risques-frais"'));
  assert.ok(page.indexOf('id="scpi-risques-frais"') < page.indexOf('id="scpi-documents"'));
});

test('aucune altération des gates et données financières', () => {
  const page = read('src/components/OptimizedScpiLandingPage.tsx');
  assert.match(page, /isPublishedWithReserves\(realScpiData\)/);
  assert.match(page, /isFeatureDisabled\(realScpiData,'uncertified_history_comparison'\)/);
  assert.match(page, /isFeatureDisabled\(realScpiData,'suitability_recommendations'\)/);
  assert.match(page, /<ScpiOfficialFacts scpi=\{realScpiData\}/);
  assert.match(page, /<ScpiPublicationQualityNotice scpi=\{realScpiData\}/);
  assert.match(page, /<ThematicSimulator/);
});
