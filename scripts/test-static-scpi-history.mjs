import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Exercise the served HTML generator, without exporting internals or depending
// on the current catalog and its changing quarterly snapshots.
function generate(history, period = '2026-T2') {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'maximus-history-'));
  try {
    for (const dir of ['scripts', 'src/data', 'dist']) fs.mkdirSync(path.join(fixture, dir), { recursive: true });
    fs.copyFileSync(path.join(repository, 'scripts/generateOptimizedStaticPages.js'), path.join(fixture, 'scripts/generateOptimizedStaticPages.js'));
    fs.writeFileSync(path.join(fixture, 'package.json'), '{"type":"module"}');
    fs.writeFileSync(path.join(fixture, 'src/data/certified_scpi_cohort.json'), JSON.stringify({ count: 1, slugs: ['fixture'] }));
    fs.writeFileSync(path.join(fixture, 'src/data/scpi_complet.json'), JSON.stringify([
      { 'Nom SCPI': 'Fixture', maximus_source_periode: period, 'Capitalisation (M€)': 1380 }
    ]));
    fs.writeFileSync(path.join(fixture, 'src/data/scpiIndicatorHistory.json'), JSON.stringify({ rows: history.map(row => ({ scpi_slug: 'fixture', ...row })) }));
    fs.writeFileSync(path.join(fixture, 'dist/index.html'), '<!doctype html><html><head><title>Home</title><script type="module" src="/app.js"></script></head><body><div id="root"><main><h1>Home</h1></main></div></body></html>');
    execFileSync(process.execPath, [path.join(fixture, 'scripts/generateOptimizedStaticPages.js')], { cwd: fixture, stdio: 'pipe' });
    return fs.readFileSync(path.join(fixture, 'dist/fixture/index.html'), 'utf8');
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
}

test('A history behind the displayed quarter does not emit a change block', () => {
  const html = generate([
    { source_period: '2025-T3', capitalisation: 1200, tof: 98 },
    { source_period: '2026-T1', capitalisation: 1250, tof: 99 }
  ]);
  assert.match(html, /1380 M€/);
  assert.doesNotMatch(html, /Ce qui a changé|<div class="scpi-history-card"/);
});

test('An aligned history with no variation does not emit a change block', () => {
  const html = generate([
    { source_period: '2026-T1', capitalisation: 1380, tof: 99 },
    { source_period: '2026-T2', capitalisation: 1380, tof: 99 }
  ]);
  assert.doesNotMatch(html, /Ce qui a changé|<div class="scpi-history-card"/);
});

test('An aligned history with a documented variation keeps its values and periods', () => {
  const html = generate([
    { source_period: '2026-T2', capitalisation: 1380, tof: 99 },
    { source_period: '2026-T1', capitalisation: 1250, tof: 98 }
  ]);
  assert.match(html, /Ce qui a changé sur Fixture/);
  assert.match(html, /2026-T1 → 2026-T2/);
  assert.match(html, /Variation \+130 M€/);
});

test('Missing periods or missing values cannot create a change', () => {
  const rows = [
    { source_period: '2026-T1', capitalisation: null, tof: null },
    { source_period: '2026-T2', capitalisation: 1380, tof: 99 }
  ];
  assert.doesNotMatch(generate(rows), /Ce qui a changé/);
  assert.doesNotMatch(generate(rows, null), /Ce qui a changé/);
});

test('A later snapshot is not compared with an earlier displayed quarter', () => {
  assert.doesNotMatch(generate([
    { source_period: '2026-T2', tof: 98 },
    { source_period: '2026-T3', tof: 99 }
  ]), /Ce qui a changé/);
});
