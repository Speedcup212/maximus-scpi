import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let captureAttribution: typeof import('../utils/attribution').captureAttribution;
let persistAttribution: typeof import('../utils/attribution').persistAttribution;
let getAttribution: typeof import('../utils/attribution').getAttribution;

describe('session UTM attribution', () => {
  let session: Map<string, string>;
  let browser: { location: URL };
  let consent: string | null;

  beforeEach(async () => {
    vi.resetModules();
    session = new Map();
    consent = JSON.stringify({ analytics: true });
    browser = { location: new URL('https://maximusscpi.com/simulateur-scpi/') };
    vi.stubGlobal('window', browser);
    vi.stubGlobal('localStorage', { getItem: () => consent });
    vi.stubGlobal('sessionStorage', {
      getItem: (key: string) => session.get(key) ?? null,
      setItem: vi.fn((key: string, value: string) => session.set(key, value)),
    });
    ({ captureAttribution, persistAttribution, getAttribution } = await import('../utils/attribution'));
  });

  afterEach(() => vi.unstubAllGlobals());

  it('persists at startup when consent is already present and keeps UTM after navigation', () => {
    browser.location.search = '?utm_source=facebook&utm_medium=social&utm_campaign=cas_marc_52';
    captureAttribution();
    browser.location = new URL('https://maximusscpi.com/contact/');
    captureAttribution();

    expect(getAttribution()).toEqual({
      utm_source: 'facebook', utm_medium: 'social', utm_campaign: 'cas_marc_52',
    });
    expect(Object.fromEntries(session)).toEqual(getAttribution());
  });

  it.each([true, false])('keeps the first tagged URL with existing consent: %s', (allowed) => {
    consent = JSON.stringify({ analytics: allowed });
    browser.location.search = '?utm_source=facebook&utm_medium=social&utm_campaign=first';
    captureAttribution();
    browser.location.search = '?utm_source=tiktok&utm_medium=paid&utm_campaign=second';
    captureAttribution();

    expect(getAttribution()).toEqual({
      utm_source: 'facebook', utm_medium: 'social', utm_campaign: 'first',
    });
    expect(session.size).toBe(allowed ? 3 : 0);
  });

  it('preserves existing keys and can fill a previously missing UTM', () => {
    session.set('utm_source', 'linkedin');
    browser.location.search = '?utm_source=facebook&utm_medium=social';
    captureAttribution();
    expect(getAttribution()).toEqual({ utm_source: 'linkedin', utm_medium: 'social' });
  });

  it('lowercases, removes forbidden characters and limits each value to 80 characters', () => {
    const params = new URLSearchParams({
      utm_source: ' FaCeBOOK !!!-_é😀',
      utm_medium: 'SOCIAL / PAID',
      utm_campaign: 'X!'.repeat(100),
    });
    browser.location.search = params.toString();
    captureAttribution();
    expect(getAttribution()).toEqual({
      utm_source: 'facebook-_', utm_medium: 'socialpaid', utm_campaign: 'x'.repeat(80),
    });
  });

  it('ignores empty cleaned values and unrelated parameters', () => {
    browser.location.search = new URLSearchParams({
      utm_source: ' !!!é😀', utm_medium: '', utm_campaign: '///',
      utm_term: 'untracked', email: 'fixture@example.test',
    }).toString();
    captureAttribution();
    expect(getAttribution()).toEqual({});
    expect(session.size).toBe(0);
  });

  it('keeps untagged sessions empty', () => {
    captureAttribution();
    expect(getAttribution()).toEqual({});
    expect(session.size).toBe(0);
  });

  it('also sanitizes values written by legacy components when reading', () => {
    session.set('utm_source', 'FaceBook !!!');
    session.set('utm_campaign', 'X'.repeat(100));
    expect(getAttribution()).toEqual({ utm_source: 'facebook', utm_campaign: 'x'.repeat(80) });
    expect(session.get('utm_source')).toBe('FaceBook !!!');
  });

  it('never throws when storage access is blocked', () => {
    browser.location.search = '?utm_source=facebook';
    vi.stubGlobal('sessionStorage', {
      getItem: () => { throw new Error('Storage blocked'); },
    });
    expect(() => captureAttribution()).not.toThrow();
    expect(getAttribution()).toEqual({ utm_source: 'facebook' });
  });

  it('never throws when storage writes fail', () => {
    browser.location.search = '?utm_source=facebook';
    vi.stubGlobal('sessionStorage', {
      getItem: () => null,
      setItem: () => { throw new Error('Quota exceeded'); },
    });
    expect(() => captureAttribution()).not.toThrow();
    expect(getAttribution()).toEqual({ utm_source: 'facebook' });
  });

  it.each([null, '{}', '{bad json', '{"analytics":false}'])(
    'keeps captured UTM only in memory without analytics consent: %s', (value) => {
      consent = value;
      browser.location.search = '?utm_source=FaceBook&utm_medium=SOCIAL&utm_campaign=first';
      captureAttribution();
      persistAttribution();
      expect(session.size).toBe(0);
      expect(sessionStorage.setItem).not.toHaveBeenCalled();
      expect(getAttribution()).toEqual({
        utm_source: 'facebook', utm_medium: 'social', utm_campaign: 'first',
      });
    },
  );

  it('persists remembered UTM after acceptance without replacing existing session keys', () => {
    consent = null;
    browser.location.search = '?utm_source=facebook&utm_medium=social';
    captureAttribution();
    expect(session.size).toBe(0);

    session.set('utm_source', 'linkedin');
    consent = JSON.stringify({ analytics: true });
    persistAttribution();
    persistAttribution();
    expect(Object.fromEntries(session)).toEqual({ utm_source: 'linkedin', utm_medium: 'social' });
    expect(getAttribution()).toEqual({ utm_source: 'linkedin', utm_medium: 'social' });
  });

  it('does not persist remembered UTM after consent is withdrawn', () => {
    browser.location.search = '?utm_source=facebook';
    captureAttribution();
    session.clear();
    consent = JSON.stringify({ analytics: false });
    persistAttribution();
    expect(session.size).toBe(0);
    expect(getAttribution()).toEqual({ utm_source: 'facebook' });
  });

  it('is safe without a browser', () => {
    vi.stubGlobal('window', undefined);
    expect(() => captureAttribution()).not.toThrow();
    expect(() => persistAttribution()).not.toThrow();
    expect(getAttribution()).toEqual({});
  });
});
