// RECOVERY-071: deterministic coherence checks for private SCPI evidence.
// Arithmetic success is NOT independent financial QA or publication approval.
const SHA=/^[a-f0-9]{64}$/;
const PERIOD=/^20\d{2}-T[1-4]$/;
const ISO=/^20\d{2}-\d{2}-\d{2}$/;
export function inspectPrivateCandidate(snapshot) {
  const errors=[], warnings=[], calculations={};
  if(!snapshot||typeof snapshot!=='object')return {status:'FAIL',errors:['MISSING_SNAPSHOT'],warnings:[],publication_authorized:false};
  if(snapshot.publication_authorized!==false)errors.push('PREMATURE_PUBLICATION_CLAIM');
  if(snapshot.stage_status!=='pending_independent_qa')errors.push('UNSUPPORTED_REVIEW_STATE');
  if(!SHA.test(snapshot.source_pdf_sha256||'')||!SHA.test(snapshot.annual_pdf_sha256||''))errors.push('INVALID_SOURCE_SHA');
  const quarters=Array.isArray(snapshot.quarterly_snapshots)?snapshot.quarterly_snapshots:[];
  let previousPeriod='';
  for(const row of [...quarters].sort((a,b)=>String(a.source_period).localeCompare(String(b.source_period)))) {
    const period=row.source_period;
    if(!PERIOD.test(period||'') || period===previousPeriod)errors.push('QUARTER_INVALID_OR_DUPLICATED');
    previousPeriod=period;
    if(!SHA.test(row.pdf_sha256||''))errors.push('QUARTER_SOURCE_SHA_MISSING');
    for(const key of ['capitalisation_eur','prix_souscription_eur','nombre_parts']){
      if(!Number.isFinite(row[key])||row[key]<=0)errors.push(period+':INVALID_'+key.toUpperCase());
    }
    if([row.capitalisation_eur,row.prix_souscription_eur,row.nombre_parts].every(Number.isFinite)){
      const expected=row.prix_souscription_eur*row.nombre_parts;
      const delta=Math.abs(expected-row.capitalisation_eur);
      calculations[period]={expected_capitalisation_eur:expected,reported_capitalisation_eur:row.capitalisation_eur,delta_eur:delta};
      if(delta>Math.max(1,row.nombre_parts*0.005+0.01))errors.push(period+':CAPITALISATION_PARTS_PRICE_INCONSISTENT');
    }
  }
  if(quarters.length<2)warnings.push('HISTORY_HAS_FEWER_THAN_2_TECHNICAL_SNAPSHOTS');
  const current=quarters.find(r=>r.source_period===snapshot.source_period);
  if(!current)errors.push('CURRENT_PERIOD_NOT_IN_SNAPSHOTS');
  else if(Math.abs(current.capitalisation_eur/1e6-snapshot.capitalisation_million_eur)>0.000001 ||
          Math.abs(current.capitalisation_eur-snapshot.source_capitalisation_eur)>0.01)errors.push('CAPITALISATION_UNIT_CONVERSION_FAILED');
  const allocations=[['geography_values','GEO'],['sector_values','SECTOR']];
  for(const [field,prefix] of allocations){
    const values=Object.values(snapshot[field]||{});
    if(!values.length||values.some(v=>!Number.isFinite(v)||v<0||v>100))errors.push(prefix+':INVALID_ALLOCATIONS');
    else{
      const total=values.reduce((sum,v)=>sum+v,0);
      const precision=0.1; // publisher reports tenths of a percentage point
      const maxError=0.5*precision*values.length;
      calculations[prefix]={total_pct:total,max_rounding_error_pct:maxError};
      if(Math.abs(total-100)>maxError+1e-7)errors.push(prefix+':SUM_OUTSIDE_ISSUER_ROUNDING');
      else if(Math.abs(total-100)>1e-7)warnings.push(prefix+':PUBLISHER_ROUNDING_NOT_100');
    }
  }
  if(!ISO.test(snapshot.last_official_valuation_date||'') ||
     snapshot.last_official_valuation_date>snapshot.source_period.slice(0,4)+'-'+String(Number(snapshot.source_period.slice(-1))*3).padStart(2,'0')+'-31'){
    errors.push('VALUATION_DATE_MISSING_OR_AFTER_QUARTER');
  }
  if(!Number.isFinite(snapshot.last_official_prix_reconstitution_eur) ||
     !Number.isFinite(snapshot.last_official_valeur_realisation_eur) ||
     snapshot.last_official_prix_reconstitution_eur<=0 ||
     snapshot.last_official_valeur_realisation_eur<=0)errors.push('LAST_OFFICIAL_VALUATION_INVALID');
  if(snapshot.last_official_valuation_date<'2026-01-01')warnings.push('VALUATION_PRECEDES_CURRENT_QUARTER');
  const docs=snapshot.regulatory_documents||{};
  if(!docs.statutes?.verified_current_for_2026)warnings.push('CURRENT_STATUTES_NOT_VERIFIED');
  if(Object.values(docs).some(d=>d.independent_regulatory_review===true))errors.push('UNEXPECTED_AUTOMATED_REGULATORY_APPROVAL');
  return {status:errors.length?'FAIL':'TECHNICAL_PASS_ONLY',errors:[...new Set(errors)],warnings:[...new Set(warnings)],calculations,
    publication_authorized:false,independent_financial_qa:false};
}
