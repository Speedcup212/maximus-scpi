import pathlib,sys,tempfile,unittest,io,urllib.error
from unittest.mock import patch
sys.path.insert(0,str(pathlib.Path(__file__).parent))
import bulletin_fields as fields
import bulletin_complete_pipeline as replay

def words(lines):
    out=[]
    for y,t in lines:
        x=40
        for w in t.split():
            width=max(len(w)*5,5);out.append((x,y,x+width,y+10,w));x+=width+4
    return out

class FinancialAssociationTests(unittest.TestCase):
    def parse(self,lines):
        ws=words(lines);return fields.extract([' '.join(t for _,t in lines)],[ws],[595],'2026-T3')
    def test_valuation_keeps_actual_reference_date(self):
        h,_=self.parse([(20,'Valeurs de référence au 30/06/2026'),(40,'Valeur de reconstitution 216,34 €')])
        self.assertEqual(h['prix_reconstitution'][0]['value'],216.34)
        self.assertEqual(h['prix_reconstitution'][0]['reference_date'],'2026-06-30')
    def test_no_valuation_date_is_not_current_quarter(self):
        h,_=self.parse([(40,'Valeur de reconstitution 216,34 €')]);self.assertNotIn('prix_reconstitution',h)
    def test_editorial_percentage_is_not_tof(self):
        h,_=self.parse([(20,'La situation reste stable avec un taux d’occupation financier'),(40,'et 7,40 % sur ces nouvelles acquisitions')])
        self.assertNotIn('tof',h)
    def test_pedagogical_figure_is_not_reconstitution(self):
        h,_=self.parse([(20,'Valeurs au 31/12/2025'),(40,'MIEUX COMPRENDRE LA VALEUR DE RECONSTITUTION'),(60,'130,07 €')])
        self.assertNotIn('prix_reconstitution',h)
    def test_share_count_does_not_borrow_shareholders(self):
        h,_=self.parse([(20,'NOMBRE DE PARTS'),(40,'NOMBRE D’ASSOCIÉS 4321')]);self.assertNotIn('nombre_parts',h)
    def test_fee_net_of_fees_note_is_not_fee_rate(self):
        h,_=self.parse([(20,'Tous les montants sont nets de frais de gestion mais bruts de fiscalité.'),(40,'0,62 %')]);self.assertNotIn('frais_gestion',h)
    def test_two_readers_disagreement_stays_review(self):
        a=self.parse([(20,'TOF 99,12 %')]);b=self.parse([(20,'TOF 99,72 %')])
        m,p,c,_=fields.reconcile(a,b);self.assertNotIn('tof',m);self.assertEqual(c['tof'],'needs_review')
    def test_neighboring_table_counts_must_not_be_concatenated(self):
        a=self.parse([(20,'TOF 90,20 %'),(40,'Parts en attente de retrait 2 703 162 957 003 057 800')])
        m,proof,coverage,_=fields.reconcile(a,a)
        self.assertEqual(m['tof'],90.2)
        self.assertNotIn('parts_attente_retrait',m)
        self.assertEqual(coverage['parts_attente_retrait'],'needs_review')
    def test_large_but_valid_share_count_retained(self):
        a=self.parse([(20,'Nombre de parts 3 835 627')])
        m,_,coverage,_=fields.reconcile(a,a)
        self.assertEqual(m['nombre_parts'],3835627)
        self.assertEqual(coverage['nombre_parts'],'verified')
    def test_zero_queue_is_explicit_and_not_imputed(self):
        a=self.parse([(20,'Parts en attente de retrait 0')]);m,p,c,_=fields.reconcile(a,a)
        self.assertEqual(m['parts_attente_retrait'],0)
        a=self.parse([(20,'Bulletin sans donnée de liquidité')]);m,p,c,_=fields.reconcile(a,a)
        self.assertNotIn('parts_attente_retrait',m)
    def test_number_of_subscribed_shares_is_not_stock(self):
        h,_=self.parse([(20,'Nombre de parts souscrites 134')]);self.assertNotIn('nombre_parts',h)
    def test_multi_date_table_is_not_flattened(self):
        a=self.parse([(20,'31/12/2025 30/06/2026'),(40,'Valeur de réalisation 177,04 € 187,67 €')]);m,_,_,_=fields.reconcile(a,a)
        self.assertNotIn('valeur_realisation',m)

