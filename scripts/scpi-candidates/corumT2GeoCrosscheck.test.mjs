import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const geography=fs.readFileSync(new URL('../../supabase/migrations/20261017_corum_t2_17_geographies_two_independent_sources.sql',import.meta.url),'utf8');
const eurion=fs.readFileSync(new URL('../../supabase/migrations/20261017_corum_eurion_t2_country_mapping_arbitration.sql',import.meta.url),'utf8');
test('17 original-PDF-anchored country fields require two distinct exact-dated publisher transcriptions',()=>{
  assert.match(geography,/n<>17/);
  assert.match(geography,/length\(p\.page_text\)>1000/);
  assert.match(geography,/original archived PDF page 4/i);
  assert.match(geography,/ateispatrimoine.com/);
  assert.match(geography,/2ndmarket.fr/);
  assert.match(geography,/immobilierpassif.com/);
  assert.match(geography,/e\.transcription1 <> e\.transcription2/);
  assert.match(geography,/i\.repartition_geographique->>a\.label/);
  assert.match(geography,/b\.pdf_sha256=a\.source_sha256/);
  assert.match(geography,/v\.document_identity_verified/);
  assert.match(geography,/OCR du diagramme géographique ORIGINAL incomplet/);
  assert.match(geography,/replay/i);
});
test('four Eurion transpositions overwrite only source-specific mapping and preserve dispute in existing independent review',()=>{
  for(const [label,oldPct,newPct] of [['Finlande',8,6],['Italie',1,14],['Lettonie',6,1],['Portugal',14,8]]){
    assert.ok(eurion.includes("('"+label+"',"+oldPct+"::numeric,"+newPct+"::numeric)"),label);
  }
  for(const text of [
    'original_candidate_values','selected_values','matching_sources','disagreeing_secondary_source',
    'pdf_text_extraction_warning','remaining_uncertainty','production_release_authorized',
    'scpi_candidate_final_review','source_arbitrations','2026-T2:geography:transposition',
    'francescpi.com','quellescpi.com','scpi-simulateur.fr','2ndmarket.fr',
    'ateispatrimoine.com','scpi_candidate_allocation_certification_v1',
    'final_release_ready'
  ])assert.ok(eurion.includes(text),text);
  assert.match(eurion,/GET DIAGNOSTICS n=ROW_COUNT/);
  assert.doesNotMatch(eurion,/UPDATE\s+public\.scpi_indicators/i);
  assert.doesNotMatch(eurion,/UPDATE\s+maximus_agents\.scpi_universe/i);
  assert.doesNotMatch(eurion,/UPDATE\s+maximus_agents\.scpi_candidate_final_audit/i);
  assert.doesNotMatch(eurion,/SET\s+(?:publication_authorized|strict_pass|analysis_certified)\s*=/i);
});
test('all four can reach financial QA but technical provenance never constitutes independent sign-off',()=>{
 for(const content of [geography,eurion]){
   assert.match(content,/maximus_agents\.scpi_candidate_final_release_v1/);
   assert.match(content,/final_release_ready/);
   assert.doesNotMatch(content,/SET\s+(?:debt_and_leverage_review_passed|fees_and_redemption_review_passed|frontend_contract_smoke_passed)\s*=/i);
 }
 assert.match(eurion,/pas inspection visuelle du graphique original/);
 assert.match(geography,/non signature financière\/réglementaire finale/);
});
