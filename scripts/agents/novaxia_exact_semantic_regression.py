#!/usr/bin/env python3
"""Read-only adversarial replay of the EXACT Novaxia NEO 2026-T3 original.
Reject 171.25 as realization; the printed reference rows are:
145.51 EUR realization and 171.25 EUR reconstitution, page 7.
"""
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import fitz

ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/"agents"))
sys.path.insert(0,str(ROOT/"agents"/"pilot10"))
import bulletin_fields
from candidate_pdf_binary_proof import download_official
from geometry_review import pdf_words_poppler

SLUG="novaxia-neo"
PERIOD="2026-T3"
SHA="a004d88d5484e1f86e3710e6a8ea8fc29dd204844fb491359bf5804e49e11737"
URL="https://www.novaxia-investissement.fr/wp-content/uploads/2026/11/Reporting-Novaxia-NEO-T3-2026.pdf"
HOSTS=["www.novaxia-investissement.fr","novaxia-investissement.fr"]


def run():
    raw,final_url=download_official(URL,HOSTS)
    if hashlib.sha256(raw).hexdigest()!=SHA or final_url!=URL:
        raise RuntimeError("NOVAXIA_ORIGINAL_SHA_URL_MISMATCH")
    with tempfile.TemporaryDirectory() as root:
        f=Path(root)/"source.pdf"
        f.write_bytes(raw)
        with fitz.open(f) as doc:
            a=([page.get_text("text") for page in doc],
               [[tuple(w[:5]) for w in page.get_text("words")] for page in doc],
               [page.rect.width for page in doc])
        p=subprocess.run(["pdftotext","-layout",str(f),"-"],capture_output=True,
                          text=True,timeout=45)
        if p.returncode:raise RuntimeError("POPPLER_TEXT_FAILED")
        texts=p.stdout.split("\f")
        if texts and not texts[-1].strip():texts.pop()
        bb=pdf_words_poppler(f)
        if len(texts)!=len(a[0]) or len(bb)!=len(a[0]):
            raise RuntimeError("INDEPENDENT_PAGE_COUNT_DISAGREEMENT")
        b=(texts,[[tuple([*w["bbox"],w["t"]]) for w in page] for page in bb],
           a[2])
        result=bulletin_fields.reconcile(
            bulletin_fields.extract(*a,PERIOD),
            bulletin_fields.extract(*b,PERIOD))
    metrics,proofs,coverage,candidates=result
    real=metrics.get("valeur_realisation")
    recon=metrics.get("prix_reconstitution")
    # Only states permitted: explicit correct number or NEEDS_REVIEW.
    # The old, demonstrably erroneous 171.25 realization is prohibited.
    if real is not None and abs(real-145.51)>.005:
        raise RuntimeError("NOVAXIA_INCORRECT_REALIZATION_REINTRODUCED:"+str(real))
    if recon is not None and abs(recon-171.25)>.005:
        raise RuntimeError("NOVAXIA_INCORRECT_RECONSTITUTION:"+str(recon))
    if real is None and coverage.get("valeur_realisation")=="verified":
        raise RuntimeError("NOVAXIA_FALSE_VERIFIED_WITHOUT_METRIC")
    return {"scpi_slug":SLUG,"source_period":PERIOD,"original_sha256":SHA,
         "realization_extraction":real,"reconstitution_extraction":recon,
         "realization_coverage":coverage.get("valeur_realisation"),
         "reconstitution_coverage":coverage.get("prix_reconstitution"),
         "wrong_realization_rejected":True,
         "financial_certified":False,"deploy_allowed":False}


if __name__=="__main__":
    result=run()
    print("NOVAXIA_EXACT_ORIGINAL",json.dumps(result,ensure_ascii=False))
    Path("test-results/novaxia-exact-semantic.json").parent.mkdir(parents=True,exist_ok=True)
    Path("test-results/novaxia-exact-semantic.json").write_text(json.dumps(result,indent=2)+"\n")
