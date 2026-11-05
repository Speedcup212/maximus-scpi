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
 def test_dic_underscore_filename_on_issuer_page_is_recovered(self):
  name='https://corpocdn.blob.core.windows.net/blobfiles/2026_09_22_DIC_CRISTAL_CARE.pdf'
  self.assertEqual(batch.document_kind(name,''),'dic')
  self.assertEqual(batch.document_kind(name,'Document d’informations clés'),'dic')
  self.assertIsNone(batch.document_kind('https://issuer.test/undocumented.pdf',''))
  self.assertTrue(batch.allowed(name,['corpocdn.blob.core.windows.net']))
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

class LatestOfficialPeriodRegression(unittest.TestCase):
 def test_only_verified_financial_bulletins_establish_the_latest_period(self):
  v=lambda kind,period,ok=True:{'kind':kind,'reference_period':period,
    'status':'BINARY_IDENTITY_PERIOD_VERIFIED_ONLY' if ok else 'UNVERIFIED'}
  self.assertIsNone(batch.latest_verified_reporting_period([v('dic','2026-REG')]))
  self.assertEqual(batch.latest_verified_reporting_period([
   v('quarterly','2026-T1'),v('quarterly','2026-T3',False),v('semiannual','2026-S1')]),'2026-S1')
  self.assertEqual(batch.latest_verified_reporting_period([
   v('quarterly','2026-T2'),v('quarterly','2026-T3')]),'2026-T3')
  self.assertIsNone(batch.latest_verified_reporting_period([
   v('quarterly','2026-T2'),v('semiannual','2026-S1')]))

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
 def test_registry_accepts_two_hundred_without_enforcing_three_pilot_contract(self):
  candidates=[{'slug':'candidate-'+str(i),'name':'Candidate '+str(i),'management_company':'Issuer','issuer_hosts':['issuer.test'],'product_page':'https://issuer.test/fund/'+str(i)} for i in range(200)]
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

