#!/usr/bin/env python3
"""Read-only source investigation for three isolated historical TOF gaps.

Original PDF must be HTTPS on exactly the known publisher hostname, binary SHA
and archived byte count must match. Extract MuPDF text/word positions and
Poppler page text + bbox, without presuming the TOF value or its period. This
produces evidence for an *independent later QA*; financial_certified=False.
No SQL writes, no stateful publication, no human reviewer signature.
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
from pathlib import Path
import xml.etree.ElementTree as ET
import fitz

SOURCES=[
  {
   "slug":"paref-evo","period":"2024-T4","issuer_host":"paref-gestion.com",
   "url":"https://paref-gestion.com/wp-content/uploads/2025/04/05c7e184-d5e4-4cdd-bf9f-7ee2c008b217-BTI-T4-2024-PAREF-Evo.pdf",
   "sha256":"c9abf92651017d3d83400949a07d5a41aef594775c48bd7e0065da391d1e17d9",
   "byte_size":2171159,
   "aliases":["paref evo","interpierre europe centrale"],
   "expected_tof":None,
  },
  {
   "slug":"paref-hexa","period":"2026-T3","issuer_host":"paref-gestion.com",
   "url":"https://paref-gestion.com/wp-content/uploads/2026/10/dc0cd675-deb0-4ab0-b928-040f9aafd157-BTI-T3-2026-PAREF-Hexa.pdf",
   "sha256":"ca4a3569a990f99b376268875440ebc1e1aadefa85aab582ebca96cbce0c62ce",
   "byte_size":1775561,
   "aliases":["paref hexa"],
   "expected_tof":84.5,
  },
  {
   "slug":"pierval-sante","period":"2026-T3","issuer_host":"www.euryale-am.fr",
   "url":"https://www.euryale-am.fr/wp-content/uploads/BT_PIERVAL_SANTE_2026_T3.pdf",
   "sha256":"823990ec258b0f9d0561e1ac7fef0bcb7905f1f2b235620dde1440c1aba521c1",
   "byte_size":3637582,
   "aliases":["pierval sante","pierval santé"],
   "expected_tof":None,
  },
]

def norm(s):
    return "".join(c for c in unicodedata.normalize("NFKD",str(s))
                   if not unicodedata.combining(c)).casefold()

def retrieve(spec):
    req=urllib.request.Request(spec["url"],headers={
        "User-Agent":"Mozilla/5.0 (compatible; MaximusSCPI independent document source QA)"
    })
    with urllib.request.urlopen(req,timeout=85) as resp:
        url=resp.geturl()
        o=urllib.parse.urlparse(url)
        if o.scheme!="https" or o.hostname!=spec["issuer_host"] or resp.status!=200:
            raise ValueError("PDF_NOT_ISSUER_HOST_HTTPS_200")
        buf=resp.read(15*1024*1024+1)
    if not buf.startswith(b"%PDF") or len(buf)!=spec["byte_size"]:
        raise ValueError("BINARY_SIGNATURE_OR_SIZE_DIFFERS_FROM_ARCHIVE")
    if hashlib.sha256(buf).hexdigest()!=spec["sha256"]:
        raise ValueError("PUBLISHER_PDF_SHA_DIFFERS_FROM_SUPABASE_ARCHIVE")
    return buf

def poppler_text(path,page):
    r=subprocess.run(["pdftotext","-f",str(page),"-l",str(page),"-layout",
                      str(path),"-"],text=True,capture_output=True,check=True,timeout=35)
    return r.stdout

def poppler_words(path,page):
    r=subprocess.run(["pdftotext","-f",str(page),"-l",str(page),"-bbox",
                      str(path),"-"],text=True,capture_output=True,check=True,timeout=35)
    try:
        root=ET.fromstring(r.stdout)
        return [[float(e.attrib[k]) for k in ("xMin","yMin","xMax","yMax")]
                +[e.text or ""] for e in root.iter()
                if e.tag.endswith("word") and e.text], "strict_xml"
    except ET.ParseError:
        words=[]
        for m in re.finditer(r"<word\b([^>]*)>(.*?)</word>",r.stdout,re.DOTALL):
            at=dict(re.findall(r'(xMin|yMin|xMax|yMax)="([^"]+)"',m.group(1)))
            if set(at)!=set(("xMin","yMin","xMax","yMax")):continue
            try:
                box=[float(at[k]) for k in ("xMin","yMin","xMax","yMax")]
            except ValueError:continue
            if all(-100000<x<100000 for x in box):
                words.append(box+[html.unescape(m.group(2))])
        if not words: raise ValueError("POPPLER_BBOX_UNREADABLE")
        return words,"bbox_word_recovery"

def closest_word_context(words,needle):
    hits=[]
    for i,w in enumerate(words):
        raw=norm(w[4]).replace(" ","")
        if needle=="tof":
            match=("tof"==raw.strip("()*:") or "occupation" in raw)
        else:
            match=bool(re.search(r"(?<!\d)"+re.escape(needle).replace(r"\,",r"[,\.]")+r"(?!\d)",raw))
        if match:
            near=words[max(0,i-8):i+11]
            hits.append({"box":[round(float(x),2) for x in w[:4]],
                         "word":str(w[4]),
                         "neighbors":" ".join(str(x[4]) for x in near)[:250]})
    return hits[:16]

def investigate_one(spec,out):
    x={k:spec[k] for k in ("slug","period","url","sha256","byte_size")}
    x.update(status="started",financial_certified=False,
             human_attestation=False,publication_authorized=False,
             source_pdf_valid=False)
    data=retrieve(spec)
    path=out/(spec["slug"]+"-"+spec["period"]+"-official.pdf")
    path.write_bytes(data)
    with fitz.open(stream=data,filetype="pdf") as d:
        if d.needs_pass or not 3<=len(d)<=35:raise ValueError("UNUSUAL_PDF_OR_ENCRYPTED")
        x["pages"]=len(d)
        # Require issuer-specific product on the first two pages.
        cover=norm(" ".join(d[i].get_text("text") for i in range(min(2,len(d)))))
        if not any(norm(alias) in cover for alias in spec["aliases"]):
            raise ValueError("PDF_COVER_SCPI_IDENTITY_NOT_PROVEN")
        q=spec["period"][-1]; year=spec["period"][:4]
        period_ok=bool(
            re.search(rf"(?:\bt{q}\b|\b{q}(?:er|eme|e)?\s+trimestre\b).{{0,32}}{year}",cover)
            or re.search(rf"{year}.{{0,24}}(?:\bt{q}\b|\b{q}(?:er|eme|e)?\s+trimestre\b)",cover))
        x["period_explicit_on_cover"]=period_ok
        if not period_ok:
            raise ValueError("PDF_COVER_QUARTER_IDENTITY_NOT_PROVEN")
        x["source_pdf_valid"]=True
        findings=[]
        for i,page in enumerate(d):
            text=page.get_text("text",sort=True)
            n=norm(text)
            if not any(t in n for t in ("occupation financier","tof","taux d occupation")): continue
            page_no=i+1
            pop=poppler_text(path,page_no)
            if not any(t in norm(pop) for t in ("occupation financier","tof","taux d occupation")):
                raise ValueError("POPPLER_MISSING_TOF_CONTEXT_ON_PAGE")
            mu_words=[[float(v) for v in w[:4]]+[w[4]] for w in page.get_text("words")]
            po_words,parse_mode=poppler_words(path,page_no)
            context=[]
            for m in re.finditer(r"(?is)(?:taux\s+d[’'\s]*occupation\s+financier|(?<![a-z])tof(?![a-z]))",text):
                context.append(" ".join(text[max(0,m.start()-125):m.end()+180].split())[:275])
            anchors={
                "page":page_no,"tof_contexts":context[:18],
                "mupdf_tof_labels":closest_word_context(mu_words,"tof"),
                "poppler_tof_labels":closest_word_context(po_words,"tof"),
                "poppler_parse_mode":parse_mode,
            }
            if spec["expected_tof"] is not None:
                target=str(spec["expected_tof"]).replace(".",",")
                anchors["expected_tof"]=spec["expected_tof"]
                anchors["mupdf_target"]=closest_word_context(mu_words,target)
                anchors["poppler_target"]=closest_word_context(po_words,target)
            # record text passages only, avoid 100% PDF verbatim
            findings.append(anchors)
        x["tof_pages"]=findings
        x["status"]="source_binary_verified_independent_layouts"
    return x

def main():
    out=Path(sys.argv[1] if len(sys.argv)>1 else "test-results/three-historical-tof")
    out.mkdir(parents=True,exist_ok=True)
    report={"status":"read_only_documentary_qa",
            "financial_certified":False,
            "human_attestation":False,
            "database_writes":False,
            "results":[]}
    for sp in SOURCES:
        try:
            result=investigate_one(sp,out)
            print("TOF_BINARY_PROBE_PASS",sp["slug"],sp["period"],
                  "SHA",sp["sha256"],"PAGES",result["pages"],
                  "CANDIDATE_TOF_PAGES",','.join(str(r["page"]) for r in result["tof_pages"]),flush=True)
        except Exception as exc:
            result={k:sp[k] for k in ("slug","period","url","sha256")}
            result.update(status="blocked",error_code=str(exc)[:160],
                          financial_certified=False,publication_authorized=False)
            print("TOF_BINARY_PROBE_BLOCKED",sp["slug"],str(exc)[:160],flush=True)
        report["results"].append(result)
    (out/"probe.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    if any(r["status"]!="source_binary_verified_independent_layouts"
           for r in report["results"]):
        raise SystemExit(1)

if __name__=="__main__":
    main()
