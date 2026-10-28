import pathlib,ssl,sys,tempfile,unittest,urllib.error
from unittest import mock
sys.path.insert(0,str(pathlib.Path(__file__).parent))
import bulletin_source_transport as transport
import bulletin_complete_pipeline as replay

class SourceTransportTests(unittest.TestCase):
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
