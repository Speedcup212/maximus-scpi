import React, { useState, useEffect } from 'react';
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Target, Award, Building, MapPin, Calendar, Download, Phone, Calculator, DollarSign, Shield, Info, CheckCircle, AlertTriangle, CreditCard as Edit3, X, Plus, ArrowRight, Star, Zap } from 'lucide-react';
import { Scpi } from '../types/scpi';
import { ClientProfile } from '../types/riskProfile';
import { formatCurrency } from '../utils/formatters';
import PieChart from './PieChart';

interface PortfolioItem extends Scpi {
  investedAmount: number;
  percentage: number;
}

interface PortfolioJourneyProps {
  selectedScpi: Scpi[];
  investmentAmount: number;
  onInvestmentChange: (amount: number) => void;
  onRemoveScpi: (scpiId: number) => void;
  clientProfile: ClientProfile | null;
  onExportPDF: () => void;
  onScheduleCall: () => void;
}

const PortfolioJourney: React.FC<PortfolioJourneyProps> = ({
  selectedScpi,
  investmentAmount,
  onInvestmentChange,
  onRemoveScpi,
  clientProfile,
  onExportPDF,
  onScheduleCall
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'simulation'>('overview');
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);

  const handleTabChange = (tabKey: 'overview' | 'analysis' | 'simulation') => {
    setActiveTab(tabKey);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Initialiser le portefeuille avec répartition égale
  useEffect(() => {
    if (selectedScpi.length > 0) {
      const equalPercentage = 100 / selectedScpi.length;
      const portfolioItems = selectedScpi.map(scpi => ({
        ...scpi,
        investedAmount: Math.round((equalPercentage / 100) * investmentAmount),
        percentage: equalPercentage
      }));
      setPortfolio(portfolioItems);
    } else {
      setPortfolio([]);
    }
  }, [selectedScpi, investmentAmount]);

  // Calculs globaux
  const totalInvested = portfolio.reduce((sum, item) => sum + item.investedAmount, 0);
  const averageYield = portfolio.length > 0 
    ? portfolio.reduce((sum, item) => sum + (item.yield * item.percentage / 100), 0)
    : 0;
  const annualIncome = (totalInvested * averageYield) / 100;
  const monthlyIncome = annualIncome / 12;
  
  const sectors = [...new Set(portfolio.map(item => item.sector))];
  const geographies = [...new Set(portfolio.map(item => item.geography))];
  const isrCount = portfolio.filter(item => item.isr).length;
  const noFeesCount = portfolio.filter(item => item.fees === 0).length;
  const averageTof = portfolio.length > 0 
    ? portfolio.reduce((sum, item) => sum + (item.tof * item.percentage / 100), 0)
    : 0;

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

  // Données pour les camemberts
  // Répartition sectorielle agrégée (pondérée par les vraies répartitions)
  const sectorDistribution: Record<string, number> = {};
  portfolio.forEach(item => {
    if (item.repartitionSector && item.repartitionSector.length > 0) {
      item.repartitionSector.forEach(sector => {
        const sectorName = sector.name;
        if (!sectorDistribution[sectorName]) {
          sectorDistribution[sectorName] = 0;
        }
        sectorDistribution[sectorName] += (sector.value * item.percentage) / 100;
      });
    } else {
      const sectorName = getSectorDisplayName(item.sector);
      if (!sectorDistribution[sectorName]) {
        sectorDistribution[sectorName] = 0;
      }
      sectorDistribution[sectorName] += item.percentage;
    }
  });

  const sectorData = Object.entries(sectorDistribution)
    .map(([name, value], index) => ({
      name,
      value: Math.round(value * 10) / 10,
      color: [
        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
        '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
      ][index % 10]
    }))
    .sort((a, b) => b.value - a.value)
    .filter(item => item.value > 0);

  // Répartition géographique agrégée (pondérée par les vraies répartitions)
  const geoDistribution: Record<string, number> = {};
  portfolio.forEach(item => {
    if (item.repartitionGeo && item.repartitionGeo.length > 0) {
      item.repartitionGeo.forEach(geo => {
        const geoName = geo.name;
        if (!geoDistribution[geoName]) {
          geoDistribution[geoName] = 0;
        }
        geoDistribution[geoName] += (geo.value * item.percentage) / 100;
      });
    } else {
      const geoName = getGeographyDisplayName(item.geography);
      if (!geoDistribution[geoName]) {
        geoDistribution[geoName] = 0;
      }
      geoDistribution[geoName] += item.percentage;
    }
  });

  const geoData = Object.entries(geoDistribution)
    .map(([name, value], index) => ({
      name,
      value: Math.round(value * 10) / 10,
      color: [
        '#1e40af', '#059669', '#d97706', '#dc2626', '#7c3aed',
        '#0891b2', '#65a30d', '#ea580c', '#be185d', '#4f46e5'
      ][index % 10]
    }))
    .sort((a, b) => b.value - a.value)
    .filter(item => item.value > 0);

  const yieldData = portfolio.map((item, index) => ({
    name: item.name.length > 12 ? item.name.substring(0, 12) + '...' : item.name,
    value: item.yield,
    color: [
      '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', 
      '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
    ][index % 10]
  }));

  const tabs = [
    { key: 'overview', label: 'Vue d\'ensemble', icon: <PieChartIcon className="w-4 h-4" /> },
    { key: 'analysis', label: 'Analyse détaillée', icon: <BarChart3 className="w-4 h-4" /> },
    { key: 'simulation', label: 'Simulation', icon: <Calculator className="w-4 h-4" /> }
  ];

  if (selectedScpi.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-600">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <PieChartIcon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Votre Parcours d'Investissement
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
            Sélectionnez des SCPI dans le comparateur pour découvrir votre analyse personnalisée et vos projections
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <ArrowRight className="w-4 h-4" />
            <span>Commencez par sélectionner vos premières SCPI</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
      {/* Header avec métriques principales */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              🎯 Votre Sélection SCPI
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {portfolio.length} SCPI sélectionnée{portfolio.length > 1 ? 's' : ''} • {formatCurrency(investmentAmount)} à investir
            </p>
          </div>
          {clientProfile && (
            <div 
              className="px-4 py-2 rounded-xl text-sm font-semibold border-2"
              style={{ 
                backgroundColor: `${clientProfile.riskProfile.color}20`,
                borderColor: clientProfile.riskProfile.color,
                color: clientProfile.riskProfile.color 
              }}
            >
              {clientProfile.riskProfile.icon} {clientProfile.riskProfile.name}
            </div>
          )}
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 rounded-xl border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Rendement</span>
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {averageYield.toFixed(2)}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Moyenne pondérée</div>
          </div>

          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 rounded-xl border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Revenus/mois</span>
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(monthlyIncome)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Estimation</div>
          </div>

          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 rounded-xl border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-2 mb-2">
              <Building className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Diversification</span>
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {sectors.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Secteurs</div>
          </div>

          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 rounded-xl border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Qualité</span>
            </div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {averageTof.toFixed(0)}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">TOF moyen</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b-2 border-gray-300 dark:border-gray-600 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700/50 overflow-x-auto overflow-y-hidden px-1 sm:px-2 py-1 sm:py-2 gap-1 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key as any)}
            title={tab.label}
            className={`flex-1 min-w-[80px] sm:min-w-0 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 font-bold transition-all duration-300 text-base whitespace-nowrap rounded-lg shadow-sm touch-manipulation ${
              activeTab === tab.key
                ? 'bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white shadow-lg sm:scale-105 border-2 border-blue-400 dark:border-blue-300'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600 hover:text-blue-700 dark:hover:text-blue-400 active:scale-95 sm:hover:scale-102 border-2 border-transparent'
            }`}
          >
            <span className={`${activeTab === tab.key ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'}`}>{tab.icon}</span>
            <span className={`text-xs sm:text-sm md:text-base ${activeTab === tab.key ? 'font-extrabold' : 'font-semibold'}`}>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Vue d'ensemble */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Composition du portefeuille */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <PieChartIcon className="w-6 h-6 text-blue-500" />
                Composition de votre sélection
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Liste des SCPI */}
                <div className="space-y-4">
                  {portfolio.map((item, index) => (
                    <div key={item.id} className="group p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="font-bold text-gray-900 dark:text-white text-lg">
                            {item.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            {item.company} • Créée en {item.creation}
                          </div>
                          <div className="flex gap-2">
                            {item.isr && (
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-xs font-semibold rounded-full">
                                🌱 ISR
                              </span>
                            )}
                            {item.fees === 0 && (
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-xs font-semibold rounded-full">
                                💰 0% frais
                              </span>
                            )}
                            {item.european && (
                              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 text-xs font-semibold rounded-full">
                                🇪🇺 Europe
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => onRemoveScpi(item.id)}
                          className="p-2 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Allocation</div>
                          <div className="font-bold text-blue-600 dark:text-blue-400">
                            {item.percentage.toFixed(1)}%
                          </div>
                        </div>
                        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Montant</div>
                          <div className="font-bold text-gray-900 dark:text-white">
                            {formatCurrency(item.investedAmount)}
                          </div>
                        </div>
                        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Rendement</div>
                          <div className="font-bold text-green-600 dark:text-green-400">
                            {item.yield.toFixed(2)}%
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-green-700 dark:text-green-300">Revenus annuels estimés</span>
                          <span className="font-bold text-green-800 dark:text-green-200">
                            {formatCurrency((item.investedAmount * item.yield) / 100)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Camembert de répartition */}
                <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6 text-center">
                    Répartition du portefeuille
                  </h4>
                  <div className="flex justify-center mb-6">
                    <PieChart 
                      data={sectorData} 
                      width={300} 
                      height={300}
                      animated={true}
                      showLabels={true}
                    />
                  </div>
                  <div className="space-y-2">
                    {sectorData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
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
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Résumé financier */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-2xl border border-green-200 dark:border-green-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                Résumé financier
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl text-center">
                  <div className="text-sm text-green-600 dark:text-green-400 mb-2">Investissement total</div>
                  <div className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                    {formatCurrency(totalInvested)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Réparti sur {portfolio.length} SCPI
                  </div>
                </div>
                
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl text-center">
                  <div className="text-sm text-green-600 dark:text-green-400 mb-2">Revenus mensuels</div>
                  <div className="text-3xl font-black text-green-800 dark:text-green-200 mb-2">
                    {formatCurrency(monthlyIncome)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Soit {(monthlyIncome / totalInvested * 100).toFixed(3)}%/mois
                  </div>
                </div>
                
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl text-center">
                  <div className="text-sm text-green-600 dark:text-green-400 mb-2">Revenus annuels</div>
                  <div className="text-3xl font-black text-green-800 dark:text-green-200 mb-2">
                    {formatCurrency(annualIncome)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Avant fiscalité
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analyse détaillée */}
        {activeTab === 'analysis' && (
          <div className="space-y-8">
            {/* Camemberts de répartition */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Répartition sectorielle */}
              <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-500" />
                  Répartition Sectorielle
                </h4>
                <div className="flex justify-center mb-6">
                  <PieChart 
                    data={sectorData} 
                    width={280} 
                    height={280}
                    animated={true}
                  />
                </div>
                <div className="space-y-3">
                  {sectorData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full shadow-sm"
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
                  ))}
                </div>
              </div>

              {/* Répartition géographique */}
              <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-500" />
                  Répartition Géographique
                </h4>
                <div className="flex justify-center mb-6">
                  <PieChart 
                    data={geoData} 
                    width={280} 
                    height={280}
                    animated={true}
                  />
                </div>
                <div className="space-y-3">
                  {geoData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full shadow-sm"
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
                  ))}
                </div>
              </div>
            </div>

            {/* Graphique des rendements */}
            <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-500" />
                Comparaison des rendements
              </h4>
              
              <div className="space-y-4">
                {yieldData.map((item, index) => {
                  const maxYield = Math.max(...yieldData.map(d => d.value));
                  const percentage = (item.value / maxYield) * 100;
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                          {item.name}
                        </span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {item.value.toFixed(2)}%
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

            {/* Caractéristiques du portefeuille */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                <h4 className="text-lg font-bold text-blue-800 dark:text-blue-200 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Qualité du portefeuille
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-700 dark:text-blue-300">TOF moyen</span>
                    <span className="font-bold text-blue-800 dark:text-blue-200">{averageTof.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-700 dark:text-blue-300">SCPI avec label ISR</span>
                    <span className="font-bold text-blue-800 dark:text-blue-200">{isrCount}/{portfolio.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-700 dark:text-blue-300">Sans frais d'entrée</span>
                    <span className="font-bold text-blue-800 dark:text-blue-200">{noFeesCount}/{portfolio.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-700 dark:text-blue-300">Diversification</span>
                    <span className="font-bold text-blue-800 dark:text-blue-200">{sectors.length} secteurs</span>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
                <h4 className="text-lg font-bold text-purple-800 dark:text-purple-200 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Performance vs marché
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-purple-700 dark:text-purple-300">Votre rendement</span>
                    <span className="font-bold text-purple-800 dark:text-purple-200">{averageYield.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-purple-700 dark:text-purple-300">Moyenne marché</span>
                    <span className="font-bold text-purple-800 dark:text-purple-200">5.10%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-purple-700 dark:text-purple-300">Écart</span>
                    <span className={`font-bold ${
                      averageYield > 5.1 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {averageYield > 5.1 ? '+' : ''}{(averageYield - 5.1).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Simulation */}
        {activeTab === 'simulation' && (
          <div className="space-y-8">
            {/* Paramètres d'investissement */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Calculator className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                Paramètres d'investissement
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                    💰 Montant total à investir
                  </label>
                  <input
                    type="number"
                    value={investmentAmount}
                    onChange={(e) => onInvestmentChange(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-500 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-xl font-bold text-center focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                    min="1000"
                    step="1000"
                  />
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {[25000, 50000, 100000, 200000].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => onInvestmentChange(amount)}
                        className={`p-2 rounded-lg border text-sm font-medium transition-colors ${
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

                <div className="space-y-4">
                  <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl">
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Rendement moyen pondéré</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {averageYield.toFixed(2)}%
                    </div>
                  </div>
                  <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl">
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">TOF moyen pondéré</div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {averageTof.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Projections temporelles */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-2xl border border-indigo-200 dark:border-indigo-600">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                Projections de performance
              </h3>
              
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute top-8 left-8 right-8 h-0.5 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 dark:from-indigo-600 dark:via-purple-600 dark:to-pink-600"></div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
                  {[
                    { years: 1, label: 'Court terme', color: 'from-blue-500 to-blue-600' },
                    { years: 5, label: 'Moyen terme', color: 'from-purple-500 to-purple-600' },
                    { years: 10, label: 'Long terme', color: 'from-indigo-500 to-indigo-600' },
                    { years: 15, label: 'Très long terme', color: 'from-pink-500 to-pink-600' }
                  ].map((period, index) => {
                    const projectedValue = totalInvested * Math.pow(1 + averageYield / 100, period.years);
                    const totalReturns = projectedValue - totalInvested;
                    const returnPercentage = ((projectedValue / totalInvested) - 1) * 100;
                    
                    return (
                      <div key={period.years} className="relative">
                        {/* Timeline dot */}
                        <div className={`absolute top-6 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-r ${period.color} rounded-full border-4 border-white dark:border-gray-800 shadow-lg z-10`}></div>
                        
                        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-200 dark:border-gray-600 mt-12 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                          <div className="text-center">
                            <div className={`inline-block px-3 py-1 bg-gradient-to-r ${period.color} text-white rounded-full text-sm font-bold mb-3`}>
                              {period.years} an{period.years > 1 ? 's' : ''}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                              {period.label}
                            </div>
                            <div className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                              {formatCurrency(projectedValue)}
                            </div>
                            <div className="text-sm text-green-600 dark:text-green-400 font-semibold mb-1">
                              +{formatCurrency(totalReturns)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              +{returnPercentage.toFixed(1)}% total
                            </div>
                            
                            {/* Progress bar */}
                            <div className="mt-3 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div 
                                className={`bg-gradient-to-r ${period.color} h-2 rounded-full transition-all duration-1000 ease-out`}
                                style={{ width: `${Math.min((returnPercentage / 200) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Analyse de risque */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                Analyse de risque
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl text-center">
                  <div className="text-sm text-yellow-600 dark:text-yellow-400 mb-2">Diversification</div>
                  <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                    {Math.round((sectors.length + geographies.length) / 8 * 100)}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {sectors.length} secteurs, {geographies.length} zones
                  </div>
                </div>
                
                <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl text-center">
                  <div className="text-sm text-yellow-600 dark:text-yellow-400 mb-2">Stabilité</div>
                  <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                    {averageTof.toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    TOF moyen
                  </div>
                </div>
                
                <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl text-center">
                  <div className="text-sm text-yellow-600 dark:text-yellow-400 mb-2">Impact ESG</div>
                  <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                    {Math.round((isrCount / portfolio.length) * 100)}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    SCPI ISR
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions principales */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={onExportPDF}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 dark:bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform"
          >
            <Download className="w-5 h-5" />
            Recevoir l'analyse PDF
          </button>
          
          <button
            onClick={onScheduleCall}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-green-600 dark:bg-green-500 text-white rounded-xl font-bold hover:bg-green-700 dark:hover:bg-green-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform"
          >
            <Phone className="w-5 h-5" />
            Prendre rendez-vous
          </button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioJourney;