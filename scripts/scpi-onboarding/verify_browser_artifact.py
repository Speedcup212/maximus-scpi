#!/usr/bin/env python3
"""Verify one GitHub-provided SCPI browser artifact ZIP without trusting its JSON.
Read-only; does not certify financial facts, authorize a release or approve QA.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import re
import sys
import zipfile
from pathlib import Path

SHA256 = re.compile(r"^[a-f0-9]{64}$")
SHA40 = re.compile(r"^[a-f0-9]{40}$")
SLUG = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
PERIOD = re.compile(r"^20[0-9]{2}-(?:T[1-4]|S[12])$")
SURFACES = ("profile", "comparator_analysis", "radar", "simulator", "client_card", "trajectory")
WIDTHS = (390, 1440)
MAX_ZIP = 60_000_000
MAX_UNCOMPRESSED = 100_000_000


def blocked(reason: str) -> dict:
    return {
        "status": "BLOCKED",
        "reason": reason,
        "case_count_verified": 0,
        "content_verified": False,
        "publication_authorized": False,
    }


def verify_archive(path: str | Path, candidate: str, commit: str,
                   source_period: str, expected_zip_sha256: str) -> dict:
    path = Path(path)
    if not SLUG.fullmatch(candidate) or not SHA40.fullmatch(commit) or not PERIOD.fullmatch(source_period):
        return blocked("EXPECTED_CANDIDATE_COMMIT_OR_PERIOD_INVALID")
    if not SHA256.fullmatch(expected_zip_sha256):
        return blocked("EXPECTED_ZIP_DIGEST_INVALID")
    if not path.is_file() or path.stat().st_size > MAX_ZIP:
        return blocked("ZIP_FILE_MISSING_OR_OVERSIZED")
    if hashlib.sha256(path.read_bytes()).hexdigest() != expected_zip_sha256:
        return blocked("ARCHIVE_DIGEST_NOT_GITHUB_VERIFIED_DIGEST")
    try:
        with zipfile.ZipFile(path) as archive:
            entries = archive.infolist()
            if len(entries) > 400 or sum(i.file_size for i in entries) > MAX_UNCOMPRESSED:
                return blocked("ARCHIVE_BOMB_OR_TOO_MANY_ENTRIES")
            if len({i.filename for i in entries}) != len(entries):
                return blocked("DUPLICATE_ARCHIVE_MEMBER")
            if any(i.filename.startswith("/") or ".." in i.filename.split("/") for i in entries):
                return blocked("UNSAFE_ARCHIVE_MEMBER")
            names = {i.filename: i for i in entries}
            manifest_name = f"browser-cases-{candidate}.json"
            meta = names.get(manifest_name)
            if meta is None or meta.file_size > 100_000:
                return blocked("CASE_MANIFEST_MISSING")
            data = json.loads(archive.read(manifest_name))
            if data.get("schema") != "scpi-browser-cases/v2" or data.get("candidate_slug") != candidate:
                return blocked("CASE_MANIFEST_SCHEMA_OR_IDENTITY_MISMATCH")
            if data.get("git_commit_sha") != commit or data.get("source_period") != source_period:
                return blocked("CASE_MANIFEST_COMMIT_OR_PERIOD_MISMATCH")
            if data.get("publication_authorized") is not False or data.get("postdeploy_100_proven") is not False:
                return blocked("FORGED_RELEASE_PERMISSION_IN_BROWSER_MANIFEST")
            cases = data.get("cases")
            if not isinstance(cases, list) or len(cases) != 12:
                return blocked("TWELVE_CASES_REQUIRED")
            expected = {(width, surface) for width in WIDTHS for surface in SURFACES}
            actual = {(c.get("width"), c.get("surface")) for c in cases if isinstance(c, dict)}
            if actual != expected:
                return blocked("BROWSER_SURFACE_COVERAGE_INVALID")
            files = set()
            for c in cases:
                if (c.get("slug") != candidate or c.get("status") != "PASS" or
                    c.get("proof_kind") != "PUPPETEER_SCREENSHOT" or
                    c.get("source_period") != source_period):
                    return blocked("SCREENSHOT_CASE_SOURCE_OR_STATUS_INVALID")
                fn = c.get("proof_file")
                expected_fn = f"{candidate}-{c['width']}-{c['surface']}.png"
                if fn != expected_fn or fn in files:
                    return blocked("SCREENSHOT_FILENAME_OR_UNIQUENESS_INVALID")
                files.add(fn)
                member = names.get(fn)
                if member is None or member.file_size < 10 or member.file_size > 15_000_000:
                    return blocked("SCREENSHOT_MISSING_OR_SIZE_INVALID")
                expected_hash = c.get("proof_sha256")
                if not isinstance(expected_hash, str) or not SHA256.fullmatch(expected_hash):
                    return blocked("CASE_SCREENSHOT_HASH_INVALID")
                if hashlib.sha256(archive.read(fn)).hexdigest() != expected_hash:
                    return blocked("SCREENSHOT_BYTES_HASH_MISMATCH")
            return {
                "status": "GITHUB_ARCHIVE_CASES_VERIFIED",
                "reason": None, "case_count_verified": 12,
                "candidate_slug": candidate, "source_period": source_period,
                "content_verified": True,
                # Verifies only ZIP integrity and tests' existence, not the truth
                # of mocked source data, financial QA or production UI.
                "financially_certified": False,
                "publication_authorized": False,
                "postdeploy_100_proven": False,
            }
    except (ValueError, OSError, UnicodeError, KeyError, zipfile.BadZipFile,
            RuntimeError, TypeError, AttributeError):
        return blocked("CORRUPT_OR_UNREADABLE_BROWSER_ARCHIVE")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--zip", required=True)
    parser.add_argument("--candidate", required=True)
    parser.add_argument("--sha", required=True)
    parser.add_argument("--source-period", required=True)
    parser.add_argument("--zip-digest", required=True)
    args = parser.parse_args()
    report = verify_archive(args.zip, args.candidate, args.sha,
                            args.source_period, args.zip_digest)
    print(json.dumps(report, sort_keys=True))
    return 0 if report["content_verified"] else 1


if __name__ == "__main__":
    sys.exit(main())
