import React from 'react';
import type { InvestorProfile } from '../utils/investorProfile';

interface ZScoreBarProps {
  zScore: number;
  profileLabel: InvestorProfile;
  variant?: 'full' | 'compact';
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

const ZScoreBar: React.FC<ZScoreBarProps> = ({ zScore, profileLabel, variant = 'full' }) => {
  const range = 2;
  const clamped = Math.max(-range, Math.min(range, zScore));
  const markerLeft = ((clamped + range) / (2 * range)) * 100;
  const sign = zScore >= 0 ? '+' : '−';
  const absValue = Math.abs(zScore).toFixed(variant === 'compact' ? 1 : 2);
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
      ? 'Structure équilibrée'
      : zone === 'zone-orange'
      ? zScore >= 0
        ? 'Cohérence élevée'
        : 'Structure plus dispersée'
      : zone === 'zone-rouge'
      ? zScore >= 0
        ? 'Structure concentrée'
        : 'Dispersion élevée'
      : 'Lecture structurelle neutre (indépendante d’un profil investisseur).';

  const zoneColor =
    zone === 'zone-verte'
      ? 'rgba(56, 189, 248, 0.8)'
      : zone === 'zone-orange'
      ? 'rgba(94, 234, 212, 0.8)'
      : zone === 'zone-rouge'
      ? 'rgba(148, 163, 184, 0.85)'
      : 'rgba(148, 163, 184, 0.85)';

  return (
    <div>
      <div className="text-base font-semibold text-white mb-2">
        Z = {sign}{absValue}
      </div>

      <div className="relative">
        <div className="flex items-center h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.12)' }}>
          <div className="h-full w-1/5" style={{ background: 'rgba(148, 163, 184, 0.35)' }} />
          <div className="h-full w-1/5" style={{ background: 'rgba(94, 234, 212, 0.35)' }} />
          <div className="h-full w-1/5" style={{ background: 'rgba(56, 189, 248, 0.45)' }} />
          <div className="h-full w-1/5" style={{ background: 'rgba(94, 234, 212, 0.35)' }} />
          <div className="h-full w-1/5" style={{ background: 'rgba(148, 163, 184, 0.35)' }} />
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
        <span>Dispersion structurelle</span>
        <span>Structure équilibrée</span>
        <span>Structure spécialisée</span>
      </div>

      {variant === 'full' && (
        <>
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
            Le Z-score décrit la structure globale du portefeuille. Il n’indique ni un risque ni une recommandation d’investissement.
          </p>
        </>
      )}
    </div>
  );
};

export default ZScoreBar;
