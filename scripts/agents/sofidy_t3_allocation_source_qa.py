#!/usr/bin/env python3
"""RECOVERY-207: original PDF source check of 28 visual allocation claims.

All 28 rows remain independent-review-only; presence of numbers in the source
page does not prove their association with the correct chart labels.
"""
import argparse,hashlib,json,re,subprocess,sys,tempfile
from decimal import Decimal
from pathlib import Path
import fitz

sys.path.insert(0,str(Path(__file__).resolve().parent))
import publisher_family_proof as issuer
import sofidy_metric_page_probe as financial

FUNDS={"sofiboutique","sofipierre","sofidy-europe-invest"}

def percent_token(value):
    amount=Decimal(str(value))
    if amount<0 or amount>100:raise ValueError("ALLOCATION_PCT_OUT_OF_RANGE")
    full=format(amount,"f")
    whole,_,fraction=full.partition(".")
    if fraction.strip("0"):
        return re.compile(r"(?<![0-9])"+re.escape(whole)+r"[,.]"+re.escape(fraction.rstrip("0"))+r"0*(?![0-9])")
    return re.compile(r"(?<![0-9])"+re.escape(whole)+r"(?:[,.]0+)?(?![0-9])")

def validate(m,slug):
    if not isinstance(m,dict) or m.get("version")!=1 or m.get("publisher")!="Sofidy" or m.get("source_only") is not True or m.get("financial_qa_autoapprove") is not False or m.get("publication_authorized") is not False:
        raise ValueError("UNTRUSTED_CHART_MANIFEST")
    docs=m.get("documents")
    if not isinstance(docs,list) or {x.get("slug") for x in docs}!=FUNDS or sum(len(x.get("allocations",[])) for x in docs)!=28:
        raise ValueError("UNEXPECTED_ALLOCATION_SET")
    matches=[x for x in docs if x["slug"]==slug]
    if len(matches)!=1:raise ValueError("SCPI_NOT_IN_MANIFEST")
    d=matches[0]
    if not issuer.original.official_url(d.get("source_url"),{"www.sofidy.com"}) or not re.fullmatch("[0-9a-f]{64}",d.get("source_sha256","")):
        raise ValueError("SOURCE_SHA_OR_HOST_NOT_AUTHENTICATED")
    if d.get("source_page")!=2 or d.get("source_period")!="2026-T3":
        raise ValueError("UNTRUSTED_PERIOD_OR_PAGE")
    for typ in ("geography","sector"):
        points=[a for a in d["allocations"] if a["type"]==typ]
        if not points or len({a["label"] for a in points})!=len(points):
            raise ValueError("MISSING_OR_DUPLICATED_CHART_LABEL")
        if any(a.get("qa_status")!="needs_review" or not isinstance(a.get("label"),str) or not a["label"].strip() for a in points):
            raise ValueError("FINANCIAL_QA_CANNOT_BE_AUTO_APPROVED")
        total=sum((Decimal(a["exact_pct"]) for a in points),Decimal(0))
        if not Decimal("99.7")<=total<=Decimal("100.3"):
            raise ValueError("ALLOCATION_NOT_100_AFTER_PUBLISHED_ROUNDING")
        for a in points:percent_token(a["exact_pct"])
    return d

def proof(m,slug,out):
    d=validate(m,slug)
    original,url=issuer.fetch_verified_curl(d["source_url"],["www.sofidy.com"])
    if url!=d["source_url"] or hashlib.sha256(original).hexdigest()!=d["source_sha256"]:
        raise ValueError("ISSUER_PDF_HASH_MISMATCH")
    out.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="sofidy-alloc-") as tmp:
        pdf=Path(tmp)/"original.pdf";pdf.write_bytes(original)
        if issuer.proof.independent_poppler(pdf,d["name"],"2026-T3","quarterly_bulletin",6)!=6:
            raise ValueError("INDEPENDENT_FUND_PERIOD_MISMATCH")
        mu=fitz.open(pdf)
        if len(mu)!=6:raise ValueError("UNEXPECTED_ORIGINAL_PAGE_COUNT")
        native=mu[1].get_text("text",sort=True)
        image=out/"2026-T3-original-page-2.png"
        image.write_bytes(mu[1].get_pixmap(matrix=fitz.Matrix(1.4,1.4),alpha=False).tobytes("png"))
        mu.close()
        proc=subprocess.run(["pdftotext","-f","2","-l","2","-layout",str(pdf),"-"],capture_output=True,text=True,timeout=32)
        if proc.returncode!=0 or len(proc.stdout)<200 or len(native)<200:
            raise ValueError("INDEPENDENT_CHART_PAGE_READ_FAIL")
    claims=[]
    for a in d["allocations"]:
        rx=percent_token(a["exact_pct"])
        f1=bool(rx.search(financial.flat(native)))
        f2=bool(rx.search(financial.flat(proc.stdout)))
        claims.append({"type":a["type"],"label":a["label"],"pct":a["exact_pct"],
                       "source_page":2,"mupdf_percentage_present":f1,"poppler_percentage_present":f2,
                       "numeric_status":"TWO_READER_PERCENT_FOUND" if f1 and f2 else "NUMBER_REQUIRES_VISUAL_REVIEW",
                       "chart_label_visual_review_required":True,
                       "qa_pass":False,"publication_authorized":False})
    return {"slug":slug,"source_period":"2026-T3","source_pdf_sha256":d["source_sha256"],
            "raster_sha256":hashlib.sha256(image.read_bytes()).hexdigest(),
            "review_items":claims,"qa_approved":False,"publication_authorized":False,"database_mutated":False}

def main():
    p=argparse.ArgumentParser();p.add_argument("--manifest",type=Path,required=True)
    p.add_argument("--slug",required=True);p.add_argument("--out",type=Path,required=True)
    a=p.parse_args();a.out.mkdir(parents=True,exist_ok=True)
    try:result=proof(json.loads(a.manifest.read_text()),a.slug,a.out);code=0
    except Exception as exc:
        result={"slug":a.slug,"status":"BLOCKED","reason_code":str(exc)[:200],
                "qa_approved":False,"publication_authorized":False,"database_mutated":False}
        code=1
    (a.out/"review.json").write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n")
    print(json.dumps({"slug":a.slug,"items":len(result.get("review_items",[])),"qa_approved":False,
                      "publication_authorized":False,"status":result.get("status","SOURCE_CHART_REVIEW_ONLY")},ensure_ascii=False))
    for claim in result.get("review_items",[]):print("CHART_NUMERIC "+json.dumps({"slug":a.slug,**claim},ensure_ascii=False))
    if any(x["numeric_status"]!="TWO_READER_PERCENT_FOUND" for x in result.get("review_items",[])):code=2
    raise SystemExit(code)
if __name__=="__main__":main()
