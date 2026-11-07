import copy
import json
from pathlib import Path
import tempfile
import unittest

import lfremIssuerProbe as probe


MANIFEST = Path(__file__).resolve().parent / "fixtures/lfrem_2026t2_issuer_leads.json"


class IssuerProbeContractTest(unittest.TestCase):
    def setUp(self):
        self.manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))

    def test_exact_14_current_official_index_leads_are_discovery_only(self):
        docs = probe.validate_discovery_manifest(self.manifest)
        self.assertEqual(len(docs), 14)
        self.assertEqual(len({d["scpi_slug"] for d in docs}), 14)
        self.assertFalse(self.manifest["financial_certified"])
        self.assertFalse(self.manifest["deploy_allowed"])
        self.assertEqual(sum(d["source_period"] == "2026-T2" and
                             d["document_kind"] == "quarterly_bulletin" for d in docs), 1)
        self.assertEqual(sum(d["source_period"] == "2026-S1" and
                             d["document_kind"] == "semiannual_bulletin" for d in docs), 13)
        self.assertEqual(docs[0]["scpi_slug"], "lf-croissance-et-territoires")

    def test_exact_registration_requires_fourteen_real_issuer_source_proofs(self):
        migration = (
            Path(__file__).resolve().parents[2] /
            "supabase/migrations/20261107_recovery133_lfrem_binary_proof_registration.sql"
        ).read_text(encoding="utf-8")
        self.assertIn("IF n<>14", migration)
        self.assertIn("AND idx.direct_document_url=e.url", migration)
        self.assertIn("e.sha ~ '^[a-f0-9]{64}
        for url in [
            "https://evil.test/Documents/bulletin.pdf",
            "https://doc.la-francaise.com@evil.test/Documents/a",
            "http://doc.la-francaise.com/Documents/a",
            "https://doc.la-francaise.com.evil.test/Documents/a",
            "https://127.0.0.1/Documents/a",
        ]:
            with self.subTest(url=url):
                m = copy.deepcopy(self.manifest)
                m["documents"][0]["source_url"] = url
                with self.assertRaises(ValueError):
                    probe.validate_discovery_manifest(m)

    def test_false_t2_label_on_semester_bulletin_must_be_rejected(self):
        m = copy.deepcopy(self.manifest)
        semester = m["documents"][5]
        semester["source_period"] = "2026-T2"
        semester["document_kind"] = "quarterly_bulletin"
        with self.assertRaisesRegex(ValueError, "UNTRUSTED_SOURCE_DISCOVERY_ENTRY"):
            probe.validate_discovery_manifest(m)

    def test_second_multihabitation_must_not_match_twenty(self):
        self.assertFalse(probe.exact_fund_identity(
            "SCPI Multihabitation 20 Bulletin 2e trimestre 2026",
            "Multihabitation 2"))
        self.assertTrue(probe.exact_fund_identity(
            "SCPI Multihabitation 2 Bulletin 2e trimestre 2026",
            "Multihabitation 2"))

    def test_no_secret_message_persisted_as_error(self):
        self.assertEqual(probe.safe_error_code(ValueError("QUARTER_TITLE_UNCONFIRMED: Bonjour")),
                         "QUARTER_TITLE_UNCONFIRMED")
        self.assertEqual(probe.safe_error_code(
            RuntimeError("private-token-please-do-not-log")),
            "ISSUER_BINARY_VERIFICATION_FAILED")

    def test_proof_record_requires_both_readers_and_never_auto_certifies_finances(self):
        import fitz
        with tempfile.TemporaryDirectory() as td:
            archive = Path(td)
            d = fitz.open()
            page = d.new_page()
            page.insert_text((70, 80), "Multihabitation 2", fontsize=18)
            pdf = d.tobytes()
            (archive / "test.pdf").write_bytes(pdf)
            doc = self.manifest["documents"][5]

            def audit(*args, **kwargs):
                return {"archive_assets": {"pdf": "test.pdf"}, "page_count": 1,
                        "sha256": "a" * 64, "source_url": doc["source_url"]}

            called = []
            def check(*args):
                called.append(True)
            ok = probe.probe_one(doc, archive, auditor=audit, checker=check)
            self.assertEqual(ok["status"], "binary_pdf_verified_only")
            self.assertEqual(called, [True])
            self.assertFalse(ok["financial_certified"])
            self.assertFalse(ok["deploy_allowed"])
            blocked = probe.probe_one(
                doc, archive, auditor=audit,
                checker=lambda *args: (_ for _ in ()).throw(
                    ValueError("POPPLER_QUARTER_UNCONFIRMED")))
            self.assertEqual(blocked["status"], "blocked")
            self.assertNotIn("pdf_sha256", blocked)
            self.assertFalse(blocked["financial_certified"])


if __name__ == "__main__":
    unittest.main()
", migration)
        self.assertIn("e.pages BETWEEN 1 AND 250", migration)
        self.assertIn("idx.status='publisher_index_visible'", migration)
        self.assertIn("financial", migration.lower())
        self.assertNotIn("SECURITY DEFINER", migration)
        self.assertNotIn("UPDATE public.scpi_indicators", migration)
        self.assertNotIn("UPDATE public.scpi_indicator_history", migration)

    def test_period_reclassification_preserves_unverified_status(self):
        migration = (
            Path(__file__).resolve().parents[2] /
            "supabase/migrations/20261107_recovery133_lfrem_period_correction.sql"
        ).read_text(encoding="utf-8")
        self.assertIn("IF updated_count<>13", migration)
        self.assertIn("idx.verified_pdf_at IS NULL", migration)
        self.assertIn("document_kind='semiannual_bulletin'", migration)

    def test_no_cross_fund_or_forged_host_accepted(self):
        for url in [
            "https://evil.test/Documents/bulletin.pdf",
            "https://doc.la-francaise.com@evil.test/Documents/a",
            "http://doc.la-francaise.com/Documents/a",
            "https://doc.la-francaise.com.evil.test/Documents/a",
            "https://127.0.0.1/Documents/a",
        ]:
            with self.subTest(url=url):
                m = copy.deepcopy(self.manifest)
                m["documents"][0]["source_url"] = url
                with self.assertRaises(ValueError):
                    probe.validate_discovery_manifest(m)

    def test_false_t2_label_on_semester_bulletin_must_be_rejected(self):
        m = copy.deepcopy(self.manifest)
        semester = m["documents"][5]
        semester["source_period"] = "2026-T2"
        semester["document_kind"] = "quarterly_bulletin"
        with self.assertRaisesRegex(ValueError, "UNTRUSTED_SOURCE_DISCOVERY_ENTRY"):
            probe.validate_discovery_manifest(m)

    def test_second_multihabitation_must_not_match_twenty(self):
        self.assertFalse(probe.exact_fund_identity(
            "SCPI Multihabitation 20 Bulletin 2e trimestre 2026",
            "Multihabitation 2"))
        self.assertTrue(probe.exact_fund_identity(
            "SCPI Multihabitation 2 Bulletin 2e trimestre 2026",
            "Multihabitation 2"))

    def test_no_secret_message_persisted_as_error(self):
        self.assertEqual(probe.safe_error_code(ValueError("QUARTER_TITLE_UNCONFIRMED: Bonjour")),
                         "QUARTER_TITLE_UNCONFIRMED")
        self.assertEqual(probe.safe_error_code(
            RuntimeError("private-token-please-do-not-log")),
            "ISSUER_BINARY_VERIFICATION_FAILED")

    def test_proof_record_requires_both_readers_and_never_auto_certifies_finances(self):
        import fitz
        with tempfile.TemporaryDirectory() as td:
            archive = Path(td)
            d = fitz.open()
            page = d.new_page()
            page.insert_text((70, 80), "Multihabitation 2", fontsize=18)
            pdf = d.tobytes()
            (archive / "test.pdf").write_bytes(pdf)
            doc = self.manifest["documents"][5]

            def audit(*args, **kwargs):
                return {"archive_assets": {"pdf": "test.pdf"}, "page_count": 1,
                        "sha256": "a" * 64, "source_url": doc["source_url"]}

            called = []
            def check(*args):
                called.append(True)
            ok = probe.probe_one(doc, archive, auditor=audit, checker=check)
            self.assertEqual(ok["status"], "binary_pdf_verified_only")
            self.assertEqual(called, [True])
            self.assertFalse(ok["financial_certified"])
            self.assertFalse(ok["deploy_allowed"])
            blocked = probe.probe_one(
                doc, archive, auditor=audit,
                checker=lambda *args: (_ for _ in ()).throw(
                    ValueError("POPPLER_QUARTER_UNCONFIRMED")))
            self.assertEqual(blocked["status"], "blocked")
            self.assertNotIn("pdf_sha256", blocked)
            self.assertFalse(blocked["financial_certified"])


if __name__ == "__main__":
    unittest.main()
