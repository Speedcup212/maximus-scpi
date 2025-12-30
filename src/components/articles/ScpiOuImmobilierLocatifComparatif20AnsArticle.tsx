import React from 'react';
import { Building2, Shield, TrendingUp, AlertTriangle, CheckCircle2, Euro, Users, Target, User, Calendar, Clock, BarChart3, BookOpen, Scale, Lightbulb, Eye, Calculator, Home, Wrench, DollarSign, TrendingDown, Lock } from 'lucide-react';

export const ScpiOuImmobilierLocatifComparatif20AnsArticle: React.FC = () => {
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
            <li className="text-gray-900 dark:text-white font-semibold">SCPI ou immobilier locatif direct : comparatif sur 20 ans</li>
          </ol>
        </nav>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-semibold rounded-full">
            Comparatif
          </span>
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm font-semibold rounded-full">
            Investissement
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          SCPI ou immobilier locatif direct : comparatif chiffré sur 20 ans (2025)
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
          <strong>SCPI ou immobilier locatif direct ?</strong> Cette question divise les investisseurs depuis des années. En 2025, avec 100 000 € à investir, quelle solution génère le meilleur rendement net sur 20 ans ? Nous avons réalisé une simulation complète intégrant <strong>tous les coûts réels</strong> (notaire, travaux, vacance, gestion) et la <strong>fiscalité exacte</strong> selon votre TMI. Résultat : l'écart de patrimoine final peut atteindre 50 000 € selon votre profil.
        </p>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-l-4 border-blue-500">
          <p className="text-gray-900 dark:text-white font-bold mb-3 text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            Ce que vous allez découvrir :
          </p>
          <ul className="space-y-2 text-gray-800 dark:text-gray-200">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Simulation complète 100 000 € investis : SCPI vs appartement T2 à Paris</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Comparatif 8 critères : rendement net, temps de gestion, fiscalité, liquidité, risques</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Tableaux chiffrés : revenus nets annuels, patrimoine à 10 ans et 20 ans</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>3 profils investisseurs (actif occupé TMI 30%, rentier TMI 11%, cadre TMI 41%)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Avantages/inconvénients détaillés avec scoring par critère</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Simulation : 100 000€ investis */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Calculator className="w-8 h-8 text-green-600" />
          Simulation : 100 000 € investis sur 20 ans
        </h2>

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          Comparons deux investissements réels avec <strong>100 000 € de capital</strong> : SCPI via assurance-vie vs appartement T2 à Paris (75). Tous les coûts sont intégrés : frais de notaire, travaux, vacance locative, gestion, fiscalité.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* SCPI */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-l-4 border-blue-500">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-8 h-8 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">SCPI en assurance-vie</h3>
            </div>
            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <p className="font-bold text-blue-900 dark:text-blue-200 mb-1">Capital investi</p>
                <p>100 000 € (pas de frais AV)</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <p className="font-bold text-blue-900 dark:text-blue-200 mb-1">Rendement brut moyen</p>
                <p>5% annuel (distribution SCPI)</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <p className="font-bold text-blue-900 dark:text-blue-200 mb-1">Fiscalité</p>
                <p>17,2% PS uniquement (pas d'IR en AV)</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <p className="font-bold text-blue-900 dark:text-blue-200 mb-1">Revenu net annuel</p>
                <p className="text-lg font-bold text-green-600">4 140 €/an</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <p className="font-bold text-blue-900 dark:text-blue-200 mb-1">Temps de gestion</p>
                <p>0h/an (géré par la société)</p>
              </div>
            </div>
          </div>

          {/* Immobilier locatif */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border-l-4 border-green-500">
            <div className="flex items-center gap-3 mb-4">
              <Home className="w-8 h-8 text-green-600" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">T2 Paris 30m²</h3>
            </div>
            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <p className="font-bold text-green-900 dark:text-green-200 mb-1">Capital investi</p>
                <p>100 000 € (250 000 € bien - 8% notaire - 150k crédit)</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <p className="font-bold text-green-900 dark:text-green-200 mb-1">Loyer brut</p>
                <p>1 200 €/mois = 14 400 €/an</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <p className="font-bold text-green-900 dark:text-green-200 mb-1">Charges + travaux + vacance</p>
                <p>-4 320 €/an (30% du loyer)</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <p className="font-bold text-green-900 dark:text-green-200 mb-1">Revenu net fiscal</p>
                <p>10 080 €</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <p className="font-bold text-green-900 dark:text-green-200 mb-1">Fiscalité TMI 30%</p>
                <p>-4 536 € (IR 30% + PS 17,2%)</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <p className="font-bold text-green-900 dark:text-green-200 mb-1">Revenu net réel</p>
                <p className="text-lg font-bold text-green-600">5 544 €/an</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <p className="font-bold text-green-900 dark:text-green-200 mb-1">Temps de gestion</p>
                <p>20-30h/an (travaux, locataires)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
          <h3 className="text-2xl font-bold mb-4">Résultats sur 20 ans</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-purple-100 mb-2">SCPI (Assurance-vie)</p>
              <ul className="space-y-2 text-sm">
                <li>• Revenus cumulés : <strong>82 800 €</strong></li>
                <li>• Valorisation capital : <strong>120 000 €</strong> (+2%/an)</li>
                <li>• <strong>Patrimoine total : 202 800 €</strong></li>
                <li>• Temps investi : <strong>0h</strong></li>
              </ul>
            </div>
            <div>
              <p className="text-purple-100 mb-2">Immobilier locatif (T2 Paris)</p>
              <ul className="space-y-2 text-sm">
                <li>• Revenus cumulés : <strong>110 880 €</strong></li>
                <li>• Valorisation bien : <strong>300 000 €</strong> (+2%/an)</li>
                <li>• Remboursement crédit : <strong>-50 000 €</strong></li>
                <li>• <strong>Patrimoine net : 260 880 €</strong></li>
                <li>• Temps investi : <strong>400-600h</strong></li>
              </ul>
            </div>
          </div>
          <p className="mt-4 text-lg font-bold text-purple-100">
            🏆 Gagnant financier : <strong>Immobilier locatif (+58 080 €)</strong> MAIS avec 500h de gestion et risque locatif
          </p>
        </div>
      </section>

      {/* Tableau comparatif 8 critères */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Scale className="w-8 h-8 text-blue-600" />
          Comparatif détaillé : 8 critères essentiels
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-gray-900 dark:text-white">Critère</th>
                <th className="px-4 py-3 text-left font-bold text-gray-900 dark:text-white">SCPI</th>
                <th className="px-4 py-3 text-left font-bold text-gray-900 dark:text-white">Immobilier locatif</th>
                <th className="px-4 py-3 text-left font-bold text-gray-900 dark:text-white">Gagnant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-semibold">Ticket d'entrée</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Dès 1 000 €</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">30 000 € minimum (apport)</td>
                <td className="px-4 py-3 text-green-600 font-bold">SCPI</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-semibold">Rendement net</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">3,5-4,5%/an (sans effort de levier)</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">4-6%/an (avec effet de levier)</td>
                <td className="px-4 py-3 text-green-600 font-bold">Locatif</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-semibold">Temps de gestion</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">0h/an (100% délégué)</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">20-50h/an (travaux, locataires)</td>
                <td className="px-4 py-3 text-green-600 font-bold">SCPI</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-semibold">Liquidité</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">48-72h (AV) / 2-6 mois (direct)</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">6-18 mois (vente)</td>
                <td className="px-4 py-3 text-green-600 font-bold">SCPI</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-semibold">Diversification</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">100+ immeubles, multi-secteurs</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">1 seul bien concentré</td>
                <td className="px-4 py-3 text-green-600 font-bold">SCPI</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-semibold">Fiscalité revenus</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">17,2% PS (AV) / TMI + PS (direct)</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">TMI + PS 17,2% (30-47% total)</td>
                <td className="px-4 py-3 text-green-600 font-bold">SCPI (AV)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-semibold">Frais d'entrée</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">0% (AV) / 8-12% (direct)</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">8% (notaire) + travaux éventuels</td>
                <td className="px-4 py-3 text-blue-600 font-bold">Égalité</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-semibold">Plus-value à 20 ans</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">+20-30% (valorisation parts)</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">+30-50% (valorisation bien)</td>
                <td className="px-4 py-3 text-green-600 font-bold">Locatif</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 border-l-4 border-amber-500">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Verdict</h3>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>SCPI gagne sur</strong> : accessibilité, simplicité, liquidité, diversification, temps de gestion.<br/>
                <strong>Immobilier locatif gagne sur</strong> : rendement net total (avec levier), valorisation long terme, contrôle total.<br/>
                <strong>Le choix dépend de votre profil</strong> : actif occupé = SCPI / passionné immobilier avec du temps = locatif.
              </p>
            </div>
          </div>
        </div>
      </section>
      

      {/* 3 profils investisseurs */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Users className="w-8 h-8 text-orange-600" />
          3 profils : quel investissement vous correspond ?
        </h2>

        <div className="space-y-6">
          {/* Profil 1 : Actif occupé TMI 30% */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Profil 1 : Actif occupé, TMI 30%, pas de temps pour gérer
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-3">Votre situation</h4>
                <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
                  <li>• Cadre en entreprise, 40-50h/semaine</li>
                  <li>• 80 000 € à investir</li>
                  <li>• Objectif : revenus passifs sans contrainte</li>
                  <li>• Horizon : 15-20 ans</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-3">Solution recommandée</h4>
                <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <span><strong>SCPI en assurance-vie</strong> : 100% adapté</span>
                  </li>
                  <li>• 0h de gestion annuelle</li>
                  <li>• Liquidité 48-72h si besoin</li>
                  <li>• Rendement net : 4,14%/an = 3 312 €/an</li>
                  <li>• Patrimoine 20 ans : 190 000 € (vs 240k locatif MAIS avec 500h investies)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Profil 2 : Passionné immobilier */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Profil 2 : Passionné immobilier, bricoleur, disponible
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-green-900 dark:text-green-200 mb-3">Votre situation</h4>
                <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
                  <li>• Indépendant ou temps libre</li>
                  <li>• 100 000 € d'apport</li>
                  <li>• Compétences bricolage/rénovation</li>
                  <li>• Objectif : maximiser patrimoine</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-green-900 dark:text-green-200 mb-3">Solution recommandée</h4>
                <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <span><strong>Immobilier locatif</strong> : optimal</span>
                  </li>
                  <li>• Effet de levier crédit 150k</li>
                  <li>• Valorisation supérieure (+30-50% vs +20% SCPI)</li>
                  <li>• Revenus nets 5-6%/an sur fonds propres</li>
                  <li>• Patrimoine 20 ans : 260k (vs 200k SCPI)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Profil 3 : Rentier TMI 11% */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Profil 3 : Rentier ou retraité, TMI 11%, besoin de liquidité
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-purple-900 dark:text-purple-200 mb-3">Votre situation</h4>
                <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
                  <li>• 60-70 ans, patrimoine constitué</li>
                  <li>• 150 000 € disponibles</li>
                  <li>• Besoin de flexibilité pour dépenses imprévues</li>
                  <li>• Objectif : revenus réguliers + liquidité</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-purple-900 dark:text-purple-200 mb-3">Solution recommandée</h4>
                <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <span><strong>SCPI 100%</strong> : sécurité + flexibilité</span>
                  </li>
                  <li>• Liquidité immédiate en AV (vs 6-18 mois locatif)</li>
                  <li>• Pas de gestion (âge avancé)</li>
                  <li>• Fiscalité douce TMI 11% (vs 30-40% locatif)</li>
                  <li>• Transmission simplifiée (succession)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Questions fréquentes</h2>

        <div className="space-y-6">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Quel investissement rapporte le plus sur 20 ans ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>L'immobilier locatif rapporte plus (+20-30% de patrimoine final)</strong> grâce à l'effet de levier du crédit et à une meilleure valorisation. MAIS il exige 400-600h de gestion sur 20 ans et comporte des risques locatifs (impayés, vacance, travaux). <strong>Les SCPI offrent un rendement inférieur mais sans aucune contrainte de gestion</strong> (0h/an) et une liquidité supérieure. Le choix dépend de votre temps disponible et de votre appétence pour la gestion immobilière.
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Peut-on combiner SCPI et immobilier locatif ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Oui, c'est même <strong>la stratégie optimale pour diversifier</strong> ! Exemple : 60% SCPI (liquidité, pas de gestion) + 40% locatif (levier, contrôle). Vous bénéficiez des avantages des deux : revenus passifs SCPI pour la stabilité, et potentiel de plus-value locatif pour la performance. Cette allocation réduit les risques tout en maximisant le rendement global.
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Quel capital minimum pour chaque solution ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>SCPI :</strong> dès 1 000 € (accessible à tous). <strong>Immobilier locatif :</strong> 30 000 € minimum d'apport pour un bien à 150 000 € avec crédit (80% financé). Pour 100 000 €, vous pouvez acheter un T2 en province avec 20% d'apport ou investir 100% en SCPI sans crédit. L'immobilier locatif nécessite aussi une réserve de trésorerie de 10 000-15 000 € pour imprévus (travaux, vacance).
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Quelle solution est la plus liquide ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>SCPI en assurance-vie : 48-72h</strong> (rachat immédiat). <strong>SCPI en direct : 2-6 mois</strong> (marché secondaire). <strong>Immobilier locatif : 6-18 mois</strong> (délai vente + notaire). Si vous anticipez un besoin de liquidité à moyen terme, privilégiez les SCPI en AV. L'immobilier locatif est illiquide et nécessite un horizon {'>'} 10 ans ferme.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Immobilier locatif : combien d'heures de gestion par an ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              En moyenne <strong>20-50h/an</strong> : recherche locataires (10h), états des lieux (4h), gestion administrative (10h), coordination travaux (10-20h), visites et relances (5-10h). Avec un gestionnaire locatif (7-10% du loyer), vous réduisez à 10-15h/an mais votre rendement net baisse de 0,5-1 point. Les SCPI = <strong>0h de gestion</strong>, tout est délégué à la société de gestion professionnelle.
            </p>
          </div>
        </div>
      </section>

      {/* Conclusion + CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 dark:from-blue-800 dark:to-purple-900 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-4">Conclusion : quel choix pour votre patrimoine ?</h2>
        <div className="space-y-4 text-lg text-blue-50">
          <p>
            <strong>Le verdict est nuancé</strong> : sur 20 ans, l'immobilier locatif génère <strong>+58 000 € de patrimoine</strong> (260k vs 203k SCPI) grâce à l'effet de levier et à une meilleure valorisation. Mais ce gain s'obtient au prix de <strong>500h de gestion cumulées</strong>, de risques locatifs (vacance, impayés) et d'une liquidité très faible (6-18 mois de délai de vente).
          </p>
          <p>
            <strong>Les SCPI excellent sur</strong> : accessibilité (dès 1 000 €), simplicité (0h/an), liquidité (48-72h en AV), diversification (100+ immeubles) et fiscalité en assurance-vie (17,2% PS uniquement). Elles conviennent parfaitement aux <strong>actifs occupés, retraités ou investisseurs recherchant la tranquillité</strong>.
          </p>
          <p>
            <strong>L'immobilier locatif l'emporte sur</strong> : rendement net total (5-6% vs 4-4,5% SCPI), valorisation long terme (+40-50% vs +20-30%) et contrôle total du bien. Il s'adresse aux <strong>passionnés immobilier disposant de temps</strong> (20-50h/an) et d'une capacité d'emprunt.
          </p>
          <p className="font-bold text-xl text-white border-t-2 border-white/30 pt-4 mt-4">
            Notre recommandation : <strong>60% SCPI + 40% locatif</strong> pour combiner revenus passifs, liquidité et potentiel de plus-value. Cette allocation hybride maximise le rendement tout en réduisant les contraintes de gestion.
          </p>

          <div className="bg-white/10 rounded-lg p-6 mt-6">
            <h3 className="text-xl font-bold mb-3">{'🎯'} Analysez votre situation personnalisée</h3>
            <p className="mb-4">
              Utilisez nos outils pour simuler <strong>votre stratégie optimale</strong> selon votre TMI, capital disponible et objectifs. Nos conseillers analysent gratuitement votre profil et recommandent l'allocation idéale SCPI/locatif.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="/comparateur-scpi"
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors"
              >
                Comparer les SCPI
              </a>
              <a
                href="/simulateur-enveloppes"
                className="inline-flex items-center px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-400 transition-colors"
              >
                Simuler votre allocation
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ScpiOuImmobilierLocatifComparatif20AnsArticle;
