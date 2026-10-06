export type FunnelEventName =
  | 'quiz_started'
  | 'quiz_step_1_completed'
  | 'quiz_step_2_completed'
  | 'quiz_step_3_completed'
  | 'quiz_completed'
  | 'analysis_opened'
  | 'scpi_detail_opened'
  | 'hero_portfolio_clicked'
  | 'portfolio_validation_clicked'
  | 'lead_form_opened'
  | 'lead_form_submitted'
  | 'calendly_opened'
  | 'calendly_booking_completed';

type FunnelMetadata = Record<string, string | number | boolean | null | undefined>;

const CONSENT_KEY = 'cookie-consent';
const SESSION_KEY = 'maximus_funnel_session_id';

const hasAnalyticsConsent = () => {
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

const getSessionId = () => {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

const sanitizeMetadata = (metadata: FunnelMetadata) => {
  const allowed = new Set([
    'step',
    'source',
    'scpi_id',
    'scpi_name',
    'portfolio_size',
    'form_type',
    'action',
    'lead_request_id',
  ]);

  return Object.fromEntries(
    Object.entries(metadata)
      .filter(([key, value]) => allowed.has(key) && value !== undefined)
      .map(([key, value]) => [
        key,
        typeof value === 'string' ? value.slice(0, 160) : value,
      ]),
  );
};

export const trackFunnelEvent = (
  eventName: FunnelEventName,
  metadata: FunnelMetadata = {},
) => {
  if (typeof window === 'undefined' || !hasAnalyticsConsent()) return;

  const safeMetadata = sanitizeMetadata(metadata);
  const sessionId = getSessionId();

  // GTM / GA4 can consume the exact same event names.
  const dataLayer = (window as Window & { dataLayer?: unknown[] }).dataLayer;
  if (Array.isArray(dataLayer)) {
    dataLayer.push({ event: eventName, ...safeMetadata });
  }

  // First-party operational funnel log. Never blocks the user journey.
  void fetch('/api/funnel-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    body: JSON.stringify({
      event_name: eventName,
      session_id: sessionId,
      path: window.location.pathname,
      metadata: safeMetadata,
    }),
  }).catch(() => undefined);
};
