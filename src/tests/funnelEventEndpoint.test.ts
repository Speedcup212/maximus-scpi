import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handler as funnelHandler } from '../../netlify/functions/funnel-event';

// Execute the real function with isolated, fake server credentials and fetch.
// No live Supabase client, database write or Netlify runtime is involved.
// Le module est importé réellement : la résolution de modules et `node:crypto` du
// runtime font partie de ce qui est testé, et non simulés par un contexte `vm`.
type EndpointResponse = { statusCode: number; body: string };
type EndpointInput = { httpMethod: string; headers: Record<string, string>; body: string };
type EndpointHandler = (event: EndpointInput) => Promise<EndpointResponse>;

describe('first-party funnel endpoint UTM allowlist', () => {
  let handler: EndpointHandler;
  const write = vi.fn<typeof fetch>();
  const attribution = { utm_source: 'facebook', utm_medium: 'social', utm_campaign: 'cas_marc_52' };

  beforeEach(() => {
    write.mockReset();
    write.mockResolvedValue(new Response(null, { status: 201 }));
    vi.stubGlobal('fetch', write);
    vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY_NEW', '');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-only-not-a-real-key');
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    handler = funnelHandler as unknown as EndpointHandler;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  function input(metadata: Record<string, unknown>): EndpointInput {
    return {
      httpMethod: 'POST', headers: { origin: 'https://maximusscpi.com' },
      body: JSON.stringify({
        event_name: 'simulation_start', session_id: '622489bf-981b-4cee-b2ce-ea8ca988b724',
        path: '/simulateur-scpi/', metadata,
      }),
    };
  }

  it.each(Object.entries(attribution))('accepts the new key %s', async (key, value) => {
    expect((await handler(input({ [key]: value }))).statusCode).toBe(204);
    expect(JSON.parse(write.mock.calls[0][1]?.body as string).metadata).toEqual({ [key]: value });
  });

  it('forwards the three UTM together with existing metadata', async () => {
    expect((await handler(input({ source: 'simulateur_scpi', ...attribution }))).statusCode).toBe(204);
    expect(write).toHaveBeenCalledTimes(1);
    expect(JSON.parse(write.mock.calls[0][1]?.body as string).metadata).toEqual({
      source: 'simulateur_scpi', ...attribution,
    });
  });

  it.each(['email', 'telephone', 'unexpected', 'utm_term'])(
    'still rejects the unknown key %s with 400 unexpected_metadata', async (key) => {
      const response = await handler(input({ ...attribution, [key]: 'forbidden' }));
      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body)).toEqual({ error: 'unexpected_metadata' });
      expect(write).not.toHaveBeenCalled();
    },
  );

  it('keeps accepting existing metadata without UTM', async () => {
    expect((await handler(input({ step: 1, source: 'site' }))).statusCode).toBe(204);
    expect(JSON.parse(write.mock.calls[0][1]?.body as string).metadata).toEqual({ step: 1, source: 'site' });
  });

  it('records an exempt audience event with its UTM (RECOVERY-203)', async () => {
    expect((await handler(input({ source: 'simulateur_scpi', ...attribution, measurement: 'exempt' }))).statusCode)
      .toBe(204);
    expect(JSON.parse(write.mock.calls[0][1]?.body as string).metadata).toEqual({
      source: 'simulateur_scpi', ...attribution, measurement: 'exempt',
    });
  });

  it.each([
    [{ measurement: 'consent' }, 'invalid_measurement'],
    [{ measurement: true }, 'invalid_measurement'],
    [{ measurement: 'exempt', lead_request_id: '5125479b-03a1-4a22-9d45-bb6359d0e5af' }, 'exempt_with_lead_reference'],
  ])('rejects %j without a database write', async (metadata, code) => {
    const response = await handler(input(metadata));
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ error: code });
    expect(write).not.toHaveBeenCalled();
  });
});
