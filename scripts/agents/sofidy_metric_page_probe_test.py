import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent))
import sofidy_metric_page_probe as candidate

MANIFEST = Path(__file__).resolve().parent / "publisher-families/sofidy-financial-evidence-2025ra-2026t2.json"

class SofidyPageProofTests(unittest.TestCase):
    def load(self):
        return json.loads(MANIFEST.read_text(encoding="utf-8"))

    def test_three_funds_six_originals_and_22_pending_financial_claims(self):
        m=self.load()
        self.assertFalse(m["financial_qa_autoapprove"])
        names={x["slug"] for x in m["candidates"]}
        self.assertEqual(names,{"sofiboutique","sofipierre","sofidy-europe-invest"})
        for slug in names:
            candidate.validate_manifest(m,slug)
        self.assertEqual(sum(len(x["documents"]) for x in m["candidates"]),6)
        self.assertEqual(sum(len(d["metrics"]) for x in m["candidates"] for d in x["documents"]),22)
        self.assertTrue(all(v["qa_status"]=="pending_independent_qa"
                            for x in m["candidates"] for d in x["documents"] for v in d["metrics"]))

    def test_unverified_source_and_false_financial_approval_fails_closed(self):
        m=self.load()
        m["financial_qa_autoapprove"]=True
        with self.assertRaisesRegex(ValueError,"AUTOMATIC_FINANCIAL_APPROVAL_FORBIDDEN"):
            candidate.validate_manifest(m,"sofiboutique")
        m=self.load()
        m["candidates"][0]["documents"][0]["metrics"][0]["qa_status"]="qa_pass"
        with self.assertRaisesRegex(ValueError,"FINANCIAL_QA_ALREADY_APPROVED"):
            candidate.validate_manifest(m,"sofiboutique")
        m=self.load()
        m["candidates"][0]["documents"][0]["source_url"]="https://www.sofidy.com.attacker.test/annual.pdf"
        with self.assertRaisesRegex(ValueError,"UNTRUSTED_DOCUMENT_URL"):
            candidate.validate_manifest(m,"sofiboutique")

    def test_normalization_and_precise_french_number_matches(self):
        self.assertEqual(candidate.flat("  Taux d’occupation  FINANCIER"),"taux d occupation financier")
        self.assertTrue(candidate.number_regex("309.05").search(candidate.flat("309,05 €")))
        self.assertTrue(candidate.number_regex("250.9").search(candidate.flat("250,90 €")))
        self.assertFalse(candidate.number_regex("250.9").search(candidate.flat("250,91 €")))
        self.assertTrue(candidate.number_regex("1728629").search(candidate.flat("1\u202f728\u202f629")))
        self.assertTrue(candidate.number_regex("320").search(candidate.flat("320 €")))
        self.assertFalse(candidate.number_regex("309.05").search(candidate.flat("308,74 €")))
        self.assertFalse(candidate.number_regex("328513").search(candidate.flat("328 512")))
        self.assertFalse(candidate.number_regex("5.41").search(candidate.flat("5,42%")))
        self.assertFalse(candidate.number_regex("196.26").search(candidate.flat("196,27 €")))

    def test_labels_and_numbers_never_automatically_approve(self):
        import fitz
        source=fitz.open()
        page=source.new_page()
        page.insert_text((60,90),"Valeur de reconstitution / part 309,05 euros",
                         fontsize=12)
        page.insert_text((60,140),"Taux de distribution 5,14 pour cent",fontsize=12)
        with tempfile.TemporaryDirectory() as tmp:
            out=Path(tmp)
            dst=out/"sample.pdf"
            source.save(dst)
            source.close()
            pdf=fitz.open(dst)
            metric={"metric":"valeur_reconstitution_par_part","source_page":1,"value":"309.05","unit":"EUR_PER_PART","value_basis":"2025_12_31_AFTER_ANNUAL_DIVIDEND"}
            doc={"source_url":"https://www.sofidy.com/original.pdf","source_period":"2025-RA","pdf_sha256":"b"*64,"metrics":[metric]}
            try:
                with patch.object(candidate,"read_page_poppler",return_value="Valeur de reconstitution / part 309,05 euros"):
                    found=candidate.pdf_annual_metrics(pdf,dst,doc,out)
            finally:
                pdf.close()
            self.assertEqual(len(found),1)
            self.assertEqual(found[0]["technical_status"],"TWO_ENGINE_VALUE_AND_LABEL_FOUND")
            self.assertEqual(found[0]["qa_status"],"pending_independent_qa")
            self.assertFalse(found[0]["publication_authorized"])
            self.assertTrue((out/"visual/2025-RA-page-1.png").exists())

if __name__=="__main__":unittest.main()
