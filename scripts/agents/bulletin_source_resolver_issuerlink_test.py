import pathlib
import sys
import unittest

sys.path.insert(0,str(pathlib.Path(__file__).parent))
import bulletin_source_resolver as issuer

class OriginalIssuerDownloadLinkTests(unittest.TestCase):
    def test_fiducial_extensionless_pdf_download_is_eligible(self):
        url = 'https://www.fiducial-gerance.fr/content/download/1264/37262?version=9'
        self.assertTrue(issuer.document_link(url, 'Bulletin trimestriel Ficommerce T4 2025'))

    def test_atland_explicit_2025_second_quarter_label(self):
        url = 'https://atland-voisin.com/wp-content/uploads/2025/07/BPI2T2025-EP-web-avec-annexe-1.pdf'
        self.assertTrue(issuer.document_link(url))
        self.assertEqual(issuer.issue_hints('Bulletin Epargne Pierre T2 2025'), {'2025-T2'})
        self.assertNotIn('2025-T3',issuer.issue_hints('Bulletin Epargne Pierre T2 2025'))

if __name__ == '__main__':
    unittest.main()
