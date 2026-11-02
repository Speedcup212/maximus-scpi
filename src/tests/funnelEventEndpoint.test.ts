import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Execute the real function with isolated, fake server credentials and fetch.
// No live Supabase client, database write or Netlify runtime is involved.
const source = readFileSync(new URL('../../netlify/functions/funnel-event.ts', import.meta.url), 'utf8');
const executable = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;

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
    const exports = {} as { handler: EndpointHandler };
    vm.runInNewContext(executable, {
      exports, Buffer, console, fetch: write,
      process: { env: {
        SUPABASE_URL: 'https://example.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'test-only-not-a-real-key',
      } },
    });
    handler = exports.handler;
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
});
