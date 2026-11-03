// Exact certified baseline vs source-backed, clearly labelled provisional listings.
// Full certified status is never inferred for a publication with reservations.
export function verifyProgressiveCohortAttestation({baseline,cohort,catalog,analyses,enabledCount}){
  const fail=(message)=>{throw Error('PROGRESSIVE_COHORT_ATTESTATION:'+message)};
  const valid=(c)=>Number.isSafeInteger(c?.count)&&Array.isArray(c.slugs)&&c.slugs.length===c.count&&new Set(c.slugs).size===c.count;
  if(!valid(baseline)||!valid(cohort)||baseline.count<66)fail('INVALID_EXACT_BASELINE');
  const strictSlugs=new Set(baseline.slugs);
  if(baseline.slugs.some(s=>!cohort.slugs.includes(s)))fail('CERTIFIED_BASELINE_LOST');
  const extensions=cohort.slugs.filter(s=>!strictSlugs.has(s));
  if(extensions.length>1)fail('UNREVIEWED_EXTRA_PUBLIC_CANDIDATES');
  const extension=extensions[0]||null;
  const slug=name=>String(name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  if(extension){
    const rows=catalog.filter(row=>slug(row['Nom SCPI'])===extension);
    const row=rows[0];
    if(rows.length!==1||row.maximus_publication_status!=='published_with_reserves'||
       row.maximus_publication_disclosure?.status!=='visible'||
       !Array.isArray(row.maximus_publication_reservations)||!row.maximus_publication_reservations.length||
       !row.maximus_publication_reservations.includes('LATEST_STATUTES_UNVERIFIED')||
       !row.maximus_publication_reservations.includes('UNRECONCILED_SHARE_FLOW')||
       !row.maximus_disabled_features?.includes('suitability_recommendations')||
       !row.maximus_disabled_features?.includes('uncertified_history_comparison')||
       row['Décote/Surcote QA']==='publishable')
      fail('INVALID_PUBLIC_PARTIAL_DECLARATION');
  }
  if(!Array.isArray(analyses))fail('NO_TRUSTED_OIDC_ANALYSES');
  const bySlug=new Map(analyses.map(row=>[row.scpi_slug,row]));
  if(bySlug.size!==analyses.length)fail('DUPLICATE_FINANCIAL_ANALYSIS');
  const hasExtension=extension?bySlug.has(extension):false;
  if(!Number.isSafeInteger(enabledCount)||enabledCount!==analyses.length||
     ![baseline.count,baseline.count+(extension?1:0)].includes(enabledCount)||
     analyses.length!==baseline.count+Number(hasExtension))
     fail('OIDC_ACTIVE_COHORT_SIZE_MISMATCH');
  if([...bySlug.keys()].some(s=>!strictSlugs.has(s)&&s!==extension)||
    [...strictSlugs].some(s=>!bySlug.has(s))||
    (hasExtension && !extension))fail('OIDC_UNAUTHORIZED_SLUG');
  const certified=analyses.filter(row=>strictSlugs.has(row.scpi_slug));
  const notCertified=certified.filter(row=>
     row.current_source_certified!==true||
     !/^https:\/\//.test(String(row.certified_source_url||''))||
     row.certification_status!=='certified' &&
        !(row.certification_status==='current_certified_history_unverified' &&
          row.comparison_certified===false &&
          !row.improvements?.length && !row.deteriorations?.length)
  );
  if(notCertified.length)fail('EXISTING_STRICT_CERTIFICATIONS_INVALID:'+notCertified.map(x=>x.scpi_slug).join(','));
  if(hasExtension){
    const c=bySlug.get(extension);
    if(c.current_source_certified!==true||c.certification_status!=='current_certified_history_unverified'||
       c.comparison_certified!==false||
       !/^https:\/\//.test(String(c.certified_source_url||''))||
       c.current_period!=='2026-T2'||
       c.improvements?.length||c.deteriorations?.length||
       c.structural_event_detected===true)
      fail('PUBLISHED_PARTIAL_ANALYSIS_CONTRADICTORY');
  }
  return {certified,extension,partialActive:hasExtension,requiredActive:baseline.count+Number(hasExtension)};
}
