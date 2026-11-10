import pathlib,sys,unittest
sys.path.insert(0,str(pathlib.Path(__file__).resolve().parent))
import sofidy_t3_source_discovery as probe
import publisher_family_proof as family
class SofidyHistoryNewCurrentTests(unittest.TestCase):
    def test_links_allowlist_deduplicated_and_resolve(self):
        x='''<a href="/app/uploads/2026/11/Sofiboutique_T3.pdf">PDF</a>
        <a href="https://www.sofidy.com/app/uploads/2026/11/Sofiboutique_T3.pdf">duplicate</a>
        <a href="https://www.sofidy.com.attacker.org/app/uploads/a.pdf">evil</a>
        <a href="http://www.sofidy.com/app/uploads/b.pdf">insecure</a>
        <a href="https://www.sofidy.com/wp-admin/malware.pdf">non-source</a>'''
        result=list(probe.issuer_pdf_links(x))
        self.assertEqual(result,["https://www.sofidy.com/app/uploads/2026/11/Sofiboutique_T3.pdf"])
    def test_baseline_t1_three_funds_expected(self):
        import json
        f=pathlib.Path(__file__).resolve().parent/"publisher-families/sofidy-2026-t1.json"
        m=family.validate(json.loads(f.read_text()))
        self.assertEqual({d["period"] for d in m["documents"]},{"2026-T1"})
        self.assertEqual({d["slug"] for d in m["documents"]},set(probe.FUNDS))
        self.assertTrue(all(d["source_url"].endswith(".pdf") for d in m["documents"]))
    def test_rejects_t3_spoofing_earlier_period(self):
        import json
        f=pathlib.Path(__file__).resolve().parent/"publisher-families/sofidy-2026-t1.json"
        m=json.loads(f.read_text())
        m["documents"][0]["source_url"]="https://www.sofidy.com.attacker.org/pdf.pdf"
        with self.assertRaisesRegex(ValueError,"UNAPPROVED_PUBLISHER_URL"):
            family.validate(m)
    def test_static_discovery_has_no_database_or_release_writes(self):
        source=pathlib.Path(probe.__file__).read_text()
        for forbidden in ("requests.post(","urllib.request.urlopen(","SUPABASE_SERVICE_ROLE_KEY","publication_authorized=True","financial_certified=True"):
            self.assertNotIn(forbidden,source)
if __name__=="__main__":unittest.main()
