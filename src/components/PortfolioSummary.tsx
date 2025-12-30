import React, { useState } from 'react';
import { TrendingUp, PieChart, Target, Calendar, DollarSign, Award, Download, MapPin, Building } from 'lucide-react';
import { Scpi } from '../types/scpi';
import { ClientProfile } from '../types/riskProfile';
import { formatCurrency } from '../utils/formatters';
import ChartWidget from './ChartWidget';

interface PortfolioItem extends Scpi {
  investedAmount: number;
  percentage: number;
}

interface PortfolioSummaryProps {
  portfolio: PortfolioItem[];
  clientProfile: ClientProfile | null;
  totalInvested: number;
  onExportPDF?: () => void;
  onScheduleCall: () => void;
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({
  portfolio,
  clientProfile,
  totalInvested,
  onExportPDF,
  onScheduleCall
}) => {
  // Widget diversification avec onglets interactifs - v2.0 - Updated: 2025-10-17
  const [diversificationTab, setDiversificationTab] = useState<'sector' | 'geo'>('sector');

  if (portfolio.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-600">
        <div className="text-center py-8">
          <PieChart className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Résumé de portefeuille
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Ajoutez des SCPI pour voir le résumé
          </p>
        </div>
      </div>
    );
  }

  // Calculs
  const averageYield = portfolio.reduce((sum, item) => 
    sum + (item.yield * item.percentage / 100), 0
  );
  
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

  // Score de qualité global
  const qualityScore = portfolio.reduce((sum, item) => {
    let score = 0.5;
    if (item.tof >= 95) score += 0.2;
    if (item.isr) score += 0.1;
    if (item.fees === 0) score += 0.1;
    if (item.capitalization >= 500000000) score += 0.1;
    return sum + (score * item.percentage / 100);
  }, 0);

  // Préparer les données pour les camemberts
  
  // Répartition sectorielle agrégée (pondérée par la vraie répartition de chaque SCPI)
  const sectorDistribution: Record<string, number> = {};
  portfolio.forEach(item => {
    if (item.repartitionSector && item.repartitionSector.length > 0) {
      // Utiliser la vraie répartition sectorielle pondérée
      item.repartitionSector.forEach(sector => {
        const sectorName = sector.name;
        if (!sectorDistribution[sectorName]) {
          sectorDistribution[sectorName] = 0;
        }
        // Pondérer par le pourcentage de cette SCPI dans le portefeuille
        sectorDistribution[sectorName] += (sector.value * item.percentage) / 100;
      });
    } else {
      // Fallback : utiliser le secteur principal si pas de répartition détaillée
      const sectorName = getSectorDisplayName(item.sector);
      if (!sectorDistribution[sectorName]) {
        sectorDistribution[sectorName] = 0;
      }
      sectorDistribution[sectorName] += item.percentage;
    }
  });

  const sectorChartData = Object.entries(sectorDistribution)
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

  // Répartition géographique agrégée (pondérée par la vraie répartition de chaque SCPI)
  const geoDistribution: Record<string, number> = {};
  portfolio.forEach(item => {
    if (item.repartitionGeo && item.repartitionGeo.length > 0) {
      // Utiliser la vraie répartition géographique pondérée
      item.repartitionGeo.forEach(geo => {
        const geoName = geo.name;
        if (!geoDistribution[geoName]) {
          geoDistribution[geoName] = 0;
        }
        // Pondérer par le pourcentage de cette SCPI dans le portefeuille
        geoDistribution[geoName] += (geo.value * item.percentage) / 100;
      });
    } else {
      // Fallback : utiliser la géographie principale si pas de répartition détaillée
      const geoName = getGeographyDisplayName(item.geography);
      if (!geoDistribution[geoName]) {
        geoDistribution[geoName] = 0;
      }
      geoDistribution[geoName] += item.percentage;
    }
  });

  const geoChartData = Object.entries(geoDistribution)
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

  // Fonctions utilitaires pour les noms d'affichage
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

