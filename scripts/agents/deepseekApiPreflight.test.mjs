import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyDeepSeekReady} from './deepseekApiPreflight.mjs';

const key='sk-'+'x'.repeat(44);
test('Authenticated catalog proves Flash availability with no inference request',async()=>{
 const calls=[];
 const r=await verifyDeepSeekReady({apiKey:key,fetcher:async (url,init)=>{
  calls.push({url,init});
  return {ok:true,status:200,json:async()=>({
    object:'list',data:[{id:'deepseek-flash',object:'model'}]
  })};
 }});
 assert.equal(r.ready,true);
 assert.equal(r.model,'deepseek-flash');
 assert.equal(r.inference_calls,0);
 assert.equal(r.release_authorized,false);
 assert.equal(calls.length,1);
 assert.equal(calls[0].url,'https://api.deepseek.com/models');
 assert.equal(calls[0].init.method,'GET');
 assert.equal(calls[0].init.redirect,'error');
 assert.equal(calls[0].init.headers.Authorization,'Bearer '+key);
});
test('Missing/short API key is rejected before making any HTTP request',async()=>{
 let called=false;
 for(const value of [undefined,'',null,'sk-test']){
  await assert.rejects(verifyDeepSeekReady({apiKey:value,fetcher:async()=>{called=true;}}),/DEEPSEEK_API_KEY_MISSING/);
 }
 assert.equal(called,false);
});
test('Wrong API key, failed JSON and absent required model fail closed',async()=>{
 await assert.rejects(verifyDeepSeekReady({apiKey:key,fetcher:async()=>({ok:false,status:401})}),/DEEPSEEK_MODELS_ENDPOINT_REJECTED_401/);
 await assert.rejects(verifyDeepSeekReady({apiKey:key,fetcher:async()=>({ok:true,status:200,json:async()=>{throw Error('secret in body');}})}),/DEEPSEEK_MODELS_ENDPOINT_INVALID_JSON/);
 await assert.rejects(verifyDeepSeekReady({apiKey:key,fetcher:async()=>({ok:true,status:200,json:async()=>({object:'list',data:[{id:'deepseek-v4-pro'}]})})}),/DEEPSEEK_FLASH_MODEL_NOT_LISTED/);
 await assert.rejects(verifyDeepSeekReady({apiKey:key,fetcher:async()=>({ok:true,status:200,json:async()=>({object:'invalid',data:[]})})}),/DEEPSEEK_FLASH_MODEL_NOT_LISTED/);
});
test('Catalog metadata does not disclose account key or tokens',async()=>{
 const r=await verifyDeepSeekReady({apiKey:key,fetcher:async()=>({ok:true,status:200,json:async()=>({
  object:'list',data:[{id:'deepseek-flash',token:'private',secret:key}]
 })})});
 assert.equal(JSON.stringify(r).includes(key),false);
 assert.equal(JSON.stringify(r).includes('private'),false);
 assert.equal(JSON.stringify(r).includes('usage'),false);
});
