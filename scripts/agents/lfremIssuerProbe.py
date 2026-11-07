#!/usr/bin/env python3
"""Read-only official La Française REM source acquisition. Never certify finances.

Reuses the existing MaximusSCPI MuPDF issuer audit and independent Poppler
validator; no new queue, OIDC privilege, Supabase write or publication action.
"""
from __future__ import annotations
import argparse
from concurrent.futures import ThreadPoolExecutor
import json
import os
from pathlib import Path
import re
import sys

from candidate_pdf_binary_proof import download_official, independent_poppler
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scpi-onboarding"))
from publisherPdfAudit import audit_document, normalize, official_url

HOSTS = ["doc.la-francaise.com"]
INDEX = "https://client.la-francaise.com/bt"
SCPI_PATTERN = re.compile(r"[a-z0-9-]{2,100}\Z")


def validate_discovery_manifest(manifest):
    docs = manifest.get("documents", [])
    if (manifest.get("issuer") != "La Française REM" or
        manifest.get("reference_url") != INDEX or
        manifest.get("issuer_hosts") != HOSTS or
        manifest.get("financial_certified") is not False or
        manifest.get("deploy_allowed") is not False or
        len(docs) != 14):
        raise ValueError("UNTRUSTED_SOURCE_DISCOVERY_MANIFEST")
    seen = set()
    for doc in docs:
        slug = doc.get("scpi_slug", "")
        url = doc.get("source_url", "")
        expected_period = "2026-T2" if slug == "lf-croissance-et-territoires" else "2026-S1"
        expected_kind = ("quarterly_bulletin" if expected_period == "2026-T2"
                         else "semiannual_bulletin")
        if (not isinstance(slug, str) or not SCPI_PATTERN.fullmatch(slug) or
            slug in seen or not isinstance(doc.get("candidate_name"), str) or
            not doc["candidate_name"].strip() or doc.get("source_period") != expected_period or
            doc.get("document_kind") != expected_kind or
            doc.get("publisher_index_url") != INDEX or
            not official_url(url, HOSTS) or
            not url.startswith("https://doc.la-francaise.com/Documents/")):
            raise ValueError("UNTRUSTED_SOURCE_DISCOVERY_ENTRY")
        seen.add(slug)
    return docs


def exact_fund_identity(text, candidate_name):
    """Prevent Multihabitation 2 from being mistaken for fund 20 or 21."""
    value = normalize(text)
    name = normalize(candidate_name)
    if name.startswith("multihabitation "):
        return bool(re.search(r"\b" + re.escape(name) + r"(?![0-9])", value))
    return name in value or name.replace(" ", "") in value.replace(" ", "")


def safe_error_code(exc):
    code = str(exc).split(":", 1)[0].strip()
    return code if re.fullmatch(r"[A-Z][A-Z0-9_]{3,69}", code) else "ISSUER_BINARY_VERIFICATION_FAILED"


def probe_one(doc, archive_dir, auditor=audit_document, checker=independent_poppler,
              downloader=download_official):
    period = doc["source_period"]
    doc_kind = doc["document_kind"]
    parser_kind = "quarterly" if doc_kind == "quarterly_bulletin" else "semiannual"
    rec = {"scpi_slug": doc["scpi_slug"], "source_period": period,
           "document_kind": doc_kind,
           "publisher_index_url": INDEX, "source_url": doc["source_url"],
           "financial_certified": False, "deploy_allowed": False}
    try:
        result = auditor(
            {"kind": parser_kind, "reference_period": period, "url": doc["source_url"]},
            {"name": doc["candidate_name"], "issuer_hosts": HOSTS},
            fetcher=lambda url: downloader(url, HOSTS))
        assets = result.get("archive_assets") or {}
        pdf = archive_dir / str(assets.get("pdf", ""))
        if not pdf.is_file():
            raise ValueError("PDF_BINARY_ARCHIVE_NOT_WRITTEN")
        count = result.get("page_count")
        if not isinstance(count, int) or count < 1:
            raise ValueError("INVALID_PDF_PAGE_COUNT")
        checker(pdf, doc["candidate_name"], period, doc_kind, count)
        # Both readers have separately verified exact issuer identity/period.
        # Additional fund ID guard protects similarly named Multihabitation funds.
        import fitz
        with fitz.open(pdf) as f:
            opening = " ".join(page.get_text() for page in list(f)[:5])
        if not exact_fund_identity(opening, doc["candidate_name"]):
            raise ValueError("ISSUER_FUND_IDENTITY_NOT_EXACT")
        rec.update(status="binary_pdf_verified_only",
                   pdf_sha256=result["sha256"], page_count=count,
                   final_source_url=result["source_url"],
                   readers=["MuPDF", "Poppler"],
                   identity_verified=True, period_verified=True,
                   issuer_origin_verified=True)
    except Exception as exc:
        code = safe_error_code(exc)
        rec.update(status="blocked", error_code=code,
                   identity_verified=False, period_verified=False)
        # Only the public issuer's short normalized PDF cover; never raw
        # exceptions, HTTP headers, tokens, or untrusted command output.
        if code == "QUARTER_TITLE_UNCONFIRMED":
            cover = str(exc).partition(":")[2]
            rec["publisher_cover_excerpt"] = re.sub(
                r"[^0-9a-zA-Z\s.,;:%()/&-]", " ", cover
            ).strip()[:160]
    return rec


def probe_all(manifest, out):
    docs = validate_discovery_manifest(manifest)
    archive_dir = out / "official-pdf-archive"
    archive_dir.mkdir(parents=True, exist_ok=True)
    os.environ["SCPI_PDF_ARCHIVE_DIR"] = str(archive_dir)
    with ThreadPoolExecutor(max_workers=3) as executor:
        records = list(executor.map(lambda d: probe_one(d, archive_dir), docs))
    verified = sum(x["status"] == "binary_pdf_verified_only" for x in records)
    proof = {
        "run_reference": "github-actions:" + os.environ.get("GITHUB_RUN_ID", "local"),
        "issuer": "La Française REM", "source_period": "mixed_T2_and_S1_2026",
        "periods": ["2026-T2", "2026-S1"],
        "candidate_count": len(records), "binary_verified_count": verified,
        "blocked_count": len(records) - verified,
        "status": "binary_discovery_complete" if verified == len(records) else
                  ("partial_source_discovery" if verified else "no_verified_binaries"),
        "financial_certified": False, "deploy_allowed": False,
        "documents": records,
    }
    (out / "proof.json").write_text(json.dumps(proof, ensure_ascii=False, indent=2) + "\n",
                                   encoding="utf-8")
    for row in records:
        print("LFREM", row["scpi_slug"], row["status"],
              row.get("error_code", ""), flush=True)
    print("LFREM official binary:", verified, "/", len(records),
          "QA not authorized; financial_certified=false", flush=True)
    return proof


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--manifest", type=Path, required=True)
    p.add_argument("--out", type=Path, required=True)
    args = p.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    manifest = json.loads(args.manifest.read_text(encoding="utf-8"))
    proof = probe_all(manifest, args.out)
    if proof["binary_verified_count"] == 0:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
