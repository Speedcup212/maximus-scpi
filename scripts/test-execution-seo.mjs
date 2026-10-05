import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { getVerifiedScpiNews, buildScpiEditorialNews } from '../src/utils/scpiNewsRecord.mjs';
import { filterDocumentedNonLiquidityWarnings } from '../src/utils/scpiLiquidityText.mjs';
import { build } from 'esbuild';

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const news = { status: 'verified', text: 'Collecte documentée au T3 2025.', period: '2025-T3', document_date: '2025-10-24', source_document: 'Bulletin T3 2025', source_url: 'https://example.com/bulletin-2025-t3.pdf' };

test('Offline fallback never advertises a stale withdrawal queue or suspended market', () => {
  const warnings = ['Marché des parts suspendu depuis le 12/02/2026', '10,2 % de parts en attente de retrait', 'Concentration bureaux élevée', 'TOF inférieur à 90 %'];
  assert.deepEqual(filterDocumentedNonLiquidityWarnings(warnings), ['Concentration bureaux élevée', 'TOF inférieur à 90 %']);
  assert.deepEqual(filterDocumentedNonLiquidityWarnings(['Carnet du marché secondaire à vérifier']), []);
});

test('The mounted premium consumer renders editorial provenance and refuses LF legacy liquidity offline', async () => {
  const result = await build({
    stdin: { contents: String.raw`
      import assert from 'node:assert/strict';
      import React from 'react';
      import { renderToStaticMarkup } from 'react-dom/server';
      import Component from './src/components/ScpiPremiumAnalysis.tsx';
      import { scpiData } from './src/data/scpiData.ts';
      const base = scpiData.find(s => s.name === 'Transitions Europe');
      const scpi = { ...base, name: 'Fixture provenance QA',
        actualitesTrimestrielles: 'TOF publié : 99 % | Capitalisation publiée : 1 380 M€ | Endettement publié : 0 %',
        actualitePeriode: '2026-T2', actualiteDateDocument: '2026-06-30',
        actualiteSourceDocument: 'te_s1-2026.pdf', actualiteSourceUrl: 'https://example.com/te_s1-2026.pdf' };
      const render = data => renderToStaticMarkup(React.createElement(Component, { scpi: data, landingData: { nom: data.name, societe_gestion: data.company } }));
      const html = render(scpi);
      assert.match(html, /Période du résumé : 2026-T2/);
      assert.match(html, /Document daté : 30 juin 2026/);
      assert.match(html, /href="https:\/\/example.com\/te_s1-2026.pdf"/);
      assert.match(html, /TOF publié : 99 %/);
      assert.match(html, /Capitalisation publiée : 1 380 M€/);
      assert.match(html, /Endettement publié : 0 %/);
      const lf = scpiData.find(s => s.name === 'LF Grand Paris Patrimoine');
      assert.ok(lf);
      assert.doesNotMatch(render(lf), /499.?638|10,2 % de parts en attente|Marché des parts SUSPENDU|suspendu depuis le 12/);
    `, resolveDir: repository, loader: 'js' },
    bundle: true, write: false, platform: 'node', format: 'cjs',
    plugins: [{ name: 'offline-supabase', setup(builder) {
      builder.onLoad({ filter: /(?:supabaseClient|lib\/supabase)\.ts$/ }, () => ({ contents: 'export const supabase = null; export default supabase;', loader: 'js' }));
    } }],
  });
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'maximus-premium-'));
  try {
    const file = path.join(fixture, 'render.cjs');
    fs.writeFileSync(file, result.outputFiles[0].text);
    execFileSync(process.execPath, [file], { cwd: repository, stdio: 'pipe' });
  } finally { fs.rmSync(fixture, { recursive: true, force: true }); }
});

test('Editorial text never inherits a technical snapshot period or missing provenance', () => {
  assert.equal(getVerifiedScpiNews(null), null);
  assert.equal(getVerifiedScpiNews({ text: 'Collecte nette de 135 M€ au T3 2025', period: '2026-T2' }), null);
  for (const invalid of [{ source_url: '' }, { source_url: 'javascript:alert(1)' }, { status: 'pending' }, { document_date: '2025-02-31' }, { period: '2026-T5' }]) {
    assert.equal(getVerifiedScpiNews({ ...news, ...invalid }), null);
  }
  assert.equal(getVerifiedScpiNews(news)?.period, '2025-T3');
});

