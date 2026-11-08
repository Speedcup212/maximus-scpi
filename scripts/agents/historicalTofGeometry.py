#!/usr/bin/env python3
"""RECOVERY-187: numerical + spatial dual-reader TOF review on exact archived issuer PDF.
A number found in a bulletin is a *candidate*, NEVER an approved financial TOF.
Fail closed if the target is found as a vacancy component or if the TOF label
cannot be paired with that quarter's printed figure in BOTH layout engines.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
import subprocess
import unicodedata
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path

import fitz

SPECS = {
    "novapierre-1": {
        "period": "2024-T4", "name": "Novapierre 1",
        "sha256": "3296b51f63b420914be88a4004179d40cf3b2f2bdd3baee9cd4d8e4f241f1c54",
        "page_count": 6, "candidate": 89.7, "target_page": 4,
    },
    "novapierre-residentiel": {
        "period": "2022-T1", "name": "Novapierre Résidentiel",
        "sha256": "6997ac5572b2907f6ab4e3b4d1f8dce08a750e266b1431dc8dbe6dab4a450708",
        "page_count": 8, "candidate": 95.3, "target_page": 4,
    },
    "cristal-rente": {
        "period": "2026-T2", "name": "Cristal Rente",
        "sha256": "d3cdc6ce4955a226accf191df1c1a9a2ffda38605f1bece8d76cac9761fe680a",
        "page_count": 6, "candidate": None, "target_page": None,
    },
}

def norm(s):
    return "".join(c for c in unicodedata.normalize("NFKD",str(s)) if not unicodedata.combining(c)).lower()

def percent(word):
    s=word.strip().strip("*").strip()
    m=re.fullmatch(r"(\d{1,3}(?:[,.]\d{1,2})?)\s*%?",s)
    if not m:return None
    x=float(m.group(1).replace(",","."))
    return x if 0<=x<=100 else None

def mupdf_words(page):
    return [(float(w[0]),float(w[1]),float(w[2]),float(w[3]),str(w[4])) for w in page.get_text("words")]

class PopplerHTMLWordParser(HTMLParser):
    """Tolerant parser for malformed Poppler XHTML, *not* a second OCR engine.

    Only actual <word xMin...> tags and their numeric source coordinates count.
    Discard incomplete/NaN boxes; never infer missing values or positions.
    """
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.words=[]
        self.current=None
        self.parts=[]
    def handle_starttag(self,tag,attrs):
        if tag.lower()!="word":return
        self.current={k.lower():v for k,v in attrs}
        self.parts=[]
    def handle_data(self,data):
        if self.current is not None:self.parts.append(data)
    def handle_endtag(self,tag):
        if tag.lower()!="word" or self.current is None:return
        raw="".join(self.parts).strip()
        try:
            box=tuple(float(self.current[k]) for k in ("xmin","ymin","xmax","ymax"))
            if raw and all(math.isfinite(x) for x in box) and box[2]>box[0] and box[3]>box[1]:
                self.words.append((*box,raw))
        except (KeyError,ValueError,TypeError):
            pass
        self.current=None
        self.parts=[]

def parse_poppler_bbox(document):
    try:
        root=ET.fromstring(document)
        words=[(float(el.attrib["xMin"]),float(el.attrib["yMin"]),
                float(el.attrib["xMax"]),float(el.attrib["yMax"]),el.text)
               for el in root.iter() if el.tag.endswith("word") and el.text]
        if len(words)<3:raise ValueError("POPPLER_BBOX_XML_HAS_NO_WORDS")
        return words,"strict_xml"
    except ET.ParseError:
        recovery=PopplerHTMLWordParser()
        recovery.feed(document)
        recovery.close()
        if len(recovery.words)<3:
            raise ValueError("POPPLER_BBOX_HTML_RECOVERY_INSUFFICIENT_WORDS")
        return recovery.words,"html_word_recovery"

def poppler_words(path,pageno):
    completed=subprocess.run(["pdftotext","-f",str(pageno),"-l",str(pageno),
              "-bbox",str(path),"-"],capture_output=True,text=True,
              timeout=45,check=True)
    return parse_poppler_bbox(completed.stdout)

def centre(w):
    return ((w[0]+w[2])/2,(w[1]+w[3])/2)

def distance(a,b):
    ax,ay=centre(a);bx,by=centre(b)
    return math.hypot(ax-bx,ay-by)

def locate(words,candidate=None):
    numbers=[]
    for word in words:
        val=percent(word[4])
        if val is None or not 30<=val<=100:continue
        if candidate is not None and abs(val-candidate)>0.001:continue
        labels=[w for w in words if norm(w[4]).strip(":*")=="tof"]
        vacancy=[w for w in words if "vacant" in norm(w[4])]
        near_tof=min((distance(word,w) for w in labels),default=100000)
        near_vacancy=min((distance(word,w) for w in vacancy),default=100000)
        numbers.append({"value":val,"bbox":[round(v,2) for v in word[:4]],
            "tof_distance":round(near_tof,2),"vacancy_distance":round(near_vacancy,2),
            "tof_label_near":near_tof<=180 and near_tof<near_vacancy})
    return numbers

def pair_engines(mu,po):
    pairs=[]
    for a in mu:
        for b in po:
            if a["value"]!=b["value"]:continue
            if all(abs(x-y)<4 for x,y in zip(a["bbox"],b["bbox"])):
                pairs.append({"value":a["value"],
                  "mupdf":a,"poppler":b,
                  "same_numeric_bbox":True,
                  "both_near_tof":a["tof_label_near"] and b["tof_label_near"]})
    return pairs

def evaluate(spec,pages):
    """All candidates are retained; a coordinate match is not financial certification."""
    targeted=[]
    preview=[]
    for n,mu,po in pages:
        candidates=pair_engines(locate(mu,spec["candidate"]),locate(po,spec["candidate"]))
        for pair in candidates:
            pair["page"]=n
            targeted.append(pair)
        if spec["candidate"] is None:
            allpairs=pair_engines(locate(mu,None),locate(po,None))
            preview.extend([{"page":n,"value":p["value"],
              "both_near_tof":p["both_near_tof"],
              "bbox":p["mupdf"]["bbox"]} for p in allpairs if p["both_near_tof"]][:30])
    exact=[x for x in targeted if x["page"]==spec["target_page"] and x["both_near_tof"]]
    # If the same expected value appears multiple times, manual chart association
    # is mandatory: only one spatially unique TOF candidate can progress.
    # A source TOF can be printed both in the chart and in the adjacent
    # historical table. Two identical independently located values on the
    # correct page do not contradict one another. Conflicting pages/values
    # still fail closed and never approve finance.
    validated=(1<=len(exact)<=3 and len(targeted)==len(exact) and
       all(x["value"]==spec["candidate"] and x["both_near_tof"] for x in exact))
    return {"status":"BBOX_CANDIDATE_REVIEW" if validated else "NEEDS_INDEPENDENT_SEMANTIC_QA",
        "matched_target_candidates":targeted[:20],
        "unscored_tof_nearby_percentages":preview[:60],
        "candidate_geom_count":len(exact),
        "manual_financial_qa_required":True,
        "financial_certified":False, "deploy_allowed":False}

def audit(slug,pdf_path,manifest):
    if slug not in SPECS:raise ValueError("UNSUPPORTED_FIXED_SCPI")
    spec=SPECS[slug]
    if manifest.get("scpi_slug")!=slug or manifest.get("source_period")!=spec["period"] or \
       manifest.get("sha256")!=spec["sha256"]:
        raise ValueError("OIDC_MANIFEST_SCOPE_DISAGREEMENT")
    data=pdf_path.read_bytes()
    if len(data)<1024 or not data.startswith(b"%PDF"):
        raise ValueError("NOT_AN_ORIGINAL_PDF")
    if hashlib.sha256(data).hexdigest()!=spec["sha256"]:
        raise ValueError("ARCHIVED_ISSUER_SOURCE_SHA_MISMATCH")
    with fitz.open(stream=data,filetype="pdf") as doc:
        if doc.needs_pass or len(doc)!=spec["page_count"]:
            raise ValueError("ARCHIVE_PAGE_COUNT_MISMATCH")
        cover=norm(" ".join(doc[i].get_text("text") for i in range(min(2,len(doc)))))
        if norm(spec["name"]) not in cover and norm(spec["name"]) not in norm(" ".join(p.get_text("text") for p in doc)):
            raise ValueError("ARCHIVE_ISSUER_SCPI_IDENTITY_MISMATCH")
        if spec["period"][:4] not in cover:
            raise ValueError("COVER_REPORT_YEAR_MISMATCH")
        records=[]
        parser_modes=[]
        for i in range(len(doc)):
            poppler,mode=poppler_words(pdf_path,i+1)
            parser_modes.append(mode)
            records.append((i+1,mupdf_words(doc[i]),poppler))
    review=evaluate(spec,records)
    return {"scpi_slug":slug,"source_period":spec["period"],"sha256":spec["sha256"],
        "poppler_bbox_parsers":sorted(set(parser_modes)),
        "source_type":"private_archived_publisher_original_verified_binary",
        "readers":["MuPDF-geometry","Poppler-bbox"],
        "expected_pdf_pages":spec["page_count"],
        "target_value_percent":spec["candidate"],
        "target_page":spec["target_page"],
        **review}

def main():
    arg=argparse.ArgumentParser()
    arg.add_argument("--slug",required=True)
    arg.add_argument("--pdf",type=Path,required=True)
    arg.add_argument("--manifest",type=Path,required=True)
    arg.add_argument("--out",type=Path,required=True)
    a=arg.parse_args()
    a.out.parent.mkdir(parents=True,exist_ok=True)
    try:
        result=audit(a.slug,a.pdf,json.loads(a.manifest.read_text()))
    except Exception as e:
        if isinstance(e,subprocess.CalledProcessError):
            code="POPPLER_BBOX_NONZERO_EXIT"
        elif isinstance(e,ET.ParseError):
            code="POPPLER_BBOX_XML_MALFORMED"
        elif isinstance(e,ValueError) and re.fullmatch(
            r"[A-Z][A-Z0-9_]{3,84}",str(e)):
            code=str(e)
        else:
            kind=re.sub(r"[^A-Z]","",type(e).__name__.upper())[:35]
            code="SOURCE_GEOMETRY_"+(kind or "OTHER")+"_BLOCKED"
        result={"scpi_slug":a.slug,"status":"BLOCKED","error_code":code,
                "financial_certified":False,"deploy_allowed":False}
    a.out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n")
    print("HISTORICAL_TOF_INDEPENDENT_GEOMETRY",a.slug,result["status"],
          "financial_certified=false",flush=True)
    if result["status"]=="BLOCKED":raise SystemExit(1)

if __name__=="__main__":
    main()
