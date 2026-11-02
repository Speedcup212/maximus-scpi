import test from 'node:test';
import assert from 'node:assert/strict';
import {qualifiedHistoryException} from './certificationHistoryPolicy.mjs';

const currentOnly = () => ({
  certification_status: 'current_certified_history_unverified',
  current_source_certified: true, comparison_certified: false,
  previous_period: '2026-T2', current_period: '2026-T3',
  certification_reasons: [{code: 'history_not_certified'}],
  improvements: [], deteriorations: [], structural_event_detected: false,
  watch_points: [{metric: 'data_quality_history', quality_issue: true,
    message: 'Comparaison historique neutralisée : période précédente non certifiée.'}],
});

test('Current-only release preserves the explicit warning and never certifies comparison', () => {
  const row = currentOnly();
  assert.equal(qualifiedHistoryException(row), true);
  assert.equal(row.comparison_certified, false);
  assert.equal(row.certification_status, 'current_certified_history_unverified');
});

test('Missing current proof, pending review, published trends and unexplained history all block', () => {
  for (const patch of [
    {current_source_certified: false}, {certification_status: 'review_required'},
    {comparison_certified: true}, {previous_period: null}, {current_period: '2026-T2'},
    {improvements: [{metric: 'tof'}]}, {deteriorations: [{metric: 'prix_reconstitution'}]},
    {watch_points: []}, {watch_points: [{metric: 'data_quality_history', quality_issue: false, message: 'Unverified'}]},
    {watch_points: [{metric: 'data_quality_history', quality_issue: true, message: ''}]},
    {certification_reasons: [{code: 'unknown'}]},
    {certification_reasons: [{code: 'history_not_certified'}, {code: 'source_missing'}]},
    {structural_event_detected: true},
  ]) assert.equal(qualifiedHistoryException({...currentOnly(), ...patch}), false, JSON.stringify(patch));
});

test('Existing structural and reporting-cadence exceptions retain their own conditions', () => {
  const structural = {...currentOnly(), certification_reasons: [{code: 'structural_or_extreme_change'}]};
  assert.equal(qualifiedHistoryException(structural), false);
  assert.equal(qualifiedHistoryException({...structural, structural_event_detected: true}), true);
  const semiannual = {...currentOnly(), certification_reasons: [{code: 'semiannual_reporting_cadence'}]};
  assert.equal(qualifiedHistoryException(semiannual), true);
  assert.equal(qualifiedHistoryException({...semiannual, structural_event_detected: true}), false);
});
