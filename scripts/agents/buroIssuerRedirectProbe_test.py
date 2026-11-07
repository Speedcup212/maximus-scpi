import unittest
import buroIssuerRedirectProbe as src


class NoFetch:
    def __init__(self, status, location=None):
        self.status = status
        self.location = location
    def open(self, request, timeout=None):
        import urllib.error
        headers = {"Location":self.location} if self.location else {}
        raise urllib.error.HTTPError(request.full_url, self.status, "redirect", headers, None)


class RedirectProbeContract(unittest.TestCase):
    def test_no_changed_source(self):
        with self.assertRaises(ValueError):
            src.validate_source("https://evil.test/file.pdf")
        with self.assertRaises(ValueError):
            src.validate_source(src.SOURCE + "&unknown=1")

    def test_same_approved_host_requires_new_binary_proof(self):
        m=src.redirect_metadata("/content/download/1299/file/Buroboutic%20T3.pdf?sig=secret")
        self.assertTrue(m["host_approved"])
        self.assertNotIn("sig",str(m))
        self.assertEqual(m["status"],"redirect_requires_binary_verification")
        self.assertTrue(m["requires_independent_pdf_identity_period_sha"])

    def test_cross_host_refused(self):
        m=src.redirect_metadata("https://other.example.com/x.pdf")
        self.assertFalse(m["host_approved"])

    def test_private_or_http_redirect_not_homologated(self):
        for u in ("http://www.fiducial-gerance.fr/a",
                  "https://127.0.0.1/",
                  "https://www.fiducial-gerance.fr@other.example.com/a"):
            self.assertFalse(src.redirect_metadata(u)["host_approved"])

    def test_only_head_response_means_no_verified_financial_pdf(self):
        r=src.audit(opener=NoFetch(302,"https://www.fiducial-gerance.fr/a.pdf"),
                    verify_dns=lambda _:None)
        self.assertEqual(r["observed"]["http_status"],302)
        self.assertFalse(r["pdf_sha256_verified"])
        self.assertFalse(r["period_identity_verified"])
        self.assertFalse(r["financial_certified"])
        self.assertFalse(r["deploy_allowed"])

    def test_unauthorized_get_also_stays_metadata_only(self):
        r=src.audit(opener=NoFetch(403),verify_dns=lambda _:None)
        self.assertEqual(len(r["attempts"]),2)
        self.assertFalse(r["pdf_sha256_verified"])


if __name__=="__main__":
    unittest.main()
