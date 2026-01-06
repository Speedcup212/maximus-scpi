import React from 'react';
import { Check, Plus, BarChart3, Sparkles } from 'lucide-react';
import { SCPIExtended } from '../../data/scpiDataExtended';
import { TMIValue, isEuropeanSCPI, calculateNetYield, shouldOptimizeForTax } from '../../utils/taxOptimization';

interface SCPITableRowProps {
  scpi: SCPIExtended;
  isSelected: boolean;
  onToggleSelect: () => void;
  onAnalyze: () => void;
  userTmi?: TMIValue;
}

const SCPITableRow: React.FC<SCPITableRowProps> = ({ scpi, isSelected, onToggleSelect, onAnalyze, userTmi = null }) => {
  const isEuropean = isEuropeanSCPI(scpi);
  const showTaxOptimization = shouldOptimizeForTax(userTmi) && isEuropean;
  const netYield = userTmi !== null ? calculateNetYield(scpi.yield, userTmi, isEuropean) : null;
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

  return (
    <tr
      className={`border-b transition-colors ${
        isSelected
          ? 'bg-orange-500/10 border-orange-500/30'
          : 'bg-slate-800 border-slate-700 hover:bg-slate-700/50'
      }`}
    >
      <td className="px-4 py-3">
        <div>
          <div className="font-bold text-white text-sm truncate">{scpi.name}</div>
          <div className="text-xs text-slate-400 truncate">{scpi.managementCompany}</div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1">
          <span className={`inline-block px-2 py-1 rounded-lg text-xs font-semibold border ${getCategoryColor(scpi.category)}`}>
            {scpi.category}
          </span>
          {showTaxOptimization && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 w-fit">
              <Sparkles className="w-3 h-3" />
              TMI {userTmi}%+
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <div className="text-base font-bold text-emerald-400">{scpi.yield.toFixed(2)}%</div>
          {netYield !== null && (
            <div className="text-xs text-slate-400">
              Net: <span className="font-semibold text-emerald-300">{netYield.toFixed(2)}%</span>
            </div>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm font-semibold text-white">{scpi.tof}%</div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm font-semibold text-white">{scpi.price}€</div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm font-semibold text-white truncate">{scpi.minInvestment.toLocaleString('fr-FR')}€</div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={onToggleSelect}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${
              isSelected
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white'
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
                <span>Comparer</span>
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
      </td>
    </tr>
  );
};

export default SCPITableRow;
