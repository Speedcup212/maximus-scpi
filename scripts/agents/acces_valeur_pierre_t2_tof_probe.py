#!/usr/bin/env python3
"""Accès Valeur Pierre T2 2026 — official TOF independent diagnostic.

No value is inferred from another quarter, no unauthenticated issuer host,
no cert writes. Original PDF byte SHA + MuPDF and Poppler evidence only.
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
import bulletin_fields
from candidate_pdf_binary_proof import download_official
from publisherPdfAudit import quarter_title_matches,normalize

URL="https://reim.bnpparibas-am.com/sites/default/files/docs/2026-08/ACCES%20VALEUR%20PIERRE_BT_FR_T2%202026_DEF.pdf"
SHA="ef0480622e4a8ed94f37195158606e098f321dcc8d136f78b813924d96e275da"
PERIOD="2026-T2"
HOSTS=["reim.bnpparibas-am.com"]
TOKEN=re.compile(r"\btof\b|taux\s+d['\s]*occupation(?:\s+financiere?)?|\boccupation\s+financiere?\b",re.I)


def scan(engine,pages):
    rows=[]
    for j,raw in enumerate(pages):
        txt=normalize(raw)
        for hit in list(TOKEN.finditer(txt))[:30]:
            s=txt[max(0,hit.start()-115):min(len(txt),hit.end()+155)]
            rows.append({"reader":engine,"page":j+1,"snippet":" ".join(s.split())[:260]})
    return rows

def main():
    raw,eff_url=download_official(URL,HOSTS)
    if eff_url!=URL:raise RuntimeError("UNEXPECTED_ISSUER_FINAL_URL")
    if hashlib.sha256(raw).hexdigest()!=SHA:raise RuntimeError("ORIGINAL_PDF_SHA_MISMATCH")
    with tempfile.TemporaryDirectory() as temp:
        f=Path(temp)/"issuer.pdf"
        f.write_bytes(raw)
        with fitz.open(f) as pdf:
            if len(pdf)!=7:raise RuntimeError("PDF_EXPECTED_7_PAGES")
            a=([page.get_text("text") for page in pdf],
               [[tuple(w[:5]) for w in page.get_text("words")] for page in pdf],
               [page.rect.width for page in pdf])
        p=subprocess.run(["pdftotext","-layout",str(f),"-"],capture_output=True,text=True,timeout=45)
        if p.returncode:raise RuntimeError("POPPLER_FAILED")
        texts=p.stdout.split("\f")
        if texts and not texts[-1].strip():texts.pop()
        if len(texts)!=7:raise RuntimeError("POPPLER_PAGE_COUNT_MISMATCH")
        # Separate independent word geometry for accurate row associations
        from pilot10.geometry_review import pdf_words_poppler
        bw=pdf_words_poppler(f)
        b=(texts,[[tuple([*x["bbox"],x["t"]]) for x in words] for words in bw],a[2])
        if len(bw)!=7:raise RuntimeError("POPPLER_WORD_PAGE_COUNT_MISMATCH")
        mu_title=quarter_title_matches(" ".join(a[0][:2]),PERIOD)
        po_title=quarter_title_matches(" ".join(texts[:2]),PERIOD)
        mu_identity="acces valeur pierre" in normalize(" ".join(a[0]))
        po_identity="acces valeur pierre" in normalize(" ".join(texts))
        if not (mu_identity and po_identity and mu_title and po_title):
            raise RuntimeError("IDENTITY_OR_PERIOD_NOT_CONFIRMED_TWO_ENGINES")
        # The source MUST explicitly print the same TOF twice: in the
        # 30 June 2026 KPI panel (page 2) AND in the S1 2026 ASPIM
        # comparative table (page 4). Do not infer from the T3 bulletin.
        exact_checks={}
        for engine,pages in (("MuPDF",a[0]),("Poppler",texts)):
            p2=normalize(pages[1])
            p4=normalize(pages[3])
            exact_checks[engine]={
              "kpi_tof_label":bool(re.search(r"taux d.occupation financier",p2)),
              "kpi_value":bool(re.search(r"87[,.]07\s*%",p2)),
              "kpi_reference_date":"30 juin 2026" in p2 or "30/06/2026" in p2,
              "table_tof_label":"tof" in p4,
              "table_value":bool(re.search(r"87[,.]07\s*%",p4)),
              "table_period":"s1 2026" in p4,
            }
        if not all(all(fields.values()) for fields in exact_checks.values()):
            raise RuntimeError("ACCES_T2_FINANCIAL_SOURCE_PROOF_INCOMPLETE:"+str(exact_checks))
        hits_a,seen_a=bulletin_fields.extract(*a,PERIOD)
        hits_b,seen_b=bulletin_fields.extract(*b,PERIOD)
        result={
           "slug":"acces-valeur-pierre",
           "period":PERIOD,"sha256":SHA,"issuer_url":URL,
           "reader_titles":{"MuPDF":mu_title,"Poppler":po_title},
           "reader_identity":{"MuPDF":mu_identity,"Poppler":po_identity},
           "tof_label_seen":{"MuPDF":"tof" in seen_a,"Poppler":"tof" in seen_b},
           "metric_candidates":{"MuPDF":hits_a.get("tof",[]),"Poppler":hits_b.get("tof",[])},
           "text_occurrences":scan("MuPDF",a[0])+scan("Poppler",texts),
           "financial_certified":False,"deploy_allowed":False,
           "semantic_qa":"SOURCE_PROOF_COMPLETE_CERTIFICATE_REQUIRES_SQL_READBACK",
           "reported_tof_percent":87.07,
           "reported_reference_date":"2026-06-30",
           "reported_reporting_period":"2026-S1",
           "readers_exact_kpi_and_table":exact_checks
        }
        out=Path("test-results/acces-valeur-pierre-t2")
        out.mkdir(parents=True,exist_ok=True)
        (out/"source-proof.json").write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n")
        # Source page review image only, not an assertion of accuracy.
        with fitz.open(f) as pdf:
            pages=sorted({x["page"] for x in result["text_occurrences"]})
            for page in pages[:4]:
                pdf[page-1].get_pixmap(matrix=fitz.Matrix(1.3,1.3),alpha=False).save(out/f"tof-review-page-{page}.png")
        print("ACCES_T2_ISSUER_SHA_VERIFIED",SHA,"7/7 pages")
        print("ACCES_T2_TOF_OCCURRENCES",json.dumps(result["text_occurrences"][:14],ensure_ascii=False))
        print("ACCES_T2_TOF_CANDIDATES",json.dumps(result["metric_candidates"],ensure_ascii=False))
        print("ACCES_T2_FINANCIAL_CERTIFIED=false")
if __name__=="__main__":main()
