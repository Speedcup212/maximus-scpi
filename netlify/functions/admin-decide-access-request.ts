import type { Handler } from '@netlify/functions';
import { createAdminClient, generateInviteCode, generateInviteToken, hashInviteCode, hashToken } from './_invite-utils';

type DecisionPayload = {
  request_id?: string;
  decision?: 'APPROVED' | 'REJECTED';
  decision_note?: string | null;
};

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const authHeader = event.headers?.authorization || event.headers?.Authorization;
  const token = authHeader?.replace('Bearer ', '');
  if (!token) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Missing auth token' }) };
  }

  let payload: DecisionPayload;
  try {
    payload = JSON.parse(event.body || '{}') as DecisionPayload;
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  if (!payload.request_id || !payload.decision) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing request_id or decision' }) };
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

  const { data: requestRow, error: requestError } = await adminClient
    .from('access_requests')
    .select('*')
    .eq('id', payload.request_id)
    .single();

  if (requestError || !requestRow) {
    return { statusCode: 404, body: JSON.stringify({ error: 'Request not found' }) };
  }

  if (requestRow.status !== 'PENDING') {
    return { statusCode: 400, body: JSON.stringify({ error: 'Request already handled' }) };
  }

  const decision = payload.decision;
  const handledAt = new Date().toISOString();

  const { error: updateError } = await adminClient
    .from('access_requests')
    .update({
      status: decision,
      handled_by: userData.user.id,
      handled_at: handledAt,
      decision_note: payload.decision_note || null
    })
    .eq('id', payload.request_id);

  if (updateError) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Update failed' }) };
  }

  if (decision === 'REJECTED') {
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  }

  const email = (requestRow.email as string).toLowerCase();
  const role = requestRow.requested_role as 'CLIENT' | 'PARTENAIRE';

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

  const { error: inviteError } = await adminClient.from('invitations').insert({
    token: tokenValue,
    token_hash: tokenHash,
    email,
    role,
    code_hash: codeHash,
    status: 'PENDING',
    expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    created_by: userData.user.id,
    meta: {
      full_name: requestRow.full_name,
      phone: requestRow.phone,
      source: 'access_request',
      access_request_id: requestRow.id
    }
  });

  if (inviteError) {
    return { statusCode: 500, body: JSON.stringify({ error: inviteError.message }) };
  }

  const siteUrl =
    process.env.VITE_PUBLIC_SITE_URL ||
    process.env.PUBLIC_SITE_URL ||
    (event.headers?.origin ? event.headers.origin : null) ||
    (event.headers?.host ? `https://${event.headers.host}` : 'https://maximusscpi.com');

  const claimUrl = `${siteUrl}/app/claim?token=${tokenValue}`;

  return {
    statusCode: 200,
    body: JSON.stringify({
      ok: true,
      claimUrl,
      code
    })
  };
};
