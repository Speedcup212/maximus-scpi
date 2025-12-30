import React, { useState } from 'react';
import { X, TrendingUp, PieChart as PieChartIcon, BarChart3, Target, Award, Building, MapPin, DollarSign, Calendar, Download, Phone, Calculator, Shield, CheckCircle, ChevronDown } from 'lucide-react';
import { Scpi } from '../types/scpi';
import { ClientProfile } from '../types/riskProfile';
import { formatCurrency } from '../utils/formatters';
import PieChart from './PieChart';
import GrowthChart from './GrowthChart';
import TimeSlider from './TimeSlider';
import RdvModal from './RdvModal';
import Logo from './Logo';

// Version Style Comète avec PieChart Canvas - v4.1 - PROD FIX - 2025-12-20
console.log('🎯 PortfolioResultsModal PRODUCTION avec bouton Souscrire - v4.1 - 2025-12-20');

interface PortfolioItem extends Scpi {
  investedAmount: number;
  percentage: number;
}

interface PortfolioResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedScpi: Scpi[];
  investmentAmount: number;
  clientProfile: ClientProfile | null;
  onExportPDF: () => void;
  onScheduleCall: () => void;
  onOpenSimulator?: () => void;
  onLogoClick?: () => void;
}

const PortfolioResultsModal: React.FC<PortfolioResultsModalProps> = ({
  isOpen,
  onClose,
  selectedScpi,
  investmentAmount,
  clientProfile,
  onExportPDF,
  onScheduleCall,
  onOpenSimulator,
  onLogoClick
}) => {
  // 🎯 VERSION ACCORDEONS v2.0 - Console log pour debug
  console.log('🎯 PortfolioResultsModal RENDU avec ACCORDEONS v2.0', { isOpen });

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    overview: true,
    analysis: false,
    simulation: false
  });
  const [customAllocations, setCustomAllocations] = useState<Record<string, number>>({});
  const [diversificationTab, setDiversificationTab] = useState<'sector' | 'geo'>('sector');
  const [mobileMetricTab, setMobileMetricTab] = useState<'diversity' | 'quality' | 'risk'>('diversity');
  const [isRdvModalOpen, setIsRdvModalOpen] = useState(false);

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Créer le portefeuille avec répartition personnalisée ou égale
  const portfolio: PortfolioItem[] = selectedScpi.map(scpi => {
    const customPercentage = customAllocations[scpi.id];
    const percentage = customPercentage !== undefined ? customPercentage : (100 / selectedScpi.length);
    return {
      ...scpi,
      investedAmount: Math.round((percentage / 100) * investmentAmount),
      percentage
    };
  });

  // Calculer le total des allocations personnalisées
  const totalAllocation = portfolio.reduce((sum, item) => sum + item.percentage, 0);
  const allocationError = Math.abs(totalAllocation - 100) > 0.1;

  // Fonction pour mettre à jour l'allocation d'une SCPI
  const handleAllocationChange = (scpiId: string, newPercentage: number) => {
    const clampedPercentage = Math.max(0, Math.min(100, newPercentage));
    setCustomAllocations(prev => ({
      ...prev,
      [scpiId]: clampedPercentage
    }));
  };

  // Fonction pour répartir équitablement
  const handleEqualDistribution = () => {
    const equalPercentage = 100 / selectedScpi.length;
    const newAllocations: Record<string, number> = {};
    selectedScpi.forEach(scpi => {
      newAllocations[scpi.id] = equalPercentage;
    });
    setCustomAllocations(newAllocations);
  };

  // Fonction pour ajuster automatiquement
  const handleAutoAdjust = () => {
    if (portfolio.length === 0) return;
    const diff = 100 - totalAllocation;
    const adjustedAllocations: Record<string, number> = { ...customAllocations };

    // Distribuer la différence sur toutes les SCPI
    const adjustment = diff / portfolio.length;
    portfolio.forEach(item => {
      const currentValue = adjustedAllocations[item.id] || (100 / selectedScpi.length);
      adjustedAllocations[item.id] = Math.max(0, currentValue + adjustment);
    });

    setCustomAllocations(adjustedAllocations);
  };

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

  // Profil de risque fixe à 3 par défaut (sera calculé plus tard)
  const roundedRiskProfile = 3;

  // Fonctions utilitaires
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

  // Liste des termes géographiques à exclure de la répartition sectorielle
  const geoKeywords = ['france', 'paris', 'région', 'europe', 'espagne', 'allemagne', 'italie',
    'royaume', 'pays', 'belgique', 'portugal', 'étranger', 'international', 'idf', 'ile-de-france',
    'atlantique', 'parisienne', 'dorsale', 'métropol', 'irlande', 'pologne', 'uk'];

  const isGeographicName = (name: string): boolean => {
    const lowerName = name.toLowerCase();
    return geoKeywords.some(keyword => lowerName.includes(keyword));
  };

  portfolio.forEach(item => {
    if (item.repartitionSector && item.repartitionSector.length > 0) {
      item.repartitionSector.forEach(sector => {
        const sectorName = sector.name;
        // Exclure les noms géographiques
        if (isGeographicName(sectorName)) return;

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

  // Données pour PieChart Canvas (format avec pourcentages arrondis)
  const sectorData = Object.entries(sectorDistribution)
    .map(([name, value], index) => ({
      name,
      value: Math.round(value * 10) / 10,
      color: [
        '#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
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

  // Données pour PieChart Canvas (format avec pourcentages arrondis)
  const geoData = Object.entries(geoDistribution)
    .map(([name, value], index) => ({
      name,
      value: Math.round(value * 10) / 10,
      color: [
        '#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
        '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
      ][index % 10]
    }))
    .sort((a, b) => b.value - a.value)
    .filter(item => item.value > 0);

  const sections = [
    { key: 'overview', label: 'Vue d\'ensemble', icon: <PieChartIcon className="w-5 h-5" /> },
    { key: 'analysis', label: 'Analyse détaillée', icon: <BarChart3 className="w-5 h-5" /> },
    { key: 'simulation', label: 'Simulation', icon: <Calculator className="w-5 h-5" /> }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-6xl max-h-[90vh] shadow-2xl border border-gray-200 dark:border-gray-600 flex flex-col my-4">
        
        {/* Header */}
        <div className="flex justify-between items-start gap-2 p-4 sm:p-6 border-b border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('🖱️ Logo cliqué dans PortfolioResultsModal', { hasOnLogoClick: !!onLogoClick });
              if (onLogoClick) {
                console.log('✅ Appel onLogoClick()');
                onLogoClick();
              } else {
                console.log('⚠️ Fallback: Appel onClose()');
                onClose();
              }
            }}
            className="flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-lg transition-transform hover:scale-105 group cursor-pointer"
            aria-label="Retour à l'accueil"
          >
            <Logo
              variant="icon"
              isDarkMode={false}
              className="w-auto h-10 sm:h-12 transition-all duration-300 group-hover:brightness-110 cursor-pointer"
            />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-gray-100 mb-1 leading-tight">
              🎯 Analyse SCPI
            </h2>
            <p className="text-xs sm:text-base font-medium text-gray-700 dark:text-gray-200">
              {portfolio.length} SCPI • {formatCurrency(investmentAmount)}
            </p>
            {clientProfile && (
              <div className="mt-1 flex items-center gap-2">
                <span className="text-base sm:text-lg">{clientProfile.riskProfile.icon}</span>
                <span
                  className="text-sm sm:text-base font-bold"
                  style={{ color: clientProfile.riskProfile.color }}
                >
                  {clientProfile.riskProfile.name}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Métriques principales */}
        <div className="px-3 sm:px-6 py-3 sm:py-4 bg-gray-50 dark:bg-gray-700/30 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-2 sm:p-3 rounded-xl text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                <span className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200">Rendement</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-green-600 dark:text-green-400">
                {averageYield.toFixed(2)}%
              </div>
              <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">Moyen</div>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-2 sm:p-3 rounded-xl text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200">Revenus/mois</span>
              </div>
              <div className="text-base sm:text-xl font-black text-blue-600 dark:text-blue-400">
                {formatCurrency(monthlyIncome)}
              </div>
              <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">Estimé</div>
            </div>

            {/* Widget multi-tabs MOBILE (Diversité + Qualité + Risque) */}
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-2 rounded-xl col-span-2 sm:hidden" data-widget="mobile-multi-metric">
              <div className="flex items-center justify-center gap-1 mb-2">
                <button
                  type="button"
                  onClick={() => setMobileMetricTab('diversity')}
                  className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    mobileMetricTab === 'diversity'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400'
                  }`}
                >
                  Diversité
                </button>
                <button
                  type="button"
                  onClick={() => setMobileMetricTab('quality')}
                  className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    mobileMetricTab === 'quality'
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400'
                  }`}
                >
                  TOF
                </button>
                <button
                  type="button"
                  onClick={() => setMobileMetricTab('risk')}
                  className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    mobileMetricTab === 'risk'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400'
                  }`}
                >
                  Risque
                </button>
              </div>

              <div className="text-center">
                {mobileMetricTab === 'diversity' && (
                  <>
                    <div className="flex gap-1 mb-2">
                      <button
                        onClick={() => setDiversificationTab('sector')}
                        className={`flex-1 px-2 py-0.5 rounded text-xs font-semibold ${
                          diversificationTab === 'sector'
                            ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        Secteurs
                      </button>
                      <button
                        onClick={() => setDiversificationTab('geo')}
                        className={`flex-1 px-2 py-0.5 rounded text-xs font-semibold ${
                          diversificationTab === 'geo'
                            ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        Zones
                      </button>
                    </div>
                    <div className="text-xl font-black text-purple-600 dark:text-purple-400">
                      {diversificationTab === 'sector' ? sectorData.length : geoData.length}
                    </div>
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                      {diversificationTab === 'sector' ? 'Secteurs' : 'Zones'}
                    </div>
                  </>
                )}

                {mobileMetricTab === 'quality' && (
                  <>
                    <div className="text-xl font-black text-orange-600 dark:text-orange-400 mb-1">
                      {averageTof.toFixed(0)}%
                    </div>
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                      Taux d'Occupation Financier
                    </div>
                  </>
                )}

                {mobileMetricTab === 'risk' && (
                  <>
                    <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 mb-2">
                      Niveau {roundedRiskProfile}
                    </div>
                    <div className="relative flex items-center justify-center mb-1">
                      <div className="absolute w-full h-0.5 bg-gray-300 dark:bg-gray-600" style={{ top: '50%' }} />
                      <div className="relative flex items-center justify-between w-full px-1">
                        {[1, 2, 3, 4, 5, 6, 7].map((level) => {
                          const isActive = level === roundedRiskProfile;
                          const getColor = () => {
                            if (level <= 2) return 'bg-green-500 border-green-600';
                            if (level <= 4) return 'bg-yellow-500 border-yellow-600';
                            if (level <= 5) return 'bg-orange-500 border-orange-600';
                            return 'bg-red-500 border-red-600';
                          };
                          return (
                            <div key={level}>
                              <div
                                className={`rounded-full transition-all border ${
                                  isActive ? `${getColor()} shadow-lg` : 'bg-gray-300 dark:bg-gray-600 border-gray-400'
                                }`}
                                style={{
                                  width: isActive ? '10px' : '6px',
                                  height: isActive ? '10px' : '6px',
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                      Profil de Risque
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Widget Diversification DESKTOP */}
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-2 sm:p-3 rounded-xl col-span-2 sm:col-span-1 hidden sm:block" data-widget="diversification-v2">
              <div className="flex items-center justify-center gap-1 mb-2">
                <button
                  type="button"
                  onClick={() => setDiversificationTab('sector')}
                  className={`flex-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                    diversificationTab === 'sector'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <Building className="w-3 h-3 inline mr-1" />
                  Secteurs
                </button>
                <button
                  type="button"
                  onClick={() => setDiversificationTab('geo')}
                  className={`flex-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                    diversificationTab === 'geo'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <MapPin className="w-3 h-3 inline mr-1" />
                  Zones
                </button>
              </div>
              <div className="text-center">
                {diversificationTab === 'sector' ? (
                  <>
                    <div className="text-lg sm:text-xl font-black text-purple-600 dark:text-purple-400">
                      {sectorData.length}
                    </div>
                    <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">Secteurs distincts</div>
                  </>
                ) : (
                  <>
                    <div className="text-lg sm:text-xl font-black text-purple-600 dark:text-purple-400">
                      {geoData.length}
                    </div>
                    <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">Zones géographiques</div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-2 sm:p-3 rounded-xl text-center hidden sm:block">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
                <span className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200">Qualité</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-orange-600 dark:text-orange-400">
                {averageTof.toFixed(0)}%
              </div>
              <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">TOF</div>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-2 sm:p-3 rounded-xl text-center hidden sm:block">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200">Profil Risque</span>
              </div>
              <div className="relative flex items-center justify-center mb-2">
                {/* Ligne de fond */}
                <div className="absolute w-full h-0.5 bg-gray-300 dark:bg-gray-600" style={{ top: '50%' }} />
                {/* Points 1-7 */}
                <div className="relative flex items-center justify-between w-full px-1">
                  {[1, 2, 3, 4, 5, 6, 7].map((level) => {
                    const isActive = level === roundedRiskProfile;
                    const getColor = () => {
                      if (level <= 2) return 'bg-green-500 dark:bg-green-400 border-green-600';
                      if (level <= 4) return 'bg-yellow-500 dark:bg-yellow-400 border-yellow-600';
                      if (level <= 5) return 'bg-orange-500 dark:bg-orange-400 border-orange-600';
                      return 'bg-red-500 dark:bg-red-400 border-red-600';
                    };

                    return (
                      <div key={level} className="flex flex-col items-center">
                        <div
                          className={`rounded-full transition-all border-2 ${
                            isActive
                              ? `${getColor()} shadow-lg`
                              : 'bg-gray-300 dark:bg-gray-600 border-gray-400 dark:border-gray-500'
                          }`}
                          style={{
                            width: isActive ? '14px' : '8px',
                            height: isActive ? '14px' : '8px',
                          }}
                        />
                        <span className={`text-xs mt-0.5 ${isActive ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                          {level}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="text-lg sm:text-xl font-black text-indigo-600 dark:text-indigo-400">
                {roundedRiskProfile}
              </div>
            </div>
          </div>
        </div>

        {/* Accordéons Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">

          {/* Accordéon Analyse détaillée */}
          <div className="border-2 border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
            <button
              onClick={() => toggleSection('analysis')}
              className="w-full flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 transition-all shadow-xl backdrop-blur-md rounded-t-xl"
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                <h3 className="font-black text-base sm:text-lg text-gray-900 dark:text-white">Analyse détaillée</h3>
              </div>
              <ChevronDown
                className={`w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-300 transition-transform duration-300 ${
                  openSections.analysis ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openSections.analysis && (
            <div className="p-4 sm:p-6 space-y-8 bg-gray-50 dark:bg-gray-900/30">

              {/* Projection sur 15 ans - EN HAUT, FULL WIDTH */}
              <div className="w-full bg-white dark:bg-gray-800 p-6 rounded-xl border-2 border-gray-300 dark:border-gray-600 shadow-lg">
                <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  Projection sur 15 ans
                </h4>
                <GrowthChart
                  data={[
                    { year: 1, value: totalInvested * Math.pow(1 + averageYield / 100, 1), label: '1 an' },
                    { year: 3, value: totalInvested * Math.pow(1 + averageYield / 100, 3), label: '3 ans' },
                    { year: 5, value: totalInvested * Math.pow(1 + averageYield / 100, 5), label: '5 ans' },
                    { year: 7, value: totalInvested * Math.pow(1 + averageYield / 100, 7), label: '7 ans' },
                    { year: 10, value: totalInvested * Math.pow(1 + averageYield / 100, 10), label: '10 ans' },
                    { year: 12, value: totalInvested * Math.pow(1 + averageYield / 100, 12), label: '12 ans' },
                    { year: 15, value: totalInvested * Math.pow(1 + averageYield / 100, 15), label: '15 ans' }
                  ]}
                  initialValue={totalInvested}
                />
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 p-4 rounded-lg border border-emerald-200 dark:border-emerald-700">
                    <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-1">Capital Initial</div>
                    <div className="text-xl font-black text-emerald-700 dark:text-emerald-300">
                      {formatCurrency(totalInvested)}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                    <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">Valeur à 15 ans</div>
                    <div className="text-xl font-black text-blue-700 dark:text-blue-300">
                      {formatCurrency(totalInvested * Math.pow(1 + averageYield / 100, 15))}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/30 dark:to-purple-900/30 p-4 rounded-lg border border-violet-200 dark:border-violet-700 col-span-2 md:col-span-1">
                    <div className="text-xs font-semibold text-violet-700 dark:text-violet-300 mb-1">Gains Totaux</div>
                    <div className="text-xl font-black text-violet-700 dark:text-violet-300">
                      +{formatCurrency((totalInvested * Math.pow(1 + averageYield / 100, 15)) - totalInvested)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Camemberts de répartition - EN BAS, CÔTE À CÔTE */}
              <div className="w-full flex flex-col md:flex-row gap-6 lg:gap-8">
                {/* Répartition sectorielle - Style Comète */}
                <div className="flex-1 bg-white dark:bg-gray-800 p-6 rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-lg flex flex-col">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-lg">
                    <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Répartition Sectorielle
                  </h4>
                  <div className="flex flex-col items-center flex-1">
                    {/* Graphique Canvas avec effet Comète */}
                    <div className="flex-1 flex items-center justify-center">
                      <PieChart data={sectorData} width={300} height={300} animated={true} />
                    </div>
                    {/* Légende en dessous */}
                    <div className="w-full mt-6 space-y-2">
                      {sectorData.map((sector, index) => (
                        <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full shadow-sm"
                              style={{ backgroundColor: sector.color }}
                            />
                            <span className="text-gray-700 dark:text-gray-200 font-medium">{sector.name}</span>
                          </div>
                          <span className="font-bold text-gray-900 dark:text-white">{sector.value.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Répartition géographique - Style Comète */}
                <div className="flex-1 bg-white dark:bg-gray-800 p-6 rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-lg flex flex-col">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-lg">
                    <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                    Répartition Géographique
                  </h4>
                  <div className="flex flex-col items-center flex-1">
                    {/* Graphique Canvas avec effet Comète */}
                    <div className="flex-1 flex items-center justify-center">
                      <PieChart data={geoData} width={300} height={300} animated={true} />
                    </div>
                    {/* Légende en dessous */}
                    <div className="w-full mt-6 space-y-2">
                      {geoData.map((geo, index) => (
                        <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full shadow-sm"
                              style={{ backgroundColor: geo.color }}
                            />
                            <span className="text-gray-700 dark:text-gray-200 font-medium">{geo.name}</span>
                          </div>
                          <span className="font-bold text-gray-900 dark:text-white">{geo.value.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            )}
          </div>

          {/* Accordéon Simulation */}
          <div className="border-2 border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
            <button
              onClick={() => toggleSection('simulation')}
              className="w-full flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-all shadow-xl backdrop-blur-md rounded-t-xl"
            >
              <div className="flex items-center gap-3">
                <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                <h3 className="font-black text-base sm:text-lg text-gray-900 dark:text-white">Simulation</h3>
              </div>
              <ChevronDown
                className={`w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-300 transition-transform duration-300 ${
                  openSections.simulation ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openSections.simulation && (
            <div className="p-4 sm:p-6 space-y-6 bg-gray-50 dark:bg-gray-900/30">
              {/* Investment Amount Reminder */}
              <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800 p-5 rounded-xl border-2 border-slate-300 dark:border-slate-600 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-600 dark:bg-slate-400 p-3 rounded-lg">
                      <DollarSign className="w-6 h-6 text-white dark:text-slate-900" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-1">
                        Capital Investi
                      </div>
                      <div className="text-3xl font-black text-slate-900 dark:text-white">
                        {formatCurrency(totalInvested)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      {portfolio.length} SCPI sélectionnée{portfolio.length > 1 ? 's' : ''}
                    </div>
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Portefeuille diversifié
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-50 dark:from-emerald-900/30 dark:via-green-900/30 dark:to-emerald-900/30 p-5 rounded-xl border-2 border-emerald-300 dark:border-emerald-700 shadow-md">
                  <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-1 uppercase tracking-wider">
                    Revenus Mensuels
                  </div>
                  <div className="text-3xl font-black text-emerald-700 dark:text-emerald-300 mb-1">
                    {formatCurrency(monthlyIncome)}
                  </div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    ~{formatCurrency(annualIncome)} par an
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 dark:from-blue-900/30 dark:via-cyan-900/30 dark:to-blue-900/30 p-5 rounded-xl border-2 border-blue-300 dark:border-blue-700 shadow-md">
                  <div className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-1 uppercase tracking-wider">
                    Rendement Moyen
                  </div>
                  <div className="text-3xl font-black text-blue-700 dark:text-blue-300 mb-1">
                    {averageYield.toFixed(2)}%
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                    Pondéré sur le portefeuille
                  </div>
                </div>

                <div className="bg-gradient-to-br from-violet-50 via-purple-50 to-violet-50 dark:from-violet-900/30 dark:via-purple-900/30 dark:to-violet-900/30 p-5 rounded-xl border-2 border-violet-300 dark:border-violet-700 shadow-md">
                  <div className="text-xs font-bold text-violet-700 dark:text-violet-300 mb-1 uppercase tracking-wider">
                    Gain sur 10 ans
                  </div>
                  <div className="text-3xl font-black text-violet-700 dark:text-violet-300 mb-1">
                    {formatCurrency((totalInvested * Math.pow(1 + averageYield / 100, 10)) - totalInvested)}
                  </div>
                  <div className="text-xs text-violet-600 dark:text-violet-400 font-semibold">
                    +{(((Math.pow(1 + averageYield / 100, 10)) - 1) * 100).toFixed(1)}% de croissance
                  </div>
                </div>
              </div>

              {/* Growth Chart */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border-2 border-gray-300 dark:border-gray-600 shadow-lg">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  Courbe de croissance de votre sélection
                </h3>
                <GrowthChart
                  data={[
                    { year: 1, value: totalInvested * Math.pow(1 + averageYield / 100, 1), label: '1 an' },
                    { year: 5, value: totalInvested * Math.pow(1 + averageYield / 100, 5), label: '5 ans' },
                    { year: 10, value: totalInvested * Math.pow(1 + averageYield / 100, 10), label: '10 ans' },
                    { year: 15, value: totalInvested * Math.pow(1 + averageYield / 100, 15), label: '15 ans' }
                  ]}
                  initialValue={totalInvested}
                />
              </div>

              {/* Interactive Time Slider */}
              <TimeSlider
                initialValue={totalInvested}
                averageYield={averageYield}
                minYears={1}
                maxYears={20}
              />

              {/* Period Cards */}
              <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-blue-900/30 p-6 rounded-xl border-2 border-blue-300 dark:border-blue-700 shadow-md">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <Calculator className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  Projections clés
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { years: 1, label: 'Court terme', color: 'from-cyan-500 to-blue-600', borderColor: 'cyan', icon: '📅' },
                    { years: 5, label: 'Moyen terme', color: 'from-violet-500 to-purple-600', borderColor: 'violet', icon: '📈' },
                    { years: 10, label: 'Long terme', color: 'from-blue-500 to-indigo-600', borderColor: 'blue', icon: '🎯' },
                    { years: 15, label: 'Très long terme', color: 'from-purple-500 to-fuchsia-600', borderColor: 'purple', icon: '🚀' }
                  ].map((period) => {
                    const projectedValue = totalInvested * Math.pow(1 + averageYield / 100, period.years);
                    const totalReturns = projectedValue - totalInvested;
                    const returnPercentage = ((projectedValue / totalInvested) - 1) * 100;
                    const yearlyIncome = (projectedValue * averageYield) / 100;
                    const monthlyIncomeProjected = yearlyIncome / 12;

                    const borderColorClass = `border-${period.borderColor}-300 dark:border-${period.borderColor}-600 hover:border-${period.borderColor}-400 dark:hover:border-${period.borderColor}-500`;

                    return (
                      <div key={period.years} className="relative group">
                        <div className="bg-white dark:bg-gray-800 backdrop-blur-sm p-5 rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                          <div className="text-center">
                            <div className="text-3xl mb-2">{period.icon}</div>
                            <div className={`inline-block px-3 py-1 bg-gradient-to-r ${period.color} text-white rounded-full text-xs font-bold mb-3 shadow-md`}>
                              {period.years} an{period.years > 1 ? 's' : ''}
                            </div>
                            <div className="text-sm text-gray-700 dark:text-gray-300 mb-2 font-semibold">
                              {period.label}
                            </div>

                            <div className="space-y-2 mb-3">
                              <div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">Valeur</div>
                                <div className="text-xl font-black text-gray-900 dark:text-gray-100">
                                  {formatCurrency(projectedValue)}
                                </div>
                              </div>

                              <div className="pt-2 border-t-2 border-gray-200 dark:border-gray-700">
                                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">Gain total</div>
                                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                  +{formatCurrency(totalReturns)}
                                </div>
                                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                                  +{returnPercentage.toFixed(1)}%
                                </div>
                              </div>

                              <div className="pt-2 border-t-2 border-gray-200 dark:border-gray-700">
                                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">Revenus année {period.years}</div>
                                <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                  {formatCurrency(monthlyIncomeProjected)}/mois
                                </div>
                              </div>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${period.color} transition-all duration-1000 shadow-sm`}
                                style={{ width: `${Math.min(returnPercentage, 100)}%` }}
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
            )}
          </div>

          {/* Accordéon Votre Répartition */}
          <div className="border-2 border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
            <button
              onClick={() => toggleSection('overview')}
              className="w-full flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 transition-all shadow-xl backdrop-blur-md rounded-t-xl"
            >
              <div className="flex items-center gap-3">
                <PieChartIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                <h3 className="font-black text-base sm:text-lg text-gray-900 dark:text-white">Votre Répartition</h3>
              </div>
              <ChevronDown
                className={`w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-300 transition-transform duration-300 ${
                  openSections.overview ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openSections.overview && (
            <div className="p-4 sm:p-6 space-y-4 bg-gray-50 dark:bg-gray-900/30">
              {/* Contrôles de répartition */}
              <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-600">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                      Répartition totale: {totalAllocation.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleEqualDistribution}
                      className="flex-1 sm:flex-none px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      Répartir équitablement
                    </button>
                    {allocationError && (
                      <button
                        onClick={handleAutoAdjust}
                        className="flex-1 sm:flex-none px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        Ajuster à 100%
                      </button>
                    )}
                  </div>
                </div>
                {allocationError && (
                  <div className="text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                    ⚠️ La répartition doit totaliser 100%
                  </div>
                )}
              </div>

              {/* Liste des SCPI en grille responsive */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                {portfolio.map((item, index) => (
                  <div key={item.id} className="group p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-300">
                    {/* En-tête SCPI */}
                    <div className="mb-3">
                      <div className="font-black text-gray-900 dark:text-white text-sm sm:text-base mb-1">
                        {item.name}
                      </div>
                      <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                        {item.company}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.isr && (
                          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-xs font-bold rounded-full">
                            🌱 ISR
                          </span>
                        )}
                        {item.fees === 0 && (
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-xs font-bold rounded-full">
                            💰 0% frais
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Slider d'allocation */}
                    <div className="mb-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-200">
                          Allocation
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.5"
                            value={item.percentage.toFixed(1)}
                            onChange={(e) => handleAllocationChange(item.id, parseFloat(e.target.value) || 0)}
                            className="w-14 sm:w-16 px-1 sm:px-2 py-1 text-center text-xs sm:text-sm font-bold bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <span className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200">%</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="0.5"
                        value={item.percentage}
                        onChange={(e) => handleAllocationChange(item.id, parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>

                    {/* Métriques */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Montant</div>
                        <div className="font-black text-gray-900 dark:text-white text-xs sm:text-sm">
                          {formatCurrency(item.investedAmount)}
                        </div>
                      </div>
                      <div className="text-center p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Rendement</div>
                        <div className="font-black text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">
                          {item.yield.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )}
          </div>

        </div>

        {/* Actions principales */}
        <div className="flex gap-4 p-6 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30 flex-shrink-0">
          <button
            onClick={() => setIsRdvModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-green-600 dark:bg-green-500 text-white rounded-xl font-black text-base hover:bg-green-700 dark:hover:bg-green-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform"
          >
            <Calendar className="w-4 h-4" />
            Souscrire
          </button>
        </div>
      </div>

      {/* Modal Prendre RDV */}
      <RdvModal
        isOpen={isRdvModalOpen}
        onClose={() => setIsRdvModalOpen(false)}
        selectedScpi={selectedScpi}
        clientProfile={clientProfile}
      />
    </div>
  );
};

export default PortfolioResultsModal;