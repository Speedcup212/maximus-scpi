import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync(new URL('../../src/App.tsx', import.meta.url), 'utf8');

test('App navigation: every literal route used is enumerated in the strict view type', () => {
  const declaration = app.split('\n').find(line =>
    line.includes('const [currentView, setCurrentView] = useState<'));
  assert.ok(declaration, 'navigation state declaration not found');
  const union = declaration.match(/useState<([\s\S]*?)>\(\(\) =>/);
  assert.ok(union, 'navigation union no longer statically inspectable');
  const declared = new Set([...union[1].matchAll(/'([^']+)'/g)].map(m => m[1]));
  const used = new Set([
    ...[...app.matchAll(/setCurrentView\(\s*'([^']+)'/g)].map(m => m[1]),
    ...[...app.matchAll(/currentView\s*(?:===|!==)\s*'([^']+)'/g)].map(m => m[1]),
  ]);
  const missing = [...used].filter(view => !declared.has(view));
  assert.deepEqual(missing, []);
  assert.ok(declared.size < 300, 'do not silently widen view type to any arbitrary string');
});

test('App named-only educational article imports do not access absent default exports', () => {
  const modules = [
    'FondsEurosOuScpiArticle',
    'ScpiDirectOuAssuranceVie',
    'InvestirScpiTmi11PourcentFiscaliteOptimaleArticle',
    'ScpiTmi30PourcentArbitrageAvDirectArticle',
    'ForteImpositionTmi41ScpiAssuranceVieArticle',
    'IfiScpiImpotFortuneImmobiliereStrategiesArticle',
  ];
  for(const moduleName of modules) {
    const source = fs.readFileSync(new URL('../../src/components/articles/' + moduleName + '.tsx', import.meta.url), 'utf8');
    assert.match(source, /export const \w+/);
    const line = app.split('\n').find(l => l.includes("import('./components/articles/" + moduleName + "')"));
    assert.ok(line, 'missing lazy import for ' + moduleName);
    assert.ok(!line.includes('m.default'), 'named-only module using default fallback: ' + moduleName);
  }
});

test('portfolio selection passes the Scpi object, PDF uses the required fields and footer props remain valid', () => {
  assert.match(app, /onAddToPortfolio=\\{isParcoursLocked \\? undefined : \\(scpi\\) => toggleScpiSelection\\(scpi\\)\\}/);
  assert.doesNotMatch(app, /toggleScpiSelection\\(scpi\\.name\\)/);
  assert.match(app, /percentage: scpi\\.allocation \\?\\? 0/);
  assert.match(app, /investedAmount: investmentAmount \\* \\(scpi\\.allocation \\?\\? 0\\) \\/ 100/);
  assert.match(app, /await generatePortfolioPDF\\(portfolio, null, investmentAmount\\)/);
  assert.doesNotMatch(app, /<Footer isDarkMode=/);
});
