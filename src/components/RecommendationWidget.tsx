import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, Lightbulb, Target, Shield, BarChart3 } from 'lucide-react';
import { ClientProfile } from '../types/riskProfile';
import { Scpi } from '../types/scpi';
import { generatePortfolioRecommendations, RecommendationResult } from '../utils/portfolioRecommendations';
import { formatCurrency } from '../utils/formatters';

interface RecommendationWidgetProps {
  clientProfile: ClientProfile | null;
  availableScpi: Scpi[];
  onApplyRecommendations: (recommendations: any[]) => void;
}

const RecommendationWidget: React.FC<RecommendationWidgetProps> = ({
  clientProfile,
  availableScpi,
  onApplyRecommendations
}) => {
  const [recommendations, setRecommendations] = useState<RecommendationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!clientProfile) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-600">
        <div className="text-center py-8">
          <Target className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Recommandations personnalisées
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Définissez votre profil d'investisseur pour recevoir des recommandations adaptées
          </p>
        </div>
      </div>
    );
  }

  // Génération automatique des recommandations
  useEffect(() => {
    if (clientProfile && availableScpi.length > 0) {
      generateRecommendations();
    }
  }, [clientProfile, availableScpi]);
  const generateRecommendations = async () => {
    setIsLoading(true);
    try {
      // Simuler un délai pour l'effet de chargement
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = generatePortfolioRecommendations(availableScpi, clientProfile);
      setRecommendations(result);
    } catch (error) {
      console.error('Erreur lors de la génération des recommandations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyRecommendations = () => {
    if (recommendations) {
      const portfolioItems = recommendations.recommendations.map(rec => ({
        scpi: rec.scpi,
        investedAmount: Math.round((rec.allocation / 100) * clientProfile.investmentAmount),
        percentage: rec.allocation,
        allocation: rec.allocation,
        reason: rec.reason
      }));
      onApplyRecommendations(portfolioItems);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-600">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            Recommandations IA
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-lg">{clientProfile.riskProfile.icon}</span>
            <span 
              className="text-sm font-medium"
              style={{ color: clientProfile.riskProfile.color }}
            >
              Profil {clientProfile.riskProfile.name}
            </span>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            Analyse de {availableScpi.length} SCPI en cours...
          </p>
        </div>
      )}

      {recommendations && !isLoading && (
        <div className="space-y-6">
          {/* Risk Analysis */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center border border-green-200 dark:border-green-800">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {recommendations.riskAnalysis.averageYield.toFixed(2)}%
              </div>
              <div className="text-xs text-green-700 dark:text-green-300">Rendement moyen</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center border border-blue-200 dark:border-blue-800">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {Math.round(recommendations.riskAnalysis.diversificationScore * 100)}%
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-300">Diversification</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-center border border-purple-200 dark:border-purple-800">
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {Math.round(recommendations.riskAnalysis.suitabilityScore * 100)}%
              </div>
              <div className="text-xs text-purple-700 dark:text-purple-300">Adéquation</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg text-center border border-orange-200 dark:border-orange-800">
              <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {recommendations.recommendations.length}
              </div>
              <div className="text-xs text-orange-700 dark:text-orange-300">SCPI sélectionnées</div>
            </div>
          </div>

          {/* Recommendations List */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Portefeuille recommandé
            </h4>
            <div className="space-y-2">
              {recommendations.recommendations.map((rec, index) => (
                <div
                  key={rec.scpi.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {rec.scpi.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {rec.reason} • {rec.scpi.yield.toFixed(2)}% rendement
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600 dark:text-blue-400">
                      {rec.allocation.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {formatCurrency((rec.allocation / 100) * clientProfile.investmentAmount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warnings */}
          {recommendations.warnings.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <span className="font-semibold text-yellow-800 dark:text-yellow-300">
                  Points d'attention
                </span>
              </div>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                {recommendations.warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {recommendations.suggestions.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-blue-800 dark:text-blue-300">
                  Suggestions d'optimisation
                </span>
              </div>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                {recommendations.suggestions.map((suggestion, index) => (
                  <li key={index}>• {suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Apply Button */}
          <button
            onClick={applyRecommendations}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 dark:bg-green-500 text-white rounded-lg font-semibold hover:bg-green-700 dark:hover:bg-green-600 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform duration-200"
          >
            <Shield className="w-5 h-5" />
            Appliquer ces recommandations
          </button>
        </div>
      )}

      {!recommendations && !isLoading && (
        <div className="text-center py-8">
          <Target className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Recommandations personnalisées
          </h4>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Obtenez un portefeuille optimisé selon votre profil de risque
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Montant: {formatCurrency(clientProfile.investmentAmount)} • 
            Horizon: {clientProfile.investmentHorizon} ans
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationWidget;