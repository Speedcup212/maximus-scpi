import React from 'react';
import { formatPga, getPgaDisplayInfo, type PgaData } from '../utils/scpiPga';

type Props = {
  scpi: PgaData;
  variant?: 'hero' | 'surface';
  className?: string;
};

/**
 * Indicator visibly paired with annual TD on every SCPI detail template.
 * A missing, unverified or mismatched-year PGA never becomes 0% or an estimate.
 */
export default function PgaMetricCard({ scpi, variant = 'hero', className = '' }: Props) {
  const info = getPgaDisplayInfo(scpi);
  const hero = variant === 'hero';
  return (
    <section data-testid="scpi-pga-metric" aria-label="Performance globale annuelle de la SCPI"
      className={`${hero
        ? 'rounded-xl border border-white/15 bg-slate-950/20 p-4 min-h-[132px]'
        : 'rounded-xl border border-teal-200 bg-teal-50 p-4 text-center dark:border-teal-800 dark:bg-teal-950/30'} ${className}`}>
      <div className={hero ? 'text-xs sm:text-sm font-semibold uppercase tracking-wide text-white/70' : 'text-sm font-bold text-teal-800 dark:text-teal-200'}>
        PGA{info.year ? ` ${info.year}` : ''}
      </div>
      <div className={`mt-2 font-extrabold tabular-nums ${info.available ? 'text-3xl sm:text-[32px]' : 'text-lg sm:text-xl'} ${hero ? 'text-yellow-300' : 'text-teal-700 dark:text-teal-300'}`}>
        {info.available ? formatPga(info.value!) : 'Non disponible'}
      </div>
      <p className={hero ? 'mt-2 text-xs sm:text-[13px] text-white/70' : 'mt-2 text-xs text-slate-600 dark:text-slate-300'}>
        Performance globale annuelle : distribution + variation du prix de part.
      </p>
      {info.available && info.sourceUrl && (
        <a href={info.sourceUrl} target="_blank" rel="noopener noreferrer"
          className={`mt-2 inline-block text-xs underline underline-offset-2 ${hero ? 'text-white/85' : 'text-teal-800 dark:text-teal-200'}`}>
          Publication officielle
        </a>
      )}
    </section>
  );
}
