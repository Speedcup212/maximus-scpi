#!/usr/bin/env python3
"""Independent read-only QA from the EXISTING GitHub->Supabase OIDC bridge.

Never exposes private storage URLs, JWT or service-role key. Two exact,
issuer-registered PDFs only. Even after dual PDF readers agree, this probe
NEVER writes financial certifications or human sign-offs.
"""
import hashlib
import json
import os
import re
import subprocess
import tempfile
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path
import fitz

BRIDGE="https://ygvsddcpohsnaowofuwc.supabase.co/functions/v1/scpi-bulletin-replay-oidc"
AUDIENCE="maximus-scpi-bulletin-replay-ygvsddcpohsnaowofuwc"
SPECS=[
 dict(slug="paref-evo",period="2024-T4",
      sha256="c9abf92651017d3d83400949a07d5a41aef594775c48bd7e0065da391d1e17d9",
      bytes=2171159,tof=94.4,label="94,4",vacant=5.6,aliases=["paref evo","interpierre europe centrale"]),
 dict(slug="paref-hexa",period="2026-T3",
      sha256="ca4a3569a990f99b376268875440ebc1e1aadefa85aab582ebca96cbce0c62ce",
      bytes=1775561,tof=84.5,label="84,5",vacant=None,aliases=["paref hexa"]),
]

def issuer_token():
    endpoint=os.environ["ACTIONS_ID_TOKEN_REQUEST_URL"]
    endpoint+=("&" if "?" in endpoint else "?")+urllib.parse.urlencode({"audience":AUDIENCE})
    req=urllib.request.Request(endpoint,headers={
        "Authorization":"Bearer "+os.environ["ACTIONS_ID_TOKEN_REQUEST_TOKEN"]})
    with urllib.request.urlopen(req,timeout=30) as response:
        data=json.load(response)
    token=data.get("value")
    if not token or len(token)<100: raise ValueError("NO_TRUSTED_GITHUB_OIDC_TOKEN")
    return token

def archived_read(spec):
    token=issuer_token()
    body=json.dumps({"op":"archived_exact_source_probe",
                     "slug":spec["slug"],"period":spec["period"],
                     "sha256":spec["sha256"]}).encode()
    req=urllib.request.Request(BRIDGE,data=body,method="POST",headers={
       "Authorization":"Bearer "+token,"Content-Type":"application/json"})
    with urllib.request.urlopen(req,timeout=50) as response:
        data=json.load(response)
    if data.get("status")!="exact_registered_archived_issuer_source":
        raise ValueError("PRIVATE_OIDC_ARCHIVED_SOURCE_PROOF_NOT_AUTHORIZED")
    for k in ("slug","period","sha256"):
        if data.get(k)!=spec[k]:
            raise ValueError("ARCHIVED_SOURCE_BRIDGE_IDENTITY_MISMATCH")
    signed=data.get("signed_url")
    if not isinstance(signed,str):
        raise ValueError("NO_PRIVATE_SIGNED_SOURCE")
    target=urllib.parse.urlparse(signed)
    if target.scheme!="https" or target.hostname!="ygvsddcpohsnaowofuwc.supabase.co":
        raise ValueError("ARCHIVE_REDIRECT_OUTSIDE_PRIVATE_PROJECT")
    with urllib.request.urlopen(signed,timeout=65) as response:
        final=urllib.parse.urlparse(response.geturl())
        if response.status!=200 or final.scheme!="https" or final.hostname!=target.hostname:
            raise ValueError("PRIVATE_ARCHIVE_DOWNLOAD_WRONG_HOST_OR_HTTP")
        raw=response.read(10*1024*1024+1)
    if len(raw)!=spec["bytes"] or not raw.startswith(b"%PDF"):
        raise ValueError("REGISTERED_ARCHIVE_BYTE_COUNT_OR_PDF_HEADER_MISMATCH")
    if hashlib.sha256(raw).hexdigest()!=spec["sha256"]:
        raise ValueError("REGISTERED_ARCHIVE_SHA256_MISMATCH")
    return raw

