import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const manifest = JSON.parse(fs.readFileSync(
  new URL('./fixtures/sofidynamic-69-second-pass.json',import.meta.url),'utf8'));
const migration = fs.readFileSync(new URL(
  '../../supabase/migrations/20261103093000_candidate_core_evidence_dated_aliases.sql',import.meta.url),'utf8');

function eligible(rows, predicate) {
 return rows.filter(r=>r.qa_before==='pending_independent_qa' &&
   /^https:\/\/www\.sofidy\.com\//.test(r.source_url) &&
   /^[a-f0-9]{64}$/.test(r.pdf_sha256) &&
   r.source_page>0 && Number.isFinite(r.value) && predicate(r));
}
test('quarterly core remains separate from last official annual valuation',()=>{
 const annual=eligible(manifest.rows,r=>r.period==='2025-RA' &&
   ['prix_reconstitution','valeur_realisation'].includes(r.metric) && r.basis.startsWith('VALUATION_AT_'));
 const distribution=eligible(manifest.rows,r=>r.period==='2026-T2' &&
   r.metric==='distribution_par_part');
 const price=eligible(manifest.rows,r=>r.period==='2026-T2' && r.metric==='prix_souscription');
 assert.equal(annual.length,2);
 assert.equal(distribution.length,1);
 assert.equal(price.length,1);
 assert.equal(annual.every(r=>r.period!=='2026-T2'),true);
});
test('database core metric expansion is generic, independent QA-gated and RLS-safe',()=>{
 assert.match(migration,/WITH \(security_invoker = true\)/);
 assert.match(migration,/AND e2\.metric='distribution_par_part'/);
 assert.match(migration,/AND e3\.value_basis LIKE 'VALUATION_AT_%'/);
 assert.match(migration,/AND e3\.qa_status='qa_pass' AND e3\.independently_reviewed_at IS NOT NULL/);
 assert.match(migration,/v3\.document_identity_verified/);
 assert.match(migration,/e3\.source_page BETWEEN 1 AND v3\.page_count/);
 assert.doesNotMatch(migration,/WHERE e3\.scpi_slug='sofidynamic'/);
 assert.doesNotMatch(migration,/UPDATE public\.scpi_indicators/i);
});
