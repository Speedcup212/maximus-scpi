import type { Handler } from '@netlify/functions';
import { createAdminClient } from './_invite-utils';

type InvitePayload = {
  email?: string;
  full_name?: string;
  role?: 'CLIENT' | 'PARTENAIRE' | 'ADMIN';
};

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const adminToken = process.env.NETLIFY_ADMIN_TOKEN;
  const headerToken = event.headers?.['x-admin-token'] || event.headers?.['X-Admin-Token'];
  if (!adminToken || headerToken !== adminToken) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  let payload: InvitePayload;
  try {
    payload = JSON.parse(event.body || '{}') as InvitePayload;
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const email = payload.email?.trim().toLowerCase();
  const fullName = payload.full_name?.trim();
  const role = payload.role || 'CLIENT';

  if (!email || !isValidEmail(email)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid email' }) };
  }
  if (!fullName || fullName.length < 2) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid full_name' }) };
  }
  if (!['CLIENT', 'PARTENAIRE', 'ADMIN'].includes(role)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid role' }) };
  }

  const adminClient = createAdminClient();

  const baseUrl =
    process.env.PUBLIC_SITE_URL ||
    event.headers?.origin ||
    'https://maximusscpi.com';
  const redirectTo = `${baseUrl.replace(/\/$/, '')}/app/set-password`;

  const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName, role },
    redirectTo
  });

  if (error) {
    if (error.message?.toLowerCase().includes('already') || error.status === 409) {
      return { statusCode: 409, body: JSON.stringify({ error: 'USER_EXISTS' }) };
    }
    return { statusCode: 500, body: JSON.stringify({ error: error.message || 'Invite failed' }) };
  }
  if (!data?.user) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Invite failed' }) };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true })
  };
};
