#!/usr/bin/env python3
import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[2]/"scpi-onboarding"))
sys.path.insert(0,str(Path(__file__).resolve().parent))
from publisherPdfAudit import quarter_title_matches
from geometry_review import analyze_geometry,parse_poppler_bbox


def w(t,x,y,width=22):
    return {"t":t,"bbox":[x,y,x+width,y+10]}


class StrictQuarterTitle(unittest.TestCase):
    def test_real_epargne_pierre_poppler_spacing(self):
        self.assertTrue(quarter_title_matches("3 eme trimestre 2026 - valable du 1er octobre au 31 decembre 2026","2026-T3"))

    def test_real_epsicap_mupdf_missing_whitespace(self):
        self.assertTrue(quarter_title_matches("3eme trimestre 2026bulletin trimestriel d'information","2026-T3"))

    def test_original_valid_variants(self):
        self.assertTrue(quarter_title_matches("Bulletin T3 2026","2026-T3"))
        self.assertTrue(quarter_title_matches("3e trimestre 2026","2026-T3"))
        self.assertTrue(quarter_title_matches("3ème trimestre 2026","2026-T3"))

    def test_reject_other_quarter_or_year(self):
        for s in ("2eme trimestre 2026","3eme trimestre 2025","3eme trimestre 20260","Validite du 01/10/2026 au 31/12/2026"):
            self.assertFalse(quarter_title_matches(s,"2026-T3"),s)

    def test_reject_invalid_period(self):
        self.assertFalse(quarter_title_matches("3eme trimestre 2026","2026-T5"))


class IndependentGeometry(unittest.TestCase):
    def test_same_page_two_engines_adjacent_label_value(self):
        # Value 2 811 is split across two words by each independent reader.
        mu=[[w("Capitalisation",45,100,78),w("2",132,100,9),w("811",144,100,28)]]
        po=[[w("Capitalisation",46,101,78),w("2",133,101,9),w("811",145,101,28)]]
        outcome=analyze_geometry("unused.pdf","capitalisation",2811,mu,po)
        self.assertEqual(outcome["status"],"DUAL_READER_GEOMETRY_CANDIDATE")
        self.assertEqual(outcome["matching_pairs"][0]["page"],1)
        self.assertFalse(outcome["semantic_financial_qa"])

    def test_value_elsewhere_not_financially_certified(self):
        mu=[[w("TOF",20,20),w("92,5",800,800)]]
        po=[[w("TOF",20,20),w("92,5",800,800)]]
        outcome=analyze_geometry("unused.pdf","tof",92.5,mu,po)
        self.assertEqual(outcome["status"],"NO_LABELLED_GEOMETRIC_VALUE")
        self.assertFalse(outcome["semantic_financial_qa"])

    def test_poppler_bbox_with_invalid_xml_ampersand_is_still_parsed(self):
        html='<html><body><page width="595" height="842"><word xMin="50" yMin="100" xMax="115" yMax="110">Capitalisation &amp;</word><word xMin="120" yMin="100" xMax="150" yMax="110">209</word><word xMin="160" yMin="100" xMax="180" yMax="110">A & B</word></page></body></html>'
        out=parse_poppler_bbox(html)
        self.assertEqual(len(out),1)
        self.assertEqual(len(out[0]),3)
        self.assertEqual(out[0][1]["t"],"209")

    def test_two_readers_at_different_positions_not_approved(self):
        mu=[[w("TOF",20,20),w("92,5",50,20)]]
        po=[[w("TOF",400,400),w("92,5",430,400)]]
        outcome=analyze_geometry("unused.pdf","tof",92.5,mu,po)
        self.assertEqual(outcome["status"],"ONE_ENGINE_OR_POSITION_DISAGREEMENT")
        self.assertFalse(outcome["semantic_financial_qa"])


if __name__=="__main__":unittest.main()
