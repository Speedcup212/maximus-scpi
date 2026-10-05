import React from 'react';
import { AlertTriangle, Building2, ExternalLink, FileText, Scale, ShieldCheck } from 'lucide-react';
import ArticleCtaBlock from '../ArticleCtaBlock';

export const InvestirScpiTmi11PourcentFiscaliteOptimaleArticle: React.FC = () => {
  return (
    <div className="space-y-12">
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-8 border border-blue-100 dark:border-gray-700">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-semibold rounded-full">Fiscalité</span>
          <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-sm font-semibold rounded-full">Mis à jour le 5 octobre 2026</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          SCPI et TMI 11 % : fiscalité, direct ou assurance-vie ?
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
          Une TMI à 11 % peut rendre la détention directe de SCPI plus supportable fiscalement qu'à des tranches supérieures, mais elle ne suffit pas pour déterminer le meilleur mode de détention. Il faut comparer la source des revenus, la convention fiscale applicable, les frais, l'horizon, l'IFI, la liquidité et l'éventuel recours au crédit.
        </p>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-blue-600" />
          Première règle : la TMI n'est pas votre taux d'imposition global
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          La tranche marginale à 11 % indique seulement le taux appliqué à la tranche supérieure de votre revenu imposable. Tous vos revenus ne sont pas taxés à 11 %. Pour mesurer l'impact réel d'une SCPI, il faut simuler le revenu supplémentaire dans votre foyer fiscal et vérifier s'il modifie votre tranche ou d'autres paramètres.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Pour les revenus 2025 déclarés en 2026, la tranche à 11 % couvre la fraction de revenu imposable par part comprise entre 11 601 € et 29 579 €.
        </p>
      </section>

      <ArticleCtaBlock variant="top" topic="fiscalite" />

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Building2 className="w-8 h-8 text-indigo-600" />
          SCPI françaises détenues en direct
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-5">
          Pour un résident fiscal français, les revenus fonciers de source française sont en principe soumis au barème progressif de l'impôt sur le revenu et aux prélèvements sociaux applicables. Une TMI à 11 % réduit donc le frottement fiscal par rapport à une TMI de 30 % ou 41 %, mais le rendement net dépend aussi des charges déductibles, du régime fiscal utilisé et du niveau de distribution de la SCPI.
        </p>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Atouts potentiels</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">Accès large aux SCPI, possibilité de financement à crédit, démembrement possible et absence de frais de gestion d'une enveloppe d'assurance-vie.</p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Limites</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">Fiscalité annuelle des revenus, risque de liquidité propre aux SCPI, frais de souscription ou de transaction et exposition éventuelle à l'IFI.</p>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Scale className="w-8 h-8 text-purple-600" />
          SCPI européennes : ne pas utiliser la règle « PS = 0 % » comme raccourci universel
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          La fiscalité des revenus immobiliers étrangers dépend du pays d'origine et de la convention fiscale conclue avec la France. Selon les conventions, on rencontre notamment des mécanismes d'exonération avec prise en compte pour le taux effectif ou des crédits d'impôt. Le résultat net ne se résume donc pas à « rendement brut moins 11 % ».
        </p>
        <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded-lg p-5">
          <p className="font-semibold text-amber-900 dark:text-amber-200 mb-2">À vérifier avant toute comparaison</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Pays de situation des immeubles, quote-part de revenus étrangers, convention fiscale applicable, crédit d'impôt éventuel, prélèvements sociaux, retenues locales et modalités de déclaration. Deux SCPI européennes peuvent produire des fiscalités différentes.
          </p>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-emerald-600" />
          SCPI via assurance-vie : fiscalité différée, mais frais et univers d'investissement à comparer
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          Dans un contrat d'assurance-vie, les revenus produits à l'intérieur du contrat ne sont pas imposés comme des revenus fonciers au nom du souscripteur chaque année. L'imposition intervient lors d'un rachat sur la quote-part de gains comprise dans le retrait, selon l'ancienneté du contrat, la date des versements et le montant global des primes.
        </p>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          Après huit ans, un abattement annuel sur les gains retirés peut s'appliquer : 4 600 € pour une personne seule et 9 200 € pour un couple soumis à imposition commune. Cela ne signifie pas que la SCPI en assurance-vie est automatiquement plus rentable : il faut intégrer les frais de gestion du contrat, les conditions de distribution, la sélection de SCPI disponible et les règles de l'assureur.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          L'assurance-vie n'est pas non plus automatiquement hors IFI lorsqu'elle contient des unités de compte immobilières imposables.
        </p>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Arbitrage opérationnel à TMI 11 %</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="p-3 text-left border border-gray-200 dark:border-gray-600">Situation</th>
                <th className="p-3 text-left border border-gray-200 dark:border-gray-600">Piste à étudier</th>
                <th className="p-3 text-left border border-gray-200 dark:border-gray-600">Point de contrôle</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 dark:text-gray-300">
              <tr><td className="p-3 border border-gray-200 dark:border-gray-600">Horizon long, crédit possible</td><td className="p-3 border border-gray-200 dark:border-gray-600">Direct</td><td className="p-3 border border-gray-200 dark:border-gray-600">Coût du crédit, déductibilité et cash-flow</td></tr>
              <tr><td className="p-3 border border-gray-200 dark:border-gray-600">Besoin de capitalisation sans revenus immédiats</td><td className="p-3 border border-gray-200 dark:border-gray-600">Assurance-vie ou nue-propriété</td><td className="p-3 border border-gray-200 dark:border-gray-600">Frais, durée, liquidité et fiscalité de sortie</td></tr>
              <tr><td className="p-3 border border-gray-200 dark:border-gray-600">SCPI européennes</td><td className="p-3 border border-gray-200 dark:border-gray-600">Direct souvent à comparer</td><td className="p-3 border border-gray-200 dark:border-gray-600">Convention fiscale pays par pays</td></tr>
              <tr><td className="p-3 border border-gray-200 dark:border-gray-600">Objectif transmission</td><td className="p-3 border border-gray-200 dark:border-gray-600">Assurance-vie à étudier</td><td className="p-3 border border-gray-200 dark:border-gray-600">Âge, date des versements et clause bénéficiaire</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 border border-red-100 dark:border-red-900/40">
        <h2 className="text-2xl font-bold text-red-900 dark:text-red-200 mb-5 flex items-center gap-3">
          <AlertTriangle className="w-7 h-7" />
          Ce qu'il faut éviter
        </h2>
        <ul className="space-y-3 text-gray-700 dark:text-gray-300">
          <li>Déduire une allocation automatique de la seule TMI.</li>
          <li>Présenter toutes les SCPI européennes comme fiscalement identiques.</li>
          <li>Comparer direct et assurance-vie sur le seul rendement brut.</li>
          <li>Oublier l'impact des frais, de la liquidité, de l'IFI et de l'horizon de détention.</li>
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
          <a className="flex items-center gap-2 text-blue-700 dark:text-blue-300 hover:underline" href="https://www.amf-france.org/fr/espace-epargnants/savoir-bien-investir/cadrer-son-projet/risques-et-rendements-des-placements/document-dinformations-cles-comprendre-linformation-sur-le-risque-du-placement" target="_blank" rel="noreferrer">AMF — risques et document d'informations clés <ExternalLink className="w-4 h-4" /></a>
        </div>
      </section>

      <ArticleCtaBlock variant="bottom" topic="fiscalite" />
    </div>
  );
};
