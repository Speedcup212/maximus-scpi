import hashlib,json,os
from pathlib import Path
import sys,unittest
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parent))
import sofidy_statutes_original_proof as p
MANIFEST=Path(__file__).resolve().parent/"publisher-families/sofidy-statutes-official-editions.json"
class TestSofidyStatutes(unittest.TestCase):
    def manifest(self):return json.loads(MANIFEST.read_text(encoding="utf-8"))
    def test_official_versions_and_three_funds(self):
        m=self.manifest()
        self.assertEqual({x["edition_period"] for x in m["candidates"]},{"2024-REG","2025-REG"})
        for x in m["candidates"]:
            self.assertEqual(p.validate(m,x["scpi_slug"]),x)
    def test_forbid_foreign_issuer_and_unlisted_fund(self):
        m=self.manifest()
        m["candidates"][0]["source_url"]="https://www.sofidy.com.attacker.invalid/x.pdf"
        with self.assertRaisesRegex(ValueError,"UNTRUSTED_STATUTES_URL"):
            p.validate(m,"sofiboutique")
        with self.assertRaisesRegex(ValueError,"UNLISTED_SCPI"):
            p.validate(self.manifest(),"someone-else")
    def test_original_sha_and_second_reader_mandatory(self):
        m=self.manifest();b=b"%PDF-fake-statut-"+b"x"*1100
        sha=hashlib.sha256(b).hexdigest()
        def fake(source,issuer,fetcher):
            received,url=fetcher(source["url"])
            Path(os.environ["SCPI_PDF_ARCHIVE_DIR"],sha+".pdf").write_bytes(received)
            return {"source_url":url,"sha256":sha,"page_count":4,
                "native_text_characters":2800,
                "publisher_binary_pass":True,"fund_and_period_identity_pass":True}
        url=m["candidates"][0]["source_url"]
        with patch.object(p.source,"fetch_verified_curl",return_value=(b,url)):
            proof=p.verify(m,"sofiboutique",auditor=fake,reader=lambda *a:1400)
        self.assertEqual(proof["pdf_sha256"],sha)
        self.assertFalse(proof["financial_certified"])
        self.assertFalse(proof["publication_authorized"])
        self.assertFalse(proof["regulatory_review_complete"])
if __name__=="__main__":unittest.main()
