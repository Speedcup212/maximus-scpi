import React, { useMemo } from 'react';
import { TrendingUp, DollarSign, PieChart, Shield, AlertCircle } from 'lucide-react';
import { SCPIExtended } from '../../data/scpiDataExtended';
import { useAllocation } from '../../contexts/AllocationContext';
import { normalizeGeoLabel, normalizeSectorLabel } from '../../utils/labelNormalization';

interface PortfolioSummaryHeaderProps {
  selectedScpis: SCPIExtended[];
}

const PortfolioSummaryHeader: React.FC<PortfolioSummaryHeaderProps> = ({ selectedScpis }) => {
  const { getWeightedYield, getMonthlyRevenue, weights } = useAllocation();

  const stats = useMemo(() => {
    const weightedYield = getWeightedYield(selectedScpis);
    const monthlyRevenue = getMonthlyRevenue(selectedScpis);

    // Calculate unique sectors and zones
    const allSectors = new Set<string>();
    const allZones = new Set<string>();
    selectedScpis.forEach(scpi => {
      scpi.sectors.forEach(s => {
        allSectors.add(normalizeSectorLabel(s.name).label);
      });
      scpi.geography.forEach(g => {
        allZones.add(normalizeGeoLabel(g.name).label);
      });
    });

    // Calculate weighted average TOF (quality)
    const totalWeight = selectedScpis.reduce((sum, scpi) => sum + (weights[scpi.id] || 0), 0);
    const weightedTOF = totalWeight > 0
      ? selectedScpis.reduce((sum, scpi) => {
          const weight = weights[scpi.id] || 0;
          return sum + (scpi.tof * weight);
        }, 0) / totalWeight
      : 0;

    // Calculate risk profile (0-7 scale based on yield volatility)
    // Higher yield = higher risk
    // SCPI are moderate investments, capped at 4/7 maximum
    // With 2+ SCPI, minimum risk is 3/7 (diversified portfolio)
    let riskScore = 3; // Default moderate
    if (selectedScpis.length < 2) {
      // Single SCPI: risk based on yield
      if (weightedYield < 5) riskScore = 1;
      else if (weightedYield < 6.5) riskScore = 2;
      else if (weightedYield < 8) riskScore = 3;
      else riskScore = 4;
    } else {
      // 2+ SCPI: minimum risk is 3/7
      if (weightedYield < 8) riskScore = 3;
      else riskScore = 4;
    }

    return {
      yield: weightedYield,
      monthlyRevenue,
      sectorsCount: allSectors.size,
      zonesCount: allZones.size,
      quality: weightedTOF,
      riskScore
    };
  }, [selectedScpis, getWeightedYield, getMonthlyRevenue, weights]);

  const { sectorData, geoData } = useMemo(() => {
    const sectorMap: Record<string, number> = {};
    const geoMap: Record<string, number> = {};
    const totalWeight = selectedScpis.reduce((sum, scpi) => sum + (weights[scpi.id] || 0), 0);
    const fallbackWeight = selectedScpis.length > 0 ? 1 / selectedScpis.length : 0;

    selectedScpis.forEach(scpi => {
      const rawWeight = weights[scpi.id] || 0;
      const weightRatio = totalWeight > 0 ? rawWeight / totalWeight : fallbackWeight;

      scpi.sectors.forEach(sector => {
        const sectorName = normalizeSectorLabel(sector.name).label;
        sectorMap[sectorName] = (sectorMap[sectorName] || 0) + (sector.value * weightRatio) / 100;
      });

      scpi.geography.forEach(geo => {
        const geoName = normalizeGeoLabel(geo.name).label;
        geoMap[geoName] = (geoMap[geoName] || 0) + (geo.value * weightRatio) / 100;
      });
    });

    const sectorData = Object.values(sectorMap).filter(Boolean);
    const geoData = Object.values(geoMap).filter(Boolean);
    return { sectorData, geoData };
  }, [selectedScpis, weights]);


  const getRiskLabel = (score: number) => {
    if (score <= 2) return 'Prudent';
    if (score <= 4) return 'Modéré';
    if (score <= 5) return 'Dynamique';
    return 'Agressif';
  };

  const getRiskColor = (score: number) => {
    if (score <= 2) return 'text-green-400';
    if (score <= 4) return 'text-blue-400';
    if (score <= 5) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (selectedScpis.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-2xl p-6 border-2 border-emerald-500/30 shadow-xl mb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Analyse du Portefeuille</h3>
          <p className="text-xs text-slate-400">
            {selectedScpis.length} SCPI • {stats.sectorsCount} Secteurs
          </p>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Rendement */}
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <p className="text-xs text-slate-400 font-medium">Rendement</p>
          </div>
          <p className="text-2xl font-bold text-emerald-400 mb-1">
            {stats.yield.toFixed(2)}%
          </p>
          <p className="text-xs text-slate-500">Moyen</p>
        </div>

        {/* Revenus/mois */}
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-blue-400" />
            <p className="text-xs text-slate-400 font-medium">Revenus/mois</p>
          </div>
          <p className="text-2xl font-bold text-blue-400 mb-1">
            {Math.round(stats.monthlyRevenue)}€
          </p>
          <p className="text-xs text-slate-500">Estimé</p>
        </div>

        {/* Secteurs / Zones */}
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <PieChart className="w-4 h-4 text-purple-400" />
            <p className="text-xs text-slate-400 font-medium">Secteurs / Zones</p>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <p className="text-2xl font-bold text-purple-400">{stats.sectorsCount}</p>
              <p className="text-xs text-slate-500">Secteurs distincts</p>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div>
              <p className="text-2xl font-bold text-purple-400">{stats.zonesCount}</p>
              <p className="text-xs text-slate-500">Zones</p>
            </div>
          </div>
        </div>

        {/* Qualité (TOF) */}
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-green-400" />
            <p className="text-xs text-slate-400 font-medium">Qualité</p>
          </div>
          <p className="text-2xl font-bold text-green-400 mb-1">
            {stats.quality.toFixed(1)}%
          </p>
          <p className="text-xs text-slate-500">TOF</p>
        </div>

        {/* Profil Risque */}
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <p className="text-xs text-slate-400 font-medium">Profil Risque</p>
          </div>
          <p className={`text-2xl font-bold mb-1 ${getRiskColor(stats.riskScore)}`}>
            {getRiskLabel(stats.riskScore)}
          </p>
          {/* Risk scale */}
          <div className="flex items-center gap-1 mt-2">
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <div
                key={i}
                className={`flex-1 h-1.5 rounded-full ${
                  i <= stats.riskScore
                    ? stats.riskScore <= 2
                      ? 'bg-green-400'
                      : stats.riskScore <= 4
                      ? 'bg-blue-400'
                      : stats.riskScore <= 5
                      ? 'bg-yellow-400'
                      : 'bg-red-400'
                    : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-slate-600">1</span>
            <span className="text-xs text-slate-600">7</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioSummaryHeader;
