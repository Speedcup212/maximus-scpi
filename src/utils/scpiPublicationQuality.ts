import type { Scpi } from '../types/scpi';

/**
 * A public listing with evidence reservations is not an investment recommendation,
 * a fully certified release, or an excuse to silently substitute older dates.
 */
export type ScpiPublicationState = 'certified' | 'published_with_reserves';
export type ScpiPublicationSource = Pick<Scpi,
  'maximusPublicationStatus' | 'maximusPublicationReservations' |
  'maximusDisabledFeatures' | 'metricProvenance' | 'maximusSourcePeriode'>;

export const PARTIAL_PUBLICATION_NOTICES: Record<string, string> = {
  LATEST_STATUTES_UNVERIFIED:
    'Statuts : la dernière version déposée n’est pas disponible dans les sources contrôlées. Les conditions récentes sont vérifiées sur la note d’information et le bulletin ; les clauses non confirmées ne sont pas présentées comme actuelles.',
  UNRECONCILED_SHARE_FLOW:
    'Mouvements de parts : un écart subsiste entre les flux et le nombre de parts publié. Les chiffres officiels restent visibles, sans évolution calculée à partir de ces flux.',
  HISTORY_NOT_RECONCILED:
    'Historique : certains rapprochements restent à contrôler. Les comparaisons non certifiées sont indisponibles.',
  HISTORICAL_RECONCILIATION_INCOMPLETE:
    'Historique : certains rapprochements restent à contrôler. Les comparaisons non certifiées sont indisponibles.',
  RISK_SFDR_TEXT_UNDER_REVIEW:
    'Risques et SFDR : revue complémentaire en cours. Aucune recommandation d’adéquation automatisée n’est fondée sur cette fiche.',
  LAST_OFFICIAL_VALUATION_HISTORICAL:
    'Valorisation : les dernières valeurs officielles connues datent du rapport annuel ; elles ne constituent pas une nouvelle expertise du trimestre.',
};
export const isPublishedWithReserves = (scpi: Pick<Scpi, 'maximusPublicationStatus'> | null | undefined): boolean =>
  scpi?.maximusPublicationStatus === 'published_with_reserves';

export const isFeatureDisabled = (
  scpi: Pick<Scpi, 'maximusPublicationStatus' | 'maximusDisabledFeatures'> | null | undefined,
  feature: string,
): boolean => isPublishedWithReserves(scpi) && !!scpi?.maximusDisabledFeatures?.includes(feature);

export const canRecommendScpi = (scpi: Pick<Scpi, 'maximusPublicationStatus'> | null | undefined): boolean =>
  !isPublishedWithReserves(scpi);

export const formatScpiReferenceDate = (raw: string | null | undefined): string | null => {
  if (!raw || !/^20\d{2}-\d{2}-\d{2}$/.test(raw)) return null;
  const date = new Date(raw + 'T00:00:00Z');
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0,10)!==raw) return null;
  return raw.slice(8,10)+'/'+raw.slice(5,7)+'/'+raw.slice(0,4);
};

export const getMetricDate = (scpi: ScpiPublicationSource, metric: string): string | null => {
  const meta = scpi.metricProvenance?.[metric];
  return formatScpiReferenceDate(meta?.reference_date || null);
};
