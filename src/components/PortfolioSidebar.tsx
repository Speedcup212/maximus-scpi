import React, { useState } from 'react';
import { TrendingUp, PieChart, Building, MapPin, Target, Award, DollarSign, X } from 'lucide-react';
import { Scpi } from '../types/scpi';
import { formatCurrency } from '../utils/formatters';
import PieChart3DInteractive from './PieChart3DInteractive';

interface PortfolioSidebarProps {
  selectedScpi: Scpi[];
  investmentAmount: number;
  onInvestmentChange: (amount: number) => void;
  onRemoveScpi: (scpiId: number) => void;
  onViewDetails: () => void;
}

const PortfolioSidebar: React.FC<PortfolioSidebarProps> = ({
  selectedScpi,
  investmentAmount,
  onInvestmentChange,
  onRemoveScpi,
  onViewDetails
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis'>('overview');

  const handleTabChange = (tabKey: 'overview' | 'analysis') => {
    setActiveTab(tabKey);
    const sidebarContent = document.querySelector('[class*="overflow-y-auto"]');
    if (sidebarContent) {
      sidebarContent.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Calculs basés sur les vraies données SCPI
  const equalAllocation = selectedScpi.length > 0 ? 100 / selectedScpi.length : 0;
  const averageYield = selectedScpi.length > 0 
    ? selectedScpi.reduce((sum, scpi) => sum + scpi.yield, 0) / selectedScpi.length
    : 0;
  const estimatedAnnualIncome = (investmentAmount * averageYield) / 100;
  const estimatedMonthlyIncome = Math.ceil(estimatedAnnualIncome / 12);

  // Calcul des répartitions sectorielles réelles depuis les données Excel
  const sectorDistribution: Record<string, number> = {};
  selectedScpi.forEach(scpi => {
    const sectorName = getSectorDisplayName(scpi.sector);
    sectorDistribution[sectorName] = (sectorDistribution[sectorName] || 0) + equalAllocation;
  });

  const sectorData = Object.entries(sectorDistribution).map(([name, value], index) => ({
    name,
    value: Math.round(value * 10) / 10,
    color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'][index % 7]
  }));

  // Calcul des répartitions géographiques réelles depuis les données Excel
  const geoDistribution: Record<string, number> = {};
  selectedScpi.forEach(scpi => {
    const geoName = getGeographyDisplayName(scpi.geography);
    geoDistribution[geoName] = (geoDistribution[geoName] || 0) + equalAllocation;
  });

  const geoData = Object.entries(geoDistribution).map(([name, value], index) => ({
    name,
    value: Math.round(value * 10) / 10,
    color: ['#1e40af', '#059669', '#dc2626', '#7c3aed', '#0891b2'][index % 5]
  }));

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

  const tabs = [
    { key: 'overview', label: 'Vue générale', icon: <Target className="w-4 h-4" /> },
    { key: 'analysis', label: 'Analyse 3D', icon: <PieChart className="w-4 h-4" /> }
  ];

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl p-6 shadow-lg border-2 border-emerald-300 dark:border-emerald-700">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100">Votre Sélection</h3>
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            {selectedScpi.length}/6 SCPI sélectionnées
          </p>
        </div>
        <span className="bg-emerald-600 dark:bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {selectedScpi.length}/6
        </span>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b-2 border-gray-300 dark:border-gray-600 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700/50 rounded-lg overflow-x-auto overflow-y-hidden px-1 py-1 gap-1 mb-6 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key as any)}
            title={tab.label}
            className={`flex-1 min-w-[70px] flex flex-col items-center justify-center gap-1 px-2 py-2 font-bold transition-all duration-300 text-sm whitespace-nowrap rounded-md shadow-sm touch-manipulation ${
              activeTab === tab.key
                ? 'bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white shadow-lg scale-105 border-2 border-blue-400 dark:border-blue-300'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600 hover:text-blue-700 dark:hover:text-blue-400 active:scale-95 hover:scale-102 border-2 border-transparent'
            }`}
          >
            <span className={activeTab === tab.key ? 'text-base' : 'text-sm'}>{tab.icon}</span>
            <span className={`text-xs ${activeTab === tab.key ? 'font-extrabold' : 'font-semibold'}`}>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Vue générale */}
        {activeTab === 'overview' && (
          <>
            {/* Investment Amount */}
            <div className="p-4 bg-white dark:bg-gray-800/50 rounded-xl border border-emerald-200 dark:border-emerald-700">
              <label htmlFor="investment" className="block text-sm font-semibold text-emerald-800 dark:text-emerald-200 mb-2">
                Montant d'investissement (€)
              </label>
              <input
                type="number"
                id="investment"
                value={investmentAmount}
                onChange={(e) => onInvestmentChange(parseInt(e.target.value) || 0)}
                min="1000"
                step="1000"
                className="w-full px-4 py-3 border border-emerald-300 dark:border-emerald-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-lg font-semibold text-center focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent"
              />
            </div>

            {/* Key Metrics */}
            {selectedScpi.length > 0 && (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">Rendement moyen</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {averageYield.toFixed(2)}%
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Revenus estimés/mois</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(estimatedMonthlyIncome)}
                  </div>
                </div>
              </div>
            )}

            {/* Selected SCPI List */}
            <div className="space-y-3">
              {selectedScpi.length === 0 ? (
                <div className="text-center py-8 text-emerald-700 dark:text-emerald-300">
                  <p>Sélectionnez jusqu'à 6 SCPI</p>
                  <p>pour composer votre</p>
                  <p>portefeuille optimal</p>
                </div>
              ) : (
                selectedScpi.map((scpi) => (
                  <div
                    key={scpi.id}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800/50 rounded-lg border-l-4 border-emerald-500 dark:border-emerald-400"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-emerald-900 dark:text-emerald-100 text-sm">{scpi.name}</div>
                      <div className="text-xs text-emerald-700 dark:text-emerald-300">
                        {equalAllocation.toFixed(1)}% • {scpi.yield.toFixed(2)}% rendement
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveScpi(scpi.id)}
                      className="p-1 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors"
                      title="Retirer de la sélection"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* View Details Button */}
            {selectedScpi.length > 0 && (
              <button
                onClick={onViewDetails}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 transform"
              >
                <PieChart className="w-5 h-5" />
                Voir le détail du portefeuille
              </button>
            )}
          </>
        )}

        {/* Analyse 3D */}
        {activeTab === 'analysis' && (
          <>
            {selectedScpi.length > 0 ? (
              <div className="space-y-6">
                {/* Graphique 3D de répartition */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-center">
                    Répartition 3D Interactive
                  </h4>
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4">
                    <PieChart3DInteractive
                      data={sectorData}
                      radius={4}
                      height={0.8}
                    />
                  </div>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-center border border-blue-200 dark:border-blue-800">
                    <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Secteurs</div>
                    <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                      {new Set(selectedScpi.map(s => s.sector)).size}
                    </div>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl text-center border border-green-200 dark:border-green-800">
                    <div className="text-sm text-green-600 dark:text-green-400 mb-1">SCPI ISR</div>
                    <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                      {selectedScpi.filter(s => s.isr).length}/{selectedScpi.length}
                    </div>
                  </div>
                </div>

                {/* Légende des couleurs */}
                <div className="space-y-2">
                  {sectorData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
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
            ) : (
              <div className="text-center py-12">
                <PieChart className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Sélectionnez des SCPI pour voir l'analyse 3D
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PortfolioSidebar;