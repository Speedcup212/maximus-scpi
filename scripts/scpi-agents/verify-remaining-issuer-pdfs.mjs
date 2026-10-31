import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const sources = [
  ['altixia-cadence-12','https://api.rock-n-data.io/fichiers/publications/6a708fd02b6f8415260897.pdf','ALTIXIA'],
  ['atream-hotel','https://atream.com/wp-content/uploads/2026/07/Bulletin-N2026_2T-SCPI_Atream_Hotels_WEB_10-PAGES.pdf','ATREAM'],
  ['buroboutic-metropoles','https://www.fiducial-gerance.fr/content/download/1410/40287?version=4','BUROBOUTIC'],
  ['cristal-rente','https://corpocdn.blob.core.windows.net/blobfiles/IG_CRBulletin_Trimestriel2026_T2_V2_.pdf','CRISTAL']
];
const out='artifacts/remaining-scpi-issuer-docs'; await mkdir(out,{recursive:true});
const rows=[];
for(const [slug,url,needle] of sources){
 const row={slug,url,sha256:null,status:'pending',origin:slug==='altixia-cadence-12'?'third_party_mirror':'issuer_or_issuer_cdn',issuer_authorship_checked:false};
 try {
  const res=await fetch(url,{headers:{'User-Agent':'MaximusSCPI-source-QA/1.0'},signal:AbortSignal.timeout(55000)});
  row.http_status=res.status;
  if(!res.ok)throw Error('HTTP '+res.status);
  const bytes=Buffer.from(await res.arrayBuffer());
  if(bytes.length<1024||bytes.subarray(0,5).toString()!=='%PDF-')throw Error('Not a PDF');
  row.sha256=createHash('sha256').update(bytes).digest('hex');row.bytes=bytes.length;
  const file=out+'/'+slug+'.pdf';await writeFile(file,bytes);
  const p=spawnSync('pdfinfo',[file],{encoding:'utf8',timeout:20000});row.pages=Number((p.stdout||'').match(/^Pages:\s*(\d+)/m)?.[1]||0)||null;
  const t=spawnSync('pdftotext',['-layout',file,'-'],{encoding:'utf8',maxBuffer:15*1024*1024,timeout:30000});
  if(t.status!==0)throw Error('Text extractor failed');
  const txt=String(t.stdout||'').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  row.issuer_authorship_checked=txt.includes(needle)&&/2026/.test(txt);
  row.t2_ref=/(30[\/\.\-]06[\/\.\-]2026|2ND TRIMESTRE 2026|2EME TRIMESTRE 2026|T2 2026|2T 2026)/i.test(txt);
  await writeFile(out+'/'+slug+'.txt',t.stdout);
  if(!row.issuer_authorship_checked||!row.t2_ref)throw Error('Issuer/period not safely verified');
  row.status='PDF_SHA256_TEXT_SOURCE_VERIFIED_FIELD_QA_PENDING';
 }catch(e){row.status='source_unverified';row.problem=String(e.message||e)}
 rows.push(row);console.log('SOURCE_AUDIT',JSON.stringify(row));
}
await writeFile(out+'/manifest.json',JSON.stringify({generated_at:new Date().toISOString(),schema_version:1,rows,
warning:'Does not constitute final regulatory certification; mirror is not official publisher host.'},null,2)+'\n');
if(rows.some(x=>x.status!=='PDF_SHA256_TEXT_SOURCE_VERIFIED_FIELD_QA_PENDING'))process.exitCode=1;
