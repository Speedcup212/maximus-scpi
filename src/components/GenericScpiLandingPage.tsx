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
import ThematicSimulator from './ThematicSimulator';
import Header from './Header';
import { ScpiLandingData } from '../data/landingPagesData';

interface GenericScpiLandingPageProps {
  scpiData: ScpiLandingData;
  onNavigateHome?: () => void;
  onNavigateToFaq?: () => void;
  onNavigateToAbout?: () => void;
  onNavigateToUnderstanding?: () => void;
  onNavigateToScpi?: (slug: string) => void;
  onContactClick?: () => void;
}

const GenericScpiLandingPage: React.FC<GenericScpiLandingPageProps> = ({
  scpiData,
  onNavigateHome,
  onNavigateToFaq,
  onNavigateToAbout,
  onNavigateToUnderstanding,
  onNavigateToScpi,
  onContactClick
}) => {
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
      // Vérification des variables d'environnement avant tout
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        console.error('❌ Configuration manquante:', {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseAnonKey
        });
        throw new Error('CONFIGURATION_MANQUANTE');
      }

      // Import du client Supabase
      let supabase;
      try {
        const supabaseModule = await import('../supabaseClient');
        supabase = supabaseModule.supabase;
        console.log('✅ Client Supabase chargé avec succès');
      } catch (importError) {
        console.error('❌ Erreur lors de l\'import de Supabase:', importError);
        throw new Error('IMPORT_SUPABASE_FAILED');
      }

      // Lire les paramètres depuis sessionStorage (priorité) ou URL (fallback)
      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = sessionStorage.getItem('utm_source') || urlParams.get('utm_source') || null;
      const utmMedium = sessionStorage.getItem('utm_medium') || urlParams.get('utm_medium') || null;
      const utmCampaign = sessionStorage.getItem('utm_campaign') || urlParams.get('utm_campaign') || null;
      const gclid = sessionStorage.getItem('gclid') || urlParams.get('gclid') || null;

      console.log('🔍 Paramètres de tracking au moment de la soumission:', { utmSource, utmMedium, utmCampaign, gclid });

      const isFromGoogleAds = utmSource === 'google' || gclid !== null;
      const tableName = isFromGoogleAds ? 'leads_ads_formulaire' : 'contacts_site';

      const leadData: any = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        montant: formData.montant,
        commentaire: `Objectif: ${formData.objectif}. ${formData.commentaire || ''}`,
        scpi: [scpiData.nom],
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

      console.log('📤 Tentative d\'insertion dans', tableName, ':', leadData);

      // Tentative d'insertion dans Supabase avec .select() pour confirmer
      const { data, error } = await supabase
        .from(tableName)
        .insert([leadData])
        .select();

      if (error) {
        console.error('❌ Erreur Supabase lors de l\'insertion:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw new Error(`SUPABASE_ERROR: ${error.message}`);
      }

      // Vérification explicite du succès de l'insertion
      if (!data || data.length === 0) {
        console.error('❌ Aucune donnée retournée après insertion');
        throw new Error('INSERTION_FAILED');
      }

      console.log('✅ Lead enregistré avec succès:', data);
      setSubmitStatus('success');

      // Tracking Google Ads UNIQUEMENT après succès confirmé
      if (window.gtag) {
        console.log('📊 Envoi des événements de conversion Google Ads');
        window.gtag('event', 'conversion', {
          'send_to': `AW-CONVERSION_ID/${scpiData.slug.toUpperCase().replace(/-/g, '_')}`,
          'value': parseFloat(formData.montant.replace(/[^0-9.-]+/g,'')) || 1.0,
          'currency': 'EUR',
          'transaction_id': ''
        });

        window.gtag('event', 'generate_lead', {
          'event_category': `SCPI ${scpiData.nom}`,
          'event_label': 'Formulaire Landing Page',
          'value': parseFloat(formData.montant.replace(/[^0-9.-]+/g,'')) || 0
        });
      }

      // Redirection UNIQUEMENT après succès confirmé
      setTimeout(() => {
        console.log('✅ Redirection vers la page de remerciement');
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

    } catch (error: any) {
      console.error('❌ ERREUR CRITIQUE lors de la soumission:', error);

      // Messages d'erreur spécifiques selon le type d'erreur
      if (error.message === 'CONFIGURATION_MANQUANTE') {
        console.error('🔧 Action requise: Vérifier les variables VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY');
      } else if (error.message === 'IMPORT_SUPABASE_FAILED') {
        console.error('🔧 Action requise: Vérifier que supabaseClient.ts est accessible');
      } else if (error.message?.includes('SUPABASE_ERROR')) {
        console.error('🔧 Action requise: Vérifier la connexion à Supabase et les permissions de la table');
      } else if (error.message === 'INSERTION_FAILED') {
        console.error('🔧 Action requise: Vérifier la structure de la table et les règles RLS');
      }

      // Log pour diagnostic complet
      console.error('📋 Informations de diagnostic:', {
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        scpiSlug: scpiData.slug,
        formData: {
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          hasPhone: !!formData.telephone
        },
        error: error.message || error
      });

      setSubmitStatus('error');
      // PAS de redirection en cas d'erreur (respect de la règle stratégique)
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

  const themeColor = scpiData.frais_souscription === '0%' ? 'emerald' : 'blue';
  const bgGradient = themeColor === 'emerald'
    ? 'from-emerald-50 via-white to-teal-50'
    : 'from-blue-50 via-white to-cyan-50';
  const headerGradient = themeColor === 'emerald'
    ? 'from-emerald-600 via-teal-700 to-emerald-800'
    : 'from-blue-600 via-cyan-700 to-blue-800';

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient}`}>
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

      <div className={`bg-gradient-to-br ${headerGradient} text-white`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-8">
              {scpiData.frais_souscription === '0%' && (
                <div className="inline-flex items-center gap-2 bg-yellow-400 text-gray-900 px-5 py-2.5 rounded-full text-sm font-bold shadow-lg">
                  <Zap className="w-5 h-5" />
                  0% de frais d'entrée - Votre capital investi à 100%
                </div>
              )}

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
                SCPI {scpiData.nom}
                <span className="block text-3xl sm:text-4xl lg:text-5xl text-blue-100 mt-3">
                  {scpiData.rendement} de rendement
                </span>
                {scpiData.tof === '100%' && (
                  <span className="block text-2xl sm:text-3xl lg:text-4xl text-yellow-400 mt-3">
                    Taux d'occupation optimal
                  </span>
                )}
              </h1>

              <p className="text-xl sm:text-2xl text-blue-50 leading-relaxed">
                {scpiData.description_courte}
              </p>

              <div className="grid grid-cols-3 gap-4">
                <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-center`}>
                  <div className="text-3xl sm:text-4xl font-bold text-yellow-400">{scpiData.rendement}</div>
                  <div className={`text-sm text-${themeColor}-100 mt-1`}>Taux de distribution</div>
                </div>
                <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-center`}>
                  <div className="text-3xl sm:text-4xl font-bold text-yellow-400">{scpiData.frais_souscription}</div>
                  <div className={`text-sm text-${themeColor}-100 mt-1`}>Frais d'entrée</div>
                </div>
                <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-center`}>
                  <div className="text-3xl sm:text-4xl font-bold text-yellow-400">{scpiData.tof}</div>
                  <div className={`text-sm text-${themeColor}-100 mt-1`}>Taux d'occupation</div>
                </div>
              </div>

              <div className="space-y-4">
                {scpiData.pourquoi_investir.map((raison, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                    <span className={`text-${themeColor}-50 text-lg`}>{raison}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl p-8 lg:sticky lg:top-4">
              <div className="text-center mb-6">
                <div className="mb-4 flex justify-center">
                  <div className={`border-4 border-${themeColor}-600 rounded-full shadow-xl`}>
                    <EricAvatar size={70} />
                  </div>
                </div>
                <p className={`text-sm font-bold text-${themeColor}-700 mb-2`}>
                  Eric Bellaiche - Expert MaximusSCPI
                </p>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Obtenez votre analyse personnalisée
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
                            ? `bg-${themeColor}-600 text-white`
                            : step < formStep
                            ? `bg-${themeColor}-200 text-${themeColor}-700`
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {step < formStep ? <CheckCircle className="w-6 h-6" /> : step}
                      </div>
                      {step < 3 && (
                        <div
                          className={`flex-1 h-1 mx-2 ${
                            step < formStep ? `bg-${themeColor}-600` : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-600">
                  <span className={formStep === 1 ? `font-bold text-${themeColor}-700` : ''}>Coordonnées</span>
                  <span className={formStep === 2 ? `font-bold text-${themeColor}-700` : ''}>Projet</span>
                  <span className={formStep === 3 ? `font-bold text-${themeColor}-700` : ''}>Objectifs</span>
                </div>
              </div>

              {submitStatus === 'success' ? (
                <div className={`bg-${themeColor}-50 border-2 border-${themeColor}-500 rounded-xl p-6 text-center`}>
                  <CheckCircle className={`w-16 h-16 text-${themeColor}-500 mx-auto mb-4`} />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Demande envoyée avec succès !
                  </h3>
                  <p className="text-gray-700">
                    Eric vous contacte sous 24h pour échanger sur votre projet {scpiData.nom}.
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
                            className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-${themeColor}-500 focus:border-transparent text-gray-900`}
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
                            className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-${themeColor}-500 focus:border-transparent text-gray-900`}
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
                          className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-${themeColor}-500 focus:border-transparent text-gray-900`}
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
                          className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-${themeColor}-500 focus:border-transparent text-gray-900`}
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
                          className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-${themeColor}-500 focus:border-transparent appearance-none bg-white text-gray-900`}
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
                          className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-${themeColor}-500 focus:border-transparent appearance-none bg-white text-gray-900`}
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
                          className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-${themeColor}-500 focus:border-transparent resize-none text-gray-900`}
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
                        className={`flex-1 bg-${themeColor}-600 hover:bg-${themeColor}-700 text-white font-bold py-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg`}
                      >
                        Suivant
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`flex-1 bg-${themeColor}-600 hover:bg-${themeColor}-700 text-white font-bold py-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg`}
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
                      className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-${themeColor}-600 text-${themeColor}-700 font-semibold rounded-lg hover:bg-${themeColor}-50 transition-all`}
                    >
                      <Calendar className="w-5 h-5" />
                      Prendre rendez-vous directement
                    </a>

                    <p className="text-xs text-gray-500 mt-4">
                      <Lock className="w-3 h-3 inline mr-1" />
                      Vos données sont sécurisées et ne seront jamais partagées
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">
            Pourquoi choisir {scpiData.nom} ?
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg">
              <div className={`inline-flex items-center justify-center w-16 h-16 bg-${themeColor}-100 rounded-full mb-4`}>
                <TrendingUp className={`w-8 h-8 text-${themeColor}-600`} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{scpiData.rendement}</h3>
              <p className="text-gray-600">Taux de distribution annuel</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg">
              <div className={`inline-flex items-center justify-center w-16 h-16 bg-${themeColor}-100 rounded-full mb-4`}>
                <Building2 className={`w-8 h-8 text-${themeColor}-600`} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{scpiData.tof}</h3>
              <p className="text-gray-600">Taux d'occupation financier</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg">
              <div className={`inline-flex items-center justify-center w-16 h-16 bg-${themeColor}-100 rounded-full mb-4`}>
                <Shield className={`w-8 h-8 text-${themeColor}-600`} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{scpiData.frais_souscription}</h3>
              <p className="text-gray-600">Frais de souscription</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg">
              <div className={`inline-flex items-center justify-center w-16 h-16 bg-${themeColor}-100 rounded-full mb-4`}>
                {scpiData.label_isr ? <Leaf className={`w-8 h-8 text-${themeColor}-600`} /> : <Award className={`w-8 h-8 text-${themeColor}-600`} />}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{scpiData.label_isr ? 'Label ISR' : scpiData.societe_gestion}</h3>
              <p className="text-gray-600">{scpiData.label_isr ? 'Investissement responsable' : 'Société de gestion'}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 md:p-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Points d'attention</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {scpiData.points_attention.map((point, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Eye className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                  <p className="text-gray-700">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Simulateur de Revenus */}
      {scpiData.simulator && (
        <div className="bg-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <ThematicSimulator
              defaultInvestment={scpiData.simulator.defaultInvestment}
              defaultYield={scpiData.simulator.defaultYield}
              title={scpiData.simulator.title}
              subtitle={scpiData.simulator.subtitle}
              theme={scpiData.simulator.theme}
            />
          </div>
        </div>
      )}

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-6">
            <MaximusLogoFooter />
            <p className="text-gray-400 text-center text-sm max-w-2xl">
              MaximusSCPI est un service d'accompagnement indépendant pour les investisseurs en SCPI. Nous ne sommes affiliés à aucune société de gestion.
            </p>
            <div className="flex gap-6 text-sm">
              <button onClick={() => window.location.href = '/mentions-legales'} className="text-gray-400 hover:text-white transition-colors">
                Mentions légales
              </button>
              <button onClick={() => window.location.href = '/politique-confidentialite'} className="text-gray-400 hover:text-white transition-colors">
                Politique de confidentialité
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GenericScpiLandingPage;
