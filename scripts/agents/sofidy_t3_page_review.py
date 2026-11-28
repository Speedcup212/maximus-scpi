#!/usr/bin/env python3
"""Render and independently read Sofidy T3 originals for page-by-page review.

No mutation, no direct financial certification. All URLs/SHA derive from the
successfully double-read official 2026-T3 issuer source evidence.
"""
import argparse,hashlib,json,re,subprocess,sys,tempfile
from pathlib import Path

import fitz

sys.path.insert(0,str(Path(__file__).resolve().parent))
import publisher_family_proof as publisher

TERMS=(
 "tof","taux d occupation","taux d’occupation","taux d'occupation","nombre de parts",
 "part en attente","parts en attente","capitalisation","retrait","prix de souscription",
 "dividende","distribution","valeur de reconstitution","valeur de realisation",
 "valeur de réalisation","endettement","nombre d associés","nombre d’associés",
 "nombre d'immeubles","nombre d immeubles","parts émises","parts emises",
 "souscription","cession","acquisition","emprunts",
)
def flatten(text):
    import unicodedata
    text=unicodedata.normalize("NFKD",text).lower()
    text="".join(c for c in text if unicodedata.category(c)!="Mn")
    return re.sub(r"\s+"," ",text.replace("’"," ").replace("'"," "))

def validation(manifest,slug):
    if (manifest.get("version")!=1 or manifest.get("publisher")!="Sofidy" or
        manifest.get("approved_hosts")!=["www.sofidy.com"] or
        manifest.get("financial_certified") is not False or
        manifest.get("publication_authorized") is not False):
        raise ValueError("UNTRUSTED_PUBLISHER_MANIFEST")
    docs=manifest.get("documents",[])
    if len(docs)!=3 or len(set(x["slug"] for x in docs))!=3:
        raise ValueError("INVALID_FUND_SET")
    selected=[d for d in docs if d["slug"]==slug]
    if len(selected)!=1:raise ValueError("UNKNOWN_FUND")
    d=selected[0]
    if d.get("source_period") not in ("2026-T1","2026-T3") or d.get("page_count")!=6:
        raise ValueError("WRONG_PERIOD_OR_PAGE_COUNT")
    if not isinstance(d.get("pdf_sha256"),str) or not re.fullmatch("[a-f0-9]{64}",d["pdf_sha256"]):
        raise ValueError("INVALID_ORIGINAL_SHA")
    if not publisher.original.official_url(d.get("source_url"),{"www.sofidy.com"}):
        raise ValueError("NON_OFFICIAL_PUBLISHER_URL")
    return d

def probe(manifest,slug,destination):
    d=validation(manifest,slug)
    original,url=publisher.fetch_verified_curl(d["source_url"],["www.sofidy.com"])
    if url!=d["source_url"] or hashlib.sha256(original).hexdigest()!=d["pdf_sha256"]:
        raise ValueError("PDF_ORIGINAL_SHA_CHANGED")
    destination.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="sofidy-t3-page-proof-") as folder:
        path=Path(folder)/"original.pdf";path.write_bytes(original)
        if publisher.proof.independent_poppler(path,d["name"],d["source_period"],"quarterly_bulletin",d["page_count"]) != d["page_count"]:
            raise ValueError("INDEPENDENT_PDF_READER_REJECTED")
        pages=[]
        with fitz.open(path) as pdf:
            if len(pdf)!=d["page_count"]:raise ValueError("ORIGINAL_PAGE_COUNT_CHANGED")
            for n in range(1,min(len(pdf),5)+1):
                page=pdf[n-1]
                native=page.get_text("text",sort=True)
                proc=subprocess.run(["pdftotext","-f",str(n),"-l",str(n),"-layout",str(path),"-"],
                         capture_output=True,text=True,timeout=32,check=False)
                if proc.returncode!=0 or len(proc.stdout)<200 or len(native)<200:
                    raise ValueError(f"INDEPENDENT_PAGE_TEXT_MISSING_{n}")
                visual=destination/f"{d['source_period']}-page-{n}.png"
                visual.write_bytes(page.get_pixmap(matrix=fitz.Matrix(1.35,1.35),alpha=False).tobytes("png"))
                lines=[x.strip() for x in proc.stdout.splitlines() if x.strip()]
                hints=[]
                for i,line in enumerate(lines):
                    if any(flatten(term) in flatten(line) for term in TERMS):
                        text=" | ".join(lines[max(i-1,0):min(i+3,len(lines))])[:340]
                        if text not in hints:hints.append(text)
                    if len(hints)>55:break
                pages.append({"pdf_page":n,"raster_sha256":hashlib.sha256(visual.read_bytes()).hexdigest(),
                              "mupdf_page_text_len":len(native),"poppler_page_text_len":len(proc.stdout),
                              "unapproved_candidate_contexts":hints,
                              "financial_certified":False,"independent_financial_review_required":True})
        return {"slug":slug,"status":"SOURCE_PAGES_RENDERED_FOR_REVIEW","source_period":d["source_period"],
                "source_url":url,"pdf_sha256":d["pdf_sha256"],"pages":pages,
                "financial_certified":False,"publication_authorized":False,"database_modified":False}

def main():
    p=argparse.ArgumentParser();p.add_argument("--manifest",type=Path,required=True)
    p.add_argument("--slug",required=True);p.add_argument("--out",type=Path,required=True)
    a=p.parse_args();a.out.mkdir(parents=True,exist_ok=True)
    try:output=probe(json.loads(a.manifest.read_text(encoding="utf-8")),a.slug,a.out)
    except Exception as e:
        output={"slug":a.slug,"status":"BLOCKED","reason_code":str(e)[:220],
                "financial_certified":False,"publication_authorized":False,"database_modified":False}
        code=1
    else:code=0
    (a.out/"review.json").write_text(json.dumps(output,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({k:v for k,v in output.items() if k!="pages"},ensure_ascii=False))
    if code==0:
        for page in output["pages"]:
            print("T3_PAGE",json.dumps({"slug":a.slug,**page},ensure_ascii=False))
    raise SystemExit(code)
if __name__=="__main__":main()
