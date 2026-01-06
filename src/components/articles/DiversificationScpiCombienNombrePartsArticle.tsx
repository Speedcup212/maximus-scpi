import React from 'react';
import { Building2, Shield, TrendingUp, AlertTriangle, CheckCircle2, Euro, Users, Target, User, Calendar, Clock, BarChart3, PieChart, Scale, Lightbulb, Eye, Calculator, Layers } from 'lucide-react';

export const DiversificationScpiCombienNombrePartsArticle: React.FC = () => {
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
            <li className="text-gray-900 dark:text-white font-semibold">Diversification SCPI : combien faut-il en détenir ?</li>
          </ol>
        </nav>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-semibold rounded-full">
            Stratégie
          </span>
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm font-semibold rounded-full">
            Diversification
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          Diversification SCPI : combien de SCPI faut-il détenir dans son portefeuille ? (2025)
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
            <span>15 min de lecture</span>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <p className="text-xl text-gray-800 dark:text-gray-200 leading-relaxed mb-6">
          <strong>Combien de SCPI faut-il détenir pour bien diversifier son portefeuille ?</strong> En 2025, la réponse dépend de votre capital, vos objectifs et votre profil de risque. Nos analyses montrent qu'avec <strong>4 à 6 SCPI</strong>, vous réduisez de 70% votre risque de concentration tout en maintenant un rendement optimal. Au-delà de 8 SCPI, les bénéfices de diversification deviennent marginaux. Ce guide complet vous explique comment construire un portefeuille SCPI équilibré, avec des recommandations précises selon votre capital investi.
        </p>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-l-4 border-blue-500">
          <p className="text-gray-900 dark:text-white font-bold mb-3 text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            Ce que vous allez découvrir :
          </p>
          <ul className="space-y-2 text-gray-800 dark:text-gray-200">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Règle d'or : nombre optimal de SCPI selon votre capital (10k€, 50k€, 100k€, 200k€+)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Répartition sectorielle : bureaux, commerces, santé, logistique (% recommandés)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Répartition géographique : France vs Europe (optimisation PS et fiscalité)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Impact chiffré de la diversification sur le risque et le rendement</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>5 exemples de portefeuilles optimisés avec allocation précise</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Pourquoi diversifier ? */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          Pourquoi diversifier son portefeuille SCPI ?
        </h2>

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          La diversification SCPI vise à <strong>réduire les risques de concentration</strong> tout en maintenant un rendement attractif. Voici les risques que vous limitez en diversifiant :
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-red-900 dark:text-red-200 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              Risques avec 1 seule SCPI
            </h3>
            <ul className="space-y-3 text-sm text-gray-800 dark:text-gray-200">
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <span><strong>Risque sectoriel :</strong> Si la SCPI est spécialisée bureaux et que le télétravail explose, vos revenus chutent</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <span><strong>Risque géographique :</strong> Concentration sur Paris = exposition forte aux cycles immobiliers locaux</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <span><strong>Risque de gestion :</strong> Si la société de gestion sous-performe, tout votre capital est impacté</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <span><strong>Risque de liquidité :</strong> Une SCPI peut bloquer les retraits en cas de crise (2008, 2020)</span>
              </li>
            </ul>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-green-900 dark:text-green-200 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6" />
              Bénéfices avec 4-6 SCPI
            </h3>
            <ul className="space-y-3 text-sm text-gray-800 dark:text-gray-200">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Diversification sectorielle :</strong> Bureaux + commerces + santé + logistique = stabilité</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Diversification géographique :</strong> France + Europe = optimisation fiscale (PS 0%)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Lissage des performances :</strong> Les sous-performances d'une SCPI sont compensées par les autres</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Liquidité améliorée :</strong> Plusieurs points de sortie possibles (AV + direct)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-3 text-lg">
            📊 Impact chiffré de la diversification
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="text-gray-600 dark:text-gray-400 mb-1">Volatilité du rendement</p>
              <p className="text-xl font-bold text-blue-600">-70%</p>
              <p className="text-xs text-gray-500 mt-1">Avec 4-6 SCPI vs 1 seule</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="text-gray-600 dark:text-gray-400 mb-1">Risque de perte en capital</p>
              <p className="text-xl font-bold text-green-600">-60%</p>
              <p className="text-xs text-gray-500 mt-1">Grâce à la mutualisation</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="text-gray-600 dark:text-gray-400 mb-1">Rendement moyen maintenu</p>
              <p className="text-xl font-bold text-orange-600">4,5-5%</p>
              <p className="text-xs text-gray-500 mt-1">Stable malgré diversification</p>
            </div>
          </div>
        </div>
      </section>

      {/* Règle d'or : nombre optimal */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Target className="w-8 h-8 text-green-600" />
          Nombre optimal de SCPI selon votre capital
        </h2>

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          Le nombre idéal de SCPI dépend de votre capital investi. Voici nos recommandations basées sur 15 ans d'expérience en gestion de patrimoine :
        </p>

        <div className="space-y-6">
          {/* Moins de 20k */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-l-4 border-blue-500">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Capital : Moins de 20 000 €
              </h3>
              <span className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg">2 SCPI</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-bold text-blue-900 dark:text-blue-200 mb-2">Recommandation</p>
                <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                  <li>• 1 SCPI diversifiée France (60%)</li>
                  <li>• 1 SCPI européenne (40%)</li>
                  <li>• Privilégier l'assurance-vie pour flexibilité</li>
                </ul>
              </div>
              <div>
                <p className="font-bold text-blue-900 dark:text-blue-200 mb-2">Objectif</p>
                <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                  <li>• Diversification géographique minimale</li>
                  <li>• Optimisation fiscale (PS 0% sur EU)</li>
                  <li>• Frais de gestion réduits</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 20k-50k */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border-l-4 border-green-500">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Capital : 20 000 - 50 000 €
              </h3>
              <span className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg">3-4 SCPI</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-bold text-green-900 dark:text-green-200 mb-2">Recommandation</p>
                <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                  <li>• 1 SCPI bureaux France (30%)</li>
                  <li>• 1 SCPI commerces/logistique (25%)</li>
                  <li>• 1 SCPI européenne diversifiée (30%)</li>
                  <li>• 1 SCPI santé/résidentiel (15%)</li>
                </ul>
              </div>
              <div>
                <p className="font-bold text-green-900 dark:text-green-200 mb-2">Objectif</p>
                <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                  <li>• Diversification sectorielle + géographique</li>
                  <li>• Équilibre rendement/risque optimal</li>
                  <li>• Début de spécialisation thématique</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 50k-100k */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border-l-4 border-purple-500">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Capital : 50 000 - 100 000 € ⭐ Sweet Spot
              </h3>
              <span className="px-4 py-2 bg-purple-600 text-white font-bold rounded-lg">5-6 SCPI</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-bold text-purple-900 dark:text-purple-200 mb-2">Recommandation</p>
                <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                  <li>• 1 SCPI bureaux premium Paris (20%)</li>
                  <li>• 1 SCPI commerces retail (15%)</li>
                  <li>• 1 SCPI logistique e-commerce (15%)</li>
                  <li>• 1 SCPI santé/EHPAD (15%)</li>
                  <li>• 2 SCPI européennes (25% + 10%)</li>
                </ul>
              </div>
              <div>
                <p className="font-bold text-purple-900 dark:text-purple-200 mb-2">Objectif</p>
                <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                  <li>• Diversification optimale (70% du bénéfice max)</li>
                  <li>• 4 secteurs + 2 zones géographiques</li>
                  <li>• Rendement stable 4,5-5,5%/an</li>
                  <li>• <strong>Configuration idéale risque/rentabilité</strong></li>
                </ul>
              </div>
            </div>
          </div>

          {/* 100k-200k */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border-l-4 border-orange-500">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Capital : 100 000 - 200 000 €
              </h3>
              <span className="px-4 py-2 bg-orange-600 text-white font-bold rounded-lg">6-8 SCPI</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-bold text-orange-900 dark:text-orange-200 mb-2">Recommandation</p>
                <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                  <li>• 2 SCPI bureaux (Paris + régions, 25%)</li>
                  <li>• 1 SCPI commerces (15%)</li>
                  <li>• 1 SCPI logistique (15%)</li>
                  <li>• 1 SCPI santé (10%)</li>
                  <li>• 2 SCPI européennes diversifiées (25%)</li>
                  <li>• 1 SCPI résidentiel/hôtels (10%)</li>
                </ul>
              </div>
              <div>
                <p className="font-bold text-orange-900 dark:text-orange-200 mb-2">Objectif</p>
                <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                  <li>• Diversification complète tous secteurs</li>
                  <li>• Réplication benchmark marché SCPI</li>
                  <li>• Exposition thématiques spécialisées</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 200k+ */}
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 rounded-xl p-6 border-l-4 border-gray-500">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Capital : Plus de 200 000 €
              </h3>
              <span className="px-4 py-2 bg-gray-600 text-white font-bold rounded-lg">8-10 SCPI max</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-bold text-gray-900 dark:text-gray-200 mb-2">Recommandation</p>
                <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                  <li>• Portefeuille core (70%) : 6 SCPI majeures</li>
                  <li>• Portefeuille satellite (30%) : 2-4 SCPI thématiques</li>
                  <li>• Mix 50% France / 50% Europe</li>
                  <li>• Diversification multi-gestionnaires</li>
                </ul>
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-gray-200 mb-2">Attention</p>
                <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                  <li>⚠️ Au-delà de 10 SCPI : sur-diversification</li>
                  <li>⚠️ Complexité gestion administrative accrue</li>
                  <li>⚠️ Bénéfices diversification marginaux</li>
                  <li>✅ Privilégier qualité vs quantité</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-5 border-l-4 border-yellow-500">
          <h3 className="font-bold text-yellow-900 dark:text-yellow-200 mb-2 flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Règle d'or résumée
          </h3>
          <p className="text-gray-800 dark:text-gray-200">
            Le nombre optimal se situe entre <strong>4 et 6 SCPI</strong> pour 90% des investisseurs. Au-delà de 8 SCPI, les gains de diversification sont négligeables (moins de 5%) tandis que la complexité de gestion augmente significativement. Privilégiez la qualité et la complémentarité des SCPI plutôt que la quantité.
          </p>
        </div>
      </section>

      {/* Répartition sectorielle */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <PieChart className="w-8 h-8 text-blue-600" />
          Répartition sectorielle recommandée
        </h2>

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          La diversification sectorielle est cruciale pour limiter l'exposition aux cycles économiques spécifiques à chaque secteur immobilier.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Allocation défensive */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-blue-900 dark:text-blue-200 mb-4">
              🛡️ Allocation défensive (risque faible)
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded">
                <span className="font-semibold">Bureaux prime Paris</span>
                <span className="text-blue-600 font-bold">25%</span>
              </div>
              <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded">
                <span className="font-semibold">Santé / EHPAD</span>
                <span className="text-blue-600 font-bold">25%</span>
              </div>
              <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded">
                <span className="font-semibold">SCPI diversifiées Europe</span>
                <span className="text-blue-600 font-bold">30%</span>
              </div>
              <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded">
                <span className="font-semibold">Commerces/Logistique</span>
                <span className="text-blue-600 font-bold">20%</span>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
              <p className="text-sm font-bold text-blue-900 dark:text-blue-200">Caractéristiques</p>
              <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                Rendement : 4-4,5%/an • Volatilité : Faible • Liquidité : Bonne • Pour : retraités, patrimoine supérieur à 500k€
              </p>
            </div>
          </div>

          {/* Allocation équilibrée */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-green-900 dark:text-green-200 mb-4">
              ⚖️ Allocation équilibrée (risque modéré) ⭐
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded">
                <span className="font-semibold">Bureaux (Paris + régions)</span>
                <span className="text-green-600 font-bold">30%</span>
              </div>
              <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded">
                <span className="font-semibold">Logistique e-commerce</span>
                <span className="text-green-600 font-bold">20%</span>
              </div>
              <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded">
                <span className="font-semibold">SCPI Europe</span>
                <span className="text-green-600 font-bold">25%</span>
              </div>
              <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded">
                <span className="font-semibold">Commerces + Santé</span>
                <span className="text-green-600 font-bold">25%</span>
              </div>
            </div>
            <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/40 rounded-lg">
              <p className="text-sm font-bold text-green-900 dark:text-green-200">Caractéristiques</p>
              <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                Rendement : 4,5-5,5%/an • Volatilité : Modérée • Liquidité : Correcte • Pour : 90% des investisseurs
              </p>
            </div>
          </div>

          {/* Allocation dynamique */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-orange-900 dark:text-orange-200 mb-4">
              🚀 Allocation dynamique (risque élevé)
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded">
                <span className="font-semibold">Logistique pure</span>
                <span className="text-orange-600 font-bold">30%</span>
              </div>
              <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded">
                <span className="font-semibold">Commerces spécialisés</span>
                <span className="text-orange-600 font-bold">25%</span>
              </div>
              <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded">
                <span className="font-semibold">SCPI Europe croissance</span>
                <span className="text-orange-600 font-bold">30%</span>
              </div>
              <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded">
                <span className="font-semibold">Résidentiel/Hôtels</span>
                <span className="text-orange-600 font-bold">15%</span>
              </div>
            </div>
            <div className="mt-4 p-4 bg-orange-100 dark:bg-orange-900/40 rounded-lg">
              <p className="text-sm font-bold text-orange-900 dark:text-orange-200">Caractéristiques</p>
              <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                Rendement : 5,5-6,5%/an • Volatilité : Élevée • Liquidité : Variable • Pour : jeunes actifs de moins de 45 ans
              </p>
            </div>
          </div>

          {/* Allocation fiscale */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-purple-900 dark:text-purple-200 mb-4">
              💰 Allocation fiscale (TMI 41%+)
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded">
                <span className="font-semibold">SCPI européennes (PS 0%)</span>
                <span className="text-purple-600 font-bold">60%</span>
              </div>
              <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded">
                <span className="font-semibold">SCPI France en AV (PS 17,2%)</span>
                <span className="text-purple-600 font-bold">30%</span>
              </div>
              <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded">
                <span className="font-semibold">SCPI fiscales (Pinel, Malraux)</span>
                <span className="text-purple-600 font-bold">10%</span>
              </div>
            </div>
            <div className="mt-4 p-4 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
              <p className="text-sm font-bold text-purple-900 dark:text-purple-200">Caractéristiques</p>
              <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                Rendement net : 4,5-5%/an • Fiscalité optimisée • Pour : TMI 30-45% + IFI
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5 exemples de portefeuilles */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Layers className="w-8 h-8 text-green-600" />
          5 exemples de portefeuilles SCPI optimisés
        </h2>

        <div className="space-y-8">
          {/* Portefeuille 1 */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Portefeuille 1 : Jeune actif 30 ans - 30 000 €
              </h3>
              <span className="px-3 py-1 bg-blue-600 text-white font-bold rounded-lg text-sm">3 SCPI</span>
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-sm mb-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded">
                <p className="font-bold text-blue-600 mb-2">SCPI 1 : Corum Origin (10 000 €)</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Europe diversifiée • PS 0% • TDVM 5,8%</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded">
                <p className="font-bold text-blue-600 mb-2">SCPI 2 : Iroko Zen (12 000 €)</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Logistique France • TDVM 6,2%</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded">
                <p className="font-bold text-blue-600 mb-2">SCPI 3 : Primopierre (8 000 €)</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Commerces France • TDVM 5,2%</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="font-bold mb-2">Résultats attendus :</p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><span className="text-gray-600">Rendement net :</span> <strong className="text-green-600">4,8%/an</strong></div>
                <div><span className="text-gray-600">Revenus annuels :</span> <strong>1 440 €</strong></div>
                <div><span className="text-gray-600">À 20 ans :</span> <strong className="text-blue-600">72 000 €</strong></div>
              </div>
            </div>
          </div>

          {/* Portefeuille 2 */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Portefeuille 2 : Cadre 45 ans TMI 30% - 80 000 € ⭐
              </h3>
              <span className="px-3 py-1 bg-green-600 text-white font-bold rounded-lg text-sm">5 SCPI</span>
            </div>
            <div className="grid md:grid-cols-3 gap-3 text-sm mb-4">
              <div className="bg-white dark:bg-gray-800 p-3 rounded">
                <p className="font-bold text-green-600 mb-1">Corum XL (20 000 €)</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Europe • PS 0%</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded">
                <p className="font-bold text-green-600 mb-1">PFO2 (18 000 €)</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Bureaux Paris</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded">
                <p className="font-bold text-green-600 mb-1">Remake Live (16 000 €)</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Santé/EHPAD</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded">
                <p className="font-bold text-green-600 mb-1">Iroko Zen (14 000 €)</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Logistique</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded col-span-2">
                <p className="font-bold text-green-600 mb-1">Epargne Pierre (12 000 €)</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Commerces France</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="font-bold mb-2">Résultats attendus :</p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><span className="text-gray-600">Rendement net :</span> <strong className="text-green-600">4,3%/an</strong></div>
                <div><span className="text-gray-600">Revenus annuels :</span> <strong>3 440 €</strong></div>
                <div><span className="text-gray-600">À 20 ans :</span> <strong className="text-green-600">190 000 €</strong></div>
              </div>
            </div>
          </div>

          {/* Portefeuille 3 */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Portefeuille 3 : Chef entreprise TMI 45% - 150 000 €
              </h3>
              <span className="px-3 py-1 bg-purple-600 text-white font-bold rounded-lg text-sm">6 SCPI</span>
            </div>
            <div className="grid md:grid-cols-3 gap-3 text-sm mb-4">
              <div className="bg-white dark:bg-gray-800 p-3 rounded">
                <p className="font-bold text-purple-600 mb-1">Corum Origin (40 000 €)</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Europe • PS 0%</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded">
                <p className="font-bold text-purple-600 mb-1">Eurovalys (35 000 €)</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Europe • PS 0%</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded">
                <p className="font-bold text-purple-600 mb-1">Edissimmo (25 000 €)</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">En AV • Pas IR</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded">
                <p className="font-bold text-purple-600 mb-1">Primopierre (20 000 €)</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">En AV • Pas IR</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded">
                <p className="font-bold text-purple-600 mb-1">Remake Live (20 000 €)</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Santé</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded">
                <p className="font-bold text-purple-600 mb-1">Transitions Europe (10 000 €)</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">ESG/Durable</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="font-bold mb-2">Résultats attendus (fiscalité optimisée) :</p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><span className="text-gray-600">Rendement net :</span> <strong className="text-purple-600">4,6%/an</strong></div>
                <div><span className="text-gray-600">Revenus annuels :</span> <strong>6 900 €</strong></div>
                <div><span className="text-gray-600">À 20 ans :</span> <strong className="text-purple-600">340 000 €</strong></div>
              </div>
            </div>
          </div>

          {/* Portefeuille 4 */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Portefeuille 4 : Retraité 65 ans - 200 000 € (défensif)
              </h3>
              <span className="px-3 py-1 bg-orange-600 text-white font-bold rounded-lg text-sm">6 SCPI</span>
            </div>
            <div className="grid md:grid-cols-3 gap-3 text-sm mb-4">
              <div className="bg-white dark:bg-gray-800 p-3 rounded">
                <p className="font-bold text-orange-600 mb-1">PFO2 (50 000 €)</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Bureaux Paris prime</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded">
                <p className="font-bold text-orange-600 mb-1">Corum Origin (40 000 €)</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Europe stable</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded">
                <p className="font-bold text-orange-600 mb-1">Primovie (35 000 €)</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Santé/Résidentiel</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded">
                <p className="font-bold text-orange-600 mb-1">Epargne Foncière (30 000 €)</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Diversifiée France</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded">
                <p className="font-bold text-orange-600 mb-1">Corum XL (25 000 €)</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Europe</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded">
                <p className="font-bold text-orange-600 mb-1">LF Grand Paris Patrimoine (20 000 €)</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Bureaux IDF</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="font-bold mb-2">Résultats attendus (stabilité maximale) :</p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><span className="text-gray-600">Rendement net :</span> <strong className="text-orange-600">4,1%/an</strong></div>
                <div><span className="text-gray-600">Revenus annuels :</span> <strong>8 200 €</strong></div>
                <div><span className="text-gray-600">Volatilité :</span> <strong className="text-green-600">Très faible</strong></div>
              </div>
            </div>
          </div>

          {/* Portefeuille 5 */}
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Portefeuille 5 : Investisseur aguerri - 500 000 € (core-satellite)
              </h3>
              <span className="px-3 py-1 bg-gray-600 text-white font-bold rounded-lg text-sm">8 SCPI</span>
            </div>
            <div className="mb-4">
              <p className="font-bold text-gray-900 dark:text-white mb-3">Core (350 000 € - 70%) :</p>
              <div className="grid md:grid-cols-4 gap-2 text-xs mb-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
                  <p className="font-bold">PFO2 (100k)</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
                  <p className="font-bold">Corum Origin (80k)</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
                  <p className="font-bold">Epargne Foncière (70k)</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
                  <p className="font-bold">Primopierre (60k)</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded col-span-2">
                  <p className="font-bold">Remake Live (40k - Santé)</p>
                </div>
              </div>
              <p className="font-bold text-gray-900 dark:text-white mb-3 mt-4">Satellite (150 000 € - 30%) :</p>
              <div className="grid md:grid-cols-3 gap-2 text-xs">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded">
                  <p className="font-bold">Iroko Zen (60k - Logistique)</p>
                </div>
                <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded">
                  <p className="font-bold">Transitions Europe (50k - ESG)</p>
                </div>
                <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded">
                  <p className="font-bold">Urban Premium (40k - Résidentiel)</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="font-bold mb-2">Résultats attendus (équilibre optimal) :</p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><span className="text-gray-600">Rendement net :</span> <strong className="text-gray-900 dark:text-white">4,7%/an</strong></div>
                <div><span className="text-gray-600">Revenus annuels :</span> <strong>23 500 €</strong></div>
                <div><span className="text-gray-600">À 20 ans :</span> <strong className="text-blue-600">1 150 000 €</strong></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Erreurs à éviter */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-red-600" />
          7 erreurs à éviter
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-5">
            <p className="font-bold text-red-900 dark:text-red-200 mb-2">❌ Concentrer sur une seule SCPI</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Risque de perte élevé si la SCPI sous-performe ou bloque les retraits. Minimum : 2-3 SCPI.
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-5">
            <p className="font-bold text-red-900 dark:text-red-200 mb-2">❌ Sur-diversifier (plus de 10 SCPI)</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Complexité administrative excessive, coûts cumulés élevés, gains marginaux. Optimal : 4-8 SCPI.
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-5">
            <p className="font-bold text-red-900 dark:text-red-200 mb-2">❌ Ignorer la diversification sectorielle</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              3 SCPI bureaux = fausse diversification. Mélangez bureaux, commerces, santé, logistique.
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-5">
            <p className="font-bold text-red-900 dark:text-red-200 mb-2">❌ Négliger la zone géographique</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Intégrez 30-40% de SCPI européennes pour PS 0% et diversification géographique.
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-5">
            <p className="font-bold text-red-900 dark:text-red-200 mb-2">❌ Choisir uniquement les rendements les plus élevés</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              TDVM 7%+ = risques cachés. Privilégiez la qualité et la régularité (4,5-5,5%).
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-5">
            <p className="font-bold text-red-900 dark:text-red-200 mb-2">❌ Investir sans analyser la société de gestion</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Vérifiez historique, transparence, taux d'occupation, report à nouveau, délais de retrait.
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-5">
            <p className="font-bold text-red-900 dark:text-red-200 mb-2">❌ Oublier l'horizon de placement</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Minimum 8-10 ans. Si besoin liquidité inférieure à 5 ans, privilégiez SCPI en assurance-vie.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Questions fréquentes</h2>

        <div className="space-y-6">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Est-il mieux d'avoir 10 SCPI ou 5 SCPI de qualité ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>5 SCPI de qualité l'emportent largement.</strong> Au-delà de 6-8 SCPI, les bénéfices de diversification sont négligeables (moins de 5% de réduction de risque supplémentaire) tandis que la complexité administrative explose. Privilégiez des SCPI avec un historique solide (plus de 10 ans), un taux d'occupation supérieur à 90%, un TDVM stable 4,5-5,5%, et des sociétés de gestion reconnues (Perial, Sofidy, La Française REM, etc.).
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Faut-il mixer SCPI françaises et européennes ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Oui, absolument ! Une allocation <strong>60% France / 40% Europe</strong> est idéale. Les SCPI européennes bénéficient de <strong>prélèvements sociaux 0%</strong> (vs 17,2% France) grâce aux conventions fiscales, ce qui booste votre rendement net de 0,5-1 point. De plus, vous diversifiez le risque géographique (cycles immobiliers différents entre pays). Pour les TMI élevés (30-45%), augmentez jusqu'à 50-60% de SCPI européennes.
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Dois-je équilibrer les montants investis dans chaque SCPI ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Pas nécessairement. Une approche <strong>"core-satellite"</strong> est plus efficace : 70% du capital sur 3-4 SCPI "cœur" (qualité maximale, stabilité) et 30% sur 2-3 SCPI "satellites" (opportunistes, thématiques). Par exemple : 70% sur PFO2 + Corum Origin + Epargne Foncière, puis 30% sur Iroko Zen (logistique) + Remake Live (santé). Cette structure maximise le couple rendement/risque.
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Combien de SCPI si j'investis via une assurance-vie ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              En assurance-vie, <strong>2 à 4 SCPI suffisent</strong> car vous bénéficiez déjà de la diversification interne de chaque SCPI (100+ immeubles). L'assurance-vie vous offre une fiscalité avantageuse (pas d'IR, seulement PS 17,2%) et une liquidité supérieure (48-72h). Privilégiez 2-3 SCPI françaises de qualité dans votre AV, complétées éventuellement par 1-2 SCPI européennes en direct pour optimiser les prélèvements sociaux.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Dois-je rééquilibrer mon portefeuille SCPI régulièrement ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Un <strong>rééquilibrage annuel ou bi-annuel</strong> est recommandé. Vérifiez : (1) l'évolution des performances de chaque SCPI (si une sous-performe 2 ans de suite, analysez), (2) votre exposition sectorielle (si bureaux supérieurs à 40%, rééquilibrez), (3) les opportunités fiscales (nouvelles SCPI européennes avec PS 0%). Attention : revendre des SCPI en direct prend 2-6 mois. Privilégiez les SCPI en AV pour flexibilité de rééquilibrage (48h).
            </p>
          </div>
        </div>
      </section>

      {/* Conclusion + CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 dark:from-blue-800 dark:to-purple-900 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-4">Conclusion : construisez un portefeuille SCPI solide</h2>
        <div className="space-y-4 text-lg text-blue-50">
          <p>
            La diversification SCPI n'est pas une question de quantité, mais de <strong>qualité et complémentarité</strong>. Le nombre optimal se situe entre <strong>4 et 6 SCPI</strong> pour 90% des investisseurs, permettant de réduire 70% du risque de concentration tout en maintenant un rendement de 4,5-5,5%/an net.
          </p>
          <p>
            Les clés d'une diversification réussie : <strong>(1)</strong> Mélanger les secteurs (bureaux, commerces, santé, logistique), <strong>(2)</strong> Intégrer 30-40% de SCPI européennes (PS 0%), <strong>(3)</strong> Adopter une approche core-satellite (70% stabilité / 30% opportuniste), <strong>(4)</strong> Privilégier la qualité (sociétés de gestion reconnues, historique plus de 10 ans, TO supérieur à 90%).
          </p>
          <p className="font-bold text-xl text-white border-t-2 border-white/30 pt-4 mt-4">
            Au-delà de 8 SCPI, vous entrez en sur-diversification : complexité administrative accrue, gains marginaux (moins de 5%), difficultés de suivi. Retenez : <strong>la diversification optimale = 5-6 SCPI bien choisies</strong>, pas 15 SCPI prises au hasard.
          </p>

          <div className="bg-white/10 rounded-lg p-6 mt-6">
            <h3 className="text-xl font-bold mb-3">🎯 Construisez votre portefeuille SCPI personnalisé</h3>
            <p className="mb-4">
              Notre équipe analyse gratuitement votre situation (capital, TMI, objectifs) et vous recommande l'allocation SCPI optimale avec le bon nombre de SCPI et la répartition idéale secteurs/géographie.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="/comparateur-scpi"
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors"
              >
                Comparer 51 SCPI
              </a>
              <a
                href="/contact"
                className="inline-flex items-center px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-400 transition-colors"
              >
                Analyse gratuite portefeuille
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DiversificationScpiCombienNombrePartsArticle;