class SharedFinancialParserRegression(unittest.TestCase):
 def test_resume_uses_only_cursor_and_rejects_changed_registry_or_fabricated_cursor(self):
  raw=b'{"candidates":[]}'
  checkpoint={'registry_sha256':hashlib.sha256(raw).hexdigest(),'next_offset':5}
  self.assertEqual(batch.resume_offset(raw,checkpoint,200),5)
  with self.assertRaises(ValueError):batch.resume_offset(raw+b' ',checkpoint,200)
  for cursor in [None,-1,201,True]:
   with self.assertRaises(ValueError):batch.resume_offset(raw,{**checkpoint,'next_offset':cursor},200)
 def test_200_identities_are_sliced_without_loss_or_duplicate_and_invalid_bounds_fail(self):
  candidates=[{'slug':'fund-'+str(i)} for i in range(200)]
  slices=[batch.select_candidates(candidates,offset,5) for offset in range(0,200,5)]
  self.assertEqual([x for part in slices for x in part],candidates)
  self.assertEqual(len(slices),40)
  for offset,limit in [(-1,5),(200,5),(0,0),(0,21),(False,5)]:
   with self.assertRaises(ValueError):batch.select_candidates(candidates,offset,limit)
 def test_anomalies_are_classified_without_claiming_official_unavailability_or_fixing_numbers(self):
  r={'slug':'fund','blockers':['MISSING_VERIFIED_STATUTES','MISSING_VERIFIED_DIC','FIELD_LEVEL_FINANCIAL_QA_REQUIRED','AUTHENTICATED_SIX_SURFACE_PREFLIGHT_REQUIRED'],'documents':[],
   'attempts':[{'url':'https://issuer.test/a','status':503},{'url':'https://issuer.test/a','status':200}]}
  ledger=batch.anomaly_ledger(r)
  self.assertEqual([x['category'] for x in ledger['anomalies']],['DOCUMENTARY','DOCUMENTARY','FINANCIAL','TECHNICAL'])
  self.assertEqual(ledger['anomalies'][0]['availability'],'NOT_OBTAINED_NOT_OFFICIALLY_UNAVAILABLE')
  self.assertEqual(ledger['anomalies'][0]['factual_publication_effect'],'ASSESS_EXISTING_PROGRESSIVE_POLICY_WITH_DISCLOSURE')
  self.assertEqual(ledger['anomalies'][1]['factual_publication_effect'],'BLOCK_UNTIL_VERIFIED')
  self.assertEqual(ledger['automatic_recovery_count'],1)
  self.assertFalse(ledger['automatic_recoveries'][0]['financial_values_changed'])
  self.assertFalse(ledger['publication_authorized'])
  self.assertEqual(batch.anomaly_ledger({'slug':'fund','attempts':[]})['automatic_recovery_count'],0)
 def test_withdrawal_explanation_cannot_label_subscription_price_even_with_two_readers(self):
  f=batch.bulletin_fields
  words=[(10,10,120,20,'PRIX DE RETRAIT'),(10,25,100,35,'313,6 €'),(10,40,130,50,'au prix de souscription,')]
  extracted=f.extract(['PRIX DE RETRAIT 313,6 € au prix de souscription,'],[words],[400],'2026-T3')
  metrics,proofs,coverage,_=f.reconcile(extracted,extracted)
  self.assertNotIn('prix_souscription',metrics)
  self.assertEqual(coverage['prix_souscription'],'needs_review')
  self.assertEqual(metrics['prix_retrait'],313.6)
  # The genuine labelled subscription figure is still accepted.
  real=[(10,10,150,20,'PRIX DE SOUSCRIPTION 320 €')]
  parsed=f.extract(['PRIX DE SOUSCRIPTION 320 €'],[real],[400],'2026-T3')
  self.assertEqual(f.reconcile(parsed,parsed)[0]['prix_souscription'],320)
 def test_same_existing_geometry_parser_supports_semester_without_faking_quarter(self):
  self.assertEqual(batch.bulletin_fields.end_date('2026-S1'),'2026-06-30')
  self.assertEqual(batch.bulletin_fields.end_date('2026-S2'),'2026-12-31')
  self.assertEqual(batch.bulletin_fields.end_date('2026-T3'),'2026-09-30')
  self.assertIsNone(batch.bulletin_fields.end_date('2026-S3'))

class RetainedOfficialSourceRegression(unittest.TestCase):
 def test_only_primary_link_provenance_is_retained_and_never_becomes_certification(self):
  c={'slug':'fund','name':'Fund','management_company':'Issuer','issuer_hosts':['issuer.test'],'product_page':'https://issuer.test/fund'}
  d={'kind':'note','reference_period':'2026-REG','url':'https://issuer.test/ni.pdf','status':'BINARY_IDENTITY_PERIOD_VERIFIED_ONLY','publisher_page':c['product_page'],'publisher_page_sha256':'a'*64,'sha256':'b'*64}
  registry={'schema_version':1,'candidates':[c]}
  retained=batch.retain_official_links(registry,[{'slug':'fund','documents':[d]}])
  self.assertEqual(len(retained['candidates'][0]['documents']),1)
  self.assertNotIn('certification',retained['candidates'][0]['documents'][0])
  self.assertNotIn('documents',registry['candidates'][0])
  for patch_ in [{'url':'https://evil.test/doc.pdf'},{'publisher_page':'https://evil.test/fund'},{'publisher_page_sha256':'bad'},{'status':'UNVERIFIED'}]:
   self.assertEqual(batch.retain_official_links(registry,[{'slug':'fund','documents':[{**d,**patch_}]}])['candidates'][0]['documents'],[])
 def test_retained_pdf_is_redownloaded_when_product_page_fails(self):
  import urllib.error
  from test_publisherPdfAudit import pdf_bytes
  c={'slug':'fund','name':'Fund','management_company':'Issuer','issuer_hosts':['issuer.test'],'product_page':'https://issuer.test/fund','regulatory_period':'2026-REG','documents':[{'kind':'note','reference_period':'2026-REG','url':'https://issuer.test/note.pdf'}]}
  calls=[]
  raw=pdf_bytes("FUND Note d'information 2026")
  def fetch(url):
   calls.append(url)
   if url==c['product_page']:raise urllib.error.HTTPError(url,403,'Forbidden',{},None)
   return raw,url
  with TemporaryDirectory() as tmp:
   r=batch.run_candidate(c,Path(tmp),fetch)
  self.assertEqual(calls,[c['product_page'],'https://issuer.test/note.pdf'])
  self.assertEqual(r['documents'][0]['status'],'BINARY_IDENTITY_PERIOD_VERIFIED_ONLY')
  self.assertFalse(r['publication_authorized']);self.assertEqual(r['status'],'BLOCKED')

