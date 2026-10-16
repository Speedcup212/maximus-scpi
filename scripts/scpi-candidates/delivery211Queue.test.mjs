import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const sql=fs.readFileSync(new URL('../../supabase/migrations/20261016_211_delivery_existing_queue_next_real_gate.sql',import.meta.url),'utf8');

test('Same private queue routes verified candidates to their next REAL incomplete gate',()=>{
 assert.match(sql,/CREATE OR REPLACE VIEW maximus_agents\.scpi_candidate_work_queue AS/);
 for(const stage of [
  'VERIFY_PDF_AND_IDENTITY','COMPLETE_PAGINATED_METRIC_QA',
  'CERTIFY_EXACT_PERIOD_BULLETIN_ANALYSIS',
  'COMPLETE_IROKO_ATLAS_TOOL_PARITY',
  'INDEPENDENT_FINANCIAL_AND_FINAL_QA','CONTROLLED_PUBLICATION_REVIEW'
 ])assert.ok(sql.includes(stage),stage);
 assert.match(sql,/scpi_candidate_publication_gate_v1 g/);
 assert.match(sql,/scpi_candidate_tool_readiness t/);
 assert.match(sql,/g\.annual_fields_qa_pass/);
 assert.match(sql,/g\.quarter_fields_qa_pass/);
 assert.match(sql,/t\.analysis_ready/);
});
test('One milestone board counts exactly eligible existing and candidate, never aliases',()=>{
 assert.match(sql,/CREATE OR REPLACE VIEW maximus_agents\.scpi_delivery_211 AS/);
 assert.match(sql,/u\.lifecycle IN \('existing','candidate'\)/);
 assert.match(sql,/count\(\*\) FILTER\(WHERE lifecycle='existing'\)/);
 assert.match(sql,/count\(\*\) FILTER\(WHERE lifecycle='candidate'\)/);
 assert.match(sql,/count\(\*\) FILTER\(WHERE public_api_approved\)/);
});
test('Delivery state is distinct from publication and private to external roles',()=>{
 assert.match(sql,/u\.strict_pass AND u\.analysis_certified/);
 assert.match(sql,/u\.publication_authorized/);
 assert.match(sql,/REVOKE ALL ON maximus_agents\.scpi_delivery_211 FROM PUBLIC,anon,authenticated/);
 assert.match(sql,/REVOKE ALL ON maximus_agents\.scpi_delivery_211_summary FROM PUBLIC,anon,authenticated/);
 assert.doesNotMatch(sql,/UPDATE\s+maximus_agents\.scpi_universe/i);
 assert.doesNotMatch(sql,/INSERT\s+INTO\s+(?:public\.)?scpi_/i);
 assert.doesNotMatch(sql,/CREATE\s+OR\s+REPLACE\s+FUNCTION.*deploy/i);
});
