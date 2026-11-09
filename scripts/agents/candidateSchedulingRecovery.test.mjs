import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {RECOVERY_TARGETS, decideWorkflowRecovery} from './durableOrchestrator.mjs';

const get=(path)=>readFileSync(new URL(path,import.meta.url),'utf8');
const candidate=get('../../.github/workflows/maximus-agent-parallel.yml');
const watchdog=get('../../.github/workflows/maximus-watchdog.yml');
const admission=get('../../supabase/migrations/20261106_recovery126_evidence_first_gates.sql');

test('RECOVERY-129 candidate has two non-hour-boundary daily triggers, plus manual recovery',()=>{
  assert.match(candidate,/cron: "27 6 \* \* \*"/);
  assert.match(candidate,/cron: "43 7 \* \* \*"/);
  assert.match(candidate,/  workflow_dispatch:/);
  // The production candidate lane stays serialized, while PR contracts are isolated.
  assert.match(candidate,/maximus-existing-agent-candidate20-pr-/);
  assert.match(candidate,/\|\| 'maximus-existing-agent-candidate20'/);
  assert.match(candidate,/cancel-in-progress: false/);
  assert.match(candidate,/github\.run_attempt == 1/);
  assert.match(candidate,/deploy_allowed!==false/);
  assert.match(candidate,/scripts\/agents\/candidateSchedulingRecovery\.test\.mjs/);
});

test('RECOVERY-129 watchdog recovers only missing existing workflows, no blind retry',()=>{
  assert.match(watchdog,/cron: "59 8 \* \* \*"/);
  assert.match(watchdog,/  actions: write/);
  assert.match(watchdog,/github\.event_name == 'schedule'/);
  assert.match(watchdog,/github\.ref == 'refs\/heads\/main'/);
  assert.match(watchdog,/github\.run_attempt == 1/);
  assert.match(watchdog,/durableOrchestrator\.mjs/);
  assert.match(watchdog,/listWorkflowRuns/);
  assert.match(watchdog,/createWorkflowDispatch/);
  assert.match(watchdog,/workflow_id:target\.workflow,ref:'main'/);
  assert.match(watchdog,/decision\.decision==='FAILED'/);
  assert.deepEqual(RECOVERY_TARGETS.map(t=>t.workflow),[
    'maximus-agent-parallel.yml','maximus-all-bulletins-replay.yml','scpi-auto-remediation.yml']);
  const target=RECOVERY_TARGETS[0];
  const now='2026-11-07T10:30:00Z';
  assert.equal(decideWorkflowRecovery({now,runs:[],target}).decision,'DISPATCH_ONCE');
  const status=(conclusion,runState='completed')=>({
    created_at:'2026-11-07T10:00:00Z',event:'schedule',
    status:runState,conclusion
  });
  assert.equal(decideWorkflowRecovery({now,runs:[status(null,'in_progress')],target}).decision,'ACTIVE');
  assert.equal(decideWorkflowRecovery({now,runs:[status('failure')],target}).decision,'FAILED');
  assert.equal(decideWorkflowRecovery({now,runs:[status('success')],target}).decision,'HEALTHY');
  assert.doesNotMatch(watchdog,/\b(?:reset_quota|override_qa|disable_qa|publish_scpi)\b/i);
});

test('P0 daily dedupe and financial gates remain impossible to bypass by retry',()=>{
  assert.match(admission,/pg_advisory_xact_lock\(hashtext\('maximus_agents:candidate20:prepare'\)\)/);
  assert.match(admission,/IF NOT EXISTS \(/);
  assert.match(admission,/t\.cycle_date=d AND t\.payload->>'batch_mode'='candidate20'/);
  assert.match(admission,/ON CONFLICT\(dedupe_key\) DO NOTHING/);
  assert.match(admission,/limit_candidates constant integer := 20/);
  assert.match(admission,/p\.document_identity_verified=true/);
  assert.match(admission,/p\.pdf_sha256 ~ '\^\[0-9a-f\]\{64\}\$'/);
  assert.match(admission,/'deploy_allowed',false/);
});
