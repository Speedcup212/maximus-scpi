import React from 'react';
import { X, TrendingUp, ArrowRight, Trash2 } from 'lucide-react';
import { usePortfolioContext } from '../../contexts/PortfolioContext';

interface PortfolioSidebarProps {
  onVisualize: () => void;
}

const PortfolioSidebar: React.FC<PortfolioSidebarProps> = ({ onVisualize }) => {
  const { selectedScpi, removeFromPortfolio, clearPortfolio, portfolioCount } = usePortfolioContext();

  if (portfolioCount === 0) {
    return (
      <div className="hidden lg:block lg:w-80 xl:w-96 bg-white border-l border-slate-200 p-6">
        <div className="sticky top-6">
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-slate-100 mx-auto mb-4 flex items-center justify-center">
              <TrendingUp className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Votre Sélection
            </h3>
            <p className="text-sm text-slate-500">
              Cliquez sur "Sélectionner" pour ajouter des SCPI à votre panier
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden lg:block lg:w-80 xl:w-96 bg-gradient-to-b from-white to-slate-50 border-l border-slate-200 p-6">
      <div className="sticky top-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-slate-900">
              Ma Sélection
            </h3>
            <button
              onClick={clearPortfolio}
              className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
              title="Vider la sélection"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-slate-600">
            {portfolioCount} SCPI sélectionnée{portfolioCount > 1 ? 's' : ''}
          </p>
        </div>

        {/* SCPI List */}
        <div className="space-y-3 mb-6 max-h-[calc(100vh-300px)] overflow-y-auto">
          {selectedScpi.map(scpi => (
            <div
              key={scpi.id}
              className="bg-white rounded-lg p-4 border-2 border-emerald-200 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 text-sm">{scpi.name}</h4>
                  <p className="text-xs text-slate-600">{scpi.managementCompany}</p>
                </div>
                <button
                  onClick={() => removeFromPortfolio(scpi.id)}
                  className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Rendement</p>
                  <p className="text-lg font-bold text-emerald-600">{scpi.yield.toFixed(2)}%</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Prix</p>
                  <p className="text-sm font-semibold text-slate-900">{scpi.price}€</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Summary */}
        <div className="bg-emerald-50 rounded-lg p-4 mb-4 border border-emerald-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-emerald-700 font-medium mb-1">Rendement moyen</p>
              <p className="text-xl font-bold text-emerald-900">
                {(selectedScpi.reduce((sum, s) => sum + s.yield, 0) / portfolioCount).toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-emerald-700 font-medium mb-1">Investissement min.</p>
              <p className="text-xl font-bold text-emerald-900">
                {selectedScpi.reduce((sum, s) => sum + s.minInvestment, 0).toLocaleString('fr-FR')}€
              </p>
            </div>
          </div>
        </div>

        {/* Visualize Button */}
        <button
          onClick={onVisualize}
          className="w-full py-4 px-6 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl font-bold text-base shadow-lg shadow-orange-200 hover:shadow-xl hover:from-orange-700 hover:to-orange-600 transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <span>Visualiser mes résultats</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-xs text-center text-slate-500 mt-4">
          Comparez les performances et optimisez votre portefeuille
        </p>
      </div>
    </div>
  );
};

export default PortfolioSidebar;
