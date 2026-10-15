// Fail closed: all 4 CORUM must share a complete public SEO release.
// This is a POST-BUILD test, not a publishing script.
import fs from 'node:fs';
import path from 'node:path';
const ids=['corum-origin','corum-xl','corum-eurion','corum-usa'];
const j=(p)=>JSON.parse(fs.readFileSync(p,'utf8'));
const cohort=j('src/data/certified_scpi_cohort.json');
const catalog=j('src/data/scpi_complet.json');
const clean=n=>String(n).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const releaseIds=ids.filter(id=>cohort.slugs.includes(id));
if(releaseIds.length===0){
  if(catalog.some(row=>ids.includes(clean(row['Nom SCPI']))))
    throw Error('Unreleased CORUM illegally present in runtime catalog');
  console.log('CORUM SEO: blocked as expected; no public pages required.');
  process.exit(0);
}
if(releaseIds.length!==4)throw Error('Partial CORUM release not allowed');
const mapped=catalog.filter(row=>ids.includes(clean(row['Nom SCPI'])));
if(mapped.length!==4)throw Error('CORUM public cohort != runtime catalog');
const sitemap=fs.readFileSync('dist/sitemap.xml','utf8');
for(const id of ids){
  const filename=path.join('dist',id,'index.html');
  if(!fs.existsSync(filename))throw Error('Missing static SEO route: '+filename);
  const html=fs.readFileSync(filename,'utf8');
  const canonical='https://maximusscpi.com/'+id+'/';
  if(!html.includes(canonical))throw Error('Wrong/missing canonical for '+id);
  if(!/<title[ >]/i.test(html))throw Error('Missing HTML title for '+id);
  if(!/SCPI/i.test(html))throw Error('Missing SCPI primary content: '+id);
  if(/<meta[^>]*name=["']robots["'][^>]*noindex/i.test(html))
    throw Error('CORUM route accidentally noindexed: '+id);
  if(!sitemap.includes('<loc>'+canonical+'</loc>'))
    throw Error('CORUM SEO absent from sitemap: '+id);
}
console.log('CORUM SEO: all four canonical pages and sitemap PASS.');
