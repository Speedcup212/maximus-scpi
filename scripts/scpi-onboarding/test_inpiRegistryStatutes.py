import unittest
import json
import fitz

from inpiRegistryStatutes import (
    API_ROOT, SIREN, choose_filed_statutes, inspect_official_pdf,
    probe_inpi, _verified_url
)


def pdf_bytes(text="SOFIDYNAMIC STATUTS MIS A JOUR 08 JUILLET 2026"):
    with fitz.open() as document:
        p = document.new_page()
        p.insert_text((50, 75), text)
        second = document.new_page()
        second.insert_text((50, 75), "Sofidynamic — capital et regles statutaires")
        return document.tobytes()


def act(id="6385db8b901325760b0c0d71", date="2026-07-08", siren=SIREN, kind="Statuts mis à jour"):
    return {
        "id": id, "siren": siren, "denomination": "SOFIDYNAMIC",
        "dateDepot": date, "confidentiality": "Public",
        "deleted": False, "typeRdd": [{"typeActe": kind}]
    }


class InpiOfficialStatutesTests(unittest.TestCase):
    def test_official_domain_exact_tls_and_no_url_parameters(self):
        self.assertTrue(_verified_url(API_ROOT + "/api/companies/" + SIREN + "/attachments"))
        for url in [
            "http://registre-national-entreprises.inpi.fr/api/sso/login",
            "https://registre-national-entreprises.inpi.fr.evil.test/api/sso/login",
            "https://user:password@registre-national-entreprises.inpi.fr/api/sso/login",
            "https://registre-national-entreprises.inpi.fr:8443/api/sso/login",
            "https://registre-national-entreprises.inpi.fr/private",
            "https://registre-national-entreprises.inpi.fr/api/actes/x?token=secret",
        ]:
            self.assertFalse(_verified_url(url))

    def test_no_credentials_fails_closed_without_any_network(self):
        calls = []
        result = probe_inpi("", "", lambda *a, **k: calls.append(a))
        self.assertEqual(result["status"], "INPI_PROTECTED_CREDENTIALS_NOT_CONFIGURED")
        self.assertFalse(result["publication_authorized"])
        self.assertEqual(calls, [])

    def test_latest_public_statutes_for_exact_siren_only(self):
        before = act(id="6385db8b901325760b0c0d70", date="2026-07-07")
        wrong_company = act(id="6385db8b901325760b0c0d72", date="2026-10-10", siren="999999999")
        wrong_kind = act(id="6385db8b901325760b0c0d73", date="2026-10-10", kind="Comptes annuels")
        newer = act(id="6385db8b901325760b0c0d74", date="2026-08-10")
        private = {**act(id="6385db8b901325760b0c0d75", date="2026-10-11"), "confidentiality": "Confidentiel"}
        deleted = {**act(id="6385db8b901325760b0c0d76", date="2026-10-11"), "deleted": True}
        self.assertEqual(
            choose_filed_statutes({"actes": [before, wrong_company, wrong_kind, act(), newer, private, deleted]})["id"],
            newer["id"]
        )
        with self.assertRaisesRegex(ValueError, "NOT_FOUND"):
            choose_filed_statutes({"actes": [before, wrong_company, wrong_kind, private, deleted]})

    def test_official_binary_and_metadata_are_not_legal_certification(self):
        original = act()
        raw = pdf_bytes()
        report = inspect_official_pdf(raw, original)
        self.assertEqual(report["status"], "OFFICIAL_INPI_FILE_MATCHED_AWAITING_INDEPENDENT_LEGAL_REVIEW")
        self.assertEqual(report["filing_date"], "2026-07-08")
        self.assertTrue(report["official_register_pdf_identity_verified"])
        self.assertEqual(len(report["pdf_sha256"]), 64)
        self.assertFalse(report["official_register_authenticity_certified"])
        self.assertFalse(report["statutes_current_certified"])
        self.assertFalse(report["publication_authorized"])

    def test_official_metadata_cannot_rescue_wrong_document(self):
        with self.assertRaisesRegex(ValueError, "NOT_PDF"):
            inspect_official_pdf(b"<html>captcha</html>", act())
        with self.assertRaisesRegex(ValueError, "IDENTITY_NOT_CONFIRMED"):
            inspect_official_pdf(pdf_bytes("OTHER COMPANY STATUTS"), act())
        with self.assertRaisesRegex(ValueError, "METADATA_NOT_ELIGIBLE"):
            inspect_official_pdf(pdf_bytes(), act(date="2025-07-08"))

    def test_authenticated_pipeline_uses_all_four_official_endpoints_without_logging_secret(self):
        item = act()
        secret = "password-must-not-appear"
        calls = []
        def fetch(url, token=None, payload=None, limit=None):
            calls.append((url, token, payload is not None, limit))
            if url.endswith("/api/sso/login"):
                self.assertIn(secret, payload.decode())
                self.assertIsNone(token)
                return json.dumps({"token": "protected-token-not-output"}).encode()
            self.assertEqual(token, "protected-token-not-output")
            if url.endswith("/attachments"):
                return json.dumps({"actes": [item]}).encode()
            if url.endswith("/download"):
                return pdf_bytes()
            return json.dumps(item).encode()
        out = probe_inpi("registered@example.org", secret, fetch)
        self.assertEqual(out["status"], "OFFICIAL_INPI_FILE_MATCHED_AWAITING_INDEPENDENT_LEGAL_REVIEW")
        self.assertEqual(len(calls), 4)
        self.assertEqual(calls[-1][3], 12_000_000)
        self.assertNotIn(secret, json.dumps(out))
        self.assertNotIn("protected-token", json.dumps(out))
        self.assertFalse(out["publication_authorized"])

    def test_mismatched_detail_metadata_or_http_403_stays_unverified(self):
        item = act()
        def fail_detail(url, token=None, payload=None, limit=None):
            if url.endswith("/api/sso/login"):
                return b'{"token":"secret"}'
            if url.endswith("/attachments"):
                return json.dumps({"actes": [item]}).encode()
            return json.dumps(act(siren="999999999")).encode()
        out = probe_inpi("x", "p", fail_detail)
        self.assertEqual(out["status"], "INPI_2026_PDF_NOT_VERIFIED")
        self.assertEqual(out["error_code"], "INPI_METADATA_MISMATCH")
        def fail_403(*args, **kwargs):
            raise ValueError("password the secret 403")
        out = probe_inpi("x", "secret", fail_403)
        self.assertEqual(out["error_code"], "INPI_FETCH_OR_VALIDATION_FAILED")
        self.assertNotIn("secret", json.dumps(out))
        self.assertFalse(out["statutes_current_certified"])


if __name__ == "__main__":
    unittest.main()
