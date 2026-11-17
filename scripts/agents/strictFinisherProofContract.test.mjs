import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const migration=readFileSync('supabase/migrations/20261117_recovery222_strict_finisher_binary_proof.sql','utf8');
const edge=readFileSync('supabase/functions/maximus-agent-audit-oidc/index.ts','utf8');
const workflow=readFileSync('.github/workflows/maximus-agent-parallel.yml','utf8');

test('FINISHER requires real issuer PDF from existing-source registry, same SCPI/period/SHA',()=>{
  for(const x of ["p_proof->>'candidate_slug'", "doc->>'source_period'=d.source_period",
    "doc->>'source_url'=d.source_url", "doc->>'pdf_sha256'=d.pdf_sha256",
    "doc->'reader_engines'", "doc->'identity_verified'", "doc->'period_verified'",
    "p_proof->'financial_certified'", "FINISHER_INVALID_LEASE",
    "scpi_crash_test_strict_v2", "lifecycle='existing'"])
    assert.ok(migration.includes(x), 'Missing source proof guard: '+x);
  assert.match(migration, /SECURITY INVOKER/g);
  assert.match(migration, /FOR UPDATE/);
  assert.doesNotMatch(migration,/UPDATE\s+public\.(?:scpi_source_registry|scpi_metric_certifications|scpi_indicators)\b/i);
  assert.doesNotMatch(migration,/INSERT\s+INTO\s+public\.scpi_metric_certifications\b/i);
});

test('FINISHER is real binary verifier, not a read-only registry snapshot',()=>{
  assert.ok(edge.includes('existing_proof_complete'));
  assert.ok(edge.includes('complete_existing_strict_binary_proof_v1'));
  assert.match(edge,/body\.proof\.financial_certified!==false/);
  assert.match(workflow,/candidate_pdf_binary_proof\.py/);
  assert.match(workflow,/PyMuPDF==1\.26\.5/);
  assert.match(workflow,/poppler-utils/);
  assert.match(workflow,/source_pdf_verified===true/);
  assert.match(workflow,/if\(blocked>0\)core\.setFailed/);
  assert.match(workflow,/role: \[DATA, SEARCH, ANALYST, QA\]/);
  assert.match(migration,/>= 8/);
});

test('FINISHER cannot falsely complete a financial certification',()=>{
  assert.match(migration, /'independent_financial_qa_completed',false/);
  assert.match(migration, /'verdict','REVIEW'/);
  assert.match(migration, /'deploy_allowed',false/);
  assert.match(migration, /'financial_certified',false/);
  assert.doesNotMatch(migration, /'verdict','PASS'/);
});
