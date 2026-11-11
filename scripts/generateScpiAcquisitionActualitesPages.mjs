/**
 * Crash-test fix: indexable pages for verified acquisition articles, not only the 69
 * documentary SCPI briefs. Never fabricate event dates, values or property photos.
 */
import fs from 'node:fs';
import path from 'node:path';
import { isNewsEditoriallyValid } from '../src/utils/scpiNewsEditorialGate.mjs';
const dist=path.resolve('dist');
const shell=fs.readFileSync(path.join(dist,'index.html'),'utf8');
const news=JSON.parse(fs.readFileSync('data/news/scpi-investment-news-latest.json','utf8'));
const legacy=JSON.parse(fs.readFileSync('data/news/actualites-legacy-redirects.json','utf8')).redirects;
const sitemapPath=path.join(dist,'sitemap.xml');
const redirectPath=path.join(dist,'_redirects');
const hubPath=path.join(dist,'actualites','index.html');
let sitemap=fs.readFileSync(sitemapPath,'utf8');
let redirects=fs.readFileSync(redirectPath,'utf8');
let hub=fs.readFileSync(hubPath,'utf8');
const base='https://maximusscpi.com';
const esc=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const slug=value=>String(value??'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
const getUrl=x=>{try{const u=new URL(x);if(u.protocol==='https:'&&!u.username&&!u.password&&u.hostname&&!/^(localhost|127\.|10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)/.test(u.hostname))return u.href;}catch{}return null;};
const replaceMeta=(html,pattern,tag)=>pattern.test(html)?html.replace(pattern,tag):html.replace('</head>',tag+'\n</head>');
const putRoot=(html,content)=>{
 const a=html.indexOf('<div id="root">'), b=html.indexOf('</body>',a), z=html.lastIndexOf('</div>',b);
 if(a<0||b<a||z<a)throw Error('Missing Vite root in article shell');
 return html.slice(0,a)+'<div id="root">'+content+'</div>'+html.slice(z+6);
};
const localPath=item=>'/actualites/'+slug(item.scpi)+'/'+(item.date||'actualite')+'-'+slug(item.title||'actualite-scpi').slice(0,90)+'/';
if(!Array.isArray(news)||news.length<31)throw Error('Acquisition count has regressed since the verified crash-test baseline');
const ids=new Set(),paths=new Set(),index=[];
for(const item of news){
 const title=String(item.title||'').trim();
 const summary=String(item.summary||'').trim();
 const official=getUrl(item.sourceUrl);
 if(!isNewsEditoriallyValid(item)||!item.sourceOfficial||!official||!title||title.toLowerCase()===summary.toLowerCase()||summary.length<90)
   throw Error('Article has no reliable editorial substance or official source: '+item.id);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(item.date)||Number.isNaN(Date.parse(item.date))||Date.parse(item.date)>Date.now()+24*3600*1000)
   throw Error('Missing, invalid or future publication date: '+item.id);
 if(ids.has(item.id))throw Error('Duplicate article id '+item.id);ids.add(item.id);
 const local=localPath(item),url=base+local;
 if(paths.has(local))throw Error('Article route collision '+local);paths.add(local);
 const seoTitle=title+' | Actualités SCPI | MaximusSCPI';
 const description=summary.slice(0,160);
 const facts=[
  item.city||item.country?['Localisation',[item.city,item.country].filter(Boolean).join(', ')]:null,
  item.assetType&&item.assetType!=='autre_immobilier'?['Type immobilier',item.assetType]:null,
  item.amount?['Montant annoncé',item.amount]:null,
  item.surface?['Surface',item.surface]:null,
  item.tenant?['Locataire ou exploitant',item.tenant]:null,
  item.leaseDuration?['Bail',item.leaseDuration]:null,
 ].filter(Boolean);
 const listing=facts.length?'<dl>'+facts.map(([k,v])=>'<div><dt>'+esc(k)+'</dt><dd>'+esc(v)+'</dd></div>').join('')+'</dl>':'';
 const extensions=[
 ['Implantation et environnement',item.locationContext],
 ['Lecture du risque locatif',item.tenantContext],
 ['Effet sur le patrimoine de la SCPI',item.portfolioContext],
 ['Analyse MaximusSCPI',item.maximusAnalysis],
 ].filter(x=>x[1]&&String(x[1]).trim().length>20);
 const article='<main class="actualites-document"><nav aria-label="Fil d’Ariane"><a href="/">Accueil</a> / <a href="/actualites/">Actualités</a> / <a href="/actualites/'+esc(slug(item.scpi))+'/">'+esc(item.scpi)+'</a></nav>'+
 '<p class="document-kicker">Acquisition documentée · <time datetime="'+esc(item.date)+'">'+esc(item.date)+'</time></p>'+
 '<h1>'+esc(title)+'</h1><p class="document-scpi">SCPI : '+esc(item.scpi)+(item.managementCompany?' · Société de gestion : '+esc(item.managementCompany):'')+'</p>'+
 '<p class="document-lead">'+esc(summary)+'</p>'+listing+
 extensions.map(x=>'<section><h2>'+esc(x[0])+'</h2><p>'+esc(x[1])+'</p></section>').join('')+
 '<section><h2>Vérification documentaire</h2><p>Consultez la communication de la société de gestion avant de réutiliser les chiffres. Un rendement à l’acquisition, s’il est indiqué, n’est pas le taux de distribution de la SCPI.</p>'+
 '<p><a href="'+esc(official)+'" rel="noopener noreferrer nofollow" target="_blank">Consulter la source officielle</a></p></section>'+
 '<p class="document-warning">Les SCPI comportent des risques de perte en capital et de liquidité. Cette information factuelle ne constitue pas une recommandation personnalisée ni une garantie de performance future.</p>'+
 '<p><a href="/actualites/">Retour à toutes les actualités</a></p></main>'+
 '<style>.actualites-document{font:16px/1.7 system-ui,sans-serif;min-height:100vh;background:#101827;color:#cbd5e1;padding:44px max(22px,calc((100vw - 900px)/2)) 70px}.actualites-document a{color:#6ee7b7}.actualites-document nav,.document-kicker{color:#94a3b8;font-size:13px}.actualites-document h1{color:white;font-size:clamp(28px,4.5vw,44px);line-height:1.23;margin:22px 0}.actualites-document h2{font-size:21px;color:white;margin:25px 0 10px}.document-lead{font-size:18px;line-height:1.8}.document-scpi{font-size:13px;color:#86efac}.actualites-document dl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:30px 0}.actualites-document dl div{padding:15px;background:#1f2937;border-radius:10px}.actualites-document dt{font-size:12px;color:#94a3b8}.actualites-document dd{margin:4px 0 0;color:white;font-weight:600}.actualites-document section{border-top:1px solid #334155;padding:13px 0}.document-warning{border-top:1px solid #334155;padding-top:18px;color:#94a3b8;font-size:13px}@media(max-width:600px){.actualites-document dl{grid-template-columns:1fr}}</style>';
 let html=shell;
 html=replaceMeta(html,/<title>[\s\S]*?<\/title>/i,'<title>'+esc(seoTitle)+'</title>');
 html=replaceMeta(html,/<meta\s+name=["']description["'][^>]*>/i,'<meta name="description" content="'+esc(description)+'" />');
 html=replaceMeta(html,/<link\s+rel=["']canonical["'][^>]*>/i,'<link rel="canonical" href="'+url+'" />');
 html=replaceMeta(html,/<meta\s+property=["']og:url["'][^>]*>/i,'<meta property="og:url" content="'+url+'" />');
 html=replaceMeta(html,/<meta\s+property=["']og:title["'][^>]*>/i,'<meta property="og:title" content="'+esc(seoTitle)+'" />');
 html=replaceMeta(html,/<meta\s+property=["']og:description["'][^>]*>/i,'<meta property="og:description" content="'+esc(description)+'" />');
 html=html.replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi,'');
 const structured={'@context':'https://schema.org','@type':'NewsArticle',headline:title,description:summary.slice(0,300),datePublished:item.date,dateModified:new Date().toISOString(),inLanguage:'fr-FR',mainEntityOfPage:url,isBasedOn:official,publisher:{'@type':'Organization',name:'MaximusSCPI'},about:{'@type':'Thing',name:item.scpi}};
 html=html.replace('</head>','<script type="application/ld+json">'+JSON.stringify(structured).replace(/</g,'\\u003c')+'</script></head>');
 const dest=path.join(dist,local.slice(1));fs.mkdirSync(dest,{recursive:true});fs.writeFileSync(path.join(dest,'index.html'),putRoot(html,article));
 if(!sitemap.includes('<loc>'+url+'</loc>'))sitemap=sitemap.replace('</urlset>','<url><loc>'+url+'</loc></url>\n</urlset>');
 index.push('<li><a href="'+esc(local)+'">'+esc(title)+'</a><small>'+esc(item.date)+' · '+esc(item.scpi)+'</small></li>');
}
if(!Array.isArray(legacy)||legacy.length<13)throw Error('Legacy redirects missing');
for(const r of legacy){
 if(!paths.has(r.to))throw Error('Redirect points to unpublished article: '+r.to);
 const from=r.from.replace(/\/$/,'');
 for(const x of [from,from+'/']){
  const rule=x+' '+r.to+' 301!';
  if(!redirects.split(/\r?\n/).some(line=>line.startsWith(x+' ')))redirects=rule+'\n'+redirects;
 }
}
fs.writeFileSync(redirectPath,redirects);
fs.writeFileSync(sitemapPath,sitemap);
const additions='<section class="actualites-acquisition-index"><h2>'+news.length+' acquisitions vérifiées : accès aux articles</h2><p>Dates, localisations et sources officielles de chaque acquisition. Un même actif n’est pas comptabilisé deux fois sous deux communiqués différents.</p><ul>'+index.join('')+'</ul></section>'+
'<style>.actualites-acquisition-index{max-width:1200px;margin:24px auto 64px;padding:12px 24px;color:#cbd5e1}.actualites-acquisition-index h2{color:white;font-size:24px}.actualites-acquisition-index ul{list-style:none;padding:0;columns:2}.actualites-acquisition-index li{margin:0 12px 12px 0;break-inside:avoid}.actualites-acquisition-index li a{color:#6ee7b7;font-size:14px}.actualites-acquisition-index small{display:block;color:#94a3b8}@media(max-width:620px){.actualites-acquisition-index ul{columns:1}}</style>';
if(!hub.includes('class="actualites-acquisition-index"'))hub=hub.replace('</main>',additions+'</main>');
fs.writeFileSync(hubPath,hub);
console.log('Actualités: '+news.length+' pages d’acquisitions indexables, '+legacy.length+' redirections de conservation.');
