import { createHmac } from 'node:crypto';

const getEnv = (key: string): string | undefined => {
  const netlifyEnv = (globalThis as any).Netlify?.env;
  return netlifyEnv?.get?.(key) || process.env[key];
};

const signDispatch = (timestamp: string, secret: string): string =>
  createHmac('sha256', secret)
    .update(`${timestamp}:scpi-ingest`)
    .digest('hex');

export default async (req: Request) => {
  let scheduledPayload: { next_run?: string } = {};
  try {
    scheduledPayload = await req.json();
  } catch {
    console.warn('[scpi-ingest-scheduled] invocation non planifiée ignorée');
    return;
  }

  if (!scheduledPayload.next_run) {
    console.warn('[scpi-ingest-scheduled] next_run absent : invocation ignorée');
    return;
  }

  const secret = getEnv('SUPABASE_SERVICE_ROLE_KEY');
  if (!secret) {
    console.error('[scpi-ingest-scheduled] SUPABASE_SERVICE_ROLE_KEY manquant');
    return;
  }

  const timestamp = String(Date.now());
  const signature = signDispatch(timestamp, secret);
  const origin = new URL(req.url).origin;
  const target = `${origin}/.netlify/functions/scpi-ingest-background`;

  try {
    const response = await fetch(target, {
      method: 'POST',
      headers: {
        'X-Maximus-Timestamp': timestamp,
        'X-Maximus-Signature': signature,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ trigger: 'scheduled' }),
    });

    console.log('[scpi-ingest-scheduled] background dispatch', response.status);
  } catch (error) {
    console.error(
      '[scpi-ingest-scheduled] dispatch failed',
      error instanceof Error ? error.message : String(error),
    );
  }
};

export const config = {
  schedule: '*/5 * * * *',
};
