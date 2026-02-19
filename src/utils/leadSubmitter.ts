/**
 * Centralized lead submission — writes to public.contact_submissions.
 * Every form on the site should call submitLead() instead of inserting
 * directly into scattered tables.
 *
 * Table uses flat columns (email, nom, prenom, telephone, utm_*)
 * — no JSONB for identity/tracking.
 */

export type LeadChannel =
  | 'scpi_page'
  | 'comparateur'
  | 'profil_investisseur'
  | 'contact'
  | 'partner'
  | 'access'
  | 'souscription'
  | 'lead_magnet';

export type LeadFormType =
  | 'lead_pdf'
  | 'lead_contact'
  | 'lead_rdv'
  | 'lead_simulation'
  | 'lead_partner'
  | 'lead_access_request'
  | 'lead_souscription'
  | 'lead_magnet';

export interface LeadIdentity {
  nom?: string | number | null;
  prenom?: string | number | null;
  email: string;
  telephone?: string | number | null;
}

export interface LeadPayload {
  channel: LeadChannel;
  form_type: LeadFormType;
  context_type?: string;
  context_slug?: string;
  identity: LeadIdentity;
  message?: string;
  answers?: Record<string, unknown>;
}

export interface LeadResult {
  ok: boolean;
  request_id: string;
  error?: string;
}

// ── Sanitization ──────────────────────────────────────────

function toStringOrNull(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s.length > 0 ? s : null;
}

function sanitizePhone(v: unknown): string | null {
  const raw = toStringOrNull(v);
  if (!raw) return null;
  return raw.replace(/[^\d+\s.\-()]/g, '').trim() || null;
}

// ── Tracking ──────────────────────────────────────────────

function getTracking() {
  const url = new URLSearchParams(window.location.search);
  const get = (key: string) =>
    sessionStorage.getItem(key) || url.get(key) || null;

  return {
    utm_source: get('utm_source'),
    utm_medium: get('utm_medium'),
    utm_campaign: get('utm_campaign'),
    gclid: get('gclid'),
    referrer: document.referrer || null,
    page_url: window.location.pathname,
  };
}

// ── Main ──────────────────────────────────────────────────

export async function submitLead(payload: LeadPayload): Promise<LeadResult> {
  const requestId = crypto.randomUUID();

  const email = String(payload.identity.email ?? '').trim().toLowerCase();
  const nom = toStringOrNull(payload.identity.nom);
  const prenom = toStringOrNull(payload.identity.prenom);
  const telephone = sanitizePhone(payload.identity.telephone);
  const tracking = getTracking();

  if (import.meta.env.DEV) {
    console.log('[lead]', {
      request_id: requestId,
      channel: payload.channel,
      form_type: payload.form_type,
      context_slug: payload.context_slug,
      email, nom, prenom, telephone,
    });
  }

  const { supabase } = await import('../supabaseClient');
  if (!supabase) {
    return { ok: false, request_id: requestId, error: 'Supabase not configured' };
  }

  const row = {
    request_id: requestId,
    channel: payload.channel,
    context_type: payload.context_type ?? null,
    context_slug: payload.context_slug ?? null,
    form_type: payload.form_type,

    email,
    nom,
    prenom,
    telephone,

    message: payload.message ?? null,
    answers: payload.answers ?? {},

    utm_source: tracking.utm_source,
    utm_medium: tracking.utm_medium,
    utm_campaign: tracking.utm_campaign,
    gclid: tracking.gclid,
    referrer: tracking.referrer,
    page_url: tracking.page_url,

    status: 'new',
  };

  const { error } = await supabase
    .from('contact_submissions')
    .insert([row]);

  if (error) {
    console.error('[leadSubmitter] Insert failed:', error.message);

    try {
      await fetch('/.netlify/functions/lead-fallback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: requestId,
          source_form: payload.form_type,
          source_page: window.location.pathname,
          email, nom, telephone,
          payload: row,
        }),
      });
    } catch {
      /* fallback also failed — data is in console logs */
    }

    return { ok: false, request_id: requestId, error: error.message };
  }

  // Fire-and-forget admin notification — never blocks UX
  void supabase.functions.invoke('send-lead-notification', { body: row })
    .then(() => console.info('[notify] ok', row.request_id))
    .catch((err: unknown) => console.warn('[notify] fail', row.request_id, err));

  return { ok: true, request_id: requestId };
}
