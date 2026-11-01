# Universal SCPI publication contract (v1)

Scope: all existing and future SCPI, including CORUM, Accès Valeur Pierre and Accimmo Pierre. No issuer-specific or quarter-specific release gate.

## State machine
discovered -> sourced -> extracted -> independently_verified -> staged -> integration_tested -> approved -> published -> monitored.
A failed mandatory gate leaves the candidate unpublished; an already published cohort is never replaced by a partial snapshot.

## Mandatory gates
1. Official issuer documents: original URL, downloaded PDF SHA-256, period, pages and effective observation date.
2. Every published financial metric: value, unit, source page, date and extraction confidence; independent review signature for ambiguous or high-risk items. Never infer an exact TOF from an inequality.
3. Missing values: distinguish OFFICIALLY_ABSENT, LAST_OFFICIAL_VALUE (with historical date), and EXTRACTION_FAILED. The first two are permitted with transparent presentation; the last is a blocker for required fields.
4. Reconcile price, withdrawal price, debt, liquidity, distributions, capitalization and historical data; unresolved contradictions block affected derived comparisons and mandatory certification.
5. Stage scpi_indicators, scpi_indicator_history and scpi_bulletin_analysis coherently; verify identities and cohort count from certified_scpi_cohort.json, not hardcoded 66.
6. Run CI, Chromium desktop/mobile and all public surfaces: detail, comparison, trajectory, radar, simulators, SEO and client view.
7. Require documented independent QA and authorized approval. Promotion is atomic with versioned snapshot, immutable evidence and rollback on failed smoke test.
8. Monitor post-release integrity and alert on source changes or regressions.

## BNP candidates 67/68
Accès Valeur Pierre and Accimmo Pierre remain disabled until T3 2026 independent QA, financial/liquidity audit, cross-surface tests and authorized release. For Accès Valeur Pierre, T2 TOF conflict (87.07% vs 85.49%) must not produce a fabricated trend. For Accimmo Pierre, distinguish redemption fund price EUR 98.50 from standard withdrawal price EUR 128.41.

## Acceptance criteria
- No CORUM/T2 hardcoding in candidate or final-release functions.
- Idempotent repeatable pipeline for any SCPI and period.
- CI proves an uncertified candidate cannot join public cohort.
- Exactly 66 active SCPI until independently verified and approved 68-member cohort is published.
- Evidence and final public URL checks recorded for each release.

This file specifies requirements; it does not claim the runtime pipeline has been migrated or that either BNP candidate is certified.

## Separate automated certification from publication approval
Automated evidence verification may produce a machine-readable PASS for official-source identity, numeric reconciliations, financial coverage, historical integrity, private staging and browser acceptance. A machine PASS is not a human signature. Keep independent reviews and accountable release authorization as distinct gates until an authorized policy explicitly changes them. The release controller must not manufacture reviewer identities or promote a candidate merely because automated checks pass. All publication writes remain atomic and fail closed.

## Standing owner delegation (2026-11-01)
The owner delegates routine per-SCPI release decisions after all technical, financial, documentary, independent QA and browser gates have passed. Do not require a new personal approval from the owner for each candidate. The release service may record the standing delegation as authorization provenance, with its own service identity and immutable audit trail; never impersonate the owner or an independent reviewer. Keep independent financial/technical review and genuine operational release attestations separate. A failed mandatory check prevents publication.
