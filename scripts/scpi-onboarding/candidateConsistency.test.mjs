import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {inspectPrivateCandidate} from './candidateConsistency.mjs';
const original=JSON.parse(fs.readFileSync(new URL('./fixtures/sofidynamic-69-staging-2026-t2.json',import.meta.url),'utf8'));
const check=(modifier)=>{const x=structuredClone(original);modifier(x);return inspectPrivateCandidate(x)};
test('Sofidynamic T1 and T2 cap = price times number of parts',()=>{
 const x=check(()=>{});
 assert.equal(x.status,'TECHNICAL_PASS_ONLY');
 assert.equal(x.calculations['2026-T1'].delta_eur,0);
 assert.equal(x.calculations['2026-T2'].delta_eur,0);
 assert.equal(x.publication_authorized,false);
 assert.equal(x.independent_financial_qa,false);
 assert.ok(x.warnings.includes('CURRENT_STATUTES_NOT_VERIFIED'));
});
test('published decimal rounding of 99.9 percent is accepted, but not certified',()=>{
 const x=check(()=>{});
 assert.ok(x.warnings.includes('GEO:PUBLISHER_ROUNDING_NOT_100'));
 assert.equal(x.calculations.GEO.total_pct.toFixed(1),'99.9');
});
test('a 1m euro unit error is rejected before any QA',()=>{
 const x=check(s=>{s.capitalisation_million_eur=247588480});
 assert.ok(x.errors.includes('CAPITALISATION_UNIT_CONVERSION_FAILED'));
});
test('historic share count or capitalisation contradiction is blocked',()=>{
 const x=check(s=>{s.quarterly_snapshots[0].nombre_parts=672776;});
 assert.ok(x.errors.includes('2026-T1:CAPITALISATION_PARTS_PRICE_INCONSISTENT'));
});
test('allocation category omission is blocked',()=>{
 const x=check(s=>{delete s.geography_values['Espagne']});
 assert.ok(x.errors.includes('GEO:SUM_OUTSIDE_ISSUER_ROUNDING'));
});
test('unverified statues cannot be used to claim publication',()=>{
 const x=check(s=>{s.publication_authorized=true;});
 assert.ok(x.errors.includes('PREMATURE_PUBLICATION_CLAIM'));
});
