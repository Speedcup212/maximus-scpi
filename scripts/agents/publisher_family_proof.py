#!/usr/bin/env python3
"""RECOVERY-196: independent technical proof of a publisher-family PDF (no finance approval)."""
import argparse,hashlib,json,os,re,sys,tempfile,subprocess
from urllib.parse import urlsplit
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/"scpi-onboarding"))
import publisherPdfAudit as original
import candidate_pdf_binary_proof as proof

HOSTS={"Sofidy":{"www.sofidy.com"},
       "La Française REM":{"www.la-francaise.com","doc.la-francaise.com"},
       "BNP Paribas REIM":{"reim.bnpparibas-am.com"},
       "Advenis REIM":{"www.advenis-reim.com"}}
KINDS={"quarterly_bulletin":("quarterly",r"20\d{2}-T[1-4]"),
       "semiannual_bulletin":("semiannual",r"20\d{2}-S[12]"),
       "annual_report":("annual",r"20\d{2}-RA")}

def validate(m):
    if not isinstance(m,dict) or m.get("version")!=1 or m.get("publisher") not in HOSTS:
        raise ValueError("UNTRUSTED_FAMILY_MANIFEST")
    hosts=HOSTS[m["publisher"]]
    if set(m.get("approved_hosts") or [])!=hosts:
        raise ValueError("UNTRUSTED_PUBLISHER_HOST_SET")
    documents=m.get("documents")
    if not isinstance(documents,list) or not 1<=len(documents)<=30:
        raise ValueError("INVALID_FAMILY_BATCH")
    seen=set()
    for d in documents:
        if not isinstance(d,dict): raise ValueError("INVALID_DOCUMENT")
        slug,name=d.get("slug"),d.get("name")
        if not isinstance(slug,str) or not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*",slug):
            raise ValueError("INVALID_SCPI_SLUG")
        if slug in seen: raise ValueError("DUPLICATE_SCPI")
        seen.add(slug)
        if not isinstance(name,str) or not name.strip() or len(name)>128:
            raise ValueError("INVALID_SCPI_NAME")
        kind=KINDS.get(d.get("kind"))
        if not kind or not isinstance(d.get("period"),str) or not re.fullmatch(kind[1],d["period"]):
            raise ValueError("WRONG_DOCUMENT_KIND_OR_PERIOD")
        if not original.official_url(d.get("source_page"),hosts) or not original.official_url(d.get("source_url"),hosts):
            raise ValueError("UNAPPROVED_PUBLISHER_URL")
        if not d["source_url"].split("?",1)[0].lower().endswith(".pdf"):
            raise ValueError("EXPECTED_ISSUER_PDF_LINK")
    return m

def fetch_verified_curl(url,approved_hosts):
    """Use OS CA trust store if Python urllib lacks publisher's CA chain.

    HTTPS verification is mandatory. No redirects, no arbitrary issuer, no
    disabled TLS checks and no use of a supplied host/IP without public DNS.
    """
    if not original.official_url(url,approved_hosts):
        raise ValueError("UNAPPROVED_ISSUER_URL")
    proof.public_host_addresses(urlsplit(url).hostname)
    with tempfile.TemporaryDirectory(prefix="scpi-curl-tls-") as path:
        target=Path(path)/"official.pdf"
        command=["curl","--fail","--silent","--show-error",
                 "--proto","=https","--proto-redir","=https",
                 "--location","--max-redirs","0",
                 "--connect-timeout","15","--max-time","75",
                 "--max-filesize",str(original.MAX_BYTES),
                 "--output",str(target),"--write-out","%{url_effective}",url]
        bundle=os.environ.get("SCPI_PUBLISHER_CA_BUNDLE")
        if bundle:
            if not Path(bundle).is_file():
                raise ValueError("VERIFIED_CA_BUNDLE_NOT_FOUND")
            command[1:1]=["--cacert",bundle]
        result=subprocess.run(command,capture_output=True,text=True,timeout=82,check=False)
        if result.returncode!=0:
            raise ValueError("TLS_VERIFIED_ISSUER_FETCH_FAILED:"+result.stderr.strip()[:180])
        final=result.stdout.strip()
        if final!=url or not original.official_url(final,approved_hosts):
            raise ValueError("UNTRUSTED_ISSUER_REDIRECT")
        data=target.read_bytes()
        if len(data)>original.MAX_BYTES or len(data)<800 or not data.startswith(b"%PDF"):
            raise ValueError("INVALID_PUBLISHER_PDF_BINARY")
        return data,final


