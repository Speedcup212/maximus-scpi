import React from 'react';
import { Building2, Shield, TrendingUp, AlertTriangle, CheckCircle2, Euro, Users, Target, User, Calendar, Clock, BarChart3, BookOpen, Scale, Lightbulb, Eye, Calculator } from 'lucide-react';
import ArticleCtaBlock from '../ArticleCtaBlock';

export const ScpiSanteSeniorsEhpadCliniquesInvestissementArticle: React.FC = () => {
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
            <li className="text-gray-900 dark:text-white font-semibold">SCPI santé et seniors : investir dans l'immobilier médical et les EHPAD</li>
          </ol>
        </nav>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-semibold rounded-full">
            Guide
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          SCPI santé et seniors : investir dans l'immobilier médical et les EHPAD
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
          <strong>Les SCPI spécialisées santé et seniors représentent-elles un placement sûr en 2025 ?</strong> Avec le vieillissement démographique et l'augmentation des besoins médicaux, ce secteur immobilier affiche une résilience remarquable : <strong>rendement de 4-5,2%</strong>, baux longs (9-12 ans), et locataires solides (cliniques, EHPAD, centres médicaux). Cependant, le marché français ne compte que <strong>3 SCPI réellement spécialisées</strong> (NCap Education Santé, LF Avenir Santé, Perial Hospitalité Europe), et la réglementation stricte impose une sélection rigoureuse. Ce guide complet analyse ces SCPI santé, leurs spécificités, et vous aide à déterminer si ce secteur correspond à votre profil investisseur.
        </p>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-l-4 border-blue-500">
          <p className="text-gray-900 dark:text-white font-bold mb-3 text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            Ce que vous allez découvrir :
          </p>
          <ul className="space-y-2 text-gray-800 dark:text-gray-200">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Pourquoi l'immobilier santé est structurellement porteur (démographie, réglementation)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Comparatif détaillé des 3 SCPI santé spécialisées avec performances 2024</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Avantages (baux longs, locataires solides) vs risques (réglementation, liquidité)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>3 stratégies d'allocation selon votre capital (30k€, 80k€, 150k€)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>FAQ d'expert : fiscalité, durée, diversification optimale</span>
            </li>
          </ul>
        </div>
      </section>

      <ArticleCtaBlock variant="top" topic="general" />

      {/* Section principale */}

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-600" />
          Pourquoi l'immobilier santé est structurellement porteur
        </h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Une démographie favorable</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Le vieillissement de la population française crée une demande structurelle croissante pour l'immobilier de santé :
            </p>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <p className="text-3xl font-bold text-blue-600 mb-2">4,5M</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">de personnes de plus de 80 ans en 2030 (vs 3M en 2020)</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <p className="text-3xl font-bold text-green-600 mb-2">+35%</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">d'augmentation des besoins en lits médicalisés d'ici 2035</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <p className="text-3xl font-bold text-purple-600 mb-2">800k</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">places en EHPAD nécessaires (vs 600k actuellement)</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Des actifs diversifiés et complémentaires</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-6">
                <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-3 text-lg">EHPAD (Établissements pour personnes âgées)</h4>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>• Baux commerciaux 9-12 ans</li>
                  <li>• Loyers indexés sur l'inflation</li>
                  <li>• Opérateurs : Korian, Orpea, DomusVi</li>
                  <li>• Rendement cible : 5-5,5%</li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6">
                <h4 className="font-bold text-green-900 dark:text-green-200 mb-3 text-lg">Cliniques privées et centres médicaux</h4>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>• Baux fermes 12-15 ans</li>
                  <li>• Locataires : groupes hospitaliers, SSR</li>
                  <li>• Forte stabilité des revenus</li>
                  <li>• Rendement cible : 4,5-5%</li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6">
                <h4 className="font-bold text-purple-900 dark:text-purple-200 mb-3 text-lg">Résidences services seniors</h4>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>• Non médicalisées (autonomie)</li>
                  <li>• Baux 9-12 ans</li>
                  <li>• Moins réglementé que les EHPAD</li>
                  <li>• Rendement cible : 5-6%</li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-6">
                <h4 className="font-bold text-orange-900 dark:text-orange-200 mb-3 text-lg">Laboratoires et pharmacies</h4>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>• Baux commerciaux 3/6/9</li>
                  <li>• Emplacement stratégique</li>
                  <li>• Activité essentielle</li>
                  <li>• Rendement cible : 4-4,5%</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Les 3 SCPI santé spécialisées du marché français</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Contrairement aux secteurs bureaux ou commerces, l'offre de SCPI 100% santé est restreinte. Seulement 3 SCPI proposent une exposition significative (supérieure à 50%) au secteur santé et éducation :
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-bold">SCPI</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-bold">TDVM 2024</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-bold">Capitalisation</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-bold">TO</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-bold">Exposition Santé</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 font-bold text-blue-600">NCap Education Santé (Norma Capital)</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">4,85%</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">110 M€</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">96,5%</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">66% Santé/social, 16% Bien-être, 16% Éducation</td>
                  </tr>
                  <tr className="hover:bg-green-50 dark:hover:bg-green-900/20">
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 font-bold text-green-600">Perial Hospitalité Europe (Perial)</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">4,02%</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">333 M€</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">98,1%</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">61% Santé/éducation, 38% Hôtellerie</td>
                  </tr>
                  <tr className="hover:bg-purple-50 dark:hover:bg-purple-900/20">
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 font-bold text-purple-600">LF Avenir Santé (La Française REM)</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">5,20%</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">232 M€</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">100%</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Focus santé (EHPAD, cliniques, centres médicaux)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 border-l-4 border-yellow-500">
            <h3 className="font-bold text-yellow-900 dark:text-yellow-200 mb-2 flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Points clés à retenir
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>• <strong>NCap Education Santé</strong> : la plus spécialisée santé (66%), capitalisation modeste (110M€), endettement 0%</li>
              <li>• <strong>Perial Hospitalité Europe</strong> : capitalisation solide (333M€), diversification santé/hôtellerie, focus Europe</li>
              <li>• <strong>LF Avenir Santé</strong> : meilleur rendement (5,2%), TO parfait (100%), gestion La Française reconnue</li>
              <li>• <strong>Attention</strong> : marché santé spécialisé très restreint en France. Pour plus de diversification, privilégiez les SCPI multi-sectorielles avec exposition santé (15-30%)</li>
            </ul>
          </div>
        </div>
      </section>
      

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Scale className="w-8 h-8 text-blue-600" />
          Avantages et limites des SCPI santé
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-green-600 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6" />
              Avantages
            </h3>
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-5">
                <h4 className="font-bold text-green-900 dark:text-green-200 mb-2">1. Sécurité locative exceptionnelle</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Les baux commerciaux de <strong>9 à 15 ans</strong> offrent une visibilité unique dans l'immobilier. Les opérateurs (Korian, Orpea, DomusVi) sont des groupes cotés avec des bilans solides.
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  <strong>Exemple :</strong> LF Avenir Santé affiche un TO de 100% et NCap Education Santé de 96,5%.
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-5">
                <h4 className="font-bold text-green-900 dark:text-green-200 mb-2">2. Rendement attractif et stable</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Rendement brut moyen de <strong>5-6%</strong>, supérieur aux SCPI diversifiées (4,5%). Les loyers sont indexés sur l'inflation, protégeant le pouvoir d'achat.
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  <strong>Historique :</strong> LF Avenir Santé (créée 2021) et NCap Education Santé (créée 2018) maintiennent des rendements stables.
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-5">
                <h4 className="font-bold text-green-900 dark:text-green-200 mb-2">3. Résilience économique</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  L'activité santé est <strong>peu cyclique</strong>. Les besoins médicaux ne dépendent pas de la conjoncture économique. Durant la crise 2020-2021, les SCPI santé ont maintenu leurs revenus.
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-5">
                <h4 className="font-bold text-green-900 dark:text-green-200 mb-2">4. Tendance démographique favorable</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Le vieillissement (4,5M de +80 ans en 2030) garantit une demande structurelle croissante pour les EHPAD et cliniques.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-orange-600 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              Limites et risques
            </h3>
            <div className="space-y-4">
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-5">
                <h4 className="font-bold text-orange-900 dark:text-orange-200 mb-2">1. Risque réglementaire élevé</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Les EHPAD dépendent fortement des <strong>tarifs fixés par l'État</strong>. Les réformes (financement, normes) peuvent impacter la rentabilité des opérateurs et donc les loyers.
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-300">
                  <strong>Exemple :</strong> La réforme du financement EHPAD 2024 a créé de l'incertitude sur les tarifs.
                </p>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-5">
                <h4 className="font-bold text-orange-900 dark:text-orange-200 mb-2">2. Concentration du risque locataire</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Les opérateurs EHPAD (Korian, Orpea) représentent souvent <strong>30-50% du patrimoine</strong> d'une SCPI santé. Une défaillance d'un groupe impacterait fortement les revenus.
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-300">
                  <strong>Cas Orpea :</strong> La crise 2022 a impacté temporairement certaines SCPI exposées.
                </p>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-5">
                <h4 className="font-bold text-orange-900 dark:text-orange-200 mb-2">3. Liquidité limitée</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Les SCPI santé spécialisées ont des <strong>délais de revente de 4-8 mois</strong> en moyenne, supérieurs aux SCPI diversifiées (2-4 mois).
                </p>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-5">
                <h4 className="font-bold text-orange-900 dark:text-orange-200 mb-2">4. Reconversion difficile des actifs</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Un EHPAD ou une clinique sont des <strong>actifs très spécialisés</strong>. En cas de vacance, la reconversion est coûteuse et longue (12-18 mois).
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border-l-4 border-blue-500">
          <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-3 flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Verdict : pour qui les SCPI santé ?
          </h3>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <p>
              <strong>✅ Adaptées si :</strong> Vous recherchez un rendement stable (5-6%), acceptez un horizon long (10+ ans), et comprenez le risque réglementaire.
            </p>
            <p>
              <strong>✅ Stratégie recommandée :</strong> Ne pas dépasser 20-30% de votre portefeuille SCPI en santé. Privilégier LF Avenir Santé ou NCap Education Santé pour leur spécialisation.
            </p>
            <p>
              <strong>❌ À éviter si :</strong> Vous avez besoin de liquidité à court terme (moins de 5 ans), ou refusez tout risque réglementaire.
            </p>
          </div>
        </div>
      </section>
      

      <ArticleCtaBlock variant="middle" topic="general" />

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Lightbulb className="w-8 h-8 text-blue-600" />
          Comment bien investir dans les SCPI santé ?
        </h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Diversifier entre plusieurs SCPI santé</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Ne mettez jamais tout votre capital sur une seule SCPI santé. La diversification réduit le risque de concentration locataire et géographique.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-5">
                <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-3">Capital 30-50k€</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  <strong>2 SCPI santé</strong> : LF Avenir Santé (60%) + NCap Education Santé (40%)
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Diversification opérateurs + géographies
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-5">
                <h4 className="font-bold text-green-900 dark:text-green-200 mb-3">Capital 80-150k€</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  <strong>3 SCPI</strong> : LF Avenir Santé (35%) + NCap Education Santé (30%) + Perial Hospitalité Europe (35%)
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Exposition EHPAD + cliniques + seniors
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-5">
                <h4 className="font-bold text-purple-900 dark:text-purple-200 mb-3">Capital 200k€+</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  <strong>4 SCPI</strong> : diversifiées (50%) + santé (50%)
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Équilibre secteurs : bureaux, commerces, santé
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Vérifier 5 critères avant d'investir</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <Calculator className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">Historique de distribution</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Privilégiez les SCPI avec <strong>10+ ans d'historique</strong> et un TDVM stable. Évitez les SCPI récentes (moins de 5 ans) sans track record.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <Shield className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">Diversification des opérateurs</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Vérifiez que <strong>aucun opérateur ne dépasse 30%</strong> du patrimoine. Les SCPI santé spécialisées ont nécessairement une concentration plus élevée sur quelques grands groupes (Korian, Orpea, etc.).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <TrendingUp className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">Taux d'occupation physique et financier</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Cible : <strong>TO supérieur à 95%</strong>. Un TO inférieur à 90% signale des difficultés de gestion ou un patrimoine inadapté.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <Building2 className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">Capitalisation et liquidité</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Privilégiez les SCPI avec <strong>capitalisation supérieure à 500M€</strong>. Plus la SCPI est grosse, meilleure est la liquidité (délai de revente 2-4 mois vs 6-8 mois).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <Euro className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">Frais de souscription</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Les frais varient de <strong>8% à 12%</strong>. Négociez si possible (certaines plateformes proposent 6-7%). Amortissement sur 10-12 ans minimum.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Optimiser l'enveloppe fiscale</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6">
                <h4 className="font-bold text-green-900 dark:text-green-200 mb-3 text-lg">Direct (hors assurance-vie)</h4>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li><strong>✅ Avantages :</strong></li>
                  <li>• Rendement brut complet (5-6%)</li>
                  <li>• Accès à toutes les SCPI</li>
                  <li>• Possibilité démembrement</li>
                </ul>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 mt-3">
                  <li><strong>❌ Inconvénients :</strong></li>
                  <li>• IR + PS = taxation 28-62%</li>
                  <li>• Liquidité 2-6 mois</li>
                  <li>• IFI applicable</li>
                </ul>
                <div className="mt-4 p-3 bg-green-100 dark:bg-green-800 rounded">
                  <p className="text-xs font-bold text-green-900 dark:text-green-200">
                    💡 Recommandé si TMI 11-30% max
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-6">
                <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-3 text-lg">Assurance-vie</h4>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li><strong>✅ Avantages :</strong></li>
                  <li>• Fiscalité réduite (PS 17,2% seulement)</li>
                  <li>• Liquidité 48-72h</li>
                  <li>• Hors IFI si moins de 150k€</li>
                  <li>• Optimisation succession</li>
                </ul>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 mt-3">
                  <li><strong>❌ Inconvénients :</strong></li>
                  <li>• Choix SCPI limité (10-20 max)</li>
                  <li>• Frais contrat 0,5-1%/an</li>
                </ul>
                <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-800 rounded">
                  <p className="text-xs font-bold text-blue-900 dark:text-blue-200">
                    💡 Recommandé si TMI 30-45%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 border-l-4 border-yellow-500">
            <h3 className="font-bold text-yellow-900 dark:text-yellow-200 mb-3 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Règle d'or pour les SCPI santé
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Ne dépassez jamais 30% de votre portefeuille SCPI en santé.</strong> La spécialisation sectorielle augmente le risque. Complétez avec des SCPI bureaux/commerces/logistique pour une diversification optimale. Horizon minimum : 10-12 ans.
            </p>
          </div>
        </div>
      </section>
      

      {/* Cas pratiques */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Users className="w-8 h-8 text-orange-600" />
          3 stratégies d'allocation en SCPI santé
        </h2>

        <div className="space-y-6">
          {/* Profil 1 */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Profil 1 : Primo-accédant SCPI santé (30k€ - TMI 11%)
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-3">Allocation recommandée</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center bg-white dark:bg-gray-700 rounded p-3">
                    <span className="font-bold">LF Avenir Santé</span>
                    <span className="text-blue-600 font-bold">18 000 € (60%)</span>
                  </div>
                  <div className="flex justify-between items-center bg-white dark:bg-gray-700 rounded p-3">
                    <span className="font-bold">NCap Education Santé</span>
                    <span className="text-green-600 font-bold">12 000 € (40%)</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-800 rounded">
                  <p className="text-xs font-bold">Rendement net cible : 4,2%/an</p>
                  <p className="text-xs">Revenus annuels : 1 260 €</p>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-3">Projection 15 ans</h4>
                <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
                  <li>• Capital final : <strong>55 000 €</strong></li>
                  <li>• Plus-value latente : +25 000 €</li>
                  <li>• Revenus cumulés : 18 900 €</li>
                  <li>• Performance totale : <strong>+83%</strong></li>
                </ul>
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 rounded">
                  <p className="text-xs text-gray-700 dark:text-gray-300">
                    <strong>Pourquoi ce choix ?</strong> LF Avenir Santé (meilleur rendement 5,2%) + NCap Education Santé (spécialisation 66% santé/social, endettement 0%). TMI faible permet investissement direct.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Profil 2 */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Profil 2 : Investisseur confirmé (80k€ - TMI 30%)
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-purple-900 dark:text-purple-200 mb-3">Allocation recommandée</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center bg-white dark:bg-gray-700 rounded p-3">
                    <span className="font-bold">LF Avenir Santé (AV)</span>
                    <span className="text-blue-600 font-bold">20 000 € (25%)</span>
                  </div>
                  <div className="flex justify-between items-center bg-white dark:bg-gray-700 rounded p-3">
                    <span className="font-bold">Perial Hospitalité (AV)</span>
                    <span className="text-green-600 font-bold">15 000 € (18,75%)</span>
                  </div>
                  <div className="flex justify-between items-center bg-white dark:bg-gray-700 rounded p-3">
                    <span className="font-bold">Epimmo (AV - Diversifié)</span>
                    <span className="text-purple-600 font-bold">25 000 € (31,25%)</span>
                  </div>
                  <div className="flex justify-between items-center bg-white dark:bg-gray-700 rounded p-3">
                    <span className="font-bold">Corum Origin (AV - Europe)</span>
                    <span className="text-orange-600 font-bold">20 000 € (25%)</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-purple-100 dark:bg-purple-800 rounded">
                  <p className="text-xs font-bold">Rendement net moyen : 4,0%/an</p>
                  <p className="text-xs">Revenus annuels : 3 200 €</p>
                  <p className="text-xs mt-1">Part santé : 43,75%</p>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-purple-900 dark:text-purple-200 mb-3">Projection 15 ans</h4>
                <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
                  <li>• Capital final : <strong>144 000 €</strong></li>
                  <li>• Plus-value latente : +64 000 €</li>
                  <li>• Revenus cumulés : 48 000 €</li>
                  <li>• Performance totale : <strong>+80%</strong></li>
                </ul>
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 rounded">
                  <p className="text-xs text-gray-700 dark:text-gray-300">
                    <strong>Pourquoi ce choix ?</strong> 100% AV pour optimisation fiscale TMI 30%. Mix 44% santé (LF Avenir + Perial Hospitalité) + 56% diversifiées (Epimmo bureaux + Corum Europe). Liquidité 48h.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Profil 3 */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Profil 3 : Patrimoine établi (150k€ - TMI 41%)
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-orange-900 dark:text-orange-200 mb-3">Allocation recommandée</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center bg-white dark:bg-gray-700 rounded p-3">
                    <span className="font-bold">LF Avenir Santé (AV)</span>
                    <span className="text-blue-600 font-bold">30 000 € (20%)</span>
                  </div>
                  <div className="flex justify-between items-center bg-white dark:bg-gray-700 rounded p-3">
                    <span className="font-bold">NCap Education Santé (AV)</span>
                    <span className="text-green-600 font-bold">15 000 € (10%)</span>
                  </div>
                  <div className="flex justify-between items-center bg-white dark:bg-gray-700 rounded p-3">
                    <span className="font-bold">Epimmo (AV - Bureaux)</span>
                    <span className="text-orange-600 font-bold">50 000 € (33,3%)</span>
                  </div>
                  <div className="flex justify-between items-center bg-white dark:bg-gray-700 rounded p-3">
                    <span className="font-bold">Corum Origin (AV - Europe)</span>
                    <span className="text-purple-600 font-bold">30 000 € (20%)</span>
                  </div>
                  <div className="flex justify-between items-center bg-white dark:bg-gray-700 rounded p-3">
                    <span className="font-bold">Primopierre (AV - Logistique)</span>
                    <span className="text-gray-600 font-bold">25 000 € (16,7%)</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-orange-100 dark:bg-orange-800 rounded">
                  <p className="text-xs font-bold">Rendement net moyen : 3,9%/an</p>
                  <p className="text-xs">Revenus annuels : 5 850 €</p>
                  <p className="text-xs mt-1">Part santé : 30%</p>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-orange-900 dark:text-orange-200 mb-3">Projection 15 ans</h4>
                <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
                  <li>• Capital final : <strong>263 000 €</strong></li>
                  <li>• Plus-value latente : +113 000 €</li>
                  <li>• Revenus cumulés : 87 750 €</li>
                  <li>• Performance totale : <strong>+75%</strong></li>
                  <li>• <span className="text-green-600 font-bold">Hors IFI (AV 100%)</span></li>
                </ul>
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 rounded">
                  <p className="text-xs text-gray-700 dark:text-gray-300">
                    <strong>Pourquoi ce choix ?</strong> 100% AV pour optimisation fiscale TMI 41%. Part santé limitée à 30% (LF Avenir + NCap) pour équilibrer le risque. Diversification 5 secteurs : santé, bureaux, Europe, logistique. Liquidité 48h et succession optimisée.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-3">📊 Comparatif des 3 stratégies</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-200 dark:bg-gray-600">
                <tr>
                  <th className="px-4 py-2 text-left">Critère</th>
                  <th className="px-4 py-2 text-left">Profil 1</th>
                  <th className="px-4 py-2 text-left">Profil 2</th>
                  <th className="px-4 py-2 text-left">Profil 3</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 dark:text-gray-300">
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <td className="px-4 py-3 font-bold">Capital investi</td>
                  <td className="px-4 py-3">30k€</td>
                  <td className="px-4 py-3">80k€</td>
                  <td className="px-4 py-3">150k€</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <td className="px-4 py-3 font-bold">Part santé</td>
                  <td className="px-4 py-3">100%</td>
                  <td className="px-4 py-3">43,75%</td>
                  <td className="px-4 py-3">30%</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <td className="px-4 py-3 font-bold">Enveloppe</td>
                  <td className="px-4 py-3">Direct</td>
                  <td className="px-4 py-3">AV 100%</td>
                  <td className="px-4 py-3">AV 100%</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <td className="px-4 py-3 font-bold">Rendement net</td>
                  <td className="px-4 py-3">4,2%</td>
                  <td className="px-4 py-3">4,0%</td>
                  <td className="px-4 py-3">3,9%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-bold">Performance 15 ans</td>
                  <td className="px-4 py-3 text-green-600 font-bold">+83%</td>
                  <td className="px-4 py-3 text-green-600 font-bold">+80%</td>
                  <td className="px-4 py-3 text-green-600 font-bold">+75%</td>
                </tr>
              </tbody>
            </table>
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
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Questions fréquentes sur les SCPI santé</h2>

        <div className="space-y-6">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Les SCPI santé sont-elles plus risquées que les SCPI diversifiées ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Pas nécessairement, mais elles ont un profil de risque différent.</strong> Les SCPI santé affichent une <strong>résilience économique</strong> supérieure (activité peu cyclique) et des <strong>baux longs</strong> (9-12 ans). Cependant, le <strong>risque réglementaire</strong> (tarifs EHPAD fixés par l'État) et la <strong>concentration sectorielle</strong> sont plus élevés. LF Avenir Santé et NCap Education Santé, malgré leur spécialisation, offrent un rendement attractif (4,85-5,2%).
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Quelle part de mon patrimoine allouer aux SCPI santé ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Maximum 20-30% de votre portefeuille SCPI.</strong> Au-delà, vous augmentez le risque de concentration sectorielle. Par exemple, sur 100k€ investis en SCPI : 25k€ santé (LF Avenir Santé, NCap Education) + 40k€ bureaux/commerces (Epimmo, Corum) + 35k€ logistique/Europe (Primopierre, Corum Origin). Cette allocation offre un rendement net cible de 4,0-4,2% avec un risque maîtrisé.
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Comment les réformes EHPAD impactent-elles les SCPI santé ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Les réformes du financement EHPAD (2024-2025) créent de l'<strong>incertitude à court terme</strong> sur les tarifs et la rentabilité des opérateurs. Les SCPI santé spécialisées sont par nature <strong>plus exposées à ce risque</strong> que les SCPI diversifiées. NCap Education Santé (66% santé/social) et LF Avenir Santé diversifient entre EHPAD, cliniques, centres médicaux. Perial Hospitalité Europe atteint 61% santé + 38% hôtellerie, limitant l'exposition aux réformes EHPAD.
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              SCPI santé en assurance-vie ou en direct ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Dépend de votre TMI.</strong> Si TMI 11-30%, investissez en direct (rendement brut complet 4,85-5,2%, taxation modérée). Si TMI 41-45%, privilégiez l'assurance-vie (fiscalité PS 17,2% seulement, soit +0,8 point de rendement net vs direct). Bonus AV : liquidité 48h, hors IFI, optimisation succession. Inconvénient : choix SCPI santé très limité en assurance-vie (vérifier disponibilité auprès de votre assureur).
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              LF Avenir Santé vs NCap Education Santé : laquelle choisir ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Les deux sont complémentaires !</strong> <strong>LF Avenir Santé</strong> : meilleur rendement (5,2%), TO parfait (100%), capitalisation 232M€, gestion La Française REM reconnue, focus santé large. <strong>NCap Education Santé</strong> : spécialisation maximale (66% santé/social), endettement 0%, capitalisation 110M€, rendement 4,85%. Allocation optimale : 60% LF Avenir Santé + 40% NCap Education pour combiner rendement (LF Avenir) et spécialisation santé/social (NCap).
            </p>
          </div>
        </div>
      </section>

      {/* Conclusion + CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 dark:from-blue-800 dark:to-purple-900 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-4">Conclusion : les SCPI santé, un placement résilient pour investisseurs avertis</h2>
        <div className="space-y-4 text-lg text-blue-50">
          <p>
            Les SCPI santé offrent un <strong>profil risque/rendement attractif</strong> pour qui sait les sélectionner et les doser. Avec un rendement net de <strong>4-5%/an</strong>, des baux longs (9-12 ans), et une résilience économique prouvée, elles constituent un excellent complément à un portefeuille SCPI diversifié.
          </p>
          <p>
            Les clés du succès : <strong>(1)</strong> Privilégier les 3 SCPI spécialisées (LF Avenir Santé, NCap Education, Perial Hospitalité), <strong>(2)</strong> Ne pas dépasser 30% de votre portefeuille SCPI en santé, <strong>(3)</strong> Adapter l'enveloppe à votre TMI (direct si TMI 11-30%, AV si TMI 41-45%), <strong>(4)</strong> Investir avec un horizon 10-15 ans minimum.
          </p>
          <p>
            Le vieillissement démographique (4,5M de +80 ans en 2030) garantit une demande structurelle croissante. Cependant, le risque réglementaire (réformes EHPAD) impose une <strong>diversification rigoureuse</strong> entre opérateurs et types d'actifs (EHPAD, cliniques, résidences seniors).
          </p>

          <div className="bg-white/10 rounded-lg p-6 mt-6">
            <h3 className="text-xl font-bold mb-3">🎯 Construisez votre portefeuille SCPI santé personnalisé</h3>
            <p className="mb-4">
              Notre comparateur vous permet d'analyser LF Avenir Santé, NCap Education Santé, Perial Hospitalité Europe et 50+ SCPI pour construire l'allocation optimale selon votre profil fiscal et vos objectifs patrimoniaux.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="/comparateur-scpi"
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors"
              >
                Comparer les SCPI santé
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

export default ScpiSanteSeniorsEhpadCliniquesInvestissementArticle;
