import React, { useMemo } from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { SCPIExtended } from '../../data/scpiDataExtended';
import { normalizeGeoLabel, normalizeSectorLabel } from '../../utils/labelNormalization';
import ZScoreBar from '../ZScoreBar';
import { getInvestorProfile } from '../../utils/investorProfile';

interface MobileSelectionBarProps {
  count: number;
  onOpen: () => void;
  selectedScpis: SCPIExtended[];
}

const MobileSelectionBar: React.FC<MobileSelectionBarProps> = ({ count, onOpen, selectedScpis }) => {
  if (count === 0) return null;

  const investorProfileLabel = useMemo(() => getInvestorProfile(), []);

  const coherenceZScore = useMemo(() => {
    if (selectedScpis.length === 0) return 0;

    const sectorMap: Record<string, number> = {};
    const geoMap: Record<string, number> = {};

    selectedScpis.forEach(scpi => {
      scpi.sectors.forEach(sector => {
        const sectorName = normalizeSectorLabel(sector.name).label;
        sectorMap[sectorName] = (sectorMap[sectorName] || 0) + sector.value;
      });
      scpi.geography.forEach(geo => {
        const geoName = normalizeGeoLabel(geo.name).label;
        geoMap[geoName] = (geoMap[geoName] || 0) + geo.value;
      });
    });

    const aggregatedSectors = Object.values(sectorMap);
    const aggregatedGeos = Object.values(geoMap);

    const sectorDiversityScore = Math.min(aggregatedSectors.length, 5);
    const geoDiversityScore = Math.min(aggregatedGeos.length, 5);

    const avgYield = selectedScpis.reduce((sum, s) => sum + s.yield, 0) / selectedScpis.length;
    const avgTof = selectedScpis.reduce((sum, s) => sum + (s.tof || 0), 0) / selectedScpis.length;

    let performanceScore = 0;
    if (avgYield >= 6) performanceScore = 5;
    else if (avgYield >= 5) performanceScore = 4;
    else if (avgYield >= 4) performanceScore = 3;
    else if (avgYield >= 3) performanceScore = 2;
    else performanceScore = 1;

    let liquidityScore = 0;
    if (avgTof >= 95) liquidityScore = 5;
    else if (avgTof >= 92) liquidityScore = 4;
    else if (avgTof >= 90) liquidityScore = 3;
    else if (avgTof >= 85) liquidityScore = 2;
    else liquidityScore = 1;

    const diversificationScore = Math.min(selectedScpis.length, 5);
    const maxSectorWeight = aggregatedSectors.length > 0 ? Math.max(...aggregatedSectors) : 0;
    let riskScore = 5;
    if (maxSectorWeight > 60) riskScore = 2;
    else if (maxSectorWeight > 50) riskScore = 3;
    else if (maxSectorWeight > 40) riskScore = 4;

    const weightedSum =
      sectorDiversityScore * 1.0 +
      geoDiversityScore * 1.0 +
      performanceScore * 1.0 +
      liquidityScore * 1.2 +
      diversificationScore * 1.2 +
      riskScore * 1.3;

    const weightedMax = 5 * (1.0 + 1.0 + 1.0 + 1.2 + 1.2 + 1.3);
    const overall = Math.round((weightedSum / weightedMax) * 5);
    return Number((Math.max(1, Math.min(5, overall)) - 3).toFixed(2));
  }, [selectedScpis]);

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-800 border-t-2 border-orange-500 shadow-2xl shadow-orange-500/20">
      <div className="px-4 py-4 space-y-3">
        <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center gap-2 text-[11px] text-slate-300 mb-1">
            <span>Indicateur de cohérence structurelle</span>
            <span className="text-slate-500" title="Z-score de cohérence MaximusSCPI® — Indicateur propriétaire d’écart structurel — non prédictif de performance.">ⓘ</span>
          </div>
          <ZScoreBar zScore={coherenceZScore} profileLabel={investorProfileLabel} variant="compact" />
        </div>
        <button
          onClick={onOpen}
          className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white py-4 px-6 rounded-xl font-bold text-base shadow-lg shadow-orange-500/30 hover:shadow-xl hover:from-orange-700 hover:to-orange-600 transition-all flex items-center justify-center gap-3 active:scale-95"
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Voir ma sélection ({count})</span>
          <ArrowRight className="w-5 h-5" />
        </button>
        <p className="text-xs text-center text-slate-400 mt-2">
          {count} SCPI sélectionnée{count > 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
};

export default MobileSelectionBar;
