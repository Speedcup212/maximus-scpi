// Protected runner: download bytes ONLY from a GitHub-authenticated artifact API
// redirect. Rehash the ZIP and verify all 12 screenshots against its manifest.
// All claims remain prepublication evidence, never financial or legal certification.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const MAX_BYTES=60_000_000;
const DIGEST=/^[a-f0-9]{64}$/;
const ROOT=path.resolve(fileURLToPath(new URL('../../',import.meta.url)));
const fail=reason=>({status:'BLOCKED',reason,content_verified:false,publication_authorized:false});

export async function verifyArtifactArchive({
 artifactId,zipDigest,candidate,expectedSha,sourcePeriod,
 token,fetchImpl=fetch,python='python3'
}){
 if(!Number.isSafeInteger(artifactId)||artifactId<=0||!DIGEST.test(zipDigest||'')||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(candidate||'')||
    !/^[a-f0-9]{40}$/.test(expectedSha||'')||
    !/^20\d\d-(?:T[1-4]|S[12])$/.test(sourcePeriod||''))
  return fail('ARTIFACT_ARCHIVE_INPUT_INVALID');
 if(typeof token!=='string'||token.length<8)return fail('GITHUB_READ_TOKEN_NOT_CONFIGURED');
 let folder;
 try{
  const api='https://api.github.com/repos/Speedcup212/maximus-scpi/actions/artifacts/'+artifactId+'/zip';
  const redirect=await fetchImpl(api,{method:'GET',redirect:'manual',headers:{
   Authorization:'Bearer '+token,Accept:'application/vnd.github+json',
   'X-GitHub-Api-Version':'2022-11-28'},signal:AbortSignal.timeout(20000)});
  if(redirect.status!==302)return fail('ARTIFACT_DOWNLOAD_API_DID_NOT_REDIRECT');
  const destination=new URL(redirect.headers.get('location'));
  if(destination.protocol!=='https:'||destination.username||destination.password||
     destination.hostname==='api.github.com')
   return fail('UNSAFE_ARTIFACT_DOWNLOAD_REDIRECT');
  const response=await fetchImpl(destination.href,{
   method:'GET',redirect:'error',signal:AbortSignal.timeout(60000)});
  if(!response.ok||!response.body)return fail('ARTIFACT_DOWNLOAD_FAILED');
  const length=Number(response.headers.get('content-length'));
  if(Number.isFinite(length)&&length>MAX_BYTES)return fail('ARCHIVE_LARGER_THAN_LIMIT');
  const chunks=[];let total=0;
  const reader=response.body.getReader();
  while(true){
   const {done,value}=await reader.read();
   if(done)break;
   total+=value.byteLength;
   if(total>MAX_BYTES){await reader.cancel();return fail('ARCHIVE_EXCEEDS_LIMIT');}
   chunks.push(Buffer.from(value));
  }
  const bytes=Buffer.concat(chunks,total);
  if(createHash('sha256').update(bytes).digest('hex')!==zipDigest)
   return fail('DOWNLOADED_ZIP_HASH_MISMATCH');
  folder=fs.mkdtempSync(path.join(os.tmpdir(),'scpi-protected-zip-'));
  const file=path.join(folder,'proof.zip');
  fs.writeFileSync(file,bytes,{mode:0o600});
  let result;
  try{
   result=JSON.parse(execFileSync(python,[
     'scripts/scpi-onboarding/verify_browser_artifact.py',
     '--zip',file,'--candidate',candidate,'--sha',expectedSha,
     '--source-period',sourcePeriod,'--zip-digest',zipDigest
   ],{cwd:ROOT,timeout:30000,encoding:'utf8',
      maxBuffer:65536,stdio:['ignore','pipe','ignore']}).trim());
  }catch{return fail('ARCHIVE_CASES_NOT_INDEPENDENTLY_VERIFIABLE');}
  return {status:result.status,reason:result.reason||null,
   case_count_verified:result.case_count_verified||0,
   content_verified:result.content_verified===true,
   publication_authorized:false};
 }catch{return fail('PROTECTED_ARTIFACT_DOWNLOAD_ERROR');}
 finally{if(folder)fs.rmSync(folder,{recursive:true,force:true});}
}
