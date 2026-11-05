// Protected MAIN-only diagnostic (not a release service).
// Requires a database account with SELECT privilege only, and Netlify read access.
// Does not sign, write to Supabase, authorize publication, or certify 100/100.
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import {evaluateProtectedReleaseEvidence,hashEvidenceSnapshot} from './protectedReleaseEvidence.mjs';
import {evaluatePublishedDeploy} from './protectedProductionReadback.mjs';
import {verifyGitHubBrowserArtifact} from './githubArtifactProvenance.mjs';
import {PILOTS} from './admissionPhases.mjs';
import {verifyCurrentCandidatePr} from './protectedCandidateIdentity.mjs';

const siteId='e4f16f87-663d-4965-8de8-00f6840f1aa7';
const batchId='RECOVERY-100-THREE-PILOTS-20261105';
const ids="('sofidynamic','opus-real','aew-opportunites-europe')";
const SQL=`select jsonb_build_object(
 'captured_at',now(),
 'pilot_rows',coalesce((select jsonb_agg(to_jsonb(t) order by t.scpi_slug)
   from maximus_agents.scpi_industrial_admission_live_v1 t where t.scpi_slug in ${ids}),'[]'::jsonb),
 'regulatory_documents',coalesce((select jsonb_agg(to_jsonb(t) order by t.scpi_slug,t.document_kind)
   from maximus_agents.scpi_candidate_regulatory_documents t where t.scpi_slug in ${ids}),'[]'::jsonb),
 'reviews',coalesce((select jsonb_agg(to_jsonb(t) order by t.scpi_slug)
   from maximus_agents.scpi_candidate_final_review t where t.scpi_slug in ${ids}),'[]'::jsonb),
 'audits',coalesce((select jsonb_agg(to_jsonb(t) order by t.scpi_slug)
   from maximus_agents.scpi_candidate_final_audit t where t.scpi_slug in ${ids}),'[]'::jsonb),
 'batch',(select to_jsonb(b) from maximus_agents.scpi_candidate_batch_decisions b
   where b.batch_id='${batchId}' order by b.created_at desc limit 1),
 'delegations',coalesce((select jsonb_agg(to_jsonb(d) order by d.actor)
   from maximus_agents.scpi_publication_delegations d),'[]'::jsonb)
 )::text as snapshot`;

