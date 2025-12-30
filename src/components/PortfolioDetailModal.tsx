import React, { useState } from 'react';
import { X, TrendingUp, Building, MapPin, Target, Award, DollarSign, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { Scpi } from '../types/scpi';
import { formatCurrency } from '../utils/formatters';
import PieChart3DInteractive from './PieChart3DInteractive';

interface PortfolioDetailModalProps {
  selectedScpi: Scpi[];
  investmentAmount: number;
  isOpen: boolean;
  onClose: () => void;
  onRemoveScpi: (scpiId: number) => void;
}

const PortfolioDetailModal: React.FC<PortfolioDetailModalProps> = ({
  selectedScpi,
  investmentAmount,
  isOpen,
  onClose,
  onRemoveScpi
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'repartition' | 'analysis'>('overview');

  const handleTabChange = (tabKey: 'overview' | 'repartition' | 'analysis') => {
    setActiveTab(tabKey);
    const modalContent = document.querySelector('.overflow-y-auto');
    if (modalContent) {
      modalContent.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Calculs basés sur les vraies données SCPI
  const totalInvested = investmentAmount;
  const equalAllocation = selectedScpi.length > 0 ? 100 / selectedScpi.length : 0;
  
  const averageYield = selectedScpi.length > 0 
    ? selectedScpi.reduce((sum, scpi) => sum + scpi.yield, 0) / selectedScpi.length
    : 0;
  
  const annualIncome = (totalInvested * averageYield) / 100;
  const monthlyIncome = annualIncome / 12;

  // Calcul des répartitions sectorielles réelles (pondérées)
  const sectorDistribution: Record<string, number> = {};
  selectedScpi.forEach(scpi => {
    if (scpi.repartitionSector && scpi.repartitionSector.length > 0) {
      // Utiliser la vraie répartition sectorielle pondérée
      scpi.repartitionSector.forEach(sector => {
        const sectorName = sector.name;
        if (!sectorDistribution[sectorName]) {
          sectorDistribution[sectorName] = 0;
        }
        // Pondérer par l'allocation égale de cette SCPI
        sectorDistribution[sectorName] += (sector.value * equalAllocation) / 100;
      });
    } else {
      // Fallback : utiliser le secteur principal
      const sectorName = getSectorDisplayName(scpi.sector);
      sectorDistribution[sectorName] = (sectorDistribution[sectorName] || 0) + equalAllocation;
    }
  });

  const sectorData = Object.entries(sectorDistribution)
    .map(([name, value], index) => ({
      name,
      value: Math.round(value * 10) / 10,
      color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'][index % 7]
    }))
    .sort((a, b) => b.value - a.value)
    .filter(item => item.value > 0);

  // Calcul des répartitions géographiques réelles (pondérées)
  const geoDistribution: Record<string, number> = {};
  selectedScpi.forEach(scpi => {
    if (scpi.repartitionGeo && scpi.repartitionGeo.length > 0) {
      // Utiliser la vraie répartition géographique pondérée
      scpi.repartitionGeo.forEach(geo => {
        const geoName = geo.name;
        if (!geoDistribution[geoName]) {
          geoDistribution[geoName] = 0;
        }
        // Pondérer par l'allocation égale de cette SCPI
        geoDistribution[geoName] += (geo.value * equalAllocation) / 100;
      });
    } else {
      // Fallback : utiliser la géographie principale
      const geoName = getGeographyDisplayName(scpi.geography);
      geoDistribution[geoName] = (geoDistribution[geoName] || 0) + equalAllocation;
    }
  });

  const geoData = Object.entries(geoDistribution)
    .map(([name, value], index) => ({
      name,
      value: Math.round(value * 10) / 10,
      color: ['#1e40af', '#059669', '#dc2626', '#7c3aed', '#0891b2'][index % 5]
    }))
    .sort((a, b) => b.value - a.value)
    .filter(item => item.value > 0);

  // Données de performance réelles
  const performanceData = selectedScpi.map((scpi, index) => ({
    name: scpi.name.length > 15 ? scpi.name.substring(0, 15) + '...' : scpi.name,
    value: scpi.yield,
    color: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'][index % 6]
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
    { key: 'repartition', label: 'Répartition', icon: <PieChartIcon className="w-4 h-4" /> },
    { key: 'analysis', label: 'Analyse détaillée', icon: <BarChart3 className="w-4 h-4" /> }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-6xl max-h-[90vh] shadow-2xl border border-gray-200 dark:border-gray-600 flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-600 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              🎯 Analyse de Votre Sélection SCPI
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {selectedScpi.length} SCPI sélectionnée{selectedScpi.length > 1 ? 's' : ''} • {formatCurrency(investmentAmount)} à investir
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b-2 border-gray-300 dark:border-gray-600 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700/50 flex-shrink-0 overflow-x-auto overflow-y-hidden px-1 sm:px-2 py-1 sm:py-2 gap-1 scrollbar-hide">
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
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          
          {/* Vue générale */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Métriques principales */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl text-center border border-green-200 dark:border-green-800">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                    {averageYield.toFixed(2)}%
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">Rendement moyen</div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-center border border-blue-200 dark:border-blue-800">
                  <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {formatCurrency(monthlyIncome)}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">Revenus/mois</div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl text-center border border-purple-200 dark:border-purple-800">
                  <Building className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                    {new Set(selectedScpi.map(s => s.sector)).size}
                  </div>
                  <div className="text-sm text-purple-700 dark:text-purple-300">Secteurs</div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl text-center border border-orange-200 dark:border-orange-800">
                  <Award className="w-6 h-6 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                    {selectedScpi.filter(s => s.isr).length}
                  </div>
                  <div className="text-sm text-orange-700 dark:text-orange-300">SCPI ISR</div>
                </div>
              </div>

              {/* Liste des SCPI sélectionnées */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">SCPI sélectionnées</h3>
                {selectedScpi.map((scpi) => (
                  <div key={scpi.id} className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-600">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">{scpi.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">{scpi.company}</div>
                      </div>
                      <button
                        onClick={() => onRemoveScpi(scpi.id)}
                        className="p-1 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">Rendement</div>
                        <div className="font-bold text-green-600 dark:text-green-400">{scpi.yield.toFixed(2)}%</div>
                      </div>
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">Secteur</div>
                        <div className="font-bold text-gray-900 dark:text-white capitalize">{getSectorDisplayName(scpi.sector)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">Zone</div>
                        <div className="font-bold text-gray-900 dark:text-white capitalize">{getGeographyDisplayName(scpi.geography)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Répartition avec graphiques 3D */}
          {activeTab === 'repartition' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Répartition Sectorielle 3D */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Building className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    Répartition Sectorielle
                  </h4>
                  
                  {sectorData.length > 0 ? (
                    <>
                      <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 mb-6">
                        <PieChart3DInteractive
                          data={sectorData}
                          radius={5}
                          height={1}
                        />
                      </div>
                      
                      <div className="space-y-3">
                        {sectorData.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                            <div className="flex items-center gap-3">
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
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <Building className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">Aucune SCPI sélectionnée</p>
                    </div>
                  )}
                </div>

                {/* Répartition Géographique 3D */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-2xl border border-green-200 dark:border-green-800">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-green-600 dark:text-green-400" />
                    Répartition Géographique
                  </h4>
                  
                  {geoData.length > 0 ? (
                    <>
                      <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 mb-6">
                        <PieChart3DInteractive
                          data={geoData}
                          radius={5}
                          height={1}
                        />
                      </div>
                      
                      <div className="space-y-3">
                        {geoData.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                            <div className="flex items-center gap-3">
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
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <MapPin className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">Aucune SCPI sélectionnée</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Analyse détaillée */}
          {activeTab === 'analysis' && (
            <div className="space-y-8">
              {/* Graphique de performance 3D */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  Analyse des Rendements
                </h4>
                
                {performanceData.length > 0 ? (
                  <>
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 mb-6">
                      <PieChart3DInteractive
                        data={performanceData}
                        radius={6}
                        height={1.2}
                      />
                    </div>
                    
                    {/* Statistiques numériques */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl text-center">
                        <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">Total segments</div>
                        <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                          {performanceData.length}
                        </div>
                      </div>
                      
                      <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl text-center">
                        <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">Rendement max</div>
                        <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                          {Math.max(...performanceData.map(d => d.value)).toFixed(2)}%
                        </div>
                      </div>
                      
                      <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl text-center">
                        <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">Rendement min</div>
                        <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                          {Math.min(...performanceData.map(d => d.value)).toFixed(2)}%
                        </div>
                      </div>
                      
                      <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl text-center">
                        <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">Écart</div>
                        <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                          {(Math.max(...performanceData.map(d => d.value)) - Math.min(...performanceData.map(d => d.value))).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <TrendingUp className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Aucune donnée de performance disponible</p>
                  </div>
                )}
              </div>

              {/* Résumé financier */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-2xl border border-green-200 dark:border-green-800">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  💰 Résumé Financier
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/60 dark:bg-gray-800/60 p-6 rounded-xl text-center">
                    <div className="text-sm text-green-600 dark:text-green-400 mb-2">Investissement total</div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {formatCurrency(totalInvested)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Réparti sur {selectedScpi.length} SCPI
                    </div>
                  </div>
                  
                  <div className="bg-white/60 dark:bg-gray-800/60 p-6 rounded-xl text-center">
                    <div className="text-sm text-green-600 dark:text-green-400 mb-2">Revenus mensuels</div>
                    <div className="text-3xl font-bold text-green-800 dark:text-green-200 mb-2">
                      {formatCurrency(monthlyIncome)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Estimation basée sur {averageYield.toFixed(2)}%
                    </div>
                  </div>
                  
                  <div className="bg-white/60 dark:bg-gray-800/60 p-6 rounded-xl text-center">
                    <div className="text-sm text-green-600 dark:text-green-400 mb-2">Revenus annuels</div>
                    <div className="text-3xl font-bold text-green-800 dark:text-green-200 mb-2">
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
        </div>
      </div>
    </div>
  );
};

export default PortfolioDetailModal;