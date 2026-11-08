import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {preserveIndependentIssuerProof} from '../../supabase/functions/scpi-bulletin-watch/sourceProvenance.mjs';
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

test('technical main pushes run read-only CONTROL triage without enrolling candidate20 tasks',()=>{
  const yaml=readFileSync('.github/workflows/maximus-agent-parallel.yml','utf8');
  const anchor='      - name: CONTROL — prepare exactly one 20-SCPI cohort on existing Supabase queue';
  const start=yaml.indexOf(anchor);
  const end=yaml.indexOf('      - name: CONTROL — classify existing SCPI evidence',start);
  assert.ok(start>=0&&end>start);
  const prepare=yaml.slice(start,end);
  assert.ok(prepare.includes("if: github.event_name == 'schedule' || github.event_name == 'workflow_dispatch'"));
  assert.ok(yaml.includes("slugs: "+'$'+"{{ steps.dispatch.outputs.slugs || '[]' }}"));
  const readonly=yaml.slice(end,yaml.indexOf('  source-proof:',end));
  assert.ok(readonly.includes("op:'control_existing_metric_triage'"));
  assert.ok(!readonly.includes("op:'prepare_batch20'"));
});

test('strict admission route facts do not misread invalid historical rows as PASS blockers',()=>{
  const s=readFileSync('supabase/migrations/20261108_recovery179_true_strict_admission_routes.sql','utf8');
  assert.match(s,/scpi_strict_actual_admission_v1/);
  assert.match(s,/scpi_crash_test_strict_v2/);
  assert.match(s,/CROSS JOIN LATERAL/);
  assert.match(s,/INDEPENDENT_STRICT_EVIDENCE_GUARD/);
  assert.match(s,/historical_tof_quarantine_records/);
  assert.match(s,/period_matched_pdf_proofs/);
  assert.match(s,/strict_admission_gates/);
  assert.match(s,/blocks_strict_pass/);
  assert.doesNotMatch(s,/WHEN c.invalid_rows\s*>\s*0/);
  assert.doesNotMatch(s,/INSERT\s+INTO\s+maximus_agents\.tasks/i);
  assert.doesNotMatch(s,/UPDATE\s+public\.scpi_/i);
  assert.doesNotMatch(s,/GRANT\s+(SELECT|EXECUTE)\s+TO\s+(anon|authenticated)/i);
  assert.match(s,/REVOKE ALL ON maximus_agents\.scpi_strict_actual_admission_v1/);
});

