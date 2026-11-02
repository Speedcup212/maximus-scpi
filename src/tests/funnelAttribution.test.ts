import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FunnelEventName } from '../utils/funnelAnalytics';
import { buildCalendlyUrl } from '../config/calendly';

let captureAttribution: typeof import('../utils/attribution').captureAttribution;
let trackFunnelEvent: typeof import('../utils/funnelAnalytics').trackFunnelEvent;
let submitLead: typeof import('../utils/leadSubmitter').submitLead;

const database = vi.hoisted(() => ({ insert: vi.fn(), invoke: vi.fn() }));
vi.mock('../supabaseClient', () => ({
  supabase: {
    from: () => ({ insert: database.insert }),
    functions: { invoke: database.invoke },
  },
}));

const attribution = {
  utm_source: 'facebook', utm_medium: 'social', utm_campaign: 'cas_marc_52',
};
const eventNames: FunnelEventName[] = [
  'quiz_started', 'quiz_step_1_completed', 'quiz_step_2_completed',
  'quiz_step_3_completed', 'quiz_completed', 'analysis_opened', 'scpi_detail_opened',
  'hero_portfolio_clicked', 'portfolio_validation_clicked', 'simulation_start',
  'simulation_result', 'qualified_50k', 'rdv_click', 'lead_form_opened',
  'lead_form_submitted', 'calendly_opened', 'calendly_booking_completed',
];

