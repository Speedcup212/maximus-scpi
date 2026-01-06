import { Scpi } from '../types/scpi';
import { RiskProfile, ClientProfile } from '../types/riskProfile';

export interface PortfolioRecommendation {
  scpi: Scpi;
  allocation: number;
  reason: string;
  score: number;
}

export interface RecommendationResult {
  recommendations: PortfolioRecommendation[];
  totalScore: number;
  riskAnalysis: {
    averageYield: number;
    diversificationScore: number;
    riskScore: number;
    suitabilityScore: number;
  };
  warnings: string[];
  suggestions: string[];
}

export const generatePortfolioRecommendations = (
  availableScpi: Scpi[],
  clientProfile: ClientProfile
): RecommendationResult => {
  const { riskProfile, preferences, investmentAmount } = clientProfile;
  
  // Filtrer les SCPI selon les préférences
  let filteredScpi = availableScpi.filter(scpi => {
    // Filtres de préférences
    if (preferences.isr && !scpi.isr) return false;
    if (preferences.european && !scpi.european) return false;
    if (preferences.noFees && scpi.fees > 0) return false;
    
    // Filtres sectoriels
    if (preferences.excludedSectors.includes(scpi.sector)) return false;
    if (preferences.sectors.length > 0 && !preferences.sectors.includes(scpi.sector)) return false;
    
    return true;
  });

  // Calculer le score de chaque SCPI
  const scoredScpi = filteredScpi.map(scpi => {
    let score = 0;
    let reasons: string[] = [];

    // Score de rendement (40% du score total)
    const yieldScore = calculateYieldScore(scpi.yield, riskProfile);
    score += yieldScore * 0.4;
    if (yieldScore > 0.7) reasons.push('Rendement attractif');

    // Score de secteur (20% du score total)
    const sectorScore = calculateSectorScore(scpi.sector, riskProfile);
    score += sectorScore * 0.2;
    if (sectorScore > 0.8) reasons.push('Secteur recommandé');

    // Score géographique (15% du score total)
    const geoScore = calculateGeographyScore(scpi.geography, riskProfile);
    score += geoScore * 0.15;
    if (geoScore > 0.8) reasons.push('Zone géographique adaptée');

    // Score de qualité (15% du score total)
    const qualityScore = calculateQualityScore(scpi);
    score += qualityScore * 0.15;
    if (qualityScore > 0.8) reasons.push('SCPI de qualité');

    // Score de taille/liquidité (10% du score total)
    const sizeScore = calculateSizeScore(scpi.capitalization);
    score += sizeScore * 0.1;
    if (sizeScore > 0.8) reasons.push('Bonne liquidité');

    return {
      scpi,
      score: Math.min(score, 1), // Normaliser entre 0 et 1
      reason: reasons.join(', ') || 'SCPI adaptée à votre profil'
    };
  });

  // Trier par score décroissant
  scoredScpi.sort((a, b) => b.score - a.score);

  // Sélectionner les meilleures SCPI avec diversification
  const selectedScpi = selectDiversifiedPortfolio(scoredScpi, riskProfile);

  // Calculer les allocations
  const recommendations = calculateAllocations(selectedScpi, riskProfile, investmentAmount);

  // Analyser le portefeuille
  const riskAnalysis = analyzePortfolioRisk(recommendations, riskProfile);

  // Générer warnings et suggestions
  const { warnings, suggestions } = generateAdvice(recommendations, riskProfile, clientProfile);

  return {
    recommendations,
    totalScore: recommendations.reduce((sum, rec) => sum + rec.score, 0) / recommendations.length,
    riskAnalysis,
    warnings,
    suggestions
  };
};

const calculateYieldScore = (yieldValue: number, riskProfile: RiskProfile): number => {
  const { min, max } = riskProfile.targetYield;
  
  // Pour les profils prudents, être plus tolérant sur les rendements légèrement inférieurs
  if (yieldValue < min) {
    const tolerance = riskProfile.riskLevel <= 3 ? 0.8 : 0.5; // Plus de tolérance pour profils prudents
    return Math.max(0.3, (yieldValue / min) * tolerance);
  }
  
  if (yieldValue > max) {
    // Pénaliser légèrement les rendements trop élevés pour les profils prudents
    const penalty = riskProfile.riskLevel <= 3 ? 0.9 : 1; // Moins de pénalité pour profils prudents
    return Math.min(1, penalty);
  }
  
  // Score optimal dans la fourchette cible
  return 0.8 + ((yieldValue - min) / (max - min)) * 0.2;
};

