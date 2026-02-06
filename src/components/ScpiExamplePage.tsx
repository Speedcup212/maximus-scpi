import React, { useState } from 'react';
import {
  TrendingUp, Shield, CheckCircle, Phone, Mail, User, Euro,
  ArrowRight, Award, Star, Building2, Globe, BarChart3, Leaf,
  Target, Calculator, MessageCircle, Clock, FileText, Lock, Eye, BadgeCheck
} from 'lucide-react';
import Logo from './Logo';
import Header from './Header';

interface ScpiExamplePageProps {
  onNavigateHome?: () => void;
  onNavigateToFaq?: () => void;
  onNavigateToAbout?: () => void;
  onNavigateToUnderstanding?: () => void;
  onNavigateToScpi?: (slug: string) => void;
  onContactClick?: () => void;
}

const ScpiExamplePage: React.FC<ScpiExamplePageProps> = ({
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

  // Données SCPI Comète
  const scpiData = {
    nom: "Comète",
    societe_gestion: "Alderan",
    annee_creation: 2023,
    label_isr: true,
    capitalisation: "519,6 M€",
    prix_souscription: "250 €",
    rendement: "9,00%",
    tof: "99,1%",
    decote: "-3,27%",
    endettement: "0%",
    geographie: {
      "Royaume-Uni": 46.5,
      "Espagne": 15.4,
      "Italie": 12.4,
      "Pays-Bas": 10.3,
      "Canada": 6.6,
      "Pologne": 5.2,
      "Irlande": 3.6
    },
    secteurs: {
      "Commerce": 27.6,
      "Logistique": 23.9,
      "Hôtellerie": 16.0,
      "Bureau": 13.7,
      "Mixte": 10.9,
      "Loisirs": 5.8,
      "Éducation": 2.1
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Import Supabase dynamiquement
      const { supabase } = await import('../supabaseClient');

      // Récupérer les paramètres UTM et GCLID depuis l'URL
      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = urlParams.get('utm_source') || null;
      const utmMedium = urlParams.get('utm_medium') || null;
      const utmCampaign = urlParams.get('utm_campaign') || null;
      const gclid = urlParams.get('gclid') || null;

      // Insérer dans la nouvelle table dédiée Google Ads Comète
      const { error } = await supabase
        .from('google_ads_comete_leads')
        .insert([{
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          telephone: formData.telephone,
          montant_investissement: formData.montant,
          commentaire: formData.commentaire || null,
          source: 'Google Ads - SCPI Comète',
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign,
          gclid: gclid,
          statut: 'nouveau'
        }]);

      if (error) {
        console.error('Erreur Supabase:', error);
        throw error;
      }

      setSubmitStatus('success');

      // Tracking Google Ads conversion
      if (window.gtag) {
        window.gtag('event', 'conversion', {
          'send_to': 'AW-CONVERSION_ID/SCPI_COMETE',
          'value': parseFloat(formData.montant.replace(/[^0-9.-]+/g,'')) || 1.0,
          'currency': 'EUR',
          'transaction_id': ''
        });
      }

      // Envoyer aussi à Google Analytics
      if (window.gtag) {
        window.gtag('event', 'generate_lead', {
          'event_category': 'SCPI Comète',
          'event_label': 'Formulaire Google Ads',
          'value': parseFloat(formData.montant.replace(/[^0-9.-]+/g,'')) || 0
        });
      }

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
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left - SCPI Info */}
            <div className="flex flex-col h-full">
              <div className="inline-flex items-center gap-2 bg-green-400 text-gray-900 px-4 py-2 rounded-full text-sm font-semibold mb-4 self-start">
                <Leaf className="w-4 h-4" />
                Label ISR - Investissement Responsable
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                SCPI Comète
                <span className="block text-yellow-300">Rendement exceptionnel de {scpiData.rendement}</span>
              </h1>

              <p className="text-xl text-purple-100 mb-6">
                Investissez dans l'immobilier européen diversifié avec un rendement parmi les plus élevés du marché
              </p>

              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-4 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-yellow-300">{scpiData.rendement}</div>
                  <div className="text-xs sm:text-sm text-purple-100">Taux de distribution</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-4 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-yellow-300">{scpiData.tof}</div>
                  <div className="text-xs sm:text-sm text-purple-100">Taux d'occupation</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-4 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-yellow-300">{scpiData.prix_souscription}</div>
                  <div className="text-xs sm:text-sm text-purple-100">Prix de part</div>
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-purple-50">Diversification internationale (7 pays)</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-purple-50">Portefeuille multi-sectoriel équilibré</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-purple-50">Gestion par Alderan, expert reconnu</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-purple-50">Label ISR - Investissement durable</span>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-4">
                  <Shield className="w-8 h-8 text-green-400 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-white mb-2">Pourquoi choisir MaximusSCPI ?</h3>
                    <ul className="space-y-2 text-sm text-purple-100">
                      <li className="flex items-start gap-2">
                        <Star className="w-4 h-4 text-yellow-300 flex-shrink-0 mt-0.5" />
                        <span>Conseil indépendant et personnalisé</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>Réponse sous 24h par un expert dédié</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                        <span>Accompagnement gratuit de A à Z</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Award className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                        <span>Accès aux meilleures SCPI du marché</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-center">
                  <Building2 className="w-6 h-6 text-yellow-300 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">+500</div>
                  <div className="text-xs text-purple-100">Clients accompagnés</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-center">
                  <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">15+</div>
                  <div className="text-xs text-purple-100">Années d'expertise</div>
                </div>
              </div>

              {/* Garanties et Sécurité */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-green-400" />
                  Garanties et Sécurité
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <BadgeCheck className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-white">Certifié AMF</div>
                      <div className="text-xs text-purple-100">Conseiller agréé</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Eye className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-white">Transparent</div>
                      <div className="text-xs text-purple-100">Sans frais cachés</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-white">Indépendant</div>
                      <div className="text-xs text-purple-100">Conseil objectif</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Lock className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-white">Sécurisé</div>
                      <div className="text-xs text-purple-100">Données protégées</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Process en 3 étapes */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-400" />
                  Votre parcours en 3 étapes
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Analyse gratuite</div>
                      <div className="text-xs text-purple-100">Étude de votre profil et objectifs</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Sélection personnalisée</div>
                      <div className="text-xs text-purple-100">Les meilleures SCPI pour vous</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Accompagnement complet</div>
                      <div className="text-xs text-purple-100">Jusqu'à la souscription et au-delà</div>
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
                    alt="Eric Bellaiche"
                    className="w-20 h-20 rounded-full mx-auto shadow-lg object-cover"
                  />
                </div>
                <p className="text-sm font-semibold text-purple-600 mb-2">
                  Eric Bellaiche - Expert MaximusSCPI
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
                    Eric vous contacte sous 24h pour échanger sur la SCPI Comète et répondre à vos questions.
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
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
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
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
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
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
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
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
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
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white text-gray-900"
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message (optionnel)
                    </label>
                    <textarea
                      name="commentaire"
                      value={formData.commentaire}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-900"
                      placeholder="Questions ou précisions..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
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
                      className="block w-full bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-bold py-4 rounded-lg transition-all duration-300 transform hover:scale-105"
                    >
                      Réserver un créneau directement
                    </a>
                  </div>

                  <p className="text-xs text-gray-500 text-center">
                    🔒 Vos données sont protégées et ne seront jamais partagées
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
                      Source des données : Alderan • Arrêté au 31/12/2024
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

      {/* Section Expert - Eric Bellaiche */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-xl p-6 md:p-8 shadow-lg">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-cyan-400 to-blue-600 rounded-full blur-lg opacity-50"></div>
                    <img
                      src="/cercle Eric Bellaiche bleu.svg"
                      alt="Eric Bellaiche - Conseiller en Gestion de Patrimoine"
                      className="relative w-20 h-20 md:w-24 md:h-24 rounded-full object-cover shadow-2xl"
                      loading="lazy"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-2 shadow-lg">
                      <Shield className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                      Éric Bellaiche
                    </h3>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
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
      </div>

      {/* SCPI Details */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir la SCPI Comète ?
            </h2>
            <p className="text-xl text-gray-600">
              Une SCPI récente et performante avec une stratégie européenne diversifiée
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Répartition géographique */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Répartition géographique</h3>
              </div>
              <div className="space-y-3">
                {Object.entries(scpiData.geographie).map(([pays, pct]) => (
                  <div key={pays}>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-gray-700">{pays}</span>
                      <span className="font-bold text-blue-600">{pct}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Répartition sectorielle */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 border-2 border-purple-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Répartition sectorielle</h3>
              </div>
              <div className="space-y-3">
                {Object.entries(scpiData.secteurs).map(([secteur, pct]) => (
                  <div key={secteur}>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-gray-700">{secteur}</span>
                      <span className="font-bold text-purple-600">{pct}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Rendement élevé</h3>
              <p className="text-gray-600">
                {scpiData.rendement} de taux de distribution, parmi les plus performantes du marché
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Globe className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Europe diversifiée</h3>
              <p className="text-gray-600">
                Investissement dans 7 pays pour limiter les risques
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Building2 className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Multi-sectoriel</h3>
              <p className="text-gray-600">
                7 secteurs d'activité pour une diversification optimale
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200 text-center">
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

      {/* Informations pratiques */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
            Informations pratiques
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <FileText className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Caractéristiques</h3>
              <ul className="space-y-2 text-gray-700">
                <li><strong>Société de gestion :</strong> {scpiData.societe_gestion}</li>
                <li><strong>Année de création :</strong> {scpiData.annee_creation}</li>
                <li><strong>Capitalisation :</strong> {scpiData.capitalisation}</li>
                <li><strong>Prix de souscription :</strong> {scpiData.prix_souscription}</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <BarChart3 className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Performance</h3>
              <ul className="space-y-2 text-gray-700">
                <li><strong>Taux de distribution :</strong> {scpiData.rendement}</li>
                <li><strong>Taux d'occupation :</strong> {scpiData.tof}</li>
                <li><strong>Décote/Surcote :</strong> <span className="text-red-600">{scpiData.decote}</span></li>
                <li><strong>Endettement :</strong> {scpiData.endettement}</li>
                <li><strong>Label ISR :</strong> Oui ✓</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <Target className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Profil investisseur</h3>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Recherche de rendement élevé</li>
                <li>✓ Diversification européenne</li>
                <li>✓ Investissement durable (ISR)</li>
                <li>✓ Horizon long terme (8-10 ans)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Final */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Prêt à investir dans la SCPI Comète ?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Profitez d'un rendement de {scpiData.rendement} avec un accompagnement expert personnalisé
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
            Prendre RDV avec MaximusSCPI
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="mt-8 flex items-center justify-center gap-8 text-purple-100">
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

      {/* Témoignages clients */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-xl text-gray-600">
              Plus de 200 investisseurs satisfaits ont investi en SCPI avec notre accompagnement
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  MC
                </div>
                <div>
                  <div className="font-bold text-gray-900">Marie C.</div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-700 italic mb-3">
                "Eric m'a parfaitement conseillé pour diversifier mon patrimoine. J'ai investi dans la SCPI Comète et je suis ravie du rendement. Un vrai professionnel à l'écoute !"
              </p>
              <p className="text-sm text-gray-500">Investissement : 50 000€ | Janvier 2024</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  JL
                </div>
                <div>
                  <div className="font-bold text-gray-900">Jean-Luc D.</div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-700 italic mb-3">
                "Très satisfait de l'accompagnement personnalisé. Eric a pris le temps de m'expliquer tous les détails de la SCPI Comète. Rendement au rendez-vous !"
              </p>
              <p className="text-sm text-gray-500">Investissement : 75 000€ | Mars 2024</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  SB
                </div>
                <div>
                  <div className="font-bold text-gray-900">Sophie B.</div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-700 italic mb-3">
                "Première expérience en SCPI et je ne regrette pas ! Eric a été très pédagogue et m'a rassuré à chaque étape. Je recommande vivement !"
              </p>
              <p className="text-sm text-gray-500">Investissement : 30 000€ | Février 2024</p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-4 sm:gap-6 lg:gap-8 bg-white rounded-xl px-4 sm:px-6 lg:px-8 py-3 shadow-lg">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">1800+</div>
                <div className="text-xs sm:text-sm text-gray-600">Clients satisfaits</div>
              </div>
              <div className="h-10 sm:h-12 w-px bg-gray-300"></div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">4,9/5</div>
                <div className="text-xs sm:text-sm text-gray-600">Note moyenne</div>
              </div>
              <div className="h-10 sm:h-12 w-px bg-gray-300"></div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">15 ans</div>
                <div className="text-xs sm:text-sm text-gray-600">D'expérience</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ spécifique SCPI Comète */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
            Questions fréquentes sur la SCPI Comète
          </h2>

          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-blue-600" />
                Quel est le montant minimum pour investir dans la SCPI Comète ?
              </h3>
              <p className="text-gray-700">
                Le prix d'une part de la SCPI Comète est de 250€. Vous pouvez commencer avec une seule part, mais nous recommandons un investissement minimum de 5 000€ à 10 000€ pour une diversification efficace.
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-blue-600" />
                Quand vais-je recevoir mes premiers revenus ?
              </h3>
              <p className="text-gray-700">
                Les revenus de la SCPI Comète sont versés trimestriellement. Vous recevrez votre premier versement le trimestre suivant votre investissement. Le taux de distribution 2025 est de 9,00% par an.
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-blue-600" />
                La SCPI Comète est-elle risquée ?
              </h3>
              <p className="text-gray-700">
                Comme tout investissement immobilier, il existe des risques (baisse des loyers, vacance locative). Cependant, Comète est diversifiée sur 7 pays et 7 secteurs d'activité, ce qui limite les risques. Le taux d'occupation actuel est de 99,1%.
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-blue-600" />
                Puis-je revendre mes parts facilement ?
              </h3>
              <p className="text-gray-700">
                Les SCPI sont des placements de long terme (8-10 ans recommandés). Vous pouvez revendre vos parts sur le marché secondaire, mais les délais peuvent varier. La SCPI Comète, étant récente (2023), a un marché secondaire actif.
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-blue-600" />
                Quels sont les frais à prévoir ?
              </h3>
              <p className="text-gray-700">
                Les frais de souscription sont de 10% HT du montant investi. Les frais de gestion annuels sont de 10% HT des loyers perçus. Ces frais sont dans la moyenne du marché et déjà inclus dans le taux de distribution affiché de 9,00%.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-6">D'autres questions ? Parlons-en ensemble !</p>
            <button
              onClick={() => {
                const form = document.querySelector('form');
                if (form) {
                  form.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <Phone className="w-5 h-5" />
              Demander un conseil personnalisé
            </button>
          </div>
        </div>
      </div>

      {/* Section Risques et Disclaimer */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-yellow-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold mb-4">Informations importantes</h3>
              <div className="space-y-3 text-gray-300 text-sm">
                <p>
                  <strong>Risques :</strong> L'investissement en SCPI présente des risques de perte en capital et de liquidité. Les performances passées ne préjugent pas des performances futures. Le rendement n'est pas garanti et peut varier à la hausse comme à la baisse.
                </p>
                <p>
                  <strong>Durée de placement recommandée :</strong> 8 à 10 ans minimum. Les SCPI sont des placements de long terme.
                </p>
                <p>
                  <strong>Frais :</strong> Frais de souscription de 10% HT. Frais de gestion annuels de 10% HT sur les loyers. Consultez la note d'information complète avant tout investissement.
                </p>
                <p>
                  <strong>Conseiller :</strong> Eric Bellaiche - Conseiller en Investissements Financiers enregistré à l'ORIAS sous le numéro 13001580. Membre de la CNCEF Patrimoine sous le numéro D016571.
                </p>
                <p className="text-xs">
                  Les informations présentées sur cette page sont fournies à titre indicatif et ne constituent pas un conseil en investissement personnalisé. Tout investissement doit faire l'objet d'une analyse approfondie de votre situation personnelle.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 items-center justify-items-center text-center">
            <div>
              <Shield className="w-12 h-12 text-blue-600 mx-auto mb-2" />
              <p className="font-semibold text-gray-900">Expert certifié ORIAS</p>
              <p className="text-sm text-gray-500">N° 13001580</p>
            </div>
            <div>
              <Award className="w-12 h-12 text-blue-600 mx-auto mb-2" />
              <p className="font-semibold text-gray-900">Membre CNCEF</p>
              <p className="text-sm text-gray-500">N° D016571</p>
            </div>
            <div>
              <Star className="w-12 h-12 text-yellow-400 mx-auto mb-2 fill-yellow-400" />
              <p className="font-semibold text-gray-900">Note 4,9/5</p>
              <p className="text-sm text-gray-500">+200 avis clients</p>
            </div>
            <div>
              <CheckCircle className="w-12 h-12 text-blue-600 mx-auto mb-2" />
              <p className="font-semibold text-gray-900">Accompagnement</p>
              <p className="text-sm text-gray-500">Sur-mesure</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer avec mentions légales */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-800 rounded-xl px-8 py-6 inline-flex">
              <Logo className="h-20 w-auto" isDarkMode={true} iconVariant="gladiator" />
            </div>
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

export default ScpiExamplePage;
