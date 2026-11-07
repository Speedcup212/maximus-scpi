#!/usr/bin/env python3
"""Reproducible publisher-binary and dual layout QA for Pierval Santé T3 2026.

No DB access, no certification or manual-review claim. Fail closed unless exact
publisher SHA, PDF, fund, period, page 9 value and two independent geometries
all match. The chart has 91.04% TOF versus 8.96% vacant: NEVER swap those.
"""
import hashlib
import json
import subprocess
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path
import fitz

URL="https://www.euryale-am.fr/wp-content/uploads/BT_PIERVAL_SANTE_2026_T3.pdf"
SHA="823990ec258b0f9d0561e1ac7fef0bcb7905f1f2b235620dde1440c1aba521c1"
BYTE_SIZE=3637582
FUND="pierval"
PERIOD="T3 2026"
TOF="91,04"
VACANT="8,96"
PAGE=9
LEFT_TOF=(53.1496,396.7112,111.4936,429.8552)
CHART_TOF=(394.6145,363.9439,426.2175,381.8969)
TOLERANCE=0.9


def approximate_box(actual, expected, tol=TOLERANCE):
    return len(actual)==4 and all(abs(float(a)-float(e))<tol for a,e in zip(actual,expected))


def word_boxes_mupdf(page,token):
    return [[float(v) for v in w[:4]] for w in page.get_text("words") if w[4]==token]


def word_boxes_poppler(path,page,token):
    r=subprocess.run(["pdftotext","-f",str(page),"-l",str(page),
                      "-bbox",str(path),"-"],capture_output=True,text=True,
                     timeout=60,check=True)
    root=ET.fromstring(r.stdout)
    return [[float(el.attrib[k]) for k in ("xMin","yMin","xMax","yMax")]
            for el in root.iter() if el.tag.endswith("word") and el.text==token]


def verify_geometry(mu,po):
    for boxes,reader in ((mu,"MuPDF"),(po,"Poppler")):
        if len(boxes)!=2:
            raise ValueError(reader+"_TOF_COUNT_MUST_BE_TWO_DISTINCT_LABELS")
        if not any(approximate_box(x,LEFT_TOF) for x in boxes):
            raise ValueError(reader+"_LARGE_TOF_CARD_POSITION_MISMATCH")
        if not any(approximate_box(x,CHART_TOF) for x in boxes):
            raise ValueError(reader+"_TOF_CHART_91P04_POSITION_MISMATCH")
    for m in mu:
        if not any(approximate_box(m,p) for p in po):
            raise ValueError("TWO_INDEPENDENT_READERS_TOF_GEOMETRY_DISAGREES")
    return True


def verify(path):
    pdf=Path(path)
    data=pdf.read_bytes()
    if len(data)!=BYTE_SIZE or not data.startswith(b"%PDF"):
        raise ValueError("OFFICIAL_ISSUER_PDF_BYTES_OR_HEADER_MISMATCH")
    actual=hashlib.sha256(data).hexdigest()
    if actual!=SHA:
        raise ValueError("OFFICIAL_ISSUER_PDF_SHA256_MISMATCH")
    with fitz.open(stream=data,filetype="pdf") as doc:
        if doc.needs_pass or len(doc)!=12:
            raise ValueError("OFFICIAL_ISSUER_PAGE_COUNT_MISMATCH")
        cover=" ".join(doc[i].get_text("text").lower() for i in (0,1))
        if FUND not in cover or PERIOD.lower() not in cover:
            raise ValueError("OFFICIAL_ISSUER_FUND_OR_PERIOD_MISMATCH")
        source_page=doc[PAGE-1]
        txt=source_page.get_text("text").lower()
        if not all(x in txt for x in ("taux d'occupation financier",TOF,VACANT,
                                     "bulletin trimestriel",PERIOD.lower())):
            raise ValueError("OFFICIAL_PDF_PAGE9_TENANT_TOF_OR_PERIOD_MISSING")
        mu=word_boxes_mupdf(source_page,TOF)
        vacant_mu=word_boxes_mupdf(source_page,VACANT)
    po=word_boxes_poppler(pdf,PAGE,TOF)
    vacant_po=word_boxes_poppler(pdf,PAGE,VACANT)
    verify_geometry(mu,po)
    if len(vacant_mu)!=1 or len(vacant_po)!=1:
        raise ValueError("VACANCY_LEGEND_NOT_DISTINCT_FROM_FINANCIAL_TOF")
    if any(approximate_box(v,CHART_TOF) for v in vacant_mu+vacant_po):
        raise ValueError("VACANCY_FIGURE_MISTAKEN_FOR_FINANCIAL_TOF")
    return dict(
        status="exact_binary_independent_geometry_pass",
        slug="pierval-sante",period="2026-T3",metric="tof",
        value_percent=91.04,vacant_percentage=8.96,
        original_issuer_url=URL,sha256=actual,bytes=len(data),page=PAGE,
        readers=["MuPDF-geometry","Poppler-bbox"],
        mupdf_tof_boxes=mu,poppler_tof_boxes=po,
        mupdf_vacancy_boxes=vacant_mu,poppler_vacancy_boxes=vacant_po,
        fund_identity_proven=True,period_identity_proven=True,
        independent_numeric_and_layout_proven=True,
        financial_certified=False,human_attestation=False,
        automatic_publication=False)


def publisher_fetch(target):
    req=urllib.request.Request(URL,headers={"User-Agent":"Mozilla/5.0"})
    with urllib.request.urlopen(req,timeout=85) as resp:
        end=urllib.parse.urlparse(resp.geturl())
        if resp.status!=200 or end.scheme!="https" or end.hostname!="www.euryale-am.fr":
            raise ValueError("ISSUER_HOST_REDIRECT_OR_HTTP_INVALID")
        data=resp.read(12*1024*1024+1)
    Path(target).write_bytes(data)


def main():
    out=Path(sys.argv[1] if len(sys.argv)>1 else "test-results/pierval-t3")
    out.mkdir(parents=True,exist_ok=True)
    pdf=out/"pierval-t3-issuer-original.pdf"
    report={}
    try:
        publisher_fetch(pdf)
        report=verify(pdf)
        print("PIERVAL_T3_INDEPENDENT_BINARY_QA_PASS",report["value_percent"],
              "SHA",report["sha256"],"PAGE",report["page"])
        print("PIERVAL_T3_MUPDF_POSITIONS",report["mupdf_tof_boxes"])
        print("PIERVAL_T3_POPPLER_POSITIONS",report["poppler_tof_boxes"])
    except Exception as exc:
        report=dict(status="blocked",code=str(exc),
                    financial_certified=False,human_attestation=False)
        print("PIERVAL_T3_SOURCE_BLOCKED",str(exc))
    (out/"evidence.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",
                                      encoding="utf-8")
    if report["status"]!="exact_binary_independent_geometry_pass":
        raise SystemExit(1)


if __name__=="__main__":
    main()