describe('funnel and existing lead consumers receive session attribution', () => {
  let browser: { location: URL; dataLayer: unknown[]; gtag: ReturnType<typeof vi.fn> };
  let consent: string | null;
  let session: Map<string, string>;
  const send = vi.fn<typeof fetch>();

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    session = new Map<string, string>();
    consent = JSON.stringify({ analytics: true });
    browser = {
      location: new URL('https://maximusscpi.com/simulateur-scpi/'),
      dataLayer: [], gtag: vi.fn(),
    };
    vi.stubGlobal('window', browser);
    vi.stubGlobal('document', { referrer: '' });
    vi.stubGlobal('localStorage', { getItem: () => consent });
    vi.stubGlobal('sessionStorage', {
      getItem: (key: string) => session.get(key) ?? null,
      setItem: vi.fn((key: string, value: string) => session.set(key, value)),
    });
    send.mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', send);
    database.insert.mockResolvedValue({ error: null });
    database.invoke.mockResolvedValue({});
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'info').mockImplementation(() => undefined);
    ({ captureAttribution } = await import('../utils/attribution'));
    ({ trackFunnelEvent } = await import('../utils/funnelAnalytics'));
    ({ submitLead } = await import('../utils/leadSubmitter'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  function arriveThenNavigate() {
    browser.location.search = new URLSearchParams(attribution).toString();
    captureAttribution();
    browser.location = new URL('https://maximusscpi.com/contact/');
  }

  function loggedEvent() {
    return JSON.parse(send.mock.calls[0][1]?.body as string);
  }

  it.each(eventNames)('adds the captured UTM to %s after navigation with consent', (name) => {
    arriveThenNavigate();
    trackFunnelEvent(name, { source: 'simulateur_scpi', step: 1 });
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toBe('/api/funnel-event');
    expect(loggedEvent()).toMatchObject({
      event_name: name, path: '/contact/',
      metadata: { source: 'simulateur_scpi', step: 1, ...attribution },
    });
    expect(browser.dataLayer).toEqual([
      { event: name, source: 'simulateur_scpi', step: 1, ...attribution },
    ]);
  });

  it.each([null, '{}', '{bad json', '{"analytics":false}'])(
    'sends nothing when analytics consent is absent or refused: %s', (value) => {
      consent = value;
      arriveThenNavigate();
      for (const name of eventNames) trackFunnelEvent(name);
      expect(send).not.toHaveBeenCalled();
      expect(browser.dataLayer).toEqual([]);
      expect(browser.gtag).not.toHaveBeenCalled();
      expect(session.size).toBe(0);
      expect(sessionStorage.setItem).not.toHaveBeenCalled();
    },
  );

  it('persists same-page acquisition at the first event after late acceptance', () => {
    consent = null;
    browser.location.search = new URLSearchParams(attribution).toString();
    captureAttribution();
    expect(session.size).toBe(0);
    expect(send).not.toHaveBeenCalled();

    consent = JSON.stringify({ analytics: true });
    send.mockImplementation(() => {
      for (const [key, value] of Object.entries(attribution)) {
        expect(session.get(key)).toBe(value);
      }
      return Promise.resolve(new Response(null, { status: 204 }));
    });
    trackFunnelEvent('simulation_start');
    expect(send).toHaveBeenCalledTimes(1);
    expect(loggedEvent()).toMatchObject({
      event_name: 'simulation_start', path: '/simulateur-scpi/', metadata: attribution,
    });
    expect(browser.dataLayer).toEqual([{ event: 'simulation_start', ...attribution }]);
  });

  it('retains in-memory UTM during SPA navigation before late acceptance', () => {
    consent = null;
    arriveThenNavigate();
    expect(session.size).toBe(0);
    consent = JSON.stringify({ analytics: true });
    trackFunnelEvent('lead_form_opened');
    expect(loggedEvent().metadata).toEqual(attribution);
    for (const [key, value] of Object.entries(attribution)) {
      expect(session.get(key)).toBe(value);
    }
  });

  it('retains the existing event payload when the session has no UTM', () => {
    trackFunnelEvent('simulation_start', { step: 1, source: 'site', unused: 'discard' });
    expect(loggedEvent().metadata).toEqual({ step: 1, source: 'site' });
    expect(browser.dataLayer).toEqual([{ event: 'simulation_start', step: 1, source: 'site' }]);
  });

  it('gives the stored acquisition priority over event-supplied UTM', () => {
    arriveThenNavigate();
    trackFunnelEvent('rdv_click', { utm_source: 'tiktok', utm_campaign: 'second' });
    expect(loggedEvent().metadata).toEqual(attribution);
  });

  it('keeps contact details out of events and the request ID out of third parties', () => {
    arriveThenNavigate();
    trackFunnelEvent('lead_form_submitted', {
      form_type: 'lead_rdv', lead_request_id: '622489bf-981b-4cee-b2ce-ea8ca988b724',
      email: 'fixture@example.test', telephone: '0100000000', nom: 'Fixture',
    });
    expect(loggedEvent().metadata).toEqual({
      form_type: 'lead_rdv', lead_request_id: '622489bf-981b-4cee-b2ce-ea8ca988b724',
      ...attribution,
    });
    expect(browser.dataLayer).toEqual([
      { event: 'lead_form_submitted', form_type: 'lead_rdv', ...attribution },
    ]);
    expect(browser.gtag).toHaveBeenCalledWith('event', 'generate_lead', {
      form_type: 'lead_rdv', lead_action: 'unknown', page_path: '/contact/',
    });
  });

  it.each([true, false])('passes UTM to the unchanged submitLead (analytics consent: %s)', async (allowed) => {
    consent = JSON.stringify({ analytics: allowed });
    browser.location.search = new URLSearchParams(attribution).toString();
    captureAttribution();
    if (allowed) browser.location = new URL('https://maximusscpi.com/contact/');
    const result = await submitLead({
      channel: 'contact', form_type: 'lead_rdv',
      identity: { email: 'fixture@example.test' }, answers: { action: 'calendly' },
    });
    expect(result.ok).toBe(true);
    expect(database.insert).toHaveBeenCalledTimes(1);
    expect(database.insert.mock.calls[0][0][0]).toMatchObject(attribution);
    if (allowed) {
      expect(send).toHaveBeenCalledTimes(2);
      for (const [, request] of send.mock.calls) {
        expect(JSON.parse(request?.body as string).metadata).toMatchObject(attribution);
      }
    } else {
      expect(send).not.toHaveBeenCalled();
      expect(browser.dataLayer).toEqual([]);
      expect(browser.gtag).not.toHaveBeenCalled();
      expect(session.size).toBe(0);
      expect(sessionStorage.setItem).not.toHaveBeenCalled();
    }
  });

  it('passes UTM after navigation to the unchanged Calendly builder', () => {
    arriveThenNavigate();
    const target = new URL(buildCalendlyUrl('simulateur-scpi'));
    for (const [key, value] of Object.entries(attribution)) {
      expect(target.searchParams.get(key)).toBe(value);
    }
    expect(target.searchParams.get('utm_content')).toBe('simulateur-scpi');
  });

  it('preserves the Calendly fallback when no UTM is present', () => {
    const target = new URL(buildCalendlyUrl('simulateur-scpi'));
    expect(target.searchParams.get('utm_source')).toBe('maximusscpi');
    expect(target.searchParams.get('utm_medium')).toBe('site');
    expect(target.searchParams.get('utm_campaign')).toBe('rdv_scpi');
  });
});
