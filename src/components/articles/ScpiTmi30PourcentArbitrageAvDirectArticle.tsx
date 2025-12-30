import React from 'react';
import { Building2, Shield, TrendingUp, AlertTriangle, CheckCircle2, Euro, Users, Target, User, Calendar, Clock, BarChart3, BookOpen, Scale, Lightbulb, Eye, Calculator, PieChart, Award, FileText, X } from 'lucide-react';

export const ScpiTmi30PourcentArbitrageAvDirectArticle: React.FC = () => {
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
            <li className="text-gray-900 dark:text-white font-semibold">SCPI et TMI 30% : assurance-vie ou direct ?</li>
          </ol>
        </nav>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-semibold rounded-full">
            Fiscalité
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          SCPI et TMI 30% : assurance-vie ou direct ? L'arbitrage fiscal décisif
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
            <span>14 min de lecture</span>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Introduction : TMI 30%, le point d'équilibre fiscal
        </h2>

        <div className="space-y-4 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>
            Le TMI 30 % représente une situation fiscale intermédiaire qui concerne une large partie des cadres et professions libérales français. À ce niveau d'imposition, le choix entre détenir des SCPI en direct ou via une assurance-vie devient déterminant pour votre performance nette.
          </p>

          <p>
            Contrairement au TMI 11 % où le direct l'emporte systématiquement, ou au TMI 41 % où l'assurance-vie s'impose, le TMI 30 % nécessite un arbitrage fin basé sur vos objectifs patrimoniaux, votre horizon de placement et vos besoins de liquidité.
          </p>

          <p>
            En 2025, avec un rendement brut moyen des SCPI de 4,5 % à 6 %, l'écart de rendement net entre direct et assurance-vie peut atteindre 1 à 1,5 point selon votre stratégie. Sur 20 ans, cet écart représente plusieurs dizaines de milliers d'euros de différence patrimoniale.
          </p>

          <p>
            Cette analyse détaillée vous permet de comprendre précisément les mécanismes fiscaux en jeu et d'identifier la stratégie optimale selon votre situation personnelle.
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-l-4 border-blue-500 mt-8">
          <p className="text-gray-900 dark:text-white font-bold mb-3 text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            Ce que vous allez découvrir :
          </p>
          <ul className="space-y-2 text-gray-800 dark:text-gray-200">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Le cadre fiscal complet du TMI 30 % : IR, PS, et impacts réels sur votre rendement net</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Comparatif chiffré détaillé entre SCPI en direct et SCPI en assurance-vie</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Les 4 stratégies d'allocation possibles selon vos objectifs (100% direct, 100% AV, mixte, démembrement)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Scénario complet : investissement de 80 000 € avec projections sur 10, 15 et 20 ans</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Les critères de décision pour arbitrer entre direct et assurance-vie</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Les erreurs fiscales fréquentes à éviter absolument</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Rappel pédagogique */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-600" />
          Rappel : comprendre le TMI 30 %
        </h2>

        <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>
            Le taux marginal d'imposition (TMI) de 30 % s'applique à la tranche de revenus comprise entre 28 798 € et 82 341 € pour une personne seule en 2025.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Qui est concerné par le TMI 30 % ?</h3>
            <div className="space-y-3">
              <p>
                <strong className="text-blue-900 dark:text-blue-200">Profils types :</strong>
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                  <span>Cadre confirmé avec un salaire annuel net de 40 000 à 60 000 €</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                  <span>Couple avec deux revenus moyens (2 x 30 000 € net annuel)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                  <span>Profession libérale en début d'activité</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                  <span>Entrepreneur individuel avec revenus intermédiaires</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Impact fiscal sur les revenus SCPI</h3>
            <p className="mb-3">
              Les revenus fonciers de SCPI détenues en direct subissent une double imposition :
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded">
                <span className="font-semibold">Impôt sur le revenu (IR)</span>
                <span className="text-green-600 font-bold">30 %</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded">
                <span className="font-semibold">Prélèvements sociaux (PS)</span>
                <span className="text-green-600 font-bold">17,2 %</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-100 dark:bg-green-900/30 rounded font-bold">
                <span>Total prélèvements obligatoires</span>
                <span className="text-green-700 dark:text-green-400">47,2 %</span>
              </div>
            </div>
            <p className="mt-3 text-sm font-semibold text-green-900 dark:text-green-200">
              Sur 100 € de revenus bruts, vous conservez 52,80 € nets après fiscalité en SCPI France direct.
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">La différence avec l'assurance-vie</h3>
            <p className="mb-3">
              En assurance-vie, la fiscalité des revenus SCPI est radicalement différente pendant la phase d'accumulation :
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded">
                <span className="font-semibold">Impôt sur le revenu (IR)</span>
                <span className="text-purple-600 font-bold">0 %</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded">
                <span className="font-semibold">Prélèvements sociaux (PS)</span>
                <span className="text-purple-600 font-bold">17,2 %</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-100 dark:bg-purple-900/30 rounded font-bold">
                <span>Total prélèvements obligatoires</span>
                <span className="text-purple-700 dark:text-purple-400">17,2 %</span>
              </div>
            </div>
            <p className="mt-3 text-sm font-semibold text-purple-900 dark:text-purple-200">
              Sur 100 € de revenus bruts, vous conservez 82,80 € nets après PS en assurance-vie.
            </p>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">L'exception des SCPI européennes</h3>
            <p className="mb-3">
              Les SCPI investies en Europe bénéficient d'une exonération de prélèvements sociaux grâce aux conventions fiscales internationales.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded">
                <span className="font-semibold">Impôt sur le revenu (IR)</span>
                <span className="text-orange-600 font-bold">30 %</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded">
                <span className="font-semibold">Prélèvements sociaux (PS)</span>
                <span className="text-orange-600 font-bold">0 %</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-100 dark:bg-orange-900/30 rounded font-bold">
                <span>Total prélèvements obligatoires</span>
                <span className="text-orange-700 dark:text-orange-400">30 %</span>
              </div>
            </div>
            <p className="mt-3 text-sm font-semibold text-orange-900 dark:text-orange-200">
              Sur 100 € de revenus bruts, vous conservez 70 € nets après IR en SCPI Europe direct.
            </p>
          </div>
        </div>
      </section>

      {/* Comparatif structuré */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Scale className="w-8 h-8 text-blue-600" />
          Comparatif détaillé : direct vs assurance-vie pour TMI 30 %
        </h2>

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          Analysons précisément les différences de performance entre chaque enveloppe pour un investisseur au TMI 30 %.
        </p>

        <div className="space-y-6">
          {/* Tableau comparatif SCPI France */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Building2 className="w-7 h-7 text-blue-600" />
              SCPI France : rendement brut 5 %
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-5">
                <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-3">Détention en direct</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Rendement brut</span>
                    <span className="font-semibold">5,00 %</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>- IR (30%)</span>
                    <span className="font-semibold">-1,50 %</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>- PS (17,2%)</span>
                    <span className="font-semibold">-0,86 %</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                    <span>Rendement net</span>
                    <span className="text-blue-600">2,64 %</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
                    Revenus annuels pour 10 000 € investis : <strong>264 €</strong>
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-5">
                <h4 className="font-bold text-purple-900 dark:text-purple-200 mb-3">Via assurance-vie</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Rendement brut</span>
                    <span className="font-semibold">4,50 %</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>- IR</span>
                    <span className="font-semibold">0 %</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>- PS (17,2%)</span>
                    <span className="font-semibold">-0,77 %</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                    <span>Rendement net</span>
                    <span className="text-purple-600">3,73 %</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
                    Revenus annuels pour 10 000 € investis : <strong>373 €</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                ✅ Avantage assurance-vie : <strong>+1,09 point de rendement net</strong> malgré un rendement brut inférieur
              </p>
            </div>
          </div>

          {/* Tableau comparatif SCPI Europe */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border-2 border-green-200 dark:border-green-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Euro className="w-7 h-7 text-green-600" />
              SCPI Europe : rendement brut 6 %
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-5">
                <h4 className="font-bold text-green-900 dark:text-green-200 mb-3">Détention en direct</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Rendement brut</span>
                    <span className="font-semibold">6,00 %</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>- IR (30%)</span>
                    <span className="font-semibold">-1,80 %</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>- PS (Europe)</span>
                    <span className="font-semibold">0 %</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                    <span>Rendement net</span>
                    <span className="text-green-600">4,20 %</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
                    Revenus annuels pour 10 000 € investis : <strong>420 €</strong>
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-5">
                <h4 className="font-bold text-purple-900 dark:text-purple-200 mb-3">Via assurance-vie</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Rendement brut</span>
                    <span className="font-semibold">4,50 %</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>- IR</span>
                    <span className="font-semibold">0 %</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>- PS (17,2%)</span>
                    <span className="font-semibold">-0,77 %</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                    <span>Rendement net</span>
                    <span className="text-purple-600">3,73 %</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
                    Revenus annuels pour 10 000 € investis : <strong>373 €</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <p className="text-sm font-semibold text-green-900 dark:text-green-200">
                ✅ Avantage direct Europe : <strong>+0,47 point de rendement net</strong> grâce à l'exonération de PS
              </p>
            </div>
          </div>

          {/* Synthèse */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-4">Synthèse comparative : classement des rendements nets</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                <Award className="w-6 h-6" />
                <div className="flex-1">
                  <p className="font-bold">1. SCPI Europe direct</p>
                  <p className="text-sm text-blue-100">4,20 % net (meilleur rendement)</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                <Award className="w-6 h-6" />
                <div className="flex-1">
                  <p className="font-bold">2. SCPI France assurance-vie</p>
                  <p className="text-sm text-blue-100">3,73 % net (meilleure liquidité)</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                <Award className="w-6 h-6" />
                <div className="flex-1">
                  <p className="font-bold">3. SCPI France direct</p>
                  <p className="text-sm text-blue-100">2,64 % net (à éviter pour TMI 30%)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Les 4 stratégies */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Target className="w-8 h-8 text-blue-600" />
          Les 4 stratégies d'allocation pour TMI 30 %
        </h2>

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          À partir du comparatif précédent, identifions les 4 stratégies d'allocation possibles selon vos objectifs patrimoniaux.
        </p>

        <div className="space-y-6">
          {/* Stratégie 1 */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border-l-4 border-green-600">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Stratégie 1 : 100 % SCPI Europe direct</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-bold text-green-900 dark:text-green-200 mb-2">Objectif prioritaire</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">Maximiser le rendement net absolu</p>
              </div>
              <div>
                <h4 className="font-bold text-green-900 dark:text-green-200 mb-2">Profil</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">Investisseur patient, horizon 15-20 ans, pas de besoin de liquidité immédiate</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Performance</h4>
              <ul className="text-sm space-y-1">
                <li>• Rendement net : <strong className="text-green-600">4,20 %</strong></li>
                <li>• Revenus annuels pour 80 000 € : <strong>3 360 €</strong></li>
                <li>• Capital à 20 ans (estimation) : <strong>184 000 €</strong></li>
              </ul>
            </div>
            <div className="mt-3 p-3 bg-green-100 dark:bg-green-900/30 rounded">
              <p className="text-sm font-semibold text-green-900 dark:text-green-200">
                ✅ Avantages : meilleur rendement net, exonération PS, diversification géographique
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                ⚠️ Inconvénients : liquidité 2-6 mois, IFI applicable, droits de succession classiques
              </p>
            </div>
          </div>

          {/* Stratégie 2 */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border-l-4 border-purple-600">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Stratégie 2 : 100 % assurance-vie SCPI</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-bold text-purple-900 dark:text-purple-200 mb-2">Objectif prioritaire</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">Liquidité + optimisation IFI + transmission</p>
              </div>
              <div>
                <h4 className="font-bold text-purple-900 dark:text-purple-200 mb-2">Profil</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">Patrimoine soumis à IFI, objectif transmission, besoin potentiel de liquidité</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Performance</h4>
              <ul className="text-sm space-y-1">
                <li>• Rendement net : <strong className="text-purple-600">3,73 %</strong></li>
                <li>• Revenus annuels pour 80 000 € : <strong>2 984 €</strong></li>
                <li>• Capital à 20 ans (estimation) : <strong>168 000 €</strong></li>
              </ul>
            </div>
            <div className="mt-3 p-3 bg-purple-100 dark:bg-purple-900/30 rounded">
              <p className="text-sm font-semibold text-purple-900 dark:text-purple-200">
                ✅ Avantages : liquidité 48-72h, exonération IFI totale, abattement succession 152 500 €/bénéficiaire
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                ⚠️ Inconvénients : rendement brut inférieur, choix SCPI limité, frais AV 0,5-1 %
              </p>
            </div>
          </div>

          {/* Stratégie 3 */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-l-4 border-blue-600">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Stratégie 3 : Mixte 60 % AV + 40 % direct Europe</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-2">Objectif prioritaire</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">Équilibre rendement / liquidité / transmission</p>
              </div>
              <div>
                <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-2">Profil</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">Investisseur pragmatique cherchant le meilleur compromis</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Performance</h4>
              <ul className="text-sm space-y-1">
                <li>• Part AV (60%) : 3,73% net → 1 792 € annuels sur 48 000 €</li>
                <li>• Part Direct EU (40%) : 4,20% net → 1 344 € annuels sur 32 000 €</li>
                <li>• Rendement moyen pondéré : <strong className="text-blue-600">3,92 %</strong></li>
                <li>• Revenus annuels totaux : <strong>3 136 €</strong></li>
                <li>• Capital à 20 ans (estimation) : <strong>174 000 €</strong></li>
              </ul>
            </div>
            <div className="mt-3 p-3 bg-blue-100 dark:bg-blue-900/30 rounded">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                ✅ Avantages : compromis optimal rendement/liquidité, diversification enveloppes, IFI réduit de 60 %
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                ⚠️ Inconvénients : gestion de deux enveloppes, complexité relative
              </p>
            </div>
          </div>

          {/* Stratégie 4 */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border-l-4 border-orange-600">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Stratégie 4 : Démembrement temporaire (nue-propriété)</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-bold text-orange-900 dark:text-orange-200 mb-2">Objectif prioritaire</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">Réduction IFI + transmission anticipée</p>
              </div>
              <div>
                <h4 className="font-bold text-orange-900 dark:text-orange-200 mb-2">Profil</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">Patrimoine IFI élevé, pas de besoin de revenus immédiats, projet transmission</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Performance</h4>
              <ul className="text-sm space-y-1">
                <li>• Décote achat nue-propriété 10 ans : <strong className="text-orange-600">35 %</strong></li>
                <li>• Investissement réel : 52 000 € pour valeur pleine 80 000 €</li>
                <li>• Aucun revenu pendant 10 ans (usufruit temporaire)</li>
                <li>• Rendement actuariel : <strong>4,36 %</strong> (recomposition pleine propriété)</li>
                <li>• Capital à terme : <strong>80 000 €</strong> (+ valorisation)</li>
              </ul>
            </div>
            <div className="mt-3 p-3 bg-orange-100 dark:bg-orange-900/30 rounded">
              <p className="text-sm font-semibold text-orange-900 dark:text-orange-200">
                ✅ Avantages : pas d'IFI sur nue-propriété, pas d'IR pendant démembrement, décote achat, transmission optimisée
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                ⚠️ Inconvénients : aucun revenu pendant durée démembrement, immobilisation longue, stratégie avancée
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Scénario complet */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Calculator className="w-8 h-8 text-blue-600" />
          Scénario complet : 80 000 € à investir en TMI 30 %
        </h2>

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          Projetons concrètement la performance de chaque stratégie sur 10, 15 et 20 ans avec un investissement initial de 80 000 €.
        </p>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Hypothèses de calcul</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <ul className="space-y-2">
                <li>• Capital initial : <strong>80 000 €</strong></li>
                <li>• Frais de souscription déjà déduits</li>
                <li>• Revenus réinvestis annuellement</li>
                <li>• Revalorisation parts : <strong>1,5 % par an</strong></li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <ul className="space-y-2">
                <li>• Inflation : <strong>2 % par an</strong></li>
                <li>• Fiscalité stable sur période</li>
                <li>• Pas de retrait anticipé</li>
                <li>• Rendements distribués constants</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="p-3 text-left">Stratégie</th>
                <th className="p-3 text-center">À 10 ans</th>
                <th className="p-3 text-center">À 15 ans</th>
                <th className="p-3 text-center">À 20 ans</th>
                <th className="p-3 text-center">Gain total 20 ans</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800">
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-3 font-semibold">100% Direct Europe</td>
                <td className="p-3 text-center">127 000 €</td>
                <td className="p-3 text-center">152 000 €</td>
                <td className="p-3 text-center">184 000 €</td>
                <td className="p-3 text-center font-bold text-green-600">+130%</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <td className="p-3 font-semibold">Mixte 60% AV + 40% Direct</td>
                <td className="p-3 text-center">121 000 €</td>
                <td className="p-3 text-center">145 000 €</td>
                <td className="p-3 text-center">174 000 €</td>
                <td className="p-3 text-center font-bold text-blue-600">+118%</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-3 font-semibold">100% Assurance-vie</td>
                <td className="p-3 text-center">117 000 €</td>
                <td className="p-3 text-center">140 000 €</td>
                <td className="p-3 text-center">168 000 €</td>
                <td className="p-3 text-center font-bold text-purple-600">+110%</td>
              </tr>
              <tr className="bg-red-50 dark:bg-red-900/20">
                <td className="p-3 font-semibold">100% Direct France</td>
                <td className="p-3 text-center">107 000 €</td>
                <td className="p-3 text-center">126 000 €</td>
                <td className="p-3 text-center">150 000 €</td>
                <td className="p-3 text-center font-bold text-red-600">+88%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white">
          <h4 className="font-bold mb-2">Enseignement clé</h4>
          <p className="text-sm text-blue-50">
            Sur 20 ans, la stratégie 100% Direct Europe génère <strong>16 000 € de plus</strong> que la stratégie mixte, et <strong>34 000 € de plus</strong> que le 100% Direct France. L'arbitrage dépend de votre besoin de liquidité et de votre situation IFI.
          </p>
        </div>
      </section>

      {/* Critères de décision */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Lightbulb className="w-8 h-8 text-blue-600" />
          Comment arbitrer : les 5 critères de décision
        </h2>

        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Votre horizon de placement</h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                <span><strong>Moins de 10 ans :</strong> privilégier assurance-vie (liquidité 48-72h)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                <span><strong>10 à 15 ans :</strong> stratégie mixte optimale (équilibre rendement/liquidité)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                <span><strong>Plus de 15 ans :</strong> direct Europe recommandé (meilleur rendement net)</span>
              </li>
            </ul>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. Votre besoin de liquidité</h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                <span><strong>Liquidité essentielle :</strong> 100% assurance-vie (rachat 48-72h)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                <span><strong>Liquidité secondaire :</strong> mixte 60% AV + 40% direct</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                <span><strong>Pas de besoin :</strong> 100% direct Europe (meilleur rendement)</span>
              </li>
            </ul>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. Votre exposition IFI</h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 mt-1 flex-shrink-0" />
                <span><strong>Patrimoine immobilier &gt; 1,3 M€ :</strong> privilégier assurance-vie (exonération IFI totale)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 mt-1 flex-shrink-0" />
                <span><strong>Proche du seuil IFI :</strong> démembrement ou assurance-vie</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 mt-1 flex-shrink-0" />
                <span><strong>Pas d'IFI :</strong> direct Europe maximise rendement</span>
              </li>
            </ul>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Votre objectif de transmission</h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-600 mt-1 flex-shrink-0" />
                <span><strong>Transmission prioritaire :</strong> assurance-vie (abattement 152 500 €/bénéficiaire)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-600 mt-1 flex-shrink-0" />
                <span><strong>Transmission différée :</strong> démembrement temporaire</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-600 mt-1 flex-shrink-0" />
                <span><strong>Pas d'enjeu transmission :</strong> direct Europe recommandé</span>
              </li>
            </ul>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">5. Votre appétence au risque / contraintes</h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-600 mt-1 flex-shrink-0" />
                <span><strong>Profil sécuritaire :</strong> assurance-vie (liquidité maximale, flexibilité rachat)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-600 mt-1 flex-shrink-0" />
                <span><strong>Profil équilibré :</strong> mixte 60% AV + 40% direct</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-600 mt-1 flex-shrink-0" />
                <span><strong>Profil offensif :</strong> 100% direct Europe (rendement maximisé)</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Erreurs à éviter */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <X className="w-8 h-8 text-red-600" />
          Erreurs fiscales fréquentes à éviter (TMI 30 %)
        </h2>

        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border-l-4 border-red-500">
            <h3 className="font-bold text-red-900 dark:text-red-200 mb-2 text-lg">1. Investir 100% en direct France</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              Avec un TMI 30%, la fiscalité confisque 47,2% de vos revenus (IR 30% + PS 17,2%). Votre rendement net tombe à 2,64% sur un rendement brut de 5%.
            </p>
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">
              💡 Solution : privilégier SCPI Europe direct (4,20% net) ou assurance-vie (3,73% net)
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border-l-4 border-red-500">
            <h3 className="font-bold text-red-900 dark:text-red-200 mb-2 text-lg">2. Négliger l'optimisation IFI</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              Les SCPI détenues en direct sont comptabilisées dans l'assiette IFI. Sur un patrimoine de 2M€ avec 200 000€ de SCPI, l'IFI peut atteindre 1 500€/an.
            </p>
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">
              💡 Solution : basculer les SCPI en assurance-vie (exonération IFI totale)
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border-l-4 border-red-500">
            <h3 className="font-bold text-red-900 dark:text-red-200 mb-2 text-lg">3. Sous-estimer le besoin de liquidité</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              En direct, revendre des parts de SCPI prend 2 à 6 mois sans garantie de rachat. En cas de besoin urgent, vous êtes bloqué.
            </p>
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">
              💡 Solution : conserver 50-60% en assurance-vie pour sécuriser une liquidité rapide
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border-l-4 border-red-500">
            <h3 className="font-bold text-red-900 dark:text-red-200 mb-2 text-lg">4. Oublier l'arbitrage Europe vs France</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              Les SCPI européennes en direct offrent un rendement net de 4,20% contre 2,64% pour les SCPI France. Soit +1,56 point d'écart.
            </p>
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">
              💡 Solution : allouer 30-50% minimum sur SCPI européennes en direct
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border-l-4 border-red-500">
            <h3 className="font-bold text-red-900 dark:text-red-200 mb-2 text-lg">5. Ignorer la transmission successorale</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              Les SCPI en direct subissent les droits de succession classiques (jusqu'à 45% au-delà de 1 805 677€). L'assurance-vie bénéficie d'un abattement de 152 500€ par bénéficiaire.
            </p>
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">
              💡 Solution : si transmission dans les 10-15 ans, privilégier assurance-vie
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border-l-4 border-red-500">
            <h3 className="font-bold text-red-900 dark:text-red-200 mb-2 text-lg">6. Comparer uniquement les rendements bruts</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              Une SCPI à 6% brut en direct France ne rapporte que 3,17% net. Une SCPI à 4,5% brut en AV rapporte 3,73% net.
            </p>
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">
              💡 Solution : toujours raisonner en rendement NET après fiscalité complète
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Questions fréquentes (TMI 30%)</h2>

        <div className="space-y-6">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Puis-je mixer SCPI France et Europe en direct ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Oui, c'est même recommandé pour diversifier géographiquement. L'idéal est d'allouer 60-70% sur SCPI Europe (rendement net 4,20%) et 30-40% sur SCPI France sectorielles à forte valeur ajoutée (santé, logistique).
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              L'assurance-vie coûte-t-elle plus cher en frais ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Les frais d'assurance-vie se décomposent en frais de versement (0-3%), frais de gestion AV (0,5-1% par an) et frais de gestion SCPI (10-12% HT déjà inclus dans le rendement). Au global, l'écart de coût est compensé par l'avantage fiscal (pas d'IR sur revenus).
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Peut-on transférer des SCPI direct vers une assurance-vie ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Non, il n'existe pas de mécanisme de transfert direct. Vous devez revendre vos parts en direct (délai 2-6 mois, fiscalité des plus-values) puis réinvestir en assurance-vie. Cette opération n'est pertinente que si vous avez un fort enjeu IFI ou transmission.
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Combien de SCPI faut-il détenir pour diversifier ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Pour un investissement de 80 000€, la règle minimale est de détenir 4 à 6 SCPI de typologies différentes (bureaux, santé, logistique, Europe). Cela permet de mutualiser les risques de vacance locative et de cycles sectoriels.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Dois-je déclarer mes revenus SCPI en assurance-vie ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Non, les revenus distribués en assurance-vie ne sont pas à déclarer dans votre déclaration d'impôt sur le revenu. Seuls les prélèvements sociaux (17,2%) sont prélevés à la source par l'assureur. Vous ne devez déclarer que les rachats partiels ou totaux.
            </p>
          </div>
        </div>
      </section>

      {/* Conclusion + CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 dark:from-blue-800 dark:to-purple-900 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-6">Conclusion stratégique : TMI 30%, un arbitrage décisif</h2>
        <div className="space-y-4 text-lg text-blue-50">
          <p>
            Le TMI 30 % constitue un point d'équilibre fiscal où l'arbitrage entre assurance-vie et détention directe devient crucial pour votre performance patrimoniale.
          </p>

          <div className="bg-white/10 rounded-lg p-6 space-y-3">
            <p>
              <strong className="text-white">Si votre priorité est le rendement maximal :</strong> privilégiez 100% SCPI Europe en direct (4,20% net). Acceptez la contrainte de liquidité (2-6 mois) et l'IFI applicable.
            </p>
            <p>
              <strong className="text-white">Si vous recherchez l'équilibre optimal :</strong> adoptez la stratégie mixte 60% assurance-vie + 40% direct Europe (3,92% net moyen). Vous combinez liquidité, optimisation IFI partielle et rendement attractif.
            </p>
            <p>
              <strong className="text-white">Si liquidité et transmission sont prioritaires :</strong> optez pour 100% assurance-vie (3,73% net). Vous bénéficiez d'une liquidité de 48-72h, d'une exonération IFI totale et d'avantages successoraux majeurs.
            </p>
          </div>

          <p>
            Sur 20 ans, l'écart de performance entre la meilleure stratégie (100% direct Europe) et la moins optimisée (100% direct France) représente 34 000 € de différence patrimoniale sur un investissement de 80 000 €.
          </p>

          <div className="bg-white/10 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-3 text-white">Règles universelles pour TMI 30 %</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" />
                <span>Ne jamais investir 100% en SCPI France direct (fiscalité confiscatoire 47,2%)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" />
                <span>Toujours privilégier SCPI Europe pour la partie en direct (exonération PS)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" />
                <span>Conserver 50-60% en assurance-vie si besoin de liquidité ou enjeu IFI</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" />
                <span>Raisonner en rendement NET après fiscalité, jamais en brut</span>
              </li>
            </ul>
          </div>

          <p className="font-semibold">
            L'arbitrage optimal dépend de votre situation personnelle : horizon de placement, besoin de liquidité, patrimoine IFI et objectif de transmission. Une analyse patrimoniale personnalisée est indispensable pour identifier la stratégie adaptée.
          </p>

          <div className="bg-white/10 rounded-lg p-6 mt-6">
            <h3 className="text-xl font-bold mb-3">Besoin d'un accompagnement personnalisé ?</h3>
            <p className="mb-4">
              Notre équipe analyse gratuitement votre situation pour vous recommander la stratégie optimale adaptée à vos objectifs et votre TMI.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="/comparateur-scpi"
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors"
              >
                Comparateur SCPI gratuit
              </a>
              <a
                href="/simulateur-enveloppes"
                className="inline-flex items-center px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-400 transition-colors"
              >
                Simulateur SCPI avancé
              </a>
              <a
                href="/rdv"
                className="inline-flex items-center px-6 py-3 bg-purple-500 text-white font-bold rounded-lg hover:bg-purple-400 transition-colors"
              >
                RDV 15 min offert
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ScpiTmi30PourcentArbitrageAvDirectArticle;
