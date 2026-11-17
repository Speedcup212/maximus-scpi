#!/usr/bin/env python3
"""Read-only 10-SCPI independent finance pilot (MuPDF + Poppler).
An exact official binary + a value near a field label is a candidate, NOT a
financial attestation. No database writes, no financial certifications.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
import unicodedata
import fitz

from geometry_review import analyze_geometry,pdf_words_mupdf,pdf_words_poppler

FIELD_LABELS = {
    "tof": r"(?:\btaux\s+d.?\s*occupation\s+financier(?:e)?\b|\btof\b)",
    "top": r"(?:\btaux\s+d.?\s*occupation\s+physique\b|\btop\b)",
    "capitalisation": r"\bcapitalisation\b",
    "valeur_realisation": r"\bvaleur\s+de\s+realisation\b",
    "prix_reconstitution": r"\b(?:valeur|prix)\s+de\s+reconstitution\b",
}
# Numbers with a French thousands separator OR a simple decimal number.
NUMBER = re.compile(r"(?<![\w])(?:\d{1,3}(?:[\u00a0\u202f ,.]\d{3})+(?:[.,]\d+)?|\d{1,8}(?:[.,]\d+)?)(?![\w])")


def normalize(s):
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    return s.lower().replace("\u00a0", " ").replace("\u202f", " ")


def as_number(s):
    text = s.strip().replace("\u00a0", "").replace("\u202f", "").replace(" ", "")
    if text.count(",") and text.count("."):
        if text.rfind(",") > text.rfind("."):
            text = text.replace(".", "").replace(",", ".")
        else:
            text = text.replace(",", "")
    elif "," in text:
        text = text.replace(",", ".")
    elif "." in text and len(text.split(".")[-1]) == 3:
        text = text.replace(".", "")
    try:
        return float(text)
    except ValueError:
        return None


def candidate_pages(pages, field, baseline):
    rx = re.compile(FIELD_LABELS[field], re.I)
    results = []
    for i, original in enumerate(pages):
        text = normalize(original)
        for m in list(rx.finditer(text))[:30]:
            # The value must appear locally around the field label, not just
            # anywhere on the same page. Contexts are diagnostic, not signoff.
            start = max(0, m.start() - 65)
            end = min(len(text), m.end() + 135)
            context = text[start:end].replace("\n", " ")
            context = re.sub(r"\s+", " ", context).strip()
            values = [v for tok in NUMBER.findall(context)
                      if (v := as_number(tok)) is not None]
            tolerance = max(0.02, abs(float(baseline)) * 0.0015)
            if any(abs(v - float(baseline)) <= tolerance for v in values):
                results.append({
                    "page": i + 1, "context": context[:170],
                    "tolerance": tolerance
                })
    # Never flood the report or silently certify ambiguous multiple matches.
    return results[:10]


def run(manifest, proof, proof_root):
    slug = manifest.get("candidate_slug")
    expected = manifest["documents"][0]
    result = {
        "scpi_slug": slug, "period": expected["source_period"],
        "source_sha256": expected["pdf_sha256"],
        "source_status": "BLOCKED", "metrics": {},
        "financial_certified": False, "deploy_allowed": False,
        "financial_qa_decision": "REVIEW_REQUIRED",
        "independent_engines": ["MuPDF", "Poppler"]
    }
    if (proof.get("status") != "verified" or
            proof.get("candidate_slug") != slug or
            len(proof.get("documents", [])) != 1 or
            proof["documents"][0].get("status") != "verified"):
        result["reason"] = "ORIGINAL_PDF_SHA_IDENTITY_PERIOD_NOT_VERIFIED"
        result["source_details"] = proof.get("documents", [])[:1]
        return result
    pdfs = list((proof_root / "official-pdf-archive").glob("*.pdf"))
    if len(pdfs) != 1:
        result["reason"] = "ORIGINAL_PDF_ARCHIVE_NOT_UNIQUE"
        return result
    pdfpath = pdfs[0]
    actual = hashlib.sha256(pdfpath.read_bytes()).hexdigest()
    if actual != expected["pdf_sha256"]:
        result["reason"] = "LOCAL_ORIGINAL_SHA_DISAGREES"
        return result
    with fitz.open(pdfpath) as pdf:
        mupdf = [page.get_text(sort=True) for page in pdf]
        if len(pdf) != expected["page_count"]:
            result["reason"] = "MUPDF_PAGE_COUNT_DISAGREEMENT"
            return result
    pop = subprocess.run(["pdftotext", "-layout", str(pdfpath), "-"],
                         capture_output=True, text=True, timeout=35)
    if pop.returncode:
        result["reason"] = "POPPLER_EXTRACTION_FAILED"
        return result
    poppler = pop.stdout.split("\f")
    if poppler and not poppler[-1].strip():
        poppler.pop()
    if len(poppler) != len(mupdf):
        result["reason"] = "READER_PAGE_COUNT_DISAGREEMENT"
        return result
    result["source_status"] = "VERIFIED_TWO_READERS"
    result["page_count"] = len(mupdf)
    result["source_binary_sha_verified"] = True
    baseline_metrics = manifest.get("baseline_metrics") or {}
    if not baseline_metrics:
        result["reason"] = "NO_UPSTREAM_EXTRACTED_METRIC_TO_CONFRONT"
        return result
    # Structural numeric QA: both *independent* engines must locate the same
    # value near the same financial field in compatible page coordinates.
    # This remains candidate evidence and never a financial certification.
    geo_mupdf=pdf_words_mupdf(pdfpath)
    geo_poppler=pdf_words_poppler(pdfpath)
    geometry_count=0
    dual_count = 0
    for field, baseline in baseline_metrics.items():
        if field not in FIELD_LABELS or not isinstance(baseline, (int, float)):
            result["metrics"][field] = {"status": "UNSUPPORTED_FIELD"}
            continue
        a = candidate_pages(mupdf, field, baseline)
        b = candidate_pages(poppler, field, baseline)
        pages_a = {x["page"] for x in a}
        pages_b = {x["page"] for x in b}
        overlap = sorted(pages_a & pages_b)
        status = "DUAL_READER_CONTEXT_MATCH" if overlap else "NEEDS_SEMANTIC_REVIEW"
        dual_count += bool(overlap)
        geom=analyze_geometry(pdfpath,field,baseline,geo_mupdf,geo_poppler)
        geometry_count+=bool(geom.get("same_page_coordinates_verified"))
        result["metrics"][field] = {
            "geometry":geom,
            "baseline_value_from_replay": baseline,
            "status": status,
            "matching_pages_both_engines": overlap,
            "mupdf_contexts": a[:2],
            "poppler_contexts": b[:2],
            "semantic_qa_certified": False,
        }
    result["dual_geometry_candidates"] = geometry_count
    result["dual_context_candidates"] = dual_count
    result["metrics_tested"] = len(baseline_metrics)
    # Deliberately do not turn a textual match into a numeric certification.
    return result


def main():
    p = argparse.ArgumentParser()
    for arg in ("manifest", "proof", "proof-root", "out"):
        p.add_argument("--" + arg, required=True)
    a = p.parse_args()
    manifest = json.loads(Path(a.manifest).read_text())
    proof = json.loads(Path(a.proof).read_text())
    result = run(manifest, proof, Path(a.proof_root))
    Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    Path(a.out).write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    print("PILOT10", result["scpi_slug"], result["source_status"],
          "context_candidates", result.get("dual_context_candidates", 0),
          "of", result.get("metrics_tested", 0),
          "geometric_candidates",result.get("dual_geometry_candidates",0),
          "reason", result.get("reason", ""),
          "FINANCIAL_CERTIFIED=false")
    for field, m in result["metrics"].items():
        print("METRIC", field, m.get("status"), m.get("matching_pages_both_engines", []))


if __name__ == "__main__":
    main()
