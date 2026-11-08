import hashlib
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import sys
import fitz

sys.path.insert(0, str(Path(__file__).parent))
import historicalArchiveProof as proof


class ArchiveProofTests(unittest.TestCase):
    def fixture(self):
        document=fitz.open()
        for _ in range(2):
            p=document.new_page()
            p.insert_text((40,60),"NOVAPIERRE 1 - Bulletin trimestriel 4e trimestre 2024")
            p.insert_text((40,90),"Taux d'occupation financier TOF 89,50 %")
        binary=document.tobytes()
        document.close()
        sha=hashlib.sha256(binary).hexdigest()
        manifest={
            "exists":True, "candidate_slug":"novapierre-1",
            "candidate_name":"Novapierre 1", "allowed_hosts":["paref-gestion.com"],
            "documents":[{
                "source_url":"https://paref-gestion.com/publisher-bulletin.pdf",
                "source_period":"2024-T4",
                "document_kind":"quarterly_bulletin",
                "pdf_sha256":sha,"page_count":2
            }]
        }
        return binary,manifest

    def test_archived_original_never_promotes_financial_qa(self):
        data,manifest=self.fixture()
        with tempfile.TemporaryDirectory() as tmp:
            pdf=Path(tmp)/"original.pdf"
            pdf.write_bytes(data)
            with patch.object(proof,"independent_poppler",return_value=2) as engine:
                result=proof.run(manifest,pdf)
            self.assertEqual(result["status"],"verified")
            document=result["documents"][0]
            self.assertTrue(document["archive_integrity_verified"])
            self.assertFalse(document["publisher_live_verified"])
            self.assertFalse(result["financial_certified"])
            self.assertFalse(result["deploy_allowed"])
            self.assertEqual(document["reader_engines"],["MuPDF","Poppler"])
            self.assertEqual(document["pdf_sha256"],manifest["documents"][0]["pdf_sha256"])
            self.assertGreater(len(document["tof_context_candidates"]),0)
            engine.assert_called_once()

    def test_changed_archive_sha_never_calls_independent_reader(self):
        data,manifest=self.fixture()
        manifest["documents"][0]["pdf_sha256"]="a"*64
        with tempfile.TemporaryDirectory() as tmp:
            pdf=Path(tmp)/"original.pdf"
            pdf.write_bytes(data)
            with patch.object(proof,"independent_poppler") as engine:
                result=proof.run(manifest,pdf)
            self.assertEqual(result["status"],"blocked")
            self.assertEqual(result["documents"][0]["error_code"],"ARCHIVE_SHA256_MISMATCH")
            engine.assert_not_called()
            self.assertFalse(result["financial_certified"])

    def test_no_identity_or_modified_pages_cannot_be_verified(self):
        data,manifest=self.fixture()
        with tempfile.TemporaryDirectory() as tmp:
            pdf=Path(tmp)/"original.pdf"
            pdf.write_bytes(data)
            bad={**manifest,"candidate_name":"other SCPI"}
            with patch.object(proof,"independent_poppler") as engine:
                result=proof.run(bad,pdf)
            self.assertEqual(result["documents"][0]["error_code"],"ARCHIVE_FUND_IDENTITY_NOT_FOUND")
            engine.assert_not_called()
            mismatch={**manifest,"documents":[{**manifest["documents"][0],"page_count":3}]}
            result=proof.run(mismatch,pdf)
            self.assertEqual(result["documents"][0]["error_code"],"ARCHIVE_PAGE_COUNT_MISMATCH")
            self.assertFalse(result["financial_certified"])


if __name__=="__main__":
    unittest.main()
