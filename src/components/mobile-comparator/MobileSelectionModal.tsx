import React from 'react';
import { X, TrendingUp, ArrowRight, Trash2 } from 'lucide-react';
import { usePortfolioContext } from '../../contexts/PortfolioContext';

interface MobileSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVisualize: () => void;
}

const MobileSelectionModal: React.FC<MobileSelectionModalProps> = ({ isOpen, onClose, onVisualize }) => {
  const { selectedScpi, removeFromPortfolio, clearPortfolio, portfolioCount } = usePortfolioContext();

  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Ma Sélection</h2>
            <p className="text-sm text-slate-600">
              {portfolioCount} SCPI sélectionnée{portfolioCount > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearPortfolio}
              className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
              title="Vider la sélection"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {selectedScpi.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-slate-100 mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="w-10 h-10 text-slate-300" />
              </div>
              <p className="text-slate-500">Aucune SCPI sélectionnée</p>
            </div>
          ) : (
            <>
              {selectedScpi.map(scpi => (
                <div
                  key={scpi.id}
                  className="bg-white rounded-lg p-4 border-2 border-emerald-200 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900">{scpi.name}</h4>
                      <p className="text-xs text-slate-600">{scpi.managementCompany}</p>
                    </div>
                    <button
                      onClick={() => removeFromPortfolio(scpi.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Rendement</p>
                      <p className="text-xl font-bold text-emerald-600">{scpi.yield.toFixed(2)}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 mb-1">Prix</p>
                      <p className="text-lg font-semibold text-slate-900">{scpi.price}€</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Stats Summary */}
              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200 mt-4">
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
            </>
          )}
        </div>

        {/* Footer */}
        {selectedScpi.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <button
              onClick={onVisualize}
              className="w-full py-4 px-6 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl font-bold text-base shadow-lg shadow-orange-200 hover:shadow-xl hover:from-orange-700 hover:to-orange-600 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Visualiser mes résultats</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileSelectionModal;
