import json
from pathlib import Path
import sys
import unittest
from decimal import Decimal
sys.path.insert(0,str(Path(__file__).resolve().parent))
import sofidy_t3_numeric_preflight as probe

M=Path(__file__).resolve().parent/"publisher-families/sofidy-2026-t3-financial-qa.json"

class TestT3DecimalQA(unittest.TestCase):
    def manifest(self):return json.loads(M.read_text(encoding="utf-8"))

    def test_44_unapproved_claims_three_sha_locked_originals(self):
        m=self.manifest()
        self.assertEqual(sum(len(d["metrics"]) for d in m["documents"]),44)
        expected_debt={"sofiboutique":"28.4","sofipierre":"23.8","sofidy-europe-invest":"26.5"}
        for d in m["documents"]:
            x=[v for v in d["metrics"] if v["metric"]=="endettement"]
            self.assertEqual(len(x),1)
            self.assertEqual(x[0]["exact_value"],expected_debt[d["slug"]])
            self.assertEqual(x[0]["source_page"],2)
            self.assertIn("NOT_AVERAGE_LOAN_INTEREST_RATE",x[0]["value_basis"])
        for slug in ("sofiboutique","sofipierre","sofidy-europe-invest"):
            d=probe.check_manifest(m,slug)
            self.assertEqual(d["source_period"],"2026-T3")
            self.assertEqual(len(d["pdf_sha256"]),64)
            self.assertTrue(all(v["qa_status"]=="pending_independent_qa" for v in d["metrics"]))

    def test_reconciles_fractional_shares_without_int_float_cast(self):
        m=self.manifest()
        a=probe.check_manifest(m,"sofidy-europe-invest")
        v={x["metric"]:Decimal(x["exact_value"]) for x in a["metrics"]}
        opening=Decimal("1790005")
        self.assertEqual(opening+v["nombre_parts_nouvelles_souscrites"]-v["nombre_parts_retires"],
                         v["nombre_parts"])
        self.assertEqual(str(v["nombre_parts"]),"1806149.59574")
        self.assertNotEqual(v["nombre_parts"],int(v["nombre_parts"]))
        self.assertEqual(v["nombre_parts"]*v["prix_souscription"],Decimal("424445154.99890"))
        self.assertLessEqual(abs(v["nombre_parts"]*v["prix_souscription"]-v["capitalisation"]),Decimal("0.005"))

    def test_prove_unambiguous_token_patterns_with_grouped_decimal_numbers(self):
        for number,seen in (
            ("1806149.59574","1\u202f806\u202f149,59574"),
            ("23118.59574","23 118,59574"),
            ("1806149.59574","1806149.59574"),
            ("213.85","213,85"),
            ("328513","328 513"),
            ("0.89","0,89"),
        ):
            self.assertTrue(probe.numeric_pattern(number).search(probe.normalize_numeric(seen)),(number,seen))
        for number,wrong in (
            ("1806149.59574","1 806 149,59575"),
            ("23118.59574","23 118,59575"),
            ("328513","328 512"),
            ("96.55","96,54"),
        ):
            self.assertFalse(probe.numeric_pattern(number).search(probe.normalize_numeric(wrong)),(number,wrong))

    def test_fails_closed_on_wrong_source_or_premature_signoff(self):
        m=self.manifest();m["documents"][0]["metrics"][0]["qa_status"]="qa_pass"
        with self.assertRaisesRegex(ValueError,"PREMATURE_FINANCIAL_APPROVAL"):
            probe.check_manifest(m,"sofiboutique")
        m=self.manifest();m["documents"][0]["source_url"]="https://www.sofidy.com.attacker.invalid/fake.pdf"
        with self.assertRaisesRegex(ValueError,"UNTRUSTED_ISSUER_URL"):
            probe.check_manifest(m,"sofiboutique")
        m=self.manifest();m["qa_approval"]=True
        with self.assertRaisesRegex(ValueError,"UNTRUSTED_FINANCIAL_MANIFEST"):
            probe.check_manifest(m,"sofiboutique")

    def test_unchanged_semantics_for_dividend_and_old_valuation(self):
        for d in self.manifest()["documents"]:
            v={x["metric"]:x["value_basis"] for x in d["metrics"]}
            self.assertIn("NOT_ANNUAL_RATE",v["distribution_brute_par_part"])
            self.assertIn("2026_06_30_REPORTED_T3",v["valeur_reconstitution_par_part"])
            self.assertIn("2026_06_30_REPORTED_T3",v["valeur_realisation_par_part"])

if __name__=="__main__":unittest.main()
