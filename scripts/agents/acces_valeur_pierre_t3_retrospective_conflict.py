#!/usr/bin/env python3
"""Read-only exact-sha publisher T3 report vs printed T2 87.07% discrepancy.

Source trail records earlier PDF S1-2026 TOF 87.07 and an unverified
retrospective T2 value of 85.49. This script locates all 85.49, 87.07,
86.50 and TOF mentions on publisher T3, without choosing a winner.
"""
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import fitz

HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
sys.path.insert(0,str(HERE.parent/"scpi-onboarding"))
from candidate_pdf_binary_proof import download_official
from publisherPdfAudit import normalize,quarter_title_matches

URL="https://reim.bnpparibas-am.com/sites/default/files/docs/2026-10/BT_AVP_3T2026_5%20def.pdf"
SHA="40c7f721cfe7008cf833efe4f9ce6ea821c18dc3c5c1fdf37a826c428dabfa8e"
HOSTS=["reim.bnpparibas-am.com"]
NUMBERS=re.compile(r"(?<!\d)(?:85[,.]49|87[,.]07|86[,.]50|86[,.]5)(?!\d)")
TOF=re.compile(r"taux d.occupation financier|\btof\b",re.I)

def all_hits(name,pages):
    hits=[]
    for pi,text in enumerate(pages):
        clean=normalize(text)
        for rule,label in ((NUMBERS,"number"),(TOF,"tof_label")):
            for m in list(rule.finditer(clean))[:25]:
                excerpt=clean[max(0,m.start()-180):min(len(clean),m.end()+230)]
                hits.append({"engine":name,"page":pi+1,"type":label,
                             "token":m.group(),"context":" ".join(excerpt.split())[:360]})
    return hits

def main():
    data,effective=download_official(URL,HOSTS)
    if effective!=URL or hashlib.sha256(data).hexdigest()!=SHA:
        raise RuntimeError("PUBLISHER_T3_URL_OR_SHA_UNVERIFIED")
    with tempfile.TemporaryDirectory() as temp:
        path=Path(temp)/"t3.pdf"
        path.write_bytes(data)
        with fitz.open(path) as pdf:
            if len(pdf)!=7:raise RuntimeError("UNEXPECTED_T3_PAGE_COUNT")
            a=[p.get_text(sort=True) for p in pdf]
        pop=subprocess.run(["pdftotext","-layout",str(path),"-"],
            capture_output=True,text=True,timeout=45)
        if pop.returncode:raise RuntimeError("POPPLER_T3_FAILED")
        b=pop.stdout.split("\f")
        if b and not b[-1].strip():b.pop()
        if len(b)!=len(a):raise RuntimeError("PDF_READER_COUNT_DIFFERENCE")
        checks={}
        for eng,pages in [("MuPDF",a),("Poppler",b)]:
            clean=normalize(" ".join(pages))
            checks[eng]={"identity":"acces valeur pierre" in clean,
                         "period":quarter_title_matches(" ".join(pages[:2]),"2026-T3")}
            if not all(checks[eng].values()):raise RuntimeError("T3_ISSUER_ID_PERIOD_REJECTED:"+str(checks))
        hits=all_hits("MuPDF",a)+all_hits("Poppler",b)
        results={"scpi_slug":"acces-valeur-pierre",
            "document_period":"2026-T3","pdf_sha256":SHA,
            "pdf_source_url":URL,"reader_checks":checks,
            "exact_source_conflict_value_t2":87.07,
            "historical_claimed_retrospective_t2":85.49,
            "hits":hits,"financial_certified":False,
            "conflict_resolved":False,"qa_required":True}
        out=Path("test-results/acces-valeur-pierre-t3-conflict")
        out.mkdir(parents=True,exist_ok=True)
        (out/"retrospective-qa.json").write_text(json.dumps(results,ensure_ascii=False,indent=2)+"\n")
        pages_to_render=sorted({h["page"] for h in hits if h["type"]=="number"})
        with fitz.open(path) as pdf:
            for page in pages_to_render[:5]:
                pdf[page-1].get_pixmap(matrix=fitz.Matrix(1.3,1.3),alpha=False).save(out/f"number-context-page-{page}.png")
        print("AVP_T3_PUBLISHER_ORIGINAL_VERIFIED",SHA)
        print("AVP_T3_READER_CHECKS",json.dumps(checks,ensure_ascii=False))
        print("AVP_T3_NUMBER_CONTEXTS",json.dumps([h for h in hits if h["type"]=="number"][:30],ensure_ascii=False))
        print("AVP_T3_QA_UNRESOLVED financial_certified=false")

if __name__=="__main__":main()
