import React from 'react';
import { Info, TrendingUp, Shield, Calculator, Users, Building2, CreditCard, Landmark } from 'lucide-react';

type PurchaseMethod = 'pleine-propriete' | 'nue-propriete' | 'usufruit' | 'credit';

interface PurchaseMethodSelectorProps {
  selectedMethod: PurchaseMethod;
  onMethodChange: (method: PurchaseMethod) => void;
  tmi: number;
  investmentAmount: number;
  className?: string;
}

const PURCHASE_METHODS_CARDS = [
  {
    id: 'pleine-propriete' as PurchaseMethod,
    name: 'Achat en Pleine Propriété',
    icon: '🏠',
    iconComponent: <Building2 className="w-6 h-6 text-white" />,
    color: 'from-blue-500 to-blue-600',
    forWho: 'Investisseurs recherchant des revenus immédiats',
    advantage: 'Simplicité, revenus réguliers',
    fiscality: 'Revenus fonciers imposés (TMI + prélèvements sociaux)',
    minInvestment: 1000,
    targetTmi: [0, 11, 30],
    yieldMultiplier: 1.0,
    taxOptimization: 0
  },
  {
    id: 'nue-propriete' as PurchaseMethod,
    name: 'Achat en Nue-Propriété',
    icon: '🎯',
    iconComponent: <TrendingUp className="w-6 h-6 text-white" />,
    color: 'from-green-500 to-green-600',
    forWho: 'Investisseurs souhaitant préparer l\'avenir sans revenus immédiats',
    advantage: 'Optimisation fiscale grâce à une décote, absence d\'imposition pendant le démembrement',
    fiscality: 'Aucune imposition pendant la durée du démembrement',
    minInvestment: 10000,
    targetTmi: [30, 41, 45],
    yieldMultiplier: 0.0,
    taxOptimization: 40
  },
  {
    id: 'usufruit' as PurchaseMethod,
    name: 'Achat en Usufruit',
    icon: '💰',
    iconComponent: <Users className="w-6 h-6 text-white" />,
    color: 'from-purple-500 to-purple-600',
    forWho: 'Personnes morales disposant de trésorerie excédentaire et recherchant des revenus immédiats. Plus rarement des particuliers, car la fiscalité à l\'IR est pénalisante.',
    advantage: 'Rendements majorés et flux de trésorerie élevés sur une période déterminée (5 à 15 ans). Pour une société, possibilité de lisser le résultat ou de bénéficier d\'un cadre fiscal plus favorable.',
    fiscality: 'Personnes physiques (IR) : Revenus majorés mais lourdement imposés (TMI + 17,2% PS). Personnes morales (IS) : Revenus intégrés dans le résultat, souvent plus intéressant.',
    minInvestment: 5000,
    targetTmi: [0, 11],
    yieldMultiplier: 1.8,
    taxOptimization: 0
  },
  {
    id: 'credit' as PurchaseMethod,
    name: 'Achat à Crédit',
    icon: '🏦',
    iconComponent: <CreditCard className="w-6 h-6 text-white" />,
    color: 'from-orange-500 to-orange-600',
    forWho: 'Investisseurs souhaitant utiliser l\'effet de levier bancaire',
    advantage: 'Déduction des intérêts d\'emprunt, optimisation de la rentabilité nette',
    fiscality: 'Revenus fonciers imposés, intérêts d\'emprunt déductibles',
    minInvestment: 20000,
    targetTmi: [30, 41, 45],
    yieldMultiplier: 2.5,
    taxOptimization: 25
  }
];

