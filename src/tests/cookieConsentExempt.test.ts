import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// RECOVERY-203 — harnais minimal de hook (le projet n'embarque ni jsdom ni
// testing-library) : chaque « montage » a ses propres états, comme le bandeau,
// la fenêtre de réglages et le pied de page dans l'application.
type Instance = { states: unknown[]; index: number; effects: Array<() => unknown> };
const runtime = vi.hoisted(() => ({ current: null as Instance | null }));

vi.mock('react', async importOriginal => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useState(initial: unknown) {
      const instance = runtime.current as Instance;
      const index = instance.index++;
      if (!(index in instance.states)) {
        instance.states[index] = typeof initial === 'function' ? (initial as () => unknown)() : initial;
      }
      return [instance.states[index], (next: unknown) => {
        instance.states[index] = typeof next === 'function'
          ? (next as (previous: unknown) => unknown)(instance.states[index]) : next;
      }];
    },
    useEffect(effect: () => unknown) {
      (runtime.current as Instance).effects.push(effect);
    },
  };
});

let useCookieConsent: typeof import('../hooks/useCookieConsent').useCookieConsent;
let COOKIE_SETTINGS_OPEN_EVENT: string;
let hasAudienceOptOut: typeof import('../utils/analyticsConsent').hasAudienceOptOut;

function mount() {
  const instance: Instance = { states: [], index: 0, effects: [] };
  const render = () => {
    instance.index = 0;
    instance.effects = [];
    runtime.current = instance;
    const api = useCookieConsent();
    runtime.current = null;
    return api;
  };
  const api = render();
  for (const effect of instance.effects) effect();
  return { api, render };
}

describe('cookie consent instances stay in sync (RECOVERY-203)', () => {
  let storage: Map<string, string>;

  beforeEach(async () => {
    vi.resetModules();
    storage = new Map<string, string>();
    vi.stubGlobal('window', new EventTarget());
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    });
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    ({ useCookieConsent, COOKIE_SETTINGS_OPEN_EVENT } = await import('../hooks/useCookieConsent'));
    ({ hasAudienceOptOut } = await import('../utils/analyticsConsent'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('the footer link opens the settings through a shared event', () => {
    const footer = mount();
    const opened = vi.fn();
    window.addEventListener(COOKIE_SETTINGS_OPEN_EVENT, opened);
    footer.api.openSettings();
    expect(opened).toHaveBeenCalledTimes(1);
  });

  it('saving choices from another instance hides the banner', () => {
    const banner = mount();
    expect(banner.render().showBanner).toBe(true);

    const settings = mount();
    settings.api.saveConsent({ analytics: false, marketing: true });

    const synced = banner.render();
    expect(synced.showBanner).toBe(false);
    expect(synced.consent).toMatchObject({ analytics: false, marketing: true });
    expect(JSON.parse(storage.get('cookie-consent') as string)).toMatchObject({
      analytics: false, marketing: true,
    });
  });

  it('refusing cookies is not an objection to the exempt measurement', () => {
    const banner = mount();
    banner.api.rejectAll();
    expect(hasAudienceOptOut()).toBe(false);
    banner.api.closeBanner();
    expect(hasAudienceOptOut()).toBe(false);
  });

  it('accepting everything lifts a previous objection', () => {
    storage.set('maximus-audience-optout', '1');
    expect(hasAudienceOptOut()).toBe(true);
    mount().api.acceptAll();
    expect(hasAudienceOptOut()).toBe(false);
    expect(JSON.parse(storage.get('cookie-consent') as string)).toMatchObject({
      analytics: true, marketing: true,
    });
  });
});
