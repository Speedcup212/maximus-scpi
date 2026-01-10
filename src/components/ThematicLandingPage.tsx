import React, { useState, useEffect, lazy, Suspense } from 'react';
import {
  TrendingUp, Shield, CheckCircle, Phone, Mail, User, Euro,
  ArrowRight, Award, Star, Building2, Globe, BarChart3, Leaf,
  Target, Calculator, MessageCircle, Clock, FileText, DollarSign,
  Calendar, Search, Filter, UserCheck, PlayCircle, ShieldCheck,
  Grid2x2 as Grid, Lock, Eye, BadgeCheck, Recycle, MapPin, Users, AlertCircle, Info
} from 'lucide-react';
import { thematicLandingPages } from '../data/thematicLandingPages';
import { scpiData } from '../data/scpiData';
import { Scpi } from '../types/scpi';
import { useScpiFilters } from '../hooks/useScpiFilters';
import { usePortfolio } from '../hooks/usePortfolio';
import ScpiTable from './ScpiTable';
import QuickFilters from './QuickFilters';
import AdvancedFilters from './AdvancedFilters';
import Logo from './Logo';
import ResponsiveImage from './ResponsiveImage';
import MaximusLogo3Bars from './MaximusLogo3Bars';
import MaximusLogoFooter from './MaximusLogoFooter';
import Header from './Header';
import SemanticLinks from './SemanticLinks';
import { getSemanticLinks } from '../data/semanticCocon';

const RdvModal = lazy(() => import('./RdvModal'));
const AnalysisModal = lazy(() => import('./AnalysisModal'));
const PortfolioWidget = lazy(() => import('./PortfolioWidget'));
const PortfolioResultsModal = lazy(() => import('./PortfolioResultsModal'));

interface ThematicLandingPageProps {
  pageKey: string;
  onNavigateHome?: () => void;
  onNavigateToFaq?: () => void;
  onNavigateToAbout?: () => void;
  onNavigateToUnderstanding?: () => void;
  onNavigateToScpi?: (slug: string) => void;
  onContactClick?: () => void;
}

const iconMap: Record<string, React.ReactElement> = {
  'trending-up': <TrendingUp className="w-8 h-8 text-white" />,
  'shield': <Shield className="w-8 h-8 text-white" />,
  'globe': <Globe className="w-8 h-8 text-white" />,
  'leaf': <Leaf className="w-8 h-8 text-white" />,
  'building': <Building2 className="w-8 h-8 text-white" />,
  'dollar-sign': <DollarSign className="w-8 h-8 text-white" />,
  'calendar': <Calendar className="w-8 h-8 text-white" />,
  'calculator': <Calculator className="w-8 h-8 text-white" />,
  'search': <Search className="w-8 h-8 text-white" />,
  'filter': <Filter className="w-8 h-8 text-white" />,
  'user-check': <UserCheck className="w-8 h-8 text-white" />,
  'recycle': <Recycle className="w-8 h-8 text-white" />,
  'map-pin': <MapPin className="w-8 h-8 text-white" />,
  'shield-check': <ShieldCheck className="w-8 h-8 text-white" />,
  'users': <Users className="w-8 h-8 text-white" />,
  'target': <Target className="w-8 h-8 text-white" />,
  'alert-circle': <AlertCircle className="w-12 h-12 text-orange-600" />,
  'info': <Info className="w-12 h-12 text-blue-600" />,
  'file-text': <FileText className="w-12 h-12 text-blue-600" />,
  'bar-chart': <BarChart3 className="w-12 h-12 text-purple-600" />,
  'play-circle': <PlayCircle className="w-12 h-12 text-green-600" />
};

