// Safe discovery intake for a real prospective fund. A URL is not a verified PDF.
// It never writes source/financial data or promotes a candidate.
import fs from 'node:fs';
const read=p=>JSON.parse(fs.readFileSync(new URL('../../'+p,import.meta.url),'utf8'));
export function assessDiscovery(manifest, cohort) {
 const errors=[],m=manifest||{},c=m.candidate||{};
 const slug=c.slug;
 if(m.schema_version!==1 || m.mode!=='new' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug||''))errors.push('INVALID_CANDIDATE_MANIFEST');
 if(cohort.slugs?.includes(slug))errors.push('CANDIDATE_ALREADY_PUBLISHED');
 for(const k of ['official_product_page','official_bulletins_page','official_annual_report']){
  try{const u=new URL(c[k]);if(u.protocol!=='https:'||!c.issuer_hosts.includes(u.hostname))errors.push(k+':NOT_ISSUER_SOURCE');}
  catch{errors.push(k+':MISSING_OFFICIAL_URL');}
 }
 if(c.document_sha256!==null || c.status!=='DISCOVERED_ONLY')errors.push('PREMATURE_CERTIFICATION_CLAIM');
 return {batch_id:m.batch_id,slug,source_discovery:errors.length?'FAIL':'PASS',errors,
  readiness:'SOURCE_PDF_BINARY_AND_PAGE_QA_REQUIRED',
  missing_steps:['PDF_SHA256','EXACT_PAGE_AND_FIELD_PROOFS','PRIVATE_STAGING',
   'INDEPENDENT_FINANCIAL_REVIEW','OIDC_COHORT','BROWSER_MATRIX','DEPLOY_SHA','ATOMIC_ACTIVATION'],
  publication_authorized:false};
}
if(process.argv[1]?.endsWith('/discovery.mjs')){
 const m=read(process.argv[process.argv.indexOf('--manifest')+1]||'scripts/scpi-onboarding/fixtures/sofidynamic-69-discovery.json');
 const result=assessDiscovery(m,read('src/data/certified_scpi_cohort.json'));
 console.log(JSON.stringify(result,null,2));if(result.source_discovery==='FAIL')process.exitCode=1;
}
