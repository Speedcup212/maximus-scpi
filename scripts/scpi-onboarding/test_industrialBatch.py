import hashlib,json,unittest
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch
import fitz
import industrialBatch as batch

class IndustrialBatchTests(unittest.TestCase):
 def test_french_number_has_no_implicit_unit(self):
  self.assertEqual(batch.decimal_value('247 588 480'),'247588480')
  self.assertEqual(batch.decimal_value('247,58848'),'247.58848')
  for raw in ['1.234,56','NaN','1e3','12 %','']:
   with self.assertRaises(ValueError):batch.decimal_value(raw)
 def test_no_private_or_unregistered_redirect(self):
  hosts=['issuer.test']
  for url in ['http://issuer.test/a','https://issuer.test.evil/a','https://u:p@issuer.test/a','https://127.0.0.1/a','https://issuer.test:8443/a']:
   self.assertFalse(batch.allowed(url,hosts))
  redirect=batch.CheckedRedirect(hosts)
  with self.assertRaises(ValueError):redirect.redirect_request(None,None,302,'',{},'https://evil.test/doc.pdf')
 def test_three_issuers_and_no_already_public_pilot(self):
  registry=json.loads(Path(__file__).with_name('fixtures').joinpath('industrial-pilots-20261104.json').read_text())
  self.assertTrue(batch.validate_registry(registry,{'slugs':['sofidynamic']}))
  for change in ['duplicate','issuer','public']:
   r=json.loads(json.dumps(registry));cohort={'slugs':['sofidynamic']}
   if change=='duplicate':r['candidates'][2]['slug']=r['candidates'][1]['slug']
   if change=='issuer':r['candidates'][2]['management_company']=r['candidates'][1]['management_company']
   if change=='public':cohort['slugs'].append(r['candidates'][1]['slug'])
   with self.assertRaises(ValueError):batch.validate_registry(r,cohort)
 def test_missing_docs_never_pass_downstream_stages(self):
  candidate={'slug':'fund','name':'Fund','management_company':'Issuer','issuer_hosts':['issuer.test'],'product_page':'https://issuer.test/fund'}
  with TemporaryDirectory() as d:
   result=batch.run_candidate(candidate,Path(d),lambda url:(b'<html><h1>Fund</h1></html>',url))
  self.assertEqual(result['stages']['discovery']['status'],'BLOCKED')
  self.assertEqual(result['stages']['prepublication']['status'],'BLOCKED')
  self.assertEqual(result['stages']['publication_control']['status'],'DENIED')
  self.assertFalse(result['complete_certification']);self.assertFalse(result['publication_authorized'])
 def test_every_page_including_footnote_is_searched(self):
  pdf=fitz.open();pdf.new_page().insert_text((50,50),'Fund - 340,38 EUR au 30/06/2026; 336,75 au 31/12/2025')
  pdf.new_page().insert_text((50,50),'Footnote: 340,38 EUR. This is test data, not an issuer document.')
  raw=pdf.tobytes();pdf.close()
  hits=batch.inspect_numeric_contexts(raw,'https://issuer.test/doc.pdf',[{'id':'valuation','tokens':['340,38']}])
  self.assertEqual([x['page'] for x in hits],[1,2]);self.assertTrue(all(x['pdf_sha256']==hashlib.sha256(raw).hexdigest() for x in hits))
  self.assertTrue(all(x['financially_certified'] is False for x in hits))
 def test_unregistered_declared_source_never_fetched(self):
  c={'slug':'fund','name':'Fund','management_company':'I','issuer_hosts':['issuer.test'],'product_page':'https://issuer.test/fund','documents':[{'url':'https://evil.test/a.pdf','kind':'quarterly'}]}
  with TemporaryDirectory() as d:
   with self.assertRaisesRegex(ValueError,'UNREGISTERED_DECLARED_DOCUMENT'):batch.run_candidate(c,Path(d),lambda u:(b'<html></html>',u))

if __name__=='__main__':unittest.main()

