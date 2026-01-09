import { Scpi } from '../types/scpi';
import { PortfolioType } from '../types/guidedJourney';

/**
 * Détermine le nombre maximum de SCPI selon le montant investi
 */
export function getMaxScpiCount(investmentAmount: number): number {
  if (investmentAmount <= 15000) return 2;
  if (investmentAmount <= 30000) return 3;
  if (investmentAmount <= 60000) return 4;
  if (investmentAmount <= 100000) return 5;
  return 6;
}

/**
 * Priorise les SCPI selon l'objectif du portefeuille
 * Retourne un score de priorité (plus élevé = plus prioritaire)
 */
function calculatePriorityScore(
  scpi: Scpi,
  portfolioType: PortfolioType,
  originalAllocation: number
): number {
  let score = 0;
  
  // Priorité 1: Allocation originale (plus l'allocation est élevée, plus c'est prioritaire)
  score += originalAllocation * 10;
  
  // Priorité 2: Selon le type de portefeuille
  switch (portfolioType) {
    case 'revenus-stables':
      // Prioriser rendement élevé, stabilité, France
      score += scpi.yield * 2;
      score += scpi.tof * 0.5;
      if (scpi.geography === 'france') score += 20;
      if (scpi.capitalization >= 100_000_000) score += 10;
      break;
      
    case 'revenus-croissance':
      // Prioriser mix rendement + croissance
      score += scpi.yield * 1.5;
      score += (scpi.capitalization / 1_000_000) * 0.1;
      if (scpi.geography === 'france' || scpi.geography === 'europe') score += 15;
      break;
      
    case 'croissance-long-terme':
      // Prioriser capitalisation, Europe
      score += (scpi.capitalization / 1_000_000) * 0.2;
      if (scpi.geography === 'europe' || scpi.european) score += 20;
      if (scpi.capitalization >= 200_000_000) score += 15;
      break;
      
    case 'opportunites-immobilieres':
      // Prioriser diversification et décote
      score += Math.abs(scpi.discount) * 2;
      if (scpi.capitalization >= 100_000_000) score += 10;
      break;
      
    case 'immobilier-europeen':
      // Prioriser Europe, diversification
      if (scpi.geography === 'europe' || scpi.european) score += 30;
      score += scpi.yield * 1.5;
      break;
  }
  
  // Priorité 3: Qualité générale (pour tous les portefeuilles)
  if (scpi.tof >= 95) score += 10;
  if (scpi.capitalization >= 100_000_000) score += 5;
  if (scpi.isr) score += 5;
  if (scpi.fees === 0) score += 3;
  
  return score;
}

/**
 * Adapte le portefeuille au montant investi
 * Sélectionne les SCPI les plus prioritaires et réajuste les allocations
 */
export function adaptPortfolioToAmount(
  portfolioScpis: Array<{ scpi: Scpi; allocation: number }>,
  portfolioType: PortfolioType,
  investmentAmount: number
): {
  adaptedScpis: Array<{ scpi: Scpi; allocation: number }>;
  maxScpiCount: number;
} {
  const maxScpiCount = getMaxScpiCount(investmentAmount);
  
  // Si le nombre de SCPI est déjà inférieur ou égal au maximum, pas besoin d'adapter
  if (portfolioScpis.length <= maxScpiCount) {
    return {
      adaptedScpis: portfolioScpis,
      maxScpiCount,
    };
  }
  
  // Calculer le score de priorité pour chaque SCPI
  const scoredScpis = portfolioScpis.map(item => ({
    ...item,
    priorityScore: calculatePriorityScore(item.scpi, portfolioType, item.allocation),
  }));
  
  // Trier par score de priorité décroissant
  scoredScpis.sort((a, b) => b.priorityScore - a.priorityScore);
  
  // Sélectionner les N meilleures SCPI
  const selectedScpis = scoredScpis.slice(0, maxScpiCount);
  
  // Réajuster les allocations pour que la somme fasse 100%
  const totalOriginalAllocation = selectedScpis.reduce((sum, item) => sum + item.allocation, 0);
  const factor = 100 / totalOriginalAllocation;
  
  const adaptedScpis = selectedScpis.map(item => ({
    scpi: item.scpi,
    allocation: Math.round(item.allocation * factor * 10) / 10,
  }));
  
  // S'assurer que la somme fait exactement 100%
  const total = adaptedScpis.reduce((sum, item) => sum + item.allocation, 0);
  if (Math.abs(total - 100) > 0.01) {
    const diff = 100 - total;
    adaptedScpis[0].allocation = Math.round((adaptedScpis[0].allocation + diff) * 10) / 10;
  }
  
  return {
    adaptedScpis,
    maxScpiCount,
  };
}
