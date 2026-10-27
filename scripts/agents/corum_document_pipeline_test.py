import copy,hashlib,json,pathlib,tempfile,unittest
import fitz
import corum_document_pipeline as c

class PipelineTest(unittest.TestCase):
 def fixture(self,scan=False):
  d=fitz.open();p=d.new_page(width=600,height=800)
  for xy,txt in [((35,40),'1er TRIMESTRE 2025 / DONNEES AU 31 MARS 2025'),((35,70),'CORUM Origin'),((35,100),'Evolution du capital'),((35,140),'FINANCIER (TOF)'),((35,190),'96,24 %'),((430,290),'2 973 611'),((430,320),'Nombre de parts'),((520,380),'0'),((510,400),'part en'),((510,415),'attente'),((510,430),'de retrait')]:p.insert_text(xy,txt,fontsize=10)
  if not scan:return d.tobytes()
  raster=p.get_pixmap(matrix=fitz.Matrix(2,2)).tobytes('png');out=fitz.open();p=out.new_page(width=600,height=800);p.insert_image(p.rect,stream=raster);return out.tobytes()
 def test_official_valid_two_engines(self):
  pdf=self.fixture()
  with tempfile.TemporaryDirectory() as td:
   path=pathlib.Path(td)/'doc.pdf';path.write_bytes(pdf)
   a=c.mupdf(pdf);b=c.poppler(path)
   c.validate_issue('corum-origin','2025-T1',a[0],'quarterly_bulletin')
   m,e,_=c.reconcile(c.parse_core(*a),c.parse_core(*b));self.assertEqual(m,{'tof':96.24,'nombre_parts':2973611,'parts_attente_retrait':0});self.assertEqual(e['tof']['page'],1)
 def test_wrong_fund_rejected(self):
  with self.assertRaisesRegex(ValueError,'identity'):c.validate_issue('corum-xl','2025-T1',['CORUM Origin 1er trimestre 2025'],'quarterly_bulletin')
 def test_wrong_period_rejected(self):
  with self.assertRaisesRegex(ValueError,'issue'):c.validate_issue('corum-origin','2024-T1',['CORUM Origin 1er trimestre 2025 valide 2024'],'quarterly_bulletin')
 def test_contradictory_value_not_certified(self):
  m,_,errors=c.reconcile({'tof':{'value':96.24,'page':1,'text':'TOF 96.24%'}},{'tof':{'value':99,'page':1,'text':'TOF 99%'}})
  self.assertEqual(m,{});self.assertIn('tof:contradictory_engines',errors)
 def test_partial_not_promoted(self):
  m,_,errors=c.reconcile({'tof':{'value':96.24,'page':1,'text':'TOF 96.24%'}},{})
  self.assertFalse(m);self.assertTrue(errors)
 def test_financial_contradiction(self):
  a={k:{'value':v,'page':1,'text':str(v)} for k,v in [('nombre_parts',10),('parts_attente_retrait',11)]}
  with self.assertRaisesRegex(ValueError,'exceeds'):c.reconcile(a,a)
 def test_nonpdf_and_private_hosts(self):
  for url in ['http://www.corum.fr/a.pdf','https://evil.test/a.pdf','https://www.corum.fr@evil.test/a.pdf','https://127.0.0.1/a.pdf']:
   with self.assertRaises(ValueError):c.secure_url(url)
  with self.assertRaises(Exception):c.mupdf(b'<html>not a PDF</html>')
 def test_archive_periods_no_upload_date_inference(self):
  for url,want in [('https://www.corum.fr/sites/default/files/2021-01/CORUM%20BTI%201T16.pdf','2016-T1'),('https://www.corum.fr/sites/default/files/2026-10/CORUM%202026-T3.pdf','2026-T3'),('https://www.corum.fr/sites/default/files/2025-07/Bulletin%20Trimestriel%20T2%202025.pdf','2025-T2')]:self.assertEqual(c.classify(url)[0],want)
 def test_scanned_document_ocr_actual_engine(self):
  import scpi_ocr_worker as ocr
  ocr.LANGUAGES='eng';pdf=self.fixture(scan=True);self.assertFalse(c.mupdf(pdf)[0][0].strip());pages=ocr.extract_pages(pdf)
  self.assertEqual(pages[0]['method'],'tesseract_ocr');self.assertIn('corum origin',ocr.normalized(pages[0]['text']))
 def test_interruption_cache_unchanged(self):
  with tempfile.TemporaryDirectory() as td:
   cache=pathlib.Path(td);item={'slug':'corum-origin','period':'2025-T1','kind':'quarterly_bulletin','url':'https://www.corum.fr/sites/default/files/fixture.pdf'}
   path=cache/(hashlib.sha256(item['url'].encode()).hexdigest()+'.pdf');path.write_bytes(self.fixture())
   a=c.inspect(item,cache);b=c.inspect(item,cache);self.assertEqual(a,b);self.assertEqual(a['status'],'certified_core')
if __name__=='__main__':unittest.main()