function readDatabase() {
 const db=process.env.SCPI_SUPABASE_READONLY_DATABASE_URL;
 if(!db)throw Error('READ_ONLY_DATABASE_CREDENTIAL_NOT_PROVISIONED');
 let output;
 try {
  output=execFileSync('psql',['-X','-A','-t','-v','ON_ERROR_STOP=1','-c',SQL],{
   env:{...process.env,PGDATABASE:db,PGCONNECT_TIMEOUT:'10',
    PGSSLMODE:'require',PGOPTIONS:'-c default_transaction_read_only=on -c statement_timeout=15000'},
   encoding:'utf8',timeout:30000,maxBuffer:512*1024,stdio:['ignore','pipe','pipe']
  }).trim();
 }catch{throw Error('PROTECTED_READ_ONLY_DATABASE_QUERY_FAILED');}
 try{return JSON.parse(output);}catch{throw Error('PROTECTED_DATABASE_RESPONSE_INVALID');}
}
async function fetchNetlify(url) {
 const token=process.env.SCPI_NETLIFY_READ_TOKEN;
 if(!token)throw Error('READ_ONLY_NETLIFY_CREDENTIAL_NOT_PROVISIONED');
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),12000);
 try {
  const r=await fetch(url,{headers:{Authorization:'Bearer '+token,Accept:'application/json'},
   signal:controller.signal,redirect:'error'});
  if(!r.ok)throw Error('HTTP_STATUS_'+r.status);
  return await r.json();
 }catch{throw Error('NETLIFY_PROTECTED_API_READ_FAILED');}
 finally{clearTimeout(timeout);}
}
function outputReport(report){
 const out='test-results/scpi-protected-readback';
 fs.mkdirSync(out,{recursive:true});
 fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2)+'\n',{mode:0o600});
 console.log(JSON.stringify({status:report.status,reason:report.reason,
  evidence_status:report.evidence_status,blocker_count:report.blocker_count,
  production_sha_verified:report.production_sha_verified,
  postdeploy_100_proven:false}));
}
export async function runProtectedReadback(){
 const trustedMainSha=process.env.GITHUB_SHA;
 const phase=process.env.SCPI_ADMISSION_PHASE||'postdeploy';
 if(process.env.GITHUB_REF!=='refs/heads/main'||!(/^[a-f0-9]{40}$/.test(trustedMainSha||'')))
  throw Error('PROTECTED_RUN_MUST_USE_MAIN_COMMIT');
 if(!['prepublication','postdeploy'].includes(phase))
  throw Error('INVALID_PROTECTED_ADMISSION_PHASE');
 const expectedSha=phase==='prepublication'?process.env.SCPI_CANDIDATE_SHA:trustedMainSha;
 if(!(/^[a-f0-9]{40}$/.test(expectedSha||'')))
  throw Error('INVALID_CANDIDATE_SHA');
 if(phase==='prepublication'){
  // Protected runner executes ONLY main code; candidate SHA is data, never checkout.
  const identity=await verifyCurrentCandidatePr({
   candidateSha:expectedSha,token:process.env.GITHUB_TOKEN
  });
  if(identity.pr_identity_verified!==true)
   throw Error('CANDIDATE_PR_CURRENT_HEAD_VERIFICATION_FAILED:'+identity.reason);
 }
 const snapshot=readDatabase();
 const evidence=evaluateProtectedReleaseEvidence(snapshot,{expectedSha});
 // A claimed artifact reference is not a verified GitHub artifact.
 // Resolve metadata through authenticated API calls, never from a stored URL.
 const artifactChecks=await Promise.all(PILOTS.map(async scpi_slug=>{
  const review=snapshot.reviews?.find(r=>r.scpi_slug===scpi_slug);
  const browser=review?.review_evidence?.browser_smoke;
  if(!browser)return {scpi_slug,status:'BLOCKED',reason:'NO_PRIVATE_BROWSER_ARTIFACT',artifact_provenance_verified:false,content_verified:false};
  const check=await verifyGitHubBrowserArtifact({
   browser,expectedSha,token:process.env.GITHUB_TOKEN
  });
  return {scpi_slug,status:check.status,reason:check.reason||null,
    artifact_provenance_verified:check.artifact_provenance_verified===true,
    content_verified:false};
 }));
 const artifactBlockers=artifactChecks.filter(x=>!x.artifact_provenance_verified)
   .map(x=>x.scpi_slug+':'+x.reason);
 if(phase==='prepublication'){
  const report={
   phase:'PROTECTED_PREPUBLICATION',status:'NO_GO',
   reason:evidence.status!=='CANDIDATE_FOR_PROTECTED_PUBLISH_APPROVAL'?
     'LIVE_PREPUBLICATION_PROOFS_INCOMPLETE':artifactBlockers.length?
     'LIVE_GITHUB_BROWSER_ARTIFACT_PROVENANCE_FAILED':'AWAIT_INDEPENDENT_FINAL_APPROVAL',
   candidate_sha:expectedSha,db_snapshot_digest_sha256:hashEvidenceSnapshot(snapshot),
   evidence_status:evidence.status,blocker_count:evidence.blocker_count,blockers:evidence.blockers,
   github_artifact_checks:artifactChecks,github_artifact_blockers:artifactBlockers,
   production_sha_verified:false,publication_authorized:false,postdeploy_100_proven:false
  };
  outputReport(report);
  process.exitCode=1;return report;
 }
 const site=await fetchNetlify('https://api.netlify.com/api/v1/sites/'+siteId);
 const deployId=site.published_deploy?.id||site.published_deploy_id;
 if(typeof deployId!=='string'||!/^[a-zA-Z0-9_-]+$/.test(deployId))
  throw Error('NETLIFY_PUBLISHED_DEPLOY_ID_UNAVAILABLE');
 const deploy=await fetchNetlify('https://api.netlify.com/api/v1/deploys/'+deployId);
 const published=evaluatePublishedDeploy({site,deploy,expectedSha});
 const report={
  phase:'PROTECTED_PRODUCTION_READBACK',
  status:'NO_GO',
  reason:evidence.status!=='CANDIDATE_FOR_PROTECTED_PUBLISH_APPROVAL'?
    'LIVE_PREPUBLICATION_PROOFS_INCOMPLETE':artifactBlockers.length?
    'LIVE_GITHUB_BROWSER_ARTIFACT_PROVENANCE_FAILED':published.production_sha_verified!==true?
    'LIVE_PRODUCTION_SHA_DIFFERENT':'AWAIT_INDEPENDENT_PRODUCTION_BROWSER_ATTESTATION',
  candidate_sha:expectedSha,db_snapshot_digest_sha256:hashEvidenceSnapshot(snapshot),
  github_artifact_checks:artifactChecks,
  github_artifact_blockers:artifactBlockers,
  evidence_status:evidence.status,blocker_count:evidence.blocker_count,
  blockers:evidence.blockers,production_sha_verified:published.production_sha_verified,
  netlify_status:published.status,netlify_reason:published.reason||null,
  publication_authorized:false,postdeploy_100_proven:false
 };
 outputReport(report);
 // NO automatic signing, promotion or SUCCESS until a separate, protected
 // real production browser run and independent approvals are integrated.
 process.exitCode=1;
 return report;
}
if(import.meta.url===new URL('file://'+process.argv[1]).href){
 runProtectedReadback().catch(error=>{
  outputReport({phase:'PROTECTED_PRODUCTION_READBACK',status:'NO_GO',reason:error.message,
   publication_authorized:false,postdeploy_100_proven:false});
  process.exitCode=1;
 });
}