const calculateSectorScore = (sector: string, riskProfile: RiskProfile): number => {
  if (riskProfile.preferredSectors.length === 0) return 0.7; // Profil expert
  
  if (riskProfile.preferredSectors.includes(sector)) return 1;
  
  // Scores par secteur selon le profil de risque
  const sectorRiskScores: Record<string, number> = {
    'sante': 0.9,      // Très stable
    'commerces': 0.8,   // Stable
    'bureaux': 0.7,     // Modéré
    'residentiel': 0.6, // Modéré à risqué
    'logistique': 0.5,  // Risqué
    'hotellerie': 0.4,  // Très risqué
    'diversifie': 0.6        // Modéré
  };

  const sectorRisk = sectorRiskScores[sector] || 0.5;
  
  // Adapter selon le profil de risque
  if (riskProfile.riskLevel <= 2) {
    return sectorRisk; // Profils prudents préfèrent les secteurs stables
  } else {
    return 1 - sectorRisk + 0.5; // Profils dynamiques acceptent plus de risque
  }
};

const calculateGeographyScore = (geography: string, riskProfile: RiskProfile): number => {
  if (riskProfile.preferredGeography.length === 0) return 0.7; // Profil expert
  
  if (riskProfile.preferredGeography.includes(geography)) return 1;
  
  // Scores géographiques selon le risque
  const geoRiskScores: Record<string, number> = {
    'france': 0.9,
    'europe': 0.7,
    'international': 0.5
  };

  const geoRisk = geoRiskScores[geography] || 0.5;
  
  // Adapter selon le profil de risque
  if (riskProfile.riskLevel <= 2) {
    return geoRisk;
  } else {
    return Math.min(1, geoRisk + 0.3);
  }
};

const calculateQualityScore = (scpi: Scpi): number => {
  let score = 0.5; // Score de base
  
  // TOF élevé = bonne gestion
  if (scpi.tof >= 95) score += 0.2;
  else if (scpi.tof >= 90) score += 0.1;
  
  // Label ISR = qualité ESG
  if (scpi.isr) score += 0.1;
  
  // Ancienneté = expérience
  const age = new Date().getFullYear() - scpi.creation;
  if (age >= 10) score += 0.1;
  else if (age >= 5) score += 0.05;
  
  // Sans frais = avantage coût
  if (scpi.fees === 0) score += 0.05;
  
  return Math.min(score, 1);
};

const calculateSizeScore = (capitalization: number): number => {
  // Score basé sur la taille (liquidité)
  if (capitalization >= 1000000000) return 1;      // >= 1Md€
  if (capitalization >= 500000000) return 0.8;     // >= 500M€
  if (capitalization >= 100000000) return 0.6;     // >= 100M€
  if (capitalization >= 50000000) return 0.4;      // >= 50M€
  return 0.2;
};

const selectDiversifiedPortfolio = (
  scoredScpi: { scpi: Scpi; score: number; reason: string }[],
  riskProfile: RiskProfile
): { scpi: Scpi; score: number; reason: string }[] => {
  const selected: { scpi: Scpi; score: number; reason: string }[] = [];
  const usedSectors = new Set<string>();
  const usedGeographies = new Set<string>();
  
  // Adapter le nombre de SCPI selon le niveau de risque
  const maxScpi = riskProfile.riskLevel <= 3 
    ? Math.max(riskProfile.minDiversification, 4) // Profils prudents: 3-4 SCPI max
    : Math.max(riskProfile.minDiversification, 6); // Profils dynamiques: jusqu'à 6 SCPI
  
  // Pour les profils prudents, prioriser les SCPI avec les meilleurs scores même si moins diversifiées
  const sortedScpi = riskProfile.riskLevel <= 3 
    ? scoredScpi.sort((a, b) => b.score - a.score) // Tri par score pour profils prudents
    : scoredScpi; // Ordre original pour profils dynamiques
  
  for (const item of sortedScpi) {
    if (selected.length >= maxScpi) break;
    
    // Pour profils prudents: privilégier qualité sur diversification
    // Pour profils dynamiques: forcer la diversification
    const shouldAdd = riskProfile.riskLevel <= 3 
      ? item.score > 0.4 // Score minimum pour profils prudents
      : (selected.length < 3 || !usedSectors.has(item.scpi.sector) || usedSectors.size < 3);
    
    if (shouldAdd) {
      selected.push(item);
      usedSectors.add(item.scpi.sector);
      usedGeographies.add(item.scpi.geography);
    }
  }
  
  // Compléter si nécessaire
  for (const item of scoredScpi) {
    if (selected.length >= maxScpi) break;
    if (!selected.find(s => s.scpi.id === item.scpi.id)) {
      selected.push(item);
    }
  }
  
  return selected.slice(0, maxScpi);
};

