#!/usr/bin/env python3
"""RECOVERY-203: issuer PDF portfolio composition cross-reader, NEVER autoapproves.

Uses verified Sofidy TLS chain, checks immutable SHA and exact source page,
and compares MuPDF/Poppler percentage and label tokens against the original.
A page containing both a label and a number is NOT proof they are linked:
independent visual chart review remains mandatory before qa_pass.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import sys
import tempfile

import fitz

HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
import sofidy_metric_page_probe as base

def validate(manifest,slug):
    if (manifest.get("version")!=1 or manifest.get("publisher")!="Sofidy"
        or manifest.get("financial_autoapprove") is not False
        or manifest.get("release_allowed") is not False):
        raise ValueError("UNSAFE_ALLOCATION_MANIFEST")
    candidates=manifest.get("candidates") or []
    if len(candidates)!=3 or len({x.get("scpi_slug") for x in candidates})!=3:
        raise ValueError("EXPECTED_THREE_UNIQUE_ISSUER_FUNDS")
    exact=[x for x in candidates if x.get("scpi_slug")==slug]
    if len(exact)!=1:raise ValueError("UNAPPROVED_SCPI")
    c=exact[0]
    if (c.get("source_period")!="2026-T2"
        or c.get("source_page")!=2 or c.get("document_kind")!="quarterly_bulletin"
        or not base.publisher.original.official_url(c.get("source_url"),["www.sofidy.com"])
        or not re.fullmatch("[0-9a-f]{64}",c.get("pdf_sha256",""))
        or not re.fullmatch("[0-9a-f]{64}",c.get("page_raster_sha256",""))
        or c.get("pdf_page_count")!=6):
        raise ValueError("UNVERIFIED_EXACT_ORIGINAL")
    for axis in ("geography","sector"):
        entries=c.get("axes",{}).get(axis)
        if not isinstance(entries,list) or not entries:
            raise ValueError("MISSING_ALLOCATION_AXIS")
        if len({x["label"] for x in entries})!=len(entries):
            raise ValueError("DUPLICATE_ALLOCATION_LABEL")
        values=[float(x["pct"]) for x in entries]
        if any(v<0 or v>100 for v in values) or abs(sum(values)-100)>0.00001:
            raise ValueError("ALLOCATION_AXIS_NOT_EXACTLY_100")
    return c

def clean(s):
    return base.flat(s).replace("-"," ").replace("/", " ")

def label_tokens(label):
    return [v for v in re.findall(r"[\w]+",clean(label)) if len(v)>=4]

def independent_scan(manifest,slug):
    c=validate(manifest,slug)
    original,url=base.publisher.fetch_verified_curl(c["source_url"],["www.sofidy.com"])
    if url!=c["source_url"] or hashlib.sha256(original).hexdigest()!=c["pdf_sha256"]:
        raise ValueError("PUBLISHER_PDF_SOURCE_CHANGED")
    with tempfile.TemporaryDirectory(prefix="sofidy-composition-") as folder:
        pdf_path=Path(folder)/"source.pdf"
        pdf_path.write_bytes(original)
        with fitz.open(pdf_path) as pdf:
            if len(pdf)!=c["pdf_page_count"]:
                raise ValueError("SOURCE_PAGE_COUNT_CHANGED")
            # Two readers agree on legal source identity/period and physical page count.
            base.independent.independent_poppler(pdf_path,c["scpi_name"],
                "2026-T2","quarterly_bulletin",len(pdf))
            p=pdf[1]
            mupdf=p.get_text("text",sort=True)
            poppler=base.read_page_poppler(pdf_path,2)
            raster=p.get_pixmap(matrix=fitz.Matrix(1.25,1.25),alpha=False).tobytes("png")
            sha=hashlib.sha256(raster).hexdigest()
            if sha!=c["page_raster_sha256"]:
                raise ValueError("OFFICIAL_PAGE_RASTER_SHA_CHANGED")
            scans=[]
            for axis,entries in c["axes"].items():
                for r in entries:
                    numeric=base.number_regex(r["pct"])
                    toks=label_tokens(r["label"])
                    engines={
                        "MuPDF":{"value_present":bool(numeric.search(clean(mupdf))),
                                 "label_tokens_present":bool(toks) and all(t in clean(mupdf) for t in toks)},
                        "Poppler":{"value_present":bool(numeric.search(clean(poppler))),
                                   "label_tokens_present":bool(toks) and all(t in clean(poppler) for t in toks)}
                    }
                    pass_token=all(all(v.values()) for v in engines.values())
                    scans.append({"allocation_type":axis,"label":r["label"],"pct":r["pct"],
                        "source_page":2,"original_pdf_sha256":c["pdf_sha256"],
                        "page_raster_sha256":sha,"independent_readers":engines,
                        "technical_status":"BOTH_ENGINES_PAGE_TOKENS_FOUND" if pass_token else "LAYOUT_REVIEW",
                        "qa_status":"needs_review","financial_certified":False,
                        "publication_authorized":False})
    return {"scpi_slug":slug,"source_period":"2026-T2",
            "original_pdf_sha256":c["pdf_sha256"],
            "page_raster_sha256":c["page_raster_sha256"],
            "axis_sums":{axis:sum(float(x["pct"]) for x in vals) for axis,vals in c["axes"].items()},
            "rows":scans,"financial_certified":False,"publication_authorized":False,
            "status":"INDEPENDENT_VISUAL_REVIEW_REQUIRED"}

def main():
    cli=argparse.ArgumentParser()
    cli.add_argument("--manifest",type=Path,required=True)
    cli.add_argument("--slug",required=True)
    cli.add_argument("--out",type=Path,required=True)
    a=cli.parse_args()
    a.out.parent.mkdir(parents=True,exist_ok=True)
    try:
        result=independent_scan(json.loads(a.manifest.read_text(encoding="utf-8")),a.slug)
    except Exception as error:
        result={"scpi_slug":a.slug,"status":"BLOCKED","error_code":str(error)[:200],
                "financial_certified":False,"publication_authorized":False}
        a.out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
        print(json.dumps(result,ensure_ascii=False))
        raise SystemExit(1)
    a.out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({"slug":a.slug,"status":result["status"],
        "total":len(result["rows"]),
        "both_readers":sum(x["technical_status"]=="BOTH_ENGINES_PAGE_TOKENS_FOUND" for x in result["rows"]),
        "layout_review":sum(x["technical_status"]=="LAYOUT_REVIEW" for x in result["rows"]),
        "financial_certified":False}))

if __name__=="__main__":
    main()
