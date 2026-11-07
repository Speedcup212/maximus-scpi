import copy
import json
from pathlib import Path
import tempfile
import unittest

import buroHistoricalTofProbe as b

MANIFEST=Path(__file__).resolve().parent/"fixtures/buro_historical_t1_t2_issuer_sources.json"

class BuroHistorySourcesTest(unittest.TestCase):
    def setUp(self):
        self.m=json.loads(MANIFEST.read_text(encoding="utf-8"))

    def test_exact_two_quarantined_periods_not_certified(self):
        docs=b.validate(self.m)
        self.assertEqual({d["period"] for d in docs},{"2026-T1","2026-T2"})
        self.assertFalse(self.m["financial_certified"])
        self.assertFalse(self.m["deploy_allowed"])

    def test_wrong_hash_or_source_rejected(self):
        for key,value in [("pdf_sha256","a"*64),("period","2026-T3"),
                          ("scpi_slug","fake-fund"),
                          ("source_url","https://outside.invalid/file.pdf")]:
            with self.subTest(key=key):
                m=copy.deepcopy(self.m)
                m["documents"][0][key]=value
                with self.assertRaises(ValueError):
                    b.validate(m)

    def test_cover_identifies_exact_quarter(self):
        self.assertTrue(b.quarter_visible("1er trimestre 2026","2026-T1"))
        self.assertTrue(b.quarter_visible("2e trimestre 2026","2026-T2"))
        self.assertFalse(b.quarter_visible("2e trimestre 2026","2026-T1"))

    def test_false_pdf_cannot_be_source_proven(self):
        with tempfile.TemporaryDirectory() as td:
            doc=self.m["documents"][0]
            proof=b.inspect(doc,self.m["issuer_hosts"],Path(td),
                            loader=lambda url,hosts:(b"%PDF-1.7 garbage",url))
            self.assertEqual(proof["status"],"blocked")
            self.assertEqual(proof["error_code"],"OFFICIAL_BINARY_SHA_CHANGED")
            self.assertFalse(proof["financial_certified"])

if __name__=="__main__":
    unittest.main()
