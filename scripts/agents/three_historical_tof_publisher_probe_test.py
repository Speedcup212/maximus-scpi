import unittest
import three_historical_tof_publisher_probe as p

class SourcePolicy(unittest.TestCase):
  def test_exact_known_original_binary_pins(self):
    self.assertEqual(len(p.SOURCES),3)
    self.assertEqual(len({x["slug"] for x in p.SOURCES}),3)
    self.assertEqual({x["slug"]:x["period"] for x in p.SOURCES},{
      "paref-evo":"2024-T4","paref-hexa":"2026-T3","pierval-sante":"2026-T3"})
    for x in p.SOURCES:
      self.assertEqual(len(x["sha256"]),64)
      self.assertTrue(x["url"].startswith("https://"+x["issuer_host"]+"/"))
      self.assertGreater(x["byte_size"],1000000)
  def test_layout_context_uses_real_word_positions(self):
    words=[[100,200,145,211,"TOF"],[155,200,191,211,"84,5"],
           [40,150,60,165,"86,6"]]
    self.assertEqual(p.closest_word_context(words,"84,5")[0]["box"],[155,200,191,211])
    self.assertEqual(p.closest_word_context(words,"tof")[0]["word"],"TOF")
  def test_never_infer_pdf_rate_from_filename_or_another_word(self):
    words=[[100,200,145,211,"TOF"],[155,200,191,211,"86,6"]]
    self.assertEqual(p.closest_word_context(words,"84,5"),[])
  def test_issuer_identity_aliases_not_source_fabrications(self):
    self.assertIn("interpierre europe centrale",p.SOURCES[0]["aliases"])
    self.assertIn("pierval sante",p.SOURCES[2]["aliases"])
    self.assertEqual(p.SOURCES[0]["expected_tof"],None)
    self.assertEqual(p.SOURCES[2]["expected_tof"],None)
  def test_no_automatic_certification(self):
    import inspect
    s=inspect.getsource(p)
    self.assertIn('"financial_certified":False',s)
    self.assertIn('"database_writes":False',s)
    self.assertNotIn("UPDATE public.scpi",s)
    self.assertNotIn("apply_migration",s)

if __name__=="__main__":
  unittest.main()
