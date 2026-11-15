import unittest
from pathlib import Path
import paref_private_archived_tof_oidc_probe as qa

ROOT=Path(__file__).resolve().parents[2]
BRIDGE=(ROOT/"supabase/functions/scpi-bulletin-replay-oidc/index.ts").read_text()
WORKFLOW=(ROOT/".github/workflows/maximus-all-bulletins-replay.yml").read_text()

class ArchiveSourceBridgeSecurity(unittest.TestCase):
 def test_source_schema_pinned_two_paths_and_sha(self):
    self.assertEqual({(s['slug'],s['period']) for s in qa.SPECS},
        {('paref-evo','2024-T4'),('paref-hexa','2026-T3')})
    self.assertEqual(len({s["sha256"] for s in qa.SPECS}),2)
    for s in qa.SPECS:
        self.assertEqual(len(s['sha256']),64)
        self.assertGreater(s['bytes'],1_000_000)
        self.assertIn(s['sha256'],BRIDGE)
 def test_existing_github_oidc_security_is_preserved(self):
    for src in (
      "jwt.repository!==repo","jwt.repository_id","jwt.workflow_ref",
      "jwt.event_name", "new URL", "jwtVerify",
      "return fail(403,'forbidden')",
      "archived_exact_source_probe",
      "row.pdf_sha256!==matched.sha",
      "row.source_url!==matched.url",
      "row.pdf_path!==pinnedPath",
    ):
      self.assertIn(src,BRIDGE)
    self.assertIn("createSignedUrl(pinnedPath,120)",BRIDGE)
    self.assertIn("Cache-Control':'no-store",BRIDGE)
    self.assertNotIn("GRANT ALL",BRIDGE)
    self.assertNotIn("SECURITY DEFINER",BRIDGE)
 def test_runner_must_never_print_url_token_or_private_pdf(self):
    import inspect
    code=inspect.getsource(qa)
    self.assertIn("ACTIONS_ID_TOKEN_REQUEST_URL",code)
    self.assertIn("ACTIONS_ID_TOKEN_REQUEST_TOKEN",code)
    self.assertIn("PRIVATE_ARCHIVE_DOWNLOAD_WRONG_HOST_OR_HTTP",code)
    self.assertIn("REGISTERED_ARCHIVE_SHA256_MISMATCH",code)
    self.assertIn('"financial_certified":False',code)
    self.assertIn('"human_attestation":False',code)
    self.assertNotIn("print(signed",code)
    self.assertNotIn("print(token",code)
    self.assertNotIn("UPDATE public.scpi",code)
 def test_existing_replay_workflow_not_replaced(self):
    self.assertIn("Drain durable queue - all 65 SCPI",WORKFLOW)
    self.assertIn("supabase/functions/scpi-bulletin-replay-oidc/**",WORKFLOW)
    self.assertIn("id-token: write",WORKFLOW)
 def test_private_signed_source_is_redacted_from_any_error(self):
    import paref_private_archived_tof_oidc_probe as qa
    self.assertEqual(qa.safe_error_code(ValueError("WRONG_PRIVATE_SOURCE_SHA")),"WRONG_PRIVATE_SOURCE_SHA")
    self.assertEqual(qa.safe_error_code(RuntimeError("https://private.example/token?secret=123")),
                     "ARCHIVE_TRANSPORT_OR_PDF_PARSER_FAILURE")
 def test_two_readers_must_match_coordinates(self):
    import inspect
    code=inspect.getsource(qa)
    self.assertIn('get_text("words")',code)
    self.assertIn('"Poppler"',code) if '"Poppler"' in code else self.assertIn("pdftotext",code)
    self.assertIn('if not positions:raise ValueError',code)

class TotalCaptionSemantics(unittest.TestCase):
 def words(self):
    return [(84,217,119,239,"TOF"),(82,239,94,251,"T3"),
            (97,239,121,251,"2026"),(71,251,113,275,"86,0"),
            (76,327,107,346,"84,5"),(140,327,180,346,"Locaux"),
            (185,327,220,346,"occupés"),(245,652,269,669,"86,0")]
 def test_total_caption_excludes_occupied_and_history_legend(self):
    self.assertEqual(qa.total_caption_box(self.words(),"2026-T3","86,0"),[71,251,113,275])
 def test_occupied_component_rejected_even_with_tof_on_page(self):
    with self.assertRaisesRegex(ValueError,"TOTAL_TOF_EXACT_QUARTER_CAPTION_REQUIRED"):
        qa.total_caption_box(self.words(),"2026-T3","84,5")
 def test_wrong_period_rejected(self):
    with self.assertRaises(ValueError): qa.total_caption_box(self.words(),"2026-T2","86,0")
 def test_ambiguous_totals_rejected(self):
    with self.assertRaises(ValueError): qa.total_caption_box(self.words()+[(71,252,113,276,"86,0")],"2026-T3","86,0")
 def test_missing_tof_caption_rejected(self):
    with self.assertRaises(ValueError): qa.total_caption_box(self.words()[1:],"2026-T3","86,0")

if __name__=="__main__":
 unittest.main()
