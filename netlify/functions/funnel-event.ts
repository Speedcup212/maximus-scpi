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
]);
const METADATA_KEYS = new Set([
  'step', 'source', 'scpi_id', 'scpi_name', 'portfolio_size',
  'form_type', 'action', 'lead_request_id', 'amount',
  'yield_rate', 'origin', 'horizon', 'threshold',
]);
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
      metadata[key] = value;
    } else if (typeof value === 'number' && Number.isFinite(value)) {
      metadata[key] = value;
    } else if (typeof value === 'boolean' || value === null) {
      metadata[key] = value;
    } else {
      return respond(400, 'invalid_metadata_value');
    }
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !secret || !/^https:\/\/[a-z0-9.-]+$/i.test(supabaseUrl.replace(/\/$/, ''))) {
    return respond(503, 'analytics_unavailable');
  }
  try {
    const result = await fetch(
      supabaseUrl.replace(/\/$/, '') + '/rest/v1/funnel_events',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: secret,
          Authorization: 'Bearer ' + secret,
          Prefer: 'return=minimal',
        },
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
