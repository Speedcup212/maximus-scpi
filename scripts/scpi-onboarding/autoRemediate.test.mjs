import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { safeRepairCandidate } from './autoRemediate.mjs';
const original=JSON.parse(fs.readFileSync(new URL('./fixtures/sofidynamic-69-staging-2026-t2.json',import.meta.url),'utf8'));
const check=fn=>{const snap=structuredClone(original);fn(snap);return safeRepairCandidate(snap);};
test('detects and fixes a corrupted EUR -> M EUR derived display only',()=>{
 const {snapshot,report}=check(x=>{x.capitalisation_million_eur=247588480;});
 assert.equal(snapshot.capitalisation_million_eur,247.58848);
 assert.ok(report.actions.some(x=>x.code==='RECALCULATE_DERIVED_CAPITALISATION_MEUR'));
 assert.deepEqual(report.after.errors,[]);
 assert.equal(report.publication_authorized,false);
 assert.equal(snapshot.stage_status,'pending_independent_qa');
});
test('automatically reorders history without modifying financial records',()=>{
 const {snapshot,report}=check(x=>{x.quarterly_snapshots.reverse();});
 assert.deepEqual(snapshot.quarterly_snapshots.map(r=>r.source_period),['2026-T1','2026-T2']);
 assert.ok(report.actions.some(x=>x.code==='ORDER_SOURCE_QUARTERS_ASC'));
 assert.deepEqual(snapshot.quarterly_snapshots,original.quarterly_snapshots);
});
test('repeat pass is idempotent and does not rewrite valid evidence',()=>{
 const first=check(x=>{x.capitalisation_million_eur=247588480;});
 const second=safeRepairCandidate(first.snapshot);
 assert.equal(second.report.changed,false);
 assert.deepEqual(first.snapshot,second.snapshot);
});
test('source amount disagreement is BLOCKED not automatically rewritten',()=>{
 const {snapshot,report}=check(x=>{x.source_capitalisation_eur+=1000000;x.capitalisation_million_eur=999;});
 assert.equal(snapshot.capitalisation_million_eur,999);
 assert.ok(report.rejected.some(r=>r.code==='NO_TRUSTED_BASIS_FOR_AUTOFIX'));
 assert.ok(report.remaining_technical_errors.includes('CAPITALISATION_UNIT_CONVERSION_FAILED'));
});
test('tampered part counts block repair',()=>{
 const {snapshot,report}=check(x=>{x.quarterly_snapshots[1].nombre_parts+=100;x.capitalisation_million_eur=123;});
 assert.equal(snapshot.capitalisation_million_eur,123);
 assert.equal(report.status,'BLOCKED_TECHNICAL');
});
test('untrusted document hash blocks a repair',()=>{
 const {snapshot,report}=check(x=>{x.quarterly_snapshots[1].pdf_sha256='0'.repeat(64);x.capitalisation_million_eur=123;});
 assert.equal(snapshot.capitalisation_million_eur,123);
 assert.ok(report.rejected.length);
});
test('attempt to turn approval flag true never changes it or claims release',()=>{
 const {snapshot,report}=check(x=>{x.publication_authorized=true;x.capitalisation_million_eur=123;});
 assert.equal(snapshot.publication_authorized,true);
 assert.equal(report.publication_authorized,false);
 assert.ok(report.remaining_technical_errors.includes('PREMATURE_PUBLICATION_CLAIM'));
 assert.equal(report.changed,false);
});
test('official decimal rounding is preserved; no fabricated percentage adjustment',()=>{
 const {snapshot,report}=check(x=>{});
 assert.equal(snapshot.geography_values['Régions'],29.4);
 assert.equal(report.changed,false);
 assert.ok(report.pending_gates.some(g=>g.code==='CURRENT_STATUTES_NOT_VERIFIED'));
 assert.ok(report.pending_gates.some(g=>g.code==='INDEPENDENT_METRIC_QA'));
});
