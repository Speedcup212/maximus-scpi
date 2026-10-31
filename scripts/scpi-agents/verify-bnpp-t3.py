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
EXPECTED = {
    "acces-valeur-pierre": {
        2: ("86,50", "1 829,37", "25 864"),
        5: ("1 829,37", "129 463", "25 864", "765,00", "696,69", "610,32", "745,63", "7,08"),
        6: ("8,93", "10,72"),
    },
    "accimmo-pierre": {
        2: ("87,52", "2 622,71", "58 611", "21,5"),
        5: ("2 622,71", "636 021", "58 611", "141,00", "128,41", "109,46", "132,51", "1,59"),
        6: ("8,93", "10,72"),
    },
}


def page_text(page):
    return re.sub(r"\\s+", " ", page.get_text(sort=True).replace("\\u202f", " ").replace("\\xa0", " "))


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
        for number, tokens in EXPECTED[slug].items():
            txt = page_text(doc[number - 1])
            for token in tokens:
                assert token in txt, f"{slug}: missing page {number} issuer figure {token}"
        assert candidate["observations"]
        for metric in candidate["observations"]:
            assert metric["review"] != "qa_pass", "Automated source tests do not replace independent final QA"
            assert 1 <= metric["page"] <= len(doc)
        results.append({"slug": slug, "sha256": actual_sha, "pages": len(doc),
                        "checks": sum(len(x) for x in EXPECTED[slug].values()),
                        "human_financial_approval": False})
    return results


if __name__ == "__main__":
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    arg_root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("/tmp/maximus-bnpp-pdf-qa")
    print(json.dumps(check(manifest, arg_root), ensure_ascii=False, indent=2))
