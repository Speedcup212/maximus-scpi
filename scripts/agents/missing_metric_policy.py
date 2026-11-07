"""RECOVERY-175: fail-closed availability triage for issuer PDF metric extraction.

A field not detected by two PDF readers is NOT evidence that a fund manager
did not disclose it. Source-level NOT_DISCLOSED / NOT_APPLICABLE attestations
must come from separate, dated, official certificates, never this parser.
This module does not promote any SCPI to PASS_100 or change financial values.
"""
from __future__ import annotations

VERSION = "missing-metric-evidence-v1"
VERIFIED = "VERIFIED"
UNVERIFIED_ABSENCE = "UNVERIFIED_ABSENCE"
UNRESOLVED = "UNRESOLVED"
CONFLICT = "CONFLICT"
SOURCE_UNAVAILABLE = "SOURCE_UNAVAILABLE"


def classify_fields(coverage, metrics, evidence, *, processing_complete,
                    identity_verified, period_verified, hash_changed=False):
    if not isinstance(coverage, dict) or not isinstance(metrics, dict) or not isinstance(evidence, dict):
        raise ValueError("Invalid PDF field assessment")
    source_usable = (
        processing_complete is True
        and identity_verified is True
        and period_verified is True
        and hash_changed is False
    )
    decisions = {}
    for field, parser_status in coverage.items():
        if not isinstance(field, str) or not isinstance(parser_status, str):
            raise ValueError("Invalid PDF field status")
        if not source_usable:
            status, reason = SOURCE_UNAVAILABLE, "source_identity_period_or_full_read_unconfirmed"
        elif parser_status == "parser_disagreement":
            status, reason = CONFLICT, "independent_pdf_parsers_disagree"
        elif parser_status == "verified":
            proof = evidence.get(field)
            valid = (field in metrics and isinstance(proof, dict)
                     and proof.get("independent_engines") == ["MuPDF", "Poppler"]
                     and isinstance(proof.get("page"), int) and proof["page"] > 0
                     and proof.get("value") is not None)
            status, reason = (
                (VERIFIED, "dual_pdf_proof_available") if valid
                else (UNRESOLVED, "parser_verified_label_but_proof_incomplete")
            )
        elif parser_status == "not_found_after_full_read":
            status, reason = UNVERIFIED_ABSENCE, "not_detected_is_not_official_non_disclosure"
        else:
            status, reason = UNRESOLVED, "field_requires_source_or_extraction_review"
        decisions[field] = {
            "status": status,
            "reason": reason,
            "blocks_automatic_certification": status != VERIFIED,
        }
    return decisions
