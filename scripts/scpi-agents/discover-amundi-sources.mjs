import { mkdir,writeFile } from 'node:fs/promises';
const sites=[
'https://quellescpi.com/scpi/edissimmo/',
'https://scpi.toniram.com/fiche-scpi/rivoli-avenir-patrimoine/',
'https://fortunyconseil.fr/placements/scpi/rivoli-avenir-patrimoine/',
'https://scpiradar.fr/scpi/edissimmo/',
'https://scpiradar.fr/scpi/rivoli-avenir-patrimoine/',
'https://www.amundi-immobilier.com/Local-content/Producsheet/SCPI/EDISSIMMO/Documents',
'https://www.amundi-immobilier.com/Local-content/Producsheet/SCPI/RIVOLI-AVENIR-PATRIMOINE/Documents'
];
const o='artifacts/amundi-bulletin-link-inventory'; await mkdir(o,{recursive:true});
const rows=[];
for(const url of sites){
 let r={url,status:'pending',links:[]};
 try{
 const resp=await fetch(url,{signal:AbortSignal.timeout(22000),headers:{'User-Agent':'Mozilla/5.0 (compatible; MaximusIssuerAudit/1.0)'}});
 r.status_code=resp.status;r.final_url=resp.url;
 if(!resp.ok)throw Error('HTTP '+resp.status);
 const html=await resp.text();
 r.bytes=html.length;
 const links=[];
 for(const m of html.matchAll(/<a\b[^>]*href\s*=\s*(['"])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi)){
  const tag=m[0],label=m[3].replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim(),href=m[2].replace(/&amp;/g,'&');
  if(/pdf|2026|bulletin|s1|semestriel|edissimmo|rivoli|download|telecharger|télécharger|document/i.test(label+' '+href+tag)){
   try{links.push({label:label.slice(0,130),href:new URL(href,url).href})}catch{}
  }
 }
 r.links=links.slice(0,120);r.status='links_parsed';
 const id=new URL(url).hostname.replace(/[^a-z0-9]/gi,'_')+'_'+rows.length;
 await writeFile(o+'/'+id+'.txt',html.slice(0,100000),'utf8');
 }catch(e){r.status='unavailable';r.error=String(e.message||e)}
 rows.push(r);console.log('AMUNDI_DISCOVERY',JSON.stringify({url:r.url,status:r.status,links:r.links.slice(0,25)}));
}
await writeFile(o+'/links.json',JSON.stringify({generated_at:new Date().toISOString(),rows},null,2)+'\n');
