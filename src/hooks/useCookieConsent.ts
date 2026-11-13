import { useState, useEffect } from 'react';
import { setAudienceOptOut } from '../utils/analyticsConsent';

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

// RECOVERY-203 — chaque composant (bandeau, réglages, pied de page) a sa
// propre instance du hook. Ces deux événements les synchronisent : sans eux,
// le lien « Gérer les cookies » du pied de page n'ouvrait rien et le bandeau
// réapparaissait après « Enregistrer mes choix ».
export const COOKIE_SETTINGS_OPEN_EVENT = 'maximus:cookie-settings-open';
const COOKIE_CONSENT_UPDATED_EVENT = 'maximus:cookie-consent-updated';

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

    const onConsentUpdated = (event: Event) => {
      const updated = (event as CustomEvent<CookieConsent>).detail;
      if (!updated) return;
      setConsentState(updated);
      setShowBanner(false);
    };
    window.addEventListener(COOKIE_CONSENT_UPDATED_EVENT, onConsentUpdated);
    return () => window.removeEventListener(COOKIE_CONSENT_UPDATED_EVENT, onConsentUpdated);
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
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_UPDATED_EVENT, { detail: fullConsent }));
  };

  const acceptAll = () => {
    // Le consentement couvre la mesure d'audience : l'opposition est levée.
    setAudienceOptOut(false);
    saveConsent({ analytics: true, marketing: true });
  };

  const rejectAll = () => {
    // Refuser les cookies soumis à consentement ne vaut pas opposition à la
    // mesure d'audience exemptée ; l'opposition se règle dans « Personnaliser ».
    saveConsent({ analytics: false, marketing: false });
  };

  const openSettings = () => {
    window.dispatchEvent(new Event(COOKIE_SETTINGS_OPEN_EVENT));
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
