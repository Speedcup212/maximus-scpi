import React from 'react';
import { Building2, Shield, TrendingUp, AlertTriangle, CheckCircle2, Euro, Users, Target, User, Calendar, Clock, BarChart3, BookOpen, Scale, Lightbulb, Eye, Calculator } from 'lucide-react';

export const IfiScpiImpotFortuneImmobiliereStrategiesArticle: React.FC = () => {
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
            <li className="text-gray-900 dark:text-white font-semibold">IFI et SCPI : comment réduire l'Impôt sur la Fortune Immobilière</li>
          </ol>
        </nav>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-semibold rounded-full">
            Fiscalite
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          IFI et SCPI : comment réduire l'Impôt sur la Fortune Immobilière
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
          L'IFI (Impôt sur la Fortune Immobilière) concerne les patrimoines immobiliers supérieurs à 1,3 million d'euros. Les parts de SCPI entrent dans l'assiette taxable de l'IFI au même titre que votre résidence principale ou vos biens locatifs. Cependant, des stratégies existent pour réduire ou neutraliser cet impact. Ce guide complet vous explique comment optimiser votre situation face à l'IFI en 2025.
        </p>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-l-4 border-blue-500">
          <p className="text-gray-900 dark:text-white font-bold mb-3 text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            Ce que vous allez découvrir :
          </p>
          <ul className="space-y-2 text-gray-800 dark:text-gray-200">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Règles IFI 2025 : barème progressif, seuils d'imposition et calcul de l'assiette taxable</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Comment les SCPI sont intégrées dans votre patrimoine IFI (valeur de reconstitution)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Stratégies d'optimisation : assurance-vie exonérée, démembrement, donation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Calculs complets avec 3 niveaux de patrimoine : 1,5M€, 2M€ et 3M€</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Comparaison SCPI en direct vs assurance-vie pour l'IFI</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Barème IFI 2025 */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          Le barème IFI 2025
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          L'IFI s'applique aux patrimoines immobiliers nets supérieurs à 1,3 million d'euros. Le calcul se fait par tranches progressives, avec un abattement de 30% sur la résidence principale.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-blue-50 dark:bg-blue-900/30">
                <th className="p-4 font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">
                  Valeur nette du patrimoine
                </th>
                <th className="p-4 font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">
                  Taux d'imposition
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-700 dark:text-gray-300">
              <tr>
                <td className="p-4 border border-gray-200 dark:border-gray-700">Jusqu'à 800 000 €</td>
                <td className="p-4 border border-gray-200 dark:border-gray-700 font-bold text-green-600">0%</td>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-900/50">
                <td className="p-4 border border-gray-200 dark:border-gray-700">De 800 001 € à 1 300 000 €</td>
                <td className="p-4 border border-gray-200 dark:border-gray-700 font-bold">0,50%</td>
              </tr>
              <tr>
                <td className="p-4 border border-gray-200 dark:border-gray-700">De 1 300 001 € à 2 570 000 €</td>
                <td className="p-4 border border-gray-200 dark:border-gray-700 font-bold">0,70%</td>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-900/50">
                <td className="p-4 border border-gray-200 dark:border-gray-700">De 2 570 001 € à 5 000 000 €</td>
                <td className="p-4 border border-gray-200 dark:border-gray-700 font-bold">1,00%</td>
              </tr>
              <tr>
                <td className="p-4 border border-gray-200 dark:border-gray-700">De 5 000 001 € à 10 000 000 €</td>
                <td className="p-4 border border-gray-200 dark:border-gray-700 font-bold">1,25%</td>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-900/50">
                <td className="p-4 border border-gray-200 dark:border-gray-700">Au-delà de 10 000 000 €</td>
                <td className="p-4 border border-gray-200 dark:border-gray-700 font-bold text-red-600">1,50%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 mt-6">
          <h3 className="text-xl font-bold text-yellow-900 dark:text-yellow-200 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Décote et seuil d'imposition
          </h3>
          <div className="text-gray-800 dark:text-gray-200 space-y-3">
            <p>
              <strong>Seuil d'imposition :</strong> L'IFI ne s'applique qu'à partir de 1,3 million € de patrimoine immobilier net taxable.
            </p>
            <p>
              <strong>Décote :</strong> Si votre patrimoine est compris entre 1,3M€ et 1,4M€, une décote s'applique : 17 500 € - (1,25% × patrimoine net taxable).
            </p>
            <p className="text-sm italic">
              Exemple : Patrimoine de 1,35M€ → Décote = 17 500 - (1,25% × 1 350 000) = 625 €
            </p>
          </div>
        </div>
      </section>

      {/* Comment les SCPI sont intégrées à l'IFI */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Building2 className="w-8 h-8 text-blue-600" />
          Comment les SCPI entrent dans le calcul de l'IFI
        </h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Valeur à déclarer
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Pour les SCPI détenues en direct, vous devez déclarer la <strong>valeur de reconstitution</strong> au 1er janvier de l'année d'imposition. Cette valeur correspond à :
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <p className="text-center text-2xl font-bold text-blue-900 dark:text-blue-200 mb-2">
                Valeur de reconstitution = Prix de souscription + frais
              </p>
              <p className="text-center text-gray-700 dark:text-gray-300 text-sm">
                OU la valeur de retrait si elle est inférieure
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6">
              <h4 className="font-bold text-red-900 dark:text-red-200 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                SCPI en direct = Taxable IFI
              </h4>
              <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
                <li>✗ Intégrées dans l'assiette IFI</li>
                <li>✗ Valeur de reconstitution (prix + frais)</li>
                <li>✗ Pas de possibilité de déduction</li>
                <li>✗ Déclaration obligatoire si patrimoine &gt; 1,3M€</li>
              </ul>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
              <h4 className="font-bold text-green-900 dark:text-green-200 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                SCPI en assurance-vie = Exonérées IFI
              </h4>
              <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
                <li>✓ Totalement exonérées d'IFI</li>
                <li>✓ Ne rentrent pas dans l'assiette taxable</li>
                <li>✓ Solution optimale pour gros patrimoines</li>
                <li>✓ + avantages transmission (abattement 152 500€)</li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border-l-4 border-orange-500">
            <h4 className="font-bold text-orange-900 dark:text-orange-200 mb-3 text-lg">
              Exemple concret
            </h4>
            <p className="text-gray-800 dark:text-gray-200 mb-3">
              Vous détenez 100 000 € de parts SCPI achetées avec 10% de frais de souscription :
            </p>
            <ul className="text-gray-800 dark:text-gray-200 space-y-2 text-sm">
              <li>• <strong>En direct :</strong> Valeur IFI = 110 000 € (prix + frais)</li>
              <li>• <strong>En assurance-vie :</strong> Valeur IFI = 0 € (exonération totale)</li>
            </ul>
            <p className="text-orange-900 dark:text-orange-200 font-bold mt-4">
              Économie d'IFI potentielle sur 100 000 € : jusqu'à 1 650 €/an (taux 1,5% sur gros patrimoine)
            </p>
          </div>
        </div>
      </section>
      

      {/* Stratégies d'optimisation */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Lightbulb className="w-8 h-8 text-blue-600" />
          5 stratégies pour réduire l'IFI avec les SCPI
        </h2>

        <div className="space-y-6">
          {/* Stratégie 1 */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border-l-4 border-green-500">
            <div className="flex items-start gap-3 mb-3">
              <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Privilégier l'assurance-vie (exonération IFI totale)
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4 ml-11">
              <strong>La solution la plus efficace :</strong> Les SCPI détenues dans une assurance-vie sont totalement exonérées d'IFI, quel que soit le montant investi.
            </p>
            <div className="ml-11 bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="font-bold text-green-900 dark:text-green-200 mb-2">Exemple chiffré :</p>
              <p className="text-sm text-gray-800 dark:text-gray-200">
                • 500 000 € de SCPI en direct → IFI de 3 500 €/an (0,7%)<br/>
                • 500 000 € de SCPI en AV → IFI de 0 € (exonération totale)<br/>
                <span className="font-bold text-green-600">→ Économie : 3 500 €/an soit 35 000 € sur 10 ans</span>
              </p>
            </div>
          </div>

          {/* Stratégie 2 */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-l-4 border-blue-500">
            <div className="flex items-start gap-3 mb-3">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Démembrement de propriété
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4 ml-11">
              En démembrant vos parts SCPI (nue-propriété / usufruit), seule la valeur de la nue-propriété entre dans l'assiette IFI. L'usufruit est exonéré s'il est détenu par le conjoint ou dans certains cas.
            </p>
            <div className="ml-11 bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="font-bold text-blue-900 dark:text-blue-200 mb-2">Exemple chiffré :</p>
              <p className="text-sm text-gray-800 dark:text-gray-200">
                • Valeur pleine propriété : 200 000 €<br/>
                • Nue-propriété 10 ans : 55% de la valeur = 110 000 €<br/>
                • Usufruit : exonéré si détenu par conjoint<br/>
                <span className="font-bold text-blue-600">→ Base IFI réduite de 90 000 € soit économie de 630 €/an</span>
              </p>
            </div>
          </div>

          {/* Stratégie 3 */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border-l-4 border-purple-500">
            <div className="flex items-start gap-3 mb-3">
              <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Donation avant seuil IFI
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4 ml-11">
              Donner des parts de SCPI à vos enfants permet de réduire votre patrimoine taxable tout en bénéficiant d'un abattement de 100 000 € par enfant tous les 15 ans (exonération de droits de donation).
            </p>
            <div className="ml-11 bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="font-bold text-purple-900 dark:text-purple-200 mb-2">Exemple chiffré :</p>
              <p className="text-sm text-gray-800 dark:text-gray-200">
                • Patrimoine IFI : 1,5M€ → IFI de 1 400 €/an<br/>
                • Donation de 200 000 € de SCPI à 2 enfants (100k chacun)<br/>
                • Nouveau patrimoine : 1,3M€ → IFI de 0 € (sous le seuil)<br/>
                <span className="font-bold text-purple-600">→ Économie : 1 400 €/an + transmission anticipée exonérée</span>
              </p>
            </div>
          </div>

          {/* Stratégie 4 */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border-l-4 border-orange-500">
            <div className="flex items-start gap-3 mb-3">
              <div className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                4
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Déduction des dettes liées aux SCPI
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4 ml-11">
              Si vous avez acheté vos SCPI à crédit, le capital restant dû est déductible de la valeur des parts pour le calcul de l'IFI (à condition que le prêt soit affecté à l'achat des parts).
            </p>
            <div className="ml-11 bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="font-bold text-orange-900 dark:text-orange-200 mb-2">Exemple chiffré :</p>
              <p className="text-sm text-gray-800 dark:text-gray-200">
                • Valeur SCPI : 300 000 €<br/>
                • Capital restant dû : 150 000 €<br/>
                • Base IFI : 300 000 - 150 000 = 150 000 €<br/>
                <span className="font-bold text-orange-600">→ Économie : 1 050 €/an d'IFI pendant la durée du crédit</span>
              </p>
            </div>
          </div>

          {/* Stratégie 5 */}
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl p-6 border-l-4 border-yellow-500">
            <div className="flex items-start gap-3 mb-3">
              <div className="bg-yellow-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                5
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Holding patrimoniale (SCI ou SAS)
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4 ml-11">
              Détenir vos SCPI via une SCI ou une SAS permet d'optimiser la transmission et potentiellement de réduire l'assiette IFI grâce à la déduction des dettes de la société.
            </p>
            <div className="ml-11 bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="font-bold text-yellow-900 dark:text-yellow-200 mb-2">Points d'attention :</p>
              <p className="text-sm text-gray-800 dark:text-gray-200">
                • Complexité administrative accrue<br/>
                • Coûts de gestion et comptabilité<br/>
                • Intéressant à partir de 500 000 € de patrimoine<br/>
                • Nécessite conseil d'un professionnel (CGP, notaire)
              </p>
            </div>
          </div>
        </div>
      </section>
      

      {/* Calculs IFI détaillés */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Calculator className="w-8 h-8 text-blue-600" />
          Calculs IFI détaillés selon votre patrimoine
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          Voici des simulations complètes de l'impact de l'IFI sur différents niveaux de patrimoine comprenant des SCPI, et les économies possibles grâce à l'assurance-vie.
        </p>

        <div className="space-y-8">
          {/* Simulation 1: Patrimoine 1,5M€ */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Cas 1 : Patrimoine immobilier 1,5 million € (dont 300 000 € de SCPI)
            </h3>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-5">
                <h4 className="font-bold text-red-900 dark:text-red-200 mb-3 text-lg">
                  ❌ Scénario 1 : SCPI en direct
                </h4>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <p><strong>Résidence principale :</strong> 600 000 € (après abattement 30%)</p>
                  <p><strong>Bien locatif :</strong> 600 000 €</p>
                  <p><strong>SCPI en direct :</strong> 300 000 €</p>
                  <p className="pt-2 border-t border-gray-300 dark:border-gray-600">
                    <strong>Total patrimoine IFI :</strong> 1 500 000 €
                  </p>
                </div>

                <div className="mt-4 bg-red-50 dark:bg-red-900/30 rounded-lg p-4">
                  <p className="font-bold text-red-900 dark:text-red-200 mb-2">Calcul IFI :</p>
                  <div className="text-sm text-gray-800 dark:text-gray-200 space-y-1">
                    <p>• Tranche 0-800k : 0 €</p>
                    <p>• Tranche 800k-1,3M : 2 500 € (0,5%)</p>
                    <p>• Tranche 1,3M-1,5M : 1 400 € (0,7%)</p>
                    <p className="pt-2 border-t border-red-300 dark:border-red-700 font-bold text-red-600 text-lg">
                      IFI total : 3 900 €/an
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-5">
                <h4 className="font-bold text-green-900 dark:text-green-200 mb-3 text-lg">
                  ✅ Scénario 2 : SCPI en assurance-vie
                </h4>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <p><strong>Résidence principale :</strong> 600 000 € (après abattement 30%)</p>
                  <p><strong>Bien locatif :</strong> 600 000 €</p>
                  <p><strong>SCPI en AV :</strong> 0 € (exonérées)</p>
                  <p className="pt-2 border-t border-gray-300 dark:border-gray-600">
                    <strong>Total patrimoine IFI :</strong> 1 200 000 €
                  </p>
                </div>

                <div className="mt-4 bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
                  <p className="font-bold text-green-900 dark:text-green-200 mb-2">Calcul IFI :</p>
                  <div className="text-sm text-gray-800 dark:text-gray-200 space-y-1">
                    <p>• Patrimoine &lt; 1,3M€</p>
                    <p>• Sous le seuil d'imposition</p>
                    <p className="pt-2 border-t border-green-300 dark:border-green-700 font-bold text-green-600 text-lg">
                      IFI total : 0 €/an
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg p-5">
              <p className="text-xl font-bold mb-2">💰 Économie annuelle : 3 900 €</p>
              <p className="text-lg">Sur 10 ans : 39 000 € économisés</p>
              <p className="text-lg">Sur 20 ans : 78 000 € économisés</p>
            </div>
          </div>

          {/* Simulation 2: Patrimoine 2M€ */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-800">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Cas 2 : Patrimoine immobilier 2 millions € (dont 500 000 € de SCPI)
            </h3>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-5">
                <h4 className="font-bold text-red-900 dark:text-red-200 mb-3 text-lg">
                  ❌ Scénario 1 : SCPI en direct
                </h4>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <p><strong>Résidence principale :</strong> 700 000 € (après abattement 30%)</p>
                  <p><strong>Bien locatif :</strong> 800 000 €</p>
                  <p><strong>SCPI en direct :</strong> 500 000 €</p>
                  <p className="pt-2 border-t border-gray-300 dark:border-gray-600">
                    <strong>Total patrimoine IFI :</strong> 2 000 000 €
                  </p>
                </div>

                <div className="mt-4 bg-red-50 dark:bg-red-900/30 rounded-lg p-4">
                  <p className="font-bold text-red-900 dark:text-red-200 mb-2">Calcul IFI :</p>
                  <div className="text-sm text-gray-800 dark:text-gray-200 space-y-1">
                    <p>• Tranche 0-800k : 0 €</p>
                    <p>• Tranche 800k-1,3M : 2 500 € (0,5%)</p>
                    <p>• Tranche 1,3M-2M : 4 900 € (0,7%)</p>
                    <p className="pt-2 border-t border-red-300 dark:border-red-700 font-bold text-red-600 text-lg">
                      IFI total : 7 400 €/an
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-5">
                <h4 className="font-bold text-green-900 dark:text-green-200 mb-3 text-lg">
                  ✅ Scénario 2 : SCPI en assurance-vie
                </h4>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <p><strong>Résidence principale :</strong> 700 000 € (après abattement 30%)</p>
                  <p><strong>Bien locatif :</strong> 800 000 €</p>
                  <p><strong>SCPI en AV :</strong> 0 € (exonérées)</p>
                  <p className="pt-2 border-t border-gray-300 dark:border-gray-600">
                    <strong>Total patrimoine IFI :</strong> 1 500 000 €
                  </p>
                </div>

                <div className="mt-4 bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
                  <p className="font-bold text-green-900 dark:text-green-200 mb-2">Calcul IFI :</p>
                  <div className="text-sm text-gray-800 dark:text-gray-200 space-y-1">
                    <p>• Tranche 0-800k : 0 €</p>
                    <p>• Tranche 800k-1,3M : 2 500 € (0,5%)</p>
                    <p>• Tranche 1,3M-1,5M : 1 400 € (0,7%)</p>
                    <p className="pt-2 border-t border-green-300 dark:border-green-700 font-bold text-green-600 text-lg">
                      IFI total : 3 900 €/an
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg p-5">
              <p className="text-xl font-bold mb-2">💰 Économie annuelle : 3 500 €</p>
              <p className="text-lg">Sur 10 ans : 35 000 € économisés</p>
              <p className="text-lg">Sur 20 ans : 70 000 € économisés</p>
            </div>
          </div>

          {/* Simulation 3: Patrimoine 3M€ */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-6 border-2 border-orange-200 dark:border-orange-800">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Cas 3 : Patrimoine immobilier 3 millions € (dont 800 000 € de SCPI)
            </h3>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-5">
                <h4 className="font-bold text-red-900 dark:text-red-200 mb-3 text-lg">
                  ❌ Scénario 1 : SCPI en direct
                </h4>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <p><strong>Résidence principale :</strong> 1 000 000 € (après abattement 30%)</p>
                  <p><strong>Bien locatif :</strong> 1 200 000 €</p>
                  <p><strong>SCPI en direct :</strong> 800 000 €</p>
                  <p className="pt-2 border-t border-gray-300 dark:border-gray-600">
                    <strong>Total patrimoine IFI :</strong> 3 000 000 €
                  </p>
                </div>

                <div className="mt-4 bg-red-50 dark:bg-red-900/30 rounded-lg p-4">
                  <p className="font-bold text-red-900 dark:text-red-200 mb-2">Calcul IFI :</p>
                  <div className="text-sm text-gray-800 dark:text-gray-200 space-y-1">
                    <p>• Tranche 0-800k : 0 €</p>
                    <p>• Tranche 800k-1,3M : 2 500 € (0,5%)</p>
                    <p>• Tranche 1,3M-2,57M : 8 890 € (0,7%)</p>
                    <p>• Tranche 2,57M-3M : 4 300 € (1%)</p>
                    <p className="pt-2 border-t border-red-300 dark:border-red-700 font-bold text-red-600 text-lg">
                      IFI total : 15 690 €/an
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-5">
                <h4 className="font-bold text-green-900 dark:text-green-200 mb-3 text-lg">
                  ✅ Scénario 2 : SCPI en assurance-vie
                </h4>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <p><strong>Résidence principale :</strong> 1 000 000 € (après abattement 30%)</p>
                  <p><strong>Bien locatif :</strong> 1 200 000 €</p>
                  <p><strong>SCPI en AV :</strong> 0 € (exonérées)</p>
                  <p className="pt-2 border-t border-gray-300 dark:border-gray-600">
                    <strong>Total patrimoine IFI :</strong> 2 200 000 €
                  </p>
                </div>

                <div className="mt-4 bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
                  <p className="font-bold text-green-900 dark:text-green-200 mb-2">Calcul IFI :</p>
                  <div className="text-sm text-gray-800 dark:text-gray-200 space-y-1">
                    <p>• Tranche 0-800k : 0 €</p>
                    <p>• Tranche 800k-1,3M : 2 500 € (0,5%)</p>
                    <p>• Tranche 1,3M-2,2M : 6 300 € (0,7%)</p>
                    <p className="pt-2 border-t border-green-300 dark:border-green-700 font-bold text-green-600 text-lg">
                      IFI total : 8 800 €/an
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg p-5">
              <p className="text-xl font-bold mb-2">💰 Économie annuelle : 6 890 €</p>
              <p className="text-lg">Sur 10 ans : 68 900 € économisés</p>
              <p className="text-lg">Sur 20 ans : 137 800 € économisés</p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6">
          <h3 className="text-2xl font-bold mb-3">📊 Tableau récapitulatif</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-white/30">
                  <th className="p-3">Patrimoine</th>
                  <th className="p-3">SCPI direct</th>
                  <th className="p-3">SCPI en AV</th>
                  <th className="p-3">Économie/an</th>
                  <th className="p-3">Sur 20 ans</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-white/20">
                  <td className="p-3 font-bold">1,5M€</td>
                  <td className="p-3">3 900 €</td>
                  <td className="p-3 text-green-300 font-bold">0 €</td>
                  <td className="p-3 font-bold">3 900 €</td>
                  <td className="p-3 font-bold">78 000 €</td>
                </tr>
                <tr className="border-b border-white/20">
                  <td className="p-3 font-bold">2M€</td>
                  <td className="p-3">7 400 €</td>
                  <td className="p-3 text-green-300">3 900 €</td>
                  <td className="p-3 font-bold">3 500 €</td>
                  <td className="p-3 font-bold">70 000 €</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">3M€</td>
                  <td className="p-3">15 690 €</td>
                  <td className="p-3 text-green-300">8 800 €</td>
                  <td className="p-3 font-bold">6 890 €</td>
                  <td className="p-3 font-bold">137 800 €</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
      

      {/* Cas pratiques IFI */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Users className="w-8 h-8 text-orange-600" />
          Cas pratiques : optimiser SCPI et IFI selon votre profil
        </h2>

        <div className="space-y-6">
          {/* Profil 1 */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Profil 1 : Patrimoine proche du seuil IFI (1,2M€)
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm italic">
              Marc, 58 ans, patrimoine 1,2M€ (résidence principale 850k€ + 350k€ immobilier locatif). Souhaite investir 100k€ en SCPI sans déclencher l'IFI.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-red-900 dark:text-red-200 mb-3">❌ Sans optimisation</h4>
                <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
                  <li>• Investit 100k€ SCPI en direct</li>
                  <li>• Patrimoine IFI : 1,3M€ (seuil dépassé)</li>
                  <li>• IFI année 1 : ~100 €/an</li>
                  <li>• Risque d'augmentation si valorisation +</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-green-900 dark:text-green-200 mb-3">✅ Avec optimisation</h4>
                <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
                  <li>• Investit 100k€ SCPI en assurance-vie</li>
                  <li>• Patrimoine IFI : 1,2M€ (sous le seuil)</li>
                  <li>• IFI : 0 €/an (exonération totale)</li>
                  <li>• + avantage transmission (152k€ abattement)</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 bg-green-600 text-white rounded-lg p-4">
              <p className="font-bold">💡 Conseil : L'assurance-vie permet de rester sous le seuil IFI tout en développant votre patrimoine immobilier via les SCPI.</p>
            </div>
          </div>

          {/* Profil 2 */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Profil 2 : Patrimoine 2M€ assujetti à l'IFI
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm italic">
              Sophie et Pierre, 52 ans, patrimoine 2M€ (résidence 1M€ + 500k€ SCPI direct + 500k€ immobilier). IFI annuel de 7 400 €. Cherchent à réduire.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-red-900 dark:text-red-200 mb-3">❌ Situation actuelle</h4>
                <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
                  <li>• 500k€ SCPI détenues en direct</li>
                  <li>• Patrimoine IFI : 2M€</li>
                  <li>• IFI annuel : 7 400 €</li>
                  <li>• Sur 10 ans : 74 000 € d'IFI payé</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-green-900 dark:text-green-200 mb-3">✅ Après arbitrage AV</h4>
                <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
                  <li>• Transfert 500k€ SCPI vers AV (exonérées)</li>
                  <li>• Patrimoine IFI : 1,5M€</li>
                  <li>• IFI annuel : 3 900 €</li>
                  <li>• Économie : 3 500 €/an soit 35 000 € sur 10 ans</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-4">
              <p className="font-bold text-yellow-900 dark:text-yellow-200 mb-2">⚠️ À noter :</p>
              <p className="text-sm text-gray-800 dark:text-gray-200">
                L'arbitrage des SCPI en direct vers l'assurance-vie peut générer une plus-value taxable (19% + 17,2% PS si détention &lt; 30 ans). À comparer avec l'économie d'IFI sur le long terme.
              </p>
            </div>
          </div>

          {/* Profil 3 */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Profil 3 : Gros patrimoine avec stratégie transmission (3M€)
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm italic">
              Jean, 65 ans, patrimoine 3M€ (résidence 1,5M€ + 800k€ SCPI + 700k€ immobilier). IFI de 15 690 €/an. 2 enfants. Anticipe transmission.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-red-900 dark:text-red-200 mb-3">❌ Sans stratégie</h4>
                <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
                  <li>• 800k€ SCPI en direct (taxable IFI)</li>
                  <li>• IFI : 15 690 €/an</li>
                  <li>• Sur 10 ans : 156 900 € d'IFI</li>
                  <li>• Transmission : droits succession élevés</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-green-900 dark:text-green-200 mb-3">✅ Stratégie combinée</h4>
                <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
                  <li>• 400k€ SCPI → AV (exonération IFI)</li>
                  <li>• 200k€ donation nue-propriété aux enfants</li>
                  <li>• 200k€ conservés en direct</li>
                  <li>• IFI réduit à ~9 000 €/an (-6 690 €)</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg p-4">
              <p className="font-bold mb-2">💰 Bénéfices cumulés :</p>
              <ul className="text-sm space-y-1">
                <li>• Économie IFI : 66 900 € sur 10 ans</li>
                <li>• Transmission anticipée : 200k€ transmis hors succession</li>
                <li>• AV : abattement 152 500 €/bénéficiaire si décès avant 70 ans</li>
                <li>• Démembrement : valorisation progressive pour les enfants</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Points de vigilance */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-orange-600" />
          Points de vigilance
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
            <h3 className="font-bold text-yellow-900 dark:text-yellow-200 mb-3">Risques à connaître</h3>
            <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
              <li>⚠️ Liquidité limitée (2-6 mois en direct)</li>
              <li>⚠️ Vacance locative possible (impact revenus)</li>
              <li>⚠️ Valeur des parts non garantie (cycle immobilier)</li>
              <li>⚠️ Frais de souscription 8-12% (à amortir)</li>
            </ul>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
            <h3 className="font-bold text-green-900 dark:text-green-200 mb-3">Comment les limiter</h3>
            <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
              <li>✅ Diversifier sur 4-6 SCPI minimum</li>
              <li>✅ Vérifier taux d'occupation &gt; 90%</li>
              <li>✅ Privilégier sociétés de gestion réputées</li>
              <li>✅ Investir horizon 10+ ans minimum</li>
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
              Les SCPI sont-elles toujours soumises à l'IFI ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Les SCPI détenues en direct sont intégrées dans l'assiette de l'IFI à leur valeur de reconstitution (prix + frais). En revanche, <strong>les SCPI détenues dans une assurance-vie sont totalement exonérées d'IFI</strong>, quel que soit le montant investi. C'est la principale stratégie d'optimisation pour les gros patrimoines.
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              À partir de quel montant suis-je concerné par l'IFI ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              L'IFI s'applique dès que votre patrimoine immobilier net taxable dépasse <strong>1,3 million d'euros</strong>. Ce seuil inclut votre résidence principale (avec abattement de 30%), vos biens locatifs, et les SCPI détenues en direct. Une décote s'applique si votre patrimoine est compris entre 1,3M€ et 1,4M€.
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Comment calculer mon IFI avec des SCPI ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Pour calculer votre IFI : <strong>(1)</strong> Additionnez tous vos biens immobiliers taxables (résidence avec abattement 30%, locatif, SCPI en direct) ; <strong>(2)</strong> Soustrayez vos dettes immobilières ; <strong>(3)</strong> Appliquez le barème progressif (0,5% à 1,5% selon les tranches). Les SCPI en assurance-vie ne sont pas incluses dans ce calcul.
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Puis-je transférer mes SCPI en direct vers une assurance-vie ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Oui, mais techniquement il s'agit d'une <strong>vente suivie d'un réinvestissement</strong>. Vous devrez d'abord revendre vos parts SCPI en direct (délai 2-6 mois), ce qui peut générer une plus-value taxable (19% + 17,2% PS). Puis réinvestir le produit dans une AV. À comparer avec l'économie d'IFI sur le long terme. Conseil d'un CGP recommandé.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Quelles autres stratégies existent pour réduire l'IFI ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Outre l'assurance-vie, vous pouvez : <strong>(1)</strong> Démembrer vos parts (nue-propriété/usufruit) pour réduire l'assiette taxable ; <strong>(2)</strong> Faire une donation à vos enfants (abattement 100k€/enfant tous les 15 ans) ; <strong>(3)</strong> Déduire vos dettes immobilières ; <strong>(4)</strong> Créer une holding patrimoniale (SCI/SAS) pour optimiser. Chaque stratégie a ses avantages selon votre situation.
            </p>
          </div>
        </div>
      </section>

      {/* Conclusion + CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 dark:from-blue-800 dark:to-purple-900 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-4">Conclusion : SCPI et IFI, une optimisation indispensable</h2>
        <div className="space-y-4 text-lg text-blue-50">
          <p>
            L'IFI peut représenter un coût significatif pour les patrimoines immobiliers supérieurs à 1,3 million d'euros. Les SCPI détenues en direct sont intégrées dans l'assiette taxable, ce qui peut alourdir considérablement votre facture fiscale (jusqu'à 15 000+ €/an pour les gros patrimoines).
          </p>
          <p>
            <strong>La solution la plus efficace reste l'assurance-vie :</strong> exonération totale d'IFI, avantages transmission (abattement 152 500 € par bénéficiaire), et liquidité optimale. Pour un patrimoine de 2M€ incluant 500k€ de SCPI, l'assurance-vie peut vous faire économiser plus de 70 000 € d'IFI sur 20 ans.
          </p>
          <p>
            D'autres stratégies existent selon votre situation : démembrement, donation, déduction de dettes, holding patrimoniale. L'important est d'anticiper et de structurer votre patrimoine SCPI en fonction de vos objectifs de long terme.
          </p>

          <div className="bg-white/10 rounded-lg p-6 mt-6">
            <h3 className="text-xl font-bold mb-3">💼 Analyse personnalisée IFI et SCPI</h3>
            <p className="mb-4">
              Vous avez un patrimoine proche ou supérieur au seuil IFI ? Notre équipe d'experts analyse gratuitement votre situation et vous recommande la stratégie optimale pour réduire votre IFI tout en développant vos revenus locatifs.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="/comparateur-scpi"
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors"
              >
                Comparer les SCPI
              </a>
              <a
                href="/contact"
                className="inline-flex items-center px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-400 transition-colors"
              >
                Prendre rendez-vous gratuit
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default IfiScpiImpotFortuneImmobiliereStrategiesArticle;
