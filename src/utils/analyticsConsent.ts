const CONSENT_KEY = 'cookie-consent';

export const hasAnalyticsConsent = () => {
  if (typeof window === 'undefined') return false;

  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { analytics?: boolean };
    return parsed.analytics === true;
  } catch {
    return false;
  }
};
