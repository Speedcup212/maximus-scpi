import type { Handler } from '@netlify/functions';
import { createAdminClient, generateInviteCode, generateInviteToken, hashInviteCode, hashToken } from './_invite-utils';

type InviteRole = 'CLIENT' | 'PARTENAIRE' | 'ADMIN';

type InvitePayload = {
  email?: string;
  role?: InviteRole;
  org_id?: string | null;
  expires_in_hours?: number;
};

const MAX_EXPIRES_HOURS = 168;
const DEFAULT_EXPIRES_HOURS = 48;

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let payload: InvitePayload;
  try {
    payload = JSON.parse(event.body || '{}') as InvitePayload;
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const email = payload.email?.toLowerCase().trim();
  const role = payload.role;
  if (!email || !role) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing email or role' }) };
  }
  if (!['CLIENT', 'PARTENAIRE', 'ADMIN'].includes(role)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid role' }) };
  }

  const authHeader = event.headers?.authorization || event.headers?.Authorization;
  const token = authHeader?.replace('Bearer ', '');
  if (!token) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Missing auth token' }) };
  }

  const adminClient = createAdminClient();

  const { data: userData, error: userError } = await adminClient.auth.getUser(token);
  if (userError || !userData?.user) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Invalid token' }) };
  }

  const { data: requesterProfile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('user_id', userData.user.id)
    .single();

  if (!requesterProfile || requesterProfile.role !== 'admin') {
    return { statusCode: 403, body: JSON.stringify({ error: 'Admin access required' }) };
  }

  const expiresIn = Math.min(
    Math.max(Number(payload.expires_in_hours || DEFAULT_EXPIRES_HOURS), 1),
    MAX_EXPIRES_HOURS
  );
  const expiresAt = new Date(Date.now() + expiresIn * 60 * 60 * 1000);

  const existing = await adminClient.auth.admin.getUserByEmail(email);
  let userId = existing.data?.user?.id;

  if (!userId) {
    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email,
      email_confirm: true
    });
    if (createError || !created?.user?.id) {
      return { statusCode: 500, body: JSON.stringify({ error: createError?.message || 'User creation failed' }) };
    }
    userId = created.user.id;
  }

  const tokenValue = generateInviteToken();
  const code = generateInviteCode();
  const codeHash = hashInviteCode(tokenValue, code);
  const tokenHash = hashToken(tokenValue);

  const profileRole =
    role === 'CLIENT' ? 'client' : role === 'PARTENAIRE' ? 'partner' : 'admin';

  const { error: inviteError } = await adminClient.from('invitations').insert({
    token: tokenValue,
    token_hash: tokenHash,
    email,
    role,
    org_id: payload.org_id ?? null,
    code_hash: codeHash,
    status: 'PENDING',
    expires_at: expiresAt.toISOString(),
    created_by: userData.user.id
  });

  if (inviteError) {
    return { statusCode: 500, body: JSON.stringify({ error: inviteError.message }) };
  }

  // Profil créé au moment du claim via trigger (invitations -> profiles).

  const siteUrl =
    process.env.VITE_PUBLIC_SITE_URL ||
    process.env.PUBLIC_SITE_URL ||
    (event.headers?.origin ? event.headers.origin : null) ||
    (event.headers?.host ? `https://${event.headers.host}` : 'https://maximusscpi.com');

  const claimUrl = `${siteUrl}/app/claim?token=${tokenValue}`;

  return {
    statusCode: 200,
    body: JSON.stringify({
      email,
      role,
      claimUrl,
      code,
      expiresAt: expiresAt.toISOString()
    })
  };
};
