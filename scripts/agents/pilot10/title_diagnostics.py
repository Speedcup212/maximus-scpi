#!/usr/bin/env python3
"""Diagnostic ONLY for official issuer PDF title inconsistencies.
Downloads exact original, demands HTTPS issuer host, SHA and physical page
count; independently extracts title text via MuPDF and Poppler. Zero writes.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import fitz

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from candidate_pdf_binary_proof import download_official
sys.path.insert(0,str(Path(__file__).resolve().parents[2]/"scpi-onboarding"))
from publisherPdfAudit import normalize


def quarter_variants(normalized, year, quarter):
    # Report both machine patterns and readable publisher layout; never promote.
    patterns={
      "ordinal_year":r"\b"+quarter+r"(?:e|eme|er)?\s*(?:trimestre|trim)\b[\W\s]{0,15}"+year+r"\b",
      "short_q":r"\b(?:t|q)"+quarter+r"\s*"+year+r"\b",
      "year_short":r"\b"+year+r"[\s/.-]*(?:t|q)"+quarter+r"\b",
      "quarter_word_year":r"\b(?:trimestre|trim)\s*(?:n[o°]?\s*)?"+quarter+r"\s*"+year+r"\b",
      "year_quarter_word":r"\b"+year+r"[\W\s]{0,10}"+quarter+r"(?:e|eme|er)?\s*(?:trimestre|trim)\b",
      "quarter_hyphen_year":r"\b(?:t|q)"+quarter+r"[\s/.-]+"+year+r"\b",
    }
    return {name:bool(re.search(p,normalized)) for name,p in patterns.items()}


def main():
    a=argparse.ArgumentParser()
    a.add_argument("--manifest",required=True)
    a.add_argument("--out",required=True)
    args=a.parse_args()
    cfg=json.loads(Path(args.manifest).read_text())
    doc=cfg["documents"][0]
    slug=cfg["candidate_slug"]
    result={"slug":slug,"expected_period":doc["source_period"],
      "expected_sha256":doc["pdf_sha256"],"expected_pages":doc["page_count"],
      "financial_certified":False,"period_certified":False,
      "diagnostic_only":True}
    try:
        raw,final_url=download_official(doc["source_url"],cfg["allowed_hosts"])
        actual=hashlib.sha256(raw).hexdigest()
        if actual!=doc["pdf_sha256"]: raise ValueError("PUBLISHER_SHA_MISMATCH")
        if not raw.startswith(b"%PDF"):raise ValueError("NOT_PDF_BYTES")
        with fitz.open(stream=raw,filetype="pdf") as pdf:
            if len(pdf)!=doc["page_count"]:raise ValueError("PAGE_COUNT_MISMATCH")
            mupdf=[p.get_text(sort=True) for p in pdf]
        with tempfile.TemporaryDirectory() as tmp:
            f=Path(tmp)/"official.pdf";f.write_bytes(raw)
            proc=subprocess.run(["pdftotext","-layout",str(f),"-"],
                 capture_output=True,text=True,timeout=35)
        if proc.returncode:raise ValueError("POPPLER_EXTRACTION_FAILED")
        poppler=proc.stdout.split("\f")
        if poppler and not poppler[-1].strip():poppler.pop()
        if len(poppler)!=len(mupdf):raise ValueError("READER_PAGE_COUNT_MISMATCH")
        year,quarter=doc["source_period"].split("-T")
        report={}
        for engine,pages in [("MuPDF",mupdf),("Poppler",poppler)]:
            covers=normalize(" ".join(pages[:2]))
            alltext=normalize(" ".join(pages))
            name=normalize(cfg["candidate_name"])
            report[engine]={
              "identity_any_page":name in alltext or name.replace(" ","") in alltext.replace(" ",""),
              "title_matches":quarter_variants(covers,year,quarter),
              "first_two_pages_excerpt":re.sub(r"\s+"," ",covers)[:1100],
              "opening_title_tokens":[re.sub(r"\s+"," ",normalize(p))[:230] for p in pages[:2]],
              "quarter_mentions":[{"page":i+1,"text":re.sub(r"\s+"," ",normalize(p))[:220]}
                for i,p in enumerate(pages) if (year in normalize(p) and
                 (f"t{quarter}" in normalize(p) or f"{quarter}eme" in normalize(p)
                   or f"{quarter}e trimestre" in normalize(p)))][:5]
            }
        result.update({"sha_verified":True,"page_count_verified":True,
          "actual_sha256":actual,"publisher_url":final_url,"readers":report,
          "status":"DIAGNOSED_NO_APPROVAL"})
    except Exception as exc:
        result.update({"status":"DIAGNOSTIC_FAILED",
                       "failure":type(exc).__name__+":"+str(exc)[:120]})
    Path(args.out).parent.mkdir(parents=True,exist_ok=True)
    Path(args.out).write_text(json.dumps(result,indent=2,ensure_ascii=False)+"\n")
    print("TITLE_DIAG",slug,result["status"])
    for engine,item in result.get("readers",{}).items():
        print("TITLE_DIAG",engine,"patterns",item["title_matches"])
        print("TITLE_DIAG",engine,"excerpt",item["first_two_pages_excerpt"][:400])


if __name__=="__main__":
    main()
