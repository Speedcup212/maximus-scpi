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

test('RECOVERY-182 quarantines only six evidence-proven Transitions Europe semantic defects',()=>{
 const sql=readFileSync('supabase/migrations/20261108_recovery182_semantic_evidence_quarantine.sql','utf8');
 assert.match(sql,/scpi_semantic_evidence_review_v1/);
 assert.match(sql,/security_invoker=true/);
 assert.match(sql,/SUSPECTED_REQUIRES_INDEPENDENT_QA/);
 assert.match(sql,/quarantine_transitions_europe_t3_semantics_v1/);
 assert.match(sql,/c\.source_page>0 AND c\.extraction_confidence>=\.95/);
 assert.match(sql,/RECOVERY182_SIX_SEMANTIC_PROOFS_NOT_VERIFIED/);
 assert.match(sql,/RECOVERY182_HISTORY_CHANGED_STOP/);
 assert.match(sql,/d\.pdf_sha256=pdf_sha/);
 assert.match(sql,/h\.source_url=documented/);
 assert.match(sql,/c\.source_url=documented/);
 assert.match(sql,/GET DIAGNOSTICS changed=ROW_COUNT/);
 assert.match(sql,/GET DIAGNOSTICS historical=ROW_COUNT/);
 assert.match(sql,/invalid_semantic_mismatch_pending_qa/);
 assert.match(sql,/recovery182_semantic_metric_quarantine/);
 assert.match(sql,/REVOKE ALL ON FUNCTION/);
 assert.doesNotMatch(sql,/UPDATE public\.scpi_crash_test_strict_v2/);
 assert.doesNotMatch(sql,/SET (value_numeric|tof|prix_reconstitution|valeur_realisation|collecte_nette|td|walb)=/);
 assert.doesNotMatch(sql,/INSERT INTO public\.scpi_metric_certifications/);
 assert.doesNotMatch(sql,/GRANT (SELECT|EXECUTE) TO (anon|authenticated)/);
});
test('RECOVERY-182 distinguishes historical TD 7.6 from 6 percent PGA objective',()=>{
 const sql=readFileSync('supabase/migrations/20261108_recovery182_semantic_evidence_quarantine.sql','utf8');
 assert.match(sql,/e\.metric='td' AND e\.recorded_value=6 AND e\.refers_to_pga_target/);
 assert.match(sql,/c\.metric='td' AND c\.value_numeric=6/);
 assert.match(sql,/c\.metric='walb' AND c\.value_numeric=6\.76/);
 assert.match(sql,/c\.metric='prix_reconstitution' AND c\.value_numeric=229\.27/);
 assert.match(sql,/c\.metric='valeur_realisation' AND c\.value_numeric=181\.8/);
 assert.match(sql,/c\.metric='collecte_nette' AND c\.value_numeric=142000000/);
});

