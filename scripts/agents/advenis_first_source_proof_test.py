import json
from pathlib import Path
import sys
import unittest
sys.path.insert(0,str(Path(__file__).resolve().parent))
import publisher_family_proof as family

DIR=Path(__file__).resolve().parent/"publisher-families"
PERIODS=("2025-t4","2026-t1","2026-t2")

class AdvenisSourceBatchTests(unittest.TestCase):
    def load(self,period):
        return json.loads((DIR/f"advenis-{period}.json").read_text(encoding="utf-8"))

    def test_four_documents_across_three_real_funds(self):
        proofs=[]
        for period in PERIODS:
            data=self.load(period)
            family.validate(data)
            self.assertEqual(data["publisher"],"Advenis REIM")
            self.assertEqual(data["approved_hosts"],["www.advenis-reim.com"])
            proofs.extend(data["documents"])
        self.assertEqual(len(proofs),4)
        self.assertEqual({p["slug"] for p in proofs},{"eden","elialys","eurovalys"})
        self.assertEqual({p["period"] for p in proofs},{"2025-T4","2026-T1","2026-T2"})
        self.assertTrue(all(p["source_url"].startswith("https://www.advenis-reim.com/wp-content/uploads/") for p in proofs))

    def test_reject_wrong_host_edition_and_document_type(self):
        for period in PERIODS:
            m=self.load(period)
            m["documents"][0]["source_url"]="https://www.advenis-reim.com.attacker.org/issuer.pdf"
            with self.assertRaisesRegex(ValueError,"UNAPPROVED_PUBLISHER_URL"):
                family.validate(m)
            m=self.load(period)
            m["documents"][0]["period"]="2026-REG"
            with self.assertRaisesRegex(ValueError,"WRONG_DOCUMENT_KIND_OR_PERIOD"):
                family.validate(m)
            m=self.load(period)
            m["documents"][0]["kind"]="annual_report"
            with self.assertRaisesRegex(ValueError,"WRONG_DOCUMENT_KIND_OR_PERIOD"):
                family.validate(m)
if __name__=="__main__":
    unittest.main()
