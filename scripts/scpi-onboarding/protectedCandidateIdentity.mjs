// Protected runner MUST execute trusted main code, not the candidate PR code.
// A candidate SHA is merely an input and must equal the current unmerged PR HEAD.
const SHA=/^[a-f0-9]{40}$/;
const PR=292;
const REPO_ID=1125202916;
const API='https://api.github.com/repos/Speedcup212/maximus-scpi/pulls/'+PR;
const fail=reason=>({status:'BLOCKED',reason,pr_identity_verified:false,publication_authorized:false});

export function evaluateCandidatePrIdentity({pr,candidateSha}) {
 if(!SHA.test(candidateSha||''))return fail('CANDIDATE_SHA_MALFORMED');
 if(!pr||pr.number!==PR||pr.state!=='open'||pr.merged===true||pr.merged_at)
  return fail('CANDIDATE_PR_NOT_OPEN');
 if(pr.head?.sha!==candidateSha||pr.head?.ref!=='recovery/091-scpi-certification-industrialisation'||
    pr.head?.repo?.id!==REPO_ID||pr.head?.repo?.full_name!=='Speedcup212/maximus-scpi')
  return fail('PR_HEAD_SHA_OR_ORIGIN_CHANGED');
 if(pr.base?.ref!=='main'||pr.base?.repo?.id!==REPO_ID)
  return fail('UNEXPECTED_TARGET_BRANCH');
 return {status:'CURRENT_PR_HEAD_MATCH',pr_number:PR,candidate_sha:candidateSha,
  pr_identity_verified:true,publication_authorized:false};
}
export async function verifyCurrentCandidatePr({candidateSha,token,fetchImpl=fetch}) {
 if(typeof token!=='string'||token.length<8)return fail('GITHUB_READ_TOKEN_MISSING');
 if(!SHA.test(candidateSha||''))return fail('CANDIDATE_SHA_MALFORMED');
 try{
  const r=await fetchImpl(API,{method:'GET',headers:{
   Authorization:'Bearer '+token,Accept:'application/vnd.github+json',
   'X-GitHub-Api-Version':'2022-11-28'},
   redirect:'error',signal:AbortSignal.timeout(15000)});
  if(!r.ok)return fail('GITHUB_PR_IDENTITY_LOOKUP_FAILED');
  return evaluateCandidatePrIdentity({pr:await r.json(),candidateSha});
 }catch{return fail('GITHUB_PR_IDENTITY_LOOKUP_FAILED');}
}
