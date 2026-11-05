import test from 'node:test';
import assert from 'node:assert/strict';
import {diagnoseClaudeSubscription} from './claudeSubscriptionPreflight.mjs';

test('valid Claude subscription login passes without model call and without revealing credentials',()=>{
 const calls=[];
 const result=diagnoseClaudeSubscription({env:{ANTHROPIC_API_KEY:'secret','PATH':'/bin'},
  runner:(bin,args,options)=>{
   calls.push({bin,args,env:options.env});
   return {status:0,stdout:JSON.stringify({authMethod:'claude.ai',secret:'DONT_DISPLAY'})};
 }});
 assert.equal(result.ready,true);
 assert.equal(result.api_billing_enabled,false);
 assert.equal(result.remote_agents_activated,false);
 assert.equal(result.publication_authorized,false);
 assert.equal(JSON.stringify(result).includes('DONT_DISPLAY'),false);
 assert.equal(calls.length,1);
 assert.deepEqual(calls[0].args,['auth','status']);
 assert.equal(calls[0].env.ANTHROPIC_API_KEY,undefined);
});
test('API key or third-party authentication never qualifies as subscription login',()=>{
 for(const method of ['api_key','third_party','oauth_token',null]){
  const result=diagnoseClaudeSubscription({runner:()=>({
   status:0,stdout:JSON.stringify({authMethod:method})
  })});
  assert.equal(result.ready,false);
  assert.equal(result.reason,'NON_SUBSCRIPTION_AUTH');
 }
});
test('missing Claude CLI and invalid auth JSON fail closed',()=>{
 const missing=diagnoseClaudeSubscription({runner:()=>({status:1})});
 assert.equal(missing.ready,false);
 const invalid=diagnoseClaudeSubscription({runner:()=>({status:0,stdout:'NO_JSON'})});
 assert.equal(invalid.reason,'CLAUDE_AUTH_STATUS_UNREADABLE');
});
