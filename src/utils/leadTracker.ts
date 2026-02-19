/**
 * Centralized lead tracking: request_id generation, admin notification, fallback.
 * Used by ALL form submit handlers to ensure traceability.
 */

export function generateRequestId(): string {
  return crypto.randomUUID();
}

interface NotifyAdminPayload {
  request_id: string;
  email: string;
  nom?: string;
  telephone?: string;
  source: string;
  page?: string;
  extra?: Record<string, unknown>;
}

/**
 * Fire-and-forget call to the Supabase Edge Function `send-lead-notification`.
 * Never throws — logs errors silently so it never blocks the user flow.
 */
export async function notifyAdmin(payload: NotifyAdminPayload): Promise<boolean> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    console.warn('[leadTracker] Cannot notify admin: Supabase env vars missing');
    return false;
  }

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/send-lead-notification`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nom: payload.nom || 'Non renseigné',
        email: payload.email,
        telephone: payload.telephone,
        commentaire: `[Ref: ${payload.request_id}] Source: ${payload.source}. Page: ${payload.page || 'N/A'}`,
        source: payload.source,
        ...(payload.extra || {}),
      }),
    });

    if (!res.ok) {
      console.error('[leadTracker] Notification failed:', res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('[leadTracker] Notification error (non-blocking):', err);
    return false;
  }
}

interface FallbackPayload {
  request_id: string;
  source_form: string;
  source_page: string;
  email: string;
  nom?: string;
  telephone?: string;
  payload: Record<string, unknown>;
}

/**
 * Fallback: if Supabase insert fails, POST data to a Netlify Function that
 * stores it independently and sends an alert email.
 */
export async function sendFallback(data: FallbackPayload): Promise<boolean> {
  try {
    const res = await fetch('/.netlify/functions/lead-fallback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch (err) {
    console.error('[leadTracker] Fallback also failed:', err);
    return false;
  }
}
