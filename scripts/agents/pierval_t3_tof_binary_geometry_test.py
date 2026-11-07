import unittest
import pierval_t3_tof_binary_geometry as p

class IndependentOfficialPiervalGeometry(unittest.TestCase):
    def test_two_issuer_tof_positions_identify_91_04_not_vacancy(self):
        self.assertTrue(p.verify_geometry([p.LEFT_TOF,p.CHART_TOF],
                                          [p.LEFT_TOF,p.CHART_TOF]))
    def test_wrong_first_number_locks_financial_qa(self):
        with self.assertRaisesRegex(ValueError,"CHART_91P04_POSITION_MISMATCH"):
            p.verify_geometry([p.LEFT_TOF,(400,400,450,420)],
                              [p.LEFT_TOF,p.CHART_TOF])
    def test_missing_double_reader_pair_locks_qa(self):
        with self.assertRaisesRegex(ValueError,"COUNT_MUST_BE_TWO"):
            p.verify_geometry([p.CHART_TOF],[p.LEFT_TOF,p.CHART_TOF])
    def test_mismatched_second_engine_locks_qa(self):
        with self.assertRaisesRegex(ValueError,"CHART_91P04_POSITION_MISMATCH"):
            p.verify_geometry([p.LEFT_TOF,p.CHART_TOF],
                              [p.LEFT_TOF,(350,320,400,335)])
    def test_exact_original_issuer_binary_source_and_status(self):
        self.assertEqual(len(p.SHA),64)
        self.assertEqual(p.BYTE_SIZE,3637582)
        self.assertEqual(p.PAGE,9)
        self.assertEqual(p.TOF,"91,04")
        self.assertEqual(p.VACANT,"8,96")
        self.assertEqual(p.PERIOD,"T3 2026")
        self.assertTrue(p.URL.startswith("https://www.euryale-am.fr/"))
if __name__=="__main__":
    unittest.main()
