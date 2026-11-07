import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MIGRATION = ROOT / "supabase/migrations/20261107_recovery137_buroboutic_t3_tof_dual_pdf.sql"


class BuroT3ExactEvidenceContract(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sql = MIGRATION.read_text(encoding="utf-8")

    def test_exact_original_issuer_sha_page_and_period(self):
        for token in (
            "5837592186764194f265f2af2ddf6386c8ef980947eb3f088af6a2419d68a89d",
            "42377472006",
            "13575957579",
            "buroboutic-metropoles",
            "source_page=4",
            "source_period='2026-T3'",
            "91.37",
            "0.07",
            "2f9ace9b-cdff-412c-b050-6d59eda108a7",
            "985d9663-2900-40ba-9a0f-2a215461ebe4",
        ):
            self.assertIn(token,self.sql)

    def test_no_unsupported_period_mix_or_human_attestation(self):
        self.assertNotIn("UPDATE public.scpi_indicators",self.sql)
        self.assertNotIn("UPDATE public.scpi_source_connectors",self.sql)
        self.assertNotIn("manual_verified_official_pdf_text_review",self.sql)
        self.assertNotIn("SECURITY DEFINER",self.sql)
        self.assertIn("financial_human_signoff',false",self.sql)
        self.assertIn("No live T2 SCPI index mixed with T3",self.sql)

    def test_original_rows_snapshotted_and_exact_counts_fail_closed(self):
        self.assertIn("maximus_agents.scpi_replay_provenance_quarantine",self.sql)
        self.assertIn("old_history',to_jsonb(h)",self.sql)
        self.assertIn("old_certificate',to_jsonb(c)",self.sql)
        self.assertIn("IF k<>1",self.sql)
        self.assertIn("BUROBOUTIC_T3_FINANCIAL_EVIDENCE_POSTCONDITION",self.sql)


if __name__ == "__main__":
    unittest.main()
