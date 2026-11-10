#!/usr/bin/env python3
"""RECOVERY-209: fast, fail-closed per-publisher original PDF field inventory.

Locates *pages* with candidate indicator labels, never extracts finance values
as approved numbers. 14 registered La Francaise REM originals in one family.
All official issuer SHA and period checks must match on two PDF readers.
"""
import argparse,hashlib,json,re,sys,tempfile,unicodedata
from pathlib import Path
import fitz
sys.path.insert(0,str(Path(__file__).resolve().parent))
import candidate_pdf_binary_proof as proof

HOST="doc.la-francaise.com"
FIELDS={
 "capitalisation":[r"\bcapitalisation\b"],
 "prix_souscription":[r"prix (?:de )?souscription",r"\bprix de la part\b"],
 "prix_retrait":[r"\bprix de retrait\b",r"valeur de retrait"],
 "taux_distribution":[r"taux de distribution"],
 "tof":[r"taux d.occupation financier",r"\btof\b"],
 "endettement":[r"\bendettement\b",r"\blevier\b"],
 "nombre_parts":[r"nombre de parts",r"parts en circulation"],
 "nombre_associes":[r"nombre d.associes",r"\bassociés\b"],
 "parts_attente_retrait":[r"parts en attente de retrait",r"parts en attente"],
 "valeur_reconstitution":[r"valeur de reconstitution"],
 "valeur_realisation":[r"valeur de realisation"],
 "repartition_sectorielle":[r"repartition sectorielle",r"repartition par typologie"],
 "repartition_geographique":[r"repartition geographique",r"repartition par pays"],
 "souscription_accessible":[r"ouverte? aux souscriptions",r"fermee? aux souscriptions",r"souscriptions suspendues"],
 "liquidation":[r"\ben liquidation\b",r"dissolution anticipee",r"cessation d.activite"],
}

def norm(s):
    s=unicodedata.normalize("NFKD",s).lower().replace("’","'").replace("\u202f"," ")
    return re.sub(r"\s+"," ","".join(c for c in s if unicodedata.category(c)!="Mn")).strip()

def manifest_contract(m,slug):
    if (not isinstance(m,dict) or m.get("version")!=1 or m.get("publisher")!="La Française REM"
        or m.get("publisher_hosts")!=[HOST] or m.get("source_only") is not True
        or m.get("financial_certification") is not False or m.get("publication_authorized") is not False):
        raise ValueError("UNTRUSTED_PUBLISHER_COHORT")
    candidates=m.get("candidates")
    if not isinstance(candidates,list) or len(candidates)!=14:
        raise ValueError("INVALID_ISSUER_COHORT_SIZE")
    if len({x.get("slug") for x in candidates})!=14:
        raise ValueError("DUPLICATE_SCPI_IDENTITY")
    rows=[c for c in candidates if c.get("slug")==slug]
    if len(rows)!=1:raise ValueError("SCPI_NOT_IN_ISSUER_COHORT")
    for x in candidates:
        if (not isinstance(x.get("name"),str) or not x["name"].strip()
            or not proof.official_url(x.get("source_url"),[HOST])
            or x.get("document_kind") not in ("quarterly_bulletin","semiannual_bulletin")
            or not re.fullmatch(r"2026-(?:T[1-4]|S[12])",x.get("source_period",""))
            or not re.fullmatch(r"[a-f0-9]{64}",x.get("pdf_sha256",""))
            or not isinstance(x.get("page_count"),int) or not 1<=x["page_count"]<=120
            or x.get("subscription_eligibility")!="NOT_VERIFIED"
            or x.get("fund_lifecycle")!="NOT_VERIFIED_FOR_DISTRIBUTION"):
            raise ValueError("UNTRUSTED_SOURCE_OR_DISTRIBUTION_STATUS")
    return rows[0]

def excerpt(text, patterns):
    lines=[norm(line) for line in text.splitlines() if norm(line)]
    for i,line in enumerate(lines):
        if any(re.search(p,line) for p in patterns):
            return " | ".join(lines[max(0,i-1):min(len(lines),i+2)])[:210]
    return ""

def build_inventory(m,slug):
    row=manifest_contract(m,slug)
    original,final=proof.download_official(row["source_url"],[HOST])
    if final!=row["source_url"] or hashlib.sha256(original).hexdigest()!=row["pdf_sha256"]:
        raise ValueError("REGISTERED_ISSUER_ORIGINAL_SHA_MISMATCH")
    with tempfile.TemporaryDirectory(prefix="maximus-lfr-original-") as tmp:
        filename=Path(tmp)/"issuer_original.pdf";filename.write_bytes(original)
        pages_verified=proof.independent_poppler(filename,row["name"],row["source_period"],
                                                  row["document_kind"],row["page_count"])
        if pages_verified!=row["page_count"]:
            raise ValueError("TWO_PDF_READERS_DISAGREE")
        indexed={field:[] for field in FIELDS}
        with fitz.open(filename) as pdf:
            if len(pdf)!=row["page_count"]:raise ValueError("PHYSICAL_PAGE_COUNT_CHANGED")
            for i in range(len(pdf)):
                page=i+1;text=pdf[i].get_text("text",sort=True)
                if len(text)<30:continue
                normalized=norm(text)
                for field,patterns in FIELDS.items():
                    if any(re.search(p,normalized) for p in patterns):
                        indexed[field].append({"page":page,
                            "evidence_locator":excerpt(text,patterns),
                            "financial_numeric_value_approved":False})
        hits=sum(len(v) for v in indexed.values())
        return {"scpi_slug":slug,"issuer":"La Française REM","period":row["source_period"],
            "source_url":row["source_url"],"pdf_sha256":row["pdf_sha256"],
            "page_count":row["page_count"],"reader_engines":["MuPDF","Poppler"],
            "status":"FIELD_PAGE_INVENTORY_ONLY","indexed_label_page_count":hits,
            "fields":indexed,
            "subscription_eligibility":"REQUIRES_FUND_SPECIFIC_ISSUER_REVIEW",
            "fund_lifecycle":"REQUIRES_FUND_SPECIFIC_ISSUER_REVIEW",
            "financial_certified":False,"publication_authorized":False,
            "database_modified":False}

def main():
    cli=argparse.ArgumentParser()
    cli.add_argument("--manifest",type=Path,required=True)
    cli.add_argument("--slug",required=True)
    cli.add_argument("--output",type=Path,required=True)
    a=cli.parse_args();a.output.parent.mkdir(parents=True,exist_ok=True)
    try:
        r=build_inventory(json.loads(a.manifest.read_text(encoding="utf-8")),a.slug)
        code=0
    except Exception as exc:
        r={"scpi_slug":a.slug,"status":"BLOCKED","error_code":str(exc)[:180],
           "financial_certified":False,"publication_authorized":False,"database_modified":False}
        code=1
    a.output.write_text(json.dumps(r,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({"slug":a.slug,"status":r["status"],
                      "labels_found":r.get("indexed_label_page_count",0),
                      "fields_with_page":sorted(k for k,v in r.get("fields",{}).items() if v),
                      "financial_certified":False,"publication_authorized":False},ensure_ascii=False))
    raise SystemExit(code)

if __name__=="__main__":main()