  return (
    <div className="space-y-6">
      {/* Header avec métriques principales */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Résumé du Portefeuille
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-200">
              {portfolio.length} SCPI • {formatCurrency(totalInvested)} investis
            </div>
          </div>
          <div className="flex items-center gap-2">
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
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl text-center border border-green-200 dark:border-green-800">
            <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {averageYield.toFixed(2)}%
            </div>
            <div className="text-sm text-green-700 dark:text-green-200">Rendement moyen</div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-center border border-blue-200 dark:border-blue-800">
            <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(monthlyIncome)}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-200">Revenus/mois</div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800" data-widget="diversification-v2">
            <div className="flex items-center justify-center gap-1 mb-3">
              <button
                type="button"
                onClick={() => setDiversificationTab('sector')}
                className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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
                className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {sectorChartData.length}
                  </div>
                  <div className="text-sm text-purple-700 dark:text-purple-200">Secteurs distincts</div>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {geoChartData.length}
                  </div>
                  <div className="text-sm text-purple-700 dark:text-purple-200">Zones géographiques</div>
                </>
              )}
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl text-center border border-orange-200 dark:border-orange-800">
            <Award className="w-6 h-6 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {Math.round(qualityScore * 100)}%
            </div>
            <div className="text-sm text-orange-700 dark:text-orange-200">Score qualité</div>
          </div>
        </div>

        {/* Actions principales */}
        <div className="flex gap-3">
          <button
            onClick={async () => {
              if (onExportPDF) {
                onExportPDF();
              } else {
                try {
                  const { generatePortfolioPDF } = await import('../utils/pdfGenerator');
                  await generatePortfolioPDF(portfolio, clientProfile, totalInvested);
                  alert('📄 Rapport PDF généré avec succès !');
                } catch (error) {
                  console.error('Erreur lors de la génération du PDF:', error);
                  alert('❌ Erreur lors de la génération du PDF. Veuillez réessayer.');
                }
              }
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform"
          >
            <Download className="w-5 h-5" />
            Exporter PDF
          </button>
          
          <button
            onClick={onScheduleCall}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 dark:bg-green-500 text-white rounded-xl font-semibold hover:bg-green-700 dark:hover:bg-green-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform"
          >
            <Calendar className="w-5 h-5" />
            RDV Expert
          </button>
        </div>
      </div>

      {/* Camemberts de répartition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Répartition sectorielle */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Répartition Sectorielle
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-200">
                Diversification par type d'actifs
              </p>
            </div>
          </div>
          
          {sectorChartData.length > 0 ? (
            <>
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <svg width="280" height="280" viewBox="0 0 280 280" className="transform rotate-0">
                    <defs>
                      {sectorChartData.map((item, index) => (
                        <linearGradient key={index} id={`sectorGradient${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor={item.color} stopOpacity="0.8" />
                          <stop offset="100%" stopColor={item.color} stopOpacity="1" />
                        </linearGradient>
                      ))}
                    </defs>
                    {(() => {
                      const centerX = 140;
                      const centerY = 140;
                      const outerRadius = 100;
                      const innerRadius = 40;
                      let currentAngle = 0;
                      const total = sectorChartData.reduce((sum, item) => sum + item.value, 0);
                      
                      return sectorChartData.map((item, index) => {
                        const sliceAngle = (item.value / total) * 2 * Math.PI;
                        const startAngle = currentAngle;
                        const endAngle = currentAngle + sliceAngle;
                        
                        const x1 = centerX + Math.cos(startAngle) * outerRadius;
                        const y1 = centerY + Math.sin(startAngle) * outerRadius;
                        const x2 = centerX + Math.cos(endAngle) * outerRadius;
                        const y2 = centerY + Math.sin(endAngle) * outerRadius;
                        
                        const x3 = centerX + Math.cos(endAngle) * innerRadius;
                        const y3 = centerY + Math.sin(endAngle) * innerRadius;
                        const x4 = centerX + Math.cos(startAngle) * innerRadius;
                        const y4 = centerY + Math.sin(startAngle) * innerRadius;
                        
                        const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;
                        
                        const pathData = [
                          `M ${x1} ${y1}`,
                          `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                          `L ${x3} ${y3}`,
                          `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
                          'Z'
                        ].join(' ');
                        
                        currentAngle += sliceAngle;
                        
                        return (
                          <path
                            key={index}
                            d={pathData}
                            fill={`url(#sectorGradient${index})`}
                            stroke="rgba(255,255,255,0.8)"
                            strokeWidth="2"
                            className="hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                          />
                        );
                      });
                    })()}
                    
                    {/* Texte central */}
                    <text x="140" y="135" textAnchor="middle" className="fill-gray-900 dark:fill-white font-bold text-lg">
                      {sectorChartData.length}
                    </text>
                    <text x="140" y="150" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300 text-sm">
                      secteurs
                    </text>
                  </svg>
                </div>
              </div>
              
              <div className="space-y-3">
                {sectorChartData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-200"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-100 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
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
            <div className="text-center py-8">
              <Building className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">Aucune donnée sectorielle</p>
            </div>
          )}
        </div>

        {/* Répartition géographique */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Répartition Géographique
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-200">
                Exposition par zones géographiques
              </p>
            </div>
          </div>
          
          {geoChartData.length > 0 ? (
            <>
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <svg width="280" height="280" viewBox="0 0 280 280" className="transform rotate-0">
                    <defs>
                      {geoChartData.map((item, index) => (
                        <linearGradient key={index} id={`geoGradient${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor={item.color} stopOpacity="0.8" />
                          <stop offset="100%" stopColor={item.color} stopOpacity="1" />
                        </linearGradient>
                      ))}
                    </defs>
                    {(() => {
                      const centerX = 140;
                      const centerY = 140;
                      const outerRadius = 100;
                      const innerRadius = 40;
                      let currentAngle = 0;
                      const total = geoChartData.reduce((sum, item) => sum + item.value, 0);
                      
                      return geoChartData.map((item, index) => {
                        const sliceAngle = (item.value / total) * 2 * Math.PI;
                        const startAngle = currentAngle;
                        const endAngle = currentAngle + sliceAngle;
                        
                        const x1 = centerX + Math.cos(startAngle) * outerRadius;
                        const y1 = centerY + Math.sin(startAngle) * outerRadius;
                        const x2 = centerX + Math.cos(endAngle) * outerRadius;
                        const y2 = centerY + Math.sin(endAngle) * outerRadius;
                        
                        const x3 = centerX + Math.cos(endAngle) * innerRadius;
                        const y3 = centerY + Math.sin(endAngle) * innerRadius;
                        const x4 = centerX + Math.cos(startAngle) * innerRadius;
                        const y4 = centerY + Math.sin(startAngle) * innerRadius;
                        
                        const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;
                        
                        const pathData = [
                          `M ${x1} ${y1}`,
                          `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                          `L ${x3} ${y3}`,
                          `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
                          'Z'
                        ].join(' ');
                        
                        currentAngle += sliceAngle;
                        
                        return (
                          <path
                            key={index}
                            d={pathData}
                            fill={`url(#geoGradient${index})`}
                            stroke="rgba(255,255,255,0.8)"
                            strokeWidth="2"
                            className="hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                          />
                        );
                      });
                    })()}
                    
                    {/* Texte central */}
                    <text x="140" y="135" textAnchor="middle" className="fill-gray-900 dark:fill-white font-bold text-lg">
                      {geoChartData.length}
                    </text>
                    <text x="140" y="150" textAnchor="middle" className="fill-gray-600 dark:fill-gray-300 text-sm">
                      zones
                    </text>
                  </svg>
                </div>
              </div>
              
              <div className="space-y-3">
                {geoChartData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-200"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-100 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
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
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">Aucune donnée géographique</p>
            </div>
          )}
        </div>
      </div>

      {/* Détails du portefeuille */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Composition détaillée */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-600">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Composition détaillée
          </h4>
          <div className="space-y-3">
            {portfolio.map((item, index) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    {item.name}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-200">
                    {item.yield.toFixed(2)}% • {item.company}
                  </div>
                  <div className="flex gap-1 mt-1">
                    {item.isr && (
                      <span className="inline-block px-2 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 text-xs font-semibold rounded">
                        ISR
                      </span>
                    )}
                    {item.fees === 0 && (
                      <span className="inline-block px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-xs font-semibold rounded">
                        0% frais
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                    {item.percentage.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-200">
                    {formatCurrency(item.investedAmount)}
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                    +{formatCurrency((item.investedAmount * item.yield) / 100)}/an
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Caractéristiques et performance */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-600">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Caractéristiques
          </h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
              <span className="text-sm text-gray-600 dark:text-gray-200">Diversification</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {sectorChartData.length} secteurs, {geoChartData.length} zones
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
              <span className="text-sm text-gray-600 dark:text-gray-200">Label ISR</span>
              <div className="text-right">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {isrPercentage.toFixed(0)}% du portefeuille
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">
                  {isrCount}/{portfolio.length} SCPI
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
              <span className="text-sm text-gray-600 dark:text-gray-200">Âge moyen</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {Math.round(averageAge)} ans
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <span className="text-sm text-green-600 dark:text-green-300">Revenus annuels</span>
              <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                {formatCurrency(annualIncome)}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <span className="text-sm text-blue-600 dark:text-blue-300">Score qualité global</span>
              <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                {Math.round(qualityScore * 100)}/100
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Simulation de performance */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          Projection de performance
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 5, 10].map((years) => {
            const projectedValue = totalInvested * Math.pow(1 + averageYield / 100, years);
            const totalReturns = projectedValue - totalInvested;
            
            return (
              <div key={years} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 rounded-xl border border-green-200 dark:border-green-700">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600 dark:text-green-400 mb-1">
                    Dans {years} an{years > 1 ? 's' : ''}
                  </div>
                  <div className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                    {formatCurrency(projectedValue)}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400 font-semibold">
                    +{formatCurrency(totalReturns)} de gains
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                    Soit +{(((projectedValue / totalInvested) - 1) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PortfolioSummary;