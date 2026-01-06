import { PurchaseMethodInfo } from '../types/scpi';

const PURCHASE_METHODS_DATA: PurchaseMethodInfo[] = [
  {
    id: 'pleine-propriete',
    name: 'Pleine Propriété',
    description: 'Investissement classique avec revenus immédiats',
    icon: '🏠',
    fiscalAdvantage: 'Revenus fonciers imposés à la TMI + prélèvements sociaux',
    minInvestment: 1000,
    targetTmi: [0, 11, 30],
    yieldMultiplier: 1.0,
    taxOptimization: 0
  },
  {
    id: 'nue-propriete',
    name: 'Nue-Propriété',
    description: 'Investissement sans revenus immédiats, optimisation fiscale',
    icon: '🎯',
    fiscalAdvantage: 'Aucune imposition pendant la durée du démembrement',
    minInvestment: 10000,
    targetTmi: [30, 41, 45],
    yieldMultiplier: 0.0, // Pas de revenus pendant le démembrement
    taxOptimization: 40 // 40% d'économie fiscale
  },
  {
    id: 'usufruit',
    name: 'Usufruit',
    description: 'Revenus élevés pendant une durée déterminée',
    icon: '💰',
    fiscalAdvantage: 'Revenus majorés mais imposés à la TMI',
    minInvestment: 5000,
    targetTmi: [0, 11],
    yieldMultiplier: 1.8, // Revenus majorés
    taxOptimization: 0
  },
  {
    id: 'credit',
    name: 'Achat à Crédit',
    description: 'Effet de levier avec financement bancaire',
    icon: '🏦',
    fiscalAdvantage: 'Déduction des intérêts d\'emprunt',
    minInvestment: 20000,
    targetTmi: [30, 41, 45],
    yieldMultiplier: 2.5, // Effet de levier
    taxOptimization: 25 // Déduction fiscale des intérêts
  }
];

export default PURCHASE_METHODS_DATA;

export const getPurchaseMethodRecommendation = (tmi: number, investmentAmount: number): PurchaseMethodInfo => {
  if (tmi <= 11) {
    return investmentAmount >= 50000 ? PURCHASE_METHODS_DATA[2] : PURCHASE_METHODS_DATA[0]; // Usufruit ou Pleine propriété
  } else if (tmi >= 30) {
    return investmentAmount >= 100000 ? PURCHASE_METHODS_DATA[3] : PURCHASE_METHODS_DATA[1]; // Crédit ou Nue-propriété
  } else {
    return PURCHASE_METHODS_DATA[0]; // Pleine propriété par défaut
  }
};