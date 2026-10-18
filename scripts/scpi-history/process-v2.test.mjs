import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';

const read = (p) => readFileSync(new URL('../../' + p, import.meta.url), 'utf8');

test('raccordement historique explicite entre catalogue, Scpi et analyse', () => {
  const sync = read('scripts/syncScpiCatalogFromIndicators.ts');
  const source = read('src/data/scpiData.ts');
  const modal = read('src/components/fintech/AnalysisDetailModal.tsx');
  assert.match(sync, /scpi_history_readiness_v1/);
  assert.match(sync, /maximus_history_status/);
  assert.match(sync, /NOT_ASSESSED/);
  assert.match(source, /historyYearsExpected/);
  assert.match(source, /historyYearsVerified/);
  assert.match(modal, /scpi-history-coverage/);
  assert.match(modal, /Historique non certifié intégralement/);
});

test('les scripts historiques ne déclarent pas de PASS_100 sur le simple comptage', () => {
  const sql = read('supabase/migrations/20261018_scpi_history_evidence_readiness_v1.sql');
  assert.match(sql, /verified_value/);
  assert.match(sql, /manual_verified_official/);
  assert.match(sql, /CORE_HISTORY_VERIFIED/);
  assert.match(sql, /BLOCKED_START_YEAR_UNVERIFIED/);
  assert.match(sql, /source_page/);
});

test('extraction annuelle : exercices anciens en attente QA, protection des données manuelles', () => {
  const src = read('supabase/functions/scpi-annual-safe-extract/index.ts');
  assert.match(src, /historical_candidates_pending_year_column_qa/);
  assert.match(src, /protected_manual_verified/);
  assert.match(src, /hasTargetYearAround/);
  assert.doesNotMatch(src, /has2025Around/);
});

test('pas de propriétés de couverture annuelle en double', () => {
  for (const p of ['src/types/scpi.ts','src/data/scpiData.ts','src/data/scpiDataExtended.ts']) {
    const src = read(p);
    assert.match(src, /historyStatus/);
    if (p.endsWith('scpiData.ts')) assert.equal((src.match(/historyStatus:/g)||[]).length, 1);
    if (p.endsWith('scpiDataExtended.ts')) assert.equal((src.match(/historyStatus:/g)||[]).length, 1);
  }
});
