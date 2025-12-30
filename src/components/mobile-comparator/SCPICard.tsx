import React, { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, Building2, PieChart, Target, Plus, Check, Info } from 'lucide-react';
import { SCPIMock } from '../../data/mockScpiData';
import { usePortfolioContext } from '../../contexts/PortfolioContext';

interface SCPICardProps {
  scpi: SCPIMock;
  onAnalyze: (scpi: SCPIMock) => void;
}

const SCPICard: React.FC<SCPICardProps> = ({ scpi, onAnalyze }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { addToPortfolio, removeFromPortfolio, isInPortfolio } = usePortfolioContext();

  const isSelected = isInPortfolio(scpi.id);

  const handleToggleSelection = () => {
    if (isSelected) {
      removeFromPortfolio(scpi.id);
    } else {
      addToPortfolio(scpi);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Diversifiée': 'bg-blue-100 text-blue-800',
      'Résidentiel': 'bg-green-100 text-green-800',
      'Santé': 'bg-pink-100 text-pink-800',
      'Bureaux': 'bg-purple-100 text-purple-800',
      'Européenne': 'bg-yellow-100 text-yellow-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-200 ${
        isSelected ? 'ring-4 ring-emerald-500 shadow-emerald-200' : ''
      }`}
    >
      {/* Header */}
      <div className={`p-4 border-b transition-colors ${
        isSelected ? 'bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-emerald-200' : 'bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200'
      }`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
                <Building2 className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{scpi.name}</h3>
                <p className="text-xs text-slate-600">{scpi.managementCompany}</p>
              </div>
            </div>
          </div>

          {/* Selection Badge */}
          {isSelected && (
            <div className="flex items-center gap-1 px-2 py-1 bg-emerald-600 text-white rounded-full text-xs font-bold">
              <Check className="w-3 h-3" />
              <span>Sélectionnée</span>
            </div>
          )}
        </div>

        {/* Category Badge */}
        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(scpi.category)}`}>
          {scpi.category}
        </span>
      </div>

      {/* Hero Metric - Yield */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-100 uppercase tracking-wide mb-1">
              Taux de Distribution
            </p>
            <p className="text-4xl font-bold">{scpi.yield.toFixed(2)}%</p>
          </div>
          <TrendingUp className="w-12 h-12 text-emerald-200 opacity-50" />
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="p-4 grid grid-cols-2 gap-4 bg-white border-b border-slate-100">
        <div>
          <p className="text-xs text-slate-500 mb-1">Prix de la part</p>
          <p className="text-xl font-bold text-slate-900">{scpi.price}€</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Investissement min.</p>
          <p className="text-xl font-bold text-slate-900">{scpi.minInvestment.toLocaleString('fr-FR')}€</p>
        </div>
      </div>

      {/* Expandable Section */}
      {isExpanded && (
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-4 animate-in slide-in-from-top duration-200">
          {/* Secondary Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <PieChart className="w-4 h-4 text-blue-600" />
                <p className="text-xs text-slate-600">Taux d'occupation</p>
              </div>
              <p className="text-lg font-bold text-slate-900">{scpi.tof}%</p>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-purple-600" />
                <p className="text-xs text-slate-600">Capitalisation</p>
              </div>
              <p className="text-lg font-bold text-slate-900">{scpi.capitalization}</p>
            </div>
          </div>

          {/* Strategy */}
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-emerald-600" />
              <p className="text-xs font-semibold text-slate-700">Stratégie</p>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{scpi.strategy}</p>
          </div>
        </div>
      )}

      {/* Expand/Collapse Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-3 px-4 flex items-center justify-center gap-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors active:bg-slate-100 border-b border-slate-100"
      >
        {isExpanded ? (
          <>
            <span>Voir moins</span>
            <ChevronUp className="w-4 h-4" />
          </>
        ) : (
          <>
            <span>Voir plus de détails</span>
            <ChevronDown className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Action Buttons */}
      <div className="p-4 grid grid-cols-2 gap-3 bg-slate-50">
        {/* Bouton Sélectionner (Primaire) */}
        <button
          onClick={handleToggleSelection}
          className={`py-3 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            isSelected
              ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-200'
              : 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600 shadow-md shadow-emerald-200'
          } active:scale-95`}
        >
          {isSelected ? (
            <>
              <Check className="w-4 h-4" />
              <span>Sélectionnée</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Sélectionner</span>
            </>
          )}
        </button>

        {/* Bouton Analyser (Secondaire) */}
        <button
          onClick={() => onAnalyze(scpi)}
          className="py-3 px-4 bg-white border-2 border-slate-300 text-slate-700 rounded-lg font-semibold text-sm hover:bg-slate-50 hover:border-slate-400 transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <Info className="w-4 h-4" />
          <span>Analyser</span>
        </button>
      </div>
    </div>
  );
};

export default SCPICard;
