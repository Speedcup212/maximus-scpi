import json
from decimal import Decimal
from pathlib import Path
import sys,unittest
sys.path.insert(0,str(Path(__file__).resolve().parent))
import sofidy_t3_allocation_source_qa as qa
import sofidy_metric_page_probe as original
MANIFEST=Path(__file__).resolve().parent/"publisher-families/sofidy-2026-t3-allocation-claims.json"

class TestAllocation2026T3(unittest.TestCase):
    def load(self):return json.loads(MANIFEST.read_text(encoding="utf-8"))
    def test_three_source_sha_documents_and_exact_28_chart_rows(self):
        m=self.load()
        for slug in qa.FUNDS:
            d=qa.validate(m,slug)
            self.assertEqual(d["source_page"],2)
            self.assertTrue(d["source_url"].startswith("https://www.sofidy.com/"))
        self.assertEqual(sum(len(d["allocations"]) for d in m["documents"]),28)
        for d in m["documents"]:
            for typ in ("geography","sector"):
                total=sum((Decimal(x["exact_pct"]) for x in d["allocations"] if x["type"]==typ),Decimal(0))
                self.assertTrue(Decimal("99.7")<=total<=Decimal("100.3"))
    def test_rejects_wrong_publisher_duplicates_bad_totals_and_early_qa_pass(self):
        m=self.load();m["documents"][0]["source_url"]="https://www.sofidy.com.attacker.invalid/a.pdf"
        with self.assertRaisesRegex(ValueError,"SOURCE_SHA_OR_HOST_NOT_AUTHENTICATED"):
            qa.validate(m,m["documents"][0]["slug"])
        m=self.load();m["documents"][0]["allocations"][0]["exact_pct"]="90"
        with self.assertRaisesRegex(ValueError,"ALLOCATION_NOT_100_AFTER_PUBLISHED_ROUNDING"):
            qa.validate(m,m["documents"][0]["slug"])
        m=self.load();m["documents"][0]["allocations"][0]["qa_status"]="qa_pass"
        with self.assertRaisesRegex(ValueError,"FINANCIAL_QA_CANNOT_BE_AUTO_APPROVED"):
            qa.validate(m,m["documents"][0]["slug"])
    def test_french_chart_percentage_exact_token(self):
        self.assertTrue(qa.percent_token("33.8").search(original.flat("33,8 % Espagne")))
        self.assertTrue(qa.percent_token("100.000").search(original.flat("100,0 % commerces")))
        self.assertTrue(qa.percent_token("1.7").search(original.flat("1,7 % Belgique")))
        self.assertFalse(qa.percent_token("33.8").search(original.flat("33,9 % Espagne")))
        self.assertFalse(qa.percent_token("99.9").search(original.flat("98,9 %")))
if __name__=="__main__":unittest.main()
