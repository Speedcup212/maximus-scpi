import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, Euro, Calendar, ArrowRight, Info } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface ThematicSimulatorProps {
  defaultInvestment?: number;
  defaultYield?: number;
  title?: string;
  subtitle?: string;
  theme?: 'blue' | 'green' | 'indigo';
}

const ThematicSimulator: React.FC<ThematicSimulatorProps> = ({
  defaultInvestment = 50000,
  defaultYield = 5.5,
  title = 'Simulez vos revenus locatifs',
  subtitle = 'Calculez les revenus que vous pourriez percevoir avec les SCPI',
  theme = 'blue'
}) => {
  const [investment, setInvestment] = useState<number>(defaultInvestment);
  const [expectedYield, setExpectedYield] = useState<number>(defaultYield);
  const [investmentPeriod, setInvestmentPeriod] = useState<number>(10);

  const annualIncome = (investment * expectedYield) / 100;
  const monthlyIncome = annualIncome / 12;
  const totalIncome10Years = annualIncome * 10;
  const totalIncome20Years = annualIncome * 20;
  const totalWithCapital = investment + (annualIncome * investmentPeriod);

  const themeColors = {
    blue: {
      primary: 'blue',
      gradient: 'from-blue-50 to-indigo-50',
      border: 'border-blue-200',
      bg: 'bg-blue-600',
      text: 'text-blue-600',
      hover: 'hover:bg-blue-700'
    },
    green: {
      primary: 'green',
      gradient: 'from-green-50 to-emerald-50',
      border: 'border-green-200',
      bg: 'bg-green-600',
      text: 'text-green-600',
      hover: 'hover:bg-green-700'
    },
    indigo: {
      primary: 'indigo',
      gradient: 'from-indigo-50 to-purple-50',
      border: 'border-indigo-200',
      bg: 'bg-indigo-600',
      text: 'text-indigo-600',
      hover: 'hover:bg-indigo-700'
    }
  };

  const colors = themeColors[theme];

  return (
    <div className={`bg-gradient-to-br ${colors.gradient} rounded-2xl p-8 border-2 ${colors.border} shadow-lg`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-14 h-14 ${colors.bg} rounded-xl flex items-center justify-center`}>
          <Calculator className="w-7 h-7 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          <p className="text-gray-600">{subtitle}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-gray-700">Montant à investir</label>
            <span className={`text-lg font-bold ${colors.text}`}>
              {formatCurrency(investment)}
            </span>
          </div>
          <input
            type="range"
            min="10000"
            max="500000"
            step="5000"
            value={investment}
            onChange={(e) => setInvestment(Number(e.target.value))}
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>10 000€</span>
            <span>500 000€</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-gray-700">Rendement annuel estimé</label>
            <span className={`text-lg font-bold ${colors.text}`}>
              {expectedYield.toFixed(1)}%
            </span>
          </div>
          <input
            type="range"
            min="3"
            max="12"
            step="0.1"
            value={expectedYield}
            onChange={(e) => setExpectedYield(Number(e.target.value))}
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>3%</span>
            <span>12%</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-gray-700">Durée d'investissement</label>
            <span className={`text-lg font-bold ${colors.text}`}>
              {investmentPeriod} ans
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="30"
            step="1"
            value={investmentPeriod}
            onChange={(e) => setInvestmentPeriod(Number(e.target.value))}
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>5 ans</span>
            <span>30 ans</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md mt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className={`w-5 h-5 ${colors.text}`} />
                <span className="text-sm font-medium text-gray-600">Revenus mensuels</span>
              </div>
              <div className={`text-2xl font-bold ${colors.text}`}>
                {formatCurrency(monthlyIncome)}
              </div>
              <div className="text-xs text-gray-500 mt-1">Versement trimestriel</div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className={`w-5 h-5 ${colors.text}`} />
                <span className="text-sm font-medium text-gray-600">Revenus annuels</span>
              </div>
              <div className={`text-2xl font-bold ${colors.text}`}>
                {formatCurrency(annualIncome)}
              </div>
              <div className="text-xs text-gray-500 mt-1">Rendement {expectedYield.toFixed(1)}%</div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t-2 border-gray-200">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Total revenus sur {investmentPeriod} ans</span>
                <span className={`text-lg font-bold ${colors.text}`}>
                  {formatCurrency(annualIncome * investmentPeriod)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Capital + Revenus cumulés</span>
                <span className={`text-xl font-bold ${colors.text}`}>
                  {formatCurrency(totalWithCapital)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 mt-4">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-semibold text-amber-900 mb-1">Simulation à titre indicatif</p>
              <p>
                Les performances passées ne préjugent pas des performances futures.
                Les rendements sont variables selon les SCPI et les conditions de marché.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="bg-white rounded-lg p-3 text-center border-2 border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Projection 10 ans</div>
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(totalIncome10Years)}
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center border-2 border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Projection 20 ans</div>
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(totalIncome20Years)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThematicSimulator;
