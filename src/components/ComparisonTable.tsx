import React, { useState } from 'react';
import { X, TrendingUp, Building, Award, Target, Calendar, Phone, ChevronDown, DollarSign } from 'lucide-react';
import { Scpi } from '../types/scpi';
import { formatCurrency, formatPercentage, getPerformanceColor, getDiscountColor } from '../utils/formatters';
// Force rebuild: 2025-10-23 05:55 UTC - CRITICAL: Deploy ComparisonTable accordion to production NOW

interface ComparisonTableProps {
  selectedScpi: Scpi[];
  onRemoveScpi: (scpiId: number) => void;
  onClose: () => void;
  onOpenRdvModal: () => void;
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({
  selectedScpi,
  onRemoveScpi,
  onClose,
  onOpenRdvModal
}) => {
  const [openSection, setOpenSection] = useState<'identity' | 'performance' | 'characteristics' | null>(null);

  const toggleSection = (section: 'identity' | 'performance' | 'characteristics') => {
    setOpenSection(openSection === section ? null : section);
  };

  if (selectedScpi.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-600">
        <div className="text-center py-8">
          <TrendingUp className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Aucune SCPI à comparer
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Sélectionnez au moins 2 SCPI pour voir la comparaison
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
      <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-600 bg-gradient-to-r from-blue-50 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/20">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            Comparaison de vos SCPI
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {selectedScpi.length} SCPI sélectionnée{selectedScpi.length > 1 ? 's' : ''} pour comparaison
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.open('https://calendly.com/maximusscpi/conseil-scpi', '_blank')}
            className="hidden md:flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Calendar className="w-5 h-5" />
            Prendre rendez-vous
          </button>
          <button
            onClick={onOpenRdvModal}
            className="hidden md:flex items-center gap-2 px-4 py-3 border-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 font-medium"
          >
            <Phone className="w-4 h-4" />
            Être rappelé
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-6 bg-gradient-to-r from-blue-50 via-blue-50 to-green-50 dark:from-blue-900/20 dark:via-blue-900/20 dark:to-green-900/20 border-b border-gray-200 dark:border-gray-600">
        <div className="text-center mb-4">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Optimisez votre sélection avec un expert
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Votre analyse détaillée vous sera présentée lors du rendez-vous, avec des recommandations personnalisées, sans frais ni engagement.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            onClick={() => window.open('https://calendly.com/maximusscpi/conseil-scpi', '_blank')}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Calendar className="w-6 h-6" />
            Prendre rendez-vous avec un expert
          </button>

          <button
            onClick={onOpenRdvModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 border-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 font-semibold"
          >
            <Phone className="w-5 h-5" />
            Être rappelé par un conseiller
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-600">
        <div className="border-b border-gray-200 dark:border-gray-600">
          <button
            onClick={() => toggleSection('identity')}
            className="w-full flex items-center justify-between p-4 md:p-5 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 hover:from-blue-50 hover:to-blue-50 dark:hover:from-gray-700 dark:hover:to-gray-700 transition-all duration-200 touch-manipulation min-h-[64px]"
          >
            <div className="flex items-center gap-3 md:gap-4">
              <Building className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-base md:text-lg font-bold text-gray-900 dark:text-white text-left">
                SCPI & Société
              </span>
            </div>
            <ChevronDown
              className={`w-5 h-5 md:w-6 md:h-6 text-gray-600 dark:text-gray-400 transition-transform duration-300 flex-shrink-0 ${
                openSection === 'identity' ? 'rotate-180' : ''
              }`}
            />
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              openSection === 'identity' ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="p-4 md:p-6 bg-white dark:bg-gray-800 space-y-4">
              {selectedScpi.map((scpi) => (
                <div
                  key={scpi.id}
                  className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700/30 dark:to-gray-800/30 p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        {scpi.name}
                      </h4>
                      <div className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">{scpi.company}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span>Créée en {scpi.creation}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveScpi(scpi.id)}
                      className="p-2 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors flex-shrink-0"
                      title="Retirer de la comparaison"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 dark:border-gray-600">
          <button
            onClick={() => toggleSection('performance')}
            className="w-full flex items-center justify-between p-4 md:p-5 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 hover:from-green-50 hover:to-green-50 dark:hover:from-gray-700 dark:hover:to-gray-700 transition-all duration-200 touch-manipulation min-h-[64px]"
          >
            <div className="flex items-center gap-3 md:gap-4">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
              <span className="text-base md:text-lg font-bold text-gray-900 dark:text-white text-left">
                Performance
              </span>
            </div>
            <ChevronDown
              className={`w-5 h-5 md:w-6 md:h-6 text-gray-600 dark:text-gray-400 transition-transform duration-300 flex-shrink-0 ${
                openSection === 'performance' ? 'rotate-180' : ''
              }`}
            />
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              openSection === 'performance' ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="p-4 md:p-6 bg-white dark:bg-gray-800 space-y-4">
              {selectedScpi.map((scpi) => (
                <div
                  key={scpi.id}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                      {scpi.name}
                    </h4>
                    <button
                      onClick={() => onRemoveScpi(scpi.id)}
                      className="p-2 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors flex-shrink-0"
                      title="Retirer de la comparaison"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg text-center">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Rendement</div>
                      <div className={`text-xl font-black ${getPerformanceColor(scpi.yield)}`}>
                        {scpi.yield.toFixed(2)}%
                      </div>
                    </div>
                    <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg text-center">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">TOF</div>
                      <div className={`text-xl font-black ${scpi.tof >= 95 ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {scpi.tof}%
                      </div>
                    </div>
                    <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg text-center">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Décote</div>
                      <div className={`text-xl font-black ${getDiscountColor(scpi.discount)}`}>
                        {formatPercentage(scpi.discount)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 dark:border-gray-600">
          <button
            onClick={() => toggleSection('characteristics')}
            className="w-full flex items-center justify-between p-4 md:p-5 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 hover:from-blue-50 hover:to-blue-50 dark:hover:from-gray-700 dark:hover:to-gray-700 transition-all duration-200 touch-manipulation min-h-[64px]"
          >
            <div className="flex items-center gap-3 md:gap-4">
              <Award className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-base md:text-lg font-bold text-gray-900 dark:text-white text-left">
                Caractéristiques
              </span>
            </div>
            <ChevronDown
              className={`w-5 h-5 md:w-6 md:h-6 text-gray-600 dark:text-gray-400 transition-transform duration-300 flex-shrink-0 ${
                openSection === 'characteristics' ? 'rotate-180' : ''
              }`}
            />
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              openSection === 'characteristics' ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="p-4 md:p-6 bg-white dark:bg-gray-800 space-y-4">
              {selectedScpi.map((scpi) => (
                <div
                  key={scpi.id}
                  className="bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                      {scpi.name}
                    </h4>
                    <button
                      onClick={() => onRemoveScpi(scpi.id)}
                      className="p-2 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors flex-shrink-0"
                      title="Retirer de la comparaison"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Capitalisation</span>
                      </div>
                      <span className="font-black text-gray-900 dark:text-white">
                        {formatCurrency(scpi.capitalization)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Label ISR</span>
                      </div>
                      {scpi.isr ? (
                        <span className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-xs font-semibold rounded-full">
                          ✓ ISR
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 text-sm">Non labellisé</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Frais d'entrée</span>
                      </div>
                      <span className={`font-black ${scpi.fees === 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                        {scpi.fees}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
          Résumé de la comparaison
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg text-center">
            <div className="text-sm text-green-600 dark:text-green-400 mb-1">Rendement moyen</div>
            <div className="text-xl font-bold text-green-800 dark:text-green-200">
              {(selectedScpi.reduce((sum, scpi) => sum + scpi.yield, 0) / selectedScpi.length).toFixed(2)}%
            </div>
          </div>

          <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg text-center">
            <div className="text-sm text-green-600 dark:text-green-400 mb-1">Cap. totale</div>
            <div className="text-xl font-bold text-green-800 dark:text-green-200">
              {formatCurrency(selectedScpi.reduce((sum, scpi) => sum + scpi.capitalization, 0))}
            </div>
          </div>

          <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg text-center">
            <div className="text-sm text-green-600 dark:text-green-400 mb-1">TOF moyen</div>
            <div className="text-xl font-bold text-green-800 dark:text-green-200">
              {(selectedScpi.reduce((sum, scpi) => sum + scpi.tof, 0) / selectedScpi.length).toFixed(1)}%
            </div>
          </div>

          <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg text-center">
            <div className="text-sm text-green-600 dark:text-green-400 mb-1">SCPI ISR</div>
            <div className="text-xl font-bold text-green-800 dark:text-green-200">
              {selectedScpi.filter(scpi => scpi.isr).length}/{selectedScpi.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonTable;
