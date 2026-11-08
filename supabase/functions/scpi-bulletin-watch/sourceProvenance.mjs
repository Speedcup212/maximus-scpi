// RECOVERY-181: source identity is independent of field extraction coverage.
// This does not certify any financial metric; same-document re-parsing should
// not revoke a SHA-attested issuer source unless URL, period, SHA or validity moves.
export function preserveIndependentIssuerProof(s,pdfUrl,sourcePeriod,sha256,existingSameHash){
  return Boolean(existingSameHash &&
    s && s.verification_status==="verified" &&
    s.confidence_level==="high" &&
    s.issuer_source_verified_at &&
    s.issuer_source_sha256 &&
    s.issuer_source_sha256===sha256 &&
    s.issuer_source_url===pdfUrl &&
    s.issuer_source_period===sourcePeriod &&
    s.bulletin_url===pdfUrl &&
    s.last_document_period===sourcePeriod);
}
