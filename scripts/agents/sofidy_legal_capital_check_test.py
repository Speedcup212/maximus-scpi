import json
from pathlib import Path
import sys
import unittest
sys.path.insert(0,str(Path(__file__).resolve().parent))
import sofidy_legal_capital_check as r

M=Path(__file__).resolve().parent/"publisher-families/sofidy-legal-capital-regime-2026.json"
class LegalCapitalTests(unittest.TestCase):
    def manifest(self):return json.loads(M.read_text(encoding="utf-8"))
    def test_verified_dic_origins_and_distinct_funds(self):
        m=self.manifest()
        for slug in ("sofiboutique","sofipierre","sofidy-europe-invest"):
            d=r.validate(m,slug)
            self.assertTrue(d["source_url"].endswith(".pdf"))
            self.assertEqual(len(d["pdf_sha256"]),64)
            self.assertEqual(d["page_count"],3)
    def test_unknown_source_and_fake_approval_is_rejected(self):
        m=self.manifest()
        m["financial_certified"]=True
        with self.assertRaisesRegex(ValueError,"INVALID_DIC_MANIFEST"):
            r.validate(m,"sofiboutique")
        m=self.manifest()
        m["candidates"][0]["source_url"]="https://www.sofidy.com.evil.invalid/fake.pdf"
        with self.assertRaisesRegex(ValueError,"UNTRUSTED_DIC_ORIGINAL"):
            r.validate(m,"sofiboutique")
        with self.assertRaisesRegex(ValueError,"UNKNOWN_FUND"):
            r.validate(self.manifest(),"unknown-scpi")
    def test_explicit_fund_identity_and_variable_clause(self):
        text="DOCUMENT D'INFORMATIONS CLES 2026 SOFIBOUTIQUE : SCPI a capital variable, ouverte."
        x=r.test_text("MuPDF",[text],"Sofiboutique")
        self.assertEqual(x[0]["kind"],"variable")
        self.assertEqual(x[0]["page"],1)
        with self.assertRaisesRegex(ValueError,"SCPI_IDENTITY_MISSING"):
            r.test_text("Poppler",[text],"Sofipierre")
    def test_no_unrelated_capital_claim(self):
        text="DOCUMENT D'INFORMATIONS CLES 2026 SOFIPIERRE. Une formule de retrait peut varier."
        self.assertEqual(r.test_text("MuPDF",[text],"Sofipierre"),[])
if __name__=="__main__":unittest.main()
