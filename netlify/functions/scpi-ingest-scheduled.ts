import type { Handler } from '@netlify/functions';
import { createAdminClient } from './_invite-utils';
import { processNextScpiBulletin } from './utils/scpi-bulletin-ingestion';

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8' };

export const handler: Handler = async () => {
  const startedAt = Date.now();

  try {
    const client = createAdminClient();
    const result = await processNextScpiBulletin(client);

    console.log('[scpi-ingest-scheduled]', JSON.stringify({
      ...result,
      duration_ms: Date.now() - startedAt,
    }));

    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        ok: result.status !== 'failed',
        ...result,
        duration_ms: Date.now() - startedAt,
      }),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[scpi-ingest-scheduled] fatal', message);

    // Le prochain passage horaire reprendra la rotation. On renvoie 200 pour
    // éviter une rafale de retries Netlify non contrôlée.
    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        ok: false,
        status: 'failed',
        message,
        duration_ms: Date.now() - startedAt,
      }),
    };
  }
};
