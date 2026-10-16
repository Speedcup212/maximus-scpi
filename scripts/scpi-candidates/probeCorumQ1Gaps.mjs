// Source-only forensic probe of exactly 4 OFFICIAL Q1 2026 issuer PDFs.
// No certification, status update, new orchestrator or Netlify deploy.
// Resolve ONLY missing T1 subscription price and CORUM Origin T1 TOF.
import {createHash} from 'node:crypto';
import pdfParse from 'pdf-parse';
const docs=[
 {slug:'corum-origin',name:'Origin',pages:7,sha:'9460af970ef68989dcfbb6006de4c1af8697282bb780db53688a13fd9e8bb607',
  url:'https://www.corum.fr/sites/default/files/2026-04/CORUM%20Origin%20-%20Fil%20d%27Actualit%C3%A9s%202026-T1%20%28Alias%29.pdf'},
 {slug:'corum-eurion',name:'Eurion',pages:7,sha:'fcc3e7a0c48812fe5274474d2dab0727d863b780113a665e910b1e3626e0e68e',
  url:'https://www.corum.fr/sites/default/files/2026-04/CORUM%20Eurion%20-%20Fil%20d%27Actualit%C3%A9s%202026-T1%20%28Alias%29.pdf'},
 {slug:'corum-usa',name:'USA',pages:7,sha:'3f281dfcb0ddef36cc6c4fc1e765ffe749a5feb48c36fb7581b725c141a8b878',
  url:'https://www.corum.fr/sites/default/files/2026-04/CORUM%20USA%20-%20Fil%20d%27Actualit%C3%A9s%202026-T1%20%28Alias%29.pdf'},
 {slug:'corum-xl',name:'XL',pages:8,sha:'5ff8c827cfd1f1e25a5d8c3bf8a4ddbf4e00eeeecbe5a5cff3d8676b40128037',
  url:'https://www.corum.fr/sites/default/files/2026-04/CORUM%20XL%20-%20Fil%20d%27Actualit%C3%A9s%202026-T1%20%28Alias%29.pdf'}
];
let allGood=true;
for(const d of docs){
 try{
  const res=await fetch(d.url,{
   headers:{'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36'},
   signal:AbortSignal.timeout(40000)});
  if(!res.ok)throw Error('URL HTTP '+res.status);
  const pdf=Buffer.from(await res.arrayBuffer());
  if(!pdf.subarray(0,5).toString().startsWith('%PDF-'))throw Error('Source not PDF');
  const digest=createHash('sha256').update(pdf).digest('hex');
  if(digest!==d.sha)throw Error('Unexpected SHA: '+digest+' expected '+d.sha);
  const pageTexts=[];
  const parsed=await pdfParse(pdf,{pagerender:async(page)=>{
    const tc=await page.getTextContent();
    const out=tc.items.map(item=>item.str||'').join(' ');
    pageTexts.push(out);
    return out;
  }});
  if(parsed.numpages!==d.pages||pageTexts.length!==d.pages)
    throw Error('Page count '+parsed.numpages+' expected '+d.pages+' extracted '+pageTexts.length);
  const txt=parsed.text.replace(/\s+/g,' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const excerpts=[];
  for(let i=0;i<pageTexts.length;i++){
    const t=pageTexts[i].replace(/\s+/g,' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    const patterns=[
      /PRIX DE SOUSCRIPTION DEPUIS/gi,/PRIX DE SOUSCRIPTION/gi,
      /TAUX D.OCCUPATION FINANCIER \(TOF\)/gi,
      /94[.,]83 ?%|95[.,]77 ?%|99[.,]92 ?%|100 ?%/gi,
      /1 ?135[,.]00 ?€|215[,.]00 ?€|200[,.]00 ?€|195[,.]00 ?€/gi
    ];
    const matches=[];
    for(const re of patterns){
      for(const m of t.matchAll(re)){
        const v=t.slice(Math.max(0,m.index-110),Math.min(t.length,m.index+450));
        if(!matches.includes(v))matches.push(v);
        if(matches.length>=7)break;
      }
      if(matches.length>=7)break;
    }
    if(matches.length)excerpts.push({page:i+1,extracts:matches.slice(0,7)});
  }
  const price=excerpts.filter(x=>x.extracts.some(t=>/prix de souscription|1 ?135[,.]00|215[,.]00|200[,.]00|195[,.]00/i.test(t)));
  const tof=excerpts.filter(x=>x.extracts.some(t=>/taux d.occupation|tof|94[,.]83|95[,.]77|99[,.]92/i.test(t)));
  const record={slug:d.slug,provenance:'ISSUER_PDF_BYTE_SHA_AND_PAGES_MATCH',
   exact_document_sha:d.sha,complete_pages:parsed.numpages,total_characters:txt.length,
   price_page_contexts:price,tof_page_contexts:tof,
   qa_note:'Extracted contexts only; not verified values, requires exact-page proof before field approval'};
  console.log('CORUM_Q1_GAP_SOURCE_PROBE '+JSON.stringify(record));
 }catch(e){
  allGood=false;
  console.error('CORUM_Q1_GAP_SOURCE_FAILURE '+JSON.stringify({slug:d.slug,url:d.url,reason:e.message}));
 }
}
if(!allGood)process.exitCode=1;
