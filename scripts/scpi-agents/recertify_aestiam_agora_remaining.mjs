/**
 * aestiam-agora — 3 périodes restantes (2024-T2, 2024-T4, 2025-T2).
 * Valeurs TOF vérifiées par extraction pdfplumber du bulletin officiel Agora
 * (ex Aestiam Pierre Rendement) ; SHA-256 recalculés :
 *   2024-T2 = 95,23 (occupés 94,83 + franchise 0,40)
 *   2024-T4 = 93,11 (occupés 88,51 + franchise 4,60)
 *   2025-T2 = 92,11 (occupés 89,13 + franchise 2,98)  [cert d'origine 88,42 était
 *             le bulletin Pierre Venus, mauvaise SCPI -> corrigé]
 * Ordre : certificat d'abord, puis INSERT historique.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const env = {};
for (const l of fs.readFileSync(path.join(__dirname, '..', '..', '.env.local'), 'utf8').split(/\r?\n/)) {
  const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2];
}
const U = env.SUPABASE_URL || 'https://ygvsddcpohsnaowofuwc.supabase.co';
const K = env.SUPABASE_SERVICE_ROLE_KEY;
const headers = { apikey: K, Authorization: `Bearer ${K}`, 'Content-Type': 'application/json', Prefer: 'return=representation' };
const RECERTIFIED_AT = new Date().toISOString();

const rows = [
  { period: '2024-T2', tof: 95.23, page: 2, sha256: 'bbdf01020da8c751b6df14fb439be9a2eac504e0114f56531d1a3365d64c8d72', url: 'https://www.aestiam.com/doc/agora/periodique/2024-2t-bti-aestiam-pierre-rendement.pdf', certId: '63bb3367-ffe2-4006-bae9-21703a75f3b8', docLabel: 'T2 2024' },
  { period: '2024-T4', tof: 93.11, page: 2, sha256: '413ea8d8a5bc49c98a29ffe2b8d52d7f0057a29224fdf946685036e8c125eead', url: 'https://www.aestiam.com/doc/agora/periodique/2024-4t-bti-aestiam-pierre-rendement.pdf', certId: '5712c876-7c30-4693-b751-59cf6bd19869', docLabel: 'T4 2024' },
  { period: '2025-T2', tof: 92.11, page: 2, sha256: '0e1e52ff1383b871eccf33adc45abcd6e44c355a3e0922c5f24966c062eb1b25', url: 'https://www.aestiam.com/doc/agora/periodique/2025-2t-bti-aestiam-pierre-rendement.pdf', certId: '4377079b-9747-4810-8035-0bd33ca3b911', docLabel: 'T2 2025' },
];

function label(v) { return (Math.round(v * 100) / 100).toString().replace('.', ','); }

async function patchCert(r) {
  const evidence = `Taux d'occupation financier (TOF) ${label(r.tof)} % — bulletin officiel aestiam-agora ${r.period}, page ${r.page}. Lecture officielle du bulletin émetteur, SHA256 archive SHA256 ${r.sha256}`;
  const body = {
    value_numeric: r.tof,
    source_url: r.url,
    verification_status: 'manual_verified_official_pdf_text_review',
    verification_method: 'issuer_pdf_explicit_TOF_label',
    source_page: r.page,
    extraction_confidence: 0.98,
    evidence_text: evidence,
  };
  const res = await fetch(`${U}/rest/v1/scpi_metric_certifications?id=eq.${r.certId}`, { method: 'PATCH', headers, body: JSON.stringify(body) });
  const t = await res.text();
  if (!res.ok) { console.error(`[${r.period}] cert FAIL ${res.status}: ${t}`); return false; }
  const j = t ? JSON.parse(t) : null;
  const c = Array.isArray(j) ? j[0] : j;
  console.log(`[${r.period}] cert OK -> value=${c?.value_numeric} status=${c?.verification_status} url=${c?.source_url?.slice(-40)}`);
  return c?.value_numeric === r.tof && c?.verification_status?.startsWith('manual_verified');
}

async function upsertHist(r) {
  const getRes = await fetch(`${U}/rest/v1/scpi_indicator_history?scpi_slug=eq.aestiam-agora&source_period=eq.${r.period}&select=id`, { headers: { apikey: K, Authorization: `Bearer ${K}` } });
  const existing = await getRes.json();
  const provenance = {
    tof: { unit: '%', value: r.tof, sha256: r.sha256, source_url: r.url, source_page: r.page, verification: 'issuer_official_pdf_explicit_TOF', document_period: r.period },
    tof_policy: { recertified_at: RECERTIFIED_AT, previous_backup: 'scpi_internal.tof_policy_quarantine_audit_20261028' },
  };
  if (Array.isArray(existing) && existing.length > 0) {
    const body = { tof: r.tof, qa_status: 'manual_verified_official_pdf_recertified', source_confidence: 0.98, metric_provenance: provenance };
    const res = await fetch(`${U}/rest/v1/scpi_indicator_history?id=eq.${existing[0].id}`, { method: 'PATCH', headers, body: JSON.stringify(body) });
    const t = await res.text();
    if (!res.ok) { console.error(`[${r.period}] hist PATCH FAIL ${res.status}: ${t}`); return false; }
    console.log(`[${r.period}] hist UPDATE OK`);
    return true;
  }
  const body = {
    scpi_slug: 'aestiam-agora',
    source_period: r.period,
    source_type: 'official_bulletin_historical',
    source_document: `Aestiam Agora | Bulletin trimestriel ${r.docLabel}`,
    source_url: r.url,
    tof: r.tof,
    qa_status: 'manual_verified_official_pdf_recertified',
    source_confidence: 0.98,
    snapshot_at: new Date().toISOString(),
    metric_provenance: provenance,
  };
  const res = await fetch(`${U}/rest/v1/scpi_indicator_history`, { method: 'POST', headers, body: JSON.stringify(body) });
  const t = await res.text();
  if (!res.ok) { console.error(`[${r.period}] hist INSERT FAIL ${res.status}: ${t}`); return false; }
  console.log(`[${r.period}] hist INSERT OK`);
  return true;
}

let c = 0, hh = 0;
for (const r of rows) {
  if (await patchCert(r)) c++;
  if (await upsertHist(r)) hh++;
}
console.log(`\nDone: ${c}/${rows.length} certs; ${hh}/${rows.length} history.`);
