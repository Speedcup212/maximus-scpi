import React from 'react';
import { ArrowLeft, ArrowRight, Target, TrendingUp, DollarSign, Shield, Lightbulb } from 'lucide-react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { formatCurrency } from '../../utils/formatters';
import { RiskTolerance, FundingMode, InvestmentHorizon, RiskReaction, ScpiKnowledge } from '../../types/subscription';

interface Step2ProjetProps {
  onClose?: () => void;
}

const OBJECTIVE_OPTIONS = [
  'Valoriser un capital',
  'Disposer de revenus complémentaires immédiats',
  'Disposer de revenus complémentaires à moyen ou long terme',
  'Utiliser un contrat comme instrument de garantie',
  'Projet immobilier',
  'Transmettre un capital',
  'Préparation retraite',
  'Diversification patrimoniale',
  'Optimisation fiscale',
  'Autre'
];

const Step2Projet: React.FC<Step2ProjetProps> = ({ onClose }) => {
  const { state, updateState, goToStep, validateStep } = useSubscription();

  const isObjectiveSelected = (obj: string): boolean => {
    return state.primaryObjective === obj || state.secondaryObjectives.includes(obj);
  };

  const getTotalSelectedCount = (): number => {
    // Compter tous les objectifs uniques sélectionnés
    const allSelected = new Set<string>();
    if (state.primaryObjective && state.primaryObjective.trim() !== '') {
      allSelected.add(state.primaryObjective);
    }
    state.secondaryObjectives.forEach(obj => {
      if (obj && obj.trim() !== '' && obj !== state.primaryObjective) {
        allSelected.add(obj);
      }
    });
    const count = allSelected.size;
    console.log('[getTotalSelectedCount] primaryObjective:', state.primaryObjective, 'secondaryObjectives:', state.secondaryObjectives, 'count:', count);
    return count;
  };

  const toggleObjective = (obj: string) => {
    const selected = isObjectiveSelected(obj);
    const currentCount = getTotalSelectedCount();

    console.log('[toggleObjective] Objectif:', obj, 'Sélectionné:', selected, 'Count actuel:', currentCount);
    console.log('[toggleObjective] primaryObjective:', state.primaryObjective);
    console.log('[toggleObjective] secondaryObjectives:', state.secondaryObjectives);

    if (!selected) {
      // Vérifier la limite de 3 objectifs AVANT d'ajouter
      if (currentCount >= 3) {
        console.log('[toggleObjective] Limite atteinte, blocage');
        return; // Ne pas permettre la sélection si déjà 3 objectifs
      }

      // Ajout d'un nouvel objectif
      if (!state.primaryObjective || state.primaryObjective.trim() === '') {
        // Premier objectif sélectionné = principal
        console.log('[toggleObjective] Premier objectif -> primaryObjective');
        updateState({
          primaryObjective: obj,
          secondaryObjectives: [],
        });
      } else {
        // Objectif supplémentaire (ajouté aux secondaires)
        // Vérifier qu'il n'est pas déjà dans primaryObjective ou secondaryObjectives
        if (state.primaryObjective !== obj && !state.secondaryObjectives.includes(obj)) {
          console.log('[toggleObjective] Objectif supplémentaire -> secondaryObjectives');
          updateState({
            secondaryObjectives: [...state.secondaryObjectives, obj],
          });
        } else {
          console.log('[toggleObjective] Objectif déjà présent ou identique au primary, ignoré');
        }
      }
    } else {
      // Retrait d'un objectif
      const newSecondaries = state.secondaryObjectives.filter(o => o !== obj);
      let newPrimary = state.primaryObjective;

      if (state.primaryObjective === obj) {
        // Si on retire l'objectif principal, on choisit le suivant comme principal
        newPrimary = newSecondaries[0] || '';
        // Retirer aussi le nouveau primary des secondaires s'il y en a
        if (newPrimary) {
          updateState({
            primaryObjective: newPrimary,
            secondaryObjectives: newSecondaries.filter(o => o !== newPrimary),
          });
          return;
        }
      }

      updateState({
        primaryObjective: newPrimary,
        secondaryObjectives: newSecondaries,
      });
    }
  };


  const handleContinue = () => {
    if (!validateStep(2)) {
      return;
    }
    goToStep(3);
  };

  const isStepValid = validateStep(2);

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
            <span>Retour</span>
          </button>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Target className="w-8 h-8 text-emerald-400" />
            Votre projet d'investissement
          </h1>
          <p className="text-slate-400">
            Ces informations permettent de comprendre votre objectif et votre situation
          </p>
        </div>

        {/* Objectifs principaux */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            Vos objectifs principaux pour ces placements *
          </h2>
          <p className="text-sm text-slate-400 mb-4">
            Sélectionnez jusqu'à 3 objectifs pour cet investissement
            {getTotalSelectedCount() > 0 && (
              <span className="ml-2 text-orange-400 font-semibold">
                ({getTotalSelectedCount()}/3 sélectionné{getTotalSelectedCount() > 1 ? 's' : ''})
              </span>
            )}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {OBJECTIVE_OPTIONS.map(obj => {
              const selected = isObjectiveSelected(obj);
              const totalSelected = getTotalSelectedCount();
              // Désactiver uniquement si on a déjà 3 objectifs ET que celui-ci n'est pas sélectionné
              const isDisabled = !selected && totalSelected >= 3;
              
              return (
                <button
                  key={obj}
                  onClick={() => toggleObjective(obj)}
                  disabled={isDisabled}
                  className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                    selected
                      ? 'border-orange-500 bg-orange-500/20 text-white shadow-lg shadow-orange-500/20'
                      : isDisabled
                      ? 'border-slate-800 bg-slate-800/50 text-slate-500 cursor-not-allowed'
                      : 'border-slate-700 hover:border-slate-600 text-white'
                  }`}
                >
                  <span className="font-medium text-white">{obj}</span>
                </button>
              );
            })}
          </div>
          {getTotalSelectedCount() >= 3 && (
            <p className="text-sm text-blue-400 mt-3">
              💡 Maximum de 3 objectifs atteint. Désélectionnez un objectif pour en choisir un autre.
            </p>
          )}
          {state.primaryObjective === 'Autre' && (
            <input
              type="text"
              value={state.primaryObjective}
              onChange={(e) => updateState({ primaryObjective: e.target.value })}
              placeholder="Précisez votre objectif"
              className="w-full mt-4 px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
            />
          )}
        </div>

        {/* Horizon */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            Horizon d'investissement *
          </h2>
          <p className="text-sm text-slate-400 mb-4">
            Sur quelle durée envisagez-vous de conserver cet investissement ?
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
        </div>

        {/* Montant */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-cyan-400" />
            Montant envisagé *
          </h2>
          <p className="text-sm text-slate-400 mb-4">
            Quel montant souhaitez-vous investir ?
          </p>
          <div className="relative mb-4">
            <input
              type="number"
              value={state.amount || ''}
              onChange={(e) => {
                const value = e.target.value === '' ? 0 : Math.max(0, Number(e.target.value));
                updateState({ amount: value, confirmedAmount: value });
              }}
              onFocus={(e) => {
                if (e.target.value === '0') {
                  e.target.select();
                }
              }}
              min={0}
              step={1000}
              className="w-full px-6 py-4 bg-slate-700 border-2 border-slate-600 rounded-xl text-white text-2xl font-bold focus:border-emerald-500 focus:outline-none transition-colors"
            />
            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">€</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[10000, 25000, 50000, 100000, 200000, 500000].map(amount => (
              <button
                key={amount}
                onClick={() => updateState({ amount, confirmedAmount: amount })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  state.amount === amount
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
              >
                {(amount / 1000).toFixed(0)}K€
              </button>
            ))}
          </div>
        </div>

        {/* Mode de financement */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4">Mode de financement envisagé *</h2>
          <div className="space-y-3">
            {(['fonds_propres', 'credit', 'mixte'] as FundingMode[]).map(mode => (
              <label
                key={mode}
                className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  state.fundingMode === mode
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="fundingMode"
                  value={mode}
                  checked={state.fundingMode === mode}
                  onChange={() => updateState({ fundingMode: mode })}
                  className="mt-1"
                />
                <div>
                  <div className="font-semibold text-white">
                    {mode === 'fonds_propres' && 'Fonds propres'}
                    {mode === 'credit' && 'Crédit'}
                    {mode === 'mixte' && 'Mixte (fonds propres + crédit)'}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Tolérance au risque */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-yellow-400" />
            Tolérance au risque *
          </h2>
          <p className="text-sm text-slate-400 mb-4">
            Quel niveau de variation de votre capital êtes-vous prêt à accepter ?
          </p>
          <div className="space-y-3">
            {(['faible', 'moderee', 'elevee'] as RiskTolerance[]).map(tolerance => (
              <label
                key={tolerance}
                className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  state.riskTolerance === tolerance
                    ? 'border-yellow-500 bg-yellow-500/10'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="riskTolerance"
                  value={tolerance}
                  checked={state.riskTolerance === tolerance}
                  onChange={() => updateState({ riskTolerance: tolerance })}
                  className="mt-1"
                />
                <div>
                  <div className="font-semibold text-white">
                    {tolerance === 'faible' && 'Faible'}
                    {tolerance === 'moderee' && 'Modérée'}
                    {tolerance === 'elevee' && 'Élevée'}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {tolerance === 'faible' &&
                      "Je privilégie la sécurité, même avec un rendement plus modéré"}
                    {tolerance === 'moderee' &&
                      "J’accepte des variations temporaires pour rechercher un meilleur équilibre"}
                    {tolerance === 'elevee' &&
                      "J’accepte des variations importantes en contrepartie d’un potentiel plus élevé"}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Réaction en cas de baisse temporaire */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4">
            Réaction en cas de baisse temporaire *
          </h2>
          <p className="text-sm text-slate-400 mb-4">
            Face à une baisse temporaire de la valeur de votre investissement, comment réagiriez-vous ?
          </p>
          <div className="space-y-3">
            {([
              { key: 'securiser', label: 'Je privilégierais la prudence et chercherais à limiter mon exposition' },
              { key: 'conserver', label: 'Je resterais investi, en cohérence avec mon horizon de placement' },
              { key: 'renforcer', label: 'Je verrais cette situation comme une opportunité d\'investissement' },
            ] as { key: RiskReaction; label: string }[]).map(option => (
              <label
                key={option.key}
                className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  state.riskReaction === option.key
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="riskReaction"
                  value={option.key}
                  checked={state.riskReaction === option.key}
                  onChange={() => updateState({ riskReaction: option.key })}
                  className="mt-1"
                />
                <span className="text-sm text-white">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Connaissance SCPI */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-blue-400" />
            Connaissance des risques liés aux SCPI / FIA *
          </h2>
          <p className="text-sm text-slate-400 mb-4">
            Avez-vous déjà investi dans des SCPI ou des Fonds d'Investissement Alternatifs (FIA), ou disposez-vous de connaissances sur ces produits ?
          </p>
          <div className="space-y-3">
            {([
              { key: 'aucune', label: 'Non, je découvre ces produits' },
              { key: 'generale', label: 'Oui, j\'en ai une connaissance générale (fonctionnement, risques principaux)' },
              { key: 'experimente', label: 'Oui, j\'ai déjà investi et je comprends les risques et modalités de sortie' },
            ] as { key: ScpiKnowledge; label: string }[]).map(option => (
              <label
                key={option.key}
                className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  state.scpiKnowledge === option.key
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="scpiKnowledge"
                  value={option.key}
                  checked={state.scpiKnowledge === option.key}
                  onChange={() => updateState({ scpiKnowledge: option.key })}
                  className="mt-1"
                />
                <span className="text-sm text-white">{option.label}</span>
              </label>
            ))}
          </div>
        </div>


        {/* Message */}
        <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-700">
          <p className="text-xs text-slate-400 leading-relaxed">
            💡 <strong>Rassurez-vous :</strong> Ces informations permettent à votre conseiller de mieux comprendre votre projet et de vous proposer un accompagnement adapté à vos objectifs.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => goToStep(1)}
            className="flex-1 px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors"
          >
            Retour
          </button>
          <button
            onClick={handleContinue}
            disabled={!validateStep(2)}
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

export default Step2Projet;

