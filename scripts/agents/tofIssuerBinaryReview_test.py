import copy
import json
from pathlib import Path
import tempfile
import unittest
import tofIssuerBinaryReview as audit

MANIFEST=Path(__file__).resolve().parent/"fixtures/tof_two_issuer_conflicts_2026t3.json"


class TofPdfProofTests(unittest.TestCase):
    def setUp(self):
        self.m=json.loads(MANIFEST.read_text())

    def test_pinned_two_issuer_docs_and_readonly(self):
        cases=audit.validate(self.m)
        self.assertEqual(len(cases),2)
        self.assertFalse(self.m["financial_certified"])
        self.assertFalse(self.m["deploy_allowed"])
        self.assertEqual(set(audit.EXPECTED),
                         {c["slug"] for c in cases})

    def test_private_forged_and_nonissuer_source_disallowed(self):
        for url in [
            "http://cdn.prod.website-files.com/x.pdf",
            "https://127.0.0.1/x.pdf",
            "https://cdn.prod.website-files.com.evil.test/x.pdf",
            "https://cdn.prod.website-files.com@evil.test/x.pdf",
            "https://evil.test/x.pdf",
        ]:
            with self.subTest(url=url):
                m=copy.deepcopy(self.m)
                m["cases"][1]["source_url"]=url
                with self.assertRaises(ValueError):
                    audit.validate(m)

    def test_forged_certificate_sha_rejected(self):
        m=copy.deepcopy(self.m)
        m["cases"][1]["sha256"]="x"*64
        with self.assertRaises(ValueError):
            audit.validate(m)

    def test_period_not_inferred_from_url_only(self):
        self.assertFalse(audit.quarter_on_cover(["Bulletin 2e trimestre 2026", ""]))
        self.assertTrue(audit.quarter_on_cover(["Rapport au 30 septembre 2026", ""]))
        self.assertTrue(audit.quarter_on_cover(["T3 2026", ""]))

    def test_issuer_identity_exact_case(self):
        self.assertTrue(audit.identity_on_pdf("SCPI PERIAL Grand Paris", "perial-grand-paris"))
        self.assertFalse(audit.identity_on_pdf("SCPI PERIAL Opportunités Europe", "perial-grand-paris"))
        self.assertTrue(audit.identity_on_pdf("BUROBOUTIC METROPOLES", "buroboutic-metropoles"))

    def test_source_changed_sha_is_blocked_without_financial_pass(self):
        from tempfile import TemporaryDirectory
        with TemporaryDirectory() as td:
            d=self.m["cases"][1]
            out=audit.inspect_case(d,Path(td),
                                   loader=lambda u,h:(b"%PDF-1.7\nWRONG",u))
            self.assertEqual(out["status"],"blocked")
            self.assertEqual(out["error_code"],"ISSUER_PDF_HASH_CHANGED")
            self.assertFalse(out["financial_certified"])
            self.assertFalse(out["deploy_allowed"])

    def test_perial_migration_is_exact_issuer_sha_page_and_no_human_attestation(self):
        migration = (
            Path(__file__).resolve().parents[2] /
            "supabase/migrations/20261107_recovery135_perial_t3_dual_reader_tof_evidence.sql"
        ).read_text(encoding="utf-8")
        for marker in (
            "e9205e1d300724742c6189fdd49a5787e7e5857a5eee040a9f701ac8f2a5f8b1",
            "42375137331",
            "source_page=6",
            "value_numeric=84.7",
            "qa_status='auto_verified_dual_pdf_evidence'",
            "IF k<>1",
            "financial_human_signoff',false",
            "maximus_agents.scpi_replay_provenance_quarantine",
        ):
            self.assertIn(marker,migration)
        self.assertNotIn("SECURITY DEFINER",migration)
        self.assertNotIn("manual_verified_official_pdf_text_review",migration)
        self.assertNotIn("UPDATE public.scpi_source_registry",migration)
        self.assertNotIn("UPDATE maximus_agents.scpi_candidate_final_review",migration)

    def test_buro_vacancy_text_separate_from_aggregate(self):
        text=("Locaux vacants en restructuration "
              "(intégrés au TOF sous conditions) : 0,07 % "
              "Taux d'occupation financier (TOF) : 91,56 %")
        excerpts=audit.page_excerpt(text)
        self.assertTrue(any("0,07" in x for x in excerpts))
        self.assertTrue(any("91,56" in x for x in excerpts))


if __name__=="__main__":
    unittest.main()
