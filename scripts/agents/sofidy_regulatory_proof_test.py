import hashlib
import json
from pathlib import Path
import os
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0,str(Path(__file__).resolve().parent))
import sofidy_regulatory_proof as audit

MANIFEST=Path(__file__).resolve().parent/"publisher-families/sofidy-regulatory-documents-2026.json"

class TestSofidyRegulatoryProof(unittest.TestCase):
    def fresh(self):return json.loads(MANIFEST.read_text(encoding="utf-8"))

    def test_exact_six_publisher_documents_are_present_but_unverified(self):
        m=self.fresh()
        self.assertFalse(m["financial_certification"])
        self.assertFalse(m["data_mutation"])
        self.assertEqual(sum(len(c["documents"]) for c in m["candidates"]),6)
        for slug in ("sofiboutique","sofipierre","sofidy-europe-invest"):
            for kind in ("dic","note"):
                c,d=audit.validate(m,slug,kind)
                self.assertEqual(d["reference_period"],"2026-REG")
                self.assertEqual({i["kind"] for i in c["documents"]},{"dic","note"})

    def test_forged_issuer_edition_and_cross_fund_rejected(self):
        m=self.fresh()
        m["candidates"][0]["documents"][0]["source_url"]="https://www.sofidy.com.fake.example/test.pdf"
        with self.assertRaisesRegex(ValueError,"UNTRUSTED_DOCUMENT_URL"):
            audit.validate(m,"sofiboutique","dic")
        m=self.fresh()
        m["candidates"][0]["documents"][0]["reference_period"]="2025-REG"
        with self.assertRaisesRegex(ValueError,"WRONG_REGULATORY_DOCUMENT_PERIOD"):
            audit.validate(m,"sofiboutique","dic")
        with self.assertRaisesRegex(ValueError,"UNREGISTERED_SCPI"):
            audit.validate(self.fresh(),"unknown-scpi","dic")
        m=self.fresh()
        m["data_mutation"]=True
        with self.assertRaisesRegex(ValueError,"UNTRUSTED_REGULATORY_MANIFEST"):
            audit.validate(m,"sofiboutique","dic")

    def test_binary_issuer_proof_requires_original_sha_plus_second_reader(self):
        m=self.fresh()
        data=b"%PDF-fake-for-regulatory-unit-test" + b"X"*1300
        digest=hashlib.sha256(data).hexdigest()
        def fake_audit(doc,issuer,fetcher):
            self.assertEqual(doc["kind"],"dic")
            self.assertEqual(doc["reference_period"],"2026-REG")
            received,url=fetcher(doc["url"])
            self.assertEqual(received,data)
            (Path(os.environ["SCPI_PDF_ARCHIVE_DIR"])/(digest+".pdf")).write_bytes(received)
            return {"sha256":digest,"source_url":url,"page_count":3,
                    "publisher_binary_pass":True,"fund_and_period_identity_pass":True,
                    "native_text_characters":2400}
        with patch.object(audit.family,"fetch_verified_curl",return_value=(data,m["candidates"][0]["documents"][0]["source_url"])):
            result=audit.prove_regulatory(m,"sofiboutique","dic",
                auditor=fake_audit,readback=lambda *a:2500)
        self.assertEqual(result["status"],"REGULATORY_ORIGINAL_BINARY_VERIFIED")
        self.assertEqual(result["pdf_sha256"],digest)
        self.assertEqual(result["reader_engines"],["MuPDF","Poppler"])
        self.assertFalse(result["regulatory_review_complete"])
        self.assertFalse(result["financial_certified"])
        self.assertFalse(result["publication_authorized"])
        self.assertFalse(result["staging_written"])

    def test_no_original_or_reader_mismatch_fails_closed(self):
        m=self.fresh()
        def fake_audit(doc,issuer,fetcher):
            return {"sha256":"a"*64,"source_url":doc["url"],"page_count":3,
                    "publisher_binary_pass":True,"fund_and_period_identity_pass":True,
                    "native_text_characters":2500}
        with self.assertRaisesRegex(ValueError,"ORIGINAL_PDF_ARCHIVE_MISMATCH"):
            audit.prove_regulatory(m,"sofiboutique","dic",
                                  auditor=fake_audit,readback=lambda *a:2500)
if __name__=="__main__":
    unittest.main()
