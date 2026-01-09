import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Shield, CheckCircle, Phone, Mail, User, Euro,
  ArrowRight, Award, Star, Building2, Globe, BarChart3, Leaf,
  Target, Calculator, MessageCircle, Clock, FileText, Lock, Eye, BadgeCheck,
  ChevronRight, ChevronLeft, Zap, MapPin, Recycle, Users, AlertCircle, Info
} from 'lucide-react';
import { thematicLandingPages, ThematicLandingPageData } from '../data/thematicLandingPages';
import { getSemanticLinks } from '../data/semanticCocon';
import MaximusLogoFooter from './MaximusLogoFooter';
import EricAvatar from './EricAvatar';
import FintechComparator from './fintech/FintechComparator';
import PieChart from './PieChart';
import ThematicSimulator from './ThematicSimulator';
import SemanticLinks from './SemanticLinks';
import Logo from './Logo';
import LeadMagnetEmailForm from './LeadMagnetEmailForm';

interface OptimizedThematicLandingPageProps {
  pageKey: string;
  onNavigateHome?: () => void;
  onNavigateToFaq?: () => void;
  onNavigateToAbout?: () => void;
  onNavigateToUnderstanding?: () => void;
  onNavigateToScpi?: (slug: string) => void;
  onContactClick?: () => void;
  onReviewsClick?: () => void;
}

