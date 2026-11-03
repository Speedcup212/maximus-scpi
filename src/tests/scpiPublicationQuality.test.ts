import {describe,it,expect} from 'vitest';
import {canRecommendScpi,formatScpiReferenceDate,getMetricDate,isFeatureDisabled,isPublishedWithReserves}
 from '../utils/scpiPublicationQuality';
describe('Scpi publication with caveats',()=>{
 const scpi={maximusPublicationStatus:'published_with_reserves' as const,
  maximusDisabledFeatures:['share_movement_trend','suitability_recommendations'],
  metricProvenance:{prix_reconstitution:{reference_date:'2025-12-31'}},
  maximusSourcePeriode:'2026-T2'};
 it('blocks recommendations and affected derived trends',()=>{
  expect(canRecommendScpi(scpi)).toBe(false);
  expect(isPublishedWithReserves(scpi)).toBe(true);
  expect(isFeatureDisabled(scpi,'share_movement_trend')).toBe(true);
  expect(isFeatureDisabled(scpi,'suitability_recommendations')).toBe(true);
  expect(isFeatureDisabled(scpi,'other_metric')).toBe(false);
 });
 it('retains exact annual date without inventing current-quarter valuation',()=>{
  expect(getMetricDate(scpi,'prix_reconstitution')).toBe('31/12/2025');
  expect(formatScpiReferenceDate('2026-02-31')).toBeNull();
  expect(formatScpiReferenceDate('2026-T2')).toBeNull();
  expect(formatScpiReferenceDate('2026-06-30')).toBe('30/06/2026');
 });
 it('preserves certified legacy entries as eligible',()=>{
  expect(canRecommendScpi({maximusPublicationStatus:'certified'})).toBe(true);
  expect(isFeatureDisabled({maximusPublicationStatus:'certified',maximusDisabledFeatures:['share_movement_trend']},'share_movement_trend')).toBe(false);
 });
});
