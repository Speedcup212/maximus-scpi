// MaximusSCPI — URLs Calendly centralisées
// VITE_CALENDLY_URL : rendez-vous général MaximusSCPI.
// VITE_CALENDLY_PORTFOLIO_URL : validation d'une allocation issue du questionnaire.
const FALLBACK_CALENDLY_URL =
  'https://calendly.com/eric-bellaiche/rdv-strategique-scpi';

const FALLBACK_PORTFOLIO_CALENDLY_URL =
  'https://calendly.com/eric-bellaiche/scpi-construire-son-portefeuille';

export const CALENDLY_URL =
  import.meta.env.VITE_CALENDLY_URL || FALLBACK_CALENDLY_URL;

export const PORTFOLIO_CALENDLY_URL =
  import.meta.env.VITE_CALENDLY_PORTFOLIO_URL || FALLBACK_PORTFOLIO_CALENDLY_URL;

interface CalendlyPrefill {
  name?: string;
  email?: string;
}

/**
 * Construit une URL Calendly traçable.
 *
 * - conserve les UTM de la session d'acquisition ;
 * - ajoute un fallback MaximusSCPI quand aucun UTM n'est présent ;
 * - place la page / SCPI d'origine dans utm_content ;
 * - peut préremplir le nom et l'email après capture du lead ;
 * - accepte une URL Calendly dédiée pour certains tunnels.
 */
export function buildCalendlyUrl(
  contextSlug?: string,
  prefill: CalendlyPrefill = {},
  baseUrl: string = CALENDLY_URL
): string {
  try {
    const url = new URL(baseUrl);
    const browserAvailable = typeof window !== 'undefined';

    const currentParams = browserAvailable
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();

    const getTracking = (key: string): string | null => {
      if (!browserAvailable) return null;
      return sessionStorage.getItem(key) || currentParams.get(key);
    };

    const pathContext = browserAvailable
      ? window.location.pathname.replace(/^\/+|\/+$/g, '')
      : '';

    const resolvedContext = (contextSlug || pathContext || 'site').trim();

    url.searchParams.set('utm_source', getTracking('utm_source') || 'maximusscpi');
    url.searchParams.set('utm_medium', getTracking('utm_medium') || 'site');
    url.searchParams.set('utm_campaign', getTracking('utm_campaign') || 'rdv_scpi');
    url.searchParams.set('utm_content', resolvedContext);

    const utmTerm = getTracking('utm_term');
    if (utmTerm) url.searchParams.set('utm_term', utmTerm);

    if (prefill.name?.trim()) url.searchParams.set('name', prefill.name.trim());
    if (prefill.email?.trim()) url.searchParams.set('email', prefill.email.trim());

    return url.toString();
  } catch {
    return baseUrl;
  }
}
