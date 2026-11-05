// GitHub Actions provenance verifier, strictly read-only. No URL from DB is fetched.
// PR-provided URLs, hashes, and test flags are untrusted claims until checked
// against GitHub's live artifact and workflow-run APIs by a protected executor.
const SHA=/^[a-f0-9]{40}$/;
const DIGEST=/^sha256:([a-f0-9]{64})$/;
const RUN_URL=/^https:\/\/github\.com\/Speedcup212\/maximus-scpi\/actions\/runs\/([1-9][0-9]*)$/;
const API='https://api.github.com/repos/Speedcup212/maximus-scpi/actions';
const REPO_ID=1125202916;
const fail=(reason)=>({status:'BLOCKED',reason,artifact_provenance_verified:false,content_verified:false,publication_authorized:false});
const integer=(value)=>Number.isSafeInteger(value)&&value>0;

export function evaluateArtifactMetadata({browser,artifact,run,expectedSha}) {
 if(!SHA.test(expectedSha||''))return fail('EXPECTED_SHA_INVALID');
 const runMatch=RUN_URL.exec(browser?.run_url||'');
 if(!runMatch||!integer(browser?.artifact_id)||!DIGEST.test('sha256:'+(browser?.artifact_zip_sha256||'')))
  return fail('STORED_BROWSER_PROOF_REFERENCE_INVALID');
 const runId=Number(runMatch[1]);
 if(!integer(runId)||!artifact||!run||artifact.id!==browser.artifact_id||
     artifact.workflow_run?.id!==runId||run.id!==runId)
  return fail('ARTIFACT_NOT_BOUND_TO_STATED_RUN');
 if(artifact.expired===true||artifact.deleted===true||artifact.size_in_bytes<=0)
  return fail('ARTIFACT_EXPIRED_OR_EMPTY');
 if(artifact.workflow_run?.repository_id!==REPO_ID||
    artifact.workflow_run?.head_repository_id!==REPO_ID||
    run.repository?.id!==REPO_ID || run.head_repository?.id!==REPO_ID)
  return fail('ARTIFACT_OR_RUN_REPOSITORY_MISMATCH');
 if(artifact.workflow_run.head_sha!==expectedSha||run.head_sha!==expectedSha)
  return fail('ARTIFACT_SOURCE_COMMIT_SHA_MISMATCH');
 if(run.conclusion!=='success'||run.status!=='completed')
  return fail('SOURCE_WORKFLOW_NOT_SUCCESSFUL');
 if(artifact.digest!=='sha256:'+browser.artifact_zip_sha256||
    !DIGEST.test(artifact.digest))
  return fail('GITHUB_ARTIFACT_DIGEST_MISMATCH');
 const artifactAt=Date.parse(artifact.created_at),runAt=Date.parse(run.created_at);
 if(!Number.isFinite(artifactAt)||!Number.isFinite(runAt)||artifactAt<runAt)
  return fail('ARTIFACT_RUN_CHRONOLOGY_INVALID');
 return {status:'GITHUB_ARTIFACT_METADATA_MATCH',run_id:runId,
   artifact_id:artifact.id,sha:expectedSha,artifact_zip_sha256:browser.artifact_zip_sha256,
   artifact_provenance_verified:true,content_verified:false,publication_authorized:false};
}
export async function verifyGitHubBrowserArtifact({browser,expectedSha,token,fetchImpl=fetch}) {
 if(typeof token!=='string'||token.trim().length<8) return fail('GITHUB_READ_TOKEN_NOT_CONFIGURED');
 const match=RUN_URL.exec(browser?.run_url||'');
 if(!match||!integer(browser?.artifact_id))return fail('STORED_BROWSER_PROOF_REFERENCE_INVALID');
 const ids=[browser.artifact_id,Number(match[1])];
 if(!ids.every(integer))return fail('GITHUB_REFERENCE_INVALID');
 async function read(path){
  const response=await fetchImpl(API+path,{method:'GET',
   headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json',
    'X-GitHub-Api-Version':'2022-11-28'},
   redirect:'error',signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw Error('GitHub evidence API status '+response.status);
  return response.json();
 }
 try{
  const [artifact,run]=await Promise.all([
    read('/artifacts/'+ids[0]),read('/runs/'+ids[1])
  ]);
  return evaluateArtifactMetadata({browser,artifact,run,expectedSha});
 }catch{return fail('GITHUB_LIVE_ARTIFACT_LOOKUP_FAILED');}
}
