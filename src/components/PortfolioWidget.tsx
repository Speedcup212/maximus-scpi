import React from 'react';
import { X, TrendingUp } from 'lucide-react';
import { Scpi } from '../types/scpi';

interface PortfolioWidgetProps {
  selectedScpi: Scpi[];
  investmentAmount: number;
  onInvestmentChange: (amount: number) => void;
  onRemoveScpi: (scpiId: number) => void;
  onExportClick: () => void;
}

const PortfolioWidget: React.FC<PortfolioWidgetProps> = ({
  selectedScpi,
  investmentAmount,
  onInvestmentChange,
  onRemoveScpi,
  onExportClick
}) => {
  const progressPercentage = (selectedScpi.length / 6) * 100;

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-emerald-300 dark:border-emerald-700">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-emerald-900 dark:text-emerald-100">Votre Sélection</h3>
        <span className="bg-emerald-600 dark:bg-emerald-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
          {selectedScpi.length}/6
        </span>
      </div>

      {/* Investment Amount */}
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-emerald-200 dark:border-emerald-700">
        <label htmlFor="investment" className="block text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-200 mb-2">
          Montant d'investissement total (€)
        </label>
        <input
          type="number"
          id="investment"
          value={investmentAmount}
          onChange={(e) => onInvestmentChange(parseInt(e.target.value) || 0)}
          onFocus={(e) => e.target.select()}
          min="1000"
          step="1000"
          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-emerald-300 dark:border-emerald-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-base sm:text-lg font-semibold focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent"
        />
      </div>

      {/* Progress Bar */}
      <div className="mb-4 sm:mb-6">
        <div className="flex justify-between text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 mb-2">
          <span>Progression du portefeuille</span>
          <span>{selectedScpi.length} / 6 SCPI</span>
        </div>
        <div className="w-full bg-emerald-200 dark:bg-emerald-800 rounded-full h-2">
          <div
            className="bg-emerald-600 dark:bg-emerald-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Selected SCPI List */}
      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
        {selectedScpi.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-emerald-700 dark:text-emerald-300">
            <p className="text-sm sm:text-base">Sélectionnez jusqu'à 6 SCPI</p>
            <p className="text-sm sm:text-base">pour composer votre</p>
            <p className="text-sm sm:text-base">portefeuille optimal</p>
          </div>
        ) : (
          selectedScpi.map((scpi) => (
            <div
              key={scpi.id}
              className="flex items-center justify-between p-2 sm:p-3 bg-white dark:bg-gray-800/50 rounded-lg border-l-4 border-emerald-500 dark:border-emerald-400"
            >
              <div className="flex-1">
                <div className="font-semibold text-emerald-900 dark:text-emerald-100 text-sm sm:text-base">{scpi.name}</div>
                <div className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-300">
                  {scpi.allocation}% • {scpi.yield}% rendement
                </div>
              </div>
              <button
                onClick={() => onRemoveScpi(scpi.id)}
                className="p-1 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors flex-shrink-0"
                title="Retirer de la sélection"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Export Button */}
      {selectedScpi.length > 0 && (
        <button
          onClick={onExportClick}
          className="w-full mt-4 sm:mt-6 flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl font-bold text-base sm:text-lg hover:from-orange-700 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 transform"
        >
          <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
          Visualiser mes résultats
        </button>
      )}
    </div>
  );
};

export default PortfolioWidget;