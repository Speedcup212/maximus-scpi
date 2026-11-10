#!/usr/bin/env python3
"""Source-only discovery of 2026-T3 Sofidy original PDFs, no financial writes.

A live publisher article is untrusted input: URL allowlist, TLS with trusted CA,
strict download size, and exact original fund+period proof are mandatory.
"""
import argparse
import html
import json
import os
from html.parser import HTMLParser
from pathlib import Path
import re
import subprocess
import sys
import tempfile
from urllib.parse import urljoin,urlsplit,unquote

import fitz

sys.path.insert(0,str(Path(__file__).resolve().parent))
import publisher_family_proof as issuer

ARTICLE="https://www.sofidy.com/actualites/scpi-sofidy-les-bulletins-trimestriels-du-3eme-trimestre-2026/"
FUNDS={
 "sofiboutique":("Sofiboutique","https://www.sofidy.com/solutions/sofiboutique/"),
 "sofipierre":("Sofipierre","https://www.sofidy.com/solutions/sofipierre/"),
 "sofidy-europe-invest":("Sofidy Europe Invest","https://www.sofidy.com/solutions/sofidy-europe-invest/")
}
class Links(HTMLParser):
    def __init__(self):
        super().__init__();self.hrefs=[]
    def handle_starttag(self,tag,attrs):
        if tag=="a":
            a=dict(attrs)
            if "href" in a:self.hrefs.append(html.unescape(a["href"]))

def issuer_pdf_links(page_text):
    parser=Links();parser.feed(page_text)
    seen=set()
    for href in parser.hrefs:
        url=urljoin(ARTICLE,href).split("#",1)[0]
        u=urlsplit(url)
        if (u.scheme=="https" and u.hostname=="www.sofidy.com"
            and u.path.startswith("/app/uploads/") and unquote(u.path).lower().endswith(".pdf")
            and url not in seen):
            seen.add(url);yield url

def fetch_official_article():
    trusted_bundle=os.environ.get("SCPI_PUBLISHER_CA_BUNDLE")
    if not trusted_bundle or not Path(trusted_bundle).is_file():
        raise ValueError("VERIFIED_PUBLISHER_CA_BUNDLE_REQUIRED")
    issuer.proof.public_host_addresses("www.sofidy.com")
    with tempfile.TemporaryDirectory(prefix="sofidy-news-") as root:
        out=Path(root)/"news.html"
        cmd=["curl","--fail","--silent","--show-error","--proto","=https",
             "--max-redirs","0","--connect-timeout","15","--max-time","50",
             "--max-filesize","2000000","--cacert",trusted_bundle,
             "--output",str(out),ARTICLE]
        run=subprocess.run(cmd,text=True,capture_output=True,timeout=60,check=False)
        if run.returncode!=0:raise ValueError("OFFICIAL_ARTICLE_TLS_FETCH_FAILED:"+run.stderr[:150])
        raw=out.read_bytes()
        if not 200<len(raw)<2000000:raise ValueError("OFFICIAL_ARTICLE_BAD_SIZE")
        return raw.decode("utf-8","replace")

def find_latest_publisher_proofs():
    links=list(issuer_pdf_links(fetch_official_article()))
    if len(links)>30:raise ValueError("TOO_MANY_UNTRUSTED_PUBLISHER_LINKS")
    if not links:raise ValueError("NO_PUBLISHER_PDF_LINKS_IN_2026_T3_ARTICLE")
    result={slug:None for slug in FUNDS}
    for url in links:
        if all(result.values()):break
        # An issuer-host PDF href is not sufficient evidence of content.
        binary,final=issuer.fetch_verified_curl(url,["www.sofidy.com"])
        if final!=url:continue
        try:
            with fitz.open(stream=binary,filetype="pdf") as pdf:
                first=" ".join(pdf[i].get_text("text",sort=True) for i in range(min(2,len(pdf))))
        except Exception:
            continue
        text=issuer.original.normalize(first).lower()
        if "2026" not in text or not re.search(r"3\s*(?:e|eme|ieme)?\s*trimestre",text):
            continue
        for slug,(name,page) in FUNDS.items():
            if result[slug] is not None:continue
            n=issuer.original.normalize(name).lower()
            if n not in text:continue
            manifest={"version":1,"publisher":"Sofidy","approved_hosts":["www.sofidy.com"],
               "documents":[{"slug":slug,"name":name,"source_page":page,
               "source_url":url,"period":"2026-T3","kind":"quarterly_bulletin"}]}
            try:proof=issuer.verify_one(manifest,slug)
            except Exception as err:
                result[slug]={"slug":slug,"status":"BLOCKED","reason_code":str(err)[:170],
                              "financial_certified":False,"publication_authorized":False}
                continue
            result[slug]={**proof,"candidate_slug":slug,"financial_certified":False,
                          "publication_authorized":False,"staging_written":False}
    for slug in FUNDS:
        if result[slug] is None:
            result[slug]={"candidate_slug":slug,"status":"NO_VERIFIED_2026_T3_PDF_FOUND",
                          "financial_certified":False,"publication_authorized":False}
    return {"source_article":ARTICLE,"candidate_pdf_links":len(links),
            "proven_documents":list(result.values()),"financial_certified":False,
            "publication_authorized":False,"database_modified":False}

def main():
    a=argparse.ArgumentParser();a.add_argument("--out",required=True);args=a.parse_args()
    path=Path(args.out);path.parent.mkdir(parents=True,exist_ok=True)
    try:
        result=find_latest_publisher_proofs()
        good=sum(x.get("status")=="ISSUER_BINARY_PROVEN" for x in result["proven_documents"])
        result["verified_fund_count"]=good
        code=0 if good==3 else 1
    except Exception as err:
        result={"source_article":ARTICLE,"status":"BLOCKED","reason_code":str(err)[:180],
                "verified_fund_count":0,"financial_certified":False,
                "publication_authorized":False,"database_modified":False};code=1
    path.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(result,ensure_ascii=False))
    raise SystemExit(code)

if __name__=="__main__":main()
