import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const migration = fs.readFileSync(
  new URL('../../supabase/migrations/20261017_corum_xl_one_point_official_source_arbitration.sql',import.meta.url),'utf8');
const policy = fs.readFileSync(new URL('../../docs/scpi-source-arbitration-policy.md',import.meta.url),'utf8');

test('CORUM XL chooses the frozen official 2026-T2 PDF 55%, not silently changing 54% website',()=>{
 assert.match(migration,/primary_pdf_url text := 'https:\/\/www\.corum\.fr\/sites\/default\/files\/2026-07\//);
 assert.match(migration,/fbac6a2efac56bc75bd90f4548656a7bdff86ab22f6d81e0a3c715e21cd819cd/);
 assert.match(migration,/competing_site text := 'https:\/\/www\.corum\.fr\/nos-scpi\/corum-xl\/patrimoine'/);
 assert.match(migration,/a\.source_page=4/);
 assert.match(migration,/position\('55 % 18% 14% 6% 4%' in o\.page_text\)>0/);
 assert.match(migration,/Bureau\* Commerce Hôtellerie Industriel & logistique Santé/);
 assert.match(migration,/a\.source_sha256=original_pdf_hash/);
 assert.match(migration,/o\.pdf_sha256=b\.pdf_sha256/);
 assert.match(migration,/v\.document_identity_verified/);
 assert.match(migration,/\(i\.repartition_sectorielle->>'Bureaux'\)::numeric=55/);
 assert.match(migration,/peer_count<>6 OR peer_total<>45/);
 assert.match(migration,/a\.qa_status='needs_review'/);
 assert.match(migration,/SET qa_status='qa_pass'/);
});

test('arbitration is audit-visible and does not alter any source number or release state',()=>{
 for(const token of [
   'source_arbitrations', 'selected_primary_value_pct', 'observed_issuer_web_value_pct',
   'delta_percentage_points','source_period','primary_pdf_sha256','primary_pdf_page',
   'secondary_issuer_url','cause_of_one_point_gap_unconfirmed',
   'regulatory_approval_signed','public_release_authorized'
 ])assert.ok(migration.includes(token),token);
 assert.match(migration,/maximus_agents\.scpi_candidate_final_release_v1/);
 assert.match(migration,/f\.final_release_ready/);
 assert.match(migration,/u\.publication_authorized OR u\.analysis_certified/);
 assert.doesNotMatch(migration,/SET\s+(?:pct|publication_authorized|analysis_certified|strict_pass)\s*=/i);
 assert.doesNotMatch(migration,/UPDATE\s+public\.scpi_indicators/i);
 assert.doesNotMatch(migration,/UPDATE\s+maximus_agents\.scpi_candidate_final_audit/i);
});

test('policy limits the tolerance to allocation reporting differences, never financial metrics',()=>{
 assert.match(policy,/1 point de pourcentage maximum/);
 assert.match(policy,/bulletin trimestriel officiel figé/);
 assert.match(policy,/libellé et pourcentage/);
 assert.match(policy,/les frais, la dette, la liquidité, DIC\/SFDR/);
 assert.match(policy,/Ne jamais modifier une valeur pour forcer le total à 100 %/);
 assert.match(policy,/changement d'unité\/périmètre reste une exception/);
 assert.match(policy,/Ne pas résoudre automatiquement un pays dont les pourcentages sont permutés/);
 assert.match(policy,/Netlify atomique/);
});
