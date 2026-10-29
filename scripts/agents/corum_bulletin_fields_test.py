import unittest,sys
import corum_bulletin_fields as f
class ExtendedFieldsTest(unittest.TestCase):
 def test_capitalisation_preserves_thousands_in_millions(self):
  words=[(10,50,80,60,'Capitalisation'),(10,20,15,30,'1'),(17,20,32,30,'148'),(34,20,70,30,'millions'),(72,20,100,30,"d'euros")]
  a,_=f.extract(['Capitalisation 1 148 millions d’euros'],[words],[400],'2023-T4')
  self.assertEqual(a['capitalisation']['value'],1148)
 def test_eight_mixed_column_corum_capitals_use_only_printed_current_value(self):
  # Publisher PDFs put the current and previous issue columns in one
  # geometry fragment. Neither engine disagreement nor arithmetic inference
  # may become a fabricated capitalisation.
  examples=[
   ('2 940 2 millions d\'euros',2590172,1135,2940),
   ('3 2,3 milliards d\'euros',2650212,1135,3000),
   ('3,1 2,3 milliards d\'euros',2716403,1135,3100),
   ('3,163 2,4 milliards d\'euros',2786554,1135,3163),
   ('1 919 1 millions d\'euros',9842822,195,1919),
   ('2 1,5 milliards d\'euros',10028067,195,2000),
   ('2 1,5 milliards d\'euros',10197718,195,2000),
   ('2,017 1,6 milliards d\'euros',10342271,195,2017),
  ]
  for displayed,shares,price,expected in examples:
   with self.subTest(displayed=displayed):
    evidence={'value':0,'page':4,'text':'Capitalisation en prix de souscription : '+displayed,
      'reference_date':'2024-03-31','unit':'MEUR'}
    data=({'capitalisation':evidence},{'capitalisation'})
    core={'nombre_parts':shares,'prix_souscription':price}
    values,proofs,coverage=f.reconcile_extended(data,data,core)
    self.assertEqual(values['capitalisation'],expected)
    self.assertEqual(coverage['capitalisation'],'verified')
    self.assertIn(str(displayed).split(' ')[0],proofs['capitalisation']['text'])
    self.assertEqual(proofs['capitalisation']['method'],'pdf_page_text_match_issuer_arithmetic_qa')
 def test_capitalisation_uses_dual_reader_extended_price_not_missing_core_price(self):
  for slug,source,shares,price,expected in [
    ('origin',"Capitalisation en prix de souscription : 3,163 2,4 milliards d'euros",2786554,1135,3163),
    ('xl',"Capitalisation en prix de souscription : 2,017 1,6 milliards d'euros",10342271,195,2017),
  ]:
   with self.subTest(fund=slug):
    cap={'value':2400 if slug=='origin' else 1600,'page':3,'text':source,
         'reference_date':'2024-09-30','unit':'MEUR'}
    issuer_price={'value':price,'page':2,'text':'Prix de souscription '+str(price)+' EUR',
                  'reference_date':'2024-09-30','unit':'EUR_PER_PART'}
    a=({'capitalisation':cap,'prix_souscription':issuer_price},{'capitalisation','prix_souscription'})
    metrics,proof,coverage=f.reconcile_extended(a,a,{'nombre_parts':shares})
    self.assertEqual(metrics['capitalisation'],expected)
    self.assertEqual(metrics['prix_souscription'],price)
    self.assertEqual(coverage['capitalisation'],'verified')
    self.assertEqual(proof['capitalisation']['method'],'pdf_page_text_match_issuer_arithmetic_qa')
 def test_ambiguous_capitalization_never_inferred_from_share_price(self):
  evidence={'value':1500,'page':4,'text':"Capitalisation en prix de souscription : 2 1,5 milliards d'euros",
     'reference_date':'2024-03-31','unit':'MEUR'}
  data=({'capitalisation':evidence},{'capitalisation'})
  # Without independently verified shares and price, the current issue
  # cannot be distinguished from the historical adjacent column.
  m,_,status=f.reconcile_extended(data,data,{})
  self.assertNotIn('capitalisation',m)
  self.assertEqual(status['capitalisation'],'needs_review')
  # With two equally plausible source amounts, no inferred value is allowed.
  data2=({'capitalisation':{**evidence,'text':"Capitalisation en prix de souscription : 2,00 2,01 milliards d'euros"}},{'capitalisation'})
  m,_,status=f.reconcile_extended(data2,data2,{'nombre_parts':10200000,'prix_souscription':195})
  self.assertNotIn('capitalisation',m)
  self.assertEqual(status['capitalisation'],'needs_review')
 def test_dates_are_not_bulletin_quarters(self):
  self.assertEqual(f.valuation_date('VALEURS DE RÉFÉRENCE AU 30 JUIN 2026'),'2026-06-30')
  self.assertEqual(f.quarter_date('2026-T3'),'2026-09-30')
  self.assertIsNone(f.valuation_date('T3 2026'))
 def test_engines_must_agree_on_value_and_date(self):
  p={'value':187.67,'page':3,'text':'Valeur de réalisation 187,67 EUR','reference_date':'2026-06-30','unit':'EUR_PER_PART'}
  for change in [{'value':177.04},{'reference_date':'2025-12-31'},{'page':2}]:
   m,_,cov=f.reconcile_extended(({'valeur_realisation':p},{'valeur_realisation'}),({'valeur_realisation':{**p,**change}},{'valeur_realisation'}),{})
   self.assertNotIn('valeur_realisation',m);self.assertEqual(cov['valeur_realisation'],'needs_review')
 def test_missing_debt_never_becomes_zero_or_complete(self):
  m,p,cov=f.reconcile_extended(({},set()),({},set()),{'tof':100,'nombre_parts':10,'parts_attente_retrait':0})
  self.assertNotIn('endettement',m);self.assertEqual(cov['endettement'],'not_extracted');self.assertEqual(cov['tof'],'verified_core')
 def test_footnote_number_does_not_replace_euro_value(self):
  words=[(10,10,30,20,'Valeur'),(32,10,38,20,'de'),(40,10,100,20,'réalisation'),(101,8,104,15,'6'),(110,10,130,20,'(par'),(132,10,150,20,'part)'),(300,10,340,20,'187,67'),(342,10,350,20,'€')]
  a,_=f.extract(['VALEURS DE RÉFÉRENCE AU 30 JUIN 2026'],[words],[400],'2026-T3')
  self.assertEqual(a['valeur_realisation']['value'],187.67);self.assertEqual(a['valeur_realisation']['reference_date'],'2026-06-30')
 def test_future_reference_date_not_published(self):
  words=[(10,10,30,20,'Valeur'),(32,10,38,20,'de'),(40,10,100,20,'réalisation'),(300,10,340,20,'187,67'),(342,10,350,20,'€')]
  a,_=f.extract(['VALEURS DE RÉFÉRENCE AU 31 DÉCEMBRE 2026'],[words],[400],'2026-T3')
  self.assertNotIn('valeur_realisation',a)
if __name__=='__main__':unittest.main()
