import React, { useEffect, useMemo, useState } from 'react';
import { X, TrendingUp, DollarSign, Calendar, BarChart3, FileText } from 'lucide-react';
import { SCPIExtended } from '../../data/scpiDataExtended';
import { useAllocation } from '../../contexts/AllocationContext';
import PortfolioSummaryHeader from './PortfolioSummaryHeader';
import AllocationSliders from './AllocationSliders';
import KPICards from './KPICards';
import ProjectionChart from './ProjectionChart';
import SectorAllocation from './SectorAllocation';
import GeographyAllocation from './GeographyAllocation';
import LoadingSpinner from '../LoadingSpinner';
import { normalizeGeoLabel, normalizeSectorLabel } from '../../utils/labelNormalization';
import ZScoreBar from '../ZScoreBar';
import { getInvestorProfile } from '../../utils/investorProfile';

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedScpis: SCPIExtended[];
}

const SimulationModal: React.FC<SimulationModalProps> = ({ isOpen, onClose, selectedScpis }) => {
  const { totalInvestment, setTotalInvestment, distributeEqually } = useAllocation();
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

  console.log('✅ SimulationModal avec bouton SOUSCRIRE - Version 2025-12-20');

  useEffect(() => {
    if (isOpen && selectedScpis.length > 0) {
      distributeEqually(selectedScpis);
    }
  }, [isOpen, selectedScpis, distributeEqually]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Simulation d'Investissement</h2>
                  <p className="text-sm text-slate-400">
                    {selectedScpis.length} SCPI sélectionnée{selectedScpis.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="bg-slate-800 rounded-2xl p-4 sm:p-6 border border-slate-700 shadow-xl">
              <div className="flex items-center gap-2 text-sm text-slate-200 mb-1">
                <span>Indicateur de cohérence structurelle</span>
                <span className="text-slate-500" title="Z-score de cohérence MaximusSCPI® — Indicateur propriétaire d’écart structurel — non prédictif de performance.">ⓘ</span>
              </div>
              <ZScoreBar zScore={coherenceZScore} profileLabel={investorProfileLabel} variant="compact" />
            </div>

            {/* Portfolio Summary Header */}
            <PortfolioSummaryHeader selectedScpis={selectedScpis} />

            {/* Module A: Global Settings */}
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <DollarSign className="w-6 h-6 text-emerald-400" />
                <h3 className="text-xl font-bold text-white">Montant Total à Investir</h3>
              </div>
              <div className="max-w-md">
                <div className="relative">
                  <input
                    type="number"
                    value={totalInvestment}
                    onChange={(e) => setTotalInvestment(Math.max(0, Number(e.target.value)))}
                    className="w-full px-6 py-4 bg-slate-900 border-2 border-slate-700 rounded-xl text-white text-2xl font-bold focus:border-emerald-500 focus:outline-none transition-colors"
                    min="0"
                    step="1000"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">€</span>
                </div>
                <div className="mt-3 flex gap-2">
                  {[10000, 25000, 50000, 100000].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setTotalInvestment(amount)}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      {(amount / 1000).toFixed(0)}K€
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Module B: Allocation Sliders */}
            <AllocationSliders selectedScpis={selectedScpis} />

            {/* Module C: KPIs */}
            <KPICards selectedScpis={selectedScpis} />

            {/* Module D: Répartitions Sectorielle et Géographique */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sector Allocation */}
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
                <SectorAllocation selectedScpis={selectedScpis} />
              </div>

              {/* Geography Allocation */}
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
                <GeographyAllocation selectedScpis={selectedScpis} />
              </div>
            </div>

            {/* Module E: Projection Chart - Full Width */}
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl font-bold text-white">Projection sur 15 ans</h3>
              </div>
              <ProjectionChart selectedScpis={selectedScpis} />
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-800 border-t border-slate-700 px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Les résultats sont indicatifs et basés sur les performances passées
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors"
              >
                Retour
              </button>
              <button
                onClick={() => {
                  window.history.pushState({ scpis: selectedScpis }, '', '/souscription');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                <span>Commencer ma pré-souscription</span>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SimulationModal;
