import {describe,it,expect} from 'vitest';
import proposal from '../../data-import/batches/sofidynamic-valuation-prepared-20261104.json';
import {scpiData} from '../data/scpiData';
import {getScpiDatedDiscount} from '../utils/scpiDatedDiscount';

describe('source-backed private Sofidynamic valuation proposal is not a publication',()=>{
 it('keeps November reporting distinct from June valuation and December historical valuation',()=>{
  expect(proposal.source.document_period).toBe('2026-T3');
  expect(proposal.proposed_valuation.reference_date).toBe('2026-06-30');
  expect(proposal.historical_valuation_preserved.value_numeric).toBe(336.75);
  expect(proposal.historical_valuation_preserved.reference_date).toBe('2025-12-31');
  expect(proposal.independent_review_completed).toBe(false);
  expect(proposal.publication_authorized).toBe(false);
  expect(proposal.production_write_authorized).toBe(false);
 });
 it('calculates the proposed 5.99 percent only as an indication; preserves published data and exclusions',()=>{
  const current=scpiData.find(s=>s.name==='Sofidynamic');
  if(!current)throw Error('Missing existing Sofidynamic');
  const draft={...current,valeurReconstitution:proposal.proposed_valuation.value_numeric,
   metricProvenance:{...current.metricProvenance,prix_reconstitution:proposal.proposed_valuation}};
  expect(getScpiDatedDiscount(draft)?.formatted).toBe('5,99 %');
  expect(draft.discountQaStatus).toBe('manual_review');
  expect(draft.isRecommended).toBe(false);
  expect(current.valeurReconstitution).toBe(336.75);
  expect(getScpiDatedDiscount(current)?.formatted).toBe('4,97 %');
 });
});
