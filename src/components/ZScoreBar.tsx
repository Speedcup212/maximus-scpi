import React from 'react';
import type { InvestorProfile } from '../utils/investorProfile';

interface ZScoreBarProps {
  zScore: number;
  profileLabel: InvestorProfile;
}

const PROFILE_THRESHOLDS: Record<Exclude<InvestorProfile, null>, { green: number; orange: number }> = {
  'PROFIL OPPOSE AU RISQUE': { green: 0.30, orange: 0.60 },
  'Profil sécuritaire': { green: 0.50, orange: 0.90 },
  'Profil prudent défensif': { green: 0.70, orange: 1.10 },
  'Profil équilibré prudent': { green: 1.00, orange: 1.50 },
  'Profil équilibré dynamique': { green: 1.30, orange: 1.80 },
  'Profil dynamique': { green: 1.60, orange: 2.20 },
  'Profil agressif': { green: 2.00, orange: 2.80 },
};

const ZScoreBar: React.FC<ZScoreBarProps> = ({ zScore, profileLabel }) => {
  const range = 2;
  const clamped = Math.max(-range, Math.min(range, zScore));
  const markerLeft = ((clamped + range) / (2 * range)) * 100;
  const sign = zScore >= 0 ? '+' : '−';
  const absValue = Math.abs(zScore).toFixed(2);
  const absZ = Math.abs(zScore);
  const thresholds = profileLabel ? PROFILE_THRESHOLDS[profileLabel] : null;
  const zone = thresholds
    ? absZ <= thresholds.green
      ? 'zone-verte'
      : absZ <= thresholds.orange
      ? 'zone-orange'
      : 'zone-rouge'
    : 'zone-neutre';

  const zoneLabel =
    zone === 'zone-verte'
      ? 'Zone verte (écart faible)'
      : zone === 'zone-orange'
      ? 'Zone orange (vigilance)'
      : zone === 'zone-rouge'
      ? 'Zone rouge (déséquilibre)'
      : 'Lecture structurelle neutre (indépendante d’un profil investisseur).';

  const zoneColor =
    zone === 'zone-verte'
      ? 'rgba(34, 197, 94, 0.75)'
      : zone === 'zone-orange'
      ? 'rgba(251, 146, 60, 0.75)'
      : zone === 'zone-rouge'
      ? 'rgba(239, 68, 68, 0.75)'
      : 'rgba(148, 163, 184, 0.8)';

  return (
    <div>
      <div className="text-base font-semibold text-white mb-2">
        Z = {sign}{absValue}
      </div>

      <div className="relative">
        <div className="flex items-center h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.12)' }}>
          <div className="h-full w-1/5" style={{ background: 'rgba(239, 68, 68, 0.45)' }} />
          <div className="h-full w-1/5" style={{ background: 'rgba(251, 146, 60, 0.45)' }} />
          <div className="h-full w-1/5" style={{ background: 'rgba(34, 197, 94, 0.45)' }} />
          <div className="h-full w-1/5" style={{ background: 'rgba(251, 146, 60, 0.45)' }} />
          <div className="h-full w-1/5" style={{ background: 'rgba(239, 68, 68, 0.45)' }} />
        </div>
        <div
          className="absolute top-1/2 -translate-y-1/2"
          style={{
            left: '50%',
            width: '2px',
            height: '14px',
            transform: 'translateX(-50%)',
            background: 'rgba(255,255,255,0.6)'
          }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2"
          style={{ left: `${markerLeft}%` }}
        >
          <div
            className="h-3 w-3 rounded-full"
            style={{
              background: '#FFFFFF',
              boxShadow: '0 0 0 3px rgba(255,255,255,0.25)'
            }}
          />
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
        <span>Déséquilibre structurel</span>
        <span>Zone neutre</span>
        <span>Concentration accrue</span>
      </div>

      <p className="mt-2 text-[11px] text-slate-400">
        Code couleur indicatif d’écart structurel. Ne constitue ni une notation, ni une recommandation d’investissement.
      </p>
      {profileLabel ? (
        <>
          <p className="mt-2 text-[11px] text-slate-300">
            Lecture structurelle ajustée selon votre profil : <span style={{ color: zoneColor }}>{profileLabel}</span>. <span style={{ color: zoneColor }}>{zoneLabel}</span>
          </p>
          <a
            href="/simulateur-profil-investisseur"
            className="mt-2 inline-flex text-[11px] text-emerald-300 hover:text-emerald-200"
          >
            Mettre à jour mon profil investisseur pour affiner la lecture
          </a>
        </>
      ) : (
        <>
          <p className="mt-2 text-[11px] text-slate-300">
            {zoneLabel}
          </p>
          <a
            href="/simulateur-profil-investisseur"
            className="mt-2 inline-flex text-[11px] text-emerald-300 hover:text-emerald-200"
          >
            Définir mon profil investisseur pour contextualiser la lecture
          </a>
        </>
      )}
      <p className="mt-2 text-[11px] text-slate-400">
        Le Z-score mesure l’écart structurel de votre allocation par rapport à une structure SCPI équilibrée.
        Il s’agit d’un indicateur d’analyse globale, sans valeur de performance ni recommandation d’investissement.
      </p>
    </div>
  );
};

export default ZScoreBar;
