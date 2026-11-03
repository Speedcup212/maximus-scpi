/**
 * RECOVERY-077: progressive listing is NOT full financial certification.
 * All candidate facts must be source-backed; only strictly contained defects
 * may be disclosed without blocking a factual public fiche.
 */
const SHA = /^[a-f0-9]{64}$/;
const QUARTER = /^20\d{2}-T[1-4]$/;
const ISO = /^20\d{2}-\d{2}-\d{2}$/;

export function evaluateProgressivePublication(input) {
  const d = input || {};
  const blockers = [], reservations = [], disabledFeatures = [];
  const block = code => { if (!blockers.includes(code)) blockers.push(code); };
  const reserve = (code, features = []) => {
    if (!reservations.includes(code)) reservations.push(code);
    for (const feature of features) if (!disabledFeatures.includes(feature)) disabledFeatures.push(feature);
  };
  if (!d.identityVerified || !d.legalManagementVerified) block('UNVERIFIED_ISSUER_IDENTITY');
  if (!d.issuerPdfVerified || !SHA.test(d.currentPdfSha256 || '') ||
      !QUARTER.test(d.currentPeriod || '') || !d.sourceUrl?.startsWith('https://')) block('NO_VERIFIED_CURRENT_ISSUER_BULLETIN');
  if (!d.dicVerified || !d.noteVerified) block('MISSING_ESSENTIAL_INVESTOR_DOCUMENTS');
  if (!d.essentialMetricsQaPassed || !d.verifiedFieldDisplayPassed) block('UNVERIFIED_ESSENTIAL_NUMERIC_DATA');
  if (!d.feesAndWithdrawalReviewed || !d.liquidityReviewed || !d.leverageReviewed) block('UNREVIEWED_MATERIAL_FINANCIAL_RISK');
  if (!d.allocationsVerified) block('INCOHERENT_GEOGRAPHIC_OR_SECTOR_DATA');
  if (!d.browserSurfacesPassed || !d.securityPassed) block('UNSAFE_OR_UNTESTED_PUBLIC_RENDERING');
  if (!d.disclosureCanRender) block('MANDATORY_DISCLOSURES_NOT_RENDERED');
  if (d.materialFalsehood || d.uncontainedFinancialContradiction) block('UNCONTAINED_MATERIAL_CONTRADICTION');

  // No statement that a signed old copy is the *latest* constitution.
  if (!d.latestStatutesVerified) reserve('LATEST_STATUTES_UNVERIFIED',['legal_terms_currentness']);
  if (d.shareFlowDelta !== 0 && d.shareFlowDelta != null) {
    if (!Number.isSafeInteger(d.shareFlowDelta) || !d.shareFlowOfficialSourcesVerified) block('UNVERIFIED_SHARE_FLOW_DISCREPANCY');
    else reserve('UNRECONCILED_SHARE_FLOW',['share_movement_trend','derived_capital_flow']);
  }
  if (d.lastOfficialValuationDate) {
    if (!ISO.test(d.lastOfficialValuationDate) || !d.lastOfficialValuationVerified)
      block('UNVERIFIED_HISTORICAL_VALUATION');
    else if (d.lastOfficialValuationDate < d.currentReferenceDate)
      reserve('LAST_OFFICIAL_VALUATION_HISTORICAL',['undated_valuation_comparison']);
  }
  if (!d.dicRiskSfdrReviewed) reserve('RISK_SFDR_TEXT_UNDER_REVIEW',['suitability_recommendations','unsupported_sfdr_claims']);
  if (!d.quarterReconciliationPassed) reserve('HISTORICAL_RECONCILIATION_INCOMPLETE',['uncertified_history_comparison']);
  const status = blockers.length ? 'BLOCKED'
    : (reservations.length || !d.fullCertificationReady ? 'READY_WITH_RESERVES' : 'READY_CERTIFIED');
  return {
    status,
    mayEnterPublicReleaseReview: status !== 'BLOCKED',
    certificationClaimAllowed: status === 'READY_CERTIFIED',
    blockers, reservations, disabledFeatures,
    // Never issue release permission here: requires an accountable, audited,
    // exact-cohort/Netlify-commit publication transaction.
    publicationAuthorized: false,
  };
}
