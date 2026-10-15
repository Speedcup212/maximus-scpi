#!/usr/bin/env python3
"""Private SCPI document text extraction with mandatory OCR fallback.
No financial metric is certified or published by this worker.
"""
from __future__ import annotations
import hashlib
import io
import ipaddress
import json
import os
import re
import subprocess
import sys
import urllib.parse
import urllib.request

import fitz

BRIDGE = "https://ygvsddcpohsnaowofuwc.supabase.co/functions/v1/maximus-scpi-ocr-oidc"
AUDIENCE = "maximus-scpi-ocr-ygvsddcpohsnaowofuwc"
MAX_PDF_BYTES = 26 * 1024 * 1024
MAX_PAGES = 50
MIN_NATIVE_CHARS = 120
LANGUAGES = "fra+eng"


def normalized(text: str) -> str:
    import unicodedata
    text = unicodedata.normalize("NFD", text)
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9]+", " ",
                  "".join(c for c in text if not unicodedata.combining(c)).lower())).strip()


def secure_https(url: str) -> None:
    parts = urllib.parse.urlsplit(url)
    host = parts.hostname or ""
    if parts.scheme != "https" or not host or parts.username or parts.password:
        raise ValueError("only public HTTPS PDF sources are allowed")
    if host in {"localhost", "metadata.google.internal"} or host.endswith((".local", ".internal")):
        raise ValueError("private host rejected")
    try:
        if not ipaddress.ip_address(host).is_global:
            raise ValueError("private IP rejected")
    except ValueError as err:
        if "private IP rejected" in str(err):
            raise


def post_json(url: str, payload: dict, headers: dict[str, str], timeout: int = 35) -> dict:
    req = urllib.request.Request(url,
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={"Content-Type": "application/json", **headers}, method="POST")
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        result = json.loads(resp.read(1500000).decode("utf-8"))
        if not isinstance(result, dict):
            raise ValueError("unexpected response")
        return result


def oidc_token() -> str:
    url = os.environ["ACTIONS_ID_TOKEN_REQUEST_URL"]
    separator = "&" if "?" in url else "?"
    url += separator + urllib.parse.urlencode({"audience": AUDIENCE})
    req = urllib.request.Request(url, headers={
        "Authorization": "Bearer " + os.environ["ACTIONS_ID_TOKEN_REQUEST_TOKEN"]
    })
    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.load(resp)["value"]


def bridge(payload: dict) -> dict:
    token = oidc_token()  # fresh OIDC token for each operation
    return post_json(BRIDGE, payload, {"Authorization": "Bearer " + token})


def get_pdf(url: str) -> bytes:
    secure_https(url)
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (compatible; MaximusSCPI-OCR/1.0)",
        "Accept": "application/pdf,*/*;q=0.8",
    })
    with urllib.request.urlopen(req, timeout=45) as resp:
        secure_https(resp.url)
        content = resp.read(MAX_PDF_BYTES + 1)
    if len(content) > MAX_PDF_BYTES or not content.startswith(b"%PDF"):
        raise ValueError("invalid PDF signature or excessive PDF size")
    return content


def ocr_page(page: fitz.Page) -> str:
    # Local Tesseract, no third-party document-upload API.
    pix = page.get_pixmap(matrix=fitz.Matrix(2.2, 2.2), alpha=False)
    if pix.width * pix.height > 17000000:
        raise ValueError("page too large for OCR")
    png = pix.tobytes("png")
    env = dict(os.environ)
    env["OMP_THREAD_LIMIT"] = "1"
    run = subprocess.run(
        ["tesseract", "stdin", "stdout", "-l", LANGUAGES, "--psm", "3"],
        input=png, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
        timeout=100, check=False, env=env,
    )
    if run.returncode != 0:
        raise RuntimeError("tesseract failed: " + run.stderr.decode("utf-8", "replace")[:120])
    return run.stdout.decode("utf-8", "replace")


