#!/usr/bin/env python3
"""RECOVERY-199: source-only per-page financial evidence, NEVER approval.

Fetches exact issuer PDF originals via verified TLS, checks the pre-registered
SHA256 and two independent PDF readers, then detects proposed metric numbers
on the ORIGINAL physical page. Uncertain layout goes to independent visual QA.
No Supabase writes, no financial qa_pass, and no public site publication.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import re
import subprocess
import sys
import tempfile
import unicodedata
from decimal import Decimal
from pathlib import Path

import fitz

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import candidate_pdf_binary_proof as independent
import publisher_family_proof as publisher

LABELS = {
    "prix_souscription": ("prix de souscription", "prix actuel de la part"),
    "taux_distribution": ("taux de distribution",),
    "tof": ("taux d occupation financier", "taux d'occupation financier"),
    "valeur_realisation_par_part": ("valeur de realisation", "valeur de réalisation"),
    "valeur_reconstitution_par_part": ("valeur de reconstitution",),
    "nombre_parts": ("nombre de parts", "parts sociales"),
    "nombre_associes": ("nombre d associes", "nombre d'associés"),
    "dividende_global_par_part": ("dividende global",),
    "dividende_verse_par_part": ("dividende",),
    "tof_quarterly": ("taux d occupation financier", "tof 2t26"),
    "capitalisation": ("capitalisation",),
    "nombre_immeubles": ("nombre d immeubles", "nombre immeubles"),
    "prix_retrait": ("prix de retrait",),
    "parts_attente_retrait": ("parts en attente",),
    "distribution_brute_par_part": ("acompte du trimestre", "acompte trimestriel", "distribution de l exercice"),
}

DISCOVERY_TERMS = [
    "capitalisation", "prix de souscription", "prix de retrait",
    "valeur de reconstitution", "valeur de realisation", "valeur de réalisation",
    "taux d occupation", "taux d'occupation", "tof", "dividende",
    "distribution", "nombre de parts", "associés", "associés",
    "parts en attente", "retrait", "endettement",
    "collecte nette", "taux d'endettement", "locataires"
]

def flat(value):
    v = unicodedata.normalize("NFKC", value).lower()
    v = v.replace("\u00a0", " ").replace("\u202f", " ").replace("’", " ").replace("‘", " ").replace("\u0027", " ")
    v = unicodedata.normalize("NFD", v)
    v = "".join(c for c in v if unicodedata.category(c) != "Mn")
    return re.sub(r"\s+", " ", v).strip()

def number_regex(number):
    decimal = Decimal(str(number))
    if decimal.is_signed():
        raise ValueError("NEGATIVE_VALUE_REVIEW_REQUIRED")
    if decimal == decimal.to_integral_value():
        digits = str(int(decimal))
        variants = [re.escape(digits)]
        if len(digits) > 3:
            first = len(digits) % 3 or 3
            groups = [digits[:first]]
            groups.extend(digits[i:i+3] for i in range(first, len(digits),3))
            variants.append(r"[\s,.]".join(map(re.escape,groups)))
        return re.compile(r"(?<![0-9])(?:"+"|".join(variants)+r")(?![0-9])")
    normalized = format(decimal, "f").rstrip("0").rstrip(".")
    whole, fract = normalized.split(".")
    return re.compile(r"(?<![0-9])"+re.escape(whole)+r"[,.]"+re.escape(fract)+r"0*(?![0-9])")

def read_page_poppler(path, page_num):
    run = subprocess.run(
        ["pdftotext", "-f", str(page_num), "-l", str(page_num),
         "-layout", str(path), "-"],
        capture_output=True, text=True, timeout=35, check=False)
    if run.returncode != 0 or len(run.stdout.strip()) < 80:
        raise ValueError("POPPLER_PAGE_TEXT_MISSING")
    return run.stdout

def validate_manifest(manifest, slug):
    if not isinstance(manifest, dict) or manifest.get("schema_version") != 1:
        raise ValueError("INVALID_REVIEW_MANIFEST")
    if manifest.get("publisher") != "Sofidy" or manifest.get("financial_qa_autoapprove") is not False:
        raise ValueError("AUTOMATIC_FINANCIAL_APPROVAL_FORBIDDEN")
    selected = [x for x in manifest.get("candidates",[]) if x.get("slug") == slug]
    if len(selected) != 1 or selected[0].get("publisher") != "Sofidy":
        raise ValueError("UNREGISTERED_SCPI_IDENTITY")
    docs = selected[0].get("documents",[])
    if len(docs) != 2 or {x["source_period"] for x in docs} != {"2025-RA","2026-T2"}:
        raise ValueError("EXPECTED_ANNUAL_AND_QUARTERLY_ORIGINALS")
    for d in docs:
        if not publisher.original.official_url(d["source_url"],["www.sofidy.com"]):
            raise ValueError("UNTRUSTED_DOCUMENT_URL")
        if not re.fullmatch(r"[a-f0-9]{64}", d["pdf_sha256"]):
            raise ValueError("UNTRUSTED_EXPECTED_SHA")
        if d["document_kind"] not in ("annual_report","quarterly_bulletin"):
            raise ValueError("UNSUPPORTED_DOCUMENT_KIND")
        if not isinstance(d["page_count"], int) or d["page_count"] < 1:
            raise ValueError("INVALID_PHYSICAL_PAGE_COUNT")
        for m in d["metrics"]:
            if m.get("qa_status") != "pending_independent_qa":
                raise ValueError("FINANCIAL_QA_ALREADY_APPROVED_OR_UNSAFE")
            if m["metric"] not in LABELS or not 1 <= m["source_page"] <= d["page_count"]:
                raise ValueError("UNTRUSTED_METRIC_PAGE_OR_NAME")
            Decimal(m["value"])
    return selected[0]

def page_excerpt(text, labels, max_chars=220):
    lines = [flat(line) for line in text.splitlines() if flat(line)]
    for idx,line in enumerate(lines):
        if any(flat(a) in line for a in labels):
            segment = " | ".join(lines[max(idx-1,0):min(idx+2,len(lines))])
            return segment[:max_chars]
    return ""

def pdf_annual_metrics(pdf, path, doc, output_dir):
    metrics = []
    page_nums = sorted({int(m["source_page"]) for m in doc["metrics"]})
    for page_num in page_nums:
        page = pdf[page_num-1]
        native = page.get_text("text", sort=True)
        poppler = read_page_poppler(path,page_num)
        visual = output_dir/"visual"/(f"{doc['source_period']}-page-{page_num}.png")
        visual.parent.mkdir(parents=True, exist_ok=True)
        visual.write_bytes(page.get_pixmap(matrix=fitz.Matrix(1.0,1.0),alpha=False).tobytes("png"))
        visual_hash=hashlib.sha256(visual.read_bytes()).hexdigest()
        for m in [r for r in doc["metrics"] if r["source_page"] == page_num]:
            checker=number_regex(m["value"])
            native_number=bool(checker.search(flat(native)))
            poppler_number=bool(checker.search(flat(poppler)))
            labels=LABELS[m["metric"]]
            native_label=any(flat(label) in flat(native) for label in labels)
            poppler_label=any(flat(label) in flat(poppler) for label in labels)
            status=("TWO_ENGINE_VALUE_AND_LABEL_FOUND" if
                    native_number and poppler_number and native_label and poppler_label else
                    "PAGE_LAYOUT_NEEDS_INDEPENDENT_VISUAL_REVIEW")
            metrics.append({
                "metric":m["metric"], "value":m["value"],"unit":m["unit"],
                "value_basis":m["value_basis"],"source_page":page_num,
                "source_url":doc["source_url"],"source_period":doc["source_period"],
                "pdf_sha256":doc["pdf_sha256"], "rendered_page_sha256":visual_hash,
                "mupdf_numeric_present":native_number,
                "poppler_numeric_present":poppler_number,
                "mupdf_label_present":native_label,
                "poppler_label_present":poppler_label,
                "page_context_for_independent_reviewer":page_excerpt(poppler,labels),
                "technical_status":status,
                "qa_status":"pending_independent_qa",
                "independent_financial_review_required":True,
                "publication_authorized":False
            })
    return metrics

def pdf_quarterly_discovery(pdf, path, out_dir):
    results=[]
    for index in range(len(pdf)):
        page_no=index+1
        text=read_page_poppler(path,page_no)
        lines=[re.sub(r"\s+"," ",l).strip() for l in text.splitlines() if l.strip()]
        hits=[]
        for i,line in enumerate(lines):
            if any(flat(term) in flat(line) for term in DISCOVERY_TERMS):
                context=" | ".join(lines[max(0,i-1):min(len(lines),i+2)])
                if len(context)>210:context=context[:210]
                if context not in hits: hits.append(context)
            if len(hits)>=15:break
        if hits:
            metadata={"source_page":page_no,"raw_label_contexts":hits,
                      "no_financial_approval":True}
            if page_no in (1,4,5):
                visual=out_dir/"visual"/(f"2026-T2-page-{page_no}.png")
                visual.parent.mkdir(parents=True,exist_ok=True)
                if not visual.is_file():
                    visual.write_bytes(pdf[index].get_pixmap(
                        matrix=fitz.Matrix(1.25,1.25),alpha=False).tobytes("png"))
                metadata["rendered_page_sha256"]=hashlib.sha256(visual.read_bytes()).hexdigest()
            results.append(metadata)
    return results

def scan_candidate(manifest,slug,out):
    item=validate_manifest(manifest,slug)
    result={"candidate_slug":slug,"source_publisher":"Sofidy",
            "status":"REVIEW_REQUIRED","financial_certified":False,
            "publication_authorized":False,"staging_written":False,"documents":[]}
    with tempfile.TemporaryDirectory(prefix="sofidy-financial-review-") as folder:
        for d in item["documents"]:
            binary,final=publisher.fetch_verified_curl(d["source_url"],["www.sofidy.com"])
            if final!=d["source_url"] or hashlib.sha256(binary).hexdigest()!=d["pdf_sha256"]:
                raise ValueError("ORIGINAL_PDF_HASH_OR_ISSUER_CHANGED")
            path=Path(folder)/("annual.pdf" if d["document_kind"]=="annual_report" else "quarter.pdf")
            path.write_bytes(binary)
            with fitz.open(path) as pdf:
                if len(pdf)!=d["page_count"]:
                    raise ValueError("PHYSICAL_PDF_PAGE_COUNT_CHANGED")
                independent.independent_poppler(path,item["name"],d["source_period"],
                                                 d["document_kind"],d["page_count"])
                scanned={"source_url":d["source_url"],"source_period":d["source_period"],
                         "pdf_sha256":d["pdf_sha256"],"page_count":d["page_count"],
                         "reader_engines":["MuPDF","Poppler"],"financial_certified":False}
                if d["metrics"]:
                    scanned["metric_review"]=pdf_annual_metrics(pdf,path,d,out)
                if d["document_kind"]=="quarterly_bulletin":
                    scanned["quarterly_page_hints"]=pdf_quarterly_discovery(pdf,path,out)
                result["documents"].append(scanned)
    return result

def main():
    cli=argparse.ArgumentParser()
    cli.add_argument("--manifest",type=Path,required=True)
    cli.add_argument("--slug",required=True)
    cli.add_argument("--out",type=Path,required=True)
    a=cli.parse_args()
    a.out.mkdir(parents=True,exist_ok=True)
    try:
        result=scan_candidate(json.loads(a.manifest.read_text(encoding="utf-8")),a.slug,a.out)
    except Exception as exc:
        result={"candidate_slug":a.slug,"status":"BLOCKED","error_code":str(exc)[:200],
                "financial_certified":False,"publication_authorized":False,"staging_written":False}
        (a.out/"review.json").write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n")
        print(json.dumps(result,ensure_ascii=False))
        raise SystemExit(1)
    (a.out/"review.json").write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n")
    for doc in result["documents"]:
        if "metric_review" in doc:
            data=doc["metric_review"]
            success=sum(x["technical_status"]=="TWO_ENGINE_VALUE_AND_LABEL_FOUND" for x in data)
            print(f"FINANCIAL_PAGE_AUDIT {a.slug} {doc['source_period']}: values+labels two-engine={success}/{len(data)}; financial_certified=false")
            for m in data:
                print("PAGE_FIELD "+json.dumps({k:m[k] for k in
                  ["metric","value","source_page","technical_status",
                   "mupdf_numeric_present","poppler_numeric_present",
                   "mupdf_label_present","poppler_label_present"]},ensure_ascii=False))
        for page in doc.get("quarterly_page_hints",[]):
            print("T2_PAGE_HINT "+json.dumps({"slug":a.slug,**page},ensure_ascii=False))
    print("PUBLISHER_FINANCIAL_STAGE_ONLY qa_status=pending_independent_qa publication_authorized=false")

if __name__=="__main__":
    main()
