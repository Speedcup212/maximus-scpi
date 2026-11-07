import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const workflow=fs.readFileSync(new URL('../../.github/workflows/maximus-claude-local-worker.yml',import.meta.url),'utf8');
const bridge=fs.readFileSync(new URL('../../supabase/functions/maximus-search-agent-oidc/index.ts',import.meta.url),'utf8');

test('CLAUDE subscription worker runs only on dedicated Windows runner and trusted main dispatch',()=>{
 assert.match(workflow,/workflow_dispatch:/);
 assert.doesNotMatch(workflow,/^\s+pull_request:/m);
 assert.doesNotMatch(workflow,/^\s+schedule:/m);
 assert.match(workflow,/runs-on: \[self-hosted, Windows, X64, maximus-claude\]/);
 assert.match(workflow,/github\.ref == 'refs\/heads\/main'/);
 assert.match(workflow,/github\.event_name == 'workflow_dispatch'/);
 assert.match(workflow,/with:\s*\n\s*ref: main/);
});
test('no API key, no model tools, no PR-sourced code and no automatic deploy or merge',()=>{
 assert.doesNotMatch(workflow,/(?:ANTHROPIC_API_KEY|DEEPSEEK_API_KEY|OPENAI_API_KEY)/);
 assert.match(workflow,/claudeSubscriptionPreflight\.mjs/);
 assert.match(workflow,/subscriptionCliRunner\.mjs --provider claude/);
 assert.match(workflow,/gh pr create --draft/);
 assert.doesNotMatch(workflow,/gh pr merge|netlify deploy|git push origin main/);
 assert.match(workflow,/steps\.claim\.outputs\.claimed == 'yes'/);
 assert.match(workflow,/steps\.propose\.outcome == 'success'/);
});
test('existing OIDC bridge allows exactly the original and Claude specific main workflow refs',()=>{
 const old='maximus-deepseek-search.yml@refs/heads/main';
 const current='maximus-claude-local-worker.yml@refs/heads/main';
 assert.match(bridge,/allowedWorkflowRefs = new Set\(/);
 assert.ok(bridge.includes(old));
 assert.ok(bridge.includes(current));
 assert.equal((bridge.match(/\.github\/workflows\//g)||[]).length,2);
 assert.match(bridge,/!allowedWorkflowRefs\.has\(String\(payload\.workflow_ref\)\)/);
 assert.match(bridge,/payload\.repository!==repo/);
 assert.match(bridge,/payload\.ref!=="refs\/heads\/main"/);
 assert.match(bridge,/String\(payload\.repository_id\)!=="1125202916"/);
 assert.match(bridge,/\["SEARCH","DATA"\]\.includes\(body\.role\)/);
 assert.match(bridge,/Number\(payload\.run_attempt\|\|1\)!==1/);
 assert.match(bridge,/claim_scoped_corrective_task/);
 assert.match(bridge,/maximus_agents\.record_execution/);
});
test('a REAL PR and named tests are needed before a recorded PASS, never financial release',()=>{
 assert.match(workflow,/const passed=\/\^https:/);
 assert.match(workflow,/status:passed\?'done':'blocked'/);
 assert.match(workflow,/verdict:passed\?'PASS':'REVIEW'/);
 assert.match(workflow,/implementation_reference:pr/);
 assert.match(workflow,/name:'one exact file scope'/);
 assert.match(workflow,/name:'GitHub build'/);
 assert.match(workflow,/name:'existing CORUM guard'/);
});
