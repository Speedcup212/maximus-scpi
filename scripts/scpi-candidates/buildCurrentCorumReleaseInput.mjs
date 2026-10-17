// One source-backed candidate payload assembled from official prepublication ledger.
// This does not make a financial approval, create a public release or relax PDF evidence.
// The 2026-10-15 file is supporting historical document evidence ONLY; current numbers
// and descriptive fields come from the certified private candidate registry snapshot.
import fs from 'node:fs';
import path from 'node:path';
const EXPECTED=['corum-eurion','corum-origin','corum-usa','corum-xl'];
const REQUIRED=['creation_year','minimum_investment','subscription_fees','management_fees',
 'reconstitution_value','risk_sri','recommended_holding_years','liquidity_basis',
 'enjoyment_delay','sector_allocation','geographic_allocation','sfdr',
 'capitalization_m','sector_class','geographic_scope','payment_frequency',
 'risk_warnings','label_isr'];

export function buildPrivateReleaseInput(old,canonical){
 if(old?.status!=='private_staging_non_published'||!Array.isArray(old.scpi)||
   old.scpi.length!==4||canonical?.source!=='maximus_agents.scpi_candidate_publication_draft_v1'||
   canonical.not_for_production!==true||canonical.not_approved!==true||
   canonical.scpi?.length!==4)
   throw Error('Expected one private four-CORUM official evidence set and one protected current registry');
 const scpi=EXPECTED.map(scpi_slug=>{
   const historical=old.scpi.find(x=>x.scpi_slug===scpi_slug);
   const current=canonical.scpi.find(x=>x.scpi_slug===scpi_slug);
   if(!historical||!current||current.source_period!=='2026-T2'||
      current.final_release_approved!==false||
      current.populated_field_count!==18||
      current.unresolved_field_keys?.length!==1||
      current.unresolved_field_keys[0]!=='withdrawal_terms')
     throw Error('Private canonical registry document incomplete: '+scpi_slug);
   const previous=historical.publishing_fields;
   const now=current.publishing_fields;
   for(const key of REQUIRED)
     if(now[key]===undefined||now[key]===null||
       (Array.isArray(now[key])&&!now[key].length))
       throw Error('Unverified current presentation field '+scpi_slug+':'+key);
   for(const key of ['risk_sri','subscription_fees','minimum_investment',
      'reconstitution_value','enjoyment_delay','recommended_holding_years']){
      if(JSON.stringify(previous[key])!==JSON.stringify(now[key]))
        throw Error('Conflicting official PDF regulatory evidence: '+scpi_slug+':'+key);
   }
   for(const key of ['sector_allocation','geographic_allocation']){
      const sorted=o=>JSON.stringify(Object.entries(o).sort(([a],[b])=>a.localeCompare(b)));
      if(sorted(previous[key])!==sorted(now[key]))
        throw Error('Quarterly allocation differs from certified PDF: '+scpi_slug+':'+key);
   }
   // Original official PDFs and dated per-metric pages are immutable supporting
   // evidence, not another source for up-to-date candidate publishing values.
   for(const e of historical.evidence||[]){
     const matching=(historical.pdfs||[]).find(d=>d.url===e.source&&
       d.period===e.period&&/^[a-f0-9]{64}$/.test(d.sha256)&&
       Number(e.page)>=1&&Number(e.page)<=d.pages);
     if(!matching)throw Error('Issuer PDF evidence corrupt: '+scpi_slug+':'+e.metric);
   }
   return {
     ...historical,
     release_ready:false,
     publication_authorized:false,
     analysis_certified:false,
     publishing_fields:{...now},
     // Preserve publisher PDFs/page signatures but do not forge a PDF page
     // for webpage-sourced data; require a live review before publication.
     publishing_sources:{...historical.publishing_sources},
     private_registry_provenance:current.provenance,
     release_payload_status:'AWAITING_AUTHENTICATED_BATCH_DECISION_AND_FULL_SOURCE_PARITY'
   };
 });
 return {
  status:'private_staging_non_published',
  source_purpose:'current_database_derived_candidate_payload_never_auto_authorizes',
  sources:['maximus_agents.scpi_candidate_publication_draft_v1',
           'official_2025_annual_and_2026_t2_document_evidence'],
  scpi,
  publication_authorized:false
 };
}
if(process.argv[1]&&import.meta.url===new URL('file://'+path.resolve(process.argv[1])).href){
 const project=path.resolve('.');
 const old=JSON.parse(fs.readFileSync(path.join(project,
   'data-import/corum_candidates_prepublication_20261015.json'),'utf8'));
 const current=JSON.parse(fs.readFileSync(path.join(project,
   'data-import/corum_private_browser_fixture_20261017.json'),'utf8'));
 const preview=buildPrivateReleaseInput(old,current);
 if(process.argv.includes('--write')){
  const to=path.join(project,'data-import/corum_candidates_current_private.json');
  fs.writeFileSync(to,JSON.stringify(preview,null,2)+'\n');
  console.log('CORUM_LIVE_LEDGER_PRIVATE_ONLY',to);
 }else{
  console.log('CORUM_LIVE_LEDGER_SOURCE_PARITY',
   JSON.stringify({scpi:preview.scpi.map(x=>x.scpi_slug),
    complete:preview.scpi.every(x=>REQUIRED.every(k=>x.publishing_fields[k]!==undefined)),
    financial_approval:false,published:false}));
 }
}
