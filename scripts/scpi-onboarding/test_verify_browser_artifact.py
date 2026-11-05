import hashlib
import json
import tempfile
import unittest
import zipfile
from pathlib import Path
from verify_browser_artifact import verify_archive, SURFACES, WIDTHS

SHA = 'a' * 40
PERIOD = '2026-T2'
SLUG = 'sofidynamic'


def make_archive(root, mutator=None):
    report = {
        'schema': 'scpi-browser-cases/v2', 'candidate_slug': SLUG,
        'git_commit_sha': SHA, 'source_period': PERIOD,
        'publication_authorized': False, 'postdeploy_100_proven': False,
        'cases': []
    }
    files = {}
    for width in WIDTHS:
        for surface in SURFACES:
            name = f'{SLUG}-{width}-{surface}.png'
            raw = b'PUPPETEER_SYNTHETIC_TEST_ONLY:' + name.encode()
            files[name] = raw
            report['cases'].append({
                'slug': SLUG, 'width': width, 'surface': surface,
                'status': 'PASS', 'source_period': PERIOD,
                'proof_kind': 'PUPPETEER_SCREENSHOT', 'proof_file': name,
                'proof_sha256': hashlib.sha256(raw).hexdigest()
            })
    if mutator:
        mutator(report, files)
    files[f'browser-cases-{SLUG}.json'] = json.dumps(report).encode()
    archive_path = root / 'bundle.zip'
    with zipfile.ZipFile(archive_path, 'w', compression=zipfile.ZIP_DEFLATED) as z:
        for name, value in files.items():
            z.writestr(name, value)
    expected_zip = hashlib.sha256(archive_path.read_bytes()).hexdigest()
    return archive_path, expected_zip


class BrowserArtifactVerifierTest(unittest.TestCase):
    def test_synthetic_bundle_checks_all_twelve_proofs_no_release(self):
        with tempfile.TemporaryDirectory() as tmp:
            path, digest = make_archive(Path(tmp))
            result = verify_archive(path, SLUG, SHA, PERIOD, digest)
            self.assertEqual(result['status'], 'GITHUB_ARCHIVE_CASES_VERIFIED')
            self.assertEqual(result['case_count_verified'], 12)
            self.assertFalse(result['financially_certified'])
            self.assertFalse(result['publication_authorized'])

    def test_rejects_forged_archive_digest(self):
        with tempfile.TemporaryDirectory() as tmp:
            path, digest = make_archive(Path(tmp))
            self.assertEqual(verify_archive(path, SLUG, SHA, PERIOD, 'c'*64)['status'], 'BLOCKED')
            self.assertEqual(verify_archive(path, SLUG, 'b'*40, PERIOD, digest)['status'], 'BLOCKED')

    def test_missing_manifest_or_one_case_fails(self):
        with tempfile.TemporaryDirectory() as tmp:
            path, digest = make_archive(Path(tmp),lambda report,files:report['cases'].pop())
            self.assertEqual(verify_archive(path, SLUG, SHA, PERIOD, digest)['status'], 'BLOCKED')

    def test_modified_screenshot_fails_even_when_zip_digest_updates(self):
        def tamper(report, files):
            files[f'{SLUG}-390-profile.png']=b'MODIFIED_SCREENSHOT'
        with tempfile.TemporaryDirectory() as tmp:
            path, digest = make_archive(Path(tmp),tamper)
            self.assertEqual(verify_archive(path, SLUG, SHA, PERIOD, digest)['status'], 'BLOCKED')

    def test_wrong_period_and_fake_release_fail(self):
        for mutate in (
            lambda report, files: report.update(source_period='2026-T3'),
            lambda report, files: report.update(publication_authorized=True),
            lambda report, files: report['cases'][0].update(source_period='2026-T3'),
            lambda report, files: report['cases'][0].update(proof_file='../evil.png'),
        ):
            with tempfile.TemporaryDirectory() as tmp:
                path, digest = make_archive(Path(tmp),mutate)
                self.assertEqual(verify_archive(path, SLUG, SHA, PERIOD, digest)['status'], 'BLOCKED')

    def test_one_missing_canonical_surface_fails(self):
        def tamper(report, files):
            report['cases'][0]['surface']='nonexistent'
        with tempfile.TemporaryDirectory() as tmp:
            path, digest = make_archive(Path(tmp),tamper)
            self.assertEqual(verify_archive(path, SLUG, SHA, PERIOD, digest)['status'], 'BLOCKED')


if __name__ == '__main__':
    unittest.main()
