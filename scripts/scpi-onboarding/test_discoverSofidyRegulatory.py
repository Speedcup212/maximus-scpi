import unittest
from discoverSofidyRegulatory import discover, valid_pdf_url

class LinkDiscoveryTests(unittest.TestCase):
    def test_official_note_and_dic_detected(self):
        source='''<a href="/app/uploads/2024/01/NI-DYN-072026-FR-2-3146.pdf">Note</a>
        <a href="https://www.sofidy.com/app/uploads/2024/01/DIC-DY-032025-FR-1-2124.pdf">DIC</a>'''
        docs=discover(source)
        self.assertEqual({d["classification"] for d in docs},{"dic","note"})
        self.assertTrue(all(not d["regulatory_content_certified"] for d in docs))
    def test_subdomain_spoof_is_not_issuer(self):
        bad='''<a href="https://www.sofidy.com.evil.example/uploads/DIC-DY-2026.pdf">Fake</a>
        <a href="http://www.sofidy.com/uploads/NI-DYN-2026.pdf">No TLS</a>'''
        self.assertEqual(discover(bad),[])
        self.assertFalse(valid_pdf_url("https://u:p@www.sofidy.com/a.pdf"))
    def test_html_escaped_and_embedded_links(self):
        source='''{"document":"https:\\/\\/www.sofidy.com\\/app\\/uploads\\/2026\\/07\\/NI-DYN-072026.pdf"}'''
        self.assertEqual(discover(source)[0]["classification"],"note")
    def test_no_promoted_status_for_pdf_link(self):
        source='''<a href="/app/uploads/2026/07/DIC-DY-082026.pdf">DIC</a>'''
        result=discover(source)[0]
        self.assertEqual(result["status"],"UNVERIFIED_URL_ONLY")
        self.assertFalse(result["publisher_binary_certified"])
if __name__=="__main__":unittest.main()
