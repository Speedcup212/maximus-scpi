import React from 'react';
import { TrendingUp, Shield, Target, AlertTriangle, CheckCircle, Info, Clock, Building, MapPin } from 'lucide-react';
import { Scpi } from '../types/scpi';
import { ClientProfile } from '../types/riskProfile';
import { formatCurrency } from '../utils/formatters';

interface PortfolioItem extends Scpi {
  investedAmount: number;
  percentage: number;
}

interface PortfolioAnalyticsProps {
  portfolio: PortfolioItem[];
  clientProfile: ClientProfile | null;
  totalInvested: number;
}

const PortfolioAnalytics: React.FC<PortfolioAnalyticsProps> = ({
  portfolio,
  clientProfile,
  totalInvested
}) => {
  if (!clientProfile) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-600">
        <div className="text-center py-8">
          <Target className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Analyse de portefeuille
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Définissez votre profil pour voir l'analyse personnalisée
          </p>
        </div>
      </div>
    );
  }

  const { riskProfile } = clientProfile;

  // Si pas de portefeuille, afficher l'analyse du profil
  if (portfolio.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-600">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              Analyse de Votre Profil
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-lg">{riskProfile.icon}</span>
              <span 
                className="text-sm font-medium"
                style={{ color: riskProfile.color }}
              >
                Profil {riskProfile.name}
              </span>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
            Prêt pour recommandations
          </div>
        </div>

        {/* Caractéristiques du profil */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center border border-green-200 dark:border-green-800">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {riskProfile.targetYield.min}-{riskProfile.targetYield.max}%
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">Rendement cible</div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {riskProfile.minDiversification}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">SCPI minimum</div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center border border-purple-200 dark:border-purple-800">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {riskProfile.maxSingleAllocation}%
            </div>
            <div className="text-sm text-purple-700 dark:text-purple-300">Max par SCPI</div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg text-center border border-orange-200 dark:border-orange-800">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {riskProfile.riskLevel}/5
            </div>
            <div className="text-sm text-orange-700 dark:text-orange-300">Niveau de risque</div>
          </div>
        </div>

        {/* Simulation de revenus */}
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="font-semibold text-green-800 dark:text-green-300">
              Simulation avec {formatCurrency(clientProfile.investmentAmount)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-green-600 dark:text-green-400 mb-1">Revenus mensuels estimés</div>
              <div className="text-xl font-bold text-green-800 dark:text-green-200">
                {formatCurrency((clientProfile.investmentAmount * riskProfile.targetYield.min / 100) / 12)}
              </div>
            </div>
            <div>
              <div className="text-sm text-green-600 dark:text-green-400 mb-1">Revenus annuels estimés</div>
              <div className="text-xl font-bold text-green-800 dark:text-green-200">
                {formatCurrency(clientProfile.investmentAmount * riskProfile.targetYield.min / 100)}
              </div>
            </div>
          </div>
        </div>

        {/* Secteurs recommandés */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-3">
            <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-blue-800 dark:text-blue-300">
              Secteurs recommandés pour votre profil
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {riskProfile.preferredSectors.length > 0 ? (
              riskProfile.preferredSectors.map((sector) => (
                <span key={sector} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-sm font-medium rounded-full">
                  {sector === 'bureaux' ? '🏢 Bureaux' :
                   sector === 'commerces' ? '🏬 Commerces' :
                   sector === 'sante' ? '🏥 Santé' :
                   sector === 'logistique' ? '📦 Logistique' :
                   sector === 'residentiel' ? '🏠 Résidentiel' :
                   sector === 'hotellerie' ? '🏨 Hôtellerie' : sector}
                </span>
              ))
            ) : (
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium rounded-full">
                Tous secteurs (profil expert)
              </span>
            )}
          </div>
        </div>

        {/* Zones géographiques */}
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-6 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="font-semibold text-purple-800 dark:text-purple-300">
              Zones géographiques privilégiées
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {riskProfile.preferredGeography.length > 0 ? (
              riskProfile.preferredGeography.map((geo) => (
                <span key={geo} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 text-sm font-medium rounded-full">
                  {geo === 'france' ? '🇫🇷 France' :
                   geo === 'europe' ? '🇪🇺 Europe' :
                   geo === 'international' ? '🌍 International' : geo}
                </span>
              ))
            ) : (
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium rounded-full">
                Toutes zones (profil expert)
              </span>
            )}
          </div>
        </div>

        {/* Caractéristiques détaillées */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-300">
                Horizon
              </span>
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-200">
              {riskProfile.characteristics.horizon}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-300">
                Objectif
              </span>
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-200">
              {riskProfile.characteristics.objective}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-300">
                Tolérance
              </span>
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-200">
              {riskProfile.characteristics.tolerance}
            </div>
          </div>
        </div>

        {/* Message d'encouragement */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-600">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              🎯 Profil configuré avec succès !
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Votre profil {riskProfile.name} est maintenant configuré. 
              Utilisez le bouton "Appliquer ces recommandations" pour obtenir votre sélection optimisée.
            </p>
          </div>
        </div>

        return;
      </div>
    );
  }

  // Calculs d'analyse pour portefeuille existant
  const averageYield = portfolio.reduce((sum, item) => 
    sum + (item.yield * item.percentage / 100), 0
  );

  // Calcul des secteurs et géographies uniques à partir des données pondérées
  const sectorSet = new Set<string>();
  portfolio.forEach(item => {
    if (item.repartitionSector && item.repartitionSector.length > 0) {
      item.repartitionSector.forEach(sector => {
        if (sector.value > 0) sectorSet.add(sector.name);
      });
    } else {
      sectorSet.add(item.sector);
    }
  });
  const sectors = Array.from(sectorSet);

  const geoSet = new Set<string>();
  portfolio.forEach(item => {
    if (item.repartitionGeo && item.repartitionGeo.length > 0) {
      item.repartitionGeo.forEach(geo => {
        if (geo.value > 0) geoSet.add(geo.name);
      });
    } else {
      geoSet.add(item.geography);
    }
  });
  const geographies = Array.from(geoSet);
  
  const isrCount = portfolio.filter(item => item.isr).length;
  const europeanCount = portfolio.filter(item => item.european).length;
  const noFeesCount = portfolio.filter(item => item.fees === 0).length;

  const maxAllocation = Math.max(...portfolio.map(item => item.percentage));
  const minAllocation = Math.min(...portfolio.map(item => item.percentage));

  // Analyse de conformité au profil
  const isYieldInRange = averageYield >= riskProfile.targetYield.min && 
                        averageYield <= riskProfile.targetYield.max;
  const isDiversified = portfolio.length >= riskProfile.minDiversification;
  const isAllocationRespected = maxAllocation <= riskProfile.maxSingleAllocation;

  const conformityScore = [isYieldInRange, isDiversified, isAllocationRespected]
    .filter(Boolean).length / 3;

  // Revenus estimés
  const annualIncome = (totalInvested * averageYield) / 100;
  const monthlyIncome = annualIncome / 12;

  const getConformityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 dark:text-green-400';
    if (score >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getConformityBg = (score: number) => {
    if (score >= 0.8) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    if (score >= 0.6) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-600">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            Analyse de Portefeuille
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-lg">{riskProfile.icon}</span>
            <span 
              className="text-sm font-medium"
              style={{ color: riskProfile.color }}
            >
              Profil {riskProfile.name}
            </span>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getConformityColor(conformityScore)}`}>
          {Math.round(conformityScore * 100)}% conforme
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
          <div className={`text-2xl font-bold ${getConformityColor(isYieldInRange ? 1 : 0.5)}`}>
            {averageYield.toFixed(2)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Rendement moyen</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Cible: {riskProfile.targetYield.min}-{riskProfile.targetYield.max}%
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {portfolio.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">SCPI</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Min: {riskProfile.minDiversification}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
          <div className={`text-2xl font-bold ${getConformityColor(isAllocationRespected ? 1 : 0.5)}`}>
            {maxAllocation.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Max allocation</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Limite: {riskProfile.maxSingleAllocation}%
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {sectors.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Secteurs</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {geographies.length} zones géo
          </div>
        </div>
      </div>

      {/* Revenus estimés */}
      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-6 border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span className="font-semibold text-green-800 dark:text-green-300">
            Revenus estimés
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-green-600 dark:text-green-400 mb-1">Par mois</div>
            <div className="text-xl font-bold text-green-800 dark:text-green-200">
              {formatCurrency(monthlyIncome)}
            </div>
          </div>
          <div>
            <div className="text-sm text-green-600 dark:text-green-400 mb-1">Par an</div>
            <div className="text-xl font-bold text-green-800 dark:text-green-200">
              {formatCurrency(annualIncome)}
            </div>
          </div>
        </div>
      </div>

      {/* Analyse de conformité */}
      <div className={`p-4 rounded-lg border mb-6 ${getConformityBg(conformityScore)}`}>
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5" />
          <span className="font-semibold">Conformité au profil</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Rendement dans la fourchette</span>
            {isYieldInRange ? (
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Diversification suffisante</span>
            {isDiversified ? (
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Allocation respectée</span>
            {isAllocationRespected ? (
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            )}
          </div>
        </div>
      </div>

      {/* Caractéristiques du portefeuille */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">
              Labels
            </span>
          </div>
          <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <div>ISR: {isrCount}/{portfolio.length}</div>
            <div>Européennes: {europeanCount}/{portfolio.length}</div>
            <div>Sans frais: {noFeesCount}/{portfolio.length}</div>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-semibold text-purple-800 dark:text-purple-300">
              Répartition
            </span>
          </div>
          <div className="text-xs text-purple-700 dark:text-purple-300 space-y-1">
            <div>Max: {maxAllocation.toFixed(1)}%</div>
            <div>Min: {minAllocation.toFixed(1)}%</div>
            <div>Écart: {(maxAllocation - minAllocation).toFixed(1)}%</div>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-semibold text-orange-800 dark:text-orange-300">
              Diversification
            </span>
          </div>
          <div className="text-xs text-orange-700 dark:text-orange-300 space-y-1">
            <div>Secteurs: {sectors.length}</div>
            <div>Géographies: {geographies.length}</div>
            <div>Score: {Math.round((sectors.length + geographies.length) / 8 * 100)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioAnalytics;