import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Mail, Phone, MessageCircle, ExternalLink, DollarSign, Clock, Target, TrendingUp, Shield, Leaf } from 'lucide-react';
import { Scpi } from '../types/scpi';
import { createProspect } from '../utils/prospectService';

interface RdvModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedScpi?: Scpi[];
  recommendedScpi?: string[];
  clientProfile?: any;
  profilRisque?: string;
  profilESG?: string;
  scpi?: string[]; // liste des SCPI recommandées
}

const RdvModal: React.FC<RdvModalProps> = ({ 
  isOpen, 
  onClose, 
  selectedScpi = [],
  recommendedScpi = [],
  clientProfile = null,
  profilRisque = "Non défini",
  profilESG = "Standard",
  scpi = []
}) => {
  // Combiner SCPI sélectionnées et recommandées
  const allScpi = [
    ...selectedScpi.map(scpi => scpi.name),
    ...recommendedScpi,
    ...scpi
  ];
  const uniqueScpi = [...new Set(allScpi)];

  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    phone: '',
    montant: '',
    commentaire: '',
    creneau: ''
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
        console.log('📍 Paramètres Google Ads détectés dans RdvModal:', { utmSource, utmMedium, utmCampaign, gclid });
        if (utmSource) sessionStorage.setItem('utm_source', utmSource);
        if (utmMedium) sessionStorage.setItem('utm_medium', utmMedium);
        if (utmCampaign) sessionStorage.setItem('utm_campaign', utmCampaign);
        if (gclid) sessionStorage.setItem('gclid', gclid);
      }
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

      console.log('🔍 RdvModal - Insertion prospects:', { utmSource, utmMedium, utmCampaign, gclid });

      const metadata = {
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        gclid,
        source: isFromGoogleAds ? 'google_ads' : 'site',
        form: 'rdv_modal',
        scpi,
        portfolio_selection: uniqueScpi.length > 0 ? uniqueScpi : null
      };

      const leadData: any = {
        nom: formValues.name,
        email: formValues.email,
        telephone: formValues.phone,
        montant: formValues.montant,
        commentaire: formValues.commentaire,
        creneau: formValues.creneau,
        profil_risque: profilRisque,
        profil_esg: profilESG,
        scpi: scpi,
        portfolio_selection: uniqueScpi.length > 0 ? uniqueScpi : null,
        metadata,
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

      console.log("✅ Enregistrement créé :", data);

      const emailData = {
        nom: formValues.name,
        email: formValues.email,
        telephone: formValues.phone,
        montant: formValues.montant,
        commentaire: formValues.commentaire,
        creneau: formValues.creneau,
        profil_risque: profilRisque,
        profil_esg: profilESG,
        scpi: scpi,
        portfolio_selection: uniqueScpi.length > 0 ? uniqueScpi : null,
        source: 'Souscription',
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

      setStatus("✅ Votre demande a bien été envoyée ! Vous recevrez une réponse rapidement.");
      setFormValues({
        name: '',
        email: '',
        phone: '',
        montant: '',
        commentaire: '',
        creneau: ''
      });

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

  const openCalendly = () => {
    const calendlyUrl = 'https://calendly.com/eric-bellaiche/gp-rendez-vous-avec-eric-bellaiche-clone';
    window.open(calendlyUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-[10001] p-4 pt-8 overflow-y-auto" onClick={handleBackdropClick} style={{ zIndex: 10001 }}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-3xl max-h-[90vh] shadow-2xl border border-gray-200 dark:border-gray-600 flex flex-col my-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-600 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-1">
              📅 Prendre rendez-vous
            </h2>
            <p className="text-base font-medium text-gray-700 dark:text-gray-200">
              Échangez avec Eric Bellaiche, expert SCPI certifié
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {/* Calendly Option */}
          <div className="mb-6 p-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-lg mb-1">
                  🚀 Réservation directe
                </h3>
                <p className="text-base font-medium text-green-100">
                  Choisissez votre créneau en temps réel
                </p>
              </div>
            </div>
            <button
              onClick={openCalendly}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-green-600 rounded-xl font-black text-base hover:bg-green-50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 transform"
            >
              <ExternalLink className="w-5 h-5" />
              Réserver sur Calendly
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600"></div>
            <span className="text-gray-500 dark:text-gray-400 font-medium">ou</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600"></div>
          </div>

          {/* SCPI sélectionnées - Affichage */}
          {uniqueScpi.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <h4 className="font-black text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2 text-base">
                <TrendingUp className="w-4 h-4" />
                SCPI sélectionnées ({uniqueScpi.length})
              </h4>
              <div className="flex flex-wrap gap-1">
                {uniqueScpi.map((scpiName, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-sm font-bold rounded-full">
                    {scpiName}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Profils - Affichage */}
          {(profilRisque !== "Non défini" || profilESG !== "Standard") && (
            <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
              <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2 flex items-center gap-2 text-sm">
                <Target className="w-4 h-4" />
                Votre profil
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs text-purple-700 dark:text-purple-300">
                    <strong>Risque:</strong> {profilRisque}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs text-purple-700 dark:text-purple-300">
                    <strong>ESG:</strong> {profilESG}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Contact Form */}
          <div>
            <h3 className="font-black text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2 text-lg">
              <MessageCircle className="w-5 h-5" />
              Demande de contact personnalisée
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nom complet */}
              <div>
                <label className="block text-sm font-bold text-gray-800 dark:text-gray-100 mb-1">
                  <User className="w-4 h-4 inline mr-1" />
                  Nom complet *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formValues.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium text-base focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent"
                  placeholder="Votre nom et prénom"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-gray-800 dark:text-gray-100 mb-1">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formValues.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium text-base focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent"
                  placeholder="votre@email.com"
                />
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-sm font-bold text-gray-800 dark:text-gray-100 mb-1">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Téléphone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formValues.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium text-base focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent"
                  placeholder="Votre numéro de téléphone"
                />
              </div>

              {/* Montant à investir */}
              <div>
                <label className="block text-sm font-bold text-gray-800 dark:text-gray-100 mb-1">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Montant à investir *
                </label>
                <input
                  type="text"
                  name="montant"
                  value={formValues.montant}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium text-base focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent"
                  placeholder="Ex: 50 000€"
                />
              </div>

              {/* Créneau préféré */}
              <div>
                <label className="block text-sm font-bold text-gray-800 dark:text-gray-100 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Créneau préféré *
                </label>
                <select
                  name="creneau"
                  value={formValues.creneau}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium text-base focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent"
                >
                  <option value="">Sélectionner...</option>
                  <option value="Matin (9h-12h)">Matin (9h-12h)</option>
                  <option value="Après-midi (14h-17h)">Après-midi (14h-17h)</option>
                  <option value="Soir (18h-20h)">Soir (18h-20h)</option>
                  <option value="Weekend">Weekend</option>
                </select>
              </div>

              {/* Commentaire */}
              <div>
                <label className="block text-sm font-bold text-gray-800 dark:text-gray-100 mb-1">
                  <MessageCircle className="w-4 h-4 inline mr-1" />
                  Commentaire *
                </label>
                <textarea
                  name="commentaire"
                  value={formValues.commentaire}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium text-base focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent resize-none"
                  placeholder="Décrivez votre projet d'investissement..."
                />
              </div>

              {/* Status Message */}
              {status && (
                <div className={`p-4 rounded-lg border ${
                  status.includes('✅') 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                }`}>
                  <p className="text-sm font-bold">{status}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg font-black text-base hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-green-600 dark:bg-green-500 text-white rounded-lg font-black text-base hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform duration-200"
                >
                  {isSubmitting ? 'Envoi en cours...' : 'Envoyer la demande'}
                </button>
              </div>
            </form>
          </div>

          {/* Expert Info */}
          <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 rounded-xl border border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-black text-gray-900 dark:text-white text-lg">
                  Eric Bellaiche
                </h4>
                <p className="text-base font-medium text-gray-700 dark:text-gray-200">
                  Conseiller en Gestion de Patrimoine Certifié
                </p>
                <div className="flex gap-1 mt-1">
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-sm font-bold rounded">
                    CIF n°D016571
                  </span>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-sm font-bold rounded">
                    CNCEF
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-medium text-gray-700 dark:text-gray-200">
              <div>
                <strong>Spécialités :</strong>
                <ul className="mt-1 space-y-0.5">
                  <li>• Investissement SCPI</li>
                  <li>• Optimisation fiscale</li>
                </ul>
              </div>
              <div>
                <strong>Engagement :</strong>
                <ul className="mt-1 space-y-0.5">
                  <li>• Conseil personnalisé</li>
                  <li>• Transparence totale</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RdvModal;