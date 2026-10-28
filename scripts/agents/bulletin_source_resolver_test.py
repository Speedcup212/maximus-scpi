import pathlib,sys,tempfile,unittest
from unittest import mock
sys.path.insert(0,str(pathlib.Path(__file__).parent))
import bulletin_source_resolver as resolver
import bulletin_complete_pipeline as replay

class PublisherSourceTests(unittest.TestCase):
    def test_upload_month_is_not_an_issue(self):
        self.assertEqual(resolver.issue_hints('https://issuer.fr/uploads/2026/07/document.pdf'),set())

    def test_issue_written_in_french_is_distinct_from_the_validity_quarter(self):
        self.assertTrue(replay.period_matches('2026-T3',['Au troisième trimestre 2026, votre SCPI Iroko Zen...']))
        self.assertFalse(replay.period_matches('2026-T2',['Au troisième trimestre 2026, votre SCPI Iroko Zen...']))

    def test_roman_name_requires_the_verified_fund_alias(self):
        item={'scpi_slug':'altixia-cadence-12','scpi_name':'Altixia Cadence 12'}
        cover=['SCPI ALTIXIA CADENCE XII 4ème TRIMESTRE 2024']
        self.assertFalse(replay.identity_matches(item,cover,[]))
        self.assertTrue(replay.identity_matches(item,cover,[{'scpi_slug':item['scpi_slug'],'alias':'Altixia Cadence XII','active':True}]))

    def test_issue_labels_in_both_orders_and_filenames(self):
        for value in ['2026-T2','BTI-T22026-Fund.pdf','Bulletin 2ème trimestre 2026','2026-2t-bti.pdf']:
            self.assertEqual(resolver.issue_hints(value),{'2026-T2'},value)

    def test_relative_uppercase_pdf_and_json_links(self):
        html=b'<a href="medias/issue.PDF">Bulletin T2 2026</a><script>{"pdf":"https:\\/\\/cdn.fr\\/issue.pdf"}</script>'
        page=resolver.parse_html(html,'https://issuer.fr/news/issue')
        self.assertEqual({x['url'] for x in page['links']},{'https://issuer.fr/news/medias/issue.PDF','https://cdn.fr/issue.pdf'})

    def test_empty_html_attributes_and_duplicate_json_keep_the_issue_label(self):
        page=resolver.parse_html(b'<a href>Empty</a><a href="https://issuer.fr/download.pdf">Bulletin T2 2026</a><script>{"pdf":"https://issuer.fr/download.pdf"}</script>','https://issuer.fr/')
        self.assertEqual(len(page['links']),1)
        self.assertIn('T2 2026',page['links'][0]['text'])

    def test_wrong_issue_and_statutes_are_not_downloaded(self):
        page=resolver.parse_html(b'<a href="old.pdf">Bulletin T1 2026</a><a href="statuts.pdf">Statuts</a><a href="ok.pdf">Bulletin T2 2026</a>','https://issuer.fr/')
        docs,_=resolver.candidates(page,'2026-T2')
        self.assertEqual([x['url'] for x in docs],['https://issuer.fr/ok.pdf'])

    def test_a_hub_only_resolves_after_pdf_identity_and_period_verification(self):
        item={'source_url':'https://issuer.fr/docs','period':'2026-T2'}
        page={'url':item['source_url'],'data':b'<a href="/issue.pdf">Bulletin T2 2026</a>'}
        fetch=lambda url:(b'%PDF correct fund and issue',url)
        self.assertFalse(resolver.resolve(item,page,fetch,lambda data:False)['matched'])
        result=resolver.resolve(item,page,fetch,lambda data:True)
        self.assertTrue(result['matched']);self.assertEqual(result['publisher_page'],item['source_url'])

    def test_public_official_fallback_can_replace_a_dead_or_third_party_reference(self):
        item={'source_url':'https://third-party.fr/old','period':'2026-T2','official_scpi_page_url':'https://issuer.fr/docs'}
        def fetch(url):
            return (b'<a href="/issue.pdf">Bulletin T2 2026</a>' if url.endswith('/docs') else b'%PDF verified',url)
        self.assertTrue(resolver.resolve(item,None,fetch,lambda data:True)['matched'])

    def test_access_challenge_remains_an_explicit_source_failure(self):
        page={'url':'https://issuer.fr/docs','data':b'<title>Access denied</title><a href="fake.pdf">Bulletin T2 2026</a>'}
        fetch=mock.Mock()
        result=resolver.resolve({'period':'2026-T2'},page,fetch,lambda data:True)
        self.assertFalse(result['matched']);fetch.assert_not_called()
        self.assertEqual(result['errors'][0]['error'],'publisher_access_challenge')

    def test_pdf_url_returning_a_captcha_without_title_is_not_a_bulletin(self):
        page=resolver.parse_html(b'<meta http-equiv="refresh" content="0;/.well-known/sgcaptcha/?r=issue.pdf">','https://issuer.fr/issue.pdf')
        self.assertTrue(page['access_blocked'])

    def test_seed_permission_failure_still_produces_a_failed_summary(self):
        with tempfile.TemporaryDirectory() as root,mock.patch.object(replay,'oidc_bridge',side_effect=RuntimeError('permission denied')):
            out=pathlib.Path(root)
            with self.assertRaises(RuntimeError):replay.run_queue(out)
            import json
            self.assertEqual(json.loads((out/'run-summary.json').read_text())['status'],'failed')

    def test_html_reference_never_becomes_financial_data(self):
        item={'id':'ref:example','document_key':'ref:example','scpi_slug':'fund','scpi_name':'Fund','period':'2026-T2','source_url':'https://issuer.fr/docs'}
        with tempfile.TemporaryDirectory() as root:
            path=pathlib.Path(root)/'source';path.write_bytes(b'<h1>Documentation Fund</h1>')
            result=replay.resolve_source(item,{'status':'downloaded','kind':'html','path':str(path)},pathlib.Path(root))
        self.assertEqual(result['status'],'source_reference_review')
        self.assertEqual(result['metrics'],{});self.assertFalse(result['financial_complete']);self.assertFalse(result['processing_complete'])

if __name__=='__main__':unittest.main()
