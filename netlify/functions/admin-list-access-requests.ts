import type { Handler } from '@netlify/functions';
import { createAdminClient } from './_invite-utils';

type ListPayload = {
  page?: number;
  page_size?: number;
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

  let payload: ListPayload = {};
  try {
    payload = JSON.parse(event.body || '{}') as ListPayload;
  } catch {
    payload = {};
  }

  const page = Math.max(1, Number(payload.page || 1));
  const pageSize = Math.min(50, Math.max(1, Number(payload.page_size || 20)));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

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

  const { data, error, count } = await adminClient
    .from('access_requests')
    .select('*', { count: 'exact' })
    .eq('status', 'PENDING')
    .order('created_at', { ascending: true })
    .range(from, to);

  if (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Query failed' }) };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: data || [],
      page,
      page_size: pageSize,
      total: count ?? 0
    })
  };
};
