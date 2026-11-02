import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const migration=fs.readFileSync(new URL('../../supabase/migrations/20261102142947_candidate_verified_issuer_host_registry.sql',import.meta.url),'utf8');
test('private allowlist checks exact HTTPS publisher hostname',()=>{
 assert.match(migration,/p_source like \('https:\/\/' \|\| a\.hostname \|\| '\/%'\)/);
 for(const host of ['www.corum.fr','reim.bnpparibas-am.com','www.sofidy.com'])assert.ok(migration.includes(host));
 assert.doesNotMatch(migration,/SECURITY DEFINER/i);
});
test('public and write access not granted to restricted list',()=>{
 assert.match(migration,/enable row level security/);
 assert.match(migration,/revoke all on maximus_agents.scpi_candidate_issuer_hosts from public, anon, authenticated, service_role/);
 assert.match(migration,/grant select on maximus_agents.scpi_candidate_issuer_hosts to service_role/);
});
test('checks enforced on both evidence and regulation',()=>{
 assert.match(migration,/scpi_candidate_metric_evidence_source_url_check/);
 assert.match(migration,/scpi_candidate_regulatory_documents_source_url_check/);
 assert.match(migration,/is_verified_candidate_issuer_source\(source_url\)/);
});
