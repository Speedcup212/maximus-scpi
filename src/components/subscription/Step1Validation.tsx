import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, TrendingUp, AlertTriangle } from 'lucide-react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { calculateAverageYield } from '../../utils/subscriptionValidation';
import { formatCurrency } from '../../utils/formatters';

interface Step1ValidationProps {
  onClose?: () => void;
}

const Step1Validation: React.FC<Step1ValidationProps> = ({ onClose }) => {
  const { state, updateState, goToStep, validateStep } = useSubscription();
  const [allocationError, setAllocationError] = useState<string>('');

  const avgYield = calculateAverageYield(state.selectedScpis);
  const estimatedAnnual = (state.amount * avgYield) / 100;
  const estimatedMonthly = estimatedAnnual / 12;

  // Initialiser l'allocation si vide
  useEffect(() => {
    if (state.selectedScpis.length > 0 && Object.keys(state.allocation).length === 0) {
      const equalAllocation = 100 / state.selectedScpis.length;
      const allocation: Record<number, number> = {};
      state.selectedScpis.forEach(scpi => {
        allocation[scpi.id] = equalAllocation;
      });
      updateState({ allocation });
    }
  }, [state.selectedScpis, state.allocation, updateState]);

  const handleAllocationChange = (scpiId: number, newPercentage: number) => {
    const clamped = Math.max(0, Math.min(100, newPercentage));
    const newAllocation = { ...state.allocation, [scpiId]: clamped };
    
    // Vérifier la somme
    const sum = Object.values(newAllocation).reduce((acc, val) => acc + val, 0);
    if (sum > 100) {
      setAllocationError('La somme des allocations ne peut pas dépasser 100%');
    } else {
      setAllocationError('');
    }
    
    updateState({ allocation: newAllocation });
  };

  const balanceAllocation = () => {
    const equalAllocation = 100 / state.selectedScpis.length;
    const allocation: Record<number, number> = {};
    state.selectedScpis.forEach(scpi => {
      allocation[scpi.id] = equalAllocation;
    });
    updateState({ allocation });
    setAllocationError('');
  };

  const handleContinue = () => {
    if (!validateStep(1)) {
      setAllocationError('La somme des allocations doit être égale à 100%');
      return;
    }
    goToStep(2);
  };

  const allocationSum = Object.values(state.allocation).reduce((sum, val) => sum + val, 0);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour au comparateur</span>
          </button>
          <h1 className="text-3xl font-bold mb-2">Validation de votre sélection</h1>
          <p className="text-slate-400">
            {state.selectedScpis.length} SCPI sélectionnée{state.selectedScpis.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Récapitulatif SCPI */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4">Votre sélection</h2>
          <div className="space-y-3">
            {state.selectedScpis.map(scpi => (
              <div
                key={scpi.id}
                className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg"
              >
                <div>
                  <h3 className="font-bold text-white">{scpi.name}</h3>
                  <p className="text-sm text-slate-400">{scpi.managementCompany}</p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 font-bold">{scpi.yield.toFixed(2)}%</p>
                  <p className="text-sm text-slate-400">Rendement</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Rendement moyen estimé</span>
              <span className="text-2xl font-bold text-emerald-400">{avgYield.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        {/* Recommandation si < 3 SCPI */}
        {state.selectedScpis.length < 3 && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-yellow-400 mb-1">Recommandation de diversification</h3>
                <p className="text-sm text-slate-300">
                  Pour réduire les risques liés à la concentration, nous recommandons de sélectionner au moins 3 SCPI différentes.
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Cette recommandation n'est pas une obligation et ne constitue pas un conseil en investissement personnalisé.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Allocation */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Répartition de votre portefeuille</h2>
            <button
              onClick={balanceAllocation}
              className="text-sm text-emerald-400 hover:text-emerald-300"
            >
              Répartition équilibrée
            </button>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            Vous pouvez ajuster la répartition entre vos SCPI sélectionnées. La somme doit être égale à 100%.
          </p>
          
          <div className="space-y-4">
            {state.selectedScpis.map(scpi => {
              const percentage = state.allocation[scpi.id] || 0;
              const amount = Math.round((percentage / 100) * state.amount);
              const shares = Math.floor(amount / scpi.price);
              
              return (
                <div key={scpi.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{scpi.name}</span>
                    <span className="text-sm font-bold text-emerald-400">{percentage.toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.1"
                    value={percentage}
                    onChange={(e) => handleAllocationChange(scpi.id, parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{formatCurrency(amount)}</span>
                    <span>{shares} parts</span>
                  </div>
                </div>
              );
            })}
          </div>

          {allocationError && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">{allocationError}</p>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Total</span>
              <span className={`text-lg font-bold ${Math.abs(allocationSum - 100) < 0.01 ? 'text-emerald-400' : 'text-red-400'}`}>
                {allocationSum.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Simulation rapide */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Estimation indicative
          </h2>
          <p className="text-sm text-slate-400 mb-4">
            Pour un investissement de {formatCurrency(state.amount)} :
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-xs text-slate-400 mb-1">Revenus annuels estimés</p>
              <p className="text-2xl font-bold text-emerald-400">{formatCurrency(estimatedAnnual)}</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-xs text-slate-400 mb-1">Revenus mensuels estimés</p>
              <p className="text-2xl font-bold text-emerald-400">{formatCurrency(estimatedMonthly)}</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">
            💡 Ces estimations sont fournies à titre indicatif. Les performances futures peuvent varier. Votre conseiller pourra vous donner plus de précisions.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-700">
          <p className="text-xs text-slate-400 leading-relaxed">
            ⚠️ Les investissements en SCPI présentent un risque de perte en capital et une liquidité non garantie. Les performances passées ne préjugent pas des performances futures.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors"
          >
            Retour au comparateur
          </button>
          <button
            onClick={handleContinue}
            disabled={!validateStep(1)}
            className="flex-1 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
          >
            Définir mon investissement
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step1Validation;

