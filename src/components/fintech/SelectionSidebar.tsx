import React from 'react';
import { TrendingUp, ArrowRight, Trash2, X } from 'lucide-react';
import { SCPIExtended } from '../../data/scpiDataExtended';

interface SelectionSidebarProps {
  selectedScpis: SCPIExtended[];
  onRemove: (scpi: SCPIExtended) => void;
  onClear: () => void;
  onVisualize: () => void;
}

const SelectionSidebar: React.FC<SelectionSidebarProps> = ({
  selectedScpis,
  onRemove,
  onClear,
  onVisualize
}) => {
  if (selectedScpis.length === 0) {
    return (
      <div className="hidden lg:block lg:w-96 bg-slate-800 border-l border-slate-700 p-6">
        <div className="sticky top-24">
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-slate-700 mx-auto mb-4 flex items-center justify-center">
              <TrendingUp className="w-10 h-10 text-slate-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Votre Sélection
            </h3>
            <p className="text-sm text-slate-400">
              Cliquez sur "Sélectionner" pour ajouter des SCPI à votre portefeuille
            </p>
          </div>
        </div>
      </div>
    );
  }

  const avgYield = selectedScpis.reduce((sum, s) => sum + s.yield, 0) / selectedScpis.length;
  const minInvestment = selectedScpis.reduce((sum, s) => sum + s.minInvestment, 0);

  return (
    <div className="hidden lg:block lg:w-96 bg-gradient-to-b from-slate-800 to-slate-900 border-l border-slate-700 p-6">
      <div className="sticky top-24">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-white">
              Ma Sélection
            </h3>
            <button
              onClick={onClear}
              className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"
              title="Vider la sélection"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-slate-400">
            {selectedScpis.length} SCPI sélectionnée{selectedScpis.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="space-y-3 mb-6 max-h-[calc(100vh-450px)] overflow-y-auto">
          {selectedScpis.map(scpi => (
            <div
              key={scpi.id}
              className="bg-slate-900 rounded-lg p-4 border-2 border-emerald-500/30 hover:border-emerald-500/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <h4 className="font-bold text-white text-sm">{scpi.name}</h4>
                  <p className="text-xs text-slate-400">{scpi.managementCompany}</p>
                </div>
                <button
                  onClick={() => onRemove(scpi)}
                  className="p-1 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Rendement</p>
                  <p className="text-lg font-bold text-emerald-400">{scpi.yield.toFixed(2)}%</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Prix</p>
                  <p className="text-sm font-semibold text-white">{scpi.price}€</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-emerald-500/10 rounded-lg p-4 mb-4 border border-emerald-500/30">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-emerald-400 font-medium mb-1">Rendement moyen</p>
              <p className="text-xl font-bold text-emerald-400">
                {avgYield.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-emerald-400 font-medium mb-1">Investissement min.</p>
              <p className="text-xl font-bold text-emerald-400">
                {minInvestment.toLocaleString('fr-FR')}€
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onVisualize}
          className="w-full py-4 px-6 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl font-bold text-base shadow-lg shadow-orange-500/30 hover:shadow-xl hover:from-orange-700 hover:to-orange-600 transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <span>Visualiser mes résultats</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-xs text-center text-slate-500 mt-4">
          Simulez votre portefeuille avec allocation personnalisée
        </p>
      </div>
    </div>
  );
};

export default SelectionSidebar;
