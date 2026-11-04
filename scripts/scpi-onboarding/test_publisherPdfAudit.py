import unittest
import tempfile
import hashlib
import json
from pathlib import Path
from unittest.mock import patch
import fitz
from publisherPdfAudit import audit_document, audit_manifest, official_url

URL="https://www.sofidy.com/app/uploads/test.pdf"
HOSTS=["www.sofidy.com","sofidy.com"]

def pdf_bytes(header):
    doc=fitz.open()
    page=doc.new_page()
    page.insert_text((40,40),header,fontsize=12)
    for i in range(45):
        page.insert_text((40,70+i*14),"Historical source documentation content for technical verification "+str(i),fontsize=9)
    result=doc.tobytes()
    doc.close()
    return result

def candidate():
    return {"slug":"sofidynamic","name":"Sofidynamic","issuer_hosts":HOSTS,
            "status":"DISCOVERED_ONLY","document_sha256":None,
            "documents":[{"kind":"quarterly","reference_period":"2026-T2","url":URL,
                          "page_hints":[{"field":"tof","page":1,"token":"97,73"}]}]}

class PublisherPdfTest(unittest.TestCase):
    def test_exact_https_host_only(self):
        self.assertTrue(official_url(URL,HOSTS))
        self.assertFalse(official_url("http://www.sofidy.com/file.pdf",HOSTS))
        self.assertFalse(official_url("https://www.sofidy.com.evil.test/file.pdf",HOSTS))
        self.assertFalse(official_url("https://u:p@www.sofidy.com/file.pdf",HOSTS))
    def test_valid_quarter_and_no_financial_certification(self):
        c=candidate()
        doc=c["documents"][0]
        raw=pdf_bytes("SOFIDYNAMIC 2e TRIMESTRE 2026 97,73")
        report=audit_document(doc,c,lambda _: (raw,URL))
        self.assertTrue(report["fund_and_period_identity_pass"])
        self.assertFalse(report["financial_metrics_certified"])
        self.assertFalse(report["publication_authorized"])
    def test_archive_preserves_exact_source_and_page_provenance(self):
        c=candidate()
        raw=pdf_bytes("SOFIDYNAMIC 2e TRIMESTRE 2026 97,73")
        with tempfile.TemporaryDirectory() as directory, patch.dict("os.environ",{"SCPI_PDF_ARCHIVE_DIR":directory}):
            report=audit_document(c["documents"][0],c,lambda _: (raw,URL))
            assets=report["archive_assets"]
            self.assertEqual((Path(directory)/assets["pdf"]).read_bytes(),raw)
            self.assertEqual(assets["pdf"],hashlib.sha256(raw).hexdigest()+".pdf")
            text_raw=(Path(directory)/assets["pages"]).read_bytes()
            self.assertEqual(hashlib.sha256(text_raw).hexdigest(),assets["pages_sha256"])
            pages=json.loads(text_raw)
            self.assertEqual(pages["pdf_sha256"],report["sha256"])
            self.assertEqual(pages["source_url"],URL)
            self.assertEqual(pages["pages"][0]["page"],1)
            self.assertIn("97,73",pages["pages"][0]["text"])
            self.assertFalse(report["financial_metrics_certified"])
            self.assertFalse(report["publication_authorized"])

    def test_rejected_document_does_not_create_archival_proof(self):
        c=candidate()
        with tempfile.TemporaryDirectory() as directory, patch.dict("os.environ",{"SCPI_PDF_ARCHIVE_DIR":directory}):
            with self.assertRaisesRegex(ValueError,"FUND_IDENTITY_NOT_FOUND"):
                audit_document(c["documents"][0],c,lambda _: (pdf_bytes("OTHER FUND 2026"),URL))
            self.assertEqual(list(Path(directory).iterdir()),[])

    def test_wrong_fund_or_wrong_period_is_rejected(self):
        c=candidate()
        d=c["documents"][0]
        with self.assertRaisesRegex(ValueError,"FUND_IDENTITY_NOT_FOUND"):
            audit_document(d,c,lambda _: (pdf_bytes("OTHER SCPI 2e TRIMESTRE 2026"),URL))
        with self.assertRaisesRegex(ValueError,"QUARTER_TITLE_UNCONFIRMED"):
            audit_document(d,c,lambda _: (pdf_bytes("SOFIDYNAMIC 1er TRIMESTRE 2026"),URL))
    def test_redirect_trust_not_transferred(self):
        c=candidate()
        with self.assertRaisesRegex(ValueError,"REDIRECT_OUTSIDE_ISSUER_HOST"):
            audit_document(c["documents"][0],c,lambda _: (pdf_bytes("SOFIDYNAMIC 2e TRIMESTRE 2026"),"https://evil.test/file.pdf"))
    def test_annual_document_and_no_promotion(self):
        c=candidate()
        c["documents"]=[{"kind":"annual","reference_period":"2025-RA","url":URL}]
        raw=pdf_bytes("SOFIDYNAMIC Rapport annuel Exercice 2025")
        r=audit_manifest({"schema_version":1,"mode":"new","batch_id":"test","candidate":c},lambda _:(raw,URL))
        self.assertEqual(r["status"],"ISSUER_BINARY_QA_PASS")
        self.assertFalse(r["staging_written"])
        self.assertFalse(r["publication_authorized"])

    def test_dated_regulatory_dic_and_note_never_certify_by_themselves(self):
        c=candidate()
        for kind,label in [("dic","Document d'Informations Clés"),("note","Note d'information"),("statutes","Statuts")]:
            doc={"kind":kind,"reference_period":"2026-REG","url":URL,"page_hints":[]}
            raw=pdf_bytes("SOFIDYNAMIC "+label+" août 2026")
            result=audit_document(doc,c,lambda _: (raw,URL))
            self.assertTrue(result["regulatory_kind_seen"])
            self.assertFalse(result["regulatory_content_certified"])
            self.assertFalse(result["publication_authorized"])
    def test_wrong_regulatory_document_kind_or_year_fails(self):
        c=candidate()
        dic={"kind":"dic","reference_period":"2026-REG","url":URL}
        with self.assertRaisesRegex(ValueError,"REGULATORY_KIND_UNCONFIRMED"):
            audit_document(dic,c,lambda _: (pdf_bytes("SOFIDYNAMIC Note d'information juillet 2026"),URL))
        with self.assertRaisesRegex(ValueError,"REGULATORY_EDITION_YEAR_UNCONFIRMED"):
            audit_document(dic,c,lambda _: (pdf_bytes("SOFIDYNAMIC Document d'Informations Clés 2025"),URL))
    def test_fake_certified_discovery_rejected(self):
        c=candidate()
        c["status"]="CERTIFIED"
        with self.assertRaisesRegex(ValueError,"INCOMPLETE_OR_UNSAFE_MANIFEST"):
            audit_manifest({"schema_version":1,"mode":"new","candidate":c})

