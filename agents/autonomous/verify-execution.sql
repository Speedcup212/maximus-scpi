-- Runtime integration tests. Every mutation is rolled back, including fixture isolation.
-- Run as the private orchestration operator, never as a public client.
begin;
create temporary table execution_test_results(name text,status text,detail text) on commit drop;
create or replace function pg_temp.assert_execution(p_name text,p_pass boolean,p_detail text default '')
returns void language plpgsql as $$ begin
  insert into execution_test_results values(p_name,case when p_pass then 'PASS' else 'FAIL' end,p_detail);
end $$;
create or replace function pg_temp.reject_execution(p_name text,p_sql text,p_expected text default null)
returns void language plpgsql as $$
declare rejected boolean:=false; message text;
begin
  begin execute p_sql; exception when others then rejected:=true; message:=sqlerrm; end;
  perform pg_temp.assert_execution(p_name,rejected and (p_expected is null or message ilike '%'||p_expected||'%'),coalesce(message,'Accepted unexpectedly'));
end $$;

-- Isolate existing private runtime rows inside this transaction only.
delete from maximus_agents.runs;
delete from maximus_agents.tasks;
delete from maximus_agents.issues;
update maximus_agents.settings set enabled=true,max_claims_per_role_day=4 where singleton;
update maximus_agents.agents set enabled=true;

do $$
declare
  day date:=(now() at time zone 'Europe/Paris')::date;
  code_issue uuid:=gen_random_uuid(); db_issue uuid:=gen_random_uuid(); foreign_issue uuid:=gen_random_uuid();
  exec_id uuid; audit_id uuid; qa_id uuid; wrong_qa_id uuid; lease uuid; qa_lease uuid; claimed maximus_agents.tasks;
  result jsonb; qa_result jsonb;
