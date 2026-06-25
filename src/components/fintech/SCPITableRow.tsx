import React from 'react';
import { Check, Plus, BarChart3, Sparkles } from 'lucide-react';
import { SCPIExtended } from '../../data/scpiDataExtended';
import { TMIValue, isEuropeanSCPI, shouldOptimizeForTax } from '../../utils/taxOptimization';

interface SCPITableRowProps {
  scpi: SCPIExtended;
  score?: number | null;
  isSelected: boolean;
  onToggleSelect: () => void;
  onAnalyze: () => void;
  userTmi?: TMIValue;
}

const SCPITableRow: React.FC<SCPITableRowProps> = ({ scpi, score = null, isSelected, onToggleSelect, onAnalyze, userTmi = null }) => {
  const isEuropean = isEuropeanSCPI(scpi);
  const showTaxOptimization = shouldOptimizeForTax(userTmi) && isEuropean;
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Diversifiée': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Résidentiel': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Santé': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      'Bureaux': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Européenne': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Logistique': 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    };
    return colors[category] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  const getSectorColor = (sectorName: string) => {
    const name = sectorName.toLowerCase();
    if (name.includes('santé') || name.includes('ehpad')) return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
    if (name.includes('résidentiel') || name.includes('habitation')) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (name.includes('commerce') || name.includes('retail')) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    if (name.includes('logistique') || name.includes('entrepôt')) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    if (name.includes('bureau')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (name.includes('hôtel') || name.includes('tourisme')) return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  // Get main sector (highest percentage)
  const mainSector = scpi.sectors && scpi.sectors.length > 0 
    ? [...scpi.sectors].sort((a, b) => b.value - a.value)[0]
    : null;

  return (
    <div
      className={`grid grid-cols-[minmax(180px,1.4fr)_130px_120px_70px_80px_100px_72px_180px] items-center border-b px-4 py-4 transition-colors ${
        isSelected
          ? 'bg-orange-500/10 border-orange-500/30'
          : 'bg-slate-800 border-slate-700 hover:bg-slate-700/50'
      }`}
    >
      <div>
        <div className="font-bold text-white text-sm truncate">{scpi.name}</div>
        <div className="text-xs text-slate-400 truncate">{scpi.managementCompany}</div>
      </div>
      <div>
        <div className="flex flex-col gap-1">
          {mainSector ? (
            <span className={`inline-flex flex-col items-start px-2.5 py-1.5 rounded-lg text-xs font-semibold border leading-tight w-[96px] max-w-[104px] ${getSectorColor(mainSector.name)}`}>
              <span className="whitespace-nowrap">{mainSector.name}</span>
              <span className="whitespace-nowrap">{mainSector.value.toFixed(0)}%</span>
            </span>
          ) : (
            <span className={`inline-block px-2 py-1 rounded-lg text-xs font-semibold border max-w-[104px] ${getCategoryColor(scpi.category)}`}>
              {scpi.category}
            </span>
          )}
          {showTaxOptimization && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 w-fit">
              <Sparkles className="w-3 h-3" />
              TMI {userTmi}%+
            </span>
          )}
        </div>
      </div>
      <div>
        <div className="flex flex-col gap-0.5">
          <div className="text-base font-bold text-emerald-400">{scpi.yield.toFixed(2)}%</div>
          <div className="text-xs text-slate-500">Taux de distribution brut</div>
        </div>
      </div>
      <div>
        <div className="text-sm font-semibold text-white">{scpi.tof}%</div>
      </div>
      <div>
        <div className="text-sm font-semibold text-white">{scpi.price}€</div>
      </div>
      <div>
        <div className="text-sm font-semibold text-white truncate">{scpi.minInvestment.toLocaleString('fr-FR')}€</div>
      </div>
      <div>
        <span className="inline-flex items-center justify-center rounded-md bg-slate-800 px-2 py-1 text-xs font-semibold text-white whitespace-nowrap">
          {score != null ? `${Math.round(score)}/100` : 'N/A'}
        </span>
      </div>
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={onToggleSelect}
          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${
            isSelected
              ? 'bg-amber-500 hover:bg-amber-600 text-white'
              : 'bg-amber-500 hover:bg-amber-600 text-white'
          }`}
        >
          {isSelected ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Choisie</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter</span>
            </>
          )}
        </button>
        <button
          onClick={onAnalyze}
          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white rounded-lg font-semibold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Analyser</span>
        </button>
      </div>
    </div>
  );
};

export default SCPITableRow;
