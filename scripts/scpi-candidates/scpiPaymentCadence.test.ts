import test from 'node:test';
import assert from 'node:assert/strict';
import { getScpiAdvantages } from '../../src/utils/scpiAnalysis.ts';
import type { Scpi } from '../../src/types/scpi.ts';

const item=(versementLoyers: string|undefined, yieldPercent=6.5):Scpi=>({
 name:'CORUM Origin',yield:yieldPercent,tof:95,capitalization:1_000_000,
 minInvest:1135,company:'CORUM Asset Management',creation:2012,
 repartitionSector:[],repartitionGeo:[],geography:'europe',sector:'diversifie',
 fees:12,versementLoyers
} as unknown as Scpi);
test('monthly distribution is not mislabeled quarterly',()=>{
 const advantages=getScpiAdvantages(item('Mensuelle'));
 assert.ok(advantages.includes('Distribution mensuelle'));
 assert.ok(!advantages.includes('Distribution trimestrielle'));
});
test('documented quarterly distribution stays quarterly',()=>{
 const advantages=getScpiAdvantages(item('Trimestriel'));
 assert.ok(advantages.includes('Distribution trimestrielle'));
 assert.ok(!advantages.includes('Distribution mensuelle'));
});
test('a yield alone never determines payment cadence',()=>{
 for(const value of [undefined,'','Inconnue','N/A']){
  const a=getScpiAdvantages(item(value));
  assert.ok(!a.some(text=>text.startsWith('Distribution ')),String(value));
 }
 const noYield=getScpiAdvantages(item('Mensuelle',0));
 assert.ok(!noYield.some(text=>text.startsWith('Distribution ')));
});
