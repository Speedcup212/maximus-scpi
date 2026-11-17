#!/usr/bin/env python3
"""Buroboutic Métropoles: two-PDF independent TOF diagnostic, read-only.

Proof targets:
2026-T2: 91.56% in issuer quarter chart page 4
2026-T3: 91.37% in issuer quarter chart page 4
Never accept 91% generic narrative (T2), 0.07% vacancy subcomponent
(T3), a different quarter's caption, or URL/SHA mismatch.
"""
import hashlib,json,re,subprocess,sys,tempfile
from pathlib import Path
import fitz
from urllib.parse import urlsplit

HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
sys.path.insert(0,str(HERE.parent/"scpi-onboarding"))
from candidate_pdf_binary_proof import download_official
from publisherPdfAudit import normalize
from pilot10.geometry_review import pdf_words_mupdf,pdf_words_poppler,box_center

DOCS={
 "2026-T2":{
  "url":"https://www.fiducial-gerance.fr/content/download/1410/40287?version=4",
  "sha256":"2cc87a2cf3536f145bc6db7d71f8cef69190379fa2e2c369ae8052de896c99ba",
  "value":91.56,"old_bad_value":91,"expected_pages":6,
 },
 "2026-T3":{
  "url":"https://www.fiducial-gerance.fr/content/download/544/12625?version=14",
  "sha256":"5837592186764194f265f2af2ddf6386c8ef980947eb3f088af6a2419d68a89d",
  "value":91.37,"old_bad_value":0.07,"expected_pages":6,
 }
}
def excerpts(pages,targets):
    out=[]
    for n,txt in enumerate(pages):
        normalized=normalize(txt)
        for val in targets:
            # Scan unambiguously formatted percentage; do not rely on a
            # number appearing in a URL, table of contents, or page legend.
            expr=re.compile(r"(?<!\d)"+re.escape(str(val)).replace(r"\.",r"[.,]")+r"\s*%(?!\d)")
            for m in list(expr.finditer(normalized))[:15]:
                excerpt=" ".join(normalized[max(0,m.start()-205):m.end()+240].split())
                out.append({"page":n+1,"value":val,"context":excerpt})
    return out

def word_positions(words,value):
    matcher=re.compile(r"^"+re.escape(str(value)).replace(r"\.",r"[.,]")+r"%?$")
    out=[]
    for i,word in enumerate(words):
        t=word["t"].strip()
        if matcher.fullmatch(t):
            out.append({"bbox":word["bbox"],"token":t})
        elif re.fullmatch(r"\d{1,3}[,.]\d{1,2}",t) and abs(float(t.replace(",","."))-value)<0.001:
            if i+1<len(words) and words[i+1]["t"]=="%":
                out.append({"bbox":word["bbox"],"token":t})
    return out

def main():
    results={"slug":"buroboutic-metropoles","financial_certified":False,
             "human_attestation":False,"deploy_allowed":False,"documents":[]}
    folder=Path("test-results/buroboutic-2026-tof")
    folder.mkdir(parents=True,exist_ok=True)
    for period,info in DOCS.items():
        data,effective=download_official(info["url"],["www.fiducial-gerance.fr","fiducial-gerance.fr"])
        if effective!=info["url"] or hashlib.sha256(data).hexdigest()!=info["sha256"]:
            raise RuntimeError(period+":PUBLISHER_PDF_IDENTITY_FAILED")
        with tempfile.TemporaryDirectory() as tmp:
            path=Path(tmp)/"issuer.pdf";path.write_bytes(data)
            with fitz.open(path) as document:
                if len(document)!=info["expected_pages"]:
                    raise RuntimeError(period+":PAGE_COUNT_MISMATCH")
                texts_a=[pg.get_text(sort=True) for pg in document]
                width=document[3].rect.width
            proc=subprocess.run(["pdftotext","-layout",str(path),"-"],
                 capture_output=True,text=True,timeout=45)
            if proc.returncode:raise RuntimeError(period+":POPPLER_FAILED")
            texts_b=proc.stdout.split("\f")
            if texts_b and not texts_b[-1].strip():texts_b.pop()
            if len(texts_b)!=info["expected_pages"]:
                raise RuntimeError(period+":POPPLER_PAGE_COUNT_MISMATCH")
            page_a=pdf_words_mupdf(path)[3]
            page_b=pdf_words_poppler(path)[3]
            target=info["value"]
            a_positions=word_positions(page_a,target)
            b_positions=word_positions(page_b,target)
            pairs=[]
            for a in a_positions:
                for b in b_positions:
                    ax,ay=box_center(a["bbox"]);bx,by=box_center(b["bbox"])
                    if abs(ax-bx)<2.5 and abs(ay-by)<2.5:
                        pairs.append({"mupdf":a,"poppler":b,"position":[round(ax,2),round(ay,2)]})
            # Do not auto-certify even with a located point: check source
            # diagram's quarter caption and nearby vacancies independently.
            result={"period":period,"url":info["url"],"sha256":info["sha256"],
               "bytes":len(data),"pages":len(texts_a),"expected_tof_percent":target,
               "bad_rejected_value":info["old_bad_value"],
               "mupdf_hits":excerpts(texts_a,[target,info["old_bad_value"]]),
               "poppler_hits":excerpts(texts_b,[target,info["old_bad_value"]]),
               "page4_geometry":pairs[:10],
               "field_financial_certified":False,
               "semantic_chart_qa":"REVIEW_REQUIRED"}
            # Use a full page so the quarter caption and colored chart bars
            # are included; cropped figures can misassign the neighboring bar.
            with fitz.open(path) as document:
                document[3].get_pixmap(matrix=fitz.Matrix(1.5,1.5),alpha=False).save(folder/f"{period}-page4.png")
            results["documents"].append(result)
            print("BURO_TOF",period,"sha",info["sha256"],"matches",len(pairs),
                  "mupdf_hits",len(result["mupdf_hits"]),"poppler_hits",len(result["poppler_hits"]))
            for x in result["mupdf_hits"]:
                if x["page"]==4 and x["value"]==target:
                    print("BURO_PAGE4",period,x["context"][:350])
    (folder/"independent-qa.json").write_text(json.dumps(results,ensure_ascii=False,indent=2)+"\n")
    print("BURO_TOF_SOURCE_CHECK_COMPLETE human_attestation=false financial_certified=false")

if __name__=="__main__":main()
