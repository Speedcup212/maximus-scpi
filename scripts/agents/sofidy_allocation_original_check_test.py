import json
from pathlib import Path
import sys
import unittest
sys.path.insert(0,str(Path(__file__).resolve().parent))
import sofidy_allocation_original_check as qa

MANIFEST=Path(__file__).resolve().parent/"publisher-families/sofidy-q2-allocations-2026.json"

class AllocationSourceTests(unittest.TestCase):
    def load(self):return json.loads(MANIFEST.read_text(encoding="utf-8"))

    def test_28_allocation_rows_and_exact_100_percent_per_axis(self):
        m=self.load()
        self.assertFalse(m["financial_autoapprove"])
        self.assertFalse(m["release_allowed"])
        n=0
        for slug in ("sofiboutique","sofipierre","sofidy-europe-invest"):
            c=qa.validate(m,slug)
            for axis in ("geography","sector"):
                r=c["axes"][axis]
                self.assertAlmostEqual(sum(float(x["pct"]) for x in r),100,places=6)
                n+=len(r)
        self.assertEqual(n,28)

    def test_forged_source_unknown_and_wrong_axis_are_blocked(self):
        m=self.load()
        m["financial_autoapprove"]=True
        with self.assertRaisesRegex(ValueError,"UNSAFE_ALLOCATION_MANIFEST"):
            qa.validate(m,"sofipierre")
        m=self.load()
        m["candidates"][0]["source_url"]="https://www.sofidy.com.evil.invalid/x.pdf"
        with self.assertRaisesRegex(ValueError,"UNVERIFIED_EXACT_ORIGINAL"):
            qa.validate(m,"sofiboutique")
        m=self.load()
        c=m["candidates"][0]
        c["axes"]["geography"][0]["pct"]="99"
        with self.assertRaisesRegex(ValueError,"ALLOCATION_AXIS_NOT_EXACTLY_100"):
            qa.validate(m,c["scpi_slug"])
        with self.assertRaisesRegex(ValueError,"UNAPPROVED_SCPI"):
            qa.validate(self.load(),"unlisted-fund")

    def test_french_tokens_and_percentage_matching(self):
        label="Région parisienne"
        self.assertEqual(qa.label_tokens(label),["region","parisienne"])
        text=qa.clean("Commerces de centre-ville : 53,8 %; Région parisienne 15,8%")
        self.assertTrue(qa.base.number_regex("53.8").search(text))
        self.assertTrue(qa.base.number_regex("15.8").search(text))
        self.assertFalse(qa.base.number_regex("15.9").search(text))
        self.assertTrue(all(x in text for x in qa.label_tokens(label)))
if __name__=="__main__":unittest.main()
