#!/usr/bin/env python3
"""Read-only byte-identical provenance test for archived PAREF Evo 2024-T4.

Issuer paref-gestion.com currently HTTP 502. Broker mirrors are untrusted as
sources; accept their bytes ONLY if full SHA256 and size exactly match the
already-registered ORIGINAL publisher PDF in private Supabase Storage. A text
match or identical reported percentage is NOT sufficient for admission.
"""
import hashlib
import json
import sys
import urllib.parse
import urllib.request
from pathlib import Path

EXPECTED_SHA="c9abf92651017d3d83400949a07d5a41aef594775c48bd7e0065da391d1e17d9"
EXPECTED_BYTES=2171159
CANONICAL_ISSUER="https://paref-gestion.com/wp-content/uploads/2025/04/05c7e184-d5e4-4cdd-bf9f-7ee2c008b217-BTI-T4-2024-PAREF-Evo.pdf"
MIRRORS=[
    ("Primaliance","https://www.primaliance.com/sites/default/files/products/1738/PAREF_EVO-Bulletin_trimestriel-2024-4T.pdf"),
    ("FranceSCPI","https://francescpi.com/scpi-de-rendement/paref-evo/bi/paref-evo-bulletin-2024-t4.pdf"),
    ("FortunyConseil","https://access.fortunyconseil.fr/api/v1/SCPI/files/bulletintrimestrielt42024_4c9860c0eaf011ef9da1d3f509fe0ba6.pdf"),
]
ALLOWED={
  "www.primaliance.com","francescpi.com","access.fortunyconseil.fr"
}

def check_binary(data):
    if not data.startswith(b"%PDF") or len(data)!=EXPECTED_BYTES:
        return False
    return hashlib.sha256(data).hexdigest()==EXPECTED_SHA

def fetch_source(src):
    original=urllib.parse.urlparse(src)
    if original.scheme!="https" or original.hostname not in ALLOWED:
        raise ValueError("UNAPPROVED_MIRROR_HOST")
    request=urllib.request.Request(src,headers={"User-Agent":"Mozilla/5.0"})
    with urllib.request.urlopen(request,timeout=70) as response:
        final=urllib.parse.urlparse(response.geturl())
        if response.status!=200 or final.scheme!="https" or final.hostname not in ALLOWED:
            raise ValueError("UNAPPROVED_REDIRECT_OR_STATUS")
        data=response.read(8*1024*1024+1)
    return data

def main():
    out=Path(sys.argv[1] if len(sys.argv)>1 else "test-results/paref-evo-source")
    out.mkdir(parents=True,exist_ok=True)
    results=[]
    match_found=False
    for name,url in MIRRORS:
        row={"mirror":name,"url":url,"identity":"untrusted_until_exact_archived_sha_matches"}
        try:
            data=fetch_source(url)
            sha=hashlib.sha256(data).hexdigest()
            row.update(sha256=sha,bytes=len(data),exact_issuer_binary_match=check_binary(data),
                       download_status="downloaded")
            if check_binary(data):
                (out/"paref-evo-2024-T4-exact-issuer.pdf").write_bytes(data)
                match_found=True
                print("PAREF_EVO_T4_EXACT_ISSUER_SHA_MATCH",name,sha,len(data))
            else:
                print("PAREF_EVO_T4_MIRROR_SHA_NOT_IDENTICAL",name,sha,len(data))
        except Exception as exc:
            row.update(download_status="blocked",error=str(exc)[:180],
                       exact_issuer_binary_match=False)
            print("PAREF_EVO_T4_MIRROR_UNAVAILABLE",name,str(exc)[:120])
        results.append(row)
    report={"status":"exact_archived_issuer_binary_proven" if match_found else "blocked",
      "slug":"paref-evo","period":"2024-T4",
      "canonical_issuer_url":CANONICAL_ISSUER,
      "registered_archive_sha256":EXPECTED_SHA,
      "registered_archive_bytes":EXPECTED_BYTES,
      "financial_certified":False,
      "human_attestation":False,
      "publication_authorized":False,
      "mirrors":results}
    (out/"sha_comparison.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    if not match_found:
        raise SystemExit(1)

if __name__=="__main__":
    main()
