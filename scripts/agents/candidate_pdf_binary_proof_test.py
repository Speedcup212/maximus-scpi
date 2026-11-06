import tempfile
import unittest
from pathlib import Path
import sys
import subprocess
from unittest.mock import patch
import fitz
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

    def test_semester_manifest_and_two_reader_period_identity(self):
        sem={**BASE,"documents":[{
            **BASE["documents"][0],
            "document_kind":"semiannual_bulletin",
            "source_period":"2026-S1"
        }]}
        proof.validate_manifest(sem)
        with tempfile.TemporaryDirectory() as tmp:
            # Real MuPDF publisher reader on generated public-issuer-like PDF.
            document=fitz.open()
            for i in range(5):
                page=document.new_page()
                title="AEW Opportunites Europe - Bulletin 1er semestre 2026"
                text=" ".join(["AEW Opportunites Europe - donnees semestrielles"]*13)
                for j in range(7):
                    page.insert_text((40,55+j*27),title if j==0 else text,fontsize=9)
            binary=document.tobytes()
            document.close()
            source={"kind":"semiannual","reference_period":"2026-S1",
                    "url":BASE["documents"][0]["source_url"]}
            issuer={"name":"AEW Opportunites Europe",
                    "issuer_hosts":BASE["allowed_hosts"]}
            record=proof.audit_document(source,issuer,
              fetcher=lambda url:(binary,url))
            self.assertTrue(record["publisher_binary_pass"])
            self.assertFalse(record["financial_metrics_certified"])
            import hashlib
            self.assertEqual(record["sha256"],hashlib.sha256(binary).hexdigest())
            pdf=Path(tmp)/"source.pdf"
            pdf.write_bytes(binary)
            output=(("AEW Opportunites Europe - Bulletin 1er semestre 2026 "+
                  "Texte financier officiel sans certification. "*15)+chr(12))*5
            with patch.object(proof.subprocess,"run",return_value=
                subprocess.CompletedProcess(args=["pdftotext"],returncode=0,
                    stdout=output,stderr="")):
                self.assertEqual(proof.independent_poppler(
                    pdf,issuer["name"],"2026-S1","semiannual_bulletin",5),5)
            with patch.object(proof.subprocess,"run",return_value=
                subprocess.CompletedProcess(args=["pdftotext"],returncode=0,
                    stdout=output,stderr="")):
                with self.assertRaisesRegex(ValueError,"SEMESTER_UNCONFIRMED"):
                    proof.independent_poppler(
                        pdf,issuer["name"],"2026-S2","semiannual_bulletin",5)
            with self.assertRaisesRegex(ValueError,"SEMESTER_TITLE_UNCONFIRMED"):
                proof.audit_document(
                  {"kind":"semiannual","reference_period":"2025-S2",
                   "url":source["url"]},issuer,fetcher=lambda url:(binary,url))

    def test_aew_real_cover_reporting_date_overrides_future_validity_semester(self):
        # Captured from the failing real PDF's bounded, first-page proof
        # (run 42222071731). "Validite 2eme semestre" is NOT its report period.
        cover=("2026 SEMESTRE SCPI 1er AEW OPPORTUNITES EUROPE "
               "BULLETIN SEMESTRIEL N 1 ANALYSE : 1er janvier au 30 juin 2026 "
               "VALIDITE : 2eme semestre 2026")
        self.assertTrue(proof.semester_title_matches(cover,"2026-S1"))
        self.assertFalse(proof.semester_title_matches(cover,"2026-S2"))
        self.assertFalse(proof.semester_title_matches(cover,"2025-S1"))
        self.assertFalse(proof.semester_title_matches(
            "Bulletin semestriel 2eme semestre 2026, analyse du 1er juillet au 31 decembre 2025",
            "2026-S2"))
        self.assertTrue(proof.semester_title_matches(
            "AEW bulletin second semestre. Du 1er juillet au 31 décembre 2026",
            "2026-S2"))
        self.assertFalse(proof.semester_title_matches(
            "AEW bulletin valide pour le 2eme semestre 2026. Du 1er janvier au 30 juin 2026",
            "2026-S2"))

        # Exercise the real MuPDF reader on an embedded-extractable PDF.
        doc=fitz.open()
        for i in range(3):
            page=doc.new_page()
            lines=[
                "AEW OPPORTUNITES EUROPE BULLETIN SEMESTRIEL N 1",
                "2026 SEMESTRE SCPI 1er",
                "ANALYSE : 1er janvier au 30 juin 2026",
                "VALIDITE : 2eme semestre 2026",
                "AEW Opportunites Europe donnees financieres officielles. "*2,
                "AEW Opportunites Europe donnees financieres officielles. "*2,
            ]
            for y,line in enumerate(lines):
                page.insert_text((40,50+y*35),line,fontsize=9)
        binary=doc.tobytes()
        doc.close()
        source={"kind":"semiannual","reference_period":"2026-S1",
                "url":BASE["documents"][0]["source_url"]}
        issuer={"name":"AEW Opportunites Europe","issuer_hosts":BASE["allowed_hosts"]}
        record=proof.audit_document(source,issuer,fetcher=lambda url:(binary,url))
        self.assertTrue(record["publisher_binary_pass"])
        self.assertFalse(record["financial_metrics_certified"])
        expected_text=(cover+" AEW Opportunites Europe "*35+chr(12))*3
        with patch.object(proof.subprocess,"run",return_value=
            subprocess.CompletedProcess(args=["pdftotext"],returncode=0,
                stdout=expected_text,stderr="")):
            self.assertEqual(proof.independent_poppler(
                Path("original.pdf"),issuer["name"],"2026-S1","semiannual_bulletin",3),3)
        with patch.object(proof.subprocess,"run",return_value=
            subprocess.CompletedProcess(args=["pdftotext"],returncode=0,
                stdout=expected_text,stderr="")):
            with self.assertRaisesRegex(ValueError,"POPPLER_SEMESTER_UNCONFIRMED"):
                proof.independent_poppler(
                    Path("original.pdf"),issuer["name"],"2026-S2","semiannual_bulletin",3)

    def test_annual_fiscal_date_on_page3_with_cover_title(self):
        # AEW annual report cover has the title but no year; its contents
        # page establishes 31 December of the relevant fiscal year.
        text=(
            "Rapport annuel AEW Opportunites Europe "+"titre annuel. "*40+chr(12)
            +"AEW Opportunites Europe organes de direction "*12+chr(12)
            +"Les donnees essentielles au 31 decembre 2025 "+"exercice. "*25+chr(12)
            +"Perspectives de l'exercice et patrimoine immobilier "*15+chr(12)
        ).replace("\\\\f",chr(12))
        result=subprocess.CompletedProcess(
            args=["pdftotext"],returncode=0,stdout=text,stderr="")
        with patch.object(proof.subprocess,"run",return_value=result):
            self.assertEqual(proof.independent_poppler(
                Path("synthetic.pdf"),"AEW Opportunites Europe",
                "2025-RA","annual_report",4),4)
        with patch.object(proof.subprocess,"run",return_value=result):
            with self.assertRaisesRegex(ValueError,"POPPLER_ANNUAL_TITLE_UNCONFIRMED"):
                proof.independent_poppler(
                    Path("synthetic.pdf"),"AEW Opportunites Europe",
                    "2024-RA","annual_report",4)

    def test_rejected_semester_preserves_only_bounded_cover_diagnostic(self):
        with tempfile.TemporaryDirectory() as tmp:
            document={**BASE["documents"][0],
                "document_kind":"semiannual_bulletin","source_period":"2026-S1"}
            def rejected_auditor(*a,**kw):
                raise ValueError("SEMESTER_TITLE_UNCONFIRMED:AEW bulletin "+
                                 "premier semestre. "+("x"*900))
            entry=proof.document_proof(
                document,{**BASE,"documents":[document]},Path(tmp),
                auditor=rejected_auditor)
            self.assertEqual(entry["status"],"blocked")
            self.assertEqual(entry["error_code"],"SEMESTER_TITLE_UNCONFIRMED")
            self.assertLessEqual(len(entry["cover_text_excerpt"]),180)
            self.assertFalse(entry["financial_certified"])

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
