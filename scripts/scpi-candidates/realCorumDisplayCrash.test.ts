import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {scpiData} from '../../src/data/scpiData.ts';
import {scpiDataExtended} from '../../src/data/scpiDataExtended.ts';
import {enrichScpiExtended} from '../../src/utils/enrichScpiExtended.ts';
import {resolveScpiIndicator} from '../../src/indicators/resolveScpiIndicator.ts';
import {sourceBackedPortfolioDescription} from '../../src/utils/scpiSourcePortfolioDescription.ts';
const catalog=JSON.parse(fs.readFileSync(new URL('../../src/data/scpi_complet.json',import.meta.url),'utf8'));
const cases=[
 ['CORUM Eurion',224.07],['CORUM Origin',1186.30],
 ['CORUM USA',216.34],['CORUM XL',194.27]
] as const;
test('CRASH: four official values survive enrichment although discounts remain UNAPPROVED',()=>{
 for(const [name,expected] of cases){
  const row=catalog.find((r:Record<string,unknown>)=>r['Nom SCPI']===name);
  const original=scpiDataExtended.find(x=>x.name===name);
  const parsed=scpiData.find(x=>x.name===name);
  assert.ok(row&&original&&parsed,name);
  assert.equal(row['Valeur de reconstitution par part (€)'],expected,name);
  assert.equal(parsed.valeurReconstitution,expected,name);
  assert.equal(parsed.discountQaStatus,'manual_review',name);
  const enriched=enrichScpiExtended(original,scpiData);
  assert.equal(enriched.reconstitutionValue,expected,name);
  const discount=resolveScpiIndicator({
   price:enriched.price,reconstitutionValue:enriched.reconstitutionValue,
   discountQaStatus:enriched.discountQaStatus,discount:enriched.discount
  },'decote_surcote');
  assert.equal(discount.value,null,name+' cannot expose unsourced decote');
 }
});
test('CRASH: new 2026 CORUM analyses never have a blank published strategy',()=>{
 for(const [name] of cases){
  const scpi=scpiDataExtended.find(x=>x.name===name);
  assert.ok(scpi,name);
  assert.ok(scpi.strategy.startsWith('Répartition publiée (T2 2026)'),name);
  assert.ok(scpi.strategy.includes('Risque de perte en capital') || scpi.strategy.includes('risque de perte en capital'),name);
  assert.ok(scpi.strategy.includes('pays :'),name);
  assert.ok(scpi.strategy.includes('secteurs :'),name);
 }
});
test('CRASH: no invented sector, country or metric when upstream source absent',()=>{
 assert.equal(sourceBackedPortfolioDescription({sectors:[],countries:[]}), '');
 const s=sourceBackedPortfolioDescription({
  referencePeriod:'T2 2026',sectors:[{name:'Bureaux',value:73},{name:'Commerces',value:7}],
  countries:[{name:'France',value:19}]
 });
 assert.match(s,/Bureaux \(73 %\)/);
 assert.match(s,/France \(19 %\)/);
 assert.doesNotMatch(s,/WALT|WALB|nombre de locataires/);
});
test('CRASH: UI flags missing detailed rental KPIs and marks source dates without changing finance',()=>{
 const source=fs.readFileSync(new URL('../../src/components/fintech/AnalysisDetailModal.tsx',import.meta.url),'utf8');
 assert.match(source,/scpi-source-based-analysis/);
 assert.match(source,/scpi-rental-source-coverage/);
 assert.match(source,/Aucune estimation n’est substituée/);
 assert.match(source,/décote non certifiée/);
 assert.match(source,/Distribution\{distributionYear!==null/);
 assert.match(source,/Valeur sourcée/);
});
