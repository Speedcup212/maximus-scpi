import type { Handler } from '@netlify/functions';
import { createAdminClient, hashInviteCode, safeEqual, hashToken } from './_invite-utils';

type ClaimPayload = {
  token?: string;
  code?: string;
  password?: string;
};

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let payload: ClaimPayload;
  try {
    payload = JSON.parse(event.body || '{}') as ClaimPayload;
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const token = payload.token?.trim();
  const code = payload.code?.trim();
  const password = payload.password;
  if (!token || !code || !password) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing token, code or password' }) };
  }
  if (password.length < 6) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Password too short' }) };
  }

  const adminClient = createAdminClient();

  const tokenHash = hashToken(token);
  let { data: invite, error: inviteError } = await adminClient
    .from('invitations')
    .select('*')
    .eq('token_hash', tokenHash)
    .single();

  if (inviteError || !invite) {
    const fallback = await adminClient
      .from('invitations')
      .select('*')
      .eq('token', token)
      .single();
    invite = fallback.data;
    inviteError = fallback.error;
  }

  if (inviteError || !invite) {
    return { statusCode: 404, body: JSON.stringify({ error: 'Invitation not found' }) };
  }

  if (invite.status === 'USED') {
    return { statusCode: 200, body: JSON.stringify({ success: true, alreadyClaimed: true }) };
  }
  if (invite.status !== 'PENDING') {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invitation not pending' }) };
  }

  const expiresAt = new Date(invite.expires_at as string);
  if (Number.isNaN(expiresAt.getTime()) || Date.now() > expiresAt.getTime()) {
    await adminClient
      .from('invitations')
      .update({ status: 'EXPIRED' })
      .eq('token', token);
    return { statusCode: 400, body: JSON.stringify({ error: 'Invitation expired' }) };
  }

  const expectedHash = hashInviteCode(token, code);
  if (!safeEqual(expectedHash, invite.code_hash as string)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid code' }) };
  }

  const { data: userData, error: userError } = await adminClient.auth.admin.getUserByEmail(invite.email as string);
  const userId = userData?.user?.id;
  if (userError || !userId) {
    return { statusCode: 404, body: JSON.stringify({ error: 'User not found' }) };
  }

  const { error: updateError } = await adminClient.auth.admin.updateUserById(userId, { password });
  if (updateError) {
    return { statusCode: 500, body: JSON.stringify({ error: updateError.message }) };
  }

  await adminClient
    .from('invitations')
    .update({ status: 'USED', claimed_at: new Date().toISOString(), claimed_by: userId })
    .eq('token_hash', invite.token_hash ?? tokenHash);

  return { statusCode: 200, body: JSON.stringify({ success: true }) };
};
