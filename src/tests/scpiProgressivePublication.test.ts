import { describe, expect, it } from 'vitest';
// JavaScript policy is also executed directly by the Node-based onboarding worker.
// @ts-ignore - source is a dependency-free ESM module outside src.
import { evaluateProgressivePublication } from '../../scripts/scpi-onboarding/progressivePublication.mjs';
const verified = {
  identityVerified:true, legalManagementVerified:true, issuerPdfVerified:true,
  currentPdfSha256:'a'.repeat(64), currentPeriod:'2026-T2',
  sourceUrl:'https://www.sofidy.com/sample.pdf', dicVerified:true, noteVerified:true,
  essentialMetricsQaPassed:true, verifiedFieldDisplayPassed:true,
  feesAndWithdrawalReviewed:true, liquidityReviewed:true, leverageReviewed:true,
  allocationsVerified:true, browserSurfacesPassed:true, securityPassed:true,
  disclosureCanRender:true, materialFalsehood:false, uncontainedFinancialContradiction:false,
  latestStatutesVerified:true, shareFlowDelta:0, shareFlowOfficialSourcesVerified:true,
  lastOfficialValuationDate:'2026-06-30', lastOfficialValuationVerified:true,
  currentReferenceDate:'2026-06-30', dicRiskSfdrReviewed:true,
  quarterReconciliationPassed:true, fullCertificationReady:true
};
describe('progressive SCPI publication guard', () => {
 it('never equates machine READY with release authorization', () => {
  const result=evaluateProgressivePublication(verified);
  expect(result.status).toBe('READY_CERTIFIED');
  expect(result.publicationAuthorized).toBe(false);
 });
 it('allows documented missing statutes and contained 15-part historical discrepancy', () => {
  const result=evaluateProgressivePublication({...verified,latestStatutesVerified:false,
   shareFlowDelta:-15,fullCertificationReady:false,lastOfficialValuationDate:'2025-12-31',
   dicRiskSfdrReviewed:false,quarterReconciliationPassed:false});
  expect(result.status).toBe('READY_WITH_RESERVES');
  expect(result.disabledFeatures).toContain('share_movement_trend');
  expect(result.disabledFeatures).toContain('suitability_recommendations');
  expect(result.reservations).toContain('LATEST_STATUTES_UNVERIFIED');
  expect(result.publicationAuthorized).toBe(false);
 });
 it('blocks unverified critical information even when the latest statutes are absent', () => {
  for(const patch of [{dicVerified:false},{identityVerified:false},
   {feesAndWithdrawalReviewed:false},{browserSurfacesPassed:false},
   {shareFlowDelta:-15,shareFlowOfficialSourcesVerified:false},
   {materialFalsehood:true},{disclosureCanRender:false}]){
    const result=evaluateProgressivePublication({...verified,...patch});
    expect(result.status).toBe('BLOCKED');
  }
 });
});