class OptionalMetricStatusTests(unittest.TestCase):
    def test_absent_metric_is_not_an_extraction_error(self):
        a=fields.extract(['Bulletin trimestriel informations générales'],[words([(20,'Bulletin trimestriel informations générales')])],[595],'2026-T3')
        _,_,coverage,_=fields.reconcile(a,a)
        self.assertEqual(coverage['prix_reconstitution'],'not_found_after_full_read')
        self.assertEqual(sum(s not in ('verified','not_found_after_full_read') for s in coverage.values()),0)
    def test_all_absent_values_never_form_a_financial_certificate(self):
        self.assertFalse(replay.has_verified_financial_core({'prix_reconstitution':'not_found_after_full_read','tof':'not_found_after_full_read'}))
        self.assertFalse(replay.has_verified_financial_core({'capital_type':'needs_review'}))
        self.assertTrue(replay.has_verified_financial_core({'tof':'verified','prix_reconstitution':'not_found_after_full_read'}))
    def test_present_but_unresolved_metric_stays_blocking(self):
        a=fields.extract(['TOF 99,12 %'],[words([(20,'TOF 99,12 %')])],[595],'2026-T3')
        b=fields.extract(['TOF 99,72 %'],[words([(20,'TOF 99,72 %')])],[595],'2026-T3')
        _,_,coverage,_=fields.reconcile(a,b)
        self.assertEqual(coverage['tof'],'needs_review')
        self.assertEqual(sum(s not in ('verified','not_found_after_full_read') for s in coverage.values()),1)

class OfficialArchiveMigrationTests(unittest.TestCase):
    def test_nine_praemia_quarters_have_exact_primary_publisher_pdf_urls(self):
        import re, urllib.parse
        migration=(pathlib.Path(__file__).resolve().parents[2]/
                   'supabase/migrations/20261029102000_praemia_9_exact_quarterly_issuers.sql').read_text()
        rows=re.findall(r"\('(primovie|patrimmo-commerce)','(20\d{2}-T[1-4])','(https://[^']+)'\)",migration)
        self.assertEqual(len(rows),9)
        self.assertEqual(len(set((fund,period) for fund,period,_ in rows)),9)
        for fund,period,url in rows:
            parsed=urllib.parse.urlsplit(url)
            self.assertEqual(parsed.hostname,'www.praemiareim.fr')
            self.assertEqual(parsed.scheme,'https')
            self.assertIn('.pdf/',urllib.parse.unquote(parsed.path))
            self.assertIn('_T'+period[-1]+'_'+period[:4],urllib.parse.unquote(parsed.path))
            self.assertNotIn('scpi-lab',url.lower())
    def test_historical_tof_repair_requires_exact_issuer_and_two_pdf_engines(self):
        migration=(pathlib.Path(__file__).resolve().parents[2]/
                   'supabase/migrations/20261029104000_patrimmo_exact_quarter_tof_certification.sql').read_text()
        for period in ('2025-T3','2025-T4','2026-T1'):
            self.assertIn("'"+period+"'::text",migration)
        for guard in ("d.result->>'identity_verified'","d.result->>'period_verified'",
                      "'[\"MuPDF\",\"Poppler\"]'::jsonb","d.evidence->'tof'->>'page'",
                      "d.pdf_sha256 !~","scpi_replay_provenance_quarantine"):
            self.assertIn(guard,migration)

class FirstPartyAffiliateSourcePolicyTests(unittest.TestCase):
    def test_only_two_exact_issuer_group_documents_are_whitelisted(self):
        sql=(pathlib.Path(__file__).resolve().parents[2]/
             'supabase/migrations/20261029120000_lafrancaise_moniwan_exact_issuer_distributor_pdf.sql').read_text()
        urls=(
            'https://www.moniwan.fr/documents/bulletin-trimestriel-scpi-lf-avenir-sante-30062025',
            'https://www.moniwan.fr/documents/bulletin-trimestriel-lf-europimmo-30062025',
        )
        for url in urls:
            self.assertIn(url,sql)
        self.assertIn("p_slug=''lf-avenir-sante''",sql)
        self.assertIn("p_slug=''lf-europimmo''",sql)
        self.assertNotIn("LIKE '%moniwan.fr'",sql)
        self.assertNotIn("r.source_domain='moniwan.fr'",sql)
        self.assertIn('PENDING',sql.upper()) if 'PENDING' in sql.upper() else self.assertIn('pending_independent_readers',sql)

