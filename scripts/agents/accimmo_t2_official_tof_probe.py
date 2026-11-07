#!/usr/bin/env python3
"""Read-only Accimmo Pierre T2 2026 publisher-binary TOF investigation.

A previous historic record carries 87.44% on issuer PDF page 2, but its
certificate does not exist. This probe never writes SQL or marks finance
approved. It creates independent MuPDF/Poppler word-level evidence to decide
if that historic number is verifiable rather than copying it.
"""
import hashlib
import html
import json
import re
import subprocess
import sys
import unicodedata
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

import fitz

URL = "https://reim.bnpparibas-am.com/sites/default/files/docs/2026-08/ACCIMMO%20PIERRE_BT_FR_T2%202026_DEF.pdf"
SHA256 = "2adc825b6776f9ea55f6d4bc1d55a55142b01957b49d486fa2472cdec35abb20"
PERIOD = "2026-T2"
TARGET = "87,44"
HOST = "reim.bnpparibas-am.com"


def norm(s):
    return "".join(c for c in unicodedata.normalize("NFKD", s)
                   if not unicodedata.combining(c)).casefold()


def publisher_binary():
    req = urllib.request.Request(URL, headers={"User-Agent": "Mozilla/5.0 (MaximusSCPI official source QA)"})
    with urllib.request.urlopen(req, timeout=90) as response:
        real_url = response.geturl()
        if response.status != 200:
            raise ValueError("PUBLISHER_HTTP_NOT_200")
        parsed = urllib.parse.urlparse(real_url)
        if parsed.scheme != "https" or parsed.hostname != HOST:
            raise ValueError("PUBLISHER_REDIRECT_OUTSIDE_APPROVED_HOST")
        pdf = response.read(35 * 1024 * 1024 + 1)
    if not (1024 < len(pdf) < 35*1024*1024 and pdf.startswith(b"%PDF")):
        raise ValueError("PUBLISHER_DOCUMENT_NOT_PDF")
    sha = hashlib.sha256(pdf).hexdigest()
    if sha != SHA256:
        raise ValueError("PUBLISHER_BINARY_SHA_DIFFERS_FROM_ARCHIVED_HISTORY")
    return pdf


def mupdf_words(page):
    return [(round(float(x0),2),round(float(y0),2),round(float(x1),2),
             round(float(y1),2), text)
            for x0,y0,x1,y1,text,*rest in page.get_text("words")]


def parse_poppler_bbox(xml_text):
    # Poppler may expose non-XML-safe glyphs in a perfectly valid publisher
    # PDF (e.g. an unescaped typographic control inside a non-TOF word).
    # First parse strict XML; on such input, recover only <word> elements
    # with explicit finite bounding coordinates. No data may be invented.
    try:
        root = ET.fromstring(xml_text)
        words = [[round(float(el.attrib[k]),2) for k in ("xMin","yMin","xMax","yMax")]
                 + [el.text or ""]
                 for el in root.iter() if el.tag.endswith("word") and el.text]
        return words, "poppler_bbox_xml"
    except ET.ParseError:
        words=[]
        for match in re.finditer(r"<word\b([^>]*)>(.*?)</word>",xml_text,re.DOTALL):
            attrs=dict(re.findall(r'(xMin|yMin|xMax|yMax)="([^"]+)"',match.group(1)))
            if set(attrs)!= {"xMin","yMin","xMax","yMax"}:
                continue
            try:
                coords=[round(float(attrs[k]),2)
                        for k in ("xMin","yMin","xMax","yMax")]
            except ValueError:
                continue
            if not all(-1e5<x<1e5 for x in coords):
                continue
            words.append(coords+[html.unescape(match.group(2))])
        if not words:
            raise ValueError("POPPLER_BBOX_NO_RECOVERABLE_WORDS")
        return words, "poppler_bbox_strict_word_recovery"


def poppler_words(path):
    cmd = ["pdftotext","-f","2","-l","2","-bbox",str(path),"-"]
    proc = subprocess.run(cmd,check=True,capture_output=True,text=True,timeout=75)
    return parse_poppler_bbox(proc.stdout)

def contexts(words):
    hits = []
    anchors = []
    for i,w in enumerate(words):
        value = norm(str(w[4])).replace(" ","")
        if re.search(r"87[,.]44", value):
            hits.append({"word_index":i,"text":w[4],"rectangle":list(w[:4]),
                         "nearby_words":[str(v[4]) for v in words[max(0,i-16):i+17]]})
        if re.search(r"occupation|financier|tof",value):
            anchors.append({"word_index":i,"text":w[4],"rectangle":list(w[:4])})
    return hits,anchors


def main():
    root=Path(sys.argv[1]) if len(sys.argv)>1 else Path("test-results/accimmo-t2")
    root.mkdir(parents=True,exist_ok=True)
    result={"scpi_slug":"accimmo-pierre","period":PERIOD,"issuer_url":URL,
            "sha256_expected":SHA256,"claimed_historical_tof_percent":87.44,
            "financial_certification_proven":False,"human_attestation":False,
            "database_writes":False,"status":"source_probe_started"}
    try:
        pdf=publisher_binary()
        path=root/"accimmo-t2-2026-official.pdf"
        path.write_bytes(pdf)
        result["bytes"]=len(pdf)
        result["sha256_actual"]=hashlib.sha256(pdf).hexdigest()
        with fitz.open(stream=pdf,filetype="pdf") as doc:
            result["page_count"]=len(doc)
            if not (3<=len(doc)<=15):
                raise ValueError("PUBLISHER_PDF_PAGE_COUNT_UNEXPECTED")
            first=norm(doc[0].get_text("text"))
            if "accimmo" not in first or "pierre" not in first:
                raise ValueError("PUBLISHER_PDF_COVER_IDENTITY_FAILED")
            words=mupdf_words(doc[1])
            text=norm(doc[1].get_text("text"))
            result["mupdf_page2"]={"target_and_neighboring_words":contexts(words)[0],
                                   "tof_label_words":contexts(words)[1][:35],
                                   "first_2000_characters":text[:2000]}
        pop,pop_method=poppler_words(path)
        result["poppler_page2"]={"parse_mode":pop_method,
                                 "target_and_neighboring_words":contexts(pop)[0],
                                 "tof_label_words":contexts(pop)[1][:35]}
        result["value_present_in_two_independent_readers"]=bool(
           result["mupdf_page2"]["target_and_neighboring_words"]
           and result["poppler_page2"]["target_and_neighboring_words"])
        result["issuer_identity"]=True
        result["status"]="publisher_pdf_and_two_reader_probe_success"
        print("ACCIMMO_T2_OFFICIAL_SHA_PASS",len(pdf),result["page_count"])
        print("ACCIMMO_T2_DOUBLE_READER_NUMBER_PRESENT",result["value_present_in_two_independent_readers"])
    except Exception as e:
        result["status"]="source_blocked"
        result["failure_type"]=type(e).__name__
        result["failure_code"]=str(e)[:200]
        print("ACCIMMO_T2_SOURCE_BLOCKED",result["failure_code"])
    (root/"probe.json").write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    if result["status"]!="publisher_pdf_and_two_reader_probe_success":
        raise SystemExit(1)


if __name__=="__main__":
    main()
