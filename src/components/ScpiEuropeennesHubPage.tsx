import React from 'react';
import { Building2, TrendingUp, Globe, Award, MapPin, ExternalLink, Flag } from 'lucide-react';
import SEOHead from './SEOHead';
import SemanticLinks from './SemanticLinks';
import { getSemanticLinks } from '../data/semanticCocon';
import { generateFAQSchema, generateBreadcrumbSchema } from '../utils/seoOptimizer';

const ScpiEuropeennesHubPage: React.FC = () => {
  const europeanCountries = [
    {
      id: 'allemagne',
      name: 'Allemagne',
      flag: '🇩🇪',
      color: 'yellow',
      description: 'Bureaux premium Berlin, Munich, Francfort - Stabilité économique',
      scpiCount: '8+',
      rendementMoyen: '5.3%',
      topScpi: [
        { name: 'Transitions Europe', rendement: '8.25%', exposure: '20%' },
        { name: 'Atream Hotel', rendement: '5.05%', exposure: '30%' },
        { name: 'Perial Hospitalité Europe', rendement: '4.02%', exposure: '67.5%' }
      ]
    },
    {
      id: 'espagne',
      name: 'Espagne',
      flag: '🇪🇸',
      color: 'red',
      description: 'Commerces Madrid, Barcelone, Valencia - Croissance dynamique',
      scpiCount: '10+',
      rendementMoyen: '7.8%',
      topScpi: [
        { name: 'Comète', rendement: '9.00%', exposure: '15.4%' },
        { name: 'Transitions Europe', rendement: '8.25%', exposure: '34%' },
        { name: 'Épargne Pierre Europe', rendement: '6.75%', exposure: '52.8%' }
      ]
    },
    {
      id: 'pays-bas',
      name: 'Pays-Bas',
      flag: '🇳🇱',
      color: 'orange',
      description: 'Logistique Amsterdam, Rotterdam - Hub européen e-commerce',
      scpiCount: '9+',
      rendementMoyen: '6.2%',
      topScpi: [
        { name: 'Comète', rendement: '9.00%', exposure: '10.3%' },
        { name: 'Transitions Europe', rendement: '8.25%', exposure: '27%' },
        { name: 'Épargne Pierre Europe', rendement: '6.75%', exposure: '19.86%' }
      ]
    },
    {
      id: 'royaume-uni',
      name: 'Royaume-Uni',
      flag: '🇬🇧',
      color: 'blue',
      description: 'Bureaux Londres, Manchester - Marché immobilier mature',
      scpiCount: '5+',
      rendementMoyen: '6.5%',
      topScpi: [
        { name: 'Comète', rendement: '9.00%', exposure: '46.5%' },
        { name: 'Remake Live', rendement: '7.50%', exposure: '32.16%' },
        { name: 'Iroko Zen', rendement: '6.01%', exposure: '16%' }
      ]
    },
    {
      id: 'irlande',
      name: 'Irlande',
      flag: '🇮🇪',
      color: 'green',
      description: 'Bureaux Dublin - Hub technologique européen',
      scpiCount: '6+',
      rendementMoyen: '6.8%',
      topScpi: [
        { name: 'Épargne Pierre Europe', rendement: '6.75%', exposure: '27.34%' },
        { name: 'Iroko Zen', rendement: '6.01%', exposure: '12%' },
        { name: 'Remake Live', rendement: '7.50%', exposure: '7.20%' }
      ]
    },
    {
      id: 'pologne',
      name: 'Pologne',
      flag: '🇵🇱',
      color: 'purple',
      description: 'Bureaux Varsovie, Cracovie - Marché émergent dynamique',
      scpiCount: '3+',
      rendementMoyen: '7.2%',
      topScpi: [
        { name: 'Remake Live', rendement: '7.50%', exposure: '8.74%' },
        { name: 'Transitions Europe', rendement: '8.25%', exposure: '7%' },
        { name: 'Paref Evo', rendement: '6.00%', exposure: '100%' }
      ]
    }
  ];

  const topEuropeanScpi = [
    {
      name: 'Comète',
      gestionnaire: 'Alderan',
      rendement: '9.00%',
      europePct: '93.4%',
      pays: 'Royaume-Uni, Espagne, Italie, Pays-Bas, Irlande, Pologne, Canada',
      secteur: 'Diversifié',
      description: 'SCPI majoritairement européenne avec diversification internationale'
    },
    {
      name: 'Transitions Europe',
      gestionnaire: 'Arkéa REIM',
      rendement: '8.25%',
      europePct: '100%',
      pays: 'Espagne, Pays-Bas, Allemagne, Irlande, Pologne',
      secteur: 'Bureaux, Commerces, Life Sciences',
      description: 'SCPI thématique transitions énergétique et numérique'
    },
    {
      name: 'Remake Live',
      gestionnaire: 'Remake Asset Management',
      rendement: '7.50%',
      europePct: '43%',
      pays: 'Royaume-Uni, Espagne, Pays-Bas, Pologne, Irlande',
      secteur: 'Résidentiel, Bureaux',
      description: 'SCPI innovante coliving et bureaux flexibles européens'
    },
    {
      name: 'Épargne Pierre Europe',
      gestionnaire: 'Atland Voisin',
      rendement: '6.75%',
      europePct: '100%',
      pays: 'Espagne, Irlande, Pays-Bas',
      secteur: 'Bureaux, Commerces, Hôtellerie',
      description: 'SCPI 100% européenne, diversification géographique optimale'
    },
    {
      name: 'Coeur d\'Europe',
      gestionnaire: 'Sogenial Immobilier',
      rendement: '6.02%',
      europePct: '80%',
      pays: 'Allemagne, Pays-Bas, Italie, Espagne',
      secteur: 'Commerces',
      description: 'SCPI commerces cœur d\'Europe, emplacements premium'
    },
    {
      name: 'Iroko Zen',
      gestionnaire: 'Iroko',
      rendement: '6.01%',
      europePct: '56%',
      pays: 'Royaume-Uni, Irlande, Pays-Bas, Allemagne, Espagne',
      secteur: 'Bureaux, Commerces, Logistique',
      description: 'SCPI sans frais d\'entrée, forte exposition européenne'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string; hover: string }> = {
      yellow: {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        text: 'text-yellow-600 dark:text-yellow-400',
        border: 'border-yellow-200 dark:border-yellow-800',
        hover: 'hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
      },
      red: {
        bg: 'bg-red-50 dark:bg-red-900/20',
        text: 'text-red-600 dark:text-red-400',
        border: 'border-red-200 dark:border-red-800',
        hover: 'hover:bg-red-100 dark:hover:bg-red-900/30'
      },
      orange: {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        text: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-200 dark:border-orange-800',
        hover: 'hover:bg-orange-100 dark:hover:bg-orange-900/30'
      },
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800',
        hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/30'
      },
      green: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        text: 'text-green-600 dark:text-green-400',
        border: 'border-green-200 dark:border-green-800',
        hover: 'hover:bg-green-100 dark:hover:bg-green-900/30'
      },
      purple: {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-800',
        hover: 'hover:bg-purple-100 dark:hover:bg-purple-900/30'
      }
    };
    return colors[color] || colors.blue;
  };

  const faqQuestions = [
    {
      question: "Quelle est la meilleure SCPI européenne en 2025 ?",
      answer: "Comète (Alderan) affiche un taux de distribution 2025 de 9,00% avec une exposition majoritairement européenne (Royaume-Uni, Espagne, Italie, Pays-Bas, Irlande, Pologne) et une ouverture au Canada. Transitions Europe (Arkéa REIM) suit avec 8,25% et une stratégie thématique transitions énergétique/numérique sur 5 pays. Épargne Pierre Europe (Atland Voisin) offre 6,75% avec une diversification Espagne/Irlande/Pays-Bas."
    },
    {
      question: "Pourquoi investir dans les SCPI européennes ?",
      answer: "Diversification géographique hors France, accès à des marchés porteurs (Espagne +7,8%, Pologne +7,2%), rendements supérieurs (Comète 9,00%, Transitions Europe 8,25%), exposition aux hubs technologiques (Dublin, Amsterdam) et logistiques européens. Les SCPI européennes bénéficient de la résilience du marché unique européen."
    },
    {
      question: "Quels pays européens offrent les meilleurs rendements SCPI ?",
      answer: "Espagne (7,8% moyen): Comète 9,00%, Transitions Europe 8,25% | Pologne (7,2% moyen): Remake Live 7,5%, Paref Evo 6% | Irlande (6,8% moyen): Épargne Pierre Europe 6,75% | Pays-Bas (6,2% moyen): hub logistique e-commerce | Royaume-Uni (6,5% moyen): bureaux Londres premium."
    },
    {
      question: "SCPI 100% européenne vs SCPI mixte France-Europe ?",
      answer: "SCPI majoritairement Europe: Comète (9,00%), Transitions Europe (8,25%), Épargne Pierre Europe (6,75%), Paref Evo (6%) - exposition forte aux marchés européens. SCPI mixtes: Remake Live (43% Europe, 7,5%), Iroko Zen (56% Europe, 6,01%) - équilibre stabilité France + opportunités Europe. Choix selon profil diversification."
    },
    {
      question: "Comment diversifier son portefeuille avec des SCPI européennes ?",
      answer: "Allocation optimale: 40% SCPI France (stabilité), 30% SCPI Europe (Comète, Transitions Europe, Épargne Pierre Europe), 30% SCPI mixtes (Remake Live, Iroko Zen). Diversifier géographiquement: 25% Espagne, 20% Allemagne, 20% Pays-Bas, 15% Royaume-Uni, 10% Irlande, 10% Pologne/autres."
    }
  ];

  const faqSchema = generateFAQSchema(faqQuestions);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Accueil', url: 'https://maximusscpi.com' },
    { name: 'SCPI Européennes', url: 'https://maximusscpi.com/scpi-europeennes' }
  ]);

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [faqSchema, breadcrumbSchema]
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-800">
      <SEOHead
        title="SCPI Européennes 2025 : Top 12 SCPI Europe (Rendements 4% à 9.00%)"
        description="✓ 12 SCPI européennes analysées ✓ Comète 9.00% ✓ Transitions Europe 8.25% ✓ Remake Live 7.5% ✓ Espagne, Allemagne, Pays-Bas, Royaume-Uni ✓ Diversification Europe → Conseiller ORIAS"
        keywords={['scpi européennes', 'scpi europe', 'scpi allemagne', 'scpi espagne', 'scpi pays-bas', 'scpi royaume-uni', 'scpi irlande', 'comète scpi', 'transitions europe', 'diversification européenne']}
        canonical="https://maximusscpi.com/scpi-europeennes/"
        schemaData={combinedSchema}
      />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-800 dark:to-cyan-800 text-white py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Globe className="w-12 h-12" />
              <Flag className="w-10 h-10" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight">
              SCPI Européennes 2025 : Top 12 SCPI Europe (Rendements 4% à 9.00%)
            </h1>
            <p className="text-xl sm:text-2xl mb-8 text-blue-100 max-w-4xl mx-auto">
              Investissez dans l'immobilier européen : Allemagne, Espagne, Pays-Bas, Royaume-Uni, Irlande, Pologne
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm sm:text-base">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
                <Globe className="w-5 h-5" />
                <span>12 SCPI Européennes</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
                <TrendingUp className="w-5 h-5" />
                <span>Rendements 4% à 9.00%</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
                <Award className="w-5 h-5" />
                <span>Comète 9.00%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Pourquoi investir dans les SCPI Européennes ?
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
              Les <strong>SCPI européennes</strong> offrent une <strong>diversification géographique hors France</strong> avec des rendements attractifs
              de <strong>4% à 9,00%</strong>. En investissant dans <strong>12 SCPI à exposition européenne</strong>, vous accédez aux marchés
              immobiliers porteurs : <strong>Espagne</strong> (7,8% moyen), <strong>Pologne</strong> (7,2%), <strong>Irlande</strong> (6,8%),
              <strong> Pays-Bas</strong> (6,2% hub logistique).
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              <strong>Comète (9,00%)</strong>, <strong>Transitions Europe (8,25%)</strong> et <strong>Épargne Pierre Europe (6,75%)</strong> sont
              les leaders 100% Europe. Les SCPI mixtes comme <strong>Remake Live (7,5%)</strong> et <strong>Iroko Zen (6,01%)</strong> combinent
              stabilité française et opportunités européennes.
            </p>
          </div>
        </div>

        {/* Top 6 SCPI Européennes */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            🏆 Top 6 SCPI Européennes par Rendement
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topEuropeanScpi.map((scpi, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{scpi.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{scpi.gestionnaire}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-green-600 dark:text-green-400">{scpi.rendement}</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold">{scpi.europePct} Europe</div>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-2">
                    <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold">Pays:</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{scpi.pays}</p>
                </div>
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-2">
                    <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold">Secteur:</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{scpi.secteur}</p>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                  {scpi.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Pays Européens Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            🌍 SCPI par Pays Européen
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {europeanCountries.map((country) => {
              const colors = getColorClasses(country.color);

              return (
                <div
                  key={country.id}
                  className={`${colors.bg} border-2 ${colors.border} rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 ${colors.hover}`}
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="text-5xl">{country.flag}</div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {country.name}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {country.description}
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-white dark:bg-gray-800 rounded-xl">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${colors.text}`}>
                          {country.scpiCount}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">SCPI</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${colors.text}`}>
                          {country.rendementMoyen}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Rendement</div>
                      </div>
                    </div>

                    {/* Top SCPI */}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">
                        Top 3 SCPI {country.name} :
                      </h4>
                      <div className="space-y-2">
                        {country.topScpi.map((scpi, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg text-xs">
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 dark:text-white">{scpi.name}</div>
                              <div className="text-gray-500 dark:text-gray-400">Expo: {scpi.exposure}</div>
                            </div>
                            <div className={`font-bold ${colors.text}`}>{scpi.rendement}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tableau Comparatif */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Tableau Comparatif des Pays Européens
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                  <th className="text-left py-4 px-4 font-bold text-gray-900 dark:text-white">Pays</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-900 dark:text-white">Rendement Moyen</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-900 dark:text-white">Nb SCPI</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-900 dark:text-white">Secteur Dominant</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-900 dark:text-white">Potentiel</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { pays: '🇪🇸 Espagne', rendement: '7.8%', nbScpi: '10+', secteur: 'Commerces, Bureaux', potentiel: '★★★★★' },
                  { pays: '🇵🇱 Pologne', rendement: '7.2%', nbScpi: '3+', secteur: 'Bureaux', potentiel: '★★★★★' },
                  { pays: '🇮🇪 Irlande', rendement: '6.8%', nbScpi: '6+', secteur: 'Bureaux Tech', potentiel: '★★★★★' },
                  { pays: '🇬🇧 Royaume-Uni', rendement: '6.5%', nbScpi: '5+', secteur: 'Bureaux, Résidentiel', potentiel: '★★★★☆' },
                  { pays: '🇳🇱 Pays-Bas', rendement: '6.2%', nbScpi: '9+', secteur: 'Logistique', potentiel: '★★★★★' },
                  { pays: '🇩🇪 Allemagne', rendement: '5.3%', nbScpi: '8+', secteur: 'Bureaux, Hôtellerie', potentiel: '★★★★☆' }
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-4 px-4 font-semibold text-gray-900 dark:text-white">{row.pays}</td>
                    <td className="text-center py-4 px-4 text-green-600 dark:text-green-400 font-bold">{row.rendement}</td>
                    <td className="text-center py-4 px-4 text-gray-700 dark:text-gray-300">{row.nbScpi}</td>
                    <td className="text-center py-4 px-4 text-gray-700 dark:text-gray-300">{row.secteur}</td>
                    <td className="text-center py-4 px-4 text-yellow-500">{row.potentiel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Questions Fréquentes sur les SCPI Européennes
          </h2>
          <div className="space-y-6">
            {[
              {
                q: 'Quelle est la meilleure SCPI européenne en 2025 ?',
                a: 'Comète (Alderan) affiche 9,00% avec une exposition majoritairement européenne (Royaume-Uni 46,5%, Espagne 15,4%, Italie 12,4%, Pays-Bas 10,3%) et une ouverture au Canada. Transitions Europe (8,25%) excelle avec sa stratégie transitions énergétique/numérique. Épargne Pierre Europe (6,75%) offre la meilleure diversification Espagne/Irlande/Pays-Bas.'
              },
              {
                q: 'SCPI 100% européenne ou SCPI mixte France-Europe ?',
                a: 'SCPI majoritairement Europe (Comète 9,00%, Transitions Europe 8,25%) = forte exposition aux marchés européens dynamiques. SCPI mixtes (Remake Live 43% Europe, Iroko Zen 56% Europe) = équilibre stabilité France + opportunités Europe. Choix selon profil: audacieux Europe, équilibrés mixtes.'
              },
              {
                q: 'Quels pays européens privilégier pour les SCPI ?',
                a: 'Top rendements: Espagne (7,8% moyen), Pologne (7,2%), Irlande (6,8% hub tech Dublin). Stabilité: Allemagne (5,3%), Pays-Bas (6,2% hub logistique). Croissance: Royaume-Uni post-Brexit (6,5%). Allocation optimale: 30% Espagne, 20% Allemagne, 20% Pays-Bas, 15% UK, 15% autres.'
              },
              {
                q: 'Les SCPI européennes sont-elles plus risquées que les SCPI françaises ?',
                a: 'Risques: change EUR (limité zone euro), réglementations nationales, liquidité moindre. Atouts: diversification géographique, croissance marchés émergents (Pologne +7,2%, Espagne +7,8%), rendements supérieurs (Comète 9,00% vs moyenne France 4,5%). Marché unique européen = résilience. Balance risque/rendement favorable.'
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
          currentPage="/scpi-europeennes"
          links={getSemanticLinks('/scpi-europeennes')}
          title="Continuez votre découverte des SCPI"
        />
      </div>
    </div>
  );
};

export default ScpiEuropeennesHubPage;
