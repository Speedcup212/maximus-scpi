import {createHash} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const docs=[['edissimo-2026-t1','https://www.amundi-immobilier.com/ezjscore/call/ezjscamundibuzz::sfForwardFront::paramsList=service=ProxyGedApi&routeId=_dl_a361affa-1e37-4235-aa8a-e434436fd3c4','edissimmo'],['edissimo','https://www.amundi-immobilier.com/ezjscore/call/ezjscamundibuzz::sfForwardFront::paramsList=service=ProxyGedApi&routeId=_dl_b1f04db8-c532-40f1-9847-b0f840fff7d6','edissimmo'],['rivoli-avenir-patrimoine','https://www.amundi-immobilier.com/ezjscore/call/ezjscamundibuzz::sfForwardFront::paramsList=service=ProxyGedApi&routeId=_dl_0b692331-20c6-4ef9-a5e7-b79ba1651047','rivoli']];
const out='artifacts/amundi-issuer-pdfs';await mkdir(out,{recursive:true});
const rows=[];
for(const [slug,url,key] of docs){
 const row={slug,url,status:'pending',issuer:'Amundi Immobilier',file_sha256:null};
 try{
  const u=new URL(url);
  if(u.hostname!=='www.amundi-immobilier.com'||!u.pathname.includes('/ezjscore/call/'))throw Error('Unsupported issuer-host source');
  const response=await fetch(url,{signal:AbortSignal.timeout(60000),headers:{'User-Agent':'Mozilla/5.0 (compatible; MaximusSCPI-issuer-audit/1.0)','Accept':'application/pdf,*/*'}});
  row.http_status=response.status;row.final_url=response.url;
  if(!response.ok)throw Error('HTTP '+response.status);
  const bytes=Buffer.from(await response.arrayBuffer());row.bytes=bytes.length;
  if(bytes.length<1500||bytes.subarray(0,5).toString()!=='%PDF-')throw Error('Publisher URL not a PDF');
  row.file_sha256=createHash('sha256').update(bytes).digest('hex');
  const file=out+'/'+slug+'.pdf';await writeFile(file,bytes);
  const info=spawnSync('pdfinfo',[file],{encoding:'utf8',timeout:20000});
  row.pages=Number((info.stdout||'').match(/^Pages:\s*(\d+)/m)?.[1]||0)||null;
  const txt=spawnSync('pdftotext',['-layout',file,'-'],{encoding:'utf8',maxBuffer:15e6,timeout:30000});
  if(txt.status!==0)throw Error('pdftotext failed');
  await writeFile(out+'/'+slug+'.txt',txt.stdout);
  const s=String(txt.stdout).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  row.product_issuer_match=s.includes(key)&&s.includes('amundi');
  row.period_reference=s.includes('2026')&&(slug==='edissimo-2026-t1'
    ? /(31[\/\.\-]03[\/\.\-]2026|31 mars 2026|1er trimestre 2026|trimestre 2026|mars 2026)/i.test(s)
    : /1er semestre|1er janvier.*30 juin|30\/06\/2026|30 juin 2026|semestre 2026|premier semestre/i.test(s));
  if(!row.product_issuer_match||!row.period_reference)throw Error('Issuer/product/period unconfirmed');
  row.status='ISSUER_ORIGINAL_PDF_SHA256_VERIFIED_FIELD_QA_PENDING';
 }catch(err){row.status='unverified';row.error=String(err.message||err)}
 rows.push(row);console.log('AMUNDI_ISSUER_PDF',JSON.stringify(row));
}
await writeFile(out+'/manifest.json',JSON.stringify({rows,generated_at:new Date().toISOString()},null,2)+'\n');
if(rows.some(x=>x.status!=='ISSUER_ORIGINAL_PDF_SHA256_VERIFIED_FIELD_QA_PENDING'))process.exitCode=1;