const OptimizedThematicLandingPage: React.FC<OptimizedThematicLandingPageProps> = ({
  pageKey,
  onNavigateHome,
  onNavigateToFaq,
  onNavigateToAbout,
  onNavigateToUnderstanding,
  onNavigateToScpi,
  onContactClick,
  onReviewsClick
}) => {
  console.log('[DEBUG OptimizedThematicLandingPage] Rendering with pageKey:', pageKey);
  const pageData: ThematicLandingPageData = thematicLandingPages[pageKey];

  console.log('[DEBUG OptimizedThematicLandingPage] pageData found:', !!pageData);

  if (!pageData) {
    console.log('[DEBUG OptimizedThematicLandingPage] No pageData, available keys:', Object.keys(thematicLandingPages));
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Page thématique non trouvée: {pageKey}</p>
      </div>
    );
  }


  const [formData, setFormData] = useState({
    email: '',
    telephone: '',
    commentaire: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isDarkMode, setIsDarkMode] = useState(false);

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
      const tableName = isFromGoogleAds ? 'leads_ads_formulaire' : 'leads_pdf_comparatif';

      let leadData: any = {};

      if (isFromGoogleAds) {
        // Structure pour leads_ads_formulaire
        leadData = {
          nom: formData.nom || '',
          prenom: formData.prenom || '',
          email: formData.email,
          telephone: formData.telephone || '',
          montant: '',
          commentaire: `${formData.commentaire || ''}. Page: ${pageData.title}`,
          scpi: [],
          statut: 'nouveau',
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign,
          gclid: gclid
        };
      } else {
        // Structure pour leads_pdf_comparatif
        leadData = {
          nom: formData.nom || 'Non renseigné',
          prenom: formData.prenom || 'Non renseigné',
          email: formData.email,
          source_page: window.location.pathname,
          source: pageData.title,
          consentement_marketing: true,
          consentement_date: new Date().toISOString()
        };
      }

      console.log('📤 Tentative d\'insertion dans', tableName, ':', leadData);

      // Tentative d'insertion dans Supabase
      const { error } = await supabase
        .from(tableName)
        .insert([leadData]);

      if (error) {
        console.error('❌ Erreur Supabase lors de l\'insertion:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw new Error(`SUPABASE_ERROR: ${error.message}`);
      }

      console.log('✅ Lead enregistré avec succès dans Supabase');
      setSubmitStatus('success');

      // Appel Sender pour ajouter le contact au groupe LM_SCPI_SansFrais
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
                landing_page: pageData.title,
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
          'send_to': `AW-CONVERSION_ID/${pageKey.toUpperCase().replace(/-/g, '_')}`,
          'value': 1.0,
          'currency': 'EUR',
          'transaction_id': ''
        });

        window.gtag('event', 'generate_lead', {
          'event_category': `Landing Page Thématique`,
          'event_label': pageData.title,
          'value': 0
        });
      }

      // Redirection UNIQUEMENT après succès confirmé
      console.log('✅ Redirection vers la page de remerciement');
      window.location.href = '/merci-landing-page.html';

      setFormData({
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
        pageKey: pageKey,
        formData: {
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

  const getBadgeText = () => {
    if (pageData.labelText) {
      return pageData.labelText;
    }
    return "Investissement SCPI - Accompagnement Expert";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header simplifié sans menu pour landing page publicitaire */}
      <header className="bg-gray-900 shadow-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center min-w-0 flex-shrink-0">
              <button
                onClick={handleBackToHome}
                className="flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-lg transition-transform hover:scale-105 group py-2 cursor-pointer"
                aria-label="Retour à l'accueil"
              >
                <Logo
                  variant="full"
                  isDarkMode={true}
                  iconVariant="gladiator"
                  className="w-auto h-12 transition-all duration-300 group-hover:brightness-110 cursor-pointer"
                />
              </button>
            </div>
            {/* Espace vide pour maintenir le logo à gauche */}
            <div></div>
          </div>
        </div>
      </header>

      {/* Section Hero - En-tête principal avec formulaire */}
      <section aria-labelledby="hero-title" className="bg-gradient-to-br from-blue-600 via-indigo-700 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Colonne Gauche - Contenu principal */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-yellow-400 text-gray-900 px-5 py-2.5 rounded-full text-sm font-bold shadow-lg" role="status" aria-label="Badge de catégorie">
                <Zap className="w-5 h-5" aria-hidden="true" />
                {getBadgeText()}
              </div>

              <h1 id="hero-title" className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
                {pageData.heroTitle}
                {pageData.heroTitleHighlight && (
                  <span className="block text-3xl sm:text-4xl lg:text-5xl text-blue-100 mt-3">
                    {pageData.heroTitleHighlight}
                  </span>
                )}
              </h1>

              <p className="text-xl sm:text-2xl text-blue-50 leading-relaxed">
                {pageData.heroSubtitle}
              </p>

              {/* Métriques clés */}
              {pageData.keyMetrics && pageData.keyMetrics.length > 0 && (
                <div className="grid grid-cols-3 gap-4" role="list" aria-label="Métriques clés">
                  {pageData.keyMetrics.map((metric, index) => (
                    <div key={index} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-center" role="listitem">
                      <div className="text-3xl sm:text-4xl font-bold text-yellow-400">{metric.value}</div>
                      <div className="text-sm text-blue-100 mt-1">{metric.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Avantages avec Checkmarks */}
              {pageData.benefits && pageData.benefits.length > 0 && (
                <ul className="space-y-4" aria-label="Avantages principaux">
                  {pageData.benefits.slice(0, 5).map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" aria-hidden="true" />
                      <span className="text-blue-50 text-lg">{benefit}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Colonne Droite - Formulaire de contact */}
            <aside className="bg-white rounded-3xl shadow-2xl p-8 lg:sticky lg:top-4" role="complementary" aria-label="Formulaire de contact">
              {/* Lead Magnet uniquement pour la page scpi-sans-frais */}
              {pageKey === 'scpi-sans-frais' ? (
                <LeadMagnetEmailForm />
              ) : (
                <>
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

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-base py-4 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                        >
                          {isSubmitting ? 'Envoi en cours...' : 'Être recontacté par un expert'}
                        </button>

                        <p className="text-sm text-center text-gray-600 font-medium">
                          🔒 Conseil 100% gratuit et sans engagement.
                        </p>

                        {submitStatus === 'error' && (
                          <p className="text-red-600 text-sm text-center font-medium">
                            Une erreur est survenue. Veuillez réessayer.
                          </p>
                        )}
                      </form>
                  )}

                  {/* Warning Box */}
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
                </>
              )}
            </aside>
          </div>
        </div>
      </section>

      {/* Section Comparateur pour toutes les pages secteurs, géographie et comparateur */}
      {(() => {
        // Page comparateur
        const isComparateur = pageKey === 'comparateur-scpi';
        
        // Détecter les pages secteurs (bureaux, commerces, sante, logistique, residentiel, hotellerie)
        const secteurKeywords = ['bureaux', 'commerces', 'sante', 'logistique', 'residentiel', 'hotellerie', 'mixte'];
        const isSecteur = secteurKeywords.some(keyword => 
          pageKey.includes(keyword) && (pageKey.startsWith('scpi-') || pageKey.includes('-investissement'))
        );
        
        // Détecter les pages géographie (france, europe, europeennes, international)
        const geographieKeywords = ['france', 'europe', 'europeennes', 'international'];
        const isGeographie = geographieKeywords.some(keyword => 
          pageKey.includes(keyword) && (pageKey.startsWith('scpi-') || pageKey.includes('-investissement'))
        );
        
        // Afficher le comparateur pour comparateur, secteurs et géographie
        if (isComparateur || isSecteur || isGeographie) {
          return (
            <section id="comparator" aria-labelledby="comparator-section-title" className="bg-slate-900 py-16">
              <h2 id="comparator-section-title" className="sr-only">Comparateur de SCPI</h2>
              <FintechComparator onCloseAnalysis={onNavigateHome} />
            </section>
          );
        }
        
        return null;
      })()}

      {/* Section Pourquoi Choisir */}
      {pageData.pourquoiChoisir && (
        <section aria-labelledby="why-choose-title" className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 id="why-choose-title" className="text-4xl font-bold text-gray-900 mb-4">
                {pageData.pourquoiChoisir.title}
              </h2>
              <p className="text-xl text-gray-600">
                {pageData.pourquoiChoisir.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {pageData.pourquoiChoisir.features.map((feature, index) => (
                <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200 hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-700 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section Répartition Géographique et Sectorielle */}
      {(pageData.geographie || pageData.secteurs) && (
        <section aria-labelledby="allocation-title" className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 id="allocation-title" className="text-4xl font-bold text-gray-900 mb-4">
                Exemple de répartition d'un portefeuille
              </h2>
              <p className="text-xl text-gray-600">
                Une diversification optimale pour sécuriser votre investissement
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {pageData.geographie && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border-2 border-blue-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Répartition géographique</h3>
                  </div>
                  <div className="flex justify-center">
                    <PieChart
                      data={Object.entries(pageData.geographie).map(([pays, pct], index) => ({
                        name: pays,
                        value: pct,
                        color: [
                          '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
                          '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
                        ][index % 10]
                      }))}
                      width={300}
                      height={300}
                      showLabels={true}
                    />
                  </div>
                  <div className="mt-6 space-y-2">
                    {Object.entries(pageData.geographie).map(([pays, pct], index) => (
                      <div key={pays} className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: [
                            '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
                            '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
                          ][index % 10] }}
                        />
                        <span className="font-medium text-gray-700">{pays}</span>
                        <span className="ml-auto font-bold text-gray-900">{pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pageData.secteurs && (
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-8 border-2 border-indigo-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Répartition sectorielle</h3>
                  </div>
                  <div className="flex justify-center">
                    <PieChart
                      data={Object.entries(pageData.secteurs).map(([secteur, pct], index) => ({
                        name: secteur,
                        value: pct,
                        color: [
                          '#1e40af', '#059669', '#d97706', '#dc2626', '#7c3aed',
                          '#0891b2', '#65a30d', '#ea580c', '#be185d', '#4f46e5'
                        ][index % 10]
                      }))}
                      width={300}
                      height={300}
                      showLabels={true}
                    />
                  </div>
                  <div className="mt-6 space-y-2">
                    {Object.entries(pageData.secteurs).map(([secteur, pct], index) => (
                      <div key={secteur} className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: [
                            '#1e40af', '#059669', '#d97706', '#dc2626', '#7c3aed',
                            '#0891b2', '#65a30d', '#ea580c', '#be185d', '#4f46e5'
                          ][index % 10] }}
                        />
                        <span className="font-medium text-gray-700">{secteur}</span>
                        <span className="ml-auto font-bold text-gray-900">{pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Section Simulateur de Revenus */}
      {pageData.simulator && (
        <section aria-labelledby="simulator-title" className="bg-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 id="simulator-title" className="sr-only">Simulateur de revenus</h2>
            <ThematicSimulator
              defaultInvestment={pageData.simulator.defaultInvestment}
              defaultYield={pageData.simulator.defaultYield}
              title={pageData.simulator.title}
              subtitle={pageData.simulator.subtitle}
              theme={pageData.simulator.theme}
            />
          </div>
        </section>
      )}

      {/* Section Présentation Éric Bellaiche */}
      <section aria-labelledby="expert-presentation-title" className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 md:p-12 shadow-lg">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Photo Éric */}
              <div className="flex-shrink-0">
                <EricAvatar size="xl" className="shadow-xl" />
              </div>

              {/* Contenu */}
              <div className="flex-1 text-center md:text-left">
                <h3 id="expert-presentation-title" className="text-3xl font-bold text-gray-900 mb-2">
                  Éric Bellaiche
                </h3>
                <p className="text-lg text-blue-700 font-semibold mb-3">
                  Conseiller en Gestion de Patrimoine et en Investissements Financiers
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
                  <span className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full text-sm font-medium text-gray-700 shadow-sm">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Membre CNCEF
                  </span>
                  <span className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full text-sm font-medium text-gray-700 shadow-sm">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    15 ans d'expérience
                  </span>
                </div>
                <blockquote className="text-lg text-gray-700 italic leading-relaxed border-l-4 border-blue-600 pl-6">
                  "J'ai créé MaximusSCPI pour rendre l'investissement en SCPI simple, transparent et performant, même pour les débutants. Mon expertise de 15 ans combinée à l'intelligence artificielle vous garantit des recommandations personnalisées."
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Témoignages Clients */}
      <section aria-labelledby="testimonials-title" className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="testimonials-title" className="text-4xl font-bold text-gray-900 mb-4">
              Ce que disent nos clients
            </h2>
            <p className="text-xl text-gray-600">
              Plus de 200 investisseurs nous font confiance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                initial: 'MC',
                nom: 'Marie C.',
                investissement: '50 000€',
                date: 'Janvier 2024',
                temoignage: `Eric m'a parfaitement conseillé pour mon projet SCPI. J'ai investi et je suis ravie de l'accompagnement. Un vrai professionnel à l'écoute !`
              },
              {
                initial: 'JL',
                nom: 'Jean-Luc D.',
                investissement: '75 000€',
                date: 'Mars 2024',
                temoignage: `Très satisfait de l'accompagnement personnalisé. Eric a pris le temps de m'expliquer tous les détails. Service impeccable !`
              },
              {
                initial: 'SB',
                nom: 'Sophie B.',
                investissement: '30 000€',
                date: 'Février 2024',
                temoignage: `Première expérience en SCPI. Eric a été très pédagogue pour m'expliquer le fonctionnement. Je recommande vivement !`
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
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
                <div className="text-3xl font-bold text-blue-600">1800+</div>
                <div className="text-sm text-gray-600">Clients satisfaits</div>
              </div>
              <div className="h-12 w-px bg-gray-300"></div>
              <div>
                <div className="text-3xl font-bold text-blue-600">4,9/5</div>
                <div className="text-sm text-gray-600">Note moyenne</div>
              </div>
              <div className="h-12 w-px bg-gray-300"></div>
              <div>
                <div className="text-3xl font-bold text-blue-600">15 ans</div>
                <div className="text-sm text-gray-600">D'expérience</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section CTA Final */}
      <section aria-labelledby="cta-title" className="bg-gradient-to-r from-blue-600 via-indigo-700 to-blue-800 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 id="cta-title" className="text-4xl font-bold text-white mb-6">
            Prêt à investir en SCPI ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            {pageData.heroSubtitle}
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

          <div className="mt-8 flex items-center justify-center gap-8 text-blue-100">
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
      </section>

      {/* Section FAQ */}
      {pageData.faq && pageData.faq.length > 0 && (
        <section aria-labelledby="faq-title" className="bg-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 id="faq-title" className="text-4xl font-bold text-center mb-12 text-gray-900">
              Questions Fréquentes
            </h2>
            <div className="space-y-4">
              {pageData.faq.map((item, index) => (
                <details key={index} className="bg-gray-50 rounded-lg shadow-md overflow-hidden group border border-gray-200">
                  <summary className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-between font-semibold text-gray-900">
                    <span>{item.question}</span>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="px-6 pb-4 text-gray-600 leading-relaxed">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section Informations Légales */}
      <section aria-labelledby="legal-info-title" className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-yellow-400 flex-shrink-0 mt-1" />
            <div>
              <h3 id="legal-info-title" className="text-xl font-bold mb-4">Informations importantes</h3>
              <div className="space-y-3 text-gray-300 text-sm">
                <p>
                  <strong>Risques :</strong> L'investissement en SCPI présente des risques de perte en capital et de liquidité. Les performances passées ne préjugent pas des performances futures.
                </p>
                <p>
                  <strong>Durée recommandée :</strong> 8 à 10 ans minimum. Les SCPI sont des placements de long terme.
                </p>
                <p>
                  <strong>Conseiller :</strong> Eric Bellaiche - CIF enregistré à l'ORIAS sous le numéro 13001580.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Liens Sémantiques - Cocon SEO */}
      <nav aria-label="Navigation sémantique" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <SemanticLinks
          currentPage={`/${pageData.slug}`}
          links={getSemanticLinks(`/${pageData.slug}`)}
          title="Continuez votre découverte des SCPI"
        />
      </nav>

      {/* Footer */}
      <footer role="contentinfo" className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-8">
            <MaximusLogoFooter className="h-12 w-auto" />
          </div>

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

export default OptimizedThematicLandingPage;
