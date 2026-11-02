import unittest
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
    def test_fake_certified_discovery_rejected(self):
        c=candidate()
        c["status"]="CERTIFIED"
        with self.assertRaisesRegex(ValueError,"INCOMPLETE_OR_UNSAFE_MANIFEST"):
            audit_manifest({"schema_version":1,"mode":"new","candidate":c})

if __name__=="__main__":unittest.main()
