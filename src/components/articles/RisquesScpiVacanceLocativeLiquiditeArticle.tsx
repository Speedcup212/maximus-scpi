import React from 'react';
import { Building2, Shield, TrendingUp, AlertTriangle, CheckCircle2, Euro, Users, Target, User, Calendar, Clock, BarChart3, BookOpen, Scale, Lightbulb, Eye, Calculator, TrendingDown, Lock, Home, DollarSign, FileText } from 'lucide-react';
import ArticleCtaBlock from '../ArticleCtaBlock';

export const RisquesScpiVacanceLocativeLiquiditeArticle: React.FC = () => {
  return (
    <div className="space-y-12">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-8 border border-blue-100 dark:border-gray-700">
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <li><a href="/" className="hover:text-blue-600 dark:hover:text-blue-400">Accueil</a></li>
            <li>/</li>
            <li><a href="/education" className="hover:text-blue-600 dark:hover:text-blue-400">Éducation</a></li>
            <li>/</li>
            <li className="text-gray-900 dark:text-white font-semibold">Quels sont les risques des SCPI ? Analyse complète et transparente</li>
          </ol>
        </nav>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-sm font-semibold rounded-full">
            Risques
          </span>
          <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-sm font-semibold rounded-full">
            Transparence
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          Risques des SCPI : vacance locative, liquidité et gestion — analyse transparente 2025
        </h1>

        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Éric Bellaiche, CGP</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>21 janvier 2025</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>12 min de lecture</span>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <p className="text-xl text-gray-800 dark:text-gray-200 leading-relaxed mb-6">
          Les SCPI offrent un rendement attractif (4,5-6,5% brut en 2025), mais comme tout investissement, elles comportent des risques qu'il est essentiel de comprendre avant d'investir. <strong>Vacance locative, liquidité limitée, risque de marché, qualité de gestion</strong> : ce guide transparent vous explique chaque risque en détail, avec des données chiffrées réelles, des exemples concrets de SCPI en difficulté, et surtout, les stratégies pour les atténuer efficacement.
        </p>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-l-4 border-blue-500">
          <p className="text-gray-900 dark:text-white font-bold mb-3 text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            Ce que vous allez découvrir :
          </p>
          <ul className="space-y-2 text-gray-800 dark:text-gray-200">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Les 4 risques majeurs : vacance locative, liquidité, baisse de valeur, qualité de gestion</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Données chiffrées 2023-2025 : taux de vacance, taux de liquidité, variations de prix de part</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Exemples réels de SCPI en difficulté et leçons à en tirer</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Stratégies de diversification : combien de SCPI, quels secteurs, quelles zones géographiques</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Indicateurs clés pour détecter une SCPI à risque avant d'investir</span>
            </li>
          </ul>
        </div>
      </section>

      <ArticleCtaBlock variant="top" topic="risques" />

      {/* Risque 1 : Vacance locative */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Home className="w-8 h-8 text-red-600" />
          Risque n°1 : La vacance locative
        </h2>

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          La <strong>vacance locative</strong> (ou taux d'occupation financier) mesure le pourcentage d'actifs loués dans le patrimoine d'une SCPI. Un taux d'occupation de 95% signifie que 5% des surfaces sont vacantes et ne génèrent aucun loyer. C'est le <strong>risque principal</strong> qui impacte directement vos revenus.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border-l-4 border-green-500">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Excellent</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
              Taux d'occupation {'>'} 95%
            </p>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>• Impact faible sur distribution</li>
              <li>• Gestion locative performante</li>
              <li>• Exemples : SCPI prime (Primonial, Perial)</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-6 border-l-4 border-orange-500">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">À surveiller</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
              Taux d'occupation 90-95%
            </p>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>• Baisse distribution 5-10%</li>
              <li>• Rotation locative normale</li>
              <li>• Vérifier tendance sur 3 ans</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-6 border-l-4 border-red-500">
            <div className="flex items-center gap-3 mb-4">
              <TrendingDown className="w-8 h-8 text-red-600" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Risque élevé</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
              Taux d'occupation {'<'} 90%
            </p>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>• Baisse distribution {'>'} 15%</li>
              <li>• Difficulté relocation</li>
              <li>• {'⚠'} Éviter nouveaux investissements</li>
            </ul>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Exemple réel : SCPI de bureaux en 2020-2023</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Avec le télétravail post-COVID, certaines SCPI de bureaux ont vu leur taux d'occupation chuter de <strong>97% à 88%</strong> entre 2020 et 2023.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <p className="font-bold text-red-900 dark:text-red-200 mb-2">Impact sur distribution</p>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>• 2019 : 5,50 €/part</li>
                <li>• 2023 : 4,62 €/part</li>
                <li>• <strong>Baisse : -16%</strong></li>
              </ul>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <p className="font-bold text-blue-900 dark:text-blue-200 mb-2">Stratégie de résilience</p>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>• Diversification sectorielle</li>
                <li>• SCPI multi-actifs</li>
                <li>• Éviter mono-secteur bureaux</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      

      {/* Risque 2 : Liquidité */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Lock className="w-8 h-8 text-orange-600" />
          Risque n°2 : La liquidité limitée
        </h2>

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          Contrairement aux actions ou aux fonds monétaires, vous <strong>ne pouvez pas revendre vos parts de SCPI instantanément</strong>. La revente dépend du marché secondaire organisé par la société de gestion, qui confronte vendeurs et acheteurs périodiquement (mensuellement ou trimestriellement).
        </p>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Délais de revente selon l'enveloppe</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-gray-900 dark:text-white">Enveloppe</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-900 dark:text-white">Délai moyen</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-900 dark:text-white">Garantie liquidité</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-900 dark:text-white">Niveau de risque</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Assurance-vie</td>
                  <td className="px-4 py-3 text-green-600 font-bold">48-72h</td>
                  <td className="px-4 py-3 text-green-600 font-bold">Oui</td>
                  <td className="px-4 py-3 text-green-600">Très faible</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">PER</td>
                  <td className="px-4 py-3 text-green-600 font-bold">48-72h</td>
                  <td className="px-4 py-3 text-green-600 font-bold">Oui</td>
                  <td className="px-4 py-3 text-green-600">Très faible</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">SCPI capitalisées (direct)</td>
                  <td className="px-4 py-3 text-blue-600 font-bold">1-3 mois</td>
                  <td className="px-4 py-3 text-orange-600 font-bold">Non</td>
                  <td className="px-4 py-3 text-orange-600">Modéré</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">SCPI distribution (direct)</td>
                  <td className="px-4 py-3 text-orange-600 font-bold">2-6 mois</td>
                  <td className="px-4 py-3 text-red-600 font-bold">Non</td>
                  <td className="px-4 py-3 text-red-600">Élevé</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-6 border-l-4 border-red-500">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Cas critique : SCPI peu liquide</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
              Certaines SCPI affichent un <strong>taux de liquidité {'<'} 50%</strong>, ce qui signifie que seulement la moitié des demandes de revente sont satisfaites.
            </p>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>• File d'attente : 12-24 mois</li>
              <li>• Décote possible : -10 à -20%</li>
              <li>• Capital bloqué temporairement</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-l-4 border-blue-500">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Solutions pour limiter ce risque</h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                <span><strong>Privilégier l'assurance-vie</strong> pour liquidité garantie 48-72h</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                <span><strong>Vérifier taux de liquidité</strong> {'>'} 90% avant investissement</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                <span><strong>Investir à long terme</strong> (10+ ans) pour ne pas subir ce risque</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                <span><strong>Choisir SCPI leaders</strong> avec forte demande (Primonial, Perial, Sofidy)</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
      

      <ArticleCtaBlock variant="middle" topic="risques" />

      {/* Risque 3 : Valeur du capital et marché */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <TrendingDown className="w-8 h-8 text-purple-600" />
          Risque n°3 : Baisse de la valeur des parts
        </h2>

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          La <strong>valeur de reconstitution</strong> d'une part de SCPI dépend de la valeur d'expertise des actifs immobiliers détenus. En cas de baisse du marché immobilier, la valeur de vos parts peut diminuer. Ce risque est modéré sur le long terme mais peut impacter votre capital à court terme.
        </p>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Évolution prix de part (exemple réel 2019-2024)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-gray-900 dark:text-white">Année</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-900 dark:text-white">Prix souscription</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-900 dark:text-white">Valeur reconstitution</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-900 dark:text-white">Évolution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">2019</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">1 000 €</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">920 €</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">—</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">2021</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">1 050 €</td>
                  <td className="px-4 py-3 text-green-600 font-bold">985 €</td>
                  <td className="px-4 py-3 text-green-600">+7%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">2023</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">1 050 €</td>
                  <td className="px-4 py-3 text-red-600 font-bold">950 €</td>
                  <td className="px-4 py-3 text-red-600">-3,5%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">2024</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">1 080 €</td>
                  <td className="px-4 py-3 text-green-600 font-bold">970 €</td>
                  <td className="px-4 py-3 text-green-600">+2%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-4">
            <strong>Sur 5 ans (2019-2024) :</strong> +5,4% de valorisation, mais avec volatilité intermédiaire.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Facteurs de baisse</h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>• <strong>Hausse des taux d'intérêt</strong> : rend l'immobilier moins attractif</li>
              <li>• <strong>Crise économique</strong> : baisse demande locative et valeurs</li>
              <li>• <strong>Obsolescence actifs</strong> : bureaux non conformes normes ESG</li>
              <li>• <strong>Suroffre sectorielle</strong> : trop de commerces disponibles</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Protection long terme</h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                <span><strong>Horizon 10+ ans</strong> : cycles immobiliers de 7-10 ans se lissent</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                <span><strong>Revenus réguliers</strong> : compensent variations de capital</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                <span><strong>Diversification</strong> : multi-secteurs et zones géographiques</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                <span><strong>Actifs prime</strong> : résilience supérieure en crise</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Risque 4 : Qualité de gestion */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          Risque n°4 : Qualité de la société de gestion
        </h2>

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          La performance d'une SCPI dépend à <strong>80% de la qualité de sa société de gestion</strong> : expertise en sélection d'actifs, capacité de négociation, stratégie locative, gestion des travaux. Une mauvaise gestion peut entraîner baisse de distribution, vacance élevée et perte de valeur.
        </p>

        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 border-l-4 border-amber-500 mb-6">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Indicateurs de qualité de gestion</h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>• <strong>Ancienneté</strong> : société existante depuis 10+ ans</li>
                <li>• <strong>Actifs sous gestion</strong> : {'>'} 3 milliards € (économies d'échelle)</li>
                <li>• <strong>Historique distribution</strong> : stabilité sur 10 ans, pas de baisse brutale</li>
                <li>• <strong>Taux occupation</strong> : maintenu {'>'} 93% sur longue période</li>
                <li>• <strong>Report à nouveau</strong> : réserves {'>'} 6 mois de distribution</li>
                <li>• <strong>Transparence</strong> : rapports trimestriels détaillés, assemblées générales</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Leaders du marché</h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>• Primonial REIM</li>
              <li>• Perial Asset Management</li>
              <li>• Sofidy</li>
              <li>• Atland Voisin</li>
              <li>• Swiss Life AM</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Acteurs sérieux</h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>• La Française REM</li>
              <li>• Amundi Immobilier</li>
              <li>• Alderan</li>
              <li>• Paref Gestion</li>
              <li>• Sogenial Immobilier</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{'⚠'} Signaux d'alerte</h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>• Société récente ({'<'} 5 ans)</li>
              <li>• Promesses rendement {'>'} 7%</li>
              <li>• Frais gestion {'>'} 12%</li>
              <li>• Manque transparence</li>
              <li>• Concentrat° sectorielle/géo</li>
            </ul>
          </div>
        </div>
      </section>
      

      {/* Stratégies de diversification */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Target className="w-8 h-8 text-green-600" />
          Stratégies de diversification pour minimiser les risques
        </h2>

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          La <strong>diversification</strong> est la stratégie la plus efficace pour réduire les risques SCPI. En répartissant votre capital sur plusieurs SCPI de secteurs et zones géographiques différents, vous limitez l'impact d'une défaillance ponctuelle.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Investissement 30 000 €</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3"><strong>3 SCPI minimum</strong></p>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>• 40% : SCPI bureaux France</li>
              <li>• 30% : SCPI commerces Europe</li>
              <li>• 30% : SCPI santé/logistique</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Investissement 80 000 €</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3"><strong>5 SCPI optimales</strong></p>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>• 25% : Bureaux prime Paris</li>
              <li>• 20% : Commerces Europe</li>
              <li>• 20% : Santé/EHPAD</li>
              <li>• 20% : Logistique e-commerce</li>
              <li>• 15% : Résidentiel/habitat</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Investissement 150 000 €+</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3"><strong>6-8 SCPI diversifiées</strong></p>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>• 20% : Bureaux France</li>
              <li>• 15% : Bureaux Europe</li>
              <li>• 15% : Commerces</li>
              <li>• 15% : Santé</li>
              <li>• 15% : Logistique</li>
              <li>• 10% : Résidentiel</li>
              <li>• 10% : SCPI fiscales</li>
            </ul>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border-l-4 border-amber-500">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Règles d'or de la diversification</h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>• <strong>Nombre de SCPI</strong> : 3 minimum, 5-6 optimal pour {'>'} 50 000 €</li>
                <li>• <strong>Secteurs</strong> : minimum 3 secteurs différents (bureaux, commerces, santé...)</li>
                <li>• <strong>Géographie</strong> : mix France + Europe pour diversification monétaire</li>
                <li>• <strong>Sociétés de gestion</strong> : 3-4 gestionnaires différents minimum</li>
                <li>• <strong>Aucune SCPI</strong> ne doit représenter {'>'} 40% de votre allocation totale</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Indicateurs de surveillance */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Eye className="w-8 h-8 text-blue-600" />
          Indicateurs à surveiller annuellement
        </h2>

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          Pour détecter précocement une SCPI en difficulté et adapter votre stratégie, surveillez ces <strong>5 indicateurs clés</strong> chaque année :
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">1. Taux d'occupation financier (TOF)</h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>• {'✅'} {'>'} 95% : excellent</li>
              <li>• {'⚠'} 90-95% : à surveiller</li>
              <li>• {'🚨'} {'<'} 90% : signal d'alerte</li>
              <li className="pt-2"><strong>Action</strong> : si baisse 3% sur 2 ans, investiguer causes</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">2. Distribution par part</h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>• {'✅'} Croissance ou stabilité</li>
              <li>• {'⚠'} Baisse {'<'} 5% : temporaire</li>
              <li>• {'🚨'} Baisse {'>'} 10% : problème structurel</li>
              <li className="pt-2"><strong>Action</strong> : baisse 15%+, envisager sortie</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">3. Taux de liquidité</h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>• {'✅'} {'>'} 90% : liquidité normale</li>
              <li>• {'⚠'} 70-90% : début tensions</li>
              <li>• {'🚨'} {'<'} 70% : marché secondaire tendu</li>
              <li className="pt-2"><strong>Action</strong> : si {'<'} 50% pendant 6 mois, anticiper sortie</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">4. Valeur de reconstitution</h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>• {'✅'} Croissance annuelle 1-3%</li>
              <li>• {'⚠'} Stagnation 2+ ans</li>
              <li>• {'🚨'} Baisse {'>'} 5% en 1 an</li>
              <li className="pt-2"><strong>Action</strong> : baisse 10%+, vérifier expertise actifs</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">5. Report à nouveau</h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>• {'✅'} {'>'} 6 mois distribution : sain</li>
              <li>• {'⚠'} 3-6 mois : correct</li>
              <li>• {'🚨'} {'<'} 3 mois : vulnérable</li>
              <li className="pt-2"><strong>Action</strong> : si proche zéro, risque baisse imminente</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Où trouver ces infos ?</h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>• <strong>Bulletins trimestriels</strong> de la société de gestion</li>
              <li>• <strong>Rapport annuel</strong> complet de la SCPI</li>
              <li>• Site web de l'<strong>AMF</strong> (Autorité des Marchés Financiers)</li>
              <li>• Comparateurs indépendants (France SCPI, Netinvestissement)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Questions fréquentes</h2>

        <div className="space-y-6">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Peut-on perdre son capital en SCPI ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Oui, il existe un <strong>risque de perte en capital</strong>. Si le marché immobilier baisse ou si la SCPI est mal gérée, la valeur de vos parts peut diminuer. Cependant, ce risque est <strong>modéré sur le long terme</strong> (10+ ans) car l'immobilier physique conserve une valeur intrinsèque. Les revenus distribués compensent partiellement les baisses temporaires. La diversification sur plusieurs SCPI réduit fortement ce risque.
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Quel est le risque principal des SCPI ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Le <strong>risque principal est la vacance locative</strong>, qui impacte directement vos revenus. Si le taux d'occupation baisse de 95% à 85%, vos distributions peuvent chuter de 10-15%. Pour limiter ce risque : diversifiez sur 4-6 SCPI de secteurs différents, vérifiez l'historique d'occupation sur 5 ans, et privilégiez les sociétés de gestion reconnues (Primonial, Perial, Sofidy).
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Comment éviter une SCPI en difficulté ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Vérifiez 5 indicateurs avant d'investir : (1) <strong>Taux d'occupation {'>'} 93%</strong> sur 3 ans, (2) <strong>Distribution stable</strong> sur 5 ans (pas de baisse {'>'} 10%), (3) <strong>Taux de liquidité {'>'} 85%</strong>, (4) <strong>Société de gestion réputée</strong> avec 10+ ans d'historique, (5) <strong>Report à nouveau {'>'} 6 mois</strong> de distribution. Évitez les SCPI récentes ({'<'} 5 ans) et celles promettant des rendements irréalistes ({'>'} 7% brut).
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Que faire si ma SCPI baisse sa distribution ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Baisse {'<'} 5% :</strong> Normal, conjoncture temporaire, patience. <strong>Baisse 5-10% :</strong> Analyser les causes (vacance ? travaux importants ?), surveiller sur 2 trimestres. <strong>Baisse {'>'} 15% :</strong> Signal d'alerte, vérifier taux d'occupation et marché secondaire, envisager sortie si dégradation continue sur 6+ mois. Toujours diversifier pour compenser une SCPI en difficulté par les autres.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Combien de SCPI pour bien diversifier ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Minimum 3 SCPI</strong> pour 30 000 € investis, <strong>idéalement 5-6 SCPI</strong> pour 80 000 €+. Diversifiez sur 3+ secteurs (bureaux, commerces, santé, logistique), 2+ zones géo (France + Europe), et 3+ sociétés de gestion différentes. Aucune SCPI ne doit dépasser 40% de votre allocation totale. Plus vous diversifiez, plus vous réduisez le risque de baisse de revenus ou de perte de capital.
            </p>
          </div>
        </div>
      </section>

      {/* Conclusion + CTA */}
      <section className="bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-800 dark:to-orange-800 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-4">Conclusion : Risques SCPI maîtrisés = investissement serein</h2>
        <div className="space-y-4 text-lg text-red-50">
          <p>
            Les SCPI comportent des risques réels — <strong>vacance locative, liquidité limitée, variation de valeur, qualité de gestion</strong> — mais ils sont <strong>largement maîtrisables</strong> avec une stratégie adaptée. L'immobilier papier n'est pas un placement garanti, mais c'est un actif résilient sur le long terme quand il est correctement diversifié.
          </p>
          <p>
            Les clés du succès : <strong>diversifier sur 4-6 SCPI minimum</strong>, privilégier l'assurance-vie pour la liquidité, investir avec un horizon 10+ ans, vérifier les 5 indicateurs clés (occupation, distribution, liquidité, valeur, réserves), et choisir des sociétés de gestion reconnues. Un investissement SCPI bien construit offre un rendement net de 3,5% à 5,5% selon votre fiscalité, avec une volatilité bien inférieure aux actions.
          </p>

          <div className="bg-white/10 rounded-lg p-6 mt-6">
            <h3 className="text-xl font-bold mb-3">{'🛡'} Besoin d'aide pour sécuriser votre investissement SCPI ?</h3>
            <p className="mb-4">
              Notre équipe analyse gratuitement votre portefeuille actuel ou votre projet d'investissement pour identifier les risques et vous recommander une stratégie optimale et diversifiée.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="/comparateur-scpi"
                className="inline-flex items-center px-6 py-3 bg-white text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors"
              >
                Comparer les SCPI sécurisées
              </a>
              <a
                href="/simulateur-enveloppes"
                className="inline-flex items-center px-6 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-400 transition-colors"
              >
                Simuler ma diversification
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RisquesScpiVacanceLocativeLiquiditeArticle;
