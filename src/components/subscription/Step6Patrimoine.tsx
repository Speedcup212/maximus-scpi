import React from 'react';
import { ArrowLeft, ArrowRight, Building2, TrendingUp, CreditCard } from 'lucide-react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { formatCurrency } from '../../utils/formatters';

// Fonction pour formater un montant exact à l'euro près
const formatExactAmount = (amount: number): string => {
  return Math.round(amount).toLocaleString('fr-FR', { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0 
  }) + ' €';
};

interface Step6PatrimoineProps {
  onClose?: () => void;
}

const Step6Patrimoine: React.FC<Step6PatrimoineProps> = ({ onClose }) => {
  const { state, updateState, goToStep } = useSubscription();

  const handleContinue = () => {
    goToStep(7);
  };

  // Helper pour gérer les champs numériques (efface le 0 quand on tape)
  const handleNumberChange = (field: string, value: string) => {
    const numValue = value === '' ? 0 : Math.max(0, Number(value));
    updateState({ [field]: numValue } as any);
  };

  const handleNumberFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === '0') {
      e.target.select();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => goToStep(5)}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-emerald-400" />
            Situation patrimoniale (déclarative)
          </h1>
          <p className="text-slate-400">Ces informations sont déclaratives et servent à évaluer votre capacité financière</p>
        </div>

        {/* Patrimoine */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4">Patrimoine</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Résidence principale (€)</label>
              <input
                type="number"
                min="0"
                value={state.primaryResidence || ''}
                onChange={(e) => handleNumberChange('primaryResidence', e.target.value)}
                onFocus={handleNumberFocus}
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Résidence secondaire (€)</label>
              <input
                type="number"
                min="0"
                value={state.secondaryResidence || ''}
                onChange={(e) => handleNumberChange('secondaryResidence', e.target.value)}
                onFocus={handleNumberFocus}
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Investissement locatif (€)</label>
              <input
                type="number"
                min="0"
                value={state.rentalRealEstate || ''}
                onChange={(e) => handleNumberChange('rentalRealEstate', e.target.value)}
                onFocus={handleNumberFocus}
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Valeurs mobilières (€)</label>
              <input
                type="number"
                min="0"
                value={state.securities || ''}
                onChange={(e) => handleNumberChange('securities', e.target.value)}
                onFocus={handleNumberFocus}
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Assurance-vie (€)</label>
              <input
                type="number"
                min="0"
                value={state.assuranceVie || ''}
                onChange={(e) => handleNumberChange('assuranceVie', e.target.value)}
                onFocus={handleNumberFocus}
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Liquidités (€)</label>
              <input
                type="number"
                min="0"
                value={state.liquidities || ''}
                onChange={(e) => handleNumberChange('liquidities', e.target.value)}
                onFocus={handleNumberFocus}
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Livrets (€)</label>
              <input
                type="number"
                min="0"
                value={state.livrets || ''}
                onChange={(e) => handleNumberChange('livrets', e.target.value)}
                onFocus={handleNumberFocus}
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Or (€)</label>
                <input
                  type="number"
                  min="0"
                  value={state.or || ''}
                  onChange={(e) => handleNumberChange('or', e.target.value)}
                  onFocus={handleNumberFocus}
                  className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Collection (€)</label>
                <input
                  type="number"
                  min="0"
                  value={state.collection || ''}
                  onChange={(e) => handleNumberChange('collection', e.target.value)}
                  onFocus={handleNumberFocus}
                  className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Objets d'art (€)</label>
                <input
                  type="number"
                  min="0"
                  value={state.objetsArt || ''}
                  onChange={(e) => handleNumberChange('objetsArt', e.target.value)}
                  onFocus={handleNumberFocus}
                  className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Actifs professionnels (€)</label>
              <input
                type="number"
                min="0"
                value={state.actifsProfessionnels || ''}
                onChange={(e) => handleNumberChange('actifsProfessionnels', e.target.value)}
                onFocus={handleNumberFocus}
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Forêts (€)</label>
              <input
                type="number"
                min="0"
                value={state.forets || ''}
                onChange={(e) => handleNumberChange('forets', e.target.value)}
                onFocus={handleNumberFocus}
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Capital restant dû sur les emprunts en cours (€)</label>
              <input
                type="number"
                min="0"
                value={state.debts || ''}
                onChange={(e) => handleNumberChange('debts', e.target.value)}
                onFocus={handleNumberFocus}
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Autres (épargne, retraite...) (€)</label>
              <input
                type="number"
                min="0"
                value={state.otherAssets || ''}
                onChange={(e) => handleNumberChange('otherAssets', e.target.value)}
                onFocus={handleNumberFocus}
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            
            {/* Total du patrimoine */}
            <div className="pt-4 mt-4 border-t border-slate-700">
              <div className="flex items-center justify-between p-4 bg-blue-500/10 rounded-lg border-2 border-blue-500/30">
                <span className="text-lg font-bold text-blue-400">Total du patrimoine</span>
                <span className="text-2xl font-bold text-blue-400">
                  {formatExactAmount(
                    (state.primaryResidence || 0) + 
                    (state.secondaryResidence || 0) + 
                    (state.rentalRealEstate || 0) + 
                    (state.securities || 0) + 
                    (state.assuranceVie || 0) + 
                    (state.liquidities || 0) + 
                    (state.livrets || 0) + 
                    (state.or || 0) + 
                    (state.collection || 0) + 
                    (state.objetsArt || 0) + 
                    (state.actifsProfessionnels || 0) + 
                    (state.forets || 0) + 
                    (state.otherAssets || 0) -
                    (state.debts || 0) // Dettes soustraites du patrimoine
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Revenus */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Revenus
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Salaire (€/an)</label>
              <input
                type="number"
                min="0"
                value={state.salary || ''}
                onChange={(e) => handleNumberChange('salary', e.target.value)}
                onFocus={handleNumberFocus}
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Revenus fonciers (€/an)</label>
              <input
                type="number"
                min="0"
                value={state.rentalIncome || ''}
                onChange={(e) => handleNumberChange('rentalIncome', e.target.value)}
                onFocus={handleNumberFocus}
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Revenus financiers (BIC/BNC) (€/an)</label>
              <input
                type="number"
                min="0"
                value={state.financialIncome || ''}
                onChange={(e) => handleNumberChange('financialIncome', e.target.value)}
                onFocus={handleNumberFocus}
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Pensions et retraites (€/an)</label>
              <input
                type="number"
                min="0"
                value={state.pensions || ''}
                onChange={(e) => handleNumberChange('pensions', e.target.value)}
                onFocus={handleNumberFocus}
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Autres (€/an)</label>
              <input
                type="number"
                min="0"
                value={state.otherIncome || ''}
                onChange={(e) => handleNumberChange('otherIncome', e.target.value)}
                onFocus={handleNumberFocus}
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            
            {/* Total des revenus */}
            <div className="pt-4 mt-4 border-t border-slate-700">
              <div className="flex items-center justify-between p-4 bg-emerald-500/10 rounded-lg border-2 border-emerald-500/30">
                <span className="text-lg font-bold text-emerald-400">Total des revenus</span>
                <span className="text-2xl font-bold text-emerald-400">
                  {formatExactAmount(
                    (state.salary || 0) + 
                    (state.rentalIncome || 0) + 
                    (state.financialIncome || 0) + 
                    (state.pensions || 0) + 
                    (state.otherIncome || 0)
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Charges annuelles brutes */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-red-400" />
            Charges annuelles brutes
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Loyer (€/an)</label>
              <input
                type="number"
                min="0"
                value={state.rent || ''}
                onChange={(e) => handleNumberChange('rent', e.target.value)}
                onFocus={handleNumberFocus}
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Crédits sur les résidences principales et secondaires (€/an)</label>
              <input
                type="number"
                min="0"
                value={state.creditsResidences || ''}
                onChange={(e) => handleNumberChange('creditsResidences', e.target.value)}
                onFocus={handleNumberFocus}
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Crédits sur l'immobilier locatif (€/an)</label>
              <input
                type="number"
                min="0"
                value={state.creditsLocatif || ''}
                onChange={(e) => handleNumberChange('creditsLocatif', e.target.value)}
                onFocus={handleNumberFocus}
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Crédits à la consommation (€/an)</label>
              <input
                type="number"
                min="0"
                value={state.creditsConsommation || ''}
                onChange={(e) => handleNumberChange('creditsConsommation', e.target.value)}
                onFocus={handleNumberFocus}
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Montant de l'impôt sur le revenu de l'année précédente (€/an)</label>
              <input
                type="number"
                min="0"
                value={state.incomeTax || ''}
                onChange={(e) => handleNumberChange('incomeTax', e.target.value)}
                onFocus={handleNumberFocus}
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Montant de IFI de l'année précédente (€/an)</label>
              <input
                type="number"
                min="0"
                value={state.ifi || ''}
                onChange={(e) => handleNumberChange('ifi', e.target.value)}
                onFocus={handleNumberFocus}
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Autres charges (€/an)</label>
              <input
                type="number"
                min="0"
                value={state.otherCharges || ''}
                onChange={(e) => handleNumberChange('otherCharges', e.target.value)}
                onFocus={handleNumberFocus}
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            
            {/* Total des charges */}
            <div className="pt-4 mt-4 border-t border-slate-700">
              <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border-2 border-red-500/30">
                <span className="text-lg font-bold text-red-400">Total des charges (€/an)</span>
                <span className="text-2xl font-bold text-red-400">
                  {formatExactAmount(
                    (state.rent || 0) +
                    (state.creditsResidences || 0) +
                    (state.creditsLocatif || 0) +
                    (state.creditsConsommation || 0) +
                    (state.incomeTax || 0) +
                    (state.ifi || 0) +
                    (state.otherCharges || 0)
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => goToStep(5)}
            className="flex-1 px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors"
          >
            Retour
          </button>
          <button
            onClick={handleContinue}
            className="flex-1 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
          >
            Continuer
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step6Patrimoine;


