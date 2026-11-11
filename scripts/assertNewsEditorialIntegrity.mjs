import assert from 'node:assert/strict';
import fs from 'node:fs';
import { isNewsEditoriallyValid, newsEditorialReviewReason } from '../src/utils/scpiNewsEditorialGate.mjs';

const snapshot=JSON.parse(fs.readFileSync('data/news/scpi-investment-news-latest.json','utf8'));
const reports=JSON.parse(fs.readFileSync('data/news/scpi-actualites-69.json','utf8'));
assert.ok(Array.isArray(snapshot)&&snapshot.length>=30,'unexpected news volume drop');
assert.equal(reports.dossiers.length,69,'the 69 certified documentary reports must remain present');

const bad=snapshot.map(item=>({item,reason:newsEditorialReviewReason(item)})).filter(x=>x.reason);
assert.deepEqual(bad.map(x=>({title:x.item.title,reason:x.reason})),[],'unverified news slipped into fallback');
const updated=snapshot.filter(x=>x.scpi==='Cristal Life');
assert.equal(updated.length,1,'Cristal Life must have only the rewritten, verified Dublin article');
assert.match(updated[0].title,/27,65 M€/,'Dublin title is incomplete');
assert.ok(updated[0].summary.includes('Regus')&&updated[0].summary.includes('3 167 m²'));
assert.ok(updated[0].sourceUrl.startsWith('https://www.inter-gestion.com/'));

const eventSources=new Set(snapshot.map(x=>x.sourceUrl));
for(const dossier of reports.dossiers){
  for(const event of dossier.linkedEvents){
    assert.ok(eventSources.has(event.sourceUrl),'a 69 SCPI brief links to a quarantined or missing event: '+dossier.slug);
    assert.ok(isNewsEditoriallyValid(event),'a 69 SCPI brief links to a contaminated event: '+dossier.slug);
  }
}
if(fs.existsSync('dist/actualites/index.html')){
  const html=fs.readFileSync('dist/actualites/index.html','utf8');
  assert.doesNotMatch(html,/>InterGestion<\/h2>|Votre profil CGP|Relations associés/);
}
console.log('Editorial QA: clean acquisition snapshot, 69 valid dossiers, verified Cristal Life replacement and no stale event cross-links.');
