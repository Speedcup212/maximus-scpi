const getEnv = (key: string): string | undefined => {
  const netlifyEnv = (globalThis as any).Netlify?.env;
  return netlifyEnv?.get?.(key) || process.env[key];
};

export default async (req: Request) => {
  const token = getEnv('SCPI_INGEST_TOKEN');
  if (!token) {
    console.error('[scpi-ingest-scheduled] SCPI_INGEST_TOKEN manquant');
    return;
  }

  const origin = new URL(req.url).origin;
  const target = `${origin}/.netlify/functions/scpi-ingest-background`;

  try {
    const response = await fetch(target, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
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
  schedule: '*/15 * * * *',
};
