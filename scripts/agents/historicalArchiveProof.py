#!/usr/bin/env python3
"""RECOVERY-186: independent two-reader forensic QA of the ORIGINAL archived PDF.
Never promotes an archival copy to a new publisher download or a financial PASS.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import re
from pathlib import Path
import sys

import fitz
from candidate_pdf_binary_proof import validate_manifest, independent_poppler
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scpi-onboarding"))
from publisherPdfAudit import normalize

TOF_LABEL = re.compile(r"taux d.?occupation financier|\btof\b", re.IGNORECASE)


def inspect_archive(manifest: dict, pdf_path: Path) -> dict:
    valid = validate_manifest(manifest)
    if valid is None or len(valid["documents"]) != 1:
        raise ValueError("ARCHIVE_MANIFEST_NOT_SINGLE_SOURCE")
    doc = valid["documents"][0]
    data = pdf_path.read_bytes()
    if len(data) < 1024 or not data.startswith(b"%PDF"):
        raise ValueError("ARCHIVE_NOT_PDF_BYTES")
    actual = hashlib.sha256(data).hexdigest()
    if actual != doc["pdf_sha256"]:
        raise ValueError("ARCHIVE_SHA256_MISMATCH")
    pdf = fitz.open(stream=data, filetype="pdf")
    try:
        if len(pdf) != doc["page_count"]:
            raise ValueError("ARCHIVE_PAGE_COUNT_MISMATCH")
        pages = [p.get_text(sort=True) for p in pdf]
    finally:
        pdf.close()
    if not any(normalize(valid["candidate_name"]) in normalize(x) for x in pages):
        raise ValueError("ARCHIVE_FUND_IDENTITY_NOT_FOUND")
    independent_poppler(pdf_path, valid["candidate_name"], doc["source_period"],
                        doc["document_kind"], doc["page_count"])
    candidates = []
    for index, page in enumerate(pages):
        for match in list(TOF_LABEL.finditer(page))[:5]:
            excerpt = re.sub(r"\s+", " ", page[max(0, match.start()-90):match.end()+180])
            candidates.append({"source_page": index+1, "context": excerpt[:250]})
    return {
        "status": "verified", "source_url": doc["source_url"],
        "source_period": doc["source_period"],
        "document_kind": doc["document_kind"],
        "pdf_sha256": actual,
        "page_count": doc["page_count"],
        "reader_engines": ["MuPDF", "Poppler"],
        "origin": "archive_original_binary",
        "binary_hash_matches_registered": True,
        "identity_verified": True, "period_verified": True,
        "archive_integrity_verified": True,
        "publisher_live_verified": False,
        "tof_context_candidates": candidates[:14],
        "financial_certified": False,
    }


def run(manifest: dict, pdf_path: Path) -> dict:
    slug = manifest.get("candidate_slug")
    doc = manifest.get("documents", [{}])[0]
    try:
        proof = inspect_archive(manifest, pdf_path)
        return {"status": "verified", "candidate_slug": slug,
                "documents": [proof], "financial_certified": False,
                "deploy_allowed": False}
    except Exception as exc:
        code = str(exc).split(":", 1)[0][:70]
        if not re.fullmatch(r"[A-Z][A-Z0-9_]{3,69}", code):
            code = "ARCHIVE_BINARY_REVIEW_FAILED"
        return {"status": "blocked", "candidate_slug": slug,
                "documents": [{"status": "blocked",
                               "source_url": doc.get("source_url"),
                               "source_period": doc.get("source_period"),
                               "expected_sha256": doc.get("pdf_sha256"),
                               "error_code": code,
                               "origin": "archive_original_binary",
                               "financial_certified": False}],
                "financial_certified": False, "deploy_allowed": False}


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--manifest", type=Path, required=True)
    p.add_argument("--pdf", type=Path, required=True)
    p.add_argument("--out", type=Path, required=True)
    args = p.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    r = run(json.loads(args.manifest.read_text()), args.pdf)
    (args.out / "proof.json").write_text(json.dumps(r, ensure_ascii=False))
    print("HISTORICAL_ARCHIVE_PDF_PROOF status=" + r["status"] +
          " financially_certified=false")
    if r["status"] != "verified":
        sys.exit(1)


if __name__ == "__main__":
    main()