begin
  insert into maximus_agents.issues(id,issue_key,title,owner_role,scope,acceptance,requires_release)
  values(code_issue,'TEST-CODE','Test code','DATA','["src/example.ts"]','Tests PASS and release',true),
    (db_issue,'TEST-DB','Test verified DB correction','DATA','["certification"]','Tests PASS and QA',false),
    (foreign_issue,'TEST-FOREIGN','Unrelated issue','SEARCH','["scripts/example.ts"]','Tests PASS',true);

  -- Date persistence and normal priority, after actual prepare_cycle housekeeping.
  exec_id:=gen_random_uuid(); audit_id:=gen_random_uuid();
  insert into maximus_agents.tasks(id,dedupe_key,cycle_date,role,title,priority,kind,issue_ids)
  values(exec_id,'test:old:execute',day-1,'DATA','Execution from yesterday',0,'execute',array[code_issue]),
    (audit_id,'test:today:audit',day,'DATA','Today audit',10,'audit','{}');
  perform maximus_agents.prepare_cycle();
  perform pg_temp.assert_execution('pending execution survives day boundary',
    (select status='pending' from maximus_agents.tasks where id=exec_id));
  select * into claimed from maximus_agents.claim_task('DATA');
  perform pg_temp.assert_execution('execution precedes regular audit',claimed.id=exec_id);
  perform pg_temp.assert_execution('yesterday execution can be claimed today',claimed.id=exec_id and claimed.cycle_date=day-1);
  perform pg_temp.assert_execution('claim moves issue to in_progress',
    (select status='in_progress' from maximus_agents.issues where id=code_issue));

  -- Adversarial priorities: kind precedence must not depend on caller-supplied integers.
  delete from maximus_agents.runs; delete from maximus_agents.tasks;
  update maximus_agents.issues set status='open';
  exec_id:=gen_random_uuid(); audit_id:=gen_random_uuid();
  insert into maximus_agents.tasks(id,dedupe_key,cycle_date,role,title,priority,kind,issue_ids)
  values(exec_id,'test:priority:execute',day,'DATA','Execution',0,'execute',array[code_issue]),
    (audit_id,'test:priority:audit',day,'DATA','Urgent audit',-100,'audit','{}');
  select * into claimed from maximus_agents.claim_task('DATA');
  perform pg_temp.assert_execution('execution kind precedes even a high-priority audit',claimed.id=exec_id,
    coalesce(claimed.kind,'none')||' selected');

  delete from maximus_agents.runs; delete from maximus_agents.tasks;
  update maximus_agents.issues set status='in_progress' where id in(code_issue,db_issue);
  exec_id:=gen_random_uuid(); lease:=gen_random_uuid();
  insert into maximus_agents.tasks(id,dedupe_key,role,title,kind,issue_ids,status,attempts,lease_token,lease_until)
  values(exec_id,'test:implementation','DATA','Implementation','execute',array[code_issue,db_issue],'running',1,lease,now()+interval '10 minutes');
  insert into maximus_agents.runs(task_id,role,attempt,lease_token) values(exec_id,'DATA',1,lease);
  result:=jsonb_build_object('summary','Corrective implementation test','verdict','PASS',
    'evidence',jsonb_build_array(jsonb_build_object('source','transactional fixture','observed_at',now(),'finding','Code and DB corrected')),
    'tests',jsonb_build_array(jsonb_build_object('name','integration regression','status','PASS')),
    'implementation_reference','test:working-branch-and-db-evidence');

  perform pg_temp.reject_execution('finish_task cannot complete execution directly',
    format('select maximus_agents.finish_task(%L::uuid,%L::uuid,''done'',%L::jsonb)',exec_id,lease,result),'record_execution');
  perform pg_temp.reject_execution('PASS execution requires tests array',
    format('select maximus_agents.record_execution(%L::uuid,%L::uuid,''done'',%L::jsonb)',exec_id,lease,result-'tests'),'Tests array');
  perform pg_temp.reject_execution('PASS execution requires passing named tests',
    format('select maximus_agents.record_execution(%L::uuid,%L::uuid,''done'',%L::jsonb)',exec_id,lease,jsonb_set(result,'{tests}','[{"name":"regression","status":"FAIL"}]')),'Passing named tests');
  perform pg_temp.reject_execution('PASS execution requires implementation reference',
    format('select maximus_agents.record_execution(%L::uuid,%L::uuid,''done'',%L::jsonb)',exec_id,lease,result-'implementation_reference'),'Implementation reference');
  perform maximus_agents.record_execution(exec_id,lease,'done',result);
  perform pg_temp.assert_execution('successful execution is implemented, never resolved',
    (select bool_and(status='implemented' and resolved_at is null) from maximus_agents.issues where id in(code_issue,db_issue)));

  -- Each verification attempt has its own fixture so expected failures cannot hide state writes.
  qa_id:=gen_random_uuid(); qa_lease:=gen_random_uuid();
  insert into maximus_agents.tasks(id,dedupe_key,role,title,kind,issue_ids,depends_on,status,attempts,lease_token,lease_until)
  values(qa_id,'test:qa','QA','Independent verification','verify',array[code_issue,db_issue],array[exec_id],'running',1,qa_lease,now()+interval '10 minutes');
  insert into maximus_agents.runs(task_id,role,attempt,lease_token) values(qa_id,'QA',1,qa_lease);
  qa_result:=jsonb_build_object('summary','Independent QA test','verdict','PASS',
    'evidence',jsonb_build_array(jsonb_build_object('source','transactional QA fixture','observed_at',now(),'finding','Cases verified')),
    'tests',jsonb_build_array(jsonb_build_object('name','independent QA','status','PASS')),
    'issue_verdicts',jsonb_build_array(jsonb_build_object('issue_id',code_issue,'verdict','PASS'),jsonb_build_object('issue_id',db_issue,'verdict','PASS')));
  perform pg_temp.reject_execution('finish_task cannot complete verification directly',
    format('select maximus_agents.finish_task(%L::uuid,%L::uuid,''done'',%L::jsonb)',qa_id,qa_lease,qa_result),'record_execution');
  perform pg_temp.reject_execution('QA requires per-issue verdicts',
    format('select maximus_agents.record_execution(%L::uuid,%L::uuid,''done'',%L::jsonb)',qa_id,qa_lease,qa_result-'issue_verdicts'),'Per-issue');
  perform pg_temp.reject_execution('QA must cover every issue',
    format('select maximus_agents.record_execution(%L::uuid,%L::uuid,''done'',%L::jsonb)',qa_id,qa_lease,jsonb_set(qa_result,'{issue_verdicts}',jsonb_build_array(jsonb_build_object('issue_id',code_issue,'verdict','PASS')))),'Every issue');
  perform pg_temp.reject_execution('QA global PASS rejects a failed issue',
    format('select maximus_agents.record_execution(%L::uuid,%L::uuid,''done'',%L::jsonb)',qa_id,qa_lease,jsonb_set(qa_result,'{issue_verdicts,1,verdict}','"FAIL"')),'contradicts');
  perform pg_temp.reject_execution('QA per-issue PASS still requires tests under global REVIEW',
    format('select maximus_agents.record_execution(%L::uuid,%L::uuid,''done'',%L::jsonb)',qa_id,qa_lease,jsonb_set(qa_result-'tests','{verdict}','"REVIEW"')),'Tests array');

  wrong_qa_id:=gen_random_uuid();
  insert into maximus_agents.tasks(id,dedupe_key,role,title,kind,issue_ids,status,attempts,lease_token,lease_until)
  values(wrong_qa_id,'test:wrong-qa','DATA','Wrong QA role','verify',array[code_issue,db_issue],'running',1,gen_random_uuid(),now()+interval '10 minutes');
  perform pg_temp.reject_execution('verification task requires QA role',
    format('select maximus_agents.record_execution(%L::uuid,%L::uuid,''done'',%L::jsonb)',wrong_qa_id,
      (select lease_token from maximus_agents.tasks where id=wrong_qa_id),qa_result),'QA role');

  -- Hardening probes: accepted malformed verdict lists must be reported as FAIL.
  perform pg_temp.reject_execution('QA rejects duplicate issue verdicts',
    format('select maximus_agents.record_execution(%L::uuid,%L::uuid,''done'',%L::jsonb)',qa_id,qa_lease,
      jsonb_set(qa_result,'{issue_verdicts}',(qa_result->'issue_verdicts')||jsonb_build_array(jsonb_build_object('issue_id',code_issue,'verdict','PASS')))));
  -- Restore fixture if a vulnerable version accepted the probe (all still inside rollback).
  update maximus_agents.tasks set status='running',completed_at=null,lease_until=now()+interval '10 minutes' where id=qa_id;
  update maximus_agents.runs set status='running',finished_at=null where task_id=qa_id;
  update maximus_agents.issues set status='implemented',qa_result=null,resolved_at=null where id in(code_issue,db_issue);
  perform pg_temp.reject_execution('QA rejects foreign issue verdicts',
    format('select maximus_agents.record_execution(%L::uuid,%L::uuid,''done'',%L::jsonb)',qa_id,qa_lease,
      jsonb_set(qa_result,'{issue_verdicts}',(qa_result->'issue_verdicts')||jsonb_build_array(jsonb_build_object('issue_id',foreign_issue,'verdict','PASS')))));
  update maximus_agents.tasks set status='running',completed_at=null,lease_until=now()+interval '10 minutes' where id=qa_id;
  update maximus_agents.runs set status='running',finished_at=null where task_id=qa_id;
  update maximus_agents.issues set status='implemented',qa_result=null,resolved_at=null where id in(code_issue,db_issue);
  update maximus_agents.issues set status='open' where id=code_issue;
  perform pg_temp.reject_execution('QA cannot PASS an issue without implemented status',
    format('select maximus_agents.record_execution(%L::uuid,%L::uuid,''done'',%L::jsonb)',qa_id,qa_lease,qa_result));
  update maximus_agents.tasks set status='running',completed_at=null,lease_until=now()+interval '10 minutes' where id=qa_id;
  update maximus_agents.runs set status='running',finished_at=null where task_id=qa_id;
  update maximus_agents.issues set status='implemented',qa_result=null,resolved_at=null where id in(code_issue,db_issue);

  perform maximus_agents.record_execution(qa_id,qa_lease,'done',qa_result);
  perform pg_temp.assert_execution('QA PASS leaves code qa_pass until release',
    (select status='qa_pass' and resolved_at is null and release_reference is null from maximus_agents.issues where id=code_issue));
  perform pg_temp.assert_execution('QA PASS resolves verified DB-only correction',
    (select status='resolved' and resolved_at is not null from maximus_agents.issues where id=db_issue));
end $$;

select jsonb_build_object('tests',count(*),'pass',count(*) filter(where status='PASS'),
  'fail',count(*) filter(where status='FAIL'),'results',jsonb_agg(to_jsonb(r) order by name)) as execution_verification
from execution_test_results r;
rollback;
