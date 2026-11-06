#!/usr/bin/env python3
"""RECOVERY-120: live binary proof for pre-registered official candidate PDFs.
Reuses publisherPdfAudit.audit_document; no Supabase write or financial PASS.
Only the manifest selected by the existing CONTROL task is accepted.
"""
from __future__ import annotations
import argparse
import ipaddress
import json
import os
from pathlib import Path
import re
import socket
import subprocess
import sys
import urllib.error
import urllib.request
from urllib.parse import urlsplit

sys.path.insert(0,str(Path(__file__).resolve().parents[1]/"scpi-onboarding"))
from publisherPdfAudit import MAX_BYTES, audit_document, normalize, official_url, semester_title_matches


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise ValueError("ISSUER_REDIRECT_NEEDS_INDEPENDENT_APPROVAL")


def public_host_addresses(host):
    try:
        infos=socket.getaddrinfo(host,443,type=socket.SOCK_STREAM)
        if not infos or any(not ipaddress.ip_address(item[4][0]).is_global for item in infos):
            raise ValueError("ISSUER_HOST_RESOLVES_NONPUBLIC")
    except socket.gaierror as exc:
        raise ValueError("ISSUER_DNS_UNAVAILABLE") from exc


def download_official(url,allowed_hosts):
    if not official_url(url,allowed_hosts):
        raise ValueError("UNAPPROVED_ISSUER_HOST")
    host=urlsplit(url).hostname
    public_host_addresses(host)
    opener=urllib.request.build_opener(NoRedirect())
    req=urllib.request.Request(url,headers={
        "User-Agent":"Mozilla/5.0 (compatible; MaximusSCPI-DocumentProof/1.0)",
        "Accept":"application/pdf"
    })
    with opener.open(req,timeout=45) as response:
        if not official_url(response.geturl(),allowed_hosts):
            raise ValueError("FINAL_URL_NOT_OFFICIAL")
        length=int(response.headers.get("Content-Length") or 0)
        if length>MAX_BYTES:raise ValueError("PDF_TOO_LARGE")
        data=response.read(MAX_BYTES+1)
        if len(data)>MAX_BYTES:raise ValueError("PDF_TOO_LARGE")
        return data,response.geturl()


def independent_poppler(pdf_path,fund_name,reference_period,kind,expected_page_count):
    p=subprocess.run(["pdftotext","-layout",str(pdf_path),"-"],capture_output=True,
                     text=True,check=False,timeout=35)
    if p.returncode!=0 or len(p.stdout)<300:
        raise ValueError("POPPLER_SOURCE_UNREADABLE")
    pages=[x for x in p.stdout.split("\f") if x.strip()]
    if len(pages)!=expected_page_count:
        raise ValueError("PDF_PAGE_COUNT_ENGINE_DISAGREEMENT")
    opening=normalize(" ".join(pages[:2]))
    alltext=normalize(" ".join(pages))
    name=normalize(fund_name)
    if name not in alltext and name.replace(" ","") not in alltext.replace(" ",""):
        raise ValueError("POPPLER_SCPI_IDENTITY_NOT_FOUND")
    if kind=="quarterly_bulletin":
        if not re.fullmatch(r"20\d{2}-T[1-4]",reference_period):
            raise ValueError("INVALID_QUARTER_PERIOD")
        quarter=reference_period[-1]
        year=reference_period[:4]
        rx=(r"\b"+quarter+r"(?:e|eme|er)?\s*(?:trimestre|trim)\b[\W\s]{0,15}"+
            year+r"\b|\b(?:t|q)"+quarter+r"\s*"+year+r"\b")
        if not re.search(rx,opening):
            raise ValueError("POPPLER_QUARTER_UNCONFIRMED")
    elif kind=="semiannual_bulletin":
        if not re.fullmatch(r"20\d{2}-S[12]",reference_period):
            raise ValueError("INVALID_SEMESTER_PERIOD")
        if not semester_title_matches(opening,reference_period):
            raise ValueError("POPPLER_SEMESTER_UNCONFIRMED")
    else:
        if not re.fullmatch(r"20\d{2}-RA",reference_period):
            raise ValueError("INVALID_ANNUAL_PERIOD")
        # Keep the title on the cover, but accept fiscal-year evidence in the
        # next two pages: AEW's cover and management page omit the fiscal year.
        fiscal_window=normalize(" ".join(pages[:4]))
        fiscal_year=reference_period[:4]
        fiscal_date=re.search(r"\b31\s+decembre\s+"+fiscal_year+r"\b",fiscal_window)
        if not re.search(r"rapport annuel|rapport de gestion|exercice",opening) or (
          fiscal_year not in opening and not fiscal_date
        ):
            raise ValueError("POPPLER_ANNUAL_TITLE_UNCONFIRMED")
    return len(pages)


