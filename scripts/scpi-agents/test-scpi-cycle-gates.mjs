import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const file = (path) => readFileSync(new URL('../../' + path, import.meta.url), 'utf8');

test('Edge watcher stages extracted data; never directly publishes scpi_indicators', () => {
  const source = file('supabase/functions/scpi-bulletin-watch/index.ts');
  assert.match(source, /edge_staged_independent_qa/);
  assert.match(source, /staged pending independent source-page QA/);
  assert.doesNotMatch(source, /const wr=cur\?await db\.from\("scpi_indicators"\)\.update/);
  assert.doesNotMatch(source, /db\.from\("scpi_indicators"\)\.insert\(\{scpi_slug:s\.scpi_slug/);
});

test('Netlify scheduled crawler preserves the published indicators until certification', () => {
  const source = file('netlify/functions/utils/scpi-bulletin-ingestion.ts');
  assert.match(source, /staged_independent_qa/);
  assert.match(source, /candidate staged, public snapshot preserved/);
  assert.doesNotMatch(source, /\.from\('scpi_indicators'\)\s*\.upsert\(merged/);
  assert.doesNotMatch(source, /\.from\('scpi_indicators'\)\s*\.update\(merged/);
});

test('Evidence worker is distinct from extraction and does not promote public indicators', () => {
  const source = file('supabase/functions/scpi-evidence-certify/index.ts');
  assert.match(source, /evidence_stats/);
  assert.match(source, /pdf_page_text_match/);
  assert.doesNotMatch(source, /from\(["']scpi_indicators["']\)/);
});
