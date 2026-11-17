#!/usr/bin/env python3
"""Independent geometric candidates for SCPI metrics, zero financial promotion.

Two separate engines: MuPDF word geometry and Poppler pdftotext -bbox-layout.
The output is candidate evidence (label, number, page, bbox), NEVER QA PASS.
This module intentionally does not alter the registered financial snapshot.
"""
from __future__ import annotations
import math
import re
import subprocess
import unicodedata
from html.parser import HTMLParser
from pathlib import Path
import fitz

LABEL_TOKENS={
    "tof": (("tof",),("taux","occupation","financier")),
    "top": (("top",),("taux","occupation","physique")),
    "capitalisation": (("capitalisation",),),
    "valeur_realisation": (("valeur","realisation"),),
    "prix_reconstitution": (("valeur","reconstitution"),("prix","reconstitution")),
}
NUMERIC = re.compile(r"^(?:[0-9]{1,8}(?:[.,][0-9]{1,6})?|[0-9]{1,3}(?:[ .\u00a0\u202f][0-9]{3})+(?:[.,][0-9]+)?)$")
TEXT_SANITIZE = re.compile(r"[^a-z0-9]+")


def norm(value):
    t=unicodedata.normalize("NFKD",str(value))
    return "".join(x for x in t if not unicodedata.combining(x)).lower()


def tok(value):
    return TEXT_SANITIZE.sub("",norm(value))


def value_of(value):
    s=norm(str(value)).replace("\u202f","").replace("\u00a0","").replace(" ","")
    s=s.strip("%€$()[];:")
    if not s or not re.fullmatch(r"[0-9][0-9.,]*",s):
        return None
    if "," in s and "." in s:
        s=s.replace(".","").replace(",",".") if s.rfind(",")>s.rfind(".") else s.replace(",","")
    else:
        s=s.replace(",",".")
    try:
        v=float(s)
    except ValueError:
        return None
    return v if math.isfinite(v) else None


def box_center(b):
    return ((b[0]+b[2])/2,(b[1]+b[3])/2)


def merge_bbox(a,b):
    return [min(a[0],b[0]),min(a[1],b[1]),max(a[2],b[2]),max(a[3],b[3])]


def pdf_words_mupdf(path):
    out=[]
    with fitz.open(path) as pdf:
        for page in pdf:
            words=[]
            for w in page.get_text("words",sort=True):
                if len(w)<5:continue
                words.append({"t":str(w[4]),"bbox":[round(float(v),2) for v in w[:4]]})
            out.append(words)
    return out


class PopplerBBoxHTML(HTMLParser):
    """Tolerant to literal ampersands and occasional broken XML text characters.
    The original pdftotext -bbox-layout retains numeric page coordinates.
    """
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.pages=[]
        self.current=None
        self.current_word=None
    def handle_starttag(self,tag,attrs):
        props=dict(attrs)
        if tag=="page":
            self.current=[]
            self.pages.append(self.current)
        elif tag=="word" and self.current is not None:
            try:
                bbox=[float(props[k]) for k in ("xmin","ymin","xmax","ymax")]
            except (KeyError,ValueError,TypeError):
                self.current_word=None;return
            self.current_word={"bbox":[round(v,2) for v in bbox],"text":[]}
    def handle_data(self,data):
        if self.current_word is not None:
            self.current_word["text"].append(data)
    def handle_endtag(self,tag):
        if tag=="word":
            w=self.current_word
            if w is not None and self.current is not None:
                value="".join(w["text"]).strip()
                if value:self.current.append({"t":value,"bbox":w["bbox"]})
            self.current_word=None
        elif tag=="page":
            self.current=None


def parse_poppler_bbox(raw):
    parser=PopplerBBoxHTML()
    parser.feed(raw)
    parser.close()
    if not parser.pages:
        raise ValueError("POPPLER_GEOMETRY_NO_PAGES")
    return parser.pages


def pdf_words_poppler(path):
    proc=subprocess.run(["pdftotext","-bbox-layout","-enc","UTF-8",str(path),"-"],
                        capture_output=True,text=True,timeout=50)
    if proc.returncode:raise ValueError("POPPLER_GEOMETRY_FAILED")
    return parse_poppler_bbox(proc.stdout)

def labels(words, field):
    aliases=LABEL_TOKENS.get(field,())
    cleaned=[tok(w["t"]) for w in words]
    found=[]
    for i in range(len(cleaned)):
        for alias in aliases:
            j=i
            matched=[]
            # Permit apostrophe fragments / filler words without mixing
            # distant captions. Every principal label token is required.
            for part in alias:
                advance=0
                while j<len(cleaned) and cleaned[j]!=part and advance<3:
                    j+=1; advance+=1
                if j>=len(cleaned) or cleaned[j]!=part:
                    matched=[];break
                matched.append(j);j+=1
            if not matched:continue
            bbox=words[matched[0]]["bbox"]
            for m in matched[1:]:bbox=merge_bbox(bbox,words[m]["bbox"])
            found.append({"bbox":bbox,"text":" ".join(words[m]["t"] for m in matched)})
    unique={}
    for r in found:unique[tuple(r["bbox"])]=r
    return list(unique.values())[:40]


