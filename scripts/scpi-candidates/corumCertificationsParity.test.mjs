import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const migration=fs.readFileSync(new URL('../../supabase/migrations/20261016_corum_69_independent_metrics_existing_certification_schema.sql',import.meta.url),'utf8');

test('69 exact official proof records move into the EXISTING SCPI certification schema',()=>{
 assert.match(migration,/INSERT INTO public\.scpi_metric_certifications/);
 assert.match(migration,/n<>69/);
 assert.match(migration,/e\.qa_status='qa_pass'/);
 assert.match(migration,/e\.independently_reviewed_at IS NOT NULL/);
 assert.match(migration,/e\.source_page>0/);
 assert.match(migration,/e\.document_kind/);
 assert.match(migration,/v\.document_identity_verified/);
 assert.match(migration,/p\.pdf_sha256=b\.pdf_sha256/);
 assert.match(migration,/manual_verified_official/);
});
test('Candidate sources stay entirely behind official-identity and public release guards',()=>{
 assert.match(migration,/u\.lifecycle<>'candidate'/);
 assert.match(migration,/u\.publication_authorized/);
 assert.match(migration,/u\.analysis_certified/);
 assert.doesNotMatch(migration,/SET\s+publication_authorized\s*=\s*true/i);
 assert.doesNotMatch(migration,/SET\s+analysis_certified\s*=\s*true/i);
 assert.doesNotMatch(migration,/UPDATE\s+public\.scpi_bulletins/i);
 assert.doesNotMatch(migration,/CREATE\s+TABLE.*scpi_/i);
});
