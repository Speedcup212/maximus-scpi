import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const get=(path)=>readFileSync(new URL(path,import.meta.url),'utf8');
const candidate=get('../../.github/workflows/maximus-agent-parallel.yml');
const watchdog=get('../../.github/workflows/maximus-watchdog.yml');
const admission=get('../../supabase/migrations/20261106_recovery126_evidence_first_gates.sql');

test('RECOVERY-129 candidate has two non-hour-boundary daily triggers, plus manual recovery',()=>{
  assert.match(candidate,/cron: "27 6 \* \* \*"/);
  assert.match(candidate,/cron: "43 7 \* \* \*"/);
  assert.match(candidate,/  workflow_dispatch:/);
  assert.match(candidate,/group: maximus-existing-agent-candidate20/);
  assert.match(candidate,/cancel-in-progress: false/);
  assert.match(candidate,/github\.run_attempt == 1/);
  assert.match(candidate,/deploy_allowed!==false/);
  assert.match(candidate,/scripts\/agents\/candidateSchedulingRecovery\.test\.mjs/);
});

test('RECOVERY-129 watchdog detects missing runs and dispatches only the existing main workflow',()=>{
  assert.match(watchdog,/cron: "57 8 \* \* \*"/);
  assert.match(watchdog,/  actions: write/);
  assert.match(watchdog,/github\.event_name == 'schedule'/);
  assert.match(watchdog,/github\.ref == 'refs\/heads\/main'/);
  assert.match(watchdog,/github\.run_attempt == 1/);
  assert.match(watchdog,/timeZone:'Europe\/Paris'/);
  assert.match(watchdog,/if\(parisHour<9\)/);
  assert.match(watchdog,/const target='maximus-agent-parallel\.yml'/);
  assert.match(watchdog,/listWorkflowRuns/);
  assert.match(watchdog,/if\(sameDay\.length\)/);
  assert.match(watchdog,/createWorkflowDispatch/);
  assert.match(watchdog,/workflow_id:target,ref:'main'/);
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
