import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Shield, CheckCircle, Phone, Mail, User, Euro,
  ArrowRight, Award, Star, Building2, Globe, BarChart3, Leaf,
  Target, Calculator, MessageCircle, Clock, FileText, Lock, Eye, BadgeCheck,
  ChevronRight, ChevronLeft, Zap
} from 'lucide-react';
import Logo from './Logo';
import MaximusLogoFooter from './MaximusLogoFooter';
import EricAvatar from './EricAvatar';
import Header from './Header';
import LeadMagnetEmailForm from './LeadMagnetEmailForm';
import PieChart from './PieChart';
import ThematicSimulator from './ThematicSimulator';
import { submitLead } from '../utils/leadSubmitter';

interface IrokoZenLandingPageProps {
  onNavigateHome?: () => void;
  onNavigateToFaq?: () => void;
  onNavigateToAbout?: () => void;
  onNavigateToUnderstanding?: () => void;
  onNavigateToScpi?: (slug: string) => void;
  onContactClick?: () => void;
}

const IrokoZenLandingPage: React.FC<IrokoZenLandingPageProps> = ({
  onNavigateHome,
  onNavigateToFaq,
  onNavigateToAbout,
  onNavigateToUnderstanding,
  onNavigateToScpi,
  onContactClick
}) => {
  // Hero optimisé pour la conversion
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    montant: '',
    objectif: '',
    commentaire: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Capturer et stocker les paramètres UTM/gclid dès l'arrivée sur la page
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    const utmMedium = urlParams.get('utm_medium');
    const utmCampaign = urlParams.get('utm_campaign');
    const gclid = urlParams.get('gclid');

    // Stocker en sessionStorage si présents
    if (utmSource || utmMedium || utmCampaign || gclid) {
      console.log('📍 Paramètres Google Ads détectés et stockés:', { utmSource, utmMedium, utmCampaign, gclid });
      if (utmSource) sessionStorage.setItem('utm_source', utmSource);
      if (utmMedium) sessionStorage.setItem('utm_medium', utmMedium);
      if (utmCampaign) sessionStorage.setItem('utm_campaign', utmCampaign);
      if (gclid) sessionStorage.setItem('gclid', gclid);
    }
  }, []);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const result = await submitLead({
        channel: 'scpi_page',
        form_type: 'lead_contact',
        context_slug: 'iroko-zen',
        identity: {
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          telephone: formData.telephone,
        },
        message: `Montant: ${formData.montant}. Objectif: ${formData.objectif}. ${formData.commentaire || ''}`,
      });

      if (!result.ok) {
        throw new Error(result.error || 'Submission failed');
      }

      setSubmitStatus('success');

      if (window.gtag) {
        window.gtag('event', 'conversion', {
          'send_to': 'AW-CONVERSION_ID/IROKO_ZEN',
          'value': parseFloat(formData.montant.replace(/[^0-9.-]+/g,'')) || 1.0,
          'currency': 'EUR',
          'transaction_id': ''
        });

        window.gtag('event', 'generate_lead', {
          'event_category': 'SCPI Iroko Zen',
          'event_label': 'Formulaire Landing Page',
          'value': parseFloat(formData.montant.replace(/[^0-9.-]+/g,'')) || 0
        });
      }

      setTimeout(() => {
        window.location.href = '/merci-landing-page.html';
      }, 1500);

      setFormData({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        montant: '',
        objectif: '',
        commentaire: ''
      });

    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleBackToHome = () => {
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      window.location.href = '/';
    }
  };

  const handleContactClick = () => {
    if (onContactClick) {
      onContactClick();
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  const canGoToNextStep = () => {
    if (formStep === 1) {
      return formData.prenom && formData.nom && formData.email;
    }
    if (formStep === 2) {
      return formData.telephone && formData.montant;
    }
    return true;
  };

  const nextStep = () => {
    if (canGoToNextStep() && formStep < 3) {
      setFormStep(formStep + 1);
    }
  };

  const prevStep = () => {
    if (formStep > 1) {
      setFormStep(formStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <Header
        isDarkMode={isDarkMode}
        toggleTheme={() => setIsDarkMode(!isDarkMode)}
        onContactClick={handleContactClick}
        onAboutClick={() => {}}
        onLogoClick={handleBackToHome}
        onScpiPageClick={onNavigateToScpi || ((slug) => window.location.href = `/${slug}`)}
        onUnderstandingClick={onNavigateToUnderstanding || (() => window.location.href = '/comprendre-les-scpi')}
        onAboutSectionClick={onNavigateToAbout || (() => window.location.href = '/qui-sommes-nous')}
        onFaqClick={onNavigateToFaq || (() => window.location.href = '/faq')}
      />

      <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-8 text-center lg:text-left">
              {/* H1 - Accroche Psychologique */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-gray-900">
                Analyse : Faut-il Investir dans la SCPI Iroko Zen ?
              </h1>

              {/* Sous-titre - Promesse */}
              <p className="text-xl sm:text-2xl text-gray-700 font-semibold leading-relaxed">
                Le guide objectif de la SCPI sans frais au rendement de +7% pour 2025.
              </p>

              {/* Dashboard Visuel - Data Simplifiée */}
              <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto lg:mx-0">
                <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-emerald-200 text-center hover:shadow-xl transition-shadow">
                  <div className="flex justify-center mb-3">
                    <TrendingUp className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div className="text-4xl font-black text-emerald-600 mb-1">6,01%</div>
                  <div className="text-sm text-gray-600 font-semibold">Taux de distribution 2024</div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-200 text-center hover:shadow-xl transition-shadow">
                  <div className="flex justify-center mb-3">
                    <Building2 className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-4xl font-black text-blue-600 mb-1">1,1 Md€</div>
                  <div className="text-sm text-gray-600 font-semibold">Capitalisation</div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-200 text-center hover:shadow-xl transition-shadow">
                  <div className="flex justify-center mb-3">
                    <Leaf className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="text-4xl font-black text-green-600 mb-1">ISR</div>
                  <div className="text-sm text-gray-600 font-semibold">Label</div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-orange-200 text-center hover:shadow-xl transition-shadow">
                  <div className="flex justify-center mb-3">
                    <Euro className="w-8 h-8 text-orange-600" />
                  </div>
                  <div className="text-4xl font-black text-orange-600 mb-1">0%</div>
                  <div className="text-sm text-gray-600 font-semibold">Frais d'entrée</div>
                </div>
              </div>

              {/* CTA Principal - Objectif de la Page */}
              <div className="space-y-4 max-w-xl mx-auto lg:mx-0">
                <button
                  onClick={() => {
                    const form = document.querySelector('form');
                    if (form) {
                      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black text-xl px-8 py-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center justify-center gap-3"
                >
                  <Phone className="w-7 h-7" />
                  Parler à un Conseiller
                </button>

                {/* Ligne de Réassurance */}
                <p className="text-center text-sm text-gray-600 font-medium">
                  Appel de 15 min, gratuit et sans engagement
                </p>
              </div>

              {/* Preuve Sociale - Confiance */}
              <div className="pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 font-semibold mb-4 text-center lg:text-left">Vu dans :</p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 opacity-60">
                  <div className="text-lg font-bold text-gray-700">Les Échos</div>
                  <div className="text-lg font-bold text-gray-700">Le Figaro</div>
                  <div className="text-lg font-bold text-gray-700">Challenges</div>
                  <div className="text-lg font-bold text-gray-700">Capital</div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* Lead Magnet - Priority Section */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl shadow-2xl p-8">
                <LeadMagnetEmailForm />
              </div>

              {/* Formulaire de Contact Complet - Secondary Section */}
              <div className="bg-white rounded-3xl shadow-2xl p-8">
                <div className="text-center mb-6">
                  <div className="mb-4 flex justify-center">
                    <div className="border-4 border-emerald-600 rounded-full shadow-xl">
                      <EricAvatar size={70} />
                    </div>
                  </div>
                  <p className="text-sm font-bold text-emerald-700 mb-2">
                    Eric Bellaiche - Expert MaximusSCPI
                  </p>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Ou parlez à un expert
                  </h2>
                  <p className="text-gray-600">
                    Gratuit et sans engagement - Réponse sous 24h
                  </p>
                </div>

              <div className="mb-6">
                <div className="flex justify-between items-center">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          step === formStep
                            ? 'bg-emerald-600 text-white'
                            : step < formStep
                            ? 'bg-emerald-200 text-emerald-700'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {step < formStep ? <CheckCircle className="w-6 h-6" /> : step}
                      </div>
                      {step < 3 && (
                        <div
                          className={`flex-1 h-1 mx-2 ${
                            step < formStep ? 'bg-emerald-600' : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-600">
                  <span className={formStep === 1 ? 'font-bold text-emerald-700' : ''}>Coordonnées</span>
                  <span className={formStep === 2 ? 'font-bold text-emerald-700' : ''}>Projet</span>
                  <span className={formStep === 3 ? 'font-bold text-emerald-700' : ''}>Objectifs</span>
                </div>
              </div>

              {submitStatus === 'success' ? (
                <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-6 text-center">
                  <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Demande envoyée avec succès !
                  </h3>
                  <p className="text-gray-700">
                    Eric vous contacte sous 24h pour échanger sur votre projet Iroko Zen.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {formStep === 1 && (
                    <div className="space-y-4 animate-fadeIn">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Étape 1 : Vos coordonnées</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Prénom *
                          </label>
                          <input
                            type="text"
                            name="prenom"
                            required
                            value={formData.prenom}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
                            placeholder="Jean"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nom *
                          </label>
                          <input
                            type="text"
                            name="nom"
                            required
                            value={formData.nom}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
                            placeholder="Dupont"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
                          placeholder="jean.dupont@email.com"
                        />
                      </div>
                    </div>
                  )}

                  {formStep === 2 && (
                    <div className="space-y-4 animate-fadeIn">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Étape 2 : Votre projet</h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Téléphone *
                        </label>
                        <input
                          type="tel"
                          name="telephone"
                          required
                          value={formData.telephone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
                          placeholder="06 12 34 56 78"
                        />
                      </div>

                      <div>
                        <label htmlFor="montant-investir" className="block text-sm font-medium text-gray-700 mb-2">
                          Montant à investir *
                        </label>
                        <select
                          id="montant-investir"
                          name="montant"
                          required
                          value={formData.montant}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white text-gray-900"
                        >
                          <option value="">Sélectionnez un montant</option>
                          <option value="1000-5000">1 000€ - 5 000€</option>
                          <option value="5000-10000">5 000€ - 10 000€</option>
                          <option value="10000-25000">10 000€ - 25 000€</option>
                          <option value="25000-50000">25 000€ - 50 000€</option>
                          <option value="50000-100000">50 000€ - 100 000€</option>
                          <option value="100000+">Plus de 100 000€</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {formStep === 3 && (
                    <div className="space-y-4 animate-fadeIn">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Étape 3 : Vos objectifs</h3>
                      <div>
                        <label htmlFor="objectif" className="block text-sm font-medium text-gray-700 mb-2">
                          Votre objectif principal *
                        </label>
                        <select
                          id="objectif"
                          name="objectif"
                          required
                          value={formData.objectif}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white text-gray-900"
                        >
                          <option value="">Sélectionnez votre objectif</option>
                          <option value="revenus-reguliers">Générer des revenus réguliers</option>
                          <option value="diversification">Diversifier mon patrimoine</option>
                          <option value="optimisation-fiscale">Optimiser ma fiscalité</option>
                          <option value="preparation-retraite">Préparer ma retraite</option>
                          <option value="investissement-durable">Investir de manière responsable (ISR)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Message (optionnel)
                        </label>
                        <textarea
                          name="commentaire"
                          value={formData.commentaire}
                          onChange={handleChange}
                          rows={3}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none text-gray-900"
                          placeholder="Questions ou précisions..."
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    {formStep > 1 && (
                      <button
                        type="button"
                        onClick={prevStep}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <ChevronLeft className="w-5 h-5" />
                        Précédent
                      </button>
                    )}
                    {formStep < 3 ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        disabled={!canGoToNextStep()}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                      >
                        Suivant
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                      >
                        {isSubmitting ? (
                          <>Envoi en cours...</>
                        ) : (
                          <>
                            Envoyer ma demande
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {submitStatus === 'error' && (
                    <p className="text-red-600 text-sm text-center">
                      Une erreur est survenue. Veuillez réessayer.
                    </p>
                  )}

                  <div className="text-center space-y-3">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">ou</span>
                      </div>
                    </div>

                    <a
                      href="https://calendly.com/eric-bellaiche/gp-rendez-vous-avec-eric-bellaiche-clone"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-bold py-4 rounded-lg transition-all duration-300 transform hover:scale-105"
                    >
                      Réserver un créneau directement
                    </a>
                  </div>

                  <p className="text-xs text-gray-500 text-center">
                    🔒 Vos données sont protégées et ne seront jamais partagées
                  </p>
                </form>
              )}

                <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-gray-700 leading-relaxed">
                      <p className="font-semibold text-gray-900 mb-2">⚠️ Avertissement important</p>
                      <p>
                        Les performances passées ne préjugent pas des performances futures.
                        L'investissement en SCPI présente un risque de perte en capital et une
                        liquidité limitée. Durée de placement recommandée : 8 à 10 ans minimum.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Pourquoi Iroko Zen est-elle la SCPI idéale pour vous ?
            </h2>
            <p className="text-xl text-gray-600">
              Une SCPI européenne performante qui combine rendement élevé et absence de frais d'entrée
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-8 border-2 border-emerald-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Répartition géographique</h3>
              </div>
              <div className="flex justify-center">
                <PieChart
                  data={[
                    { name: 'France', value: 44, color: '#10b981' },
                    { name: 'Royaume-Uni', value: 16, color: '#14b8a6' },
                    { name: 'Irlande', value: 12, color: '#06b6d4' },
                    { name: 'Espagne', value: 10, color: '#0ea5e9' },
                    { name: 'Pays-Bas', value: 10, color: '#3b82f6' },
                    { name: 'Allemagne', value: 8, color: '#6366f1' }
                  ]}
                  width={300}
                  height={300}
                />
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-8 border-2 border-teal-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Répartition sectorielle</h3>
              </div>
              <div className="flex justify-center">
                <PieChart
                  data={[
                    { name: 'Commerces', value: 34, color: '#14b8a6' },
                    { name: 'Bureaux', value: 30, color: '#06b6d4' },
                    { name: 'Locaux d\'activités', value: 21, color: '#0ea5e9' },
                    { name: 'Entrepôts', value: 11, color: '#3b82f6' },
                    { name: 'Hôtels', value: 3, color: '#6366f1' },
                    { name: 'Enseignement', value: 1, color: '#8b5cf6' }
                  ]}
                  width={300}
                  height={300}
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200 text-center hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                <Zap className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">0% de frais</h3>
              <p className="text-gray-600">
                Sans frais de souscription, 100% de votre capital est investi dès le premier jour
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200 text-center hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4">
                <TrendingUp className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Revenus mensuels</h3>
              <p className="text-gray-600">
                Des versements tous les mois pour un flux de trésorerie régulier et prévisible
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200 text-center hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-100 rounded-full mb-4">
                <Globe className="w-8 h-8 text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Europe diversifiée</h3>
              <p className="text-gray-600">
                Investissement réparti sur 6 pays européens et 6 secteurs d'activité
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200 text-center hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Leaf className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Label ISR</h3>
              <p className="text-gray-600">
                Investissement responsable certifié, respectueux de l'environnement
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-emerald-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ils ont investi avec MaximusSCPI
            </h2>
            <p className="text-xl text-gray-600">
              Plus de 200 investisseurs nous font confiance pour leurs investissements SCPI
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                initial: 'MC',
                nom: 'Marie C.',
                investissement: '50 000€',
                date: 'Janvier 2024',
                color: 'emerald',
                temoignage: "J'ai choisi Iroko Zen pour sa politique sans frais d'entrée et ses revenus mensuels. Eric m'a parfaitement accompagnée et les premiers versements sont au rendez-vous. Je recommande !"
              },
              {
                initial: 'JL',
                nom: 'Jean-Luc D.',
                investissement: '75 000€',
                date: 'Mars 2024',
                color: 'teal',
                temoignage: "Excellent conseil d'Eric sur Iroko Zen. La diversification européenne me convient parfaitement et le fait de ne pas payer de frais d'entrée fait une vraie différence. Très satisfait."
              },
              {
                initial: 'SB',
                nom: 'Sophie B.',
                investissement: '30 000€',
                date: 'Février 2024',
                color: 'cyan',
                temoignage: "Première expérience en SCPI avec Iroko Zen. Eric a été très pédagogue pour m'expliquer le fonctionnement. Les revenus mensuels sont un vrai plus pour ma trésorerie."
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 bg-${testimonial.color}-600 rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                    {testimonial.initial}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.nom}</div>
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 italic mb-3">
                  "{testimonial.temoignage}"
                </p>
                <p className="text-sm text-gray-500">
                  Investissement : {testimonial.investissement} | {testimonial.date}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-8 bg-white rounded-xl px-8 py-4 shadow-lg">
              <div>
                <div className="text-3xl font-bold text-emerald-600">1800+</div>
                <div className="text-sm text-gray-600">Clients satisfaits</div>
              </div>
              <div className="h-12 w-px bg-gray-300"></div>
              <div>
                <div className="text-3xl font-bold text-emerald-600">4,9/5</div>
                <div className="text-sm text-gray-600">Note moyenne</div>
              </div>
              <div className="h-12 w-px bg-gray-300"></div>
              <div>
                <div className="text-3xl font-bold text-emerald-600">15 ans</div>
                <div className="text-sm text-gray-600">D'expérience</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simulateur de rendement */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ThematicSimulator
            defaultInvestment={50000}
            defaultYield={6.01}
            title="Simulez votre investissement dans Iroko Zen"
            subtitle="Estimez vos revenus mensuels avec un rendement de 6,01%"
          />
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Prêt à investir dans Iroko Zen ?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Profitez d'un rendement de 6,01% sans frais d'entrée avec des revenus mensuels
          </p>
          <button
            onClick={() => {
              const form = document.querySelector('form');
              if (form) {
                form.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-8 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-2 shadow-xl"
          >
            Obtenir mon analyse personnalisée
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="mt-8 flex items-center justify-center gap-8 text-emerald-100">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>Réponse sous 24h</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span>100% Gratuit</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Sans engagement</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-yellow-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold mb-4">Informations importantes</h3>
              <div className="space-y-3 text-gray-300 text-sm">
                <p>
                  <strong>Risques :</strong> L'investissement en SCPI présente des risques de perte en capital et de liquidité. Les performances passées ne préjugent pas des performances futures. Le rendement n'est pas garanti et peut varier.
                </p>
                <p>
                  <strong>Durée recommandée :</strong> 8 à 10 ans minimum. Les SCPI sont des placements de long terme.
                </p>
                <p>
                  <strong>Frais :</strong> Frais de souscription : 0% HT. Frais de gestion annuels : 12,5% HT sur les loyers. Consultez la note d'information complète avant tout investissement.
                </p>
                <p>
                  <strong>Conseiller :</strong> Eric Bellaiche - CIF enregistré à l'ORIAS sous le numéro 13001580. Membre de la CNCEF Patrimoine sous le numéro D016571.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-8">
            <MaximusLogoFooter className="h-16 w-auto" />
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-8">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-emerald-400 mb-3">
                MaximusSCPI<span className="text-xs align-super">™</span>
              </h3>
              <p className="text-sm text-gray-300 mb-2">
                Votre expert en investissement SCPI
              </p>
              <p className="text-xs text-gray-400">
                Marque déposée INPI
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-emerald-400 mb-3">
                Conseiller en Investissements Financiers
              </h3>
              <p className="text-sm text-gray-300 mb-2">
                <strong>Eric Bellaiche</strong>
              </p>
              <div className="text-xs text-gray-400 space-y-1">
                <p>ORIAS N° <strong>13001580</strong></p>
                <p>CNCEF Patrimoine N° <strong>D016571</strong></p>
              </div>
            </div>
          </div>

          <div className="text-center space-y-4">
            <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-400">
              <a href="/mentions-legales" className="hover:text-emerald-400 transition-colors">
                Mentions légales
              </a>
              <a href="/politique-confidentialite" className="hover:text-emerald-400 transition-colors">
                Politique de confidentialité
              </a>
              <a href="/conditions-utilisation" className="hover:text-emerald-400 transition-colors">
                Conditions d'utilisation
              </a>
            </div>
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} MaximusSCPI. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default IrokoZenLandingPage;
