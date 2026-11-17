#!/usr/bin/env python3
"""READ-ONLY, exact-original NCap Education Santé 2026-T3 TOF investigation.
Existing main-only GitHub OIDC bridge mints 120-second PRIVATE Storage URL.
No financial DB writes, no service-role secrets, no signed URL in logs/artifacts.
"""
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import unicodedata
import urllib.parse
import urllib.request
import fitz

sys.path.insert(0,str(Path(__file__).resolve().parents[1]/"scpi-onboarding"))
from publisherPdfAudit import normalize, quarter_title_matches

PROJECT="https://ygvsddcpohsnaowofuwc.supabase.co"
SLUG="ncap-education-sante"
PERIOD="2026-T3"
SHA="cd81cb7ec3750dd7fef05d3720729748896acc3f659f7b7a872ad6ff242cbf96"
BYTE_SIZE=3750137
ISSUER_URL="https://www.normacapital.fr/documentation/bulletin-dinformation-trimestriel-t3-2026/"
EXPECTED_PAGES=10
AUDIENCE="maximus-scpi-bulletin-replay-ygvsddcpohsnaowofuwc"
MATCH=re.compile(r"\btof\b|taux d.occupation financier|taux\s+d.occupation\s+financiere?\b",re.I)
PERCENT=re.compile(r"(?<![0-9])(?:[0-9]{1,3})[,.][0-9]{1,2}\s*%")
OUT=Path("test-results/ncap-t3-source-proof")

def request_json(req):
    with urllib.request.urlopen(req,timeout=25) as response:
        return json.load(response)

def get_pinned_source():
    mint=os.environ["ACTIONS_ID_TOKEN_REQUEST_URL"]
    mint+=("&" if "?" in mint else "?")+urllib.parse.urlencode({"audience":AUDIENCE})
    tok=request_json(urllib.request.Request(mint,headers={
      "Authorization":"Bearer "+os.environ["ACTIONS_ID_TOKEN_REQUEST_TOKEN"]
    }))["value"]
    req=urllib.request.Request(PROJECT+"/functions/v1/scpi-bulletin-replay-oidc",
       data=json.dumps({"op":"archived_exact_source_probe","slug":SLUG,
                        "period":PERIOD,"sha256":SHA}).encode(),
       method="POST",
       headers={"Authorization":"Bearer "+tok,"Content-Type":"application/json"})
    response=request_json(req)
    if (response.get("status")!="exact_registered_archived_issuer_source"
        or response.get("slug")!=SLUG or response.get("period")!=PERIOD
        or response.get("sha256")!=SHA or not response.get("signed_url")):
        raise RuntimeError("PINNED_STORAGE_RESULT_NOT_VALID")
    signed=response["signed_url"]
    # Signed location is a short-lived capability: never log or persist it.
    with urllib.request.urlopen(urllib.request.Request(signed,
          headers={"User-Agent":"MaximusSCPI-OfficialSourceQA/1.0"}),timeout=50) as res:
        raw=res.read(6_000_001)
    if len(raw)!=BYTE_SIZE: raise RuntimeError("STORAGE_BYTE_SIZE_MISMATCH")
    if hashlib.sha256(raw).hexdigest()!=SHA: raise RuntimeError("STORAGE_SHA_MISMATCH")
    return raw

def excerpts(reader,pages):
    result=[]
    for i,p in enumerate(pages):
        text=normalize(p)
        for m in list(MATCH.finditer(text))[:25]:
            start=max(0,m.start()-220);end=min(len(text),m.end()+230)
            snippet=re.sub(r"\s+"," ",text[start:end])[:450]
            vals=list(PERCENT.finditer(text[max(0,m.start()-150):min(len(text),m.end()+260)]))
            result.append({"reader":reader,"page":i+1,"context":snippet,
                           "local_percentage_tokens":[x.group() for x in vals[:12]]})
    return result

def main():
    raw=get_pinned_source()
    with tempfile.TemporaryDirectory() as temp:
        file=Path(temp)/"private-original.pdf"
        file.write_bytes(raw)
        with fitz.open(file) as pdf:
            if len(pdf)!=EXPECTED_PAGES:raise RuntimeError("ORIGINAL_PDF_PAGE_COUNT")
            a=[page.get_text(sort=True) for page in pdf]
        q=subprocess.run(["pdftotext","-layout",str(file),"-"],capture_output=True,text=True,timeout=45)
        if q.returncode:raise RuntimeError("INDEPENDENT_POPPLER_FAILED")
        b=q.stdout.split("\f")
        if b and not b[-1].strip():b.pop()
        if len(b)!=EXPECTED_PAGES:raise RuntimeError("POPPLER_PAGE_COUNT")
        checks={}
        for engine,pages in [("MuPDF",a),("Poppler",b)]:
            alltext=normalize(" ".join(pages))
            full_name=("ncap education sante" in alltext or
                       "fair invest" in alltext)
            period=quarter_title_matches(" ".join(pages[:2]),PERIOD)
            checks[engine]={"product_named":full_name,"quarter_visible":period}
        report={"scpi_slug":SLUG,"source_period":PERIOD,
            "source_url":ISSUER_URL,"issuer_original_sha256":SHA,
            "bytes":len(raw),"pages":EXPECTED_PAGES,
            "source_type":"registered_private_issuer_pdf",
            "reader_checks":checks,
            "evidence":excerpts("MuPDF",a)+excerpts("Poppler",b),
            "source_integrity_verified":True,
            "source_period_confirmed_two_readers":all(x["quarter_visible"] for x in checks.values()),
            "financial_certified":False,
            "metric_qa_status":"REVIEW_REQUIRED",
            "issuer_public_page_availability":"NOT_ASSUMED",
            "deploy_allowed":False}
        OUT.mkdir(parents=True,exist_ok=True)
        (OUT/"bounded-source-evidence.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
        print("NCAP_EXACT_ARCHIVED_SHA",SHA,"page_count",EXPECTED_PAGES)
        print("NCAP_ISSUER_PERIOD_CHECKS",json.dumps(checks,ensure_ascii=False))
        print("NCAP_TOF_SNIPPETS",json.dumps(report["evidence"][:18],ensure_ascii=False))
        print("NCAP_CERTIFICATION false, QA_NOT_YET_GRANTED")
        if not all(x["product_named"] and x["quarter_visible"] for x in checks.values()):
            raise RuntimeError("NCAP_ORIGINAL_IDENTITY_OR_PERIOD_FAIL_CLOSED")

if __name__=="__main__":main()
