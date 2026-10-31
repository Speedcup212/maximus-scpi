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

test('Issuer labelled subscription and withdrawal amounts cannot be confused', () => {
  const watcher = file('supabase/functions/scpi-bulletin-watch/index.ts');
  assert.match(watcher, /subscriptionWithdrawalPair/);
  assert.match(watcher, /withdrawalMislabelSuspected/);
  assert.match(watcher, /v90-labelled-price-pair/);
  const example = '44,00 € Prix de souscription 39,82 € Prix de retrait';
  const found = /(\d{1,5}(?:[.,]\d{1,2})?)\s*€\s+prix\s+de\s+souscription\s+(\d{1,5}(?:[.,]\d{1,2})?)\s*€\s+prix\s+de\s+retrait/i.exec(example);
  assert.equal(found?.[1], '44,00');
  assert.equal(found?.[2], '39,82');
});

test('Certified publisher uses one database transaction for live data and queue', () => {
  const source = file('supabase/functions/scpi-certified-promote/index.ts');
  const migration = file('supabase/migrations/20261031_scpi_certified_atomic_promotion.sql');
  assert.match(source, /db\.rpc\("scpi_commit_certified_promotion"/);
  assert.doesNotMatch(source, /\.update\(meta\)\.eq\("scpi_slug"/);
  assert.match(source, /WITHDRAWAL_MISLABELLED_AS_SUBSCRIPTION/);
  assert.match(source, /MATERIAL_TOF_QA_REQUIRED/);
  assert.match(migration, /CREATE OR REPLACE FUNCTION public\.scpi_commit_certified_promotion/);
  assert.match(migration, /INSERT INTO public\.scpi_publish_queue/);
  assert.match(migration, /ON CONFLICT\(scpi_slug,change_type,publish_after\)/);
  assert.match(migration, /SCPI_UNCERTIFIED_FIELD/);
  assert.match(migration, /GRANT EXECUTE ON FUNCTION public\.scpi_commit_certified_promotion/);
});
