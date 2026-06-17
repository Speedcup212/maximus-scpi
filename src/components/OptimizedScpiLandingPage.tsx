import React, { useState, useEffect, lazy, Suspense } from 'react';
import {
  TrendingUp, Shield, Phone, Mail, User, Euro,
  ArrowRight, Award, Star, Building2, Globe, BarChart3, Leaf,
  Target, Calculator, MessageCircle, Clock, FileText, Lock, Eye, BadgeCheck,
  ChevronRight, ChevronLeft, Zap, Calendar, ThumbsUp, AlertTriangle, CheckCircle
} from 'lucide-react';
import { ScpiLandingData } from '../data/landingPagesData';
import { resolveDisplayedDiscount } from '../utils/formatters';
import { buildScpiLandingData } from '../utils/buildScpiLandingData';
import { CALENDLY_URL } from '../config/calendly';
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
import scpiCompleteJson from '../data/SCPI_complet_avec_SFDR_Profil.json';
import { CookieConsent } from './CookieConsent';
import LeadMagnetEmailForm from './LeadMagnetEmailForm';
import LoadingSpinner from './LoadingSpinner';
import { submitLead } from '../utils/leadSubmitter';

const FintechComparator = lazy(() => import('./fintech/FintechComparator'));

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

  // Récupérer l'endettement depuis le JSON complet
  const completeData = scpiCompleteJson.Sheet1.find(
    (scpi: any) => createSlugFromName(scpi['Nom SCPI']) === landingSlug
  );
  const endettement = completeData ? completeData['Endettement (%)'] : null;

  const [activeTab, setActiveTab] = useState<'performance' | 'frais'>('performance');
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    commentaire: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleTabChange = (tabKey: 'performance' | 'frais') => {
    setActiveTab(tabKey);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  // Charger le script Calendly
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup: retirer le script quand le composant est démonté
      const existingScript = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  const openCalendly = () => {
    // Récupérer les paramètres UTM/gclid depuis sessionStorage
    const utmSource = sessionStorage.getItem('utm_source');
    const utmMedium = sessionStorage.getItem('utm_medium');
    const utmCampaign = sessionStorage.getItem('utm_campaign');
    const gclid = sessionStorage.getItem('gclid');

    // Construire les options Calendly avec les paramètres UTM
    const calendlyOptions: any = {
      url: CALENDLY_URL
    };

    // Ajouter les paramètres UTM si présents
    if (utmSource || utmMedium || utmCampaign) {
      calendlyOptions.utm = {
        utmSource: utmSource || undefined,
        utmMedium: utmMedium || undefined,
        utmCampaign: utmCampaign || undefined,
        utmContent: gclid || undefined
      };
      console.log('📅 Ouverture Calendly avec paramètres UTM:', calendlyOptions.utm);
    }

    if (window.Calendly) {
      window.Calendly.initPopupWidget(calendlyOptions);
    } else {
      // Fallback: construire l'URL avec les paramètres
      let calendlyUrl = CALENDLY_URL;
      const params = [];
      if (utmSource) params.push(`utm_source=${utmSource}`);
      if (utmMedium) params.push(`utm_medium=${utmMedium}`);
      if (utmCampaign) params.push(`utm_campaign=${utmCampaign}`);
      if (gclid) params.push(`utm_content=${gclid}`);
      if (params.length > 0) {
        calendlyUrl += '?' + params.join('&');
      }
      window.open(calendlyUrl, '_blank');
    }
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
  const getExpertVerdict = () => {
    const pros: string[] = [];
    const cons: string[] = [];
    let conclusion = '';

    // 1. TOUJOURS ajouter la décote en premier si elle existe (PRIORITÉ ABSOLUE)
    const decote = parseFloat(landingData.decote);
    if (decote < 0) {
      const decotePositive = Math.abs(decote);
      pros.push(`Décote de ${decotePositive.toFixed(2)}% : Opportunité d'achat ${decotePositive.toFixed(0)}% moins cher que le prix de souscription.`);
    }

    // Utiliser les avantages réels de la landing page (déjà personnalisés)
    if (landingData.avantages && landingData.avantages.length > 0) {
      landingData.avantages.forEach(avantage => {
        pros.push(avantage);
      });
    }

    // Si pas assez d'avantages, ajouter des points basés sur les données réelles
    // Ordre de priorité strict : capitalisation > TOF > endettement > pays > secteurs > versement
    if (pros.length < 4) {

      // Capitalisation >100M
      const capValue = parseFloat(landingData.capitalisation.replace(/[^0-9.]/g, ''));
      if (capValue >= 100 && pros.length < 4) {
        pros.push(`Capitalisation solide de ${landingData.capitalisation} : Taille critique atteinte, gage de liquidité et de diversification.`);
      }

      // TOF ≥90%
      const tof = parseFloat(landingData.tof);
      if (tof >= 90 && pros.length < 4) {
        pros.push(`Taux d'occupation financier de ${landingData.tof} : Patrimoine pleinement valorisé et productif.`);
      }

      // Endettement ≤30%
      const endettement = parseFloat(landingData.endettement);
      if (endettement <= 30 && pros.length < 4) {
        if (endettement === 0) {
          pros.push("Zéro endettement : Patrimoine détenu en propre, aucun risque lié à l'effet de levier.");
        } else {
          pros.push(`Endettement maîtrisé à ${landingData.endettement} : Levier financier modéré pour optimiser le rendement.`);
        }
      }

      // Diversification ≥2 pays
      const paysCount = Object.keys(landingData.geographie).length;
      if (paysCount >= 2 && pros.length < 4) {
        const principalPays = Object.keys(landingData.geographie)[0];
        pros.push(`Diversification sur ${paysCount} pays : Exposition internationale avec ${principalPays} comme ancre.`);
      }

      // ≥2 secteurs
      const secteursCount = Object.keys(landingData.secteurs).length;
      if (secteursCount >= 2 && pros.length < 4) {
        const principalSecteur = Object.keys(landingData.secteurs)[0];
        pros.push(`${secteursCount} secteurs d'activité : Mix équilibré dominé par ${principalSecteur}.`);
      }

      // Versement mensuel
      if (landingData.frequence_versement === "Mensuel" && pros.length < 4) {
        pros.push("Versements mensuels : Flux de revenus réguliers et prévisibles pour un complément de revenu optimal.");
      }
    }

    // Utiliser les points d'attention réels (déjà personnalisés) mais FILTRER les frais de souscription
    if (landingData.points_attention && landingData.points_attention.length > 0) {
      landingData.points_attention.forEach(point => {
        // Exclure les points mentionnant les frais de souscription
        if (!point.toLowerCase().includes('frais de souscription')) {
          cons.push(point);
        }
      });
    }

    // Conclusion personnalisée basée sur les données réelles
    const anneeCreation = landingData.annee_creation;
    const age = new Date().getFullYear() - anneeCreation;
    const rendement = parseFloat(landingData.rendement);
    const frais = parseFloat(landingData.frais_souscription);

    if (rendement >= 8 && landingData.label_isr) {
      conclusion = `En conclusion, notre verdict est très positif. ${landingData.nom} combine un rendement exceptionnel de ${landingData.rendement} avec un engagement ISR fort. ${age < 3 ? 'Malgré son lancement récent, elle affiche déjà des performances remarquables.' : 'Son track record démontre une gestion solide.'} Idéale pour les investisseurs cherchant performance et impact.`;
    } else if (rendement >= 6) {
      conclusion = `En conclusion, ${landingData.nom} présente un profil attractif avec un rendement de ${landingData.rendement}, supérieur à la moyenne du marché. Gérée par ${landingData.societe_gestion}, elle offre une diversification ${Object.keys(landingData.geographie).length > 1 ? 'internationale' : 'solide'}. Recommandée pour un portefeuille équilibré.`;
    } else if (rendement >= 4) {
      conclusion = `En conclusion, ${landingData.nom} s'inscrit dans une stratégie de rendement régulier avec ${landingData.rendement}. Sa capitalisation de ${landingData.capitalisation} et sa gestion par ${landingData.societe_gestion} en font un choix sécurisé pour une diversification patrimoniale long terme.`;
    } else {
      conclusion = `En conclusion, ${landingData.nom} privilégie la stabilité et la préservation du capital. Adaptée aux investisseurs prudents recherchant un complément de revenu stable dans la durée.`;
    }

    return {
      pros: pros.slice(0, 4),
      cons: cons.slice(0, 3),
      conclusion
    };
  };

  // Verdict éditorial uniquement : pour les fiches générées (SCPI sans contenu
  // rédigé), on masque le bloc afin de ne jamais publier d'argument non sourcé.
  const verdict = isEditorial ? getExpertVerdict() : null;

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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {realScpiData && (
                    <>
                      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 text-center">
                        <div className="text-3xl sm:text-4xl font-bold text-yellow-400">{formatPercentage(realScpiData.yield)}</div>
                        <div className={`text-sm text-${colors.secondary}-100 mt-2`}>Taux de distribution 2024</div>
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

      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-4">
            {landingData.nom} : Notre Analyse sous le Microscope
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            Données complètes et transparentes pour vous aider à prendre une décision éclairée
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className={`bg-gradient-to-br from-${colors.secondary}-50 to-${colors.accent}-50 rounded-xl p-8 border-2 border-${colors.secondary}-200`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-12 h-12 bg-${colors.secondary}-600 rounded-lg flex items-center justify-center`}>
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Répartition géographique</h3>
              </div>
              {Object.keys(landingData.geographie).length === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-gray-500 text-center px-4">
                  Donnée à vérifier — répartition géographique non disponible pour cette SCPI.
                </div>
              ) : (
              <>
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
                  width={300}
                  height={300}
                  showLabels={true}
                />
              </div>
              <div className="mt-6 space-y-2">
                {Object.entries(landingData.geographie).map(([pays, pct], index) => (
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
              </>
              )}
            </div>

            <div className={`bg-gradient-to-br from-${colors.accent}-50 to-${colors.secondary}-50 rounded-xl p-8 border-2 border-${colors.accent}-200`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-12 h-12 bg-${colors.accent}-600 rounded-lg flex items-center justify-center`}>
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Répartition sectorielle</h3>
              </div>
              {Object.keys(landingData.secteurs).length === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-gray-500 text-center px-4">
                  Donnée à vérifier — répartition sectorielle non disponible pour cette SCPI.
                </div>
              ) : (
              <>
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
                  width={300}
                  height={300}
                  showLabels={true}
                />
              </div>
              <div className="mt-6 space-y-2">
                {Object.entries(landingData.secteurs).map(([secteur, pct], index) => (
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
              </>
              )}
            </div>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="flex gap-2 mb-6 border-b-2 border-gray-200">
              <button
                onClick={() => handleTabChange('performance')}
                className={`px-6 py-3 font-semibold transition-all ${
                  activeTab === 'performance'
                    ? `text-${colors.secondary}-600 border-b-2 border-${colors.secondary}-600`
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Performance & Historique
              </button>
              <button
                onClick={() => handleTabChange('frais')}
                className={`px-6 py-3 font-semibold transition-all ${
                  activeTab === 'frais'
                    ? `text-${colors.secondary}-600 border-b-2 border-${colors.secondary}-600`
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Frais & Conditions
              </button>
            </div>

            {activeTab === 'performance' && realScpiData && (
              <div className="bg-gray-50 rounded-xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Chiffres clés de performance</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-6 shadow">
                    <div className="text-sm text-gray-600 mb-1">Taux de distribution 2024</div>
                    <div className={`text-3xl font-bold text-${colors.secondary}-600`}>{formatPercentage(realScpiData.yield)}</div>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow">
                    <div className="text-sm text-gray-600 mb-1">TOF (Taux d'Occupation Financier)</div>
                    <div className={`text-3xl font-bold text-${colors.secondary}-600`}>{formatPercentage(realScpiData.tof)}</div>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow">
                    <div className="text-sm text-gray-600 mb-1">Capitalisation</div>
                    <div className={`text-3xl font-bold text-${colors.secondary}-600`}>{formatCurrency(realScpiData.capitalization)}</div>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow">
                    <div className="text-sm text-gray-600 mb-1">Endettement</div>
                    <div className={`text-3xl font-bold text-${colors.secondary}-600`}>
                      {endettement !== null ? formatPercentage(endettement) : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow">
                    <div className="text-sm text-gray-600 mb-1">Décote/Surcote</div>
                    {(() => {
                      // Source unique : résolveur partagé (recalcul prix affiché vs VR affichée).
                      const displayedDiscount = resolveDisplayedDiscount(realScpiData).value;
                      if (displayedDiscount == null) {
                        return <div className="text-3xl font-bold text-gray-500">À vérifier</div>;
                      }
                      return (
                        <div className={`text-3xl font-bold ${displayedDiscount <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {displayedDiscount > 0 ? '+' : ''}{formatPercentage(displayedDiscount)}
                        </div>
                      );
                    })()}
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow">
                    <div className="text-sm text-gray-600 mb-1">Année de création</div>
                    <div className={`text-3xl font-bold text-${colors.secondary}-600`}>{realScpiData.creation || landingData.annee_creation}</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'frais' && realScpiData && (
              <div className="bg-gray-50 rounded-xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Structure des frais et conditions</h3>
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-6 shadow flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-gray-900">Frais de souscription</div>
                      <div className="text-sm text-gray-600">Frais d'entrée TTC</div>
                    </div>
                    <div className={`text-2xl font-bold text-${colors.secondary}-600`}>
                      {landingData.frais_souscription}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-gray-900">Prix de la part</div>
                      <div className="text-sm text-gray-600">Prix de souscription actuel</div>
                    </div>
                    <div className={`text-2xl font-bold text-${colors.secondary}-600`}>
                      {formatCurrency(realScpiData.price)}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-gray-900">Minimum de souscription</div>
                      <div className="text-sm text-gray-600">Ticket d'entrée minimum</div>
                    </div>
                    <div className={`text-2xl font-bold text-${colors.secondary}-600`}>
                      {landingData.prix_souscription}
                    </div>
                  </div>
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                      <Eye className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <div className="font-semibold text-gray-900 mb-2">Label ISR</div>
                        <div className="text-gray-700">
                          {realScpiData.isr ? (
                            <span className="text-green-600 font-semibold">✓ Labellisé ISR - Investissement Socialement Responsable</span>
                          ) : (
                            <span className="text-gray-600">Non labellisé ISR</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simulateur de Revenus */}
      {landingData.simulator && (
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <ThematicSimulator
              defaultInvestment={landingData.simulator.defaultInvestment}
              defaultYield={landingData.simulator.defaultYield}
              title={landingData.simulator.title}
              subtitle={landingData.simulator.subtitle}
              theme={landingData.simulator.theme}
            />
          </div>
        </div>
      )}

      {/* Bloc Verdict de l'Expert — éditorial uniquement */}
      {verdict && (
      <div className="bg-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Le Verdict MaximusSCPI sur {landingData.nom}
            </h2>
            <p className="text-gray-600 text-sm">
              Notre analyse transparente et objective
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Points forts */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <ThumbsUp className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-bold text-gray-900">On aime</h3>
              </div>
              <ul className="space-y-2">
                {verdict.pros.map((pro, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Points de vigilance */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-bold text-gray-900">Points de vigilance</h3>
              </div>
              <ul className="space-y-2">
                {verdict.cons.map((con, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Conclusion de l'expert */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
            <div className="flex items-start gap-3 mb-3">
              <BadgeCheck className={`w-6 h-6 text-${colors.secondary}-600 flex-shrink-0`} />
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Notre Conclusion</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {verdict.conclusion}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-12">
            Ce que nos investisseurs disent de notre accompagnement
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  MD
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-lg">Marc D.</div>
                  <div className="text-gray-600 text-sm">Directeur Commercial</div>
                  <div className="flex items-center gap-1 mt-1">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                "L'équipe Maximus m'a guidé avec une grande clarté. Leur analyse m'a permis de choisir la bonne SCPI pour mon projet, sans stress et en toute confiance."
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  SL
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-lg">Sophie L.</div>
                  <div className="text-gray-600 text-sm">Ingénieure</div>
                  <div className="flex items-center gap-1 mt-1">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                "Un accompagnement vraiment personnalisé. Eric a pris le temps de comprendre mes objectifs et m'a proposé une solution parfaitement adaptée. Je recommande vivement !"
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="p-6 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg max-w-4xl mx-auto">
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700 leading-relaxed">
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

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-4">
            Une Question ? Réservez un RDV Téléphonique avec votre conseiller dédié
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            Un accompagnement humain et personnalisé pour répondre à toutes vos questions
          </p>

          <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            <div className="grid lg:grid-cols-5 gap-8 items-start">
              {/* Section Eric - 2 colonnes */}
              <div className="lg:col-span-2 text-center lg:text-left">
                <div className="mb-6 flex justify-center lg:justify-start">
                  <div className={`border-4 border-${colors.secondary}-600 rounded-full shadow-xl`}>
                    <EricAvatar size={70} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Eric Bellaiche</h3>
                <p className={`text-${colors.secondary}-600 font-semibold mb-4`}>Votre Expert MaximusSCPI</p>
                <p className="text-gray-700 leading-relaxed mb-6 text-sm">
                  "Mon rôle est de vous aider à créer un portefeuille de SCPI performant et adapté à vos objectifs. Je vous rappelle au créneau de votre choix."
                </p>
                <div className="flex flex-col gap-2 mb-6">
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>CIF enregistré ORIAS n°13001580</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>15 ans d'expérience</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>1800+ clients accompagnés</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>15 minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>100% Gratuit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Sans engagement</span>
                  </div>
                </div>
              </div>

              {/* Section Calendly - 3 colonnes */}
              <div className="lg:col-span-3">
                <h4 className="text-xl font-bold text-gray-900 mb-4 text-center">
                  Réserver mon RDV Téléphonique Gratuit
                </h4>
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-8">
                  <div className="text-center space-y-6">
                    <Calendar className={`w-24 h-24 text-${colors.secondary}-600 mx-auto`} />
                    <p className="text-gray-700 text-lg leading-relaxed">
                      Choisissez le créneau qui vous convient le mieux. Eric vous rappelle au numéro de votre choix.
                    </p>
                    <a
                      href={CALENDLY_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`bg-${colors.secondary}-600 hover:bg-${colors.secondary}-700 text-white font-bold px-8 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-3 shadow-xl text-lg`}
                    >
                      <Calendar className="w-6 h-6" />
                      Réserver mon appel téléphonique
                    </a>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                      <div className="bg-white rounded-lg p-4 shadow-md">
                        <Clock className={`w-8 h-8 text-${colors.secondary}-600 mx-auto mb-2`} />
                        <p className="text-sm font-semibold text-gray-900">Durée</p>
                        <p className="text-xs text-gray-600">15 minutes</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-md">
                        <Shield className={`w-8 h-8 text-${colors.secondary}-600 mx-auto mb-2`} />
                        <p className="text-sm font-semibold text-gray-900">Coût</p>
                        <p className="text-xs text-gray-600">100% Gratuit</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-md">
                        <CheckCircle className={`w-8 h-8 text-${colors.secondary}-600 mx-auto mb-2`} />
                        <p className="text-sm font-semibold text-gray-900">Engagement</p>
                        <p className="text-xs text-gray-600">Aucun</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`bg-gradient-to-r ${colors.primary} py-16`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Prêt à faire le bon choix pour votre épargne ?
          </h2>
          <p className={`text-xl text-${colors.secondary}-100 mb-8`}>
            Profitez d'un rendement de {landingData.rendement} avec un accompagnement expert personnalisé
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

          <div className={`mt-8 flex items-center justify-center gap-8 text-${colors.secondary}-100`}>
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

      {/* Section Comparateur Fintech */}
      <div className="bg-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<LoadingSpinner />}>
            <FintechComparator onCloseAnalysis={onNavigateHome} />
          </Suspense>
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
