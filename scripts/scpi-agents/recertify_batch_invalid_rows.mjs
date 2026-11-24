/**
 * RECERTIFICATION — 5 SCPI, 11 périodes TOF quarantinées (invalid_tof_bulletin_source_policy).
 *
 * Chaque valeur TOF a été vérifiée indépendamment par extraction pdfplumber du
 * bulletin officiel émetteur (SHA-256 croisé avec scpi_bulletins.pdf_sha256).
 *   - 9 périodes : la valeur certifiée d'origine était déjà le vrai TOF (elle a
 *     été quarantinée pour le libellé "TOF ASPIM" ou l'absence de preuve).
 *   - cristal-life 2024-T3 : 9,27 -> 99,34 (occupés 99,18 + franchise 0,16)
 *   - cristal-life 2025-T2 : 2,23 -> 100,00 (occupés 99,51 + franchise 0,49)
 *
 * Ordre : certificat d'abord (guard_quarantined_tof_replay exige le certificat
 * déjà recertifié avant d'accepter la remise du TOF en historique).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '..', '.env.local');
const env = {};
for (const l of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2];
}
const U = env.SUPABASE_URL || 'https://ygvsddcpohsnaowofuwc.supabase.co';
const K = env.SUPABASE_SERVICE_ROLE_KEY;
const headers = { apikey: K, Authorization: `Bearer ${K}`, 'Content-Type': 'application/json', Prefer: 'return=representation' };
const RECERTIFIED_AT = new Date().toISOString();
const PREVIOUS_BACKUP = 'scpi_internal.tof_policy_quarantine_audit_20261028';

const rows = [
  { slug: 'aestiam-agora', period: '2025-T3', tof: 92.24, page: 2, sha256: '302f534025960a5c4c59fc21582d93c07eb220bf792fc0a2b846c11cd14f7602', url: 'https://www.aestiam.com/doc/agora/periodique/2025-3t-bti-aestiam-agora.pdf', certId: '59c5fe57-eecf-4210-8ea0-c7cb58ffb1c7', histId: '98370020-88f8-48dc-a69c-3d35fecf81ab' },
  { slug: 'aestiam-horizon', period: '2023-T1', tof: 94.03, page: 2, sha256: '94b4b920fa5daced34780a06df2f78e84914de9cd87c40069367dde0a6562ad2', url: 'https://aestiam.com/wp-content/uploads/2023/07/app-1t2023-bulletin-trimestriel.pdf', certId: '2f4ac8b0-904a-4d8d-a7fe-fb8eb91c1e16', histId: 'dfce4d4f-2e0f-4f87-9200-309db3bbe9db' },
  { slug: 'aestiam-horizon', period: '2023-T2', tof: 91.9, page: 2, sha256: 'db80ff7a0da9097f7b693d26acc0c1aa4a367f1b2ff49222004ebbdcb660a13d', url: 'https://www.aestiam.com/doc/app/periodique/2023-2t-bti-aestiam-placement-pierre.pdf', certId: 'd6a84980-2c29-459e-a14b-4e99c6e7b400', histId: 'bc49cadb-b4b6-4d05-b179-8077c39d787d' },
  { slug: 'aestiam-horizon', period: '2023-T4', tof: 91.47, page: 2, sha256: '52fcfcbab36689c1ee207441b87dd6f846299c48dc325b5f2660fbea15ca1661', url: 'https://www.aestiam.com/doc/app/periodique/2023-4t-bti-aestiam-placement-pierre.pdf', certId: '68625183-4cdb-4a9c-8b9d-5e46a75411b1', histId: '485a8af5-e1bb-4609-8e70-f621a27bf3be' },
  { slug: 'aestiam-horizon', period: '2024-T4', tof: 92.52, page: 2, sha256: 'fc4e2d0bb69d2ddc5954e30eec5ce2074758a51c9c84102c1e9f128b966a5cbc', url: 'https://www.aestiam.com/doc/prv/periodique/2024-4t-bti-pierrevenus.pdf', certId: '234e92ba-056d-4262-bae7-9e52ce6cf0c4', histId: '7d27a455-fe00-4e54-83df-a7ddc2f10579' },
  { slug: 'aestiam-horizon', period: '2025-T2', tof: 86.9, page: 1, sha256: '0e94df184e3ee491616546c7cdcb0ffa60c9898ee76e6a5fb90ca3055bbd55db', url: 'https://www.aestiam.com/doc/horizon/periodique/2025-2t-bti-aestiam-placement-pierre.pdf', certId: '4b19ad54-2a84-49a9-b348-b477ef2f0b91', histId: 'd792824d-bad6-4ce1-800f-5339a2afafbf' },
  { slug: 'aestiam-horizon', period: '2025-T3', tof: 86.5, page: 2, sha256: '319b819f4c1bc1fe61e7caf38f419769b440ba647eaf9dea806292d1c1f65fd7', url: 'https://www.aestiam.com/doc/horizon/periodique/2025-3t-bti-aestiam-horizon.pdf', certId: 'ffd7f9a0-8129-47e7-b648-4a72937eeb27', histId: 'b48e7c97-8b93-4135-bbb0-90aec10c1926' },
  { slug: 'altixia-cadence-12', period: '2026-T2', tof: 92.4, page: 2, sha256: '615fb9558ae83874716c928fa4ef2ec06da2028b7effa67bb6d65d51dfd425f1', url: 'https://api.rock-n-data.io/fichiers/publications/6a708fd02b6f8415260897.pdf', certId: 'd1a1e283-630f-444e-bf6c-7c56bc03dfe3', histId: '90c4d480-512e-47e1-b6da-d357debc43ce' },
  { slug: 'cristal-life', period: '2024-T3', tof: 99.34, page: 3, sha256: '85519764d60087fcb060aa8fe7fe551c98109326259013c6410b19ef1066aba8', url: 'https://corpocdn.blob.core.windows.net/blobfiles/IG_CLBulletin_Trimestriel3T2024.pdf', certId: 'd4368191-7a96-4f04-85d8-eae486a5daea', histId: '633a7384-dee3-426f-9cc5-84a11f99f5d5' },
  { slug: 'cristal-life', period: '2025-T2', tof: 100.0, page: 3, sha256: '182dd52c42d044a98af242ae89f102f44caae101143a5a5bba3f650429577461', url: 'https://corpocdn.blob.core.windows.net/blobfiles/IG_CLBulletin_Trimestriel2025_T2.pdf', certId: 'e7377784-d53a-49d7-ae5a-131974ba2a70', histId: '6d31c359-e4dd-4ee0-b8c6-35ffc2e2d6f7' },
  { slug: 'cristal-rente', period: '2026-T2', tof: 99.42, page: 3, sha256: 'd3cdc6ce4955a226accf191df1c1a9a2ffda38605f1bece8d76cac9761fe680a', url: 'https://corpocdn.blob.core.windows.net/blobfiles/IG_CRBulletin_Trimestriel2026_T2_V2_.pdf', certId: 'b83dd62d-d2f9-4ad8-a935-70a0ee96d89c', histId: '51ba325e-42dc-4fdc-ad78-ae3c4673a72c' },
];

function label(v) {
  return (Math.round(v * 100) / 100).toString().replace('.', ',');
}

function evidence(r) {
  return `Taux d'occupation financier (TOF) ${label(r.tof)} % — bulletin officiel ${r.slug} ${r.period}, page ${r.page}. Lecture officielle du bulletin émetteur, SHA256 archive SHA256 ${r.sha256}`;
}

function provenance(r) {
  return {
    tof: { unit: '%', value: r.tof, sha256: r.sha256, source_url: r.url, source_page: r.page, verification: 'issuer_official_pdf_explicit_TOF', document_period: r.period },
    tof_policy: { recertified_at: RECERTIFIED_AT, previous_backup: PREVIOUS_BACKUP },
  };
}

async function patchCert(r) {
  const body = {
    value_numeric: r.tof,
    verification_status: 'manual_verified_official_pdf_text_review',
    verification_method: 'issuer_pdf_explicit_TOF_label',
    source_page: r.page,
    extraction_confidence: 0.98,
    evidence_text: evidence(r),
  };
  const res = await fetch(`${U}/rest/v1/scpi_metric_certifications?id=eq.${r.certId}`, { method: 'PATCH', headers, body: JSON.stringify(body) });
  const text = await res.text();
  if (!res.ok) { console.error(`[${r.slug} ${r.period}] cert FAIL ${res.status}: ${text}`); return false; }
  const j = text ? JSON.parse(text) : null;
  const c = Array.isArray(j) ? j[0] : j;
  console.log(`[${r.slug} ${r.period}] cert OK -> value=${c?.value_numeric} status=${c?.verification_status} page=${c?.source_page}`);
  return c?.value_numeric === r.tof;
}

async function patchHist(r) {
  const body = { tof: r.tof, qa_status: 'manual_verified_official_pdf_recertified', source_confidence: 0.98, metric_provenance: provenance(r) };
  const res = await fetch(`${U}/rest/v1/scpi_indicator_history?id=eq.${r.histId}`, { method: 'PATCH', headers, body: JSON.stringify(body) });
  const text = await res.text();
  if (!res.ok) { console.error(`[${r.slug} ${r.period}] hist FAIL ${res.status}: ${text}`); return false; }
  const j = text ? JSON.parse(text) : null;
  const h = Array.isArray(j) ? j[0] : j;
  console.log(`[${r.slug} ${r.period}] hist OK -> tof=${h?.tof} qa=${h?.qa_status}`);
  return h?.tof === r.tof;
}

let c = 0, hh = 0;
for (const r of rows) {
  if (await patchCert(r)) c++;
  if (await patchHist(r)) hh++;
}
console.log(`\nDone: ${c}/${rows.length} certs; ${hh}/${rows.length} history. recertified_at=${RECERTIFIED_AT}`);