class SourceBudgetRegression(unittest.TestCase):
 def test_archived_bulletins_cannot_starve_regulatory_documents(self):
  links=[{'kind':'quarterly','url':str(i)} for i in range(50)]
  links += [{'kind':k,'url':k} for k in ['dic','note','statutes','annual']]
  selected=batch.select_documents(links)
  self.assertEqual({d['kind'] for d in selected},{'quarterly','dic','note','statutes','annual'})
  self.assertLessEqual(len(selected),batch.MAX_DOCUMENTS)
 def test_new_quarter_is_detected_from_document_not_forced_to_stale_manifest(self):
  pdf=fitz.open();pdf.new_page().insert_text((50,50),'Fund - Bulletin T3 2026')
  raw=pdf.tobytes();pdf.close()
  self.assertEqual(batch.detected_period(raw,'quarterly','2026-T2'),'2026-T3')
 def test_numeric_substring_is_not_a_financial_fact(self):
  pdf=fitz.open();pdf.new_page().insert_text((50,50),'Directive 2006. Price 200 EUR')
  raw=pdf.tobytes();pdf.close()
  hits=batch.inspect_numeric_contexts(raw,'https://issuer.test/a.pdf',[{'id':'price','tokens':['200']}])
  self.assertEqual(len(hits),1)

class SemiannualPeriodRegression(unittest.TestCase):
 def test_analysis_period_is_not_validity_period(self):
  pdf=fitz.open();pdf.new_page().insert_text((40,40),'Bulletin semestriel - Analyse : 1er janvier au 30 juin 2026 - Validite : 2eme semestre 2026')
  raw=pdf.tobytes();pdf.close()
  self.assertEqual(batch.detected_period(raw,'semiannual','2026-T3'),'2026-S1')
 def test_document_budget_retains_both_semiannual_and_quarterly(self):
  docs=[{'kind':'semiannual','url':str(i)} for i in range(20)]+[{'kind':k,'url':k} for k in ['quarterly','dic','note','statutes','annual']]
  self.assertEqual({d['kind'] for d in batch.select_documents(docs)},{'semiannual','quarterly','dic','note','statutes','annual'})

class ScalabilityRegression(unittest.TestCase):
 def test_registry_accepts_one_hundred_without_enforcing_three_pilot_contract(self):
  candidates=[{'slug':'candidate-'+str(i),'name':'Candidate '+str(i),'management_company':'Issuer','issuer_hosts':['issuer.test'],'product_page':'https://issuer.test/fund/'+str(i)} for i in range(100)]
  self.assertTrue(batch.validate_registry({'schema_version':1,'candidates':candidates},{'slugs':[]}))

class DocumentaryMeaningRegression(unittest.TestCase):
 def test_esg_annual_report_cannot_replace_financial_annual_report(self):
  self.assertIsNone(batch.document_kind('https://issuer.test/Sofidy_ISR_SOFIDYNAMIC_2025.pdf','Rapport annuel ISR 2025'))
  self.assertEqual(batch.document_kind('https://issuer.test/fund-rapport-annuel-2025.pdf','Rapport annuel 2025'),'annual')
 def test_generic_data_attributes_are_discovered_without_issuer_specific_code(self):
  page=batch.parse_html(b'<button data-document-url="https://issuer.test/DIC-fund.pdf" title="DIC Fund">Download</button>','https://issuer.test/fund')
  self.assertEqual(page['links'][0]['url'],'https://issuer.test/DIC-fund.pdf')

class RetryBudgetRegression(unittest.TestCase):
 def test_forbidden_source_does_not_retry_and_transient_error_stops_at_two(self):
  import urllib.error
  from unittest.mock import Mock
  for status,expected in [(403,1),(503,2)]:
   t=batch.Transport.__new__(batch.Transport);t.hosts=['issuer.test'];t.attempts=[]
   t.opener=Mock();t.opener.open.side_effect=urllib.error.HTTPError('https://issuer.test/a',status,'error',{},None)
   with patch('industrialBatch.time.sleep'):
    with self.assertRaises(urllib.error.HTTPError):t('https://issuer.test/a')
   self.assertEqual(len(t.attempts),expected)
