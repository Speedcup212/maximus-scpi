import React from 'react';
import { ArrowLeft, ArrowRight, Users, Briefcase } from 'lucide-react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { MaritalStatus, MaritalRegime } from '../../types/subscription';
import { childrenCount, professions, activitySectors } from '../../utils/subscriptionLists';

interface Step4SituationProps {
  onClose?: () => void;
}

const Step4Situation: React.FC<Step4SituationProps> = ({ onClose }) => {
  const { state, updateState, updateCoSubscriber, goToStep, validateStep } = useSubscription();

  const handleContinue = () => {
    if (!validateStep(4)) {
      return;
    }
    goToStep(5);
  };

  const isStepValid = validateStep(4);
  
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
            onClick={() => goToStep(3)}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-emerald-400" />
            Situation familiale & professionnelle
          </h1>
        </div>

        {/* Situation familiale */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4">Situation familiale</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">Situation matrimoniale</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(['celibataire', 'marie', 'pacs', 'divorce', 'veuf', 'concubinage'] as MaritalStatus[]).map(status => (
                <button
                  key={status}
                  onClick={() => updateState({ maritalStatus: status })}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    state.maritalStatus === status
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <span className="text-sm">
                    {status === 'celibataire' && 'Célibataire'}
                    {status === 'marie' && 'Marié(e)'}
                    {status === 'pacs' && 'PACS'}
                    {status === 'divorce' && 'Divorcé(e)'}
                    {status === 'veuf' && 'Veuf(ve)'}
                    {status === 'concubinage' && 'Concubinage'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {(state.maritalStatus === 'marie' || state.maritalStatus === 'pacs') && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">Régime matrimonial</label>
              <select
                value={state.maritalRegime || ''}
                onChange={(e) => updateState({ maritalRegime: e.target.value as MaritalRegime || null })}
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="">Sélectionner</option>
                <option value="communaute_universelle">Communauté universelle</option>
                <option value="communaute_reduite_aux_acquets">Communauté réduite aux acquêts</option>
                <option value="separation_biens">Séparation de biens</option>
                <option value="participation_aux_acquets">Participation aux acquêts</option>
                <option value="communaute_biens_meubles_acquets">Communauté de biens meubles et acquêts</option>
                <option value="indivision">Indivision</option>
                <option value="autre">Autre</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Nombre d'enfants à charge</label>
            <select
              value={state.dependentChildren}
              onChange={(e) => updateState({ dependentChildren: Number(e.target.value) })}
              className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
            >
              {childrenCount.map((count) => (
                <option key={count} value={count}>
                  {count === 0 ? 'Aucun' : count === 1 ? '1 enfant' : `${count} enfants`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Situation professionnelle */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-400" />
            Situation professionnelle
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Profession *</label>
              <select
                value={state.profession}
                onChange={(e) => updateState({ profession: e.target.value })}
                className={getFieldClasses(state.profession.trim() === '')}
              >
                <option value="">Sélectionner une profession</option>
                {professions.map((profession) => (
                  <option key={profession} value={profession}>
                    {profession}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Secteur d'activité *</label>
              <select
                value={state.activitySector}
                onChange={(e) => updateState({ activitySector: e.target.value })}
                className={getFieldClasses(state.activitySector.trim() === '')}
              >
                <option value="">Sélectionner un secteur</option>
                {activitySectors.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">Employeur</label>
            <input
              type="text"
              value={state.employer}
              onChange={(e) => updateState({ employer: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={state.activityOutsideEU}
                onChange={(e) => updateState({ activityOutsideEU: e.target.checked })}
                className="w-5 h-5 accent-emerald-500"
              />
              <span className="text-sm text-slate-300">Activité hors UE</span>
            </label>
          </div>
        </div>

        {/* Co-souscripteur - Situation familiale & professionnelle */}
        {state.subscriptionType === 'biens_communs' && state.coSubscriber && (
          <div className="bg-slate-800 rounded-2xl p-6 mb-6 border-2 border-blue-500/50">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Co-souscripteur - Situation familiale & professionnelle
            </h2>
            
            {/* Situation familiale Co-souscripteur */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-blue-300">Situation familiale</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">Situation matrimoniale *</label>
                <select
                  value={state.coSubscriber.maritalStatus}
                  onChange={(e) => updateCoSubscriber({ maritalStatus: e.target.value as MaritalStatus })}
                  className={getFieldClasses(state.coSubscriber.maritalStatus === undefined)}
                >
                  <option value="celibataire">Célibataire</option>
                  <option value="marie">Marié(e)</option>
                  <option value="pacs">PACS</option>
                  <option value="divorce">Divorcé(e)</option>
                  <option value="veuf">Veuf(ve)</option>
                  <option value="concubinage">Concubinage</option>
                </select>
              </div>

              {(state.coSubscriber.maritalStatus === 'marie' || state.coSubscriber.maritalStatus === 'pacs') && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Régime matrimonial</label>
                  <select
                    value={state.coSubscriber.maritalRegime || ''}
                    onChange={(e) => updateCoSubscriber({ maritalRegime: e.target.value as MaritalRegime || null })}
                    className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">Sélectionner un régime</option>
                    <option value="communaute_universelle">Communauté universelle</option>
                    <option value="communaute_reduite_aux_acquets">Communauté réduite aux acquêts</option>
                    <option value="separation_biens">Séparation de biens</option>
                    <option value="participation_aux_acquets">Participation aux acquêts</option>
                    <option value="communaute_biens_meubles_acquets">Communauté de biens meubles et acquêts</option>
                    <option value="indivision">Indivision</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">Nombre d'enfants à charge *</label>
                <select
                  value={state.coSubscriber.dependentChildren}
                  onChange={(e) => updateCoSubscriber({ dependentChildren: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                >
                  {childrenCount.map((count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Situation professionnelle Co-souscripteur */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-blue-300 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Situation professionnelle
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Profession *</label>
                  <select
                    value={state.coSubscriber.profession}
                    onChange={(e) => updateCoSubscriber({ profession: e.target.value })}
                    className={getFieldClasses(state.coSubscriber.profession.trim() === '')}
                  >
                    <option value="">Sélectionner une profession</option>
                    {professions.map((prof) => (
                      <option key={prof} value={prof}>
                        {prof}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Secteur d'activité *</label>
                  <select
                    value={state.coSubscriber.activitySector}
                    onChange={(e) => updateCoSubscriber({ activitySector: e.target.value })}
                    className={getFieldClasses(state.coSubscriber.activitySector.trim() === '')}
                  >
                    <option value="">Sélectionner un secteur</option>
                    {activitySectors.map((sector) => (
                      <option key={sector} value={sector}>
                        {sector}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">Employeur</label>
                <input
                  type="text"
                  value={state.coSubscriber.employer}
                  onChange={(e) => updateCoSubscriber({ employer: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.coSubscriber.activityOutsideEU}
                    onChange={(e) => updateCoSubscriber({ activityOutsideEU: e.target.checked })}
                    className="w-5 h-5 accent-emerald-500"
                  />
                  <span className="text-sm text-slate-300">Activité hors UE</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => goToStep(3)}
            className="flex-1 px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors"
          >
            Retour
          </button>
          <button
            onClick={handleContinue}
            disabled={!validateStep(4)}
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

export default Step4Situation;


