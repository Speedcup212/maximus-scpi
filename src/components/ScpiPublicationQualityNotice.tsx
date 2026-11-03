import React from 'react';
import type { Scpi } from '../types/scpi';
import { getMetricDate, isPublishedWithReserves } from '../utils/scpiPublicationQuality';

type Props = { scpi: Scpi; compact?: boolean };

/** Factual source dates are shown upfront; technical exceptions stay accessible
 * and the restrictions on unsupported calculations remain unchanged. */
export default function ScpiPublicationQualityNotice({ scpi, compact = false }: Props) {
  if (!isPublishedWithReserves(scpi)) return null;
  const flags = new Set(scpi.maximusPublicationReservations || []);
  const quarter = scpi.maximusSourcePeriode || 'non renseignée';
  const valuationDate = getMetricDate(scpi, 'prix_reconstitution') || getMetricDate(scpi, 'valeur_realisation');
  const annualPeriod = /^20\d{2}-RA$/.test(scpi.distributionReferencePeriod || '')
    ? scpi.distributionReferencePeriod!.slice(0,4) : null;
  const source = scpi.metricProvenance?.capitalisation?.source_url;
  const officialBulletin = typeof source === 'string' && /^https:\/\//.test(source) ? source : null;
  return (
    <section data-testid="scpi-publication-reserves" aria-label="Sources et dates des données SCPI"
      className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-medium text-slate-800 dark:text-slate-100">Références documentaires</span>
        <span>Bulletin : {quarter}</span>
        {valuationDate && <span>Valorisation : {valuationDate}</span>}
        {annualPeriod && <span>Distribution annuelle : {annualPeriod}</span>}
      </div>
      {!compact && (
        <details data-testid="scpi-source-details" className="mt-2">
          <summary className="w-fit cursor-pointer text-xs text-slate-500 underline underline-offset-2 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white">
            Sources et méthodologie
          </summary>
          <div className="mt-3 space-y-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            <p>Chaque indicateur conserve sa propre période de référence. Les valorisations annuelles ne sont pas assimilées aux données trimestrielles.</p>
            {flags.has('LATEST_STATUTES_UNVERIFIED') && (
              <p>Statuts consultables : version signée du 30 avril 2026. Un dépôt plus récent du 8 juillet 2026 est recensé ; ses dispositions ne sont pas présumées identiques.</p>
            )}
            {(flags.has('UNRECONCILED_SHARE_FLOW') || flags.has('HISTORY_NOT_RECONCILED')) && (
              <p>Les évolutions nécessitant un rapprochement complet des mouvements et stocks de parts ne sont pas calculées. Les chiffres officiels restent inchangés.</p>
            )}
            {flags.has('RISK_SFDR_TEXT_UNDER_REVIEW') && (
              <p>Les caractéristiques de risque et de durabilité sont à consulter dans le DIC et la note d'information de la société de gestion. La fiche ne constitue pas une recommandation personnalisée.</p>
            )}
            {officialBulletin && (
              <p><a href={officialBulletin} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">Consulter le bulletin de la société de gestion</a></p>
            )}
          </div>
        </details>
      )}
    </section>
  );
}
