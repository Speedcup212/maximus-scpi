import test from 'node:test';
import assert from 'node:assert/strict';
import {
 subscriptionOnlyEnv,subscriptionCommand,parseSubscriptionReply,
 buildSubscriptionPrompt,runSubscriptionCandidate
} from './subscriptionCliRunner.mjs';

const file='scripts/scpi-candidates/scope.test.mjs';
const issue={owner_role:'DATA',issue_key:'RECOVERY-114-SYNTHETIC',
 title:'Test bounded scope',acceptance:'Add a bounded assertion without altering release gates.',
 scope:{execution_mode:'scoped_code_correction',files:[file]}};
const candidate={role:'DATA',kind:'execute',payload:{issues:[issue]}};

test('Claude Code subscription avoids all API keys and cloud write tokens',()=>{
 const clean=subscriptionOnlyEnv({
  ANTHROPIC_API_KEY:'secret',DEEPSEEK_API_KEY:'secret',OPENAI_API_KEY:'secret',
  SUPABASE_DB_URL:'secret',GH_TOKEN:'secret',GITHUB_TOKEN:'secret',
  NETLIFY_AUTH_TOKEN:'secret',HOME:'/fake/user',PATH:'/fake/path'
 });
 for(const k of ['ANTHROPIC_API_KEY','DEEPSEEK_API_KEY','OPENAI_API_KEY',
  'SUPABASE_DB_URL','GH_TOKEN','GITHUB_TOKEN','NETLIFY_AUTH_TOKEN'])
  assert.equal(clean[k],undefined,k);
 assert.equal(clean.HOME,'/fake/user');
 assert.equal(clean.PATH,'/fake/path');
});
test('Claude Code is invoked without tools, permission prompts, persistent sessions or API-key fallback',()=>{
 const req=subscriptionCommand('claude','safe proposal');
 assert.equal(req.file,'claude');
 assert.deepEqual(req.args.slice(0,2),['-p','--bare']);
 for(const flag of ['--restricted','--tools','--permission-mode','--permission-prompts',
  '--no-session-persistence','--output-format','--max-turns','--disallowedTools'])
  assert.ok(req.args.includes(flag),flag);
 assert.equal(req.args[req.args.indexOf('--tools')+1],'');
 assert.equal(req.args[req.args.indexOf('--permission-mode')+1],'plan');
 assert.equal(req.args[req.args.indexOf('--permission-prompts')+1],'none');
 assert.equal(req.args[req.args.indexOf('--disallowedTools')+1],'mcp__*');
 assert.equal(req.args.at(-1),'safe proposal');
 assert.ok(!req.args.includes('--dangerously-skip-permissions'));
});
test('Other subscription code provider is optional, not invoked by selected Claude runner',()=>{
 assert.throws(()=>subscriptionCommand('deepseek','anything'),/UNSUPPORTED/);
 const r=subscriptionCommand('codex','safe proposal');
 assert.equal(r.file,'codex');
});
test('Claude JSON proposal must contain exactly one safe replacement for the exact file',()=>{
 const edit={status:'edit',file,find:'const a=1;',replace:'const a=2;',summary:'small fix'};
 const raw=JSON.stringify({is_error:false,result:JSON.stringify(edit)});
 assert.deepEqual(parseSubscriptionReply('claude',raw,file),edit);
 assert.throws(()=>parseSubscriptionReply('claude',raw,'src/other.ts'),/unsafe/);
 assert.throws(()=>parseSubscriptionReply('claude',JSON.stringify({is_error:true,result:JSON.stringify(edit)}),file),/NO_APPROVED_RESULT/);
 assert.throws(()=>parseSubscriptionReply('claude',JSON.stringify({result:'not json'}),file));
 assert.deepEqual(parseSubscriptionReply('claude',JSON.stringify({result:'{"status":"cannot_fix","reason":"insufficient evidence"}'}),file),
  {status:'cannot_fix',reason:'insufficient evidence'});
});
test('Prompt carries one exact scoped issue and does not authorize arbitrary commands',()=>{
 const prompt=buildSubscriptionPrompt({issue,filepath:file,source:'const a=1;'});
 assert.match(prompt,/Never execute commands/);
 assert.match(prompt,/scope\.test\.mjs/);
 assert.match(prompt,/RECOVERY-114-SYNTHETIC/);
 assert.match(prompt,/Never disable tests/);
});
test('Invalid or unsafe tasks are rejected before CLI/auth calls or file writes',()=>{
 for(const taskPath of ['./relative.json','','../outside.json']){
  assert.throws(()=>runSubscriptionCandidate({provider:'claude',taskPath,runner:()=>{throw Error('CLI used unexpectedly');}}));
 }
 assert.throws(()=>runSubscriptionCandidate({provider:'deepseek',taskPath:'/tmp/does-not-exist.json',runner:()=>{throw Error('CLI called');}}),/UNSUPPORTED/);
 assert.equal(candidate.kind,'execute');
});
