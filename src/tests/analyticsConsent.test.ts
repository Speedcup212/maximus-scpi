import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { hasAnalyticsConsent } from '../utils/analyticsConsent';

describe('existing analytics consent policy', () => {
  beforeEach(() => vi.stubGlobal('window', {}));
  afterEach(() => vi.unstubAllGlobals());

  it.each([
    [null, false],
    ['', false],
    ['{bad json', false],
    ['null', false],
    ['{}', false],
    ['{"analytics":false}', false],
    ['{"analytics":"true"}', false],
    ['{"analytics":1}', false],
    ['{"analytics":true}', true],
  ])('returns the unchanged consent decision for %s', (raw, expected) => {
    const getItem = vi.fn(() => raw);
    vi.stubGlobal('localStorage', { getItem });
    expect(hasAnalyticsConsent()).toBe(expected);
    expect(getItem).toHaveBeenCalledWith('cookie-consent');
  });

  it('returns false when localStorage is blocked', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => { throw new Error('Storage blocked'); },
    });
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it('returns false without a browser', () => {
    vi.stubGlobal('window', undefined);
    expect(hasAnalyticsConsent()).toBe(false);
  });
});
