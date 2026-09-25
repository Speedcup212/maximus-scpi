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

  try {
    const client = createAdminClient();
    const result = await processNextScpiBulletin(client);

    console.log('[scpi-ingest-background]', JSON.stringify({
      ...result,
      duration_ms: Date.now() - startedAt,
    }));
  } catch (error) {
    console.error(
      '[scpi-ingest-background] fatal',
      error instanceof Error ? error.message : String(error),
    );
  }
};
