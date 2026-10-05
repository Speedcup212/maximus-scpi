import React from 'react';
import { AlertTriangle, Building2, ExternalLink, FileText, Scale, ShieldCheck } from 'lucide-react';
import ArticleCtaBlock from '../ArticleCtaBlock';

export const ForteImpositionTmi41ScpiAssuranceVieArticle: React.FC = () => {
  return (
    <div className="space-y-12">
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-8 border border-blue-100 dark:border-gray-700">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-semibold rounded-full">Fiscalité</span>
          <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-sm font-semibold rounded-full">Mis à jour le 5 octobre 2026</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          SCPI et TMI 41 % : assurance-vie, direct ou démembrement ?
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
          Une TMI à 41 % augmente fortement le coût fiscal potentiel des revenus fonciers français détenus en direct. Cela rend l'assurance-vie, les SCPI européennes ou le démembrement plus intéressants à comparer, mais aucune de ces solutions n'est « incontournable » par principe. Le choix dépend du besoin de revenus, de l'horizon, des frais, de l'IFI, de la liquidité et de la fiscalité exacte des actifs sélectionnés.
        </p>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-blue-600" />
          TMI 41 % : ce que cela signifie
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          La TMI correspond au taux de la tranche supérieure de revenu imposable et non au taux moyen du foyer. Pour les revenus 2025 déclarés en 2026, la tranche à 41 % s'applique à la fraction de revenu imposable par part comprise entre 84 578 € et 181 917 €.
        </p>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Ajouter des revenus fonciers français à un foyer déjà situé dans cette tranche peut donc générer un frottement fiscal élevé. Il faut toutefois raisonner sur le revenu marginal réellement ajouté et tenir compte des charges déductibles, de la situation familiale et des autres revenus.
        </p>
      </section>

      <ArticleCtaBlock variant="top" topic="fiscalite" />

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Building2 className="w-8 h-8 text-indigo-600" />
          SCPI françaises en direct : à modéliser avec prudence
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-5">
          Les revenus fonciers de source française sont en principe soumis au barème progressif de l'impôt sur le revenu et aux prélèvements sociaux applicables. À TMI 41 %, la détention directe d'une SCPI française de rendement peut donc subir une pression fiscale annuelle importante.
        </p>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Pourquoi le direct peut rester cohérent</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">Financement à crédit, besoin de revenus immédiats, SCPI non référencée en assurance-vie, stratégie de démembrement distincte ou acceptation assumée de la fiscalité en contrepartie d'un autre avantage patrimonial.</p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Pourquoi il peut être pénalisant</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">Fiscalité annuelle élevée, absence de capitalisation brute dans une enveloppe, éventuelle exposition à l'IFI et risque de liquidité propre aux parts de SCPI.</p>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Scale className="w-8 h-8 text-purple-600" />
          SCPI européennes : une piste sérieuse, mais convention par convention
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          À TMI élevée, la détention directe de SCPI investies hors de France peut être intéressante car la fiscalité française des revenus immobiliers étrangers dépend des conventions fiscales. Selon le pays, le mécanisme peut être un crédit d'impôt ou une exonération avec prise en compte pour le taux effectif, avec éventuellement une imposition locale.
        </p>
        <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded-lg p-5">
          <p className="font-semibold text-amber-900 dark:text-amber-200 mb-2">Point de vigilance</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Il n'existe pas une fiscalité unique des « SCPI européennes ». Le rendement net doit être recalculé à partir de la géographie réelle du portefeuille et de la convention fiscale de chaque pays.
          </p>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-emerald-600" />
          Assurance-vie : souvent pertinente à comparer à TMI 41 %
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          L'assurance-vie permet de ne pas imposer chaque année, au nom du souscripteur, les distributions internes comme des revenus fonciers. Lors d'un rachat, seule la quote-part de gains comprise dans la somme retirée est fiscalisée selon les règles de l'assurance-vie. Après huit ans, l'abattement annuel de 4 600 € ou 9 200 € selon la situation familiale peut réduire l'impôt sur le revenu dû sur les gains retirés.
        </p>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          À TMI 41 %, ce différé d'imposition peut avoir de la valeur, surtout si l'objectif est de capitaliser plutôt que de percevoir immédiatement des revenus. Mais il faut retrancher les frais de gestion du contrat, analyser la rémunération réellement reversée sur le support SCPI et vérifier que les SCPI souhaitées sont disponibles.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Une unité de compte immobilière dans un contrat rachetable peut rester partiellement imposable à l'IFI : l'assurance-vie ne constitue donc pas une exonération IFI automatique.
        </p>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Démembrement temporaire : alternative à étudier pour capitaliser</h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          L'acquisition de nue-propriété temporaire de parts de SCPI peut convenir à un investisseur fortement imposé qui n'a pas besoin de revenus pendant la période de démembrement. Pendant cette période, le nu-propriétaire ne perçoit pas les distributions et récupère la pleine propriété au terme prévu.
        </p>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Cette stratégie ne doit pas être présentée comme un gain garanti : la valeur future de la part, la qualité de la SCPI, la durée du démembrement, la clé de répartition et les règles d'IFI doivent être vérifiées au cas par cas.
        </p>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Arbitrage opérationnel à TMI 41 %</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="p-3 text-left border border-gray-200 dark:border-gray-600">Objectif</th>
                <th className="p-3 text-left border border-gray-200 dark:border-gray-600">Piste à comparer</th>
                <th className="p-3 text-left border border-gray-200 dark:border-gray-600">Risque principal</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 dark:text-gray-300">
              <tr><td className="p-3 border border-gray-200 dark:border-gray-600">Capitaliser</td><td className="p-3 border border-gray-200 dark:border-gray-600">Assurance-vie / nue-propriété</td><td className="p-3 border border-gray-200 dark:border-gray-600">Frais, durée et supports disponibles</td></tr>
              <tr><td className="p-3 border border-gray-200 dark:border-gray-600">Revenus immédiats</td><td className="p-3 border border-gray-200 dark:border-gray-600">Direct France ou Europe</td><td className="p-3 border border-gray-200 dark:border-gray-600">Fiscalité nette et liquidité</td></tr>
              <tr><td className="p-3 border border-gray-200 dark:border-gray-600">Diversification géographique</td><td className="p-3 border border-gray-200 dark:border-gray-600">Direct Europe</td><td className="p-3 border border-gray-200 dark:border-gray-600">Convention fiscale pays par pays</td></tr>
              <tr><td className="p-3 border border-gray-200 dark:border-gray-600">Transmission</td><td className="p-3 border border-gray-200 dark:border-gray-600">Assurance-vie à étudier</td><td className="p-3 border border-gray-200 dark:border-gray-600">Âge, primes, bénéficiaires et clause</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 border border-red-100 dark:border-red-900/40">
        <h2 className="text-2xl font-bold text-red-900 dark:text-red-200 mb-5 flex items-center gap-3">
          <AlertTriangle className="w-7 h-7" />
          Les affirmations à bannir
        </h2>
        <ul className="space-y-3 text-gray-700 dark:text-gray-300">
          <li>« TMI 41 % = 100 % assurance-vie » : faux, la TMI seule ne suffit pas à construire une allocation.</li>
          <li>« Assurance-vie = zéro IFI » : faux pour les unités de compte immobilières imposables d'un contrat rachetable.</li>
          <li>« SCPI européenne = fiscalité uniforme » : faux, la convention fiscale dépend de chaque pays.</li>
          <li>« Liquidité assurance-vie = 48–72 h garantie » : le contrat impose une obligation à l'assureur, mais le délai opérationnel dépend des conditions de rachat.</li>
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
          <a className="flex items-center gap-2 text-blue-700 dark:text-blue-300 hover:underline" href="https://bofip.impots.gouv.fr/bofip/11314-PGP.html/identifiant%3DBOI-PAT-IFI-20-20-30-30-20180608" target="_blank" rel="noreferrer">BOFiP — assurance-vie et IFI <ExternalLink className="w-4 h-4" /></a>
        </div>
      </section>

      <ArticleCtaBlock variant="bottom" topic="fiscalite" />
    </div>
  );
};
