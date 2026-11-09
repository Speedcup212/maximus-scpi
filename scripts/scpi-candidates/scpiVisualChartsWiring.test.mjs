import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

test('les fiches SCPI partagent un point de montage Radar + Trajectoire', () => {
  const component = read('src/components/ScpiVisualAnalysis.tsx');
  assert.match(component, /<ScpiPremiumAnalysis\s+scpi=\{scpi\}/);
  assert.match(component, /<ScpiTrajectoryPanel scpiSlug=\{scpiSlug\}/);
  assert.match(component, /scpi-radar-unavailable/);
});

test('pages publiques et vues secondaires utilisent le composant commun', () => {
  const publicPage = read('src/components/OptimizedScpiLandingPage.tsx');
  const detailPage = read('src/components/ScpiDetailPage.tsx');
  const legacyLanding = read('src/components/ScpiLandingPage.tsx');
  const exampleLanding = read('src/components/ScpiExamplePage.tsx');
  const staticApp = read('src/ScpiApp.tsx');
  assert.match(publicPage, /import ScpiVisualAnalysis from '\.\/ScpiVisualAnalysis';/);
  assert.match(detailPage, /import ScpiVisualAnalysis from '\.\/ScpiVisualAnalysis';/);
  assert.match(publicPage, /<ScpiVisualAnalysis\s+scpi=\{realScpiData\}/);
  assert.match(detailPage, /<ScpiVisualAnalysis scpi=\{scpi\}/);
  assert.match(legacyLanding, /<ScpiVisualAnalysis/);
  assert.match(exampleLanding, /<ScpiVisualAnalysis/);
  assert.doesNotMatch(staticApp, /ScpiTrajectoryPortal/);
});

test('lien du Radar et états indisponibles restent explicites', () => {
  const analysis = read('src/components/ScpiPremiumAnalysis.tsx');
  const navigation = read('src/components/ScpiDecisionHubPortal.tsx');
  const trajectory = read('src/components/trajectory/ScpiTrajectoryPanel.tsx');
  assert.match(analysis, /id="radar-scpi" data-testid="scpi-radar-chart"/);
  assert.match(navigation, /getElementById\('radar-scpi'\)/);
  assert.match(trajectory, /scpi-trajectory-insufficient-history/);
});

test('la Trajectoire sans historique reste lisible sur un fond clair', () => {
  const trajectory = read('src/components/trajectory/ScpiTrajectoryPanel.tsx');
  assert.match(trajectory, /data-testid="scpi-trajectory-insufficient-history" className="border-y border-slate-800 bg-slate-950 py-8 text-white"/);
  assert.match(trajectory, /<h3 className="text-sm font-semibold text-white">Trajectoire historique en cours de constitution<\/h3>/);
  assert.match(trajectory, /<p className="mt-2 text-xs leading-5 text-slate-300">/);
  assert.match(read('.github/workflows/build-verification.yml'), /scpi-visual-contrast-browser\.mjs/);
});
