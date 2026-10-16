import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const sql=fs.readFileSync(new URL('../../supabase/migrations/20261016_corum_usa_statutes_fee_tool_parity.sql',import.meta.url),'utf8');
test('both comparator and full-surface gates accept exact official statutes fees and existing quarterly fees',()=>{
 assert.equal((sql.match(/JOIN maximus_agents\.scpi_candidate_regulatory_documents d/g)||[]).length,2);
 assert.equal((sql.match(/JOIN public\.scpi_metric_certifications c2/g)||[]).length,2);
 assert.equal((sql.match(/b\.pdf_sha256 ~ '\^\[a-f0-9\]\{64\}\$'/g)||[]).length,2);
 for(const condition of [
 "d.document_kind='statutes'","d.identity_verified IS TRUE",
 "d.kind_verified IS TRUE","d.source_url=c1.source_url AND d.source_url=c2.source_url",
 "c1.source_page BETWEEN 1 AND d.page_count","c2.source_page BETWEEN 1 AND d.page_count",
 "c1.verification_status='manual_verified_official'",
 "c2.verification_status='manual_verified_official'",
 "c1.source_period=i.source_period",
 "c1.metric='management_fee_euro_zone_ht'","c2.metric='management_fee_non_euro_zone_ht'",
 "c1.value_numeric>0 AND c1.value_numeric<100",
 "c2.value_numeric>0 AND c2.value_numeric<100"
 ])assert.ok(sql.includes(condition),condition);
});
test('legal issuer fee evidence does not invent an averaged fee, certify analysis or release CORUM',()=>{
 assert.match(sql,/i\.frais_gestion IS NULL/);
 assert.match(sql,/Never invent a single management fee across legal geographical tiers/);
 assert.match(sql,/Official fee provenance not recognized by all 4 comparators/);
 assert.match(sql,/Tool-data readiness cannot authorize public financial publication/);
 assert.match(sql,/Statutory fee rows alone must never sign final financial audit/);
 assert.doesNotMatch(sql,/UPDATE\s+public\.scpi_indicators/i);
 assert.doesNotMatch(sql,/UPDATE\s+maximus_agents\.scpi_universe/i);
 assert.doesNotMatch(sql,/SET\s+(?:analysis_certified|publication_authorized)\s*=/i);
});
