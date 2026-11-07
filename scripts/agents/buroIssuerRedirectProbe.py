#!/usr/bin/env python3
"""Diagnose the registered Buroboutic PDF redirect, without following it.

This is a transport-only diagnostic. A URL/hostname or HEAD response is
NEVER a verified PDF, source period, TOF, independent QA, or publication.
"""
from __future__ import annotations
import ipaddress
import json
from pathlib import Path
import re
import socket
import sys
import urllib.error
import urllib.parse
import urllib.request

SOURCE = "https://www.fiducial-gerance.fr/content/download/544/12625?version=14"
APPROVED_HOST = "www.fiducial-gerance.fr"
SLUG = "buroboutic-metropoles"
PERIOD = "2026-T3"


class StopRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None  # Caller sees HTTPError and captures Location, no fetch.


def validate_source(url):
    parts = urllib.parse.urlsplit(url)
    if (url != SOURCE or parts.scheme != "https" or parts.hostname != APPROVED_HOST
            or parts.port not in (None, 443) or parts.username is not None
            or parts.password is not None):
        raise ValueError("UNTRUSTED_OR_CHANGED_SOURCE")
    return parts


def check_public_dns(hostname):
    info = socket.getaddrinfo(hostname, 443, type=socket.SOCK_STREAM)
    if not info or any(not ipaddress.ip_address(item[4][0]).is_global for item in info):
        raise ValueError("NONPUBLIC_DNS_TARGET")


def redirect_metadata(location, base=SOURCE):
    """Only a sanitized host/path, never a signed query or credential."""
    if not location:
        return {"status": "missing_location", "host_approved": False}
    target=urllib.parse.urlsplit(urllib.parse.urljoin(base, location))
    if (target.scheme != "https" or not target.hostname
            or target.username is not None or target.password is not None
            or target.port not in (None,443)):
        return {"status":"unsafe_redirect", "host_approved":False}
    return {
        "status":"redirect_requires_binary_verification",
        "target_hostname":target.hostname,
        "target_path":target.path[:240],
        "host_approved":target.hostname == APPROVED_HOST,
        "same_issuer_hostname":target.hostname == APPROVED_HOST,
        "requires_independent_pdf_identity_period_sha": True,
    }


def one_probe(url, method, opener):
    req=urllib.request.Request(
        url, method=method,
        headers={
            "User-Agent":"Mozilla/5.0 (compatible; MaximusSCPI-SourceMapping/1.0)",
            "Accept":"application/pdf",
            **({"Range":"bytes=0-0"} if method == "GET" else {})
        })
    try:
        with opener.open(req,timeout=40) as response:
            return {
                "http_status":response.status,
                "method":method,
                "response_is_pdf_claim": "pdf" in response.headers.get("Content-Type","").lower(),
                "redirect":False,
                "message":"HTTP response metadata ONLY; binary unread, SHA and period unverified",
            }
    except urllib.error.HTTPError as err:
        status=err.code
        r={
            "http_status":status,
            "method":method,
            "response_is_pdf_claim":False,
            "redirect":300<=status<400,
        }
        if 300<=status<400:
            r.update(redirect_metadata(err.headers.get("Location")))
        else:
            r["message"]="HTTP status returned; no PDF inspected or verified"
        return r


def audit(opener=None, verify_dns=check_public_dns):
    validate_source(SOURCE)
    verify_dns(APPROVED_HOST)
    fetcher=opener or urllib.request.build_opener(StopRedirect())
    initial=one_probe(SOURCE,"HEAD",fetcher)
    attempts=[initial]
    if initial["http_status"] in (403,405,501):
        attempts.append(one_probe(SOURCE,"GET",fetcher))
    candidate=attempts[-1]
    return {
        "scpi_slug":SLUG, "source_period_registered":PERIOD,
        "source_url":SOURCE,
        "diagnostic":"issuer_redirect_only",
        "observed":candidate,
        "attempts":attempts,
        "canonical_pdf_verified":False,
        "period_identity_verified":False,
        "pdf_sha256_verified":False,
        "financial_certified":False,
        "deploy_allowed":False,
    }


def main():
    out=Path(sys.argv[1]) if len(sys.argv)>1 else Path("test-results/buro-source-mapping")
    out.mkdir(parents=True,exist_ok=True)
    try:
        result=audit()
    except Exception as exc:
        message=str(exc)
        code=message.split(":",1)[0]
        result={
            "scpi_slug":SLUG, "diagnostic":"issuer_redirect_only",
            "status":"blocked",
            "error_code":code if re.fullmatch(r"[A-Z_]{4,65}",code)
                         else "SOURCE_MAPPING_FAILED",
            "financial_certified":False, "deploy_allowed":False,
        }
    (out/"redirect.json").write_text(json.dumps(result,indent=2,ensure_ascii=False)+"\n")
    print("BUROBOUTIC_ISSUER_MAPPING",result.get("observed",{}).get("http_status"),
          result.get("observed",{}).get("target_hostname","none"),
          result.get("error_code","none"),
          "financial_certified=false",flush=True)


if __name__=="__main__":
    main()
