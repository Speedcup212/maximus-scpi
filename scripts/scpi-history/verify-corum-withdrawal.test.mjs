import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const get = (file) => readFileSync(new URL('../../' + file, import.meta.url), 'utf8');
const catalog = JSON.parse(get('src/data/scpi_complet.json'));
const cases=[
 ['CORUM Origin',1135,999.21,11],
 ['CORUM XL',195,171.60,2],
 ['CORUM Eurion',215,189.20,3],
 ['CORUM USA',200,176.00,13],
];

test('les 4 prix de retrait CORUM existent et correspondent aux frais contractuels',()=>{
 const vals=new Set();
 for(const [name,prix,retrait,page] of cases){
   const row=catalog.find(r=>r['Nom SCPI']===name);
   assert.ok(row,name+' absent');
   assert.equal(row['Prix de souscription (€)'],prix);
   assert.equal(row['Valeur de retrait (€)'],retrait);
   assert.equal(row.maximus_prix_retrait_source_page,page);
   assert.equal(row.maximus_prix_retrait_reference_period,'2026-T2');
   assert.match(row.maximus_prix_retrait_source_url,/^https:\/\//);
   assert.match(row.maximus_prix_retrait_definition,/sans garantie/i);
   assert.ok(retrait>0&&retrait<prix);
   vals.add(name);
 }
 assert.equal(vals.size,4);
});

test('la chaîne de build lit la certification avec service-role et ne dérive jamais le retrait des frais seuls',()=>{
 const sync=get('scripts/syncScpiCatalogFromIndicators.ts');
 assert.match(sync,/historyClient\.from\('scpi_metric_certifications'\)/);
 assert.match(sync,/\.eq\('metric','prix_retrait'\)/);
 assert.match(sync,/\.eq\('verification_status','manual_verified_official'\)/);
 assert.match(sync,/Number\(retraitProof\.value_numeric\) === Number\(row\.prix_retrait\)/);
 assert.match(sync,/delete scpi\.maximus_prix_retrait_source_url/);
});

test('la valeur de retrait est visible dans les deux surfaces, avec provenance et mise en garde',()=>{
 const source=get('src/data/scpiData.ts');
 const extended=get('src/data/scpiDataExtended.ts');
 const modal=get('src/components/fintech/AnalysisDetailModal.tsx');
 const trajectory=get('src/components/trajectory/ScpiTrajectoryPanel.tsx');
 assert.match(source,/retraitSourceUrl:/);
 assert.match(extended,/retraitSourceUrl: scpi\.retraitSourceUrl/);
 assert.match(modal,/scpi-withdrawal-value/);
 assert.match(modal,/scpi\.retraitSourceUrl/);
 assert.match(modal,/sans garantie de liquidité ni de délai/);
 assert.match(trajectory,/trajectory-withdrawal-current/);
 assert.match(trajectory,/currentScpi\.retraitSourceUrl/);
 assert.doesNotMatch(trajectory,/dataKey="prix_retrait"/);
});
