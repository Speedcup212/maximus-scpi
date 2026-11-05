import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, DollarSign, Calendar, BarChart3, AlertCircle } from 'lucide-react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { validateAmount, calculateAllocationAmounts, calculateAverageYield } from '../../utils/subscriptionValidation';
import { formatCurrency } from '../../utils/formatters';
import { DetentionMode, InvestmentHorizon } from '../../types/subscription';

interface Step2ParametrageProps {
  onClose?: () => void;
}

const Step2Parametrage: React.FC<Step2ParametrageProps> = () => {
  const { state, updateState, goToStep, validateStep } = useSubscription();
  const [amountError, setAmountError] = useState<string>('');

  const minInvestment = state.selectedScpis.reduce((sum, s) => sum + s.minInvestment, 0);
  const avgYield = calculateAverageYield(state.selectedScpis);
  const allocationAmounts = calculateAllocationAmounts(state.amount, state.allocation, state.selectedScpis);

  // Projection indicative (non-promissive)
  const calculateProjection = () => {
    const annualRevenue = (state.amount * avgYield) / 100;
    const years = state.horizon;
    const totalRevenue = annualRevenue * years;
    const totalValue = state.amount + totalRevenue;
    return { totalRevenue, totalValue, annualRevenue };
  };

  const projection = calculateProjection();

  const handleAmountChange = (newAmount: number) => {
    const validation = validateAmount(newAmount, minInvestment);
    if (!validation.valid) {
      setAmountError(validation.error || '');
    } else {
      setAmountError('');
    }
    updateState({ amount: newAmount, confirmedAmount: newAmount });
  };

  const handleAllocationChange = (scpiId: number, newPercentage: number) => {
    const clamped = Math.max(0, Math.min(100, newPercentage));
    const newAllocation = { ...state.allocation, [scpiId]: clamped };
    updateState({ allocation: newAllocation });
  };

  const balanceAllocation = () => {
    const equalAllocation = 100 / state.selectedScpis.length;
    const allocation: Record<number, number> = {};
    state.selectedScpis.forEach(scpi => {
      allocation[scpi.id] = equalAllocation;
    });
    updateState({ allocation });
  };

  const handleContinue = () => {
    if (!validateStep(2)) {
      if (state.amount < minInvestment) {
        setAmountError(`Le montant minimum est de ${minInvestment.toLocaleString('fr-FR')}€`);
      }
      return;
    }
    goToStep(3);
  };

  const allocationSum = Object.values(state.allocation).reduce((sum, val) => sum + val, 0);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => goToStep(1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour à la validation</span>
          </button>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-emerald-400" />
            Définir mon investissement
          </h1>
        </div>

        {/* Montant total */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4">Montant total à investir</h2>
          <p className="text-sm text-slate-400 mb-4">
            Définissez le montant que vous souhaitez investir dans votre portefeuille de SCPI.
          </p>
          <p className="text-xs text-slate-500 mb-4">
            Montant minimum : {formatCurrency(minInvestment)} (selon les SCPI sélectionnées)
          </p>
          
          <div className="relative mb-4">
            <input
              type="number"
              value={state.amount}
              onChange={(e) => handleAmountChange(Math.max(0, Number(e.target.value)))}
              min={minInvestment}
              step={1000}
              className="w-full px-6 py-4 bg-slate-700 border-2 border-slate-600 rounded-xl text-white text-2xl font-bold focus:border-emerald-500 focus:outline-none transition-colors"
            />
            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">€</span>
          </div>

          {amountError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
              <p className="text-sm text-red-400">{amountError}</p>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            {[10000, 25000, 50000, 100000, 200000].map(amount => (
              <button
                key={amount}
                onClick={() => handleAmountChange(amount)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  state.amount === amount
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
              >
                {(amount / 1000).toFixed(0)}K€
              </button>
            ))}
          </div>
        </div>

        {/* Répartition */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Répartition par SCPI</h2>
            <button
              onClick={balanceAllocation}
              className="text-sm text-emerald-400 hover:text-emerald-300"
            >
              Répartition équilibrée
            </button>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            Ajustez la répartition de votre investissement entre les SCPI sélectionnées. La somme doit être égale à 100%.
          </p>

          <div className="space-y-4">
            {state.selectedScpis.map(scpi => {
              const percentage = state.allocation[scpi.id] || 0;
              const { amount, shares } = allocationAmounts[scpi.id] || { amount: 0, shares: 0 };
              
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

          <div className="mt-4 pt-4 border-t border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Total</span>
              <span className={`text-lg font-bold ${Math.abs(allocationSum - 100) < 0.01 ? 'text-emerald-400' : 'text-red-400'}`}>
                {allocationSum.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Mode de détention */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4">Mode de détention</h2>
          <p className="text-sm text-slate-400 mb-4">
            Choisissez le support fiscal qui vous convient :
          </p>
          
          <div className="space-y-3">
            {(['direct', 'av', 'per'] as DetentionMode[]).map(mode => (
              <label
                key={mode}
                className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  state.detentionMode === mode
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="detentionMode"
                  value={mode}
                  checked={state.detentionMode === mode}
                  onChange={() => updateState({ detentionMode: mode })}
                  className="mt-1"
                />
                <div>
                  <div className="font-semibold text-white">
                    {mode === 'direct' && 'Détention directe'}
                    {mode === 'av' && 'Assurance-vie'}
                    {mode === 'per' && 'PER (Plan Épargne Retraite)'}
                  </div>
                  <div className="text-sm text-slate-400 mt-1">
                    {mode === 'direct' && 'Fiscalité au barème progressif de l\'IR'}
                    {mode === 'av' && 'Avantages fiscaux après 8 ans de détention'}
                    {mode === 'per' && 'Déduction fiscale immédiate, sortie à la retraite'}
                  </div>
                </div>
              </label>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-4">
            💡 Besoin d'aide pour choisir ? Vous pourrez en discuter avec votre conseiller lors de la finalisation.
          </p>
        </div>

        {/* Horizon */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            Horizon d'investissement
          </h2>
          <p className="text-sm text-slate-400 mb-4">
            Quel est votre horizon d'investissement ? Cette information nous permet de vous proposer des projections adaptées.
          </p>
          <div className="flex gap-2 flex-wrap">
            {([5, 10, 15, 20] as InvestmentHorizon[]).map(horizon => (
              <button
                key={horizon}
                onClick={() => updateState({ horizon })}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  state.horizon === horizon
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
              >
                {horizon} ans
              </button>
            ))}
          </div>
          <p className="text-xs text-yellow-400 mt-4 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            Les SCPI sont des investissements à long terme. Un horizon de 10 ans minimum est recommandé.
          </p>
        </div>

        {/* Projection indicative */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Estimation sur {state.horizon} ans
          </h2>
          <p className="text-sm text-slate-400 mb-4">
            Cette estimation est basée sur les performances passées des SCPI sélectionnées, avec un réinvestissement des revenus.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-xs text-slate-400 mb-1">Capital initial</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(state.amount)}</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-xs text-slate-400 mb-1">Revenus cumulés estimés</p>
              <p className="text-2xl font-bold text-emerald-400">{formatCurrency(projection.totalRevenue)}</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-xs text-slate-400 mb-1">Valeur totale estimée</p>
              <p className="text-2xl font-bold text-cyan-400">{formatCurrency(projection.totalValue)}</p>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-xs text-blue-400 leading-relaxed">
              💡 Cette estimation est fournie à titre indicatif pour vous donner une idée de votre projet. Les performances futures peuvent varier. Votre conseiller pourra vous donner plus de précisions lors de votre échange.
            </p>
          </div>
        </div>

        {/* Disclaimer renforcé */}
        <div className="bg-slate-800/50 rounded-xl p-6 mb-6 border border-slate-700">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            Avertissements importants
          </h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>• <strong>Risque de perte en capital :</strong> La valeur de vos parts peut baisser</li>
            <li>• <strong>Liquidité non garantie :</strong> La revente de vos parts n'est pas garantie et peut prendre plusieurs mois</li>
            <li>• <strong>Performances passées :</strong> Les performances passées ne préjugent pas des performances futures</li>
            <li>• <strong>Fiscalité :</strong> Les règles fiscales peuvent évoluer et impacter votre rendement net</li>
            <li>• <strong>Frais :</strong> Des frais d'entrée et de gestion s'appliquent et réduisent votre rendement net</li>
          </ul>
          <div className="mt-4 pt-4 border-t border-slate-700">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={true}
                readOnly
                className="mt-1"
              />
              <span className="text-sm text-slate-300">
                En investissant, vous reconnaissez avoir pris connaissance de ces risques.
              </span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => goToStep(1)}
            className="flex-1 px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors"
          >
            Retour à la validation
          </button>
          <button
            onClick={handleContinue}
            disabled={!validateStep(2)}
            className="flex-1 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
          >
            Continuer vers la souscription
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step2Parametrage;

