import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateArtifactMetadata,verifyGitHubBrowserArtifact} from './githubArtifactProvenance.mjs';
const sha='a'.repeat(40),digest='b'.repeat(64),id=123456,runid=345678,repoid=1125202916;
function fixture() {
 const browser={run_url:'https://github.com/Speedcup212/maximus-scpi/actions/runs/'+runid,
  artifact_id:id,artifact_zip_sha256:digest};
 const artifact={id,digest:'sha256:'+digest,expired:false,size_in_bytes:1200,
  created_at:'2026-11-05T18:30:00Z',
  workflow_run:{id:runid,repository_id:repoid,head_repository_id:repoid,head_sha:sha}};
 const run={id:runid,head_sha:sha,status:'completed',conclusion:'success',
  created_at:'2026-11-05T18:00:00Z',repository:{id:repoid},head_repository:{id:repoid}};
 return {browser,artifact,run,expectedSha:sha};
}
test('matching GitHub metadata only certifies artifact provenance, never ZIP content or publication',()=>{
 const r=evaluateArtifactMetadata(fixture());
 assert.equal(r.status,'GITHUB_ARTIFACT_METADATA_MATCH');
 assert.equal(r.artifact_provenance_verified,true);
 assert.equal(r.content_verified,false);
 assert.equal(r.publication_authorized,false);
});
test('fake GitHub run URLs, IDs, expired artifacts and wrong hashes are rejected',()=>{
 const scenarios=[
 x=>{x.browser.run_url='https://github.com/attacker/repo/actions/runs/'+runid;},
 x=>{x.browser.run_url+='?foo=bar';},
 x=>{x.browser.artifact_id=99999;},
 x=>{x.artifact.workflow_run.id=99999;},
 x=>{x.artifact.expired=true;},
 x=>{x.artifact.digest='sha256:'+'c'.repeat(64);},
 x=>{x.browser.artifact_zip_sha256='c'.repeat(64);},
 x=>{x.artifact.workflow_run.head_sha='c'.repeat(40);},
 x=>{x.run.head_sha='c'.repeat(40);},
 x=>{x.artifact.workflow_run.repository_id=999;},
 x=>{x.run.repository.id=999;},
 x=>{x.run.conclusion='failure';},
 x=>{x.run.status='in_progress';},
 x=>{x.artifact.created_at='2026-11-05T17:59:00Z';},
 x=>{x.artifact.size_in_bytes=0;}
 ];
 for(const [i,mutate] of scenarios.entries()){
  const f=fixture();mutate(f);assert.equal(evaluateArtifactMetadata(f).status,'BLOCKED','case '+i);
 }
});
test('protected executor calls only allowlisted repo REST endpoints using its own token',async()=>{
 const f=fixture();const seen=[];
 const fetchImpl=async(url,init)=>{
  seen.push({url,method:init.method,auth:init.headers.Authorization});
  return {ok:true,json:async()=>url.includes('/artifacts/')?f.artifact:f.run};
 };
 const r=await verifyGitHubBrowserArtifact({browser:f.browser,expectedSha:sha,token:'synthetic-protected-read-token',fetchImpl});
 assert.equal(r.artifact_provenance_verified,true);
 assert.equal(seen.length,2);
 assert.ok(seen.every(x=>x.url.startsWith('https://api.github.com/repos/Speedcup212/maximus-scpi/actions/')));
 assert.ok(seen.every(x=>x.method==='GET'));
 assert.ok(seen.every(x=>x.auth==='Bearer synthetic-protected-read-token'));
});
test('missing token, foreign URL or GitHub API failure fail closed',async()=>{
 const f=fixture();
 assert.equal((await verifyGitHubBrowserArtifact({browser:f.browser,expectedSha:sha,token:''})).status,'BLOCKED');
 assert.equal((await verifyGitHubBrowserArtifact({browser:{...f.browser,run_url:'https://evil.example/'},expectedSha:sha,token:'synthetic'})).status,'BLOCKED');
 assert.equal((await verifyGitHubBrowserArtifact({browser:f.browser,expectedSha:sha,token:'synthetic',fetchImpl:async()=>({ok:false,status:403})})).status,'BLOCKED');
});
