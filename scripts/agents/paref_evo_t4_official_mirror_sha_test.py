import unittest
import paref_evo_t4_official_mirror_sha as qa

class PublisherByteIdentity(unittest.TestCase):
    def test_untrusted_pdf_with_same_tof_is_not_proven(self):
        pdf=b"%PDF-1.7 PAREF Evo T4 2024 TOF 94,4% false"
        self.assertFalse(qa.check_binary(pdf))
    def test_original_issuer_byte_count_and_hash_both_required(self):
        self.assertEqual(len(qa.EXPECTED_SHA),64)
        self.assertEqual(qa.EXPECTED_BYTES,2171159)
        self.assertFalse(qa.check_binary(b"%PDF"+b"A"*(qa.EXPECTED_BYTES-4)))
    def test_only_known_mirror_hosts_can_be_downloaded(self):
        self.assertEqual(len(qa.MIRRORS),3)
        self.assertEqual(len(qa.ALLOWED),3)
        self.assertTrue(qa.CANONICAL_ISSUER.startswith("https://paref-gestion.com/"))
        with self.assertRaisesRegex(ValueError,"UNAPPROVED_MIRROR_HOST"):
            qa.fetch_source("https://example.org/fake.pdf")
    def test_no_manual_or_financial_approval_from_mirror(self):
        import inspect
        code=inspect.getsource(qa)
        self.assertIn('"financial_certified":False',code)
        self.assertIn('"human_attestation":False',code)
        self.assertIn('"publication_authorized":False',code)
        self.assertNotIn("UPDATE public.scpi",code)
if __name__=="__main__":
    unittest.main()
