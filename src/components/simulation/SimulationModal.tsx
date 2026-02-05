import React, { useEffect, useState } from 'react';
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

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedScpis: SCPIExtended[];
}

const SimulationModal: React.FC<SimulationModalProps> = ({ isOpen, onClose, selectedScpis }) => {
  const { totalInvestment, setTotalInvestment, distributeEqually } = useAllocation();

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
