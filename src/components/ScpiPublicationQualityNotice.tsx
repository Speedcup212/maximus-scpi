import React from 'react';
import type { Scpi } from '../types/scpi';
import {
  PARTIAL_PUBLICATION_NOTICES,
  formatScpiReferenceDate,
  getMetricDate,
  isPublishedWithReserves,
} from '../utils/scpiPublicationQuality';

type Props = { scpi: Scpi; compact?: boolean; };

export default function ScpiPublicationQualityNotice({ scpi, compact = false }: Props) {
  if (!isPublishedWithReserves(scpi)) return null;
  const notes = (scpi.maximusPublicationReservations || [])
    .map(code => PARTIAL_PUBLICATION_NOTICES[code])
    .filter((label): label is string => typeof label === 'string');
  const quarterly = scpi.maximusSourcePeriode || 'période non renseignée';
  const valuationDate = getMetricDate(scpi,'prix_reconstitution')
    || getMetricDate(scpi,'valeur_realisation');
  const yieldPeriod = scpi.distributionReferencePeriod || '';
  const refFromAnnual = /^20\d{2}-RA$/.test(yieldPeriod) ? yieldPeriod.slice(0,4) : null;
  const issuerUrl = scpi.metricProvenance?.capitalisation?.source_url;
  const safeIssuerUrl = typeof issuerUrl === 'string' && /^https:\/\//.test(issuerUrl)
    ? issuerUrl : null;

  return (
    <section
      data-testid="scpi-publication-reserves"
      role="note"
      aria-label="Publication avec réserves"
      className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950 dark:border-amber-700 dark:bg-amber-950/25 dark:text-amber-100"
    >
      <p className="font-semibold">{compact ? 'Données partielles — réserves' : 'Fiche publiée avec réserves — certification complète en cours'}</p>
      <p className="mt-1 text-sm">
        Dernier bulletin financier contrôlé : {quarterly}.
        {valuationDate ? ' Dernière valeur de reconstitution / réalisation connue au '+valuationDate+'.' : ''}
        {refFromAnnual ? ' Taux de distribution annuel : '+refFromAnnual+'.' : ''}
      </p>
      {!compact && (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm" data-testid="scpi-publication-reservations">
          {notes.map((message,i) => <li key={i}>{message}</li>)}
          {notes.length === 0 && <li>Des informations complémentaires sont en cours de vérification.</li>}
        </ul>
      )}
      {scpi.maximusDisabledFeatures?.includes('suitability_recommendations') && (
        <p className="mt-2 text-xs font-semibold">
          Cette SCPI ne participe pas aux recommandations personnalisées tant que la revue complémentaire est en cours.
        </p>
      )}
      {!compact && safeIssuerUrl && (
        <p className="mt-2 text-xs">
          <a href={safeIssuerUrl} target="_blank" rel="noopener noreferrer" className="underline">
            Consulter le bulletin officiel de référence
          </a>
        </p>
      )}
    </section>
  );
}
