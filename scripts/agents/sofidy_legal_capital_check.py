#!/usr/bin/env python3
"""RECOVERY-204: detect explicit capital structure in verified 2026 Sofidy DIC.

Never derive variable/fixed from the existence of a redemption price or the
company's brand. Requires exact official TLS PDF hash, MuPDF+Poppler original,
issuer identity and explicit 2026 DIC clause. No SQL/publication writes.
"""
import argparse,hashlib,json,re,subprocess,sys,tempfile
from pathlib import Path
import fitz
HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
import publisher_family_proof as family

def validate(manifest,slug):
    if (manifest.get("version")!=1 or manifest.get("publisher")!="Sofidy"
        or manifest.get("check_only") is not True
        or manifest.get("financial_certified") is not False
        or len(manifest.get("candidates",[]))!=3):
        raise ValueError("INVALID_DIC_MANIFEST")
    cs=manifest["candidates"]
    if len({x["scpi_slug"] for x in cs})!=3:raise ValueError("DUPLICATE_FUND")
    targets=[x for x in cs if x["scpi_slug"]==slug]
    if len(targets)!=1:raise ValueError("UNKNOWN_FUND")
    x=targets[0]
    if (not family.original.official_url(x["source_url"],["www.sofidy.com"])
        or not family.original.official_url(x["official_page_url"],["www.sofidy.com"])
        or not re.fullmatch(r"[a-f0-9]{64}",x["pdf_sha256"])
        or x["page_count"]<1 or x["page_count"]>10):
        raise ValueError("UNTRUSTED_DIC_ORIGINAL")
    return x

def test_text(engine,pages,name):
    normalize=family.original.normalize
    page_text=[normalize(x) for x in pages]
    alltext=" ".join(page_text)
    legal_name=normalize(name)
    if legal_name not in alltext and legal_name.replace(" ","") not in alltext.replace(" ",""):
        raise ValueError(engine+"_SCPI_IDENTITY_MISSING")
    if not re.search(r"document d.informations cles",alltext[:25000]):
        raise ValueError(engine+"_DIC_KIND_MISSING")
    if "2026" not in alltext[:25000]:
        raise ValueError(engine+"_ISSUER_EDITION_YEAR_MISSING")
    signals=[]
    for i,t in enumerate(page_text):
        for kind,rx in [("variable",r"\bcapital variable\b"),("fixed",r"\bcapital fixe\b")]:
            for m in re.finditer(rx,t):
                signals.append({"kind":kind,"page":i+1,
                    "clause":t[max(0,m.start()-130):min(len(t),m.end()+160)]})
    return signals

def prove(manifest,slug):
    x=validate(manifest,slug)
    original,url=family.fetch_verified_curl(x["source_url"],["www.sofidy.com"])
    if url!=x["source_url"] or hashlib.sha256(original).hexdigest()!=x["pdf_sha256"]:
        raise ValueError("ISSUER_DIC_ORIGINAL_CHANGED")
    with tempfile.TemporaryDirectory(prefix="sofi-dic-capital-") as folder:
        dest=Path(folder)/"official-2026-dic.pdf"
        dest.write_bytes(original)
        with fitz.open(dest) as pdf:
            if len(pdf)!=x["page_count"]:raise ValueError("DIC_PAGE_COUNT_CHANGED")
            mu=[p.get_text("text",sort=True) for p in pdf]
        p=subprocess.run(["pdftotext","-layout",str(dest),"-"],capture_output=True,
            text=True,timeout=35,check=False)
        if p.returncode!=0 or len(p.stdout)<500:
            raise ValueError("POPPLER_DIC_READ_FAILED")
        pp=p.stdout.split("\f")
        if pp and not pp[-1].strip():pp.pop()
        if len(pp)!=x["page_count"]:
            raise ValueError("PDF_ENGINES_PAGE_COUNT_DISAGREEMENT")
        mu_signals=test_text("MuPDF",mu,x["name"])
        pp_signals=test_text("Poppler",pp,x["name"])
    kinds_mu={s["kind"] for s in mu_signals}
    kinds_pp={s["kind"] for s in pp_signals}
    if kinds_mu=={"variable"} and kinds_pp=={"variable"}:
        status="EXPLICIT_VARIABLE_CAPITAL_BOTH_READERS"
        regime="variable"
    elif kinds_mu=={"fixed"} and kinds_pp=={"fixed"}:
        status="EXPLICIT_FIXED_CAPITAL_BOTH_READERS"
        regime="fixed"
    else:
        status="LEGAL_CAPITAL_REGIME_REVIEW_REQUIRED"
        regime=None
    return {
        "scpi_slug":slug,"name":x["name"],"document_kind":"dic",
        "source_period":"2026-REG","source_url":url,
        "pdf_sha256":x["pdf_sha256"],"page_count":x["page_count"],
        "capital_type_proposed":regime,
        "technical_status":status,"readers":["MuPDF","Poppler"],
        "evidence_by_reader":{"MuPDF":mu_signals,"Poppler":pp_signals},
        "financial_certified":False,"publication_authorized":False,
        "human_reviewed":False,"staging_written":False
    }

def main():
    cli=argparse.ArgumentParser()
    cli.add_argument("--manifest",type=Path,required=True)
    cli.add_argument("--slug",required=True)
    cli.add_argument("--out",type=Path,required=True)
    a=cli.parse_args();a.out.parent.mkdir(parents=True,exist_ok=True)
    try:
        result=prove(json.loads(a.manifest.read_text()),a.slug)
    except Exception as error:
        result={"scpi_slug":a.slug,"technical_status":"BLOCKED",
                "error_code":str(error)[:200],
                "financial_certified":False,"publication_authorized":False}
        a.out.write_text(json.dumps(result,indent=2,ensure_ascii=False)+"\n")
        print(json.dumps(result,ensure_ascii=False))
        raise SystemExit(1)
    a.out.write_text(json.dumps(result,indent=2,ensure_ascii=False)+"\n")
    print(json.dumps(result,ensure_ascii=False))

if __name__=="__main__":main()
