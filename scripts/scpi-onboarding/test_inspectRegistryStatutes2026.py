import unittest
import fitz
from inspectRegistryStatutes2026 import source_allowed, inspect, probe, REGISTRY_MIRROR_URL

def document(text, second_page='SOFIDYNAMIC RCS 983 023 003 STATUTS'):
    with fitz.open() as doc:
        page=doc.new_page()
        page.insert_text((36, 54), text, fontsize=10)
        page2=doc.new_page()
        page2.insert_text((36, 54), second_page, fontsize=10)
        return doc.tobytes()

class RegistryStatutesTests(unittest.TestCase):
    def test_exact_host_and_tls_required(self):
        self.assertTrue(source_allowed(REGISTRY_MIRROR_URL))
        self.assertFalse(source_allowed("http://www.pappers.fr/x.pdf"))
        self.assertFalse(source_allowed("https://www.pappers.fr.evil.org/x.pdf"))
        self.assertFalse(source_allowed("https://user:password@www.pappers.fr/x.pdf"))
    def test_mirror_never_certifies_legal_currentness(self):
        raw=document("SOFIDYNAMIC STATUTS 08 juillet 2026 983023003")
        result=inspect(raw,REGISTRY_MIRROR_URL)
        self.assertEqual(result["status"],"MIRROR_PDF_RETRIEVED_NEEDS_REGISTRY_SOURCE_RECONCILIATION")
        self.assertEqual(result["page_count"],2)
        self.assertFalse(result["statutes_current_certified"])
        self.assertFalse(result["publication_authorized"])
    def test_old_or_other_company_pdf_rejected(self):
        raw=document("OTHERCOMPANY STATUTS 2026 999999999", second_page="OTHERCOMPANY RCS 999 999 999")
        with self.assertRaisesRegex(ValueError, "IDENTITY_UNCONFIRMED"):
            inspect(raw,REGISTRY_MIRROR_URL)
    def test_html_or_untrusted_redirect_rejected(self):
        with self.assertRaisesRegex(ValueError, "NOT_VALID_PDF"):
            inspect(b"<html>Not found</html>",REGISTRY_MIRROR_URL)
        raw=document("SOFIDYNAMIC STATUTS 2026 983023003")
        with self.assertRaisesRegex(ValueError, "REDIRECT_UNTRUSTED"):
            inspect(raw,"https://pappers.fr.evil.example/test.pdf")
    def test_fetch_error_is_reported_but_does_not_approve(self):
        def fail(_):
            raise ValueError("HTTP 403")
        result=probe(fail)
        self.assertEqual(result["status"],"REGISTRY_2026_PDF_NOT_VERIFIED")
        self.assertFalse(result["statutes_current_certified"])
        self.assertFalse(result["publication_authorized"])

if __name__ == "__main__":
    unittest.main()
