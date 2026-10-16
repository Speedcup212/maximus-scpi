// Source-availability CRASH TEST of the 4 official CORUM Q1 bulletin records.
// This does NOT recertify financial fields; it tests whether the existing
// independently stored SHA and declared URL point to the same LIVE issuer PDF.
// "verified in SQL" must not substitute for an issuer-downloadable document.
import {createHash} from 'node:crypto';
import pdfParse from 'pdf-parse';
const data=[
 {slug:'corum-origin',url:"https://www.corum.fr/sites/default/files/2026-04/CORUM%20Origin%20-%20Fil%20d%27Actualit%C3%A9s%202026-T1%20%28Alias%29.pdf",sha:"9460af970ef68989dcfbb6006de4c1af8697282bb780db53688a13fd9e8bb607",pages:7,archive:"https://www.corum.fr/nos-scpi/corum-origin/documents"},
 {slug:'corum-eurion',url:"https://www.corum.fr/sites/default/files/2026-04/CORUM%20Eurion%20-%20Fil%20d%27Actualit%C3%A9s%202026-T1%20%28Alias%29.pdf",sha:"fcc3e7a0c48812fe5274474d2dab0727d863b780113a665e910b1e3626e0e68e",pages:7,archive:"https://www.corum.fr/nos-scpi/eurion/documents"},
 {slug:'corum-usa',url:"https://www.corum.fr/sites/default/files/2026-04/CORUM%20USA%20-%20Fil%20d%27Actualit%C3%A9s%202026-T1%20%28Alias%29.pdf",sha:"3f281dfcb0ddef36cc6c4fc1e765ffe749a5feb48c36fb7581b725c141a8b878",pages:7,archive:"https://www.corum.fr/nos-scpi/corum-usa/documents"},
 {slug:'corum-xl',url:"https://www.corum.fr/sites/default/files/2026-04/CORUM%20XL%20-%20Fil%20d%27Actualit%C3%A9s%202026-T1%20%28Alias%29.pdf",sha:"5ff8c827cfd1f1e25a5d8c3bf8a4ddbf4e00eeeecbe5a5cff3d8676b40128037",pages:8,archive:"https://www.corum.fr/nos-scpi/corum-xl/documents"}
];
let pass=0;let errors=[];
const headers={'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36'};
for(const fund of data){
 try{
  const r=await fetch(fund.url,{headers,signal:AbortSignal.timeout(30000)});
  console.log('SOURCE_Q1_HTTP',fund.slug,r.status,r.url,r.headers.get('content-type'));
  if(!r.ok)throw Error('official Q1 PDF URL HTTP '+r.status);
  const bytes=Buffer.from(await r.arrayBuffer());
  if(bytes.length<3000||bytes.subarray(0,5).toString()!=='%PDF-')
   throw Error('official Q1 URL does not return PDF');
  const sha=createHash('sha256').update(bytes).digest('hex');
  if(sha!==fund.sha)throw Error('issuer Q1 PDF SHA mismatch: original='+fund.sha+' fetched='+sha);
  const p=await pdfParse(bytes);
  if(p.numpages!==fund.pages)throw Error('Q1 page count mismatch: expected '+fund.pages+' actual '+p.numpages);
  const content=String(p.text||'').toLowerCase();
  if(!content.includes('corum')||!content.includes(fund.slug.split('-')[1]))
   throw Error('The stored source PDF does not contain correct product identity');
  console.log('SOURCE_Q1_IDENTITY_SHA_PAGES_PASS',fund.slug,sha,p.numpages,p.text.length);
  pass++;
 }catch(e){
  errors.push({slug:fund.slug,url:fund.url,error:String(e.message||e)});
  console.log('SOURCE_Q1_FAIL',JSON.stringify(errors.at(-1)));
  try{
   const r=await fetch(fund.archive,{headers,signal:AbortSignal.timeout(20000)});
   const html=await r.text();
   const mark=html.search(/2026.{0,8}T1/i);
   const matches=[...html.matchAll(/.{0,240}(?:2026.{0,8}T1|2026-T1).{0,320}/gis)].slice(0,3);
   console.log('OFFICIAL_ARCHIVE_DIAGNOSTIC',fund.slug,r.status,
      'hits',matches.length,
      matches.map(m=>m[0].replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').slice(0,450)));
   if(mark<0)console.log('OFFICIAL_ARCHIVE_NO_Q1_MATCH',fund.slug);
  }catch(a){console.log('OFFICIAL_ARCHIVE_FETCH_FAILURE',fund.slug,String(a.message||a));}
 }
}
console.log('CORUM_Q1_REAL_ISSUER_PDF_SHA_VERIFIED',pass,'OF',data.length);
if(errors.length)throw Error('Q1 issuer PDFs cannot be source-certified at recorded URL; '+errors.map(x=>x.slug+':'+x.error).join('; '));
