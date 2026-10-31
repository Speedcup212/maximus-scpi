#!/usr/bin/env python3
"""Independent reproducible issuer-binary checks for BNP SCPI T3 candidates.

This check is a technical second pass (PDF binary + page text). It never
records human sign-off or promotes candidates into the published cohort.
"""
import hashlib
import json
import re
import sys
import urllib.request
from pathlib import Path

import fitz

ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT / "src" / "data" / "bnpp_candidates_67_68.json"
EXPECTED = json.loads(r'''{"acces-valeur-pierre":{"nombre_immeubles":[2,"61"],"srri":[2,"3"],"tof_quarterly":[2,"86,50"],"nombre_locataires":[4,"217"],"part_autres_regions":[4,"5,2"],"part_bureaux":[4,"92,1"],"part_commerces":[4,"7,9"],"part_paris":[4,"74,0"],"part_region_parisienne":[4,"20,8"],"capitalisation":[5,"1 829,37"],"distribution_brute_par_part":[5,"7,08"],"nombre_associes":[5,"25 864"],"nombre_parts":[5,"2 391 334"],"parts_attente_retrait":[5,"129 463"],"parts_retirees_trimestre":[5,"191"],"parts_souscrites_trimestre":[5,"191"],"prix_retrait":[5,"696,69"],"prix_souscription":[5,"765,00"],"valeur_realisation_par_part":[5,"610,32"],"valeur_reconstitution_par_part":[5,"745,63"],"frais_souscription_ttc":[6,"10,72"]},"accimmo-pierre":{"endettement_reported":[2,"21,5"],"nombre_immeubles":[2,"143"],"srri":[2,"4"],"tof_quarterly":[2,"87,52"],"nombre_locataires":[4,"363"],"part_autres":[4,"0,1"],"part_autres_regions":[4,"36,2"],"part_bureaux":[4,"64,2"],"part_commerces":[4,"17,7"],"part_hotels":[4,"7,8"],"part_logistique":[4,"5,9"],"part_paris":[4,"12,6"],"part_region_parisienne":[4,"51,1"],"part_sante_education":[4,"4,4"],"capitalisation":[5,"2 622,71"],"distribution_brute_par_part":[5,"1,59"],"nombre_associes":[5,"58 611"],"nombre_parts":[5,"18 600 813"],"parts_attente_retrait":[5,"636 021"],"parts_retirees_trimestre":[5,"248 622"],"parts_souscrites_trimestre":[5,"1 278"],"prix_retrait":[5,"128,41"],"prix_souscription":[5,"141,00"],"valeur_realisation_par_part":[5,"109,46"],"valeur_reconstitution_par_part":[5,"132,51"],"frais_souscription_ttc":[6,"10,72"]}}''')

def page_text(page):
    return re.sub(r"\s+", " ", page.get_text(sort=True).replace("\u202f", " ").replace("\xa0", " "))


def check(manifest, root):
    assert manifest["scope"] == "ONBOARDING_ONLY_NOT_PUBLIC"
    assert manifest["target_cohort_count"] == 68
    assert {c["scpi_slug"] for c in manifest["candidates"]} == set(EXPECTED)
    results = []
    for candidate in manifest["candidates"]:
        slug = candidate["scpi_slug"]
        url = candidate["quarterly_pdf"]
        assert url.startswith("https://reim.bnpparibas-am.com/sites/default/files/docs/")
        assert candidate["release_ready"] is False
        assert candidate["source_period"] == "2026-T3"
        local = root / (slug + "-T3-2026.pdf")
        if local.exists():
            data = local.read_bytes()
        else:
            request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(request, timeout=80) as response:
                assert response.status == 200
                data = response.read()
        assert data.startswith(b"%PDF"), f"{slug}: not a PDF"
        actual_sha = hashlib.sha256(data).hexdigest()
        assert actual_sha == candidate["quarterly_sha256"], f"{slug}: publisher PDF binary changed"
        doc = fitz.open(stream=data, filetype="pdf")
        assert len(doc) == 7, f"{slug}: unexpected PDF page count"
        for field, (page_no, token) in EXPECTED[slug].items():
            txt = page_text(doc[page_no - 1])
            # Two values are touching in the publisher PDF's native text layer,
            # but are separate in the rendered table. Never infer them from a
            # single number in any other position.
            merged_case = (slug == "accimmo-pierre" and
                           field in ("parts_attente_retrait", "parts_retirees_trimestre") and
                           "636 021248 622" in txt)
            value_pattern = r"(?<!\\d)" + re.escape(token) + r"(?!\\d)"
            assert re.search(value_pattern, txt) or merged_case, (
                f"{slug}: source PDF page {page_no} missing {field}={token}")
        assert len(EXPECTED[slug]) >= 20
        assert candidate["observations"]
        for metric in candidate["observations"]:
            assert metric["review"] != "qa_pass", "Automated source tests do not replace independent final QA"
            assert 1 <= metric["page"] <= len(doc)
        results.append({"slug": slug, "sha256": actual_sha, "pages": len(doc),
                        "checks": len(EXPECTED[slug]),
                        "human_financial_approval": False})
    return results


if __name__ == "__main__":
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    arg_root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("/tmp/maximus-bnpp-pdf-qa")
    print(json.dumps(check(manifest, arg_root), ensure_ascii=False, indent=2))
