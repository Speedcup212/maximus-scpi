import React from 'react';
import { X, Calculator, Info } from 'lucide-react';

export type TMIValue = 0 | 11 | 30 | 41 | 45 | null;

interface TaxOptimizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTMI: (tmi: TMIValue) => void;
  currentTMI: TMIValue;
}

const TaxOptimizationModal: React.FC<TaxOptimizationModalProps> = ({
  isOpen,
  onClose,
  onSelectTMI,
  currentTMI
}) => {
  if (!isOpen) return null;

  const tmiOptions = [
    { value: 0 as TMIValue, label: '0% (Non imposable)', description: 'Revenus < 11 295€' },
    { value: 11 as TMIValue, label: '11%', description: 'Revenus de 11 295€ à 28 798€' },
    { value: 30 as TMIValue, label: '30%', description: 'Revenus de 28 798€ à 82 342€' },
    { value: 41 as TMIValue, label: '41%', description: 'Revenus de 82 342€ à 177 106€' },
    { value: 45 as TMIValue, label: '45%', description: 'Revenus > 177 106€' },
  ];

  const handleSelect = (tmi: TMIValue) => {
    onSelectTMI(tmi);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-700">
        <div className="sticky top-0 bg-gradient-to-r from-slate-800 to-slate-900 p-6 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <Calculator className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Optimisation Fiscale</h2>
              <p className="text-sm text-slate-400 mt-0.5">Quelle est votre Tranche Marginale d'Imposition ?</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-400 mb-1">
                  Pourquoi est-ce important ?
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Pour les TMI ≥ 30%, nous prioriserons les <strong className="text-white">SCPI Européennes</strong> (hors France)
                  qui bénéficient d'une fiscalité beaucoup plus douce grâce aux conventions internationales.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {tmiOptions.map((option) => {
              const isSelected = currentTMI === option.value;
              const isHighTMI = option.value >= 30;

              return (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-500 shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-700/50 border-slate-600 hover:border-slate-500 hover:bg-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500'
                            : 'border-slate-500'
                        }`}>
                          {isSelected && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <div>
                          <p className={`text-lg font-bold ${
                            isSelected ? 'text-emerald-400' : 'text-white'
                          }`}>
                            {option.label}
                          </p>
                          <p className="text-sm text-slate-400 mt-0.5">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    </div>
                    {isHighTMI && (
                      <div className="ml-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-bold border border-amber-500/30">
                          Fiscalité élevée
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {currentTMI !== null && (
            <button
              onClick={() => handleSelect(null)}
              className="w-full mt-4 py-3 px-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-slate-300 hover:text-white rounded-xl font-medium text-sm transition-all"
            >
              Réinitialiser (aucune TMI)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaxOptimizationModal;
