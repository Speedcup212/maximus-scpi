/**
 * Read-only public PDF acquisition / proof artifact for EdR Europa.
 * Does not mark Supabase rows certified or change live publishing states.
 * Run on GitHub Actions (outbound network, poppler available).
 */
import { createHash } from 'node:crypto';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const base = 'https://edr-europa.com/wp-content/uploads/';
const docs = [
  ['2024-T2','bulletin','2024/08/SCPI-Edmond-de-Rothschild-Bulletin-trimestriel-30-06-2024-1.pdf','30/06/2024'],
  ['2024-T3','bulletin','2024/11/SCPI-Edmond-de-Rothschild-Europa-Bulletin-trimestriel-T3-2024.pdf','30/09/2024'],
  ['2024-S2','bulletin','2025/02/SCPI-Edmond-de-Rothschild-Europa-Bulletin-dinformation-S2-2024-2.pdf','31/12/2024'],
  ['2025-T3','bulletin','2025/11/SCPI-Edmond-de-Rothschild-Europa-Bulletin-dinformation-T3-2025.pdf','30/09/2025'],
  ['2025-S2','bulletin','2026/01/SCPI-Edmond-de-Rothschild-Europa-Bulletin-dinformation-S2-2025.pdf','31/12/2025'],
  ['2026-T1','bulletin','2026/05/SCPI-Edmond-de-Rothschild-Europa-Bulletin-dinformation-T1-2026.pdf','31/03/2026'],
  ['2026-T2','bulletin','2026/07/SCPI-Edmond-de-Rothschild-Europa-Bulletin-dinformation-T2-2026.pdf','30/06/2026'],
  ['2024','rapport_annuel','2025/12/SCPI-Edmond-de-Rothschild-Europa-Rapport-annuel-31-12-2024.pdf','31/12/2024'],
  ['2025','rapport_annuel','2026/07/SCPI-Edmond-de-Rothschild-Europa-Rapport-annuel-31-12-2025.pdf','31/12/2025']
];
const out = process.env.EDR_REPORT_DIR || 'artifacts/edr-europa-source-audit';
await mkdir(out,{recursive:true});
const norm = str => String(str).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').toLowerCase();
const reports=[];
for(const [period,kind,relative,date] of docs){
  const url=new URL(relative,base);
  if(url.hostname!=='edr-europa.com' || !url.pathname.startsWith('/wp-content/uploads/')) throw Error('Untrusted document URL');
  const item={period,kind,url:url.href,expected_reference_date:date,status:'pending',sha256:null,page_count:null,text_match:false,period_match:false,issue:null};
  try{
    const response=await fetch(url,{headers:{'User-Agent':'MaximusSCPI-document-QA/1.0'},signal:AbortSignal.timeout(55000)});
    item.http_status=response.status;
    if(!response.ok) throw Error('HTTP '+response.status);
    const data=Buffer.from(await response.arrayBuffer());
    item.bytes=data.length;
    if(data.length<512 || data.subarray(0,5).toString()!=='%PDF-')throw Error('Source not a PDF');
    item.sha256=createHash('sha256').update(data).digest('hex');
    const file=join(out,`${period}-${kind}.pdf`);
    const txt=join(out,`${period}-${kind}.txt`);
    await writeFile(file,data);
    const pdfinfo=spawnSync('pdfinfo',[file],{encoding:'utf8',timeout:20000});
    item.page_count=Number((pdfinfo.stdout||'').match(/^Pages:\\s*(\\d+)/m)?.[1]||0)||null;
    const result=spawnSync('pdftotext',['-layout',file,txt],{encoding:'utf8',timeout:45000});
    if(result.status!==0)throw Error('pdftotext failed: '+String(result.stderr||'').slice(0,150));
    const text=norm(await readFile(txt,'utf8'));
    item.text_match=text.includes('rothschild')&&text.includes('europa');
    item.period_match=text.includes(date)||text.includes(date.replaceAll('/','-'));
    // The official issuer's footer can say the wrong period on interior pages.
    // Do not promote a value if the document's period identity is unresolved.
    if(!item.text_match)throw Error('Wrong product identity');
    if(!item.period_match)throw Error('Expected official reporting period absent');
    if(period==='2026-T2' && kind==='bulletin'){
      const required=['152 923 494','48 427 906','212,78','174,23','181,8','4,69','100%'];
      item.t2_required_metrics=Object.fromEntries(required.map(x=>[x,text.includes(norm(x))]));
      if(Object.values(item.t2_required_metrics).some(x=>!x))throw Error('T2 critical fields missing from PDF text');
    }
    item.status='pdf_retrieved_page_extraction_pending_review';
  }catch(error){item.status='qa_review';item.issue=String(error?.message||error).slice(0,450);}
  reports.push(item);
  process.stdout.write(JSON.stringify({period:item.period,kind:item.kind,status:item.status,sha256:item.sha256?.slice(0,16),issue:item.issue})+'\\n');
}
const manifest={
  schema_version:'edr-europa-2026-10-31-v1',
  generated_at:new Date().toISOString(),
  issuer:'Edmond de Rothschild REIM (France)',
  docs:reports,
  note:'Manifest tracks fetched public PDFs and machine-read PDF text only. It NEVER constitutes financial or regulatory certification.',
  unresolved:[...reports.filter(x=>x.status!=='pdf_retrieved_page_extraction_pending_review').map(x=>x.period+'-'+x.kind)],
};
await writeFile(join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\\n','utf8');
const status=manifest.unresolved.length?'INCOMPLETE':'FETCHED_PENDING_QA';
console.log('EDR_DOCUMENT_AUDIT='+status+'; '+reports.filter(x=>x.status==='pdf_retrieved_page_extraction_pending_review').length+'/'+reports.length+' PDF retrieved, hashed and text extracted');
if(manifest.unresolved.length)process.exitCode=1;
