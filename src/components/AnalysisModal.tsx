import React, { useState } from 'react';
import {
  X, TrendingUp, Building, MapPin, Calendar, DollarSign,
  BarChart3, PieChart as PieChartIcon, Activity, Award,
  Shield, Target, Calculator, ChevronDown
} from 'lucide-react';
import { Scpi } from '../types/scpi';
import { formatCurrency, formatPercentage, getPerformanceColor, getDiscountColor } from '../utils/formatters';
import { getScpiPresentation, getScpiAnalysis, getScpiNews, getScpiAdvantages, getScpiPointsAttention } from '../utils/scpiAnalysis';
import PieChart from './PieChart';
// PDF Generator loaded dynamically if needed
// Force rebuild: 2025-10-23 05:55 UTC - CRITICAL: Deploy both accordions to production

interface AnalysisModalProps {
  scpi: Scpi | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToPortfolio?: (scpi: Scpi) => void;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({ scpi, isOpen, onClose, onAddToPortfolio }) => {
  const [openSection, setOpenSection] = useState<'overview' | 'charts' | 'analysis' | null>(null);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !scpi) return null;

  // Préparer les données pour les camemberts
  const sectorData = scpi.repartitionSector?.map((item, index) => ({
    name: item.name,
    value: item.value,
    color: [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
      '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
    ][index % 10]
  })) || [];

  const geoData = scpi.repartitionGeo?.map((item, index) => ({
    name: item.name,
    value: item.value,
    color: [
      '#1e40af', '#059669', '#d97706', '#dc2626', '#7c3aed',
      '#0891b2', '#65a30d', '#ea580c', '#be185d', '#4f46e5'
    ][index % 10]
  })) || [];

  // Données pour les graphiques de performance
  const performanceData = [
    { name: 'Rendement', value: scpi.yield, max: 12, color: '#10b981' },
    { name: 'TOF', value: scpi.tof, max: 100, color: '#3b82f6' },
    { name: 'Ancienneté', value: new Date().getFullYear() - scpi.creation, max: 50, color: '#f59e0b' }
  ];

  // Score de qualité global
  const qualityScore = (() => {
    let score = 0;
    if (scpi.yield >= 5) score += 25;
    else if (scpi.yield >= 3.5) score += 15;
    
    if (scpi.tof >= 95) score += 25;
    else if (scpi.tof >= 90) score += 15;
    
    if (scpi.isr) score += 20;
    if (scpi.fees === 0) score += 15;
    if (scpi.capitalization >= 500000000) score += 15;
    
    return Math.min(score, 100);
  })();

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const accordionSections = [
    { key: 'overview' as const, label: 'Vue d\'ensemble', icon: BarChart3 },
    { key: 'charts' as const, label: 'Répartitions', icon: PieChartIcon },
    { key: 'analysis' as const, label: 'Analyse détaillée', icon: Activity }
  ];

