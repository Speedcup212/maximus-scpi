import React from 'react';
import { Target, PiggyBank, TrendingUp, Shield, Heart, Home, Briefcase, Users } from 'lucide-react';
import SEOHead from './SEOHead';
import SemanticLinks from './SemanticLinks';
import { getSemanticLinks } from '../data/semanticCocon';
import { generateFAQSchema, generateBreadcrumbSchema } from '../utils/seoOptimizer';

const ScpiObjectifsHubPage: React.FC = () => {
  const objectifs = [
    {
      id: 'retraite',
      name: 'Préparer sa Retraite',
      slug: '/preparer-retraite-scpi',
      icon: PiggyBank,
      color: 'blue',
      description: 'Constituer un complément de revenus pérennes pour la retraite',
      horizon: 'Long terme (15-30 ans)',
      profil: 'Équilibré',
      rendementCible: '5-6%',
      highlights: [
        'Capitalisation long terme sans fiscalité annuelle (AV)',
        'Revenus réguliers mensuels ou trimestriels',
        'Diversification géographique Europe',
        'Transmission patrimoine préparée'
      ],
      scpiRecommandees: [
        { name: 'Alderan Comète', type: 'Europe diversifiée', rendement: '9.0%' },
        { name: 'Perial PFO2', type: 'Bureaux Europe', rendement: '5.9%' },
        { name: 'Amundi Deloitte', type: 'Bureaux Prime', rendement: '5.8%' }
      ]
    },
    {
      id: 'revenu',
      name: 'Générer un Revenu Complémentaire',
      slug: '/revenu-complementaire-scpi',
      icon: TrendingUp,
      color: 'green',
      description: 'Percevoir des revenus fonciers immédiats et réguliers',
      horizon: 'Moyen terme (5-15 ans)',
      profil: 'Dynamique',
      rendementCible: '6-8%',
      highlights: [
        'Versements trimestriels/mensuels dès l\'investissement',
        'Fiscalité revenus fonciers optimisée',
        'SCPI à fort rendement distribution',
        'Possibilité effet de levier crédit'
      ],
      scpiRecommandees: [
        { name: 'Novaxia Néo', type: 'Recyclage urbain', rendement: '8.2%' },
        { name: 'Iroko Zen', type: 'Logistique Europe', rendement: '7.1%' },
        { name: 'Greenman Retail', type: 'Commerces', rendement: '6.2%' }
      ]
    },
    {
      id: 'fiscalite',
      name: 'Défiscaliser & Optimiser',
      slug: '/scpi-fiscales',
      icon: Shield,
      color: 'purple',
      description: 'Réduire son imposition via les SCPI fiscales (Pinel, Malraux, Déficit Foncier)',
      horizon: 'Moyen-Long terme (9-15 ans)',
      profil: 'Fiscalisé TMI 30-45%',
      rendementCible: '3-4% + Réduction IR',
      highlights: [
        'Réduction d\'impôt immédiate (Pinel 12-21%, Malraux 22-30%)',
        'Déficit foncier imputable sur revenus globaux',
        'Optimisation TMI élevée',
        'Engagement de conservation respecter'
      ],
      scpiRecommandees: [
        { name: 'Primonial REIM Déficit Foncier', type: 'Réhabilitation', rendement: '3.8%' },
        { name: 'Perial Patrimoine Pinel', type: 'Neuf Pinel', rendement: '3.5%' },
        { name: 'Sofidy Malraux', type: 'Monuments historiques', rendement: '3.2%' }
      ]
    },
    {
      id: 'diversification',
      name: 'Diversifier son Patrimoine',
      slug: '/meilleures-scpi-rendement',
      icon: Briefcase,
      color: 'indigo',
      description: 'Ajouter une classe d\'actifs immobilières décorrélée',
      horizon: 'Moyen-Long terme (8-20 ans)',
      profil: 'Équilibré-Prudent',
      rendementCible: '5-6%',
      highlights: [
        'Décorrélation vs actions/obligations',
        'Protection contre l\'inflation',
        'Accès immobilier professionnel',
        'Gestion déléguée sans contrainte'
      ],
      scpiRecommandees: [
        { name: 'La Française Europimmo', type: 'Bureaux Europe', rendement: '5.6%' },
        { name: 'Atland Voisin', type: 'Commerces France', rendement: '5.7%' },
        { name: 'Primonial REIM', type: 'Diversifié', rendement: '5.4%' }
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string; badge: string }> = {
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800',
        badge: 'bg-blue-600'
      },
      green: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        text: 'text-green-600 dark:text-green-400',
        border: 'border-green-200 dark:border-green-800',
        badge: 'bg-green-600'
      },
      purple: {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-800',
        badge: 'bg-purple-600'
      },
      indigo: {
        bg: 'bg-indigo-50 dark:bg-indigo-900/20',
        text: 'text-indigo-600 dark:text-indigo-400',
        border: 'border-indigo-200 dark:border-indigo-800',
        badge: 'bg-indigo-600'
      }
    };
    return colors[color] || colors.blue;
  };

  const faqQuestions = [
    {
      question: "Quelle SCPI choisir pour préparer ma retraite ?",
      answer: "Pour la retraite, privilégiez des SCPI diversifiées Europe à capital variable (Alderan Comète 9.0%, Perial PFO2 5.9%) avec horizon 15-30 ans. L'assurance-vie permet une fiscalité optimale en capitalisation. Visez un portefeuille mixte : 60% SCPI rendement, 40% SCPI stabilité (bureaux prime)."
    },
    {
      question: "Comment générer 500€ par mois avec des SCPI ?",
      answer: "Pour 500€/mois (6000€/an), avec un rendement moyen de 6%, investissez 100 000€ en SCPI. Répartition conseillée : 40% Novaxia Néo (8.2%), 30% Iroko Zen (7.1%), 30% Greenman Retail (6.2%). Cela génère environ 7000€ bruts/an avant fiscalité (revenus fonciers)."
    },
    {
      question: "Les SCPI fiscales sont-elles vraiment rentables ?",
      answer: "Oui si TMI ≥ 30%. Exemple : SCPI Pinel, réduction IR 12-21% (63000€ max) + rendement 3.5% = rendement net équivalent 5-6% selon TMI. SCPI Malraux : réduction 22-30% sur travaux (400 000€ max). Attention : engagement 9-15 ans obligatoire, liquidité réduite."
    },
    {
      question: "Peut-on combiner plusieurs objectifs SCPI ?",
      answer: "Oui, c'est recommandé. Exemple portefeuille 150 000€ multi-objectifs : 50 000€ SCPI retraite AV (Comète), 60 000€ SCPI revenu direct (Novaxia + Iroko), 40 000€ SCPI défiscalisation (Pinel). Cette diversification optimise rendement, fiscalité et liquidité selon vos besoins évolutifs."
    },
    {
      question: "Quelle allocation SCPI pour un profil prudent ?",
      answer: "Profil prudent : privilégiez sécurité et stabilité. Allocation recommandée : 50% SCPI Bureaux Europe prime (Amundi Deloitte, Perial PFO2), 30% SCPI Santé (faible volatilité), 20% SCPI Diversifiée France. Rendement cible 4.5-5.5%, TOF > 95%, gestionnaires Tier 1 (> 2 Mds€ encours)."
    }
  ];

  const faqSchema = generateFAQSchema(faqQuestions);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Accueil', url: 'https://www.maximusscpi.com' },
    { name: 'SCPI par Objectif', url: 'https://www.maximusscpi.com/scpi-objectifs' }
  ]);

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [faqSchema, breadcrumbSchema]
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-800">
      <SEOHead
        title="SCPI par Objectif : Retraite 9.0%, Revenu 6-8%, Défiscalisation 30% IR | Guide 2025"
        description="✓ SCPI selon objectifs ✓ Retraite: Comète 9.0% ✓ Revenu: Novaxia 8.2% ✓ Défiscalisation: Pinel 21% ✓ Diversification ✓ Stratégies sur-mesure → Conseiller ORIAS"
        keywords={['scpi retraite', 'scpi revenu complémentaire', 'scpi défiscalisation', 'scpi pinel', 'scpi objectifs patrimoniaux', 'stratégie scpi 2025', 'portefeuille scpi optimisé']}
        canonical="https://www.maximusscpi.com/scpi-objectifs"
        schemaData={combinedSchema}
      />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-teal-600 to-cyan-700 dark:from-teal-800 dark:to-cyan-900 text-white py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full mb-6">
              <Target className="w-5 h-5" />
              <span className="font-semibold">Approche Conseil Personnalisée</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight">
              SCPI par Objectif 2025 : Retraite, Revenu, Défiscalisation (Rendements 3% à 9.0%)
            </h1>
            <p className="text-xl sm:text-2xl mb-8 text-teal-100 max-w-4xl mx-auto">
              Sélection de SCPI adaptées à votre projet patrimonial et votre profil investisseur
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm sm:text-base">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
                <Users className="w-5 h-5" />
                <span>4 Objectifs Clés</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
                <TrendingUp className="w-5 h-5" />
                <span>Stratégies Sur-Mesure</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
                <Shield className="w-5 h-5" />
                <span>Conseil Gratuit ORIAS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Introduction */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Définir votre Objectif d'Investissement SCPI
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
              Investir en SCPI nécessite de <strong>définir clairement vos objectifs patrimoniaux</strong> : souhaitez-vous préparer votre retraite
              dans 20 ans ? Générer un revenu complémentaire immédiat ? Réduire votre imposition ? Ou simplement diversifier votre épargne ?
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Chaque objectif implique un <strong>horizon de placement différent</strong>, un <strong>profil de risque adapté</strong> et une
              <strong> sélection de SCPI spécifique</strong>. Cette page Hub vous guide vers les SCPI les plus pertinentes selon votre projet.
            </p>
          </div>
        </div>

        {/* Objectifs Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {objectifs.map((obj) => {
            const Icon = obj.icon;
            const colors = getColorClasses(obj.color);

            return (
              <div
                key={obj.id}
                className={`${colors.bg} border-2 ${colors.border} rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300`}
              >
                <div className="p-8">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className={`${colors.badge} p-4 rounded-xl`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {obj.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {obj.description}
                      </p>
                    </div>
                  </div>

                  {/* Caractéristiques */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Horizon</div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{obj.horizon}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Profil</div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{obj.profil}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Rendement</div>
                      <div className={`text-sm font-bold ${colors.text}`}>{obj.rendementCible}</div>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">
                      Avantages clés :
                    </h4>
                    <ul className="space-y-2">
                      {obj.highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <span className={`${colors.text} mt-0.5`}>✓</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* SCPI recommandées */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">
                      SCPI recommandées :
                    </h4>
                    <div className="space-y-2">
                      {obj.scpiRecommandees.map((scpi, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg text-xs">
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">{scpi.name}</div>
                            <div className="text-gray-500 dark:text-gray-400">{scpi.type}</div>
                          </div>
                          <div className={`font-bold ${colors.text} text-base`}>{scpi.rendement}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <a
                    href={obj.slug}
                    className={`block w-full ${colors.badge} text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity text-center`}
                  >
                    Explorer cet objectif →
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tableau de décision */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Quel Objectif pour Quel Profil ?
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                  <th className="text-left py-4 px-4 font-bold text-gray-900 dark:text-white">Votre Situation</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-900 dark:text-white">Objectif Prioritaire</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-900 dark:text-white">Horizon</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-900 dark:text-white">Enveloppe</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { situation: '30-40 ans, actif, TMI 30%+', objectif: 'Retraite', horizon: '25-35 ans', enveloppe: 'Assurance-vie' },
                  { situation: '45-55 ans, actif, patrimoine constitué', objectif: 'Revenu Complémentaire', horizon: '10-20 ans', enveloppe: 'Détention Directe' },
                  { situation: '50-60 ans, revenus élevés TMI 41-45%', objectif: 'Défiscalisation', horizon: '9-15 ans', enveloppe: 'Direct (Déficit)' },
                  { situation: 'Jeune investisseur, 1er placement', objectif: 'Diversification', horizon: '15-25 ans', enveloppe: 'AV ou Direct' }
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-4 px-4 text-gray-700 dark:text-gray-300">{row.situation}</td>
                    <td className="text-center py-4 px-4 font-semibold text-teal-600 dark:text-teal-400">{row.objectif}</td>
                    <td className="text-center py-4 px-4 text-gray-700 dark:text-gray-300">{row.horizon}</td>
                    <td className="text-center py-4 px-4 text-gray-700 dark:text-gray-300">{row.enveloppe}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-2xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Questions Fréquentes sur les Objectifs SCPI
          </h2>
          <div className="space-y-6">
            {[
              {
                q: 'Peut-on cumuler plusieurs objectifs avec les SCPI ?',
                a: 'Absolument ! Un portefeuille SCPI diversifié peut combiner plusieurs objectifs : par exemple 60% en SCPI rendement pour le revenu complémentaire + 30% en SCPI fiscale pour la défiscalisation + 10% en SCPI retraite (AV) pour la capitalisation long terme.'
              },
              {
                q: 'Quel est le meilleur objectif pour débuter en SCPI ?',
                a: 'Pour un primo-investisseur, la diversification patrimoniale est souvent le meilleur objectif. Commencez avec 10 000-50 000€ sur 2-3 SCPI diversifiées (bureaux + commerces + Europe) en détention directe ou assurance-vie selon votre fiscalité.'
              },
              {
                q: 'Les SCPI fiscales sont-elles vraiment rentables ?',
                a: 'Les SCPI fiscales (Pinel, Malraux, Déficit Foncier) offrent un rendement global attractif pour les TMI élevés : rendement 3-4% + réduction d\'impôt 15-30% = équivalent 6-10% net selon votre TMI. Elles nécessitent un engagement 9-15 ans et un montant minimum 30 000-50 000€.'
              },
              {
                q: 'Comment préparer sa retraite avec les SCPI ?',
                a: 'Stratégie retraite optimale : 1) Capitaliser 15-30 ans en assurance-vie sans fiscalité annuelle, 2) Privilégier SCPI européennes rendement 6-8%, 3) Avant retraite : arbitrer vers SCPI distribution régulière, 4) À la retraite : rachats partiels AV avec fiscalité allégée (abattement 4600/9200€ après 8 ans).'
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-lg">
                  {faq.q}
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Semantic Links */}
        <SemanticLinks
          currentPage="/scpi-objectifs"
          links={getSemanticLinks('/scpi-objectifs')}
          title="Continuez votre découverte des SCPI"
        />
      </div>
    </div>
  );
};

export default ScpiObjectifsHubPage;