def extract_pages(pdf: bytes) -> list[dict]:
    result = []
    with fitz.open(stream=pdf, filetype="pdf") as doc:
        if doc.page_count < 1 or doc.page_count > MAX_PAGES:
            raise ValueError("PDF page count outside safe range")
        for index in range(doc.page_count):
            page = doc.load_page(index)
            native = page.get_text("text", sort=True)
            normalized_native = re.sub(r"\s+", "", native)
            alphabetic = len(re.findall(r"[A-Za-zÀ-ÿ]", native))
            if len(normalized_native) >= MIN_NATIVE_CHARS and alphabetic >= 65:
                text, method = native, "native_pdf_text"
            else:
                # Mandatory fallback, including mixed image/text PDFs.
                scanned = ocr_page(page)
                text = scanned if len(scanned.strip()) >= len(native.strip()) else native
                method = "tesseract_ocr"
            result.append({"page": index + 1, "text": text[:35000],
                           "method": method})
    return result


def self_test() -> None:
    # Construct a real image-only page: native text extraction MUST fail;
    # then verify that OCR recovers its identity.
    src = fitz.open()
    p = src.new_page(width=595, height=842)
    p.insert_text((48, 110), "CORUM ORIGIN", fontsize=36)
    p.insert_text((48, 170), "BULLETIN TRIMESTRIEL 2026", fontsize=26)
    p.insert_text((48, 215), "NOMBRE DE PARTS 3342316", fontsize=24)
    png = p.get_pixmap(matrix=fitz.Matrix(2, 2)).tobytes("png")
    scanned = fitz.open()
    sp = scanned.new_page(width=595, height=842)
    sp.insert_image(sp.rect, stream=png)
    assert not sp.get_text("text").strip(), "fixture must contain no selectable text"
    pages = extract_pages(scanned.tobytes())
    assert pages[0]["method"] == "tesseract_ocr", pages
    assert "corum origin" in normalized(pages[0]["text"]), pages[0]["text"][:300]
    # Also test native text path with enough characters.
    p.insert_text((48, 270), "Verification documentaire trimestrielle " * 5)
    native = extract_pages(src.tobytes())
    assert native[0]["method"] == "native_pdf_text", native
    print("OCR self-test PASS: scanned page -> Tesseract; native text -> no OCR")


def run_worker() -> None:
    claim = bridge({"op": "claim"})
    task = claim.get("task")
    if not task:
        print("OCR queue empty: no PDF awaiting extraction")
        return
    print("OCR claimed:", task["slug"], task["period"], task["kind"])
    run_id = os.environ.get("GITHUB_RUN_ID", "0")
    try:
        pdf = get_pdf(str(task["url"]))
        sha = hashlib.sha256(pdf).hexdigest()
        pages = extract_pages(pdf)
        all_text = " ".join(p["text"] for p in pages)
        if normalized(task["name"]) not in normalized(all_text):
            raise ValueError("document identity mismatch; no numbers published")
        if len(re.sub(r"\s+", "", all_text)) < 150:
            raise ValueError("no legible text after mandatory OCR")
        outcome = bridge({"op": "complete", "status": "done", "task": task,
                          "sha256": sha, "pages": pages, "run_id": run_id})
        print("OCR recorded:", json.dumps(outcome, ensure_ascii=False))
        if not outcome.get("ok"):
            raise RuntimeError("OCR completion not acknowledged")
    except Exception as err:
        print("OCR failed:", type(err).__name__, str(err)[:200])
        try:
            bridge({"op": "complete", "status": "failed", "task": task,
                    "error": type(err).__name__ + ": " + str(err)[:140],
                    "run_id": run_id})
        except Exception as bridge_err:
            print("OCR failure could not be recorded:", type(bridge_err).__name__)
        raise


if __name__ == "__main__":
    if len(sys.argv) == 2 and sys.argv[1] == "--self-test":
        self_test()
    elif len(sys.argv) == 2 and sys.argv[1] == "--run":
        run_worker()
    else:
        raise SystemExit("usage: scpi_ocr_worker.py --self-test | --run")
