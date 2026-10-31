import React from 'react';
import { Activity, ExternalLink } from 'lucide-react';
import { getAnnualHistoryCoverage, getVerifiedAnnualRows } from './scpiAnnualHistoryData';

const euro = (v: number | null) => v === null ? 'N.D.' : v.toLocaleString('fr-FR', {minimumFractionDigits:2,maximumFractionDigits:2}) + ' €';
export const ScpiAnnualHistorySection: React.FC<{ scpiSlug: string }> = ({scpiSlug}) => {
  const rows = getVerifiedAnnualRows(scpiSlug);
  const coverage = getAnnualHistoryCoverage(scpiSlug);
  if (!rows.length) return null;
  return (
    <section data-testid="scpi-annual-history" className="mt-5 rounded-2xl border border-slate-700 bg-slate-900/60">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 px-4 py-3">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-white">
          <Activity className="h-4 w-4 text-emerald-400" />
          Historique financier annuel (rapports officiels)
        </h4>
        <span className="text-xs text-slate-300">
          {coverage ? String(coverage.years_fully_verified) + '/' + String(coverage.years_expected) + ' exercices validés' : rows.length + ' exercices vérifiés'}
        </span>
      </div>
      <p className="px-4 pt-3 text-xs leading-5 text-slate-400">
        Valeurs de réalisation et de reconstitution par part arrêtées au 31 décembre de chaque année.
        Distribution brute annuelle par part, avant fiscalité, uniquement lorsqu’elle est certifiée sur l’exercice entier.
        Historique annuel distinct des bulletins trimestriels.
        {coverage?.core_historical_ready
          ? ' Les trois séries annuelles sont complètes ; cela ne certifie pas tous les autres indicateurs.'
          : ' Historique annuel partiel : les années manquantes ne sont ni estimées ni interpolées.'}
      </p>
      {coverage?.first_fiscal_year_note && (
        <p data-testid="scpi-fiscal-start-note" className="mx-4 mt-3 rounded-lg border border-sky-600/30 bg-sky-950/20 px-3 py-2 text-xs text-sky-100">
          {coverage.first_fiscal_year && coverage.launch_year && coverage.first_fiscal_year > coverage.launch_year
            ? `Lancée en ${coverage.launch_year}, premier exercice clos en ${coverage.first_fiscal_year}. `
            : ''}
          {coverage.first_fiscal_year_note}
        </p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] text-left text-sm">
          <thead className="bg-slate-950/50 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-4 py-3">Année</th>
              <th className="px-4 py-3 text-right">Distribution brute</th>
              <th className="px-4 py-3 text-right">Réalisation</th>
              <th className="px-4 py-3 text-right">Reconstitution</th>
              <th className="px-4 py-3">Rapport officiel</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-200">
            {rows.map((r) => <tr key={r.fiscal_year}>
              <td className="px-4 py-3 font-semibold">{r.fiscal_year}
                {r.scpi_slug === 'edr-europa' && r.fiscal_year === 2024 &&
                  <span className="block text-[10px] font-normal text-amber-200">2e clôture au 31/12</span>}
              </td>
              <td className="px-4 py-3 text-right">
                {euro(r.distribution_totale_par_part)}
                {r.distribution_totale_par_part === null &&
                  <span className="block text-[10px] text-amber-200">Non consolidée : exercices distincts</span>}
                {r.distribution_basis.includes('annualized_inception') &&
                  <span className="block text-[10px] text-amber-300" title="Référence annualisée du premier exercice : ne pas l'assimiler à un flux réellement perçu pour douze mois.">Référence annualisée*</span>}
                {r.distribution_basis.includes('partial') &&
                  <span className="block text-[10px] text-amber-300">Exercice partiel réel**</span>}
                {r.distribution_arbitration &&
                  <span data-testid="scpi-financial-arbitration" className="block max-w-[260px] text-[10px] text-amber-200" title={r.distribution_arbitration}>
                    Divergence du rapport arbitrée (voir détail)
                  </span>}
              </td>
              <td className="px-4 py-3 text-right">{euro(r.valeur_realisation_par_part)}</td>
              <td className="px-4 py-3 text-right">{euro(r.valeur_reconstitution_par_part)}</td>
              <td className="px-4 py-3">
                <a href={r.source_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sky-300 underline underline-offset-2">
                  PDF <ExternalLink className="h-3 w-3" />
                </a>
              </td>
            </tr>)}
          </tbody>
        </table>
      </div>
      {rows.some((r) => r.distribution_basis.includes('annualized_inception')) &&
        <p className="px-4 pb-3 text-[11px] text-amber-200">
          * Première année de commercialisation : rendement annualisé publié par CORUM. La valeur ne correspond pas nécessairement au montant effectivement perçu pour douze mois de détention.
        </p>}
      {rows.some((r) => r.distribution_basis.includes('partial')) &&
        <p className="px-4 pb-3 text-[11px] text-amber-200">
          ** Premier exercice écourté : montant brut effectivement distribué pendant cette période, sans extrapolation sur douze mois.
        </p>}
      {rows.some((r) => r.distribution_arbitration) && (
        <div className="mx-4 mb-4 rounded-lg border border-amber-400/30 bg-amber-950/20 p-3 text-xs text-amber-100">
          <strong>Arbitrage documentaire : </strong>
          {rows.filter((r) => r.distribution_arbitration).map((r) => (
            <p key={r.fiscal_year} className="mt-1">{r.fiscal_year} : {r.distribution_arbitration}</p>
          ))}
        </div>
      )}
    </section>
  );
};
