import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Shield, Phone, Mail, User, Euro,
  ArrowRight, Award, Building2, Globe, BarChart3, Leaf,
  Target, Calculator, MessageCircle, Clock, FileText, Lock,
  ChevronRight, ChevronLeft, Zap, CheckCircle
} from 'lucide-react';
import { ScpiLandingData } from '../data/landingPagesData';
import { buildScpiLandingData } from '../utils/buildScpiLandingData';
import { qualifyYield } from '../utils/yieldContext';
import { createSlugFromName } from '../utils/scpiSlugMapper';
import SEOHead from './SEOHead';
import MaximusLogoFooter from './MaximusLogoFooter';
import EricAvatar from './EricAvatar';
import PieChart from './PieChart';
import ThematicSimulator from './ThematicSimulator';
import Logo from './Logo';
import Header from './Header';
import { scpiData } from '../data/scpiData';
import { CookieConsent } from './CookieConsent';
import LeadMagnetEmailForm from './LeadMagnetEmailForm';
import ScpiPremiumAnalysis from './ScpiPremiumAnalysis';
import { submitLead } from '../utils/leadSubmitter';

interface OptimizedScpiLandingPageProps {
  scpiKey: string;
  onNavigateHome?: () => void;
  onNavigateToFaq?: () => void;
  onNavigateToAbout?: () => void;
  onNavigateToUnderstanding?: () => void;
  onNavigateToScpi?: (slug: string) => void;
  onContactClick?: () => void;
  onArticlesClick?: () => void;
  onComparateurClick?: () => void;
  onSimulateurClick?: (simulateurId: string) => void;
  isDarkMode?: boolean;
  toggleTheme?: () => void;
}

