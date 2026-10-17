import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const sql=fs.readFileSync(new URL('../../supabase/migrations/20261017_corum_issuer_esg_sources.sql',import.meta.url),'utf8');
test('USA SFDR Article 6 must identify immutable issuer 2025 notice PDF, not invented 2026 DIC',()=>{
 assert.match(sql,/b34a275e7d8eff9e8755abb94dad9a97300688b4cf797d150a5d5583fe7f2095/);
 assert.match(sql,/d\.page_count>=7/);
 assert.match(sql,/issuer_pdf_url/);
 assert.match(sql,/source_vintage','2025-01-24'/);
 assert.match(sql,/sfdr='Article 6'/);
 assert.match(sql,/reverify_if_newer_note_or_sfdr_disclosure',true/);
});
test('ISR label is sourced only from current official CORUM issuer group list',()=>{
 assert.match(sql,/https:\/\/www\.corum\.fr\/qui-sommes-nous\/labels-recompenses/);
 assert.match(sql,/WHEN i\.scpi_slug='corum-eurion' THEN true ELSE false END/);
 assert.match(sql,/Current issuer group labels list at 2026-10-17/);
 assert.match(sql,/i\.label_isr IS NULL/);
});
test('Source resolution does not invent signed review, approve risks or trigger Netlify',()=>{
 assert.match(sql,/dic_risk_sfdr_review_passed/);
 assert.match(sql,/current_2026_regulatory_independent_signoff',false/);
 assert.match(sql,/release_authorized',false/);
 assert.match(sql,/maximus_agents\.scpi_candidate_final_release_v1/);
 assert.doesNotMatch(sql,/SET\s+(?:audit_status|approved_by|approved_at|publication_authorized|analysis_certified|strict_pass|dic_risk_sfdr_review_passed)\s*=/i);
});
