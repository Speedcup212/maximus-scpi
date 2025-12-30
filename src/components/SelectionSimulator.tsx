import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calculator, TrendingUp, PieChart as PieChartIcon, BarChart3, Download, Calendar, Phone, Building, MapPin, Target, Award } from 'lucide-react';
import { Scpi } from '../types/scpi';
import { formatCurrency } from '../utils/formatters';
import PieChart from './PieChart';

interface PortfolioItem extends Scpi {
  allocation: number; // Pourcentage
  investedAmount: number; // Montant en euros
  shares: number; // Nombre de parts
}

interface SelectionSimulatorProps {
  selectedScpi: Scpi[];
  onClose: () => void;
}

const SelectionSimulator: React.FC<SelectionSimulatorProps> = ({ selectedScpi, onClose }) => {
  const [investmentAmount, setInvestmentAmount] = useState<number>(50000);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);

  // Initialiser le portefeuille avec répartition égale
  useEffect(() => {
    if (selectedScpi.length > 0) {
      const equalAllocation = 100 / selectedScpi.length;
      const initialPortfolio = selectedScpi.map(scpi => ({
        ...scpi,
        allocation: equalAllocation,
        investedAmount: Math.round((equalAllocation / 100) * investmentAmount),
        shares: Math.floor(((equalAllocation / 100) * investmentAmount) / scpi.price)
      }));
      setPortfolio(initialPortfolio);
    }
  }, [selectedScpi, investmentAmount]);

  // Recalculer les montants quand l'investissement total change
  useEffect(() => {
    setPortfolio(prev => prev.map(item => ({
      ...item,
      investedAmount: Math.round((item.allocation / 100) * investmentAmount),
      shares: Math.floor(((item.allocation / 100) * investmentAmount) / item.price)
    })));
  }, [investmentAmount]);

  // Mettre à jour l'allocation d'une SCPI
  const updateAllocation = (scpiId: number, newAllocation: number) => {
    const clampedAllocation = Math.max(0, Math.min(100, newAllocation));
    
    setPortfolio(prev => prev.map(item => 
      item.id === scpiId 
        ? {
            ...item,
            allocation: clampedAllocation,
            investedAmount: Math.round((clampedAllocation / 100) * investmentAmount),
            shares: Math.floor(((clampedAllocation / 100) * investmentAmount) / item.price)
          }
        : item
    ));
  };

  // Équilibrer automatiquement les allocations
  const balanceAllocations = () => {
    const equalAllocation = 100 / portfolio.length;
    setPortfolio(prev => prev.map(item => ({
      ...item,
      allocation: equalAllocation,
      investedAmount: Math.round((equalAllocation / 100) * investmentAmount),
      shares: Math.floor(((equalAllocation / 100) * investmentAmount) / item.price)
    })));
  };

  // Calculs globaux
  const totalAllocation = portfolio.reduce((sum, item) => sum + item.allocation, 0);
  const totalInvested = portfolio.reduce((sum, item) => sum + item.investedAmount, 0);
  const averageYield = portfolio.length > 0 
    ? portfolio.reduce((sum, item) => sum + (item.yield * item.allocation / 100), 0)
    : 0;
  const annualIncome = (totalInvested * averageYield) / 100;
  const monthlyIncome = annualIncome / 12;

  // Données pour les graphiques
  const pieChartData = portfolio.map((item, index) => ({
    name: item.name,
    value: item.allocation,
    color: [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
      '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
    ][index % 10]
  }));

  const barChartData = portfolio.map((item, index) => ({
    name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
    value: item.investedAmount,
    color: [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
      '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
    ][index % 10]
  }));

  // Répartition sectorielle
  const sectorDistribution: Record<string, number> = {};
  portfolio.forEach(item => {
    // Créer un nom unique combinant secteur et nom de SCPI
    const sectorName = `${getSectorDisplayName(item.sector)} (${item.name.substring(0, 10)}...)`;
    if (!sectorDistribution[sectorName]) {
      sectorDistribution[sectorName] = 0;
    }
    sectorDistribution[sectorName] += item.allocation;
  });

  const sectorChartData = Object.entries(sectorDistribution)
    .map(([name, value], index) => ({
      name,
      value: Math.round(value * 10) / 10,
      color: [
        '#1e40af', '#059669', '#d97706', '#dc2626', '#7c3aed',
        '#0891b2', '#65a30d', '#ea580c', '#be185d', '#4f46e5'
      ][index % 10]
    }))
    .filter(item => item.value > 0);

  // Répartition géographique
  const geoDistribution: Record<string, number> = {};
  portfolio.forEach(item => {
    // Créer un nom unique combinant géographie et nom de SCPI
    const geoName = `${getGeographyDisplayName(item.geography)} (${item.name.substring(0, 10)}...)`;
    if (!geoDistribution[geoName]) {
      geoDistribution[geoName] = 0;
    }
    geoDistribution[geoName] += item.allocation;
  });

  const geoChartData = Object.entries(geoDistribution)
    .map(([name, value], index) => ({
      name,
      value: Math.round(value * 10) / 10,
      color: [
        '#2563eb', '#16a34a', '#ea580c', '#dc2626', '#9333ea',
        '#0891b2', '#84cc16', '#f97316', '#ec4899', '#6366f1'
      ][index % 10]
    }))
    .filter(item => item.value > 0);

  const getSectorDisplayName = (sector: string): string => {
    const sectorNames: Record<string, string> = {
      'bureaux': 'Bureaux',
      'commerces': 'Commerces',
      'residentiel': 'Résidentiel',
      'sante': 'Santé',
      'logistique': 'Logistique',
      'hotellerie': 'Hôtellerie',
      'diversifie': 'Diversifié'
    };
    return sectorNames[sector] || 'Autres';
  };

  const getGeographyDisplayName = (geography: string): string => {
    const geoNames: Record<string, string> = {
      'france': 'France',
      'europe': 'Europe',
      'international': 'International'
    };
    return geoNames[geography] || 'Autres';
  };

  const openCalendly = (type: 'souscription' | 'expert' = 'expert') => {
    const calendlyUrl = type === 'souscription' 
      ? 'https://calendly.com/eric-bellaiche/souscription-scpi'
      : 'https://calendly.com/eric-bellaiche/gp-rendez-vous-avec-eric-bellaiche-clone';
    window.open(calendlyUrl, '_blank');
  };

  const downloadPDF = () => {
    // Afficher un formulaire de contact puis générer le PDF
    const name = prompt('Votre nom complet :');
    const email = prompt('Votre email :');
    const phone = prompt('Votre téléphone (optionnel) :');
    
    if (name && email) {
      // Simuler la génération du PDF
      alert(`📄 Rapport PDF en cours de génération pour ${name} (${email})`);
      // Ici on appellerait generatePortfolioPDF() avec les données
    }
  };

  if (selectedScpi.length === 0) {
    return (
      <div className="text-center py-8">
        <PieChartIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Aucune SCPI sélectionnée
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Sélectionnez des SCPI pour voir la simulation
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            📊 Simulation de votre sélection
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Analyse de vos {selectedScpi.length} SCPI sélectionnées
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Étape 1: Montant à investir */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-600">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white">
              Montant à investir
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Définissez votre budget d'investissement total
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <input
            type="number"
            value={investmentAmount}
            onChange={(e) => setInvestmentAmount(parseInt(e.target.value) || 0)}
            className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-500 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-xl font-bold text-center focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
            min="1000"
            step="1000"
            placeholder="50000"
          />
          <div className="text-right">
            <div className="text-sm text-gray-600 dark:text-gray-300">Budget total</div>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(investmentAmount)}
            </div>
          </div>
        </div>
        
        {/* Boutons rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
          {[25000, 50000, 100000, 200000].map((amount) => (
            <button
              key={amount}
              onClick={() => setInvestmentAmount(amount)}
              className={`p-2 rounded-lg border transition-colors text-sm font-medium ${
                investmentAmount === amount
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:border-blue-300 dark:hover:border-blue-500'
              }`}
            >
              {formatCurrency(amount)}
            </button>
          ))}
        </div>
      </div>

      {/* Étape 2: Tableau interactif */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                Répartition du portefeuille
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Ajustez les allocations selon vos préférences
              </p>
            </div>
          </div>
          <button
            onClick={balanceAllocations}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            Équilibrer
          </button>
        </div>

        {/* Validation des allocations */}
        {Math.abs(totalAllocation - 100) > 0.1 && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                Total allocation: {totalAllocation.toFixed(1)}% (doit être 100%)
              </span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-600">
                <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-200">SCPI</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-200">Société</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-200">Allocation %</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-200">Allocation €</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-200">Nb parts</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-200">Parts min.</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-200">Prix/part</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-200">Souscription</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="py-4 px-2">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{item.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">{item.yield.toFixed(2)}% rendement</div>
                  </td>
                  <td className="py-4 px-2">
                    <div className="text-sm text-gray-700 dark:text-gray-200">{item.company}</div>
                  </td>
                  <td className="py-4 px-2">
                    <input
                      type="number"
                      value={item.allocation.toFixed(1)}
                      onChange={(e) => updateAllocation(item.id, parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 text-center border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </td>
                  <td className="py-4 px-2 text-center">
                    <div className="font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(item.investedAmount)}
                    </div>
                  </td>
                  <td className="py-4 px-2 text-center">
                    <div className="font-bold text-purple-600 dark:text-purple-400">
                      {item.shares}
                    </div>
                  </td>
                  <td className="py-4 px-2 text-center">
                    <div className="text-sm text-gray-700 dark:text-gray-200">
                      {Math.ceil(item.minInvest / item.price)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      ({formatCurrency(item.minInvest)})
                    </div>
                  </td>
                  <td className="py-4 px-2 text-center">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {item.price}€
                    </div>
                  </td>
                  <td className="py-4 px-2 text-center">
                    <div className="font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(item.shares * item.price * (1 + item.fees / 100))}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      frais inclus
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Résumé financier */}
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-sm text-green-600 dark:text-green-400 mb-1">Total investi</div>
              <div className="text-xl font-bold text-green-800 dark:text-green-200">
                {formatCurrency(totalInvested)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-green-600 dark:text-green-400 mb-1">Rendement moyen</div>
              <div className="text-xl font-bold text-green-800 dark:text-green-200">
                {averageYield.toFixed(2)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-green-600 dark:text-green-400 mb-1">Revenus/mois</div>
              <div className="text-xl font-bold text-green-800 dark:text-green-200">
                {formatCurrency(monthlyIncome)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-green-600 dark:text-green-400 mb-1">Revenus/an</div>
              <div className="text-xl font-bold text-green-800 dark:text-green-200">
                {formatCurrency(annualIncome)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Étape 3: Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition en pourcentage */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-600">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-blue-500" />
            Répartition par SCPI (%)
          </h4>
          <div className="flex justify-center">
            <PieChart data={pieChartData} animated={true} showLabels={true} />
          </div>
        </div>

        {/* Répartition en euros */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-600">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-500" />
            Répartition par montant (€)
          </h4>
          <div className="space-y-3">
            {barChartData.map((item, index) => {
              const maxValue = Math.max(...barChartData.map(d => d.value));
              const percentage = (item.value / maxValue) * 100;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {item.name}
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                    <div 
                      className="h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: item.color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Répartitions sectorielles et géographiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition sectorielle */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-600">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-500" />
            Répartition sectorielle
          </h4>
          <div className="space-y-3">
            {sectorChartData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {item.value.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${item.value}%`,
                      backgroundColor: item.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Répartition géographique */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-600">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-500" />
            Répartition géographique
          </h4>
          <div className="space-y-3">
            {geoChartData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {item.value.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${item.value}%`,
                      backgroundColor: item.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Métriques de performance */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-2xl border border-indigo-200 dark:border-indigo-600">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Métriques de performance
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl text-center">
            <div className="text-sm text-indigo-600 dark:text-indigo-400 mb-1">Diversification</div>
            <div className="text-xl font-bold text-indigo-800 dark:text-indigo-200">
              {sectorChartData.length} secteurs
            </div>
          </div>
          
          <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl text-center">
            <div className="text-sm text-indigo-600 dark:text-indigo-400 mb-1">Zones géo</div>
            <div className="text-xl font-bold text-indigo-800 dark:text-indigo-200">
              {geoChartData.length} zones
            </div>
          </div>
          
          <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl text-center">
            <div className="text-sm text-indigo-600 dark:text-indigo-400 mb-1">SCPI ISR</div>
            <div className="text-xl font-bold text-indigo-800 dark:text-indigo-200">
              {portfolio.filter(item => item.isr).length}/{portfolio.length}
            </div>
          </div>
          
          <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl text-center">
            <div className="text-sm text-indigo-600 dark:text-indigo-400 mb-1">Cap. totale</div>
            <div className="text-xl font-bold text-indigo-800 dark:text-indigo-200">
              {formatCurrency(portfolio.reduce((sum, item) => sum + item.capitalization, 0))}
            </div>
          </div>
        </div>
      </div>

      {/* Étape 4: Call-to-Actions */}
      <div className="flex gap-4 justify-center mt-6">
        <button
          onClick={() => openCalendly('expert')}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <Phone className="w-5 h-5" />
          📞 Prendre RDV avec un expert
        </button>
        
        <button
          onClick={downloadPDF}
          className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <Download className="w-5 h-5" />
          📥 Télécharger mon rapport PDF
        </button>
      </div>
    </div>
  );
};

export default SelectionSimulator;