import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {assertExactGeography} from './officialAllocationParity.mjs';
const snapshot=JSON.parse(fs.readFileSync(new URL('../../data-import/corum_candidates_prepublication_20261015.json',import.meta.url),'utf8'));
const reviewed={
 'corum-eurion':{'Espagne':6,'Finlande':6,'France':19,'Irlande':19,'Italie':14,'Lettonie':1,'Pays-Bas':27,'Portugal':8},
 'corum-origin':{'France':7,'Italie':16,'Espagne':9,'Estonie':1,'Irlande':12,'Belgique':7,'Finlande':9,'Lettonie':1,'Lituanie':2,'Pays-Bas':27,'Portugal':2,'Allemagne':5,'Slovénie':2},
 'corum-usa':{'États-Unis':100},
 'corum-xl':{'Canada':1,'Italie':3,'Espagne':3,'Irlande':4,'Pologne':21,'Belgique':1,'Norvège':2,'Pays-Bas':9,'Portugal':1,'Allemagne':1,'Royaume-Uni':54}
};
test('All 4 SCPI have exact country mappings matching archived 2026 T2 verified publisher PDFs',()=>{
 assert.equal(snapshot.scpi.length,4);
 for(const c of snapshot.scpi){
  assert.equal(assertExactGeography(c,{repartition_geographique:reviewed[c.scpi_slug]}),true);
  const doc=c.pdfs.find(x=>x.period==='2026-T2');
  const src=c.publishing_sources.geographic_allocation;
  assert.equal(src.sha256,doc.sha256,c.scpi_slug);
  assert.equal(src.url,doc.url,c.scpi_slug);
  assert.equal(src.page,4,c.scpi_slug);
  assert.ok(c.publishing_sources.sector_allocation?.sha256===doc.sha256,c.scpi_slug);
 }
});
test('A simple 100% total never permits country labels and weights to be mixed up',()=>{
 const c=snapshot.scpi.find(x=>x.scpi_slug==='corum-eurion');
 const wrong={...reviewed['corum-eurion'],Italie:1,Lettonie:6,Portugal:14,Finlande:8};
 assert.equal(Object.values(wrong).reduce((a,b)=>a+b,0),100);
 assert.throws(()=>assertExactGeography(c,{repartition_geographique:wrong}),/country percentage mismatch/);
 assert.throws(()=>assertExactGeography(c,{repartition_geographique:{...wrong,'Suisse':0}}),/country-count mismatch/);
});
