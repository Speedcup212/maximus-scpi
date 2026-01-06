import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface TimeSliderProps {
  initialValue: number;
  averageYield: number;
  minYears?: number;
  maxYears?: number;
}

const TimeSlider: React.FC<TimeSliderProps> = ({
  initialValue,
  averageYield,
  minYears = 1,
  maxYears = 20
}) => {
  const [selectedYears, setSelectedYears] = useState(10);

  const projectedValue = initialValue * Math.pow(1 + averageYield / 100, selectedYears);
  const totalGain = projectedValue - initialValue;
  const gainPercentage = ((projectedValue / initialValue) - 1) * 100;

  // Calculate cumulative income (sum of annual incomes with compound effect)
  const cumulativeIncome = Array.from({ length: selectedYears }, (_, i) => {
    const yearStartValue = initialValue * Math.pow(1 + averageYield / 100, i);
    return yearStartValue * (averageYield / 100);
  }).reduce((sum, income) => sum + income, 0);

  const annualIncome = (initialValue * averageYield) / 100;
  const monthlyIncome = annualIncome / 12;

  return (
    <div className="bg-gradient-to-br from-cyan-50 via-blue-50 to-cyan-50 dark:from-cyan-900/30 dark:via-blue-900/30 dark:to-cyan-900/30 p-6 rounded-xl border-2 border-cyan-300 dark:border-cyan-700 shadow-md">
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
        Explorez votre projection dans le temps
      </h3>

      {/* Slider */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
            Durée d'investissement
          </span>
          <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400">
            {selectedYears} an{selectedYears > 1 ? 's' : ''}
          </span>
        </div>

        <div className="relative">
          {/* Track background */}
          <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-300 dark:bg-gray-600 rounded-full -translate-y-1/2" />

          {/* Active track */}
          <div
            className="absolute top-1/2 left-0 h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full -translate-y-1/2 transition-all duration-300 shadow-sm"
            style={{ width: `${((selectedYears - minYears) / (maxYears - minYears)) * 100}%` }}
          />

          {/* Slider input */}
          <input
            type="range"
            min={minYears}
            max={maxYears}
            value={selectedYears}
            onChange={(e) => setSelectedYears(parseInt(e.target.value))}
            className="relative w-full h-2 bg-transparent appearance-none cursor-pointer z-10"
            style={{
              WebkitAppearance: 'none',
            }}
          />

          {/* Custom thumb styling */}
          <style>
            {`
              input[type="range"]::-webkit-slider-thumb {
                appearance: none;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
                border: 3px solid white;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
              }
              input[type="range"]::-webkit-slider-thumb:hover {
                transform: scale(1.15);
                box-shadow: 0 6px 16px rgba(59, 130, 246, 0.6);
              }
              input[type="range"]::-moz-range-thumb {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
                border: 3px solid white;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
              }
              input[type="range"]::-moz-range-thumb:hover {
                transform: scale(1.15);
                box-shadow: 0 6px 16px rgba(59, 130, 246, 0.6);
              }
            `}
          </style>
        </div>

        {/* Year markers */}
        <div className="flex justify-between mt-2 px-1">
          {[minYears, 5, 10, 15, maxYears].map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYears(year)}
              className={`text-xs font-bold transition-colors ${
                selectedYears === year
                  ? 'text-cyan-600 dark:text-cyan-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Projected Value */}
        <div className="bg-white dark:bg-gray-800 backdrop-blur-sm p-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 shadow-sm">
          <div className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
            Valeur projetée
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-1">
            {formatCurrency(projectedValue)}
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
            Valeur du portefeuille
          </div>
        </div>

        {/* Total Gain */}
        <div className="bg-white dark:bg-gray-800 backdrop-blur-sm p-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 shadow-sm">
          <div className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
            Gain total
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mb-1">
            +{formatCurrency(totalGain)}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            +{gainPercentage.toFixed(1)}% de croissance
          </div>
        </div>

        {/* Cumulative Income */}
        <div className="bg-white dark:bg-gray-800 backdrop-blur-sm p-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 shadow-sm">
          <div className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
            Revenus cumulés
          </div>
          <div className="text-2xl font-black text-violet-600 dark:text-violet-400 mb-1">
            {formatCurrency(cumulativeIncome)}
          </div>
          <div className="text-xs text-violet-600 dark:text-violet-400 font-semibold">
            Sur {selectedYears} an{selectedYears > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Monthly/Annual breakdown */}
      <div className="mt-4 p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border-2 border-cyan-200 dark:border-cyan-800 shadow-sm">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-xs text-gray-700 dark:text-gray-300 mb-1 font-semibold">
              Revenus mensuels (an 1)
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(monthlyIncome)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-700 dark:text-gray-300 mb-1 font-semibold">
              Revenus annuels (an 1)
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(annualIncome)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeSlider;
