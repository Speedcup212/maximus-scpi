import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const sql=fs.readFileSync(new URL('../../supabase/migrations/20261016_corum_q1_five_ai_assisted_second_source_review.sql',import.meta.url),'utf8');
test('Five pending Q1 fields require original SHA and exact official issuer pages',()=>{
 for(const x of [
 'source_page BETWEEN 1 AND d.page_count','d.pdf_sha256=b.pdf_sha256',
 "e.qa_status='pending_independent_qa'",
 "c.verification_status='source_page_verified_pending_independent_review'",
 "e.metric='tof'","e.numeric_value=95.71",
 "e.metric='prix_souscription'","eligible<>5"
 ])assert.ok(sql.includes(x),x);
 assert.match(sql,/AI-assisted second original-PDF page\/context review; NOT statutory signoff/);
 assert.match(sql,/ai_assisted_exact_primary_pdf_rechecked/);
});
test('Each private Q1 source now has six distinct, page-reviewed numbers, including Origin TOF and dividend',()=>{
 assert.match(sql,/HAVING count\(\*\)=6/);
 assert.match(sql,/IF cnt<>24/);
 assert.match(sql,/e\.metric='distribution_brute_par_part' THEN 'distribution_par_part'/);
 assert.match(sql,/jsonb_set\(coalesce\(b\.extraction_json/);
 assert.match(sql,/Refuse to review changed\/unverified Q1 sources/);
 assert.match(sql,/Reject % contradictory existing Q1 bulletin numbers/);
});
test('Numeric QA cannot forge human signoff or make partial candidate public',()=>{
 assert.match(sql,/b\.qa_status='candidate_page_checked_partial'/);
 assert.match(sql,/a\.certification_status='certified'/);
 assert.match(sql,/No automatic issuer QA promotion to public/);
 assert.doesNotMatch(sql,/SET\s+(?:publication_authorized|analysis_certified|audit_status)\s*=\s*true/i);
 assert.doesNotMatch(sql,/SET\s+qa_status\s*=\s*'manual_verified_official'/i);
});
