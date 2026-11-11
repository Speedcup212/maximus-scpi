import assert from 'node:assert/strict';
import fs from 'node:fs';

const manifest=JSON.parse(fs.readFileSync('data/news/scpi-t3-2026-certification-review.json','utf8'));
const journal=JSON.parse(fs.readFileSync('data/news/scpi-actualites-69.json','utf8'));
assert.equal(journal.dossiers.length,69);
assert.equal(manifest.candidates,manifest.items.length);
assert.ok(manifest.items.length>=20);
assert.equal(manifest.items.filter(x=>x.state!=='rejected_wrong_document').length,19);
assert.equal(manifest.items.filter(x=>x.state==='rejected_wrong_document').length,3);
assert.equal(new Set(manifest.items.map(x=>x.slug)).size,manifest.items.length);
const by=new Map(journal.dossiers.map(x=>[x.slug,x]));
let proofCount=0;
for(const entry of manifest.items){
 const article=by.get(entry.slug);
 assert.ok(article,'Not in certified 69 SCPI cohort: '+entry.slug);
 assert.equal(article.t3Review.period,'2026-T3');
 assert.equal(article.t3Review.state,entry.state);
 assert.equal(article.period,entry.certifiedAnalysisPeriod,'Certification period changed without proof: '+entry.slug);
 assert.equal(article.t3Review.certifiedQuarter,false);
 if(entry.state==='rejected_wrong_document'){
  assert.equal(article.moreRecentBulletin,null,'False T3 document still announced: '+entry.slug);
  assert.equal(article.t3Review.sourceUrl,null);
  assert.equal(entry.verifiedFields.length,0);
 }else{
  assert.match(article.t3Review.sourceUrl,/^https:\/\//);
  assert.equal(article.moreRecentBulletin?.period,'2026-T3');
 }
 for(const f of entry.verifiedFields){
  assert.ok(Number.isFinite(f.value)&&f.page>0&&f.proof?.length>25,'Invalid field proof '+entry.slug+' / '+f.metric);
  assert.equal(article.t3Review.verifiedFields.find(x=>x.metric===f.metric)?.value,f.value);
  proofCount++;
 }
 const filename='dist/actualites/'+entry.slug+'/index.html';
 assert.ok(fs.existsSync(filename),'Missing static review page '+entry.slug);
 const html=fs.readFileSync(filename,'utf8');
 assert.ok(html.includes('Contrôle 2026-T3')||html.includes('Bulletin 2026-T3 : preuves par indicateur'),'Missing T3 review visibility '+entry.slug);
}
assert.ok(proofCount>=50,'Evidence fields unexpectedly lost');
assert.ok(manifest.items.every(x=>x.certifiedQuarter===false),'Unsafe full-quarter certification claim');
console.log('T3 source review QA PASS: '+manifest.items.length+' source candidates, 19 valid documents, 3 rejected, '+proofCount+' independently proven fields, 69 certified analyses unchanged.');
