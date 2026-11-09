#!/usr/bin/env python3
"""RECOVERY-206 official Sofidy statutes original proof, source-only and fail-closed."""
import argparse,hashlib,json,os,re,subprocess,sys,tempfile
from pathlib import Path
HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
import publisher_family_proof as source

def validate(m,slug):
    if (m.get("version")!=1 or m.get("publisher")!="Sofidy"
      or set(m.get("allowed_hosts") or [])!={"www.sofidy.com"}
      or m.get("proof_only") is not True or m.get("autoapprove") is not False):
        raise ValueError("INVALID_ISSUER_STATUTES_MANIFEST")
    c=m.get("candidates") or []
    if len(c)!=3 or len({x.get("scpi_slug") for x in c})!=3:
        raise ValueError("STATUTES_SET_MISMATCH")
    v=[x for x in c if x["scpi_slug"]==slug]
    if len(v)!=1:raise ValueError("UNLISTED_SCPI")
    x=v[0]
    if (not source.original.official_url(x.get("source_url"),["www.sofidy.com"])
      or not source.original.official_url(x.get("official_page_url"),["www.sofidy.com"])
      or not isinstance(x.get("name"),str)
      or not re.fullmatch(r"20\d{2}-REG",x.get("edition_period",""))
      or not x["source_url"].split("?",1)[0].lower().endswith(".pdf")):
        raise ValueError("UNTRUSTED_STATUTES_URL_OR_EDITION")
    return x

def poppler_verify(pdf,fund,edition,pages):
    r=subprocess.run(["pdftotext","-layout",str(pdf),"-"],
       capture_output=True,text=True,timeout=45,check=False)
    if r.returncode!=0 or len(r.stdout)<800:
        raise ValueError("POPPLER_STATUTES_UNREADABLE")
    txt=r.stdout.split("\f")
    if txt and not txt[-1].strip():txt.pop()
    if len(txt)!=pages:raise ValueError("PDF_READERS_PAGE_COUNT_DISAGREE")
    norm=source.original.normalize
    alltext=norm(" ".join(txt))
    name=norm(fund)
    if name not in alltext and name.replace(" ","") not in alltext.replace(" ",""):
        raise ValueError("POPPLER_WRONG_LEGAL_FUND")
    if not re.search(r"\bstatuts\b",alltext[:20000]):
        raise ValueError("POPPLER_WRONG_REGULATORY_KIND")
    if edition[:4] not in alltext[:20000]:
        raise ValueError("POPPLER_STATUTES_EDITION_NOT_FOUND")
    return len(alltext)

def verify(manifest,slug,auditor=None,reader=None):
    m=validate(manifest,slug)
    auditor=auditor or source.original.audit_document
    reader=reader or poppler_verify
    with tempfile.TemporaryDirectory(prefix="sofidy-statut-") as folder:
        old=os.environ.get("SCPI_PDF_ARCHIVE_DIR")
        os.environ["SCPI_PDF_ARCHIVE_DIR"]=folder
        try:
            audited=auditor({"kind":"statutes","reference_period":m["edition_period"],"url":m["source_url"]},
                {"name":m["name"],"issuer_hosts":["www.sofidy.com"]},
                fetcher=lambda u:source.fetch_verified_curl(u,["www.sofidy.com"]))
            sha=audited.get("sha256")
            if not isinstance(sha,str) or not re.fullmatch(r"[a-f0-9]{64}",sha):
                raise ValueError("ORIGINAL_STATUTES_NO_SHA")
            original=Path(folder)/(sha+".pdf")
            if not original.is_file() or hashlib.sha256(original.read_bytes()).hexdigest()!=sha:
                raise ValueError("ORIGINAL_STATUTES_HASH_MISMATCH")
            n=audited.get("page_count")
            if (not isinstance(n,int) or n<1 or n>200
              or not audited.get("publisher_binary_pass")
              or not audited.get("fund_and_period_identity_pass")):
                raise ValueError("ISSUER_STATUTES_IDENTITY_UNPROVEN")
            other_chars=reader(original,m["name"],m["edition_period"],n)
            if other_chars<800:raise ValueError("SECOND_ENGINE_NO_TEXT")
            return {"scpi_slug":slug,"kind":"statutes",
              "source_url":audited["source_url"],"official_page_url":m["official_page_url"],
              "edition_period":m["edition_period"],"pdf_sha256":sha,
              "page_count":n,"native_text_characters":audited["native_text_characters"],
              "independent_text_characters":other_chars,"identity_verified":True,"kind_verified":True,
              "reader_engines":["MuPDF","Poppler"],"status":"ORIGINAL_STATUTES_BINARY_VERIFIED",
              "regulatory_review_complete":False,"financial_certified":False,
              "publication_authorized":False,"staging_written":False}
        finally:
            if old is None:os.environ.pop("SCPI_PDF_ARCHIVE_DIR",None)
            else:os.environ["SCPI_PDF_ARCHIVE_DIR"]=old

def main():
    c=argparse.ArgumentParser()
    c.add_argument("--manifest",type=Path,required=True)
    c.add_argument("--slug",required=True)
    c.add_argument("--out",type=Path,required=True)
    a=c.parse_args();a.out.parent.mkdir(parents=True,exist_ok=True)
    try: result=verify(json.loads(a.manifest.read_text()),a.slug)
    except Exception as e:
        result={"scpi_slug":a.slug,"status":"BLOCKED","error_code":str(e)[:240],
             "financial_certified":False,"publication_authorized":False}
        a.out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n")
        print(json.dumps(result,ensure_ascii=False))
        raise SystemExit(1)
    a.out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n")
    print(json.dumps(result,ensure_ascii=False))
if __name__=="__main__":main()
