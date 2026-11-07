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

    def test_exact_t2_redirect_to_registered_same_issuer_pdf(self):
        doc=self.m["documents"][1]
        calls=[]
        def loader(u,hosts):
            calls.append(u)
            return b"%PDF-test",u
        raw,final,meta=b.fetch_pinned_t2_same_host(
            doc,self.m["issuer_hosts"],loader=loader,
            location_probe=lambda url,hosts:
                "/content/download/1410/file/BTI%20Buroboutic%20T2%202026%20WEB.pdf?private_query=hidden")
        self.assertEqual(calls,[final])
        self.assertEqual(meta["approved_exact_issuer_host"],"www.fiducial-gerance.fr")
        self.assertFalse(meta["multihop_forbidden"] is False)
        self.assertNotIn("private_query",str(meta))
        self.assertTrue(meta["source_sha_still_needs_validation"])

    def test_t2_different_path_and_cross_domain_cannot_be_accepted(self):
        doc=self.m["documents"][1]
        for location in (
            "/content/download/1410/file/BTI%20Buroboutic%20T1%202026.pdf",
            "https://foreign.example/file.pdf",
            "http://www.fiducial-gerance.fr/content/download/1410/file/BTI%20Buroboutic%20T2%202026%20WEB.pdf",
        ):
            with self.subTest(location=location):
                with self.assertRaises(ValueError):
                    b.fetch_pinned_t2_same_host(
                        doc,self.m["issuer_hosts"],
                        loader=lambda *args: (_ for _ in ()).throw(
                            AssertionError("unexpected download")),
                        location_probe=lambda *args: location)

    def test_t1_cannot_use_t2_source_exception(self):
        with self.assertRaisesRegex(ValueError,"T2_REDIRECT_NOT_PINNED"):
            b.fetch_pinned_t2_same_host(
                self.m["documents"][0],self.m["issuer_hosts"],
                location_probe=lambda *args: "/content/download/1410/file/BTI.pdf")

    def test_t1_alternative_wrong_issuer_path_rejected(self):
        with tempfile.TemporaryDirectory() as td:
            proof=b.inspect_t1_alternative(self.m['issuer_hosts'],Path(td),
                loader=lambda *args: (_ for _ in ()).throw(AssertionError('unexpected download')),
                location_probe=lambda *args:'/content/download/1334/file/not-statutes.pdf')
            self.assertEqual(proof['status'],'blocked')
            self.assertEqual(proof['error_code'],'T1_ALTERNATE_REDIRECT_NOT_EXACT_ISSUER_PDF')
            self.assertFalse(proof['financial_certified'])

    def test_t1_alternative_hash_mismatch_rejected(self):
        with tempfile.TemporaryDirectory() as td:
            proof=b.inspect_t1_alternative(self.m['issuer_hosts'],Path(td),
                loader=lambda url,hosts:(b'%PDF-1.7 incorrect',url),
                location_probe=lambda *args:'/content/download/1334/file/BTI%20Buroboutic%20T1%202026.pdf')
            self.assertEqual(proof['status'],'blocked')
            self.assertEqual(proof['error_code'],'T1_ALTERNATE_SHA_DIFFERS_FROM_QUARANTINE')
            self.assertFalse(proof['issuer_registration_corrected'])

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
