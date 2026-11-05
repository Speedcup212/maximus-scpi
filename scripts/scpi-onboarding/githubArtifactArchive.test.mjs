import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyArtifactArchive} from './githubArtifactArchive.mjs';
const base={artifactId:123456,zipDigest:'a'.repeat(64),
 candidate:'sofidynamic',expectedSha:'b'.repeat(40),sourcePeriod:'2026-T2',
 token:'synthetic-token'};
test('missing token, SHA, digest, period or artifact ID fail before any network call',async()=>{
 for(const change of [
  {token:''},{artifactId:-3},{zipDigest:'notahash'},
  {expectedSha:'short'},{sourcePeriod:'2026-FAKE'},{candidate:'../other'}
 ]){
  const r=await verifyArtifactArchive({...base,...change,fetchImpl:()=>{throw Error('network should not be called')}});
  assert.equal(r.status,'BLOCKED');
  assert.equal(r.publication_authorized,false);
 }
});
test('untrusted signed redirect, unexpected API status and digest mismatch fail closed',async()=>{
 const redirect=(location,status=302)=>({status,headers:{get:()=>location}});
 const failCases=[
  async()=>redirect('http://insecure.example/proof.zip'),
  async()=>redirect('https://api.github.com/attack'),
  async()=>redirect('https://storage.example/a',403),
 ];
 for(const fetchImpl of failCases){
  const r=await verifyArtifactArchive({...base,fetchImpl});
  assert.equal(r.status,'BLOCKED');
 }
 const seen=[];
 const data=new Uint8Array([1,2,3,4]);
 const fetchImpl=async (url,init)=>{
  seen.push([url,init.headers?.Authorization||null]);
  if(url.startsWith('https://api.github.com'))return redirect('https://storage.example/proof.zip');
  return {ok:true,headers:{get:()=>String(data.byteLength)},
   body:new ReadableStream({start(controller){controller.enqueue(data);controller.close();}})};
 };
 const r=await verifyArtifactArchive({...base,fetchImpl});
 assert.equal(r.status,'BLOCKED');
 assert.equal(r.reason,'DOWNLOADED_ZIP_HASH_MISMATCH');
 assert.equal(seen.length,2);
 assert.ok(seen[0][1]?.startsWith('Bearer '));
 assert.equal(seen[1][1],null,'never forward the GitHub token to signed blob storage');
});
