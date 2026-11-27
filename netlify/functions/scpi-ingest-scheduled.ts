import { createAdminClient } from './_invite-utils';
import { signIngestDispatch, ingestHmacSecrets, INGEST_HMAC_SECRET_VAR } from './_ingest-hmac';

const getEnv = (key: string): string | undefined => {
  const netlifyEnv = (globalThis as any).Netlify?.env;
  return netlifyEnv?.get?.(key) || process.env[key];
};

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

  const secret = ingestHmacSecrets(getEnv)[0] ?? '';
  if (!secret) {
    console.error(`[scpi-ingest-scheduled] ${INGEST_HMAC_SECRET_VAR} manquant (et repli legacy absent)`);
    return;
  }

  const timestamp = String(Date.now());
  const signature = signIngestDispatch(timestamp, secret);
  const origin = new URL(req.url).origin;
  const target = `${origin}/.netlify/functions/scpi-ingest-background`;

  let heartbeatId: string | null = null;
  try {
    const client = createAdminClient();
    const { data } = await client
      .from('scpi_ingestion_events')
      .insert({
        scpi_slug: '__scheduler__',
        status: 'started',
        step: 'scheduled_dispatch',
        message: `Déclenchement planifié, prochain run annoncé: ${scheduledPayload.next_run}`,
      })
      .select('id')
      .single();
    heartbeatId = data?.id || null;
  } catch (error) {
    console.warn(
      '[scpi-ingest-scheduled] heartbeat insert failed',
      error instanceof Error ? error.message : String(error),
    );
  }

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

    if (heartbeatId) {
      try {
        const client = createAdminClient();
        await client
          .from('scpi_ingestion_events')
          .update({
            status: response.ok ? 'dispatched' : 'failed',
            step: 'scheduled_dispatch',
            message: `Background HTTP ${response.status}`,
            ended_at: new Date().toISOString(),
          })
          .eq('id', heartbeatId);
      } catch {
        // Le log Netlify reste disponible même si le heartbeat ne peut pas être mis à jour.
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[scpi-ingest-scheduled] dispatch failed', message);

    if (heartbeatId) {
      try {
        const client = createAdminClient();
        await client
          .from('scpi_ingestion_events')
          .update({
            status: 'failed',
            step: 'scheduled_dispatch',
            message: message.slice(0, 2000),
            ended_at: new Date().toISOString(),
          })
          .eq('id', heartbeatId);
      } catch {
        // Rien à faire : l'erreur principale est déjà journalisée.
      }
    }
  }
};

export const config = {
  schedule: '30 3 * * *',
};
