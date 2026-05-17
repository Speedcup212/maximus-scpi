import React from 'react';
import { AlertTriangle, BookOpen, ArrowRight, Globe, TrendingUp, Shield, Info } from 'lucide-react';
import SchemaOrg, { generateBreadcrumbs } from './SchemaOrg';
import Breadcrumb from './Breadcrumb';

interface FiscaliteScpiPageProps {
  onNavigate?: (path: string) => void;
  onRdvClick?: () => void;
  onComparateurClick?: () => void;
}

const FiscaliteScpiPage: React.FC<FiscaliteScpiPageProps> = ({ onNavigate, onRdvClick, onComparateurClick }) => {
  const breadcrumbs = generateBreadcrumbs('/fiscalite-scpi');
  const currentDate = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const isoDate = new Date().toISOString().split('T')[0];

  const handleRdvClick = () => { if (onRdvClick) onRdvClick(); };
  const handleComparateurClick = () => {
    if (onComparateurClick) { onComparateurClick(); }
    else if (onNavigate) { onNavigate('/comparateur-scpi'); }
  };

  const btnPrimaryClass = "inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors";
  const btnSecondaryClass = "inline-flex items-center gap-2 bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors";

  const relatedArticles = [
    { title: "Comment investir en SCPI : Guide complet", url: "/investir-en-scpi" },
    { title: "Types de SCPI : Découvrir les différentes catégories", url: "/education/premier-investissement-scpi-debutant-guide" },
    { title: "SCPI en assurance-vie : fiscalité et avantages", url: "/education/scpi-en-direct-ou-assurance-vie" },
    { title: "Avantages des SCPI pour l'investisseur", url: "/education/investir-scpi-jeune-actif-25-35-ans" },
    { title: "Démembrement de propriété SCPI", url: "/education/demembrement-scpi-nue-propriete-usufruit" },
    { title: "SCPI et PER : déduction fiscale à la retraite", url: "/education/per-scpi-retraite-deduction-fiscale" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <SchemaOrg type="BreadcrumbList" data={{ items: breadcrumbs }} />
      <SchemaOrg
        type="FAQPage"
        data={{
          questions: [
            {
              question: "Comment sont imposés les revenus d'une SCPI ?",
              answer: "Les revenus distribués par une SCPI relèvent généralement des revenus fonciers, soumis à l'impôt sur le revenu selon la tranche marginale d'imposition (TMI) du contribuable, auxquels s'ajoutent les prélèvements sociaux au taux de 17,2 % (taux en vigueur, susceptible d'évolution). Le traitement fiscal varie selon le mode de détention (direct, assurance-vie, PER, SCI). Ces informations sont de nature pédagogique et ne constituent pas un conseil fiscal personnalisé."
            },
            {
              question: "Quel est le taux des prélèvements sociaux sur les revenus de SCPI ?",
              answer: "Les prélèvements sociaux s'élèvent à 17,2 % sur les revenus fonciers issus de SCPI (taux global en vigueur en France, composé de la CSG à 9,2 %, de la CRDS à 0,5 % et du prélèvement de solidarité à 7,5 %). Ce taux s'applique en sus de l'impôt sur le revenu selon la TMI. La CSG est partiellement déductible (6,8 %) au régime réel l'année suivante. Ce taux est susceptible d'évoluer selon la législation fiscale."
            },
            {
              question: "Les SCPI européennes sont-elles moins imposées en France ?",
              answer: "Les revenus de SCPI investissant dans des pays avec lesquels la France a signé une convention fiscale bilatérale peuvent bénéficier d'une imposition réduite en France, via la méthode du taux effectif ou un crédit d'impôt. Cela ne signifie pas une exonération totale : les revenus sont imposés localement et peuvent rester soumis aux prélèvements sociaux. Vérifiez la notice fiscale de chaque SCPI et consultez un professionnel habilité pour votre situation."
            },
            {
              question: "Peut-on réduire la fiscalité de ses revenus SCPI ?",
              answer: "Certains modes de détention peuvent modifier la fiscalité applicable selon votre situation personnelle : l'assurance-vie permet de différer l'imposition, le PER offre une déductibilité à l'entrée selon certaines conditions, le démembrement temporaire supprime les revenus imposables pendant la période de nue-propriété, et la SCI à l'IS soumet les revenus au taux de l'IS. Ces dispositifs comportent chacun des avantages et des risques spécifiques. Ces informations ne constituent pas un conseil personnalisé."
            },
            {
              question: "Quels sont les risques fiscaux d'un investissement en SCPI ?",
              answer: "La fiscalité française est susceptible d'évoluer chaque année (loi de finances, conventions bilatérales, taux de prélèvements sociaux). Le taux de distribution affiché par une SCPI est brut de fiscalité : le rendement net après impôts dépend de votre TMI et peut être significativement inférieur. Par ailleurs, investir en SCPI comporte des risques de perte en capital, de revenus non garantis et de liquidité limitée, indépendamment de la fiscalité."
            }
          ]
        }}
      />
      <SchemaOrg
        type="Article"
        data={{
          title: "Fiscalité SCPI : Impôt sur les revenus fonciers et optimisation",
          description: "Découvrez comment sont imposés les revenus de vos SCPI. Comprenez l'impôt sur le revenu, les prélèvements sociaux et les dispositifs d'optimisation fiscale.",
          datePublished: "2026-01-01",
          dateModified: isoDate,
          url: "/fiscalite-scpi"
        }}
      />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          📅 Dernière mise à jour : {currentDate}
        </div>

        <Breadcrumb items={breadcrumbs} onNavigate={onNavigate} />

        {/* Avertissement CIF en tête de page */}
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 mb-6 border-l-4 border-amber-500 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Information générale uniquement.</strong> Les informations fiscales présentées sont d'ordre général et ne constituent pas un conseil personnalisé. La fiscalité dépend de votre situation individuelle. Consultez un professionnel habilité pour une analyse adaptée à votre patrimoine. Investir en SCPI comporte des risques : perte en capital, revenus non garantis, liquidité limitée.
          </p>
        </div>

        <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <header className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <TrendingUp className="w-12 h-12 text-blue-600" />
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                  Fiscalité des SCPI : comprendre l'imposition de vos revenus fonciers
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mt-2">
                  Comprendre et anticiper l'imposition de vos revenus fonciers
                </p>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-l-4 border-blue-600">
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                Les revenus des SCPI sont soumis à l'impôt sur le revenu et aux prélèvements sociaux, comme tout revenu foncier. <strong>Comprendre leur fiscalité est essentiel pour estimer le rendement net</strong> selon votre tranche marginale d'imposition (TMI) et adapter votre stratégie d'investissement. La fiscalité applicable varie selon l'enveloppe choisie (investissement direct, assurance-vie, PER) et la nature des revenus distribués.
              </p>
            </div>
          </header>

          {/* CTA intro */}
          <aside
            aria-label="Vous détenez ou envisagez des SCPI ?"
            className="mb-8 rounded-xl border border-blue-200 dark:border-blue-700/40 border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/60 p-6 md:p-8"
          >
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                  Point de départ
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white md:text-2xl">
                  Vous détenez ou envisagez des SCPI ?
                </p>
                <p className="max-w-2xl text-sm leading-relaxed text-gray-700 dark:text-gray-300 md:text-base">
                  Estimez l'impact de votre TMI et de votre mode de détention (direct, assurance-vie, PER)
                  sur le rendement net de vos distributions.{' '}
                  <span className="text-gray-500 dark:text-gray-400">Données historiques, non garanties.</span>
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  onClick={handleRdvClick}
                  className={`${btnPrimaryClass} w-full sm:w-auto`}
                >
                  Analyser ma fiscalité SCPI
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={handleComparateurClick}
                  className={`${btnSecondaryClass} w-full sm:w-auto`}
                >
                  Comparer les SCPI
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>
          </aside>

          {/* Sommaire */}
          <nav className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-12">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Sommaire</h2>
            <ol className="space-y-2 text-sm">
              <li><a href="#revenus-fonciers" className="text-blue-600 hover:underline">1. Comprendre l'imposition des revenus fonciers issus de SCPI</a></li>
              <li><a href="#prelevements-sociaux" className="text-blue-600 hover:underline">2. Les prélèvements sociaux sur les revenus de SCPI</a></li>
              <li><a href="#scpi-europeennes" className="text-blue-600 hover:underline">3. Fiscalité des SCPI européennes et internationales</a></li>
              <li><a href="#optimisation" className="text-blue-600 hover:underline">4. Optimiser la fiscalité de son investissement SCPI</a></li>
              <li><a href="#vigilance" className="text-blue-600 hover:underline">5. Points de vigilance et risques liés à la fiscalité</a></li>
            </ol>
          </nav>

          {/* Section 1 : Revenus fonciers */}
          <section id="revenus-fonciers" className="mb-12 scroll-mt-28">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Info className="w-8 h-8 text-blue-600" />
              1. Comprendre l'imposition des revenus fonciers issus de SCPI
            </h2>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Nature des revenus : revenus fonciers ou revenus BIC</h3>

            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              Les revenus distribués par une SCPI relèvent le plus souvent de la catégorie des <strong>revenus fonciers</strong> au sens du Code général des impôts, dès lors que la SCPI détient des immeubles loués nus. Si la SCPI perçoit des loyers de locaux meublés ou d'activités commerciales (hôtels, résidences gérées…), une partie des revenus peut relever des <strong>bénéfices industriels et commerciaux (BIC)</strong>. Le bulletin trimestriel de chaque SCPI précise la nature des revenus distribués.
            </p>

            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 mb-6 border border-gray-200 dark:border-gray-600">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <strong>Source des données :</strong> Les distributions et leur nature fiscale sont issues des documents réglementaires de chaque SCPI (DIC, note d'information, bulletin trimestriel, rapport annuel). MaximusSCPI ne procède à aucune extrapolation.
              </p>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Le régime micro-foncier : conditions et limites</h3>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-6 border-l-4 border-blue-600">
              <p className="text-gray-800 dark:text-gray-200 mb-3">
                Le régime <strong>micro-foncier</strong> s'applique si vos revenus fonciers bruts annuels (SCPI + revenus fonciers directs) ne dépassent pas <strong>15 000 €</strong> et si vous ne détenez pas de biens soumis à certains régimes spéciaux (Malraux, monuments historiques…).
              </p>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                <li>• Un abattement forfaitaire de <strong>30 %</strong> est appliqué automatiquement sur les revenus bruts.</li>
                <li>• Le revenu net imposable (70 % des revenus bruts) est ajouté à vos autres revenus et soumis à votre TMI.</li>
                <li>• <strong>Avantage :</strong> simplicité de déclaration. <strong>Limite :</strong> si vos charges réelles dépassent 30 %, le régime réel peut être plus avantageux.</li>
              </ul>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Le régime réel : déduction des charges et calcul du bénéfice imposable</h3>

            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              Le régime réel permet de déduire les charges réelles : intérêts d'emprunt (si achat à crédit), frais de gestion, travaux… Si le résultat est négatif (déficit foncier), il peut être imputé sur le revenu global dans la limite de <strong>10 700 € par an</strong> (hors intérêts d'emprunt). L'excédent de déficit est reportable sur les revenus fonciers des 10 années suivantes.
            </p>

            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left border border-gray-200 dark:border-gray-600">Régime</th>
                    <th className="px-4 py-3 text-center border border-gray-200 dark:border-gray-600">Condition</th>
                    <th className="px-4 py-3 text-center border border-gray-200 dark:border-gray-600">Calcul du revenu net</th>
                    <th className="px-4 py-3 text-center border border-gray-200 dark:border-gray-600">Intérêt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="px-4 py-3 font-semibold border border-gray-200 dark:border-gray-600">Micro-foncier</td>
                    <td className="px-4 py-3 text-center border border-gray-200 dark:border-gray-600">Revenus bruts ≤ 15 000 €</td>
                    <td className="px-4 py-3 text-center border border-gray-200 dark:border-gray-600">Abattement 30 % forfaitaire</td>
                    <td className="px-4 py-3 text-center border border-gray-200 dark:border-gray-600">Simplicité</td>
                  </tr>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <td className="px-4 py-3 font-semibold border border-gray-200 dark:border-gray-600">Réel</td>
                    <td className="px-4 py-3 text-center border border-gray-200 dark:border-gray-600">Tous cas (obligatoire &gt; 15 000 €)</td>
                    <td className="px-4 py-3 text-center border border-gray-200 dark:border-gray-600">Revenus bruts − charges réelles</td>
                    <td className="px-4 py-3 text-center border border-gray-200 dark:border-gray-600">Déduction des charges, déficit foncier</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border-l-4 border-amber-500">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>⚠️ Information générale :</strong> Le choix du régime dépend de votre situation personnelle et de vos autres revenus. Ces informations ne valent pas conseil fiscal personnalisé.
              </p>
            </div>
          </section>

          {/* Section 2 : Prélèvements sociaux */}
          <section id="prelevements-sociaux" className="mb-12 scroll-mt-28">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              2. Les prélèvements sociaux sur les revenus de SCPI
            </h2>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">CSG, CRDS et autres contributions</h3>

            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              En plus de l'impôt sur le revenu, les revenus fonciers de SCPI sont soumis aux <strong>prélèvements sociaux au taux global de 17,2 %</strong> (taux en vigueur en 2025, susceptible d'évoluer). Ces prélèvements se décomposent comme suit :
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">Contribution sociale généralisée (CSG)</h4>
                <p className="text-2xl font-bold text-blue-600 mb-1">9,2 %</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Dont 6,8 % déductibles du revenu imposable l'année suivante (régime réel)</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">Autres contributions</h4>
                <p className="text-2xl font-bold text-blue-600 mb-1">8,0 %</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">CRDS (0,5 %), prélèvement de solidarité (7,5 %)</p>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Impact sur le taux global d'imposition</h3>

            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              Le taux d'imposition global sur les revenus fonciers de SCPI est la somme du TMI + 17,2 % de prélèvements sociaux. À titre d'illustration (données générales, hors charges déductibles) :
            </p>

            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left border border-gray-200 dark:border-gray-600">TMI</th>
                    <th className="px-4 py-3 text-center border border-gray-200 dark:border-gray-600">IR</th>
                    <th className="px-4 py-3 text-center border border-gray-200 dark:border-gray-600">Prélèvements sociaux</th>
                    <th className="px-4 py-3 text-center border border-gray-200 dark:border-gray-600">Taux global indicatif</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="px-4 py-3 border border-gray-200 dark:border-gray-600">11 %</td>
                    <td className="px-4 py-3 text-center border border-gray-200 dark:border-gray-600">11 %</td>
                    <td className="px-4 py-3 text-center border border-gray-200 dark:border-gray-600">17,2 %</td>
                    <td className="px-4 py-3 text-center font-semibold text-orange-600 border border-gray-200 dark:border-gray-600">≈ 28,2 %</td>
                  </tr>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <td className="px-4 py-3 border border-gray-200 dark:border-gray-600">30 %</td>
                    <td className="px-4 py-3 text-center border border-gray-200 dark:border-gray-600">30 %</td>
                    <td className="px-4 py-3 text-center border border-gray-200 dark:border-gray-600">17,2 %</td>
                    <td className="px-4 py-3 text-center font-semibold text-red-600 border border-gray-200 dark:border-gray-600">≈ 47,2 %</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 border border-gray-200 dark:border-gray-600">41 %</td>
                    <td className="px-4 py-3 text-center border border-gray-200 dark:border-gray-600">41 %</td>
                    <td className="px-4 py-3 text-center border border-gray-200 dark:border-gray-600">17,2 %</td>
                    <td className="px-4 py-3 text-center font-semibold text-red-700 border border-gray-200 dark:border-gray-600">≈ 58,2 %</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border-l-4 border-amber-500">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>⚠️ Ces chiffres sont indicatifs</strong> et ne tiennent pas compte de la déductibilité partielle de la CSG ni des charges déductibles. Le taux effectif réel dépend de votre situation personnelle. Ces informations ne constituent pas un conseil fiscal. La législation fiscale est susceptible d'évoluer.
              </p>
            </div>
          </section>

          {/* CTA intermédiaire 1 — après prélèvements sociaux */}
          <div className="mb-12 rounded-xl border border-blue-200 dark:border-blue-700/40 border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/60 p-5 md:p-6">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Votre rendement net dépend de votre tranche d'imposition.
            </p>
            <button
              type="button"
              onClick={handleRdvClick}
              className={`${btnPrimaryClass} w-full sm:w-auto`}
            >
              Analyser ma fiscalité SCPI
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>

          {/* Section 3 : SCPI européennes */}
          <section id="scpi-europeennes" className="mb-12 scroll-mt-28">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Globe className="w-8 h-8 text-blue-600" />
              3. Fiscalité des SCPI européennes et internationales
            </h2>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Conventions fiscales et évitement de la double imposition</h3>

            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              Les SCPI qui investissent en dehors de France (Allemagne, Pays-Bas, Espagne, Irlande…) bénéficient souvent d'une fiscalité plus douce pour les investisseurs français grâce aux <strong>conventions fiscales bilatérales</strong>. Dans la plupart des cas, les revenus immobiliers de source européenne sont exonérés d'impôt en France mais pris en compte pour le calcul du <strong>taux effectif</strong> (méthode du taux effectif ou crédit d'impôt selon les conventions).
            </p>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 mb-6 border-l-4 border-green-600">
              <h4 className="font-bold text-green-900 dark:text-green-200 mb-3">Exemple d'application (illustratif)</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Une SCPI détenant des immeubles en Allemagne distribue des revenus de source allemande. Ces revenus sont imposés en Allemagne (taux local) et généralement exonérés d'IR en France via la convention franco-allemande. Les prélèvements sociaux (17,2 %) peuvent néanmoins s'appliquer selon les cas. <strong>Vérifiez la notice fiscale de chaque SCPI.</strong>
              </p>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Déclaration des revenus étrangers</h3>

            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              Les associés de SCPI détenant des immeubles à l'étranger doivent déclarer les revenus de source étrangère sur leur déclaration de revenus française, en utilisant les formulaires adéquats (2047 et 2044 selon les cas). La SCPI fournit chaque année un <strong>récapitulatif fiscal</strong> à ses associés, précisant la nature, la source et le montant des revenus distribués.
            </p>

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border-l-4 border-amber-500">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>⚠️ Information générale :</strong> La fiscalité internationale des SCPI est complexe et varie selon chaque convention. Un conseiller fiscal ou un professionnel habilité peut vous accompagner dans vos déclarations.
              </p>
            </div>
          </section>

          {/* Section 4 : Optimisation */}
          <section id="optimisation" className="mb-12 scroll-mt-28">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              4. Optimiser la fiscalité de son investissement SCPI
            </h2>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6 border-l-4 border-blue-600">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Rappel CIF :</strong> Les dispositifs ci-dessous sont présentés à titre pédagogique. L'optimisation fiscale dépend de votre situation individuelle (revenus, TMI, patrimoine, horizon de placement). Elle ne constitue pas une garantie de réduction d'impôt. Consultez un conseiller habilité avant toute décision.
              </p>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Investir via l'assurance-vie</h3>

            <div className="bg-white dark:bg-gray-700/50 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-600">
              <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                En logeant des parts de SCPI dans un contrat d'assurance-vie (via des unités de compte), les revenus ne sont pas soumis à l'IR chaque année mais capitalisent au sein du contrat. La fiscalité s'applique uniquement au moment des <strong>rachats</strong>, avec une fiscalité allégée après 8 ans (abattements, PFU de 7,5 % au-delà des abattements pour les contrats de plus de 8 ans).
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Toutes les SCPI ne sont pas disponibles en assurance-vie. Les frais d'unité de compte et les frais de gestion du contrat impactent le rendement net. <a href="/education/scpi-en-direct-ou-assurance-vie" className="text-blue-600 hover:underline inline-flex items-center gap-1">Comparer SCPI directe vs assurance-vie <ArrowRight className="w-3 h-3" /></a>
              </p>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Investir via une Société Civile Immobilière (SCI)</h3>

            <div className="bg-white dark:bg-gray-700/50 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-600">
              <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                Une SCI soumise à l'impôt sur les sociétés (IS) peut acquérir des parts de SCPI. Les revenus sont alors imposés au taux de l'IS (15 % jusqu'à 42 500 € de bénéfices, puis 25 %) plutôt qu'au barème de l'IR. Cette option peut être avantageuse pour les contribuables fortement imposés, mais implique une imposition supplémentaire à la sortie (dividendes ou cession).
              </p>
              <a href="/education/sci-scpi-societe-civile-immobiliere-parts" className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1">
                En savoir plus sur la SCI et les SCPI <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Le démembrement de propriété</h3>

            <div className="bg-white dark:bg-gray-700/50 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-600">
              <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                L'achat en <strong>nue-propriété</strong> permet d'acquérir des parts de SCPI avec une décote (généralement 15 % à 40 % selon la durée du démembrement) sans percevoir les revenus pendant la période de démembrement. À l'issue du démembrement, l'investisseur récupère la pleine propriété. Pendant la période, aucun revenu foncier n'est à déclarer.
              </p>
              <a href="/education/demembrement-scpi-nue-propriete-usufruit" className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1">
                Comprendre le démembrement SCPI <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </section>

          {/* CTA intermédiaire 2 — après optimisation */}
          <div className="mb-12 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/40 p-5 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Comparer les modes de détention selon votre profil fiscal.
            </p>
            <button
              type="button"
              onClick={handleComparateurClick}
              className={`${btnSecondaryClass} w-full sm:w-auto flex-shrink-0`}
            >
              Comparer les SCPI
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>

          {/* Section 5 : Vigilance */}
          <section id="vigilance" className="mb-12 scroll-mt-28">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-orange-500" />
              5. Points de vigilance et risques liés à la fiscalité
            </h2>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Risque de modification de la législation fiscale</h3>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 mb-6 border-l-4 border-red-500">
              <p className="text-gray-800 dark:text-gray-200 mb-3">
                La fiscalité française est susceptible d'évoluer chaque année lors de la loi de finances. Les taux de prélèvements sociaux, les abattements, les plafonds de déficit foncier ou les conventions fiscales internationales peuvent être modifiés par le législateur. <strong>Aucune garantie ne peut être donnée quant au maintien du régime fiscal actuel.</strong>
              </p>
              <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                Ce risque fait partie des risques inhérents à tout investissement immobilier et doit être pris en compte dans votre décision.
              </p>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Impact de la fiscalité sur le rendement net</h3>

            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              Le taux de distribution (TDVM) communiqué par une SCPI est un taux <strong>brut de fiscalité</strong>. Le rendement net après impôts varie significativement selon votre TMI. Pour un investisseur à TMI 41 %, le rendement net après impôt peut être environ deux fois moins élevé que le TDVM brut affiché.
            </p>

            {/* Bloc risques complet */}
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
              <h4 className="font-bold text-gray-900 dark:text-white mb-4">Risques inhérents aux SCPI — mentions obligatoires</h4>
              <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex gap-2">
                  <span className="text-red-500 font-bold flex-shrink-0">⚠</span>
                  <span><strong>Perte en capital :</strong> la valeur des parts de SCPI n'est pas garantie et peut évoluer à la baisse.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500 font-bold flex-shrink-0">⚠</span>
                  <span><strong>Revenus non garantis :</strong> les distributions passées ne préjugent pas des distributions futures. Les loyers perçus peuvent varier à la baisse.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500 font-bold flex-shrink-0">⚠</span>
                  <span><strong>Liquidité limitée :</strong> les parts de SCPI ne sont pas aussi liquides qu'un placement financier. La revente peut prendre plusieurs mois.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500 font-bold flex-shrink-0">⚠</span>
                  <span><strong>Risque fiscal :</strong> la législation fiscale peut évoluer et modifier le traitement fiscal des revenus de SCPI.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500 font-bold flex-shrink-0">⚠</span>
                  <span><strong>Risque de marché :</strong> les immeubles détenus par la SCPI sont exposés aux cycles immobiliers.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Articles connexes */}
          <section id="articles" className="mb-12 scroll-mt-28">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <BookOpen className="w-7 h-7 text-blue-600" />
              Articles connexes — maillage interne
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

          {/* CTA final */}
          <div className="rounded-xl border border-blue-200 dark:border-blue-700/40 border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/60 p-6 md:p-8">
            <p className="text-gray-900 dark:text-white font-bold text-lg mb-2">
              Analysez la fiscalité de votre portefeuille SCPI
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
              Toute analyse fiscale personnalisée nécessite la connaissance de votre situation patrimoniale complète. MaximusSCPI est Conseiller en Investissements Financiers (CIF), enregistré à l'ORIAS.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={handleRdvClick}
                className={`${btnPrimaryClass} w-full sm:w-auto`}
              >
                Analyser ma fiscalité SCPI
                <ArrowRight className="w-4 h-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={handleComparateurClick}
                className={`${btnSecondaryClass} w-full sm:w-auto`}
              >
                Comparer les SCPI
                <ArrowRight className="w-4 h-4" aria-hidden />
              </button>
            </div>
          </div>

          {/* Mention légale bas de page */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              <strong>Mentions légales et avertissements :</strong> Les informations présentées sur cette page sont de nature pédagogique et générale. Elles ne constituent pas un conseil en investissement ni un conseil fiscal personnalisé au sens de la réglementation CIF/AMF. Les taux et seuils fiscaux mentionnés correspondent à la législation française en vigueur à la date de mise à jour de cette page et sont susceptibles d'évoluer. L'investissement en SCPI présente des risques de perte en capital, des revenus non garantis et une liquidité limitée. Les performances passées ne préjugent pas des performances futures. MaximusSCPI est enregistré à l'ORIAS en qualité de Conseiller en Investissements Financiers. Données issues des documents réglementaires des sociétés de gestion (DIC, bulletins trimestriels, rapports annuels, ASPIM).
            </p>
          </div>
        </article>
      </div>
    </div>
  );
};

export default FiscaliteScpiPage;
