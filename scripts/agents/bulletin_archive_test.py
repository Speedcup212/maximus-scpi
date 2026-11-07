import pathlib,ssl,sys,tempfile,unittest,urllib.error
from unittest import mock
sys.path.insert(0,str(pathlib.Path(__file__).parent))
import bulletin_document_periods as periods
import bulletin_source_transport as transport
import bulletin_complete_pipeline as replay

class ArchivePeriodAndTransportTests(unittest.TestCase):
    def test_annual_report_is_not_a_fourth_quarter(self):
        pages=['SCPI Activimmo Rapport annuel 2024','Distribution au quatrième trimestre 2024']
        self.assertTrue(periods.matches('2024-RA',pages))
        self.assertFalse(periods.matches('2024-T4',pages))

    def test_semester_stays_distinct_from_quarters(self):
        pages=['Bulletin information 2e semestre 2025','Premier trimestre 2026 : perspectives']
        self.assertTrue(periods.matches('2025-S2',pages))
        self.assertFalse(periods.matches('2025-T4',pages))
        self.assertFalse(periods.matches('2026-T1',pages))

    def test_cover_quarter_is_not_next_validity_period(self):
        pages=['Bulletin 2ème trimestre 2026 Valable du 1er juillet 2026 au 30 septembre 2026']
        self.assertTrue(periods.matches('2026-T2',pages))
        self.assertFalse(periods.matches('2026-T3',pages))

    def test_old_cover_typography_and_spelled_quarter(self):
        self.assertTrue(periods.matches('2026-T3',['Au troisième trimestre 2026, Iroko Zen']))
        self.assertTrue(periods.matches('2017-T1',['1er TRIMESTRE 201 7']))
        self.assertTrue(periods.matches('2025-S1',['S1 2025 Bulletin semestriel']))

    def test_information_note_is_not_a_bulletin(self):
        self.assertEqual(periods.issue_periods(["Note d’information Iroko Zen","Exemple : au 1er trimestre 2031"]),set())

    def test_aestiam_analysis_range_after_validity_line(self):
        pages=['Bulletin trimestriel information\nValable du 1er juillet au 30 septembre 2024 et\nrelatif à la période du 1er avril au 30 juin 2024']
        self.assertTrue(periods.matches('2024-T2',pages))
        self.assertFalse(periods.matches('2024-T3',pages))

    def test_ncap_cover_has_validity_before_its_actual_issue(self):
        pages=['Valide du 1er janvier au 31 mars 2026\nBulletin trimestriel information\n4ème trimestre 2025']
        self.assertTrue(periods.matches('2025-T4',pages))
        self.assertFalse(periods.matches('2026-T1',pages))

    def test_atream_explicit_analysis_interval(self):
        pages=['Période analysée du 1er octobre au 31 décembre 2020\nValable du 1er janvier au 31 mars 2021\nN°2020/4\nBulletin trimestriel information']
        self.assertTrue(periods.matches('2020-T4',pages))
        self.assertFalse(periods.matches('2021-T1',pages))

    def test_url_semantics_preserve_raw_plus_and_existing_escapes(self):
        raw='https://issuer.fr/BULLETIN_1T+2023.pdf?q=hello+world&escaped=a%2Bb'
        self.assertEqual(transport.request_url(raw),raw)
        self.assertEqual(transport.request_url('https://issuer.fr/un fichier.pdf'),'https://issuer.fr/un%20fichier.pdf')

    def test_intermediate_never_enables_partial_chain_trust(self):
        context=transport.ssl_context()
        self.assertEqual(context.verify_mode,ssl.CERT_REQUIRED)
        self.assertTrue(context.check_hostname)
        self.assertFalse(context.verify_flags & ssl.VERIFY_X509_PARTIAL_CHAIN)

    def test_modified_intermediate_is_rejected(self):
        with mock.patch.object(transport,'INTERMEDIATE_SHA256','0'*64):
            with self.assertRaisesRegex(ValueError,'fingerprint_mismatch'):transport.ssl_context()

    def test_independent_client_never_follows_a_private_redirect(self):
        def curl(args,**kwargs):
            pathlib.Path(args[args.index('--dump-header')+1]).write_text(
                'HTTP/1.1 302 Found\r\nLocation: https://extranet.issuer.fr/private\r\n\r\n')
            return mock.Mock(returncode=0,stdout='302',stderr='')
        with tempfile.TemporaryDirectory() as root,mock.patch.object(transport.subprocess,'run',side_effect=curl) as run:
            with self.assertRaisesRegex(ValueError,'private_source'):
                transport.curl_fetch('https://issuer.fr/docs',pathlib.Path(root)/'body',replay.public_source)
            self.assertEqual(run.call_count,1)
            self.assertNotIn('--insecure',run.call_args.args[0])

    def test_http_failure_is_not_saved_as_success(self):
        opener=mock.Mock()
        opener.open.side_effect=urllib.error.HTTPError('https://issuer.fr/',503,'Unavailable',{},None)
        with tempfile.TemporaryDirectory() as root,mock.patch.object(transport,'curl_fetch') as fallback:
            with self.assertRaises(urllib.error.HTTPError):
                transport.fetch_to_path('https://issuer.fr/',pathlib.Path(root)/'body',opener,replay.public_source,replay.UA)
            fallback.assert_not_called()

if __name__=='__main__':unittest.main()
