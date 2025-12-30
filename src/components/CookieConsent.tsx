import React, { useState } from 'react';
import { Shield, X } from 'lucide-react';
import { useCookieConsent } from '../hooks/useCookieConsent';
import { CookieSettings } from './CookieSettings';

export const CookieConsent: React.FC = () => {
  const { showBanner, acceptAll, rejectAll, closeBanner } = useCookieConsent();
  const [showSettings, setShowSettings] = useState(false);

  if (!showBanner) return null;

  if (showSettings) {
    return <CookieSettings onClose={() => setShowSettings(false)} />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeBanner}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 animate-slide-up">
        <button
          onClick={closeBanner}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
          aria-label="Fermer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Votre confidentialité est notre priorité
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Pour optimiser votre expérience et mesurer la performance de nos conseils, nous utilisons des cookies.
              Acceptez-vous que nous utilisions ces données pour améliorer notre service ?
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={acceptAll}
            className="w-full px-6 py-4 text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            Accepter tout
          </button>

          <button
            onClick={rejectAll}
            className="w-full px-6 py-4 text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400 rounded-xl transition-all"
          >
            Refuser tout
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="w-full px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-800 hover:underline transition-colors"
          >
            Personnaliser mes choix
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-6">
          En cliquant sur "Accepter tout", vous consentez à l'utilisation de cookies pour l'analyse et le marketing.
          Vous pouvez modifier vos préférences à tout moment.
        </p>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};