class SharedCaptionRegression(unittest.TestCase):
 def test_identical_observations_on_multiple_pages_are_corroboration_not_contradiction(self):
  f=batch.bulletin_fields
  v={'value':180,'page':3,'reference_date':'2026-06-30','unit':'EUR_PER_PART','definition':'reported_metric','text':'Prix de souscription 180 EUR'}
  both=({'prix_souscription':[v,{**v,'page':6}]},{'prix_souscription'})
  self.assertEqual(f.reconcile(both,both)[0]['prix_souscription'],180)
  wrong=({'prix_souscription':[v,{**v,'page':6,'value':181}]},{'prix_souscription'})
  self.assertNotIn('prix_souscription',f.reconcile(wrong,wrong)[0])
  wrong_unit=({'prix_souscription':[{**v,'unit':'MEUR'}]},{'prix_souscription'})
  self.assertNotIn('prix_souscription',f.reconcile(both,wrong_unit)[0])
 def test_wrapped_occupancy_caption_keeps_the_actual_percentage(self):
  words=[(10,10,35,20,'Taux'),(10,22,100,32,"d'occupation"),(10,34,100,44,'financier (TOF)'),(10,49,90,59,'98,78 %')]
  f=batch.bulletin_fields
  parsed=f.extract(['Taux occupation financier 98,78 %'],[words],[400],'2026-T2')
  self.assertEqual(f.reconcile(parsed,parsed)[0]['tof'],98.78)


class PreviousBinaryEvidenceIsNotCertification(unittest.TestCase):
 def test_prior_supabase_dic_proof_does_not_remove_current_download_blocker(self):
  candidate={'slug':'opus-real','name':'Opus Real','management_company':'BNP Paribas REIM France',
      'issuer_hosts':['reim.bnpparibas-am.com'],'product_page':'https://reim.bnpparibas-am.com/fund'}
  old={'scpi_slug':'opus-real','origin_table':'regulatory_documents','document_kind':'dic',
      'source_url':'https://reim.bnpparibas-am.com/docs/opus-dic.pdf','pdf_sha256':'a'*64,
      'identity_verified':True,'kind_verified':True,'verified_at':'2026-10-15'}
  self.assertEqual(len(batch.prior_binary_evidence(candidate,[old])),1)
  for change in [{'source_url':'https://evil.example/false.pdf'},{'kind_verified':False},
                 {'pdf_sha256':'bad'},{'scpi_slug':'other'}]:
   self.assertEqual(batch.prior_binary_evidence(candidate,[{**old,**change}]),[])
  with TemporaryDirectory() as d:
   result=batch.run_candidate(candidate,Path(d),lambda u:(b'<html><h1>Opus Real</h1></html>',u),
                              observed_sources=[old])
  self.assertIn('MISSING_VERIFIED_DIC',result['blockers'])
  entry=next(x for x in result['anomaly_ledger']['anomalies'] if x['code']=='MISSING_VERIFIED_DIC')
  self.assertEqual(len(entry['prior_binary_evidence']),1)
  self.assertFalse(entry['prior_is_current_certification'])
  self.assertFalse(result['complete_certification'])
  self.assertFalse(result['publication_authorized'])


