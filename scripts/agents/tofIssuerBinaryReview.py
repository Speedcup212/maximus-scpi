#!/usr/bin/env python3
"""Read-only source proof for two TOF conflicts. No financial admission.

Uses the existing candidate_pdf_binary_proof.download_official security gate.
Requires exact issuer URL and SHA recorded in the original certificate.
All numerical findings remain REVIEW until independent finance QA.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
import unicodedata

from candidate_pdf_binary_proof import download_official, official_url
import fitz

EXPECTED = {
    "buroboutic-metropoles": {"host":"www.fiducial-gerance.fr","page":4,
                              "issue":"vacancy_subcomponent"},
    "perial-grand-paris": {"host":"cdn.prod.website-files.com","page":6,
                           "issue":"history_100_vs_certificate_84_7"},
}


def normalize(value):
    return re.sub(r"\s+", " ",
        "".join(ch for ch in unicodedata.normalize("NFKD",str(value))
                if not unicodedata.combining(ch))).lower().strip()


def validate(manifest):
    docs=manifest.get("cases")
    if (manifest.get("financial_certified") is not False
      or manifest.get("deploy_allowed") is not False
      or not isinstance(docs,list) or len(docs)!=2
      or {d.get("slug") for d in docs if isinstance(d,dict)}!=set(EXPECTED)):
        raise ValueError("INVALID_TOF_CASE_MANIFEST")
    for doc in docs:
        cfg=EXPECTED[doc["slug"]]
        if (doc.get("issuer_hosts")!=[cfg["host"]]
          or doc.get("conflict_kind")!=cfg["issue"]
          or doc.get("evidence_page")!=cfg["page"]
          or doc.get("period")!="2026-T3"
          or not isinstance(doc.get("name"),str)
          or len(doc["name"])<7
          or not official_url(doc.get("source_url"),doc["issuer_hosts"])
          or not re.fullmatch("[a-f0-9]{64}",str(doc.get("sha256","")))):
            raise ValueError("UNTRUSTED_TOF_SOURCE_URL_OR_SHA")
    return docs


def quarter_on_cover(pages):
    cover=normalize(" ".join(pages[:3]))
    return bool(re.search(
        r"(?:\b3(?:e|eme|er)?\s*(?:trimestre|trim)\s*(?:de\s*)?2026\b"
        r"|\b(?:t|q)3\s*2026\b|\b(?:au\s*)?30\s+septembre\s+2026\b"
        r"|\b2026\s*(?:t3|3e\s*trimestre)\b)",cover))


def identity_on_pdf(text,slug):
    n=normalize(text)
    return ("buroboutic" in n if slug=="buroboutic-metropoles"
            else ("perial grand paris" in n or "perialgrandparis" in
                  n.replace(" ","")))


def page_excerpt(page):
    text=normalize(page)
    matches=list(re.finditer(r"\btof\b|occupation\s+financier|vacants\s+en\s+restructuration",text))
    return [text[max(0,m.start()-135):min(len(text),m.end()+230)]
            for m in matches[:6]]


def safe_error(exc):
    code=str(exc).split(":",1)[0].strip()
    return code if re.fullmatch("[A-Z][A-Z0-9_]{3,69}",code) else "PDF_SOURCE_AUDIT_BLOCKED"


def inspect_case(doc,out,loader=download_official):
    entry={"scpi_slug":doc["slug"],"period":doc["period"],"official_url":doc["source_url"],
           "expected_sha256":doc["sha256"],
           "conflict_kind":doc["conflict_kind"],
           "financial_certified":False,"deploy_allowed":False}
    try:
        raw,final_url=loader(doc["source_url"],doc["issuer_hosts"])
        if final_url!=doc["source_url"]:
            raise ValueError("SOURCE_URL_CHANGED_AFTER_FETCH")
        if not raw.startswith(b"%PDF"):
            raise ValueError("ISSUER_NOT_PDF")
        digest=hashlib.sha256(raw).hexdigest()
        if digest!=doc["sha256"]:
            raise ValueError("ISSUER_PDF_HASH_CHANGED")
        issuer_dir=out/"official-pdfs"
        issuer_dir.mkdir(parents=True,exist_ok=True)
        path=issuer_dir/(digest+".pdf")
        path.write_bytes(raw)
        with fitz.open(stream=raw,filetype="pdf") as f:
            if f.needs_pass or not 1<=len(f)<=250:
                raise ValueError("INVALID_PDF_STRUCTURE")
            mu=[p.get_text("text") for p in f]
            if doc["evidence_page"]>len(f):
                raise ValueError("TOF_EVIDENCE_PAGE_OUT_OF_RANGE")
            image_dir=out/"evidence-pages"
            image_dir.mkdir(parents=True,exist_ok=True)
            f[doc["evidence_page"]-1].get_pixmap(
                matrix=fitz.Matrix(1.35,1.35)).save(
                    image_dir/(doc["slug"]+"-"+doc["period"]+"-tof.png"))
        res=subprocess.run(["pdftotext","-layout",str(path),"-"],
                           capture_output=True,text=True,timeout=60,check=True)
        pop=[p for p in res.stdout.split("\f") if p.strip()]
        if len(mu)!=len(pop):
            raise ValueError("INDEPENDENT_PAGE_COUNT_MISMATCH")
        for pages in (mu,pop):
            if not identity_on_pdf(" ".join(pages),doc["slug"]):
                raise ValueError("FUND_IDENTITY_NOT_MATCHED_BOTH_READERS")
            if not quarter_on_cover(pages):
                raise ValueError("T3_2026_PERIOD_UNCONFIRMED_BOTH_READERS")
        entry.update(status="pdf_binary_verified",pdf_sha256=digest,
                     page_count=len(mu),identity_verified=True,
                     period_verified=True,independent_readers=["MuPDF","Poppler"],
                     mufitz_context=page_excerpt(mu[doc["evidence_page"]-1]),
                     poppler_context=page_excerpt(pop[doc["evidence_page"]-1]),
                     metric_status="independent_financial_qa_required")
    except Exception as error:
        entry.update(status="blocked",error_code=safe_error(error),
                     metric_status="no_financial_qa_admission")
    return entry


def run(manifest,out):
    docs=validate(manifest)
    out.mkdir(parents=True,exist_ok=True)
    data=[inspect_case(doc,out) for doc in docs]
    result={"status":"read_only_source_review","sources_verified":sum(
                d["status"]=="pdf_binary_verified" for d in data),
            "sources_blocked":sum(d["status"]=="blocked" for d in data),
            "financial_certified":False,"deploy_allowed":False,"cases":data}
    (out/"proof.json").write_text(json.dumps(result,indent=2,ensure_ascii=False)+"\n")
    for row in data:
        print("TOF_SOURCE_REVIEW",row["scpi_slug"],row["status"],
              row.get("error_code",""),"financial_certified=false",flush=True)
    return result


def main():
    p=argparse.ArgumentParser()
    p.add_argument("--manifest",type=Path,required=True)
    p.add_argument("--out",type=Path,required=True)
    args=p.parse_args()
    proof=run(json.loads(args.manifest.read_text()),args.out)
    print("TOF source binaries verified",proof["sources_verified"],"/2",flush=True)
    if proof["sources_verified"]==0:
        raise SystemExit(1)


if __name__=="__main__":
    main()
