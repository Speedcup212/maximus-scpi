import React from 'react';
import { AlertTriangle, Building2, ExternalLink, FileText, Scale, ShieldCheck } from 'lucide-react';
import ArticleCtaBlock from '../ArticleCtaBlock';

export const ScpiTmi30PourcentArbitrageAvDirectArticle: React.FC = () => {
  return (
    <div className="space-y-12">
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-8 border border-blue-100 dark:border-gray-700">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-semibold rounded-full">Fiscalité</span>
          <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-sm font-semibold rounded-full">Mis à jour le 5 octobre 2026</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          SCPI et TMI 30 % : assurance-vie ou détention en direct ?
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
          À 30 % de TMI, la fiscalité annuelle des revenus fonciers français devient un critère important, mais elle ne justifie pas une règle automatique du type « 60 % assurance-vie / 40 % direct ». Le bon arbitrage dépend du rendement net après impôt, des frais de l'enveloppe, de la fiscalité étrangère, du financement, de l'IFI et de l'horizon de détention.
        </p>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-blue-600" />
          TMI 30 % : ce que cela change réellement
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          La TMI est le taux appliqué à la tranche supérieure de revenu imposable. Elle n'est ni votre taux moyen d'impôt ni le taux applicable à l'intégralité de vos revenus. Pour les revenus 2025 déclarés en 2026, la tranche à 30 % couvre la fraction de revenu imposable par part comprise entre 29 580 € et 84 577 €.
        </p>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Une distribution supplémentaire de SCPI peut donc être imposée en partie à 30 %, mais le calcul exact dépend du foyer fiscal et de ses autres revenus. Une simulation marginale est plus pertinente qu'un simple « 30 % + prélèvements sociaux » appliqué mécaniquement à tout le patrimoine.
        </p>
      </section>

      <ArticleCtaBlock variant="top" topic="fiscalite" />

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Building2 className="w-8 h-8 text-indigo-600" />
          Direct France : fiscalité annuelle plus sensible
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-5">
          Les revenus fonciers de source française perçus en direct par un résident fiscal français sont en principe soumis au barème progressif de l'impôt sur le revenu ainsi qu'aux prélèvements sociaux applicables. À TMI 30 %, ce frottement peut réduire sensiblement le rendement net d'une SCPI française distribuante.
        </p>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Quand le direct reste pertinent</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">Crédit, besoin de revenus immédiats, choix de SCPI non disponibles en assurance-vie, démembrement, frais d'enveloppe évités ou stratégie immobilière spécifique.</p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Ce qu'il faut modéliser</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">Rendement distribué, fiscalité marginale, charges déductibles, coût du crédit, durée de détention, frais de souscription et risque de liquidité.</p>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Scale className="w-8 h-8 text-purple-600" />
          Direct Europe : la convention fiscale compte plus que le slogan « PS 0 % »
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          Une SCPI européenne peut réduire la pression fiscale française sur certaines poches de revenus étrangers, mais le traitement varie selon le pays et la convention fiscale. Certaines conventions reposent sur un crédit d'impôt, d'autres sur une exonération avec prise en compte pour le taux effectif. Il peut aussi exister une imposition locale.
        </p>
        <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded-lg p-5">
          <p className="font-semibold text-amber-900 dark:text-amber-200 mb-2">Conclusion pratique</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            À TMI 30 %, une SCPI européenne détenue en direct peut rester compétitive, mais il faut calculer son rendement net pays par pays. Une moyenne fiscale générique sur « les SCPI européennes » n'est pas suffisamment fiable pour une recommandation patrimoniale.
          </p>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-emerald-600" />
          Assurance-vie : intérêt fiscal possible, pas de supériorité automatique
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          Dans l'assurance-vie, les revenus générés au sein du contrat ne sont pas imposés annuellement au nom du souscripteur comme des revenus fonciers. Lors d'un rachat, seule la quote-part de gains du retrait est fiscalisée selon les règles du contrat. Après huit ans, l'abattement annuel de 4 600 € pour une personne seule ou 9 200 € pour un couple soumis à imposition commune peut réduire l'impôt sur le revenu dû sur les gains retirés.
        </p>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          En contrepartie, il faut intégrer les frais de gestion du contrat, les éventuels frais propres au support SCPI, le taux de distribution effectivement crédité par l'assureur, l'univers de SCPI disponible et les conditions de sortie. Une SCPI en assurance-vie peut être plus liquide pour l'assuré car l'obligation de rachat pèse sur l'assureur, mais les délais réels dépendent du contrat et de son traitement administratif.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          L'assurance-vie n'efface pas automatiquement l'IFI lorsque le contrat contient des unités de compte immobilières imposables.
        </p>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Arbitrage opérationnel à TMI 30 %</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="p-3 text-left border border-gray-200 dark:border-gray-600">Objectif</th>
                <th className="p-3 text-left border border-gray-200 dark:border-gray-600">Mode à comparer</th>
                <th className="p-3 text-left border border-gray-200 dark:border-gray-600">Variable décisive</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 dark:text-gray-300">
              <tr><td className="p-3 border border-gray-200 dark:border-gray-600">Capitaliser sans revenus immédiats</td><td className="p-3 border border-gray-200 dark:border-gray-600">Assurance-vie / nue-propriété</td><td className="p-3 border border-gray-200 dark:border-gray-600">Frais, durée et fiscalité de sortie</td></tr>
              <tr><td className="p-3 border border-gray-200 dark:border-gray-600">Financer à crédit</td><td className="p-3 border border-gray-200 dark:border-gray-600">Direct</td><td className="p-3 border border-gray-200 dark:border-gray-600">Taux, effort d'épargne et déductibilité</td></tr>
              <tr><td className="p-3 border border-gray-200 dark:border-gray-600">Diversifier hors France</td><td className="p-3 border border-gray-200 dark:border-gray-600">Direct Europe à comparer</td><td className="p-3 border border-gray-200 dark:border-gray-600">Convention fiscale de chaque pays</td></tr>
              <tr><td className="p-3 border border-gray-200 dark:border-gray-600">Transmission</td><td className="p-3 border border-gray-200 dark:border-gray-600">Assurance-vie à étudier</td><td className="p-3 border border-gray-200 dark:border-gray-600">Âge, primes, bénéficiaires et disponibilité des supports</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 border border-red-100 dark:border-red-900/40">
        <h2 className="text-2xl font-bold text-red-900 dark:text-red-200 mb-5 flex items-center gap-3">
          <AlertTriangle className="w-7 h-7" />
          Les raccourcis à supprimer
        </h2>
        <ul className="space-y-3 text-gray-700 dark:text-gray-300">
          <li>« TMI 30 % = 60 % assurance-vie et 40 % direct » : aucune règle fiscale ne fonde cette allocation.</li>
          <li>« SCPI européenne = zéro prélèvement social et zéro impôt français » : le traitement dépend de la convention fiscale et de la nature des revenus.</li>
          <li>« Assurance-vie = liquidité garantie en 48–72 h » : l'assureur porte la liquidité du contrat, mais le délai de règlement dépend des conditions contractuelles et opérationnelles.</li>
          <li>« Assurance-vie = hors IFI » : faux pour les unités de compte immobilières imposables d'un contrat rachetable.</li>
        </ul>
      </section>

      <section className="bg-slate-50 dark:bg-gray-900 rounded-2xl p-8 border border-slate-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-3">
          <FileText className="w-7 h-7 text-slate-600" />
          Sources officielles
        </h2>
        <div className="space-y-3 text-sm">
          <a className="flex items-center gap-2 text-blue-700 dark:text-blue-300 hover:underline" href="https://www.economie.gouv.fr/particuliers/impots-et-fiscalite/gerer-mon-impot-sur-le-revenu/comment-calculer-votre-impot-dapres-le-bareme-de-limpot-sur-le-revenu" target="_blank" rel="noreferrer">Ministère de l'Économie — barème de l'impôt sur le revenu 2026 <ExternalLink className="w-4 h-4" /></a>
          <a className="flex items-center gap-2 text-blue-700 dark:text-blue-300 hover:underline" href="https://www.economie.gouv.fr/particuliers/gerer-mon-argent/gerer-mon-budget-et-mon-epargne/quelle-est-la-fiscalite-de-lassurance-vie" target="_blank" rel="noreferrer">Ministère de l'Économie — fiscalité de l'assurance-vie <ExternalLink className="w-4 h-4" /></a>
          <a className="flex items-center gap-2 text-blue-700 dark:text-blue-300 hover:underline" href="https://www.amf-france.org/fr/le-mediateur/journal-de-bord-du-mediateur/dossiers-du-mois/scpi-une-demande-de-retrait-meme-reguliere-peut-etre-executee-dans-un-delai-indetermine" target="_blank" rel="noreferrer">AMF — risque de liquidité des SCPI <ExternalLink className="w-4 h-4" /></a>
        </div>
      </section>

      <ArticleCtaBlock variant="bottom" topic="fiscalite" />
    </div>
  );
};
