import type { Handler } from '@netlify/functions';
import { createAdminClient } from './_invite-utils';
import { sendWelcomeEmail } from './utils/email-sender';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  let payload: { userId?: string };
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: 'Corps JSON invalide.' }),
    };
  }

  const userId = payload.userId?.trim();
  if (!userId) {
    return {
      statusCode: 400,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: 'userId requis.' }),
    };
  }

  const adminClient = createAdminClient();

  // Récupération sécurisée serveur-side des données utilisateur
  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('first_name, orias_number, email')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    console.error('[send-welcome-email] Profil introuvable pour userId:', userId);
    return {
      statusCode: 404,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: 'Profil utilisateur introuvable.' }),
    };
  }

  try {
    await sendWelcomeEmail({
      firstName: profile.first_name,
      oriasNumber: profile.orias_number,
      email: profile.email,
    });

    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify({ ok: true }),
    };
  } catch (emailError) {
    console.error('[send-welcome-email] Échec envoi:', emailError);
    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: "Échec de l'envoi de l'e-mail de bienvenue." }),
    };
  }
};
