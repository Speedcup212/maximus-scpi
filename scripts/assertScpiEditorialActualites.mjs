import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const catalog=JSON.parse(fs.readFileSync('data/news/scpi-actualites-69.json','utf8'));
const cohort=JSON.parse(fs.readFileSync('src/data/certified_scpi_cohort.json','utf8'));
assert.equal(catalog.count,69);
assert.equal(catalog.dossiers.length,69);
assert.equal(new Set(catalog.dossiers.map(d=>d.slug)).size,69);
assert.deepEqual([...catalog.dossiers.map(d=>d.slug)].sort(),[...cohort.slugs].sort());
assert.ok(catalog.dossiers.filter(d=>d.comparisonCertified===true).length>=59,'certified comparative analyses regressed');
assert.ok(catalog.dossiers.filter(d=>d.comparisonCertified!==true).length<=10,'history reservations increased unexpectedly');
assert.ok(catalog.dossiers.filter(d=>d.currentSourceCertified!==true).length<=1,'current source certification regressed');
for(const d of catalog.dossiers){
  assert.match(d.period,/^2026-T[1-4]$/,'period must be clearly indicated');
  assert.match(d.sourceUrl,/^https:\/\//,'every report must have a source');
  assert.ok(d.headline.startsWith(d.name+ ' :'),'title is unique to the SCPI');
  assert.ok(d.sections.length>=4,'detailed editorial analysis required');
  assert.ok(d.sections.flatMap(s=>s.paragraphs).join(' ').split(/\s+/).length>=200,'not merely a generic summary');
  if(!d.comparisonCertified)assert.ok(d.sections.some(s=>s.basis==='historique_non_certifie'),'unverified history must be disclosed');
  if(!d.currentSourceCertified)assert.equal(d.certificationStatus,'review_required');
  const page=path.resolve('dist','actualites',d.slug,'index.html');
  assert.ok(fs.existsSync(page),'static page missing '+d.slug);
  const html=fs.readFileSync(page,'utf8');
  assert.ok(html.includes('<h1>'),'article H1 missing '+d.slug);
  assert.ok(html.includes('href="https://maximusscpi.com/actualites/'+d.slug+'/"'),'canonical missing '+d.slug);
  assert.ok(html.includes('rel="noopener noreferrer nofollow"'),'official provenance link missing '+d.slug);
  assert.ok(!html.includes('width="1200" height="700"'),'no fake generic photo');
  if(!d.currentSourceCertified)assert.match(html,/noindex,follow/,'uncertified current source should not be indexed');
}
const map=fs.readFileSync('dist/sitemap.xml','utf8');
const hub=fs.readFileSync('dist/actualites/index.html','utf8');
for(const d of catalog.dossiers){
 assert.ok(map.includes('<loc>https://maximusscpi.com/actualites/'+d.slug+'/</loc>'),'missing sitemap '+d.slug);
 assert.ok(hub.includes('/actualites/'+d.slug+'/'),'index missing link '+d.slug);
}
console.log('QA 69/69 dossiers, 59 certified comparisons + 10 disclosed reserves, canonical and sitemap: PASS');
