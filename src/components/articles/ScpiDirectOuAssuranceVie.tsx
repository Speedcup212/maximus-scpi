import React from 'react';
import { Building2, Shield, TrendingUp, AlertTriangle, CheckCircle2, Euro, Users, Target, User, Calendar, Clock, BarChart3 } from 'lucide-react';

export const ScpiDirectOuAssuranceVieArticle: React.FC = () => {
  return (
    <div className="space-y-12">
      {/* Header avec background */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-8 border border-blue-100 dark:border-gray-700">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <li><a href="/" className="hover:text-blue-600 dark:hover:text-blue-400">Accueil</a></li>
            <li>/</li>
            <li><a href="/education" className="hover:text-blue-600 dark:hover:text-blue-400">Éducation</a></li>
            <li>/</li>
            <li className="text-gray-900 dark:text-white font-semibold">SCPI en direct ou via assurance-vie</li>
          </ol>
        </nav>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-semibold rounded-full">
            Comparatifs
          </span>
          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-sm font-semibold rounded-full">
            Fiscalité
          </span>
        </div>

        {/* H1 */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          SCPI en direct ou via assurance-vie : quel mode d'achat choisir ?
        </h1>

        {/* Meta info */}
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
          Dans la construction patrimoniale contemporaine, le choix entre détenir des parts de SCPI en direct ou via un contrat d'Assurance‑vie est plus stratégique que jamais. Chaque mode présente des atouts – mais aussi des contraintes importantes en matière de fiscalité, de liquidité et d'effet de levier. En tant que conseiller en gestion de patrimoine (CGP-CIF), je vous propose une analyse approfondie pour déterminer, à partir de votre profil, votre horizon et vos objectifs, quel véhicule privilégier.
        </p>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-l-4 border-blue-500">
          <p className="text-gray-900 dark:text-white font-bold mb-3 text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            Dans cet article, vous allez :
          </p>
          <ul className="space-y-2 text-gray-800 dark:text-gray-200">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Comprendre les différences fondamentales entre SCPI en direct et SCPI via assurance-vie.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Identifier les situations où l'un ou l'autre mode est préférable.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Observer les critères clés (effet de levier, fiscalité, transmission, frais) pour choisir en confiance.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Obtenir une feuille de route pratique pour structurer votre allocation SCPI à travers le bon mode d'achat.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Section 1 : Contexte & enjeux */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Building2 className="w-8 h-8 text-blue-600" />
          Contexte & enjeux
        </h2>

        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Pourquoi ce choix est-il devenu crucial ?
        </h3>

        <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
          L'année 2025 voit se renforcer la collecte massive dans les SCPI et se durcir l'environnement macroéconomique (hausse des taux, pression inflationniste, transition immobilière). Dans ce contexte, la structure de détention des parts n'est plus un simple détail : elle peut faire varier votre rendement net, votre fiscalité et votre capacité à arbitrer.
        </p>

        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Les enjeux à maîtriser
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6">
            <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-3">💰 Fiscalité</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              SCPI en direct = revenus fonciers + prélèvements sociaux ; SCPI via assurance-vie = fiscalité du contrat.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6">
            <h4 className="font-bold text-purple-900 dark:text-purple-200 mb-3">📈 Effet de levier</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              En direct, possible d'emprunter pour acquérir des parts. Via assurance-vie, l'emprunt n'est généralement pas pratiqué pour les parts logées.
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6">
            <h4 className="font-bold text-green-900 dark:text-green-200 mb-3">🎁 Transmission et enveloppe</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              L'assurance-vie offre des avantages pour la transmission.
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-6">
            <h4 className="font-bold text-orange-900 dark:text-orange-200 mb-3">💧 Liquidité, frais et choix de fonds</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Direct parfois choix plus large mais liquidité plus longue ; assurance-vie, choix plus réduit, mais accès simplifié.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2 : Fonctionnement / règles de base */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Shield className="w-8 h-8 text-purple-600" />
          Fonctionnement / règles de base
        </h2>

        {/* SCPI en direct */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            SCPI en direct
          </h3>

          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            Vous souscrivez des parts directement auprès de la société de gestion, vous devenez associé.
          </p>

          <ul className="space-y-3 text-gray-700 dark:text-gray-300 mb-6">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span><strong>Fiscalité :</strong> loyers imposés comme revenus fonciers + prélèvements sociaux 17,2 % (sauf dispositif spécifique).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span><strong>Possibilité d'emprunt :</strong> les intérêts peuvent être déductibles si régime réel.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span><strong>Choix de fonds</strong> souvent large, mais vous assumez toutes les contraintes (valorisation, liquidité, périodicité des versements).</span>
            </li>
          </ul>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
              <h4 className="font-bold text-green-900 dark:text-green-200 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Avantages du direct
              </h4>
              <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
                <li>✅ <strong>Rendement brut maximal</strong> (pas de frais AV 0,5-1%)</li>
                <li>✅ <strong>SCPI européennes</strong> avec PS 0% accessibles</li>
                <li>✅ <strong>Démembrement possible</strong> (nue-propriété/usufruit)</li>
                <li>✅ <strong>Déficit foncier déductible</strong> (SCPI fiscales)</li>
                <li>✅ <strong>Choix illimité</strong> de SCPI (toutes disponibles)</li>
              </ul>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6">
              <h4 className="font-bold text-orange-900 dark:text-orange-200 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Inconvénients du direct
              </h4>
              <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
                <li>⚠️ <strong>Fiscalité IR + PS 17,2%</strong> (SCPI France)</li>
                <li>⚠️ <strong>Liquidité moyenne</strong> (2-6 mois de délai)</li>
                <li>⚠️ <strong>Soumis à l'IFI</strong> en pleine propriété</li>
                <li>⚠️ <strong>Succession classique</strong> (droits 20-45%)</li>
                <li>⚠️ <strong>Frais de souscription</strong> 8-12% non récupérables</li>
              </ul>
            </div>
          </div>
        </div>

        {/* SCPI via AV */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            SCPI via assurance-vie
          </h3>

          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            Les parts sont logées dans un contrat d'assurance-vie, souvent via des unités de compte.
          </p>

          <ul className="space-y-3 text-gray-700 dark:text-gray-300 mb-6">
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold mt-1">•</span>
              <span><strong>Fiscalité allégée</strong> si maintien du contrat : l'imposition à la sortie est celle de l'assurance-vie et non directement celle des revenus fonciers.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold mt-1">•</span>
              <span><strong>Moins d'endettement possible</strong> pour votre achat.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold mt-1">•</span>
              <span>Parfois un <strong>délai de jouissance plus court</strong> pour percevoir les loyers.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold mt-1">•</span>
              <span><strong>Choix des SCPI plus restreint</strong>, frais cumulés du contrat + parts.</span>
            </li>
          </ul>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
              <h4 className="font-bold text-green-900 dark:text-green-200 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Avantages de l'assurance-vie
              </h4>
              <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
                <li>✅ <strong>Fiscalité PS 17,2% uniquement</strong> (pas d'IR annuel)</li>
                <li>✅ <strong>Liquidité instantanée</strong> (48-72h)</li>
                <li>✅ <strong>Hors IFI</strong> (exonération totale)</li>
                <li>✅ <strong>Succession optimisée</strong> (abattement 152 500 €/bénéficiaire)</li>
                <li>✅ <strong>Clause bénéficiaire</strong> libre et modifiable</li>
                <li>✅ <strong>Abattements après 8 ans</strong> (4 600 €/an célibataire)</li>
              </ul>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6">
              <h4 className="font-bold text-orange-900 dark:text-orange-200 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Inconvénients de l'assurance-vie
              </h4>
              <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
                <li>⚠️ <strong>Frais d'assurance</strong> 0,5-1% par an</li>
                <li>⚠️ <strong>Choix limité</strong> aux SCPI référencées (20-40 SCPI)</li>
                <li>⚠️ <strong>Pas de démembrement</strong> possible</li>
                <li>⚠️ <strong>Pas de déficit foncier</strong> déductible</li>
                <li>⚠️ <strong>SCPI européennes rares</strong> en AV</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 : Stratégies recommandées */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-green-600" />
          Stratégies recommandées
        </h2>

        <div className="space-y-8">
          {/* Profil 1 */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Profil investisseur à TMI faible / capacité d'emprunt
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Si vous êtes peu imposé et disposez d'un emprunt possible : la SCPI en direct peut être envisagée pour tirer profit de l'effet de levier.
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                <strong>Exemple :</strong> vous investissez 100 000 €, empruntez 80 % à 3 % sur 15 ans, utilisez les loyers payés pour rembourser. Le gain potentiel monte.
              </p>
            </div>
          </div>

          {/* Profil 2 */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Profil investisseur fiscalement lourd / transmission prioritaire
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Si votre TMI est élevé ou vous anticipez une transmission : privilégiez la SCPI via assurance-vie. Le rendement peut être légèrement moindre mais la fiscalité est optimisée.
            </p>
          </div>

          {/* Profil 3 */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Mix et diversification
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Pour un patrimoine équilibré : restez ouvert à une détention mixte (part en direct + part via assurance-vie) afin de tirer les avantages de chaque mode tout en contrôlant les risques.
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Assurez-vous que la SCPI que vous sélectionnez est disponible dans l'assurance-vie si vous optez pour ce mode.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 : Risques & points de vigilance */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-red-600" />
          Risques & points de vigilance
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border-l-4 border-red-500">
            <h3 className="font-bold text-red-900 dark:text-red-200 mb-3">⚠️ Frais chez l'assurance-vie</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Attention aux frais d'entrée ou de gestion du contrat peuvent peser sur votre rendement net.
            </p>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6 border-l-4 border-orange-500">
            <h3 className="font-bold text-orange-900 dark:text-orange-200 mb-3">⚠️ Effet de levier</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Effet de levier = gain potentiel + risque accru. Une hausse de taux ou une baisse de valeur de parts peut venir grignoter la rentabilité.
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 border-l-4 border-yellow-500">
            <h3 className="font-bold text-yellow-900 dark:text-yellow-200 mb-3">⚠️ Liquidité des parts de SCPI</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              En direct, revente peut prendre plusieurs mois selon le carnet d'ordres.
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border-l-4 border-purple-500">
            <h3 className="font-bold text-purple-900 dark:text-purple-200 mb-3">⚠️ Choix restreint des SCPI</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Dans certaines assurances-vie : vérifier la qualité du contrat et des SCPI accessibles.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5 : Cas pratique */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-purple-600" />
          Cas pratique
        </h2>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Hypothèse : Investisseur de 45 ans
          </h3>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-3">Profil</h4>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                <li>• <strong>TMI :</strong> 30 %</li>
                <li>• <strong>Capital à investir :</strong> 150 000 €</li>
                <li>• <strong>Horizon :</strong> 15 ans</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-bold text-purple-900 dark:text-purple-200 mb-3">Option A (direct)</h4>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                <li>• Souscription directe de SCPI</li>
                <li>• Rendement brut 5,5 %</li>
                <li>• Frais de souscription 10 %</li>
                <li>• Emprunt possible 70 % à 3 % sur 15 ans</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-bold text-green-900 dark:text-green-200 mb-3">Option B (assurance-vie)</h4>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                <li>• Placement via contrat assurance-vie</li>
                <li>• Rendement brut identique</li>
                <li>• Frais additionnels 1 %/an</li>
                <li>• Pas d'emprunt</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-bold text-orange-900 dark:text-orange-200 mb-3">Analyse</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Vous comparez le rendement net après fiscalité et coût d'emprunt, puis déterminez la valeur actuelle des revenus. (Le calcul détaillé sera spécifique au cas, à adapter).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6 : Tableau comparatif */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-purple-600" />
          Tableau comparatif synthétique
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600">
                <th className="p-4 text-left font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">Critère</th>
                <th className="p-4 text-left font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">SCPI Direct</th>
                <th className="p-4 text-left font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">SCPI Assurance-Vie</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-4 font-semibold border border-gray-200 dark:border-gray-600">Fiscalité annuelle</td>
                <td className="p-4 border border-gray-200 dark:border-gray-600">
                  <span className="text-orange-600 font-bold">IR + PS 17,2%</span><br />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Revenus fonciers</span>
                </td>
                <td className="p-4 border border-gray-200 dark:border-gray-600">
                  <span className="text-green-600 font-bold">PS 17,2% uniquement</span><br />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Pas d'IR annuel</span>
                </td>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-700/30">
                <td className="p-4 font-semibold border border-gray-200 dark:border-gray-600">Liquidité</td>
                <td className="p-4 border border-gray-200 dark:border-gray-600">
                  <span className="text-orange-600 font-bold">2-6 mois</span><br />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Marché secondaire</span>
                </td>
                <td className="p-4 border border-gray-200 dark:border-gray-600">
                  <span className="text-green-600 font-bold">48-72h</span><br />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Quasi-instantané</span>
                </td>
              </tr>
              <tr>
                <td className="p-4 font-semibold border border-gray-200 dark:border-gray-600">IFI</td>
                <td className="p-4 border border-gray-200 dark:border-gray-600">
                  <span className="text-orange-600 font-bold">Soumis</span><br />
                  <span className="text-sm text-gray-600 dark:text-gray-400">100% si &gt; 1,3M€</span>
                </td>
                <td className="p-4 border border-gray-200 dark:border-gray-600">
                  <span className="text-green-600 font-bold">Exonéré</span><br />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Hors assiette IFI</span>
                </td>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-700/30">
                <td className="p-4 font-semibold border border-gray-200 dark:border-gray-600">Succession</td>
                <td className="p-4 border border-gray-200 dark:border-gray-600">
                  <span className="text-orange-600 font-bold">Droits 20-45%</span><br />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Abattement 100k€</span>
                </td>
                <td className="p-4 border border-gray-200 dark:border-gray-600">
                  <span className="text-green-600 font-bold">Abattement 152,5k€</span><br />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Par bénéficiaire</span>
                </td>
              </tr>
              <tr>
                <td className="p-4 font-semibold border border-gray-200 dark:border-gray-600">Démembrement</td>
                <td className="p-4 border border-gray-200 dark:border-gray-600">
                  <span className="text-green-600 font-bold">Possible</span><br />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Usufruit/Nue-propriété</span>
                </td>
                <td className="p-4 border border-gray-200 dark:border-gray-600">
                  <span className="text-orange-600 font-bold">Impossible</span><br />
                  <span className="text-sm text-gray-600 dark:text-gray-400">N/A</span>
                </td>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-700/30">
                <td className="p-4 font-semibold border border-gray-200 dark:border-gray-600">SCPI européennes</td>
                <td className="p-4 border border-gray-200 dark:border-gray-600">
                  <span className="text-green-600 font-bold">Accès total</span><br />
                  <span className="text-sm text-gray-600 dark:text-gray-400">PS 0% disponibles</span>
                </td>
                <td className="p-4 border border-gray-200 dark:border-gray-600">
                  <span className="text-orange-600 font-bold">Rare</span><br />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Peu référencées</span>
                </td>
              </tr>
              <tr>
                <td className="p-4 font-semibold border border-gray-200 dark:border-gray-600">Frais totaux</td>
                <td className="p-4 border border-gray-200 dark:border-gray-600">
                  <span className="text-gray-700 dark:text-gray-300 font-bold">8-12% souscription</span><br />
                  <span className="text-sm text-gray-600 dark:text-gray-400">+ 8-10% gestion</span>
                </td>
                <td className="p-4 border border-gray-200 dark:border-gray-600">
                  <span className="text-gray-700 dark:text-gray-300 font-bold">0,5-1% par an</span><br />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Frais AV annuels</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 3 : Calculs fiscaux selon TMI */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Euro className="w-8 h-8 text-green-600" />
          Rendements nets selon votre TMI
        </h2>

        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Voici les calculs de rendement net pour <strong>10 000 € investis</strong> selon le mode d'achat et votre Tranche Marginale d'Imposition (TMI) :
        </p>

        {/* TMI 11% */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-600" />
            TMI 11% : Privilégier le direct avec SCPI européennes
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">SCPI EU Direct (6,5% brut)</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">579 €/an</div>
              <div className="text-xs text-gray-500 mt-1">IR 11% + PS 0% = 5,79% net</div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">SCPI AV France (5% brut)</div>
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">414 €/an</div>
              <div className="text-xs text-gray-500 mt-1">PS 17,2% = 4,14% net</div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">SCPI FR Direct (5% brut)</div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">359 €/an</div>
              <div className="text-xs text-gray-500 mt-1">IR 11% + PS 17,2% = 3,59% net</div>
            </div>
          </div>

          <div className="mt-4 bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border-l-4 border-green-500">
            <p className="text-sm text-green-900 dark:text-green-200">
              <strong>💡 Stratégie optimale TMI 11% :</strong> Privilégier SCPI européennes en direct (PS 0%) pour maximiser le rendement net : 579 €/an vs 414 €/an en AV = <strong>+165 €/an</strong> (+40%).
            </p>
          </div>
        </div>

        {/* TMI 30% */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-600" />
            TMI 30% : Stratégie mixte AV + Direct EU
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">SCPI EU Direct (6,5% brut)</div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">455 €/an</div>
              <div className="text-xs text-gray-500 mt-1">IR 30% + PS 0% = 4,55% net</div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">SCPI AV France (5% brut)</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">414 €/an</div>
              <div className="text-xs text-gray-500 mt-1">PS 17,2% = 4,14% net</div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">SCPI FR Direct (5% brut)</div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">264 €/an</div>
              <div className="text-xs text-gray-500 mt-1">IR 30% + PS 17,2% = 2,64% net</div>
            </div>
          </div>

          <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-l-4 border-blue-500">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              <strong>💡 Stratégie optimale TMI 30% :</strong> Mix 60% AV France + 40% Direct EU → Rendement net moyen : <strong>4,30% net</strong> avec liquidité AV et optimisation fiscale EU.
            </p>
          </div>
        </div>

        {/* TMI 41% */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Target className="w-6 h-6 text-red-600" />
            TMI 41%+ : Assurance-vie incontournable
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">SCPI AV France (5% brut)</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">414 €/an</div>
              <div className="text-xs text-gray-500 mt-1">PS 17,2% = 4,14% net</div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">SCPI EU Direct (6,5% brut)</div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">384 €/an</div>
              <div className="text-xs text-gray-500 mt-1">IR 41% + PS 0% = 3,84% net</div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">SCPI FR Direct (5% brut)</div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">209 €/an</div>
              <div className="text-xs text-gray-500 mt-1">IR 41% + PS 17,2% = 2,09% net</div>
            </div>
          </div>

          <div className="mt-4 bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border-l-4 border-red-500">
            <p className="text-sm text-red-900 dark:text-red-200">
              <strong>💡 Stratégie optimale TMI 41%+ :</strong> 100% Assurance-vie recommandé. Gain AV vs Direct France : <strong>+2,05 points de rendement</strong> (+98%). L'AV permet d'éviter l'IR annuel tout en bénéficiant de la liquidité et de l'optimisation successorale.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4 : Stratégies selon profil */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Users className="w-8 h-8 text-orange-600" />
          3 stratégies optimisées selon votre profil
        </h2>

        <div className="space-y-6">
          {/* Profil 1 */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Profil 1 : Jeune actif TMI 11%, 30 ans, 20 000 € à investir
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-3">Allocation recommandée</h4>
                <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
                  <li>• <strong>100% SCPI Direct EU</strong> (20 000 €)</li>
                  <li>• <strong>3 SCPI européennes</strong> (Allemagne, Espagne, Pays-Bas)</li>
                  <li>• <strong>Rendement brut</strong> : 6-6,5% en moyenne</li>
                  <li>• <strong>Rendement net</strong> : 5,34-5,79%</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-3">Résultats attendus</h4>
                <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
                  <li>• <strong>Revenus annuels</strong> : 1 068-1 158 €/an</li>
                  <li>• <strong>TMI basse</strong> : Profite de PS 0%</li>
                  <li>• <strong>Horizon 20+ ans</strong> : Liquidité moins critique</li>
                  <li>• <strong>Gain vs AV</strong> : +33% de revenus nets</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Justification :</strong> À TMI 11% avec un horizon long terme, le direct EU maximise le rendement net grâce aux PS 0%. La liquidité moindre n'est pas un problème vu l'horizon 20+ ans.
              </p>
            </div>
          </div>

          {/* Profil 2 */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Profil 2 : Actif confirmé TMI 30%, 45 ans, 80 000 € à investir
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-purple-900 dark:text-purple-200 mb-3">Allocation recommandée</h4>
                <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
                  <li>• <strong>60% AV France</strong> (48 000 €) → 4 SCPI françaises</li>
                  <li>• <strong>40% Direct EU</strong> (32 000 €) → 2-3 SCPI européennes</li>
                  <li>• <strong>Rendement moyen brut</strong> : 5,4%</li>
                  <li>• <strong>Rendement net moyen</strong> : 4,30%</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-purple-900 dark:text-purple-200 mb-3">Résultats attendus</h4>
                <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
                  <li>• <strong>Revenus annuels</strong> : 3 440 €/an</li>
                  <li>• <strong>AV</strong> : 1 987 €/an (liquidité instantanée)</li>
                  <li>• <strong>Direct EU</strong> : 1 456 €/an (PS 0%)</li>
                  <li>• <strong>IFI</strong> : Optimisé via AV (hors assiette)</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Justification :</strong> Mix optimal combinant liquidité AV (60%) pour besoin court terme et optimisation fiscale EU direct (40%). Exonération IFI sur la partie AV et PS 0% sur partie EU.
              </p>
            </div>
          </div>

          {/* Profil 3 */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Profil 3 : Haut revenu TMI 41%, 55 ans, 150 000 € à investir
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-orange-900 dark:text-orange-200 mb-3">Allocation recommandée</h4>
                <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
                  <li>• <strong>100% Assurance-vie</strong> (150 000 €)</li>
                  <li>• <strong>5-6 SCPI françaises</strong> diversifiées</li>
                  <li>• <strong>Rendement brut</strong> : 5% en moyenne</li>
                  <li>• <strong>Rendement net</strong> : 4,14%</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-orange-900 dark:text-orange-200 mb-3">Résultats attendus</h4>
                <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
                  <li>• <strong>Revenus annuels</strong> : 6 210 €/an</li>
                  <li>• <strong>Liquidité totale</strong> : 48-72h</li>
                  <li>• <strong>IFI</strong> : 0 € (hors assiette)</li>
                  <li>• <strong>Succession</strong> : 152,5k€ abattement/bénéficiaire</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Justification :</strong> À TMI 41%, l'AV est incontournable : évite l'IR annuel (+2 points de rendement vs direct FR), exonère de l'IFI, optimise la succession. Gain net : <strong>+3 135 €/an vs direct</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5 : FAQ */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Questions fréquentes
        </h2>

        <div className="space-y-6">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Quel mode d'achat est le plus avantageux fiscalement ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Cela dépend de votre TMI. Pour les <strong>TMI basses (11%)</strong>, le direct avec SCPI européennes (PS 0%) est optimal : 5,79% net vs 4,14% en AV. Pour les <strong>TMI moyennes (30%)</strong>, privilégiez un mix 60% AV + 40% direct EU. Pour les <strong>TMI élevées (41-45%)</strong>, l'assurance-vie est incontournable : elle évite l'IR annuel et apporte +2 points de rendement net vs direct France.
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Peut-on combiner SCPI en direct et en assurance-vie ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Oui, c'est même recommandé pour optimiser. Vous pouvez détenir des <strong>SCPI européennes en direct</strong> (pour profiter des PS 0%) et des <strong>SCPI françaises en AV</strong> (pour la liquidité et l'IFI). Cette stratégie "mix" permet de cumuler les avantages : rendement optimisé EU + liquidité AV + exonération IFI partielle.
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Quelle est la différence de liquidité entre direct et AV ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              En <strong>assurance-vie</strong>, la liquidité est quasi-instantanée : 48-72h pour récupérer votre capital. En <strong>direct</strong>, comptez 2 à 6 mois selon la SCPI et sa file d'attente. L'AV offre donc un avantage significatif si vous avez besoin de disponibilité rapide. Pour un investissement long terme (15+ ans), cette différence est moins critique.
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Les SCPI en AV sont-elles soumises à l'IFI ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Non.</strong> Les SCPI détenues dans une assurance-vie sont <strong>totalement exonérées d'IFI</strong>. Seules les SCPI détenues en direct (pleine propriété) sont soumises à l'Impôt sur la Fortune Immobilière si votre patrimoine immobilier dépasse 1,3 M€. C'est un avantage majeur de l'AV pour les patrimoines élevés.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Peut-on transférer des SCPI du direct vers une AV ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Non, un transfert direct n'est pas possible. Si vous détenez des SCPI en direct et souhaitez basculer en AV, vous devez <strong>revendre vos parts en direct</strong> (délai 2-6 mois), puis <strong>réinvestir le capital en AV</strong>. Attention aux frais : frais de revente en direct (0-3%) + frais de souscription en AV (0-5% selon contrats). Cette opération n'a de sens que pour optimiser significativement la fiscalité ou l'IFI.
            </p>
          </div>
        </div>
      </section>

      {/* Conclusion avec CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 dark:from-blue-800 dark:to-purple-900 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-4">Conclusion</h2>
        <div className="space-y-4 text-lg text-blue-50">
          <p>
            Le choix entre SCPI en direct ou via assurance-vie dépend essentiellement de votre profil fiscal, de votre horizon d'investissement et de votre capacité d'endettement.
          </p>

          <div className="bg-white/10 rounded-lg p-6 mt-4 mb-4">
            <h3 className="text-xl font-bold mb-3">Points clés à retenir</h3>
            <ul className="space-y-2 ml-6">
              <li>• <strong>En direct :</strong> opportunité d'effet de levier, mais fiscalité et liquidité à bien appréhender.</li>
              <li>• <strong>Via assurance-vie :</strong> fiscalité souvent plus douce, transmission facilitée, mais frais et choix de fonds à scruter.</li>
              <li>• <strong>Pour un CGP-CIF :</strong> la recommandation clé est de structurer la détention pour qu'elle corresponde à l'objectif patrimonial, et non seulement au produit.</li>
            </ul>
          </div>

          <div className="bg-white/10 rounded-lg p-6 mt-6">
            <h3 className="text-xl font-bold mb-3">🎯 Besoin d'aide pour choisir ?</h3>
            <p className="mb-4">
              Si vous souhaitez : j'analyserai volontiers votre situation et choisirai avec vous le mode optimal pour votre allocation SCPI.
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
                Simuler Direct vs AV
              </a>
            </div>
          </div>

          <p className="text-sm text-blue-100 mt-6 italic border-t border-white/20 pt-4">
            Éric Bellaiche, CGP-CIF
          </p>
        </div>
      </section>
    </div>
  );
};

export default ScpiDirectOuAssuranceVieArticle;
