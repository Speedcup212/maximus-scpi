import React from 'react';
import { Building2, Shield, TrendingUp, AlertTriangle, CheckCircle2, Euro, Users, Target, User, Calendar, Clock, BarChart3, BookOpen, Scale, Lightbulb, Eye, Calculator, Coins, Gift, ArrowUpRight, Percent } from 'lucide-react';

export const DemembrementScpiNueProprieteUsufruitArticle: React.FC = () => {
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
            <li className="text-gray-900 dark:text-white font-semibold">Fiscalité du démembrement SCPI (Nue-propriété / Usufruit)</li>
          </ol>
        </nav>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-semibold rounded-full">
            Fiscalité
          </span>
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm font-semibold rounded-full">
            Stratégie Avancée
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          Fiscalité du démembrement SCPI : nue-propriété et usufruit décryptés
        </h1>

        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Éric Bellaiche, CGP</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>24 janvier 2025</span>
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
          Le démembrement de SCPI en nue-propriété et usufruit représente l'une des stratégies patrimoniales les plus sophistiquées en 2025. Cette technique permet d'optimiser simultanément votre fiscalité immédiate, de préparer votre transmission et de construire un patrimoine immobilier avec une décote initiale de 30 à 50%. Comprendre les mécanismes fiscaux du démembrement est essentiel pour en tirer pleinement parti et éviter les pièges.
        </p>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-l-4 border-blue-500">
          <p className="text-gray-900 dark:text-white font-bold mb-3 text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            Ce que vous allez découvrir :
          </p>
          <ul className="space-y-2 text-gray-800 dark:text-gray-200">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Mécanisme complet du démembrement : nue-propriété vs usufruit, droits et obligations de chacun</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Fiscalité détaillée en nue-propriété : 0€ d'impôts pendant 10-20 ans, calculs de décote selon l'âge</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Fiscalité de l'usufruit : revenus 100% imposables, stratégies d'optimisation IR et PS</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Reconstitution de la pleine propriété : mécanismes, fiscalité de la plus-value latente</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>4 stratégies selon votre profil avec simulations chiffrées sur 15 et 20 ans</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Pièges fiscaux à éviter et cas pratiques réels avec TMI 11%, 30% et 41%</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Section 1 : Comprendre le démembrement */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Scale className="w-8 h-8 text-blue-600" />
          Qu'est-ce que le démembrement de SCPI ?
        </h2>

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          Le démembrement consiste à diviser la propriété d'une part de SCPI en deux composantes distinctes : la <strong>nue-propriété</strong> et l'<strong>usufruit</strong>. Contrairement à la pleine propriété classique, ces deux droits sont séparés et appartiennent à des personnes différentes.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-l-4 border-blue-500">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-8 h-8 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Nue-propriété</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Le nu-propriétaire détient <strong>l'actif sans en percevoir les revenus</strong>. Il récupère la pleine propriété automatiquement au terme du démembrement.
            </p>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                <span><strong>Avantage</strong> : prix d'achat avec décote de 30 à 50%</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                <span><strong>Fiscalité</strong> : 0€ d'impôts pendant toute la durée</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                <span><strong>Transmission</strong> : hors succession si démembrement familial</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border-l-4 border-green-500">
            <div className="flex items-center gap-3 mb-4">
              <Coins className="w-8 h-8 text-green-600" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Usufruit</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              L'usufruitier perçoit <strong>100% des revenus locatifs</strong> pendant la durée du démembrement. À l'extinction, il perd tous ses droits.
            </p>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                <span><strong>Avantage</strong> : revenus immédiats sans immobiliser de capital</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                <span><strong>Fiscalité</strong> : IR + PS 17,2% sur revenus perçus</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                <span><strong>Durée</strong> : généralement 10 à 20 ans selon l'âge</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 border-l-4 border-amber-500">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Reconstitution de la pleine propriété</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Au terme du démembrement (fin de durée ou décès de l'usufruitier), le nu-propriétaire récupère automatiquement et <strong>gratuitement</strong> la pleine propriété. Cette plus-value latente de 30 à 50% se reconstitue sans aucune fiscalité ni formalité.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 : Fiscalité de la nue-propriété */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          Fiscalité de la nue-propriété : zéro impôt pendant 10-20 ans
        </h2>

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          La nue-propriété de SCPI bénéficie d'un régime fiscal exceptionnel : <strong>aucun revenu à déclarer, donc aucun impôt à payer</strong> pendant toute la durée du démembrement. Cette stratégie est particulièrement adaptée aux investisseurs fortement imposés qui privilégient la constitution d'un capital sur le long terme.
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Avantages fiscaux de la nue-propriété</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold text-gray-900 dark:text-white">Pas d'IR pendant la durée</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">Aucun revenu foncier à déclarer = 0€ d'impôt sur le revenu</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold text-gray-900 dark:text-white">Pas de prélèvements sociaux</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">Économie de 17,2% sur les revenus potentiels</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold text-gray-900 dark:text-white">Exonération d'IFI</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">Valorisation à 77% à 23% selon durée restante (barème fiscal)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold text-gray-900 dark:text-white">Transmission optimisée</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">Décote successorale de 30% à 50% selon l'âge de l'usufruitier</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Calcul de la décote selon l'âge de l'usufruitier</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            La valeur de la nue-propriété dépend de l'âge de l'usufruitier au moment de l'achat selon le <strong>barème fiscal de l'article 669 du CGI</strong> :
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-gray-900 dark:text-white">Âge usufruitier</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-900 dark:text-white">Valeur usufruit</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-900 dark:text-white">Valeur nue-propriété</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-900 dark:text-white">Décote effective</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Moins de 21 ans</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">90%</td>
                  <td className="px-4 py-3 text-blue-600 font-bold">10%</td>
                  <td className="px-4 py-3 text-green-600 font-bold">-90%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">31-40 ans</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">70%</td>
                  <td className="px-4 py-3 text-blue-600 font-bold">30%</td>
                  <td className="px-4 py-3 text-green-600 font-bold">-70%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">51-60 ans</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">50%</td>
                  <td className="px-4 py-3 text-blue-600 font-bold">50%</td>
                  <td className="px-4 py-3 text-green-600 font-bold">-50%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">71-80 ans</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">30%</td>
                  <td className="px-4 py-3 text-blue-600 font-bold">70%</td>
                  <td className="px-4 py-3 text-green-600 font-bold">-30%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Plus de 91 ans</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">10%</td>
                  <td className="px-4 py-3 text-blue-600 font-bold">90%</td>
                  <td className="px-4 py-3 text-green-600 font-bold">-10%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Exemple concret :</strong> Si vous achetez 100 000 € de nue-propriété avec un usufruitier de 55 ans (décote 50%), vous acquerrez un patrimoine qui vaudra <strong>200 000 € en pleine propriété</strong> au terme du démembrement, soit un doublement de votre capital sans aucune fiscalité.
            </p>
          </div>
        </div>
      </section>
      

      {/* Section 3 : Fiscalité de l'usufruit */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Euro className="w-8 h-8 text-green-600" />
          Fiscalité de l'usufruit : revenus imposables, stratégies d'optimisation
        </h2>

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          L'usufruitier perçoit 100% des revenus locatifs distribués par les SCPI, mais ces revenus sont <strong>entièrement imposables à l'impôt sur le revenu et aux prélèvements sociaux</strong>. La charge fiscale peut être lourde selon votre TMI, d'où l'importance d'optimiser cette fiscalité.
        </p>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Imposition des revenus de l'usufruitier</h3>

          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="font-bold text-gray-900 dark:text-white mb-2">1. Impôt sur le revenu (IR)</p>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                Les revenus de SCPI sont considérés comme des <strong>revenus fonciers</strong> et s'ajoutent à votre revenu global. Ils sont imposés selon votre TMI :
              </p>
              <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300 ml-4">
                <li>• TMI 11% : taux effectif de 11% sur les revenus SCPI</li>
                <li>• TMI 30% : taux effectif de 30% sur les revenus SCPI</li>
                <li>• TMI 41% : taux effectif de 41% sur les revenus SCPI</li>
                <li>• TMI 45% : taux effectif de 45% sur les revenus SCPI</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="font-bold text-gray-900 dark:text-white mb-2">2. Prélèvements sociaux (PS)</p>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Taux fixe de <strong>17,2%</strong> sur tous les revenus fonciers, quel que soit votre TMI. Cette taxe s'ajoute à l'IR et n'est pas déductible.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Simulation selon votre TMI</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Pour 10 000 € de revenus bruts SCPI perçus par l'usufruitier :
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-gray-900 dark:text-white">TMI</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-900 dark:text-white">Revenus bruts</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-900 dark:text-white">IR</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-900 dark:text-white">PS 17,2%</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-900 dark:text-white">Revenus nets</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-900 dark:text-white">Rendement net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">11%</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">10 000 €</td>
                  <td className="px-4 py-3 text-red-600">-1 100 €</td>
                  <td className="px-4 py-3 text-red-600">-1 720 €</td>
                  <td className="px-4 py-3 text-green-600 font-bold">7 180 €</td>
                  <td className="px-4 py-3 text-blue-600 font-bold">71,8%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">30%</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">10 000 €</td>
                  <td className="px-4 py-3 text-red-600">-3 000 €</td>
                  <td className="px-4 py-3 text-red-600">-1 720 €</td>
                  <td className="px-4 py-3 text-green-600 font-bold">5 280 €</td>
                  <td className="px-4 py-3 text-blue-600 font-bold">52,8%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">41%</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">10 000 €</td>
                  <td className="px-4 py-3 text-red-600">-4 100 €</td>
                  <td className="px-4 py-3 text-red-600">-1 720 €</td>
                  <td className="px-4 py-3 text-green-600 font-bold">4 180 €</td>
                  <td className="px-4 py-3 text-blue-600 font-bold">41,8%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 border-l-4 border-amber-500">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Stratégies d'optimisation pour l'usufruitier</h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 mt-1 flex-shrink-0" />
                  <span><strong>SCPI européennes</strong> : bénéficient de PS 0% (économie de 1 720 € sur 10 000 € de revenus)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 mt-1 flex-shrink-0" />
                  <span><strong>Déficit foncier</strong> : déduire travaux et charges pour réduire la base imposable</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 mt-1 flex-shrink-0" />
                  <span><strong>Donation temporaire</strong> : transférer l'usufruit à un enfant en TMI inférieur</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      

      {/* Section 4 : Stratégies selon votre profil */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Target className="w-8 h-8 text-blue-600" />
          4 stratégies de démembrement selon votre profil
        </h2>

        <div className="space-y-6">
          {/* Stratégie 1 */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-l-4 border-blue-500">
            <div className="flex items-center gap-3 mb-4">
              <ArrowUpRight className="w-8 h-8 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Stratégie 1 : Nue-propriété pour constituer un capital sans fiscalité</h3>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong>Profil idéal :</strong> Investisseur TMI 41-45%, 40-55 ans, patrimoine conséquent, horizon 15-20 ans
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-2">Exemple concret</h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Investissement : 100 000 € en nue-propriété</li>
                  <li>• Usufruitier : 60 ans (décote 50%)</li>
                  <li>• Durée démembrement : 15 ans</li>
                  <li>• Prix d'acquisition : 100 000 €</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-2">Résultats à 15 ans</h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Valeur pleine propriété : 200 000 €</li>
                  <li>• Plus-value latente : +100 000 €</li>
                  <li>• Fiscalité payée : 0 €</li>
                  <li>• <strong className="text-green-600">Gain net : +100% sans impôts</strong></li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-100 dark:bg-blue-900/40 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Avantage clé :</strong> Vous doublez votre capital en 15 ans sans payer un centime d'impôt, tout en bénéficiant d'une valorisation IFI réduite de 50% pendant toute la durée.
              </p>
            </div>
          </div>

          {/* Stratégie 2 */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border-l-4 border-green-500">
            <div className="flex items-center gap-3 mb-4">
              <Coins className="w-8 h-8 text-green-600" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Stratégie 2 : Usufruit pour des revenus immédiats</h3>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong>Profil idéal :</strong> Retraité ou pré-retraité, TMI 11-30%, besoin de revenus complémentaires, capital limité
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-bold text-green-900 dark:text-green-200 mb-2">Exemple concret</h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Acquisition usufruit : 50 000 €</li>
                  <li>• Usufruitier : 65 ans (valeur 40%)</li>
                  <li>• Rendement brut : 6%</li>
                  <li>• Revenus bruts annuels : 7 500 €/an</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-bold text-green-900 dark:text-green-200 mb-2">Revenus nets sur 15 ans (TMI 30%)</h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Revenus bruts cumulés : 112 500 €</li>
                  <li>• IR + PS (47,2%) : -53 100 €</li>
                  <li>• Revenus nets cumulés : 59 400 €</li>
                  <li>• <strong className="text-green-600">ROI : +19% sur capital investi</strong></li>
                </ul>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Point de vigilance :</strong> Au terme, l'usufruitier ne récupère rien. Cette stratégie convient uniquement si vous privilégiez les revenus immédiats sur la constitution de capital.
              </p>
            </div>
          </div>

          {/* Stratégie 3 */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border-l-4 border-purple-500">
            <div className="flex items-center gap-3 mb-4">
              <Gift className="w-8 h-8 text-purple-600" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Stratégie 3 : Démembrement familial pour la transmission</h3>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong>Profil idéal :</strong> Senior 60+, patrimoine élevé, optimisation succession, enfants majeurs
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-bold text-purple-900 dark:text-purple-200 mb-2">Mécanisme</h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Parent garde l'usufruit (revenus)</li>
                  <li>• Enfants reçoivent la nue-propriété</li>
                  <li>• Au décès : transmission automatique</li>
                  <li>• Droits de succession réduits de 50%</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-bold text-purple-900 dark:text-purple-200 mb-2">Économie fiscale sur 200 000 €</h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Valeur nue-propriété (60 ans) : 100 000 €</li>
                  <li>• Droits succession classiques : 20 000 €</li>
                  <li>• Droits avec démembrement : 0 €</li>
                  <li>• <strong className="text-green-600">Économie : 20 000 €</strong></li>
                </ul>
              </div>
            </div>

            <div className="bg-purple-100 dark:bg-purple-900/40 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Avantage majeur :</strong> Transmission hors succession + parent conserve les revenus à vie + abattement de 100 000 € par enfant tous les 15 ans applicable sur la nue-propriété.
              </p>
            </div>
          </div>

          {/* Stratégie 4 */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border-l-4 border-orange-500">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-8 h-8 text-orange-600" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Stratégie 4 : Démembrement temporaire croisé</h3>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong>Profil idéal :</strong> Couple avec patrimoines respectifs, optimisation IFI, transmission future
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-bold text-orange-900 dark:text-orange-200 mb-2">Mécanisme</h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Époux A achète nue-propriété</li>
                  <li>• Époux B achète usufruit</li>
                  <li>• Chacun optimise sa fiscalité</li>
                  <li>• Au décès B : A récupère pleine propriété</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-bold text-orange-900 dark:text-orange-200 mb-2">Avantages fiscaux</h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Réduction IFI de 50% sur patrimoine A</li>
                  <li>• Revenus pour B (retraité TMI 11%)</li>
                  <li>• Transmission facilitée au conjoint</li>
                  <li>• <strong className="text-green-600">Optimisation globale maximale</strong></li>
                </ul>
              </div>
            </div>

            <div className="bg-orange-100 dark:bg-orange-900/40 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Subtilité :</strong> Cette stratégie nécessite un conseil patrimonial approfondi pour respecter les règles fiscales et éviter la requalification en donation déguisée.
              </p>
            </div>
          </div>
        </div>
      </section>
      

      {/* Section 5 : Pièges fiscaux à éviter */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-red-600" />
          Pièges fiscaux à éviter absolument
        </h2>

        <div className="space-y-6">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border-l-4 border-red-500">
            <h3 className="text-lg font-bold text-red-900 dark:text-red-200 mb-3">
              1. Donation déguisée : attention au démembrement croisé mal structuré
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Si vous achetez la nue-propriété et que votre conjoint achète l'usufruit avec des fonds communs, le fisc peut requalifier l'opération en <strong>donation déguisée</strong>, entraînant droits de donation + pénalités.
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Solution :</strong> Utilisez exclusivement des fonds propres pour chaque achat ou formalisez une donation en bonne et due forme avec acte notarié.
              </p>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border-l-4 border-red-500">
            <h3 className="text-lg font-bold text-red-900 dark:text-red-200 mb-3">
              2. Abus de droit : démembrement fictif sans substance économique
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Un démembrement uniquement motivé par l'évasion fiscale (ex : usufruitier de 95 ans pour une durée de 1 an) peut être considéré comme un <strong>abus de droit</strong> par l'administration fiscale.
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Solution :</strong> Privilégiez des durées réalistes (10-20 ans) avec un objectif patrimonial cohérent (transmission, revenus, optimisation IFI).
              </p>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border-l-4 border-red-500">
            <h3 className="text-lg font-bold text-red-900 dark:text-red-200 mb-3">
              3. Valorisation IFI : erreur dans le calcul du barème fiscal
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Beaucoup d'investisseurs oublient que la <strong>valeur IFI de la nue-propriété évolue chaque année</strong> en fonction de la durée restante du démembrement. Une erreur de déclaration peut coûter cher.
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Solution :</strong> Recalculez annuellement la valeur IFI selon le barème de l'article 669 du CGI en fonction de l'âge de l'usufruitier.
              </p>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border-l-4 border-red-500">
            <h3 className="text-lg font-bold text-red-900 dark:text-red-200 mb-3">
              4. Revente anticipée : fiscalité sur plus-value latente
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Si vous revendez la nue-propriété avant le terme, la plus-value latente est imposée au <strong>barème des plus-values immobilières</strong> (19% + 17,2% PS = 36,2%).
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Solution :</strong> Conservez jusqu'au terme du démembrement pour bénéficier de la reconstitution gratuite et sans fiscalité.
              </p>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border-l-4 border-red-500">
            <h3 className="text-lg font-bold text-red-900 dark:text-red-200 mb-3">
              5. Frais de gestion et de transaction mal anticipés
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Le démembrement implique des <strong>frais notariés (1-2%), frais SCPI (8-12%) et frais annuels de gestion (10-12% HT des revenus)</strong> qui peuvent obérer significativement la rentabilité.
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Solution :</strong> Intégrez tous les frais dans vos simulations et comparez plusieurs SCPI pour optimiser les coûts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cas pratiques */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Users className="w-8 h-8 text-orange-600" />
          Cas pratiques selon votre profil
        </h2>

        <div className="space-y-6">
          {/* Profil 1 : Nue-propriété TMI 41% */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Profil 1 : Sophie, TMI 41%, 45 ans, 150 000 € en nue-propriété
            </h3>

            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong>Situation :</strong> Cadre supérieur, patrimoine conséquent, soumise à l'IFI, cherche à optimiser sa fiscalité et préparer sa retraite dans 20 ans.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-3">Stratégie mise en place</h4>
                <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
                  <li>• Achat : 150 000 € en nue-propriété</li>
                  <li>• Usufruitier : 60 ans (décote 50%)</li>
                  <li>• Durée démembrement : 20 ans</li>
                  <li>• Valeur pleine propriété : 300 000 €</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-3">Résultats sur 20 ans</h4>
                <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
                  <li>• Capital récupéré : 300 000 € (PP)</li>
                  <li>• Plus-value latente : +150 000 €</li>
                  <li>• Fiscalité payée : 0 €</li>
                  <li>• <strong className="text-green-600">Gain net : +100% sans impôts</strong></li>
                </ul>
              </div>
            </div>

            <div className="mt-4 bg-blue-100 dark:bg-blue-900/40 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Économie IFI annuelle :</strong> En valorisant à 50% (vs 100% en pleine propriété), Sophie économise environ 2 250 €/an d'IFI, soit 45 000 € sur 20 ans.
              </p>
            </div>
          </div>

          {/* Profil 2 : Usufruit TMI 11% */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Profil 2 : Marc, TMI 11%, 70 ans retraité, 40 000 € en usufruit
            </h3>

            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong>Situation :</strong> Retraité, pension faible, cherche un complément de revenus immédiat sans mobiliser trop de capital.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-green-900 dark:text-green-200 mb-3">Stratégie mise en place</h4>
                <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
                  <li>• Achat usufruit : 40 000 €</li>
                  <li>• Âge : 70 ans (valeur usufruit 30%)</li>
                  <li>• Rendement SCPI : 6%</li>
                  <li>• Revenus bruts annuels : 8 000 €/an</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-green-900 dark:text-green-200 mb-3">Revenus nets sur 15 ans (TMI 11%)</h4>
                <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
                  <li>• Revenus bruts cumulés : 120 000 €</li>
                  <li>• IR + PS (28,2%) : -33 840 €</li>
                  <li>• Revenus nets cumulés : 86 160 €</li>
                  <li>• <strong className="text-green-600">Revenus nets/an : 5 744 €</strong></li>
                </ul>
              </div>
            </div>

            <div className="mt-4 bg-green-100 dark:bg-green-900/40 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>ROI :</strong> Marc rentabilise son investissement initial en moins de 7 ans et perçoit ensuite des revenus purs pendant 8 ans.
              </p>
            </div>
          </div>

          {/* Profil 3 : Démembrement familial */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Profil 3 : Jean & Marie, 65 ans, transmission à leurs 2 enfants de 200 000 €
            </h3>

            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong>Situation :</strong> Couple retraité, patrimoine élevé, souhaite transmettre un capital à leurs enfants tout en conservant les revenus.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-purple-900 dark:text-purple-200 mb-3">Stratégie mise en place</h4>
                <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
                  <li>• Donation nue-propriété : 200 000 €</li>
                  <li>• Parents gardent usufruit (revenus)</li>
                  <li>• Enfants reçoivent nue-propriété</li>
                  <li>• Valeur nue-propriété (65 ans) : 80 000 €</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-purple-900 dark:text-purple-200 mb-3">Économie fiscale</h4>
                <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
                  <li>• Abattement par enfant : 100 000 €</li>
                  <li>• Base taxable : 0 € (sous abattement)</li>
                  <li>• Droits donation payés : 0 €</li>
                  <li>• <strong className="text-green-600">Économie vs succession : 32 000 €</strong></li>
                </ul>
              </div>
            </div>

            <div className="mt-4 bg-purple-100 dark:bg-purple-900/40 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Avantage double :</strong> Transmission sans droits + parents conservent 12 000 €/an de revenus locatifs pendant 20 ans (240 000 € cumulés).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section complémentaire : Reconstitution */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-green-600" />
          Reconstitution de la pleine propriété : le moment clé
        </h2>

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          La reconstitution de la pleine propriété est le moment où le nu-propriétaire récupère <strong>gratuitement</strong> 100% des droits sur les parts de SCPI. C'est l'aboutissement de la stratégie et l'instant où la plus-value latente se matérialise.
        </p>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">2 modes de reconstitution</h3>

          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-bold text-green-900 dark:text-green-200 mb-2">
                1. Reconstitution au terme de la durée fixée
              </h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                Si le démembrement est constitué pour une <strong>durée déterminée</strong> (ex : 15 ans), la pleine propriété se reconstitue automatiquement à l'échéance.
              </p>
              <ul className="text-sm text-gray-700 dark:text-gray-300 ml-4 space-y-1">
                <li>• Aucune formalité nécessaire</li>
                <li>• Aucune fiscalité applicable</li>
                <li>• Reconstitution à la valeur de marché actuelle</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-bold text-green-900 dark:text-green-200 mb-2">
                2. Reconstitution au décès de l'usufruitier
              </h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                Si le démembrement est <strong>viager</strong> (décès de l'usufruitier), la reconstitution se fait lors du décès.
              </p>
              <ul className="text-sm text-gray-700 dark:text-gray-300 ml-4 space-y-1">
                <li>• Transmission hors succession si donation préalable</li>
                <li>• Pas de droits de succession sur la valeur usufruit</li>
                <li>• Reconstitution gratuite et automatique</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Simulation de reconstitution après 15 ans</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-gray-900 dark:text-white">Paramètre</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-900 dark:text-white">Année 0 (achat)</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-900 dark:text-white">Année 15 (reconstitution)</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-900 dark:text-white">Gain</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Investissement nue-propriété</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">100 000 €</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">-</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">-</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Valeur pleine propriété (théorique)</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">200 000 €</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">200 000 €</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">-</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Valeur de marché actuelle (PP)</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">-</td>
                  <td className="px-4 py-3 text-blue-600 font-bold">200 000 €</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">-</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Plus-value latente</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">100 000 €</td>
                  <td className="px-4 py-3 text-green-600 font-bold">+100 000 €</td>
                  <td className="px-4 py-3 text-green-600 font-bold">+100%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Fiscalité payée</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">0 €</td>
                  <td className="px-4 py-3 text-green-600 font-bold">0 €</td>
                  <td className="px-4 py-3 text-green-600 font-bold">0 €</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 border-l-4 border-amber-500">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Point fiscal essentiel</h3>
              <p className="text-gray-700 dark:text-gray-300">
                La reconstitution de la pleine propriété n'est <strong>jamais imposée</strong>. Vous récupérez la totalité de la valeur sans aucune fiscalité sur la plus-value latente. C'est le principal avantage fiscal du démembrement : une plus-value de 50 à 100% exonérée d'impôts.
              </p>
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
              Quel montant minimum pour investir ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Via une assurance-vie, vous pouvez commencer avec quelques centaines d'euros. En direct, le minimum est généralement d'une part, soit 200 à 1 000 € selon les SCPI. Pour une diversification optimale, nous recommandons un capital de départ de 10 000 € minimum.
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Quelle est la fiscalité applicable ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Les revenus SCPI sont soumis à l'IR selon votre TMI (11%, 30%, 41% ou 45%) plus les prélèvements sociaux de 17,2%. Via une assurance-vie, vous ne payez que les PS 17,2% annuellement (pas d'IR). Les SCPI européennes en direct bénéficient de PS 0% grâce aux conventions fiscales.
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Les revenus sont-ils garantis ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Non, les revenus SCPI dépendent du taux d'occupation des immeubles et de la conjoncture économique. Ils ne sont pas garantis mais historiquement réguliers pour les SCPI bien gérées. Le rendement moyen du marché se situe entre 4,5% et 6,5% brut en 2025.
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Combien de temps faut-il investir ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              L'investissement en SCPI nécessite un horizon de placement de <strong>8 à 10 ans minimum</strong>, idéalement 15-20 ans. Cette durée permet d'amortir les frais de souscription (8-12%) et de lisser les cycles immobiliers. Plus votre horizon est long, plus le rendement cumulé est attractif.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Comment revendre ses parts ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              En assurance-vie, la liquidité est quasi-instantanée (48-72h). En direct, vous déposez un ordre de vente auprès de la société de gestion qui organise la confrontation avec des acheteurs. Les délais varient de 2 à 6 mois selon la SCPI. Aucune garantie de rachat n'existe.
            </p>
          </div>
        </div>
      </section>

      {/* Conclusion + CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 dark:from-blue-800 dark:to-purple-900 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-4">Conclusion : Maîtrisez la fiscalité du démembrement SCPI</h2>
        <div className="space-y-4 text-lg text-blue-50">
          <p>
            Le démembrement de SCPI est une stratégie patrimoniale puissante mais complexe qui nécessite une maîtrise fiscale approfondie. En comprenant les mécanismes de taxation de la nue-propriété (0€ d'impôts pendant 10-20 ans) et de l'usufruit (revenus imposables au barème progressif + PS 17,2%), vous pouvez optimiser votre patrimoine de manière significative.
          </p>
          <p>
            Que vous cherchiez à constituer un capital sans fiscalité, à générer des revenus complémentaires, à optimiser votre IFI ou à préparer une transmission avantageuse, le démembrement offre des solutions adaptées. Les 4 stratégies présentées (nue-propriété pure, usufruit, démembrement familial, démembrement croisé) permettent de répondre à tous les profils d'investisseurs.
          </p>
          <p>
            L'essentiel est d'éviter les pièges fiscaux (donation déguisée, abus de droit, valorisation IFI erronée) et de privilégier une approche long terme (15-20 ans) pour bénéficier pleinement de la reconstitution gratuite de la pleine propriété.
          </p>

          <div className="bg-white/10 rounded-lg p-6 mt-6">
            <h3 className="text-xl font-bold mb-3">Besoin d'un accompagnement sur le démembrement SCPI ?</h3>
            <p className="mb-4">
              Notre équipe de CGP analyse votre situation fiscale et patrimoniale pour vous recommander la meilleure stratégie de démembrement adaptée à vos objectifs.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="/comparateur-scpi"
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors"
              >
                Comparer les SCPI
              </a>
              <a
                href="/demembrement-scpi-simulateur"
                className="inline-flex items-center px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-400 transition-colors"
              >
                Simuler un démembrement
              </a>
              <a
                href="/rendez-vous-gratuit"
                className="inline-flex items-center px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-400 transition-colors"
              >
                Prendre rendez-vous
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DemembrementScpiNueProprieteUsufruitArticle;
