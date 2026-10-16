// One-time primary-source forensic gate for FOUR already verified 2026 CORUM KIDs.
// Download only official publisher PDF URLs in the private candidate snapshot.
// Verify the exact original SHA-256 and page count, parse full text, and
// independently compare product identity, SRI and recommended holding time.
// Does not set financial approval flags, upload documents or publish to Netlify.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import pdfParse from 'pdf-parse';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const src=JSON.parse(fs.readFileSync(path.join(ROOT,'data-import/corum_candidates_prepublication_20261015.json'),'utf8'));
const holdForAll=10;
const bounded=(s)=>String(s||'').replace(/\s+/g,' ').trim();
const context=(body,regex)=>{
 const m=regex.exec(body);
 if(!m)return 'NO-MATCH';
 return bounded(body.slice(Math.max(0,m.index-180),Math.min(body.length,m.index+500)));
};
if(!Array.isArray(src.scpi)||src.scpi.length!==4)throw Error('Expected four candidate CORUM fund identities');
for(const c of src.scpi){
 const d=c.regulatory_documents?.find(x=>x.kind==='dic');
 if(!d||!/^https:\/\/www\.corum\.fr\/sites\/default\/files\/2026-10\/.+\.pdf$/i.test(d.url)
  ||!(/^[0-9a-f]{64}$/.test(d.sha256))||d.pages<3||d.pages>8)
  throw Error('Missing current issuer 2026 DIC URL/SHA/pages for '+c.scpi_slug);
 const response=await fetch(d.url,{headers:{'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36'},signal:AbortSignal.timeout(45000)});
 if(!response.ok)throw Error(c.scpi_slug+' issuer DIC HTTP '+response.status);
 const bytes=Buffer.from(await response.arrayBuffer());
 if(bytes.length<3000||!bytes.subarray(0,8).toString().startsWith('%PDF-'))
  throw Error(c.scpi_slug+' invalid PDF');
 const digest=createHash('sha256').update(bytes).digest('hex');
 if(digest!==d.sha256)
  throw Error(c.scpi_slug+' issuer DIC SHA CHANGED: fresh SHA='+digest+' old_expected='+d.sha256);
 const parsed=await pdfParse(bytes);
 if(parsed.numpages!==d.pages)throw Error(c.scpi_slug+' issuer DIC page mismatch: '+parsed.numpages+' vs '+d.pages);
 const doc=bounded(parsed.text).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 const term=c.name.toLowerCase().replace(/\s+/g,' ');
 if(!doc.includes(term))throw Error(c.scpi_slug+' issuer DIC actual fund identity mismatch');
 if(doc.length<1800)throw Error(c.scpi_slug+' missing full readable document');
 const risk=c.regulatory_metrics?.find(x=>x.metric==='risk_sri'&&x.qa==='qa_pass'&&x.sha256===d.sha256);
 const holding=c.regulatory_metrics?.find(x=>x.metric==='recommended_holding_years'&&x.qa==='qa_pass'&&x.sha256===d.sha256);
 if(!risk||!holding||holding.value!==holdForAll||risk.value!==c.publishing_fields?.risk_sri)
  throw Error(c.scpi_slug+' source-attested DIC metrics disagree with candidate');
 // Read all original PDF text, and print compact traces for independent review
 // (no fabricated QA signature; source SHA is the primary assurance).
 const riskText=context(doc,/classe de risque|indicateur synthetique de risque/);
 const custody=context(doc,/periode de detention recommandee/);
 const fees=context(doc,/que va me couter cet investissement|quels sont les couts|combien cela va.t.il me couter/);
 const exit=context(doc,/puiss?.je retirer|en cas de sortie|pas facilement vendre|risque de liquidite/);
 if(riskText==='NO-MATCH'||custody==='NO-MATCH')throw Error(c.scpi_slug+' DIC essential risk or holding prose absent');
 console.log(JSON.stringify({
  slug:c.scpi_slug,official_pdf_sha_verified:true,sha256:digest,
  pdf_pages:parsed.numpages,characters:doc.length,
  recorded_SRI:risk.value,recorded_recommended_years:holding.value,
  excerpt_for_regulatory_review:{risk:riskText,holding:custody,fees,exit},
  status:'PRIMARY_PDF_VERIFIED_NOT_FINAL_FINANCIAL_OR_PUBLICATION_APPROVAL'
 }));
}
console.log('CORUM_DIC_2026_PRIMARY_SHA_ALL_4_PASS_NO_PUBLICATION');
