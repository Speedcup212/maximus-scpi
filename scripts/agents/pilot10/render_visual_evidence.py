#!/usr/bin/env python3
"""Visual proof surfaces from the SAME SHA-verified original for semantic QA.

Creates only crops of registered PDF bytes. No authorization/financial writes.
The image itself does not promote a source to PASS; analyst checks labels,
time windows, definitions and printed units manually or in a separate QA.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
import re
import fitz


def union(a,b):
    return [min(a[0],b[0]),min(a[1],b[1]),max(a[2],b[2]),max(a[3],b[3])]


def render(report,pdf_path,outdir):
    if report.get("source_status")!="VERIFIED_TWO_READERS" or report.get("financial_certified") is not False:
        return {"renders":[],"status":"BLOCKED_SOURCE_OR_FLAGS"}
    actual=hashlib.sha256(pdf_path.read_bytes()).hexdigest()
    if actual!=report.get("source_sha256"):
        return {"renders":[],"status":"SOURCE_SHA_CHANGED"}
    outdir.mkdir(parents=True,exist_ok=True)
    records=[]
    with fitz.open(pdf_path) as pdf:
        for field,item in report.get("metrics",{}).items():
            g=item.get("geometry") or {}
            if g.get("status")!="DUAL_READER_GEOMETRY_CANDIDATE":continue
            pairs=g.get("matching_pairs") or []
            for number,pair in enumerate(pairs[:1]):
                page_number=pair.get("page")
                if not isinstance(page_number,int) or not 1<=page_number<=len(pdf):
                    continue
                x=pair.get("mupdf") or {}
                b1,b2=x.get("label_bbox"),x.get("value_bbox")
                if not b1 or not b2 or len(b1)!=4 or len(b2)!=4:
                    continue
                merged=union(b1,b2)
                page=pdf[page_number-1]
                # Wider surrounding data prevents cropping away row headers,
                # unit qualifiers, asterisks, and the quarter heading.
                clip=fitz.Rect(merged[0]-105,merged[1]-67,merged[2]+125,merged[3]+87) & page.rect
                if clip.is_empty or clip.width<=0 or clip.height<=0:continue
                filename=(report["scpi_slug"]+"__"+
                          re.sub(r"[^a-z0-9_-]","",field)+"__p"+
                          str(page_number)+"__"+str(number+1)+".png")
                pix=page.get_pixmap(matrix=fitz.Matrix(1.65,1.65),clip=clip,alpha=False)
                pix.save(outdir/filename)
                records.append({
                    "metric":field,"page":page_number,
                    "filename":filename,
                    "registered_sha256":actual,
                    "clip":list(clip),
                    "label_text":x.get("label_text"),
                    "number_text":x.get("number_text"),
                    "qualifier_review":"REQUIRED",
                    "financial_certified":False,
                })
    return {"status":"VISUAL_CANDIDATES_ONLY","renders":records,
            "source_sha256":actual,"financial_certified":False}


def main():
    p=argparse.ArgumentParser()
    p.add_argument("--report",required=True)
    p.add_argument("--archive-root",required=True)
    p.add_argument("--out",required=True)
    args=p.parse_args()
    report=json.loads(Path(args.report).read_text())
    root=Path(args.archive_root)/"official-pdf-archive"
    pdfs=list(root.glob("*.pdf"))
    if len(pdfs)!=1:
        result={"status":"NO_UNIQUE_ORIGINAL","financial_certified":False,"renders":[]}
    else:
        result=render(report,pdfs[0],Path(args.out).parent/"field-crops")
    Path(args.out).write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n")
    print("VISUAL_QA",report["scpi_slug"],result["status"],
          "crops",len(result["renders"]),"financial_certified=false")


if __name__=="__main__":main()
