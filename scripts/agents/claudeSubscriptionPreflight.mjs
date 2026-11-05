// Zero-cost preflight for native Claude Code with individual subscription auth.
// Never requests OAuth tokens, never calls a paid model, never prints credentials.
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {subscriptionOnlyEnv} from './subscriptionCliRunner.mjs';

export function diagnoseClaudeSubscription({runner=spawnSync,env=process.env}={}){
 const result=runner('claude',['auth','status'],{
  env:subscriptionOnlyEnv(env),encoding:'utf8',timeout:15000,
  shell:false,windowsHide:true,maxBuffer:8192
 });
 if(result.error||result.status!==0)
  return {ready:false,reason:'CLAUDE_CODE_NOT_INSTALLED_OR_NOT_LOGGED_IN',
   next_step:'Install Claude Code and run claude auth login; sign in with the Claude subscription, not Console API.'};
 let auth;
 try{auth=JSON.parse(result.stdout);}catch{
  return {ready:false,reason:'CLAUDE_AUTH_STATUS_UNREADABLE'};
 }
 if(auth.authMethod!=='claude.ai')
  return {ready:false,reason:'NON_SUBSCRIPTION_AUTH',
   auth_method:typeof auth.authMethod==='string'?auth.authMethod:'unknown',
   next_step:'Use claude auth login with the paid Claude account. Do not use an ANTHROPIC_API_KEY.'};
 return {ready:true,auth_method:'claude.ai',api_billing_enabled:false,
  local_claude_code_available:true,
  remote_agents_activated:false,publication_authorized:false};
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===path.resolve(process.argv[1])){
 const result=diagnoseClaudeSubscription();
 process.stdout.write(JSON.stringify(result)+'\n');
 process.exitCode=result.ready?0:1;
}