if __name__=="__main__":unittest.main()

class SemiannualAuditTests(unittest.TestCase):
 def test_semester_analysis_is_not_validity_or_quarter(self):
  c=candidate();raw=pdf_bytes('SOFIDYNAMIC Bulletin semestriel Analyse : 1er janvier au 30 juin 2026 Validite : 2eme semestre 2026')
  doc={'kind':'semiannual','reference_period':'2026-S1','url':URL}
  result=audit_document(doc,c,lambda _:(raw,URL))
  self.assertTrue(result['fund_and_period_identity_pass']);self.assertFalse(result['financial_metrics_certified'])
  with self.assertRaisesRegex(ValueError,'SEMIANNUAL_ANALYSIS_PERIOD_UNCONFIRMED'):audit_document({**doc,'reference_period':'2026-S2'},c,lambda _:(raw,URL))
  with self.assertRaisesRegex(ValueError,'QUARTER_TITLE_UNCONFIRMED'):audit_document({**doc,'kind':'quarterly','reference_period':'2026-T2'},c,lambda _:(raw,URL))

class FinancialReportKindRegression(unittest.TestCase):
 def test_forcing_annual_kind_cannot_certify_an_isr_report(self):
  c=candidate();raw=pdf_bytes('SOFIDYNAMIC Rapport annuel ISR 2025')
  with self.assertRaisesRegex(ValueError,'ESG_REPORT_IS_NOT_FINANCIAL_ANNUAL_REPORT'):
   audit_document({'kind':'annual','reference_period':'2025-RA','url':URL},c,lambda _:(raw,URL))
