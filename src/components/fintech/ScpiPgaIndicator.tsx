import React from 'react';
import { getVerifiedPga2025, formatPgaPercent } from '../../utils/scpiPga';

type Variant = 'card' | 'row' | 'detail' | 'radar' | 'source';

interface ScpiPgaIndicatorProps {
  name: string;
  variant?: Variant;
}

/**
 * Affiche un couple TD/PGA sourcé sur le même exercice.
 * La PGA est informative et n'entre pas dans la note propriétaire du Radar.
 */
const ScpiPgaIndicator: React.FC<ScpiPgaIndicatorProps> = ({ name, variant = 'card' }) => {
  const official = getVerifiedPga2025(name);
  const compact = variant === 'row';
  const sourceOnly = variant === 'source';
  return (
    <div
      data-testid="scpi-pga-2025"
      data-pga-status={official ? 'issuer_verified' : 'not_verified'}
      className={compact
        ? 'mt-1 text-[10px] leading-snug text-slate-300'
        : 'rounded-lg border border-slate-600/70 bg-slate-900/30 px-3 py-2 text-xs text-slate-200'}
    >
      {!sourceOnly && (
        <div className={compact ? '' : 'flex items-center justify-between gap-2'}>
          <span className="font-semibold">PGA 2025</span>
          <span className={official ? (compact ? 'ml-2 text-base font-bold text-cyan-300' : 'ml-2 font-bold text-cyan-300') : 'ml-2 text-amber-300'}>
            {official ? formatPgaPercent(official.pgaPct) : 'Non vérifiée'}
          </span>
        </div>
      )}
      {official ? (
        <>
          <p className="mt-1 text-[10px] leading-snug text-slate-300">
            {official.distributionPct !== null
              ? `Le taux de distribution brut 2025 de ${formatPgaPercent(official.distributionPct)} est inclus dans la PGA.`
              : 'Aucun taux de distribution publié pour 2025 : PGA fondée sur la variation du prix de la part.'}
          </p>
          {!compact && (
            <a
              href={official.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-[10px] underline underline-offset-2 text-cyan-300 hover:text-cyan-100"
              title={official.sourceLabel}
            >
              Source officielle : {official.sourceLabel}
            </a>
          )}
          {official.note && !compact && <p className="mt-1 text-[10px] text-amber-200">{official.note}</p>}
        </>
      ) : (
        <p className="mt-1 text-[10px] leading-snug text-amber-200">
          PGA 2025 non intégrée : TD annuel masqué en attendant le couple TD/PGA documenté sur le même exercice.
        </p>
      )}
      {variant === 'radar' && (
        <p className="mt-1 text-[10px] text-slate-400">
          Indicateur historique distinct de la note du Radar ; aucune prédiction de rendement.
        </p>
      )}
    </div>
  );
};

export default ScpiPgaIndicator;
