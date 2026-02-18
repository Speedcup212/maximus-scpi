import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

type AccessPayload = {
  email?: string;
  firstName?: string;
  lastName?: string;
};

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const JSON_HEADERS = { 'Content-Type': 'application/json' };

/**
 * Public endpoint — uses anon key (not service role).
 * RLS policy on access_requests allows anon inserts with status = 'PENDING'.
 */
export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  let payload: AccessPayload;
  try {
    payload = JSON.parse(event.body || '{}') as AccessPayload;
  } catch {
    return {
      statusCode: 400,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: 'Corps JSON invalide.' })
    };
  }

  const email = payload.email?.trim().toLowerCase();
  const firstName = payload.firstName?.trim();
  const lastName = payload.lastName?.trim();
  const fullName = [firstName, lastName].filter(Boolean).join(' ');

  if (!fullName || fullName.length < 2) {
    return {
      statusCode: 400,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: 'Prénom et nom requis (min 2 caractères).' })
    };
  }
  if (!email || !isValidEmail(email)) {
    return {
      statusCode: 400,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: 'Adresse email invalide.' })
    };
  }

  // ── Supabase client (anon key, not service role) ──
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error('[request-access] Missing SUPABASE_URL or SUPABASE_ANON_KEY');
    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        error: 'Configuration serveur manquante (SUPABASE_URL / SUPABASE_ANON_KEY).'
      })
    };
  }

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  // Idempotent: si l'email a deja une demande PENDING (unique partial index),
  // on traite le doublon (23505 / 409) comme un succes silencieux.
  const { error } = await supabase.from('access_requests').insert({
    requested_role: 'CLIENT',
    full_name: fullName,
    email,
    phone: null,
    message: null,
    status: 'PENDING'
  });

  if (error) {
    const isDuplicate =
      error.code === '23505' ||
      String(error.message || '').includes('duplicate') ||
      String(error.message || '').includes('unique');

    if (isDuplicate) {
      // Email deja soumis — on retourne 200 comme si c'etait un succes
      return {
        statusCode: 200,
        headers: JSON_HEADERS,
        body: JSON.stringify({ ok: true })
      };
    }

    console.error('[request-access] Insert error:', error.message, error.code);
    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: `Erreur d'insertion : ${error.message}` })
    };
  }

  return {
    statusCode: 200,
    headers: JSON_HEADERS,
    body: JSON.stringify({ ok: true })
  };
};