const PurchaseMethodSelector: React.FC<PurchaseMethodSelectorProps> = ({
  selectedMethod,
  onMethodChange,
  tmi,
  investmentAmount,
  className = ''
}) => {
  const getMethodSuitability = (method: typeof PURCHASE_METHODS_CARDS[0]): 'optimal' | 'suitable' | 'not-recommended' => {
    if (method.targetTmi.includes(tmi) && investmentAmount >= method.minInvestment) {
      return 'optimal';
    } else if (investmentAmount >= method.minInvestment) {
      return 'suitable';
    } else {
      return 'not-recommended';
    }
  };

  const getSuitabilityColor = (suitability: string) => {
    switch (suitability) {
      case 'optimal': return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      case 'suitable': return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
      default: return 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30';
    }
  };

  const getSuitabilityBadge = (suitability: string) => {
    switch (suitability) {
      case 'optimal': return { text: '✅ Optimal pour votre TMI', color: 'text-green-600 dark:text-green-400' };
      case 'suitable': return { text: '👍 Adapté', color: 'text-blue-600 dark:text-blue-400' };
      default: return { text: '⚠️ Non recommandé', color: 'text-orange-600 dark:text-orange-400' };
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
          <Calculator className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Choisissez votre mode d'acquisition
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Sélectionnez la stratégie d'investissement adaptée à votre situation fiscale (TMI: {tmi}%)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PURCHASE_METHODS_CARDS.map((method) => {
          const suitability = getMethodSuitability(method);
          const badge = getSuitabilityBadge(suitability);
          const isSelected = selectedMethod === method.id;
          
          return (
            <div
              key={method.id}
              onClick={() => onMethodChange(method.id)}
              className={`relative cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                isSelected 
                  ? `border-purple-500 bg-gradient-to-br ${method.color} text-white shadow-xl transform scale-105` 
                  : `${getSuitabilityColor(suitability)} hover:border-purple-300 dark:hover:border-purple-500`
              }`}
            >
              {/* Badge de recommandation */}
              <div className="absolute top-3 right-3">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  isSelected 
                    ? 'bg-white/20 text-white' 
                    : `${badge.color} bg-white dark:bg-gray-800`
                }`}>
                  {badge.text}
                </span>
              </div>

              {/* Header avec icône */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  isSelected 
                    ? 'bg-white/20 backdrop-blur-sm' 
                    : `bg-gradient-to-br ${method.color}`
                }`}>
                  {isSelected ? (
                    <span className="text-2xl">{method.icon}</span>
                  ) : (
                    method.iconComponent
                  )}
                </div>
                <div>
                  <h4 className={`text-lg font-bold ${
                    isSelected ? 'text-white' : 'text-gray-900 dark:text-white'
                  }`}>
                    {method.name}
                  </h4>
                </div>
              </div>

              {/* Triptyque structuré */}
              <div className="space-y-4">
                {/* Pour qui ? */}
                <div className={`p-4 rounded-xl border ${
                  isSelected 
                    ? 'bg-white/10 border-white/20' 
                    : 'bg-white/60 dark:bg-gray-800/60 border-gray-200 dark:border-gray-600'
                }`}>
                  <div className={`flex items-start gap-2 mb-2 ${
                    isSelected ? 'text-white' : 'text-gray-900 dark:text-white'
                  }`}>
                    <Users className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div className="font-semibold text-sm">Pour qui ?</div>
                  </div>
                  <div className={`text-sm leading-relaxed ${
                    isSelected ? 'text-white/90' : 'text-gray-600 dark:text-gray-300'
                  }`}>
                    {method.forWho}
                  </div>
                </div>

                {/* Avantage */}
                <div className={`p-4 rounded-xl border ${
                  isSelected 
                    ? 'bg-white/10 border-white/20' 
                    : 'bg-white/60 dark:bg-gray-800/60 border-gray-200 dark:border-gray-600'
                }`}>
                  <div className={`flex items-start gap-2 mb-2 ${
                    isSelected ? 'text-white' : 'text-gray-900 dark:text-white'
                  }`}>
                    <TrendingUp className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div className="font-semibold text-sm">Avantage :</div>
                  </div>
                  <div className={`text-sm leading-relaxed ${
                    isSelected ? 'text-white/90' : 'text-gray-600 dark:text-gray-300'
                  }`}>
                    {method.advantage}
                  </div>
                </div>

                {/* Fiscalité */}
                <div className={`p-4 rounded-xl border ${
                  isSelected 
                    ? 'bg-white/10 border-white/20' 
                    : 'bg-white/60 dark:bg-gray-800/60 border-gray-200 dark:border-gray-600'
                }`}>
                  <div className={`flex items-start gap-2 mb-2 ${
                    isSelected ? 'text-white' : 'text-gray-900 dark:text-white'
                  }`}>
                    <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div className="font-semibold text-sm">Fiscalité :</div>
                  </div>
                  <div className={`text-sm leading-relaxed ${
                    isSelected ? 'text-white/90' : 'text-gray-600 dark:text-gray-300'
                  }`}>
                    {method.fiscality}
                  </div>
                </div>
              </div>

              {/* Simulation rapide */}
              {investmentAmount >= method.minInvestment && (
                <div className={`mt-4 p-3 rounded-lg border ${
                  isSelected 
                    ? 'bg-white/10 border-white/20' 
                    : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                }`}>
                  <div className={`text-xs font-semibold mb-1 ${
                    isSelected ? 'text-white' : 'text-green-800 dark:text-green-300'
                  }`}>
                    Simulation sur {investmentAmount.toLocaleString('fr-FR')}€
                  </div>
                  {method.id === 'nue-propriete' ? (
                    <div className={`text-sm ${
                      isSelected ? 'text-white/90' : 'text-green-700 dark:text-green-200'
                    }`}>
                      Économie fiscale: {((investmentAmount * method.taxOptimization / 100)).toLocaleString('fr-FR')}€
                    </div>
                  ) : (
                    <div className={`text-sm ${
                      isSelected ? 'text-white/90' : 'text-green-700 dark:text-green-200'
                    }`}>
                      Revenus/an: {((investmentAmount * 5.1 * method.yieldMultiplier / 100)).toLocaleString('fr-FR')}€
                    </div>
                  )}
                </div>
              )}

              {/* Avertissement si non adapté */}
              {investmentAmount < method.minInvestment && (
                <div className={`mt-4 p-3 rounded-lg border ${
                  isSelected 
                    ? 'bg-red-500/20 border-red-300' 
                    : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                }`}>
                  <div className={`text-xs ${
                    isSelected ? 'text-white' : 'text-orange-800 dark:text-orange-300'
                  }`}>
                    ⚠️ Minimum requis: {method.minInvestment.toLocaleString('fr-FR')}€
                  </div>
                </div>
              )}

              {/* Indicateur de sélection */}
              {isSelected && (
                <div className="absolute top-2 left-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-purple-600 text-xs font-bold">✓</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Information sur la méthode sélectionnée */}
      {selectedMethod && (
        <div className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl border border-purple-200 dark:border-purple-600">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
              <Info className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-purple-800 dark:text-purple-200 text-lg">
                Mode sélectionné: {PURCHASE_METHODS_CARDS.find(m => m.id === selectedMethod)?.name}
              </h4>
              <p className="text-sm text-purple-600 dark:text-purple-300">
                Optimisé pour votre TMI de {tmi}%
              </p>
            </div>
          </div>
          
          <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl border border-purple-200 dark:border-purple-700">
            <div className="text-sm text-purple-700 dark:text-purple-300 leading-relaxed">
              <strong>Fiscalité :</strong> {PURCHASE_METHODS_CARDS.find(m => m.id === selectedMethod)?.fiscality}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseMethodSelector;