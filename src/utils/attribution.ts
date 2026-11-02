import { hasAnalyticsConsent } from './analyticsConsent';

const ATTRIBUTION_KEYS = ['utm_source', 'utm_medium', 'utm_campaign'] as const;

type Attribution = Partial<Record<(typeof ATTRIBUTION_KEYS)[number], string>>;

const memoryAttribution: Attribution = {};

const normalize = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 80);

export function captureAttribution(): void {
  try {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    for (const key of ATTRIBUTION_KEYS) {
      if (memoryAttribution[key]) continue;

      const value = normalize(params.get(key) || '');
      if (value) memoryAttribution[key] = value;
    }
    persistAttribution();
  } catch {
    // Attribution must never prevent the application from mounting.
  }
}

export function persistAttribution(): void {
  try {
    if (!hasAnalyticsConsent()) return;

    for (const key of ATTRIBUTION_KEYS) {
      const value = memoryAttribution[key];
      if (value && sessionStorage.getItem(key) === null) {
        sessionStorage.setItem(key, value);
      }
    }
  } catch {
    // Keep the in-memory attribution if sessionStorage is unavailable.
  }
}

export function getAttribution(): Attribution {
  const attribution: Attribution = { ...memoryAttribution };
  try {
    if (typeof window === 'undefined') return {};

    for (const key of ATTRIBUTION_KEYS) {
      // Legacy landing pages can still write raw values to these shared keys.
      const value = normalize(sessionStorage.getItem(key) || '');
      if (value) attribution[key] = value;
    }
  } catch {
    // Browsing remains available when sessionStorage is blocked.
  }
  return attribution;
}
