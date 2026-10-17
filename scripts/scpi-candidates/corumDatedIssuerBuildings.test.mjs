import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const sql=fs.readFileSync(new URL('../../supabase/migrations/20261017_corum_t2_issuer_dated_building_counts.sql',import.meta.url),'utf8');
test('three dated exact publisher CORUM building counts, not OCR or marketing approximations',()=>{
 for(const [slug,count,url] of [
 ['corum-eurion','54','eurion'],['corum-origin','170','corum-origin'],
 ['corum-xl','96','corum-xl']]){
   assert.match(sql,new RegExp(slug+"',"+count+"::numeric,'https://www\\.corum\\.fr/nos-scpi/"+url));
 }
 assert.match(sql,/manual_verified_official/);
 assert.match(sql,/direct_issuer_html_dated_2026_t2/);
 assert.match(sql,/source_period='2026-T2'/);
 assert.match(sql,/evidence_text/);
 assert.match(sql,/source_url/);
 assert.doesNotMatch(sql,/\('corum-usa',\d+::numeric/);
});
test('do not guess absent tenant, WALT, collections, debt or change public authorizations',()=>{
 assert.match(sql,/i\.nombre_immeubles IS NULL/);
 assert.match(sql,/i\.nombre_locataires IS NOT NULL/);
 assert.match(sql,/i\.walt IS NOT NULL/);
 assert.match(sql,/i\.walb IS NOT NULL/);
 assert.match(sql,/i\.collecte_nette IS NOT NULL/);
 assert.match(sql,/applied_cert<>3/);
 assert.match(sql,/applied_ind<>3/);
 assert.doesNotMatch(sql,/SET\s+(?:publication_authorized|analysis_certified|strict_pass|endettement|td|tof)\s*=/i);
});
