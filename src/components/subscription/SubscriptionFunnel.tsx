import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { SCPIExtended } from '../../data/scpiDataExtended';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { calculateMinInvestment } from '../../utils/subscriptionValidation';
import Step1Context from './Step1Context';
import Step2Projet from './Step2Projet';
// Les autres étapes seront créées progressivement
import Step3Identite from './Step3Identite';
import Step4Situation from './Step4Situation';
import Step5Fiscale from './Step5Fiscale';
import Step6Patrimoine from './Step6Patrimoine';
import Step7OrigineFonds from './Step7OrigineFonds';
import Step8Consentements from './Step8Consentements';
import Step9Validation from './Step9Validation';

interface SubscriptionFunnelProps {
  initialScpis?: SCPIExtended[];
  isOpen: boolean;
  onClose?: () => void;
}

const SubscriptionFunnel: React.FC<SubscriptionFunnelProps> = ({ 
  initialScpis = [], 
  isOpen,
  onClose 
}) => {
  const { state, updateState } = useSubscription();
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Empêcher le scroll de la page derrière le tunnel (éviter le double scroll)
  useEffect(() => {
    if (!isOpen) return;
    
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // Remonter en haut à chaque changement d'étape
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [state.currentStep]);

  // Initialiser avec les SCPI sélectionnées
  useEffect(() => {
    if (initialScpis.length > 0 && state.selectedScpis.length === 0) {
      // Allocation égale par défaut
      const equalAllocation = 100 / initialScpis.length;
      const allocation: Record<number, number> = {};
      initialScpis.forEach(scpi => {
        allocation[scpi.id] = equalAllocation;
      });

      const minInv = calculateMinInvestment(initialScpis);
      updateState({ 
        selectedScpis: initialScpis,
        allocation,
        amount: Math.max(50000, minInv),
        confirmedAmount: Math.max(50000, minInv),
      });
    }
  }, [initialScpis, state.selectedScpis.length, updateState]);

  // Ne pas rendre si fermé ou si aucune SCPI (APRÈS tous les hooks pour respecter les règles React)
  if (!isOpen || initialScpis.length === 0) {
    return null;
  }

  const steps = [
    { id: 1, label: 'Votre accompagnement' },
    { id: 2, label: 'Projet & profil' },
    { id: 3, label: 'Identité' },
    { id: 4, label: 'Situation' },
    { id: 5, label: 'Fiscalité' },
    { id: 6, label: 'Patrimoine' },
    { id: 7, label: 'Origine des fonds' },
    { id: 8, label: 'Consentements' },
    { id: 9, label: 'Validation finale' },
  ];

  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return <Step1Context onClose={onClose} />;
      case 2:
        return <Step2Projet onClose={onClose} />;
      case 3:
        return <Step3Identite onClose={onClose} />;
      case 4:
        return <Step4Situation onClose={onClose} />;
      case 5:
        return <Step5Fiscale onClose={onClose} />;
      case 6:
        return <Step6Patrimoine onClose={onClose} />;
      case 7:
        return <Step7OrigineFonds onClose={onClose} />;
      case 8:
        return <Step8Consentements onClose={onClose} />;
      case 9:
        return <Step9Validation onClose={onClose} />;
      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[10000] bg-slate-900 overflow-y-auto pt-16 md:pt-24"
      style={{ zIndex: 10000 }}
    >
      {/* Progress Header + Timeline
          Affiché uniquement à partir de l'étape 2 ("Votre projet d'investissement") */}
      {state.currentStep >= 2 && (
        <div className="bg-slate-900 border-b border-slate-800">
          <div className="max-w-5xl mx-auto px-4 pt-4 pb-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Parcours de souscription SCPI
                </p>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-slate-300">
                    Étape {state.currentStep} sur {steps.length}
                  </p>
                  <span className="text-xs text-orange-400 font-semibold">⏱️ 15 minutes</span>
                </div>
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  aria-label="Fermer le parcours"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Timeline desktop */}
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-y-1/2 left-0 right-0 h-0.5 bg-slate-800" />
                <div className="relative flex justify-between">
                  {steps.map(step => {
                    const isCompleted = step.id < state.currentStep;
                    const isCurrent = step.id === state.currentStep;
                    return (
                      <div
                        key={step.id}
                        className="flex flex-col items-center text-center w-full"
                      >
                        <div
                          className={[
                            'w-7 h-7 rounded-full flex items-center justify-center border-2 text-xs font-semibold transition-colors',
                            isCompleted
                              ? 'bg-emerald-500 border-emerald-400 text-slate-900'
                              : isCurrent
                              ? 'bg-slate-900 border-emerald-400 text-emerald-400'
                              : 'bg-slate-900 border-slate-700 text-slate-500',
                          ].join(' ')}
                        >
                          {step.id}
                        </div>
                        <div className="mt-2 max-w-[110px]">
                          <p
                            className={[
                              'text-[11px] leading-snug',
                              isCompleted || isCurrent
                                ? 'text-slate-200'
                                : 'text-slate-500',
                            ].join(' ')}
                          >
                            {step.label}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Compact progress bar on mobile */}
            <div className="md:hidden">
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(state.currentStep / steps.length) * 100}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                {steps[state.currentStep - 1]?.label}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="min-h-screen">
        {renderStep()}
      </div>
    </div>
  );
};

export default SubscriptionFunnel;

