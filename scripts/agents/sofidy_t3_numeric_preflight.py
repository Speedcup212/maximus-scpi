#!/usr/bin/env python3
"""RECOVERY-207: document-bound Sofidy T3 numerical evidence, never financial release.

Tests ORIGINAL sha256, issuer TLS, physical page, exact financial numeric text via
two independent readers. Page-level presence is a preflight, NOT evidence of
semantic row identity; an independent visual review is mandatory.
"""
import argparse
from decimal import Decimal, InvalidOperation
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys
import tempfile

import fitz

sys.path.insert(0,str(Path(__file__).resolve().parent))
import publisher_family_proof as trusted
import sofidy_metric_page_probe as prior

CRITICAL_SHARE_FIELDS={"nombre_parts","nombre_parts_nouvelles_souscrites","nombre_parts_retires"}
EXPECTED_SOFIDY={"sofiboutique","sofipierre","sofidy-europe-invest"}

def numeric_pattern(value):
    number=Decimal(str(value))
    if not number.is_finite() or number<0:
        raise ValueError("INVALID_FINANCIAL_NUMBER")
    canonical=format(number,"f")
    whole,_,fraction=canonical.partition(".")
    compact=re.escape(whole)
    groups=[]
    if len(whole)>3:
        start=len(whole)%3 or 3
        groups=[whole[:start]]+[whole[i:i+3] for i in range(start,len(whole),3)]
    group_pattern=r"[\s.,]".join(map(re.escape,groups)) if groups else compact
    options=f"(?:{compact}|{group_pattern})"
    if fraction:
        fraction=fraction.rstrip("0")
        if not fraction:
            return re.compile(r"(?<!\d)"+options+r"(?![,\d])")
        return re.compile(r"(?<!\d)"+options+r"[,.]"+re.escape(fraction)+r"0*(?!\d)")
    return re.compile(r"(?<!\d)"+options+r"(?![,\d])")

def normalize_numeric(text):
    return (text.replace("\u00a0"," ").replace("\u202f"," ")
                .replace("\u2009"," ").replace("\u2019","'"))

def check_manifest(m,slug):
    if (not isinstance(m,dict) or m.get("version")!=1 or m.get("publisher")!="Sofidy"
        or m.get("period")!="2026-T3" or m.get("source_only") is not True
        or m.get("qa_approval") is not False or m.get("publication_authorized") is not False):
        raise ValueError("UNTRUSTED_FINANCIAL_MANIFEST")
    documents=m.get("documents")
    if not isinstance(documents,list) or {d.get("slug") for d in documents}!=EXPECTED_SOFIDY:
        raise ValueError("UNEXPECTED_SCPI_COHORT")
    count=sum(len(d.get("metrics",[])) for d in documents)
    if count!=41:raise ValueError("UNEXPECTED_NUMBER_OF_FINANCIAL_CLAIMS")
    matches=[d for d in documents if d["slug"]==slug]
    if len(matches)!=1:raise ValueError("FUND_NOT_REGISTERED")
    d=matches[0]
    if d.get("source_period")!="2026-T3" or d.get("page_count")!=6:
        raise ValueError("SOURCE_PERIOD_MISMATCH")
    if not trusted.original.official_url(d.get("source_url"),{"www.sofidy.com"}):
        raise ValueError("UNTRUSTED_ISSUER_URL")
    if not re.fullmatch("[a-f0-9]{64}",d.get("pdf_sha256","")):
        raise ValueError("INVALID_SOURCE_SHA")
    if not d.get("metrics"):raise ValueError("NO_FINANCIAL_CLAIMS")
    seen=set()
    for field in d["metrics"]:
        if field.get("qa_status")!="pending_independent_qa":
            raise ValueError("PREMATURE_FINANCIAL_APPROVAL")
        if field.get("metric") in seen:raise ValueError("DUPLICATE_METRIC")
        seen.add(field["metric"])
        if not isinstance(field.get("source_page"),int) or not 1<=field["source_page"]<=6:
            raise ValueError("INVALID_SOURCE_PAGE")
        if not re.fullmatch(r"[a-z0-9_]+",field.get("metric","")):
            raise ValueError("INVALID_METRIC_KEY")
        if field.get("unit") not in {"PARTS","COUNT","PERCENT","EUR","EUR_PER_PART"}:
            raise ValueError("INVALID_UNIT")
        numeric_pattern(field.get("exact_value"))
        if field["metric"] in CRITICAL_SHARE_FIELDS and field["unit"]!="PARTS":
            raise ValueError("PARTS_UNIT_MISMATCH")
    return d

