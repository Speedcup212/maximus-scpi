import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { trackFunnelEvent } from '../../src/utils/funnelAnalytics.ts';

function setup({ consent = true, hostname = 'maximusscpi.com' } = {}) {
  const originals = Object.fromEntries(
    ['window', 'localStorage', 'sessionStorage', 'fetch'].map((name) => [name, globalThis[name]])
  );
  const events = [];
  const gtag = [];
  const logged = [];
  const session = new Map();

  globalThis.window = {
    location: { hostname, pathname: '/comparateur-scpi/' },
    dataLayer: events,
    gtag: (...args) => gtag.push(args),
  };
  globalThis.localStorage = {
    getItem: (key) => key === 'cookie-consent'
      ? JSON.stringify({ analytics: consent })
      : null,
  };
  globalThis.sessionStorage = {
    getItem: (key) => session.get(key) ?? null,
    setItem: (key, value) => session.set(key, value),
  };
  globalThis.fetch = (_url, request) => {
    logged.push({ url: _url, ...JSON.parse(request.body) });
    return Promise.resolve({ ok: true });
  };

  return {
    events, gtag, logged,
    restore() {
      for (const [name, original] of Object.entries(originals)) {
        if (original === undefined) delete globalThis[name];
        else globalThis[name] = original;
      }
    },
  };
}

test('one successful lead emits one GA4 generate_lead without a request ID in GTM', () => {
  const ctx = setup();
  try {
    trackFunnelEvent('lead_form_submitted', {
      form_type: 'lead_rdv',
      action: 'calendly',
      lead_request_id: 'internal-uuid',
    });
    assert.equal(ctx.events.length, 1);
    assert.equal(ctx.events[0].event, 'lead_form_submitted');
    assert.equal(ctx.events[0].lead_request_id, undefined);
    assert.deepEqual(ctx.gtag.map((entry) => entry.slice(0, 2)), [['event', 'generate_lead']]);
    assert.equal(ctx.gtag[0][2].lead_request_id, undefined);
    assert.equal(ctx.logged.length, 1);
    assert.equal(ctx.logged[0].metadata.lead_request_id, 'internal-uuid');
  } finally {
    ctx.restore();
  }
});

test('booking has a distinct GA4 event and no identifying third-party payload', () => {
  const ctx = setup();
  try {
    trackFunnelEvent('calendly_booking_completed', {
      form_type: 'lead_rdv',
      action: 'calendly',
      lead_request_id: 'private-booking-id',
    });
    assert.deepEqual(ctx.gtag.map((entry) => entry[1]), ['book_appointment']);
    assert.equal(ctx.events[0].lead_request_id, undefined);
    assert.equal(ctx.logged.length, 1);
  } finally {
    ctx.restore();
  }
});

test('analytics refusal prevents emission and first-party funnel logging', () => {
  const ctx = setup({ consent: false });
  try {
    trackFunnelEvent('lead_form_submitted', { form_type: 'lead_rdv' });
    assert.equal(ctx.events.length, 0);
    assert.equal(ctx.gtag.length, 0);
    assert.equal(ctx.logged.length, 0);
  } finally {
    ctx.restore();
  }
});

test('preview environments never send GA4 conversion hits', () => {
  const ctx = setup({ hostname: 'deploy-preview-209--maximusscpi.netlify.app' });
  try {
    trackFunnelEvent('lead_form_submitted', { form_type: 'lead_rdv' });
    assert.equal(ctx.gtag.length, 0);
  } finally {
    ctx.restore();
  }
});

test('RdvModal delegates confirmed conversion to central submitLead only', () => {
  const modal = readFileSync(new URL('../../src/components/RdvModal.tsx', import.meta.url), 'utf8');
  const submitter = readFileSync(new URL('../../src/utils/leadSubmitter.ts', import.meta.url), 'utf8');
  assert.match(modal, /const result = await submitLead\(/);
  assert.doesNotMatch(modal, /trackFunnelEvent\(['"]lead_form_submitted['"]/);
  assert.match(submitter, /function trackSuccessfulLead\(/);
  assert.match(submitter, /trackFunnelEvent\(['"]lead_form_submitted['"]/);
  assert.match(modal, /if \(!result\.ok\)/);
});
