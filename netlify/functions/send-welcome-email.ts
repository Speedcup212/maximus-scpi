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

  // 1. Email reel du CGP : seule source fiable = auth.users
  const { data: authData, error: authError } =
    await adminClient.auth.admin.getUserById(userId);

  const email = authData?.user?.email;
  if (authError || !email) {
    console.error('[send-welcome-email] Email auth introuvable pour userId:', userId, authError);
    return {
      statusCode: 404,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: 'Email utilisateur introuvable.' }),
    };
  }

  // 2. Cabinet + ORIAS : table cgp_profiles, cle primaire = id
  const { data: cgp, error: cgpError } = await adminClient
    .from('cgp_profiles')
    .select('company_name, orias_number')
    .eq('id', userId)
    .single();

  if (cgpError || !cgp) {
    console.error('[send-welcome-email] Profil CGP introuvable pour userId:', userId, cgpError);
    return {
      statusCode: 404,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: 'Profil CGP introuvable.' }),
    };
  }

  // 3. Prenom : optionnel, table profiles, cle = user_id (peut etre NULL)
  let firstName: string | undefined;
  try {
    const { data: prof } = await adminClient
      .from('profiles')
      .select('full_name')
      .eq('user_id', userId)
      .single();
    firstName = prof?.full_name?.trim()?.split(' ')[0] || undefined;
  } catch {
    firstName = undefined;
  }

  // 4. Envoi
  try {
    await sendWelcomeEmail({
      firstName: firstName || cgp.company_name,
      oriasNumber: cgp.orias_number,
      email,
    });
    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify({ ok: true }),
    };
  } catch (emailError) {
    console.error('[send-welcome-email] Echec envoi:', emailError);
    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: "Echec de l'envoi de l'e-mail de bienvenue." }),
    };
  }
};
