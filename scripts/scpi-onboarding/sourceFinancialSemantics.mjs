// RECOVERY-073: source-period-safe arithmetic and fee semantics.
// A technical PASS never creates an independent financial certification.
const SHA=/^[a-f0-9]{64}$/;
const PERIOD=/^20\d{2}-(?:T[1-4]|REG)$/;
const validParts=x=>Number.isSafeInteger(x)&&x>=0;
const feeBases=new Set(['subscription_price_gross','rental_income_ht_plus_financial_income_adjusted','redemption_proceeds']);
const categories={subscription:'subscription_price_gross',management:'rental_income_ht_plus_financial_income_adjusted',redemption:'redemption_proceeds'};

export function reconcilePartsFlow(input){
  const {opening,subscribed,withdrawn,closing,opening_period,closing_period}=input||{};
  if(![opening,subscribed,withdrawn,closing].every(validParts)||opening_period===closing_period||
     !/^20\d{2}-T[1-4]$/.test(opening_period||'')||!/^20\d{2}-T[1-4]$/.test(closing_period||'')){
    return {status:'INVALID_SOURCE_FACTS',publication_authorized:false};
  }
  const expected=opening+subscribed-withdrawn;
  if(!Number.isSafeInteger(expected)||expected<0)return {status:'INVALID_SOURCE_FACTS',publication_authorized:false};
  const difference=closing-expected;
  return {status:difference===0?'ARITHMETICALLY_RECONCILED':'REQUIRES_PRIMARY_SOURCE_EXPLANATION',
    opening_period,closing_period,opening,subscribed,withdrawn,closing,computed_closing:expected,
    unexplained_difference_parts:difference,publication_authorized:false};
}

export function verifyFeeBasis(terms){
  const issues=[];
  for(const [i,t] of (Array.isArray(terms)?terms:[]).entries()){
    const prefix='FEE_'+i+':';
    if(!categories[t?.category]||!feeBases.has(t?.basis)||t.basis!==categories[t.category])issues.push(prefix+'INCORRECT_BASE');
    if(!PERIOD.test(t?.source_period||'')||!SHA.test(t?.pdf_sha256||'')||!Number.isSafeInteger(t?.source_page)||t.source_page<1||
       !/^https:\/\//.test(t?.source_url||''))issues.push(prefix+'INCOMPLETE_DOCUMENTARY_EVIDENCE');
    if(!Number.isFinite(t?.ht_percent)||!Number.isFinite(t?.ttc_percent)||t.ht_percent<0||t.ht_percent>100||
       Math.abs(t.ht_percent*1.2-t.ttc_percent)>0.015)issues.push(prefix+'INCOHERENT_HT_TTC');
    if(!t?.effective_period||!PERIOD.test(t.effective_period))issues.push(prefix+'MISSING_EFFECTIVE_PERIOD');
  }
  if(!Array.isArray(terms)||!terms.length)issues.push('NO_FEE_DOCUMENTATION');
  return {status:issues.length?'SOURCE_FEE_EVIDENCE_INVALID':'TECHNICAL_PROVENANCE_ONLY',issues,
    independently_certified:false,publication_authorized:false};
}
