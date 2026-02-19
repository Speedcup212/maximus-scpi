import type { Handler } from '@netlify/functions';

interface FallbackPayload {
  request_id: string;
  source_form: string;
  source_page?: string;
  email: string;
  nom?: string;
  telephone?: string;
  payload: Record<string, unknown>;
}

const JSON_HEADERS = { 'Content-Type': 'application/json' };

/**
 * Fallback endpoint: receives lead data when Supabase insert fails.
 * 1) Logs the full payload (visible in Netlify Function logs)
 * 2) Sends an alert email via Resend (if RESEND_API_KEY is set)
 * 3) Always returns 200 so the frontend knows the fallback succeeded
 */
export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  let data: FallbackPayload;
  try {
    data = JSON.parse(event.body || '{}') as FallbackPayload;
  } catch {
    return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  console.log('[lead-fallback] RECEIVED — Supabase was down or insert failed');
  console.log('[lead-fallback] request_id:', data.request_id);
  console.log('[lead-fallback] source_form:', data.source_form);
  console.log('[lead-fallback] email:', data.email);
  console.log('[lead-fallback] payload:', JSON.stringify(data.payload));

  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const alertHtml = `
        <h2>ALERTE: Lead non enregistré dans Supabase</h2>
        <p><strong>Référence:</strong> ${data.request_id}</p>
        <p><strong>Formulaire:</strong> ${data.source_form}</p>
        <p><strong>Page:</strong> ${data.source_page || 'N/A'}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Nom:</strong> ${data.nom || 'N/A'}</p>
        <p><strong>Téléphone:</strong> ${data.telephone || 'N/A'}</p>
        <hr/>
        <pre>${JSON.stringify(data.payload, null, 2)}</pre>
      `;

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'MaximusSCPI <onboarding@resend.dev>',
          to: ['maximusscpi@gmail.com'],
          subject: `[ALERTE] Lead perdu - ${data.source_form} - ${data.email}`,
          html: alertHtml,
        }),
      });

      if (res.ok) {
        console.log('[lead-fallback] Alert email sent successfully');
      } else {
        console.error('[lead-fallback] Alert email failed:', await res.text());
      }
    } catch (emailErr) {
      console.error('[lead-fallback] Alert email error:', emailErr);
    }
  } else {
    console.warn('[lead-fallback] RESEND_API_KEY not set — email alert skipped, data is in logs only');
  }

  return {
    statusCode: 200,
    headers: {
      ...JSON_HEADERS,
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({ ok: true, request_id: data.request_id }),
  };
};
