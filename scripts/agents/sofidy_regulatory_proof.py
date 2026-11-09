#!/usr/bin/env python3
"""RECOVERY-201: proof of the exact Sofidy DIC/Note original, not release approval.

No database writes and no elevation of publication or financial status.
Uses publisher PDF audit + independent Poppler reader against original bytes.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import publisher_family_proof as family

KINDS={"dic":r"document d.informations cles","note":r"note d.information"}
MAX_PAGE_COUNT=200

def validate(m, slug, kind):
    if (not isinstance(m,dict) or m.get("version")!=1 or
        m.get("publisher")!="Sofidy" or
        set(m.get("approved_hosts") or [])!={"www.sofidy.com"} or
        m.get("data_mutation") is not False or
        m.get("financial_certification") is not False):
        raise ValueError("UNTRUSTED_REGULATORY_MANIFEST")
    candidates=m.get("candidates") or []
    if (len(candidates)!=3 or len({c.get("slug") for c in candidates})!=3 or
        any(len(c.get("documents") or [])!=2 for c in candidates)):
        raise ValueError("UNTRUSTED_REGULATORY_SET")
    selected=[c for c in candidates if c.get("slug")==slug]
    if len(selected)!=1:raise ValueError("UNREGISTERED_SCPI")
    c=selected[0]
    if not isinstance(c.get("name"),str) or not family.original.official_url(c.get("source_page"),{"www.sofidy.com"}):
        raise ValueError("UNTRUSTED_SCPI_IDENTITY")
    docs=c.get("documents")
    if {d.get("kind") for d in docs}!={"dic","note"}:
        raise ValueError("INVALID_DOCUMENT_KINDS")
    selected_doc=[d for d in docs if d["kind"]==kind]
    if len(selected_doc)!=1:raise ValueError("UNREGISTERED_REGULATORY_KIND")
    d=selected_doc[0]
    if d.get("reference_period")!="2026-REG":
        raise ValueError("WRONG_REGULATORY_DOCUMENT_PERIOD")
    if (not family.original.official_url(d.get("source_url"),{"www.sofidy.com"})
        or not d["source_url"].lower().endswith(".pdf")):
        raise ValueError("UNTRUSTED_DOCUMENT_URL")
    return c,d

def verify_poppler(pdf, fund_name, expected_kind, pages):
    r=subprocess.run(["pdftotext","-layout",str(pdf),"-"],
        capture_output=True,text=True,timeout=50,check=False)
    if r.returncode!=0 or len(r.stdout)<800:
        raise ValueError("INDEPENDENT_READER_NO_TEXT")
    text_pages=r.stdout.split("\f")
    if text_pages and not text_pages[-1].strip():text_pages.pop()
    if len(text_pages)!=pages:raise ValueError("INDEPENDENT_READER_PAGES_DIFFER")
    text=family.original.normalize(" ".join(text_pages))
    name=family.original.normalize(fund_name)
    if name not in text and name.replace(" ","") not in text.replace(" ",""):
        raise ValueError("INDEPENDENT_READER_WRONG_FUND")
    if not re.search(KINDS[expected_kind],text[:20000]):
        raise ValueError("INDEPENDENT_READER_WRONG_DOCUMENT_KIND")
    if "2026" not in text[:20000]:
        raise ValueError("INDEPENDENT_READER_EDITION_YEAR_MISSING")
    return len(text)

def prove_regulatory(m,slug,kind,auditor=None,readback=None):
    c,d=validate(m,slug,kind)
    auditor=auditor or family.original.audit_document
    readback=readback or verify_poppler
    with tempfile.TemporaryDirectory(prefix="sofidy-regulatory-") as tmp:
        previous=os.environ.get("SCPI_PDF_ARCHIVE_DIR")
        os.environ["SCPI_PDF_ARCHIVE_DIR"]=tmp
        try:
            source={"kind":kind,"reference_period":"2026-REG","url":d["source_url"]}
            issuer={"name":c["name"],"issuer_hosts":["www.sofidy.com"]}
            proof=auditor(source,issuer,fetcher=lambda url:family.fetch_verified_curl(url,["www.sofidy.com"]))
            sha=proof.get("sha256")
            if not isinstance(sha,str) or not re.fullmatch("[0-9a-f]{64}",sha):
                raise ValueError("PDF_SHA_MISSING")
            pdf=Path(tmp)/(sha+".pdf")
            if not pdf.is_file() or hashlib.sha256(pdf.read_bytes()).hexdigest()!=sha:
                raise ValueError("ORIGINAL_PDF_ARCHIVE_MISMATCH")
            page_count=proof.get("page_count")
            if (not isinstance(page_count,int) or not 1<=page_count<=MAX_PAGE_COUNT
                or not proof.get("publisher_binary_pass")
                or not proof.get("fund_and_period_identity_pass")):
                raise ValueError("PUBLISHER_DOCUMENT_IDENTITY_NOT_PROVEN")
            native=proof.get("native_text_characters")
            if not isinstance(native,int) or native<1500:
                raise ValueError("INSUFFICIENT_NATIVE_TEXT")
            independent_chars=readback(pdf,c["name"],kind,page_count)
            if independent_chars<800:raise ValueError("INDEPENDENT_TEXT_INSUFFICIENT")
            return {"scpi_slug":slug,"name":c["name"],"kind":kind,
                    "reference_period":"2026-REG",
                    "official_page_url":c["source_page"],
                    "source_url":proof["source_url"],"pdf_sha256":sha,
                    "page_count":page_count,"native_text_characters":native,
                    "independent_text_characters":independent_chars,
                    "reader_engines":["MuPDF","Poppler"],
                    "identity_verified":True,"kind_verified":True,
                    "status":"REGULATORY_ORIGINAL_BINARY_VERIFIED",
                    "regulatory_review_complete":False,
                    "financial_certified":False,"publication_authorized":False,
                    "staging_written":False}
        finally:
            if previous is None:os.environ.pop("SCPI_PDF_ARCHIVE_DIR",None)
            else:os.environ["SCPI_PDF_ARCHIVE_DIR"]=previous

def main():
    cli=argparse.ArgumentParser()
    cli.add_argument("--manifest",type=Path,required=True)
    cli.add_argument("--slug",required=True)
    cli.add_argument("--kind",choices=["dic","note"],required=True)
    cli.add_argument("--output",type=Path,required=True)
    args=cli.parse_args()
    args.output.parent.mkdir(parents=True,exist_ok=True)
    try:
        result=prove_regulatory(json.loads(args.manifest.read_text()),args.slug,args.kind)
    except Exception as error:
        result={"scpi_slug":args.slug,"kind":args.kind,"status":"BLOCKED",
            "error_code":str(error)[:180],"financial_certified":False,
            "publication_authorized":False,"staging_written":False}
        args.output.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n")
        print(json.dumps(result,ensure_ascii=False))
        raise SystemExit(1)
    args.output.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n")
    print(json.dumps(result,ensure_ascii=False))

if __name__=="__main__":
    main()
