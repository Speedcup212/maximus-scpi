/**
 * Composant réutilisable pour l'affichage du taux de distribution selon les règles MaximusSCPI
 */

import React from 'react';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { Scpi } from '../types/scpi';
import { SCPIExtended } from '../data/scpiDataExtended';
import { getYieldDisplayInfo } from '../utils/yieldDisplay';

interface YieldDisplayProps {
  scpi: Scpi | SCPIExtended;
  variant?: 'card' | 'detail' | 'table' | 'compact';
  showLegalNotice?: boolean;
  className?: string;
}

const YieldDisplay: React.FC<YieldDisplayProps> = ({ 
  scpi, 
  variant = 'detail',
  showLegalNotice = true,
  className = ''
}) => {
  const yieldInfo = getYieldDisplayInfo(scpi);

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="font-bold text-green-600">{yieldInfo.primaryValue.toFixed(2)}%</span>
        {yieldInfo.secondaryValue && (
          <span className="text-xs text-gray-500">({yieldInfo.secondaryValue.toFixed(2)}% brut)</span>
        )}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={className}>
        <div className="font-bold text-green-600">{yieldInfo.primaryValue.toFixed(2)}%</div>
        <div className="text-xs text-gray-500">{yieldInfo.primaryLabel}</div>
        {yieldInfo.secondaryValue && (
          <div className="text-xs text-gray-400 mt-0.5">
            {yieldInfo.secondaryLabel}: {yieldInfo.secondaryValue.toFixed(2)}%
          </div>
        )}
        {yieldInfo.netNotAvailable && (
          <div className="text-xs text-amber-600 font-medium mt-1">
            ⚠️ Net non communiqué
          </div>
        )}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 text-white ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-emerald-100 uppercase tracking-wide mb-0.5">
              {yieldInfo.primaryLabel}
            </p>
            <p className="text-4xl font-bold">{yieldInfo.primaryValue.toFixed(2)}%</p>
            {yieldInfo.secondaryValue && (
              <div className="mt-2 pt-2 border-t border-emerald-400/30">
                <p className="text-xs font-medium text-emerald-100 uppercase tracking-wide mb-0.5">
                  {yieldInfo.secondaryLabel}
                </p>
                <p className="text-2xl font-bold text-emerald-50">
                  {yieldInfo.secondaryValue.toFixed(2)}%
                </p>
              </div>
            )}
            {yieldInfo.netNotAvailable && (
              <div className="mt-2 pt-2 border-t border-amber-400/30">
                <p className="text-xs text-amber-100 font-medium">
                  ⚠️ Taux net non communiqué
                </p>
              </div>
            )}
            {showLegalNotice && (
              <div className="mt-2 pt-2 border-t border-emerald-400/20">
                <p className="text-[10px] text-emerald-100/80 leading-tight">
                  {yieldInfo.legalNotice}
                </p>
              </div>
            )}
          </div>
          <TrendingUp className="w-12 h-12 text-emerald-200 opacity-40" />
        </div>
      </div>
    );
  }

  // Variant 'detail' (par défaut)
  return (
    <div className={`bg-slate-800/50 rounded-lg p-5 border border-slate-600 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-4 h-4 text-emerald-400" />
        <div className="text-xs text-slate-400">{yieldInfo.primaryLabel}</div>
      </div>
      <div className="text-2xl font-bold text-emerald-400">
        {yieldInfo.primaryValue.toFixed(2)}%
      </div>
      {yieldInfo.secondaryValue && (
        <div className="mt-2 pt-2 border-t border-slate-600">
          <div className="text-xs text-slate-500 mb-1">{yieldInfo.secondaryLabel}</div>
          <div className="text-lg font-semibold text-slate-300">
            {yieldInfo.secondaryValue.toFixed(2)}%
          </div>
        </div>
      )}
      {yieldInfo.netNotAvailable && (
        <div className="mt-2 pt-2 border-t border-amber-500/30">
          <div className="text-xs text-amber-400 font-medium flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Taux net non communiqué
          </div>
        </div>
      )}
      {showLegalNotice && (
        <div className="mt-2 pt-2 border-t border-slate-600">
          <div className="text-[10px] text-slate-500 leading-tight">
            {yieldInfo.legalNotice}
          </div>
        </div>
      )}
    </div>
  );
};

export default YieldDisplay;