class CrashTestRECOVERY094(unittest.TestCase):
 """Adversarial cases on the ACTUAL documentary engine; zero network access."""
 def test_prior_annual_2025_real_source_is_not_lost_to_invalid_regex(self):
  candidate={'slug':'opus-real','issuer_hosts':['issuer.test']}
  base={'scpi_slug':'opus-real','origin_table':'pdf_validation','document_kind':'annual_report',
        'source_url':'https://issuer.test/ra-2025.pdf','pdf_sha256':'a'*64,
        'identity_verified':True,'kind_verified':True,'reference_period':'2025-RA'}
  hits=batch.prior_binary_evidence(candidate,[base])
  self.assertEqual(len(hits),1)
  self.assertFalse(hits[0]['financially_certified'])
  for period in ['2025-T4','2026-S1','2025-RAX','garbage']:
   self.assertEqual(batch.prior_binary_evidence(candidate,[{**base,'reference_period':period}]),[])

 def test_latest_second_statutes_does_not_starve_under_ten_document_budget(self):
  kinds=['quarterly','semiannual','dic','note','statutes','annual']
  docs=[{'kind':kind,'url':f'https://issuer.test/{kind}-old.pdf'} for kind in kinds]
  docs += [{'kind':kind,'url':f'https://issuer.test/{kind}-current.pdf'} for kind in kinds]
  picked=batch.select_documents(docs)
  self.assertEqual(len(picked),batch.MAX_DOCUMENTS)
  self.assertIn('https://issuer.test/statutes-current.pdf',[d['url'] for d in picked])
  self.assertIn('https://issuer.test/quarterly-current.pdf',[d['url'] for d in picked])
  self.assertEqual(set(kinds),{d['kind'] for d in picked})

 def test_observed_database_certificate_is_only_a_lead_never_an_approval(self):
  candidate={'slug':'fund','name':'Fund','management_company':'Issuer',
    'issuer_hosts':['issuer.test'],'product_page':'https://issuer.test/fund'}
  forged={'scpi_slug':'fund','origin_table':'regulatory_documents','document_kind':'statutes',
    'source_url':'https://issuer.test/statutes.pdf','pdf_sha256':'a'*64,
    'identity_verified':True,'kind_verified':True,'verified_at':'2026-11-05'}
  with TemporaryDirectory() as tmp:
   report=batch.run_candidate(candidate,Path(tmp),lambda _: (b'<html><h1>Fund</h1></html>','https://issuer.test/fund'),
                              observed_sources=[forged])
  self.assertIn('MISSING_VERIFIED_STATUTES',report['blockers'])
  self.assertEqual(report['anomaly_ledger']['unresolved_count'],len(report['blockers']))
  self.assertEqual(report['stages']['publication_control']['status'],'DENIED')
  self.assertFalse(report['complete_certification'])
  self.assertFalse(report['publication_authorized'])

 def test_corrupt_pdf_does_not_trigger_source_validation_or_financial_certification(self):
  candidate={'slug':'fund','name':'Fund','management_company':'Issuer',
    'issuer_hosts':['issuer.test'],'product_page':'https://issuer.test/fund',
    'documents':[{'kind':'quarterly','reference_period':'2026-T3',
                  'url':'https://issuer.test/Bulletin-Fund-2026-T3.pdf'}]}
  def respond(url):
   if url.endswith('.pdf'):return b'%PDF-1.7\\nnot a valid PDF binary',url
   return b'<html><h1>Fund</h1></html>',url
  with TemporaryDirectory() as tmp: report=batch.run_candidate(candidate,Path(tmp),respond)
  self.assertEqual(report['stages']['download']['status'],'BLOCKED')
  self.assertIn('MISSING_VERIFIED_QUARTERLY',report['blockers'])
  self.assertFalse(report['publication_authorized'])
  self.assertFalse(report['complete_certification'])

 def test_conflicting_quarters_on_cover_do_not_pick_the_more_profitable_period(self):
  pdf=fitz.open();pdf.new_page().insert_text((40,40),'SCPI Fund Bulletin T2 2026 et T3 2026')
  raw=pdf.tobytes();pdf.close()
  with self.assertRaises(ValueError):batch.detected_period(raw,'quarterly','2026-T3')

 def test_source_host_and_redirect_attacks_never_leave_allowlist(self):
  hosts=['issuer.test']
  for url in ['https://issuer.test.evil.test/doc.pdf','https://evil.test@issuer.test/doc.pdf',
              'https://issuer.test:444/doc.pdf','file:///etc/passwd',
              'http://issuer.test/doc.pdf','https://127.0.0.1/doc.pdf']:
   self.assertFalse(batch.allowed(url,hosts),msg=url)
  for host in ['https://evil.test/doc.pdf','http://issuer.test/doc.pdf']:
   with self.assertRaises(ValueError):
    batch.CheckedRedirect(hosts).redirect_request(None,None,302,'',{},host)

 def test_checkpoint_rejects_tampered_hash_and_cursor_after_crash(self):
  registry=b'{"schema_version":1,"candidates":[{"slug":"fund"}]}'
  valid={'registry_sha256':hashlib.sha256(registry).hexdigest(),'next_offset':1}
  self.assertEqual(batch.resume_offset(registry,valid,2),1)
  for modified in [registry+b' ',registry.replace(b'fund',b'evil')]:
   with self.assertRaises(ValueError):batch.resume_offset(modified,valid,2)
  for cursor in [3,-1,'1',None,True]:
   with self.assertRaises(ValueError):batch.resume_offset(registry,{**valid,'next_offset':cursor},2)

 def test_missing_document_remains_unknown_not_officially_unavailable(self):
  ledger=batch.anomaly_ledger({'slug':'fund','blockers':['MISSING_VERIFIED_DIC',
    'MISSING_VERIFIED_STATUTES','ACCOUNTABLE_RELEASE_REVIEW_REQUIRED']})
  for item in ledger['anomalies'][:2]:
   self.assertEqual(item['availability'],'NOT_OBTAINED_NOT_OFFICIALLY_UNAVAILABLE')
   self.assertFalse(item['automatic_correction_applied'])
   self.assertFalse(item['publication_authorized'])
  self.assertFalse(ledger['publication_authorized'])



