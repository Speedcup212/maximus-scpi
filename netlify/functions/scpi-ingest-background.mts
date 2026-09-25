import { createAdminClient } from './_invite-utils';
import { processNextScpiBulletin } from './utils/scpi-bulletin-ingestion';

const getEnv = (key: string): string | undefined => {
  const netlifyEnv = (globalThis as any).Netlify?.env;
  return netlifyEnv?.get?.(key) || process.env[key];
};

export default async (req: Request) => {
  const expected = getEnv('SCPI_INGEST_TOKEN');
  const provided = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '';

  if (!expected || provided !== expected) {
    console.warn('[scpi-ingest-background] invocation rejected');
    return;
  }

  const startedAt = Date.now();
  const configuredBatch = Number(getEnv('SCPI_INGEST_BATCH_SIZE') || 3);
  const batchSize = Math.max(1, Math.min(5, Number.isFinite(configuredBatch) ? configuredBatch : 3));
  const results: unknown[] = [];

  try {
    const client = createAdminClient();

    for (let index = 0; index < batchSize; index += 1) {
      const result = await processNextScpiBulletin(client);
      results.push(result);

      if (result.status === 'idle') break;
    }

    console.log('[scpi-ingest-background]', JSON.stringify({
      processed: results.length,
      results,
      duration_ms: Date.now() - startedAt,
    }));
  } catch (error) {
    console.error(
      '[scpi-ingest-background] fatal',
      error instanceof Error ? error.message : String(error),
    );
  }
};
