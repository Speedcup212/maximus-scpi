// Final source-of-truth checkpoint. Snapshot numeric QA_PASS is not
// independent financial certification; every value used by the release must
// match the original paginated certification row in live Supabase.
export function assertCanonicalFinancialEvidence(candidate,dbProofRows) {
 if(!Array.isArray(candidate?.evidence)||!candidate.evidence.length||
    !Array.isArray(dbProofRows))throw Error('Official financial evidence not available');
 const existing=new Set();
 for(const e of candidate.evidence){
  const key=e.period+':'+e.metric;
  if(existing.has(key))throw Error(candidate.scpi_slug+': duplicate financial metric '+key);
  existing.add(key);
  if(e.qa!=='qa_pass'||typeof e.value!=='number'||!Number.isFinite(e.value)||
     !Number.isInteger(e.page)||e.page<1||!/^https:\/\/www\.corum\.fr\//.test(e.source||''))
   throw Error(candidate.scpi_slug+': financial source invalid '+key);
  const matches=dbProofRows.filter(r=>
   r.scpi_slug===candidate.scpi_slug&&r.source_period===e.period&&
   r.metric===e.metric&&r.verification_status==='manual_verified_official' &&
   Number.isFinite(Number(r.value_numeric)) &&
   Math.abs(Number(r.value_numeric)-e.value)<1e-8 &&
   r.source_url===e.source&&Number(r.source_page)===e.page
  );
  if(matches.length!==1)
   throw Error(candidate.scpi_slug+': audited PDF financial value/source/page differs from live certification '+key);
 }
 return existing.size;
}
