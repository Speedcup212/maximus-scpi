import React from 'react';
import { ArrowLeft, ArrowRight, Coins, Globe } from 'lucide-react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { FundOrigin } from '../../types/subscription';
import { formatCurrency } from '../../utils/formatters';
import { countries } from '../../utils/subscriptionLists';

interface Step7OrigineFondsProps {
  onClose?: () => void;
}

const FUND_ORIGIN_OPTIONS: { value: FundOrigin; label: string }[] = [
  { value: 'salaires', label: 'Salaires' },
  { value: 'heritage', label: 'Héritage' },
  { value: 'donation', label: 'Donation' },
  { value: 'vente_immobilier', label: 'Vente immobilier' },
  { value: 'assurance_vie', label: 'Assurance-vie' },
  { value: 'epargne', label: 'Épargne' },
  { value: 'autre', label: 'Autre' },
];

const Step7OrigineFonds: React.FC<Step7OrigineFondsProps> = ({ onClose }) => {
  const { state, updateState, goToStep, validateStep } = useSubscription();

  const handleContinue = () => {
    if (!validateStep(7)) {
      return;
    }
    goToStep(8);
  };

  const isStepValid = validateStep(7);
  
  // Fonction helper pour les classes de champs obligatoires
  const getFieldClasses = (isEmpty: boolean) => {
    const baseClasses = "w-full px-4 py-3 bg-slate-700 border-2 rounded-lg text-white focus:outline-none";
    if (!isStepValid && isEmpty) {
      return `${baseClasses} border-orange-500 focus:border-orange-500`;
    }
    return `${baseClasses} border-slate-600 focus:border-emerald-500`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => goToStep(6)}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Coins className="w-8 h-8 text-emerald-400" />
            Origine des fonds (LCB-FT)
          </h1>
        </div>

        {/* Origine principale */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4">Origine principale des fonds *</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {FUND_ORIGIN_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => updateState({ primaryFundOrigin: option.value })}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  state.primaryFundOrigin === option.value
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : !isStepValid && state.primaryFundOrigin === undefined
                    ? 'border-orange-500 hover:border-orange-600'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <span className="font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Origines multiples */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4">Origines multiples</h2>
          
          <label className="flex items-center gap-3 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={state.multipleOrigins}
              onChange={(e) => updateState({ multipleOrigins: e.target.checked })}
              className="w-5 h-5 accent-emerald-500"
            />
            <span className="text-sm text-slate-300">Les fonds proviennent de plusieurs origines</span>
          </label>

          {state.multipleOrigins && (
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-2">
                Vous pourrez préciser les origines secondaires lors de la finalisation avec votre conseiller.
              </p>
            </div>
          )}
        </div>

        {/* Pays de provenance */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            Pays de provenance des fonds *
          </h2>
          
          <select
            value={state.fundOriginCountry}
            onChange={(e) => updateState({ fundOriginCountry: e.target.value })}
            className={getFieldClasses(state.fundOriginCountry === '')}
          >
            <option value="">Sélectionner un pays</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        {/* Message obligatoire */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-400 leading-relaxed">
            💡 <strong>Pourquoi ces informations ?</strong> Ces informations sont nécessaires pour assurer la sécurité et la conformité de votre dossier. Votre conseiller vous accompagnera dans le remplissage de ces informations si nécessaire.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => goToStep(6)}
            className="flex-1 px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors"
          >
            Retour
          </button>
          <button
            onClick={handleContinue}
            disabled={!validateStep(7)}
            className="flex-1 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
          >
            Continuer
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step7OrigineFonds;

