import React from 'react';
import { ArrowLeft, ArrowRight, Receipt, Globe } from 'lucide-react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { countries } from '../../utils/subscriptionLists';
import { PepStatus } from '../../types/subscription';

interface Step5FiscaleProps {
  onClose?: () => void;
}

const Step5Fiscale: React.FC<Step5FiscaleProps> = () => {
  const { state, updateState, updateCoSubscriber, goToStep, validateStep } = useSubscription();
  const [hasAttemptedValidation, setHasAttemptedValidation] = React.useState(false);
  const coSubscriber = state.coSubscriber;

  const handleContinue = () => {
    setHasAttemptedValidation(true);
    if (!validateStep(5)) {
      return;
    }
    goToStep(6);
  };

  
  // Fonction helper pour les classes de champs obligatoires
  const getFieldClasses = (isEmpty: boolean) => {
    const baseClasses = "w-full px-4 py-3 bg-slate-700 border-2 rounded-lg text-white focus:outline-none";
    if (hasAttemptedValidation && isEmpty) {
      return `${baseClasses} border-orange-500 focus:border-orange-500`;
    }
    return `${baseClasses} border-slate-600 focus:border-emerald-500`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => goToStep(4)}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Receipt className="w-8 h-8 text-emerald-400" />
            Situation fiscale & résidentielle
          </h1>
        </div>

        {/* Situation logement */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4">Situation logement</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(['proprietaire', 'locataire', 'heberge'] as const).map(situation => (
              <button
                key={situation}
                onClick={() => updateState({ housingSituation: situation })}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  state.housingSituation === situation
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <span className="text-sm">
                  {situation === 'proprietaire' && 'Propriétaire'}
                  {situation === 'locataire' && 'Locataire'}
                  {situation === 'heberge' && 'Logé à titre gratuit'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Résidence fiscale */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            Résidence fiscale
          </h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">Pays de résidence fiscale *</label>
            <select
              value={state.taxResidence}
              onChange={(e) => updateState({ taxResidence: e.target.value })}
              className={getFieldClasses(state.taxResidence === '')}
            >
              <option value="">Sélectionner un pays</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          {state.taxResidence !== state.country && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">Pays de résidence fiscale si différent</label>
              <select
                value={state.taxResidenceCountry}
                onChange={(e) => updateState({ taxResidenceCountry: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="">Sélectionner un pays</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Détail de la résidence fiscale */}
          <div className="mb-4 pt-4 border-t border-slate-700">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Détail de la résidence fiscale *</h3>
            <p className="text-xs text-slate-400 mb-3">
              Votre résidence fiscale est-elle la même que votre résidence principale ?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => updateState({ taxResidenceSameAsPrincipal: true })}
                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                  state.taxResidenceSameAsPrincipal === true
                    ? 'border-emerald-500 bg-emerald-500/10 text-white'
                    : hasAttemptedValidation && state.taxResidenceSameAsPrincipal === null
                    ? 'border-orange-500 bg-orange-500/10 text-white'
                    : 'border-slate-700 hover:border-slate-600 text-slate-300'
                }`}
              >
                Oui
              </button>
              <button
                onClick={() => updateState({ taxResidenceSameAsPrincipal: false })}
                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                  state.taxResidenceSameAsPrincipal === false
                    ? 'border-emerald-500 bg-emerald-500/10 text-white'
                    : hasAttemptedValidation && state.taxResidenceSameAsPrincipal === null
                    ? 'border-orange-500 bg-orange-500/10 text-white'
                    : 'border-slate-700 hover:border-slate-600 text-slate-300'
                }`}
              >
                Non
              </button>
            </div>
          </div>

        </div>

        {/* Statut fiscal – US Person */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4">Statut fiscal – US Person *</h2>
          
          <p className="text-xs text-slate-400 mb-4">
            Une "US Person" est une personne soumise à l'imposition aux États-Unis, en raison de sa nationalité, de sa résidence fiscale ou d'autres critères.
          </p>
          <p className="text-sm text-slate-300 mb-3 font-medium">
            Êtes-vous considéré(e) comme une "US Person" au sens de la réglementation fiscale américaine (FATCA) ?
          </p>
          <div className="space-y-3 mb-4">
            {([
              { key: false, label: 'Non, je ne suis pas une US Person' },
              { key: true, label: 'Oui, je suis une US Person' },
            ] as { key: boolean; label: string }[]).map(option => (
              <label
                key={String(option.key)}
                className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  state.usPerson === option.key
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="usPerson"
                  checked={state.usPerson === option.key}
                  onChange={() => {
                    updateState({ 
                      usPerson: option.key,
                      // Réinitialiser les champs si US Person est "Non"
                      usTaxObligation: option.key ? state.usTaxObligation : null,
                      usCitizenship: option.key ? state.usCitizenship : null
                    });
                  }}
                  className="mt-1"
                />
                <span className="text-sm text-white">{option.label}</span>
              </label>
            ))}
          </div>
          {state.usPerson && (
            <>
              <p className="text-xs text-amber-400 mb-4 font-medium">
                ⚠️ La souscription est autorisée sur papier uniquement
              </p>
              <div className="pt-4 border-t border-slate-700 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Obligation fiscale aux États-Unis
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => updateState({ usTaxObligation: true })}
                      className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                        state.usTaxObligation === true
                          ? 'border-emerald-500 bg-emerald-500/10 text-white'
                          : 'border-slate-700 hover:border-slate-600 text-slate-300'
                      }`}
                    >
                      Oui
                    </button>
                    <button
                      onClick={() => updateState({ usTaxObligation: false })}
                      className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                        state.usTaxObligation === false
                          ? 'border-emerald-500 bg-emerald-500/10 text-white'
                          : 'border-slate-700 hover:border-slate-600 text-slate-300'
                      }`}
                    >
                      Non
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Citoyenneté américaine
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => updateState({ usCitizenship: true })}
                      className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                        state.usCitizenship === true
                          ? 'border-emerald-500 bg-emerald-500/10 text-white'
                          : 'border-slate-700 hover:border-slate-600 text-slate-300'
                      }`}
                    >
                      Oui
                    </button>
                    <button
                      onClick={() => updateState({ usCitizenship: false })}
                      className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                        state.usCitizenship === false
                          ? 'border-emerald-500 bg-emerald-500/10 text-white'
                          : 'border-slate-700 hover:border-slate-600 text-slate-300'
                      }`}
                    >
                      Non
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Personne politiquement exposée */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4">Personne politiquement exposée (PPE) *</h2>
          
          <p className="text-xs text-slate-400 mb-4">
            Une personne politiquement exposée est une personne qui exerce ou a exercé des fonctions publiques importantes, ainsi que certains membres de son entourage proche.
          </p>
          <p className="text-sm text-slate-300 mb-3 font-medium">
            Êtes-vous concerné(e) ?
          </p>
          <div className="space-y-3">
            {([
              { key: 'non', label: 'Non, je ne suis pas une personne politiquement exposée' },
              { key: 'oui_personne', label: 'Oui, je suis une personne politiquement exposée' },
              { key: 'oui_proche', label: 'Oui, je suis un proche ou un membre de la famille d\'une personne politiquement exposée' },
            ] as { key: PepStatus; label: string }[]).map(option => (
              <label
                key={option.key}
                className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  state.pep === option.key
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="pep"
                  value={option.key}
                  checked={state.pep === option.key}
                  onChange={() => updateState({ pep: option.key })}
                  className="mt-1"
                />
                <span className="text-sm text-white">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Co-souscripteur - Situation fiscale */}
        {state.subscriptionType === 'biens_communs' && coSubscriber && (
          <div className="bg-slate-800 rounded-2xl p-6 mb-6 border-2 border-blue-500/50">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-400" />
              Co-souscripteur - Situation fiscale & résidentielle
            </h2>
            
            {/* Situation logement Co-souscripteur */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-blue-300">Situation logement</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['proprietaire', 'locataire', 'heberge'] as const).map((situation) => (
                  <label
                    key={situation}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      coSubscriber.housingSituation === situation
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="coHousingSituation"
                      value={situation}
                      checked={coSubscriber.housingSituation === situation}
                      onChange={() => updateCoSubscriber({ housingSituation: situation })}
                      className="mt-1"
                    />
                    <span className="text-sm text-white">
                      {situation === 'proprietaire' ? 'Propriétaire' : situation === 'locataire' ? 'Locataire' : 'Logé à titre gratuit'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Résidence fiscale Co-souscripteur */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-blue-300">Résidence fiscale</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Pays de résidence fiscale *</label>
                  <select
                    value={coSubscriber.taxResidence}
                    onChange={(e) => updateCoSubscriber({ taxResidence: e.target.value })}
                    className={getFieldClasses(coSubscriber.taxResidence === '')}
                  >
                    <option value="">Sélectionner un pays</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
                
                {coSubscriber.taxResidenceSameAsPrincipal === false && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Pays de résidence fiscale si différent</label>
                    <select
                      value={coSubscriber.taxResidenceCountry}
                      onChange={(e) => updateCoSubscriber({ taxResidenceCountry: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="">Sélectionner un pays</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Détail de la résidence fiscale Co-souscripteur */}
              <div className="mb-4">
                <p className="text-sm font-semibold text-slate-300 mb-3">Détail de la résidence fiscale *</p>
                <p className="text-xs text-slate-400 mb-3">Votre résidence fiscale est-elle la même que votre résidence principale ?</p>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => updateCoSubscriber({ taxResidenceSameAsPrincipal: true })}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
                      coSubscriber.taxResidenceSameAsPrincipal === true
                        ? 'bg-emerald-600 text-white'
                        : hasAttemptedValidation && coSubscriber.taxResidenceSameAsPrincipal === null
                        ? 'bg-orange-600 text-white border-2 border-orange-500'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    Oui
                  </button>
                  <button
                    type="button"
                    onClick={() => updateCoSubscriber({ taxResidenceSameAsPrincipal: false })}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
                      coSubscriber.taxResidenceSameAsPrincipal === false
                        ? 'bg-emerald-600 text-white'
                        : hasAttemptedValidation && coSubscriber.taxResidenceSameAsPrincipal === null
                        ? 'bg-orange-600 text-white border-2 border-orange-500'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    Non
                  </button>
                </div>
              </div>
            </div>


            {/* US Person et PEP Co-souscripteur - Deux blocs séparés */}
            <div className="space-y-6">
              {/* US Person Co-souscripteur */}
              <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                <h3 className="text-lg font-semibold mb-4 text-blue-300">Statut fiscal – US Person</h3>
                <p className="text-sm text-slate-400 mb-4">
                  Une "US Person" est une personne soumise à l'imposition aux États-Unis, en raison de sa nationalité, de sa résidence fiscale ou d'autres critères.
                </p>
                <p className="text-sm font-medium text-slate-300 mb-4">
                  Êtes-vous considéré(e) comme une "US Person" au sens de la réglementation fiscale américaine (FATCA) ?
                </p>
                <div className="space-y-3">
                  {([
                    { key: false, label: 'Non, je ne suis pas une US Person' },
                    { key: true, label: 'Oui, je suis une US Person' },
                  ] as { key: boolean; label: string }[]).map(option => (
                    <label
                      key={String(option.key)}
                      className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        coSubscriber.usPerson === option.key
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="coUsPerson"
                        checked={coSubscriber.usPerson === option.key}
                        onChange={() => updateCoSubscriber({ usPerson: option.key })}
                        className="mt-1"
                      />
                      <span className="text-sm text-white">{option.label}</span>
                    </label>
                  ))}
                </div>
                
                {coSubscriber.usPerson && (
                  <div className="mt-4 space-y-4">
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                      <p className="text-sm text-yellow-400">
                        ⚠️ La souscription est autorisée sur papier uniquement
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-slate-300 mb-2">Obligation fiscale aux États-Unis</p>
                        <div className="flex gap-4">
                          <button
                            type="button"
                            onClick={() => updateCoSubscriber({ usTaxObligation: true })}
                            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                              coSubscriber.usTaxObligation === true
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                          >
                            Oui
                          </button>
                          <button
                            type="button"
                            onClick={() => updateCoSubscriber({ usTaxObligation: false })}
                            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                              coSubscriber.usTaxObligation === false
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                          >
                            Non
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-slate-300 mb-2">Citoyenneté américaine</p>
                        <div className="flex gap-4">
                          <button
                            type="button"
                            onClick={() => updateCoSubscriber({ usCitizenship: true })}
                            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                              coSubscriber.usCitizenship === true
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                          >
                            Oui
                          </button>
                          <button
                            type="button"
                            onClick={() => updateCoSubscriber({ usCitizenship: false })}
                            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                              coSubscriber.usCitizenship === false
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                          >
                            Non
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* PEP Co-souscripteur */}
              <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                <h3 className="text-lg font-semibold mb-4 text-blue-300">Personne politiquement exposée (PPE)</h3>
                <p className="text-sm text-slate-400 mb-4">
                  Une personne politiquement exposée est une personne qui exerce ou a exercé des fonctions publiques importantes, ainsi que certains membres de son entourage proche.
                </p>
                <p className="text-sm font-medium text-slate-300 mb-4">
                  Êtes-vous concerné(e) ?
                </p>
                <div className="space-y-3">
                  {([
                    { key: 'non', label: 'Non, je ne suis pas une personne politiquement exposée' },
                    { key: 'oui_personne', label: 'Oui, je suis une personne politiquement exposée' },
                    { key: 'oui_proche', label: 'Oui, je suis un proche ou un membre de la famille d\'une personne politiquement exposée' },
                  ] as { key: PepStatus; label: string }[]).map(option => (
                    <label
                      key={option.key}
                      className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        coSubscriber.pep === option.key
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="coPep"
                        value={option.key}
                        checked={coSubscriber.pep === option.key}
                        onChange={() => updateCoSubscriber({ pep: option.key })}
                        className="mt-1"
                      />
                      <span className="text-sm text-white">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rappel */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-400 leading-relaxed">
            💡 <strong>Pourquoi ces informations ?</strong> Ces informations sont nécessaires pour assurer la conformité de votre dossier et permettre à votre conseiller de vous accompagner dans les meilleures conditions.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => goToStep(4)}
            className="flex-1 px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors"
          >
            Retour
          </button>
          <button
            onClick={handleContinue}
            disabled={!validateStep(5)}
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

export default Step5Fiscale;

