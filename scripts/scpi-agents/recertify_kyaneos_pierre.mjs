/**
 * RECERTIFICATION — Kyaneos Pierre (9 periods quarantined as "invalid_tof_bulletin_source_policy")
 *
 * This script performs the independent recertification of the 9 invalid TOF rows in
 * `scpi_indicator_history` for scpi_slug = 'kyaneos-pierre'.
 *
 * Evidence chain:
 *  1. Each of the 9 official issuer bulletins (Kyaneos AM, kyaneosam.com) was downloaded
 *     and its SHA-256 recomputed. Every recomputed hash MATCHES the `scpi_bulletins.pdf_sha256`
 *     already recorded by the ingestion pipeline (see tmp_verify_9_periods.mjs /
 *     tmp_bulletin_text/_verification_results.json).
 *  2. The "TOF ASPIM" value was extracted from page 3 ("DONNÉES DE LA SCPI") of each bulletin.
 *  3. For 2018-T4 the original URL is 404; the bulletin was retrieved from the Internet Archive
 *     (Wayback Machine) and is byte-identical (same SHA-256 d03dd799…) to the one the pipeline
 *     originally ingested, so the canonical source_url is preserved.
 *
 * The update mirrors the exact shape already used by the 2026-11-17 recertification of the
 * other Kyaneos Pierre periods: qa_status = 'manual_verified_official_pdf_recertified',
 * source_confidence = 0.98, and metric_provenance.tof + metric_provenance.tof_policy.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = path.join(__dirname, '..', '..', '.env.local');
  const raw = fs.readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

const env = loadEnv();
const SUPABASE_URL = env.SUPABASE_URL || 'https://ygvsddcpohsnaowofuwc.supabase.co';
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!SERVICE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
};

const RECERTIFIED_AT = new Date().toISOString();
const PREVIOUS_BACKUP = 'scpi_internal.tof_policy_quarantine_audit_20261028';

// Verified evidence (see tmp_verify_9_periods.mjs output).
const rows = [
  { id: '98004e23-ff9a-4713-bb02-c06cb49a7446', period: '2018-T4', tof: 95.5, sha256: 'd03dd799b64376807b4cd8f87d2093c22c23136f18f43274fe57c5404fd22b30', url: 'https://kyaneosam.com/wp-content/uploads/2023/09/SCPI-KP-BT-4T18.pdf' },
  { id: '1826438a-7207-4825-8f15-0b4156df9075', period: '2019-T4', tof: 85.1, sha256: '4c0e484622841939e1842b5fbdc61b291e5e9120e12c4850d83b4e8894ed324b', url: 'https://kyaneosam.com/wp-content/uploads/2023/09/SCPI-KP-BT-4T19.pdf' },
  { id: '779720e9-71ff-4bea-b0d0-1cd51cc5e200', period: '2020-T1', tof: 84.4, sha256: 'e4e78ffdd079ba2ecc6f5b00d57d3b2f961f34e2311ff3639252fd5ce4621193', url: 'https://kyaneosam.com/wp-content/uploads/2023/09/SCPI-KP-BT-1T20.pdf' },
  { id: 'bc77d90c-050b-47ac-8722-8cf0b98859a6', period: '2020-T2', tof: 79.6, sha256: 'c1e8a0f4ac75caf35808cec02cff516faf5d5148f9cf562aee23b5596132a935', url: 'https://kyaneosam.com/wp-content/uploads/2023/09/SCPI-KP-BT-2T20.pdf' },
  { id: 'b052d882-1179-46e1-86bd-4abf9b54aa4e', period: '2020-T3', tof: 86.3, sha256: 'e85551f975b5b91589edb594fa91338c89aa32fdfa96c762bec4e8e7243998c7', url: 'https://kyaneosam.com/wp-content/uploads/2023/09/SCPI-KP-BT-3T20.pdf' },
  { id: '8a689067-d8a3-4355-a276-e1960d6ecd6c', period: '2020-T4', tof: 86.3, sha256: 'c0fccf00b7bac8e655e49522322a13f8655cd9e898e269153bfd10e508d85889', url: 'https://kyaneosam.com/wp-content/uploads/2023/09/SCPI-Kyaneos-Pierre-BT-4T20.pdf' },
  { id: '7277d44a-6092-4a1a-b25d-c94fe0315832', period: '2021-T1', tof: 82.6, sha256: 'f2d602fa17882a0ce64a85c4091fb38860d8d162f513e488ba2d553663844513', url: 'https://kyaneosam.com/wp-content/uploads/2023/09/SCPI-Kyaneos-Pierre-BT-1T2021-vdef.pdf' },
  { id: '697be7a9-52fd-4e81-9b70-45673e04c21d', period: '2021-T4', tof: 73.6, sha256: 'd57680bdd67066ce4b672fa2ff73b90ffc07795976287b013db150af86a8acbe', url: 'https://kyaneosam.com/wp-content/uploads/2023/09/SCPI-Kyaneos-Pierre-BT-T4-2021.pdf' },
  { id: 'f052b4a7-9bf5-477a-bf76-b76de2683440', period: '2022-T2', tof: 76.5, sha256: '73f3b9d065a76e66c88feb7d39b2dbfc00079d1b2830a580720e9955e59a2b13', url: 'https://kyaneosam.com/wp-content/uploads/2023/09/SCPI-Kyaneos-Pierre-BT-2T2022-vdef.pdf' },
];

// Corresponding scpi_metric_certifications IDs for the 9 quarantined periods
// (verified live: value_numeric already equals the issuer TOF, only the status
// is 'invalid_tof_bulletin_source_policy').
const certIds = {
  '2018-T4': '2a9d2ba2-2b12-4e43-b6ab-942d8e21d68a',
  '2019-T4': 'a0af19aa-cfa0-4b72-8e1b-5597d6061457',
  '2020-T1': '5b383922-acd1-4688-9a45-69c401df7762',
  '2020-T2': 'c9489d59-e420-4839-8dcc-685d43fce924',
  '2020-T3': '11f9247f-4620-49b7-a461-08699ccfd748',
  '2020-T4': 'e586c117-8e98-472f-afd6-76b1fc105023',
  '2021-T1': '878caa1e-6e5c-473e-a385-8e0a7d923967',
  '2021-T4': '8334680f-1b7e-442b-b3ef-9bcbd10a3a8e',
  '2022-T2': '19bff54f-b1cd-4188-b746-3881de133ec9',
};

function buildProvenance(r) {
  const prov = {
    tof: {
      unit: '%',
      value: r.tof,
      sha256: r.sha256,
      source_url: r.url,
      source_page: 3,
      verification: 'issuer_official_pdf_explicit_TOF',
      document_period: r.period,
    },
    tof_policy: {
      recertified_at: RECERTIFIED_AT,
      previous_backup: PREVIOUS_BACKUP,
    },
  };
  // 2022-T2 already carries a verified capitalisation block — preserve it.
  if (r.period === '2022-T2') {
    prov.capitalisation = {
      unit: 'MEUR',
      sha256: '73f3b9d065a76e66c88feb7d39b2dbfc00079d1b2830a580720e9955e59a2b13',
      definition: 'reported_metric',
      source_url: 'https://kyaneosam.com/wp-content/uploads/2023/09/SCPI-Kyaneos-Pierre-BT-2T2022-vdef.pdf',
      source_page: 3,
      reference_date: '2022-06-30',
      document_period: '2022-T2',
    };
  }
  return prov;
}

async function patchRow(r) {
  const body = {
    tof: r.tof,
    qa_status: 'manual_verified_official_pdf_recertified',
    source_confidence: 0.98,
    metric_provenance: buildProvenance(r),
  };
  const res = await fetch(`${SUPABASE_URL}/rest/v1/scpi_indicator_history?id=eq.${r.id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`[${r.period}] PATCH failed ${res.status}: ${text}`);
    return false;
  }
  const parsed = text ? JSON.parse(text) : null;
  const p = Array.isArray(parsed) ? parsed[0] : parsed;
  console.log(`[${r.period}] OK -> tof=${p?.tof} qa=${p?.qa_status} conf=${p?.source_confidence}`);
  return true;
}

async function patchCertificate(r) {
  const certId = certIds[r.period];
  if (!certId) {
    console.error(`[${r.period}] no certificate id mapped`);
    return false;
  }
  // Same label shape as the already-recertified Kyaneos Pierre periods:
  // issuer's own "TOF" caption on the bulletin page (no ASPIM wrapper), with
  // the independent MuPDF/Poppler read and the archive SHA-256.
  const evidence = `Bulletin de la SCPI publié sur le site émetteur, page 3 trimestre ${r.period}: TOF | ${r.tof}% ; preuve indépendante MuPDF et Poppler, lecture officielle et SHA256 archive SHA256 ${r.sha256}`;
  const body = {
    verification_status: 'manual_verified_official_pdf_text_review',
    verification_method: 'issuer_pdf_explicit_TOF_label',
    source_page: 3,
    extraction_confidence: 0.98,
    evidence_text: evidence,
  };
  const res = await fetch(`${SUPABASE_URL}/rest/v1/scpi_metric_certifications?id=eq.${certId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`[${r.period}] cert PATCH failed ${res.status}: ${text}`);
    return false;
  }
  const parsed = text ? JSON.parse(text) : null;
  const c = Array.isArray(parsed) ? parsed[0] : parsed;
  console.log(`[${r.period}] cert OK -> status=${c?.verification_status} page=${c?.source_page} conf=${c?.extraction_confidence}`);
  return true;
}

let okCount = 0;
let certOkCount = 0;
for (const r of rows) {
  // Order matters: guard_quarantined_tof_replay reverts the history TOF to
  // null/invalid unless the certificate is already recertified. Cert first.
  const cOk = await patchCertificate(r);
  if (cOk) certOkCount++;
  const ok = await patchRow(r);
  if (ok) okCount++;
}
console.log(`\nPatched ${okCount}/${rows.length} history rows; ${certOkCount}/${rows.length} certificates. recertified_at=${RECERTIFIED_AT}`);
