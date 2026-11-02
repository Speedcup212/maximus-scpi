// RECOVERY-070 phase 2: read-only, issuer-dated value reconciliation.
// No publication or database writes. A quarter is NOT a valuation date.
const FIELDS = ['prix_reconstitution','valeur_realisation'];
const SHA = /^[0-9a-f]{64}$/;
const PERIOD = /^20\d{2}-T[1-4]$/;
const DATE = /^20\d{2}-\d{2}-\d{2}$/;

export function validCalendarDate(value) {
  if (typeof value !== 'string' || !DATE.test(value)) return false;
  const d = new Date(value + 'T00:00:00Z');
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0,10) === value;
}
export function quarterEnd(period) {
  if (!PERIOD.test(period)) return null;
  const year=Number(period.slice(0,4));
  const month=Number(period.slice(-1))*3;
  return new Date(Date.UTC(year,month,0)).toISOString().slice(0,10);
}
function proofValid(proof) {
  if (!proof || !validCalendarDate(proof.reference_date) ||
      !Number.isSafeInteger(proof.source_page) || proof.source_page<1 ||
      !SHA.test(proof.pdf_sha256 || '')) return false;
  try {
    const u=new URL(proof.source_url);
    return u.protocol==='https:' && !u.username && !u.password;
  } catch { return false; }
}
export function reconcileDatedValues(indicator, history = [], options = {}) {
  const errors=[], warnings=[], fields={};
  const period=indicator?.source_period;
  const end=quarterEnd(period);
  if (!end) errors.push('INVALID_CURRENT_PERIOD');
  const rows=[...(Array.isArray(history)?history:[]), indicator].filter(Boolean);
  const sources=new Set((options.issuer_hosts||[]).map(h=>String(h).toLowerCase()));
  for(const field of FIELDS) {
    const observations=[];
    for(const row of rows) {
      if(row[field]===null || row[field]===undefined) continue;
      const value=row[field], proof=row.metric_provenance?.[field];
      if(!Number.isFinite(value) || value<=0) {
        errors.push(field+':INVALID_NUMERIC_VALUE'); continue;
      }
      if(!proofValid(proof)) {
        if(row!==indicator){
          // Older public QA history may not carry field-level proof. It cannot
          // establish a new dated observation or certify a comparison.
          warnings.push(field+':HISTORY_UNVERIFIED_EXCLUDED');continue;
        }
        errors.push(field+':UNDATED_OR_UNSOURCED_VALUE');continue;
      }
      const url=new URL(proof.source_url);
      if(sources.size && !sources.has(url.hostname.toLowerCase())) {
        errors.push(field+':UNTRUSTED_ISSUER_HOST');continue;
      }
      const rowEnd=quarterEnd(row.source_period);
      if(!rowEnd || proof.reference_date>rowEnd || (end && proof.reference_date>end)) {
        errors.push(field+':FUTURE_REFERENCE_DATE');continue;
      }
      if(proof.source_period !== row.source_period && !/^20\d{2}-RA$/.test(proof.source_period||'')) {
        errors.push(field+':SOURCE_PERIOD_MISMATCH');continue;
      }
      observations.push({value, reference_date:proof.reference_date, source_period:row.source_period,
        source_page:proof.source_page, source_url:proof.source_url,pdf_sha256:proof.pdf_sha256});
    }
    const byDate=new Map();
    for(const o of observations) {
      const old=byDate.get(o.reference_date);
      if(old!==undefined && Math.abs(old-o.value)>0.000001)errors.push(field+':CONTRADICTORY_SAME_DATE');
      byDate.set(o.reference_date,o.value);
    }
    const latest=[...observations].sort((a,b)=>b.reference_date.localeCompare(a.reference_date))[0];
    const current=observations.find(o=>o.source_period===period && o.value===indicator[field]);
    if(!latest){
      fields[field]={status:'NO_VERIFIED_VALUE',display_value:null,reference_date:null,trend_certified:false};
      warnings.push(field+':MISSING_OFFICIAL_VALUATION');
      continue;
    }
    if(current && current.reference_date<latest.reference_date){
      errors.push(field+':CURRENT_OLDER_THAN_ARCHIVE');
    }
    fields[field]={status:latest.reference_date===end?'OFFICIAL_AT_QUARTER_END':'LAST_OFFICIAL_VALUE',
      display_value:latest.value,reference_date:latest.reference_date,
      source_url:latest.source_url,pdf_sha256:latest.pdf_sha256,source_page:latest.source_page,
      trend_certified:false};
    // A repeated reference date NEVER creates a second independent valuation.
    if(observations.length>byDate.size)warnings.push(field+':REPEATED_REFERENCE_DATE_NOT_NEW_EVENT');
  }
  return {status:errors.length?'FAIL':'PASS',errors:[...new Set(errors)],
    warnings:[...new Set(warnings)],fields,publication_authorized:false};
}
