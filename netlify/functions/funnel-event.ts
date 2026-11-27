import type { Handler } from '@netlify/functions';

// Reconnect the EXISTING funnel_events audit table. No new tracking service,
// anonymous INSERT policy or public Supabase credential is introduced.
const ALLOWED_ORIGINS = new Set([
  'https://maximusscpi.com',
  'https://www.maximusscpi.com',
]);
const EVENTS = new Set([
  'quiz_started',
  'quiz_step_1_completed',
  'quiz_step_2_completed',
  'quiz_step_3_completed',
  'quiz_completed',
  'analysis_opened',
  'scpi_detail_opened',
  'hero_portfolio_clicked',
  'portfolio_validation_clicked',
  'simulation_start',
  'simulation_result',
  'qualified_50k',
  'rdv_click',
  'lead_form_opened',
  'lead_form_submitted',
  'calendly_opened',
  'calendly_booking_completed',
  'simulation_email_viewed',
  'simulation_email_submitted',
  'simulation_email_calendly_clicked',
]);
const METADATA_KEYS = new Set([
  'step', 'source', 'scpi_id', 'scpi_name', 'portfolio_size',
  'form_type', 'action', 'lead_request_id', 'amount',
  'yield_rate', 'origin', 'horizon', 'threshold',
  'utm_source', 'utm_medium', 'utm_campaign',
  'tranche_montant', 'consent_marketing', 'measurement',
]);
// RECOVERY-203 — seule valeur admise : mesure d'audience exemptée de
// consentement. Les lignes sans cette clé restent les lignes consenties.
const MEASUREMENT_MODES = new Set(['exempt']);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const COMMON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
};
const respond = (statusCode: number, code: string) => ({
  statusCode,
  headers: COMMON_HEADERS,
  body: JSON.stringify({ error: code }),
});

// JWT legacy (3 segments) → apikey + Bearer ; clé opaque (1 segment, ex. sb_secret_*) → apikey seul.
// Envoyer une clé opaque en `Authorization: Bearer` échoue (« Invalid JWT »).
const supabaseHeaders = (key: string, extra: Record<string, string> = {}): Record<string, string> =>
  key.split('.').length === 3
    ? { apikey: key, Authorization: 'Bearer ' + key, ...extra }
    : { apikey: key, ...extra };

