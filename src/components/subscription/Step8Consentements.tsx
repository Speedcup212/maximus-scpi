import React from 'react';
import { ArrowLeft, ArrowRight, Mail, FileText } from 'lucide-react';
import { useSubscription } from '../../contexts/SubscriptionContext';

interface Step8ConsentementsProps {
  onClose?: () => void;
}

const Step8Consentements: React.FC<Step8ConsentementsProps> = ({ onClose }) => {
  const { state, updateState, goToStep } = useSubscription();

  const handleContinue = () => {
    goToStep(9);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => goToStep(7)}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <FileText className="w-8 h-8 text-emerald-400" />
            Communication & Consentements
          </h1>
        </div>

        {/* Documents électroniques */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4">Documents électroniques</h2>
          
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={state.electronicDocuments}
              onChange={(e) => updateState({ electronicDocuments: e.target.checked })}
              className="mt-1 w-5 h-5 accent-emerald-500"
            />
            <div>
              <span className="text-sm font-medium text-white">J'accepte de recevoir les documents par voie électronique</span>
              <p className="text-xs text-slate-400 mt-1">
                En cochant cette case, vous acceptez de recevoir vos documents contractuels et réglementaires par email plutôt que par courrier postal.
              </p>
            </div>
          </label>
        </div>

        {/* Communication */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4">Communication</h2>
          
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={state.emailConsent}
                onChange={(e) => updateState({ emailConsent: e.target.checked })}
                className="mt-1 w-5 h-5 accent-emerald-500"
              />
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-400" />
                <div>
                  <span className="text-sm font-medium text-white">Informations par email</span>
                  <p className="text-xs text-slate-400 mt-1">
                    J'accepte de recevoir des informations concernant mon projet d'investissement par email.
                  </p>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Note */}
        <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-700">
          <p className="text-xs text-slate-400 leading-relaxed">
            💡 Ces consentements sont optionnels mais recommandés pour faciliter la communication concernant votre projet.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => goToStep(7)}
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

export default Step8Consentements;




