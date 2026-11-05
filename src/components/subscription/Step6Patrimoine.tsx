import React from 'react';
import { ArrowLeft, ArrowRight, Building2, TrendingUp, CreditCard, User } from 'lucide-react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import type { PatrimoineSepare } from '../../types/subscription';

type FinancialField = Exclude<keyof PatrimoineSepare, 'primaryFundOrigin' | 'fundAmount' | 'multipleOrigins' | 'secondaryOrigins' | 'fundOriginCountry'>;
type FinancialPatrimoine = Pick<PatrimoineSepare, FinancialField>;

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

// Composant réutilisable pour les champs patrimoniaux
interface PatrimoineFieldsProps {
  patrimoine: FinancialPatrimoine;
  onUpdate: (field: FinancialField, value: number) => void;
  title: string;
  color: string;
  borderColor: string;
}

const PatrimoineFields: React.FC<PatrimoineFieldsProps> = ({ 
  patrimoine, 
  onUpdate, 
  title, 
  color, 
  borderColor 
}) => {
  const handleNumberChange = (field: FinancialField, value: string) => {
    const numValue = value === '' ? 0 : Math.max(0, Number(value));
    onUpdate(field, numValue);
  };

  const handleNumberFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === '0') {
      e.target.select();
    }
  };

  // Calculer le total du patrimoine
  const totalPatrimoine = 
    (patrimoine.primaryResidence || 0) + 
    (patrimoine.secondaryResidence || 0) + 
    (patrimoine.rentalRealEstate || 0) + 
    (patrimoine.securities || 0) + 
    (patrimoine.assuranceVie || 0) + 
    (patrimoine.liquidities || 0) + 
    (patrimoine.livrets || 0) + 
    (patrimoine.or || 0) + 
    (patrimoine.collection || 0) + 
    (patrimoine.objetsArt || 0) + 
    (patrimoine.actifsProfessionnels || 0) + 
    (patrimoine.forets || 0) + 
    (patrimoine.otherAssets || 0) -
    (patrimoine.debts || 0);

  // Calculer le total des revenus
  const totalRevenus = 
    (patrimoine.salary || 0) + 
    (patrimoine.rentalIncome || 0) + 
    (patrimoine.financialIncome || 0) + 
    (patrimoine.pensions || 0) + 
    (patrimoine.otherIncome || 0);

  // Calculer le total des charges
  const totalCharges = 
    (patrimoine.rent || 0) +
    (patrimoine.creditsResidences || 0) +
    (patrimoine.creditsLocatif || 0) +
    (patrimoine.creditsConsommation || 0) +
    (patrimoine.incomeTax || 0) +
    (patrimoine.ifi || 0) +
    (patrimoine.otherCharges || 0);

  return (
    <div className={`bg-slate-800 rounded-2xl p-6 mb-6 border-2 ${borderColor}`}>
      <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${color}`}>
        <User className="w-5 h-5" />
        {title}
      </h2>

      {/* Patrimoine */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-slate-300">Patrimoine</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Résidence principale (€)</label>
            <input
              type="number"
              min="0"
              value={patrimoine.primaryResidence || ''}
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
              value={patrimoine.secondaryResidence || ''}
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
              value={patrimoine.rentalRealEstate || ''}
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
              value={patrimoine.securities || ''}
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
              value={patrimoine.assuranceVie || ''}
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
              value={patrimoine.liquidities || ''}
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
              value={patrimoine.livrets || ''}
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
                value={patrimoine.or || ''}
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
                value={patrimoine.collection || ''}
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
                value={patrimoine.objetsArt || ''}
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
              value={patrimoine.actifsProfessionnels || ''}
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
              value={patrimoine.forets || ''}
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
              value={patrimoine.debts || ''}
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
              value={patrimoine.otherAssets || ''}
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
                {formatExactAmount(totalPatrimoine)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenus */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-slate-300 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          Revenus
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Salaire (€/an)</label>
            <input
              type="number"
              min="0"
              value={patrimoine.salary || ''}
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
              value={patrimoine.rentalIncome || ''}
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
              value={patrimoine.financialIncome || ''}
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
              value={patrimoine.pensions || ''}
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
              value={patrimoine.otherIncome || ''}
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
                {formatExactAmount(totalRevenus)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charges annuelles brutes */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-slate-300 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-red-400" />
          Charges annuelles brutes
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Loyer (€/an)</label>
            <input
              type="number"
              min="0"
              value={patrimoine.rent || ''}
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
              value={patrimoine.creditsResidences || ''}
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
              value={patrimoine.creditsLocatif || ''}
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
              value={patrimoine.creditsConsommation || ''}
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
              value={patrimoine.incomeTax || ''}
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
              value={patrimoine.ifi || ''}
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
              value={patrimoine.otherCharges || ''}
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
                {formatExactAmount(totalCharges)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Step6Patrimoine: React.FC<Step6PatrimoineProps> = () => {
  const { state, updateState, goToStep } = useSubscription();

  const handleContinue = () => {
    goToStep(7);
  };

  // Initialiser les patrimoines séparés si nécessaire
  React.useEffect(() => {
    if (state.subscriptionType === 'biens_communs') {
      if (!state.patrimoineSouscripteur1) {
        updateState({
          patrimoineSouscripteur1: {
            primaryResidence: 0,
            secondaryResidence: 0,
            rentalRealEstate: 0,
            securities: 0,
            assuranceVie: 0,
            liquidities: 0,
            livrets: 0,
            or: 0,
            collection: 0,
            objetsArt: 0,
            actifsProfessionnels: 0,
            forets: 0,
            debts: 0,
            otherAssets: 0,
            salary: 0,
            rentalIncome: 0,
            financialIncome: 0,
            pensions: 0,
            otherIncome: 0,
            rent: 0,
            creditsResidences: 0,
            creditsLocatif: 0,
            creditsConsommation: 0,
            incomeTax: 0,
            ifi: 0,
            otherCharges: 0,
          }
        });
      }
      if (!state.patrimoineSouscripteur2) {
        updateState({
          patrimoineSouscripteur2: {
            primaryResidence: 0,
            secondaryResidence: 0,
            rentalRealEstate: 0,
            securities: 0,
            assuranceVie: 0,
            liquidities: 0,
            livrets: 0,
            or: 0,
            collection: 0,
            objetsArt: 0,
            actifsProfessionnels: 0,
            forets: 0,
            debts: 0,
            otherAssets: 0,
            salary: 0,
            rentalIncome: 0,
            financialIncome: 0,
            pensions: 0,
            otherIncome: 0,
            rent: 0,
            creditsResidences: 0,
            creditsLocatif: 0,
            creditsConsommation: 0,
            incomeTax: 0,
            ifi: 0,
            otherCharges: 0,
          }
        });
      }
      if (!state.patrimoineCommuns) {
        updateState({
          patrimoineCommuns: {
            primaryResidence: 0,
            secondaryResidence: 0,
            rentalRealEstate: 0,
            securities: 0,
            assuranceVie: 0,
            liquidities: 0,
            livrets: 0,
            or: 0,
            collection: 0,
            objetsArt: 0,
            actifsProfessionnels: 0,
            forets: 0,
            debts: 0,
            otherAssets: 0,
            salary: 0,
            rentalIncome: 0,
            financialIncome: 0,
            pensions: 0,
            otherIncome: 0,
            rent: 0,
            creditsResidences: 0,
            creditsLocatif: 0,
            creditsConsommation: 0,
            incomeTax: 0,
            ifi: 0,
            otherCharges: 0,
          }
        });
      }
    }
  }, [state.subscriptionType, state.patrimoineSouscripteur1, state.patrimoineSouscripteur2, state.patrimoineCommuns, updateState]);

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

        {state.subscriptionType === 'biens_communs' ? (
          <>
            {/* Co-souscription : 3 sections */}
            {state.patrimoineSouscripteur1 && (
              <PatrimoineFields
                patrimoine={state.patrimoineSouscripteur1}
                onUpdate={(field, value) => {
                  updateState({
                    patrimoineSouscripteur1: {
                      ...state.patrimoineSouscripteur1!,
                      [field]: value
                    }
                  });
                }}
                title="Souscripteur 1"
                color="text-emerald-400"
                borderColor="border-emerald-500/50"
              />
            )}

            {state.patrimoineSouscripteur2 && (
              <PatrimoineFields
                patrimoine={state.patrimoineSouscripteur2}
                onUpdate={(field, value) => {
                  updateState({
                    patrimoineSouscripteur2: {
                      ...state.patrimoineSouscripteur2!,
                      [field]: value
                    }
                  });
                }}
                title="Souscripteur 2"
                color="text-blue-400"
                borderColor="border-blue-500/50"
              />
            )}

            {state.patrimoineCommuns && (
              <PatrimoineFields
                patrimoine={state.patrimoineCommuns}
                onUpdate={(field, value) => {
                  updateState({
                    patrimoineCommuns: {
                      ...state.patrimoineCommuns!,
                      [field]: value
                    }
                  });
                }}
                title="Communs"
                color="text-purple-400"
                borderColor="border-purple-500/50"
              />
            )}

            {/* Message informatif */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-400 leading-relaxed">
                💡 <strong>Information :</strong> Vous pouvez remplir au choix les sections "Souscripteur 1", "Souscripteur 2" et "Communs" selon votre situation patrimoniale.
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Souscription simple : section unique */}
            <PatrimoineFields
              patrimoine={{
                primaryResidence: state.primaryResidence,
                secondaryResidence: state.secondaryResidence,
                rentalRealEstate: state.rentalRealEstate,
                securities: state.securities,
                assuranceVie: state.assuranceVie,
                liquidities: state.liquidities,
                livrets: state.livrets,
                or: state.or,
                collection: state.collection,
                objetsArt: state.objetsArt,
                actifsProfessionnels: state.actifsProfessionnels,
                forets: state.forets,
                debts: state.debts,
                otherAssets: state.otherAssets,
                salary: state.salary,
                rentalIncome: state.rentalIncome,
                financialIncome: state.financialIncome,
                pensions: state.pensions,
                otherIncome: state.otherIncome,
                rent: state.rent,
                creditsResidences: state.creditsResidences,
                creditsLocatif: state.creditsLocatif,
                creditsConsommation: state.creditsConsommation,
                incomeTax: state.incomeTax,
                ifi: state.ifi,
                otherCharges: state.otherCharges,
              }}
              onUpdate={(field, value) => {
                updateState({ [field]: value } as any);
              }}
              title="Patrimoine"
              color="text-slate-300"
              borderColor="border-slate-700"
            />
          </>
        )}

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
