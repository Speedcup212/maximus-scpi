import React from 'react';
import { formatPga, getPgaDisplayInfo, type PgaData } from '../utils/scpiPga';

interface Props {
  scpi: PgaData;
  className?: string;
  compact?: boolean;
  light?: boolean;
}

/** À placer au contact immédiat du taux de distribution, sur toutes les surfaces. */
export default function PgaIndicator({ scpi, className = '', compact = false, light = false }: Props) {
  const info = getPgaDisplayInfo(scpi);
  const text = info.available
    ? `${info.label} : ${formatPga(info.value!)}`
    : `PGA${info.year ? ' ' + info.year : ''} : non disponible`;
  return (
    <span className={`${compact ? 'text-[10px]' : 'text-xs'} ${light ? 'text-white/90' : 'text-slate-500 dark:text-slate-400'} ${className}`}
      title="PGA : taux de distribution + évolution du prix de la part sur la même année (ASPIM). Les performances passées ne préjugent pas des performances futures.">
      {info.available && info.sourceUrl ? (
        <a href={info.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2"
          title="Consulter la source officielle de la PGA">{text}</a>
      ) : text}
    </span>
  );
}
