import unittest
from pathlib import Path
import official_tof_independent_geometry as geo


def one(x0,y0,x1,y1,text):
    return (float(x0),float(y0),float(x1),float(y1),text)

def fixture(quarter=1,source_value="91,78"):
    start=1 if quarter==1 else 2
    return [
        one(290,687,302,698,"1er" if start==1 else "2ème"),
        one(304,687,339,698,"trimestre"),
        one(341,687,363,698,"2026"),
        one(311,609,330,620,source_value),
        one(109,609,129,620,"93,85"),
        one(317,705,339,715,"0,07"),
        one(318,712,339,722,"89,72"),
    ]

class IndependentTOFGeometry(unittest.TestCase):
    def test_pins_match_original_issuer_archive_hash(self):
        for q,cfg in geo.PINNED.items():
            self.assertEqual(len(cfg["sha256"]),64)
            self.assertEqual(cfg["original_path"],
                             "alternative-original-pdfs" if q=="2026-T1" else "original-pdfs")
            self.assertEqual(cfg["issuer_url"].split('/')[2],"www.fiducial-gerance.fr")

    def test_true_quarter_centre_not_previous_quarter_donut(self):
        q=geo.extract_period_bound_tof(fixture(),"2026-T1")
        self.assertEqual(q["value_percent"],91.78)
        self.assertEqual(q["source_page"] if "source_page" in q else q["page"],4)

    def test_legend_subcomponent_is_never_selected_as_tof(self):
        words=fixture()
        words.append(one(313,700,330,711,"0,07"))
        result=geo.extract_period_bound_tof(words,"2026-T1")
        self.assertEqual(result["value_percent"],91.78)
        self.assertTrue(result["distinct_from_vacancy_legend"])

    def test_forged_rate_outside_donut_rejected(self):
        words=fixture()
        words=[w for w in words if w[4]!="91,78"]
        with self.assertRaisesRegex(ValueError,"TOF_DONUT_CENTER_VALUE_AMBIGUOUS"):
            geo.extract_period_bound_tof(words,"2026-T1")

    def test_ambiguous_pair_same_quarter_fails_closed(self):
        words=fixture()
        words.append(one(313,615,331,623,"91,56"))
        with self.assertRaisesRegex(ValueError,"TOF_DONUT_CENTER_VALUE_AMBIGUOUS"):
            geo.extract_period_bound_tof(words,"2026-T1")

    def test_wrong_period_is_not_inferred_from_last_or_first_number(self):
        with self.assertRaisesRegex(ValueError,"QUARTER_DONUT_CAPTION_AMBIGUOUS"):
            geo.extract_period_bound_tof(fixture(),"2026-T2")

    def test_visual_issuer_cover_title_and_exact_quarter_required(self):
        title="BUROBOUTIC Métropoles Bulletin Trimestriel d’Information N° 2026 – T1"
        geo.validate_cover(title,title,"2026-T1")
        with self.assertRaisesRegex(ValueError,"BULLETIN_COVER_PERIOD_NOT_CONFIRMED"):
            geo.validate_cover(title,title,"2026-T2")
        with self.assertRaisesRegex(ValueError,"ISSUER_QUARTERLY_BULLETIN_NOT_CONFIRMED"):
            geo.validate_cover("BUROBOUTIC Métropoles Note d'information et statuts",
                               "BUROBOUTIC Métropoles Note et statuts","2026-T1")

if __name__ == "__main__":
    unittest.main()
