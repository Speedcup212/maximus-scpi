import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateEvidenceRoutingPlan as validate} from './controlEvidenceRouting.mjs';

const valid=()=>({
  version:'recovery177-evidence-routing-v1',
  strategy:'read_only_routing_proposal',
  existing_total:68,strict_pass:39,strict_fail:29,
  new_tasks_created:0,new_issues_created:0,model_calls:0,
  financial_certified:false,deploy_allowed:false,
  families:[{
    route_family:'UNCERTIFIED_EXTRACTION',owner_role:'QA',priority:10,
    funds:18,evidence_items:60,existing_role_task_overlaps:0,
    sample_funds:['corum-origin','iroko-zen'],
    state:'NOT_DISPATCHED_REQUIRES_SCOPED_PLAN'
  }]
});

test('accepts proposed diagnosis only, with zero tasks or new model spend',()=>{
  assert.deepEqual(validate(valid()),{existing_total:68,strict_pass:39,strict_fail:29,families:1,evidence_items:60});
});
test('works for scaling beyond current 68 without hardcoded cohort',()=>{
  const x=valid();x.existing_total=205;x.strict_pass=190;x.strict_fail=15;
  x.families[0].funds=8;
  assert.equal(validate(x).existing_total,205);
});
test('rejects invented financial certification and hidden writes',()=>{
  for(const [k,v] of [['deploy_allowed',true],['financial_certified',true],
    ['new_tasks_created',1],['new_issues_created',1],['model_calls',1]]){
    const x=valid();x[k]=v;assert.throws(()=>validate(x));
  }
});
test('rejects incomplete or artificially inflated cohort counts',()=>{
  for(const [k,v] of [['strict_pass',68],['strict_fail',999],['existing_total',0]]){
    const x=valid();x[k]=v;assert.throws(()=>validate(x));
  }
});
test('rejects duplicated families and duplicate fund IDs',()=>{
  const x=valid();x.families.push({...x.families[0]});
  assert.throws(()=>validate(x));
  x.families.pop();x.families[0].sample_funds=['corum-origin','corum-origin'];
  assert.throws(()=>validate(x));
});
test('rejects upstream forged routes, unknown roles and claimed dispatch',()=>{
  for(const [k,v] of [['owner_role','FINANCE'],['route_family','../path'],
    ['state','DONE'],['funds',999],['existing_role_task_overlaps',999]]){
    const x=valid();x.families[0][k]=v;assert.throws(()=>validate(x));
  }
});
test('SQL plan consumes private existing triage and does not create queues or alter finance',()=>{
  const sql=readFileSync('supabase/migrations/20261107_recovery177_control_missing_metric_routing.sql','utf8');
  assert.match(sql,/maximus_agents\.scpi_missing_metric_triage_v1/);
  assert.match(sql,/public\.scpi_crash_test_strict_v2/);
  assert.match(sql,/UPDATE maximus_agents\.agents/);
  assert.match(sql,/role='CONTROL'/);
  assert.match(sql,/REVOKE ALL ON FUNCTION/);
  assert.doesNotMatch(sql,/INSERT INTO maximus_agents\.tasks/);
  assert.doesNotMatch(sql,/INSERT INTO maximus_agents\.issues/);
  assert.doesNotMatch(sql,/UPDATE public\.scpi_(metric_certifications|indicator_history|source_registry)/);
});
test('existing GitHub CONTROL job and OIDC endpoint are the only orchestration wiring',()=>{
  const yaml=readFileSync('.github/workflows/maximus-agent-parallel.yml','utf8');
  const edge=readFileSync('supabase/functions/maximus-agent-audit-oidc/index.ts','utf8');
  assert.match(yaml,/control_existing_metric_triage/);
  assert.match(yaml,/controlEvidenceRouting\.mjs/);
  assert.match(yaml,/controlEvidenceRouting\.test\.mjs/);
  assert.match(edge,/control_existing_metric_triage/);
  assert.match(edge,/refresh_existing_missing_metric_control/);
  assert.match(edge,/maximus-parallel-audit-ygvsddcpohsnaowofuwc/);
  assert.doesNotMatch(yaml,/OPENAI_API_KEY|ANTHROPIC_API_KEY|CLAUDE_CODE_OAUTH_TOKEN/);
});
