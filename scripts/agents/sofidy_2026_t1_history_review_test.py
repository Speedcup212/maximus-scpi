import json
from pathlib import Path
import sys,unittest
sys.path.insert(0,str(Path(__file__).resolve().parent))
import sofidy_t3_page_review as scan
ROOT=Path(__file__).resolve().parent/"publisher-families"
class TestQuarterSourceReuse(unittest.TestCase):
    def test_three_original_t1_and_t3_source_manifests(self):
        for period,name in (("2026-T1","sofidy-2026-t1-historical-originals.json"),
                            ("2026-T3","sofidy-2026-t3-proven.json")):
            m=json.loads((ROOT/name).read_text(encoding="utf-8"))
            self.assertFalse(m["financial_certified"])
            self.assertFalse(m["publication_authorized"])
            slugs={x["slug"] for x in m["documents"]}
            self.assertEqual(slugs,{"sofiboutique","sofipierre","sofidy-europe-invest"})
            for slug in slugs:
                doc=scan.validation(m,slug)
                self.assertEqual(doc["source_period"],period)
                self.assertEqual(doc["page_count"],6)
    def test_reject_spoofing_and_wrong_period_or_hash(self):
        m=json.loads((ROOT/"sofidy-2026-t1-historical-originals.json").read_text())
        m["documents"][0]["source_period"]="2027-T4"
        with self.assertRaisesRegex(ValueError,"WRONG_PERIOD_OR_PAGE_COUNT"):
            scan.validation(m,"sofiboutique")
        m=json.loads((ROOT/"sofidy-2026-t1-historical-originals.json").read_text())
        m["documents"][0]["source_url"]="https://www.sofidy.com.attacker.test/x.pdf"
        with self.assertRaisesRegex(ValueError,"NON_OFFICIAL_PUBLISHER_URL"):
            scan.validation(m,"sofiboutique")
        m=json.loads((ROOT/"sofidy-2026-t1-historical-originals.json").read_text())
        m["documents"][0]["pdf_sha256"]="0"*63
        with self.assertRaisesRegex(ValueError,"INVALID_ORIGINAL_SHA"):
            scan.validation(m,"sofiboutique")
if __name__=="__main__":unittest.main()
