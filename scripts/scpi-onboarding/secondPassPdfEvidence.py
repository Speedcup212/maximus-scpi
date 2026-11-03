#!/usr/bin/env python3
"""Second-pass, source-preserving financial evidence check. No database mutation,
human sign-off, legal approval or publication is implied by this report."""
import argparse
import hashlib
import json
import re
import sys
import unicodedata
from pathlib import Path
from urllib.parse import urlparse

import fitz

HEX = re.compile(r"^[a-f0-9]{64}$")
ISSUER = {"www.sofidy.com", "sofidy.com"}
MAX_SIZE = 16_000_000
ALLOWED_METHODS = {
    "native_text_and_visual_page_secondary_review",
    "visual_page_render_secondary_review",
}

def normalized(s):
    value = unicodedata.normalize("NFKD", str(s or ""))
    value = "".join(c for c in value if not unicodedata.combining(c))
    return " ".join(re.findall(r"[a-z0-9]+", value.lower()))

def numeric_forms(value):
    raw = format(value, "f") if isinstance(value, float) else str(value)
    if "." in raw:
        raw = raw.rstrip("0").rstrip(".")
    forms = {raw, raw.replace(".", ",")}
    if raw.isdigit():
        forms.add(f"{int(raw):,}".replace(",", " "))
        forms.add(f"{int(raw):,}".replace(",", "\u00a0"))
    return forms

def number_in_text(value, text):
    # No approximate matches; number boundaries prevent 5 -> 55 false positives.
    return any(re.search(r"(?<!\d)" + re.escape(x) + r"(?!\d)", text) for x in numeric_forms(value))

def validate(manifest, archive_dir):
    rows = manifest.get("rows") or []
    failures = []
    audit_rows = []
    if manifest.get("schema_version") != 1 or manifest.get("candidate_slug") != "sofidynamic" or len(rows) != 29:
        failures.append("MANIFEST_IDENTITY_OR_COUNT_INVALID")
    if manifest.get("publication_authorized") is not False or manifest.get("qa_is_regulatory_signoff") is not False:
        failures.append("INVALID_PREMATURE_RELEASE_CLAIM")
    seen = set()
    cache = {}
    periods = {}
    for r in rows:
        key = (r.get("period"), r.get("document_kind"), r.get("metric"))
        errors = []
        if key in seen: errors.append("DUPLICATE_METRIC")
        seen.add(key)
        if r.get("qa_before") != "pending_independent_qa": errors.append("UNTRUSTED_SOURCE_QA_TRANSITION")
        sha, page = r.get("pdf_sha256", ""), r.get("source_page")
        url = r.get("source_url", "")
        parsed = urlparse(url)
        if not HEX.fullmatch(sha) or parsed.scheme != "https" or parsed.hostname not in ISSUER or parsed.username or parsed.password:
            errors.append("UNTRUSTED_SOURCE_OR_SHA")
        if not isinstance(page, int) or page < 1: errors.append("INVALID_SOURCE_PAGE")
        if r.get("verification_method") not in ALLOWED_METHODS: errors.append("INVALID_REVIEW_METHOD")
        if not isinstance(r.get("semantic_anchor"), str) or len(r["semantic_anchor"]) < 5:
            errors.append("MISSING_SEMANTIC_ANCHOR")
        if sha not in cache and not errors:
            f = archive_dir / (sha + ".pdf")
            if not f.is_file() or f.stat().st_size > MAX_SIZE or f.stat().st_size < 800:
                errors.append("SOURCE_PDF_MISSING_OR_INVALID_SIZE")
            else:
                raw = f.read_bytes()
                if hashlib.sha256(raw).hexdigest() != sha or not raw.startswith(b"%PDF"):
                    errors.append("SOURCE_SHA_MISMATCH")
                else:
                    doc = fitz.open(stream=raw, filetype="pdf")
                    cache[sha] = doc
        doc = cache.get(sha)
        if doc and isinstance(page, int) and not (1 <= page <= len(doc)):
            errors.append("SOURCE_PAGE_OUTSIDE_PDF")
        if doc and not errors:
            native = doc[page - 1].get_text(sort=True)
            if normalized(r["semantic_anchor"]) not in normalized(native):
                errors.append("PAGE_SEMANTIC_ANCHOR_NOT_FOUND")
            if r["verification_method"] == "visual_page_render_secondary_review":
                # Native PDF text omits the 97.73% figure: screenshot reviewed separately.
                render_sha = hashlib.sha256(doc[page-1].get_pixmap(
                    matrix=fitz.Matrix(1.4, 1.4)).tobytes("png")).hexdigest()
                if render_sha != r.get("reviewed_render_png_sha256") or r.get("manual_graphic_value_checked") is not True:
                    errors.append("VISUAL_EVIDENCE_DIGEST_OR_REVIEW_MISSING")
            elif not number_in_text(r.get("value"), native):
                errors.append("NUMERIC_VALUE_NOT_FOUND_ON_PAGE")
        periods[key[0]] = periods.get(key[0], 0) + 1
        audit_rows.append({"key":"|".join(str(x) for x in key),
            "sha256":sha,"page":page,"value":r.get("value"),"unit":r.get("unit"),
            "status":"SECOND_PASS_SOURCE_MATCH" if not errors else "BLOCKED","errors":errors})
        failures.extend(["|".join(str(x) for x in key)+":"+e for e in errors])
    if periods != {"2025-RA":4,"2026-T1":8,"2026-T2":17}:
        failures.append("PERIOD_COVERAGE_NOT_COMPLETE")
    for doc in cache.values(): doc.close()
    return {"mode":"reproducible_second_pass_not_human_signature",
            "scpi_slug":manifest.get("candidate_slug"),
            "status":"SOURCE_EVIDENCE_PASS_ONLY" if not failures else "BLOCKED",
            "files_verified":len(cache),"fields_checked":len(audit_rows),
            "per_period":periods,"problems":failures,"fields":audit_rows,
            "financial_qa_automatically_approved":False,"regulatory_statutes_certified":False,
            "publication_authorized":False}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest",required=True)
    parser.add_argument("--archive-dir",required=True)
    parser.add_argument("--report",required=True)
    args = parser.parse_args()
    report = validate(json.loads(Path(args.manifest).read_text(encoding="utf8")),
                      Path(args.archive_dir))
    dest=Path(args.report)
    dest.parent.mkdir(parents=True,exist_ok=True)
    dest.write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
    print(json.dumps({k:report[k] for k in
        ["status","fields_checked","files_verified","per_period","problems"]},ensure_ascii=False))
    if report["status"] != "SOURCE_EVIDENCE_PASS_ONLY": sys.exit(1)

if __name__ == "__main__": main()
