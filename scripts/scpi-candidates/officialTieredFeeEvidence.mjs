// Strict exact-document fee contract for the EXISTING CORUM release promoter.
// XL: quarterly bulletin p11. USA: official statutes p9. Do not copy the
// statutory fee row into the Q2 bulletin or invent a blended management rate.
const validSha=s=>/^[0-9a-f]{64}$/.test(s||'');
export function assertPrimaryTieredFeeSource(c){
 const f=c?.publishing_fields?.management_fees,d=c?.publishing_sources?.management_fees;
 if(!f||f.kind!=='geographic_tiers'||f.basis!=='HT'||
    f.revenue_basis!=='loyers encaissés'||f.blended_rate!==null||
    f.source_period!=='2026-T2')
  throw Error('Unknown geographic fee basis '+c?.scpi_slug);
 if(!(f.euro_zone_percent>0&&f.euro_zone_percent<100&&
   f.outside_euro_zone_percent>0&&f.outside_euro_zone_percent<100))
  throw Error('Invalid geographic fee percentage '+c.scpi_slug);
 let primary;
 if(c.scpi_slug==='corum-usa'){
  primary=c.regulatory_documents?.find(x=>x.kind==='statutes'&&x.pages>=9);
  if(d?.page!==9)throw Error('CORUM USA management fee must reference statutes p9');
 } else if(c.scpi_slug==='corum-xl'){
  primary=c.pdfs?.find(x=>x.kind==='quarterly_bulletin'&&x.period==='2026-T2'&&x.pages>=11);
  if(d?.page!==11)throw Error('CORUM XL tiered fee source must be Q2 bulletin p11');
 } else throw Error('Tiered management fee regime not independently established for '+c.scpi_slug);
 const sha=primary?.sha256;
 if(!primary||!validSha(sha)||!d||d.url!==primary.url||d.sha256!==sha||
    !Number.isInteger(d.page)||d.page<1||d.page>primary.pages||
    !/^https:\/\/www\.corum\.fr\//.test(d.url))
  throw Error('Primary issuer PDF URL/SHA/page mismatch for fee tiers '+c.scpi_slug);
 return {flat:null,detail:{...f,source_url:d.url,source_page:d.page,source_sha256:d.sha256}};
}
export function assertTieredFeesMatchIndependentLedger(c,rows){
 const rate=c.publishing_fields?.management_fees;
 if(rate?.kind!=='geographic_tiers')return true;
 const meta=assertPrimaryTieredFeeSource(c),doc=c.publishing_sources.management_fees;
 if(!Array.isArray(rows))throw Error('Independent fee certifications absent');
 for(const [metric,value] of [
  ['management_fee_euro_zone_ht',rate.euro_zone_percent],
  ['management_fee_non_euro_zone_ht',rate.outside_euro_zone_percent]
 ]){
  const match=rows.filter(r=>r.scpi_slug===c.scpi_slug &&
   r.source_period==='2026-T2' && r.metric===metric &&
   r.verification_status==='manual_verified_official' &&
   r.source_url===doc.url && Number(r.source_page)===doc.page &&
   Math.abs(Number(r.value_numeric)-value)<1e-8);
  if(match.length!==1)throw Error('Geographic fee tier differs from verified legal/quarterly source '+c.scpi_slug+' '+metric);
 }
 return meta.flat===null;
}