test('RECOVERY-183 issuer-direct source attestation requires exact independent source and canonical data proofs',()=>{
 const sql=readFileSync('supabase/migrations/20261108_recovery183_aestiam_horizon_source_provenance.sql','utf8');
 assert.match(sql,/attest_aestiam_horizon_direct_issuer_v1/);
 assert.match(sql,/pdf_sha text := 'c77dc6259fc2e7731db341a4dc7db8475653b77ebe7be98ad42ae3ac7e588309'/);
 assert.match(sql,/v\.crash_test_status='FAIL_STRICT'/);
 assert.match(sql,/r\.last_error='Extraction existante partielle'/);
 assert.match(sql,/d\.result->>'identity_verified'='true'/);
 assert.match(sql,/d\.result->>'period_verified'='true'/);
 assert.match(sql,/scpi_internal\.tof_bulletin_source_rejection_reason/);
 assert.match(sql,/NOT EXISTS \(\s*SELECT 1 FROM scpi_internal\.tof_policy_quarantine_audit_20261028/);
 assert.match(sql,/tof\.verification_status='manual_verified_official_pdf_text_review'/);
 assert.match(sql,/tof\.verification_method='issuer_pdf_page_text_verified_against_TopAndTOF'/);
 assert.match(sql,/d\.result->'evidence'->c\.metric->'independent_engines'='\["MuPDF","Poppler"\]'::jsonb/);
 assert.match(sql,/proof_count<>5/);
 assert.match(sql,/2026-06-30/);
 assert.match(sql,/h\.metric_provenance->c\.metric->>'reference_date'/);
 assert.match(sql,/source_provenance_only|source provenance only/i);
 assert.match(sql,/issuer_source_sha256=pdf_sha/);
 assert.match(sql,/GET DIAGNOSTICS n=ROW_COUNT/);
 assert.match(sql,/REVOKE ALL ON FUNCTION/);
 assert.doesNotMatch(sql,/UPDATE public\.scpi_indicator_history/);
 assert.doesNotMatch(sql,/UPDATE public\.scpi_metric_certifications/);
 assert.doesNotMatch(sql,/UPDATE public\.scpi_indicators/);
 assert.doesNotMatch(sql,/UPDATE public\.scpi_crash_test_strict_v2/);
 assert.doesNotMatch(sql,/INSERT INTO maximus_agents\.tasks/);
 assert.match(sql,/financial_value_changes',0/);
 assert.match(sql,/financial_certifications_granted',0/);
});

test('RECOVERY-184 tracks current TOF quarantine *blocking* status, not audit record count',()=>{
 const sql=readFileSync('supabase/migrations/20261108_recovery184_historical_tof_diagnostics.sql','utf8');
 assert.match(sql,/scpi_historical_tof_quarantine_qa_v1/);
 assert.match(sql,/scpi_historical_tof_quarantine_summary_v1/);
 assert.match(sql,/security_invoker=true/);
 assert.match(sql,/scpi_internal\.tof_policy_quarantine_audit_20261028/);
 assert.match(sql,/scpi_internal\.independent_tof_geometric_proof_valid/);
 assert.match(sql,/scpi_internal\.tof_bulletin_source_rejection_reason/);
 assert.match(sql,/h\.tof IS DISTINCT FROM c\.value_numeric/);
 assert.match(sql,/q\.certificate_id/);
 assert.match(sql,/still_blocks_strict_pass/);
 assert.match(sql,/ALREADY_RECONCILED_HISTORICAL_PROOF/);
 assert.match(sql,/ASPIM_TOF_NOT_ADMISSIBLE/);
 assert.match(sql,/OUTSIDE_ISSUER_DOCUMENT_HOST/);
 assert.match(sql,/has_archive_pdf_exact_period/);
 assert.match(sql,/independent_qa_required/);
 assert.match(sql,/false::boolean AS permits_strict_pass/);
 assert.match(sql,/false::boolean AS task_dispatched/);
 assert.match(sql,/REVOKE ALL ON maximus_agents\.scpi_historical_tof_quarantine_qa_v1/);
 assert.doesNotMatch(sql,/DELETE\s+FROM\s+scpi_internal\.tof_policy_quarantine_audit/i);
 assert.doesNotMatch(sql,/UPDATE\s+(public\.|scpi_internal\.)/i);
 assert.doesNotMatch(sql,/GRANT\s+(SELECT|EXECUTE)\s+TO\s+(anon|authenticated)/i);
});
test('RECOVERY-184 uses existing CONTROL summary with no model calls, task mutations or bogus PASS',()=>{
 const sql=readFileSync('supabase/migrations/20261108_recovery184_control_historical_tof_summary.sql','utf8');
 assert.match(sql,/refresh_existing_missing_metric_control\(\)/);
 assert.match(sql,/scpi_historical_tof_quarantine_summary_v1/);
 assert.match(sql,/historical_tof_quarantine/);
 assert.match(sql,/still_blocking_periods/);
 assert.match(sql,/already_reconciled_periods/);
 assert.match(sql,/new_tasks_created',0/);
 assert.match(sql,/model_calls',0/);
 assert.match(sql,/financial_certified',false/);
 assert.match(sql,/deploy_allowed',false/);
 assert.match(sql,/role='CONTROL' AND enabled=true/);
 assert.match(sql,/REVOKE ALL ON FUNCTION/);
 assert.doesNotMatch(sql,/UPDATE\s+public\.scpi_/i);
 assert.doesNotMatch(sql,/INSERT\s+INTO\s+maximus_agents\.tasks/i);
 assert.doesNotMatch(sql,/UPDATE\s+scpi_internal\./i);
});


test('RECOVERY-185 dispatches bounded historical TOF jobs that are genuinely claimable',()=>{
 const sql=readFileSync('supabase/migrations/20261108_recovery185_historical_tof_live_queue.sql','utf8');
 assert.match(sql,/prepare_historical_tof_proof_batch_v1/);
 assert.match(sql,/claim_historical_tof_proof_v1/);
 assert.match(sql,/p_max<1 OR p_max>3/);
 assert.match(sql,/maximus_agents\.tasks/);
 assert.match(sql,/ON CONFLICT\(dedupe_key\) DO NOTHING/);
 assert.match(sql,/q\.still_blocks_strict_pass/);
 assert.match(sql,/d\.pdf_sha256 ~ '\^\[0-9a-f\]\{64\}\$'/);
 assert.match(sql,/d\.result->>'identity_verified'='true'/);
 assert.match(sql,/d\.result->>'period_verified'='true'/);
 assert.match(sql,/lower\(split_part\(split_part\(d\.source_url/);
 assert.match(sql,/claim_task/);
 assert.match(sql,/coalesce\(x\.payload->>''mode''/);
 assert.match(sql,/REVOKE ALL ON FUNCTION maximus_agents\.claim_historical_tof_proof_v1/);
 assert.doesNotMatch(sql,/UPDATE\s+public\.scpi_(indicator_history|metric_certifications|source_registry)/i);
 assert.doesNotMatch(sql,/DELETE\s+FROM\s+scpi_internal\.tof_policy_quarantine/i);
});
test('RECOVERY-185 OIDC worker never accepts a financial pass or an arbitrary PDF',()=>{
 const edge=readFileSync('supabase/functions/maximus-agent-audit-oidc/index.ts','utf8');
 const workflow=readFileSync('.github/workflows/maximus-agent-parallel.yml','utf8');
 assert.match(edge,/historical_prepare/);
 assert.match(edge,/historical_claim/);
 assert.match(edge,/historical_complete/);
 assert.match(edge,/HISTORICAL_SOURCE_HOST_NOT_APPROVED/);
 assert.match(edge,/binary_hash_matches_registered===true/);
 assert.match(edge,/financial_qa_completed:false/);
 assert.match(edge,/verdict:"REVIEW",deploy_allowed:false,financial_certified:false/);
 assert.match(workflow,/historical-tof-proof:/);
 assert.match(workflow,/op:'historical_prepare'/);
 assert.match(workflow,/op:'historical_claim'/);
 assert.match(workflow,/op:'historical_complete'/);
 assert.match(workflow,/candidate_pdf_binary_proof\.py/);
 assert.match(workflow,/max-parallel: 3/);
 assert.doesNotMatch(workflow,/op:'historical_approve'/);
});

test('RECOVERY-186 one-time archive retry is exact SCPI/SHA and preserves old run audit',()=>{
 const sql=readFileSync('supabase/migrations/20261108_recovery186_original_archive_retry.sql','utf8');
 assert.match(sql,/requeue_historical_archive_retry_v1/);
 assert.match(sql,/claim_historical_tof_proof_v1/);
 assert.match(sql,/prepare_historical_tof_proof_batch_v1/);
 assert.match(sql,/ISSUER_BINARY_PROOF_FAILED/);
 assert.match(sql,/t\.attempts=1/);
 assert.match(sql,/t\.payload->'archive_retry_v1' IS NULL/);
 assert.match(sql,/b\.pdf_sha256=t\.payload->>'pdf_sha256'/);
 assert.match(sql,/o\.bucket_id='scpi-bulletins'/);
 assert.match(sql,/LIMIT 2 FOR UPDATE OF t SKIP LOCKED/);
 assert.match(sql,/x\.attempts<2/);
 assert.match(sql,/claims_today>=5/);
 assert.match(sql,/claims_today<3/);
 assert.match(sql,/no|false/);
 assert.doesNotMatch(sql,/UPDATE\s+public\.scpi_(indicator_history|metric_certifications|source_registry)/i);
 assert.doesNotMatch(sql,/DELETE\s+FROM\s+scpi_internal\.tof_policy_quarantine/i);
 assert.match(sql,/INSERT\s+INTO\s+maximus_agents\.runs/i); // every real retry creates attempt #2 audit
});
test('RECOVERY-186 OIDC archive fetch is leased, private and bytes/SHA verified without release',()=>{
 const edge=readFileSync('supabase/functions/maximus-agent-audit-oidc/index.ts','utf8');
 const workflow=readFileSync('.github/workflows/maximus-agent-parallel.yml','utf8');
 assert.match(edge,/historical_archive_pdf/);
 assert.match(edge,/status='running'/);
 assert.match(edge,/lease_until>now\(\)/);
 assert.match(edge,/storage\.objects/);
 assert.match(edge,/SUPABASE_SERVICE_ROLE_KEY/);
 assert.match(edge,/crypto\.subtle\.digest\("SHA-256",data\)/);
 assert.match(edge,/archive_integrity_verified===true/);
 assert.match(edge,/publisher_live_verified===false/);
 assert.match(edge,/financial_qa_completed:false/);
 assert.match(workflow,/op:'historical_archive_pdf'/);
 assert.match(workflow,/historicalArchiveProof\.py/);
 assert.match(workflow,/continue-on-error: true/);
 assert.match(workflow,/financial-certification-does-not-exist|no financial publication|finance=REVIEW|financial_certified/);
 assert.doesNotMatch(workflow,/SUPABASE_SERVICE_ROLE_KEY|service_role/);
});


test('RECOVERY-191 only restores exact issuer-SHA dual-PDF Iroko T3 with immutable audit',()=>{
 const sql=readFileSync('supabase/migrations/20261108_recovery191_iroko_atlas_independent_tof_and_source_attestation.sql','utf8');
 for(const required of [
   'preserve_same_issuer_attestation_confidence',
   'trg_zzzz_preserve_same_issuer_attestation_confidence',
   "OLD.issuer_source_sha256=NEW.issuer_source_sha256",
   "OLD.issuer_source_verified_at=NEW.issuer_source_verified_at",
   "d.result->>'identity_verified'='true'",
   "d.result->>'period_verified'='true'",
   "issuer_source_sha256<>'301b326b2c149f75cd94f563401b9c9748779e64cf63e430b5d8c1a42d85918a'",
   "value_numeric<>96.65",
   "d.result->'evidence'->'tof'->'independent_engines'",
   "d.result->'evidence'->'tof'->>'association'='adjacent_caption'",
   "AND (d.result->'evidence'->'tof'->>'page')::integer=6",
   "FROM storage.objects",
   "INSERT INTO maximus_agents.scpi_replay_provenance_quarantine",
   "financial_certification_method','independent_issuer_pdf_two_readers'",
   "WHERE id='9036a11c-367c-4dd5-897c-b7cc7bd222c8'",
   "source_page=6",
   "extraction_confidence=1",
   "independent_verified_official_bulletin",
   "post_pass<>prior_pass+1",
   "REC191_POST_ADMISSION_NOT_EXACTLY_PLUS_ONE",
   "REVOKE ALL ON FUNCTION"
 ]) assert.ok(sql.includes(required),'Missing strict clause '+required);
 assert.match(sql,/UPDATE public\.scpi_metric_certifications/);
 assert.match(sql,/UPDATE public\.scpi_source_registry/);
 assert.doesNotMatch(sql,/UPDATE\s+public\.scpi_indicator_history/i);
 assert.doesNotMatch(sql,/UPDATE\s+maximus_agents\.scpi_universe/i);
 assert.doesNotMatch(sql,/DELETE\s+FROM\s+scpi_internal\.tof_policy_quarantine/i);
 assert.doesNotMatch(sql,/SECURITY DEFINER/i);
 assert.doesNotMatch(sql,/financial_certified',true/);
 assert.doesNotMatch(sql,/human_attestation',true/);
});

test('RECOVERY-192 stores only issuer SHA and independent geometry CANDIDATES, never financial admission',()=>{
 const sql=readFileSync('supabase/migrations/20261108_recovery192_staged_historical_tof_geometry_qa.sql','utf8');
 for(const needed of [
   'scpi_tof_candidate_geometry_qa',
   "candidate_tof_percent",
   "prior_invalid_value",
   "BBOX_CANDIDATE_REVIEW",
   "NEEDS_INDEPENDENT_SEMANTIC_QA",
   "artifact_json_sha256",
   "human_attestation=false",
   "deploy_allowed=false",
   "financial_certified=false",
   "LEFT JOIN maximus_agents.scpi_historical_tof_quarantine_qa_v1",
   "q.rejection_reason='TOF_ASPIM_FORBIDDEN'",
   "o.metadata->>'size'=e.pdf_bytes::text",
   "t.result->>'financial_certified'='false'",
   "workflow_reference='github-actions:42469201587'",
   "REC192_PERSISTED_PROOF_COUNT_",
   "REVOKE ALL",
   "security_invoker = true"
 ])assert.ok(sql.includes(needed),'Missing evidence fail-closed condition '+needed);
 assert.match(sql,/UNIQUE\(artifact_id\)/);
 assert.match(sql,/ENABLE ROW LEVEL SECURITY/);
 assert.doesNotMatch(sql,/UPDATE\s+public\.scpi_/i);
 assert.doesNotMatch(sql,/DELETE\s+FROM\s+scpi_internal\.tof_policy_quarantine/i);
 assert.doesNotMatch(sql,/INSERT\s+INTO\s+public\.scpi_metric_certifications/i);
 assert.doesNotMatch(sql,/UPDATE\s+maximus_agents\.scpi_universe/i);
 assert.doesNotMatch(sql,/SECURITY DEFINER/i);
 assert.doesNotMatch(sql,/GRANT ALL/i);
});