const OptimizedScpiLandingPage: React.FC<OptimizedScpiLandingPageProps> = ({
  scpiKey,
  onNavigateHome,
  onNavigateToFaq,
  onNavigateToAbout,
  onNavigateToUnderstanding,
  onNavigateToScpi,
  onContactClick,
  onArticlesClick,
  onComparateurClick,
  onSimulateurClick,
  isDarkMode = false,
  toggleTheme = () => {}
}) => {
  const built = buildScpiLandingData(scpiKey);

  if (!built) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">SCPI non trouvée</p>
      </div>
    );
  }

  const landingData: ScpiLandingData = built.data;
  const isEditorial = built.isEditorial;

  // Récupérer les vraies données de la SCPI depuis scpiData.
  // Comparaison par slug (insensible aux accents/espaces) pour éviter les
  // décalages de nommage (ex. "Périal O2" éditorial vs "Perial O2" data).
  const landingSlug = createSlugFromName(landingData.nom);
  const realScpiData = scpiData.find(
    scpi => createSlugFromName(scpi.name) === landingSlug
  );

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    commentaire: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

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

  const getColorScheme = (key: string) => {
    const schemes: Record<string, { primary: string; secondary: string; accent: string }> = {
      'comete': { primary: 'from-amber-600 via-orange-700 to-red-800', secondary: 'amber', accent: 'orange' },
      'transitions-europe': { primary: 'from-blue-600 via-indigo-700 to-blue-800', secondary: 'blue', accent: 'indigo' },
      'remake-live': { primary: 'from-purple-600 via-fuchsia-700 to-purple-800', secondary: 'purple', accent: 'fuchsia' },
      'epargne-pierre-europe': { primary: 'from-teal-600 via-cyan-700 to-teal-800', secondary: 'teal', accent: 'cyan' },
      'optimale': { primary: 'from-green-600 via-lime-700 to-green-800', secondary: 'green', accent: 'lime' },
      'iroko-zen': { primary: 'from-emerald-600 via-teal-700 to-emerald-800', secondary: 'emerald', accent: 'teal' },
      'novaxia-neo': { primary: 'from-slate-600 via-gray-700 to-slate-800', secondary: 'slate', accent: 'gray' }
    };
    return schemes[key] || schemes['iroko-zen'];
  };

  const colors = getColorScheme(scpiKey);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Vérification des variables d'environnement avant tout
      const result = await submitLead({
        channel: 'scpi_page',
        form_type: 'lead_contact',
        context_type: 'scpi',
        context_slug: scpiKey,
        identity: {
          nom: formData.nom || '',
          prenom: formData.prenom || '',
          email: formData.email,
          telephone: formData.telephone || '',
        },
        message: formData.commentaire || '',
        answers: { scpi: landingData.nom },
      });

      if (!result.ok) {
        throw new Error(`SUPABASE_ERROR: ${result.error}`);
      }

      setSubmitStatus('success');

      const senderGroupId = 'LM_SCPI_SansFrais';
      try {
        console.log('📧 Ajout du contact à Sender, groupe:', senderGroupId);
        const senderResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sender-add-contact`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: formData.email,
              group_id: senderGroupId,
              firstname: formData.prenom,
              lastname: formData.nom,
              fields: {
                scpi: landingData.nom,
                telephone: formData.telephone || ''
              }
            }),
          }
        );

        if (senderResponse.ok) {
          console.log('✅ Contact ajouté à Sender avec succès');
        } else {
          console.warn('⚠️ Erreur Sender (non bloquante):', await senderResponse.text());
        }
      } catch (senderError) {
        console.warn('⚠️ Erreur Sender (non bloquante):', senderError);
      }

      // Tracking Google Ads UNIQUEMENT après succès confirmé
      if (window.gtag) {
        console.log('📊 Envoi des événements de conversion Google Ads');
        window.gtag('event', 'conversion', {
          'send_to': `AW-CONVERSION_ID/${scpiKey.toUpperCase().replace(/-/g, '_')}`,
          'value': 1.0,
          'currency': 'EUR',
          'transaction_id': ''
        });

        window.gtag('event', 'generate_lead', {
          'event_category': `SCPI ${landingData.nom}`,
          'event_label': 'Formulaire Landing Page Simplifié',
          'value': 0
        });
      }

      // Redirection UNIQUEMENT après succès confirmé
      console.log('✅ Redirection vers la page de remerciement');
      window.location.href = '/merci-landing-page.html';

      setFormData({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
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
        formData: { email: formData.email, hasPhone: !!formData.telephone },
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

  // Qualification factuelle du rendement (garde-fou marketing) : jamais de
  // « Performance exceptionnelle » sur un rendement faible.
  const heroYieldValue = realScpiData ? realScpiData.yield : parseFloat(String(landingData.rendement).replace(',', '.'));
  const yieldQualif = qualifyYield(heroYieldValue);

  const getBadgeText = () => {
    if (landingData.frais_souscription === "0%") {
      return "0% de frais d'entrée - Votre capital investi à 100%";
    }
    return `${landingData.rendement} de rendement - ${yieldQualif.label}`;
  };

  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000000) {
      return (amount / 1000000000).toFixed(1) + ' Md€';
    } else if (amount >= 1000000) {
      return Math.round(amount / 1000000) + ' M€';
    }
    return Math.round(amount) + ' €';
  };

  const formatPercentage = (value: number): string => {
    return value.toFixed(2) + '%';
  };

  // Générer le verdict de l'expert basé sur les données réelles de la SCPI
  // Canonical SANS préfixe (URL officielle de la fiche), quelle que soit l'URL
  // d'arrivée (ex. /scpi-wemo-one redirigé 301 → /wemo-one).
  const canonicalUrl = `https://maximusscpi.com/${landingData.slug}/`;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-${colors.secondary}-50 via-white to-${colors.accent}-50`}>
      <SEOHead
        title={`SCPI ${landingData.nom} : analyse, rendement et avis | MaximusSCPI`}
        description={landingData.description_courte || `Analyse complète de la SCPI ${landingData.nom} : rendement, capitalisation, frais, répartition et points de vigilance.`}
        canonical={canonicalUrl}
      />
      <Header
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        onContactClick={onContactClick || (() => {})}
        onAboutClick={onNavigateToAbout || (() => {})}
        onLogoClick={onNavigateHome}
        onFaqClick={onNavigateToFaq}
        onScpiPageClick={onNavigateToScpi}
        onUnderstandingClick={onNavigateToUnderstanding}
        onAboutSectionClick={onNavigateToAbout}
        onComparateurClick={onComparateurClick}
        onSimulateurClick={onSimulateurClick}
        onArticlesClick={onArticlesClick}
        currentView="scpi-landing"
      />

      <div className={`bg-gradient-to-br ${colors.primary} text-white`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 bg-yellow-400 text-gray-900 px-5 py-2.5 rounded-full text-sm font-bold shadow-lg">
                  <Zap className="w-5 h-5" />
                  {getBadgeText()}
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
                  {landingData.h1_question || `SCPI ${landingData.nom}`}
                  <span className={`block text-3xl sm:text-4xl lg:text-5xl text-${colors.secondary}-100 mt-3`}>
                    {realScpiData ? formatPercentage(realScpiData.yield) : landingData.rendement} de rendement
                  </span>
                  <span className="block text-2xl sm:text-3xl lg:text-4xl text-yellow-400 mt-3">
                    {landingData.frais_souscription === "0%" ? "Sans frais d'entrée" : yieldQualif.label}
                  </span>
                </h1>

                <p className={`text-xl sm:text-2xl text-${colors.secondary}-50 leading-relaxed`}>
                  {landingData.description_courte}
                </p>

                {realScpiData && scpiKey === 'comete' ? (
                  <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-4 sm:p-5">
                    <div className="flex items-end justify-between gap-3 mb-4">
                      <div>
                        <div className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-white/70">
                          Les chiffres essentiels
                        </div>
                        <div className="text-sm sm:text-base text-white/90 mt-1">
                          Une lecture simple avant d'aller dans le détail
                        </div>
                      </div>
                      <div className="hidden sm:block text-xs text-white/60">
                        Source : {realScpiData.periodeBulletinTrimestriel || 'dernières données disponibles'}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        {
                          label: 'Rendement',
                          value: formatPercentage(realScpiData.yield),
                          help: 'Distribué sur l’année'
                        },
                        {
                          label: 'Capitalisation',
                          value: formatCurrency(realScpiData.capitalization),
                          help: 'Taille de la SCPI'
                        },
                        {
                          label: 'Prix de la part',
                          value: formatCurrency(realScpiData.price),
                          help: 'Prix de souscription'
                        },
                        {
                          label: realScpiData.discount <= 0 ? 'Décote' : 'Surcote',
                          value: realScpiData.discountQaStatus === 'publishable'
                            ? `${Math.abs(realScpiData.discount).toFixed(2).replace('.', ',')} %`
                            : 'À vérifier',
                          help: realScpiData.valeurReconstitution
                            ? `${formatCurrency(realScpiData.price)} vs ${formatCurrency(realScpiData.valeurReconstitution)}`
                            : 'Vs valeur du patrimoine'
                        },
                        {
                          label: 'TOF',
                          value: formatPercentage(realScpiData.tof),
                          help: 'Occupation financière'
                        },
                        {
                          label: 'Endettement',
                          value: realScpiData.debt !== undefined ? formatPercentage(realScpiData.debt) : 'ND',
                          help: 'Niveau de dette'
                        },
                        {
                          label: 'WALB',
                          value: realScpiData.walb !== undefined ? `${realScpiData.walb.toFixed(1).replace('.', ',')} ans` : 'ND',
                          help: 'Avant sorties possibles'
                        },
                        {
                          label: 'WALT',
                          value: realScpiData.walt !== undefined ? `${realScpiData.walt.toFixed(1).replace('.', ',')} ans` : 'ND',
                          help: 'Durée restante des baux'
                        }
                      ].map((metric) => (
                        <div
                          key={metric.label}
                          className="rounded-xl border border-white/15 bg-slate-950/20 p-4 min-h-[132px] flex flex-col justify-between"
                        >
                          <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-white/65">
                            {metric.label}
                          </div>
                          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-yellow-300 leading-none tabular-nums whitespace-nowrap">
                            {metric.value}
                          </div>
                          <div className="mt-2 text-[11px] sm:text-xs leading-snug text-white/65">
                            {metric.help}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 text-[11px] leading-relaxed text-white/55 sm:hidden">
                      Source : {realScpiData.periodeBulletinTrimestriel || 'dernières données disponibles'}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {realScpiData && (
                      <>
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 text-center">
                          <div className="text-3xl sm:text-4xl font-bold text-yellow-400">{formatPercentage(realScpiData.yield)}</div>
                          <div className={`text-sm text-${colors.secondary}-100 mt-2`}>Taux de distribution</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 text-center">
                          <div className="text-3xl sm:text-4xl font-bold text-yellow-400">{formatCurrency(realScpiData.capitalization)}</div>
                          <div className={`text-sm text-${colors.secondary}-100 mt-2`}>Capitalisation</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 text-center">
                          <div className="text-3xl sm:text-4xl font-bold text-yellow-400">{formatCurrency(realScpiData.price)}</div>
                          <div className={`text-sm text-${colors.secondary}-100 mt-2`}>Prix de la part</div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="space-y-4">
                  {landingData.avantages.map((avantage, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                      <span className={`text-${colors.secondary}-50 text-lg`}>{avantage}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                {/* Lead Magnet pour les SCPI gratuites (sans frais d'entrée) */}
                {(scpiKey === 'iroko-zen' || scpiKey === 'novaxia-neo' || scpiKey === 'remake-live') ? (
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl shadow-2xl p-8">
                    <LeadMagnetEmailForm />
                  </div>
                ) : (
                  /* Formulaire classique pour les autres SCPI */
                  <div className="bg-white rounded-3xl shadow-2xl p-8 lg:sticky lg:top-4">
                    <div className="text-center mb-6">
                      <div className="mb-4 flex justify-center">
                        <div className="border-4 border-blue-600 rounded-full shadow-xl">
                          <EricAvatar size={70} />
                        </div>
                      </div>
                      <p className="text-sm font-bold text-blue-700 mb-2">
                        Eric Bellaiche - Expert MaximusSCPI
                      </p>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Obtenez votre analyse personnalisée
                      </h2>
                      <p className="text-gray-600">
                        Gratuit et sans engagement - Rappel sous 24h
                      </p>
                    </div>

                    {submitStatus === 'success' ? (
                      <div className="bg-blue-50 border-2 border-blue-500 rounded-xl p-6 text-center">
                        <CheckCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          Demande envoyée avec succès !
                        </h3>
                        <p className="text-gray-700">
                          Eric vous contacte sous 24h pour échanger sur votre projet.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                              Prénom *
                            </label>
                            <input
                              type="text"
                              name="prenom"
                              required
                              value={formData.prenom}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                              placeholder="Jean"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                              Nom *
                            </label>
                            <input
                              type="text"
                              name="nom"
                              required
                              value={formData.nom}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                              placeholder="Dupont"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Adresse e-mail *
                          </label>
                          <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            placeholder="vous@exemple.com"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Téléphone *
                          </label>
                          <input
                            type="tel"
                            name="telephone"
                            required
                            value={formData.telephone}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            placeholder="06 12 34 56 78"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Votre message (Facultatif)
                          </label>
                          <textarea
                            name="commentaire"
                            value={formData.commentaire}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
                            placeholder="Vos questions ou précisions..."
                          />
                        </div>

                        {submitStatus === 'error' && (
                          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-center">
                            <p className="text-red-700 text-sm">
                              Une erreur est survenue. Veuillez réessayer.
                            </p>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              <span>Envoi en cours...</span>
                            </>
                          ) : (
                            <>
                              <Mail className="w-5 h-5" />
                              <span>Obtenir mon analyse personnalisée</span>
                            </>
                          )}
                        </button>

                        <div className="flex items-center justify-center gap-6 text-xs text-gray-600 pt-4">
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Gratuit</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Shield className="w-4 h-4 text-blue-500" />
                            <span>Sans engagement</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>Réponse 24h</span>
                          </div>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      <div className="bg-white py-10 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-7">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Patrimoine</p>
              <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-gray-900">
                Où investit {landingData.nom} ?
              </h2>
            </div>
            <p className="text-sm text-gray-500 max-w-xl">
              Répartition géographique et sectorielle du patrimoine à partir des dernières données structurées disponibles.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-slate-700" />
                <h3 className="text-lg font-bold text-gray-900">Géographie</h3>
              </div>
              {Object.keys(landingData.geographie).length === 0 ? (
                <div className="flex items-center justify-center h-[220px] text-gray-500 text-center px-4">
                  Répartition géographique non disponible.
                </div>
              ) : (
                <div className="grid sm:grid-cols-[220px_1fr] gap-4 items-center">
                  <div className="flex justify-center">
                    <PieChart
                      data={Object.entries(landingData.geographie).map(([pays, pct], index) => ({
                        name: pays,
                        value: pct,
                        color: [
                          '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
                          '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
                        ][index % 10]
                      }))}
                      width={220}
                      height={220}
                      showLabels={true}
                    />
                  </div>
                  <div className="space-y-1.5 text-sm">
                    {Object.entries(landingData.geographie).map(([pays, pct], index) => (
                      <div key={pays} className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: [
                            '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
                            '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
                          ][index % 10] }}
                        />
                        <span className="text-gray-700 truncate">{pays}</span>
                        <span className="ml-auto font-semibold text-gray-900">{pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-slate-700" />
                <h3 className="text-lg font-bold text-gray-900">Secteurs</h3>
              </div>
              {Object.keys(landingData.secteurs).length === 0 ? (
                <div className="flex items-center justify-center h-[220px] text-gray-500 text-center px-4">
                  Répartition sectorielle non disponible.
                </div>
              ) : (
                <div className="grid sm:grid-cols-[220px_1fr] gap-4 items-center">
                  <div className="flex justify-center">
                    <PieChart
                      data={Object.entries(landingData.secteurs).map(([secteur, pct], index) => ({
                        name: secteur,
                        value: pct,
                        color: [
                          '#1e40af', '#059669', '#d97706', '#dc2626', '#7c3aed',
                          '#0891b2', '#65a30d', '#ea580c', '#be185d', '#4f46e5'
                        ][index % 10]
                      }))}
                      width={220}
                      height={220}
                      showLabels={true}
                    />
                  </div>
                  <div className="space-y-1.5 text-sm">
                    {Object.entries(landingData.secteurs).map(([secteur, pct], index) => (
                      <div key={secteur} className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: [
                            '#1e40af', '#059669', '#d97706', '#dc2626', '#7c3aed',
                            '#0891b2', '#65a30d', '#ea580c', '#be185d', '#4f46e5'
                          ][index % 10] }}
                        />
                        <span className="text-gray-700 truncate">{secteur}</span>
                        <span className="ml-auto font-semibold text-gray-900">{pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {realScpiData && (
        <ScpiPremiumAnalysis
          scpi={realScpiData}
          landingData={landingData}
        />
      )}

      {landingData.simulator && (
        <div className="bg-slate-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <details className="group rounded-2xl border border-slate-200 bg-white shadow-sm">
              <summary className="cursor-pointer list-none p-5 sm:p-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Simuler mes revenus avec {landingData.nom}</div>
                    <div className="text-sm text-gray-500">Ouvrir le simulateur uniquement si vous en avez besoin</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-90" />
              </summary>
              <div className="border-t border-slate-200 p-4 sm:p-6">
                <ThematicSimulator
                  defaultInvestment={landingData.simulator.defaultInvestment}
                  defaultYield={landingData.simulator.defaultYield}
                  title={landingData.simulator.title}
                  subtitle={landingData.simulator.subtitle}
                  theme={landingData.simulator.theme}
                />
              </div>
            </details>
          </div>
        </div>
      )}

      <div className="bg-white py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold text-gray-900">
                Besoin d'un avis avant d'investir ?
              </h2>
              <p className="mt-2 text-gray-600">
                Le formulaire en haut de page reste le point d'entrée principal. Vous pouvez aussi réserver directement 15 minutes ou comparer cette SCPI au reste du marché.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <button
                type="button"
                onClick={handleContactClick}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                <Phone className="w-4 h-4" />
                Réserver 15 min
              </button>
              <button
                type="button"
                onClick={() => onComparateurClick?.()}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-gray-900 hover:bg-slate-100 transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                Comparer cette SCPI
              </button>
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
                  <strong>Risques :</strong> L'investissement en SCPI présente des risques de perte en capital et de liquidité. Les performances passées ne préjugent pas des performances futures.
                </p>
                <p>
                  <strong>Durée recommandée :</strong> 8 à 10 ans minimum. Les SCPI sont des placements de long terme.
                </p>
                <p>
                  <strong>Frais :</strong> Frais de souscription : {landingData.frais_souscription} TTC. Consultez la note d'information complète avant tout investissement.
                </p>
                <p>
                  <strong>Conseiller :</strong> Eric Bellaiche - CIF enregistré à l'ORIAS sous le numéro 13001580.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-8">
            <MaximusLogoFooter className="h-12 w-auto" />
          </div>

          <div className="text-center space-y-4">
            <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-400">
              <a href="/mentions-legales" className={`hover:text-${colors.secondary}-400 transition-colors`}>
                Mentions légales
              </a>
              <a href="/politique-confidentialite" className={`hover:text-${colors.secondary}-400 transition-colors`}>
                Politique de confidentialité
              </a>
              <a href="/conditions-utilisation" className={`hover:text-${colors.secondary}-400 transition-colors`}>
                Conditions d'utilisation
              </a>
            </div>
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} MaximusSCPI. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>

      <CookieConsent />
    </div>
  );
};

export default OptimizedScpiLandingPage;
