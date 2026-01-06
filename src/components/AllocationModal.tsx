import React, { useState, useEffect } from 'react';
import { X, Calculator, TrendingUp, DollarSign } from 'lucide-react';
import { Scpi } from '../types/scpi';
import { formatCurrency } from '../utils/formatters';

interface AllocationModalProps {
  scpi: Scpi | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (scpiId: number, newAmount: number, newPercentage: number) => void;
  currentAmount: number;
  currentPercentage: number;
  totalPortfolioAmount: number;
}

const AllocationModal: React.FC<AllocationModalProps> = ({
  scpi,
  isOpen,
  onClose,
  onSave,
  currentAmount,
  currentPercentage,
  totalPortfolioAmount
}) => {
  const [amount, setAmount] = useState(currentAmount);
  const [percentage, setPercentage] = useState(currentPercentage);
  const [activeField, setActiveField] = useState<'amount' | 'percentage'>('amount');

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      setAmount(currentAmount);
      setPercentage(currentPercentage);
    }
  }, [isOpen, currentAmount, currentPercentage]);

  if (!isOpen || !scpi) return null;

  const handleAmountChange = (newAmount: number) => {
    // Vérifier que le montant ne dépasse pas le budget total
    if (newAmount > totalPortfolioAmount) {
      return; // Ne pas permettre de dépasser le budget
    }
    
    setAmount(newAmount);
    setActiveField('amount');
    if (totalPortfolioAmount > 0) {
      const newPercentage = (newAmount / totalPortfolioAmount) * 100;
      setPercentage(newPercentage);
    }
  };

  const handlePercentageChange = (newPercentage: number) => {
    setPercentage(newPercentage);
    setActiveField('percentage');
    const newAmount = (newPercentage / 100) * totalPortfolioAmount;
    setAmount(newAmount);
  };

  const handleSave = () => {
    onSave(scpi.id, Math.round(amount), percentage);
    onClose();
  };

  const handleQuickPercentage = (percent: number) => {
    handlePercentageChange(percent);
  };

  const estimatedAnnualReturn = (amount * scpi.yield) / 100;
  const estimatedMonthlyReturn = estimatedAnnualReturn / 12;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-600">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              Modifier l'allocation
            </h3>
            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              {scpi.name}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {scpi.company} • {scpi.yield.toFixed(2)}% rendement
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-center">
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Prix/Part</div>
            <div className="font-bold text-gray-900 dark:text-gray-100">{scpi.price}€</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-center">
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">TOF</div>
            <div className="font-bold text-gray-900 dark:text-gray-100">{scpi.tof}%</div>
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            <DollarSign className="w-4 h-4 inline mr-1" />
            Montant investi (€)
          </label>
          <input
            type="number"
            value={Math.round(amount)}
            onChange={(e) => handleAmountChange(parseInt(e.target.value) || 0)}
            max={totalPortfolioAmount}
            className={`w-full px-4 py-3 border rounded-lg text-lg font-semibold text-center transition-all duration-200 ${
              activeField === 'amount'
                ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20 dark:ring-blue-400/20'
                : 'border-gray-300 dark:border-gray-500'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent`}
            min="0"
            step="1000"
          />
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Maximum: {formatCurrency(totalPortfolioAmount)}
          </div>
        </div>

        {/* Percentage Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            <Calculator className="w-4 h-4 inline mr-1" />
            Pourcentage du portefeuille (%)
          </label>
          <input
            type="number"
            value={percentage.toFixed(1)}
            onChange={(e) => handlePercentageChange(parseFloat(e.target.value) || 0)}
            className={`w-full px-4 py-3 border rounded-lg text-lg font-semibold text-center transition-all duration-200 ${
              activeField === 'percentage'
                ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20 dark:ring-blue-400/20'
                : 'border-gray-300 dark:border-gray-500'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent`}
            min="0"
            max="100"
            step="0.1"
          />
        </div>

        {/* Quick Percentage Buttons */}
        <div className="mb-6">
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Répartitions rapides :
          </div>
          <div className="flex gap-2">
            {[10, 20, 25, 30, 50].map((percent) => (
              <button
                key={percent}
                onClick={() => handleQuickPercentage(percent)}
                className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
              >
                {percent}%
              </button>
            ))}
          </div>
        </div>

        {/* Estimated Returns */}
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-semibold text-green-800 dark:text-green-300">
              Revenus estimés
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-green-600 dark:text-green-400 mb-1">Par mois</div>
              <div className="font-bold text-green-800 dark:text-green-200">
                {formatCurrency(estimatedMonthlyReturn)}
              </div>
            </div>
            <div>
              <div className="text-xs text-green-600 dark:text-green-400 mb-1">Par an</div>
              <div className="font-bold text-green-800 dark:text-green-200">
                {formatCurrency(estimatedAnnualReturn)}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform duration-200"
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllocationModal;