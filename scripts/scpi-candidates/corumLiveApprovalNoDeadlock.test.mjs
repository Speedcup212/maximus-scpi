import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const p=fs.readFileSync('scripts/scpi-candidates/promoteApprovedCorum.mjs','utf8');
const audit=fs.readFileSync('scripts/scpi-candidates/auditCorumE2e.mjs','utf8');
const input=fs.readFileSync('scripts/scpi-candidates/buildCurrentCorumReleaseInput.mjs','utf8');
test('signed live batch gate is checked BEFORE lifting the in-memory private release flag',()=>{
 const from=p.indexOf('const preview=buildPrivateReleaseInput(');
 const pre=p.indexOf('await liveApproval(preview.scpi)',from);
 const flag=p.indexOf('candidate.release_ready=true',from);
 const qa=p.indexOf('const report=auditSnapshot',from);
 const write=p.indexOf('fs.writeFileSync(catalogPath',from);
 assert.ok(from>=0&&pre>from&&flag>pre&&qa>flag&&write>qa);
 assert.match(p,/if\(isApply\) \{\s*await liveApproval\(preview.scpi\)/);
 assert.match(p,/t\.full_surface_ready/);
 assert.match(p,/row\.release_ready/);
 assert.match(p,/current Supabase/i);
});
test('verified original DIC evidence and canonical qualitative registry can coexist without forged PDF page',()=>{
 assert.match(audit,/hasOfficial2026Valuation/);
 assert.match(audit,/approvedRegistryProof/);
 assert.match(audit,/ledgerDerived\.has\(field\)/);
 assert.match(input,/Conflicting official PDF regulatory evidence/);
 assert.match(p,/assertCanonicalFinancialEvidence\(candidate,certified\)/);
 assert.match(p,/assertTieredFeesMatchIndependentLedger\(candidate,certified\)/);
 assert.match(p,/assertExactGeography\(candidate,canonical\)/);
 assert.match(p,/canonical\?\.\[field\]!==wanted/);
});
test('real release requires authenticated browser run and artifact for exact git HEAD',()=>{
 assert.match(p,/CORUM_BROWSER_RUN_ID/);
 assert.match(p,/CORUM_BROWSER_ARTIFACT_SHA256/);
 assert.match(p,/execFileSync\('git',\['rev-parse','HEAD'\]/);
 assert.match(p,/verifyCompletedCorumBrowserRun\(batch\)/);
 assert.doesNotMatch(p,/verifyCompletedCorumBrowserRun\(preview\.browser_batch\)/);
});
