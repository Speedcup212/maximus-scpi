import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { isNewsEditoriallyValid } from '../../src/utils/scpiNewsEditorialGate.mjs';
const dist=path.resolve('dist');
const news=JSON.parse(fs.readFileSync('data/news/scpi-investment-news-latest.json','utf8'));
const reports=JSON.parse(fs.readFileSync('data/news/scpi-actualites-69.json','utf8')).dossiers;
const redirects=JSON.parse(fs.readFileSync('data/news/actualites-legacy-redirects.json','utf8')).redirects;
const redirectRules=fs.readFileSync(path.join(dist,'_redirects'),'utf8');
const sitemap=fs.readFileSync(path.join(dist,'sitemap.xml'),'utf8');
const index=fs.readFileSync(path.join(dist,'actualites','index.html'),'utf8');
const slug=t=>String(t||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
const route=e=>'/actualites/'+slug(e.scpi)+'/'+e.date+'-'+slug(e.title).slice(0,90)+'/';
assert.ok(news.length>=31,'Publishing valid events unexpectedly shrank');
assert.equal(reports.length,69,'All 69 quarterly editorial dossiers must remain available');
assert.ok(redirects.length>=13,'Legacy acquisition redirects missing after publication cleanup');
const routes=new Set(),ids=new Set(),keys=new Set();
for(const e of news){
 assert.ok(e.id&&!ids.has(e.id),'Duplicate article ID');ids.add(e.id);
 assert.ok(e.sourceOfficial && /^https:\/\//.test(e.sourceUrl) && isNewsEditoriallyValid(e),'Source/gate QA failure: '+e.title);
 assert.match(e.date,/^\d{4}-\d{2}-\d{2}$/,'Undated acquisition: '+e.id);
 assert.ok(Number.isFinite(Date.parse(e.date)) && Date.parse(e.date)<=Date.now()+24*3600*1000,'Wrong date: '+e.id);
 assert.ok(e.summary.length>=90 && e.summary.trim().toLowerCase()!==e.title.trim().toLowerCase(),'Thin or duplicate story: '+e.title);
 assert.doesNotMatch(e.summary,/Partager l'article|Temps de lecture|Votre profil CGP|-->|\bRelations associés\b/i,'Navigation leak: '+e.id);
 const fingerprint=[slug(e.scpi),e.date,slug(e.city),e.assetType].join('|');
 assert.ok(!keys.has(fingerprint),'Duplicate SCPI/date/city/type event '+fingerprint);keys.add(fingerprint);
 const loc=route(e);
 const destination=path.join(dist,loc.slice(1),'index.html');
 assert.ok(!routes.has(loc),'Article route collision '+loc);routes.add(loc);
 assert.ok(fs.existsSync(destination),'Missing article page '+loc);
 const html=fs.readFileSync(destination,'utf8');
 assert.ok(html.includes('<h1>')&&html.includes(e.title.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')),'Missing article title: '+e.id);
 assert.ok(html.includes('<link rel="canonical" href="https://maximusscpi.com'+loc+'"'),'Bad canonical: '+e.id);
 assert.ok(html.includes('datetime="'+e.date+'"'),'Published date not displayed: '+e.id);
 assert.ok(html.includes('Consulter la source officielle'),'Official source not displayed: '+e.id);
 assert.ok(sitemap.includes('<loc>https://maximusscpi.com'+loc+'</loc>'),'Sitemap omission: '+loc);
 assert.ok(index.includes('href="'+loc+'"'),'Hub omits acquisition link '+loc);
}
for(const d of reports){
 const dest=path.join(dist,'actualites',d.slug,'index.html');
 assert.ok(fs.existsSync(dest),'Missing quarterly dossier '+d.slug);
 for(const event of d.linkedEvents) assert.ok(news.some(e=>e.sourceUrl===event.sourceUrl&&e.title===event.title),'Stale 69 dossier event '+d.slug);
}
const byTitle=s=>news.find(e=>e.title.includes(s));
const optimale=byTitle('Optimale investit environ 4,4');assert.ok(optimale&&optimale.country==='France'&&optimale.assetType==='commerce'&&optimale.city.includes('Belz'));
const ficommerce=byTitle('Ficommerce Proximité acquiert un restaurant');assert.equal(ficommerce?.city,'La Garde');assert.equal(ficommerce?.surface,'390 m²');
const buroboutic=byTitle('Buroboutic Métropoles acquiert un restaurant');assert.equal(buroboutic?.city,'Séquedin (Englos)');assert.equal(buroboutic?.surface,'545 m²');
assert.equal(byTitle('Iroko Atlas acquiert un actif logistique à Portlaoise')?.city,'Portlaoise');
const altaLeyment=news.find(e=>e.scpi==='Alta Convictions'&&e.city==='Leyment');
assert.equal(altaLeyment?.surface,'13 030 m²','Leyment logistics property size');
assert.equal(altaLeyment?.tenant,'Filiale du groupe Jacky Perrenot','Leyment tenant');
const ncapHotel=byTitle('NCap Régions signe sa première acquisition');
assert.ok(ncapHotel&&ncapHotel.operationType==='acquisition_vefa'&&ncapHotel.surface==='5 383 m²');
const transitions=news.filter(e=>e.scpi==='Transitions Europe');
assert.ok(transitions.length>=7&&transitions.every(e=>e.date),'Transitions Europe missing publication dates');
const epsicap=news.filter(e=>e.scpi==='Epsicap Nano');
assert.equal(epsicap.filter(e=>e.city==='Grenade').length,1,'Granada duplicate');
assert.equal(epsicap.filter(e=>e.city==='Perth').length,1,'Perth duplicate');
for(const r of redirects){
 assert.ok(routes.has(r.to),'Redirect has unindexable destination '+r.to);
 for(const old of [r.from.replace(/\/$/,''),r.from.replace(/\/$/,'')+'/']){
  assert.ok(redirectRules.split(/\r?\n/).some(line=>line.startsWith(old+' ')&&line.includes(' '+r.to+' 301!')),'Missing permanent redirect '+old);
 }
}
console.log(JSON.stringify({result:'PASS',events:news.length,acquisitionPages:routes.size,documentaryReports:reports.length,redirects:redirects.length,transitions:transitions.length,review:"Supabase status verified separately"}));
