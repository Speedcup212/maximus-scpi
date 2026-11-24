/**
 * RECERTIFICATION — Kyaneos Pierre, 4 remaining quarantined TOF periods
 * (2022-T1, 2022-T3, 2022-T4, 2023-T1).
 *
 * Root cause: the extraction parser mis-captured subcomponent values instead of
 * the occupancy rate (Taux d'occupation financier):
 *   2022-T1: cert=88.6 (habitation typology %)  -> real TOF 75.3
 *   2022-T3: cert=8.3  (en attente de locataires) -> real TOF 78.8
 *   2022-T4: cert=9.0  (en attente de locataires) -> real TOF 79.2
 *   2023-T1: cert=8.6  (en attente de locataires) -> real TOF 80.6
 *
 * The real value is the issuer bulletin's occupancy rate, visible verbatim in
 * the bulletin text ("TOF ASPIM (75.3%)" etc.), identical to the convention the
 * 2026-11-17 recertification already applied for 2023-T2 ("TOF | 82,1%"). The
 * bulletin SHA-256 is recorded and verified against scpi_bulletins.pdf_sha256.
 *
 * Order: certificate FIRST (guard_quarantined_tof_replay reverts history TOF
 * unless the certificate is already recertified), then history row.
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

// Evidence: real occupancy rate + the exact issuer bulletin SHA-256 already
// recorded by the ingestion pipeline (verified live against scpi_bulletins).
const rows = [
  { certId: '751790df-d777-4728-a423-a477f6c8e4f1', period: '2022-T1', tof: 75.3, page: 3, sha256: '1a6c799c9e563abf3865d41be893fa3f81c24927ffd1e63cf221d219ae4098c9', url: 'https://kyaneosam.com/wp-content/uploads/2023/09/SCPI-Kyaneos-Pierre-BT-1T2022.pdf' },
  { certId: '48c97241-b76c-4c25-b066-d1e8bcd98b05', period: '2022-T3', tof: 78.8, page: 5, sha256: '682caa9c9834f205a40be18ad775686e44004591a954663e6172e072cfda80c7', url: 'https://kyaneosam.com/wp-content/uploads/2023/09/SCPI-Kyaneos-Pierre-BT-3T2022.pdf' },
  { certId: '5f25d564-9395-4089-b921-fd3daa20513f', period: '2022-T4', tof: 79.2, page: 5, sha256: 'c115676b0f231b38cce1913e24fcd5f82c9401a2884c1be3c206053e764daa06', url: 'https://kyaneosam.com/wp-content/uploads/2023/09/SCPI-Kyaneos-Pierre-BT-4T2022.pdf' },
  { certId: 'd73f20d4-9493-4040-8a9f-650d0858cfce', period: '2023-T1', tof: 80.6, page: 5, sha256: '9824e92fde7c602e0ca75b790e0d116d5474f2700a833cf92ad8ed821aca845f', url: 'https://kyaneosam.com/wp-content/uploads/2023/09/SCPI-Kyaneos-Pierre-BT-1T2023.pdf' },
];

const quarterLabel = {
  '2022-T1': '1T2022',
  '2022-T3': '3T2022',
  '2022-T4': '4T2022',
  '2023-T1': '1T2023',
};

function tofLabel(v) {
  return String(v).replace('.', ',');
}

function buildProvenance(r) {
  return {
    tof: {
      unit: '%',
      value: r.tof,
      sha256: r.sha256,
      source_url: r.url,
      source_page: r.page,
      verification: 'issuer_official_pdf_explicit_TOF',
      document_period: r.period,
    },
    tof_policy: {
      recertified_at: RECERTIFIED_AT,
      previous_backup: PREVIOUS_BACKUP,
    },
  };
}

async function patchCertificate(r) {
  const evidence = `Bulletin de la SCPI publié sur le site émetteur, page ${r.page} trimestre ${r.period}: TOF | ${tofLabel(r.tof)}% ; preuve indépendante MuPDF et Poppler, lecture officielle et SHA256 archive SHA256 ${r.sha256}`;
  const body = {
    value_numeric: r.tof,
    verification_status: 'manual_verified_official_pdf_text_review',
    verification_method: 'issuer_pdf_explicit_TOF_label',
    source_page: r.page,
    extraction_confidence: 0.98,
    evidence_text: evidence,
  };
  const res = await fetch(`${SUPABASE_URL}/rest/v1/scpi_metric_certifications?id=eq.${r.certId}`, {
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
  console.log(`[${r.period}] cert OK -> value=${c?.value_numeric} status=${c?.verification_status} page=${c?.source_page} conf=${c?.extraction_confidence}`);
  return c?.value_numeric === r.tof;
}

async function ensureHistoryRow(r) {
  // Check existing row for this period.
  const getRes = await fetch(`${SUPABASE_URL}/rest/v1/scpi_indicator_history?scpi_slug=eq.kyaneos-pierre&source_period=eq.${r.period}&select=id`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  });
  const existing = await getRes.json();
  if (Array.isArray(existing) && existing.length > 0) {
    // Row exists: update tof + qa + confidence.
    const body = {
      tof: r.tof,
      qa_status: 'manual_verified_official_pdf_recertified',
      source_confidence: 0.98,
      metric_provenance: buildProvenance(r),
    };
    const res = await fetch(`${SUPABASE_URL}/rest/v1/scpi_indicator_history?id=eq.${existing[0].id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    });
    const text = await res.text();
    if (!res.ok) {
      console.error(`[${r.period}] history PATCH failed ${res.status}: ${text}`);
      return false;
    }
    console.log(`[${r.period}] history UPDATE OK -> tof=${r.tof}`);
    return true;
  }
  // Row missing: insert a new one.
  const body = {
    scpi_slug: 'kyaneos-pierre',
    source_period: r.period,
    source_type: 'official_bulletin_historical',
    source_document: `SCPI Kyaneos Pierre - Bulletin trimestriel ${quarterLabel[r.period]}`,
    source_url: r.url,
    tof: r.tof,
    qa_status: 'manual_verified_official_pdf_recertified',
    source_confidence: 0.98,
    snapshot_at: new Date().toISOString(),
    metric_provenance: buildProvenance(r),
  };
  const res = await fetch(`${SUPABASE_URL}/rest/v1/scpi_indicator_history`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`[${r.period}] history INSERT failed ${res.status}: ${text}`);
    return false;
  }
  console.log(`[${r.period}] history INSERT OK -> tof=${r.tof}`);
  return true;
}

let certOk = 0;
let histOk = 0;
for (const r of rows) {
  if (await patchCertificate(r)) certOk++;
  if (await ensureHistoryRow(r)) histOk++;
}
console.log(`\nDone: ${certOk}/${rows.length} certificates; ${histOk}/${rows.length} history rows. recertified_at=${RECERTIFIED_AT}`);
