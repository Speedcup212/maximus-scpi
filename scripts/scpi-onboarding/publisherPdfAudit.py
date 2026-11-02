#!/usr/bin/env python3
"""Read-only publisher PDF audit. Never certifies finance, modifies DB, or publishes."""
import argparse
import hashlib
import json
import re
import unicodedata
import urllib.request
import os
import subprocess
import tempfile
from pathlib import Path
from urllib.parse import urlsplit
import fitz

MAX_BYTES = 16_000_000

def normalize(value):
    value=unicodedata.normalize("NFKD",value or "")
    return re.sub(r"\s+"," ","".join(c for c in value if not unicodedata.combining(c))).lower()

def official_url(url, hosts):
    try:
        u=urlsplit(url)
        return u.scheme=="https" and u.hostname in hosts and u.username is None and u.password is None and u.port in (None,443) and bool(u.path)
    except (ValueError,TypeError):
        return False

def download(url):
    # curl uses the OS trust store on the GitHub runner. TLS verification stays ON.
    # No --insecure, no disabled certificate validation, no untrusted origin.
    with tempfile.TemporaryDirectory(prefix="scpi-issuer-") as tmp:
        dest=Path(tmp)/"issuer.pdf"
        command=["curl","--fail","--silent","--show-error","--location",
                 "--proto","=https","--proto-redir","=https",
                 "--max-redirs","3","--max-time","80",
                 "--max-filesize",str(MAX_BYTES),
                 "--user-agent","Mozilla/5.0",
                 "--output",str(dest),"--write-out","%{url_effective}",url]
        trust_bundle=os.environ.get("SCPI_PUBLISHER_CA_BUNDLE")
        if trust_bundle:
            if not Path(trust_bundle).is_file():raise ValueError("VERIFIED_CHAIN_BUNDLE_MISSING")
            command[1:1]=["--cacert",trust_bundle]
        result=subprocess.run(command,capture_output=True,text=True,timeout=90,check=False)
        if result.returncode!=0:
            raise ValueError("PUBLISHER_HTTPS_FETCH_FAILED:"+result.stderr.strip()[:240])
        return dest.read_bytes(),result.stdout.strip()

def audit_document(d,c,fetcher=download):
    kind=d.get("kind")
    period=d.get("reference_period")
    url=d.get("url","")
    hosts=c.get("issuer_hosts",[])
    if kind not in {"quarterly","annual"} or not isinstance(period,str) or not official_url(url,hosts):
        raise ValueError("SOURCE_MANIFEST_INVALID_OR_UNTRUSTED")
    raw,final_url=fetcher(url)
    if not official_url(final_url,hosts):raise ValueError("REDIRECT_OUTSIDE_ISSUER_HOST")
    if not raw.startswith(b"%PDF") or len(raw)>MAX_BYTES or len(raw)<800:
        raise ValueError("INVALID_OR_OVERSIZED_PDF")
    sha=hashlib.sha256(raw).hexdigest()
    with fitz.open(stream=raw,filetype="pdf") as pdf:
        if not pdf.is_pdf or pdf.needs_pass or len(pdf)==0:raise ValueError("INVALID_PDF_STRUCTURE")
        pages=[normalize(p.get_text(sort=True)) for p in pdf]
    if sum(map(len,pages))<1500:raise ValueError("NATIVE_TEXT_LAYER_INSUFFICIENT")
    opening=" ".join(pages[:2])
    if normalize(c.get("name")) not in opening:raise ValueError("FUND_IDENTITY_NOT_FOUND")
    if kind=="quarterly":
        if not re.fullmatch(r"20\d{2}-T[1-4]",period):raise ValueError("INVALID_QUARTER_PERIOD")
        quarter=period[-1]
        year=period[:4]
        rx=r"\b"+quarter+r"(?:e|eme|er)?\s*(?:trimestre|trim)\b[\W\s]{0,15}"+year+r"\b|\b(?:t|q)"+quarter+r"\s*"+year+r"\b"
        if not re.search(rx,opening):
            raise ValueError("QUARTER_TITLE_UNCONFIRMED:"+opening[:160])
    else:
        if not re.fullmatch(r"20\d{2}-RA",period):raise ValueError("INVALID_ANNUAL_PERIOD")
        if period[:4] not in opening or not re.search(r"rapport annuel|rapport de gestion|exercice",opening):
            raise ValueError("ANNUAL_TITLE_UNCONFIRMED:"+opening[:160])
    hints=[]
    for hint in d.get("page_hints",[]):
        number=hint.get("page")
        token=normalize(hint.get("token",""))
        found=isinstance(number,int) and 1<=number<=len(pages) and bool(token) and token in pages[number-1]
        hints.append({"field":hint.get("field"),"page":number,"expected_token":hint.get("token"),
                      "token_found_in_page_text":bool(found),"financially_certified":False})
    return {"kind":kind,"reference_period":period,"source_url":final_url,"sha256":sha,
            "page_count":len(pages),"native_text_characters":sum(map(len,pages)),
            "publisher_binary_pass":True,"fund_and_period_identity_pass":True,
            "page_hints":hints,"all_hints_found":all(h["token_found_in_page_text"] for h in hints),
            "financial_metrics_certified":False,"publication_authorized":False}

def audit_manifest(m,fetcher=download):
    c=m.get("candidate",{})
    documents=c.get("documents",[])
    if (m.get("schema_version")!=1 or m.get("mode")!="new" or c.get("status")!="DISCOVERED_ONLY"
        or c.get("document_sha256") is not None or not isinstance(documents,list) or not documents
        or len(set((d.get("kind"),d.get("reference_period")) for d in documents))!=len(documents)):
        raise ValueError("INCOMPLETE_OR_UNSAFE_MANIFEST")
    results=[audit_document(d,c,fetcher) for d in documents]
    return {"task":"RECOVERY-070","batch_id":m.get("batch_id"),"slug":c.get("slug"),
            "status":"ISSUER_BINARY_QA_PASS","documents":results,
            "source_review":"TECHNICAL_ONLY_NO_FINANCIAL_APPROVAL","staging_written":False,
            "publication_authorized":False}

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--manifest",required=True)
    parser.add_argument("--output",required=True)
    args=parser.parse_args()
    m=json.loads(Path(args.manifest).read_text(encoding="utf-8"))
    try:
        result=audit_manifest(m)
    except Exception as e:
        result={"task":"RECOVERY-070","status":"ISSUER_BINARY_QA_FAIL",
                "error":str(e),"publication_authorized":False}
        Path(args.output).parent.mkdir(parents=True,exist_ok=True)
        Path(args.output).write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n")
        print(json.dumps(result,ensure_ascii=False))
        raise SystemExit(1)
    Path(args.output).parent.mkdir(parents=True,exist_ok=True)
    Path(args.output).write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n")
    print(json.dumps(result,ensure_ascii=False,indent=2))

if __name__=="__main__":
    main()
