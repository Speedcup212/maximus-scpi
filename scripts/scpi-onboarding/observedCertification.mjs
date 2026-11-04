// Read-only reconciliation of exported observations. Never creates certification.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validOfficialUrl} from './preflight.mjs';
import {cohortIntegrityErrors} from './cohortInvariant.mjs';
const ROOT=path.resolve(fileURLToPath(new URL('../../',import.meta.url)));
const SHA=/^[a-f0-9]{64}$/;
export function inspectObservedCertification({observation,manifest,cohort,catalog,issuerHosts}) {
 const o=observation||{}, slug=manifest?.candidate_slug;
 const errors=[],blockers=[],rows=[];
 const row=(values)=>values?.filter(x=>x.scpi_slug===slug)||[];
 const one=(values,name)=>{
  const matches=row(values);
  if(matches.length!==1)errors.push(name+':MISSING_OR_DUPLICATE');
  return matches[0]||{};
 };
 if(!slug||!Array.isArray(manifest?.rows)||!manifest.rows.length)errors.push('MISSING_REVIEW_MANIFEST');
 if(o.publication_authorized!==false)errors.push('INVALID_OBSERVATION_AUTHORITY');
 errors.push(...cohortIntegrityErrors(cohort));
 const indicator=one(o.indicator,'INDICATOR');
 const final=one(o.final,'FINAL_GATE');
 const progressive=one(o.progressive,'PROGRESSIVE_GATE');
 const tools=one(o.tools,'TOOL_READINESS');
 const releases=row(o.active).filter(x=>x.active===true);
 if(releases.length!==1)errors.push('ACTIVE_RELEASE:MISSING_OR_DUPLICATE');
 const release=releases[0]||{};
 // The original activation and current deployed revision are distinct evidence.
 if(release.release_sha!==o.netlify?.commit_ref||release.netlify_deploy_id!==o.netlify?.id)
  blockers.push('ACTIVE_RELEASE_DIFFERS_FROM_CURRENT_DEPLOY');
 if(o.netlify?.state!=='ready')blockers.push('NETLIFY_NOT_READY');
 for(const expected of manifest?.rows||[]) {
  const key=expected.period+':'+expected.metric;
  const matches=row(o.metrics).filter(x=>x.source_period===expected.period&&x.metric===expected.metric);
  const metric=matches[0];
  const document=row(o.pdf_validation).filter(x=>x.source_period===expected.period&&x.document_kind===expected.document_kind&&x.source_url===expected.source_url);
  const issues=[];
  if(matches.length!==1)issues.push('MISSING_OR_DUPLICATE_METRIC');
  if(!metric||metric.numeric_value!==expected.value||metric.unit!==expected.unit||metric.source_page!==expected.source_page||metric.source_url!==expected.source_url||metric.value_basis!==expected.basis)issues.push('SOURCE_VALUE_UNIT_PAGE_OR_BASIS_MISMATCH');
  if(metric?.qa_status!=='qa_pass')issues.push('METRIC_QA_NOT_PASSED');
  if(document.length!==1||document[0]?.pdf_sha256!==expected.pdf_sha256||!SHA.test(expected.pdf_sha256||'')||document[0]?.document_identity_verified!==true||expected.source_page>document[0]?.page_count||!validOfficialUrl(expected.source_url,issuerHosts))issues.push('DOCUMENT_SHA_PAGE_IDENTITY_OR_HOST_INVALID');
  rows.push({key,status:issues.length?'FAIL':'MATCHES_RECORDED_EVIDENCE',issues});
  errors.push(...issues.map(issue=>key+':'+issue));
 }
 if(row(o.metrics).length!==manifest?.rows?.length)errors.push('METRIC_COVERAGE_MISMATCH');
 const allocations=[];
 for(const [axis,field] of [['geography','repartition_geographique'],['sector','repartition_sectorielle']]) {
  const expected=indicator[field]||{};
  const actual=row(o.allocations).filter(x=>x.allocation_type===axis&&x.source_period===indicator.source_period);
  if(!Object.keys(expected).length||actual.length!==Object.keys(expected).length)errors.push(axis+':ALLOCATION_COVERAGE_MISMATCH');
  for(const [label,pct] of Object.entries(expected)) {
   const matches=actual.filter(x=>x.label===label), a=matches[0];
   const doc=row(o.pdf_validation).find(x=>x.source_url===a?.source_url&&x.source_period===a?.source_period);
   const pass=matches.length===1&&a.pct===pct&&a.qa_status==='qa_pass'&&
    validOfficialUrl(a.source_url,issuerHosts)&&SHA.test(a.source_sha256||'')&&
    a.source_sha256===doc?.pdf_sha256&&doc?.document_identity_verified===true&&
    Number.isSafeInteger(a.source_page)&&a.source_page>0&&a.source_page<=doc.page_count;
   allocations.push({axis,label,pct,status:pass?'MATCHES_RECORDED_EVIDENCE':'FAIL'});
   if(!pass)errors.push(axis+':'+label+':ALLOCATION_EVIDENCE_MISMATCH');
  }
 }
 if(final.final_release_ready!==true||final.full_qa_pass!==true)blockers.push('FULL_FINANCIAL_CERTIFICATION_NOT_READY');
 if(progressive.latest_statutes_verified!==true)blockers.push('LATEST_STATUTES_NOT_VERIFIED');
 if(progressive.factual_listing_qa_pass!==true||progressive.publication_authorized_by_review!==true)blockers.push('CURRENT_PROGRESSIVE_REVIEW_NOT_READY');
 for(const [field,value] of Object.entries(tools))if(field.endsWith('_ready')&&value!==true)blockers.push('TOOL:'+field);
 const allocationGate=one(o.allocation_gate,'ALLOCATION_GATE');
 if(allocationGate.allocations_verified!==true)blockers.push('ALLOCATION_CERTIFICATION_NOT_READY');
 const currentHistory=row(o.history).filter(x=>x.metric_provenance?.historical_comparison_certified===true);
 if(currentHistory.length<2)blockers.push('FEWER_THAN_TWO_CERTIFIED_HISTORY_PERIODS');
 const analysis=one(o.analysis,'ANALYSIS');
 if(analysis.current_source_certified!==true)blockers.push('CURRENT_ANALYSIS_NOT_CERTIFIED');
 const normalize=name=>String(name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 const entries=(catalog||[]).filter(x=>normalize(x['Nom SCPI'])===slug);
 if(entries.length!==1||!cohort?.slugs?.includes(slug))errors.push('CATALOG_COHORT_IDENTITY_MISMATCH');
 const summary=o.summary?.[0]||{};
 return {
  candidate:slug,captured_at:o.captured_at,mode:'EXPORTED_OBSERVATION_NOT_LIVE_CERTIFICATE',
  status:errors.length?'FAIL':blockers.length?'BLOCKED':'REVIEW_REQUIRED',errors,blockers,metrics:rows,allocations,
  observed_publication:indicator.qa_status==='verified_primary_source_with_reserves'?'published_with_reserves':'OTHER',
  complete_certification:final.final_release_ready===true&&final.full_qa_pass===true&&blockers.length===0&&errors.length===0,
  counts:{public_indicator_rows:(o.public_counts||[]).reduce((sum,x)=>sum+Number(x.count),0),catalog_identities:cohort?.count,
   universe_existing:summary.live_catalog,strict_checks_pass:summary.strict_checks_pass,analysis_certified:summary.full_analysis_certified,
   fully_certified_total:null,reason:'Strict checks and analysis QA are separate gates, not a complete certification census'},
  publication_authorized:false,
 };
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
 const at=process.argv.indexOf('--observation');const mp=process.argv.indexOf('--manifest');const hp=process.argv.indexOf('--issuer-host');
 if(at<0||mp<0||hp<0)throw Error('Require --observation <json> --manifest <json> --issuer-host <hostname>');
 const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
 const result=inspectObservedCertification({observation:read(process.argv[at+1]),manifest:read(process.argv[mp+1]),issuerHosts:[process.argv[hp+1]],cohort:read(path.join(ROOT,'src/data/certified_scpi_cohort.json')),catalog:read(path.join(ROOT,'src/data/scpi_complet.json'))});
 console.log(JSON.stringify(result,null,2));process.exitCode=result.status==='FAIL'?1:2;
}
