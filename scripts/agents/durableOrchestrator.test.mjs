import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {RECOVERY_TARGETS,parisDay,decideWorkflowRecovery} from './durableOrchestrator.mjs';

const target=RECOVERY_TARGETS[0];
const now='2026-11-07T10:30:00Z'; // 11:30 Paris wintertime
const run=(iso,conclusion='success',status='completed',event='schedule')=>({
  created_at:iso,conclusion,status,event,html_url:'https://github.com/Speedcup212/maximus-scpi/actions/runs/42'
});
test('a missed daily existing job can be dispatched once after its local cutoff',()=>{
  assert.equal(decideWorkflowRecovery({now,runs:[],target}).decision,'DISPATCH_ONCE');
  assert.equal(decideWorkflowRecovery({now:'2026-11-07T06:00:00Z',runs:[],target}).decision,'NOT_DUE');
});
test('completed run, even a manually recovered run, blocks duplicate dispatch',()=>{
  assert.equal(decideWorkflowRecovery({now,runs:[run('2026-11-07T07:30:00Z')],target}).decision,'HEALTHY');
  assert.equal(decideWorkflowRecovery({now,runs:[run('2026-11-07T07:30:00Z','success','completed','workflow_dispatch')],target}).decision,'HEALTHY');
});
test('failed/cancelled scheduled run never gets blindly retried',()=>{
  for(const conclusion of ['failure','cancelled','timed_out']){
    assert.equal(decideWorkflowRecovery({now,runs:[run('2026-11-07T09:00:00Z',conclusion)],target}).decision,'FAILED');
  }
});
test('latest failed run wins over an earlier successful run',()=>{
  assert.equal(decideWorkflowRecovery({now,runs:[
    run('2026-11-07T07:00:00Z','success'),run('2026-11-07T10:00:00Z','failure')
  ],target}).decision,'FAILED');
});
test('queued and in-progress runs are never duplicated',()=>{
  for(const status of ['queued','in_progress','waiting']){
    assert.equal(decideWorkflowRecovery({now,runs:[run('2026-11-07T08:00:00Z',null,status)],target}).decision,'ACTIVE');
  }
});
test('Paris timezone and DST determine daily recovery boundary',()=>{
  assert.equal(parisDay('2026-11-06T23:30:00Z'),'2026-11-07');
  assert.equal(parisDay('2026-07-01T22:30:00Z'),'2026-07-02');
  assert.equal(decideWorkflowRecovery({now:'2026-07-02T07:30:00Z',runs:[],target}).decision,'DISPATCH_ONCE');
});
test('PR activity is never counted as main production execution',()=>{
  assert.equal(decideWorkflowRecovery({now,runs:[run('2026-11-07T09:00:00Z','success','completed','pull_request')],target}).decision,'DISPATCH_ONCE');
});
test('outdated prior-day runs do not substitute for today',()=>{
  assert.equal(decideWorkflowRecovery({now,runs:[run('2026-11-06T18:00:00Z')],target}).decision,'DISPATCH_ONCE');
});
test('unknown targets and incomplete history fail closed',()=>{
  assert.throws(()=>decideWorkflowRecovery({now,runs:[],target:{key:'unsafe',workflow:'maximus-deepseek-search.yml',afterParisHour:0}}));
  assert.throws(()=>decideWorkflowRecovery({now,runs:null,target}));
  assert.throws(()=>decideWorkflowRecovery({now,runs:[{}],target}));
});
test('workflow contract keeps existing queue, no AI calls or financial overrides',()=>{
  const yaml=readFileSync('.github/workflows/maximus-watchdog.yml','utf8');
  assert.match(yaml,/durableOrchestrator\.mjs/);
  assert.match(yaml,/durableOrchestrator\.test\.mjs/);
  assert.match(yaml,/createWorkflowDispatch/);
  assert.doesNotMatch(yaml,/force[_-]?pass|override[_-]?qa|DEEPSEEK_API_KEY|ANTHROPIC_API_KEY/);
  assert.deepEqual(RECOVERY_TARGETS.map(x=>x.workflow),[
    'maximus-agent-parallel.yml','maximus-all-bulletins-replay.yml','scpi-auto-remediation.yml'
  ]);
});

test('push-only CI must not impersonate a scheduled independent agent cycle',()=>{
 const pushRun=run('2026-11-07T10:00:00Z','success','completed','push');
 assert.equal(decideWorkflowRecovery({now,runs:[pushRun],target}).decision,'DISPATCH_ONCE');
 assert.equal(decideWorkflowRecovery({now:'2026-11-07T06:00:00Z',runs:[pushRun],target}).decision,'NOT_DUE');
 assert.equal(decideWorkflowRecovery({now,runs:[pushRun,run('2026-11-07T07:30:00Z')],target}).decision,'HEALTHY');
 assert.equal(decideWorkflowRecovery({now,runs:[pushRun,run('2026-11-07T08:00:00Z','failure')],target}).decision,'FAILED');
});