def verify_one(manifest,slug,auditor=None,reader=None):
    manifest=validate(manifest)
    docs=[d for d in manifest["documents"] if d["slug"]==slug]
    if len(docs)!=1: raise ValueError("FUND_NOT_IN_MANIFEST")
    d=docs[0]
    auditor=auditor or original.audit_document
    reader=reader or proof.independent_poppler
    with tempfile.TemporaryDirectory(prefix="maximus-family-") as path:
        previous=os.environ.get("SCPI_PDF_ARCHIVE_DIR")
        os.environ["SCPI_PDF_ARCHIVE_DIR"]=path
        try:
            doc={"kind":KINDS[d["kind"]][0],"reference_period":d["period"],"url":d["source_url"]}
            issuer={"name":d["name"],"issuer_hosts":manifest["approved_hosts"]}
            audited=auditor(doc,issuer,fetcher=lambda u:fetch_verified_curl(u,manifest["approved_hosts"]))
            digest=audited.get("sha256")
            if not isinstance(digest,str) or not re.fullmatch(r"[a-f0-9]{64}",digest):
                raise ValueError("NO_VERIFIED_SHA256")
            archive=Path(path)/(digest+".pdf")
            if (not archive.is_file() or hashlib.sha256(archive.read_bytes()).hexdigest()!=digest
                or audited.get("publisher_binary_pass") is not True
                or audited.get("fund_and_period_identity_pass") is not True):
                raise ValueError("ORIGINAL_PDF_UNVERIFIED")
            if reader(archive,d["name"],d["period"],d["kind"],audited["page_count"])!=audited["page_count"]:
                raise ValueError("PDF_READERS_DISAGREE")
            return {"publisher":manifest["publisher"],"scpi_slug":slug,"name":d["name"],
                    "publisher_page":d["source_page"],"document_kind":d["kind"],
                    "source_url":audited["source_url"],"source_period":d["period"],
                    "pdf_sha256":digest,"page_count":audited["page_count"],
                    "native_text_characters":audited.get("native_text_characters",0),
                    "reader_engines":["MuPDF","Poppler"],"status":"ISSUER_BINARY_PROVEN",
                    "financial_certified":False,"publication_authorized":False,
                    "staging_written":False,"requires_independent_financial_qa":True}
        finally:
            if previous is None: os.environ.pop("SCPI_PDF_ARCHIVE_DIR",None)
            else: os.environ["SCPI_PDF_ARCHIVE_DIR"]=previous

def main():
    cli=argparse.ArgumentParser()
    cli.add_argument("--manifest",required=True)
    cli.add_argument("--slug",required=True)
    cli.add_argument("--output",required=True)
    a=cli.parse_args()
    dest=Path(a.output);dest.parent.mkdir(parents=True,exist_ok=True)
    try:
        result=verify_one(json.loads(Path(a.manifest).read_text(encoding="utf-8")),a.slug)
    except Exception as e:
        result={"scpi_slug":a.slug,"status":"BLOCKED","error_code":str(e)[:250],
                "financial_certified":False,"publication_authorized":False,"staging_written":False}
        dest.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n")
        print(json.dumps(result,ensure_ascii=False));raise SystemExit(1)
    dest.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n")
    # Public non-sensitive proof summary for independently checking and staging
    # exact official PDF identity / SHA / page count without artifact guessing.
    print(json.dumps(result,ensure_ascii=False))

if __name__=="__main__":main()
