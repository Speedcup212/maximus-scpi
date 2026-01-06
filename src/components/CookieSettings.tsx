import React, { useState } from 'react';
import { X, Cookie, BarChart3, Target, Shield } from 'lucide-react';
import { useCookieConsent } from '../hooks/useCookieConsent';

interface CookieSettingsProps {
  onClose: () => void;
}

export const CookieSettings: React.FC<CookieSettingsProps> = ({ onClose }) => {
  const { consent, saveConsent, acceptAll } = useCookieConsent();

  const [analytics, setAnalytics] = useState(consent?.analytics ?? false);
  const [marketing, setMarketing] = useState(consent?.marketing ?? false);

  const handleSave = () => {
    saveConsent({ analytics, marketing });
    onClose();
  };

  const handleAcceptAll = () => {
    acceptAll();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cookie className="h-6 w-6 text-green-400" />
            <h2 className="text-2xl font-bold text-white">Paramètres des cookies</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white transition-colors"
            aria-label="Fermer"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-slate-300 leading-relaxed">
            Nous utilisons des cookies pour améliorer votre expérience sur notre site.
            Vous pouvez choisir les catégories de cookies que vous souhaitez autoriser.
          </p>

          <div className="space-y-4">
            <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">Cookies nécessaires</h3>
                </div>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                  Toujours actifs
                </span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Ces cookies sont essentiels au fonctionnement du site. Ils permettent d'assurer
                la sécurité, la navigation et les fonctionnalités de base. Ils ne peuvent pas être désactivés.
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Cookies analytiques</h3>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-2">
                Ces cookies nous aident à comprendre comment les visiteurs utilisent notre site
                en collectant des informations de manière anonyme.
              </p>
              <p className="text-slate-500 text-xs">
                Services : Google Analytics (GA4)
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">Cookies marketing</h3>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-2">
                Ces cookies sont utilisés pour suivre les conversions et optimiser nos campagnes
                publicitaires afin de vous proposer du contenu pertinent.
              </p>
              <p className="text-slate-500 text-xs">
                Services : Google Ads, conversion tracking
              </p>
            </div>
          </div>

          <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-sm leading-relaxed">
              <strong className="text-white">Note :</strong> Vos préférences sont enregistrées pour une durée de 13 mois.
              Vous pouvez modifier vos choix à tout moment depuis le lien "Gérer les cookies" en bas de page.
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 bg-slate-900 border-t border-slate-700 px-6 py-4 flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-3 text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-all"
          >
            Enregistrer mes choix
          </button>
          <button
            onClick={handleAcceptAll}
            className="px-6 py-3 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-lg transition-all shadow-lg hover:shadow-green-500/50"
          >
            Tout accepter
          </button>
        </div>
      </div>
    </div>
  );
};
