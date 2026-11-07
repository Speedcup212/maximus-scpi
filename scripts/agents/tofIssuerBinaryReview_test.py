import copy
import json
from pathlib import Path
import tempfile
import unittest
import tofIssuerBinaryReview as audit

MANIFEST=Path(__file__).resolve().parent/"fixtures/tof_two_issuer_conflicts_2026t3.json"


class TofPdfProofTests(unittest.TestCase):
    def setUp(self):
        self.m=json.loads(MANIFEST.read_text())

    def test_official_same_host_redirect_is_observed_not_followed(self):
        source="https://www.fiducial-gerance.fr/content/download/544/12625?version=14"
        answer=audit.classify_redirect_location(
            source,"/content/download/544/file/Buroboutic.pdf?signature=PRIVATE",
            ["www.fiducial-gerance.fr"])
        self.assertTrue(answer["exact_same_official_host"])
        self.assertFalse(answer["automatic_followed"])
        self.assertEqual(answer["destination_host"],"www.fiducial-gerance.fr")
        self.assertEqual(answer["destination_path"],
                         "/content/download/544/file/Buroboutic.pdf")
        self.assertNotIn("PRIVATE",str(answer))

    def test_unapproved_cdn_redirect_requires_independent_review(self):
        src="https://www.fiducial-gerance.fr/content/download/544/12625"
        answer=audit.classify_redirect_location(
            src,"https://external.example.org/a.pdf?token=PRIVATE",
            ["www.fiducial-gerance.fr"])
        self.assertFalse(answer["exact_same_official_host"])
        self.assertFalse(answer["automatic_followed"])
        self.assertEqual(answer["status"],"REDIRECT_TARGET_REQUIRES_INDEPENDENT_APPROVAL")
        self.assertNotIn("PRIVATE",str(answer))

    def test_non_https_and_credential_redirect_never_autoproves_issuer(self):
        src="https://www.fiducial-gerance.fr/content/download/544/12625"
        for target in ("http://www.fiducial-gerance.fr/test.pdf",
                       "https://operator:pw@www.fiducial-gerance.fr/test.pdf",
                       "https://127.0.0.1/test.pdf"):
            with self.subTest(target=target):
                result=audit.classify_redirect_location(
                    src,target,["www.fiducial-gerance.fr"])
                self.assertFalse(result["exact_same_official_host"])
                self.assertFalse(result["automatic_followed"])

    def test_exact_buro_same_host_pinned_302_can_be_revalidated(self):
        doc=self.m["cases"][0]
        seen=[]
        def loader(url,hosts):
            seen.append(url)
            return b"%PDF-1.7 source original",url
        raw,url,meta=audit.fetch_pinned_buro_redirect(
            doc,loader=loader,
            location_probe=lambda source,hosts:
                "/content/download/544/file/BTI%20Buroboutic%20T3%202026%20WEB.pdf?version=14")
        self.assertEqual(len(seen),1)
        self.assertEqual(url,seen[0])
        self.assertEqual(url.split("?",1)[0],
            "https://www.fiducial-gerance.fr"
            "/content/download/544/file/BTI%20Buroboutic%20T3%202026%20WEB.pdf")
        self.assertEqual(meta["status"],
                         "PINNED_SAME_ISSUER_REDIRECT_SOURCE_FETCHED")
        self.assertNotIn("version=14",str(meta))
        self.assertFalse(meta["financial_certified"])

    def test_alternate_or_cross_host_redirect_fails_before_download(self):
        doc=self.m["cases"][0]
        seen=[]
        def loader(url,hosts):
            seen.append(url)
            return b"%PDF",url
        for location in (
            "https://cdn.evil.example/BTI.pdf",
            "http://www.fiducial-gerance.fr/content/download/544/file/"
            "BTI%20Buroboutic%20T3%202026%20WEB.pdf",
            "/content/download/544/file/Different%20Fund.pdf",
            "/content/download/544/file/"
            "BTI%20Buroboutic%20T3%202026%20WEB.pdf/../../secret",
            "https://attacker@www.fiducial-gerance.fr/content/download/544/file/"
            "BTI%20Buroboutic%20T3%202026%20WEB.pdf",
        ):
            with self.subTest(location=location):
                with self.assertRaisesRegex(ValueError,
                    "PINNED_BURO_REDIRECT_TARGET_NOT_APPROVED"):
                    audit.fetch_pinned_buro_redirect(
                        doc,loader=loader,
                        location_probe=lambda source,hosts:location)
        self.assertEqual(seen,[])

    def test_other_fund_or_tampered_sha_cannot_use_buro_redirect_exception(self):
        doc=self.m["cases"][0]
        for replacement in ({"slug":"perial-grand-paris"},
                            {"sha256":"a"*64},
                            {"source_url":"https://www.fiducial-gerance.fr/other"},
                            {"period":"2025-T4"}):
            with self.subTest(replacement=replacement):
                edited={**doc,**replacement}
                with self.assertRaisesRegex(
                    ValueError,"UNAPPROVED_DOCUMENT_REDIRECT_EXCEPTION"):
                    audit.fetch_pinned_buro_redirect(
                        edited,loader=lambda *a:(_ for _ in ()).throw(
                            AssertionError("unexpected fetch")),
                        location_probe=lambda *a: "/other.pdf")

    def test_pinned_two_issuer_docs_and_readonly(self):
        cases=audit.validate(self.m)
        self.assertEqual(len(cases),2)
        self.assertFalse(self.m["financial_certified"])
        self.assertFalse(self.m["deploy_allowed"])
        self.assertEqual(set(audit.EXPECTED),
                         {c["slug"] for c in cases})

    def test_private_forged_and_nonissuer_source_disallowed(self):
        for url in [
            "http://cdn.prod.website-files.com/x.pdf",
            "https://127.0.0.1/x.pdf",
            "https://cdn.prod.website-files.com.evil.test/x.pdf",
            "https://cdn.prod.website-files.com@evil.test/x.pdf",
            "https://evil.test/x.pdf",
        ]:
            with self.subTest(url=url):
                m=copy.deepcopy(self.m)
                m["cases"][1]["source_url"]=url
                with self.assertRaises(ValueError):
                    audit.validate(m)

    def test_forged_certificate_sha_rejected(self):
        m=copy.deepcopy(self.m)
        m["cases"][1]["sha256"]="x"*64
        with self.assertRaises(ValueError):
            audit.validate(m)

    def test_period_not_inferred_from_url_only(self):
        self.assertFalse(audit.quarter_on_cover(["Bulletin 2e trimestre 2026", ""]))
        self.assertTrue(audit.quarter_on_cover(["Rapport au 30 septembre 2026", ""]))
        self.assertTrue(audit.quarter_on_cover(["T3 2026", ""]))

    def test_issuer_identity_exact_case(self):
        self.assertTrue(audit.identity_on_pdf("SCPI PERIAL Grand Paris", "perial-grand-paris"))
        self.assertFalse(audit.identity_on_pdf("SCPI PERIAL Opportunités Europe", "perial-grand-paris"))
        self.assertTrue(audit.identity_on_pdf("BUROBOUTIC METROPOLES", "buroboutic-metropoles"))

    def test_source_changed_sha_is_blocked_without_financial_pass(self):
        from tempfile import TemporaryDirectory
        with TemporaryDirectory() as td:
            d=self.m["cases"][1]
            out=audit.inspect_case(d,Path(td),
                                   loader=lambda u,h:(b"%PDF-1.7\nWRONG",u))
            self.assertEqual(out["status"],"blocked")
            self.assertEqual(out["error_code"],"ISSUER_PDF_HASH_CHANGED")
            self.assertFalse(out["financial_certified"])
            self.assertFalse(out["deploy_allowed"])

    def test_perial_migration_is_exact_issuer_sha_page_and_no_human_attestation(self):
        migration = (
            Path(__file__).resolve().parents[2] /
            "supabase/migrations/20261107_recovery135_perial_t3_dual_reader_tof_evidence.sql"
        ).read_text(encoding="utf-8")
        for marker in (
            "e9205e1d300724742c6189fdd49a5787e7e5857a5eee040a9f701ac8f2a5f8b1",
            "42375137331",
            "source_page=6",
            "value_numeric=84.7",
            "qa_status='auto_verified_dual_pdf_evidence'",
            "IF k<>1",
            "financial_human_signoff',false",
            "maximus_agents.scpi_replay_provenance_quarantine",
        ):
            self.assertIn(marker,migration)
        self.assertNotIn("SECURITY DEFINER",migration)
        self.assertNotIn("manual_verified_official_pdf_text_review",migration)
        self.assertNotIn("UPDATE public.scpi_source_registry",migration)
        self.assertNotIn("UPDATE maximus_agents.scpi_candidate_final_review",migration)

    def test_buro_vacancy_text_separate_from_aggregate(self):
        text=("Locaux vacants en restructuration "
              "(intégrés au TOF sous conditions) : 0,07 % "
              "Taux d'occupation financier (TOF) : 91,56 %")
        excerpts=audit.page_excerpt(text)
        self.assertTrue(any("0,07" in x for x in excerpts))
        self.assertTrue(any("91,56" in x for x in excerpts))


if __name__=="__main__":
    unittest.main()
