"""Protect source-certified TOF and exactly scoped same-period publication.

No Supabase secrets or writes in CI. Live behavior separately dry-run under
BEGIN/ROLLBACK before any controlled migration is applied.
"""
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[2]/"supabase/migrations"
REPLAY=(ROOT/"20261107_recovery143_proven_tof_upsert_skip.sql").read_text()
LIVE=(ROOT/"20261107_recovery143_buro_live_t2_exact_tof.sql").read_text()

class CurrentTofDeliverySafety(unittest.TestCase):
    def test_postgresql_before_insert_conflict_refresh_skips_only_weak_tof(self):
        self.assertIn("IF TG_OP='UPDATE' THEN RETURN OLD; END IF",REPLAY)
        self.assertIn("RETURN NULL",REPLAY)
        self.assertIn("NEW.value_numeric IS NOT DISTINCT FROM h.tof",REPLAY)
        self.assertIn("h.proof_sha<>h.pdf_sha256",REPLAY)
        self.assertIn("NEW.source_page=h.proof_page",REPLAY)
        self.assertIn("NEW.extraction_confidence,0)>=0.95",REPLAY)
        self.assertIn("CREATE OR REPLACE FUNCTION scpi_internal.guard_proven_tof_certificate_replay()",REPLAY)

    def test_exact_scpi_quarter_sha_page_provenance_required(self):
        for token in (
            "buroboutic-metropoles",
            "2026-T2",
            "91.56",
            "2cc87a2cf3536f145bc6db7d71f8cef69190379fa2e2c369ae8052de896c99ba",
            "scpi_internal.independent_tof_geometric_proof_valid",
            "AND source_page=4",
        ):
            self.assertIn(token,LIVE)
        self.assertIn("source_type='official_bulletin_extended'",LIVE)
        self.assertIn("metric_provenance->'tof'->>'human_attestation'='false'",LIVE)

    def test_do_not_mislabel_tof_as_human_certified(self):
        self.assertIn("manual_verified_issuer_fields_tof_independent_pdf_geometry",LIVE)
        self.assertIn("historic manual QA of other fields remains",LIVE)
        self.assertNotIn("manual_verified_official_pdf_tof",LIVE)
        self.assertNotIn("UPDATE public.scpi_indicator_history",LIVE)
        self.assertNotIn("UPDATE public.scpi_metric_certifications",LIVE)
        self.assertNotIn("SECURITY DEFINER",LIVE+REPLAY)

    def test_preserve_all_existing_fields_and_older_newer_periods(self):
        self.assertIn("source_period='2026-T2'",LIVE)
        self.assertIn("to_jsonb(after_row)-ARRAY['tof','qa_status','metric_provenance','updated_at']",LIVE)
        self.assertIn("to_jsonb(original)-ARRAY['tof','qa_status','metric_provenance','updated_at']",LIVE)
        self.assertIn("T2_HISTORY_DEGRADED_BY_ANALYSIS_REFRESH",LIVE)
        self.assertNotIn("2026-T3' AND source_period",LIVE)
        self.assertNotIn("UPDATE public.scpi_universe",LIVE)
        self.assertNotIn("publication_enabled=true",LIVE)

    def test_unrelated_certificates_and_verified_at_are_restored_if_unchanged(self):
        self.assertIn("CREATE TEMP TABLE recovery143_non_tof_before ON COMMIT DROP",LIVE)
        self.assertIn("to_jsonb(c)-'verified_at' AS immutable_fields",LIVE)
        self.assertIn("BURO_UNRELATED_METRIC_CERTIFICATE_WAS_MUTATED",LIVE)
        self.assertIn("SET verified_at=prior.verified_at",LIVE)
        self.assertIn("BURO_METRIC_VERIFICATION_TIMESTAMPS_NOT_RESTORED",LIVE)
        self.assertIn("BURO_PROTECTED_TOF_DOWNGRADED_DURING_REFRESH",LIVE)
        self.assertNotIn("DROP TRIGGER",LIVE)
        self.assertNotIn("DISABLE TRIGGER",LIVE)

    def test_append_only_original_snapshots_for_live_release(self):
        self.assertIn("maximus_agents.scpi_replay_provenance_quarantine",LIVE)
        self.assertIn("old_live',to_jsonb(original)",LIVE)
        self.assertIn("verified_history',to_jsonb(hist)",LIVE)
        self.assertIn("T2_CURRENT_QUARTER_TOF_UPDATE_EXPECTED_ONE_GOT_",LIVE)

if __name__=="__main__":
    unittest.main()
