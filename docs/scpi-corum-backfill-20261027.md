# RECOVERY-027 — CORUM document ingestion, 27 October 2026

## Verified result

`scpi_chantier_health`: PASS 65, FAIL 0, operational readiness 65, PARTIAL 0, BACKFILL_REQUIRED 0. Readiness SQL definition unchanged. No TOF, confidence or ingestion guardrail alert introduced.

**This does not mean that every historical PDF is financially complete.** The separate `scpi_operational_status` view still reports INCOMPLETE for Origin, XL and Eurion because 36 older quarterly documents remain in QA. USA is DONE. No queue item has been marked not-applicable merely because extraction failed.

| Fund | Official URL candidates downloaded | Distinct PDF hashes | Quarterly cores financially certified | Annual PDFs source-verified | History observations before → after | Remaining archive reviews |
|---|---:|---:|---:|---:|---:|---:|
| corum-eurion | 35 | 34 | 22 | 7 | 2 → 22 | 5 |
| corum-origin | 71 | 69 | 29 | 14 | 2 → 29 | 26 |
| corum-usa | 10 | 9 | 8 | 1 | 2 → 8 | 0 |
| corum-xl | 43 | 42 | 28 | 9 | 2 → 28 | 5 |

Quarterly core certification covers TOF, total shares and explicit pending withdrawal shares only. Annual source verification is not a whole-report financial certification. The existing annual financial core remains 30 exercises / 90 values (Origin 14, XL 9, Eurion 6, USA 1). First fiscal close of USA remains 2025; no annual 2024 observation is invented.

## Implementation

- Official CORUM index discovery, historical aliases, PDF signature/size, issuer identity and actual cover period checks.
- MuPDF + Poppler geometry, exact dated columns, separate quarterly versus annual TOF captions; no period inferred from upload-directory dates.
- Four concurrent PDF readers; atomic PDF cache writes and SHA-bound OCR cache. Actual Tesseract fallback for scanned/malformed cover text.
- Private `maximus_agents.scpi_corum_document_runs` retains hashes, periods, per-page proofs, candidate values, OCR text and unresolved errors. It is not readable by anon/authenticated.
- Service-only transactional RPC, period locks, unique period history, SHA deduplication, conflicting-value rejection and preservation of previous verified evidence on retries.
- Existing financial certifications are reusable only if all three core fields match the exact PDF hash, exact period, source URL, source pages and stored history values. OCR is never falsely represented as two native extractions.
- Dedicated `corum_dual_pdf_v1` driver; generic bulletin watch v95 and generic backfill exclude these four funds. Automation enabled only after tests. Other 61 funds retain their generic drivers.
- GitHub OIDC: issuer, audience, repository id, exact workflow, branch and event verified. No GitHub service-role secret required. Daily cron `37 5 * * *` UTC; no email sent.

## Tests and production evidence

16 adversarial Python tests (including an actual image-only PDF/Tesseract), 16 existing targeted regression tests, transactional SQL idempotence/deduplication/financial-contradiction/access/regression checks. Full GitHub build and browser checks passed for prior reviewed commit 1161f78 and 9b8ff70. Consult PR #212 for the final exact-head run before merging.

Actual successful ingestion run: https://github.com/Speedcup212/maximus-scpi/actions/runs/40465587642 (157 documents; OIDC). Artifact 12715993390, SHA-256 fbe4690f9bf842a998b11cbc06bbe5e153eadbb86cde46594df512d5234df875. The first service-key based attempt failed before writing and was replaced by OIDC.

Supabase deployments: bulletin-watch v95; scpi-corum-document-oidc v3. No frontend changes or Netlify release needed: the mounted trajectory/client consumers query the public Supabase history/liquidity/readiness views. Public API reads verified; all four live routes returned HTTP 200. Current Netlify deploy checked: 6ad79a74d6644a7cbafcf787, commit ae7d2f5934ee2c12e7956de97c81d3a2d5005204.

Kyaneos Pierre was already PARTIAL before this intervention. Three officially nil withdrawal queues (2025-T3, 2025-T4, 2026-T1) were reconciled from exact issuer table columns and rendered pages, following the already certified T2 2026 convention. Compensated withdrawals are not confused with shares pending exit.

Grand Paris Résidentiels remains READY_LOW_FREQUENCY. Patrimmo Croissance Impact remains READY_SPECIAL_STRUCTURE with TOF not applicable. Edissimo and Rivoli retain their dynamic official Amundi connectors.

## Remaining documentary limits

The full per-document evidence, URLs, SHA-256, candidate values and missing-field reasons are in `data-import/corum_document_audit_20261027.json` and the private document log. Some old layouts still require a specialised parser or a source review. Absence from current official archive listings is not asserted to mean that no document was ever published.

Official Eurion T4 2022 reports 100.72% TOF (physical PDF page 4). The existing safe range is not relaxed or clamped to make it pass. Comparable historical definition/period review is required; raw official values must remain traceable.

No claim of exhaustive financial certification of all archive PDFs is made. Source error counters outside CORUM already existed (1 source error, 2 sources not verified/high); they are unchanged and distinct from zero new financial QA/TOF/confidence/guardrail alerts.