class CapitalizationPrecisionRegression(unittest.TestCase):
 def fixture(self, exact=268.863422,rounded=269,date='2026-09-30'):
  base={'unit':'MEUR','reference_date':date,'definition':'reported_metric','association':'adjacent_caption'}
  precise={**base,'value':exact,'page':5,'text':'CAPITALISATION | 268 863 422 €'}
  display={**base,'value':rounded,'page':1,'text':'CAPITALISATION | 269 M€'}
  return precise,display
 def test_exact_eur_and_rounded_million_are_not_two_different_capitalizations(self):
  f=batch.bulletin_fields
  precise,display=self.fixture()
  both=({'capitalisation':[display,precise]},{'capitalisation'})
  metrics,proof,coverage,candidates=f.reconcile(both,both)
  self.assertAlmostEqual(metrics['capitalisation'],268.863422)
  self.assertEqual(coverage['capitalisation'],'verified')
  self.assertEqual(proof['capitalisation']['page'],5)
  self.assertEqual(proof['capitalisation']['rounded_summary_confirmation']['value_million_eur'],269)
  self.assertNotIn('capitalisation',candidates)
 def test_previous_quarter_precision_also_reconciles(self):
  f=batch.bulletin_fields
  precise,display=self.fixture(247.58848,248,'2026-06-30')
  precise['text']='CAPITALISATION | 247 588 480 €'
  display['text']='CAPITALISATION | 248 M€'
  rows=({'capitalisation':[display,precise]},{'capitalisation'})
  self.assertAlmostEqual(f.reconcile(rows,rows)[0]['capitalisation'],247.58848)
 def test_conflict_or_different_date_or_one_reader_only_never_passes(self):
  f=batch.bulletin_fields
  precise,display=self.fixture()
  for changed in [
   [{**precise,'value':267.863422},display],
   [precise,{**display,'reference_date':'2026-06-30'}],
   [precise,{**display,'value':270}],
  ]:
   input_=({'capitalisation':changed},{'capitalisation'})
   self.assertNotIn('capitalisation',f.reconcile(input_,input_)[0])
  first=({'capitalisation':[display,precise]},{'capitalisation'})
  second=({'capitalisation':[precise]},{'capitalisation'})
  self.assertNotIn('capitalisation',f.reconcile(first,second)[0])


