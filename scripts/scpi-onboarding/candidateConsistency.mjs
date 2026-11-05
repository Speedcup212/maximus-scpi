// RECOVERY-071: deterministic coherence checks for private SCPI evidence.
// Arithmetic success is NOT independent financial QA or publication approval.
import {quarterEnd, validCalendarDate} from './datedEvidence.mjs';
const SHA=/^[a-f0-9]{64}$/;
const PERIOD=/^20\d{2}-T[1-4]$/;
const ISO=/^20\d{2}-\d{2}-\d{2}$/;
export function reconcileSourceShareFlow(rows,previousPeriod,currentPeriod,issuerHosts) {
  const blocked=reason=>({status:'UNVERIFIED',reason,delta_parts:null,publication_authorized:false});
  const index=p=>PERIOD.test(p||'')?Number(p.slice(0,4))*4+Number(p.slice(-1)):NaN;
  if(index(currentPeriod)-index(previousPeriod)!==1)return blocked('NON_CONSECUTIVE_PERIODS');
  const required=[['nombre_parts',previousPeriod],['nombre_parts',currentPeriod],
    ['nombre_parts_nouvelles_souscrites',currentPeriod],['nombre_parts_retires',currentPeriod]];
  const selected=[];
  for(const [metric,period] of required) {
    const found=(rows||[]).filter(r=>r.metric===metric&&r.period===period);
    if(found.length!==1)return blocked('MISSING_OR_DUPLICATE_SOURCE:'+period+':'+metric);
    const r=found[0];let u;try{u=new URL(r.source_url);}catch{return blocked('INVALID_SOURCE_URL');}
    const date=quarterEnd(period).replaceAll('-','_');
    const bases=metric==='nombre_parts'?['STOCK_'+date,'STOCK_AT_'+date]:['FLOW_'+period.replace('-','_')];
    if(r.unit!=='PARTS'||!Number.isSafeInteger(r.value)||r.value<0||!SHA.test(r.pdf_sha256||'')||
      !Number.isSafeInteger(r.source_page)||r.source_page<1||u.protocol!=='https:'||u.username||u.password||
      !issuerHosts?.includes(u.hostname)||!bases.includes(r.basis))return blocked('INVALID_FIELD_PROVENANCE:'+metric);
    selected.push(r);
  }
  if(new Set(selected.slice(1).map(r=>r.pdf_sha256)).size!==1)return blocked('MIXED_CURRENT_SOURCE_DOCUMENTS');
  const [opening,closing,subscriptions,withdrawals]=selected.map(r=>r.value);
  const exact=BigInt(opening)+BigInt(subscriptions)-BigInt(withdrawals);
  if(exact<0n||exact>BigInt(Number.MAX_SAFE_INTEGER))return blocked('UNSAFE_SOURCE_ARITHMETIC');
  const expected=Number(exact);
  const delta=closing-expected;
  return {status:delta===0?'RECONCILED_ARITHMETIC_ONLY':'UNRECONCILED',delta_parts:delta,
    expected_closing_parts:expected,reported_closing_parts:closing,
    evidence:selected.map(({metric,period,value,source_url,source_page,pdf_sha256})=>({metric,period,value,source_url,source_page,pdf_sha256})),
    automatic_correction_applied:false,source_values_changed:false,independent_financial_qa:false,
    disabled_features:delta?['share_movement_trend','derived_capital_flow']:[],publication_authorized:false};
}
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
  const currentQuarterEnd=quarterEnd(snapshot.source_period);
  if(!currentQuarterEnd || !validCalendarDate(snapshot.last_official_valuation_date) ||
     snapshot.last_official_valuation_date>currentQuarterEnd){
    errors.push('VALUATION_DATE_MISSING_OR_AFTER_QUARTER');
  }
  if(!Number.isFinite(snapshot.last_official_prix_reconstitution_eur) ||
     !Number.isFinite(snapshot.last_official_valeur_realisation_eur) ||
     snapshot.last_official_prix_reconstitution_eur<=0 ||
     snapshot.last_official_valeur_realisation_eur<=0)errors.push('LAST_OFFICIAL_VALUATION_INVALID');
  if(currentQuarterEnd && snapshot.last_official_valuation_date<currentQuarterEnd)warnings.push('VALUATION_PRECEDES_CURRENT_QUARTER');
  const docs=snapshot.regulatory_documents||{};
  if(!docs.statutes?.verified_current_for_2026)warnings.push('CURRENT_STATUTES_NOT_VERIFIED');
  if(Object.values(docs).some(d=>d.independent_regulatory_review===true))errors.push('UNEXPECTED_AUTOMATED_REGULATORY_APPROVAL');
  return {status:errors.length?'FAIL':'TECHNICAL_PASS_ONLY',errors:[...new Set(errors)],warnings:[...new Set(warnings)],calculations,
    publication_authorized:false,independent_financial_qa:false};
}
