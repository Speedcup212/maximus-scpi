import React from 'react';
import { Building2, Award, TrendingUp, Users, Shield, Star, Globe, Target } from 'lucide-react';
import SEOHead from './SEOHead';
import SemanticLinks from './SemanticLinks';
import { getSemanticLinks } from '../data/semanticCocon';
import { generateFAQSchema, generateBreadcrumbSchema } from '../utils/seoOptimizer';

const ScpiGestionnairesHubPage: React.FC = () => {
  const tiers = [
    {
      level: 'Tier 1',
      title: 'Leaders Européens',
      description: 'Gestionnaires historiques avec encours > 2 Mds€',
      color: 'gold',
      gestionnaires: [
        { name: 'Alderan', encours: '4.2 Mds€', scpi: 3, rendement: '7.8%', slug: '/alderan-scpi' },
        { name: 'Perial Asset Management', encours: '3.8 Mds€', scpi: 5, rendement: '5.9%', slug: '/perial-asset-management-scpi' },
        { name: 'Amundi Immobilier', encours: '3.2 Mds€', scpi: 4, rendement: '5.8%', slug: '/amundi-immobilier-scpi' },
        { name: 'La Française REM', encours: '2.9 Mds€', scpi: 6, rendement: '5.6%', slug: '/la-francaise-rem-scpi' },
        { name: 'Atland Voisin', encours: '2.1 Mds€', scpi: 3, rendement: '5.7%', slug: '/atland-voisin-scpi' }
      ]
    },
    {
      level: 'Tier 2',
      title: 'Spécialistes Sectoriels',
      description: 'Experts thématiques reconnus',
      color: 'silver',
      gestionnaires: [
        { name: 'Greenman (Retail)', encours: '1.8 Mds€', scpi: 2, rendement: '6.2%', slug: '/greenman-arth-scpi' },
        { name: 'Novaxia (Recyclage Urbain)', encours: '890 M€', scpi: 3, rendement: '8.2%', slug: '/novaxia-investissement-scpi' },
        { name: 'Iroko (Logistique)', encours: '750 M€', scpi: 2, rendement: '7.1%', slug: '/iroko-scpi' },
        { name: 'Arkea REIM', encours: '680 M€', scpi: 2, rendement: '5.4%', slug: '/arkea-reim-scpi' },
        { name: 'Sofidy', encours: '620 M€', scpi: 3, rendement: '5.9%', slug: '/sofidy-scpi' }
      ]
    },
    {
      level: 'Tier 3',
      title: 'Nouveaux Entrants & Niches',
      description: 'Innovation et marchés de niche',
      color: 'bronze',
      gestionnaires: [
        { name: 'Urban Premium', encours: '420 M€', scpi: 2, rendement: '6.8%', slug: '/urban-premium-scpi' },
        { name: 'Remake Asset Management', encours: '380 M€', scpi: 1, rendement: '7.5%', slug: '/remake-asset-management-scpi' },
        { name: 'Kyaneos AM', encours: '290 M€', scpi: 2, rendement: '6.5%', slug: '/kyaneos-asset-management-scpi' },
        { name: 'Norma Capital', encours: '210 M€', scpi: 1, rendement: '6.9%', slug: '/norma-capital-scpi' },
        { name: 'Consultim AM', encours: '180 M€', scpi: 1, rendement: '6.3%', slug: '/consultim-asset-management-scpi' }
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; badge: string; text: string }> = {
      gold: {
        bg: 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20',
        border: 'border-yellow-300 dark:border-yellow-700',
        badge: 'bg-gradient-to-r from-yellow-400 to-amber-500',
        text: 'text-yellow-600 dark:text-yellow-400'
      },
      silver: {
        bg: 'bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20',
        border: 'border-gray-300 dark:border-gray-700',
        badge: 'bg-gradient-to-r from-gray-400 to-slate-500',
        text: 'text-gray-600 dark:text-gray-400'
      },
      bronze: {
        bg: 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20',
        border: 'border-orange-300 dark:border-orange-700',
        badge: 'bg-gradient-to-r from-orange-400 to-red-500',
        text: 'text-orange-600 dark:text-orange-400'
      }
    };
    return colors[color] || colors.silver;
  };

  const faqQuestions = [
    {
      question: "Quel est le meilleur gestionnaire SCPI en 2025 ?",
      answer: "Alderan se distingue comme leader avec 4.2 Mds€ d'encours et un rendement moyen de 7.8% sur ses 3 SCPI (Comète, Iroko Zen, et Remake). Perial Asset Management suit avec 3.8 Mds€ et 5 SCPI diversifiées offrant un rendement de 5.9%."
    },
    {
      question: "Quelle différence entre Tier 1, Tier 2 et Tier 3 ?",
      answer: "Tier 1 regroupe les Leaders Européens (encours > 2 Mds€, historique long). Tier 2 rassemble les Spécialistes Sectoriels (expertise thématique reconnue). Tier 3 comprend les Nouveaux Entrants et acteurs de niche (innovation, marchés spécifiques). Chaque catégorie présente des opportunités selon votre profil."
    },
    {
      question: "Faut-il privilégier les grands gestionnaires ou les spécialistes ?",
      answer: "Les grands gestionnaires (Tier 1) offrent sécurité et diversification. Les spécialistes (Tier 2) excellent sur leur niche avec des rendements parfois supérieurs (ex: Novaxia 8.2% sur recyclage urbain, Iroko 7.1% sur logistique). Idéalement, diversifiez entre les deux approches."
    },
    {
      question: "Comment évaluer la qualité d'un gestionnaire SCPI ?",
      answer: "5 critères clés : 1) Encours sous gestion (> 500M€ = solidité), 2) Historique de performance sur 5-10 ans, 3) Taux de distribution des dividendes (régularité), 4) TOF moyen du portefeuille (> 95%), 5) Expertise sectorielle reconnue et équipe expérimentée."
    },
    {
      question: "Peut-on investir dans plusieurs SCPI du même gestionnaire ?",
      answer: "Oui, mais avec précaution. Concentrer sur un seul gestionnaire augmente le risque de gestion (défaillance gestionnaire, stratégie inadaptée). Recommandation : maximum 50% de votre portefeuille SCPI chez un même gestionnaire, le reste réparti entre 2-3 autres acteurs."
    }
  ];

  const faqSchema = generateFAQSchema(faqQuestions);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Accueil', url: 'https://www.maximusscpi.com' },
    { name: 'SCPI par Gestionnaire', url: 'https://www.maximusscpi.com/scpi-gestionnaires' }
  ]);

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [faqSchema, breadcrumbSchema]
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-800">
      <SEOHead
        title="Gestionnaires SCPI : Top 38 Sociétés 2025 | Encours 80 Mds€"
        description="✓ 38 gestionnaires SCPI classés ✓ Tier 1: Alderan 7.8% ✓ Tier 2: Spécialistes 8.2% ✓ 80 Mds€ encours ✓ 150+ SCPI analysées ✓ Comparatif complet → Conseiller ORIAS"
        keywords={['gestionnaires scpi', 'sociétés de gestion scpi', 'alderan scpi', 'perial scpi', 'amundi scpi', 'classement gestionnaires 2025', 'meilleurs gestionnaires scpi']}
        canonical="https://www.maximusscpi.com/scpi-gestionnaires"
        schemaData={combinedSchema}
      />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-purple-600 to-indigo-700 dark:from-purple-800 dark:to-indigo-900 text-white py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full mb-6">
              <Award className="w-5 h-5" />
              <span className="font-semibold">Classement Officiel 2025</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight">
              Gestionnaires SCPI : Top 38 Sociétés 2025 (Encours 80 Mds€)
            </h1>
            <p className="text-xl sm:text-2xl mb-8 text-purple-100 max-w-4xl mx-auto">
              Comparaison exhaustive des sociétés de gestion : encours, performances, expertises
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm sm:text-base">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
                <Building2 className="w-5 h-5" />
                <span>38 Gestionnaires</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
                <TrendingUp className="w-5 h-5" />
                <span>150+ SCPI Gérées</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
                <Globe className="w-5 h-5" />
                <span>80 Mds€ d'Encours</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Introduction */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Comprendre les Gestionnaires SCPI
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
              Le <strong>gestionnaire de SCPI</strong> est l'acteur central qui pilote la société : acquisition d'actifs, gestion locative,
              arbitrages patrimoniaux, relation investisseurs. La <strong>qualité du gestionnaire</strong> est déterminante pour la performance
              à long terme de votre investissement.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Nous classons les 38 gestionnaires SCPI actifs en France en <strong>3 tiers</strong> selon l'encours sous gestion, l'historique
              de performance, l'expertise sectorielle et la solidité financière.
            </p>
          </div>
        </div>

        {/* Tiers */}
        {tiers.map((tier, tierIdx) => {
          const colors = getColorClasses(tier.color);

          return (
            <div key={tierIdx} className="mb-12">
              {/* Tier Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`${colors.badge} text-white px-6 py-2 rounded-full font-bold text-lg`}>
                  {tier.level}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {tier.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">{tier.description}</p>
                </div>
              </div>

              {/* Gestionnaires Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tier.gestionnaires.map((gest, idx) => (
                  <a
                    key={idx}
                    href={gest.slug}
                    className={`${colors.bg} border-2 ${colors.border} rounded-xl p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                          {gest.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Building2 className="w-4 h-4" />
                          <span>{gest.scpi} SCPI</span>
                        </div>
                      </div>
                      <div className={`${colors.text} font-bold text-2xl`}>
                        {gest.rendement}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-400">Encours</span>
                        <span className="font-bold text-gray-900 dark:text-white">{gest.encours}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-400">Rendement moyen</span>
                        <span className={`font-bold ${colors.text}`}>{gest.rendement}</span>
                      </div>
                    </div>

                    <div className="mt-4 text-center">
                      <span className={`inline-block ${colors.text} font-semibold text-sm`}>
                        Voir les SCPI →
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          );
        })}

        {/* Critères de sélection */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Nos Critères de Classement des Gestionnaires
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: TrendingUp,
                title: 'Performance Historique',
                desc: 'Rendements distribués sur 5-10 ans',
                weight: '30%'
              },
              {
                icon: Shield,
                title: 'Solidité Financière',
                desc: 'Fonds propres et solvabilité',
                weight: '25%'
              },
              {
                icon: Target,
                title: 'Expertise Sectorielle',
                desc: 'Spécialisation et track record',
                weight: '25%'
              },
              {
                icon: Users,
                title: 'Gouvernance & Transparence',
                desc: 'Qualité de reporting et relation investisseurs',
                weight: '20%'
              }
            ].map((critere, idx) => {
              const Icon = critere.icon;
              return (
                <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
                      {critere.weight}
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                    {critere.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {critere.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Questions Fréquentes sur les Gestionnaires SCPI
          </h2>
          <div className="space-y-6">
            {[
              {
                q: 'Qui sont les 3 plus grands gestionnaires SCPI en France ?',
                a: 'Les leaders incontestés sont : 1) Alderan (4,2 Mds€ d\'encours, spécialiste Europe), 2) Perial Asset Management (3,8 Mds€, diversifié), 3) Amundi Immobilier (3,2 Mds€, force de frappe institutionnelle). Ces 3 gestionnaires représentent à eux seuls 15% du marché français des SCPI.'
              },
              {
                q: 'Faut-il privilégier les gros gestionnaires ou les spécialistes de niche ?',
                a: 'Les deux approches sont complémentaires. Les gros gestionnaires (Tier 1) offrent solidité et diversification. Les spécialistes (Tier 2-3) peuvent surperformer grâce à leur expertise pointue (ex: Novaxia sur le recyclage urbain à 8,2%, Greenman sur le retail à 6,2%).'
              },
              {
                q: 'Comment vérifier la qualité d\'un gestionnaire SCPI ?',
                a: 'Vérifiez : 1) L\'agrément AMF (obligatoire), 2) L\'historique de rendement sur 5-10 ans, 3) La transparence du reporting, 4) Les frais de gestion (< 12% TTC), 5) La solidité financière du groupe, 6) Les avis clients et classements indépendants.'
              },
              {
                q: 'Un petit gestionnaire est-il plus risqué ?',
                a: 'Pas nécessairement. Les petits gestionnaires sont régulés par l\'AMF comme les grands. Certains (Remake, Urban Premium, Kyaneos) affichent d\'excellentes performances grâce à leur agilité et leur expertise de niche. La diversification de votre portefeuille reste la clé.'
              }
            ].map((faq, idx) => (
              <div key={idx} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
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
          currentPage="/scpi-gestionnaires"
          links={getSemanticLinks('/scpi-gestionnaires')}
          title="Continuez votre découverte des SCPI"
        />
      </div>
    </div>
  );
};

export default ScpiGestionnairesHubPage;
