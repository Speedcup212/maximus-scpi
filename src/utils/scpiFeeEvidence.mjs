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
