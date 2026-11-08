import tempfile
import unittest
from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).parent))
import historicalTofGeometry as g

def w(text,x,y):
    return (x,y,x+23,y+12,text)

class GeometrySecurity(unittest.TestCase):
    def test_fixed_real_issuer_periods_and_sha(self):
        self.assertEqual(set(g.SPECS),{"novapierre-1","novapierre-residentiel","cristal-rente"})
        for spec in g.SPECS.values():
            self.assertEqual(len(spec["sha256"]),64)
            self.assertIn("-T",spec["period"])
    def test_matches_only_numeric_word_at_same_bbox_in_both_engines(self):
        words=[w("TOF",30,100),w("89,7",65,100),w("%",88,100),
               w("Locaux",30,180),w("vacants",62,180),w("10,3%",100,180)]
        mu=g.locate(words,89.7)
        po=g.locate(words,89.7)
        paired=g.pair_engines(mu,po)
        self.assertEqual(len(paired),1)
        self.assertEqual(paired[0]["value"],89.7)
        self.assertTrue(paired[0]["both_near_tof"])
        self.assertFalse(any(x["value"]==10.3 for x in mu))
    def test_shifted_bbox_fails_closed(self):
        mu=g.locate([w("TOF",30,100),w("95,3",65,100)],95.3)
        po=g.locate([w("TOF",30,100),w("95,3",120,100)],95.3)
        self.assertEqual(g.pair_engines(mu,po),[])
    def test_vacancy_subcomponent_not_target_tof(self):
        words=[w("TOF",30,40),w("89,7",58,40),w("Locaux",30,180),
               w("vacants",62,180),w("10,3",97,180)]
        # The reader refuses a vacancy percentage outside the credible TOF
        # candidate range; it must not assert that it found a TOF label.
        self.assertEqual(g.locate(words,10.3),[])
    def test_conflicting_current_and_previous_targets_remain_review(self):
        spec={"candidate":89.7,"target_page":4}
        pages=[(4,[w("TOF",30,100),w("89,7",65,100)],
                  [w("TOF",30,100),w("89,7",65,100)]),
               (1,[w("TOF",30,100),w("89,7",65,100)],
                  [w("TOF",30,100),w("89,7",65,100)])]
        result=g.evaluate(spec,pages)
        self.assertEqual(result["status"],"NEEDS_INDEPENDENT_SEMANTIC_QA")
        self.assertFalse(result["financial_certified"])
    def test_two_matching_same_page_chart_labels_are_not_conflicting_values(self):
        spec={"candidate":89.7,"target_page":4}
        words=[w("TOF",30,100),w("89,7",65,100),
               w("TOF",400,100),w("89,7",430,100)]
        result=g.evaluate(spec,[(4,words,words)])
        self.assertEqual(result["status"],"BBOX_CANDIDATE_REVIEW")
        self.assertEqual(result["candidate_geom_count"],2)
        self.assertFalse(result["financial_certified"])
        self.assertTrue(result["manual_financial_qa_required"])
    def test_malformed_poppler_xhtml_recovers_only_real_bbox_words(self):
        xml=('<html><page><word xMin="42" yMin="80" xMax="62" yMax="92">TOF</word>'
             '<word xMin="80" yMin="80" xMax="119" yMax="92">95,3</word>'
             '<word xMin="121" yMin="80" xMax="130" yMax="92">%</word>'
             '\x0b</page></html>')
        words,mode=g.parse_poppler_bbox(xml)
        self.assertEqual(mode,"html_word_recovery")
        self.assertEqual([w[4] for w in words],["TOF","95,3","%"])
        self.assertEqual(words[1][:4],(80.0,80.0,119.0,92.0))
        self.assertEqual(len(g.locate(words,95.3)),1)
    def test_broken_bbox_does_not_create_fake_numeric_positions(self):
        xml=('<page><word xMin="NaN" yMin="0" xMax="20" yMax="3">95,3</word>'
             '<word xMin="5" yMin="0" xMax="NaN" yMax="3">TOF</word>'
             '<word xMin="1" yMin="1" xMax="5" yMax="4">97,2</word>'
             '\x0b</page>')
        with self.assertRaisesRegex(ValueError,"INSUFFICIENT_WORDS"):
            g.parse_poppler_bbox(xml)
    def test_valid_poppler_xml_uses_strict_parser(self):
        xml='<page><word xMin="1" yMin="2" xMax="5" yMax="8">TOF</word>' + \
            '<word xMin="7" yMin="2" xMax="10" yMax="8">89,7</word>' + \
            '<word xMin="12" yMin="2" xMax="14" yMax="8">%</word></page>'
        words,mode=g.parse_poppler_bbox(xml)
        self.assertEqual(mode,"strict_xml")
        self.assertEqual(len(words),3)
    def test_fake_archive_sha_rejected_without_reader(self):
        with tempfile.TemporaryDirectory() as tmp:
            f=Path(tmp)/"pdf";f.write_bytes(b"%PDF"+b"x"*1200)
            s=g.SPECS["novapierre-1"]
            with self.assertRaisesRegex(ValueError,"ARCHIVED_ISSUER_SOURCE_SHA_MISMATCH"):
                g.audit("novapierre-1",f,{"scpi_slug":"novapierre-1",
                        "source_period":s["period"],"sha256":s["sha256"]})
    def test_wrong_archive_scope_rejected_before_reading(self):
        s=g.SPECS["novapierre-1"]
        with self.assertRaisesRegex(ValueError,"OIDC_MANIFEST_SCOPE_DISAGREEMENT"):
            g.audit("novapierre-1",Path("/not/present"),{
                "scpi_slug":"novapierre-residentiel",
                "source_period":s["period"],"sha256":s["sha256"]})

if __name__=="__main__":
    unittest.main()
