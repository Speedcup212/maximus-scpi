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

  // Email + metadata (prenom, nom, cabinet, orias) : tout est dans auth.users
  const { data: authData, error: authError } =
    await adminClient.auth.admin.getUserById(userId);

  const user = authData?.user;
  const email = user?.email;
  if (authError || !email) {
    console.error('[send-welcome-email] Email auth introuvable pour userId:', userId, authError);
    return {
      statusCode: 404,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: 'Email utilisateur introuvable.' }),
    };
  }

  const meta = user.user_metadata || {};
  const firstName = (meta.first_name || '').trim();
  const lastName = (meta.last_name || '').trim();
  const cabinetName = (meta.cabinet_name || '').trim();

  // Civilite : "Prenom Nom" si dispo, sinon cabinet, sinon generique
  const fullName = `${firstName} ${lastName}`.trim();
  const greetingName = fullName || cabinetName || 'cher partenaire';

  // ORIAS : metadata en priorite, fallback cgp_profiles
  let oriasNumber = (meta.orias_number || '').trim();
  if (!oriasNumber) {
    const { data: cgp } = await adminClient
      .from('cgp_profiles')
      .select('orias_number')
      .eq('id', userId)
      .single();
    oriasNumber = cgp?.orias_number || '';
  }

  // Envoi
  try {
    await sendWelcomeEmail({
      firstName: greetingName,
      oriasNumber,
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
