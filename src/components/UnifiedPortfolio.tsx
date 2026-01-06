import React, { useState, useEffect } from 'react';
import { X, Plus, TrendingUp, Calculator, Edit3, Download, Target, PieChart, Award, DollarSign, Calendar, AlertTriangle } from 'lucide-react';
import { Scpi } from '../types/scpi';
import { ClientProfile } from '../types/riskProfile';
import { formatCurrency } from '../utils/formatters';
// PDF Generator loaded dynamically
import AllocationModal from './AllocationModal';
import PortfolioSummary from './PortfolioSummary'; // v2.0 with tabs

interface PortfolioItem extends Scpi {
  investedAmount: number;
  percentage: number;
}

interface UnifiedPortfolioProps {
  availableScpi: Scpi[];
  clientProfile: ClientProfile | null;
  initialRecommendations?: any[];
  onPortfolioChange?: (portfolio: PortfolioItem[]) => void;
  onExportPDF?: () => void;
  onScheduleCall?: () => void;
}

const UnifiedPortfolio: React.FC<UnifiedPortfolioProps> = ({ 
  availableScpi, 
  clientProfile,
  initialRecommendations = [],
  onPortfolioChange,
  onExportPDF,
  onScheduleCall
}) => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [showScpiSelector, setShowScpiSelector] = useState(false);
  const [selectedScpiForEdit, setSelectedScpiForEdit] = useState<PortfolioItem | null>(null);
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Calculs automatiques
  const totalInvested = portfolio.reduce((sum, item) => sum + item.investedAmount, 0);
  const totalPercentage = portfolio.reduce((sum, item) => sum + item.percentage, 0);
  const averageYield = portfolio.length > 0 
    ? portfolio.reduce((sum, item) => sum + (item.yield * item.percentage / 100), 0)
    : 0;

  const annualIncome = (totalInvested * averageYield) / 100;
  const monthlyIncome = annualIncome / 12;

  const sectors = [...new Set(portfolio.map(item => item.sector))];
  const geographies = [...new Set(portfolio.map(item => item.geography))];
  
  const isrCount = portfolio.filter(item => item.isr).length;
  const isrPercentage = (isrCount / portfolio.length) * 100;
  
  const averageCreation = portfolio.reduce((sum, item) => 
    sum + (item.creation * item.percentage / 100), 0
  );
  
  const averageAge = new Date().getFullYear() - averageCreation;

  // Budget maximum (montant d'investissement du client)
  const maxBudget = clientProfile?.investmentAmount || 100000;

  // Score de qualité global
  const qualityScore = portfolio.reduce((sum, item) => {
    let score = 0.5;
    if (item.tof >= 95) score += 0.2;
    if (item.isr) score += 0.1;
    if (item.fees === 0) score += 0.1;
    if (item.capitalization >= 500000000) score += 0.1;
    return sum + (score * item.percentage / 100);
  }, 0);

  // Validation du portefeuille
  useEffect(() => {
    if (totalInvested > maxBudget) {
      setValidationError(`Le montant total investi (${formatCurrency(totalInvested)}) dépasse votre budget de ${formatCurrency(maxBudget)}`);
    } else if (Math.abs(totalPercentage - 100) > 0.1 && portfolio.length > 0) {
      setValidationError(`La répartition totale (${totalPercentage.toFixed(1)}%) doit être égale à 100%`);
    } else {
      setValidationError(null);
    }
  }, [totalInvested, totalPercentage, maxBudget, portfolio.length]);

  // Notification du changement de portefeuille
  useEffect(() => {
    if (onPortfolioChange) {
      onPortfolioChange(portfolio);
    }
  }, [portfolio, onPortfolioChange]);

  // Appliquer les recommandations initiales
  useEffect(() => {
    if (initialRecommendations.length > 0) {
      const portfolioItems = initialRecommendations.map(rec => ({
        ...rec.scpi || rec,
        investedAmount: rec.investedAmount || Math.round((rec.allocation / 100) * (clientProfile?.investmentAmount || 50000)),
        percentage: rec.percentage || rec.allocation || 0
      }));
      setPortfolio(portfolioItems);
    }
  }, [initialRecommendations, clientProfile]);

  // Ajouter une SCPI au portefeuille
  const addScpiToPortfolio = (scpi: Scpi) => {
    if (portfolio.find(item => item.id === scpi.id)) {
      return; // Déjà dans le portefeuille
    }

    const defaultAmount = clientProfile?.investmentAmount 
      ? Math.round(clientProfile.investmentAmount / 4) 
      : 10000;
    
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
    // Vérifier que le nouveau montant ne dépasse pas le budget
    const otherAmounts = portfolio.filter(item => item.id !== scpiId).reduce((sum, item) => sum + item.investedAmount, 0);
    const maxAllowedAmount = maxBudget - otherAmounts;
    const clampedAmount = Math.min(Math.max(0, newAmount), maxAllowedAmount);
    
    const newPortfolio = portfolio.map(item => 
      item.id === scpiId 
        ? { ...item, investedAmount: clampedAmount }
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

  // Appliquer des recommandations externes
  const applyRecommendations = (recommendations: any[]) => {
    const portfolioItems = recommendations.map(rec => ({
      ...rec.scpi || rec,
      investedAmount: rec.investedAmount || Math.round((rec.allocation / 100) * (clientProfile?.investmentAmount || 50000)),
      percentage: rec.percentage || rec.allocation || 0
    }));
    setPortfolio(portfolioItems);
  };

  // Exposer la fonction pour l'utilisation externe
  useEffect(() => {
    (window as any).applyPortfolioRecommendations = applyRecommendations;
    return () => {
      delete (window as any).applyPortfolioRecommendations;
    };
  }, [clientProfile]);

  if (portfolio.length === 0 && initialRecommendations.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-600">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Mon Portefeuille SCPI
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Construisez votre sélection personnalisée
            </p>
          </div>
          <button
            onClick={() => setShowScpiSelector(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Ajouter SCPI
          </button>
        </div>

        <div className="text-center py-12">
          <PieChart className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
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

      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tableau du portefeuille */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-600">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Mon Portefeuille SCPI
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {portfolio.length} SCPI sélectionnée{portfolio.length > 1 ? 's' : ''} • {formatCurrency(totalInvested)} investis
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

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-600">
                <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-200">
                  SCPI
                </th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-200">
                  Allocation %
                </th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-200">
                  Allocation €
                </th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-200">
                  Nb parts
                </th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-200">
                  Parts min.
                </th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-200">
                  Prix/part
                </th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-200">
                  Souscription
                </th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-200">
                  Total souscription
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
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {item.yield.toFixed(2)}% • Créée en {item.creation}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-center">
                    <input
                      type="number"
                     value={Math.round(item.percentage * 10) / 10}
                     onChange={(e) => {
                       const newPercentage = parseFloat(e.target.value) || 0;
                       updatePercentage(item.id, newPercentage);
                     }}
                      className="w-20 px-2 py-1 text-center border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent cursor-pointer text-sm"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </td>
                  <td className="py-4 px-2">
                    <input
                      type="number"
                      value={item.investedAmount}
                     onChange={(e) => {
                       const newAmount = parseInt(e.target.value) || 0;
                       updateAmount(item.id, newAmount);
                     }}
                      className="w-24 px-2 py-1 text-center border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent cursor-pointer text-sm"
                      min="0"
                      step="1000"
                    />
                  </td>
                  <td className="py-4 px-2">
                    <div className="text-center">
                      <div className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                        {Math.floor(item.investedAmount / item.price)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        parts
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-center">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {Math.ceil(item.minInvest / item.price)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      ({formatCurrency(item.minInvest)})
                    </div>
                  </td>
                  <td className="py-4 px-2 text-center">
                    <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                      {item.price}€
                    </div>
                  </td>
                  <td className="py-4 px-2 text-center">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(Math.floor(item.investedAmount / item.price) * item.price)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      montant exact
                    </div>
                  </td>
                  <td className="py-4 px-2 text-center">
                    <div className="text-sm font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(Math.floor(item.investedAmount / item.price) * item.price * (1 + item.fees / 100))}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                     frais inclus
                    </div>
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
          <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-600">
            {/* Message d'erreur de validation */}
            {validationError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-800 dark:text-red-300">
                    {validationError}
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Total investi</div>
                <div className={`text-2xl font-bold ${
                  totalInvested > maxBudget 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-gray-900 dark:text-gray-100'
                }`}>
                  {formatCurrency(totalInvested)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Budget: {formatCurrency(maxBudget)}
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
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Cash restant</div>
                <div className={`text-2xl font-bold ${
                  maxBudget - totalInvested >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatCurrency(Math.max(0, maxBudget - totalInvested))}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  disponible
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Allocations et résultats détaillés */}
      <div className="grid grid-cols-1 gap-6">
        {/* Tableau d'allocation détaillé */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-600" id="portfolio-section">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-500" />
            Allocations détaillées
          </h4>
          
          <div className="space-y-3">
            {portfolio.map((item) => {
              const shares = Math.floor(item.investedAmount / item.price);
              const exactAmount = shares * item.price;
              const totalWithFees = exactAmount * (1 + item.fees / 100);
              const annualReturn = exactAmount * item.yield / 100;
              const monthlyReturn = annualReturn / 12;
              
              return (
                <div key={item.id} className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{item.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">{item.company}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600 dark:text-blue-400">{item.percentage.toFixed(1)}%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">{item.yield.toFixed(2)}% rdt</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-gray-600 dark:text-gray-300">Parts achetées</div>
                      <div className="font-semibold text-gray-900 dark:text-white">{shares} parts</div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-300">Prix/part</div>
                      <div className="font-semibold text-gray-900 dark:text-white">{item.price}€</div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-300">Montant exact</div>
                      <div className="font-semibold text-gray-900 dark:text-white">{formatCurrency(exactAmount)}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-300">Avec frais</div>
                      <div className="font-semibold text-gray-900 dark:text-white">{formatCurrency(totalWithFees)}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-300">Revenus/mois</div>
                      <div className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(monthlyReturn)}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-300">Revenus/an</div>
                      <div className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(annualReturn)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Résultats globaux et métriques */}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-600">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Résultats globaux
          </h4>
          
          <div className="space-y-4">
            {/* Métriques principales */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-center border border-blue-200 dark:border-blue-800">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {averageYield.toFixed(2)}%
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Rendement moyen</div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl text-center border border-green-200 dark:border-green-800">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(monthlyIncome)}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">Revenus/mois</div>
              </div>
            </div>

            {/* Détails financiers */}
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-300">Total investi</span>
                <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(totalInvested)}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-300">Revenus annuels</span>
                <span className="font-bold text-green-600 dark:text-green-400">{formatCurrency(annualIncome)}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-300">Nombre de SCPI</span>
                <span className="font-bold text-gray-900 dark:text-white">{portfolio.length}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-300">Diversification</span>
                <span className="font-bold text-gray-900 dark:text-white">{sectors.length} secteurs</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-300">Label ISR</span>
                <span className="font-bold text-gray-900 dark:text-white">{isrCount}/{portfolio.length}</span>
              </div>
            </div>

            {/* Score de qualité */}
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Score de qualité global</span>
                <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  {Math.round(qualityScore * 100)}/100
                </span>
              </div>
              <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2">
                <div 
                  className="bg-purple-600 dark:bg-purple-400 h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${qualityScore * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Caractéristiques du portefeuille */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-600">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-500" />
            Caractéristiques
          </h4>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-300">Diversification</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {sectors.length} secteurs, {geographies.length} zones
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-300">Label ISR</span>
              <div className="text-right">
                <div className="font-bold text-gray-900 dark:text-white">
                  {isrPercentage.toFixed(0)}% du portefeuille
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedPortfolio;