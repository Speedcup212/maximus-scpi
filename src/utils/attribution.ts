const ATTRIBUTION_KEYS = ['utm_source', 'utm_medium', 'utm_campaign'] as const;

type Attribution = Partial<Record<(typeof ATTRIBUTION_KEYS)[number], string>>;

const normalize = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 80);

export function captureAttribution(): void {
  try {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    for (const key of ATTRIBUTION_KEYS) {
      if (sessionStorage.getItem(key) !== null) continue;

      const value = normalize(params.get(key) || '');
      if (value) sessionStorage.setItem(key, value);
    }
  } catch {
    // Attribution must never prevent the application from mounting.
  }
}

export function getAttribution(): Attribution {
  const attribution: Attribution = {};
  try {
    if (typeof window === 'undefined') return attribution;

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
