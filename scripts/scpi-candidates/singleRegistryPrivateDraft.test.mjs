import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const initial=fs.readFileSync(new URL('../../supabase/migrations/20261017_corum_single_registry_publication_draft.sql',import.meta.url),'utf8');
const latest=fs.readFileSync(new URL('../../supabase/migrations/20261017_corum_single_registry_derived_descriptors.sql',import.meta.url),'utf8');
test('Private source-derived draft directly reuses the existing canonical registry and typed evidence',()=>{
 for(const term of [
 'CREATE OR REPLACE VIEW maximus_agents.scpi_candidate_publication_draft_v1',
 'WITH (security_invoker = true)',
 'public.scpi_indicators',
 'maximus_agents.scpi_universe',
 'public.scpi_metric_certifications',
 'maximus_agents.scpi_candidate_regulatory_metric_evidence',
 'public.scpi_trajectory_pilot_liquidity',
 'maximus_agents.scpi_candidate_regulatory_documents',
 'source_period',
 'minimum_initial_parts',
 'independently_verified_at IS NOT NULL',
 'manual_verified_official',
 "WHERE u.lifecycle='candidate' AND NOT u.publication_authorized"
 ])assert.ok(latest.includes(term),term);
 assert.match(latest,/REVOKE ALL ON maximus_agents\.scpi_candidate_publication_draft_v1/);
 assert.match(latest,/FROM PUBLIC,anon,authenticated/);
 assert.match(latest,/false::boolean AS final_release_approved/);
 assert.doesNotMatch(latest,/UPDATE\s+(?:public|auth|storage|maximus_agents)\./i);
 assert.doesNotMatch(latest,/GRANT\s+SELECT\s+ON/i);
});
test('One source provenance per financial rate, two fee tiers never blended',()=>{
 assert.match(latest,/outside_euro_zone_percent/);
 assert.match(latest,/euro_zone_percent/);
 assert.match(latest,/'blended_rate',NULL/);
 assert.match(latest,/CASE WHEN b\.verified_sri=b\.srri/);
 assert.match(latest,/CASE WHEN b\.verified_holding_years=b\.duree_detention_recommandee/);
 assert.match(latest,/CASE WHEN b\.min_initial_parts>=1/);
 assert.match(latest,/'annual_yield_reference',b\.td_reference_period/);
 assert.match(latest,/'annual_debt_reference',b\.debt_reference_period/);
});
test('Risk disclaimer only when signed issuer note extraction contains exact risk clues',()=>{
 assert.match(latest,/d\.identity_verified AND d\.kind_verified/);
 assert.match(latest,/position\('risque de perte en capital'/);
 assert.match(latest,/position\('liquidit'/);
 assert.match(latest,/position\('revenus ne sont pas garantis'/);
 assert.match(latest,/position\('cours des devises'/);
 assert.match(latest,/'withdrawal_terms', NULL/);
 assert.match(latest,/'risk_warning_note_url'/);
 assert.match(latest,/'sector_class', CASE/);
 assert.match(latest,/'geographic_scope', CASE/);
 assert.doesNotMatch(initial,/risk_warning_note_url/);
});
