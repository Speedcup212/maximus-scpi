import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {CORUM,FUND_SURFACES,COMMON_SURFACES,assertCompleteCorumMatrix,verifyCompletedCorumBrowserRun} from './verifyCorumBrowserEvidence.mjs';

const sha='a'.repeat(40),runId=54321;
const matrix=()=>({
 kind:'corum_private_staging_browser_matrix',
 github_run_id:runId,commit_sha:sha,
 candidate_scpis_verified:[...CORUM],
 cases:[...CORUM.flatMap(slug=>FUND_SURFACES.map(surface=>({
  slug,surface,status:'pass',assertions:{actual_dom_or_http_check:true}
 }))),...COMMON_SURFACES.map(surface=>({slug:'shared',surface,status:'pass',assertions:{actual_dom_or_http_check:true}}))]
});
function simpleZip(name,contents){
 const data=Buffer.from(contents),key=Buffer.from(name);
 const local=Buffer.alloc(30+key.length);
 local.writeUInt32LE(0x04034b50,0);local.writeUInt16LE(20,4);
 local.writeUInt32LE(data.length,18);local.writeUInt32LE(data.length,22);
 local.writeUInt16LE(key.length,26);key.copy(local,30);
 const central=Buffer.alloc(46+key.length);
 central.writeUInt32LE(0x02014b50,0);central.writeUInt16LE(20,4);central.writeUInt16LE(20,6);
 central.writeUInt32LE(data.length,20);central.writeUInt32LE(data.length,24);
 central.writeUInt16LE(key.length,28);key.copy(central,46);
 const end=Buffer.alloc(22);
 end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(1,8);end.writeUInt16LE(1,10);
 end.writeUInt32LE(central.length,12);end.writeUInt32LE(local.length+data.length,16);
 return Buffer.concat([local,data,central,end]);
}
test('a complete matrix tests six SCPI consumers per fund and four shared features once',()=>{
 assert.equal(assertCompleteCorumMatrix(matrix(),runId,sha),true);
 const missing=matrix();missing.cases.pop();
 assert.throws(()=>assertCompleteCorumMatrix(missing,runId,sha),/4 x 6 consommateurs/);
 const duplicate=matrix();duplicate.cases[1]=duplicate.cases[0];
 assert.throws(()=>assertCompleteCorumMatrix(duplicate,runId,sha),/dupliqué/);
 const wrong=matrix();wrong.cases[0].assertions.actual_dom_or_http_check=false;
 assert.throws(()=>assertCompleteCorumMatrix(wrong,runId,sha),/incomplet/);
});
test('true completed GitHub run and exact downloaded artifact digest can be checked',async()=>{
 const zip=simpleZip('browser-matrix.json',JSON.stringify(matrix()));
 const digest=createHash('sha256').update(zip).digest('hex');
 const batch={run_id:runId,commit_sha:sha,artifact_sha256:digest};
 const fakeFetch=async url=>{
  if(url.endsWith('/actions/runs/'+runId))return new Response(JSON.stringify({
   status:'completed',conclusion:'success',head_sha:sha,
   name:'CORUM private staging browser acceptance',
   repository:{full_name:'Speedcup212/maximus-scpi'}
  }),{status:200});
  if(url.endsWith('/actions/runs/'+runId+'/artifacts'))
    return new Response(JSON.stringify({artifacts:[{id:456,name:'corum-private-browser-'+runId,
      expired:false,digest:'sha256:'+digest}]}),{status:200});
  if(url.endsWith('/actions/artifacts/456/zip'))return new Response(zip,{status:200});
  return new Response('',{status:404});
 };
 const r=await verifyCompletedCorumBrowserRun(batch,{fetchImpl:fakeFetch,
    token:'ci-test-token',checkoutSha:sha});
 assert.equal(r.checked_cases,28);
 assert.equal(r.verified,true);
 await assert.rejects(()=>verifyCompletedCorumBrowserRun({...batch,artifact_sha256:'0'.repeat(64)},
  {fetchImpl:fakeFetch,token:'ci-test-token',checkoutSha:sha}),/empreinte divergente/);
 await assert.rejects(()=>verifyCompletedCorumBrowserRun(batch,
  {fetchImpl:fakeFetch,token:'ci-test-token',checkoutSha:'b'.repeat(40)}),/autre code/);
});
test('a local status string or GitHub-looking link alone is not enough',async()=>{
 await assert.rejects(()=>verifyCompletedCorumBrowserRun({run_id:runId,commit_sha:sha,
   artifact_sha256:'0'.repeat(64)},{token:'' ,checkoutSha:sha}),/GITHUB_TOKEN requis/);
});
