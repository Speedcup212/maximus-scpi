import { useState, useEffect } from 'react';

export interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
  version: string;
}

const CONSENT_KEY = 'cookie-consent';
const CONSENT_VERSION = '1.0';
const CONSENT_DURATION = 13 * 30 * 24 * 60 * 60 * 1000;

const defaultConsent: CookieConsent = {
  necessary: true,
  analytics: false,
  marketing: false,
  timestamp: 0,
  version: CONSENT_VERSION,
};

export const useCookieConsent = () => {
  const [consent, setConsentState] = useState<CookieConsent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);

    if (stored) {
      try {
        const parsed: CookieConsent = JSON.parse(stored);
        const isExpired = Date.now() - parsed.timestamp > CONSENT_DURATION;
        const isOutdated = parsed.version !== CONSENT_VERSION;

        if (isExpired || isOutdated) {
          localStorage.removeItem(CONSENT_KEY);
          setShowBanner(true);
          setConsentState(null);
        } else {
          setConsentState(parsed);
          applyConsent(parsed);
        }
      } catch {
        setShowBanner(true);
        setConsentState(null);
      }
    } else {
      setShowBanner(true);
    }
  }, []);

  const saveConsent = (newConsent: Partial<CookieConsent>) => {
    const fullConsent: CookieConsent = {
      necessary: true,
      analytics: newConsent.analytics ?? false,
      marketing: newConsent.marketing ?? false,
      timestamp: Date.now(),
      version: CONSENT_VERSION,
    };

    localStorage.setItem(CONSENT_KEY, JSON.stringify(fullConsent));
    setConsentState(fullConsent);
    setShowBanner(false);
    applyConsent(fullConsent);
  };

  const acceptAll = () => {
    saveConsent({ analytics: true, marketing: true });
  };

  const rejectAll = () => {
    saveConsent({ analytics: false, marketing: false });
  };

  const openSettings = () => {
    setShowBanner(true);
  };

  const closeBanner = () => {
    saveConsent({ analytics: false, marketing: false });
  };

  const applyConsent = (consent: CookieConsent) => {
    if (typeof window === 'undefined') return;

    // Google Consent Mode v2 - Mise à jour du consentement
    // Même en mode "denied", Google peut envoyer des pings anonymes (conversions modelées)
    window.gtag?.('consent', 'update', {
      'ad_storage': consent.marketing ? 'granted' : 'denied',
      'ad_user_data': consent.marketing ? 'granted' : 'denied',
      'ad_personalization': consent.marketing ? 'granted' : 'denied',
      'analytics_storage': consent.analytics ? 'granted' : 'denied'
    });

    // Si l'utilisateur accepte, activer la personnalisation des annonces
    if (consent.marketing) {
      window.gtag?.('set', 'allow_ad_personalization_signals', true);
    } else {
      window.gtag?.('set', 'allow_ad_personalization_signals', false);
    }

    console.log('✅ Google Consent Mode v2 mis à jour:', {
      marketing: consent.marketing ? 'granted' : 'denied',
      analytics: consent.analytics ? 'granted' : 'denied',
      note: 'Les conversions modelées fonctionnent même en mode denied'
    });
  };

  return {
    consent,
    showBanner,
    acceptAll,
    rejectAll,
    saveConsent,
    openSettings,
    closeBanner,
  };
};

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
