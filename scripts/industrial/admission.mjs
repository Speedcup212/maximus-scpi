/** Read-only planning: no state here authorizes publication. */
export const normalizeAlias = value => String(value || '').replace(/œ/gi,'oe').replace(/æ/gi,'ae').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export function resolveAlias(name, aliases, asOf) {
 const matches = aliases.filter(a=>a.active && normalizeAlias(a.alias)===normalizeAlias(name) &&
   (!a.valid_from || asOf >= a.valid_from) && (!a.valid_to || asOf <= a.valid_to));
 const ids=[...new Set(matches.map(a=>a.scpi_slug))];
 return ids.length===1 ? {slug:ids[0],status:'resolved'} : {slug:null,status:ids.length?'ambiguous':'unknown'};
}
export function publicQuality({identityVerified,securityPassed,metrics,requiredMetrics,reservations=[]}) {
 if(identityVerified!==true || securityPassed!==true) return 'blocked';
 if(!Array.isArray(requiredMetrics)||!requiredMetrics.length) return 'partial';
 const all=requiredMetrics.every(key=>{
  const m=metrics?.[key];
  return m?.status==='verified' && m.semantic_review_verified===true && m.product_identity_verified===true &&
   typeof m.value==='number' && Number.isFinite(m.value) && m.value===m.proof?.value &&
   !!m.period && m.period===m.proof?.period && /^https:\/\//.test(m.source_url||'') &&
   m.source_url===m.proof?.source_url && /^[a-f0-9]{64}$/i.test(m.proof?.sha256||'') &&
   Number.isInteger(m.proof?.page) && m.proof.page>0 && !!m.proof?.text?.trim();
 });
 return all&&!reservations.length?'verified':'partial';
}
export function measureThroughput(events,businessDays) {
 if(!Number.isInteger(businessDays)||businessDays<=0) return null;
 const unique=new Set(events.filter(e=>e.identityPassed===true&&e.sourcePassed===true&&e.extractionPassed===true&&e.qualityPassed===true&&e.productionVerified===true&&e.publishedCommit&&e.deployedCommit===e.publishedCommit).map(e=>e.slug));
 return unique.size/businessDays;
}
