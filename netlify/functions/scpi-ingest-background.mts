import { createHmac, timingSafeEqual } from 'node:crypto';
import { createAdminClient } from './_invite-utils';
import { processNextScpiBulletin } from './utils/scpi-bulletin-ingestion';

const getEnv = (key: string): string | undefined => {
  const netlifyEnv = (globalThis as any).Netlify?.env;
  return netlifyEnv?.get?.(key) || process.env[key];
};

const expectedSignature = (timestamp: string, secret: string): string =>
  createHmac('sha256', secret)
    .update(`${timestamp}:scpi-ingest`)
    .digest('hex');

const isAuthorized = (req: Request): boolean => {
  const secret = getEnv('SUPABASE_SERVICE_ROLE_KEY');
  const timestamp = req.headers.get('x-maximus-timestamp') || '';
  const provided = req.headers.get('x-maximus-signature') || '';

  if (!secret || !timestamp || !provided) return false;

  const ageMs = Math.abs(Date.now() - Number(timestamp));
  if (!Number.isFinite(ageMs) || ageMs > 5 * 60_000) return false;

  const expected = expectedSignature(timestamp, secret);
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(provided, 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
};

export default async (req: Request) => {
  if (!isAuthorized(req)) {
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
