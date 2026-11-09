"""Tests hors réseau du relevé de clauses de frais (RECOVERY-200)."""
import pathlib
import sys
import unittest

sys.path.insert(0, str(pathlib.Path(__file__).parent))
import fee_document_probe as probe  # noqa: E402


class FeeProbeTest(unittest.TestCase):
    def test_classify_dic_and_note(self):
        self.assertEqual(probe.classify(["Document d’informations clés\nObjectif..."]), 'dic')
        self.assertEqual(probe.classify(["SCPI X\nNOTE D'INFORMATION", "Visa de l'Autorité des marchés financiers"]), 'note')
        self.assertEqual(probe.classify(["Bulletin trimestriel d'information"]), 'bulletin')

    def test_fee_clause_keeps_page_percent_tax_and_basis(self):
        pages = ["Introduction", "Une commission de souscription de 10 % HT, soit 12 % TTC, du prix de souscription est perçue. "
                 "La commission de gestion est fixée à 10 % HT des produits locatifs hors taxes encaissés et des produits financiers nets."]
        clauses = probe.fee_clauses(pages)
        labels = [c['label'].lower() for c in clauses]
        self.assertTrue(any('souscription' in l for l in labels))
        self.assertTrue(any('gestion' in l for l in labels))
        sous = next(c for c in clauses if 'souscription' in c['label'].lower())
        self.assertEqual(sous['page'], 2)
        self.assertEqual([p['value'] for p in sous['percents']][:2], [10.0, 12.0])
        self.assertEqual(sous['percents'][0]['tax_hint'], 'HT')
        self.assertIn('prix_souscription', sous['basis_tags'])
        gest = next(c for c in clauses if 'gestion' in c['label'].lower())
        self.assertIn('produits_locatifs_encaisses', gest['basis_tags'])

    def test_no_percent_is_invented(self):
        clauses = probe.fee_clauses(["Les frais de gestion sont précisés dans la note d'information."])
        self.assertEqual(clauses[0]['percents'], [])

    def test_identity_normalisation(self):
        self.assertEqual(probe.norm("Cœur d’Europe"), 'coeur d europe')
        self.assertEqual(probe.norm('ÉPARGNE  Pierre'), 'epargne pierre')

    def test_http_refused(self):
        with self.assertRaises(ValueError):
            probe.http_get('http://example.com/a.pdf', 'application/pdf', 10)

    def test_link_scoring_prefers_regulatory_documents(self):
        aliases = ['iroko zen']
        self.assertGreater(probe.score_link('https://x.fr/DIC-Iroko-Zen.pdf', '', aliases),
                           probe.score_link('https://x.fr/bulletin-trimestriel-T3.pdf', '', aliases))


if __name__ == '__main__':
    unittest.main()