// Empreinte SHA-256 tronquée à 12 hexadécimaux — jamais la valeur de la clé.
// Doit être IDENTIQUE à `printf %s "$VALEUR" | sha256sum | cut -c1-12`, sans quoi le
// recoupement de §7.7 produirait un faux « la clé utilisée n'est pas la nouvelle ».
// Web Crypto en source primaire ; repli SHA-256 pur JS (jamais un autre algorithme :
// une empreinte qui ne se recalcule pas comme la procédure documentée n'est pas une preuve).
const SHA256_K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];
const rotr32 = (value: number, bits: number): number => (value >>> bits) | (value << (32 - bits));
// Encodage UTF-8 manuel : le repli doit rester exécutable dans un contexte isolé
// dépourvu de `TextEncoder` (VM de test), sinon la preuve disparaît exactement là
// où elle n'est pas couverte par Web Crypto.
const utf8Bytes = (input: string): number[] => {
  const bytes: number[] = [];
  for (let index = 0; index < input.length; index += 1) {
    let code = input.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff && index + 1 < input.length) {
      const next = input.charCodeAt(index + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        code = 0x10000 + ((code - 0xd800) << 10) + (next - 0xdc00);
        index += 1;
      }
    }
    if (code < 0x80) bytes.push(code);
    else if (code < 0x800) bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    else if (code < 0x10000) bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    else bytes.push(
      0xf0 | (code >> 18), 0x80 | ((code >> 12) & 0x3f),
      0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f),
    );
  }
  return bytes;
};
const sha256Hex = (input: string): string => {
  const bytes = utf8Bytes(input);
  const bitLength = bytes.length * 8;
  const paddedLength = ((bytes.length + 8) >> 6) * 64 + 64;
  const padded = new Uint8Array(paddedLength);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLength - 8, Math.floor(bitLength / 0x100000000), false);
  view.setUint32(paddedLength - 4, bitLength >>> 0, false);

  const hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];
  const schedule = new Uint32Array(64);
  for (let offset = 0; offset < paddedLength; offset += 64) {
    for (let index = 0; index < 16; index += 1) {
      schedule[index] = view.getUint32(offset + index * 4, false);
    }
    for (let index = 16; index < 64; index += 1) {
      const s0 = rotr32(schedule[index - 15], 7) ^ rotr32(schedule[index - 15], 18) ^ (schedule[index - 15] >>> 3);
      const s1 = rotr32(schedule[index - 2], 17) ^ rotr32(schedule[index - 2], 19) ^ (schedule[index - 2] >>> 10);
      schedule[index] = (schedule[index - 16] + s0 + schedule[index - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, h] = hash;
    for (let index = 0; index < 64; index += 1) {
      const sigma1 = rotr32(e, 6) ^ rotr32(e, 11) ^ rotr32(e, 25);
      const choose = ((e & f) ^ (~e & g)) >>> 0;
      const temp1 = (h + sigma1 + choose + SHA256_K[index] + schedule[index]) >>> 0;
      const sigma0 = rotr32(a, 2) ^ rotr32(a, 13) ^ rotr32(a, 22);
      const majority = ((a & b) ^ (a & c) ^ (b & c)) >>> 0;
      const temp2 = (sigma0 + majority) >>> 0;
      h = g; g = f; f = e; e = (d + temp1) >>> 0;
      d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
    }
    hash[0] = (hash[0] + a) >>> 0; hash[1] = (hash[1] + b) >>> 0;
    hash[2] = (hash[2] + c) >>> 0; hash[3] = (hash[3] + d) >>> 0;
    hash[4] = (hash[4] + e) >>> 0; hash[5] = (hash[5] + f) >>> 0;
    hash[6] = (hash[6] + g) >>> 0; hash[7] = (hash[7] + h) >>> 0;
  }
  return hash.map((word) => word.toString(16).padStart(8, '0')).join('');
};
const keyFingerprint = async (value: string): Promise<string> => {
  try {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, 12);
  } catch {
    return sha256Hex(value).slice(0, 12);
  }
};
type EventPayload = {
  event_name?: unknown;
  session_id?: unknown;
  path?: unknown;
  metadata?: unknown;
};

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return respond(405, 'method_not_allowed');

  // Same-origin calls only. Do not open this service-role-backed endpoint to CORS.
  const origin = event.headers.origin || event.headers.Origin;
  if (!origin || !ALLOWED_ORIGINS.has(origin)) return respond(403, 'origin_not_allowed');

  const body = event.body || '';
  if (Buffer.byteLength(body, 'utf8') > 4096) return respond(413, 'payload_too_large');

  let parsed: EventPayload;
  try {
    parsed = JSON.parse(body) as EventPayload;
  } catch {
    return respond(400, 'invalid_json');
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return respond(400, 'invalid_payload');
  }
  const eventName = parsed.event_name;
  const sessionId = parsed.session_id;
  const pagePath = parsed.path;
  if (typeof eventName !== 'string' || !EVENTS.has(eventName) ||
      typeof sessionId !== 'string' || !UUID.test(sessionId) ||
      typeof pagePath !== 'string' || !/^\/(?!\/)[^?#]*$/.test(pagePath) ||
      pagePath.length > 240) {
    return respond(400, 'invalid_event');
  }

  const submittedMetadata = parsed.metadata;
  if (submittedMetadata != null && (
    typeof submittedMetadata !== 'object' || Array.isArray(submittedMetadata)
  )) return respond(400, 'invalid_metadata');

  const metadata: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(submittedMetadata || {})) {
    // Fail closed on unrecognized keys, especially emails and other PII.
    if (!METADATA_KEYS.has(key)) return respond(400, 'unexpected_metadata');
    if (typeof value === 'string') {
      if (value.length > 160) return respond(400, 'oversized_metadata');
      if (key === 'lead_request_id' && !UUID.test(value)) return respond(400, 'invalid_request_id');
      if (key === 'measurement' && !MEASUREMENT_MODES.has(value)) return respond(400, 'invalid_measurement');
      metadata[key] = value;
    } else if (typeof value === 'number' && Number.isFinite(value)) {
      metadata[key] = value;
    } else if (typeof value === 'boolean' || value === null) {
      metadata[key] = value;
    } else {
      return respond(400, 'invalid_metadata_value');
    }
  }
  if ('measurement' in metadata && typeof metadata.measurement !== 'string') {
    return respond(400, 'invalid_measurement');
  }
  // Une mesure exemptée ne doit jamais être reliée à une fiche de contact.
  if (metadata.measurement === 'exempt' && 'lead_request_id' in metadata) {
    return respond(400, 'exempt_with_lead_reference');
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  // Nouvelle clé backend (sb_secret_*) prioritaire, repli transitoire legacy.
  // Source ET empreinte journalisées (jamais la valeur) : le `fp=` est la seule
  // pièce qui permette au contrôle indépendant de vérifier, dans §7.7 du handoff,
  // que la clé effectivement consommée est bien la nouvelle. Sans elle, un repli
  // legacy silencieux reste indétectable et la panne n'apparaît qu'à la révocation.
  // Self-contained (pas d'import local) pour rester exécutable en VM par les tests.
  const secret =
    process.env.SUPABASE_SERVICE_ROLE_KEY_NEW ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;
  const secretSource = process.env.SUPABASE_SERVICE_ROLE_KEY_NEW
    ? 'SUPABASE_SERVICE_ROLE_KEY_NEW'
    : 'SUPABASE_SERVICE_ROLE_KEY';
  if (secret) {
    const fp = await keyFingerprint(secret);
    const line = `[key-source] service <- ${secretSource}`
      + (process.env.SUPABASE_SERVICE_ROLE_KEY_NEW ? '' : ' (repli legacy)')
      + ` (fp=${fp})`;
    if (process.env.SUPABASE_SERVICE_ROLE_KEY_NEW) console.log(line);
    else console.warn(line);
  } else {
    console.error('[key-source] service <- aucune clé (SUPABASE_SERVICE_ROLE_KEY_NEW / SUPABASE_SERVICE_ROLE_KEY)');
  }
  if (!supabaseUrl || !secret || !/^https:\/\/[a-z0-9.-]+$/i.test(supabaseUrl.replace(/\/$/, ''))) {
    return respond(503, 'analytics_unavailable');
  }
  try {
    const result = await fetch(
      supabaseUrl.replace(/\/$/, '') + '/rest/v1/funnel_events',
      {
        method: 'POST',
        headers: supabaseHeaders(secret, {
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        }),
        body: JSON.stringify({
          event_name: eventName,
          session_id: sessionId,
          path: pagePath,
          metadata,
        }),
      },
    );
    if (!result.ok) {
      // Do not print secrets, session IDs or contact details in function logs.
      console.error('[funnel-event] Supabase insert refused:', result.status);
      return respond(502, 'analytics_write_failed');
    }
    return { statusCode: 204, headers: COMMON_HEADERS, body: '' };
  } catch {
    return respond(502, 'analytics_write_failed');
  }
};