const calculateAllocations = (
  selectedScpi: { scpi: Scpi; score: number; reason: string }[],
  riskProfile: RiskProfile,
  investmentAmount: number
): PortfolioRecommendation[] => {
  const totalScore = selectedScpi.reduce((sum, item) => sum + item.score, 0);
  
  return selectedScpi.map(item => {
    // Allocation basée sur le score, mais limitée par le profil de risque
    let allocation = (item.score / totalScore) * 100;
    allocation = Math.min(allocation, riskProfile.maxSingleAllocation);
    
    return {
      scpi: item.scpi,
      allocation: Math.round(allocation * 10) / 10, // Arrondir à 1 décimale
      reason: item.reason,
      score: item.score
    };
  });
};

const analyzePortfolioRisk = (
  recommendations: PortfolioRecommendation[],
  riskProfile: RiskProfile
) => {
  const averageYield = recommendations.reduce(
    (sum, rec) => sum + (rec.scpi.yield * rec.allocation / 100), 0
  );
  
  // Score de diversification
  const sectors = new Set(recommendations.map(rec => rec.scpi.sector));
  const geographies = new Set(recommendations.map(rec => rec.scpi.geography));
  const diversificationScore = Math.min(1, (sectors.size + geographies.size) / 8);
  
  // Score de risque (basé sur la volatilité estimée)
  const riskScore = Math.min(1, averageYield / 10); // Approximation simple
  
  // Score d'adéquation au profil
  const yieldInRange = averageYield >= riskProfile.targetYield.min && 
                      averageYield <= riskProfile.targetYield.max;
  const suitabilityScore = yieldInRange ? 0.9 : 0.6;
  
  return {
    averageYield,
    diversificationScore,
    riskScore,
    suitabilityScore
  };
};

const generateAdvice = (
  recommendations: PortfolioRecommendation[],
  riskProfile: RiskProfile,
  clientProfile: ClientProfile
) => {
  const warnings: string[] = [];
  const suggestions: string[] = [];
  
  const averageYield = recommendations.reduce(
    (sum, rec) => sum + (rec.scpi.yield * rec.allocation / 100), 0
  );
  
  // Warnings
  if (averageYield < riskProfile.targetYield.min) {
    warnings.push(`Rendement moyen (${averageYield.toFixed(2)}%) inférieur à votre objectif`);
  }
  
  if (recommendations.length < riskProfile.minDiversification) {
    warnings.push('Portefeuille insuffisamment diversifié');
  }
  
  const maxAllocation = Math.max(...recommendations.map(rec => rec.allocation));
  if (maxAllocation > riskProfile.maxSingleAllocation) {
    warnings.push('Concentration trop élevée sur une SCPI');
  }
  
  // Suggestions
  if (clientProfile.age < 40 && riskProfile.riskLevel < 3) {
    suggestions.push('Avec votre âge, vous pourriez envisager un profil plus dynamique');
  }
  
  if (clientProfile.investmentHorizon > 15 && averageYield < 6) {
    suggestions.push('Avec un horizon long terme, vous pourriez viser un rendement plus élevé');
  }
  
  const sectors = new Set(recommendations.map(rec => rec.scpi.sector));
  if (sectors.size < 3) {
    suggestions.push('Considérez une diversification sectorielle plus large');
  }
  
  return { warnings, suggestions };
};