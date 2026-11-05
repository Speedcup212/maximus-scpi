import test from 'node:test';
import assert from 'node:assert/strict';
import {PILOTS,SURFACES} from './admissionPhases.mjs';
import {evaluateProtectedReleaseEvidence,hashEvidenceSnapshot} from './protectedReleaseEvidence.mjs';
const sha='a'.repeat(40),digest='b'.repeat(64);
const reviewGates=['legal_identity_passed','verified_field_display_passed','annual_quarter_coherence_passed',
 'debt_and_leverage_review_passed','liquidity_risk_review_passed','fees_and_redemption_review_passed',
 'dic_risk_sfdr_review_passed','frontend_contract_smoke_passed'];
const auditGates=['historical_consistency_pass','financial_coverage_pass','liquidity_risk_pass','document_regulatory_pass','public_display_mapping_pass'];
const dbGates=['current_pdf_identity_verified','source_financial_gate','allocation_gate','candidate_indicator_gate',
 'analysis_gate','independent_review_gate','independent_audit_gate','responsible_batch_gate',
 'six_surface_browser_gate','final_release_gate','registry_links_verified',
 'regulatory_legal_review_gate','prepublication_history_consistency_ready'];
function fixture(){return {
 pilot_rows:PILOTS.map(scpi_slug=>({scpi_slug,source_period:'2026-T3',regulatory_binary_count:3,
  ...Object.fromEntries(dbGates.map(key=>[key,true]))})),
 reviews:PILOTS.map(scpi_slug=>({scpi_slug,reviewed_by:'financial-reviewer',
  reviewed_at:'2026-11-05T17:00:00Z',...Object.fromEntries(reviewGates.map(key=>[key,true])),
  review_evidence:{browser_smoke:{status:'PASS',commit_sha:sha,run_url:'https://github.com/Speedcup212/maximus-scpi/actions/runs/123456',
   artifact_zip_sha256:digest,artifact_id:123456,cases:[390,1440].flatMap(width=>SURFACES.map(surface=>({
    slug:scpi_slug,width,surface,status:'PASS',proof_sha256:digest
   })))}}})),
 audits:PILOTS.map(scpi_slug=>({scpi_slug,audit_status:'approved',approved_by:'independent-auditor',
  approved_at:'2026-11-05T18:00:00Z',independent_qa_reference:'QA/2026-11-05',
  evidence_digest_sha256:digest,...Object.fromEntries(auditGates.map(key=>[key,true]))})),
 batch:{batch_id:'RECOVERY-100-THREE-PILOTS-20261105',candidate_slugs:[...PILOTS],decision:'approved',
  responsible_name:'codex-automation-delegated-release',decided_at:'2026-11-05T19:00:00Z',dossier_digest_sha256:digest},
 delegations:[{actor:'codex-automation-delegated-release',active:true,authorization_source:'explicit permanent delegation',authorized_at:'2026-11-01T00:00:00Z'}]
};}
const evaluate=f=>evaluateProtectedReleaseEvidence(f,{expectedSha:sha});
test('all synthetically complete proof claims remain nonauthoritative even if candidate-ready',()=>{
 const r=evaluate(fixture());
 assert.equal(r.status,'CANDIDATE_FOR_PROTECTED_PUBLISH_APPROVAL');
 assert.equal(r.blocker_count,0);
 assert.equal(r.publication_authorized,false);assert.equal(r.postdeploy_100_proven,false);
 assert.equal(r.verified_by_protected_executor,false);
});
test('live known missing gates and pending audits all block',()=>{
 const f=fixture();
 f.pilot_rows[0].analysis_gate=false;f.pilot_rows[1].regulatory_binary_count=2;
 f.audits[2].audit_status='pending';f.batch.decision='draft';
 const r=evaluate(f);
 assert.equal(r.status,'BLOCKED');assert.ok(r.blockers.some(x=>x.includes('ANALYSIS')));
 assert.ok(r.blockers.some(x=>x.includes('THREE_CURRENT_REGULATORY')));
 assert.ok(r.blockers.some(x=>x.includes('INDEPENDENT_AUDIT')));
 assert.ok(r.blockers.includes('BATCH_NOT_APPROVED_WITH_SIGNED_DIGEST'));
});
test('duplicate, incomplete and swapped pilot groups fail',()=>{
 for(const key of ['pilot_rows','reviews','audits']){
  const f=fixture(); f[key][1].scpi_slug=f[key][0].scpi_slug;
  assert.equal(evaluate(f).status,'BLOCKED',key);
 }
 const f=fixture(); f.batch.candidate_slugs.pop();
 assert.ok(evaluate(f).blockers.includes('BATCH_IDENTITY_MISMATCH'));
});
test('actor separation, delegation existence and chronology are mandatory',()=>{
 const a=fixture();a.reviews[0].reviewed_by=a.audits[0].approved_by;
 assert.ok(evaluate(a).blockers.some(x=>x.includes('ACTOR_NOT_SEPARATED')));
 const b=fixture();b.delegations[0].active=false;
 assert.ok(evaluate(b).blockers.includes('RESPONSIBLE_ACTOR_NOT_EXPLICITLY_DELEGATED'));
 const c=fixture();c.audits[0].approved_at='2026-11-05T16:00:00Z';
 assert.ok(evaluate(c).blockers.some(x=>x.includes('AUDIT_PRECEDES')));
});
test('any missing critical financial or legal review or audit fails closed',()=>{
 for(const gate of reviewGates){const f=fixture();f.reviews[0][gate]=false;assert.equal(evaluate(f).status,'BLOCKED',gate);}
 for(const gate of auditGates){const f=fixture();f.audits[0][gate]=false;assert.equal(evaluate(f).status,'BLOCKED',gate);}
 for(const gate of dbGates){const f=fixture();f.pilot_rows[0][gate]=false;assert.equal(evaluate(f).status,'BLOCKED',gate);}
});
test('browser evidence must have a real run reference, bound SHA, ZIP digest and twelve individual proofs',()=>{
 const changes=[
  f=>f.reviews[0].review_evidence.browser_smoke.commit_sha='c'.repeat(40),
  f=>f.reviews[0].review_evidence.browser_smoke.run_url='https://github.attacker.example/run/1',
  f=>f.reviews[0].review_evidence.browser_smoke.artifact_zip_sha256='not-a-digest',
  f=>f.reviews[0].review_evidence.browser_smoke.cases.pop(),
  f=>f.reviews[0].review_evidence.browser_smoke.cases[0].proof_sha256='',
  f=>f.reviews[0].review_evidence.browser_smoke.cases[0].surface='wrong'
 ];
 for(const mutate of changes){const f=fixture();mutate(f);assert.equal(evaluate(f).status,'BLOCKED');}
});
test('a matching 64-digit hexadecimal digest is not proof of document authenticity',()=>{
 const f=fixture();assert.match(hashEvidenceSnapshot(f),/^[a-f0-9]{64}$/);
 assert.notEqual(hashEvidenceSnapshot(f),hashEvidenceSnapshot({...f,source:'changed'}));
 assert.equal(evaluate(f).publication_authorized,false);
});
