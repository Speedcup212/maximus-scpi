import React from 'react';
import { Building2, Shield, TrendingUp, AlertTriangle, CheckCircle2, Euro, Users, Target, User, Calendar, Clock, BarChart3, BookOpen, Scale, Lightbulb, Eye, Calculator, PieChart, Award, FileText } from 'lucide-react';

export const RendementScpi2025TdvmTauxDistributionArticle: React.FC = () => {
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
            <li className="text-gray-900 dark:text-white font-semibold">Rendement SCPI 2025 : comprendre le TDVM et le taux de distribution</li>
          </ol>
        </nav>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-semibold rounded-full">
            Analyse
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          Rendement SCPI 2025 : comprendre le TDVM et le taux de distribution pour optimiser votre investissement
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
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Introduction : les indicateurs de performance SCPI en 2025
        </h2>

        <div className="space-y-4 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>
            En 2025, comprendre les indicateurs de rendement d'une SCPI est devenu indispensable pour tout investisseur souhaitant se positionner sur l'immobilier géré.
          </p>

          <p>
            Avec un marché SCPI qui représente désormais près de 80 milliards d'euros de capitalisation et plus de 200 véhicules disponibles, savoir décrypter le TDVM et le taux de distribution constitue un avantage concurrentiel majeur.
          </p>

          <p>
            Ces deux indicateurs mesurent la performance réelle d'une SCPI, mais ils ne se lisent pas de la même façon. Le TDVM reflète la distribution effective par rapport au prix d'acquisition, tandis que le taux de distribution mesure les revenus versés par rapport à la valeur de retrait des parts.
          </p>

          <p>
            Cette distinction technique conditionne directement votre rendement net et votre stratégie d'allocation patrimoniale.
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
              <span>Les définitions précises du TDVM, taux de distribution et rendement net</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>L'analyse complète du marché SCPI en 2025 avec les rendements par secteur</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Le comparatif détaillé entre SCPI en direct et SCPI en assurance-vie</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>3 scénarios chiffrés selon votre TMI (11%, 30%, 41%)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>L'analyse fiscale complète : IR, PS, assurance-vie, démembrement, IFI</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Les erreurs fréquentes à éviter pour maximiser votre rendement</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Rappel pédagogique */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-600" />
          Rappel pédagogique : TDVM, taux de distribution, rendement brut
        </h2>

        <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>
            Avant d'aller plus loin, clarifions les notions essentielles.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Le TDVM (Taux de Distribution sur Valeur de Marché)</h3>
            <p className="mb-3">
              Il exprime le rapport entre les dividendes versés et le prix de souscription réel payé par l'investisseur, frais inclus.
            </p>
            <p className="font-semibold text-blue-900 dark:text-blue-200">
              Exemple : si vous avez payé 1 000 € par part et percevez 45 € de dividendes annuels, votre TDVM est de 4,5 %.
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Le taux de distribution</h3>
            <p className="mb-3">
              Il rapporte les dividendes à la valeur de retrait de la part. Cette valeur correspond au prix auquel vous pourriez théoriquement revendre vos parts.
            </p>
            <p className="font-semibold text-green-900 dark:text-green-200">
              Important : il ne tient pas compte des frais de souscription initiaux.
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Le rendement brut</h3>
            <p className="mb-3">
              Il s'agit du ratio dividendes versés / prix de souscription hors frais. C'est l'indicateur communiqué par les sociétés de gestion.
            </p>
            <p className="font-semibold text-purple-900 dark:text-purple-200">
              Fourchette 2025 : entre 4,5 % et 6,5 % selon les typologies.
            </p>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Le rendement net après fiscalité</h3>
            <p className="mb-3">
              C'est le rendement réel que vous percevez après impôt sur le revenu et prélèvements sociaux. Ce taux varie fortement selon votre TMI.
            </p>
            <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border-l-4 border-orange-500">
              <p className="font-bold mb-2">Exemple concret :</p>
              <p className="text-sm">
                Une SCPI affiche un rendement brut de 5,5 %. Vous payez 1 000 € par part, dont 100 € de frais de souscription. Votre TDVM initial sera de 4,95 %. Après fiscalité TMI 30 % et PS 17,2 %, votre rendement net tombe à environ 2,9 %.
              </p>
            </div>
          </div>

          <p className="text-lg font-semibold text-gray-900 dark:text-white mt-6">
            Cette différence entre affichage commercial et réalité nette est au cœur de l'analyse patrimoniale.
          </p>
        </div>
      </section>

      {/* État du marché */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-blue-600" />
          Analyse détaillée : l'état du marché des SCPI en 2025
        </h2>

        <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>
            Le marché des SCPI en 2025 se caractérise par une maturité accrue et une diversification sectorielle marquée.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-blue-600" />
                SCPI de bureaux
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                  <span>Rendements : 4 % à 5 %</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                  <span>Impact télétravail sur performances</span>
                </li>
              </ul>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Target className="w-6 h-6 text-green-600" />
                SCPI diversifiées
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                  <span>Rendements : 4,5 % à 5,5 %</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                  <span>Équilibre sectoriel optimal</span>
                </li>
              </ul>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-purple-600" />
                SCPI de santé
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 mt-1 flex-shrink-0" />
                  <span>Rendements : 5 % à 6 %</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 mt-1 flex-shrink-0" />
                  <span>Portées par vieillissement démographique</span>
                </li>
              </ul>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-orange-600" />
                SCPI logistiques
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-600 mt-1 flex-shrink-0" />
                  <span>Rendements : 5,5 % à 6,5 %</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-600 mt-1 flex-shrink-0" />
                  <span>Dopées par l'e-commerce</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Euro className="w-6 h-6" />
              SCPI européennes : l'avantage fiscal
            </h3>
            <p className="mb-3">
              Rendements bruts : 6 % à 6,5 %
            </p>
            <p className="font-semibold text-blue-100">
              Avantage majeur : prélèvements sociaux à 0 % sur les revenus de source étrangère pour les détentions en direct grâce aux conventions fiscales internationales.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-6 border-l-4 border-blue-600">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Points clés du marché 2025</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                <span>TOF moyen : 92 % (taux d'occupation financier)</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                <span>SCPI performantes : TOF supérieur à 95 %</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                <span>Frais de souscription : 8 % à 12 % selon véhicules</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                <span>Capitalisation en progression continue</span>
              </li>
            </ul>
          </div>

          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            Ces données montrent un marché mature, où la sélection devient déterminante. La différence de rendement net entre une SCPI médiocre et une SCPI performante peut atteindre 2 à 3 points annuels, soit un écart patrimonial de plusieurs dizaines de milliers d'euros sur 20 ans.
          </p>
        </div>
      </section>

      {/* Comparatif structuré */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Scale className="w-8 h-8 text-blue-600" />
          Comparatif structuré : SCPI en direct vs SCPI en assurance-vie
        </h2>

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          Le mode de détention conditionne directement votre rendement net et votre flexibilité patrimoniale.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* SCPI en direct */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Building2 className="w-7 h-7 text-blue-600" />
              SCPI en direct
            </h3>

            <div className="space-y-4">
              <div>
                <p className="font-bold text-blue-900 dark:text-blue-200 mb-2">Rendement brut</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">4,5 % à 6,5 % selon typologie</p>
              </div>

              <div>
                <p className="font-bold text-blue-900 dark:text-blue-200 mb-2">Fiscalité</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">IR selon TMI + PS 17,2 % (France) ou PS 0 % (Europe)</p>
              </div>

              <div>
                <p className="font-bold text-blue-900 dark:text-blue-200 mb-2">Liquidité</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">2 à 6 mois via marché secondaire</p>
              </div>

              <div>
                <p className="font-bold text-blue-900 dark:text-blue-200 mb-2">Frais</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">Souscription 8-12 %, gestion 10-12 % HT</p>
              </div>

              <div>
                <p className="font-bold text-blue-900 dark:text-blue-200 mb-2">IFI</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">Parts comptabilisées dans l'assiette taxable</p>
              </div>

              <div>
                <p className="font-bold text-blue-900 dark:text-blue-200 mb-2">Transmission</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">Droits de succession classiques</p>
              </div>
            </div>
          </div>

          {/* SCPI en assurance-vie */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="w-7 h-7 text-purple-600" />
              SCPI en assurance-vie
            </h3>

            <div className="space-y-4">
              <div>
                <p className="font-bold text-purple-900 dark:text-purple-200 mb-2">Rendement brut</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">4 % à 5 % (offre réduite)</p>
              </div>

              <div>
                <p className="font-bold text-purple-900 dark:text-purple-200 mb-2">Fiscalité</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">PS 17,2 % uniquement, pas d'IR sur distribution</p>
              </div>

              <div>
                <p className="font-bold text-purple-900 dark:text-purple-200 mb-2">Liquidité</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">48 à 72 heures</p>
              </div>

              <div>
                <p className="font-bold text-purple-900 dark:text-purple-200 mb-2">Frais</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">Versement 0-3 %, gestion AV 0,5-1 %, gestion SCPI 10-12 %</p>
              </div>

              <div>
                <p className="font-bold text-purple-900 dark:text-purple-200 mb-2">IFI</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">Exonération totale</p>
              </div>

              <div>
                <p className="font-bold text-purple-900 dark:text-purple-200 mb-2">Transmission</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">Abattement 152 500 € par bénéficiaire</p>
              </div>
            </div>
          </div>
        </div>

        {/* Synthèse comparative */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-4">Synthèse comparative : quelle enveloppe selon votre TMI ?</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 mt-1 flex-shrink-0" />
              <div>
                <p className="font-bold">TMI 11 % : direct recommandé</p>
                <p className="text-sm text-blue-100">Privilégiez les SCPI européennes pour optimiser le rendement net</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 mt-1 flex-shrink-0" />
              <div>
                <p className="font-bold">TMI 30 % : arbitrage selon objectifs</p>
                <p className="text-sm text-blue-100">Liquidité vs rendement, allocation mixte souvent optimale</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 mt-1 flex-shrink-0" />
              <div>
                <p className="font-bold">TMI 41-45 % : assurance-vie fortement recommandée</p>
                <p className="text-sm text-blue-100">Économie fiscale majeure, double le rendement net vs direct</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-6">
          La stratégie optimale consiste souvent à mixer les deux enveloppes pour bénéficier de la performance du direct et de la souplesse fiscale de l'assurance-vie.
        </p>
      </section>

      {/* Cas pratiques */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Users className="w-8 h-8 text-orange-600" />
          Scénarios et cas pratiques selon votre profil fiscal
        </h2>

        <div className="space-y-8">
          {/* Profil TMI 11% */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-l-4 border-blue-600">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Profil 1 : TMI 11%, 35 ans, 30 000 € à investir
            </h3>

            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong>Situation :</strong> jeune actif, faible imposition, horizon long.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-5">
                <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Stratégie recommandée
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Privilégier les SCPI européennes en direct. Double avantage : rendement brut supérieur et PS à 0 % grâce aux conventions fiscales.
                </p>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  <li>• Rendement brut cible : 6-6,5%</li>
                  <li>• IR : 11 % sur revenus</li>
                  <li>• PS : 0 % (Europe)</li>
                  <li>• Rendement net : 5,34-5,79%</li>
                  <li>• Revenus annuels : 1 602-1 737 €</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-5">
                <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-3 flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Projection sur 20 ans
                </h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  <li>• Capital final : 89 000 €</li>
                  <li>• Plus-value : +59 000 €</li>
                  <li>• Revenus cumulés nets : 33 120 €</li>
                  <li>• <strong className="text-blue-600">Gain total : 92 120 € (+207%)</strong></li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-4">
              <p className="text-sm text-gray-800 dark:text-gray-200">
                <strong>Justification :</strong> À ce niveau d'imposition, l'assurance-vie n'apporte aucun avantage fiscal sur les revenus. Mieux vaut maximiser le rendement brut et bénéficier de l'exonération PS sur l'Europe.
              </p>
            </div>
          </div>

          {/* Profil TMI 30% */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border-l-4 border-purple-600">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Profil 2 : TMI 30%, 45 ans, 80 000 € à investir
            </h3>

            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong>Situation :</strong> cadre confirmé, imposition intermédiaire, objectif complément retraite.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-5">
                <h4 className="font-bold text-purple-900 dark:text-purple-200 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Stratégie recommandée
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Allocation mixte 60 % assurance-vie SCPI françaises + 40 % direct SCPI européennes.
                </p>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  <li>• Part AV (60%) : 4,5% brut - 17,2% PS = 3,73% net</li>
                  <li>• Part Direct EU (40%) : 6,2% brut - 30% IR = 4,34% net</li>
                  <li>• Rendement moyen pondéré : 3,97%</li>
                  <li>• Revenus annuels nets : 3 176 €</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-5">
                <h4 className="font-bold text-purple-900 dark:text-purple-200 mb-3 flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Projection sur 20 ans
                </h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  <li>• Capital final : 176 000 €</li>
                  <li>• Plus-value : +96 000 €</li>
                  <li>• Revenus cumulés nets : 63 520 €</li>
                  <li>• <strong className="text-purple-600">Gain total : 159 520 € (+99%)</strong></li>
                </ul>
              </div>
            </div>

            <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-4">
              <p className="text-sm text-gray-800 dark:text-gray-200">
                <strong>Justification :</strong> Cette allocation optimise le couple rendement/flexibilité. L'assurance-vie offre liquidité et optimisation successorale, le direct européen booste le rendement global.
              </p>
            </div>
          </div>

          {/* Profil TMI 41% */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border-l-4 border-orange-600">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Profil 3 : TMI 41%, 55 ans, 150 000 € à investir
            </h3>

            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong>Situation :</strong> haut revenu, forte imposition, horizon 15-20 ans avant retraite.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-5">
                <h4 className="font-bold text-orange-900 dark:text-orange-200 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Stratégie recommandée
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  100 % assurance-vie recommandé. L'économie fiscale compense largement le rendement brut inférieur.
                </p>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  <li>• Rendement brut AV : 4,5%</li>
                  <li>• PS : 17,2% (seul prélèvement)</li>
                  <li>• IR : 0%</li>
                  <li>• Rendement net : 3,73%</li>
                  <li>• Revenus annuels nets : 5 595 €</li>
                  <li className="text-red-600 dark:text-red-400 font-semibold">• En direct : seulement 1,88% net !</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-5">
                <h4 className="font-bold text-orange-900 dark:text-orange-200 mb-3 flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Projection sur 20 ans
                </h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  <li>• Capital final : 306 000 €</li>
                  <li>• Plus-value : +156 000 €</li>
                  <li>• Revenus cumulés nets : 111 900 €</li>
                  <li>• <strong className="text-orange-600">Gain total : 267 900 € (+79%)</strong></li>
                  <li className="text-green-600 dark:text-green-400">• + Exonération IFI</li>
                  <li className="text-green-600 dark:text-green-400">• + Avantages successoraux</li>
                </ul>
              </div>
            </div>

            <div className="bg-orange-100 dark:bg-orange-900/30 rounded-lg p-4">
              <p className="text-sm text-gray-800 dark:text-gray-200">
                <strong>Justification :</strong> À ce niveau d'imposition, la détention en direct est confiscatoire (IR 41% + PS 17,2% = 58,2% de prélèvements). L'assurance-vie double le rendement net, tout en offrant exonération IFI et avantages successoraux.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Description graphique */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <PieChart className="w-8 h-8 text-blue-600" />
          Visualisation : évolution du rendement net selon TMI
        </h2>

        <div className="space-y-6">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Imaginons un graphique en barres comparant le rendement net d'une SCPI à 5 % brut selon trois TMI.
          </p>

          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Structure du graphique</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              <strong>Axe horizontal :</strong> TMI 11 %, TMI 30 %, TMI 41 %<br />
              <strong>Axe vertical :</strong> Rendement net après fiscalité (en %)
            </p>

            <div className="space-y-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-4">
                <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-3">Barres bleues : SCPI direct France</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm font-semibold">TMI 11%</p>
                    <p className="text-2xl font-bold text-blue-600">3,68%</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">TMI 30%</p>
                    <p className="text-2xl font-bold text-blue-600">2,64%</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">TMI 41%</p>
                    <p className="text-2xl font-bold text-blue-600">2,09%</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-4">
                <h4 className="font-bold text-green-900 dark:text-green-200 mb-3">Barres vertes : SCPI direct Europe</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm font-semibold">TMI 11%</p>
                    <p className="text-2xl font-bold text-green-600">4,45%</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">TMI 30%</p>
                    <p className="text-2xl font-bold text-green-600">3,50%</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">TMI 41%</p>
                    <p className="text-2xl font-bold text-green-600">2,95%</p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-100 dark:bg-orange-900/30 rounded-lg p-4">
                <h4 className="font-bold text-orange-900 dark:text-orange-200 mb-3">Barres oranges : SCPI assurance-vie</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm font-semibold">TMI 11%</p>
                    <p className="text-2xl font-bold text-orange-600">4,14%</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">TMI 30%</p>
                    <p className="text-2xl font-bold text-orange-600">4,14%</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">TMI 41%</p>
                    <p className="text-2xl font-bold text-orange-600">4,14%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
              <Lightbulb className="w-6 h-6" />
              Enseignement clé du graphique
            </h3>
            <p className="text-blue-50">
              Ce graphique met en évidence un phénomène clé : l'assurance-vie devient progressivement la solution optimale à mesure que le TMI augmente. Pour les TMI 41 % et plus, elle offre un rendement net supérieur de près de 100 % au direct français.
            </p>
          </div>
        </div>
      </section>

      {/* Analyse fiscale */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-600" />
          Analyse fiscale approfondie : IR, PS, AV, démembrement, IFI
        </h2>

        <div className="space-y-8">
          {/* IR */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Fiscalité de l'impôt sur le revenu (IR)</h3>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>
                Les revenus de SCPI en direct sont imposés dans la catégorie des revenus fonciers. Ils s'ajoutent à vos autres revenus et sont taxés selon votre TMI : 11 %, 30 %, 41 % ou 45 %.
              </p>
              <p>
                Contrairement aux revenus locatifs classiques, aucun abattement forfaitaire n'est applicable. Le revenu distribué est intégralement taxable.
              </p>
              <p>
                Les SCPI peuvent distribuer également des revenus financiers (produits de trésorerie) taxés au PFU de 30 % ou, sur option, au barème progressif.
              </p>
            </div>
          </div>

          {/* PS */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Prélèvements sociaux (PS)</h3>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>
                Les PS de 17,2 % s'appliquent systématiquement sur les revenus fonciers de source française.
              </p>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-green-600">
                <p className="font-bold text-green-900 dark:text-green-200 mb-2">Exception majeure : SCPI européennes</p>
                <p className="text-sm">
                  Les conventions fiscales internationales permettent souvent une exonération de PS sur les revenus de source étrangère. Cet avantage représente une économie de 1,72 % sur un rendement de 10 %, soit un gain non négligeable sur la durée.
                </p>
              </div>
            </div>
          </div>

          {/* Assurance-vie */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Fiscalité en assurance-vie</h3>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>
                En assurance-vie, la fiscalité des revenus SCPI diffère radicalement.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <p className="font-bold text-purple-900 dark:text-purple-200 mb-2">Pendant l'accumulation</p>
                  <p className="text-sm">Seuls les PS 17,2 % sont prélevés annuellement sur les revenus distribués. L'IR n'est pas appliqué.</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <p className="font-bold text-purple-900 dark:text-purple-200 mb-2">En cas de rachat</p>
                  <p className="text-sm">Fiscalité classique de l'AV : PFU 30 % ou option barème + abattement après 8 ans (4 600 € célibataire, 9 200 € couple).</p>
                </div>
              </div>
              <p className="font-semibold text-purple-900 dark:text-purple-200">
                Cette architecture fiscale transforme l'assurance-vie en outil d'optimisation pour les TMI élevés.
              </p>
            </div>
          </div>

          {/* Démembrement */}
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Démembrement de parts SCPI</h3>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>
                Le démembrement consiste à séparer la nue-propriété de l'usufruit. L'usufruitier perçoit les revenus, le nu-propriétaire récupère la pleine propriété au terme.
              </p>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-orange-600">
                <p className="font-bold text-orange-900 dark:text-orange-200 mb-2">Avantage fiscal principal</p>
                <p className="text-sm mb-2">
                  Le nu-propriétaire n'est pas imposé pendant la durée du démembrement, puisqu'il ne perçoit aucun revenu. Les parts démembrées ne sont pas comptabilisées dans l'assiette IFI.
                </p>
                <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                  Décote : 30 à 50 % selon la durée du démembrement
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <p className="font-bold text-orange-900 dark:text-orange-200 mb-2">Cas d'usage typique</p>
                <p className="text-sm">
                  Investisseur en TMI 41 % souhaitant constituer un patrimoine pour ses enfants sans subir la fiscalité immédiate. Il achète la nue-propriété avec une décote importante.
                </p>
                <p className="text-sm mt-2">
                  <strong>Rendement net actuariel :</strong> La plus-value latente (recomposition de la pleine propriété) génère un rendement actuariel attractif, souvent supérieur à 4 % net après fiscalité.
                </p>
              </div>
            </div>
          </div>

          {/* IFI */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Impôt sur la Fortune Immobilière (IFI)</h3>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>
                Les parts de SCPI détenues en direct sont comptabilisées dans l'assiette IFI pour leur valeur de retrait.
              </p>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-red-600">
                <p className="font-bold text-red-900 dark:text-red-200 mb-2">Exception notable : assurance-vie</p>
                <p className="text-sm mb-3">
                  Les parts détenues via une assurance-vie sont exonérées d'IFI. Cet avantage représente un gain annuel de 0,5 % à 1,5 % pour les patrimoines soumis à cet impôt.
                </p>
                <div className="bg-red-100 dark:bg-red-900/30 rounded p-3">
                  <p className="text-sm font-semibold">Exemple concret :</p>
                  <p className="text-sm">
                    Patrimoine de 3 millions d'euros dont 500 000 € de SCPI. Le transfert en assurance-vie génère une économie d'IFI de 3 000 à 5 000 € par an, soit l'équivalent d'un rendement net supplémentaire de 0,6 à 1 %.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
          Avantages des SCPI selon votre profil
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
            <h3 className="font-bold text-green-900 dark:text-green-200 mb-3 text-lg">Accessibilité patrimoniale</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Investir dans l'immobilier professionnel dès quelques centaines d'euros via assurance-vie, ou quelques milliers en direct. Aucune gestion locative, aucune contrainte opérationnelle.
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
            <h3 className="font-bold text-green-900 dark:text-green-200 mb-3 text-lg">Diversification</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Une seule SCPI peut détenir 50 à 200 actifs répartis en France et en Europe, sur plusieurs typologies (bureaux, commerces, santé, logistique). Cette mutualisation réduit le risque spécifique.
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
            <h3 className="font-bold text-green-900 dark:text-green-200 mb-3 text-lg">Liquidité supérieure</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Revendre des parts de SCPI prend 2 à 6 mois en direct, 48 à 72 heures en assurance-vie. Un bien physique nécessite 6 à 12 mois.
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
            <h3 className="font-bold text-green-900 dark:text-green-200 mb-3 text-lg">Rendements réguliers</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Les distributions sont trimestrielles, souvent stables d'une année sur l'autre pour les SCPI bien gérées. Cette visibilité facilite la planification patrimoniale.
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
            <h3 className="font-bold text-green-900 dark:text-green-200 mb-3 text-lg">Optimisation fiscale</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Selon votre TMI, vous pouvez arbitrer entre direct, assurance-vie, démembrement pour maximiser le rendement net.
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
            <h3 className="font-bold text-green-900 dark:text-green-200 mb-3 text-lg">Gestion déléguée</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              La société de gestion assume la commercialisation, les travaux, les contentieux. Vous percevez un revenu net de ces contraintes.
            </p>
          </div>
        </div>
      </section>

      {/* Inconvénients et limites */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-orange-600" />
          Inconvénients et limites des SCPI
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6">
            <h3 className="font-bold text-orange-900 dark:text-orange-200 mb-3 text-lg">Frais d'entrée significatifs</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Les frais de souscription de 8 à 12 % pénalisent la rentabilité les premières années. Il faut généralement 5 à 7 ans pour les amortir via les distributions.
            </p>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6">
            <h3 className="font-bold text-orange-900 dark:text-orange-200 mb-3 text-lg">Liquidité limitée en direct</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Si le marché secondaire est saturé, vos ordres de vente peuvent rester en attente plusieurs mois. Aucune garantie de rachat n'existe.
            </p>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6">
            <h3 className="font-bold text-orange-900 dark:text-orange-200 mb-3 text-lg">Rendement non garanti</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Les revenus dépendent du taux d'occupation, de la conjoncture locative, des défauts de paiement. Une SCPI peut baisser sa distribution d'une année sur l'autre.
            </p>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6">
            <h3 className="font-bold text-orange-900 dark:text-orange-200 mb-3 text-lg">Risque de perte en capital</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              La valeur de retrait des parts fluctue selon les cycles immobiliers. Une crise peut entraîner une baisse de 10 à 20 %, même si historiquement les SCPI se sont toujours redressées sur le long terme.
            </p>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6">
            <h3 className="font-bold text-orange-900 dark:text-orange-200 mb-3 text-lg">Fiscalité lourde (TMI élevés)</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              En direct, un TMI 41 % associé aux PS 17,2 % confisque près de 60 % des revenus. Seules les enveloppes optimisées (AV, démembrement, Europe) permettent de contourner cet écueil.
            </p>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6">
            <h3 className="font-bold text-orange-900 dark:text-orange-200 mb-3 text-lg">Pas de contrôle sur la gestion</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Vous déléguez toutes les décisions à la société de gestion. En cas de mauvaise stratégie d'acquisition, vous subissez les conséquences sans pouvoir intervenir.
            </p>
          </div>
        </div>
      </section>

      {/* Risques spécifiques */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-red-600" />
          Risques spécifiques à anticiper
        </h2>

        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6">
            <h3 className="font-bold text-red-900 dark:text-red-200 mb-2 text-lg">Vacance locative structurelle</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Certaines SCPI de bureaux ou commerces peuvent subir des taux de vacance durables si leurs actifs sont mal situés ou obsolètes. Un TOF inférieur à 85 % est un signal d'alerte.
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6">
            <h3 className="font-bold text-red-900 dark:text-red-200 mb-2 text-lg">Cycle immobilier baissier</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Une récession économique peut déprimer les valeurs immobilières pendant plusieurs années. Les SCPI ne sont pas immunisées contre les krachs sectoriels.
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6">
            <h3 className="font-bold text-red-900 dark:text-red-200 mb-2 text-lg">Risque de liquidité extrême</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              En période de stress de marché, le marché secondaire peut se bloquer. Les sociétés de gestion peuvent suspendre les rachats, vous obligeant à conserver vos parts malgré vous.
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6">
            <h3 className="font-bold text-red-900 dark:text-red-200 mb-2 text-lg">Risque de change (SCPI européennes)</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Si vous investissez en SCPI détenant des actifs en zone euro non-euro (Pologne, République tchèque), les fluctuations monétaires peuvent impacter les distributions.
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6">
            <h3 className="font-bold text-red-900 dark:text-red-200 mb-2 text-lg">Risque réglementaire et fiscal</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Une réforme fiscale pourrait remettre en cause les avantages actuels (PS 0 % Europe, fiscalité AV). Ce risque politique existe toujours.
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6">
            <h3 className="font-bold text-red-900 dark:text-red-200 mb-2 text-lg">Sur-concentration sectorielle</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Certaines SCPI mono-sectorielles (bureaux, commerces) sont exposées à un risque systémique si leur secteur décroche durablement.
            </p>
          </div>
        </div>
      </section>

      {/* Erreurs à éviter */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-yellow-600" />
          Erreurs fréquentes à éviter
        </h2>

        <div className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 border-l-4 border-yellow-500">
            <h3 className="font-bold text-yellow-900 dark:text-yellow-200 mb-2 text-lg">1. Investir sans diversification</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Acheter une seule SCPI concentre tous les risques. La règle minimale est de répartir sur 4 à 6 SCPI de typologies et gestionnaires différents.
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 border-l-4 border-yellow-500">
            <h3 className="font-bold text-yellow-900 dark:text-yellow-200 mb-2 text-lg">2. Négliger les frais</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Comparer uniquement les rendements bruts sans intégrer les frais de souscription et de gestion fausse l'analyse. Le rendement TDVM réel est inférieur de 1 à 2 points au rendement affiché.
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 border-l-4 border-yellow-500">
            <h3 className="font-bold text-yellow-900 dark:text-yellow-200 mb-2 text-lg">3. Ignorer sa fiscalité personnelle</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Investir en direct avec un TMI 41 % sans considérer l'assurance-vie détruit la moitié de la performance.
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 border-l-4 border-yellow-500">
            <h3 className="font-bold text-yellow-900 dark:text-yellow-200 mb-2 text-lg">4. Choisir uniquement sur le rendement affiché</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Une SCPI affichant 7 % brut avec un TOF de 80 % et un patrimoine obsolète est plus risquée qu'une SCPI à 5 % avec un TOF de 95 % et des actifs prime.
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 border-l-4 border-yellow-500">
            <h3 className="font-bold text-yellow-900 dark:text-yellow-200 mb-2 text-lg">5. Sous-estimer l'horizon de placement</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Les SCPI nécessitent 10 à 15 ans minimum. Investir avec un horizon de 5 ans expose au risque de revente en perte.
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 border-l-4 border-yellow-500">
            <h3 className="font-bold text-yellow-900 dark:text-yellow-200 mb-2 text-lg">6. Oublier de vérifier le taux d'occupation</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Un TOF inférieur à 90 % doit alerter. Cela signifie que 10 % des loyers potentiels ne sont pas encaissés, impactant directement les distributions.
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 border-l-4 border-yellow-500">
            <h3 className="font-bold text-yellow-900 dark:text-yellow-200 mb-2 text-lg">7. Ne pas lire les bulletins trimestriels</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              La société de gestion publie régulièrement l'état du patrimoine, les acquisitions, les cessions. Ignorer ces documents vous prive d'informations cruciales sur la santé de votre investissement.
            </p>
          </div>
        </div>
      </section>

      {/* Conclusion */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 dark:from-blue-800 dark:to-purple-900 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-6">Conclusion stratégique : optimiser son allocation SCPI selon son TMI</h2>
        <div className="space-y-4 text-lg text-blue-50">
          <p>
            Le rendement d'une SCPI ne se résume pas au taux brut affiché. La performance réelle dépend de trois paramètres : votre TMI, votre enveloppe de détention, et la typologie d'actifs.
          </p>

          <div className="bg-white/10 rounded-lg p-6 space-y-3">
            <p>
              <strong className="text-white">Pour les TMI 11 % :</strong> privilégier les SCPI européennes en direct maximise le rendement net grâce à l'exonération de PS. Horizon long, accumulation patrimoniale, profil offensif.
            </p>
            <p>
              <strong className="text-white">Pour les TMI 30 % :</strong> l'arbitrage entre direct et assurance-vie dépend de vos objectifs de liquidité et de transmission. Une allocation mixte 50/50 ou 60/40 en faveur de l'AV offre un équilibre optimal.
            </p>
            <p>
              <strong className="text-white">Pour les TMI 41 % et plus :</strong> l'assurance-vie devient incontournable. La différence de rendement net atteint 2 à 3 points annuels par rapport au direct, soit plusieurs dizaines de milliers d'euros sur 20 ans.
            </p>
          </div>

          <p>
            Le démembrement constitue une option complémentaire pour les profils patrimoniaux souhaitant optimiser IFI et transmission, à condition d'accepter une absence de revenus pendant la durée de démembrement.
          </p>

          <div className="bg-white/10 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-3 text-white">Règles universelles</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" />
                <span>Diversifier sur 4 à 6 SCPI minimum</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" />
                <span>Vérifier le TOF supérieur à 90 %</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" />
                <span>Investir avec un horizon de 10 ans minimum</span>
              </li>
            </ul>
          </div>

          <p className="font-semibold">
            La sélection rigoureuse des véhicules, basée sur l'historique de performance, la qualité du patrimoine, et la réputation du gestionnaire, conditionne 80 % de votre réussite.
          </p>

          <div className="bg-white/10 rounded-lg p-6 mt-6">
            <h3 className="text-xl font-bold mb-3">Besoin d'un accompagnement personnalisé ?</h3>
            <p className="mb-4">
              Notre équipe analyse gratuitement votre situation pour vous recommander la stratégie optimale adaptée à vos objectifs.
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

export default RendementScpi2025TdvmTauxDistributionArticle;