class WithdrawalQueueSemanticRegression(unittest.TestCase):
 def page(self,retired='822',pending='0'):
  pdf=fitz.open()
  page=pdf.new_page()
  page.insert_text((420,120),retired+'\nPARTS RETIRÉES',fontsize=12)
  page.insert_text((420,200),pending+'\nPARTS EN ATTENTE',fontsize=12)
  raw=pdf.tobytes();pdf.close()
  return raw
 def test_retired_shares_are_not_zero_when_awaiting_withdrawal_is_zero(self):
  raw=self.page()
  candidates=batch.block_verified_share_counts(raw)
  self.assertEqual(candidates['retraits_executes_trimestre'][0]['value'],822)
  self.assertEqual(candidates['parts_attente_retrait'][0]['value'],0)
  metrics={'retraits_executes_trimestre':0,'parts_attente_retrait':0}
  proofs={k:{'value':v} for k,v in metrics.items()}
  coverage={k:'verified' for k in metrics}
  alternatives={}
  batch.guard_share_caption_meaning(raw,metrics,proofs,coverage,alternatives)
  self.assertNotIn('retraits_executes_trimestre',metrics)
  self.assertEqual(metrics['parts_attente_retrait'],0)
  self.assertEqual(coverage['retraits_executes_trimestre'],'needs_review')
  self.assertEqual(alternatives['retraits_executes_trimestre']['rejected_dual_reader_value'],0)
  self.assertEqual(alternatives['retraits_executes_trimestre']['explicit_source_block'][0]['value'],822)
 def test_exact_matching_caption_retains_verified_values(self):
  raw=self.page('822','0')
  m={'retraits_executes_trimestre':822,'parts_attente_retrait':0}
  p={k:{} for k in m};c={k:'verified' for k in m};alt={}
  batch.guard_share_caption_meaning(raw,m,p,c,alt)
  self.assertEqual(m,{'retraits_executes_trimestre':822,'parts_attente_retrait':0})
  self.assertEqual(alt,{})
 def test_conflicting_count_blocks_are_not_promoted(self):
  pdf=fitz.open();p=pdf.new_page()
  p.insert_text((400,90),'822\nPARTS RETIRÉES',fontsize=12)
  p.insert_text((400,180),'823\nPARTS RETIRÉES',fontsize=12)
  raw=pdf.tobytes();pdf.close()
  m={'retraits_executes_trimestre':822}
  batch.guard_share_caption_meaning(raw,m,{}, {}, {})
  self.assertNotIn('retraits_executes_trimestre',m)


class RegisteredQuarterSourceSelectionRegression(unittest.TestCase):
 def test_pinned_current_and_prior_quarters_beat_undated_legacy_link(self):
  docs=[
   {'kind':'quarterly','url':'https://issuer.test/march-undated.pdf'},
   {'kind':'dic','url':'https://issuer.test/dic.pdf'},
   {'kind':'note','url':'https://issuer.test/note.pdf'},
   {'kind':'statutes','url':'https://issuer.test/statutes.pdf'},
   {'kind':'annual','url':'https://issuer.test/annual.pdf'},
   {'kind':'quarterly','reference_period':'2026-T3','url':'https://issuer.test/t3.pdf','previous_pdf_sha256':'a'*64},
   {'kind':'quarterly','reference_period':'2026-T2','url':'https://issuer.test/t2.pdf','previous_pdf_sha256':'b'*64}
  ]
  selected=batch.select_documents(docs)
  quarters=[d['url'] for d in selected if d['kind']=='quarterly']
  self.assertEqual(quarters,['https://issuer.test/t3.pdf','https://issuer.test/t2.pdf'])
  self.assertNotIn('https://issuer.test/march-undated.pdf',quarters)
  for k in ['dic','note','statutes','annual']:
   self.assertIn(k,[d['kind'] for d in selected])
 def test_semester_period_order_never_confuses_previous_and_current(self):
  docs=[
   {'kind':'semiannual','url':'https://issuer.test/undated.pdf'},
   {'kind':'semiannual','url':'https://issuer.test/s2-2025.pdf','reference_period':'2025-S2'},
   {'kind':'semiannual','url':'https://issuer.test/s1-2026.pdf','reference_period':'2026-S1'},
   {'kind':'semiannual','url':'https://issuer.test/s2-2026.pdf','reference_period':'2026-S2'},
  ]
  expected=['https://issuer.test/s2-2026.pdf','https://issuer.test/s1-2026.pdf']
  self.assertEqual([x['url'] for x in batch.select_documents(docs)],expected)
 def test_unknown_only_preserves_discovery_order_and_does_not_certify(self):
  docs=[{'kind':'quarterly','url':f'https://issuer.test/old-{n}.pdf'} for n in range(3)]
  self.assertEqual([x['url'] for x in batch.select_documents(docs)],
                   [x['url'] for x in docs[:2]])