def validate_manifest(manifest):
    if manifest.get("exists") is False:
        return None
    slug=manifest.get("candidate_slug")
    name=manifest.get("candidate_name")
    docs=manifest.get("documents")
    hosts=manifest.get("allowed_hosts")
    if manifest.get("exists") is not True or not isinstance(slug,str) or not re.fullmatch(
        r"[a-z0-9-]{2,100}",slug) or not isinstance(name,str) or not name.strip() or not isinstance(
        docs,list) or len(docs)>8 or not isinstance(hosts,list) or not hosts or any(
        not isinstance(h,str) or not h or h!=h.lower() for h in hosts):
        raise ValueError("UNTRUSTED_CANDIDATE_MANIFEST")
    allowed=set(hosts)
    for doc in docs:
        if not isinstance(doc,dict) or doc.get("document_kind") not in (
            "quarterly_bulletin","semiannual_bulletin","annual_report") or not isinstance(doc.get("source_url"),str) or not official_url(
            doc["source_url"],list(allowed)) or not re.fullmatch(
            r"[a-f0-9]{64}",doc.get("pdf_sha256","")) or not isinstance(
            doc.get("page_count"),int) or doc["page_count"]<1:
            raise ValueError("UNTRUSTED_SOURCE_MANIFEST")
    return manifest


def document_proof(doc,manifest,archive_dir,auditor=audit_document,checker=independent_poppler):
    kind={"quarterly_bulletin":"quarterly","semiannual_bulletin":"semiannual","annual_report":"annual"}[doc["document_kind"]]
    requested=doc["source_url"]
    c={"name":manifest["candidate_name"],"issuer_hosts":manifest["allowed_hosts"]}
    source={"kind":kind,"reference_period":doc["source_period"],"url":requested}
    def fetcher(url):
        return download_official(url,c["issuer_hosts"])
    try:
        result=auditor(source,c,fetcher=fetcher)
        actual=result.get("sha256")
        archive=result.get("archive_assets") or {}
        pdf=archive_dir/str(archive.get("pdf",""))
        if actual!=doc["pdf_sha256"]:
            raise ValueError("PUBLISHER_PDF_SHA_CHANGED")
        if result.get("page_count")!=doc["page_count"]:
            raise ValueError("PUBLISHER_PAGE_COUNT_CHANGED")
        if not pdf.is_file():
            raise ValueError("PDF_ARCHIVE_NOT_WRITTEN")
        checker(pdf,manifest["candidate_name"],doc["source_period"],
                doc["document_kind"],doc["page_count"])
        return {"status":"verified","source_url":requested,
                "source_period":doc["source_period"],"document_kind":doc["document_kind"],
                "pdf_sha256":actual,"page_count":doc["page_count"],
                "reader_engines":["MuPDF","Poppler"],
                "identity_verified":True,"period_verified":True,
                "binary_hash_matches_registered":True,
                "financial_certified":False}
    except Exception as exc:
        code=str(exc).split(":",1)[0][:70]
        if not re.fullmatch(r"[A-Z][A-Z0-9_]{3,69}",code):
            code="ISSUER_BINARY_PROOF_FAILED"
        diagnostic={}
        if code in ("SEMESTER_TITLE_UNCONFIRMED","ANNUAL_TITLE_UNCONFIRMED"):
            # Existing publisher audit embeds a short normalized cover excerpt.
            # This remains a blocked document: never turn diagnostics into PASS.
            excerpt=str(exc).partition(":")[2]
            diagnostic["cover_text_excerpt"]=re.sub(
                r"[^a-z0-9A-Z\s.,;:()%-]"," ",excerpt)[:180]
        return {"status":"blocked","source_url":requested,
                "source_period":doc["source_period"],"document_kind":doc["document_kind"],
                "expected_sha256":doc["pdf_sha256"],
                "error_code":code,"financial_certified":False,**diagnostic}


def run_manifest(manifest,output_dir,auditor=audit_document,checker=independent_poppler):
    valid=validate_manifest(manifest)
    if valid is None:
        return {"status":"no_candidate","candidate_slug":None,"documents":[],
                "financial_certified":False,"deploy_allowed":False}
    docs=valid["documents"]
    if not docs:
        return {"status":"no_verified_documents","candidate_slug":valid["candidate_slug"],
                "documents":[],"financial_certified":False,"deploy_allowed":False}
    archive=output_dir/"official-pdf-archive"
    archive.mkdir(parents=True,exist_ok=True)
    os.environ["SCPI_PDF_ARCHIVE_DIR"]=str(archive)
    records=[document_proof(doc,valid,archive,auditor,checker) for doc in docs]
    return {"status":"verified" if all(x["status"]=="verified" for x in records) else "blocked",
            "candidate_slug":valid["candidate_slug"],
            "documents":records,"financial_certified":False,"deploy_allowed":False}


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--manifest",type=Path,required=True)
    parser.add_argument("--out",type=Path,required=True)
    args=parser.parse_args()
    args.out.mkdir(parents=True,exist_ok=True)
    try:
        manifest=json.loads(args.manifest.read_text(encoding="utf-8"))
        result=run_manifest(manifest,args.out)
    except Exception as exc:
        result={"status":"blocked","candidate_slug":None,"documents":[],
            "error_code":"MANIFEST_OR_RUNTIME_REJECTED",
            "financial_certified":False,"deploy_allowed":False}
        print(type(exc).__name__+": rejected manifest or runtime",flush=True)
    (args.out/"proof.json").write_text(json.dumps(result,indent=2,ensure_ascii=False)+"\n",
                                        encoding="utf-8")
    print("CANDIDATE_BINARY_PROOF status="+result["status"]+
          " documents="+str(len(result["documents"]))+
          " certified=false",flush=True)
    if result["status"]=="blocked":raise SystemExit(1)


if __name__=="__main__":
    main()
