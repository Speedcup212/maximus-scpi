import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const sql=fs.readFileSync(new URL('../../supabase/migrations/20261017_corum_candidate_issuer_product_facts.sql',import.meta.url),'utf8');
test('CORUM creation years and monthly payment frequency are issuer sourced, not guessed',()=>{
  for(const [slug,year,route] of [
    ['corum-origin',2012,'corum-origin'],['corum-eurion',2020,'eurion'],
    ['corum-xl',2017,'corum-xl'],['corum-usa',2024,'corum-usa']
  ]){
    assert.ok(sql.includes("('"+slug+"',"+year+",'https://www.corum.fr/nos-scpi/"+route+"/dividendes'"),slug);
  }
  assert.match(sql,/https:\/\/www\.corum\.fr\/actus\/la-scpi-eurion-est-renommee-corum-eurion/);
  assert.match(sql,/SET annee_creation=p\.creation_year/);
  assert.match(sql,/versement_loyers='Mensuel'/);
  assert.match(sql,/i\.annee_creation IS NULL AND i\.versement_loyers IS NULL/);
  assert.match(sql,/changed_rows<>4/);
});
test('No release, fake PDF hash or financial-risk approval is applied by issuer-page crosscheck',()=>{
  for(const term of ['source_kind','official_issuer_published_webpage','source_pdf_sha_proof','release_authorized','financial_audit_signed',
                     'maximus_agents.scpi_candidate_final_release_v1'])
    assert.ok(sql.includes(term),term);
  assert.match(sql,/source_pdf_sha_proof',false/);
  assert.match(sql,/release_authorized',false/);
  assert.match(sql,/financial_audit_signed',false/);
  assert.match(sql,/final_release_ready/);
  assert.doesNotMatch(sql,/SET\s+(?:audit_status|approved_by|approved_at|publication_authorized|analysis_certified|strict_pass)\s*=/i);
  assert.doesNotMatch(sql,/UPDATE\s+(?:maximus_agents\.scpi_candidate_final_audit|public\.scpi_metric_certifications)/i);
});
