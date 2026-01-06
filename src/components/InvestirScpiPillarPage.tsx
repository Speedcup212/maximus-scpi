import React from 'react';
import { TrendingUp, Shield, Target, Coins, ArrowRight, BookOpen } from 'lucide-react';
import SchemaOrg, { generateBreadcrumbs } from './SchemaOrg';
import Breadcrumb from './Breadcrumb';

interface InvestirScpiPillarPageProps {
  onNavigate?: (path: string) => void;
}

const InvestirScpiPillarPage: React.FC<InvestirScpiPillarPageProps> = ({ onNavigate }) => {
  const breadcrumbs = generateBreadcrumbs('/investir-en-scpi');
  const currentDate = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

  const relatedArticles = [
    { title: "Premier Investissement SCPI : Guide Débutant", url: "/education/premier-investissement-scpi-debutant-guide" },
    { title: "Investir en SCPI Jeune Actif (25-35 ans)", url: "/education/investir-scpi-jeune-actif-25-35-ans" },
    { title: "SCPI ou Immobilier Locatif : Comparatif 20 ans", url: "/education/scpi-ou-immobilier-locatif-comparatif-20-ans" },
    { title: "Achat SCPI à Crédit : Effet Levier", url: "/education/achat-scpi-credit-effet-levier-fiscalite" },
    { title: "Diversification SCPI : Combien de Parts ?", url: "/education/diversification-scpi-combien-nombre-parts" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <SchemaOrg type="BreadcrumbList" data={{ items: breadcrumbs }} />
      <SchemaOrg
        type="Article"
        data={{
          title: "Investir en SCPI 2025 : Guide Complet | MaximusSCPI",
          description: "Guide complet pour investir en SCPI : 51 SCPI analysées, profils investisseurs, montants, enveloppes fiscales. Conseils expert ORIAS.",
          datePublished: "2025-01-15",
          dateModified: currentDate,
          url: "/investir-en-scpi"
        }}
      />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          📅 Dernière mise à jour : {currentDate}
        </div>

        <Breadcrumb items={breadcrumbs} onNavigate={onNavigate} />

        <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <header className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <TrendingUp className="w-12 h-12 text-blue-600" />
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                  Investir en SCPI en 2025
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mt-2">
                  Guide Complet pour Débutants et Investisseurs Confirmés
                </p>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-l-4 border-blue-600">
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                <strong>Investir en SCPI permet d'accéder à l'immobilier professionnel sans gestion locative</strong>, avec des rendements moyens de 4,5% à 6,5% (TDVM 2024). Ce guide complet analyse <strong>51 SCPI</strong>, les profils investisseurs adaptés, les montants recommandés, et les stratégies d'optimisation fiscale.
              </p>
            </div>
          </header>

          <nav className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-12">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Sommaire</h2>
            <ol className="space-y-2 text-sm">
              <li><a href="#pourquoi" className="text-blue-600 hover:underline">1. Pourquoi Investir en SCPI ?</a></li>
              <li><a href="#profils" className="text-blue-600 hover:underline">2. Profils Investisseurs Adaptés</a></li>
              <li><a href="#montants" className="text-blue-600 hover:underline">3. Montants d'Investissement Recommandés</a></li>
              <li><a href="#enveloppes" className="text-blue-600 hover:underline">4. Enveloppes Fiscales (Direct, AV, PER)</a></li>
              <li><a href="#strategies" className="text-blue-600 hover:underline">5. Stratégies d'Investissement</a></li>
              <li><a href="#selection" className="text-blue-600 hover:underline">6. Comment Sélectionner les Bonnes SCPI ?</a></li>
            </ol>
          </nav>

          <section id="pourquoi" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Target className="w-8 h-8 text-blue-600" />
              1. Pourquoi Investir en SCPI ?
            </h2>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Les 5 Avantages Clés</h3>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">✅ Rendement Attractif</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>TDVM moyen 2024 : 5,2%</strong> net de frais de gestion. Top 10 SCPI : 6% à 7%. Meilleur que fonds euros (2,5%), proche immobilier locatif (5-7%) sans gestion.
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">✅ Sans Gestion Locative</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Zéro gestion</strong> : pas de travaux, pas de locataires, pas de charges. La société de gestion s'occupe de tout. Idéal pour investisseurs passifs.
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">✅ Diversification Immobilière</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Patrimoine mutualisé</strong> : 50 à 200 immeubles par SCPI. Bureaux, commerces, logistique, santé. Paris, régions, Europe. Risque dilué vs 1 appartement.
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl p-6">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">✅ Accessibilité (dès 200€)</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Ticket d'entrée bas</strong> : 1 part = 200€ à 1000€ selon SCPI. Achat crédit possible. Accessible jeunes actifs, petits patrimoines.
                </p>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">SCPI vs Autres Placements</h3>

            <div className="overflow-x-auto mb-8">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left">Placement</th>
                    <th className="px-4 py-3 text-center">Rendement</th>
                    <th className="px-4 py-3 text-center">Liquidité</th>
                    <th className="px-4 py-3 text-center">Gestion</th>
                    <th className="px-4 py-3 text-center">Ticket Min</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="px-4 py-3 font-semibold">SCPI</td>
                    <td className="px-4 py-3 text-center text-green-600 font-bold">5,2%</td>
                    <td className="px-4 py-3 text-center text-orange-600">6-24 mois</td>
                    <td className="px-4 py-3 text-center text-green-600">Aucune</td>
                    <td className="px-4 py-3 text-center">200€</td>
                  </tr>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <td className="px-4 py-3">Livret A</td>
                    <td className="px-4 py-3 text-center">3,0%</td>
                    <td className="px-4 py-3 text-center text-green-600">Immédiate</td>
                    <td className="px-4 py-3 text-center text-green-600">Aucune</td>
                    <td className="px-4 py-3 text-center">0€</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Fonds Euros</td>
                    <td className="px-4 py-3 text-center">2,5%</td>
                    <td className="px-4 py-3 text-center text-orange-600">2 mois</td>
                    <td className="px-4 py-3 text-center text-green-600">Aucune</td>
                    <td className="px-4 py-3 text-center">1 000€</td>
                  </tr>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <td className="px-4 py-3">Immobilier Locatif</td>
                    <td className="px-4 py-3 text-center text-green-600">5-7%</td>
                    <td className="px-4 py-3 text-center text-red-600">1-2 ans</td>
                    <td className="px-4 py-3 text-center text-red-600">Importante</td>
                    <td className="px-4 py-3 text-center">50 000€</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="profils" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              2. Profils Investisseurs Adaptés
            </h2>

            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-l-4 border-blue-600">
                <h3 className="text-xl font-bold text-blue-900 dark:text-blue-200 mb-3">👤 Profil 1 : Jeune Actif (25-35 ans)</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  <strong>Situation :</strong> Début carrière, épargne mensuelle 200-500€, TMI 11-30%, horizon 20+ ans
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  <strong>Stratégie :</strong> SCPI Assurance-Vie (PFU 30% après 8 ans) ou achat crédit (effet levier). Privilégier SCPI croissance (valorisation capital).
                </p>
                <a href="/education/investir-scpi-jeune-actif-25-35-ans" className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1">
                  Lire le guide complet <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border-l-4 border-green-600">
                <h3 className="text-xl font-bold text-green-900 dark:text-green-200 mb-3">👤 Profil 2 : Actif TMI 30-41% (40-55 ans)</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  <strong>Situation :</strong> Patrimoine 200-500k€, TMI 30-41%, recherche revenus complémentaires
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  <strong>Stratégie :</strong> SCPI AV (PFU 30%) ou PER (déduction IR). Éviter SCPI direct (taxation 47-58%). Privilégier SCPI rendement (6%+).
                </p>
                <a href="/education/scpi-tmi-30-pourcent-arbitrage-av-direct" className="text-sm text-green-600 hover:underline inline-flex items-center gap-1">
                  TMI 30% : Optimisation fiscale <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 border-l-4 border-purple-600">
                <h3 className="text-xl font-bold text-purple-900 dark:text-purple-200 mb-3">👤 Profil 3 : Préparation Retraite (50-65 ans)</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  <strong>Situation :</strong> Patrimoine 500k-1M€, retraite dans 5-15 ans, TMI 30-41%
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  <strong>Stratégie :</strong> PER SCPI (déduction fiscale immédiate). Démembrement nue-propriété (0€ IR pendant 10-20 ans, puis pleine propriété).
                </p>
                <a href="/education/per-scpi-retraite-deduction-fiscale" className="text-sm text-purple-600 hover:underline inline-flex items-center gap-1">
                  PER SCPI : Guide retraite <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </section>

          <section id="montants" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Coins className="w-8 h-8 text-blue-600" />
              3. Montants d'Investissement Recommandés
            </h2>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 mb-6 border-l-4 border-yellow-600">
              <p className="text-sm text-gray-800 dark:text-gray-200">
                <strong>⚠️ Règle d'or :</strong> Maximum <strong>20-30% du patrimoine</strong> en SCPI. Toujours conserver épargne de sécurité (6 mois charges) + autres placements liquides.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-700/50 rounded-xl p-6 border-l-4 border-blue-600">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">💰 Petit Budget (5 000 - 20 000€)</h3>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                  <li>• <strong>Stratégie :</strong> 1-2 SCPI max (frais souscription minimisés)</li>
                  <li>• <strong>Privilégier :</strong> SCPI 0% frais (Alderan, Iroko Zen) en AV</li>
                  <li>• <strong>Rendement net attendu :</strong> 4,5-5,5% après frais</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-700/50 rounded-xl p-6 border-l-4 border-green-600">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">💰 Budget Moyen (50 000 - 100 000€)</h3>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                  <li>• <strong>Stratégie :</strong> Diversification 3-4 SCPI (secteurs + gestionnaires différents)</li>
                  <li>• <strong>Répartition type :</strong> 40% bureaux, 30% commerces, 20% logistique, 10% santé</li>
                  <li>• <strong>Enveloppe :</strong> AV (TMI 30%+) ou Direct (TMI 11%)</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-700/50 rounded-xl p-6 border-l-4 border-purple-600">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">💰 Gros Budget (200 000€+)</h3>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                  <li>• <strong>Stratégie :</strong> Portefeuille 5-7 SCPI + Démembrement nue-propriété</li>
                  <li>• <strong>Objectif :</strong> Revenus 10-12k€/an + Optimisation IFI</li>
                  <li>• <strong>Enveloppe :</strong> Mix AV + Direct + PER selon TMI</li>
                </ul>
                <a href="/education/investir-200000-euros-scpi-portefeuille-diversifie" className="text-sm text-purple-600 hover:underline inline-flex items-center gap-1 mt-3">
                  Exemple portefeuille 200k€ <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </section>

          <section id="articles" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <BookOpen className="w-7 h-7 text-blue-600" />
              Articles Connexes
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {relatedArticles.map((article, index) => (
                <a
                  key={index}
                  href={article.url}
                  className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
                >
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 mb-2">
                    {article.title}
                  </h3>
                  <span className="text-xs text-blue-600 inline-flex items-center gap-1">
                    Lire l'article <ArrowRight className="w-3 h-3" />
                  </span>
                </a>
              ))}
            </div>
          </section>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-l-4 border-blue-600">
            <p className="text-sm text-gray-800 dark:text-gray-200">
              <strong>💡 Besoin d'aide ?</strong> Consultez notre <a href="/comparateur-scpi" className="text-blue-600 hover:underline">comparateur de 51 SCPI</a> ou <a href="https://calendly.com/maximusscpi" className="text-blue-600 hover:underline">prenez rendez-vous</a> avec notre conseiller CIF.
            </p>
          </div>
        </article>
      </div>
    </div>
  );
};

export default InvestirScpiPillarPage;
