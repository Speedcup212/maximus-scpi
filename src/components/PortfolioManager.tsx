import React, { useState, useEffect } from 'react';
import { X, Plus, TrendingUp, Calculator, Edit3 } from 'lucide-react';
import { Scpi } from '../types/scpi';
import { formatCurrency } from '../utils/formatters';
import AllocationModal from './AllocationModal';

interface PortfolioItem extends Scpi {
  investedAmount: number;
  percentage: number;
}

interface PortfolioManagerProps {
  availableScpi: Scpi[];
  onPortfolioChange?: (portfolio: PortfolioItem[]) => void;
}

const PortfolioManager: React.FC<PortfolioManagerProps> = ({ 
  availableScpi, 
  onPortfolioChange 
}) => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [showScpiSelector, setShowScpiSelector] = useState(false);
  const [selectedScpiForEdit, setSelectedScpiForEdit] = useState<PortfolioItem | null>(null);
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);

  // Calculs automatiques
  const totalInvested = portfolio.reduce((sum, item) => sum + item.investedAmount, 0);
  const totalPercentage = portfolio.reduce((sum, item) => sum + item.percentage, 0);
  const averageYield = portfolio.length > 0 
    ? portfolio.reduce((sum, item) => sum + (item.yield * item.percentage / 100), 0)
    : 0;

  // Notification du changement de portefeuille
  useEffect(() => {
    if (onPortfolioChange) {
      onPortfolioChange(portfolio);
    }
  }, [portfolio, onPortfolioChange]);

  // Ajouter une SCPI au portefeuille
  const addScpiToPortfolio = (scpi: Scpi) => {
    if (portfolio.find(item => item.id === scpi.id)) {
      return; // Déjà dans le portefeuille
    }

    const defaultAmount = 10000; // Montant par défaut modifiable
    const newItem: PortfolioItem = {
      ...scpi,
      investedAmount: defaultAmount,
      percentage: 0
    };

    const newPortfolio = [...portfolio, newItem];
    updatePortfolioPercentages(newPortfolio);
    setShowScpiSelector(false);
  };

  // Supprimer une SCPI du portefeuille
  const removeScpiFromPortfolio = (scpiId: number) => {
    const newPortfolio = portfolio.filter(item => item.id !== scpiId);
    updatePortfolioPercentages(newPortfolio);
  };

  // Mettre à jour les montants
  const updateAmount = (scpiId: number, newAmount: number) => {
    const newPortfolio = portfolio.map(item => 
      item.id === scpiId 
        ? { ...item, investedAmount: Math.max(0, newAmount) }
        : item
    );
    updatePortfolioPercentages(newPortfolio);
  };

  // Mettre à jour les pourcentages
  const updatePercentage = (scpiId: number, newPercentage: number) => {
    const clampedPercentage = Math.max(0, Math.min(100, newPercentage));
    const newPortfolio = portfolio.map(item => 
      item.id === scpiId 
        ? { ...item, percentage: clampedPercentage }
        : item
    );
    updatePortfolioAmounts(newPortfolio);
  };

  // Recalculer les pourcentages basés sur les montants
  const updatePortfolioPercentages = (newPortfolio: PortfolioItem[]) => {
    const total = newPortfolio.reduce((sum, item) => sum + item.investedAmount, 0);
    
    if (total > 0) {
      const updatedPortfolio = newPortfolio.map(item => ({
        ...item,
        percentage: (item.investedAmount / total) * 100
      }));
      setPortfolio(updatedPortfolio);
    } else {
      setPortfolio(newPortfolio);
    }
  };

  // Recalculer les montants basés sur les pourcentages
  const updatePortfolioAmounts = (newPortfolio: PortfolioItem[]) => {
    const totalPercentage = newPortfolio.reduce((sum, item) => sum + item.percentage, 0);
    
    if (totalPercentage > 0 && totalInvested > 0) {
      const updatedPortfolio = newPortfolio.map(item => ({
        ...item,
        investedAmount: Math.round((item.percentage / 100) * totalInvested)
      }));
      setPortfolio(updatedPortfolio);
    } else {
      setPortfolio(newPortfolio);
    }
  };

  // Équilibrer automatiquement le portefeuille
  const balancePortfolio = () => {
    if (portfolio.length === 0) return;
    
    const equalPercentage = 100 / portfolio.length;
    const equalAmount = Math.round(totalInvested / portfolio.length);
    
    const balancedPortfolio = portfolio.map(item => ({
      ...item,
      percentage: equalPercentage,
      investedAmount: equalAmount
    }));
    
    setPortfolio(balancedPortfolio);
  };

  // Ouvrir le modal d'édition d'allocation
  const openAllocationModal = (item: PortfolioItem) => {
    setSelectedScpiForEdit(item);
    setIsAllocationModalOpen(true);
  };

  // Fermer le modal d'allocation
  const closeAllocationModal = () => {
    setIsAllocationModalOpen(false);
    setSelectedScpiForEdit(null);
  };

  // Sauvegarder les modifications d'allocation
  const saveAllocation = (scpiId: number, newAmount: number, newPercentage: number) => {
    const newPortfolio = portfolio.map(item => 
      item.id === scpiId 
        ? { ...item, investedAmount: newAmount, percentage: newPercentage }
        : item
    );
    setPortfolio(newPortfolio);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-600">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Mon Portefeuille SCPI
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {portfolio.length} SCPI sélectionnée{portfolio.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          {portfolio.length > 1 && (
            <button
              onClick={balancePortfolio}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              <Calculator className="w-4 h-4" />
              Équilibrer
            </button>
          )}
          <button
            onClick={() => setShowScpiSelector(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Ajouter SCPI
          </button>
        </div>
      </div>

      {/* Tableau du portefeuille */}
      {portfolio.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-600">
                <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-200">
                  SCPI
                </th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-200">
                  Rendement
                </th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-200">
                  Montant investi (€)
                </th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-200">
                  Pourcentage (%)
                </th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-200">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {portfolio.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 group">
                  <td className="py-4 px-2">
                    <div 
                      className="cursor-pointer"
                      onClick={() => openAllocationModal(item)}
                    >
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {item.name}
                        <Edit3 className="w-4 h-4 inline ml-2 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {item.company}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-center">
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {item.yield.toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-4 px-2">
                    <input
                      type="number"
                      value={item.investedAmount}
                      onChange={(e) => updateAmount(item.id, parseInt(e.target.value) || 0)}
                      onClick={() => openAllocationModal(item)}
                      className="w-full px-3 py-2 text-center border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                      min="0"
                      step="1000"
                    />
                  </td>
                  <td className="py-4 px-2">
                    <input
                      type="number"
                      value={item.percentage.toFixed(1)}
                      onChange={(e) => updatePercentage(item.id, parseFloat(e.target.value) || 0)}
                      onClick={() => openAllocationModal(item)}
                      className="w-full px-3 py-2 text-center border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </td>
                  <td className="py-4 px-2 text-center">
                    <button
                      onClick={() => removeScpiFromPortfolio(item.id)}
                      className="p-2 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors"
                      title="Supprimer du portefeuille"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totaux */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Total investi</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(totalInvested)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Total pourcentage</div>
                <div className={`text-2xl font-bold ${
                  Math.abs(totalPercentage - 100) < 0.1 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {totalPercentage.toFixed(1)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Rendement moyen</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {averageYield.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Aucune SCPI sélectionnée
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Commencez par ajouter des SCPI à votre sélection
          </p>
          <button
            onClick={() => setShowScpiSelector(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium mx-auto"
          >
            <Plus className="w-5 h-5" />
            Ajouter ma première SCPI
          </button>
        </div>
      )}

      {/* Modal de sélection des SCPI */}
      {showScpiSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Sélectionner une SCPI
              </h3>
              <button
                onClick={() => setShowScpiSelector(false)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-[60vh]">
              <div className="grid gap-3">
                {availableScpi
                  .filter(scpi => !portfolio.find(item => item.id === scpi.id))
                  .sort((a, b) => b.yield - a.yield)
                  .map((scpi) => (
                    <div
                      key={scpi.id}
                      onClick={() => addScpiToPortfolio(scpi)}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {scpi.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {scpi.company} • {formatCurrency(scpi.capitalization)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600 dark:text-green-400">
                          {scpi.yield.toFixed(2)}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {scpi.price}€/part
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'allocation */}
      <AllocationModal
        scpi={selectedScpiForEdit}
        isOpen={isAllocationModalOpen}
        onClose={closeAllocationModal}
        onSave={saveAllocation}
        currentAmount={selectedScpiForEdit?.investedAmount || 0}
        currentPercentage={selectedScpiForEdit?.percentage || 0}
        totalPortfolioAmount={totalInvested}
      />
    </div>
  );
};

export default PortfolioManager;