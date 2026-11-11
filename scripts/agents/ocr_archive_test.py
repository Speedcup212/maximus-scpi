import hashlib
import io
import unittest
import urllib.error
from unittest.mock import patch
import scpi_ocr_worker as worker

class Response(io.BytesIO):
    def __init__(self, data, sha):
        super().__init__(data)
        self.headers = {'X-Original-Sha256': sha}

class ArchiveTests(unittest.TestCase):
    def setUp(self):
        self.task = {'slug': 'novapierre-1', 'period': '2024-T1',
                     'url': 'https://paref-gestion.com/original.pdf'}
        self.data = b'%PDF-1.7 archived original'

    def test_exact_original_prevents_failed_issuer_download(self):
        sha = hashlib.sha256(self.data).hexdigest()
        with patch.object(worker, 'oidc_token', return_value='private'), \
             patch.object(worker.urllib.request, 'urlopen', return_value=Response(self.data, sha)), \
             patch.object(worker, 'get_pdf') as live:
            self.assertEqual(worker.get_task_pdf(self.task), self.data)
            live.assert_not_called()

    def test_only_missing_archive_permits_official_source_fallback(self):
        for status in (404, 409, 422, 424, 503):
            error = urllib.error.HTTPError(worker.BRIDGE, status, 'failure', {}, None)
            with self.subTest(status=status), \
                 patch.object(worker, 'oidc_token', return_value='private'), \
                 patch.object(worker.urllib.request, 'urlopen', side_effect=error), \
                 patch.object(worker, 'get_pdf', return_value=self.data) as live:
                if status == 404:
                    self.assertEqual(worker.get_task_pdf(self.task), self.data)
                    live.assert_called_once_with(self.task['url'])
                else:
                    with self.assertRaises(urllib.error.HTTPError):
                        worker.get_task_pdf(self.task)
                    live.assert_not_called()

    def test_corrupt_archive_never_falls_back_or_certifies(self):
        for data, sha in ((self.data, '0'*64), (b'HTML', hashlib.sha256(b'HTML').hexdigest()),
                          (self.data, '')):
            with self.subTest(sha=sha), \
                 patch.object(worker, 'oidc_token', return_value='private'), \
                 patch.object(worker.urllib.request, 'urlopen', return_value=Response(data, sha)), \
                 patch.object(worker, 'get_pdf') as live:
                with self.assertRaises(ValueError):
                    worker.get_task_pdf(self.task)
                live.assert_not_called()

if __name__ == '__main__':
    unittest.main()
