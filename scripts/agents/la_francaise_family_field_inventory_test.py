import json
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

sys.path.insert(0,str(Path(__file__).resolve().parent))
import la_francaise_family_field_inventory as fam

MANIFEST=Path(__file__).resolve().parent/"publisher-families/la-francaise-2026-s1-source-inventory.json"

class LaFrancaiseFamilyProofTests(unittest.TestCase):
    def load(self):return json.loads(MANIFEST.read_text(encoding="utf-8"))

    def test_all_14_verified_documents_pinned_without_financial_permission(self):
        m=self.load()
        self.assertEqual(len(m["candidates"]),14)
        self.assertFalse(m["financial_certification"])
        self.assertFalse(m["publication_authorized"])
        for d in m["candidates"]:
            x=fam.manifest_contract(m,d["slug"])
            self.assertIn(x["document_kind"],{"quarterly_bulletin","semiannual_bulletin"})
            self.assertEqual(len(x["pdf_sha256"]),64)
            self.assertEqual(x["subscription_eligibility"],"NOT_VERIFIED")

    def test_host_spoofing_and_premature_open_for_sale_rejected(self):
        m=self.load()
        m["candidates"][0]["source_url"]="https://doc.la-francaise.com.evil.com/Documents/d.pdf"
        with self.assertRaisesRegex(ValueError,"UNTRUSTED_SOURCE_OR_DISTRIBUTION_STATUS"):
            fam.manifest_contract(m,m["candidates"][0]["slug"])
        m=self.load()
        m["candidates"][0]["subscription_eligibility"]="OPEN_FOR_SALE"
        with self.assertRaisesRegex(ValueError,"UNTRUSTED_SOURCE_OR_DISTRIBUTION_STATUS"):
            fam.manifest_contract(m,m["candidates"][0]["slug"])

    def test_no_original_sha_silently_accepted(self):
        m=self.load();d=m["candidates"][0]
        with patch.object(fam.proof,"download_official",return_value=(b"%PDF-not-verified",d["source_url"])):
            with self.assertRaisesRegex(ValueError,"REGISTERED_ISSUER_ORIGINAL_SHA_MISMATCH"):
                fam.build_inventory(m,d["slug"])

    def test_issuer_casing_and_french_label_location(self):
        sample="TAUX D’OCCUPATION FINANCIER: 93,54 %\nCapitalisation au 30 juin 2026"
        s=fam.norm(sample)
        self.assertTrue(any(__import__("re").search(p,s) for p in fam.FIELDS["tof"]))
        self.assertTrue(any(__import__("re").search(p,s) for p in fam.FIELDS["capitalisation"]))
        self.assertIn("capitalisation",fam.excerpt(sample,fam.FIELDS["capitalisation"]))
        self.assertEqual(fam.excerpt("seul du bruit dans la page",fam.FIELDS["tof"]),"")
if __name__=="__main__":unittest.main()
