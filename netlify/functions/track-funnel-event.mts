import type { Config } from '@netlify/functions';
import { createAdminClient } from './_invite-utils';

const ALLOWED_EVENTS = new Set([
  'quiz_started',
  'quiz_step_1_completed',
  'quiz_step_2_completed',
  'quiz_step_3_completed',
  'quiz_completed',
  'analysis_opened',
  'scpi_detail_opened',
  'portfolio_validation_clicked',
  'lead_form_submitted',
  'calendly_opened',
  'calendly_booking_completed',
]);

const ALLOWED_METADATA_KEYS = new Set([
  'step',
  'source',
  'scpi_id',
  'scpi_name',
  'portfolio_size',
  'form_type',
  'action',
  'lead_request_id',
]);

const cleanMetadata = (input: unknown): Record<string, string | number | boolean | null> => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {};

  const entries = Object.entries(input as Record<string, unknown>)
    .filter(([key]) => ALLOWED_METADATA_KEYS.has(key))
    .flatMap(([key, value]) => {
      if (value === null) return [[key, null] as const];
      if (typeof value === 'boolean' || typeof value === 'number') return [[key, value] as const];
      if (typeof value === 'string') return [[key, value.slice(0, 160)] as const];
      return [];
    });

  return Object.fromEntries(entries);
};

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const payload = await req.json() as {
      event_name?: unknown;
      session_id?: unknown;
      path?: unknown;
      metadata?: unknown;
    };

    if (typeof payload.event_name !== 'string' || !ALLOWED_EVENTS.has(payload.event_name)) {
      return Response.json({ error: 'Invalid event' }, { status: 400 });
    }

    if (typeof payload.session_id !== 'string' || payload.session_id.length < 10 || payload.session_id.length > 100) {
      return Response.json({ error: 'Invalid session' }, { status: 400 });
    }

    const path = typeof payload.path === 'string' ? payload.path.slice(0, 240) : null;
    const metadata = cleanMetadata(payload.metadata);

    const supabase = createAdminClient();
    const { error } = await supabase.from('funnel_events').insert({
      event_name: payload.event_name,
      session_id: payload.session_id,
      path,
      metadata,
    });

    if (error) {
      console.error('[track-funnel-event] insert failed', error.message);
      return Response.json({ error: 'Insert failed' }, { status: 500 });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('[track-funnel-event] unexpected error', error instanceof Error ? error.message : String(error));
    return Response.json({ error: 'Invalid payload' }, { status: 400 });
  }
};

export const config: Config = {
  path: '/api/funnel-event',
};
