import React, { useState } from 'react';
import { X, TrendingUp, Shield, Target, Calculator, DollarSign } from 'lucide-react';
import { ObjectiveType, InvestmentObjective } from '../types/scpi';

interface ObjectiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onObjectiveSelect: (objective: ObjectiveType, tmi: number) => void;
}

const INVESTMENT_OBJECTIVES: InvestmentObjective[] = [
  {
    id: 'revenus',
    name: 'Générer des revenus',
    description: 'Privilégier les distributions régulières et élevées',
    icon: '💰',
    color: '#10b981',
    criteria: {
      minYield: 5.0,
      preferredSectors: ['commerces', 'sante', 'bureaux'],
      maxSingleAllocation: 30
    }
  },
  {
    id: 'capitaliser',
    name: 'Capitaliser',
    description: 'Optimiser la valorisation du patrimoine à long terme',
    icon: '📈',
    color: '#3b82f6',
    criteria: {
      minYield: 4.0,
      preferredSectors: ['bureaux', 'logistique', 'residentiel'],
      preferredGeography: ['europe', 'international'],
      maxSingleAllocation: 35
    }
  },
  {
    id: 'diversifier',
    name: 'Diversifier',
    description: 'Répartir les risques sur plusieurs secteurs et zones',
    icon: '🎯',
    color: '#8b5cf6',
    criteria: {
      minYield: 3.5,
      preferredSectors: ['bureaux', 'commerces', 'sante', 'logistique'],
      preferredGeography: ['france', 'europe'],
      maxSingleAllocation: 25
    }
  },
  {
    id: 'fiscalite',
    name: 'Optimiser la fiscalité',
    description: 'Minimiser l\'impact fiscal selon votre TMI',
    icon: '🏛️',
    color: '#f59e0b',
    criteria: {
      minYield: 4.5,
      preferredGeography: ['europe', 'international'],
      maxSingleAllocation: 40
    }
  }
];

const ObjectiveModal: React.FC<ObjectiveModalProps> = ({
  isOpen,
  onClose,
  onObjectiveSelect
}) => {
  const [selectedTmi, setSelectedTmi] = useState<number>(30);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const handleObjectiveClick = (objective: ObjectiveType) => {
    onObjectiveSelect(objective, selectedTmi);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={handleBackdropClick}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 sm:p-4 max-w-3xl w-full max-h-[95vh] sm:h-[80vh] shadow-2xl border border-gray-200 dark:border-gray-600 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start sm:items-center mb-3 sm:mb-4 flex-shrink-0 gap-2">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white mb-1">
              🎯 Votre objectif
            </h2>
            <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
              Pour des recommandations personnalisées
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors flex-shrink-0"
            aria-label="Fermer"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 overscroll-contain">
          {/* TMI Selector - Compact */}
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-600">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="font-black text-gray-900 dark:text-white text-base sm:text-lg">
                  Votre TMI
                </h3>
                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                  Voir feuille d'imposition
                </p>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-1 sm:gap-2">
              {[
                { value: 0, label: '0%' },
                { value: 11, label: '11%' },
                { value: 30, label: '30%' },
                { value: 41, label: '41%' },
                { value: 45, label: '45%' }
              ].map((tmi) => (
                <button
                  key={tmi.value}
                  onClick={() => setSelectedTmi(tmi.value)}
                  className={`p-2 sm:p-3 rounded-lg border-2 transition-all duration-300 text-center touch-manipulation ${
                    selectedTmi === tmi.value
                      ? 'border-blue-500 bg-blue-500 text-white shadow-lg'
                      : 'border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:border-blue-300 dark:hover:border-blue-500'
                  }`}
                >
                  <div className="font-black text-sm sm:text-base">{tmi.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Objectives Grid - Compact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 pb-3">
            {INVESTMENT_OBJECTIVES.map((objective) => (
              <button
                key={objective.id}
                onClick={() => handleObjectiveClick(objective.id)}
                className="p-3 sm:p-4 rounded-xl border-2 border-gray-300 dark:border-gray-500 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-lg text-left touch-manipulation active:scale-95"
                style={{ borderColor: objective.color + '40' }}
              >
                <div className="flex items-start gap-2 mb-2">
                  <div
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: objective.color + '20' }}
                  >
                    <span className="text-lg sm:text-xl">{objective.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-gray-900 dark:text-white text-sm sm:text-base">
                      {objective.name}
                    </h4>
                    <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                      {objective.criteria.minYield && `Min: ${objective.criteria.minYield}%`}
                    </div>
                  </div>
                </div>
                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {objective.description}
                </p>
                <div className="text-xs sm:text-sm font-bold text-yellow-800 dark:text-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 p-1.5 sm:p-2 rounded">
                  {selectedTmi <= 11 ? (
                    objective.id === 'revenus' || objective.id === 'diversifier'
                      ? '✅ Recommandé'
                      : '⚠️ Moins optimal'
                  ) : selectedTmi >= 30 ? (
                    objective.id === 'fiscalite' || objective.id === 'capitaliser'
                      ? '✅ Recommandé'
                      : '⚠️ Impact fiscal'
                  ) : '📊 Compatible'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/30 rounded-b-2xl border-t border-gray-200 dark:border-gray-600 flex-shrink-0">
          <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white text-center">
            <strong>TMI : {selectedTmi}%</strong>
            {selectedTmi <= 11 && <span className="hidden sm:inline"> - SCPI françaises privilégiées</span>}
            {selectedTmi >= 30 && <span className="hidden sm:inline"> - SCPI européennes recommandées</span>}
            {selectedTmi > 11 && selectedTmi < 30 && <span className="hidden sm:inline"> - Équilibre performance/fiscalité</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObjectiveModal;