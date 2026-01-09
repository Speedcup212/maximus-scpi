import React from 'react';
import { X, CheckCircle, TrendingUp, Shield } from 'lucide-react';
import { Portfolio, PortfolioType } from '../../types/guidedJourney';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  portfolio: Portfolio;
  investmentAmount: number;
  riskScore: number;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  portfolio,
  investmentAmount,
  riskScore,
}) => {
  if (!isOpen) return null;

  const riskLevelLabels = {
    faible: 'Faible',
    modere: 'Modéré',
    dynamique: 'Dynamique',
  };

  const portfolioObjectives: Record<PortfolioType, string> = {
    'revenus-stables': 'Générer des revenus réguliers tout en privilégiant la stabilité du capital',
    'revenus-croissance': 'Combiner revenus réguliers et croissance du capital sur le moyen terme',
    'croissance-long-terme': 'Faire progresser votre capital sur le long terme avec une approche équilibrée',
    'opportunites-immobilieres': 'Diversifier votre investissement avec une approche opportuniste',
    'immobilier-europeen': 'Investir dans l\'immobilier européen avec diversification géographique',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Confirmer votre choix</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Message principal */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <p className="text-lg text-slate-200 leading-relaxed">
              Avant de continuer, vérifions que cette recommandation correspond bien à votre projet.
            </p>
          </div>

          {/* Récapitulatif */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white mb-4">Récapitulatif de votre recommandation</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Type de portefeuille */}
              <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-700">
                <div className="text-xs text-slate-400 mb-1">Type de portefeuille</div>
                <div className="text-base font-bold text-white">{portfolio.name}</div>
              </div>

              {/* Objectif */}
              <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-700">
                <div className="text-xs text-slate-400 mb-1">Objectif</div>
                <div className="text-sm text-slate-200 leading-tight">
                  {portfolioObjectives[portfolio.id]}
                </div>
              </div>

              {/* Niveau de risque */}
              <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-700">
                <div className="text-xs text-slate-400 mb-1">Niveau de risque</div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span className="text-base font-bold text-white">
                    {riskLevelLabels[portfolio.riskLevel]}
                  </span>
                  <span className="text-xs text-slate-400">({riskScore}/7)</span>
                </div>
              </div>

              {/* Montant indicatif */}
              <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-700">
                <div className="text-xs text-slate-400 mb-1">Montant indicatif</div>
                <div className="text-lg font-bold text-emerald-400">
                  {investmentAmount.toLocaleString('fr-FR')} €
                </div>
              </div>
            </div>
          </div>

          {/* Message de rassurance */}
          <div className="bg-emerald-500/10 border-l-4 border-emerald-500 rounded-lg p-4">
            <p className="text-sm text-slate-200 leading-relaxed">
              <strong>Important :</strong> Cette recommandation est indicative et peut encore être ajustée 
              selon vos besoins spécifiques ou vos contraintes particulières lors de la souscription.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-800 border border-slate-600 text-slate-100 font-semibold rounded-xl hover:bg-slate-700 transition-colors"
            >
              Revenir à la recommandation
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-5 h-5" />
              Continuer vers la souscription
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
