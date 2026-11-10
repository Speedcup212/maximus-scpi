// RECOVERY-200 / chantier C — cohérence du rapport des trois états publics.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const report = JSON.parse(fs.readFileSync('reports/industrial-20261110/public-quality-20261110.json', 'utf8'));

test('per-SCPI states add up to the published totals for the 69 SCPI', () => {
  const rows = Object.values(report.per_scpi_verified_partial_blocked);
  assert.equal(rows.length, 69);
  const sum = index => rows.reduce((total, row) => total + row[index], 0);
  assert.deepEqual([sum(0), sum(1), sum(2)], [report.totals_all_69.verified, report.totals_all_69.partial, report.totals_all_69.blocked]);
  const reasons = Object.values(report.partial_reasons).reduce((a, b) => a + b, 0);
  assert.equal(reasons, report.totals_all_69.partial);
});

test('every blocked metric is a withdrawn value, never a published zero', () => {
  assert.equal(report.blocked.length, report.totals_all_69.blocked);
  for (const item of ['ficommerce-proximite:distribution_par_part', 'selectipierre-2:distribution_par_part', 'primovie:parts_attente_retrait']) {
    assert.ok(report.blocked.includes(item), item);
  }
});

test('a published value that differs from its certification is never counted as verified', () => {
  assert.equal(report.published_value_differs_from_certified.length, report.partial_reasons.certified_value_differs);
  for (const [, , , published, certified] of report.published_value_differs_from_certified) assert.notEqual(published, certified);
});
