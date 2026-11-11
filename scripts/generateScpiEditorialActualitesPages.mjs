import fs from 'node:fs';
import path from 'node:path';

const dist=path.resolve('dist');
const data=JSON.parse(fs.readFileSync('data/news/scpi-actualites-69.json','utf8'));
const dossiers=data.dossiers;
const shell=fs.readFileSync(path.join(dist,'index.html'),'utf8');
const hubPath=path.join(dist,'actualites','index.html');
const sitemapPath=path.join(dist,'sitemap.xml');
let hub=fs.readFileSync(hubPath,'utf8');
let sitemap=fs.readFileSync(sitemapPath,'utf8');
const escape=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const urlOk=v=>typeof v==='string'&&/^https:\/\/[a-z\d.-]+(?:\/|$)/i.test(v);
const setHead=(html,re,tag)=>re.test(html)?html.replace(re,tag):html.replace('</head>',tag+'\n</head>');
const putRoot=(html,body)=>{
 const a=html.indexOf('<div id="root">'), b=html.indexOf('</body>',a), z=html.lastIndexOf('</div>',b);
 if(a<0||b<a||z<a)throw Error('Vite root not found');
 return html.slice(0,a)+'<div id="root">'+body+'</div>'+html.slice(z+6);
};
if(data.count!==69||dossiers.length!==69||new Set(dossiers.map(x=>x.slug)).size!==69)throw Error('Expected exactly 69 unique SCPI');
const links=[];
for(const d of dossiers){
 const allText=d.sections.flatMap(s=>s.paragraphs).join(' ');
 if(!d.headline||!d.period||!urlOk(d.sourceUrl)||d.sections.length<4||allText.split(/\s+/).length<200)throw Error('Editorial QA failed '+d.slug);
 const canonical='https://maximusscpi.com/actualites/'+d.slug+'/';
 const title=d.name+' : actualités et analyse du bulletin '+d.period+' | MaximusSCPI';
 const description=d.name+' : évolutions certifiées, occupation, patrimoine, risques et documents sources au '+d.period+'.';
 const reserve=!d.currentSourceCertified?'Source courante à revoir':!d.comparisonCertified?'Comparaison historique non certifiée':'';
 const sections=d.sections.map(s=>'<section class="editorial-section"><h2>'+escape(s.heading)+'</h2>'+
   (s.basis==='contexte_historique_non_certifie'?'<p class="editorial-reserve">Référentiel historique, période non certifiée : ne pas assimiler au trimestre courant.</p>':'')+
   s.paragraphs.map(p=>'<p>'+escape(p)+'</p>').join('\n')+'</section>').join('\n');
 const events=d.linkedEvents.filter(e=>urlOk(e.sourceUrl)).map(e=>'<li><a href="'+escape(e.sourceUrl)+'" target="_blank" rel="noopener noreferrer nofollow">'+escape((e.date||'Date inconnue')+' — '+e.title)+'</a></li>');
 const newer=d.moreRecentBulletin?'<aside class="editorial-reserve">Bulletin '+escape(d.moreRecentBulletin.period)+' repéré, non encore intégré à l’analyse certifiée '+escape(d.period)+'.</aside>':'';

 const t3=d.t3Review;
 const q3Html=t3
  ? (t3.state==='rejected_wrong_document'
     ? '<aside class="editorial-reserve"><strong>Contrôle 2026-T3 :</strong> un document candidat a été écarté. Il ne constitue pas un bulletin trimestriel admissible ; aucune métrique n’a été réutilisée.</aside>'
     : '<section class="editorial-section"><h2>Bulletin 2026-T3 : preuves par indicateur</h2>'+
       '<p>Document identifié mais analyse trimestrielle non encore certifiée. Le bilan comparatif ci-dessus demeure celui de '+escape(d.period)+'.</p>'+
       (t3.verifiedFields.length
        ? '<ul>'+t3.verifiedFields.slice(0,8).map(f=>'<li>'+escape(f.metric.replace(/_/g,' '))+' : '+escape(Number(f.value).toLocaleString('fr-FR'))+' '+escape(f.unit||'')+' (preuve page '+escape(f.page)+')</li>').join('')+'</ul>'
        : '<p>Aucun indicateur T3 n’est encore publiable sur preuve documentaire individualisée.</p>')+
       (t3.sourceUrl?'<p><a href="'+escape(t3.sourceUrl)+'" target="_blank" rel="noopener noreferrer nofollow">Consulter le bulletin officiel T3</a></p>':'')+
       '<p class="editorial-reserve">Les variations et les chiffres en conflit restent en revue ; aucun indicateur non prouvé n’est présenté comme certifié.</p></section>')
  : '';

 const html='<main class="editorial-report"><nav><a href="/">MaximusSCPI</a> / <a href="/actualites/">Actualités</a> / '+escape(d.name)+'</nav>'+
 '<p class="editorial-kicker">Veille documentée · '+escape(d.period)+'</p><h1>'+escape(d.headline)+'</h1><p class="editorial-lead">'+escape(d.lead)+'</p>'+
 (reserve?'<aside class="editorial-reserve">'+escape(reserve)+'. Les variations non certifiées ne sont pas publiées.</aside>':'')+newer+q3Html+
 sections+(events.length?'<section><h2>Communications officielles associées</h2><ul>'+events.join('')+'</ul></section>':'')+
 '<p><a href="'+escape(d.sourceUrl)+'" target="_blank" rel="noopener noreferrer nofollow">Consulter le document source de '+escape(d.period)+'</a></p>'+
 '<p class="editorial-legal">Analyse documentaire, non personnalisée. Les SCPI comportent des risques de perte en capital et de liquidité.</p></main>'+
 '<style>.editorial-report{background:#101827;color:#cbd5e1;font:16px/1.7 system-ui,sans-serif;min-height:100vh;padding:44px max(20px,calc((100vw - 900px)/2)) 76px}.editorial-report h1{font-size:clamp(30px,5vw,46px);line-height:1.2;color:#fff}.editorial-report h2{font-size:23px;color:#fff}.editorial-report p{margin:12px 0}.editorial-report a{color:#6ee7b7}.editorial-report nav,.editorial-kicker{font-size:13px;color:#94a3b8}.editorial-lead{font-size:19px}.editorial-section{padding:12px 0 22px;border-bottom:1px solid #263244}.editorial-reserve{padding:14px;border-left:3px solid #eab308;background:#282719;color:#fde68a;margin:18px 0}.editorial-legal{border-top:1px solid #263244;padding-top:20px;color:#94a3b8;font-size:13px}</style>';
 let page=shell;
 page=setHead(page,/<title>[\s\S]*?<\/title>/i,'<title>'+escape(title)+'</title>');
 page=setHead(page,/<meta\s+name=["']description["'][^>]*>/i,'<meta name="description" content="'+escape(description)+'" />');
 page=setHead(page,/<link\s+rel=["']canonical["'][^>]*>/i,'<link rel="canonical" href="'+canonical+'" />');
 page=setHead(page,/<meta\s+property=["']og:url["'][^>]*>/i,'<meta property="og:url" content="'+canonical+'" />');
 if(!d.currentSourceCertified)page=setHead(page,/<meta\s+name=["']robots["'][^>]*>/i,'<meta name="robots" content="noindex,follow" />');
 page=page.replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi,'');
 const ld={'@context':'https://schema.org','@type':'Article',headline:d.headline,inLanguage:'fr-FR',datePublished:data.generatedAt,dateModified:data.generatedAt,mainEntityOfPage:canonical,isBasedOn:d.sourceUrl,publisher:{'@type':'Organization',name:'MaximusSCPI'}};
 page=page.replace('</head>','<script type="application/ld+json">'+JSON.stringify(ld).replace(/</g,'\\u003c')+'</script></head>');
 const dest=path.join(dist,'actualites',d.slug);fs.mkdirSync(dest,{recursive:true});fs.writeFileSync(path.join(dest,'index.html'),putRoot(page,html),'utf8');
 if(!sitemap.includes('<loc>'+canonical+'</loc>'))sitemap=sitemap.replace('</urlset>','<url><loc>'+canonical+'</loc></url>\n</urlset>');
 links.push('<li><a href="/actualites/'+escape(d.slug)+'/">'+escape(d.name)+' — '+escape(d.period)+'</a></li>');
}
fs.writeFileSync(sitemapPath,sitemap,'utf8');
if(!hub.includes('class="editorial-scpi-index"')){
 const index='<section class="editorial-scpi-index"><h2>69 analyses SCPI documentées</h2><p>Évolution des indicateurs, risques et sources pour chaque SCPI, avec périodes et réserves explicites.</p><ul>'+links.join('')+'</ul></section>'+
 '<style>.editorial-scpi-index{max-width:1200px;margin:20px auto 70px;padding:0 24px;color:#cbd5e1}.editorial-scpi-index h2{font-size:25px;color:#fff}.editorial-scpi-index ul{columns:3;list-style:none;padding:0}.editorial-scpi-index li{break-inside:avoid;margin:7px 0}.editorial-scpi-index a{font-size:14px;color:#6ee7b7}@media(max-width:850px){.editorial-scpi-index ul{columns:2}}@media(max-width:520px){.editorial-scpi-index ul{columns:1}}</style>';
 hub=hub.replace('</main>',index+'</main>');
 fs.writeFileSync(hubPath,hub,'utf8');
}
// Retirer l'ancien lien corrompu et transmettre son équité SEO vers le dossier certifié.
// La redirection précède le fallback SPA ; elle ne doit pas être ajoutée en double.
const redirectPath=path.join(dist,'_redirects');
if(!fs.existsSync(redirectPath))throw Error('Netlify redirect file missing');
let rules=fs.readFileSync(redirectPath,'utf8');
const canonicalCristal='/actualites/cristal-life/2026-10-21-cristal-life-acquiert-un-immeuble-de-bureaux-a-dublin-pour-27-65-m';
const brokenPaths=[
  '/actualites/cristal-life/2026-10-21-intergestion',
  '/actualites/cristal-life/2026-10-21-intergestion/',
];
for(const brokenPath of brokenPaths){
  if(!rules.split(/\r?\n/).some(line=>line.trim().startsWith(brokenPath+' '))){
    rules=brokenPath+' '+canonicalCristal+' 301\n'+rules;
  }
}
fs.writeFileSync(redirectPath,rules,'utf8');
console.log('69 dossiers SCPI détaillés publiables avec canonical, source et sitemap.');
