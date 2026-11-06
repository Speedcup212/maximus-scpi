import tempfile
import unittest
from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).resolve().parent))
import candidate_pdf_binary_proof as proof

SHA="a"*64
BASE={
    "exists":True,
    "candidate_slug":"opus-real",
    "candidate_name":"Opus Real",
    "allowed_hosts":["reim.bnpparibas-am.com"],
    "documents":[{
      "source_url":"https://reim.bnpparibas-am.com/files/opus-t3.pdf",
      "source_period":"2026-T3",
      "document_kind":"quarterly_bulletin",
      "pdf_sha256":SHA,"page_count":7
    }]
}

class CandidateProofTests(unittest.TestCase):
    def test_strict_publisher_host_and_exact_document_hash(self):
        self.assertEqual(proof.validate_manifest(BASE)["candidate_slug"],"opus-real")
        for url in ("http://reim.bnpparibas-am.com/test.pdf",
                    "https://reim.bnpparibas-am.com.attacker.test/test.pdf",
                    "https://username@reim.bnpparibas-am.com/test.pdf",
                    "https://127.0.0.1/pdf",
                    "https://reim.bnpparibas-am.com:8080/file.pdf"):
            bad={**BASE,"documents":[{**BASE["documents"][0],"source_url":url}]}
            with self.assertRaises(ValueError):proof.validate_manifest(bad)
        with self.assertRaises(ValueError):proof.validate_manifest(
            {**BASE,"documents":[{**BASE["documents"][0],"pdf_sha256":"garbage"}]})

    def test_hash_mismatch_fails_closed(self):
        with tempfile.TemporaryDirectory() as tmp:
            def auditor(d,c,fetcher):
                loc=Path(tmp)/"official-pdf-archive"
                loc.mkdir(parents=True,exist_ok=True)
                (loc/"mock.pdf").write_bytes(b"%PDF-source-test")
                return {"sha256":"b"*64,"page_count":7,
                        "archive_assets":{"pdf":"mock.pdf"}}
            result=proof.run_manifest(BASE,Path(tmp),auditor=auditor,
                                     checker=lambda *a:7)
            self.assertEqual(result["status"],"blocked")
            self.assertEqual(result["documents"][0]["error_code"],
                             "PUBLISHER_PDF_SHA_CHANGED")
            self.assertFalse(result["financial_certified"])

    def test_binary_proof_requires_two_real_readers_and_never_certifies(self):
        with tempfile.TemporaryDirectory() as tmp:
            checked=[]
            def auditor(d,c,fetcher):
                loc=Path(tmp)/"official-pdf-archive"
                loc.mkdir(parents=True,exist_ok=True)
                (loc/"mock.pdf").write_bytes(b"%PDF-source-test")
                checked.append(("MuPDF",d["reference_period"],c["name"]))
                return {"sha256":SHA,"page_count":7,
                        "archive_assets":{"pdf":"mock.pdf"}}
            def checker(p,name,period,kind,count):
                checked.append(("Poppler",period,name))
                self.assertEqual(count,7)
                return count
            result=proof.run_manifest(BASE,Path(tmp),auditor=auditor,checker=checker)
            self.assertEqual(result["status"],"verified")
            self.assertEqual(len(checked),2)
            self.assertEqual([x[0] for x in checked],["MuPDF","Poppler"])
            self.assertEqual(result["documents"][0]["reader_engines"],["MuPDF","Poppler"])
            self.assertEqual(result["documents"][0]["pdf_sha256"],SHA)
            self.assertFalse(result["financial_certified"])

    def test_new_candidates_with_no_verified_pdf_require_source_search(self):
        with tempfile.TemporaryDirectory() as tmp:
            result=proof.run_manifest({**BASE,"documents":[]},Path(tmp))
            self.assertEqual(result["status"],"no_verified_documents")
            self.assertEqual(result["documents"],[])
            self.assertFalse(result["financial_certified"])

    def test_absent_current_candidate_is_not_a_fake_successful_proof(self):
        with tempfile.TemporaryDirectory() as tmp:
            result=proof.run_manifest({"exists":False,"documents":[]},Path(tmp))
            self.assertEqual(result["status"],"no_candidate")
            self.assertFalse(result["financial_certified"])

if __name__=="__main__":
    unittest.main()