test('Certified PDF stocks are summarized without technical timestamps or semester flows', () => {
  const source = 'https://www.arkea-reim.com/upload/docs/application/pdf/2026-07/te_s1-2026.pdf';
  const snapshot = { bulletin_id: 'linked', source_period: '2026-T2', source_url: source, source_document: 'te_s1-2026.pdf', tof: 99, capitalisation: 1380, endettement: 0, collecte_nette: 274000000 };
  const analysis = { scpi_slug: 'transitions-europe', certification_status: 'certified', current_source_certified: true, current_period: '2026-T2', certified_source_url: source, current_snapshot: snapshot, generated_at: '2026-10-05T10:00:00Z' };
  const proof = (raw_value, unit) => ({ raw_value, unit, page: 8, method: 'pdf_page_text_match', value_match: true, text: 'Bulletin d’information 30/06/2026 Au 30/06/2026' });
  const bulletin = { id: 'linked', scpi_slug: 'transitions-europe', period: '2026-T2', source_url: source, extraction_json: { evidence: { tof: proof(99, '%'), capitalisation: proof(1380, 'M€'), endettement: proof(0, '%') } } };
  const result = buildScpiEditorialNews(analysis, bulletin);
  assert.equal(result?.document_date, '2026-06-30');
  assert.equal(result?.source_url, source);
  assert.match(result?.text || '', /TOF publié : 99 %/);
  assert.match(result?.text || '', /Endettement publié : 0 %/);
  assert.doesNotMatch(result?.text || '', /274|collecte|Doctrine|vigilance/);
  assert.equal(buildScpiEditorialNews({ ...analysis, certified_source_url: 'https://example.com/wrong.pdf' }, bulletin), null);
  assert.equal(buildScpiEditorialNews({ ...analysis, current_source_certified: false }, bulletin), null);
  assert.equal(buildScpiEditorialNews({ ...analysis, current_period: '2026-T1' }, bulletin), null);
  assert.equal(buildScpiEditorialNews(analysis, { ...bulletin, extraction_json: { evidence: { tof: { ...proof(99, '%'), text: 'TOF publié, sans date documentaire' } } } }), null);
  const mismatched = buildScpiEditorialNews(analysis, { ...bulletin, extraction_json: { evidence: { tof: { ...proof(98, '%') } } } });
  assert.equal(mismatched, null);
});

