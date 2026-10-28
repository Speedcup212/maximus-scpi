"""Read-only investigation of EXACT issuer-host quarterly PDF sources.
DOES NOT certify, extrapolate, or write TOF values anywhere.
Outputs document SHA256, PDF page, and label-adjacent text for manual verification.
"""
import concurrent.futures
import hashlib
import json
import re
import sys
from pathlib import Path
import requests
import fitz

DOCS = [
  {
    "scpi_slug": "aestiam-horizon",
    "source_period": "2026-T3",
    "source_url": "https://www.aestiam.com/doc/horizon/periodique/2026-3t-bti-aestiam-horizon.pdf"
  },
  {
    "scpi_slug": "corum-eurion",
    "source_period": "2022-T3",
    "source_url": "https://www.corum.fr/sites/default/files/2023-01/CORUM%20Eurion%20-%20Fil%20d%27Actualit%C3%A9s%202022-T3%20%28Bulletin%20d%27Information%29.pdf"
  },
  {
    "scpi_slug": "corum-eurion",
    "source_period": "2022-T4",
    "source_url": "https://www.corum.fr/sites/default/files/2023-01/CORUM%20Eurion%20-%20Fil%20d%27Actualit%C3%A9s%202022-T4%20%28Bulletin%20d%27Information%29.pdf"
  },
  {
    "scpi_slug": "corum-origin",
    "source_period": "2015-T3",
    "source_url": "https://www.corum.fr/sites/default/files/2020-07/CorumAM%20Convictions%20-%20BTI%203T15.pdf"
  },
  {
    "scpi_slug": "corum-origin",
    "source_period": "2015-T4",
    "source_url": "https://www.corum.fr/sites/default/files/2020-07/CorumAM%20Convictions%20-%20BTI%204T15_0.pdf"
  },
  {
    "scpi_slug": "corum-origin",
    "source_period": "2016-T1",
    "source_url": "https://www.corum.fr/sites/default/files/2020-07/CORUM%20-%20BTI%201T16.pdf"
  },
  {
    "scpi_slug": "corum-origin",
    "source_period": "2016-T2",
    "source_url": "https://www.corum.fr/sites/default/files/2020-07/CORUM%20-%20BTI%202T16.pdf"
  },
  {
    "scpi_slug": "corum-origin",
    "source_period": "2016-T3",
    "source_url": "https://www.corum.fr/sites/default/files/2020-07/CORUM%20-%20BTI%203T16.pdf"
  },
  {
    "scpi_slug": "corum-origin",
    "source_period": "2017-T2",
    "source_url": "https://www.corum.fr/sites/default/files/2021-01/CORUM%20Origin%20-%20Fil%20d%E2%80%99Actualit%C3%A9s%202T2017%20%28Bulletin%20d%E2%80%99Information%29.pdf"
  },
  {
    "scpi_slug": "corum-origin",
    "source_period": "2017-T3",
    "source_url": "https://www.corum.fr/sites/default/files/2021-01/CORUM%20Origin%20-%20Fil%20d%E2%80%99Actualit%C3%A9s%203T2017%20%28Bulletin%20d%E2%80%99Information%29.pdf"
  },
  {
    "scpi_slug": "corum-origin",
    "source_period": "2017-T4",
    "source_url": "https://www.corum.fr/sites/default/files/2023-05/CORUM%20Origin%20-%20Fil%20d%E2%80%99Actualit%C3%A9s%204T2017%20%28Bulletin%20d%E2%80%99Information%29.pdf%20vf_0.pdf"
  },
  {
    "scpi_slug": "corum-origin",
    "source_period": "2018-T1",
    "source_url": "https://www.corum.fr/sites/default/files/2021-01/CORUM%20Origin%20-%20Fil%20d%E2%80%99Actualit%C3%A9s%201T2018%20%28Bulletin%20d%E2%80%99Information%29.pdf"
  },
  {
    "scpi_slug": "corum-origin",
    "source_period": "2018-T2",
    "source_url": "https://www.corum.fr/sites/default/files/2021-01/CORUM%20Origin%20-%20Fil%20d%E2%80%99Actualit%C3%A9s%202T2018%20%28Bulletin%20d%E2%80%99Information%29.pdf"
  },
  {
    "scpi_slug": "corum-origin",
    "source_period": "2018-T3",
    "source_url": "https://www.corum.fr/sites/default/files/2021-01/CORUM%20Origin%20-%20Fil%20d%E2%80%99Actualit%C3%A9s%203T2018%20%28Bulletin%20d%E2%80%99Information%29.pdf"
  },
  {
    "scpi_slug": "corum-xl",
    "source_period": "2018-T1",
    "source_url": "https://www.corum.fr/sites/default/files/2019-04/CORUM%20XL%20-%20Fil%20d%E2%80%99Actualit%C3%A9s%201T2018%20%28Bulletin%20d%E2%80%99Information%29.pdf"
  },
  {
    "scpi_slug": "corum-xl",
    "source_period": "2018-T2",
    "source_url": "https://www.corum.fr/sites/default/files/2019-04/CORUM%20XL%20-%20Fil%20d%E2%80%99Actualit%C3%A9s%202T2018%20%28Bulletin%20d%E2%80%99Information%29.pdf"
  }
]
ISSUER_HOSTS = {"corum-origin":{"www.corum.fr","corum.fr"},"corum-eurion":{"www.corum.fr","corum.fr"},"corum-xl":{"www.corum.fr","corum.fr"},"aestiam-horizon":{"www.aestiam.com","aestiam.com"}}
RE = re.compile(r"(?i)(?:\bTOF\b|taux\s+d[’'\u0027]?occupation\s+financier)")
PCT = re.compile(r"(?<![0-9])(?:[0-9]{1,3}(?:[.,][0-9]{1,3})?)\s*%")
def audit(doc):
    from urllib.parse import urlparse
    host = urlparse(doc["source_url"]).hostname
    if host not in ISSUER_HOSTS[doc["scpi_slug"]]:
        return {**doc,"error":"NON_ISSUER_HOST"}
    try:
        response=requests.get(doc["source_url"],headers={"User-Agent":"Mozilla/5.0 MaximusSCPI official bulletin archival QA","Accept":"application/pdf,*/*"},timeout=32,allow_redirects=True)
        response.raise_for_status()
        payload=response.content
        if not payload.startswith(b"%PDF"): raise ValueError("not_pdf")
        digest=hashlib.sha256(payload).hexdigest()
        reader=fitz.open(stream=payload,filetype="pdf")
        contexts=[]
        for ix,page in enumerate(reader):
            page_text=page.get_text("text",sort=True)
            seen=set()
            for mm in RE.finditer(page_text):
                left=max(0,mm.start()-170);right=min(len(page_text),mm.end()+280)
                snippet=" ".join(page_text[left:right].split())
                if snippet in seen:continue
                seen.add(snippet)
                contexts.append({"page":ix+1,"label":mm.group(0),"snippet":snippet,"nearby_percentages":PCT.findall(snippet)})
        return {**doc,"sha256":digest,"size_bytes":len(payload),"page_count":len(reader),"matches":contexts[:20],"match_count":len(contexts),"download_ok":True}
    except Exception as err:
        return {**doc,"error":str(err)[:300],"download_ok":False}
def main():
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        results=list(pool.map(audit,DOCS))
    Path("tof_pdf_evidence.json").write_text(json.dumps(results,ensure_ascii=False,indent=2))
    print("PDFS",len(results),"SUCCESS",sum(x.get("download_ok",False) for x in results),flush=True)
    for record in results:
        print(json.dumps(record,ensure_ascii=False),flush=True)
if __name__=="__main__":main()
