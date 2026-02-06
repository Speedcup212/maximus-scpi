import React, { useState, useEffect } from 'react';
import { X, Mail, Send, TrendingUp, Target, Shield, Leaf, Clock, DollarSign } from 'lucide-react';
import { Scpi } from '../types/scpi';
import { ClientProfile } from '../types/riskProfile';
import { createProspect } from '../utils/prospectService';

interface EmailSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedScpi: Scpi[];
  clientProfile: ClientProfile | null;
  profilRisque?: string;
  profilESG?: string;
  horizon?: string;
  objectifs?: string;
  tmi?: string;
  scpi?: string[];
}

const EmailSimulationModal: React.FC<EmailSimulationModalProps> = ({
  isOpen,
  onClose,
  selectedScpi,
  clientProfile,
  profilRisque = "Non défini",
  profilESG = "Standard",
  horizon = "",
  objectifs = "",
  tmi = "",
  scpi = []
}) => {
  const [formValues, setFormValues] = useState({
    email: ''
  });
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Capturer et stocker les paramètres UTM/gclid dès l'ouverture du modal
  useEffect(() => {
    if (isOpen) {
      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = urlParams.get('utm_source');
      const utmMedium = urlParams.get('utm_medium');
      const utmCampaign = urlParams.get('utm_campaign');
      const gclid = urlParams.get('gclid');

      // Stocker en sessionStorage si présents
      if (utmSource || utmMedium || utmCampaign || gclid) {
        console.log('📍 Paramètres Google Ads détectés dans EmailSimulationModal:', { utmSource, utmMedium, utmCampaign, gclid });
        if (utmSource) sessionStorage.setItem('utm_source', utmSource);
        if (utmMedium) sessionStorage.setItem('utm_medium', utmMedium);
        if (utmCampaign) sessionStorage.setItem('utm_campaign', utmCampaign);
        if (gclid) sessionStorage.setItem('gclid', gclid);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Préparer les données SCPI
  const scpiNames = scpi.length > 0 ? scpi : selectedScpi.map(s => s.name);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      // Lire les paramètres depuis sessionStorage
      const utmSource = sessionStorage.getItem('utm_source');
      const utmMedium = sessionStorage.getItem('utm_medium');
      const utmCampaign = sessionStorage.getItem('utm_campaign');
      const gclid = sessionStorage.getItem('gclid');

      const isFromGoogleAds = utmSource === 'google' || gclid !== null;

      console.log('🔍 EmailSimulationModal - Insertion prospects:', { utmSource, utmMedium, utmCampaign, gclid });

      const leadData: any = {
        nom: 'Non renseigné',
        email: formValues.email,
        profil_risque: profilRisque,
        profil_esg: profilESG,
        scpi: scpiNames,
        portfolio_selection: scpiNames.length > 0 ? scpiNames : null,
        horizon: horizon,
        objectifs: objectifs,
        tmi: tmi,
        metadata: {
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign,
          gclid,
          source: isFromGoogleAds ? 'google_ads' : 'site',
          form: 'email_simulation',
          scpi: scpiNames,
          horizon,
          objectifs,
          tmi
        },
        statut: 'nouveau'
      };

      if (isFromGoogleAds) {
        leadData.utm_source = utmSource;
        leadData.utm_medium = utmMedium;
        leadData.utm_campaign = utmCampaign;
        leadData.gclid = gclid;
      } else {
        leadData.type_contact = 'formulaire';
      }

      const { data, error } = await createProspect(leadData);

      if (error) {
        console.error("Erreur Supabase:", error);
        throw new Error(`Erreur: ${error.message}`);
      }

      console.log("✅ Simulation email enregistrée :", data);

      const emailData = {
        email: formValues.email,
        profil_risque: profilRisque,
        profil_esg: profilESG,
        scpi: scpiNames,
        portfolio_selection: scpiNames.length > 0 ? scpiNames : null,
        horizon: horizon,
        objectifs: objectifs,
        tmi: tmi,
        source: 'Simulation Email',
      };

      const emailApiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-lead-notification`;
      const emailHeaders = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      try {
        await fetch(emailApiUrl, {
          method: 'POST',
          headers: emailHeaders,
          body: JSON.stringify(emailData),
        });
      } catch (emailError) {
        console.error("Erreur envoi email (non bloquant):", emailError);
      }

      setStatus("✅ Votre simulation a été envoyée ! Vous recevrez une réponse rapidement.");
      setFormValues({ email: '' });

      // Redirect to thank you page after short delay
      setTimeout(() => {
        window.location.href = '/merci-landing-page.html';
      }, 1500);

    } catch (err) {
      console.error("❌ Erreur :", err);
      setStatus(`❌ Erreur: ${err instanceof Error ? err.message : 'Problème technique'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-600">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-600 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              📧 Recevoir ma simulation
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Recevez votre analyse personnalisée par email
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Résumé de la simulation */}
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <h3 className="font-bold text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Votre simulation
            </h3>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              {profilRisque !== "Non défini" && (
                <div className="flex items-center gap-2">
                  <Shield className="w-3 h-3 text-green-600 dark:text-green-400" />
                  <span className="text-green-700 dark:text-green-300">
                    <strong>Risque:</strong> {profilRisque}
                  </span>
                </div>
              )}
              
              {profilESG !== "Standard" && (
                <div className="flex items-center gap-2">
                  <Leaf className="w-3 h-3 text-green-600 dark:text-green-400" />
                  <span className="text-green-700 dark:text-green-300">
                    <strong>ESG:</strong> {profilESG}
                  </span>
                </div>
              )}
              
              {scpiNames.length > 0 && (
                <div className="col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />
                    <span className="text-green-700 dark:text-green-300">
                      <strong>SCPI ({scpiNames.length}):</strong>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {scpiNames.slice(0, 3).map((name, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-xs rounded">
                        {name}
                      </span>
                    ))}
                    {scpiNames.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                        +{scpiNames.length - 3} autres
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {horizon && (
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-green-600 dark:text-green-400" />
                  <span className="text-green-700 dark:text-green-300">
                    <strong>Horizon:</strong> {horizon}
                  </span>
                </div>
              )}
              
              {tmi && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-3 h-3 text-green-600 dark:text-green-400" />
                  <span className="text-green-700 dark:text-green-300">
                    <strong>TMI:</strong> {tmi}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Formulaire email */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Votre adresse email *
              </label>
              <input
                type="email"
                name="email"
                value={formValues.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                placeholder="votre@email.com"
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Vous recevrez votre analyse personnalisée dans quelques minutes
              </div>
            </div>

            {/* Status Message */}
            {status && (
              <div className={`p-4 rounded-lg border ${
                status.includes('✅') 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
              }`}>
                <p className="text-sm font-medium">{status}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formValues.email}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform duration-200"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Envoi...' : 'Envoyer ma simulation'}
              </button>
            </div>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                Ce que vous allez recevoir
              </span>
            </div>
            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Analyse détaillée de votre profil investisseur</li>
              <li>• Recommandations SCPI personnalisées</li>
              <li>• Simulation de revenus et projections</li>
              <li>• Conseils d'optimisation fiscale</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSimulationModal;