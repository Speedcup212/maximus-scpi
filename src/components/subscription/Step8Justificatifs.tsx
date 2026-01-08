import React from 'react';
import { ArrowLeft, ArrowRight, FileText, Info } from 'lucide-react';
import { useSubscription } from '../../contexts/SubscriptionContext';

interface Step8JustificatifsProps {
  onClose?: () => void;
}

const Step8Justificatifs: React.FC<Step8JustificatifsProps> = ({ onClose }) => {
  const { goToStep } = useSubscription();

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
            Justificatifs
          </h1>
        </div>

        {/* Message informatif */}
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 mb-6">
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-bold mb-3 text-emerald-400">Simplification de votre démarche</h2>
              <p className="text-slate-300 leading-relaxed text-lg">
                Pour simplifier votre démarche, la collecte des pièces justificatives (Pièce d'identité, Justificatif de domicile) se fera directement avec votre conseiller lors de votre rendez-vous.
              </p>
            </div>
          </div>
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

export default Step8Justificatifs;



