import type { Scpi } from '../types/scpi';
import { getMetricDate } from '../utils/scpiPublicationQuality';

type Props = { scpi: Scpi; compact?: boolean };

const formatBulletinPeriod = (period: string | undefined): string | null => {
  const match = /^(20\d{2})-T([1-4])$/.exec(period || '');
  if (!match) return period || null;
  const ordinal = match[2] === '1' ? '1er' : match[2] + 'e';
  return ordinal + ' trimestre ' + match[1];
};

/**
 * Public SCPI source panel. Technical certification reservations stay in
 * maximusPublicationReservations / maximusDisabledFeatures (internal controls),
 * not in a client-facing notice. Dated facts and calculation gates are unchanged.
 */
export default function ScpiPublicationQualityNotice({ scpi, compact = false }: Props) {
  const quarter = formatBulletinPeriod(scpi.maximusSourcePeriode);
  const reconstitutionDate = getMetricDate(scpi, 'prix_reconstitution');
  const realisationDate = getMetricDate(scpi, 'valeur_realisation');
  const annualPeriod = /^20\d{2}-RA$/.test(scpi.distributionReferencePeriod || '')
    ? scpi.distributionReferencePeriod!.slice(0, 4) : null;

  const source = scpi.metricProvenance?.capitalisation?.source_url;
  const officialBulletin = typeof source === 'string' && /^https:\/\/[^\s]+$/i.test(source)
    ? source : null;

  const references: Array<[string, string]> = [];
  if (quarter) references.push(['Bulletin de référence', quarter]);
  if (reconstitutionDate) references.push(['Valeur de reconstitution', reconstitutionDate]);
  if (realisationDate) references.push(['Valeur de réalisation', realisationDate]);
  if (annualPeriod) references.push(['Taux de distribution annuel', annualPeriod]);

  if (references.length === 0 && !officialBulletin) return null;

  return (
    <section data-testid="scpi-source-references" aria-label="Sources et actualisation des données SCPI"
      className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
      <h2 className="font-semibold text-slate-800 dark:text-slate-100">
        Sources et actualisation des données
      </h2>
      {!compact && (
        <p className="mt-1 text-xs">
          Les références ci-dessous indiquent les dates des données publiées par la société de gestion.
        </p>
      )}
      {references.length > 0 && (
        <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
          {references.map(([label, value]) => (
            <div key={label} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <dt className="text-xs text-slate-500 dark:text-slate-400">{label}</dt>
              <dd className="font-medium text-slate-800 dark:text-slate-100">{value}</dd>
            </div>
          ))}
        </dl>
      )}
      {!compact && (
        <p className="mt-3 text-xs">
          Chaque indicateur conserve sa date de référence, selon la périodicité des publications officielles.
        </p>
      )}
      {officialBulletin && (
        <a href={officialBulletin} target="_blank" rel="noopener noreferrer"
          className="mt-2 inline-block text-xs font-medium text-blue-700 underline underline-offset-2 dark:text-blue-300">
          Consulter le document officiel de référence
        </a>
      )}
    </section>
  );
}
