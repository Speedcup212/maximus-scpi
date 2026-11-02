import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { captureAttribution, getAttribution } from '../utils/attribution';

describe('session UTM attribution', () => {
  let session: Map<string, string>;
  let browser: { location: URL };

  beforeEach(() => {
    session = new Map();
    browser = { location: new URL('https://maximusscpi.com/simulateur-scpi/') };
    vi.stubGlobal('window', browser);
    vi.stubGlobal('sessionStorage', {
      getItem: (key: string) => session.get(key) ?? null,
      setItem: (key: string, value: string) => session.set(key, value),
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  it('captures the three existing session keys and keeps them after navigation', () => {
    browser.location.search = '?utm_source=facebook&utm_medium=social&utm_campaign=cas_marc_52';
    captureAttribution();
    browser.location = new URL('https://maximusscpi.com/contact/');
    captureAttribution();

    expect(getAttribution()).toEqual({
      utm_source: 'facebook', utm_medium: 'social', utm_campaign: 'cas_marc_52',
    });
    expect(Object.fromEntries(session)).toEqual(getAttribution());
  });

  it('does not overwrite the first value when a second tagged URL is opened', () => {
    browser.location.search = '?utm_source=facebook&utm_medium=social&utm_campaign=first';
    captureAttribution();
    browser.location.search = '?utm_source=tiktok&utm_medium=paid&utm_campaign=second';
    captureAttribution();

    expect(getAttribution()).toEqual({
      utm_source: 'facebook', utm_medium: 'social', utm_campaign: 'first',
    });
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
    expect(getAttribution()).toEqual({});
  });

  it('never throws when storage writes fail', () => {
    browser.location.search = '?utm_source=facebook';
    vi.stubGlobal('sessionStorage', {
      getItem: () => null,
      setItem: () => { throw new Error('Quota exceeded'); },
    });
    expect(() => captureAttribution()).not.toThrow();
    expect(getAttribution()).toEqual({});
  });

  it('is safe without a browser', () => {
    vi.stubGlobal('window', undefined);
    expect(() => captureAttribution()).not.toThrow();
    expect(getAttribution()).toEqual({});
  });
});
