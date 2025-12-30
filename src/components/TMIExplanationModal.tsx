import React from 'react';
import { X, HelpCircle, Calculator, FileText, Euro, AlertTriangle, Target } from 'lucide-react';

interface TMIExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TMIExplanationModal: React.FC<TMIExplanationModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl border border-gray-200 dark:border-gray-600 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-600 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              Comprendre la TMI
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Tranche Marginale d'Imposition et impact SCPI
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
          {/* Qu'est-ce que la TMI ? */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  Qu'est-ce que la TMI ?
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-200">
                  Taux d'impôt sur votre dernière tranche de revenus
                </p>
              </div>
            </div>
            
            <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-sm text-gray-700 dark:text-gray-200">
                <strong>Exemple :</strong> Revenus 50k€ → TMI 30% (seulement sur la partie > 28 797€)
              </p>
            </div>
          </div>

          {/* Comment la trouver ? */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 sm:p-6 rounded-2xl border border-green-200 dark:border-green-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-600 rounded-2xl flex items-center justify-center">
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Comment trouver votre TMI ?
                </h3>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-200">
                  Guide étape par étape pour localiser votre TMI sur votre avis d'imposition
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-green-200 dark:border-green-700">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xs sm:text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-semibold text-green-800 dark:text-green-200 mb-1">
                      Récupérez votre avis d'imposition 2024
                    </h4>
                    <p className="text-xs sm:text-sm text-green-700 dark:text-green-300">
                      Document reçu en été 2024 concernant vos revenus 2023
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-green-200 dark:border-green-700">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xs sm:text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-semibold text-green-800 dark:text-green-200 mb-1">
                      Allez à la dernière page
                    </h4>
                    <p className="text-xs sm:text-sm text-green-700 dark:text-green-300">
                      La TMI se trouve toujours sur la dernière page de votre avis
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-green-200 dark:border-green-700">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xs sm:text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-semibold text-green-800 dark:text-green-200 mb-1">
                      Cherchez "Taux marginal d'imposition"
                    </h4>
                    <p className="text-xs sm:text-sm text-green-700 dark:text-green-300">
                      Ligne clairement identifiée avec le pourcentage
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl border border-green-200 dark:border-green-700">
                <h4 className="text-sm sm:text-base font-semibold text-green-800 dark:text-green-200 mb-3">
                  💡 Cas particuliers
                </h4>
                <div className="space-y-3 text-xs sm:text-sm text-green-700 dark:text-green-300">
                  <div>
                    <strong>Couple marié/pacsé :</strong> Prenez la TMI la plus élevée des deux conjoints
                  </div>
                  <div>
                    <strong>Première déclaration :</strong> Estimez selon vos revenus annuels bruts
                  </div>
                  <div>
                    <strong>Revenus variables :</strong> Basez-vous sur la moyenne des 2 dernières années
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Barème 2024 */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Euro className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Barème 2024
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { tmi: '0%', range: '< 11 294€', color: 'green' },
                { tmi: '11%', range: '11 295€ - 28 797€', color: 'blue' },
                { tmi: '30%', range: '28 798€ - 82 341€', color: 'orange' },
                { tmi: '41%', range: '82 342€ - 177 106€', color: 'red' },
                { tmi: '45%', range: '> 177 106€', color: 'purple' }
              ].map((item, index) => (
                <div key={index} className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className={`font-bold text-${item.color}-600 dark:text-${item.color}-400`}>
                      TMI {item.tmi}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {item.range}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Impact SCPI - Compact */}
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              Impact sur vos SCPI
            </h3>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                <div className="text-sm font-bold text-green-600 dark:text-green-400">TMI ≤ 11%</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">SCPI françaises</div>
              </div>
              <div className="text-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                <div className="text-sm font-bold text-orange-600 dark:text-orange-400">TMI 30%</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">Mix France/Europe</div>
              </div>
              <div className="text-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                <div className="text-sm font-bold text-red-600 dark:text-red-400">TMI ≥ 41%</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">SCPI européennes</div>
              </div>
            </div>
          </div>
        </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30 text-center flex-shrink-0">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform duration-200"
          >
            J'ai compris
          </button>
        </div>
      </div>
    </div>
  );
};

export default TMIExplanationModal;