"""Governance contract for Buro T1/T2 exact independent TOF sources.

These source tests intentionally do not certify finance or touch Supabase.
The live DB transaction preflight must also pass before migration application.
"""
from pathlib import Path
import unittest

M = Path(__file__).resolve().parents[2]/"supabase/migrations"
A = (M/"20261107_recovery142_private_independent_tof_evidence.sql").read_text()
B = (M/"20261107_recovery142_quarantine_independent_proof_policy.sql").read_text()
C = (M/"20261107_recovery142_exact_buro_two_tof_recertifications.sql").read_text()
D = (M/"20261107_recovery142_source_proof_replay_guard_and_t3_restore.sql").read_text()
S = (A,B,C,D)

class ProofGovernance(unittest.TestCase):
    def test_exact_issuer_source_shas_and_quarter_qa_targets(self):
        for sha in (
            "25d420cf867dabbc2be7c51aec7d0cd5ed6b0250e2081b274cce1fe72f5b5ab3",
            "2cc87a2cf3536f145bc6db7d71f8cef69190379fa2e2c369ae8052de896c99ba",
        ):
            self.assertIn(sha,A)
            self.assertIn(sha,B)
            self.assertIn(sha,C)
        for v in ("91.78","91.56"):
            self.assertIn(v,A)
            self.assertIn(v,B)
            self.assertIn(v,C)
        self.assertIn("13577252680",A)
        self.assertIn("42381361609",A)
        self.assertIn("MuPDF-geometry",A)
        self.assertIn("Poppler-bbox",A)

    def test_private_evidence_requires_binary_exact_and_disallows_human_fraud(self):
        for marker in (
            "ENABLE ROW LEVEL SECURITY",
            "REVOKE ALL", "GRANT SELECT", "TO service_role",
            "human_attestation=false",
            "pdf_byte_size",
            "stored.metadata",
        ):
            # Storage check for exact PDF sits in the strict policy.
            self.assertIn(marker,A+B)
        self.assertIn("'human_attestation',false",C)
        self.assertIn("'regulatory_human_certification_claimed',false",C)
        self.assertIn("human_attestation boolean NOT NULL DEFAULT false",A)
        self.assertNotIn("TO anon;",A)
        self.assertNotIn("TO authenticated;",A)
        self.assertNotIn("SECURITY DEFINER",A+B+C+D)

    def test_triggers_preserve_legacy_manual_proof_route_for_unrelated_funds(self):
        self.assertIn("manual_recertification",B)
        self.assertIn("manual_verified_official%",B)
        self.assertIn("scpi_internal.independent_tof_geometric_proof_valid",B)
        self.assertIn("AND NOT (manual_recertification OR independent_recertification)",B)
        self.assertIn("toF_VACANCY".lower(),B.lower())
        self.assertIn("STRICT_VIEW_MANUAL_QUARANTINE_PREDICATE_EXPECTED_ONCE",B)
        self.assertIn("CREATE OR REPLACE VIEW public.scpi_crash_test_strict_v2",B)
        self.assertNotIn("DROP VIEW",B)
        self.assertNotIn("DROP TABLE",B)

    def test_proof_excludes_any_other_issuer_or_quarter(self):
        self.assertIn("ev.scpi_slug='buroboutic-metropoles'",B)
        self.assertIn("ev.source_period='2026-T1'",B)
        self.assertIn("ev.source_period='2026-T2'",B)
        self.assertIn("2a6d65bd-6101-416b-a16a-dd32f5d008a9",B)
        self.assertIn("7d248e32-826c-4222-a462-08f46a6257b4",B)
        self.assertIn("ev.artifact_id='13577252680'",B)

    def test_no_fake_manual_verification_in_updated_certificates(self):
        self.assertIn("independent_verified_official_geometric_pdf",C)
        self.assertIn("pdf_page_tof_dual_geometry_sha256",C)
        self.assertIn("value_numeric=r.bad_value",C)
        self.assertIn("source_page=4",C)
        self.assertNotIn("SET verification_status='manual_",C)
        self.assertNotIn("UPDATE public.scpi_indicators",C)
        self.assertIn("old_certificate',to_jsonb(c)",C)
        self.assertIn("EXACTLY_TWO_QUARTERS_REQUIRED",C)
        self.assertIn("QUARANTINE_REPLAY_GUARD_REJECTED_INDEPENDENT_PROOF",C)

    def test_regression_guard_fails_closed_without_downgrading_certification(self):
        self.assertIn("trg_a0_guard_proven_tof_certificate_replay",D)
        self.assertIn("IF TG_OP='UPDATE' THEN RETURN OLD",D)
        self.assertIn("NEW.value_numeric IS NOT DISTINCT FROM h.tof",D)
        self.assertIn("h.proof_sha<>h.pdf_sha256",D)
        self.assertIn("'auto_verified_dual_pdf_evidence'",D)
        self.assertIn("'independent_verified_official_geometric_pdf_page4'",D)
        self.assertIn("BURO_T3_SOURCE_REPLAY_RESTORE_REJECTED",D)
        self.assertIn("13575957579",D)
        self.assertNotIn("UPDATE public.scpi_indicators",D)

    def test_no_quarantine_deletion_or_automatic_publication(self):
        for sql in S:
            self.assertNotIn("DELETE FROM scpi_internal.tof_policy_quarantine_audit",sql)
            self.assertNotIn("publication_enabled=true",sql)
            self.assertNotIn("UPDATE maximus_agents.scpi_universe",sql)
            self.assertNotIn("UPDATE public.scpi_publication",sql)

if __name__=="__main__":
    unittest.main()
