import test from 'node:test';
import assert from 'node:assert/strict';
import {allowedCorrectiveFile,selectScope,parseDeepSeekEdit,applyExactReplacement,buildRequest}
 from './deepseekCorrectiveRunner.mjs';
const issue={owner_role:'DATA',issue_key:'DATA-TEST',title:'Small correction',
 acceptance:'Add a targeted assertion while preserving release gates and client data.',
 scope:{execution_mode:'scoped_code_correction',files:['scripts/scpi-candidates/iri.test.mjs']}};
const task={role:'DATA',kind:'execute',payload:{issues:[issue]}};

test('Both DATA and SEARCH scoped exact file corrections can execute',()=>{
 assert.equal(selectScope(task).filepath,'scripts/scpi-candidates/iri.test.mjs');
 assert.equal(selectScope({...task,role:'SEARCH',payload:{issues:[{...issue,owner_role:'SEARCH'}]}}).issue.owner_role,'SEARCH');
 assert.equal(allowedCorrectiveFile('src/components/ScpiDetailPage.tsx'),true);
});
test('Broad CORUM, QA and unscoped finance tasks never claim as code corrections',()=>{
 assert.throws(()=>selectScope({...task,payload:{issues:[{...issue,scope:{scpi_slugs:['corum-xl']}}]}}),/unapproved_scope/);
 assert.throws(()=>selectScope({...task,role:'QA'}),/unsupported/);
 assert.throws(()=>selectScope({...task,payload:{issues:[issue,issue]}}),/exactly_one_issue/);
});
test('Protected config, private data, filesystem traversal and model secrets denied',()=>{
 for(const f of ['.github/workflows/deploy.yml','src/data/scpi_complet.json',
  'scripts/agents/growthQuota.mjs','src/../.env','src/payment/stripe.ts',
  'netlify/functions/secrets.js','scripts/correctiveRunner.mjs','/tmp/key.ts']) {
  assert.equal(allowedCorrectiveFile(f),false,f);
 }
});
test('Single model reply permits exactly one unique replacement, no arbitrary commands',()=>{
 const raw=JSON.stringify({status:'edit',file:issue.scope.files[0],find:'const a=1;',replace:'const a=2;',summary:'change'});
 const edit=parseDeepSeekEdit(raw,issue.scope.files[0]);
 assert.equal(applyExactReplacement('const a=1;\n',edit),'const a=2;\n');
 assert.throws(()=>applyExactReplacement('const a=1;\nconst a=1;',edit),/once/);
 assert.throws(()=>parseDeepSeekEdit(raw,'scripts/another.ts'),/unsafe/);
 assert.deepEqual(parseDeepSeekEdit('{"status":"cannot_fix","reason":"evidence missing"}',issue.scope.files[0]),{status:'cannot_fix',reason:'evidence missing'});
});
test('Model request contains exact task scope and only one bounded API call payload',()=>{
 const request=buildRequest({issue,filepath:issue.scope.files[0],source:'const a=1;'});
 assert.equal(request.model,'deepseek-flash');
 assert.equal(request.max_tokens,3200);
 assert.equal(request.stream,false);
 assert.equal(request.messages.length,2);
 assert.match(request.messages[0].content,/Never disable tests/);
});

test('Only the exact approved migration can be used as immutable read-only context',()=>{
 const contextFile='supabase/migrations/20261016_p0_strict_public_approval_gate.sql';
 const selected=selectScope({...task,payload:{issues:[{...issue,scope:{...issue.scope,readonly_context_files:[contextFile]}}]}});
 assert.deepEqual(selected.readonlyContextPaths,[contextFile]);
 for(const forbidden of ['supabase/functions/server-secret.sql','src/data/scpi_complet.json','../../.env','supabase/migrations/other.sql']){
  assert.throws(()=>selectScope({...task,payload:{issues:[{...issue,scope:{...issue.scope,readonly_context_files:[forbidden]}}]}}),/unapproved_readonly_context/);
 }
 assert.throws(()=>selectScope({...task,payload:{issues:[{...issue,scope:{...issue.scope,readonly_context_files:[contextFile,contextFile]}}]}}),/unapproved_readonly_context/);
 const request=buildRequest({issue,filepath:issue.scope.files[0],source:'one file source',readonlyContext:[{path:contextFile,source:'u.strict_pass IS TRUE'}]});
 const prompt=JSON.parse(request.messages[1].content);
 assert.equal(prompt.readonly_context[0].path,contextFile);
 assert.match(prompt.readonly_context[0].source,/strict_pass IS TRUE/);
 assert.equal(prompt.file,issue.scope.files[0]);
});
