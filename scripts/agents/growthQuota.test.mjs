import test from 'node:test';
import assert from 'node:assert/strict';
import {dailyAllowance,budgetCost,parisDay,fetchRunHistory} from './growthQuota.mjs';
const day='2026-10-14T16:30:00Z';
const run=(id,event='workflow_dispatch',created_at='2026-10-14T16:00:00Z',status='queued')=>({id,event,created_at,status});
test('budget 3/day: a scheduled batch reserves 3, then manual and push are denied',()=>{
 const runs=[run(1,'schedule','2026-10-14T06:23:00Z','completed'),
             run(2,'workflow_dispatch','2026-10-14T09:00:00Z'),
             run(3,'push','2026-10-14T16:00:00Z')];
 assert.equal(dailyAllowance(runs,1,day).allowed,3);
 assert.equal(dailyAllowance(runs,2,day).allowed,0);
 assert.equal(dailyAllowance(runs,3,day).allowed,0);
});
test('interleaving manual and schedule never exceeds 3 across all triggers',()=>{
 const runs=[run(1,'push','2026-10-14T06:00:00Z'),
             run(2,'schedule','2026-10-14T07:00:00Z'),
             run(3,'workflow_dispatch','2026-10-14T17:00:00Z')];
 assert.equal(dailyAllowance(runs,1,day).allowed,1);
 assert.equal(dailyAllowance(runs,2,day).allowed,2);
 assert.equal(dailyAllowance(runs,3,day).allowed,0);
});
test('queued and failed runs pessimistically consume slots; sorting is deterministic',()=>{
 const runs=[run(12,'workflow_dispatch','2026-10-14T12:00:00Z','queued'),
             run(10,'workflow_dispatch','2026-10-14T12:00:00Z','failure'),
             run(13,'workflow_dispatch','2026-10-14T12:00:00Z','in_progress'),
             run(11,'workflow_dispatch','2026-10-14T12:00:00Z','cancelled')];
 assert.equal(dailyAllowance(runs,12,day).allowed,1);
 assert.equal(dailyAllowance(runs,13,day).allowed,0);
 assert.equal(dailyAllowance(runs,10,day).allowed,1);
 assert.equal(dailyAllowance(runs,11,day).allowed,1);
});
test('PR runs cost zero; Paris local day boundary and stale jobs fail closed',()=>{
 const runs=[run(1,'pull_request','2026-10-14T10:00:00Z'),
             run(2,'workflow_dispatch','2026-10-14T11:00:00Z')];
 assert.equal(dailyAllowance(runs,2,day).allowed,1);
 assert.equal(parisDay('2026-10-13T22:30:00Z'),'2026-10-14');
 assert.equal(parisDay('2026-10-14T22:30:00Z'),'2026-10-15');
 assert.equal(dailyAllowance([run(3,'schedule','2026-10-13T21:30:00Z')],3,day).allowed,0);
});
test('bad config, missing current run and malformed history block all usage',()=>{
 assert.throws(()=>dailyAllowance([],7,day),/absent/);
 assert.throws(()=>dailyAllowance([run(1)],1,day,9),/Invalid/);
 assert.throws(()=>dailyAllowance(null,1,day),/Missing/);
});
test('Github API failures and absence of current run fail closed',async()=>{
 await assert.rejects(fetchRunHistory({token:'test',repository:'Speedcup212/maximus-scpi',runId:99,
  fetcher:async()=>({ok:false,status:403})}),/403/);
 await assert.rejects(fetchRunHistory({token:'test',repository:'Speedcup212/maximus-scpi',runId:99,
  fetcher:async()=>({ok:true,json:async()=>({workflow_runs:[run(1)]})})}),/missing/);
});
