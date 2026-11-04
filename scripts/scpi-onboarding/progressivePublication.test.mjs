import test from 'node:test';import assert from 'node:assert/strict';import {evaluateProgressivePublication} from './progressivePublication.mjs';
const source={identityVerified:true,legalManagementVerified:true,issuerPdfVerified:true,currentPdfSha256:'a'.repeat(64),currentPeriod:'2026-T2',sourceUrl:'https://www.sofidy.com/source.pdf',dicVerified:true,noteVerified:true,essentialMetricsQaPassed:true,verifiedFieldDisplayPassed:true,feesAndWithdrawalReviewed:true,liquidityReviewed:true,leverageReviewed:true,allocationsVerified:true,browserSurfacesPassed:true,securityPassed:true,disclosureCanRender:true,materialFalsehood:false,uncontainedFinancialContradiction:false,latestStatutesVerified:true,shareFlowDelta:0,shareFlowOfficialSourcesVerified:true,lastOfficialValuationDate:'2026-06-30',lastOfficialValuationVerified:true,currentReferenceDate:'2026-06-30',dicRiskSfdrReviewed:true,quarterReconciliationPassed:true,fullCertificationReady:true};
test('a genuine semester uses its actual end date without masquerading as a quarter',()=>{
 const r=evaluateProgressivePublication({...source,currentPeriod:'2026-S1'});
 assert.equal(r.status,'READY_CERTIFIED');assert.equal(r.publicationAuthorized,false);
 for(const patch of [{currentPeriod:'2026-S3'},{currentPeriod:'2026-S2'},{currentReferenceDate:'2026-09-30'}])
  assert.equal(evaluateProgressivePublication({...source,currentPeriod:'2026-S1',...patch}).status,'BLOCKED');
});
test('fully sourced input gets classification without authorization',()=>{const r=evaluateProgressivePublication(source);assert.equal(r.status,'READY_CERTIFIED');assert.equal(r.publicationAuthorized,false)});
test('Sofidynamic missing current statutes, -15 issuer parts, old valuation publishable with explicit feature restrictions',()=>{const r=evaluateProgressivePublication({...source,latestStatutesVerified:false,shareFlowDelta:-15,fullCertificationReady:false,lastOfficialValuationDate:'2025-12-31',dicRiskSfdrReviewed:false,quarterReconciliationPassed:false});assert.equal(r.status,'READY_WITH_RESERVES');for(const k of ['UNRECONCILED_SHARE_FLOW','LATEST_STATUTES_UNVERIFIED','LAST_OFFICIAL_VALUATION_HISTORICAL'])assert.ok(r.reservations.includes(k));assert.ok(r.disabledFeatures.includes('share_movement_trend'));assert.ok(r.disabledFeatures.includes('suitability_recommendations'));assert.equal(r.publicationAuthorized,false)});
test('uncontained material anomalies and unverified essential data block',()=>{for(const patch of [{identityVerified:false},{dicVerified:false},{noteVerified:false},{issuerPdfVerified:false},{essentialMetricsQaPassed:false},{feesAndWithdrawalReviewed:false},{liquidityReviewed:false},{browserSurfacesPassed:false},{securityPassed:false},{disclosureCanRender:false},{materialFalsehood:true},{uncontainedFinancialContradiction:true},{shareFlowDelta:-15,shareFlowOfficialSourcesVerified:false}]){const r=evaluateProgressivePublication({...source,...patch});assert.equal(r.status,'BLOCKED',JSON.stringify(patch))}});
test('malformed QA flags, unknown flow and impossible reference dates never certify',()=>{
 for(const patch of [{identityVerified:'false'},{fullCertificationReady:'true'},
   {latestStatutesVerified:undefined},{shareFlowDelta:null},{shareFlowDelta:undefined},
   {currentReferenceDate:undefined},{currentReferenceDate:'2026-06-31'},
   {currentReferenceDate:'2026-03-31'},{lastOfficialValuationDate:'2025-02-30'},
   {lastOfficialValuationDate:'2026-07-01'},{lastOfficialValuationDate:null}]) {
  const r=evaluateProgressivePublication({...source,...patch});
  assert.equal(r.status,'BLOCKED',JSON.stringify(patch));
  assert.equal(r.certificationClaimAllowed,false);
  assert.equal(r.publicationAuthorized,false);
 }
});
