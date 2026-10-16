import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const yaml=fs.readFileSync(new URL('../../.github/workflows/maximus-deepseek-search.yml',import.meta.url),'utf8');
const gha=x=>'$'+'{{ '+x+' }}';
test('GitHub runner resolves real secret, role selection and token expressions',()=>{
 assert.ok(yaml.includes('DEEPSEEK_API_KEY: '+gha('secrets.DEEPSEEK_API_KEY')),'DeepSeek secret must be a real GH expression');
 assert.ok(yaml.includes('GH_TOKEN: '+gha('github.token')),'GitHub token must be a real GH expression');
 assert.ok(yaml.includes('CORRECTIVE_ROLE: '+gha("github.event_name == 'workflow_dispatch' && inputs.role || (github.event.schedule == '17 12 * * *' && 'SEARCH' || 'DATA')")),'Role expression must be evaluated');
 for(const key of ['DEEPSEEK_API_KEY: $'+'{ secrets.', 'CORRECTIVE_ROLE: $'+'{ github.', 'GH_TOKEN: $'+'{ github.'])
   assert.ok(!yaml.includes(key),'Unresolved workflow environment placeholder: '+key);
});
test('DATA and SEARCH are scheduled but cannot deploy or merge automatically',()=>{
 assert.match(yaml,/cron: "17 6 \* \* \*"/);
 assert.match(yaml,/cron: "17 12 \* \* \*"/);
 assert.match(yaml,/cron: "17 18 \* \* \*"/);
 assert.match(yaml,/gh pr create --base main/);
 assert.doesNotMatch(yaml,/gh pr merge|netlify deploy|git push origin main/);
 assert.match(yaml,/claim_scoped|op:'claim'/);
});
