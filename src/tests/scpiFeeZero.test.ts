import {describe,it,expect} from 'vitest';
import {transformSupabaseScpiToScoringInput} from '../utils/scpiDataTransformer';
import {scoreScpiBatch} from '../utils/scpiScoring';
describe('regulatory fee zero versus unknown',()=>{
 it('does not replace explicit zero with legacy fees',()=>{
  expect(transformSupabaseScpiToScoringInput({id:1,nom:'Test',frais_souscription:0,fees:12}).frais_souscription).toBe(0);
 });
 it('does not award zero-fee bonus for missing subscription fee',()=>{
  const rows=scoreScpiBatch([{id:1,nom:'Unknown',rendement:5,frais_souscription:null},{id:2,nom:'Zero',rendement:5,frais_souscription:0}],undefined,false);
  expect(JSON.stringify(rows[0])).not.toContain('frais_souscription=0');
  expect(JSON.stringify(rows[1])).toContain('frais_souscription=0');
 });
});

import {mergeScpiWithLiveIndicators} from '../utils/scpiLiveData';
describe('live fee reconciliation',()=>{
 const original:any={id:1,name:'Test',fees:10,fraisGestion:12,metricProvenance:{frais_souscription:{reference_date:'2026-01-01',source_url:'https://issuer.example/old.pdf'}}};
 it('preserves static value and its provenance when incoming tax basis is unknown',()=>{
  const merged=mergeScpiWithLiveIndicators(original,{scpi_slug:'test',frais_souscription:0,frais_gestion:0,metric_provenance:{frais_souscription:{source_url:'https://issuer.example/new.pdf'}}});
  expect(merged.fees).toBe(10);
  expect(merged.fraisGestion).toBe(12);
  expect(merged.metricProvenance?.frais_souscription).toEqual(original.metricProvenance.frais_souscription);
 });
 it('unknown live fee does not erase documented zero',()=>{
  expect(mergeScpiWithLiveIndicators({...original,fees:0},{scpi_slug:'test',frais_souscription:null}).fees).toBe(0);
 });
});