class DicDocumentarySemanticsRegression(unittest.TestCase):
 """Source captions only. Passing a parser is never an independent DIC review."""
 def pdf(self,*pages):
  pdf=fitz.open()
  for lines in pages:
   page=pdf.new_page()
   for idx,line in enumerate(lines):
    page.insert_text((35,70+idx*30),line,fontsize=10)
  raw=pdf.tobytes();pdf.close()
  return raw
 def test_precise_dated_risk_article_horizon_and_suspension_are_only_proposals(self):
  raw=self.pdf([
   'Ce produit a ete categorise dans la classe de risque 3 sur 7.',
   'La duree de placement recommandee est fixee a 10 ans.',
   'La societe de gestion a decide une suspension temporaire de la variabilite du capital.',
  ],[
   'La SCPI releve de l article 8 du reglement (UE) 2019/2088 dit SFDR.',
  ])
  result=batch.dic_source_disclosures(raw)
  self.assertEqual(result['fields']['sri']['value'],3)
  self.assertEqual(result['fields']['recommended_holding_years']['value'],10)
  self.assertEqual(result['fields']['sfdr_article']['value'],8)
  self.assertTrue(result['suspended_capital_mentioned_in_pdf'])
  self.assertEqual(result['suspension_mention_pages'],[1])
  self.assertEqual(result['pdf_sha256'],hashlib.sha256(raw).hexdigest())
  self.assertFalse(result['legal_review_passed'])
  self.assertFalse(result['financially_certified'])
  self.assertFalse(result['publication_authorized'])
 def test_incorrectly_inferred_risk_from_number_slider_or_random_sfdr_article_is_not_allowed(self):
  raw=self.pdf(['Indicateur de risque 1 2 3 4 5 6 7',
                'La SCPI investit dans l article 8 du code civil.',
                'Les pertes potentielles sont elevees.'])
  result=batch.dic_source_disclosures(raw)
  self.assertNotIn('sri',result['fields'])
  self.assertNotIn('sfdr_article',result['fields'])
  self.assertEqual(result['status'],'SOURCE_PROPOSALS_WITH_RESERVES')
  self.assertIn('sri:NOT_UNAMBIGUOUSLY_FOUND',result['issues'])
 def test_conflicting_risk_source_pages_are_not_reduced_to_one_fake_qa_pass(self):
  raw=self.pdf(['La classe de risques 3 sur 7 est indiquee.'],
               ['La classe de risque 4 sur 7 est indiquee.'])
  result=batch.dic_source_disclosures(raw)
  self.assertNotIn('sri',result['fields'])
  self.assertIn('sri:CONFLICTING_EXPLICIT_SOURCE_VALUES',result['issues'])
  self.assertFalse(result['sfdr_classification_certified'])
 def test_reject_nonpdf_and_too_short_pdf_without_source_proposals(self):
  with self.assertRaisesRegex(ValueError,'INVALID_DIC_BINARY'):
   batch.dic_source_disclosures(b'<html>login required</html>')
  with self.assertRaisesRegex(ValueError,'INVALID_DIC_BINARY'):
   batch.dic_source_disclosures(b'%PDF'+b'X'*(batch.MAX_BYTES+1))
