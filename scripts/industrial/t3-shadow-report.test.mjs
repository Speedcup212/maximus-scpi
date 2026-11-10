// RECOVERY-200 / chantier B — cohérence de la simulation de promotion T3 par métrique.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const report = JSON.parse(fs.readFileSync('reports/industrial-20261110/t3-per-metric-shadow-20261110.json', 'utf8'));
const rows = Object.entries(report.per_scpi);

test('the simulation is read-only and still requires a decision', () => {
  assert.match(report.mode, /lecture seule/);
  assert.equal(report.decision_required, true);
});

test('per-SCPI counts add up to the reviewed totals', () => {
  assert.equal(rows.length, report.scpi_at_t2_with_t3_certifications);
  assert.equal(rows.reduce((s, [, r]) => s + r.promotable, 0), report.proven_after_review);
  assert.equal(rows.reduce((s, [, r]) => s + r.held, 0), report.not_proven + report.rejected_or_review);
  assert.equal(report.initially_proven - report.rejected_by_plausibility_review.length, report.proven_after_review);
  for (const [slug, r] of rows) assert.equal(r.metrics.split(',').length, r.promotable, slug);
});

test('dated metrics and rejected values are never promoted', () => {
  for (const [slug, r] of rows) {
    for (const metric of r.metrics.split(',')) assert.ok(!['td', 'td_annee', 'prix_reconstitution', 'valeur_realisation'].includes(metric), `${slug}:${metric}`);
  }
  assert.ok(!report.per_scpi['novaxia-neo'].metrics.includes('tof'));
  assert.ok(!report.per_scpi['primovie'].metrics.includes('endettement'));
  assert.ok(!report.per_scpi['atream-hotel'].metrics.includes('endettement'));
});