test('strict gates are observational; cannot infer full approval from PDF presence',()=>{
  const s=readFileSync('supabase/migrations/20261108_recovery179_true_strict_admission_routes.sql','utf8');
  assert.match(s,/false::boolean AS financial_certified/);
  assert.match(s,/false::boolean AS deploy_allowed/);
  assert.match(s,/false::boolean AS executes_remediation/);
  assert.match(s,/state','NEEDS_INDEPENDENT_SOURCE_QA'/);
});

test('RECOVERY-180 can only reconcile stale TOF status after dual-reader issuer-linked evidence',()=>{
  const sql=readFileSync('supabase/migrations/20261108_recovery180_reconcile_verified_tof_backfill.sql','utf8');
  assert.match(sql,/q\.last_error='tof_not_found_or_not_period_bound'/);
  assert.match(sql,/v\.crash_test_status='FAIL_STRICT'/);
  assert.match(sql,/v\.last_document_period=q\.source_period/);
  assert.match(sql,/d\.result->'evidence'->'tof'->'independent_engines'='\["MuPDF","Poppler"\]'::jsonb/);
  assert.match(sql,/d\.result->'source_resolution'|x\.result->'source_resolution'/);
  assert.match(sql,/x\.result->'source_resolution'->>'sha256'=d\.pdf_sha256/);
  assert.match(sql,/scpi_internal\.tof_bulletin_source_rejection_reason/);
  assert.match(sql,/NOT EXISTS\s*\(\s*SELECT 1 FROM scpi_internal\.tof_policy_quarantine_audit_20261028/);
  assert.match(sql,/h\.metric_provenance->'tof'->>'sha256'=d\.pdf_sha256/);
  assert.match(sql,/AND c\.value_numeric=h\.tof/);
  assert.match(sql,/d\.result->'evidence'->'tof'->>'page/);
  assert.match(sql,/RETURNING q\.id,q\.scpi_slug,q\.source_period/);
  assert.match(sql,/INSERT INTO public\.scpi_ingestion_events/);
  assert.match(sql,/REVOKE ALL ON FUNCTION/);
});
test('RECOVERY-180 never writes financial values, changes quality guards or adds jobs',()=>{
  const sql=readFileSync('supabase/migrations/20261108_recovery180_reconcile_verified_tof_backfill.sql','utf8');
  assert.doesNotMatch(sql,/UPDATE\s+public\.scpi_(indicator_history|metric_certifications|source_registry|indicators)/i);
  assert.doesNotMatch(sql,/UPDATE\s+scpi_internal\.tof_policy_quarantine_audit/i);
  assert.doesNotMatch(sql,/UPDATE\s+public\.scpi_crash_test_strict_v2/i);
  assert.doesNotMatch(sql,/GRANT\s+(SELECT|EXECUTE)\s+TO\s+(anon|authenticated)/i);
  assert.match(sql,/metric_changes',0/);
  assert.match(sql,/financial_certified',false/);
  assert.match(sql,/deploy_allowed',false/);
});

test('RECOVERY-181 preserves prior independent issuer source ONLY for unchanged exact SHA, URL and period',()=>{
 const base={
  verification_status:'verified',confidence_level:'high',
  bulletin_url:'https://issuer.example/docs/2026-T3.pdf',
  last_document_period:'2026-T3',
  issuer_source_sha256:'a'.repeat(64),
  issuer_source_url:'https://issuer.example/docs/2026-T3.pdf',
  issuer_source_period:'2026-T3',
  issuer_source_verified_at:'2026-11-08T00:00:00Z'
 };
 const accepts=(s={...base},url=base.bulletin_url,period='2026-T3',sha='a'.repeat(64),same=true)=>
   preserveIndependentIssuerProof(s,url,period,sha,same);
 assert.equal(accepts(),true);
 assert.equal(accepts({...base,confidence_level:'medium'}),false);
 assert.equal(accepts({...base,verification_status:'incomplete'}),false);
 assert.equal(accepts({...base,issuer_source_verified_at:null}),false);
 assert.equal(accepts({...base,issuer_source_sha256:null}),false);
 assert.equal(accepts({...base,issuer_source_period:'2026-T2'}),false);
 assert.equal(accepts({...base,issuer_source_url:'https://issuer.example/other.pdf'}),false);
 assert.equal(accepts({...base,bulletin_url:'https://issuer.example/other.pdf'}),false);
 assert.equal(accepts(base,base.bulletin_url,'2026-T2'),false);
 assert.equal(accepts(base,base.bulletin_url,'2026-T3','b'.repeat(64)),false);
 assert.equal(accepts(base,base.bulletin_url,'2026-T3','a'.repeat(64),false),false);
});
test('RECOVERY-181 source attestation adds evidence without creating new financial certificates',()=>{
 const sql=readFileSync('supabase/migrations/20261108_recovery181_attest_issuer_source_sha.sql','utf8');
 const edge=readFileSync('supabase/functions/scpi-bulletin-watch/index.ts','utf8');
 assert.match(sql,/issuer_source_sha256/);
 assert.match(sql,/source_reference_resolved/);
 assert.match(sql,/independent_engines'='\["MuPDF","Poppler"\]'::jsonb/);
 assert.match(sql,/recovery181_issuer_source_attested/);
 assert.match(sql,/scpi_internal\.tof_bulletin_source_rejection_reason/);
 assert.match(sql,/REVOKE ALL ON FUNCTION/);
 assert.doesNotMatch(sql,/UPDATE public\.scpi_indicator_history/i);
 assert.doesNotMatch(sql,/INSERT INTO public\.scpi_metric_certifications/i);
 assert.doesNotMatch(sql,/UPDATE public\.scpi_crash_test_strict_v2/i);
 assert.match(edge,/import \{ preserveIndependentIssuerProof \}/);
 assert.match(edge,/unchangedIndependentSourceProof/);
 assert.match(edge,/source_reference|issuer_source_sha256/);
 assert.match(edge,/hashPdf,Boolean\(old\?\.id/);
});

test('RECOVERY-182 first-party source attestation cannot exceed one explicitly named fund',()=>{
 const s=readFileSync('supabase/migrations/20261108_recovery182_first_party_pdf_attestation.sql','utf8');
 assert.match(s,/p_scpi_slug text/);
 assert.match(s,/r\.scpi_slug=p_scpi_slug/);
 assert.match(s,/LIMIT 1/);
 assert.match(s,/r\.verification_status='incomplete'/);
 assert.match(s,/r\.last_error='Extraction existante partielle'/);
 assert.match(s,/source_domain/);
 assert.match(s,/official_scpi_page_url/);
 assert.match(s,/b\.pdf_sha256/);
 assert.match(s,/manual_verified_official/);
 assert.match(s,/independent_engines'='\["MuPDF","Poppler"\]'::jsonb/);
 assert.match(s,/tof_bulletin_source_rejection_reason/);
 assert.match(s,/NOT EXISTS\s*\(\s*SELECT 1 FROM scpi_internal\.tof_policy_quarantine_audit_20261028/);
 assert.match(s,/recovery182_first_party_issuer_source_attested/);
 assert.match(s,/REVOKE ALL ON FUNCTION/);
});
test('RECOVERY-182 cannot alter financial metrics nor claim full profile review',()=>{
 const s=readFileSync('supabase/migrations/20261108_recovery182_first_party_pdf_attestation.sql','utf8');
 assert.doesNotMatch(s,/UPDATE\s+public\.scpi_(indicator_history|metric_certifications|indicators|annual_fundamentals)/i);
 assert.doesNotMatch(s,/INSERT INTO public\.scpi_metric_certifications/i);
 assert.doesNotMatch(s,/UPDATE\s+public\.scpi_crash_test_strict_v2/i);
 assert.match(s,/qa_partial_metrics_remain',true/);
 assert.match(s,/financial_values_changed',false/);
 assert.match(s,/deploy_allowed',false/);
});
