import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateResolutionSummary as validate} from './documentResolution.mjs';
import {refusalEvent} from '../../supabase/functions/scpi-corum-document-oidc/refusalEvent.mjs';
const plan=()=>({version:'recovery203-resolution-v1',inventoried:700,orphaned:0,unresolved:700,
  overdue:12,official_discovery_scheduled:8,model_calls:0,financial_certified:false,deploy_allowed:false});
test('tracked and scheduled is explicitly not resolved or certified',()=>assert.equal(validate(plan()).unresolved,700));
test('fail closed on orphan, fabricated approval, unbounded work and invalid counts',()=>{
 for(const [k,v] of [['orphaned',1],['financial_certified',true],['deploy_allowed',true],
 ['model_calls',1],['official_discovery_scheduled',9],['unresolved',-1],['overdue',701],['inventoried',NaN]])
  assert.throws(()=>validate({...plan(),[k]:v}));
});
const doc=()=>({slug:'corum-origin',period:'2026-T2',sha256:'a'.repeat(64),url:'https://www.corum.fr/file.pdf'});
test('refusal keeps exact safe binary reference after RPC rollback',()=>{
 const e=refusalEvent(doc(),{message:'EXTENDED_PDF_HASH_OR_URL_MISMATCH unsafe raw detail'},'2026-11-12T00:00:00Z');
 assert.equal(e.message,'EXTENDED_PDF_HASH_OR_URL_MISMATCH sha256='+'a'.repeat(64));
 assert.equal(e.source_period,'2026-T2');assert.equal(e.status,'failed');
 assert.equal(e.bulletin_url,doc().url);assert.equal(e.step,'corum_document_refused');
});
test('refusal journal cannot expose tokens, arbitrary bodies or untrusted URLs',()=>{
 const e=refusalEvent({...doc(),url:doc().url+'?token=secret#private'},{message:'raw password secret'});
 assert.equal(e.bulletin_url,doc().url);assert.ok(!JSON.stringify(e).includes('secret'));
 for(const d of [{slug:'other'}, {period:'2026-T9'}, {sha256:'invalid'},
  {url:'http://www.corum.fr/a'}, {url:'https://www.corum.fr.attacker.test/a'},
  {url:'https://user:secret@www.corum.fr/a'}, {url:'https://www.corum.fr:444/a'}])
   assert.equal(refusalEvent({...doc(),...d},{}),null);
});
test('existing watchdog and CONTROL only; no new scheduler or financial mutation',()=>{
 const s=readFileSync('supabase/migrations/20261112061515_recovery203_no_orphan_resolution.sql','utf8');
 assert.match(s,/CREATE OR REPLACE FUNCTION maximus_agents.watchdog_tick/);
 assert.match(s,/perform maximus_agents.reconcile_document_resolution_v1\(8\)/);
 assert.match(s,/RESOLUTION_VERIFIED_PROOF_REQUIRED/);
 assert.match(s,/RESOLUTION_IDENTITY_AND_DEADLINE_IMMUTABLE/);
 assert.match(s,/RESOLUTION_ORPHANED_DEFECTS/);
 assert.match(s,/NOT IN \('scoped_code_correction','document_resolution'\)/);
 assert.doesNotMatch(s,/cron\.schedule|CREATE TABLE|SECURITY DEFINER|GRANT .*TO (anon|authenticated)/i);
 assert.doesNotMatch(s,/(?:UPDATE|INSERT INTO|DELETE FROM) public\.scpi_(?:indicators|indicator_history|metric_certifications|bulletin_analysis)\b/i);
 assert.doesNotMatch(s,/SET (?:attempts|verification_status|automation_enabled|ingestion_driver)\s*=/i);
});
