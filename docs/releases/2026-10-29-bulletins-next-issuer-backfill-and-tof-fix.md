# MaximusSCPI — verified issuer archive and TOF QA release
Date: 2026-10-29

This release deploys source/provenance QA and document parsing changes, not
unearned financial certifications.

- Issuer original PDF backfill: Epargne Pierre 2025-T1/T2/T3/T4
  (ATLAND Voisin) plus Ficommerce Proximite 2025-T4 (FIDUCIAL).
  All five PDFs passed complete read, exact fund identity and issue QA.
- Four former Epargne Pierre 2025 SCPI-Lab 403 source records now point,
  with retained error provenance, to four exact original issuer PDFs.
  The old third-party source cannot certify any TOF.
- Reject Buroboutic Metropoles 2026-T2 source fragment
  "(integres au TOF sous conditions): 1.77%" as a fund-level TOF.
  The exact PDF has been rerun on production Supabase, and its state is
  tof needs_review with no false metrics.tof; no silent promotion.
- Correcting financial source provenance or TOF does not waive remaining
  review checks, and the original failed extraction is archived.

## Production source-of-truth checks

- 65 active funds.
- 53 analysis statuses certified, 7 current-source reviews, 5 historical
  comparison reviews.
- 1,507 replay documents, 1,005 fully read, 49 issuer-resolved references,
  416 reference reviews and 36 transport errors.
- No claim of 100% full-document financial certification: 0 documents
  currently satisfy the strict financial_complete flag.

## Gate

Deploy only if the release-only GitHub OIDC Supabase attestation checks the
exact main SHA, current cohort = 65, privacy + trend/alert rules, and full
production browser build. The Netlify published deploy SHA must equal this
release commit. Candidate promotion gates are unchanged.
