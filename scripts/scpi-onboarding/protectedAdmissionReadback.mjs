// Protected MAIN-only diagnostic (not a release service).
// Requires a database account with SELECT privilege only, and Netlify read access.
// Does not sign, write to Supabase, authorize publication, or certify 100/100.
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import {evaluateProtectedReleaseEvidence,hashEvidenceSnapshot} from './protectedReleaseEvidence.mjs';
import {evaluatePublishedDeploy} from './protectedProductionReadback.mjs';

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
   env:{...process.env,PGDATABASE:db,PGOPTIONS:'-c default_transaction_read_only=on -c statement_timeout=15000'},
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
 const expectedSha=process.env.GITHUB_SHA;
 if(process.env.GITHUB_REF!=='refs/heads/main'||!(/^[a-f0-9]{40}$/.test(expectedSha||'')))
  throw Error('PROTECTED_RUN_MUST_USE_MAIN_COMMIT');
 const snapshot=readDatabase();
 const evidence=evaluateProtectedReleaseEvidence(snapshot,{expectedSha});
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
    'LIVE_PREPUBLICATION_PROOFS_INCOMPLETE':published.production_sha_verified!==true?
    'LIVE_PRODUCTION_SHA_DIFFERENT':'AWAIT_INDEPENDENT_PRODUCTION_BROWSER_ATTESTATION',
  candidate_sha:expectedSha,db_snapshot_digest_sha256:hashEvidenceSnapshot(snapshot),
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
