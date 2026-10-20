import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { handler } from '../../netlify/functions/funnel-event.ts';

const sessionId = '622489bf-981b-4cee-b2ce-ea8ca988b724';
const requestId = '5125479b-03a1-4a22-9d45-bb6359d0e5af';
const eventPayload = {
  event_name: 'calendly_booking_completed',
  session_id: sessionId,
  path: '/comparateur-scpi/',
  metadata: { action: 'calendly', form_type: 'lead_rdv', lead_request_id: requestId },
};
const input = (data = eventPayload, headers = { origin: 'https://maximusscpi.com' }) =>
  ({ httpMethod: 'POST', headers, body: JSON.stringify(data) });

function mockServer() {
  const oldFetch = globalThis.fetch;
  const oldUrl = process.env.SUPABASE_URL;
  const oldSecret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const calls = [];
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-secret-do-not-use';
  globalThis.fetch = async (url, config) => {
    calls.push({ url, config });
    return { ok: true, status: 201 };
  };
  return {
    calls,
    restore() {
      globalThis.fetch = oldFetch;
      if (oldUrl === undefined) delete process.env.SUPABASE_URL;
      else process.env.SUPABASE_URL = oldUrl;
      if (oldSecret === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      else process.env.SUPABASE_SERVICE_ROLE_KEY = oldSecret;
    },
  };
}

test('verified same-origin POST records exactly one sanitized event in existing table', async () => {
  const env = mockServer();
  try {
    const response = await handler(input());
    assert.equal(response.statusCode, 204);
    assert.equal(env.calls.length, 1);
    assert.equal(env.calls[0].url, 'https://example.supabase.co/rest/v1/funnel_events');
    const insert = JSON.parse(env.calls[0].config.body);
    assert.deepEqual(Object.keys(insert).sort(), ['event_name', 'metadata', 'path', 'session_id']);
    assert.equal(insert.metadata.lead_request_id, requestId);
    assert.equal(insert.metadata.email, undefined);
    assert.equal(env.calls[0].config.headers.Prefer, 'return=minimal');
  } finally {
    env.restore();
  }
});

test('rejects other sites and requests without an Origin, with no DB write', async () => {
  const env = mockServer();
  try {
    assert.equal((await handler(input(eventPayload, { origin: 'https://untrusted.example' }))).statusCode, 403);
    assert.equal((await handler(input(eventPayload, {}))).statusCode, 403);
    assert.equal(env.calls.length, 0);
  } finally { env.restore(); }
});

test('rejects malformed events and identifying metadata without a DB write', async () => {
  const env = mockServer();
  try {
    assert.equal((await handler({ httpMethod: 'GET', headers: {}, body: '' })).statusCode, 405);
    assert.equal((await handler(input({ ...eventPayload, event_name: 'unknown' }))).statusCode, 400);
    assert.equal((await handler(input({ ...eventPayload, session_id: 'not-a-uuid' }))).statusCode, 400);
    assert.equal((await handler(input({ ...eventPayload, metadata: { email: 'sensitive@example.com' } }))).statusCode, 400);
    assert.equal((await handler(input({ ...eventPayload, metadata: { lead_request_id: 'not-uuid' } }))).statusCode, 400);
    assert.equal(env.calls.length, 0);
  } finally { env.restore(); }
});

test('rejects payloads larger than 4 KB', async () => {
  const env = mockServer();
  try {
    const tooLarge = { ...eventPayload, metadata: { source: 'x'.repeat(5000) } };
    assert.equal((await handler(input(tooLarge))).statusCode, 413);
    assert.equal(env.calls.length, 0);
  } finally { env.restore(); }
});

test('never opens an anonymous write path when server credentials are missing', async () => {
  const env = mockServer();
  try {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    assert.equal((await handler(input())).statusCode, 503);
    assert.equal(env.calls.length, 0);
  } finally { env.restore(); }
});

test('routing is explicit before the generated SPA fallback', () => {
  const redirects = readFileSync(new URL('../../public/_redirects', import.meta.url), 'utf8');
  const generator = readFileSync(new URL('../generateRedirectsSSG.js', import.meta.url), 'utf8');
  const toml = readFileSync(new URL('../../netlify.toml', import.meta.url), 'utf8');
  const rule = '/api/funnel-event /.netlify/functions/funnel-event 200!';
  assert.ok(redirects.indexOf(rule) > -1);
  assert.ok(generator.indexOf(rule) > -1);
  assert.ok(redirects.indexOf(rule) < redirects.lastIndexOf('/* /index.html 200'));
  assert.match(toml, /from = "\/api\/funnel-event"[\s\S]*?to = "\/\.netlify\/functions\/funnel-event"[\s\S]*?status = 200[\s\S]*?force = true/);
});