class CorumCrossReaderReplayRegressionTests(unittest.TestCase):
    def test_same_issue_corum_price_from_extended_readers_replaces_bad_history_column(self):
        import corum_bulletin_fields as cb
        cap={'value':2400,'page':3,
             'text':"Capitalisation en prix de souscription : 3,163 2,4 milliards d'euros",
             'unit':'MEUR','reference_date':'2024-09-30'}
        price={'value':1135,'page':2,'text':'Prix de souscription 1 135 euros',
               'unit':'EUR_PER_PART','reference_date':'2024-09-30'}
        proposals=({'capitalisation':cap,'prix_souscription':price},
                   {'capitalisation','prix_souscription'})
        metrics,proofs,coverage=cb.reconcile_extended(
            proposals,proposals,{'nombre_parts':2786554})
        self.assertEqual(metrics['capitalisation'],3163)
        self.assertEqual(coverage['capitalisation'],'verified')
        self.assertEqual(proofs['capitalisation']['method'],
                         'pdf_page_text_match_issuer_arithmetic_qa')
class ExactReplacementArchiveRegressionTests(unittest.TestCase):
    def test_old_404_remains_a_failure_with_exact_quarter_provenance(self):
        migration=(pathlib.Path(__file__).resolve().parents[2]/
                   'supabase/migrations/20261029124500_resolve_dead_lafrancaise_links_by_same_issue_pdf.sql').read_text()
        self.assertEqual(migration.count("'https://doc.la-francaise.com/documents/bulletin-trimestriel-"),2)
        self.assertIn("old_row.status<>'fetch_error'",migration)
        self.assertIn("coalesce(old_row.result->>'error','') NOT ILIKE '%404%'",migration)
        self.assertIn("verified_row.result->>'identity_verified'<>'true'",migration)
        self.assertIn("verified_row.result->>'period_verified'<>'true'",migration)
        self.assertIn("verified_row.pdf_sha256 !~ '^[a-f0-9]{64}
    def test_transient_github_oidc_503_retries_only_token_get(self):
        token_url='https://oidc.actions.example/token'
        first=urllib.error.HTTPError(token_url,503,'temporary',{},io.BytesIO(b''))
        responses=[first,io.BytesIO(b'{"value":"test-github-jwt"}'),io.BytesIO(b'{"ok":true}')]
        env={'ACTIONS_ID_TOKEN_REQUEST_URL':token_url,'ACTIONS_ID_TOKEN_REQUEST_TOKEN':'fixture'}
        with patch.dict(replay.os.environ,env),patch.object(replay.time,'sleep') as sleep:
            with patch.object(replay.urllib.request,'urlopen',side_effect=responses) as open_request:
                self.assertEqual(replay.oidc_bridge({'op':'health'}),{'ok':True})
                self.assertEqual(open_request.call_count,3)
                self.assertEqual([call.args[0].get_method() for call in open_request.call_args_list],['GET','GET','POST'])
                sleep.assert_called_once()
    def test_persistent_github_oidc_403_never_retries(self):
        token_url='https://oidc.actions.example/token'
        denied=urllib.error.HTTPError(token_url,403,'forbidden',{},io.BytesIO(b''))
        env={'ACTIONS_ID_TOKEN_REQUEST_URL':token_url,'ACTIONS_ID_TOKEN_REQUEST_TOKEN':'fixture'}
        with patch.dict(replay.os.environ,env),patch.object(replay.time,'sleep') as sleep:
            with patch.object(replay.urllib.request,'urlopen',side_effect=[denied]) as open_request:
                with self.assertRaises(urllib.error.HTTPError):
                    replay.oidc_bridge({'op':'health'})
                self.assertEqual(open_request.call_count,1)
                sleep.assert_not_called()
    def test_bridge_record_503_is_not_retried_as_duplicate_write(self):
        token_url='https://oidc.actions.example/token'
        responses=[io.BytesIO(b'{"value":"test-github-jwt"}'),
                   urllib.error.HTTPError('https://supabase.example',503,'temporary',{},io.BytesIO(b'{"error":"temporary"}'))]
        env={'ACTIONS_ID_TOKEN_REQUEST_URL':token_url,'ACTIONS_ID_TOKEN_REQUEST_TOKEN':'fixture'}
        with patch.dict(replay.os.environ,env),patch.object(replay.time,'sleep') as sleep:
            with patch.object(replay.urllib.request,'urlopen',side_effect=responses) as open_request:
                with self.assertRaisesRegex(RuntimeError,'Protected replay bridge HTTP 503'):
                    replay.oidc_bridge({'op':'record','doc':{'id':'fixture'}})
                self.assertEqual(open_request.call_count,2)
                sleep.assert_not_called()
    def test_private_host_and_redirect_rejected_before_network(self):
        for u in ['https://extranet.example.com/doc.pdf','https://intranet.example.com/a','http://example.com/a','https://127.0.0.1/a']:
            with self.assertRaises(ValueError):replay.public_source(u)
    def test_official_public_document_permitted(self):
        self.assertEqual(replay.public_source('https://www.corum.fr/sites/default/files/a.pdf'),'https://www.corum.fr/sites/default/files/a.pdf')
    def test_wrong_product_identity_rejected(self):
        self.assertFalse(replay.identity_matches({'scpi_slug':'atream-hotel','scpi_name':'Atream Hôtels'},['SCI Atream Euro Hospitality'],[]))
    def test_filename_202206_rejects_2021_t3_historical_comparison(self):
        url='https://www.consultim-am.com/wp-content/uploads/2022/07/Optimale-Bulletin-trimestriel-202206.pdf'
        pages=['2ème trimestre 2022 Bulletin trimestriel 2022 : historique 3ème trimestre 2021']
        self.assertEqual(replay.document_issue_from_filename(url),'2022-T2')
        self.assertFalse(replay.period_matches('2021-T3',pages,url))
        self.assertTrue(replay.period_matches('2022-T2',pages,url))
    def test_filename_upload_folder_does_not_set_issue(self):
        self.assertIsNone(replay.document_issue_from_filename('https://issuer.com/wp-content/uploads/2022/07/bulletin-trimestriel.pdf'))
    def test_publisher_heading_rejects_wrong_prior_period(self):
        pages=['Bulletin 2ème trimestre 2022. Historique de comparaison 3ème trimestre 2021']
        self.assertFalse(replay.period_matches('2021-T3',pages))
        self.assertTrue(replay.period_matches('2022-T2',pages))
    def test_true_issue_not_other_quarter(self):
        self.assertTrue(replay.period_matches('2026-T3',['Bulletin 3e trimestre 2026']))
        self.assertFalse(replay.period_matches('2026-T3',['Bulletin 2e trimestre 2026']))

if __name__=='__main__':unittest.main()
",migration)
        self.assertIn("old_fetch_error_retained_for_audit",migration)
        self.assertIn("financial_certification",migration)
        self.assertIn("scpi_replay_provenance_quarantine",migration)
class SourceSafetyTests(unittest.TestCase):
    def test_transient_github_oidc_503_retries_only_token_get(self):
        token_url='https://oidc.actions.example/token'
        first=urllib.error.HTTPError(token_url,503,'temporary',{},io.BytesIO(b''))
        responses=[first,io.BytesIO(b'{"value":"test-github-jwt"}'),io.BytesIO(b'{"ok":true}')]
        env={'ACTIONS_ID_TOKEN_REQUEST_URL':token_url,'ACTIONS_ID_TOKEN_REQUEST_TOKEN':'fixture'}
        with patch.dict(replay.os.environ,env),patch.object(replay.time,'sleep') as sleep:
            with patch.object(replay.urllib.request,'urlopen',side_effect=responses) as open_request:
                self.assertEqual(replay.oidc_bridge({'op':'health'}),{'ok':True})
                self.assertEqual(open_request.call_count,3)
                self.assertEqual([call.args[0].get_method() for call in open_request.call_args_list],['GET','GET','POST'])
                sleep.assert_called_once()
    def test_persistent_github_oidc_403_never_retries(self):
        token_url='https://oidc.actions.example/token'
        denied=urllib.error.HTTPError(token_url,403,'forbidden',{},io.BytesIO(b''))
        env={'ACTIONS_ID_TOKEN_REQUEST_URL':token_url,'ACTIONS_ID_TOKEN_REQUEST_TOKEN':'fixture'}
        with patch.dict(replay.os.environ,env),patch.object(replay.time,'sleep') as sleep:
            with patch.object(replay.urllib.request,'urlopen',side_effect=[denied]) as open_request:
                with self.assertRaises(urllib.error.HTTPError):
                    replay.oidc_bridge({'op':'health'})
                self.assertEqual(open_request.call_count,1)
                sleep.assert_not_called()
    def test_bridge_record_503_is_not_retried_as_duplicate_write(self):
        token_url='https://oidc.actions.example/token'
        responses=[io.BytesIO(b'{"value":"test-github-jwt"}'),
                   urllib.error.HTTPError('https://supabase.example',503,'temporary',{},io.BytesIO(b'{"error":"temporary"}'))]
        env={'ACTIONS_ID_TOKEN_REQUEST_URL':token_url,'ACTIONS_ID_TOKEN_REQUEST_TOKEN':'fixture'}
        with patch.dict(replay.os.environ,env),patch.object(replay.time,'sleep') as sleep:
            with patch.object(replay.urllib.request,'urlopen',side_effect=responses) as open_request:
                with self.assertRaisesRegex(RuntimeError,'Protected replay bridge HTTP 503'):
                    replay.oidc_bridge({'op':'record','doc':{'id':'fixture'}})
                self.assertEqual(open_request.call_count,2)
                sleep.assert_not_called()
    def test_private_host_and_redirect_rejected_before_network(self):
        for u in ['https://extranet.example.com/doc.pdf','https://intranet.example.com/a','http://example.com/a','https://127.0.0.1/a']:
            with self.assertRaises(ValueError):replay.public_source(u)
    def test_official_public_document_permitted(self):
        self.assertEqual(replay.public_source('https://www.corum.fr/sites/default/files/a.pdf'),'https://www.corum.fr/sites/default/files/a.pdf')
    def test_wrong_product_identity_rejected(self):
        self.assertFalse(replay.identity_matches({'scpi_slug':'atream-hotel','scpi_name':'Atream Hôtels'},['SCI Atream Euro Hospitality'],[]))
    def test_filename_202206_rejects_2021_t3_historical_comparison(self):
        url='https://www.consultim-am.com/wp-content/uploads/2022/07/Optimale-Bulletin-trimestriel-202206.pdf'
        pages=['2ème trimestre 2022 Bulletin trimestriel 2022 : historique 3ème trimestre 2021']
        self.assertEqual(replay.document_issue_from_filename(url),'2022-T2')
        self.assertFalse(replay.period_matches('2021-T3',pages,url))
        self.assertTrue(replay.period_matches('2022-T2',pages,url))
    def test_filename_upload_folder_does_not_set_issue(self):
        self.assertIsNone(replay.document_issue_from_filename('https://issuer.com/wp-content/uploads/2022/07/bulletin-trimestriel.pdf'))
    def test_publisher_heading_rejects_wrong_prior_period(self):
        pages=['Bulletin 2ème trimestre 2022. Historique de comparaison 3ème trimestre 2021']
        self.assertFalse(replay.period_matches('2021-T3',pages))
        self.assertTrue(replay.period_matches('2022-T2',pages))
    def test_true_issue_not_other_quarter(self):
        self.assertTrue(replay.period_matches('2026-T3',['Bulletin 3e trimestre 2026']))
        self.assertFalse(replay.period_matches('2026-T3',['Bulletin 2e trimestre 2026']))

if __name__=='__main__':unittest.main()