  const toggleSection = (section: 'overview' | 'charts' | 'analysis') => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={handleBackdropClick}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 dark:border-gray-600 my-4">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-600 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 flex-shrink-0">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100">
                {scpi.name}
              </h2>
              <div className="flex gap-2">
                {scpi.isr && (
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-sm font-black rounded-full">
                    🌱 ISR
                  </span>
                )}
                {scpi.fees === 0 && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-sm font-black rounded-full">
                    💰 0% frais
                  </span>
                )}
                {scpi.european && (
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 text-sm font-black rounded-full">
                    🇪🇺 Europe
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 text-gray-700 dark:text-gray-200 text-base font-medium">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                <span className="font-medium">{scpi.company}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{scpi.creation}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span className="capitalize">{scpi.sector}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Accordion Navigation (Mobile-First) */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {accordionSections.map((section) => (
            <div key={section.key} className="border-b border-gray-200 dark:border-gray-600">
              {/* Accordion Header */}
              <button
                onClick={() => toggleSection(section.key)}
                className="w-full flex items-center justify-between p-4 md:p-5 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 hover:from-blue-50 hover:to-blue-50 dark:hover:from-gray-700 dark:hover:to-gray-700 transition-all duration-200 touch-manipulation min-h-[64px]"
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <section.icon className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span className="text-base md:text-lg font-bold text-gray-900 dark:text-white text-left">
                    {section.label}
                  </span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 md:w-6 md:h-6 text-gray-600 dark:text-gray-400 transition-transform duration-300 flex-shrink-0 ${
                    openSection === section.key ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Accordion Content */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openSection === section.key ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-4 md:p-6 bg-white dark:bg-gray-800">
                  {section.key === 'overview' && (
            <div className="space-y-6">
              {/* Métriques principales */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl text-center border border-green-200 dark:border-green-800">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-black text-green-600 dark:text-green-400 mb-1">
                    {scpi.yield.toFixed(2)}%
                  </div>
                  <div className="text-sm font-bold text-green-700 dark:text-green-300">
                    Taux de distribution 2024
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-center border border-blue-200 dark:border-blue-800">
                  <Target className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mb-1">
                    {scpi.tof}%
                  </div>
                  <div className="text-sm font-bold text-blue-700 dark:text-blue-300">
                    TOF
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl text-center border border-purple-200 dark:border-purple-800">
                  <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                  <div className="text-xl font-black text-purple-600 dark:text-purple-400 mb-1">
                    {formatCurrency(scpi.capitalization)}
                  </div>
                  <div className="text-sm font-bold text-purple-700 dark:text-purple-300">
                    Capitalisation
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl text-center border border-orange-200 dark:border-orange-800">
                  <Award className="w-6 h-6 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                  <div className={`text-2xl font-black mb-1 ${getQualityColor(qualityScore)}`}>
                    {qualityScore}/100
                  </div>
                  <div className="text-sm font-bold text-orange-700 dark:text-orange-300">
                    Score
                  </div>
                </div>
              </div>

              {/* Informations détaillées */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Caractéristiques financières */}
                <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                  <h4 className="font-black text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-lg">
                    <Calculator className="w-5 h-5 text-blue-500" />
                    Caractéristiques financières
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-1.5 bg-white dark:bg-gray-800 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Prix/part</span>
                      <span className="font-black text-gray-900 dark:text-white text-sm">{scpi.price}€</span>
                    </div>
                    <div className="flex justify-between items-center p-1.5 bg-white dark:bg-gray-800 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Décote</span>
                      <span className={`font-black text-sm ${getDiscountColor(scpi.discount)}`}>
                        {formatPercentage(scpi.discount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-1.5 bg-white dark:bg-gray-800 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Frais</span>
                      <span className={`font-black text-sm ${scpi.fees === 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                        {scpi.fees}% TTC
                      </span>
                    </div>
                  </div>
                </div>

                {/* Informations générales */}
                <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                  <h4 className="font-black text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-lg">
                    <Building className="w-5 h-5 text-purple-500" />
                    Informations générales
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-1.5 bg-white dark:bg-gray-800 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Secteur</span>
                      <span className="font-black text-gray-900 dark:text-white capitalize text-sm">{scpi.sector}</span>
                    </div>
                    <div className="flex justify-between items-center p-1.5 bg-white dark:bg-gray-800 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Zone</span>
                      <span className="font-black text-gray-900 dark:text-white capitalize text-sm">{scpi.geography}</span>
                    </div>
                    <div className="flex justify-between items-center p-1.5 bg-white dark:bg-gray-800 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Création</span>
                      <span className="font-black text-gray-900 dark:text-white text-sm">{scpi.creation}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Simulation d'investissement */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
                <h4 className="font-black text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-lg">
                  <Calculator className="w-5 h-5 text-green-600 dark:text-green-400" />
                  Simulation d'investissement
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[10000, 50000, 100000].map((amount) => {
                    const shares = Math.floor(amount / scpi.price);
                    const exactAmount = shares * scpi.price;
                    const annualReturn = exactAmount * scpi.yield / 100;
                    const monthlyReturn = annualReturn / 12;
                    
                    return (
                      <div key={amount} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 rounded-lg border border-green-200 dark:border-green-700">
                        <div className="text-center">
                          <div className="text-sm font-black text-green-600 dark:text-green-400 mb-1">
                            {formatCurrency(amount)}
                          </div>
                          <div className="space-y-0.5 text-sm">
                            <div className="font-medium text-gray-700 dark:text-gray-200">{shares} parts</div>
                            <div className="font-black text-green-600 dark:text-green-400">{formatCurrency(monthlyReturn)}/mois</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
                  )}
                  {section.key === 'charts' && (
            <div className="space-y-8">
              {/* Répartitions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Répartition sectorielle */}
                <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                  <h4 className="font-black text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-lg">
                    <Building className="w-6 h-6 text-blue-500" />
                    Répartition Sectorielle
                  </h4>
                  
                  {sectorData.length > 0 ? (
                    <>
                      <div className="flex justify-center mb-6">
                        <PieChart data={sectorData} width={280} height={280} animated={true} />
                      </div>
                      <div className="space-y-3">
                        {sectorData.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded-full shadow-sm"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                                {item.name}
                              </span>
                            </div>
                            <span className="text-sm font-black text-gray-900 dark:text-white">
                              {item.value.toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <Building className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">Données non disponibles</p>
                    </div>
                  )}
                </div>

                {/* Répartition géographique */}
                <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                  <h4 className="font-black text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-lg">
                    <MapPin className="w-6 h-6 text-green-500" />
                    Répartition Géographique
                  </h4>
                  
                  {geoData.length > 0 ? (
                    <>
                      <div className="flex justify-center mb-6">
                        <PieChart data={geoData} width={280} height={280} animated={true} />
                      </div>
                      <div className="space-y-3">
                        {geoData.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded-full shadow-sm"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                                {item.name}
                              </span>
                            </div>
                            <span className="text-sm font-black text-gray-900 dark:text-white">
                              {item.value.toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <MapPin className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">Données non disponibles</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
                  )}
                  {section.key === 'analysis' && (
            <div className="space-y-6">
              {/* Analyse experte */}
              <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
                <h4 className="font-black text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  Analyse experte
                </h4>
                <div 
                  className="text-base font-medium text-gray-800 dark:text-gray-100 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: getScpiAnalysis(scpi) }}
                />
              </div>

              {/* Avantages et points d'attention */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Avantages */}
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                  <h4 className="font-black text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-base">
                    <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                    Avantages
                  </h4>
                  <ul className="space-y-2">
                    {getScpiAdvantages(scpi).slice(0, 3).map((advantage, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100 leading-relaxed">
                          {advantage}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Points d'attention */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-black text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-base">
                    <Target className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    Points d'attention
                  </h4>
                  <ul className="space-y-2">
                    {getScpiPointsAttention(scpi).map((concern, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100 leading-relaxed">
                          {concern}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Présentation compacte */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                <h4 className="font-black text-gray-900 dark:text-white mb-2 flex items-center gap-2 text-base">
                  <Building className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  Présentation de {scpi.name}
                </h4>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100 leading-relaxed">
                  {getScpiPresentation(scpi).substring(0, 200)}...
                </p>
              </div>
            </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-4 p-6 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30 flex-shrink-0">
          <button 
            onClick={() => {
              if (onAddToPortfolio && scpi) {
                onAddToPortfolio(scpi);
                onClose();
              }
            }}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 dark:bg-blue-500 text-white rounded-xl font-black text-base hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            Ajouter au portefeuille
          </button>

          <button 
            onClick={() => {
              if (window.openRdvModal) {
                window.openRdvModal();
              }
            }}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-green-600 dark:bg-green-500 text-white rounded-xl font-black text-base hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            Prendre rendez-vous
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisModal;

