#!/usr/bin/env python3
"""RECOVERY-071: inspect a 2026 register-filed Sofidynamic statutes PDF.

Read-only probe of the official authenticated INPI RNE API when credentials are present;\notherwise retains a separate, explicitly untrusted corporate-register mirror probe.
This is not publisher certification, not approval of legal clauses, and not
an update of public/private Supabase tables. Any failure stays explicitly
unverified; never fabricate a SHA or substitute the issuer's 2025 PDF.
"""
import argparse
import hashlib
import json
import re
import subprocess
import tempfile
import unicodedata
from pathlib import Path
from urllib.parse import urlsplit

import fitz
from inpiRegistryStatutes import probe_inpi

REGISTRY_MIRROR_URL = (
    "https://www.pappers.fr/entreprise/sofidynamic-983023003/documents/"
    "SOFIDYNAMIC%20-%20Copie%20des%20statuts%20mis%20%C3%A0%20jour%2008-07-2026.pdf"
)
MAX_PDF_BYTES = 12_000_000
REGISTRY_HOSTS = {"www.pappers.fr"}
SIREN = "983023003"
EXPECTED_DATE = "2026-07-08"


def normalized(text):
    decomp = unicodedata.normalize("NFKD", text or "")
    return " ".join("".join(c for c in decomp if not unicodedata.combining(c)).lower().split())


def source_allowed(url):
    try:
        parsed = urlsplit(url)
        return (parsed.scheme == "https" and parsed.hostname in REGISTRY_HOSTS
                and parsed.username is None and parsed.password is None
                and parsed.port in (None, 443) and parsed.path.lower().endswith(".pdf"))
    except (TypeError, ValueError):
        return False


def get_pdf(url):
    with tempfile.TemporaryDirectory(prefix="sofidynamic-statutes-") as dirname:
        target = Path(dirname) / "candidate.pdf"
        cmd = ["curl", "--fail", "--silent", "--show-error", "--location",
               "--proto", "=https", "--proto-redir", "=https", "--max-redirs", "2",
               "--max-time", "45", "--max-filesize", str(MAX_PDF_BYTES),
               "--user-agent", "Mozilla/5.0",
               "--output", str(target), "--write-out", "%{url_effective}", url]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=55, check=False)
        if result.returncode:
            raise ValueError("MIRROR_HTTP_OR_TLS_ERROR:" + result.stderr.strip()[-180:])
        if not target.exists():
            raise ValueError("MIRROR_EMPTY_RESPONSE")
        return target.read_bytes(), result.stdout.strip()


def inspect(raw, final_url):
    if not source_allowed(final_url):
        raise ValueError("REGISTRY_MIRROR_REDIRECT_UNTRUSTED")
    if len(raw) < 800 or len(raw) > MAX_PDF_BYTES or not raw.startswith(b"%PDF"):
        raise ValueError("REGISTRY_MIRROR_NOT_VALID_PDF")
    digest = hashlib.sha256(raw).hexdigest()
    with fitz.open(stream=raw, filetype="pdf") as pdf:
        if not pdf.is_pdf or pdf.needs_pass or len(pdf) < 2:
            raise ValueError("REGISTRY_DOCUMENT_UNREADABLE")
        pages = [normalized(page.get_text(sort=True)) for page in pdf]
    cover = " ".join(pages[:3])
    text = " ".join(pages)
    if "sofidynamic" not in text or "statuts" not in cover:
        raise ValueError("REGISTRY_STATUTES_IDENTITY_UNCONFIRMED")
    if SIREN not in re.sub(r"\D", "", text):
        raise ValueError("REGISTRY_COMPANY_NUMBER_UNCONFIRMED")
    # Only the source-record metadata establishes the filing date.
    # A date buried in the text is never proof that this is the filed 08/07/2026 version.
    # An observed 2026 date is a secondary corroboration only.
    mentions_2026 = bool(re.search(r"\b2026\b", text))
    return {
        "status": "MIRROR_PDF_RETRIEVED_NEEDS_REGISTRY_SOURCE_RECONCILIATION",
        "source_type": "third_party_corporate_registry_mirror",
        "source_url": final_url,
        "filing_date_listed_by_mirror": EXPECTED_DATE,
        "company_siren": SIREN,
        "pdf_sha256": digest,
        "page_count": len(pages),
        "native_text_characters": sum(map(len, pages)),
        "contains_2026_reference": mentions_2026,
        "identity_text_match": True,
        "official_register_authenticity_certified": False,
        "statutes_current_certified": False,
        "independent_regulatory_review": False,
        "publication_authorized": False,
    }


def probe(fetcher=get_pdf):
    try:
        if not source_allowed(REGISTRY_MIRROR_URL):
            raise ValueError("UNTRUSTED_CONFIGURED_MIRROR")
        raw, final_url = fetcher(REGISTRY_MIRROR_URL)
        return inspect(raw, final_url)
    except Exception as error:
        return {
            "status": "REGISTRY_2026_PDF_NOT_VERIFIED",
            "source_type": "third_party_corporate_registry_mirror",
            "source_url": REGISTRY_MIRROR_URL,
            "error": f"{type(error).__name__}:{str(error)[:280]}",
            "official_register_authenticity_certified": False,
            "statutes_current_certified": False,
            "publication_authorized": False,
        }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", required=True)
    parser.add_argument("--source", choices=("auto", "inpi", "mirror"), default="auto")
    args = parser.parse_args()
    if args.source == "inpi":
        data = probe_inpi()
    elif args.source == "mirror":
        data = probe()
    else:
        official = probe_inpi()
        if official["status"] == "INPI_PROTECTED_CREDENTIALS_NOT_CONFIGURED":
            data = probe()
            data["official_inpi_status"] = "INPI_PROTECTED_CREDENTIALS_NOT_CONFIGURED"
        else:
            # Never silently downgrade a failed official API proof to a mirror.
            data = official
    path = Path(args.output)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(data, indent=2, ensure_ascii=False))
    # Failure to access the independent mirror is an explicit discovery blocker
    # but not a failed build of the existing 68 SCPI.
    # A future publish gate must check statutes_current_certified == true.


if __name__ == "__main__":
    main()
