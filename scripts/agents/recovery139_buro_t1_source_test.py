import unittest
from pathlib import Path

MIGRATION=(Path(__file__).resolve().parents[2]/
           "supabase/migrations/20261107_recovery139_buro_t1_source_pointer_restore.sql")

class ExistingT1SourceIdentityRegression(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sql=MIGRATION.read_text(encoding="utf-8")

    def test_correct_issuer_sha_path_is_existing_storage_binary(self):
        sql=self.sql
        self.assertIn("25d420cf867dabbc2be7c51aec7d0cd5ed6b0250e2081b274cce1fe72f5b5ab3",sql)
        self.assertIn("https://www.fiducial-gerance.fr/content/download/1334/38495?version=5",sql)
        self.assertIn("so.bucket_id='scpi-bulletins'",sql)
        self.assertIn("so.metadata->>'size'='1770998'",sql)
        self.assertIn("IF affected<>1",sql)

    def test_original_false_statutes_pointer_protected_and_audited(self):
        sql=self.sql
        self.assertIn("cdcbef9488a16eb7bba36ba6eec72cde84881ab10a558d302ec4158bdecb2278",sql)
        self.assertIn("https://www.fiducial-gerance.fr/content/download/1634/43668?version=4",sql)
        self.assertIn("maximus_agents.scpi_replay_provenance_quarantine",sql)
        self.assertIn("original_bulletin',to_jsonb(old_row)",sql)
        self.assertIn("T1_OLD_STATUTORY_SOURCE_NOT_IDENTIFIED",sql)

    def test_do_not_requalify_qa_or_financial_metric(self):
        sql=self.sql
        self.assertNotIn("UPDATE public.scpi_metric_certifications",sql)
        self.assertNotIn("UPDATE public.scpi_indicator_history",sql)
        self.assertNotIn("UPDATE public.scpi_indicators",sql)
        self.assertNotIn("manual_verified_official",sql)
        self.assertNotIn("SECURITY DEFINER",sql)
        self.assertNotIn("GRANT ",sql)
        self.assertIn("'financial_certified',false",sql)
        self.assertIn("'independent_financial_qa_pending',true",sql)
        self.assertIn("qa_status='auto_partial'",sql)
        self.assertIn("coalesce(extraction_json->'metrics','{}'::jsonb)='{}'::jsonb",sql)

if __name__=='__main__':
    unittest.main()
