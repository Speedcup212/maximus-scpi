"""INPI RNE source-only official statutes probe. No automatic legal signoff.

Official INPI Actes API v4.0 (June 2025), authenticated with protected
INPI_USERNAME / INPI_PASSWORD runtime secrets. Never supply secrets in a
pull-request workflow; never log credentials, bearer token, or response bodies.
The returned PDF SHA and filed-act metadata are documentary evidence, not
proof of full legal currentness or authorization to publish.
"""
import base64
import binascii
import hashlib
import json
import os
import re
import unicodedata
from urllib.parse import urlsplit
from urllib.request import Request, build_opener, HTTPRedirectHandler
from urllib.error import HTTPError
import fitz

API_ROOT = "https://registre-national-entreprises.inpi.fr"
SIREN = "983023003"
MIN_FILING_DATE = "2026-07-08"
MAX_PDF_BYTES = 12_000_000
MAX_JSON_BYTES = 1_000_000
MAX_PDF_WIRE_BYTES = (MAX_PDF_BYTES * 4 // 3) + 131_072


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise ValueError("INPI_REDIRECT_FORBIDDEN")


def _verified_url(url):
    try:
        parsed = urlsplit(url)
        return (parsed.scheme == "https" and parsed.hostname == "registre-national-entreprises.inpi.fr"
                and parsed.port in (None, 443) and not parsed.username and not parsed.password
                and not parsed.query and not parsed.fragment
                and parsed.path.startswith("/api/"))
    except (ValueError, TypeError):
        return False


def _official_read(url, token=None, payload=None, limit=MAX_JSON_BYTES):
    if not _verified_url(url):
        raise ValueError("INPI_URL_NOT_ALLOWED")
    headers = {"Accept": "application/json" if limit == MAX_JSON_BYTES else "application/pdf"}
    if token:
        headers["Authorization"] = "Bearer " + token
    if payload is not None:
        headers["Content-Type"] = "application/json"
    request = Request(url, headers=headers, data=payload, method="POST" if payload is not None else "GET")
    with build_opener(NoRedirect).open(request, timeout=35) as response:
        if not _verified_url(response.geturl()):
            raise ValueError("INPI_FINAL_URL_NOT_ALLOWED")
        raw = response.read(limit + 1)
    if len(raw) > limit:
        raise ValueError("INPI_RESPONSE_TOO_LARGE")
    return raw


def _decode_inpi_pdf(raw):
    """Decode the documented INPI download envelope; reject HTML/oversize payloads.

    The official documentation shows data:application/pdf;base64,...; a future
    backend may instead return the raw PDF or a JSON binaryFile field.
    Any other document/content type is rejected.
    """
    if len(raw) > MAX_PDF_WIRE_BYTES:
        raise ValueError("INPI_PDF_WIRE_TOO_LARGE")
    if raw.startswith(b"%PDF"):
        return raw
    try:
        envelope = raw.decode("ascii").strip()
    except UnicodeDecodeError:
        raise ValueError("INPI_PDF_ENCODING_UNSUPPORTED") from None
    if envelope.startswith("{"):
        result = _json(raw, max_bytes=MAX_PDF_WIRE_BYTES)
        value = result.get("binaryFile")
        if not isinstance(value, str):
            raise ValueError("INPI_PDF_JSON_MISSING_BINARY_FILE")
        envelope = value.strip()
    elif envelope.startswith('"') and envelope.endswith('"'):
        envelope = _json(json.dumps({"binaryFile": json.loads(envelope)}).encode())["binaryFile"]
    if envelope.startswith("data:application/pdf;base64,"):
        envelope = envelope[len("data:application/pdf;base64,"):]
    elif not envelope.startswith("JVBERi0"):
        raise ValueError("INPI_PDF_EXPECTED_BASE64_PDF")
    if len(envelope) > MAX_PDF_WIRE_BYTES or not envelope:
        raise ValueError("INPI_PDF_ENCODING_TOO_LARGE")
    try:
        decoded = base64.b64decode(envelope, validate=True)
    except (binascii.Error, ValueError):
        raise ValueError("INPI_PDF_INVALID_BASE64") from None
    if not decoded.startswith(b"%PDF") or len(decoded) > MAX_PDF_BYTES:
        raise ValueError("INPI_DOCUMENT_NOT_PDF")
    return decoded


def _json(raw, max_bytes=MAX_JSON_BYTES):
    if len(raw) > max_bytes:
        raise ValueError("INPI_JSON_TOO_LARGE")
    try:
        obj = json.loads(raw)
    except (ValueError, TypeError):
        raise ValueError("INPI_INVALID_JSON") from None
    if not isinstance(obj, dict):
        raise ValueError("INPI_UNEXPECTED_RESPONSE")
    return obj


def _statutes(act):
    types = act.get("typeRdd")
    if not isinstance(types, list):
        return False
    return any(isinstance(item, dict) and
               ("statut" in _fold(item.get("typeActe", "")) or
                "statut" in _fold(item.get("decision", "")))
               for item in types)


def _fold(s):
    text = unicodedata.normalize("NFKD", s if isinstance(s, str) else "")
    return " ".join("".join(c for c in text if not unicodedata.combining(c)).lower().split())


def _eligible(act):
    return (isinstance(act, dict) and act.get("siren") == SIREN
            and isinstance(act.get("dateDepot"), str)
            and re.fullmatch(r"20\d{2}-\d{2}-\d{2}", act["dateDepot"]) is not None
            and act["dateDepot"] >= MIN_FILING_DATE
            and act.get("confidentiality") == "Public"
            and act.get("deleted") is False
            and _statutes(act)
            and isinstance(act.get("id"), str)
            and re.fullmatch(r"[A-Za-z0-9_-]{8,64}", act["id"]) is not None)


def choose_filed_statutes(response):
    acts = response.get("actes")
    if not isinstance(acts, list):
        raise ValueError("INPI_ACTS_LIST_MISSING")
    candidates = [act for act in acts if _eligible(act)]
    if not candidates:
        raise ValueError("INPI_PUBLIC_STATUTES_2026_NOT_FOUND")
    return max(candidates, key=lambda act: (act["dateDepot"], act["id"]))


def inspect_official_pdf(raw, act):
    if not _eligible(act):
        raise ValueError("INPI_ACT_METADATA_NOT_ELIGIBLE")
    if not (800 <= len(raw) <= MAX_PDF_BYTES and raw.startswith(b"%PDF")):
        raise ValueError("INPI_DOCUMENT_NOT_PDF")
    try:
        with fitz.open(stream=raw, filetype="pdf") as pdf:
            if not pdf.is_pdf or pdf.needs_pass or len(pdf) < 2:
                raise ValueError("INPI_PDF_UNREADABLE")
            pages = [_fold(page.get_text(sort=True)) for page in pdf]
    except (RuntimeError, fitz.FileDataError):
        raise ValueError("INPI_PDF_UNREADABLE") from None
    if "sofidynamic" not in " ".join(pages) or "statut" not in " ".join(pages[:4]):
        raise ValueError("INPI_DOCUMENT_IDENTITY_NOT_CONFIRMED")
    return {
        "status": "OFFICIAL_INPI_FILE_MATCHED_AWAITING_INDEPENDENT_LEGAL_REVIEW",
        "source_type": "official_inpi_rne_api",
        "company_siren": SIREN,
        "filing_date": act["dateDepot"],
        "act_id": act["id"],
        "source_url": API_ROOT + "/api/actes/" + act["id"] + "/download",
        "pdf_sha256": hashlib.sha256(raw).hexdigest(),
        "page_count": len(pages),
        "native_text_characters": sum(len(p) for p in pages),
        "official_register_pdf_identity_verified": True,
        "official_register_authenticity_certified": False,
        "statutes_current_certified": False,
        "independent_regulatory_review": False,
        "publication_authorized": False,
    }


def _exception_code(error):
    if isinstance(error, HTTPError):
        return "INPI_HTTP_" + str(error.code)
    if isinstance(error, ValueError) and re.fullmatch(r"[A-Z0-9_]{5,100}", str(error)):
        return str(error)
    return "INPI_FETCH_OR_VALIDATION_FAILED"


def probe_inpi(username=None, password=None, fetcher=_official_read):
    username = username if username is not None else os.environ.get("INPI_USERNAME")
    password = password if password is not None else os.environ.get("INPI_PASSWORD")
    if not username or not password:
        return {
            "status": "INPI_PROTECTED_CREDENTIALS_NOT_CONFIGURED",
            "source_type": "official_inpi_rne_api",
            "statutes_current_certified": False,
            "publication_authorized": False,
        }
    try:
        payload = json.dumps({"username": username, "password": password}).encode()
        login = _json(fetcher(API_ROOT + "/api/sso/login", payload=payload))
        token = login.get("token")
        if not isinstance(token, str) or not token or len(token) > 4096:
            raise ValueError("INPI_BEARER_TOKEN_MISSING")
        listed = _json(fetcher(API_ROOT + "/api/companies/" + SIREN + "/attachments", token=token))
        chosen = choose_filed_statutes(listed)
        act_id = chosen["id"]
        detailed = _json(fetcher(API_ROOT + "/api/actes/" + act_id, token=token))
        if not _eligible(detailed) or detailed["id"] != act_id or detailed["dateDepot"] != chosen["dateDepot"]:
            raise ValueError("INPI_METADATA_MISMATCH")
        raw = fetcher(API_ROOT + "/api/actes/" + act_id + "/download", token=token, limit=MAX_PDF_WIRE_BYTES)
        return inspect_official_pdf(_decode_inpi_pdf(raw), detailed)
    except Exception as error:
        # Do not copy exceptions/URLs/passwords/tokens into CI output or Supabase.
        return {
            "status": "INPI_2026_PDF_NOT_VERIFIED",
            "source_type": "official_inpi_rne_api",
            "error_code": _exception_code(error),
            "official_register_authenticity_certified": False,
            "statutes_current_certified": False,
            "publication_authorized": False,
        }
