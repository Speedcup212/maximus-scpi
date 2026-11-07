"""Financial source contracts: Accimmo 2026-T2 independent 87.44% TOF only.

Static tests supplement live transaction / rollback proof checks. No PDF
download or Supabase mutation is performed from this CI suite.
"""
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[2]/"supabase/migrations"
SOURCE=(ROOT/"20261107_recovery145_accimmo_t2_exact_source_certificate.sql").read_text()
GUARD=(ROOT/"20261107_recovery145_accimmo_t2_proof_and_replay_guard.sql").read_text()

class AccimmoT2FinancialProof(unittest.TestCase):
    def test_exact_real_issuer_binary_required(self):
        for text in (
            "accimmo-pierre",
            "2026-T2",
            "2adc825b6776f9ea55f6d4bc1d55a55142b01957b49d486fa2472cdec35abb20",
            "1273352",
            "storage.objects",
            "github-actions:42390022740",
            "13580978353",
            "auto_partial_review",
        ):
            self.assertIn(text,SOURCE)
        self.assertIn("same page", SOURCE)
        self.assertIn("page 2", SOURCE)
        self.assertIn("publisher_reported_tof_ce_trimestre",SOURCE)

    def test_do_not_confuse_quarterly_87_44_with_key_figure_87_03(self):
        self.assertIn("87.44",SOURCE)
        self.assertIn("87.03",SOURCE)
        self.assertIn("distinct_publisher_key_figure",SOURCE)
        self.assertIn("reporting_basis",SOURCE)
        self.assertIn("word_rect",SOURCE)
        self.assertIn("130.96,435.63,152.91,448.43",SOURCE)
        self.assertIn("Poppler-bbox",SOURCE)
        self.assertIn("MuPDF-geometry",SOURCE)

    def test_ledger_private_and_zero_human_signoff(self):
        self.assertIn("maximus_agents.scpi_independent_tof_geometry_proofs",SOURCE)
        self.assertIn("human_attestation',false",SOURCE)
        self.assertIn("financial_certification_universal',false",SOURCE)
        self.assertIn("maximus_agents.scpi_replay_provenance_quarantine",SOURCE)
        self.assertIn("old_history',to_jsonb(original_history)",SOURCE)
        self.assertIn("old_tof_certificate_exists',false",SOURCE)
        self.assertNotIn("SECURITY DEFINER",SOURCE+GUARD)

    def test_only_tof_provenance_changed_not_other_metrics(self):
        self.assertIn("UPDATE public.scpi_indicator_history h",SOURCE)
        self.assertIn("to_jsonb(edited_history)-'metric_provenance'",SOURCE)
        self.assertIn("to_jsonb(original_history)-'metric_provenance'",SOURCE)
        self.assertIn("qa_status='source_verified_delegated_review'",SOURCE)
        self.assertNotIn("UPDATE public.scpi_bulletins",SOURCE)
        self.assertNotIn("UPDATE public.scpi_indicators",SOURCE)
        self.assertNotIn("manual_verified_official_pdf_tof",SOURCE)
        self.assertNotIn("UPDATE public.scpi_publication",SOURCE)

    def test_replay_guard_remains_in_place_and_checks_accimmo_exact_quarter(self):
        self.assertIn("CREATE OR REPLACE FUNCTION scpi_internal.guard_proven_tof_certificate_replay()",GUARD)
        self.assertIn("scpi_internal.accimmo_t2_exact_tof_proof_valid(",GUARD)
        self.assertIn("hist.qa_status='source_verified_delegated_review'",GUARD)
        self.assertIn("RETURN NULL",GUARD)
        self.assertIn("IF TG_OP='UPDATE' THEN RETURN OLD; END IF",GUARD)
        self.assertIn("independent_verified_official_geometric_pdf_page4",GUARD)
        self.assertIn("auto_verified_dual_pdf_evidence",GUARD)

    def test_strict_fails_if_archived_source_or_dual_geometry_is_changed(self):
        self.assertIn("storage.objects",GUARD)
        self.assertIn("so.metadata->>'size'='1273352'",GUARD)
        self.assertIn("mupdf_geometry",GUARD)
        self.assertIn("poppler_geometry",GUARD)
        self.assertIn("distinct_publisher_key_figure",GUARD)
        self.assertIn("STRICT_VIEW_PASS_BRANCH_CONTRACT_CHANGED_",GUARD)
        self.assertIn("b.scpi_slug <> ''accimmo-pierre''",GUARD)
        self.assertNotIn("DROP VIEW",GUARD)
        self.assertNotIn("DROP TRIGGER",GUARD)
        self.assertNotIn("DELETE FROM",GUARD)

if __name__=="__main__":
    unittest.main()
