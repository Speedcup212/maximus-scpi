import unittest
import accimmo_t2_official_tof_probe as source


class PublisherPopplerGeometrySafety(unittest.TestCase):
    def test_valid_poppler_xml_retains_exact_word_and_position(self):
        xml='''<doc><page><word xMin="10" yMin="20" xMax="48" yMax="31">87,44</word></page></doc>'''
        words, mode=source.parse_poppler_bbox(xml)
        self.assertEqual(mode,"poppler_bbox_xml")
        self.assertEqual(words,[[10.0,20.0,48.0,31.0,"87,44"]])
        self.assertEqual(source.contexts(words)[0][0]["text"],"87,44")

    def test_malformed_unrelated_publisher_glyph_keeps_true_poppler_geometry(self):
        xml='''<doc><page>
          <word xMin="10" yMin="20" xMax="40" yMax="31">TOF</word>
          <word xMin="45" yMin="20" xMax="84" yMax="31">87,44</word>
          <word xMin="40" yMin="180" xMax="80" yMax="190">C&K</word>
        </page></doc>'''
        words, mode=source.parse_poppler_bbox(xml)
        self.assertEqual(mode,"poppler_bbox_strict_word_recovery")
        self.assertEqual(len(words),3)
        self.assertEqual(source.contexts(words)[0][0]["rectangle"],[45.0,20.0,84.0,31.0])
        self.assertTrue(source.contexts(words)[1])

    def test_unknown_words_do_not_generate_expected_percentage(self):
        xml='''<doc><page>
          <word xMin="10" yMin="20" xMax="40" yMax="31">87,0</word>
          <word xMin="40" yMin="180" xMax="80" yMax="190">C&K</word>
        </page></doc>'''
        words,_=source.parse_poppler_bbox(xml)
        self.assertEqual(source.contexts(words)[0],[])

    def test_corrupted_without_valid_coordinates_fails_closed(self):
        with self.assertRaisesRegex(ValueError,"POPPLER_BBOX_NO_RECOVERABLE_WORDS"):
            source.parse_poppler_bbox('<doc><word xMin="NaN">87,44</word><broken &')

    def test_source_is_strictly_pinned_and_never_claims_financial_certification(self):
        self.assertEqual(source.HOST,"reim.bnpparibas-am.com")
        self.assertEqual(len(source.SHA256),64)
        self.assertEqual(source.PERIOD,"2026-T2")
        self.assertEqual(source.TARGET,"87,44")


if __name__=="__main__":
    unittest.main()
