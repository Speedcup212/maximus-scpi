import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Building, MapPin, Calendar, DollarSign,
  BarChart3, PieChart as PieChartIcon, Activity, Award,
  Shield, Target, Calculator, FileText, ArrowLeft
} from 'lucide-react';
import { Scpi } from '../types/scpi';
import { formatCurrency, formatPercentage, getPerformanceColor, getDiscountColor } from '../utils/formatters';
import { getScpiPresentation, getScpiAnalysis, getScpiNews, getScpiAdvantages, getScpiPointsAttention } from '../utils/scpiAnalysis';
import { getLatestScpiScores } from '../utils/scpiScoringService';
import { getYieldDisplayInfo } from '../utils/yieldDisplay';
import { generateOptimizedScpiSEO, generateFAQSchema, generateFinancialProductSchema, generateBreadcrumbSchema } from '../utils/seoOptimizer';
import PieChart from './PieChart';
import SEOHead from './SEOHead';

interface ScpiDetailPageProps {
  scpi: Scpi;
  onAddToPortfolio?: (scpi: Scpi) => void;
  onTakeAppointment?: () => void;
}

const ScpiDetailPage: React.FC<ScpiDetailPageProps> = ({
  scpi,
  onAddToPortfolio,
  onTakeAppointment
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'analysis'>('overview');
  const [scpiScores, setScpiScores] = useState<Record<number, any>>({});
  const [scoresLoaded, setScoresLoaded] = useState(false);
  const searchParams = new URLSearchParams(window.location.search);
  const isParcoursMode = searchParams.get('lock') === 'true' && searchParams.get('source') === 'parcours';

  const optimizedSEO = generateOptimizedScpiSEO(scpi);

  const shouldLoadScores = import.meta.env.VITE_ENABLE_SCPI_SCORES === 'true';

  useEffect(() => {
    if (!shouldLoadScores) {
      setScoresLoaded(true);
      return;
    }
    const loadScores = async () => {
      const result = await getLatestScpiScores();
      if (result.success) {
        setScpiScores(result.scores);
      }
      setScoresLoaded(true);
    };
    loadScores();
  }, [shouldLoadScores]);

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

  // Score de qualité global depuis la base de données
  const qualityScore = (() => {
    const dbScore = scpiScores[scpi.id]?.score_total;
    if (dbScore !== undefined) {
      return Math.round(dbScore);
    }

    // Fallback si pas encore chargé
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

  const faqQuestions = [
    {
      question: `Qu'est-ce que la SCPI ${scpi.name} ?`,
      answer: `La SCPI ${scpi.name} est gérée par ${scpi.company} et investit dans le secteur ${scpi.sector}. Elle offre un rendement de ${scpi.yield.toFixed(2)}% avec un taux d'occupation financier de ${scpi.tof}%.`
    },
    {
      question: `Quel est le taux de distribution de la SCPI ${scpi.name} ?`,
      answer: `Le taux de distribution 2024 de la SCPI ${scpi.name} est de ${scpi.yield.toFixed(2)}%. Ce taux de distribution est calculé sur la base des dividendes distribués sur l'année.`
    },
    {
      question: `Quel est le prix d'une part de ${scpi.name} ?`,
      answer: `Le prix de souscription d'une part de la SCPI ${scpi.name} est de ${scpi.price}€. Les frais de souscription sont de ${scpi.fees}% TTC.`
    },
    {
      question: `Quelle est la capitalisation de la SCPI ${scpi.name} ?`,
      answer: `La SCPI ${scpi.name} affiche une capitalisation de ${formatCurrency(scpi.capitalization)}, ce qui témoigne de sa taille et de sa solidité sur le marché.`
    },
    {
      question: `La SCPI ${scpi.name} est-elle labellisée ISR ?`,
      answer: scpi.isr
        ? `Oui, la SCPI ${scpi.name} bénéficie du label ISR (Investissement Socialement Responsable), garantissant une gestion durable et responsable du patrimoine immobilier.`
        : `Non, la SCPI ${scpi.name} ne dispose pas actuellement du label ISR, mais respecte les normes en vigueur en matière de gestion immobilière.`
    }
  ];

  const faqSchema = generateFAQSchema(faqQuestions);

  const rating = qualityScore / 10;
  const financialProductSchema = generateFinancialProductSchema(scpi, rating);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Accueil', url: 'https://www.maximusscpi.com' },
    { name: 'Comparateur SCPI', url: 'https://www.maximusscpi.com' },
    { name: `SCPI ${scpi.name}`, url: `https://www.maximusscpi.com/scpi/${scpi.name.toLowerCase().replace(/\s+/g, '-')}` }
  ]);

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [faqSchema, financialProductSchema, breadcrumbSchema]
  };

  const tabs = [
    { key: 'overview', label: 'Vue d\'ensemble', icon: <BarChart3 className="w-4 h-4" /> },
    { key: 'charts', label: 'Répartitions', icon: <PieChartIcon className="w-4 h-4" /> },
    { key: 'analysis', label: 'Analyse détaillée', icon: <Activity className="w-4 h-4" /> }
  ];

  const handleTabChange = (tabKey: 'overview' | 'charts' | 'analysis') => {
    setActiveTab(tabKey);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReturnToAllocation = () => {
    const returnPath = sessionStorage.getItem('parcours_return_path') || '/parcours-guide';
    sessionStorage.setItem('parcours_restore_scroll', '1');
    window.history.pushState({}, '', returnPath);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <SEOHead
        title={optimizedSEO.title}
        description={optimizedSEO.description}
        keywords={[
          `scpi ${scpi.name.toLowerCase()}`,
          `${scpi.company.toLowerCase()} scpi`,
          `scpi ${scpi.sector}`,
          `scpi rendement ${scpi.yield.toFixed(1)}%`,
          scpi.european ? 'scpi européenne' : 'scpi france',
          `investir scpi ${scpi.name.toLowerCase()}`
        ]}
        canonical={`https://www.maximusscpi.com/scpi/${scpi.name.toLowerCase().replace(/\s+/g, '-')}`}
        schemaData={combinedSchema}
      />

      {isParcoursMode && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-emerald-100">
          <p className="text-sm font-semibold">
            SCPI consultée dans le cadre de votre allocation guidée
          </p>
          <p className="text-xs mt-1 text-emerald-100/90">
            Cette fiche est fournie à titre informatif et illustre une logique d’allocation.
            Elle ne constitue pas une recommandation personnalisée.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-2xl border border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100">
            {optimizedSEO.h1}
          </h1>
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

      {/* Navigation Tabs */}
      <div className="flex border-b-2 border-gray-300 dark:border-gray-600 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700/50 rounded-xl overflow-x-auto overflow-y-hidden px-1 sm:px-2 py-1 sm:py-2 gap-1 scrollbar-hide">
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
            <span className={`${activeTab === tab.key ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'}`}>
              {tab.icon}
            </span>
            <span className={`text-xs sm:text-sm md:text-base ${activeTab === tab.key ? 'font-extrabold' : 'font-semibold'}`}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Métriques principales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(() => {
                const yieldInfo = getYieldDisplayInfo(scpi);
                return (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl text-center border border-green-200 dark:border-green-800">
                    <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-black text-green-600 dark:text-green-400 mb-1">
                      {yieldInfo.primaryValue.toFixed(2)}%
                    </div>
                    <div className="text-sm font-bold text-green-700 dark:text-green-300 mb-1">
                      {yieldInfo.primaryLabel}
                    </div>
                    {yieldInfo.secondaryValue && (
                      <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                        {yieldInfo.secondaryLabel}: {yieldInfo.secondaryValue.toFixed(2)}%
                      </div>
                    )}
                    {yieldInfo.netNotAvailable && (
                      <div className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
                        ⚠️ Taux net non communiqué
                      </div>
                    )}
                    <div className="text-[10px] text-green-600/70 dark:text-green-400/70 mt-2 leading-tight">
                      {yieldInfo.legalNotice}
                    </div>
                  </div>
                );
              })()}

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

              {!isParcoursMode && (
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl text-center border border-orange-200 dark:border-orange-800">
                  <Award className="w-6 h-6 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                  <div className={`text-2xl font-black mb-1 ${getQualityColor(qualityScore)}`}>
                    {qualityScore}/100
                  </div>
                  <div className="text-sm font-bold text-orange-700 dark:text-orange-300">
                    Score
                  </div>
                </div>
              )}
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

        {activeTab === 'charts' && (
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

        {activeTab === 'analysis' && (
          <div className="space-y-6">
            {/* Actualités Trimestrielles - EN PREMIER */}
            {getScpiNews(scpi) && (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 p-6 rounded-xl border-2 border-blue-300 dark:border-blue-600 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500/20 dark:bg-blue-500/30 rounded-lg border border-blue-400/50">
                    <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-gray-900 dark:text-white text-xl mb-1">Actualité Trimestrielle</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                      {scpi.periodeBulletinTrimestriel === 'T3 2025'
                        ? "Mise à jour BULLETIN TRIMESTRIEL D'INFORMATION T3 2025"
                        : scpi.dateBulletin 
                          ? `Bulletin ${scpi.periodeBulletinTrimestriel || ''} - ${scpi.dateBulletin}`.trim()
                          : scpi.periodeBulletinTrimestriel 
                            ? `Bulletin ${scpi.periodeBulletinTrimestriel}` 
                            : 'Données officielles du bulletin'}
                    </p>
                  </div>
                  {scpi.periodeBulletinTrimestriel && (
                    <div className="px-3 py-1.5 bg-blue-600 dark:bg-blue-500 text-white rounded-full border-2 border-blue-400 dark:border-blue-300 shadow-md">
                      <span className="text-xs font-bold">
                        {scpi.dateBulletin ? `${scpi.periodeBulletinTrimestriel} - ${scpi.dateBulletin}` : scpi.periodeBulletinTrimestriel}
                      </span>
                    </div>
                  )}
                </div>
                <div
                  className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed bg-white/60 dark:bg-gray-800/60 rounded-lg p-5 border border-blue-200 dark:border-blue-700"
                  dangerouslySetInnerHTML={{ __html: getScpiNews(scpi) }}
                />
              </div>
            )}

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

      <div className="mt-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 px-4 py-3">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Selon votre profil investisseur, certains éléments comme la durée, la diversification ou la régularité peuvent être plus ou moins confortables à vivre.
        </p>
      </div>

      {/* Actions */}
      {!isParcoursMode && (
        <div className="flex gap-4">
          {onAddToPortfolio && (
            <button
              onClick={() => onAddToPortfolio(scpi)}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 dark:bg-blue-500 text-white rounded-xl font-black text-base hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              Ajouter au portefeuille
            </button>
          )}

          {onTakeAppointment && (
            <button
              onClick={onTakeAppointment}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-green-600 dark:bg-green-500 text-white rounded-xl font-black text-base hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Prendre rendez-vous
            </button>
          )}
        </div>
      )}

      {isParcoursMode && (
        <div className="pt-2">
          <button
            onClick={handleReturnToAllocation}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-slate-800 text-white rounded-xl font-bold text-base hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Revenir à mon allocation
          </button>
        </div>
      )}
    </div>
  );
};

export default ScpiDetailPage;