def words_poppler(path,page,target):
    r=subprocess.run(["pdftotext","-f",str(page),"-l",str(page),
                      "-bbox",str(path),"-"],capture_output=True,text=True,
                     timeout=45,check=True)
    try:
        root=ET.fromstring(r.stdout)
        return [[round(float(e.attrib[k]),2) for k in ("xMin","yMin","xMax","yMax")]
                for e in root.iter() if e.tag.endswith("word") and e.text==target]
    except ET.ParseError:
        # Fail closed; no OCR invented and no guessed PDF values
        raise ValueError("POPPLER_BBOX_MALFORMED_ON_TOF_PAGE")

def source_qa(spec,raw):
    with tempfile.TemporaryDirectory() as td:
        path=Path(td)/"verified-original.pdf"
        path.write_bytes(raw)
        with fitz.open(stream=raw,filetype="pdf") as doc:
            cover=" ".join(doc[i].get_text("text").lower() for i in range(min(2,len(doc))))
            if not any(x in cover for x in spec["aliases"]):
                raise ValueError("ARCHIVED_ORIGINAL_FUND_IDENTITY_MISMATCH")
            quarter=spec["period"].split("-")[-1].lower()
            year=spec["period"].split("-")[0]
            if not (year in cover and (quarter in cover or
                     re.search(rf"{int(quarter[-1])}(?:er|e|eme)?\s*trimestre",cover))):
                raise ValueError("ARCHIVED_ORIGINAL_COVER_PERIOD_MISMATCH")
            positions=[]
            for i,page in enumerate(doc):
                text=page.get_text("text").lower()
                if "tof" not in text and "occupation financier" not in text:
                    continue
                mu=[[round(float(v),2) for v in w[:4]] for w in page.get_text("words")
                    if w[4].strip("%*") == spec["label"]]
                if not mu:continue
                po=words_poppler(path,i+1,spec["label"])
                if not po: continue
                pairs=[(m,p) for m in mu for p in po
                       if all(abs(a-b)<1 for a,b in zip(m,p))]
                if pairs:
                    positions.append({
                        "page":i+1,
                        "mupdf_target_boxes":mu,
                        "poppler_target_boxes":po,
                        "same_numeric_word_coordinates":True,
                        "local_tof_context":" ".join(
                            text[max(0,text.index("tof")-45):text.index("tof")+125].split())[:170]
                            if "tof" in text else "TOF label present as occupation financier",
                    })
        if not positions:raise ValueError("TWO_READERS_CANNOT_LINK_PUBLISHED_TOF_TO_ISSUER_PAGE")
        return {"slug":spec["slug"],"period":spec["period"],
          "sha256":spec["sha256"],"original_archive_bytes":len(raw),
          "tof_candidate_percent":spec["tof"],"target_position_matches":positions,
          "review_kind":"exact_archived_original_sha_plus_dual_pdf_geometry",
          "status":"issuer_binary_verified_candidate_geometry",
          "financial_certified":False,"human_attestation":False,
          "publication_authorized":False}

def main():
    import sys
    out=Path(sys.argv[1] if len(sys.argv)>1 else "test-results/paref-private-archive")
    out.mkdir(parents=True,exist_ok=True)
    report={"status":"read_only_exact_archive_source_qa","records":[]}
    for spec in SPECS:
        try:
            raw=archived_read(spec)
            result=source_qa(spec,raw)
            print("PAREF_PRIVATE_ARCHIVE_SHA_AND_GEOMETRY_PASS",spec["slug"],spec["period"],
                  spec["sha256"],[p["page"] for p in result["target_position_matches"]],flush=True)
        except Exception as exc:
            result={"slug":spec["slug"],"period":spec["period"],"status":"blocked",
                    "code":str(exc)[:180],
                    "financial_certified":False,"human_attestation":False}
            print("PAREF_PRIVATE_ARCHIVE_PROOF_BLOCKED",spec["slug"],str(exc)[:140],flush=True)
        report["records"].append(result)
    (out/"source-qa.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    if any(r["status"]!="issuer_binary_verified_candidate_geometry" for r in report["records"]):
        raise SystemExit(1)

if __name__=="__main__":
    main()
