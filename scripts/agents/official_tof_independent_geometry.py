#!/usr/bin/env python3
"""Independent issuer PDF TOF number-to-period QA using two layout engines.

No database writes, no manually verified labels, no publication. The expected
numeric values are ONLY regression targets: each layout engine independently
locates a printed number in the donut associated with its exact quarter.
Fail closed on multiple/missing labels, ambiguous numbers, wrong bytes or
period. This is separate from the original bulletin crawler's text heuristics.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path
import subprocess
import unicodedata
import xml.etree.ElementTree as ET

import fitz


PINNED = {
    "2026-T1": {
        "sha256": "25d420cf867dabbc2be7c51aec7d0cd5ed6b0250e2081b274cce1fe72f5b5ab3",
        "original_path": "alternative-original-pdfs",
        "expected_tof_percent": 91.78,
        "issuer_url": "https://www.fiducial-gerance.fr/content/download/1334/38495?version=5",
    },
    "2026-T2": {
        "sha256": "2cc87a2cf3536f145bc6db7d71f8cef69190379fa2e2c369ae8052de896c99ba",
        "original_path": "original-pdfs",
        "expected_tof_percent": 91.56,
        "issuer_url": "https://www.fiducial-gerance.fr/content/download/1410/40287?version=4",
    },
}


def normalize(value: str) -> str:
    return "".join(ch for ch in unicodedata.normalize("NFKD", str(value))
                   if not unicodedata.combining(ch)).lower()


def geometry_mupdf(page):
    return [(float(w[0]), float(w[1]), float(w[2]), float(w[3]), str(w[4]))
            for w in page.get_text("words")]


def geometry_poppler(pdf: Path, page_number: int):
    result = subprocess.run(
        ["pdftotext", "-f", str(page_number), "-l", str(page_number),
         "-bbox", str(pdf), "-"],
        capture_output=True, text=True, timeout=60, check=True,
    )
    root = ET.fromstring(result.stdout)
    words = []
    for element in root.iter():
        if not element.tag.endswith("word") or not element.text:
            continue
        words.append((float(element.attrib["xMin"]),
                      float(element.attrib["yMin"]),
                      float(element.attrib["xMax"]),
                      float(element.attrib["yMax"]), element.text))
    return words


def extract_period_bound_tof(words, period):
    """Associate donut-centre number with quarter caption below it by geometry.

    Never use the first nearby 'TOF' percentage, a vacancy legend component,
    or the next/previous quarter's adjacent donut.
    """
    if not re.fullmatch(r"20\d{2}-T[1-4]", period):
        raise ValueError("INVALID_QUARTER_REFERENCE")
    quarter = int(period[-1])
    year = period[:4]
    labels = []
    for x0, y0, x1, _, raw in words:
        if normalize(raw) != "trimestre":
            continue
        before = [v for v in words if abs(v[1] - y0) <= 5 and v[2] <= x0 + 1
                  and 0 <= x0 - v[2] < 45
                  and re.fullmatch(r"\d+(?:er|e|eme)?", normalize(v[4]))]
        after = [v for v in words if abs(v[1] - y0) <= 5 and v[0] >= x1 - 1
                 and 0 <= v[0] - x1 < 30 and v[4] == year]
        if not before or not after:
            continue
        if int(re.match(r"\d+", before[-1][4]).group()) != quarter:
            continue
        labels.append(((before[-1][0] + after[0][2]) / 2, y0))
    if len(labels) != 1:
        raise ValueError("QUARTER_DONUT_CAPTION_AMBIGUOUS")
    x, caption_y = labels[0]
    candidates = []
    for x0, y0, x1, _, raw in words:
        if not re.fullmatch(r"\d{2},\d{2}", raw):
            continue
        number = float(raw.replace(",", "."))
        if not 70 <= number <= 100:
            continue
        if abs((x0 + x1) / 2 - x) > 75 or not 25 < caption_y - y0 < 150:
            continue
        candidates.append((round(number, 2), [round((x0 + x1) / 2, 2),
                                             round(y0, 2)]))
    if len(candidates) != 1:
        raise ValueError("TOF_DONUT_CENTER_VALUE_AMBIGUOUS")
    value, position = candidates[0]
    return {"value_percent": value, "page": 4,
            "caption_quarter": period, "value_position": position,
            "caption_center_x": round(x, 2),
            "distinct_from_vacancy_legend": True}


def validate_cover(mupdf_cover, poppler_cover, period):
    for text in (mupdf_cover, poppler_cover):
        normalized = normalize(text[:2200])
        if "buroboutic" not in normalized:
            raise ValueError("BULLETIN_FUND_NOT_CONFIRMED")
        if "bulletin trimestriel" not in normalized:
            raise ValueError("ISSUER_QUARTERLY_BULLETIN_NOT_CONFIRMED")
        if not (re.search(r"\b2026\s*[-–]?\s*t" + period[-1] + r"\b",
                          normalized)
                or re.search(r"\b" + period[-1] +
                             r"(?:er|e|eme)?\s+trimestre\s+2026\b", normalized)):
            raise ValueError("BULLETIN_COVER_PERIOD_NOT_CONFIRMED")


def verify_one(path, period):
    cfg = PINNED[period]
    if not path.is_file():
        raise ValueError("OFFICIAL_ISSUER_BINARY_NOT_ARCHIVED")
    raw = path.read_bytes()
    sha = hashlib.sha256(raw).hexdigest()
    if sha != cfg["sha256"]:
        raise ValueError("OFFICIAL_ISSUER_SHA_DIFFERS")
    with fitz.open(stream=raw, filetype="pdf") as doc:
        if doc.needs_pass or len(doc) != 6:
            raise ValueError("BULLETIN_PAGES_NOT_EXPECTED")
        mupdf_cover = doc[0].get_text("text")
        mupdf_page = doc[3].get_text("text")
        mu = extract_period_bound_tof(geometry_mupdf(doc[3]), period)
    poppler_cover = subprocess.run(
        ["pdftotext", "-f", "1", "-l", "1", str(path), "-"],
        capture_output=True, text=True, timeout=60, check=True
    ).stdout
    poppler_page = subprocess.run(
        ["pdftotext", "-f", "4", "-l", "4", str(path), "-"],
        capture_output=True, text=True, timeout=60, check=True
    ).stdout
    validate_cover(mupdf_cover, poppler_cover, period)
    if ("occupation financier" not in normalize(mupdf_page)
        or "occupation financier" not in normalize(poppler_page)):
        raise ValueError("OFFICIAL_TOF_CHART_CAPTION_MISSING")
    po = extract_period_bound_tof(geometry_poppler(path, 4), period)
    if mu["value_percent"] != po["value_percent"]:
        raise ValueError("INDEPENDENT_ENGINES_DISAGREE_ON_CURRENT_QUARTER")
    if mu["value_percent"] != cfg["expected_tof_percent"]:
        raise ValueError("SOURCED_TOF_VALUE_DIFFERS_FROM_AUDIT_TARGET")
    return {
        "status": "independent_geometric_qa_pass",
        "scpi_slug": "buroboutic-metropoles",
        "period": period,
        "metric": "tof",
        "value_percent": mu["value_percent"],
        "original_issuer_url": cfg["issuer_url"],
        "sha256": sha,
        "source_page": 4,
        "readers": ["MuPDF-geometry", "Poppler-bbox"],
        "mupdf_geometry": mu,
        "poppler_geometry": po,
        "financial_certified": False,
        "human_attestation": False,
        "deploy_allowed": False,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--archive-root", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    args.out.parent.mkdir(parents=True, exist_ok=True)
    outcome = {"status": "independent_source_page_numeric_review",
               "financial_certified": False, "deploy_allowed": False,
               "human_attestation": False, "records": []}
    for period, cfg in PINNED.items():
        path = args.archive_root / cfg["original_path"] / (cfg["sha256"] + ".pdf")
        try:
            proof = verify_one(path, period)
            outcome["records"].append(proof)
            print("TOF_INDEPENDENT_LAYOUT_QA",period,"PASS",
                  proof["value_percent"],"source_page=4",flush=True)
        except Exception as exc:
            code = str(exc).split(":", 1)[0]
            if not re.fullmatch(r"[A-Z][A-Z0-9_]{3,70}", code):
                code = "INDEPENDENT_TOF_QA_FAILED"
            outcome["records"].append(
                {"period":period,"status":"blocked","error_code":code,
                 "financial_certified":False,"deploy_allowed":False})
            print("TOF_INDEPENDENT_LAYOUT_QA",period,"BLOCKED",code,flush=True)
    args.out.write_text(json.dumps(outcome,ensure_ascii=False,indent=2)+"\n",
                        encoding="utf-8")
    if any(r["status"]!="independent_geometric_qa_pass"
           for r in outcome["records"]):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