def numeric_matches(words,expected):
    if not isinstance(expected,(int,float)) or isinstance(expected,bool):
        return []
    expected=float(expected)
    tol=max(.005,abs(expected)*.00012)
    out=[]
    for i,w in enumerate(words):
        candidate=[(w["t"],w["bbox"])]
        if i+1<len(words):
            n=words[i+1]
            b1,b2=w["bbox"],n["bbox"]
            # two adjacent thousands groups, same baseline, small gap.
            if (abs(box_center(b1)[1]-box_center(b2)[1])<=5 and
                0<=b2[0]-b1[2]<=12 and
                re.fullmatch(r"\d{1,3}",tok(w["t"])) and
                re.fullmatch(r"\d{3}",tok(n["t"]))):
                candidate.append((w["t"]+" "+n["t"],merge_bbox(b1,b2)))
        for raw,bbox in candidate:
            v=value_of(raw)
            if v is not None and abs(v-expected)<=tol:
                out.append({"bbox":bbox,"text":raw,"value":v})
    unique={}
    for r in out:unique[tuple(r["bbox"])]=r
    return list(unique.values())[:60]


def engine_candidates(pages,field,expected):
    out=[]
    for n,words in enumerate(pages):
        labels_at=labels(words,field)
        nums=numeric_matches(words,expected)
        if not nums and not labels_at:continue
        if not nums or not labels_at:
            out.append({"page":n+1,"label_count":len(labels_at),
                        "number_count":len(nums),"pairs":[]})
            continue
        pairs=[]
        for value in nums:
            cx,cy=box_center(value["bbox"])
            ranked=[]
            for label in labels_at:
                lx,ly=box_center(label["bbox"])
                distance=math.hypot(lx-cx,ly-cy)
                ranked.append((distance,label))
            ranked.sort(key=lambda z:z[0])
            near=ranked[0]
            if near[0]>240:continue
            pairs.append({"page":n+1,
              "label_text":near[1]["text"],"label_bbox":near[1]["bbox"],
              "number_text":value["text"],"value_bbox":value["bbox"],
              "distance_pt":round(near[0],1)})
        pairs.sort(key=lambda x:x["distance_pt"])
        out.append({"page":n+1,"label_count":len(labels_at),
                    "number_count":len(nums),"pairs":pairs[:5]})
    return out


def analyze_geometry(pdf_path, field, expected, mupdf_pages=None,poppler_pages=None):
    if field not in LABEL_TOKENS:
        return {"status":"FIELD_NOT_SUPPORTED","semantic_financial_qa":False}
    a=mupdf_pages if mupdf_pages is not None else pdf_words_mupdf(pdf_path)
    b=poppler_pages if poppler_pages is not None else pdf_words_poppler(pdf_path)
    if len(a)!=len(b):
        return {"status":"ENGINE_PAGE_COUNT_MISMATCH","semantic_financial_qa":False}
    ma=engine_candidates(a,field,expected)
    mb=engine_candidates(b,field,expected)
    pairs_a=[item for page in ma for item in page["pairs"]]
    pairs_b=[item for page in mb for item in page["pairs"]]
    matched=[]
    for x in pairs_a:
        for y in pairs_b:
            if x["page"]!=y["page"]:continue
            if math.dist(box_center(x["value_bbox"]),box_center(y["value_bbox"]))>40:continue
            if math.dist(box_center(x["label_bbox"]),box_center(y["label_bbox"]))>75:continue
            matched.append({"page":x["page"],"mupdf":x,"poppler":y})
    matched.sort(key=lambda t:t["mupdf"]["distance_pt"]+t["poppler"]["distance_pt"])
    if matched:
        status="DUAL_READER_GEOMETRY_CANDIDATE"
    elif pairs_a or pairs_b:
        status="ONE_ENGINE_OR_POSITION_DISAGREEMENT"
    else:
        status="NO_LABELLED_GEOMETRIC_VALUE"
    return {"status":status,"expected_from_replay":expected,
       "same_page_coordinates_verified":bool(matched),
       "matching_pairs":matched[:3],
       "mupdf_diagnostics":ma[:4],"poppler_diagnostics":mb[:4],
       "semantic_financial_qa":False,"financial_certified":False}


if __name__=="__main__":
    import argparse,json
    p=argparse.ArgumentParser()
    p.add_argument("--pdf",required=True)
    p.add_argument("--field",required=True)
    p.add_argument("--value",type=float,required=True)
    a=p.parse_args()
    print(json.dumps(analyze_geometry(Path(a.pdf),a.field,a.value),
                     ensure_ascii=False,indent=2))