const ThematicLandingPage: React.FC<ThematicLandingPageProps> = ({
  pageKey,
  onNavigateHome,
  onNavigateToFaq,
  onNavigateToAbout,
  onNavigateToUnderstanding,
  onNavigateToScpi,
  onContactClick
}) => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    montant: '',
    commentaire: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [currentPage, setCurrentPage] = useState(1);
  const [isRdvModalOpen, setIsRdvModalOpen] = useState(false);
  const [selectedScpiForAnalysis, setSelectedScpiForAnalysis] = useState<Scpi | null>(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [isPortfolioResultsOpen, setIsPortfolioResultsOpen] = useState(false);
  const itemsPerPage = 10;

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

  const pageData = thematicLandingPages[pageKey];

  const { filteredScpi, activeQuickFilter, setQuickFilter, filters, updateFilter } = useScpiFilters(scpiData);
  const { selectedScpi, investmentAmount, setInvestmentAmount, toggleScpiSelection, removeScpi } = usePortfolio();

  if (!pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Page non trouvée</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const { supabase } = await import('../supabaseClient');

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
        commentaire: formData.commentaire || null,
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

      const { error } = await supabase
        .from(tableName)
        .insert([leadData]);

      if (error) {
        console.error('Erreur Supabase:', error);
        throw error;
      }

      setSubmitStatus('success');

      // Redirect to thank you page after short delay
      setTimeout(() => {
        window.location.href = '/merci-landing-page.html';
      }, 1500);

      setFormData({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        montant: '',
        commentaire: ''
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
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

  const top5Scpi = [...scpiData].sort((a, b) => b.yield - a.yield).slice(0, 5);

  const totalPages = Math.ceil(filteredScpi.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedScpi = filteredScpi.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (pageKey === 'comparateur-scpi') {
      const comparatorSection = document.getElementById('comparateur-section');
      if (comparatorSection) {
        comparatorSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleScpiAnalysis = (scpi: Scpi) => {
    setSelectedScpiForAnalysis(scpi);
    setIsAnalysisModalOpen(true);
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
      setIsRdvModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
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

      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left */}
            <div className="flex flex-col h-full">
              <div className="mb-6">
                {pageData.labelText && (
                  <div className="inline-flex items-center gap-2 bg-green-400 text-gray-900 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                    <Award className="w-4 h-4" />
                    {pageData.labelText}
                  </div>
                )}

                <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900">
                  {pageData.heroTitle}
                  <span className="block text-green-600 mt-2">{pageData.heroTitleHighlight}</span>
                </h1>
              </div>

              <p className="text-xl text-gray-600 mb-6">
                {pageData.heroSubtitle}
              </p>

              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
                {pageData.keyMetrics.map((metric, index) => (
                  <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-4 text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-green-600">{metric.value}</div>
                    <div className="text-xs sm:text-sm text-gray-600">{metric.label}</div>
                  </div>
                ))}
              </div>

              {/* Benefits */}
              <div className="space-y-3 mb-6">
                {pageData.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Trust Indicators */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-4">
                  <Shield className="w-8 h-8 text-green-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Pourquoi choisir MaximusSCPI ?</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <Star className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Conseil indépendant et personnalisé</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Réponse sous 24h par un expert dédié</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Accompagnement gratuit de A à Z</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Award className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Accès aux meilleures SCPI du marché</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <Building2 className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">+500</div>
                  <div className="text-xs text-gray-600">Clients accompagnés</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">15+</div>
                  <div className="text-xs text-gray-600">Années d'expertise</div>
                </div>
              </div>

              {/* Garanties et Sécurité */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-green-600" />
                  Garanties et Sécurité
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <BadgeCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Certifié AMF</div>
                      <div className="text-xs text-gray-600">Conseiller agréé</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Eye className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Transparent</div>
                      <div className="text-xs text-gray-600">Sans frais cachés</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Indépendant</div>
                      <div className="text-xs text-gray-600">Conseil objectif</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Lock className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Sécurisé</div>
                      <div className="text-xs text-gray-600">Données protégées</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Process en 3 étapes */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Votre parcours en 3 étapes
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Analyse gratuite</div>
                      <div className="text-xs text-gray-600">Étude de votre profil et objectifs</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Sélection personnalisée</div>
                      <div className="text-xs text-gray-600">Les meilleures SCPI pour vous</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Accompagnement complet</div>
                      <div className="text-xs text-gray-600">Jusqu'à la souscription et au-delà</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Lead Form */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 h-full flex flex-col">
              <div className="text-center mb-6">
                <div className="mb-4">
                  <img
                    src="/cercle Eric Bellaiche bleu.svg"
                    alt="Eric Bellaiche - Expert SCPI MaximusSCPI"
                    className="w-20 h-20 rounded-full mx-auto shadow-lg object-cover"
                    width="80"
                    height="80"
                    loading="eager"
                  />
                </div>
                <p className="text-sm font-semibold text-green-600 mb-2">
                  Éric Bellaiche - Expert MaximusSCPI
                </p>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Prendre RDV avec MaximusSCPI
                </h2>
                <p className="text-gray-600">
                  Échangez avec un expert SCPI - Gratuit et sans engagement
                </p>
              </div>

              {submitStatus === 'success' ? (
                <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6 text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Demande envoyée !
                  </h3>
                  <p className="text-gray-700">
                    Éric vous contacte sous 24h pour échanger sur votre projet.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
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
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
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
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
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
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      placeholder="jean.dupont@email.com"
                    />
                  </div>

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
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      placeholder="06 12 34 56 78"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Montant à investir *
                    </label>
                    <select
                      name="montant"
                      required
                      value={formData.montant}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white text-gray-900"
                    >
                      <option value="">Sélectionnez un montant</option>
                      <option value="1000-5000">1 000€ - 5 000€</option>
                      <option value="5000-10000">5 000€ - 10 000€</option>
                      <option value="10000-25000">10 000€ - 25 000€</option>
                      <option value="25000-50000">25 000€ - 50 000€</option>
                      <option value="50000-100000">50 000€ - 100 000€</option>
                      <option value="100000+">100 000€ +</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Commentaire (optionnel)
                    </label>
                    <textarea
                      name="commentaire"
                      value={formData.commentaire}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      placeholder="Vos questions..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {isSubmitting ? 'Envoi en cours...' : 'Prendre rendez-vous gratuitement'}
                  </button>

                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-3">ou</p>
                    <a
                      href="https://calendly.com/eric-bellaiche/gp-rendez-vous-avec-eric-bellaiche-clone"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold transition-colors"
                    >
                      <Calendar className="w-5 h-5" />
                      Choisir un créneau sur Calendly
                    </a>
                  </div>

                  {submitStatus === 'error' && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-center">
                      Une erreur est survenue. Veuillez réessayer.
                    </div>
                  )}

                  <p className="text-xs text-gray-500 text-center">
                    🔒 Vos données sont sécurisées et ne seront jamais partagées
                  </p>
                </form>
              )}

              {/* Disclaimers obligatoires sous le formulaire */}
              <div className="mt-auto pt-6">
              <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-gray-700 leading-relaxed">
                    <p className="font-semibold text-gray-900 mb-2">⚠️ Avertissement important</p>
                    <p>
                      Les <strong>performances passées ne préjugent pas des performances futures</strong>.
                      L'investissement en SCPI présente un <strong>risque de perte en capital</strong> et une
                      <strong> liquidité limitée</strong>. Les SCPI sont des placements de long terme.
                      <strong> Durée de placement recommandée : 8 à 10 ans minimum.</strong>
                    </p>
                    <p className="mt-2 text-gray-600 italic">
                      Source des données : Documents réglementaires des SCPI • Arrêté au 31/12/2024
                    </p>
                    <p className="mt-1 text-gray-600 text-[10px]">
                      * Revenus sous réserve des performances de la SCPI et du maintien du taux d'occupation
                    </p>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pourquoi choisir */}
      {pageKey === 'comparateur-scpi' && (
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {pageData.pourquoiChoisir.title}
              </h2>
              <p className="text-xl text-gray-600">
                {pageData.pourquoiChoisir.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {pageData.pourquoiChoisir.features.map((feature, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mb-4">
                    {iconMap[feature.icon]}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Comparateur SCPI complet */}
      {pageKey === 'comparateur-scpi' && (
        <div id="comparateur-section" className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Comparateur SCPI
                      </h2>
                      <p className="text-gray-600">
                        {scpiData.length} SCPI disponibles • {selectedScpi.length} sélectionnées
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <QuickFilters
                      activeFilter={activeQuickFilter}
                      onFilterChange={setQuickFilter}
                    />

                    <AdvancedFilters
                      filters={filters}
                      onFilterChange={updateFilter}
                    />
                  </div>

                  <ScpiTable
                    scpiList={paginatedScpi}
                    selectedScpi={selectedScpi}
                    onScpiToggle={toggleScpiSelection}
                    onAnalyzeClick={handleScpiAnalysis}
                    onRdvClick={() => setIsRdvModalOpen(true)}
                  />

                  {totalPages > 1 && (
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-sm text-gray-600">
                        Affichage de {startIndex + 1} à {Math.min(endIndex, filteredScpi.length)} sur {filteredScpi.length} SCPI
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Précédent
                        </button>
                        <div className="text-gray-700 font-semibold">
                          {currentPage} / {totalPages}
                        </div>
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 bg-blue-600 text-white border border-blue-600 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Suivant
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  <Suspense fallback={<div className="bg-white rounded-xl p-6 shadow-lg animate-pulse"><div className="h-32 bg-gray-200 rounded"></div></div>}>
                    <PortfolioWidget
                      selectedScpi={selectedScpi}
                      investmentAmount={investmentAmount}
                      onInvestmentChange={setInvestmentAmount}
                      onRemoveScpi={removeScpi}
                      onExportClick={() => setIsPortfolioResultsOpen(true)}
                    />
                  </Suspense>

                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      Expertise MaximusSCPI
                    </h3>
                    <p className="text-sm text-gray-700 mb-4">
                      15 ans d'expérience en conseil patrimonial et analyses approfondies pour vous guider.
                    </p>
                    <button
                      onClick={() => setIsRdvModalOpen(true)}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Être rappelé par un expert
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bloc Éric Bellaiche */}
      <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-12 border-b-4 border-green-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border-2 border-green-200">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
              <div className="flex-shrink-0">
                <img
                  src="/cercle Eric Bellaiche bleu.svg"
                  alt="Eric Bellaiche - Expert MaximusSCPI"
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover"
                  width="160"
                  height="160"
                  loading="lazy"
                />
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="mb-4">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    Éric Bellaiche
                  </h3>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="inline w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <p className="text-sm md:text-base font-semibold text-green-700 mb-2">
                  Conseiller en Gestion de Patrimoine et en Investissements Financiers
                </p>

                <p className="text-xs md:text-sm text-gray-600 mb-3 leading-relaxed">
                  Membre de la Chambre Nationale des Conseils Experts Financiers (CNCEF) • 15 ans d'expérience
                </p>

                <p className="text-sm md:text-base text-gray-700 mb-4 italic leading-relaxed">
                  "J'ai créé MaximusSCPI pour rendre l'investissement en SCPI simple, transparent et performant, même pour les débutants. Mon expertise de 15 ans combinée à l'intelligence artificielle vous garantit des recommandations personnalisées."
                </p>

                <div className="flex flex-wrap items-center gap-3 md:gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/50 backdrop-blur-sm">
                    <Award className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-semibold text-gray-700">
                      ACPR
                    </span>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/50 backdrop-blur-sm">
                    <Award className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-semibold text-gray-700">
                      CNCEF N° D016571
                    </span>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/50 backdrop-blur-sm">
                    <Award className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-semibold text-gray-700">
                      Orias N°13001580
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 w-full md:w-auto">
                <button
                  onClick={() => {
                    const form = document.querySelector('form');
                    if (form) {
                      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                  className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Prendre RDV</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Top 5 for meilleures-scpi-rendement */}
      {pageKey === 'meilleures-scpi-rendement' && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              <Award className="w-8 h-8 inline-block text-amber-600 mr-2" />
              Classement Officiel Top 5 SCPI de Rendement 2025
            </h2>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Rang</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">SCPI</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Société</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">Rendement</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">TOF</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">Capitalisation</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {top5Scpi.map((scpi, index) => (
                      <tr key={scpi.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center w-8 h-8 bg-amber-100 text-amber-600 font-bold rounded-full">
                            {index + 1}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{scpi.name}</div>
                          <div className="text-sm text-gray-500">{scpi.sector}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{scpi.company}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="text-lg font-bold text-green-600">{scpi.yield.toFixed(2)}%</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="text-gray-900 font-semibold">{scpi.tof.toFixed(1)}%</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="text-gray-900">{(scpi.capitalization / 1000000).toFixed(0)} M€</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <a
                            href={`/scpi/${scpi.id}`}
                            className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium text-sm"
                          >
                            Voir détails
                            <ArrowRight className="w-4 h-4" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      <Suspense fallback={<div>Chargement...</div>}>
        {isRdvModalOpen && (
          <RdvModal
            isOpen={isRdvModalOpen}
            onClose={() => setIsRdvModalOpen(false)}
            selectedScpi={selectedScpi}
          />
        )}

        {isAnalysisModalOpen && selectedScpiForAnalysis && (
          <AnalysisModal
            scpi={selectedScpiForAnalysis}
            isOpen={isAnalysisModalOpen}
            onClose={() => {
              setIsAnalysisModalOpen(false);
              setSelectedScpiForAnalysis(null);
            }}
            onTakeAppointment={() => {
              setIsAnalysisModalOpen(false);
              setIsRdvModalOpen(true);
            }}
          />
        )}

        {isPortfolioResultsOpen && (
          <PortfolioResultsModal
            selectedScpi={selectedScpi}
            investmentAmount={investmentAmount}
            isOpen={isPortfolioResultsOpen}
            onClose={() => setIsPortfolioResultsOpen(false)}
            clientProfile={null}
            onExportPDF={() => {}}
            onScheduleCall={() => {
              setIsPortfolioResultsOpen(false);
              setIsRdvModalOpen(true);
            }}
            onLogoClick={() => {
              setIsPortfolioResultsOpen(false);
              if (onNavigateHome) onNavigateHome();
            }}
          />
        )}
      </Suspense>

      {/* Informations pratiques */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
            {pageData.informationsPratiques.title}
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {pageData.informationsPratiques.items.map((item, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                {iconMap[item.icon]}
                <h3 className="text-xl font-bold text-gray-900 mb-3 mt-4">{item.title}</h3>
                <ul className="space-y-2 text-gray-700">
                  {item.points.map((point, pIndex) => (
                    <li key={pIndex} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Prêt à investir */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Prêt à investir dans les SCPI ?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
            Échangez gratuitement avec Éric Bellaiche pour construire votre sélection SCPI optimale
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => {
                const form = document.querySelector('form');
                if (form) {
                  form.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              className="inline-flex items-center gap-2 bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all shadow-lg"
            >
              <MessageCircle className="w-6 h-6" />
              Prendre rendez-vous gratuitement
            </button>
            <a
              href="https://calendly.com/eric-bellaiche/gp-rendez-vous-avec-eric-bellaiche-clone"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-600 transition-all shadow-lg"
            >
              <Calendar className="w-6 h-6" />
              Réserver sur Calendly
            </a>
          </div>
        </div>
      </div>

      {/* Ils nous font confiance */}
      {pageData.temoignages && pageData.temoignages.length > 0 && (
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
              Ils nous font confiance
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {pageData.temoignages.map((temoignage, index) => {
                const avatarColors = ['bg-blue-600', 'bg-green-600', 'bg-purple-600'];
                const initials = temoignage.nom.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

                return (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 ${avatarColors[index % avatarColors.length]} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                        {initials}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{temoignage.nom}</div>
                        <div className="flex items-center gap-1">
                          {[...Array(temoignage.note)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4 italic">"{temoignage.texte}"</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Questions fréquentes */}
      <div className="bg-gradient-to-br from-gray-50 to-purple-50 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
            Questions fréquentes
          </h2>

          <div className="space-y-6">
            {pageData.faq.map((item, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-start gap-3">
                  <MessageCircle className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                  {item.question}
                </h3>
                <p className="text-gray-700 leading-relaxed pl-9">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Informations importantes */}
      <div className="bg-amber-50 border-t-4 border-amber-500 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-start gap-3 mb-4">
              <Shield className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Informations importantes
                </h3>
                <div className="text-sm text-gray-700 space-y-2 leading-relaxed">
                  <p>
                    <strong>Avertissement :</strong> L'investissement en SCPI présente des risques de perte en capital et de liquidité. Les performances passées ne préjugent pas des performances futures. Les revenus ne sont pas garantis et dépendent de l'évolution du marché immobilier.
                  </p>
                  <p>
                    <strong>Horizon d'investissement :</strong> Il est recommandé d'investir sur un horizon minimum de 8 à 10 ans.
                  </p>
                  <p>
                    <strong>Conseil personnalisé :</strong> Les informations fournies sur ce site ont un caractère général et ne constituent pas un conseil en investissement personnalisé. Chaque situation patrimoniale est unique.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cocon Sémantique - Maillage interne SEO */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SemanticLinks
          currentPage={`/${pageKey}`}
          links={getSemanticLinks(`/${pageKey}`)}
          title="Guides complémentaires pour approfondir"
        />
      </div>

      {/* Footer avec mentions légales */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <MaximusLogoFooter className="h-16 w-auto" />
          </div>

          {/* Grille de blocs d'informations */}
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-8">
            {/* Bloc 1 : À propos */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-blue-400 mb-3">
                MaximusSCPI<span className="text-xs align-super">™</span>
              </h3>
              <p className="text-sm text-gray-300 mb-2">
                Votre expert en investissement SCPI
              </p>
              <p className="text-xs text-gray-400">
                Marque déposée INPI
              </p>
            </div>

            {/* Bloc 2 : Conseiller */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-blue-400 mb-3">
                Conseiller en Investissements Financiers
              </h3>
              <p className="text-sm text-gray-300 mb-2">
                <strong>Eric Bellaiche</strong>
              </p>
              <div className="text-xs text-gray-400 space-y-1">
                <p>ORIAS N° <strong>13001580</strong></p>
                <p>CNCEF Patrimoine N° <strong>D016571</strong></p>
                <p>Sous le contrôle de l'ACPR</p>
              </div>
            </div>

            {/* Bloc 3 : Risques */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-yellow-400 mb-3">
                ⚠️ Risques
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                L'investissement en SCPI présente des risques de perte en capital et de liquidité.
                Les performances passées ne préjugent pas des performances futures.
                Le rendement n'est pas garanti et peut varier.
              </p>
            </div>

            {/* Bloc 4 : Durée et Frais */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-blue-400 mb-3">
                Durée et Frais
              </h3>
              <div className="text-xs text-gray-300 space-y-2">
                <p>
                  <strong>Durée recommandée :</strong> 8 à 10 ans minimum
                </p>
                <p>
                  <strong>Frais de souscription :</strong> 8% à 12% HT
                </p>
                <p>
                  <strong>Frais de gestion :</strong> 10% à 12% HT sur les loyers
                </p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="max-w-5xl mx-auto bg-gray-800 rounded-lg p-6 mb-8">
            <p className="text-xs text-gray-400 leading-relaxed text-center">
              Les informations présentées sur cette page sont fournies à titre indicatif et ne constituent pas un conseil en investissement personnalisé.
              Tout investissement doit faire l'objet d'une analyse approfondie de votre situation personnelle.
              Consultez la note d'information complète de chaque SCPI avant tout investissement.
            </p>
          </div>

          {/* Liens légaux et Copyright */}
          <div className="text-center space-y-4">
            <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-400">
              <a href="/mentions-legales" className="hover:text-blue-400 transition-colors">
                Mentions légales
              </a>
              <a href="/politique-confidentialite" className="hover:text-blue-400 transition-colors">
                Politique de confidentialité
              </a>
              <a href="/conditions-utilisation" className="hover:text-blue-400 transition-colors">
                Conditions d'utilisation
              </a>
              <a href="/reclamation" className="hover:text-blue-400 transition-colors">
                Réclamation
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

export default ThematicLandingPage;
