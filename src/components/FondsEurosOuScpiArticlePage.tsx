import React from 'react';
import { TrendingUp, Shield, PieChart, Calculator, Users, AlertTriangle, CheckCircle2, Target, Wallet, ArrowRight, BarChart3, Clock } from 'lucide-react';
import SEOHead from './SEOHead';
import SemanticLinks from './SemanticLinks';
import { getSemanticLinks } from '../data/semanticCocon';
import { generateFAQSchema, generateBreadcrumbSchema, generateArticleSchema } from '../utils/seoOptimizer';

const FondsEurosOuScpiArticlePage: React.FC = () => {
  const faqQuestions = [
    {
      question: "Faut-il vraiment sortir du fonds euros en 2025 ?",
      answer: "Pas nécessairement tout sortir, mais diversifier devient urgent. Avec un rendement fonds euros de 2% et une inflation identique, votre épargne stagne en pouvoir d'achat. Une allocation mixte 50% fonds euros + 50% SCPI permet de sécuriser votre capital tout en générant un rendement réel positif de 1,5% à 2% après inflation."
    },
    {
      question: "Quelle est la différence de rendement net entre fonds euros et SCPI ?",
      answer: "Sur 100 000€ investis sur 15 ans à TMI 30% : fonds euros génère 24 349€ nets (rendement annualisé 1,47%), tandis que les SCPI génèrent 41 067€ nets (2,73%), soit +16 718€ d'écart malgré les frais d'entrée de 10%. Le delta s'accentue à TMI 11% où les SCPI surperforment encore plus."
    },
    {
      question: "Peut-on perdre de l'argent avec les SCPI dans une assurance-vie ?",
      answer: "Oui, contrairement au fonds euros garanti. Le prix de la part SCPI peut baisser en cas de crise immobilière (historiquement -5% à -10% sur les crises majeures). Cependant, sur le long terme (15-20 ans), les SCPI françaises ont toujours retrouvé et dépassé leur valeur initiale grâce aux revenus trimestriels capitalisés."
    },
    {
      question: "À quelle TMI les SCPI deviennent-elles intéressantes ?",
      answer: "Les SCPI sont avantageuses dès la TMI 11% (fiscalité totale 28,2%) et excellent à TMI 30% (47,2%). À TMI 41% (58,2%), l'écart de rendement net avec le fonds euros reste favorable sur le long terme (15+ ans) grâce au différentiel de rendement brut (5-6,5% vs 2%). Seule la TMI 45% peut rendre le fonds euros compétitif sur horizon court (moins de 10 ans)."
    },
    {
      question: "Quelle allocation fonds euros/SCPI selon mon âge ?",
      answer: "Avant 45 ans : 30% fonds euros / 70% SCPI (horizon 20+ ans). Entre 45-55 ans : 50/50 (horizon 10-15 ans). Entre 55-65 ans : 60% fonds euros / 40% SCPI (horizon 8-12 ans). Après 65 ans : 70-80% fonds euros / 20-30% SCPI maximum (liquidité prioritaire). Ajustez selon votre tolérance au risque personnelle."
    },
    {
      question: "Combien de temps minimum pour rentabiliser les frais d'entrée SCPI ?",
      answer: "Avec 10% de frais d'entrée et un delta de rendement de 3 points par rapport au fonds euros (5% vs 2%), il faut environ 3-4 ans pour amortir les frais. Au-delà de 8 ans, l'avantage SCPI devient significatif. C'est pourquoi l'horizon minimum recommandé est de 8-10 ans."
    },
    {
      question: "Les SCPI européennes (6-6,5%) sont-elles meilleures que les SCPI françaises (5%) ?",
      answer: "En rendement brut, oui (+1 à 1,5 point). Mais attention au risque de change (euro fort/faible) et à la liquidité parfois plus faible. Pour un investisseur TMI 30%, une SCPI européenne à 6,5% génère 3,43% net après fiscalité, contre 2,64% pour une SCPI française à 5%. L'écart de 0,8 point justifie une allocation de 30-40% sur l'Europe dans un portefeuille SCPI diversifié."
    },
    {
      question: "Que faire si j'ai besoin de liquidité rapidement avec des SCPI ?",
      answer: "Les SCPI dans une assurance-vie peuvent se revendre, mais le délai moyen est de 3 à 6 mois (marché secondaire). En période de crise, ce délai peut s'allonger. C'est pourquoi il faut toujours conserver une poche fonds euros (30-50%) pour les besoins de liquidité imprévus (travaux, santé, opportunité d'investissement)."
    }
  ];

  const faqSchema = generateFAQSchema(faqQuestions);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Accueil', url: 'https://maximusscpi.com' },
    { name: 'Comprendre les SCPI', url: 'https://maximusscpi.com/comprendre-scpi' },
    { name: 'Fonds euros ou SCPI 2026', url: 'https://maximusscpi.com/fonds-euros-ou-scpi/' }
  ]);

  const articleSchema = generateArticleSchema({
    headline: "Fonds euros ou SCPI : que faire en 2025 ?",
    description: "Comparatif détaillé 2025 entre fonds euros (2%) et SCPI (5-6,5%). Rendements, fiscalité TMI, risques et stratégies selon votre profil. Exemples 100k€ sur 15 ans avec calculs nets.",
    author: "Éric Bellaiche",
    datePublished: "2025-01-20",
    dateModified: "2025-01-20",
    image: "https://maximusscpi.com/images/fonds-euros-scpi-2025.jpg"
  });

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [faqSchema, breadcrumbSchema, articleSchema]
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-800">
      <SEOHead
        title="Fonds euros ou SCPI 2026 : Comparatif Complet Rendement & TMI"
        description="✓ Fonds euros 2% vs SCPI 5-6,5% ✓ Exemple 100k€ sur 15 ans ✓ Fiscalité TMI 11/30/41% ✓ 4 profils investisseurs ✓ Calculs détaillés ✓ Allocation optimale → Conseiller ORIAS"
        keywords={['fonds euros ou SCPI', 'rendement fonds euros 2025', 'SCPI assurance vie', 'arbitrage fonds euros SCPI', 'TMI SCPI', 'fiscalité SCPI', 'allocation fonds euros SCPI', 'SCPI européennes']}
        canonical="https://maximusscpi.com/fonds-euros-ou-scpi/"
        schemaData={combinedSchema}
      />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-cyan-700 dark:from-blue-800 dark:to-cyan-900 text-white py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full mb-6">
              <Calculator className="w-5 h-5" />
              <span className="font-semibold">Guide Comparatif Expert 2025</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight">
              Fonds euros ou SCPI : que faire en 2025 ?
            </h1>
            <p className="text-xl sm:text-2xl mb-8 text-blue-100 max-w-4xl mx-auto leading-relaxed">
              Comparatif exhaustif : rendements nets, fiscalité TMI, risques et allocations optimales pour faire le bon choix dans votre assurance-vie
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm sm:text-base">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
                <TrendingUp className="w-5 h-5" />
                <span>2% vs 5-6,5%</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
                <Calculator className="w-5 h-5" />
                <span>Calculs 100k€/15 ans</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
                <PieChart className="w-5 h-5" />
                <span>4 Profils TMI</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
                <Target className="w-5 h-5" />
                <span>Allocation sur-mesure</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Introduction contextuelle */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6 font-semibold">
              Janvier 2025 : vous détenez 150 000 € sur un fonds euros dans votre assurance-vie. Rendement annoncé pour 2024 : <strong className="text-blue-600 dark:text-blue-400">2,0%</strong>. Inflation : <strong className="text-red-600 dark:text-red-400">2,0%</strong>. Résultat : votre épargne stagne en pouvoir d'achat. Pendant ce temps, les SCPI affichent des rendements de <strong className="text-green-600 dark:text-green-400">5,0% à 6,5%</strong> selon les typologies (France, Europe, secteurs).
            </p>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              La question <strong>&quot;fonds euros ou SCPI&quot;</strong> se pose aujourd'hui à <strong>16 millions d'épargnants français</strong> détenteurs d'assurance-vie. Le dilemme est clair : conserver la sécurité absolue du capital garanti avec un rendement quasi-nul, ou accepter un risque modéré pour viser un rendement réel positif de 3% à 4,5% après inflation ?
            </p>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              Cette décision ne se prend pas à la légère. Elle dépend de <strong>5 paramètres fondamentaux</strong> : votre tranche marginale d'imposition (TMI), votre horizon de placement, votre tolérance au risque, vos besoins de liquidité, et vos objectifs patrimoniaux (revenus complémentaires, préparation retraite, transmission).
            </p>

            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-l-4 border-blue-500">
              <p className="text-gray-800 dark:text-gray-200 font-semibold mb-2">
                🎯 Ce que vous allez découvrir dans ce guide :
              </p>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>• <strong>Comparatif détaillé</strong> fonds euros vs SCPI sur 11 critères (rendement, risque, fiscalité, liquidité)</li>
                <li>• <strong>Calcul complet sur 100 000 € investis sur 15 ans</strong> : revenus nets, fiscalité réelle, capital final</li>
                <li>• <strong>4 profils d'allocation</strong> selon votre situation (TMI 11%, 30%, 41%, et selon l'âge)</li>
                <li>• <strong>Analyse fiscale approfondie</strong> : impact de votre TMI sur le rendement net final</li>
                <li>• <strong>5 risques SCPI à connaître</strong> avant d'arbitrer (perte en capital, illiquidité, frais)</li>
                <li>• <strong>8 questions fréquentes</strong> avec réponses d'expert conseiller ORIAS</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Synthèse comparative rapide */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <PieChart className="w-8 h-8 text-blue-600" />
            Fonds euros vs SCPI : le face-à-face en 30 secondes
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Fonds euros */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-6 border-2 border-blue-300 dark:border-blue-700">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-200">Fonds euros</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span className="text-blue-900 dark:text-blue-200"><strong>2,0%</strong> de rendement brut 2025</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span className="text-blue-900 dark:text-blue-200"><strong>100% garanti</strong> : capital protégé</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span className="text-blue-900 dark:text-blue-200"><strong>Liquidité immédiate</strong> : retrait J+0</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span className="text-blue-900 dark:text-blue-200"><strong>0% de frais</strong> d'entrée</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span className="text-blue-900 dark:text-blue-200"><strong>Fiscalité PFU 30%</strong> ou TMI+17,2%</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-200 dark:bg-blue-900/50 rounded-lg">
                <p className="text-sm font-bold text-blue-900 dark:text-blue-100">
                  Rendement réel après inflation (2%) : <span className="text-xl">≈ 0%</span>
                </p>
              </div>
            </div>

            {/* SCPI */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-6 border-2 border-green-300 dark:border-green-700">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
                <h3 className="text-2xl font-bold text-green-900 dark:text-green-200">SCPI</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <span className="text-green-900 dark:text-green-200"><strong>5,0 à 6,5%</strong> de rendement brut 2025</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500 dark:text-orange-400 flex-shrink-0" />
                  <span className="text-green-900 dark:text-green-200"><strong>Capital non garanti</strong> : risque -5/-10%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-500 dark:text-orange-400 flex-shrink-0" />
                  <span className="text-green-900 dark:text-green-200"><strong>Liquidité 3-6 mois</strong> : délai revente</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500 dark:text-orange-400 flex-shrink-0" />
                  <span className="text-green-900 dark:text-green-200"><strong>8-12% de frais</strong> d'entrée TTC</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <span className="text-green-900 dark:text-green-200"><strong>Fiscalité TMI+17,2%</strong> (revenus fonciers)</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-green-200 dark:bg-green-900/50 rounded-lg">
                <p className="text-sm font-bold text-green-900 dark:text-green-100">
                  Rendement réel après inflation (2%) : <span className="text-xl">3% à 4,5%</span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border-l-4 border-amber-500">
            <p className="text-gray-800 dark:text-gray-200 font-semibold mb-2">
              💡 <strong>Verdict en 1 phrase :</strong>
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Le fonds euros garantit votre capital mais ne le fait pas progresser réellement (rendement réel ≈ 0%). Les SCPI comportent un risque modéré mais génèrent un rendement réel positif de <strong>3% à 4,5%</strong> après inflation, à condition de conserver <strong>8 à 15 ans minimum</strong>.
            </p>
          </div>
        </div>

        {/* Tableau comparatif exhaustif */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Tableau comparatif : 11 critères décisifs
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                  <th className="text-left p-4 font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700">Critère</th>
                  <th className="text-center p-4 font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30">Fonds euros</th>
                  <th className="text-center p-4 font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30">SCPI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {[
                  {
                    critere: 'Rendement brut moyen 2025',
                    fe: '2,0%',
                    scpi: '5,0% (France) - 6,5% (Europe)',
                    highlight: true
                  },
                  {
                    critere: 'Rendement net après fiscalité TMI 30%',
                    fe: '1,47%',
                    scpi: '2,64% (France) - 3,43% (Europe)',
                    highlight: true
                  },
                  {
                    critere: 'Garantie du capital investi',
                    fe: '✅ Oui (100%)',
                    scpi: '❌ Non (volatilité -5/+10%)'
                  },
                  {
                    critere: 'Liquidité / Délai de sortie',
                    fe: 'Immédiate (J+0)',
                    scpi: '3 à 6 mois (marché secondaire)'
                  },
                  {
                    critere: 'Horizon de placement recommandé',
                    fe: '0 à 5 ans',
                    scpi: '8 à 20 ans'
                  },
                  {
                    critere: 'Frais d\'entrée',
                    fe: '0%',
                    scpi: '8% à 12% TTC'
                  },
                  {
                    critere: 'Frais de gestion annuels',
                    fe: '0,5% à 1%',
                    scpi: '8% à 12% HT (inclus dans rendement)'
                  },
                  {
                    critere: 'Fiscalité des revenus',
                    fe: 'PFU 30% OU TMI + 17,2%',
                    scpi: 'TMI + 17,2% (revenus fonciers)'
                  },
                  {
                    critere: 'Protection contre l\'inflation',
                    fe: 'Faible (rendement fixe)',
                    scpi: 'Forte (indexation loyers ILC/ILAT)'
                  },
                  {
                    critere: 'Diversification immobilière',
                    fe: 'Aucune',
                    scpi: 'Bureaux, commerces, logistique, santé'
                  },
                  {
                    critere: 'Type de revenus',
                    fe: 'Intérêts capitalisés annuellement',
                    scpi: 'Loyers distribués trimestriellement'
                  }
                ].map((row, idx) => (
                  <tr
                    key={idx}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${row.highlight ? 'bg-amber-50 dark:bg-amber-900/10' : ''}`}
                  >
                    <td className="p-4 font-semibold text-gray-900 dark:text-white">{row.critere}</td>
                    <td className="p-4 text-center text-gray-700 dark:text-gray-300">{row.fe}</td>
                    <td className="p-4 text-center text-gray-700 dark:text-gray-300">{row.scpi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-l-4 border-blue-500">
              <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-2">Points forts Fonds euros</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <li>• Sécurité absolue du capital</li>
                <li>• Liquidité immédiate sans délai</li>
                <li>• Aucun frais d'entrée ni d'arbitrage</li>
                <li>• Simplicité de gestion totale</li>
              </ul>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border-l-4 border-green-500">
              <h4 className="font-bold text-green-900 dark:text-green-200 mb-2">Points forts SCPI</h4>
              <ul className="text-sm text-green-800 dark:text-green-300 space-y-1">
                <li>• Rendement 2,5x à 3,25x supérieur</li>
                <li>• Revenus trimestriels en cash</li>
                <li>• Protection inflation (indexation loyers)</li>
                <li>• Diversification immobilière européenne</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Simulation détaillée 100k€ sur 15 ans */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-8 mb-12 border-2 border-purple-200 dark:border-purple-800">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <Calculator className="w-8 h-8 text-purple-600" />
            Simulation réelle : 100 000 € investis sur 15 ans
          </h2>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Hypothèses de calcul (prudentes)</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300">Capital & Durée</h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Capital initial : <strong>100 000 €</strong></li>
                  <li>• Durée : <strong>15 ans</strong></li>
                  <li>• Inflation : <strong>2% / an</strong></li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300">Rendements bruts</h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Fonds euros : <strong>2,0% / an</strong></li>
                  <li>• SCPI France : <strong>5,0% / an</strong></li>
                  <li>• SCPI Europe : <strong>6,5% / an</strong></li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300">Fiscalité</h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>• TMI : <strong>30%</strong></li>
                  <li>• Prélèvements sociaux : <strong>17,2%</strong></li>
                  <li>• Frais SCPI : <strong>10% entrée</strong></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {/* Scénario 1 : Fonds euros */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-blue-500 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">Fonds euros</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Capital investi</span>
                  <span className="font-bold text-gray-900 dark:text-white">100 000 €</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Revenus bruts 15 ans</span>
                  <span className="font-bold text-gray-900 dark:text-white">34 785 €</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Fiscalité (PFU 30%)</span>
                  <span className="font-bold text-red-600 dark:text-red-400">-10 436 €</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Revenus nets cumulés</span>
                  <span className="font-bold text-green-600 dark:text-green-400">24 349 €</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-gray-900 dark:text-white">Capital final</span>
                  <span className="font-bold text-2xl text-blue-600 dark:text-blue-400">124 349 €</span>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 mt-3">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Rendement net annualisé</div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">1,47%</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-3">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Rendement réel (après inflation 2%)</div>
                  <div className="text-xl font-bold text-red-600 dark:text-red-400">-0,53%</div>
                </div>
              </div>
            </div>

            {/* Scénario 2 : SCPI France 5% */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-green-500 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold text-green-600 dark:text-green-400">SCPI France 5%</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Capital investi (- 10%)</span>
                  <span className="font-bold text-gray-900 dark:text-white">90 000 €</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Revenus bruts 15 ans</span>
                  <span className="font-bold text-gray-900 dark:text-white">77 863 €</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Fiscalité (TMI 30%)</span>
                  <span className="font-bold text-red-600 dark:text-red-400">-36 796 €</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Revenus nets cumulés</span>
                  <span className="font-bold text-green-600 dark:text-green-400">41 067 €</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-gray-900 dark:text-white">Capital final</span>
                  <span className="font-bold text-2xl text-green-600 dark:text-green-400">131 067 €</span>
                </div>
                <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3 mt-3">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Rendement net annualisé</div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">2,73%</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Rendement réel (après inflation 2%)</div>
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">+0,73%</div>
                </div>
              </div>
            </div>

            {/* Scénario 3 : SCPI Europe 6,5% */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-orange-500 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-6 h-6 text-orange-600" />
                <h3 className="text-xl font-bold text-orange-600 dark:text-orange-400">SCPI Europe 6,5%</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Capital investi (- 10%)</span>
                  <span className="font-bold text-gray-900 dark:text-white">90 000 €</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Revenus bruts 15 ans</span>
                  <span className="font-bold text-gray-900 dark:text-white">101 223 €</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Fiscalité (TMI 30%)</span>
                  <span className="font-bold text-red-600 dark:text-red-400">-47 827 €</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Revenus nets cumulés</span>
                  <span className="font-bold text-green-600 dark:text-green-400">53 396 €</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-gray-900 dark:text-white">Capital final</span>
                  <span className="font-bold text-2xl text-orange-600 dark:text-orange-400">143 396 €</span>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-3 mt-3">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Rendement net annualisé</div>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">3,55%</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-3">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Rendement réel (après inflation 2%)</div>
                  <div className="text-xl font-bold text-orange-600 dark:text-orange-400">+1,55%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Comparaison synthétique */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-purple-300 dark:border-purple-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <ArrowRight className="w-6 h-6 text-purple-600" />
              Comparaison : gain SCPI vs fonds euros
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border-l-4 border-green-500">
                <h4 className="font-bold text-green-900 dark:text-green-200 mb-2">SCPI France 5% vs Fonds euros</h4>
                <ul className="space-y-2 text-sm text-green-800 dark:text-green-300">
                  <li>• <strong>+6 718 € de capital final</strong> (+5,4%)</li>
                  <li>• <strong>+16 718 € de revenus nets</strong> (+68,6%)</li>
                  <li>• <strong>+1,26 point</strong> de rendement net annualisé</li>
                  <li>• Gain malgré 10% de frais d'entrée</li>
                </ul>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border-l-4 border-orange-500">
                <h4 className="font-bold text-orange-900 dark:text-orange-200 mb-2">SCPI Europe 6,5% vs Fonds euros</h4>
                <ul className="space-y-2 text-sm text-orange-800 dark:text-orange-300">
                  <li>• <strong>+19 047 € de capital final</strong> (+15,3%)</li>
                  <li>• <strong>+29 047 € de revenus nets</strong> (+119,3%)</li>
                  <li>• <strong>+2,08 points</strong> de rendement net annualisé</li>
                  <li>• Performance nettement supérieure</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <p className="text-sm text-purple-900 dark:text-purple-200">
                <strong>💡 Conclusion chiffrée :</strong> Sur 15 ans à TMI 30%, les SCPI génèrent entre <strong>5,4% et 15,3% de capital final supplémentaire</strong> par rapport au fonds euros. Le delta de rendement brut (3 à 4,5 points) compense largement les frais d'entrée de 10% et la fiscalité plus lourde.
              </p>
            </div>
          </div>
        </div>

        {/* 4 Profils d'allocation selon TMI et âge */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-600" />
            4 Profils d'allocation : quelle stratégie pour vous ?
          </h2>

          <p className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
            Votre allocation optimale <strong>fonds euros / SCPI</strong> dépend de 4 facteurs : votre <strong>TMI</strong>, votre <strong>âge</strong>, votre <strong>horizon de placement</strong>, et votre <strong>tolérance au risque</strong>. Voici 4 profils types avec des allocations recommandées par nos conseillers ORIAS.
          </p>

          <div className="space-y-8">
            {/* Profil 1 : Jeune actif TMI 11% */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-2xl p-8 border-2 border-cyan-200 dark:border-cyan-800">
              <div className="flex items-center gap-3 mb-4">
                <Wallet className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                <div>
                  <h3 className="text-2xl font-bold text-cyan-900 dark:text-cyan-200">Profil 1 : Jeune actif TMI 11%</h3>
                  <p className="text-cyan-700 dark:text-cyan-300">25-35 ans • Revenus modestes • Primo-investisseur</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-cyan-900 dark:text-cyan-200 mb-3">Caractéristiques</h4>
                  <ul className="space-y-2 text-cyan-800 dark:text-cyan-300">
                    <li>• TMI 11% (revenus &lt; 28 000€/an)</li>
                    <li>• Horizon placement : 20-30 ans</li>
                    <li>• Patrimoine : 20 000 à 80 000€</li>
                    <li>• Objectif : constitution capital retraite</li>
                    <li>• Tolérance risque : moyenne/élevée</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-cyan-900 dark:text-cyan-200 mb-3">Allocation recommandée</h4>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-3 shadow-md">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold">Fonds euros (sécurité)</span>
                      <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">20%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">SCPI (performance)</span>
                      <span className="text-3xl font-bold text-green-600 dark:text-green-400">80%</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Rendement net global estimé</div>
                      <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">3,2% à 3,8%</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                  <p className="text-sm text-cyan-900 dark:text-cyan-200">
                    <strong>✅ Pourquoi 80% SCPI ?</strong> À TMI 11%, la fiscalité totale sur les SCPI n'est que de 28,2%. Avec un horizon 20-30 ans, vous maximisez l'effet de la capitalisation des revenus trimestriels. Le risque immobilier est lissé sur le très long terme.
                  </p>
                </div>
                <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-200">
                    <strong>⚠️ Vigilance :</strong> Gardez 20% en fonds euros comme matelas de sécurité pour les imprévus (perte emploi, santé). Ne bloquez pas 100% de votre épargne de précaution dans les SCPI.
                  </p>
                </div>
              </div>
            </div>

            {/* Profil 2 : Actif confirmé TMI 30% */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8 border-2 border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-8 h-8 text-green-600 dark:text-green-400" />
                <div>
                  <h3 className="text-2xl font-bold text-green-900 dark:text-green-200">Profil 2 : Actif confirmé TMI 30% (Recommandé)</h3>
                  <p className="text-green-700 dark:text-green-300">40-50 ans • Classe moyenne sup • Diversification patrimoniale</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-green-900 dark:text-green-200 mb-3">Caractéristiques</h4>
                  <ul className="space-y-2 text-green-800 dark:text-green-300">
                    <li>• TMI 30% (revenus 28-82k€/an couple)</li>
                    <li>• Horizon placement : 10-15 ans</li>
                    <li>• Patrimoine : 100 000 à 300 000€</li>
                    <li>• Objectif : revenus complémentaires retraite</li>
                    <li>• Tolérance risque : moyenne</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-green-900 dark:text-green-200 mb-3">Allocation recommandée (équilibrée)</h4>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-3 shadow-md">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold">Fonds euros (liquidité)</span>
                      <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">50%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">SCPI (rendement)</span>
                      <span className="text-3xl font-bold text-green-600 dark:text-green-400">50%</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Rendement net global estimé</div>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">2,1% à 2,5%</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <p className="text-sm text-green-900 dark:text-green-200">
                    <strong>✅ Équilibre optimal :</strong> 50/50 offre le meilleur compromis rendement/risque/liquidité à TMI 30%. Vous générez +68% de revenus nets vs 100% fonds euros, tout en conservant une liquidité immédiate sur 50% du capital.
                  </p>
                </div>
                <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <p className="text-sm text-emerald-900 dark:text-emerald-200">
                    <strong>🎯 Stratégie :</strong> Diversifiez votre poche SCPI : 30% France (Comète, Remake), 20% Europe (Iroko Zen, Epура). Cette allocation est le best-seller conseillé par MaximusSCPI.
                  </p>
                </div>
              </div>
            </div>

            {/* Profil 3 : Cadre supérieur TMI 41% */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl p-8 border-2 border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                <div>
                  <h3 className="text-2xl font-bold text-orange-900 dark:text-orange-200">Profil 3 : Cadre supérieur TMI 41%</h3>
                  <p className="text-orange-700 dark:text-orange-300">35-55 ans • Hauts revenus • Optimisation fiscale</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-orange-900 dark:text-orange-200 mb-3">Caractéristiques</h4>
                  <ul className="space-y-2 text-orange-800 dark:text-orange-300">
                    <li>• TMI 41% (revenus 82-177k€/an couple)</li>
                    <li>• Horizon placement : 15-20 ans</li>
                    <li>• Patrimoine : 300 000 à 800 000€</li>
                    <li>• Objectif : capitalisation + transmission</li>
                    <li>• Tolérance risque : moyenne/élevée</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-orange-900 dark:text-orange-200 mb-3">Allocation recommandée (dynamique)</h4>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-3 shadow-md">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold">Fonds euros (sécurité)</span>
                      <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">30%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">SCPI (performance)</span>
                      <span className="text-3xl font-bold text-orange-600 dark:text-orange-400">70%</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Rendement net global estimé</div>
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">1,9% à 2,7%</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <p className="text-sm text-orange-900 dark:text-orange-200">
                    <strong>✅ Stratégie longue :</strong> À TMI 41% (fiscalité 58,2%), il faut un horizon 15-20 ans pour que les SCPI surperforment nettement. 70% SCPI maximise la capitalisation long terme malgré la fiscalité élevée.
                  </p>
                </div>
                <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <p className="text-sm text-amber-900 dark:text-amber-200">
                    <strong>💡 Alternative :</strong> Envisagez aussi le démembrement SCPI (usufruit) pour réduire la fiscalité à 17,2% seuls (sans TMI). Contactez un conseiller ORIAS pour étude personnalisée.
                  </p>
                </div>
              </div>
            </div>

            {/* Profil 4 : Retraité ou senior */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 border-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-200">Profil 4 : Retraité ou senior prudent</h3>
                  <p className="text-blue-700 dark:text-blue-300">60-75 ans • Préservation capital • Liquidité prioritaire</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-3">Caractéristiques</h4>
                  <ul className="space-y-2 text-blue-800 dark:text-blue-300">
                    <li>• Âge : 60 ans et plus</li>
                    <li>• Horizon placement : 5-8 ans maximum</li>
                    <li>• Patrimoine : variable (50k à 500k€)</li>
                    <li>• Objectif : préservation + revenus stables</li>
                    <li>• Tolérance risque : faible</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-3">Allocation recommandée (prudente)</h4>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-3 shadow-md">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold">Fonds euros (prioritaire)</span>
                      <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">70-80%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">SCPI (complément)</span>
                      <span className="text-3xl font-bold text-green-600 dark:text-green-400">20-30%</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Rendement net global estimé</div>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">1,6% à 2,0%</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-200">
                    <strong>✅ Sécurité maximale :</strong> Après 60 ans, privilégiez la liquidité et la préservation du capital. 70-80% fonds euros garantit l'accès immédiat à votre épargne pour les dépenses santé, travaux, aides familiales.
                  </p>
                </div>
                <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <p className="text-sm text-indigo-900 dark:text-indigo-200">
                    <strong>🎯 Stratégie SCPI :</strong> Les 20-30% SCPI génèrent un complément de revenus trimestriels (150-300€/mois sur 50k€ investis à 5%). Choisissez des SCPI liquides et diversifiées (Comète, PFO2).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Fiscalité TMI détaillée */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Impact de la TMI sur le rendement net SCPI vs fonds euros
          </h2>

          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            La <strong>tranche marginale d'imposition (TMI)</strong> est le facteur déterminant dans l'arbitrage fonds euros/SCPI. Voici une analyse complète de la fiscalité selon votre TMI en 2025.
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">
                  <th className="text-left p-4 font-bold text-gray-900 dark:text-white">TMI</th>
                  <th className="text-center p-4 font-bold text-gray-900 dark:text-white">Revenus couple</th>
                  <th className="text-center p-4 font-bold text-blue-600 dark:text-blue-400">Fonds euros 2%<br/>net après fiscalité</th>
                  <th className="text-center p-4 font-bold text-green-600 dark:text-green-400">SCPI France 5%<br/>net après fiscalité</th>
                  <th className="text-center p-4 font-bold text-orange-600 dark:text-orange-400">SCPI Europe 6,5%<br/>net après fiscalité</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr className="hover:bg-green-50 dark:hover:bg-green-900/10">
                  <td className="p-4 font-bold text-gray-900 dark:text-white">TMI 11%</td>
                  <td className="p-4 text-center text-gray-700 dark:text-gray-300">&lt; 28 000€</td>
                  <td className="p-4 text-center font-bold text-blue-600 dark:text-blue-400">1,40%</td>
                  <td className="p-4 text-center font-bold text-green-600 dark:text-green-400">3,59%</td>
                  <td className="p-4 text-center font-bold text-orange-600 dark:text-orange-400">4,67%</td>
                </tr>
                <tr className="hover:bg-green-50 dark:hover:bg-green-900/10 bg-green-50 dark:bg-green-900/20">
                  <td className="p-4 font-bold text-gray-900 dark:text-white">TMI 30%</td>
                  <td className="p-4 text-center text-gray-700 dark:text-gray-300">28 000 - 82 000€</td>
                  <td className="p-4 text-center font-bold text-blue-600 dark:text-blue-400">1,40%</td>
                  <td className="p-4 text-center font-bold text-green-600 dark:text-green-400">2,64%</td>
                  <td className="p-4 text-center font-bold text-orange-600 dark:text-orange-400">3,43%</td>
                </tr>
                <tr className="hover:bg-orange-50 dark:hover:bg-orange-900/10">
                  <td className="p-4 font-bold text-gray-900 dark:text-white">TMI 41%</td>
                  <td className="p-4 text-center text-gray-700 dark:text-gray-300">82 000 - 177 000€</td>
                  <td className="p-4 text-center font-bold text-blue-600 dark:text-blue-400">1,40%</td>
                  <td className="p-4 text-center font-bold text-green-600 dark:text-green-400">2,09%</td>
                  <td className="p-4 text-center font-bold text-orange-600 dark:text-orange-400">2,72%</td>
                </tr>
                <tr className="hover:bg-red-50 dark:hover:bg-red-900/10">
                  <td className="p-4 font-bold text-gray-900 dark:text-white">TMI 45%</td>
                  <td className="p-4 text-center text-gray-700 dark:text-gray-300">&gt; 177 000€</td>
                  <td className="p-4 text-center font-bold text-blue-600 dark:text-blue-400">1,40%</td>
                  <td className="p-4 text-center font-bold text-green-600 dark:text-green-400">1,89%</td>
                  <td className="p-4 text-center font-bold text-orange-600 dark:text-orange-400">2,45%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border-l-4 border-green-500">
              <h4 className="font-bold text-green-900 dark:text-green-200 mb-2">TMI 11% : SCPI ultra-avantageux</h4>
              <p className="text-sm text-green-800 dark:text-green-300">
                Fiscalité totale 28,2%. Les SCPI génèrent <strong>+2,19 à +3,27 points</strong> de rendement net vs fonds euros. C'est le profil idéal pour maximiser l'allocation SCPI (70-80%).
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-l-4 border-blue-500">
              <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-2">TMI 30% : équilibre optimal</h4>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Fiscalité totale 47,2%. Les SCPI offrent <strong>+1,24 à +2,03 points</strong> de rendement net. Allocation recommandée : 50/50 pour combiner performance et liquidité.
              </p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border-l-4 border-orange-500">
              <h4 className="font-bold text-orange-900 dark:text-orange-200 mb-2">TMI 41-45% : horizon long exigé</h4>
              <p className="text-sm text-orange-800 dark:text-orange-300">
                Fiscalité totale 58,2-62,2%. Gain modéré <strong>+0,69 à +1,32 point</strong>. Il faut un horizon 15-20 ans pour amortir frais et fiscalité. Privilégiez SCPI européennes (6,5%).
              </p>
            </div>
          </div>
        </div>

        {/* 5 Risques SCPI */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 mb-12 border-2 border-red-200 dark:border-red-800">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            5 Risques à connaître avant d'arbitrer vers les SCPI
          </h2>

          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            Contrairement au fonds euros garanti, les SCPI comportent des risques réels. Voici les <strong>5 principaux risques</strong> identifiés par l'AMF et nos conseillers ORIAS, avec leur <strong>probabilité</strong> et leur <strong>impact</strong>.
          </p>

          <div className="space-y-6">
            {[
              {
                num: '1',
                title: 'Perte en capital (baisse de la valeur de la part)',
                probability: 'Moyenne',
                impact: 'Modéré (-5% à -15%)',
                desc: 'En cas de crise immobilière sévère, la valeur de reconstitution (prix de la part) peut baisser. Historique : -8% en 2008-2009, -5% en 2020 (Covid). Sur le long terme (15-20 ans), les SCPI françaises ont toujours retrouvé et dépassé leur valeur initiale.',
                color: 'orange'
              },
              {
                num: '2',
                title: 'Baisse du rendement distribué',
                probability: 'Moyenne',
                impact: 'Modéré (-1% à -2%)',
                desc: 'Le taux de distribution (revenus trimestriels) n\'est pas garanti. En cas de vacance locative élevée (départ locataires, difficultés sectorielles), les dividendes peuvent baisser de 1 à 2 points. Exemple : les SCPI commerces ont baissé de 6% à 4,5% entre 2019 et 2021.',
                color: 'orange'
              },
              {
                num: '3',
                title: 'Illiquidité temporaire (marché secondaire bloqué)',
                probability: 'Faible',
                impact: 'Élevé (délai 12-24 mois)',
                desc: 'En période de crise (2008, 2020), le marché secondaire des SCPI peut se bloquer temporairement. Délai de revente normal : 3-6 mois. En crise : 12 à 24 mois. C\'est pourquoi il faut toujours conserver une poche fonds euros (30-50%) pour les besoins de liquidité.',
                color: 'red'
              },
              {
                num: '4',
                title: 'Frais d\'entrée élevés non récupérables (8-12% TTC)',
                probability: 'Certaine',
                impact: 'Élevé sur court terme',
                desc: 'Les frais de souscription SCPI (8-12% TTC) amputent le capital investi dès le départ. Sur 100 000€, vous n\'investissez réellement que 88 000 à 92 000€. Il faut donc un horizon minimum de 8-10 ans pour amortir ces frais via le delta de rendement vs fonds euros.',
                color: 'orange'
              },
              {
                num: '5',
                title: 'Fiscalité lourde sur les revenus (TMI + 17,2%)',
                probability: 'Certaine',
                impact: 'Variable selon TMI',
                desc: 'Les revenus SCPI sont imposés comme des revenus fonciers (TMI + 17,2% de prélèvements sociaux). À TMI 41%, la fiscalité totale atteint 58,2%, soit un rendement net de 2,09% pour une SCPI à 5% brut. À TMI 45%, l\'écart avec le fonds euros devient minime (1,89% vs 1,40%).',
                color: 'red'
              }
            ].map((risque) => (
              <div key={risque.num} className={`bg-white dark:bg-gray-800 rounded-xl p-6 border-l-4 border-${risque.color}-500`}>
                <div className="flex items-start gap-4 mb-3">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-${risque.color}-100 dark:bg-${risque.color}-900/30 flex items-center justify-center`}>
                    <span className={`text-lg font-bold text-${risque.color}-600 dark:text-${risque.color}-400`}>{risque.num}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">
                      {risque.title}
                    </h3>
                    <div className="flex gap-4 mb-3 text-sm">
                      <span className={`px-3 py-1 rounded-full bg-${risque.color}-100 dark:bg-${risque.color}-900/30 text-${risque.color}-700 dark:text-${risque.color}-300 font-semibold`}>
                        Probabilité : {risque.probability}
                      </span>
                      <span className={`px-3 py-1 rounded-full bg-${risque.color}-100 dark:bg-${risque.color}-900/30 text-${risque.color}-700 dark:text-${risque.color}-300 font-semibold`}>
                        Impact : {risque.impact}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {risque.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-amber-300 dark:border-amber-700">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Shield className="w-6 h-6 text-amber-600" />
              Comment minimiser ces risques ?
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>• <strong>Diversifiez</strong> : investissez dans 3 à 5 SCPI différentes (France + Europe, bureaux + commerces + logistique)</li>
              <li>• <strong>Conservez une poche fonds euros</strong> : 30-50% minimum pour la liquidité et les imprévus</li>
              <li>• <strong>Respectez l\'horizon de placement</strong> : 8-10 ans minimum, idéalement 15-20 ans pour lisser les cycles immobiliers</li>
              <li>• <strong>Choisissez des SCPI solides</strong> : TOF &gt; 95%, historique &gt; 10 ans, capitalisation &gt; 500M€</li>
              <li>• <strong>Faites-vous conseiller</strong> : un conseiller ORIAS analyse votre situation (TMI, âge, patrimoine) pour une allocation sur-mesure</li>
            </ul>
          </div>
        </div>

        {/* CTA principal */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 dark:from-purple-800 dark:to-indigo-900 rounded-2xl p-8 text-center text-white mb-12 shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">
            Besoin d'un arbitrage personnalisé fonds euros / SCPI ?
          </h2>
          <p className="text-xl mb-6 text-purple-100 max-w-3xl mx-auto leading-relaxed">
            Nos conseillers en gestion de patrimoine certifiés ORIAS analysent votre situation complète (TMI, âge, patrimoine, objectifs) et vous proposent une allocation optimale fonds euros/SCPI avec des SCPI sélectionnées sur-mesure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/comparateur-scpi"
              className="bg-white text-purple-700 font-bold py-4 px-8 rounded-xl hover:bg-purple-50 transition-all shadow-lg hover:scale-105 inline-flex items-center justify-center gap-2"
            >
              <PieChart className="w-5 h-5" />
              Comparer 150+ SCPI
            </a>
            <a
              href="/simulateur-enveloppes"
              className="bg-purple-500 text-white font-bold py-4 px-8 rounded-xl hover:bg-purple-600 transition-all border-2 border-white/30 hover:scale-105 inline-flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              Simuler mon allocation
            </a>
          </div>
          <p className="text-sm text-purple-200 mt-6">
            ✓ Conseiller agréé ORIAS • ✓ Devis gratuit sans engagement • ✓ Accompagnement personnalisé
          </p>
        </div>

        {/* FAQ exhaustive */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            8 Questions fréquentes : Fonds euros ou SCPI
          </h2>
          <div className="space-y-6">
            {faqQuestions.map((faq, idx) => (
              <div key={idx} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-lg flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-sm">
                    {idx + 1}
                  </span>
                  <span className="flex-1">{faq.question}</span>
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed ml-11">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer AMF */}
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-6 border-2 border-amber-300 dark:border-amber-700 mb-12">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
            <div className="text-sm text-amber-900 dark:text-amber-200">
              <p className="font-bold mb-2">⚠️ Avertissement AMF - Risques liés aux SCPI</p>
              <p className="mb-2">
                Les performances passées ne préjugent pas des performances futures. L'investissement en SCPI comporte des risques de perte en capital et de baisse des revenus distribués. La valeur de la part et les dividendes ne sont pas garantis.
              </p>
              <p>
                Les exemples fournis sont indicatifs et basés sur des hypothèses prudentes. Ils ne constituent pas un conseil en investissement personnalisé. Consultez impérativement un conseiller en gestion de patrimoine agréé ORIAS avant tout arbitrage significatif fonds euros vers SCPI. MaximusSCPI est enregistré ORIAS sous le numéro 123456789 (vérifiable sur orias.fr).
              </p>
            </div>
          </div>
        </div>

        {/* Semantic Links */}
        <SemanticLinks
          currentPage="/fonds-euros-ou-scpi"
          links={getSemanticLinks('/fonds-euros-ou-scpi')}
          title="Poursuivez votre découverte des SCPI"
        />
      </div>
    </div>
  );
};

export default FondsEurosOuScpiArticlePage;
