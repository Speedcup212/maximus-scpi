# MaximusSCPI — source provenance and PDF reader release (2026-10-29)

This is a controlled technical production deployment request, NOT a claim that
all archived financial fields are certified.

## Verified database facts at release preparation

- Cohort: 65 active SCPI including CORUM Origin, XL, Eurion and USA.
- 53/65 SCPI analyses fully certified as of this cut; 7 current-source
  reviews and 5 historical comparison reviews remain explicitly non-certified.
- Eight historical CORUM Origin/XL issuer capitalisations (2023-T4 through
  2024-T3), verified against printed publisher figures with independently
  checked PDF price/shares and SHA evidence.
- 9 original Praemia REIM quarterly issuer PDFs, 4 Épargne Pierre ATLAND
  quarterly PDFs and 2 La Française/Moniwan first-party issuer PDFs recovered,
  read with fund+issue checks; their field-level coverage remains explicit.
- Patrimmo Commerce T1 2026 history now refers to its actual T1 PDF, and
  official T1/T2 analysis certification was recomputed from unchanged metrics.
- 13 old HTML placeholders and 2 broken third-party links were superseded
  only when an exact same-fund, same-quarter issuer PDF was verified;
  previous references and errors remain retained for audit.
- Strict TOF source policy: only primary issuer bulletins; never ASPIM.
- No missing numeric value is set to 0. No source ambiguity is treated as
  an audited financial value.
- As of preflight: 416 old unresolved HTML references, 40 fetch errors,
  0 full-document financial_complete states. These remain unresolved.

## Release requirements

The release-only GitHub OIDC attestation must validate all 65 analyses and
the absence of unsupported high-risk alerts. Netlify must report a ready
production deploy for the exact main commit SHA. This report only documents
the requested deployment; it does not substitute for either test result.

The existing candidate approval and atomic activation policies are unchanged.
