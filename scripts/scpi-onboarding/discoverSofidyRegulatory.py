#!/usr/bin/env python3
"""Read-only official Sofidy regulatory PDF link discovery.

The returned URLs are candidate sources only. No PDF SHA, approval or release
is manufactured from hyperlinks. A second PDF-specific verification is required.
"""
import argparse
import html
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import subprocess
from urllib.parse import urljoin, urlsplit, unquote

PUBLISHER = "https://www.sofidy.com/solutions/sofidynamic/"
ALLOWED = {"www.sofidy.com", "sofidy.com"}
MAX_HTML = 3_000_000

class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in ("a", "iframe", "embed", "object", "source"):
            for key in ("href", "src", "data", "data-url"):
                if attrs.get(key):
                    self.urls.append(attrs[key])

def valid_pdf_url(url):
    try:
        u = urlsplit(url)
        return (u.scheme == "https" and u.hostname in ALLOWED and
                u.username is None and u.password is None and u.port in (None,443)
                and u.path.lower().endswith(".pdf"))
    except (ValueError,TypeError):
        return False

def classify(url):
    name = unquote(urlsplit(url).path.rsplit("/",1)[-1]).lower()
    if re.search(r"(?:^|[-_])(?:st[-_]dy|statuts[-_].*dynamic|stat.*sofidynamic)",name):
        return "statutes"
    if re.search(r"(?:^|[-_])(?:ni[-_]dyn|note[-_].*dynamic|ni.*sofidynamic)",name):
        return "note"
    if re.search(r"(?:^|[-_])(?:dic[-_]dy|dic[-_]dyn|dic.*sofidynamic)",name):
        return "dic"
    if "sofidynamic" in name or "-dyn-" in name:
        return "other_sofidynamic_pdf"
    return None

def discover(text):
    text = html.unescape(text.replace("\\/","/").replace("\\u002f","/"))
    parser = Links()
    parser.feed(text)
    raw = parser.urls + re.findall(r"https?://[^\s\"'<>{}]+?\.pdf(?:\?[^\s\"'<>{}]*)?", text, flags=re.I)
    urls = sorted({urljoin(PUBLISHER,x.strip()) for x in raw})
    candidates = []
    for url in urls:
        if valid_pdf_url(url):
            kind = classify(url)
            if kind:
                candidates.append({"url":url,"classification":kind,
                                   "status":"UNVERIFIED_URL_ONLY",
                                   "publisher_binary_certified":False,
                                   "regulatory_content_certified":False})
    return candidates

def fetch_page(ca_bundle):
    if not Path(ca_bundle).is_file():
        raise ValueError("TLS_VERIFIED_CA_BUNDLE_MISSING")
    cmd=["curl","--silent","--show-error","--fail","--location",
         "--max-redirs","2","--max-time","50","--max-filesize",str(MAX_HTML),
         "--proto","=https","--proto-redir","=https",
         "--cacert",ca_bundle,
         "--user-agent","Mozilla/5.0","--write-out","%{url_effective}",
         "-o","/tmp/sofidynamic-official-product.html",PUBLISHER]
    result = subprocess.run(cmd,capture_output=True,text=True,timeout=60,check=False)
    if result.returncode:
        raise ValueError("OFFICIAL_PRODUCT_FETCH_ERROR:"+result.stderr[:260])
    if urlsplit(result.stdout.strip()).hostname not in ALLOWED:
        raise ValueError("OFFICIAL_PRODUCT_REDIRECT_UNTRUSTED")
    return Path("/tmp/sofidynamic-official-product.html").read_text(encoding="utf-8",errors="replace")

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--ca-bundle",required=True)
    ap.add_argument("--out",required=True)
    args=ap.parse_args()
    outcome={"source_page":PUBLISHER,"status":"SOURCE_DISCOVERY_INCOMPLETE",
             "regulatory_certified":False,"publication_authorized":False,
             "documents":[]}
    try:
        raw=fetch_page(args.ca_bundle)
        docs=discover(raw)
        outcome["documents"]=docs
        outcome["source_html_length"]=len(raw)
        outcome["status"]="URL_CANDIDATES_FOUND" if docs else "NO_OFFICIAL_PDF_LINKS_FOUND"
    except Exception as error:
        outcome["error"]=str(error)
    dest=Path(args.out)
    dest.parent.mkdir(parents=True,exist_ok=True)
    dest.write_text(json.dumps(outcome,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(outcome,ensure_ascii=False,indent=2))
    if outcome["status"] != "URL_CANDIDATES_FOUND":
        raise SystemExit(1)

if __name__=="__main__":
    main()
