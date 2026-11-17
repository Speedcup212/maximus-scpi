#!/usr/bin/env python3
"""Exact-source Epsicap Nano 2026-T3 reconciliation, READ ONLY.

Never treats a dual-reader numeric match as financial PASS. Numeric snapshot
conflicts are resolved only with named field, location, units, reference date
and source SHA, and the original source bytes.
"""
from __future__ import annotations
import hashlib
import json
import os
from pathlib import Path
import re
import sys
import tempfile
import subprocess
import fitz

ROOT=Path(__file__).resolve().parent
sys.path.insert(0,str(ROOT))
sys.path.insert(0,str(ROOT/"pilot10"))
from candidate_pdf_binary_proof import download_official, independent_poppler
from geometry_review import analyze_geometry,pdf_words_mupdf,pdf_words_poppler

SLUG="epsicap-nano"
PERIOD="2026-T3"
URL="https://epsicap.fr/app/uploads/2026/11/bulletin-trimestriel-epsicap-nano-t3-2026.pdf"
SHA="1f7efa004028d10758149d0dcd97677dc22ad679cf314768e0d682add4a4b3e7"
EXPECTED_PAGES=11
HOSTS=["epsicap.fr","www.epsicap.fr"]
CHECKS={
 "prix_souscription":{"source_value":257.0,"stale_snapshot":244.15,"page":4,"unit":"EUR_PER_PART"},
 "prix_reconstitution":{"source_value":277.46,"stale_snapshot":305.21,"page":4,"unit":"EUR_PER_PART"},
 "prix_retrait":{"source_value":244.15,"page":4,"unit":"EUR_PER_PART"},
 "capitalisation":{"source_value":227.0,"page":4,"unit":"MEUR"},
 "valeur_realisation":{"source_value":226.53,"page":4,"unit":"EUR_PER_PART"},
 "tof":{"source_value":97.98,"page":5,"unit":"%","reference_basis":"since_2026_01_01"},
}


def source_extract():
    raw,final_url=download_official(URL,HOSTS)
    digest=hashlib.sha256(raw).hexdigest()
    if digest!=SHA: raise RuntimeError("EXACT_ORIGINAL_SHA_MISMATCH")
    if final_url!=URL: raise RuntimeError("UNEXPECTED_FINAL_URL")
    with tempfile.TemporaryDirectory() as folder:
        pdfpath=Path(folder)/"source.pdf"
        pdfpath.write_bytes(raw)
        with fitz.open(pdfpath) as doc:
            if len(doc)!=EXPECTED_PAGES:raise RuntimeError("PDF_PAGE_COUNT_DIFFERENT")
            text_a=[pg.get_text(sort=True) for pg in doc]
        independent_poppler(pdfpath,"Epsicap Nano",PERIOD,"quarterly_bulletin",EXPECTED_PAGES)
        m=pdf_words_mupdf(pdfpath);p=pdf_words_poppler(pdfpath)
        if len(m)!=EXPECTED_PAGES or len(p)!=EXPECTED_PAGES:raise RuntimeError("GEOMETRY_PAGE_COUNT")
        result={"scpi_slug":SLUG,"source_period":PERIOD,
                "source_url":URL,"source_sha256":digest,"page_count":EXPECTED_PAGES,
                "status":"REVIEW_REQUIRED","financial_certified":False,
                "source_verified":True,"source_engines":["MuPDF","Poppler"],
                "metrics":{}}
        screenshots_dir=Path("test-results/epsicap-t3-field-crops")
        screenshots_dir.mkdir(parents=True,exist_ok=True)
        with fitz.open(pdfpath) as doc:
            for metric,criteria in CHECKS.items():
                source_value=criteria["source_value"]
                candidate=analyze_geometry(pdfpath,metric,source_value,m,p)
                match=next((x for x in candidate.get("matching_pairs",[])
                            if x["page"]==criteria["page"]),None)
                info={"expected_value":source_value,"unit":criteria["unit"],
                      "expected_page":criteria["page"],
                      "stale_extraction_value":criteria.get("stale_snapshot"),
                      "geometry_status":candidate["status"],
                      "source_reference_basis":criteria.get("reference_basis"),
                      "candidates":candidate.get("matching_pairs",[])[:2],
                      "semantic_qa_certified":False}
                if match:
                    page=doc[criteria["page"]-1]
                    b1=match["mupdf"]["label_bbox"]
                    b2=match["mupdf"]["value_bbox"]
                    union=fitz.Rect(min(b1[0],b2[0]),min(b1[1],b2[1]),
                                    max(b1[2],b2[2]),max(b1[3],b2[3]))
                    clip=fitz.Rect(union.x0-120,union.y0-80,union.x1+150,union.y1+100)&page.rect
                    name=f"{SLUG}__{metric}__page{criteria['page']}.png"
                    page.get_pixmap(matrix=fitz.Matrix(2,2),clip=clip,alpha=False).save(screenshots_dir/name)
                    info["screenshot"]=name
                result["metrics"][metric]=info
        result["dual_geometry_found"]=sum(bool(x.get("screenshot")) for x in result["metrics"].values())
        result["metrics_tested"]=len(CHECKS)
        result["status"]="SOURCE_VERIFIED_CANDIDATES"
        Path("test-results/epsicap-t3-semantic-proof.json").write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n")
        for k,info in result["metrics"].items():
            print("EPSICAP_FIELD",k,"value",info["expected_value"],
                  "geometry",info["geometry_status"],
                  "page",info["expected_page"],"picture",info.get("screenshot","NONE"))
        print("EPSICAP_EXACT_SOURCE",result["dual_geometry_found"],"/",len(CHECKS),
              "original_sha",SHA,"FINANCIAL_CERTIFIED=false")


if __name__=="__main__":source_extract()