test('The React data mapping and formatter refuse unsourced legacy news', () => {
  execFileSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', `
    import assert from 'node:assert/strict';
    import fs from 'node:fs';
    import { scpiData } from './src/data/scpiData.ts';
    import { getScpiNews } from './src/utils/scpiAnalysis.ts';
    import { getVerifiedScpiNews } from './src/utils/scpiNewsRecord.mjs';
    const catalog = JSON.parse(fs.readFileSync('./src/data/scpi_complet.json', 'utf8'));
    const transitions = scpiData.find(row => row.name === 'Transitions Europe');
    assert.ok(transitions);
    const grandParis = scpiData.find(row => row.name === 'LF Grand Paris Patrimoine');
    assert.ok(grandParis);
    assert.equal(grandParis.liquidite, undefined);
    assert.ok(!grandParis.maximusWarnings.some(value => /10[,\.]2|suspendu|attente de retrait/i.test(value)));
    assert.equal(getScpiNews({ ...transitions, actualitesTrimestrielles: 'Collecte nette de 135 M€ au T3 2025', actualiteSourceUrl: undefined }), '');
    const rendered = getScpiNews({ ...transitions,
      actualitesTrimestrielles: 'TOF publié : 99 % | Capitalisation publiée : 1 380 M€ | Endettement publié : 0 % | <script>alert(1)</script>',
      actualitePeriode: '2026-T2', actualiteDateDocument: '2026-06-30',
      actualiteSourceDocument: 'te_s1-2026.pdf', actualiteSourceUrl: 'https://example.com/te_s1-2026.pdf'
    });
    assert.match(rendered, /TOF publié : 99 %/);
    assert.match(rendered, /Capitalisation publiée : 1 380 M€/);
    assert.match(rendered, /Endettement publié : 0 %/);
    assert.match(rendered, /&lt;script&gt;/);
    assert.doesNotMatch(rendered, /<script>/);
    for (const raw of catalog) {
      const record = getVerifiedScpiNews(raw.maximus_editorial_news);
      const mapped = scpiData.find(row => row.name === raw['Nom SCPI']);
      if (!mapped) continue;
      assert.equal(mapped.actualitesTrimestrielles, record?.text);
      assert.equal(mapped.actualitePeriode, record?.period);
      assert.equal(mapped.actualiteSourceUrl, record?.sourceUrl);
    }
  `], { cwd: repository, stdio: 'pipe' });
});

test('Vite head entry produces dedicated SCPI roots and analyses HTML with source-bound news', () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'maximus-seo-'));
  try {
    for (const dir of ['scripts', 'src/data', 'src/utils', 'dist']) fs.mkdirSync(path.join(fixture, dir), { recursive: true });
    fs.writeFileSync(path.join(fixture, 'package.json'), '{"type":"module"}');
    for (const script of ['generateOptimizedStaticPages.js', 'enrichScpiStaticHtml.mjs', 'generateSeoStaticShells.js']) {
      fs.copyFileSync(path.join(repository, 'scripts', script), path.join(fixture, 'scripts', script));
    }
    fs.copyFileSync(path.join(repository, 'src/utils/scpiNewsRecord.mjs'), path.join(fixture, 'src/utils/scpiNewsRecord.mjs'));
    fs.copyFileSync(path.join(repository, 'src/utils/scpiLiquidityText.mjs'), path.join(fixture, 'src/utils/scpiLiquidityText.mjs'));
    const catalog = [
      { 'Nom SCPI': 'Transitions Europe', 'Actualités trimestrielles': 'Collecte nette de 135 M€ au T3 2025', maximus_source_periode: '2026-T2', maximus_warnings: ['10,2 % de parts en attente de retrait', 'Marché des parts suspendu depuis le 12/02/2026'] },
      { 'Nom SCPI': 'Comète', maximus_source_periode: '2026-T2', maximus_editorial_news: news },
    ];
    fs.writeFileSync(path.join(fixture, 'src/data/scpi_complet.json'), JSON.stringify(catalog));
    fs.writeFileSync(path.join(fixture, 'src/data/scpiIndicatorHistory.json'), JSON.stringify({ rows: [
      { scpi_slug: 'transitions-europe', source_period: '2026-T1', parts_attente_retrait: 3, prix_retrait: 180, tof: 98 },
      { scpi_slug: 'transitions-europe', source_period: '2026-T2', parts_attente_retrait: 0, prix_retrait: 178, tof: 99 },
    ] }));
    fs.writeFileSync(path.join(fixture, 'dist/index.html'), '<!doctype html><html><head><title>Home</title><link rel="canonical" href="https://maximusscpi.com/"/><script type="module" src="/assets/app.js"></script><script type="application/ld+json">{"@type":"WebPage","url":"https://maximusscpi.com/"}</script></head><body><div id="root"><main><div><h1>SCPI Testez. Comparez. Décidez.</h1></div></main></div></body></html>');
    for (const script of ['generateOptimizedStaticPages.js', 'enrichScpiStaticHtml.mjs', 'generateSeoStaticShells.js']) execFileSync(process.execPath, [path.join(fixture, 'scripts', script)], { cwd: fixture });
    const transitions = fs.readFileSync(path.join(fixture, 'dist/transitions-europe/index.html'), 'utf8');
    assert.match(transitions, /<h1>SCPI Transitions Europe : analyse, indicateurs et risques<\/h1>/);
    assert.doesNotMatch(transitions, /135 M€|Testez\. Comparez\. Décidez\.|\\n/);
    assert.doesNotMatch(transitions, /10,2 % de parts|suspendu depuis/);
    assert.match(transitions, /Résumé en attente de vérification documentaire/);
    assert.doesNotMatch(transitions, /<span>Parts en attente<\/span>|<span>Prix de retrait<\/span>/);
    assert.match(transitions, /<span>TOF<\/span>/);
    assert.match(transitions, /type="module" src="\/assets\/app\.js"/);
    const comete = fs.readFileSync(path.join(fixture, 'dist/comete/index.html'), 'utf8');
    assert.match(comete, /Période du résumé : 2025-T3/);
    assert.match(comete, /Période des indicateurs : 2026-T2/);
    assert.match(comete, /https:\/\/example\.com\/bulletin-2025-t3\.pdf/);
    const analyses = fs.readFileSync(path.join(fixture, 'dist/analyses/index.html'), 'utf8');
    assert.match(analyses, /<link rel="canonical" href="https:\/\/maximusscpi\.com\/analyses\/"/);
    assert.match(analyses, /<h1>Analyses SCPI : indicateurs, trajectoires et risques<\/h1>/);
    assert.equal((analyses.match(/<h1\b/g) || []).length, 1);
    assert.equal((analyses.match(/type="application\/ld\+json"/g) || []).length, 1);
    assert.match(analyses, /href="\/comete\/"/);
    assert.match(analyses, /perte en capital/);
  } finally { fs.rmSync(fixture, { recursive: true, force: true }); }
});