def poppler_page(path,page):
    r=subprocess.run(["pdftotext","-f",str(page),"-l",str(page),"-layout",str(path),"-"],
          text=True,capture_output=True,check=False,timeout=36)
    if r.returncode!=0 or len(r.stdout)<150:
        raise ValueError(f"INDEPENDENT_PAGE_READER_FAILED_{page}")
    return r.stdout

def run(m,slug,out_dir):
    fund=check_manifest(m,slug)
    data,url=trusted.fetch_verified_curl(fund["source_url"],["www.sofidy.com"])
    if url!=fund["source_url"] or hashlib.sha256(data).hexdigest()!=fund["pdf_sha256"]:
        raise ValueError("ORIGINAL_BINARY_SHA_MISMATCH")
    out_dir.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="sofidy-t3-review-") as tmp:
        path=Path(tmp)/"original.pdf";path.write_bytes(data)
        if trusted.proof.independent_poppler(path,fund["name"],"2026-T3","quarterly_bulletin",6)!=6:
            raise ValueError("INDEPENDENT_FUND_PERIOD_IDENTITY_FAILED")
        with fitz.open(path) as document:
            if len(document)!=6:raise ValueError("ORIGINAL_PDF_PAGE_COUNT_CHANGED")
            texts={}
            for p in sorted({metric["source_page"] for metric in fund["metrics"]}):
                native=normalize_numeric(document[p-1].get_text("text",sort=True))
                poppler=normalize_numeric(poppler_page(path,p))
                img=out_dir/f"2026-T3-page-{p}.png"
                img.write_bytes(document[p-1].get_pixmap(matrix=fitz.Matrix(1.4,1.4),alpha=False).tobytes("png"))
                texts[p]=(native,poppler,hashlib.sha256(img.read_bytes()).hexdigest())
            verdicts=[]
            for field in fund["metrics"]:
                n,p,visual_sha=texts[field["source_page"]]
                rx=numeric_pattern(field["exact_value"])
                nmatch=bool(rx.search(n))
                pmatch=bool(rx.search(p))
                verdicts.append({"metric":field["metric"],"exact_value":field["exact_value"],
                    "unit":field["unit"],"value_basis":field["value_basis"],
                    "source_period":"2026-T3","source_page":field["source_page"],
                    "source_url":fund["source_url"],"original_sha256":fund["pdf_sha256"],
                    "page_raster_sha256":visual_sha,
                    "mupdf_number_found":nmatch,"poppler_number_found":pmatch,
                    "technical_status":"TWO_READER_VALUE_FOUND" if nmatch and pmatch else "REVIEW_NUMBER_OR_PAGE",
                    "qa_status":"pending_independent_qa",
                    "independent_visual_row_semantics_required":True,
                    "publication_authorized":False})
    return {"slug":slug,"status":"FINANCIAL_PAGE_PREFLIGHT_ONLY",
            "source_period":"2026-T3","pdf_sha256":fund["pdf_sha256"],
            "claims":verdicts,"qa_approved":False,"financial_certified":False,
            "publication_authorized":False,"database_modified":False}

def main():
    cli=argparse.ArgumentParser();cli.add_argument("--manifest",type=Path,required=True)
    cli.add_argument("--slug",required=True);cli.add_argument("--out",type=Path,required=True)
    args=cli.parse_args();args.out.mkdir(parents=True,exist_ok=True)
    try:
        output=run(json.loads(args.manifest.read_text(encoding="utf-8")),args.slug,args.out)
        rc=0
    except Exception as exc:
        output={"slug":args.slug,"status":"BLOCKED","reason_code":str(exc)[:240],
                "qa_approved":False,"financial_certified":False,"publication_authorized":False,"database_modified":False}
        rc=1
    (args.out/"review.json").write_text(json.dumps(output,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({k:v for k,v in output.items() if k!="claims"},ensure_ascii=False))
    for field in output.get("claims",[]):
        print("T3_NUMBER_EVIDENCE "+json.dumps({"slug":args.slug,**field},ensure_ascii=False))
    if any(x["technical_status"]!="TWO_READER_VALUE_FOUND" for x in output.get("claims",[])):
        raise SystemExit(2)
    raise SystemExit(rc)

if __name__=="__main__":main()
