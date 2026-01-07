import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, AlertTriangle, FileCheck, UserCheck } from 'lucide-react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import EricAvatar from '../EricAvatar';

interface Step9ValidationProps {
  onClose?: () => void;
}

const Step9Validation: React.FC<Step9ValidationProps> = ({ onClose }) => {
  const { state, updateState, goToStep, validateStep, submitPreDossier } = useSubscription();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!validateStep(9)) {
      setError('Veuillez cocher toutes les cases obligatoires');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setIsSuccess(false);

    try {
      const result = await submitPreDossier();
      
      if (result && result.success) {
        setIsSuccess(true);
        
        // Afficher une alerte de succès
        alert('✅ Votre pré-dossier a été enregistré avec succès !\n\nVotre conseiller vous contactera sous 24-48h pour finaliser votre projet ensemble.');
        
        // Rediriger vers la page d'accueil après 2 secondes
        setTimeout(() => {
          if (onClose) {
            onClose();
          } else {
            window.location.href = '/';
          }
        }, 2000);
      }
    } catch (err: any) {
      console.error('Erreur soumission:', err);
      
      // Afficher une alerte d'erreur
      const errorMessage = err?.message || 'Une erreur est survenue lors de l\'enregistrement. Veuillez réessayer.';
      alert(`❌ Erreur lors de l'enregistrement\n\n${errorMessage}`);
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => goToStep(8)}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <FileCheck className="w-8 h-8 text-emerald-400" />
            Validation client
          </h1>
          <p className="text-slate-400">Finalisation de votre pré-dossier</p>
        </div>

        {/* Cases obligatoires */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4">Validations obligatoires *</h2>
          
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={state.informationAccuracy}
                onChange={(e) => updateState({ informationAccuracy: e.target.checked })}
                className="mt-1 w-5 h-5 accent-emerald-500"
              />
              <div>
                <span className="text-sm font-medium text-white">Exactitude des informations fournies</span>
                <p className="text-xs text-slate-400 mt-1">
                  Je certifie que les informations renseignées dans ce formulaire sont exactes et complètes.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={state.riskUnderstanding}
                onChange={(e) => updateState({ riskUnderstanding: e.target.checked })}
                className="mt-1 w-5 h-5 accent-emerald-500"
              />
              <div>
                <span className="text-sm font-medium text-white">Compréhension des risques SCPI / FIA</span>
                <p className="text-xs text-slate-400 mt-1">
                  J'ai bien compris les risques liés à l'investissement en SCPI / FIA (risque de perte en capital, liquidité non garantie, etc.).
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={state.cifAnalysisAgreement}
                onChange={(e) => updateState({ cifAnalysisAgreement: e.target.checked })}
                className="mt-1 w-5 h-5 accent-emerald-500"
              />
              <div>
                <span className="text-sm font-medium text-white">Accord pour analyse CIF</span>
                <p className="text-xs text-slate-400 mt-1">
                  J'accepte que mon pré-dossier soit analysé par un Conseiller en Investissements Financiers.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={state.subscriptionUnderstanding}
                onChange={(e) => updateState({ subscriptionUnderstanding: e.target.checked })}
                className="mt-1 w-5 h-5 accent-emerald-500"
              />
              <div>
                <span className="text-sm font-medium text-white">Compréhension du processus de souscription</span>
                <p className="text-xs text-slate-400 mt-1">
                  Je comprends que mon conseiller analysera mon dossier et m'accompagnera pour finaliser ma souscription. Aucune souscription n'est réalisée à ce stade.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Message final */}
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start gap-4">
            <div className="flex-shrink-0">
              <EricAvatar size={100} className="ring-4 ring-emerald-500/50 shadow-2xl" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-emerald-400 mb-2">Prochaine étape : Votre conseiller vous contacte</h3>
              <div className="mb-3">
                <p className="text-sm font-semibold text-white">Eric Bellaiche</p>
                <p className="text-xs text-slate-400">Conseiller expert en construction de portefeuilles SCPI</p>
                <p className="text-xs text-slate-400">Conseiller en Investissements Financiers (CIF) – Membre de la CNCEF Patrimoine</p>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Votre dossier va être analysé par votre conseiller qui :
              </p>
              <ul className="text-sm text-slate-300 mt-2 space-y-1 list-disc list-inside ml-4">
                <li>Examinera votre projet avec attention</li>
                <li>Vérifiera la cohérence avec vos objectifs</li>
                <li>Vous proposera des ajustements si nécessaire</li>
                <li>Vous accompagnera jusqu'à la finalisation de votre souscription</li>
              </ul>
              <p className="text-sm text-slate-300 mt-3 font-semibold">
                ✨ Votre conseiller vous contactera sous 24-48h pour finaliser votre projet ensemble.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-400 mb-1">Erreur lors de l'enregistrement</p>
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </div>
        )}

        {isSuccess && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-6 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-emerald-400 mb-1">Pré-dossier enregistré avec succès !</p>
              <p className="text-sm text-emerald-300">Votre conseiller vous contactera sous 24-48h. Redirection en cours...</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => goToStep(8)}
            className="flex-1 px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors"
          >
            Retour
          </button>
          <button
            onClick={handleSubmit}
            disabled={!validateStep(9) || isSubmitting}
            className="flex-1 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin">⏳</span>
                Enregistrement...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Finaliser mon pré-dossier
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step9Validation;

