import hashlib
import json
import os
from pathlib import Path
import sys
import unittest
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parent))
import publisher_family_proof as family

MANIFEST=Path(__file__).resolve().parent/"publisher-families/sofidy-2026-t2.json"

def fixture():
    return json.loads(MANIFEST.read_text(encoding="utf-8"))

class TestPublisherFamily(unittest.TestCase):
    def test_three_independent_funds_and_approved_host(self):
        plan=family.validate(fixture())
        self.assertEqual(len(plan["documents"]),3)
        self.assertEqual(len({x["slug"] for x in plan["documents"]}),3)
        self.assertEqual({x["period"] for x in plan["documents"]},{"2026-T2"})
        annual=json.loads((Path(__file__).resolve().parent/"publisher-families/sofidy-2025-ra.json").read_text(encoding="utf-8"))
        family.validate(annual)
        self.assertEqual({x["slug"] for x in annual["documents"]},{x["slug"] for x in plan["documents"]})
        self.assertEqual({x["period"] for x in annual["documents"]},{"2025-RA"})

    def test_refuse_cross_issuer_url_and_false_kind(self):
        for url in ("http://www.sofidy.com/x.pdf",
                    "https://www.sofidy.com.attacker.org/x.pdf",
                    "https://user@www.sofidy.com/x.pdf",
                    "https://127.0.0.1/secret.pdf"):
            m=fixture();m["documents"][0]["source_url"]=url
            with self.assertRaisesRegex(ValueError,"UNAPPROVED_PUBLISHER_URL"):
                family.validate(m)
        m=fixture();m["documents"][0]["kind"]="annual_report"
        with self.assertRaisesRegex(ValueError,"WRONG_DOCUMENT_KIND_OR_PERIOD"):
            family.validate(m)
        m=fixture();m["documents"][1]["slug"]="sofiboutique"
        with self.assertRaisesRegex(ValueError,"DUPLICATE_SCPI"):
            family.validate(m)

    def test_binary_original_and_independent_reader_required(self):
        data=b"%PDF-fake-test" + b"x"*900
        sha=hashlib.sha256(data).hexdigest()
        calls=[]
        def auditor(doc,issuer,fetcher):
            raw,url=fetcher(doc["url"])
            self.assertEqual(data,raw)
            (Path(os.environ["SCPI_PDF_ARCHIVE_DIR"])/(sha+".pdf")).write_bytes(raw)
            return {"sha256":sha,"source_url":url,"page_count":4,
                    "native_text_characters":3000,"publisher_binary_pass":True,
                    "fund_and_period_identity_pass":True}
        def check(path,name,period,kind,pages):
            calls.append([name,period,kind,pages,path.read_bytes()])
            return pages
        m=fixture()
        with patch.object(family.proof,"download_official",return_value=(data,m["documents"][0]["source_url"])):
            result=family.verify_one(m,"sofiboutique",auditor=auditor,reader=check)
        self.assertEqual(len(calls),1)
        self.assertEqual(calls[0][2],"quarterly_bulletin")
        self.assertEqual(result["pdf_sha256"],sha)
        self.assertFalse(result["financial_certified"])
        self.assertFalse(result["publication_authorized"])
        self.assertFalse(result["staging_written"])

    def test_no_original_pdf_or_unknown_fund_is_blocked(self):
        def no_archive(doc,issuer,fetcher):
            return {"sha256":"a"*64,"source_url":doc["url"],"page_count":4,
                    "publisher_binary_pass":True,"fund_and_period_identity_pass":True}
        with self.assertRaisesRegex(ValueError,"ORIGINAL_PDF_UNVERIFIED"):
            family.verify_one(fixture(),"sofiboutique",auditor=no_archive,reader=lambda *a:4)
        with self.assertRaisesRegex(ValueError,"FUND_NOT_IN_MANIFEST"):
            family.verify_one(fixture(),"unknown",auditor=no_archive,reader=lambda *a:4)

if __name__=="__main__":
    unittest.main()
