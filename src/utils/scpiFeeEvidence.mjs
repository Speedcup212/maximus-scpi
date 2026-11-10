/** A source-level approval never establishes a fee's tax basis or validity. */
export function selectProvenFee(value, proof, expectedTax, previousValue, previousProof) {
  const present = v => typeof v === 'number' && Number.isFinite(v) && v >= 0;
  const date = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) &&
    !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0,10) === v;
  const valid = (v,p) => present(v) && p?.verification_status === 'verified' &&
    p.value_numeric === v && p.tax_basis === expectedTax &&
    typeof p.assessment_basis === 'string' && p.assessment_basis.trim().length > 0 &&
    date(p.valid_from) && /^https:\/\//.test(p.source_url || '') &&
    /^[a-f0-9]{64}$/i.test(p.pdf_sha256 || '') && Number.isInteger(p.source_page) && p.source_page > 0 &&
    typeof p.evidence_text === 'string' && p.evidence_text.trim().length > 0 &&
    p.product_identity_verified === true && p.semantic_review_verified === true;
  // A documented non-applicability (primary subscription closed after a suspension of capital
  // variability, for instance) hides any inherited figure instead of letting it resurface.
  if (isProvenNotApplicable(proof) && !(valid(previousValue, previousProof) && previousProof.valid_from > proof.valid_from)) {
    return { value: null, proof, applied: true, reason: 'not_applicable' };
  }
  if (!valid(value, proof)) return { value: previousValue, proof: previousProof, applied: false, reason: 'fee_evidence_incomplete' };
  if (present(previousValue) && previousValue !== value && !valid(previousValue, previousProof)) {
    return { value: previousValue, proof: previousProof, applied: false, reason: 'existing_fee_requires_reconciliation' };
  }
  if (valid(previousValue, previousProof)) {
    if (proof.valid_from <= previousProof.valid_from || proof.reliability_rank < previousProof.reliability_rank ||
        !Number.isFinite(proof.reliability_rank) || !Number.isFinite(previousProof.reliability_rank)) {
      return { value: previousValue, proof: previousProof, applied: false, reason: 'protected_existing_fee' };
    }
  }
  return { value, proof, applied: true, reason: null };
}

/** Proof that a fee does not apply: dated, sourced and with an excerpt; never a zero. */
export function isProvenNotApplicable(proof) {
  const date = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
  return proof?.value_state === 'not_applicable' && proof.verification_status === 'verified' &&
    date(proof.valid_from) && /^https:\/\//.test(proof.source_url || '') &&
    typeof proof.evidence_text === 'string' && proof.evidence_text.trim().length > 20 &&
    !('value_numeric' in proof && proof.value_numeric !== null);
}
