import React from 'react';
import { Building, TrendingUp, Shield, AlertTriangle, Calculator, Calendar, ArrowRight } from 'lucide-react';
import SEOHead from './SEOHead';
import Header from './Header';
import Footer from './Footer';
import { CookieConsent } from './CookieConsent';

interface FondsEurosScpiArticleProps {
  onNavigateHome: () => void;
  onNavigateToFaq: () => void;
  onNavigateToAbout: () => void;
  onNavigateToUnderstanding: () => void;
  onContactClick: () => void;
  onSimulateurClick: (simulateurId: string) => void;
  onComparateurClick: () => void;
}

const FondsEurosScpiArticle: React.FC<FondsEurosScpiArticleProps> = ({
  onNavigateHome,
  onNavigateToFaq,
  onNavigateToAbout,
  onNavigateToUnderstanding,
  onContactClick,
  onSimulateurClick,
  onComparateurClick
}) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SEOHead
        title="Fonds euros ou SCPI : que choisir pour votre épargne en 2025 ?"
        description="Comparaison complète entre fonds euros et SCPI : rendements, fiscalité, risques. Guide complet pour optimiser votre assurance-vie en 2025."
        keywords="fonds euros, SCPI, assurance-vie, rendement, fiscalité, TMI, investissement, épargne, 2025"
        canonical="https://www.maximusscpi.com/fonds-euros-ou-scpi"
      />

      <Header
        isDarkMode={false}
        toggleTheme={() => {}}
        onContactClick={onContactClick}
        onAboutClick={onNavigateToAbout}
        onEducationClick={() => {}}
        onLogoClick={onNavigateHome}
        onScpiPageClick={() => {}}
        onFaqClick={onNavigateToFaq}
        onUnderstandingClick={onNavigateToUnderstanding}
        onAboutSectionClick={onNavigateToAbout}
        onComparateurClick={onComparateurClick}
        onSimulateurClick={onSimulateurClick}
      />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-semibold mb-4">
            Guide Investissement 2025
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
            Fonds euros ou SCPI : que choisir pour votre épargne en 2025 ?
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
            Vous détenez une assurance-vie avec un capital conséquent sur un fonds euros et vous vous demandez s'il est temps de diversifier vers les SCPI ? Avec des rendements du fonds euros qui stagnent autour de 2 % tandis que l'inflation reste à 2 %, votre épargne peine à progresser réellement. Les SCPI, qui affichent des performances moyennes de 5 % en France et jusqu'à 6,5 % pour les SCPI européennes, représentent-elles une alternative pertinente ?
          </p>
        </div>

        {/* Introduction */}
        <div className="prose prose-lg max-w-none mb-12">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Cet article vous aide à comprendre les différences entre fonds euros et SCPI, à évaluer les avantages de chaque solution selon votre profil fiscal, et à déterminer quelle stratégie adopter pour optimiser votre patrimoine en 2025.
          </p>
        </div>

        {/* Fonds euros Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            Fonds euros : sécurité mais rendement limité
          </h2>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Qu'est-ce qu'un fonds euros ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              Le fonds euros est le support d'investissement sécuritaire par excellence au sein d'une assurance-vie. Votre capital est garanti : vous ne pouvez pas perdre d'argent, et les intérêts acquis chaque année sont définitivement consolidés (effet cliquet). Cette sécurité absolue en fait le placement préféré des Français prudents.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-8">
              Les performances actuelles des fonds euros
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              En 2024, le rendement moyen des fonds euros s'établit autour de <strong className="text-blue-600 dark:text-blue-400">2 % brut</strong>. Après prélèvements sociaux de 17,2 %, le rendement net tombe à environ <strong className="text-blue-600 dark:text-blue-400">1,66 %</strong>.
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 mb-6">
              <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-3 flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Exemple concret
              </h4>
              <p className="text-blue-800 dark:text-blue-300">
                Avec 50 000 € placés sur un fonds euros à 2 %, vous obtenez 1 000 € de gains bruts par an, soit 830 € nets après prélèvements sociaux. Avec une inflation à 2 %, votre pouvoir d'achat reste quasiment stable, sans réelle progression patrimoniale.
              </p>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-8">
              Les limites du fonds euros en 2025
            </h3>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                <span><strong>Rendement réel proche de zéro</strong> : une fois l'inflation déduite, votre épargne ne progresse pratiquement pas</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                <span><strong>Fiscalité sur les intérêts</strong> : même avec l'abattement après 8 ans (4 600 € pour une personne seule, 9 200 € pour un couple), les gains restent imposables au-delà</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                <span><strong>Manque de dynamisme</strong> : votre capital est protégé, mais il ne travaille pas efficacement pour vous</span>
              </li>
            </ul>
          </div>
        </section>

        {/* SCPI Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <Building className="w-8 h-8 text-green-600" />
            SCPI : rendement attractif mais capital non garanti
          </h2>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Qu'est-ce qu'une SCPI ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              Une Société Civile de Placement Immobilier (SCPI) est un véhicule d'investissement qui collecte l'épargne de nombreux associés pour acquérir et gérer un patrimoine immobilier diversifié : bureaux, commerces, logistique, santé, résidences services. Vous percevez des revenus locatifs trimestriels proportionnels à votre investissement.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-8">
              Les performances des SCPI en 2025
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              Les SCPI délivrent des rendements moyens nettement supérieurs aux fonds euros :
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">5 %</div>
                <div className="text-green-800 dark:text-green-300 font-semibold">SCPI françaises</div>
                <div className="text-sm text-green-700 dark:text-green-400 mt-1">Rendement moyen annuel</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">6,5 %</div>
                <div className="text-green-800 dark:text-green-300 font-semibold">SCPI européennes</div>
                <div className="text-sm text-green-700 dark:text-green-400 mt-1">Rendement moyen annuel</div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800 mb-6">
              <h4 className="font-bold text-green-900 dark:text-green-200 mb-3 flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Exemple concret
              </h4>
              <p className="text-green-800 dark:text-green-300">
                Avec 50 000 € investis dans une SCPI française à 5 %, vous percevez 2 500 € de revenus locatifs bruts annuels. Avec une SCPI européenne à 6,5 %, ce montant grimpe à 3 250 € bruts.
              </p>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-8">
              Les risques à connaître
            </h3>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
              <p className="text-red-800 dark:text-red-300 mb-4">
                Contrairement au fonds euros, <strong>le capital investi en SCPI n'est pas garanti</strong>. La valeur de vos parts peut fluctuer à la baisse comme à la hausse selon l'évolution du marché immobilier. De plus, les SCPI ne sont pas des placements liquides : la revente de vos parts peut prendre plusieurs semaines, voire quelques mois en période de tension.
              </p>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            SCPI en direct ou SCPI en assurance-vie : quelle différence ?
          </h2>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              Vous pouvez investir en SCPI de deux manières distinctes, chacune ayant ses propres caractéristiques fiscales et patrimoniales.
            </p>

            <div className="overflow-x-auto mb-8">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                    <th className="py-4 px-4 font-bold text-gray-900 dark:text-white">Critère</th>
                    <th className="py-4 px-4 font-bold text-blue-600 dark:text-blue-400">Fonds euros</th>
                    <th className="py-4 px-4 font-bold text-green-600 dark:text-green-400">SCPI en direct</th>
                    <th className="py-4 px-4 font-bold text-orange-600 dark:text-orange-400">SCPI en AV</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 dark:text-gray-300">
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-4 px-4 font-semibold">Rendement brut</td>
                    <td className="py-4 px-4">2 %</td>
                    <td className="py-4 px-4">5 à 6,5 %</td>
                    <td className="py-4 px-4">5 à 6,5 %</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-4 px-4 font-semibold">Rendement net (TMI 30%)</td>
                    <td className="py-4 px-4">1,66 %</td>
                    <td className="py-4 px-4">2,64 % à 3,44 %</td>
                    <td className="py-4 px-4">4,12 % à 5,36 %</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-4 px-4 font-semibold">Garantie capital</td>
                    <td className="py-4 px-4">✅ Oui</td>
                    <td className="py-4 px-4">❌ Non</td>
                    <td className="py-4 px-4">❌ Non</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-4 px-4 font-semibold">Liquidité</td>
                    <td className="py-4 px-4">✅ Immédiate</td>
                    <td className="py-4 px-4">⚠️ Différée</td>
                    <td className="py-4 px-4">⚠️ Différée</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-4 px-4 font-semibold">Fiscalité</td>
                    <td className="py-4 px-4">17,2 % minimum</td>
                    <td className="py-4 px-4">28 % à 47 %</td>
                    <td className="py-4 px-4">0 % puis 24,7 %</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-semibold">Transmission</td>
                    <td className="py-4 px-4">Classique</td>
                    <td className="py-4 px-4">Classique</td>
                    <td className="py-4 px-4">✅ Avantageuse</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Strategy Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Quelle stratégie adopter selon votre profil ?
          </h2>

          <div className="space-y-6">
            {/* Profil Prudent */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
              <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-200 mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6" />
                Profil prudent (aversion au risque forte)
              </h3>
              <p className="text-blue-800 dark:text-blue-300 mb-4 font-semibold">
                Recommandation : conservez la majorité de votre capital sur le fonds euros (70 à 80 %) et testez les SCPI avec une allocation modeste (20 à 30 %) au sein de votre assurance-vie.
              </p>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
                <h4 className="font-bold text-gray-900 dark:text-white mb-3">Exemple sur 100 000 € d'épargne</h4>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• 70 000 € en fonds euros → 1 162 € nets/an</li>
                  <li>• 30 000 € en SCPI (5 %) → 1 500 € bruts/an (exonérés d'impôt)</li>
                  <li className="font-bold text-blue-600 dark:text-blue-400">• Total : 2 662 € nets/an, soit 2,66 % de rendement global</li>
                </ul>
              </div>
            </div>

            {/* Profil Équilibré */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-8 border border-green-200 dark:border-green-800">
              <h3 className="text-2xl font-bold text-green-900 dark:text-green-200 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Profil équilibré (acceptation d'un risque modéré)
              </h3>
              <p className="text-green-800 dark:text-green-300 mb-4 font-semibold">
                Recommandation : répartissez votre épargne entre fonds euros (40 à 50 %) et SCPI en assurance-vie (50 à 60 %).
              </p>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
                <h4 className="font-bold text-gray-900 dark:text-white mb-3">Exemple sur 100 000 € d'épargne</h4>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• 40 000 € en fonds euros → 664 € nets/an</li>
                  <li>• 60 000 € en SCPI (5 %) → 3 000 € bruts/an</li>
                  <li className="font-bold text-green-600 dark:text-green-400">• Total : 3 664 € nets/an, soit 3,66 % de rendement global</li>
                </ul>
              </div>
            </div>

            {/* Profil Dynamique */}
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-8 border border-orange-200 dark:border-orange-800">
              <h3 className="text-2xl font-bold text-orange-900 dark:text-orange-200 mb-4 flex items-center gap-2">
                <Building className="w-6 h-6" />
                Profil dynamique (recherche de performance)
              </h3>
              <p className="text-orange-800 dark:text-orange-300 mb-4 font-semibold">
                Recommandation : privilégiez les SCPI en assurance-vie (70 à 80 %) avec une poche de sécurité en fonds euros (20 à 30 %).
              </p>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
                <h4 className="font-bold text-gray-900 dark:text-white mb-3">Exemple sur 100 000 € d'épargne</h4>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• 20 000 € en fonds euros → 332 € nets/an</li>
                  <li>• 80 000 € en SCPI européennes (6,5 %) → 5 200 € bruts/an</li>
                  <li className="font-bold text-orange-600 dark:text-orange-400">• Total : 5 532 € nets/an, soit 5,53 % de rendement global</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Points de vigilance */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            Les points de vigilance avant d'investir en SCPI
          </h2>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Le risque de perte en capital</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Contrairement au fonds euros, <strong>la valeur de vos parts de SCPI peut baisser</strong>. Une crise immobilière, une hausse de la vacance locative ou une dégradation du marché peuvent impacter négativement votre investissement. Ne placez en SCPI que l'argent dont vous n'avez pas besoin à court terme.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">La liquidité limitée</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Les SCPI ne se revendent pas instantanément comme un fonds euros. Le délai moyen de cession varie entre quelques semaines et plusieurs mois selon la société de gestion et les conditions de marché. Prévoyez une durée de détention minimale de 8 à 10 ans.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Les frais d'acquisition</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Les SCPI en direct comportent des frais d'entrée de 8 à 12 % en moyenne. En assurance-vie, ces frais sont généralement réduits, voire inexistants selon les contrats. Comparez attentivement avant d'investir.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">La diversification indispensable</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Ne concentrez jamais votre patrimoine sur une seule SCPI. Diversifiez entre plusieurs sociétés de gestion, secteurs d'activité (bureaux, commerces, santé, logistique) et zones géographiques (France, Europe) pour réduire les risques.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Verdict */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Fonds euros ou SCPI : le verdict pour 2025
          </h2>

          <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-bold text-blue-900 dark:text-blue-200 mb-4">Le fonds euros reste pertinent si :</h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400">✓</span>
                    <span>Vous recherchez une sécurité absolue du capital</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400">✓</span>
                    <span>Vous avez besoin d'une liquidité immédiate</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400">✓</span>
                    <span>Votre horizon de placement est court (moins de 5 ans)</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold text-green-900 dark:text-green-200 mb-4">Les SCPI deviennent intéressantes si :</h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    <span>Vous acceptez un risque modéré pour améliorer votre rendement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    <span>Votre horizon de placement est long (8 ans et plus)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    <span>Vous souhaitez diversifier votre patrimoine immobilier</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    <span>Vous êtes imposé dans une tranche marginale élevée (TMI 30 % et plus)</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-orange-500">
              <p className="text-lg text-gray-800 dark:text-gray-200 font-semibold text-center">
                <span className="text-orange-600 dark:text-orange-400">💡 Notre recommandation :</span> L'assurance-vie avec SCPI représente le meilleur compromis : elle combine la souplesse fiscale de l'enveloppe (abattement après 8 ans, transmission optimisée) avec le potentiel de rendement des SCPI, tout en vous permettant de conserver une poche de sécurité en fonds euros.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-6 text-center">
              Passez à l'action : simulez votre stratégie patrimoniale
            </h2>
            <p className="text-lg text-center mb-8 text-blue-100">
              Vous hésitez encore entre fonds euros et SCPI ? Vous souhaitez calculer précisément le gain fiscal et patrimonial d'une diversification adaptée à votre situation ?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => onSimulateurClick('enveloppes')}
                className="bg-white text-blue-600 rounded-xl p-6 hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl group"
              >
                <Calculator className="w-12 h-12 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold mb-2">Simulez votre transfert "Fonds euros → SCPI"</h3>
                <p className="text-gray-700 mb-4">
                  Visualisez l'impact d'une allocation mixte sur votre rendement net, votre fiscalité et votre patrimoine à 10 ans.
                </p>
                <div className="flex items-center justify-center gap-2 text-blue-600 font-semibold">
                  Accéder au simulateur
                  <ArrowRight className="w-5 h-5" />
                </div>
              </button>

              <button
                onClick={onContactClick}
                className="bg-white text-blue-600 rounded-xl p-6 hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl group"
              >
                <Calendar className="w-12 h-12 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold mb-2">Échangez avec un CGP</h3>
                <p className="text-gray-700 mb-4">
                  Bénéficiez d'un entretien gratuit de 30 minutes en visio avec un conseiller spécialisé en SCPI.
                </p>
                <div className="flex items-center justify-center gap-2 text-blue-600 font-semibold">
                  Prendre rendez-vous (30 min)
                  <ArrowRight className="w-5 h-5" />
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 border border-gray-300 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            <strong>Important :</strong> Les SCPI sont des placements à long terme dont le capital n'est pas garanti. Les performances passées ne préjugent pas des performances futures. Les informations présentées dans cet article sont fournies à titre pédagogique et ne constituent pas un conseil en investissement personnalisé. Consultez un professionnel pour une recommandation adaptée à votre situation.
          </p>
        </div>
      </article>

      <Footer />
      <CookieConsent />
    </div>
  );
};

export default FondsEurosScpiArticle;
