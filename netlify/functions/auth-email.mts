import { createAdminClient } from './_invite-utils';
import { sendAuthActionEmail } from './utils/email-sender';

type AuthEmailAction = 'magiclink' | 'recovery';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return json({ error: 'Method Not Allowed' }, 405);
  }

  let payload: { email?: string; action?: AuthEmailAction };
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'Corps JSON invalide.' }, 400);
  }

  const email = payload.email?.trim().toLowerCase() || '';
  const action = payload.action;

  if (!isValidEmail(email) || !action || !['magiclink', 'recovery'].includes(action)) {
    return json({ error: 'Paramètres invalides.' }, 400);
  }

  try {
    const admin = createAdminClient();
    const existing = await admin.auth.admin.getUserByEmail(email);
    const user = existing.data?.user;

    // Ne jamais divulguer si un compte existe ou non.
    if (!user) {
      return json({ ok: true });
    }

    const eventType = action === 'recovery'
      ? 'auth_email_recovery_sent'
      : 'auth_email_magiclink_sent';

    const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
    const { data: recent } = await admin
      .from('audit_events')
      .select('id')
      .eq('user_id', user.id)
      .eq('event_type', eventType)
      .gte('created_at', oneMinuteAgo)
      .limit(1);

    if (recent?.length) {
      return json({ ok: true });
    }

    const origin = new URL(req.url).origin.replace('/.netlify/functions', '');
    const redirectTo = action === 'recovery'
      ? `${origin}/app/set-password`
      : `${origin}/app`;

    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: action,
      email,
      options: { redirectTo }
    });

    const actionUrl = linkData?.properties?.action_link;
    if (linkError || !actionUrl) {
      console.error('[auth-email] generateLink failed', linkError);
      return json({ ok: true });
    }

    await sendAuthActionEmail({
      email,
      actionUrl,
      action
    });

    await admin.from('audit_events').insert({
      user_id: user.id,
      event_type: eventType,
      payload: { channel: 'brevo' }
    });

    return json({ ok: true });
  } catch (error) {
    console.error('[auth-email] failed', error);
    return json({ error: "Impossible d'envoyer l'email pour le moment." }, 502);
  }
};
