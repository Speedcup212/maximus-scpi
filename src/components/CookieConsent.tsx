import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { COOKIE_SETTINGS_OPEN_EVENT, useCookieConsent } from '../hooks/useCookieConsent';
const CookieSettings = lazy(() => import('./CookieSettings').then(module => ({ default: module.CookieSettings })));

// RECOVERY-203 — bandeau en bas d'écran, sans fond assombri : la page (et le
// simulateur) reste visible et utilisable avant tout choix.
export const CookieConsent: React.FC = () => {
  const { showBanner, acceptAll, rejectAll, closeBanner } = useCookieConsent();
  const [showSettings, setShowSettings] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  // Le lien « Gérer les cookies » du pied de page ouvre les réglages ici.
  useEffect(() => {
    const open = () => setShowSettings(true);
    window.addEventListener(COOKIE_SETTINGS_OPEN_EVENT, open);
    return () => window.removeEventListener(COOKIE_SETTINGS_OPEN_EVENT, open);
  }, []);

  // Tant que le bandeau est affiché, une marge basse garde le bas de page
  // (pied de page, mentions) atteignable au défilement.
  const barVisible = showBanner && !showSettings;
  useEffect(() => {
    if (!barVisible || !barRef.current) return;
    const bar = barRef.current;
    const previous = document.body.style.paddingBottom;
    const apply = () => {
      document.body.style.paddingBottom = `${bar.offsetHeight}px`;
    };
    apply();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(apply) : null;
    observer?.observe(bar);
    return () => {
      observer?.disconnect();
      document.body.style.paddingBottom = previous;
    };
  }, [barVisible]);

  if (showSettings) {
    return <Suspense fallback={null}><CookieSettings onClose={() => setShowSettings(false)} /></Suspense>;
  }

  if (!showBanner) return null;

  return (
    <div
      ref={barRef}
      role="region"
      aria-label="Gestion des cookies"
      className="fixed inset-x-0 bottom-0 z-[60] p-2 sm:p-4 pointer-events-none"
    >
      <div className="relative pointer-events-auto mx-auto max-w-5xl rounded-2xl border border-gray-200 bg-white shadow-2xl p-4 sm:p-5 animate-cookie-slide-up md:flex md:items-center md:gap-6">
        <button
          type="button"
          onClick={closeBanner}
          className="absolute top-3 right-4 text-xs font-medium text-gray-500 hover:text-gray-800 underline underline-offset-2"
        >
          Continuer sans accepter
        </button>

        <div className="flex-1 min-w-0">
          <p className="pr-40 text-sm sm:text-base font-bold text-gray-900">
            Cookies
          </p>
          <p className="mt-1 text-xs sm:text-sm leading-relaxed text-gray-600">
            Avec votre accord, Google Analytics et Google Ads mesurent la fréquentation et nos campagnes.
            Une mesure d'audience anonyme, réservée à MaximusSCPI, reste active : vous pouvez vous y
            opposer dans « Personnaliser ».
          </p>
        </div>

        <div className="mt-3 md:mt-6 shrink-0 md:w-72">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={acceptAll}
              className="px-4 py-2.5 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors"
            >
              Accepter
            </button>
            <button
              type="button"
              onClick={rejectAll}
              className="px-4 py-2.5 text-sm font-bold text-gray-800 bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400 rounded-xl transition-colors"
            >
              Refuser
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="mt-1.5 w-full text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 underline underline-offset-2"
          >
            Personnaliser
          </button>
        </div>
      </div>

      <style>{`
        @keyframes cookie-slide-up {
          from {
            transform: translateY(16px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-cookie-slide-up {
          animation: cookie-slide-up 0.3s ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-cookie-slide-up {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};
