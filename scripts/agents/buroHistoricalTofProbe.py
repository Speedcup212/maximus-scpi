#!/usr/bin/env python3
"""Read-only revalidation of two quarantined 2026 Buroboutic TOF periods.

This is a diagnostic plugged into existing PDF proof and official source
transport, NOT a new certifier or agent. A past value in quarantine is NEVER
a certified number. No database privileges or publication action.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
from urllib.parse import urljoin, urlsplit

import fitz

from candidate_pdf_binary_proof import download_official, official_url, normalize
from tofIssuerBinaryReview import inspect_issuer_redirect, first_redirect_location

PINNED={
 "2026-T1":(
   "https://www.fiducial-gerance.fr/content/download/1634/43668?version=4",
   "cdcbef9488a16eb7bba36ba6eec72cde84881ab10a558d302ec4158bdecb2278"),
 "2026-T2":(
   "https://www.fiducial-gerance.fr/content/download/1410/40287?version=4",
   "2cc87a2cf3536f145bc6db7d71f8cef69190379fa2e2c369ae8052de896c99ba"),
}


def validate(manifest):
    docs=manifest.get("documents")
    if (manifest.get("financial_certified") is not False or
        manifest.get("deploy_allowed") is not False or
        manifest.get("issuer_hosts")!=["www.fiducial-gerance.fr"] or
        not isinstance(docs,list) or len(docs)!=2 or
        {d.get("period") for d in docs}!=set(PINNED)):
        raise ValueError("BURO_HISTORY_SOURCE_MANIFEST_INVALID")
    for doc in docs:
        expected=PINNED[doc["period"]]
        if (doc.get("scpi_slug")!="buroboutic-metropoles" or
            doc.get("name")!="Buroboutic Métropoles" or
            doc.get("source_url")!=expected[0] or
            doc.get("pdf_sha256")!=expected[1] or
            not re.fullmatch("[a-f0-9]{64}",doc["pdf_sha256"]) or
            not official_url(doc["source_url"],manifest["issuer_hosts"])):
            raise ValueError("BURO_HISTORY_SOURCE_PIN_MISMATCH")
    return docs


def quarter_visible(text,period):
    text=normalize(text)
    quarter=period[-1]
    return bool(re.search(
        rf"\b{quarter}(?:er|e|eme)?\s*(?:trimestre|trim)\s*(?:de\s*)?2026\b"
        rf"|\b(?:t|q){quarter}\s*2026\b"
        rf"|\b2026\s*(?:t{quarter}|{quarter}e\s*trimestre)\b",text))


def financial_page_clues(pages):
    records=[]
    for i,page in enumerate(pages):
        text=normalize(page)
        for m in list(re.finditer(r"taux d.?occupation financier|\btof\b",text))[:8]:
            excerpt=text[max(0,m.start()-175):m.end()+280]
            if "%" in excerpt and len(records)<20:
                records.append({"page":i+1,"context":excerpt})
    return records


def code_for(err):
    code=str(err).split(":",1)[0].strip()
    return code if re.fullmatch("[A-Z][A-Z0-9_]{3,69}",code) else "BURO_BINARY_SOURCE_FAILED"


T2_APPROVED_ISSUER_PDF_PATH=(
    "/content/download/1410/file/BTI%20Buroboutic%20T2%202026%20WEB.pdf"
)
T1_ALTERNATIVE_FROM_QUARANTINED_CERTIFICATE=(
    "https://www.fiducial-gerance.fr/content/download/1334/38495?version=5"
)


def fetch_pinned_t2_same_host(doc,hosts,loader=download_official,
                               location_probe=first_redirect_location):
    """Single issuer 302 for the exact T2 bulletin already independently seen.

    The original registered hash MUST be checked by inspect() after retrieval.
    """
    if doc["period"]!="2026-T2" or (
       doc["source_url"],doc["pdf_sha256"])!=PINNED["2026-T2"] or (
       hosts!=["www.fiducial-gerance.fr"]):
        raise ValueError("T2_REDIRECT_NOT_PINNED")
    target=urljoin(doc["source_url"],location_probe(doc["source_url"],hosts))
    parsed=urlsplit(target)
    if not (
        parsed.scheme=="https"
        and parsed.hostname=="www.fiducial-gerance.fr"
        and parsed.username is None
        and parsed.password is None
        and parsed.port in (None,443)
        and parsed.fragment==""
        and parsed.path==T2_APPROVED_ISSUER_PDF_PATH
        and official_url(target,hosts)
    ):
        raise ValueError("T2_OFFICIAL_PDF_REDIRECT_NOT_APPROVED")
    raw,final=loader(target,hosts)
    if final!=target:
        raise ValueError("T2_MULTIHOP_REDIRECT_REJECTED")
    return raw,final,{
        "approved_exact_issuer_host":parsed.hostname,
        "approved_exact_path":parsed.path,
        "query_omitted":True,
        "multihop_forbidden":True,
        "source_sha_still_needs_validation":True,
    }


def inspect(doc,hosts,out,loader=download_official):
    record={"scpi_slug":doc["scpi_slug"],"source_period":doc["period"],
            "original_issuer_url":doc["source_url"],
            "expected_sha256":doc["pdf_sha256"],
            "quarantined_value_not_certified":True,
            "financial_certified":False,"deploy_allowed":False}
    try:
        pinned_redirect=None
        try:
            raw,final=loader(doc["source_url"],hosts)
        except ValueError as err:
            if (doc["period"]=="2026-T2" and
                code_for(err)=="ISSUER_REDIRECT_NEEDS_INDEPENDENT_APPROVAL"):
                raw,final,pinned_redirect=fetch_pinned_t2_same_host(
                    doc,hosts,loader=loader)
            else:
                raise
        if final!=doc["source_url"] and pinned_redirect is None:
            raise ValueError("OFFICIAL_SOURCE_URL_CHANGED")
        if not raw.startswith(b"%PDF"):
            raise ValueError("ISSUER_SOURCE_NOT_PDF")
        sha=hashlib.sha256(raw).hexdigest()
        if sha!=doc["pdf_sha256"]:
            raise ValueError("OFFICIAL_BINARY_SHA_CHANGED")
        path=out/"original-pdfs"/(sha+".pdf")
        path.parent.mkdir(parents=True,exist_ok=True)
        path.write_bytes(raw)
        with fitz.open(stream=raw,filetype="pdf") as pdf:
            if pdf.needs_pass or not 1<=len(pdf)<=250:
                raise ValueError("OFFICIAL_PDF_INVALID_STRUCTURE")
            mupages=[p.get_text("text") for p in pdf]
        check=subprocess.run(["pdftotext","-layout",str(path),"-"],
                             capture_output=True,text=True,timeout=60,check=True)
        popages=[x for x in check.stdout.split("\f") if x.strip()]
        if len(mupages)!=len(popages):
            raise ValueError("INDEPENDENT_READER_PAGE_COUNT_CONFLICT")
        for pages in (mupages,popages):
            if not quarter_visible(" ".join(pages[:3]),doc["period"]):
                raise ValueError("OFFICIAL_PERIOD_COVER_UNCONFIRMED")
            if "buroboutic" not in normalize(" ".join(pages)):
                raise ValueError("OFFICIAL_SCPI_IDENTITY_MISSING")
        if pinned_redirect is not None:
            pinned_redirect["source_sha_still_needs_validation"]=False
            record["issuer_redirect"]=pinned_redirect
        record.update(status="pdf_binary_verified_only",sha256=sha,
                      page_count=len(mupages),
                      readers=["MuPDF","Poppler"],
                      period_verified=True,
                      issuer_identity_verified=True,
                      metric_candidates_unverified={
                         "MuPDF":financial_page_clues(mupages),
                         "Poppler":financial_page_clues(popages)})
    except Exception as error:
        ec=code_for(error)
        record.update(status="blocked",error_code=ec)
        if ec=="ISSUER_REDIRECT_NEEDS_INDEPENDENT_APPROVAL":
            record["first_redirect"]=inspect_issuer_redirect(
                doc["source_url"],hosts)
            if doc["period"]=="2026-T1":
                # Historical certificate has a different issuer URL, but
                # no trusted same-period binary exists yet. Discover only.
                record["alternative_issuer_url_diagnostic"]=inspect_issuer_redirect(
                    T1_ALTERNATIVE_FROM_QUARANTINED_CERTIFICATE,hosts)
                if "Note%20d%27information%20et%20statuts" in str(
                    record["first_redirect"].get("destination_path","")):
                    record["error_code"]="T1_REGISTERED_SOURCE_IS_INFORMATION_NOTE"
    return record


def main():
    p=argparse.ArgumentParser()
    p.add_argument("--manifest",type=Path,required=True)
    p.add_argument("--out",type=Path,required=True)
    a=p.parse_args()
    a.out.mkdir(parents=True,exist_ok=True)
    m=json.loads(a.manifest.read_text(encoding="utf8"))
    docs=validate(m)
    findings=[inspect(d,m["issuer_hosts"],a.out) for d in docs]
    result={"issuer":"FIDUCIAL Gérance",
            "documents_checked":len(findings),
            "binary_verified_count":sum(z["status"]=="pdf_binary_verified_only" for z in findings),
            "blocked_count":sum(z["status"]=="blocked" for z in findings),
            "financial_certified":False,"deploy_allowed":False,
            "status":"diagnostic_only","documents":findings}
    (a.out/"proof.json").write_text(
        json.dumps(result,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
    for f in findings:
        print("BURO_HISTORY",f["source_period"],f["status"],
              f.get("error_code",""),flush=True)
    print("BURO_HISTORY_FOUND",result["binary_verified_count"],"/2",
          "financial_certified=false",flush=True)


if __name__=="__main__":
    main()
