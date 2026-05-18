import React from 'react';
import { TrendingUp, Shield, Calculator, AlertTriangle, CheckCircle2, PieChart as PieChartIcon, Building, BarChart3, Users, Clock, Euro, Target, User, Calendar } from 'lucide-react';
import PieChart from '../PieChart';
import ArticleCtaBlock from '../ArticleCtaBlock';

export const FondsEurosOuScpiArticle: React.FC = () => {
  // Données pour le camembert allocation (profil dynamique)
  const allocationData = [
    { name: 'SCPI', value: 10, color: '#10b981' },
    { name: 'UC (actions, obligations)', value: 90, color: '#8b5cf6' }
  ];

  return (
    <div className="space-y-12">
      {/* Header avec background */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-8 border border-blue-100 dark:border-gray-700">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <li><a href="/" className="hover:text-blue-600 dark:hover:text-blue-400">Accueil</a></li>
            <li>/</li>
            <li className="text-gray-900 dark:text-white font-semibold">Fonds euros ou SCPI : que faire en 2025 ?</li>
          </ol>
        </nav>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-semibold rounded-full">
            Comparatifs
          </span>
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm font-semibold rounded-full">
            Article pilier
          </span>
        </div>

        {/* H1 */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          Fonds euros ou SCPI : que faire en 2025 ?
        </h1>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Éric Bellaiche, CGP</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>20 janvier 2025</span>
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
          Face aux rendements historiquement bas des fonds euros (autour de <strong className="text-blue-600 dark:text-blue-400">2 % en 2024-2025</strong>), de plus en plus d'épargnants s'interrogent : <strong>faut-il conserver ses fonds euros ou basculer une partie de son épargne vers les SCPI</strong> ? Cette question concerne particulièrement les détenteurs d'assurances-vie multi-supports avec 50 000 € ou plus bloqués sur des supports en euros qui ne battent plus l'inflation.
        </p>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          Dans cet article complet, nous comparons objectivement les deux placements — <strong>rendements réels, fiscalité selon votre TMI, risques et liquidité</strong> — pour vous aider à prendre une décision éclairée adaptée à votre profil.
        </p>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-l-4 border-blue-500">
          <p className="text-gray-900 dark:text-white font-bold mb-3 text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            Ce que vous allez découvrir dans cet article :
          </p>
          <ul className="space-y-2 text-gray-800 dark:text-gray-200">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Les différences fondamentales entre fonds euros (capital garanti, 2%) et SCPI (immobilier mutualisé, 4,5% à 11,8%)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Un tableau comparatif complet : rendements nets, fiscalité, liquidité, risques</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>3 cas pratiques détaillés selon votre profil (prudent, équilibré, dynamique)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Calculs de rendement net après fiscalité selon TMI (11%, 30%, 41%)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Stratégies d'allocation optimales (30/70, 50/50, 70/30)</span>
            </li>
          </ul>
        </div>
      </section>

      <ArticleCtaBlock variant="top" topic="general" />

      {/* Section Comprendre */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Building className="w-8 h-8 text-blue-600" />
          Comprendre les fonds euros et les SCPI : deux logiques d'investissement
        </h2>

        {/* Fonds euros */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border-2 border-gray-100 dark:border-gray-700">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Shield className="w-7 h-7 text-green-600" />
            Le fonds euros : le placement sécurisé par excellence
          </h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Le <strong>fonds euros</strong> est le support historique de l'assurance-vie française. Son fonctionnement repose sur trois piliers :
          </p>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border-l-4 border-green-500">
              <div className="font-bold text-green-900 dark:text-green-200 mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Capital garanti
              </div>
              <p className="text-sm text-green-800 dark:text-green-300">
                Votre mise de départ et les intérêts acquis ne peuvent jamais baisser (effet cliquet)
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-l-4 border-blue-500">
              <div className="font-bold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Rendement annuel
              </div>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Historiquement 2-4% bruts, aujourd'hui 1,8-2,5%, déterminé chaque année par l'assureur
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border-l-4 border-purple-500">
              <div className="font-bold text-purple-900 dark:text-purple-200 mb-2 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Liquidité totale
              </div>
              <p className="text-sm text-purple-800 dark:text-purple-300">
                Rachat partiel ou total possible à tout moment, sous 48-72h ouvrées
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border-l-4 border-yellow-500">
            <p className="text-sm text-yellow-900 dark:text-yellow-200 font-semibold mb-2">
              ⚠️ La contrepartie : un rendement réel négatif
            </p>
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              Après prélèvements sociaux de 17,2%, un fonds euros à 2% brut ne rapporte que <strong>1,66% net</strong>, soit un rendement réel négatif face à une inflation moyenne de 2-3%.
            </p>
          </div>
        </div>

        {/* SCPI */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-gray-100 dark:border-gray-700">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Building className="w-7 h-7 text-blue-600" />
            Les SCPI : l'immobilier locatif mutualisé
          </h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Les <strong>SCPI</strong> (Sociétés Civiles de Placement Immobilier) sont des véhicules d'investissement collectif qui achètent et gèrent un patrimoine immobilier diversifié. En achetant des parts, vous devenez associé et percevez des revenus locatifs trimestriels.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Avantages majeurs
              </h4>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Rendement 4,5% à 11,8%</strong> selon secteurs et zones (moyenne 5% France, 6,5% Europe)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Diversification</strong> : 50-200 actifs par SCPI</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Revenus trimestriels</strong> réguliers</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Gestion 100% déléguée</strong> à des professionnels</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Points de vigilance
              </h4>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Capital non garanti</strong> : prix de part variable</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Liquidité</strong> : 2-6 mois (direct), instantané (AV)</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Fiscalité variable</strong> : selon le support (AV ou direct)</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Horizon minimum</strong> : 8-15 ans recommandé</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-200 font-semibold mb-2">
              💡 Le saviez-vous ?
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Les SCPI françaises détiennent plus de <strong>90 milliards d'euros d'actifs</strong> immobiliers et comptent plus de 200 000 associés. Le marché est mature, régulé par l'AMF, avec un historique de plus de 50 ans.
            </p>
          </div>
        </div>
      </section>

      {/* Tableau comparatif */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          Tableau comparatif complet : fonds euros vs SCPI
        </h2>

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          Voici un comparatif exhaustif des deux placements sur tous les critères décisionnels :
        </p>

        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                <th className="text-left p-4 font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700">Critère</th>
                <th className="text-center p-4 font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30">Fonds euros</th>
                <th className="text-center p-4 font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30">SCPI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="p-4 font-semibold text-gray-900 dark:text-white">Rendement brut 2024-2025</td>
                <td className="p-4 text-center text-gray-700 dark:text-gray-300">1,8 - 2,5 %</td>
                <td className="p-4 text-center text-gray-700 dark:text-gray-300">4,5 - 11,8 % (moy. 5% FR, 6,5% EU)</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="p-4 font-semibold text-gray-900 dark:text-white">Rendement net (TMI 30%)</td>
                <td className="p-4 text-center text-gray-700 dark:text-gray-300">~1,66 %</td>
                <td className="p-4 text-center text-gray-700 dark:text-gray-300">~3,2 %</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="p-4 font-semibold text-gray-900 dark:text-white">Garantie du capital</td>
                <td className="p-4 text-center">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> Oui
                  </span>
                </td>
                <td className="p-4 text-center">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full text-sm font-semibold">
                    <AlertTriangle className="w-4 h-4" /> Non
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="p-4 font-semibold text-gray-900 dark:text-white">Liquidité</td>
                <td className="p-4 text-center text-gray-700 dark:text-gray-300">Totale (48-72h)</td>
                <td className="p-4 text-center text-gray-700 dark:text-gray-300">2-6 mois (direct), instantané (AV)</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="p-4 font-semibold text-gray-900 dark:text-white">Diversification</td>
                <td className="p-4 text-center text-gray-700 dark:text-gray-300">Indirecte (obligations assureur)</td>
                <td className="p-4 text-center text-gray-700 dark:text-gray-300">Directe (50-200 actifs)</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="p-4 font-semibold text-gray-900 dark:text-white">Fiscalité revenus</td>
                <td className="p-4 text-center text-gray-700 dark:text-gray-300">PS 17,2% uniquement</td>
                <td className="p-4 text-center text-gray-700 dark:text-gray-300">
                  <div className="text-sm">Direct : IR + PS 17,2% (FR) / 0% (EU)</div>
                  <div className="text-sm mt-1">AV : PS 17,2% uniquement</div>
                </td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="p-4 font-semibold text-gray-900 dark:text-white">IFI (Impôt Fortune)</td>
                <td className="p-4 text-center">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-semibold">
                    Non
                  </span>
                </td>
                <td className="p-4 text-center text-gray-700 dark:text-gray-300">Oui (direct), Non (AV)</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="p-4 font-semibold text-gray-900 dark:text-white">Horizon recommandé</td>
                <td className="p-4 text-center text-gray-700 dark:text-gray-300">Court/moyen terme</td>
                <td className="p-4 text-center text-gray-700 dark:text-gray-300">8-15 ans minimum</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border-l-4 border-yellow-500">
          <p className="font-bold text-gray-900 dark:text-white mb-3 text-lg">
            📊 Observation clé : l'écart de rendement se creuse sur le long terme
          </p>
          <p className="text-gray-800 dark:text-gray-200 mb-3">
            Sur 15 ans, un capital de <strong>100 000 €</strong> investi produit :
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Fonds euros à 2%</div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">~134 000 €</div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">+34 000 € de gains</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">SCPI à 5%</div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">~208 000 €</div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">+108 000 € de gains</div>
            </div>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-4">
            <strong>Écart en faveur des SCPI : +74 000 €</strong> (soit +119% de gains supplémentaires)
          </p>
        </div>
      </section>

      {/* Camembert allocation */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <PieChartIcon className="w-7 h-7 text-blue-600" />
          Exemple d'allocation optimale (profil dynamique)
        </h2>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-full md:w-1/2">
            <PieChart data={allocationData} />
          </div>
          <div className="w-full md:w-1/2 space-y-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 rounded-full bg-purple-600"></div>
                <span className="font-bold text-gray-900 dark:text-white">UC - Actions & Obligations (90%)</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Potentiel de croissance maximal via les marchés financiers (horizon 15+ ans)
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 rounded-full bg-green-600"></div>
                <span className="font-bold text-gray-900 dark:text-white">SCPI (10%)</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Touche immobilière (5% brut France → 4,14% net AV) pour revenus passifs complémentaires
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-l-4 border-blue-500">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>💡 Fonds euros à 0%</strong> : Ce profil dynamique mise sur la performance. Le fonds euros ne rapporte plus assez (1,66% net) pour compenser l'inflation.
              </p>
            </div>
          </div>
        </div>
      </section>

      <ArticleCtaBlock variant="middle" topic="general" />

      {/* Fiscalité détaillée */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Calculator className="w-8 h-8 text-blue-600" />
          Fiscalité : SCPI en assurance-vie vs SCPI en direct
        </h2>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 mb-8 border-l-4 border-blue-500">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🔑 Différence fiscale clé</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-bold text-blue-600 dark:text-blue-400 mb-2">SCPI dans une Assurance-Vie</h4>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>• Fiscalité : <strong>PS 17,2% uniquement</strong></li>
                <li>• Pas d'IR sur les revenus annuels</li>
                <li>• Taxation lors du rachat (abattements après 8 ans)</li>
                <li>• Idéal pour profils imposés (TMI 30-41%)</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-bold text-green-600 dark:text-green-400 mb-2">SCPI en Direct (parts nominatives)</h4>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>• France : <strong>IR + PS 17,2%</strong></li>
                <li>• Europe : <strong>IR + PS 0%</strong> (convention fiscale)</li>
                <li>• Revenus imposés chaque année</li>
                <li>• Avantage : SCPI européennes sans PS</li>
              </ul>
            </div>
          </div>
        </div>

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          Le rendement net dépend de votre <strong>Tranche Marginale d'Imposition (TMI)</strong> et du type de support. Calculs pour <strong>50 000 €</strong> :
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* TMI 11% */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-green-200 dark:border-green-800">
            <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-4">TMI 11%</h3>

            <div className="space-y-4">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Fonds euros (2%)</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">1,66 %</div>
                <div className="text-xs text-gray-500 mt-1">= 830 € net/an (PS 17,2%)</div>
              </div>

              <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">SCPI AV France (5% brut)</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">4,14 % net</div>
                <div className="text-xs text-gray-500 mt-1">= 2 070 € net/an (5% - PS 17,2%)</div>
              </div>

              <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">SCPI Direct Europe (6,5% brut)</div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">5,79 % net</div>
                <div className="text-xs text-gray-500 mt-1">= 2 895 € net/an (6,5% - IR 11%, PS 0%)</div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                <div className="text-sm font-semibold text-green-900 dark:text-green-200">Meilleur choix : SCPI EU direct</div>
                <div className="text-xl font-bold text-green-700 dark:text-green-400">+2 065 € vs Fonds euros</div>
              </div>
            </div>
          </div>

          {/* TMI 30% */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-orange-200 dark:border-orange-800">
            <h3 className="text-xl font-bold text-orange-700 dark:text-orange-400 mb-4">TMI 30%</h3>

            <div className="space-y-4">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Fonds euros (2%)</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">1,66 %</div>
                <div className="text-xs text-gray-500 mt-1">= 830 € net/an (PS 17,2%)</div>
              </div>

              <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">SCPI AV France (5% brut)</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">4,14 % net</div>
                <div className="text-xs text-gray-500 mt-1">= 2 070 € net/an (5% - PS 17,2%)</div>
              </div>

              <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">SCPI Direct Europe (6,5% brut)</div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">4,55 % net</div>
                <div className="text-xs text-gray-500 mt-1">= 2 275 € net/an (6,5% - IR 30%, PS 0%)</div>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
                <div className="text-sm font-semibold text-orange-900 dark:text-orange-200">Meilleur choix : SCPI EU direct</div>
                <div className="text-xl font-bold text-orange-700 dark:text-orange-400">+1 445 € vs Fonds euros</div>
              </div>
            </div>
          </div>

          {/* TMI 41% */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-red-200 dark:border-red-800">
            <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-4">TMI 41%</h3>

            <div className="space-y-4">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Fonds euros (2%)</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">1,66 %</div>
                <div className="text-xs text-gray-500 mt-1">= 830 € net/an (PS 17,2%)</div>
              </div>

              <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">SCPI AV France (5% brut)</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">4,14 % net</div>
                <div className="text-xs text-gray-500 mt-1">= 2 070 € net/an (5% - PS 17,2%)</div>
              </div>

              <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">SCPI Direct Europe (6,5% brut)</div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">3,84 % net</div>
                <div className="text-xs text-gray-500 mt-1">= 1 920 € net/an (6,5% - IR 41%, PS 0%)</div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                <div className="text-sm font-semibold text-red-900 dark:text-red-200">Meilleur choix : SCPI AV France</div>
                <div className="text-xl font-bold text-red-700 dark:text-red-400">+1 240 € vs Fonds euros</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border-l-4 border-purple-500">
          <p className="font-bold text-gray-900 dark:text-white text-lg mb-3">
            💡 Conclusion fiscale : quelle stratégie choisir ?
          </p>
          <div className="space-y-3 text-gray-800 dark:text-gray-200">
            <p>
              <strong>TMI 11%</strong> : Privilégiez les <strong>SCPI européennes en direct</strong> (5,79% net) grâce aux PS à 0%. Gain : +249% vs fonds euros.
            </p>
            <p>
              <strong>TMI 30%</strong> : Les <strong>SCPI européennes en direct</strong> restent optimales (4,55% net). Gain : +174% vs fonds euros.
            </p>
            <p>
              <strong>TMI 41%</strong> : Préférez les <strong>SCPI dans une assurance-vie</strong> (4,14% net) pour éviter l'IR annuel. Gain : +149% vs fonds euros.
            </p>
            <p className="text-sm italic mt-4">
              ⚠️ L'avantage des SCPI européennes (PS 0%) est majeur pour les TMI basses et moyennes. Pour les TMI hautes (41%+), l'assurance-vie neutralise l'IR annuel.
            </p>
          </div>
        </div>
      </section>

      {/* 3 Cas pratiques */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-600" />
          3 cas pratiques selon votre profil
        </h2>

        <div className="space-y-6">
          {/* Profil Prudent */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-3">
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Profil Prudent : Sécurité avant tout
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Capital 100 000 € • Âge 60 ans • Retraité • TMI 11%
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
              <div className="font-bold text-blue-900 dark:text-blue-200 mb-2">Allocation recommandée</div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-800 dark:text-blue-300">Fonds euros</span>
                  <span className="font-bold text-blue-900 dark:text-blue-200">50 000 € (50%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-800 dark:text-blue-300">SCPI (via AV)</span>
                  <span className="font-bold text-blue-900 dark:text-blue-200">20 000 € (20%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-800 dark:text-blue-300">UC (actions, obligations)</span>
                  <span className="font-bold text-blue-900 dark:text-blue-200">30 000 € (30%)</span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Revenus annuels nets SCPI</div>
                <div className="text-xl font-bold text-green-600 dark:text-green-400">828 €</div>
                <div className="text-xs text-gray-500 mt-1">= 20k×4,14%</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Rendement SCPI net</div>
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">4,14 %</div>
              </div>
            </div>

            <div className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Avantages :</strong> 50% capital garanti, diversification via UC, revenus SCPI réguliers, profil sécuritaire
            </div>
          </div>

          {/* Profil Équilibré */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3">
                <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Profil Équilibré : Performance et sécurité
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Capital 100 000 € • Âge 45 ans • Actif • TMI 30%
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-4">
              <div className="font-bold text-green-900 dark:text-green-200 mb-2">Allocation recommandée (stratégie équilibrée)</div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-800 dark:text-green-300">UC (actions, obligations)</span>
                  <span className="font-bold text-green-900 dark:text-green-200">70 000 € (70%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-800 dark:text-green-300">SCPI (via AV)</span>
                  <span className="font-bold text-green-900 dark:text-green-200">30 000 € (30%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-800 dark:text-green-300">Fonds euros</span>
                  <span className="font-bold text-green-900 dark:text-green-200">0 € (0%)</span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Revenus annuels nets SCPI</div>
                <div className="text-xl font-bold text-green-600 dark:text-green-400">1 242 €</div>
                <div className="text-xs text-gray-500 mt-1">= 30k×4,14%</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Rendement SCPI net</div>
                <div className="text-xl font-bold text-green-600 dark:text-green-400">4,14 %</div>
              </div>
            </div>

            <div className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Avantages :</strong> Diversification optimale, potentiel de croissance via UC (70%), revenus SCPI réguliers, 0% fonds euros
            </div>
          </div>

          {/* Profil Dynamique */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-3">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Profil Dynamique : Maximiser le rendement
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Capital 100 000 € • Âge 35 ans • Actif • TMI 30% • Horizon 15+ ans
                </div>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-4">
              <div className="font-bold text-purple-900 dark:text-purple-200 mb-2">Allocation recommandée (100% marchés financiers)</div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-800 dark:text-purple-300">UC (actions, obligations)</span>
                  <span className="font-bold text-purple-900 dark:text-purple-200">90 000 € (90%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-800 dark:text-purple-300">SCPI diversifiées (via AV)</span>
                  <span className="font-bold text-purple-900 dark:text-purple-200">10 000 € (10%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-800 dark:text-purple-300">Fonds euros</span>
                  <span className="font-bold text-purple-900 dark:text-purple-200">0 € (0%)</span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Revenus annuels nets SCPI</div>
                <div className="text-xl font-bold text-green-600 dark:text-green-400">414 €</div>
                <div className="text-xs text-gray-500 mt-1">= 10k×4,14%</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Rendement SCPI net</div>
                <div className="text-xl font-bold text-purple-600 dark:text-purple-400">4,14 %</div>
              </div>
            </div>

            <div className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              <strong>Avantages :</strong> Potentiel de croissance maximal via UC (90%), touche immobilière via SCPI (10%), horizon 15+ ans, 0% fonds euros
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border-l-4 border-yellow-500">
              <p className="text-xs text-yellow-900 dark:text-yellow-200">
                <strong>⚠️ Condition :</strong> Disposer d'une épargne de précaution séparée (3-6 mois de dépenses) pour ne jamais avoir à vendre les SCPI en urgence
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stratégie de transition */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Target className="w-8 h-8 text-blue-600" />
          Stratégie de transition : du fonds euros aux SCPI (AV puis direct)
        </h2>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Étape 1 : Analyse de votre situation</h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>TMI</strong> : Identifiez votre tranche marginale d'imposition (11%, 30%, 41% ou 45%)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>Horizon</strong> : Minimum 8 ans pour les SCPI (idéal 10-15 ans)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>Liquidité</strong> : Conservez 6 mois de dépenses en épargne de précaution</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>Objectif</strong> : Rendement (privilégier UC + SCPI) ou sécurité (garder fonds euros)</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Étape 2 : SCPI en Assurance-Vie (démarrage)</h3>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-900 dark:text-blue-200 font-semibold mb-2">
                🎯 Pourquoi commencer par l'assurance-vie ?
              </p>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <li>• <strong>Liquidité instantanée</strong> : rachats en 48-72h</li>
                <li>• <strong>Fiscalité avantageuse</strong> : PS 17,2% uniquement (pas d'IR annuel)</li>
                <li>• <strong>Sécurité</strong> : arbitrages gratuits vers fonds euros si besoin</li>
                <li>• <strong>Idéal TMI 30-41%</strong> : évite l'IR sur les revenus</li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold text-blue-600">1</div>
                <div className="text-gray-700 dark:text-gray-300">
                  <strong>Année 1 :</strong> Transférez 20-30% du fonds euros vers SCPI en AV (testez 2-3 SCPI différentes)
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold text-blue-600">2</div>
                <div className="text-gray-700 dark:text-gray-300">
                  <strong>Année 2 :</strong> Si satisfait des revenus, augmentez à 50-70% (ajoutez UC pour diversifier)
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold text-blue-600">3</div>
                <div className="text-gray-700 dark:text-gray-300">
                  <strong>Année 3+ :</strong> Profil dynamique = 70-90% UC + 10-30% SCPI, 0% fonds euros
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Étape 3 : SCPI en Direct (optimisation fiscale)</h3>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-4">
              <p className="text-sm text-green-900 dark:text-green-200 font-semibold mb-2">
                🚀 Quand acheter des parts de SCPI en direct ?
              </p>
              <ul className="text-sm text-green-800 dark:text-green-300 space-y-1">
                <li>• <strong>TMI 11-30%</strong> : SCPI européennes en direct (PS 0% = gros avantage fiscal)</li>
                <li>• <strong>Capital disponible</strong> : Minimum 10 000-20 000 € (parts détenues en nom propre)</li>
                <li>• <strong>Horizon 10+ ans</strong> : Accepter la liquidité différée (revente sur marché secondaire)</li>
                <li>• <strong>Diversification</strong> : 3-5 SCPI minimum pour répartir le risque</li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold text-green-600">1</div>
                <div className="text-gray-700 dark:text-gray-300">
                  <strong>TMI 11-30% :</strong> Privilégiez les SCPI européennes en direct (rendement net 4,55-5,79% grâce aux PS 0%)
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold text-green-600">2</div>
                <div className="text-gray-700 dark:text-gray-300">
                  <strong>TMI 41%+ :</strong> Gardez les SCPI en assurance-vie (évite l'IR annuel, rendement net 4,14%)
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold text-green-600">3</div>
                <div className="text-gray-700 dark:text-gray-300">
                  <strong>Stratégie mixte :</strong> 50% SCPI AV (liquidité) + 50% SCPI direct Europe (rendement maximal)
                </div>
              </div>
            </div>

            <div className="mt-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border-l-4 border-purple-500">
              <p className="text-sm text-purple-900 dark:text-purple-200">
                <strong>💡 Exemple TMI 30% :</strong> 30k€ en SCPI AV France (5% brut → 4,14% net = 1 242 €/an) + 30k€ en SCPI Direct Europe (6,5% brut → 4,55% net = 1 365 €/an) = <strong>2 607 €/an de revenus passifs</strong>
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Étape 4 : Diversification multi-supports</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Pour un portefeuille optimal, diversifiez sur 3 dimensions :
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="font-bold text-blue-900 dark:text-blue-200 mb-2">📍 Géographies</div>
                <div className="text-sm text-blue-800 dark:text-blue-300">France (50%) + Europe (40%) + International (10%)</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="font-bold text-green-900 dark:text-green-200 mb-2">🏢 Secteurs</div>
                <div className="text-sm text-green-800 dark:text-green-300">Bureaux (40%) + Commerces (25%) + Santé (20%) + Logistique (15%)</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <div className="font-bold text-purple-900 dark:text-purple-200 mb-2">📦 Supports</div>
                <div className="text-sm text-purple-800 dark:text-purple-300">SCPI AV (50%) + SCPI Direct (30%) + UC (20%)</div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 border-l-4 border-yellow-500">
            <p className="font-bold text-yellow-900 dark:text-yellow-200 mb-2">
              ⚠️ Points de vigilance
            </p>
            <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
              <li>• <strong>Jamais 100% SCPI</strong> : Gardez de la liquidité (épargne de précaution)</li>
              <li>• <strong>Diversification obligatoire</strong> : Minimum 3 SCPI différentes</li>
              <li>• <strong>Frais d'entrée</strong> : 8-12% sur SCPI en direct (amortis sur 10+ ans)</li>
              <li>• <strong>Horizon minimum</strong> : 8 ans pour absorber les variations de prix de part</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
          <Building className="w-8 h-8 text-blue-600" />
          Questions fréquentes
        </h2>

        <div className="space-y-6">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Puis-je perdre mon capital avec les SCPI ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Oui, le capital n'est pas garanti. Le prix de part peut varier à la hausse ou à la baisse selon la valorisation du patrimoine immobilier. Cependant, sur le long terme (10-15 ans), les SCPI de qualité ont historiquement maintenu leur valeur tout en distribuant des revenus réguliers.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Conseil :</strong> Investissez sur un horizon minimum de 8 ans et diversifiez sur 3-5 SCPI différentes.
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Faut-il tout transférer d'un coup ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Non, il est recommandé de procéder progressivement. Commencez par 20-30% en SCPI via votre assurance-vie, observez les revenus pendant 6-12 mois, puis ajustez. Cette approche permet de vous familiariser avec le fonctionnement des SCPI sans prendre de risque excessif.
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              SCPI en direct ou via assurance-vie ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              <strong>Via assurance-vie :</strong> Liquidité instantanée, fiscalité avantageuse après 8 ans, pas d'IFI, succession optimisée. C'est l'option recommandée pour la majorité des épargnants.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>En direct :</strong> Rendement légèrement supérieur (pas de frais AV), avantages fiscaux spécifiques (déficit foncier), mais liquidité réduite (2-6 mois) et soumis à l'IFI.
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Les SCPI sont-elles soumises à l'IFI ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>En direct :</strong> Oui, les parts de SCPI sont soumises à l'Impôt sur la Fortune Immobilière si votre patrimoine immobilier dépasse 1,3 M€.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mt-2">
              <strong>Via assurance-vie :</strong> Non, les SCPI détenues dans une AV ne sont pas soumises à l'IFI.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Quel montant minimum pour investir en SCPI ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Via une assurance-vie, vous pouvez commencer avec <strong>quelques centaines d'euros</strong>. L'investissement fractionné permet d'acheter des parts de SCPI au fur et à mesure, sans minimum prohibitif.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              En direct, le minimum est généralement de 1 part, soit 180-1000 € selon les SCPI.
            </p>
          </div>
        </div>
      </section>

      {/* Section Crédit & Démembrement - Vision 360° */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-purple-600" />
          Stratégies avancées : crédit et démembrement
        </h2>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 mb-8 border-l-4 border-purple-500">
          <p className="text-gray-900 dark:text-white font-bold mb-3 text-lg">
            🚀 Vision 360° : au-delà du simple achat comptant
          </p>
          <p className="text-gray-800 dark:text-gray-200">
            Pour optimiser davantage votre investissement en SCPI, deux leviers puissants existent : <strong>l'achat à crédit</strong> (effet de levier) et le <strong>démembrement</strong> (optimisation fiscale et successorale). Ces stratégies permettent de démultiplier les performances ou de réduire drastiquement la fiscalité.
          </p>
        </div>

        {/* Crédit SCPI */}
        <div className="mb-10">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Euro className="w-6 h-6 text-blue-600" />
            1. SCPI à crédit : l'effet de levier
          </h3>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-6">
            <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-3">💡 Principe de l'effet de levier</h4>
            <p className="text-gray-800 dark:text-gray-200 mb-4">
              Emprunter pour investir en SCPI permet de <strong>déduire les intérêts d'emprunt de vos revenus fonciers</strong>, réduisant ainsi votre imposition. Les loyers SCPI peuvent couvrir tout ou partie des mensualités.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Avantages du crédit SCPI</div>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  <li>✅ <strong>Déduction fiscale</strong> des intérêts d'emprunt</li>
                  <li>✅ <strong>Effet de levier</strong> : patrimoine immobilier sans apport massif</li>
                  <li>✅ <strong>Mensualités couvertes</strong> (partiellement ou totalement) par loyers</li>
                  <li>✅ <strong>Capital constitué</strong> progressivement via le crédit</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Points de vigilance</div>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  <li>⚠️ <strong>Endettement</strong> : capacité de remboursement nécessaire</li>
                  <li>⚠️ <strong>Taux d'intérêt</strong> : coût du crédit à anticiper</li>
                  <li>⚠️ <strong>Effort d'épargne</strong> si loyers &lt; mensualités</li>
                  <li>⚠️ <strong>Horizon long terme</strong> requis (15-20 ans)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 mb-6">
            <h4 className="font-bold text-gray-900 dark:text-white mb-4">📊 Exemple : 100 000 € en SCPI à crédit sur 15 ans</h4>

            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Emprunt</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">100 000 €</div>
                <div className="text-xs text-gray-500 mt-1">Taux 3,5% sur 15 ans</div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Mensualité</div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">714 €/mois</div>
                <div className="text-xs text-gray-500 mt-1">Capital + intérêts</div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Loyers SCPI bruts</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">417 €/mois</div>
                <div className="text-xs text-gray-500 mt-1">5% brut annuel = 5 000 €/an</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Effort d'épargne mensuel</span>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">297 €/mois</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                (714 € mensualité - 417 € loyers SCPI) = effort net à financer
              </p>
            </div>

            <div className="mt-4 bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border-l-4 border-green-500">
              <p className="text-sm text-green-900 dark:text-green-200">
                <strong>💰 Bilan après 15 ans :</strong> Patrimoine SCPI de 100 000 € constitué pour un effort d'épargne total de ~53 500 € (297 €/mois × 180 mois). Les intérêts d'emprunt déductibles réduisent votre IR pendant toute la durée du crédit.
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border-l-4 border-yellow-500">
            <p className="text-sm text-yellow-900 dark:text-yellow-200">
              <strong>⚠️ Important :</strong> Le crédit SCPI est pertinent si vous avez des revenus stables, une capacité d'épargne mensuelle (200-400 €) et un horizon long terme (15+ ans). Il permet de se constituer un patrimoine immobilier progressivement tout en bénéficiant de la déduction fiscale des intérêts.
            </p>
          </div>
        </div>

        {/* Démembrement SCPI */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600" />
            2. Démembrement SCPI : optimisation fiscale et successorale
          </h3>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 mb-6">
            <h4 className="font-bold text-purple-900 dark:text-purple-200 mb-3">💡 Principe du démembrement</h4>
            <p className="text-gray-800 dark:text-gray-200 mb-4">
              Le démembrement consiste à séparer la propriété d'une part de SCPI en deux : l'<strong>usufruit</strong> (droit de percevoir les loyers) et la <strong>nue-propriété</strong> (droit de détenir la part). Cette technique offre des avantages fiscaux majeurs.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-purple-300 dark:border-purple-700">
                <div className="text-sm font-bold text-purple-700 dark:text-purple-300 mb-2">👴 Usufruitier (senior)</div>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  <li>✅ Reçoit <strong>100% des loyers</strong> SCPI</li>
                  <li>✅ Paie l'IR + PS sur les revenus</li>
                  <li>✅ Soumis à l'IFI (si applicable)</li>
                  <li>✅ Usufruit s'éteint au décès (sans droits de succession)</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-blue-300 dark:border-blue-700">
                <div className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-2">👶 Nu-propriétaire (junior)</div>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  <li>✅ <strong>0 loyer perçu</strong> pendant l'usufruit</li>
                  <li>✅ <strong>0 fiscalité</strong> (ni IR, ni PS, ni IFI)</li>
                  <li>✅ Prix d'achat <strong>décoté de 30-50%</strong></li>
                  <li>✅ Récupère la pleine propriété au décès de l'usufruitier</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 mb-6">
            <h4 className="font-bold text-gray-900 dark:text-white mb-4">📊 Exemple : Démembrement SCPI 100 000 €</h4>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Pleine propriété (valeur totale)</div>
                <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">100 000 €</div>
                <div className="text-xs text-gray-500 mt-1">Valeur de référence SCPI</div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Prix nue-propriété (70 ans)</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">60 000 €</div>
                <div className="text-xs text-gray-500 mt-1">Décote ~40% selon barème fiscal</div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Économie initiale pour le nu-propriétaire</span>
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">40 000 €</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Achat à 60k€ au lieu de 100k€ (40% de décote)
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Fiscalité annuelle nu-propriétaire</span>
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">0 €</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Aucun IR, aucun PS, aucun IFI pendant toute la durée de l'usufruit
                </p>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border-l-4 border-green-500">
              <p className="text-sm text-green-900 dark:text-green-200 mb-2">
                <strong>💰 Bilan :</strong> Au décès de l'usufruitier, le nu-propriétaire récupère automatiquement la pleine propriété d'une SCPI valant 100 000 € (+ réévaluation éventuelle), pour un investissement initial de seulement 60 000 €.
              </p>
              <p className="text-sm text-green-900 dark:text-green-200">
                <strong>Aucun droit de succession à payer</strong> sur la réunion de l'usufruit et de la nue-propriété (extinction naturelle de l'usufruit).
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-3">👍 Cas d'usage idéaux</h4>
              <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
                <li>• <strong>Transmission familiale</strong> : Parent usufruitier / Enfant nu-propriétaire</li>
                <li>• <strong>Optimisation IFI</strong> : Sortir l'actif de l'assiette IFI du nu-propriétaire</li>
                <li>• <strong>Investissement patrimonial long terme</strong> : Jeune actif sans besoin de revenus immédiats</li>
                <li>• <strong>Démembrement croisé</strong> entre époux pour optimiser la succession</li>
              </ul>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <h4 className="font-bold text-orange-900 dark:text-orange-200 mb-3">⚠️ Contraintes</h4>
              <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
                <li>• <strong>Illiquidité totale</strong> : Revente très difficile pendant l'usufruit</li>
                <li>• <strong>0 revenu</strong> pour le nu-propriétaire pendant 10-20 ans</li>
                <li>• <strong>Horizon très long terme</strong> : Adaptation selon âge usufruitier</li>
                <li>• <strong>Risque de longévité</strong> : Durée de l'usufruit incertaine</li>
              </ul>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border-l-4 border-purple-500">
            <p className="text-sm text-purple-900 dark:text-purple-200">
              <strong>🎯 Stratégie recommandée :</strong> Le démembrement est particulièrement pertinent dans le cadre d'une <strong>transmission patrimoniale anticipée</strong>. Un parent de 70 ans peut acheter l'usufruit (pour percevoir les loyers) et transmettre la nue-propriété à ses enfants (qui récupèrent la pleine propriété sans droits de succession). Cette technique permet d'optimiser à la fois la fiscalité, l'IFI et la succession.
            </p>
          </div>
        </div>
      </section>

      {/* Conclusion avec CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 dark:from-blue-800 dark:to-purple-900 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-4">Conclusion : Fonds euros ou SCPI, que choisir ?</h2>
        <div className="space-y-4 text-lg text-blue-50">
          <p>
            Les <strong>fonds euros</strong> restent pertinents pour votre épargne de précaution et vos besoins à court terme (&lt; 5 ans), grâce à leur garantie en capital et leur liquidité totale.
          </p>
          <p>
            Mais pour <strong>faire fructifier votre épargne sur le long terme</strong> (8+ ans), les <strong>SCPI</strong> offrent un rendement net 2 à 3 fois supérieur, même après fiscalité. L'approche optimale consiste à combiner les deux dans une allocation adaptée à votre profil.
          </p>
          <div className="bg-white/10 rounded-xl p-6 mt-6">
            <p className="text-xl font-bold mb-3">Notre recommandation</p>
            <p className="mb-4">
              <strong>Allocation équilibrée 30/70 :</strong> Conservez 30% en fonds euros pour la sécurité et la liquidité, investissez 70% en SCPI diversifiées via votre assurance-vie pour la performance et les revenus réguliers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <a href="/comparateur-scpi" className="bg-white text-blue-700 font-bold py-4 px-8 rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:scale-105 inline-flex items-center justify-center gap-2">
                <Calculator className="w-5 h-5" />
                Comparer les SCPI
              </a>
              <a href="/simulateurs" className="bg-blue-800/50 text-white font-bold py-4 px-8 rounded-xl hover:bg-blue-800/70 transition-all border-2 border-white/30 inline-flex items-center justify-center gap-2">
                <Target className="w-5 h-5" />
                Simuler mon allocation
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
