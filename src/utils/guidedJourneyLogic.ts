import { Scpi } from '../types/scpi';
import { getMaxScpiCount } from './portfolioAdaptation';
import { normalizeGeoLabel } from './labelNormalization';
import { 
  GuidedJourneyAnswers, 
  PortfolioType, 
  RiskLevel,
  Portfolio,
  PortfolioRecommendation 
} from '../types/guidedJourney';

/**
 * Mappe le montant d'impôt annuel vers une TMI estimée
 * Moins de 2 000 € → TMI faible (0-11%) → priorité au rendement brut
 * 2 000 à 6 000 € → TMI intermédiaire (30%) → équilibre rendement / diversification
 * Plus de 6 000 € → TMI élevée (41%+) → priorité à l'optimisation fiscale
 */
export function mapTaxSituationToTMI(taxSituation: string): number {
  switch (taxSituation) {
    case 'moins-2000':
      return 0; // TMI 0-11% → priorité au rendement brut
    case '2000-6000':
      return 30; // TMI 30% → équilibre rendement / diversification
    case 'plus-6000':
      return 41; // TMI 41%+ → priorité à l'optimisation fiscale
    case 'je-ne-sais-pas':
      return 30; // Par défaut, TMI 30% (profil neutre)
    default:
      return 30;
  }
}

const MAX_FRANCE_EXPOSURE_FOR_HIGH_TMI = 20;

const getFranceExposure = (scpi: Scpi): number => {
  if (scpi.repartitionGeo && scpi.repartitionGeo.length > 0) {
    return scpi.repartitionGeo.reduce((sum, geo) => {
      const normalized = normalizeGeoLabel(geo.name);
      return normalized.key === 'france' ? sum + geo.value : sum;
    }, 0);
  }

  if (scpi.geography === 'france') {
    return 100;
  }

  if (scpi.geography === 'europe' || scpi.european) {
    return 0;
  }

  // Sans détail géographique, on applique une prudence maximale
  return 100;
};

/**
 * Détermine la priorité fiscale à partir du montant d'impôt annuel
 */
export function getTaxPriority(taxSituation: string): 'yield' | 'balance' | 'tax-optimization' | 'neutral' {
  switch (taxSituation) {
    case 'moins-2000':
      return 'yield'; // Priorité au rendement brut
    case '2000-6000':
      return 'balance'; // Équilibre rendement / diversification
    case 'plus-6000':
      return 'tax-optimization'; // Priorité à l'optimisation fiscale (Europe, typologies adaptées)
    case 'je-ne-sais-pas':
      return 'neutral'; // Profil neutre + renforcement pédagogique
    default:
      return 'neutral';
  }
}

/**
 * Filtre les SCPI selon les critères stricts obligatoires
 * Critères : Capitalisation ≥ 50M€, TOF ≥ 90%, Endettement < 30%, Décote ≤ 0, Rendement ≥ moyenne
 */
export function filterScpiByStrictCriteria(scpis: Scpi[]): Scpi[] {
  // Calculer le rendement moyen de l'univers
  const averageYield = scpis.reduce((sum, scpi) => sum + scpi.yield, 0) / scpis.length;

  return scpis.filter(scpi => {
    // 1. Capitalisation ≥ 50 M€
    const hasMinCapitalization = scpi.capitalization >= 50_000_000;
    
    // 2. TOF ≥ 90%
    const hasMinTOF = scpi.tof >= 90;
    
    // 3. Ratio d'endettement < 30%
    const hasLowDebt = scpi.debt === undefined || scpi.debt < 30;
    
    // 4. Prix de part ≤ valeur de reconstitution (surcote = exclusion)
    const hasFairPrice = scpi.valeurReconstitution !== undefined
      ? scpi.price <= scpi.valeurReconstitution
      : scpi.discount !== undefined
        ? scpi.discount <= 0
        : false;
    
    // 5. Rendement réel ≥ moyenne de l'univers
    const hasMinYield = scpi.yield >= averageYield;
    
    // 6. Stratégie lisible (on considère que toutes les SCPI ont une stratégie lisible)
    const hasClearStrategy = true;
    
    return hasMinCapitalization && 
           hasMinTOF && 
           hasLowDebt && 
           hasFairPrice && 
           hasMinYield && 
           hasClearStrategy;
  });
}

type ScpiWithScore = {
  scpi: Scpi;
  qualityScore: number;
  maximusIndex: number;
};

const clampScore = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));

const mapScoreToIndex = (score: number): number => {
  if (score >= 85) return 5;
  if (score >= 75) return 4;
  if (score >= 65) return 3;
  if (score >= 55) return 2;
  return 1;
};

const computeQualityScore = (
  scpi: Scpi,
  averageYield: number
): { score: number; maximusIndex: number } => {
  // Solidité (40%)
  const tofScore = clampScore(((scpi.tof - 85) / 15) * 100, 0, 100);
  const debtScore = scpi.debt === undefined
    ? 40
    : scpi.debt <= 10
      ? 100
      : clampScore(100 - ((scpi.debt - 10) / 20) * 40, 60, 100);

  const capRatio = scpi.capitalization / 50_000_000;
  const capScore = clampScore(40 + (Math.log10(Math.max(capRatio, 1)) / Math.log10(10)) * 60, 40, 100);
  const solidite = (tofScore * 0.45) + (debtScore * 0.3) + (capScore * 0.25);

  // Rendement durable (30%)
  const yieldRatio = averageYield > 0 ? scpi.yield / averageYield : 1;
  let yieldScore = clampScore(60 + (yieldRatio - 1) * 40, 40, 90);
  if (yieldRatio > 1.6) yieldScore = 50;
  if (yieldRatio > 2) yieldScore = 30;

  // Cohérence patrimoniale (30%)
  const sectorCount = scpi.repartitionSector?.length ?? 0;
  const sectorScore = sectorCount >= 4 ? 100 : sectorCount === 3 ? 80 : sectorCount === 2 ? 65 : sectorCount === 1 ? 45 : 30;

  const geoCount = scpi.repartitionGeo?.length ?? 0;
  const geoScore = geoCount >= 4
    ? 100
    : geoCount === 3
      ? 85
      : geoCount === 2
        ? 70
        : geoCount === 1
          ? 55
          : scpi.geography === 'international'
            ? 80
            : scpi.geography === 'europe'
              ? 70
              : 55;

  const strategyScore = 90;
  const coherence = (sectorScore * 0.45) + (geoScore * 0.35) + (strategyScore * 0.2);

  // Malus données manquantes
  let penalty = 0;
  if (scpi.debt === undefined) penalty += 8;
  if (!scpi.repartitionSector || scpi.repartitionSector.length === 0) penalty += 6;
  if (!scpi.repartitionGeo || scpi.repartitionGeo.length === 0) penalty += 6;
  if (scpi.valeurReconstitution === undefined && scpi.discount === undefined) penalty += 5;

  const score = clampScore((solidite * 0.4) + (yieldScore * 0.3) + (coherence * 0.3) - penalty, 0, 100);

  return {
    score: Math.round(score),
    maximusIndex: mapScoreToIndex(score),
  };
};

const allocateByScore = (scpis: ScpiWithScore[], maxPerScpi = 25): Array<{ scpiId: number; allocation: number; qualityScore: number; maximusIndex: number }> => {
  if (scpis.length === 0) return [];

  const effectiveMaxPerScpi = scpis.length * maxPerScpi < 100 ? 100 : maxPerScpi;
  const totalScore = scpis.reduce((sum, item) => sum + item.qualityScore, 0) || 1;
  let allocations = scpis.map(item => ({
    scpiId: item.scpi.id,
    allocation: (item.qualityScore / totalScore) * 100,
    qualityScore: item.qualityScore,
    maximusIndex: item.maximusIndex,
  }));

  // Appliquer le plafond par SCPI et redistribuer le surplus si possible
  let remaining = 100;
  let adjustable = allocations.map(a => ({ ...a }));
  const fixed: typeof allocations = [];

  for (let iteration = 0; iteration < 5; iteration += 1) {
    const nextAdjustable: typeof allocations = [];
    fixed.length = 0;

    adjustable.forEach(item => {
      if (item.allocation > effectiveMaxPerScpi) {
        fixed.push({ ...item, allocation: effectiveMaxPerScpi });
      } else {
        nextAdjustable.push(item);
      }
    });

    const fixedTotal = fixed.reduce((sum, item) => sum + item.allocation, 0);
    remaining = 100 - fixedTotal;

    if (nextAdjustable.length === 0) {
      allocations = [...fixed];
      return allocations.map(item => ({ ...item, allocation: Math.round(item.allocation * 10) / 10 }));
    }

    const adjustableScore = nextAdjustable.reduce((sum, item) => sum + item.qualityScore, 0) || 1;
    allocations = [
      ...fixed,
      ...nextAdjustable.map(item => ({
        ...item,
        allocation: (item.qualityScore / adjustableScore) * remaining,
      })),
    ];

    adjustable = allocations.filter(item => item.allocation > effectiveMaxPerScpi);
    if (adjustable.length === 0) break;
    adjustable = allocations.filter(item => item.allocation > effectiveMaxPerScpi);
  }

  return allocations.map(item => ({
    ...item,
    allocation: Math.round(item.allocation * 10) / 10,
  }));
};

const selectByScore = (
  scpis: ScpiWithScore[],
  limit: number,
  options?: { maxPerSector?: number; minScore?: number }
): ScpiWithScore[] => {
  const maxPerSector = options?.maxPerSector ?? 2;
  const minScore = options?.minScore ?? 65;
  const sectorCount: Record<string, number> = {};

  return [...scpis]
    .sort((a, b) => b.qualityScore - a.qualityScore)
    .filter(item => item.qualityScore >= minScore)
    .filter(item => {
      const sector = item.scpi.sector;
      const current = sectorCount[sector] || 0;
      if (current >= maxPerSector) return false;
      sectorCount[sector] = current + 1;
      return true;
    })
    .slice(0, limit);
};

/**
 * Détermine le portefeuille recommandé à partir des réponses
 */
export function determineRecommendedPortfolio(answers: GuidedJourneyAnswers): PortfolioType {
  const { taxSituation, objective, horizon, immediateIncome } = answers;
  
  // Logique de décision simplifiée
  // Priorité 1: Besoin de revenus immédiats
  if (immediateIncome === 'oui') {
    return 'revenus-stables';
  }
  
  // Priorité 2: Objectif principal
  if (objective === 'revenus-reguliers') {
    return 'revenus-stables';
  }
  
  if (objective === 'revenus-et-croissance') {
    return 'revenus-croissance';
  }
  
  if (objective === 'croissance-long-terme') {
    return 'croissance-long-terme';
  }
  
  // Priorité 3: Horizon d'investissement
  if (horizon === 'moins-8-ans') {
    return 'revenus-stables';
  }
  
  if (horizon === 'plus-15-ans') {
    return 'croissance-long-terme';
  }
  
  // Par défaut pour débutants
  if (objective === 'etre-guide') {
    return 'revenus-stables';
  }
  
  // Par défaut
  return 'revenus-croissance';
}

/**
 * Construit un portefeuille selon le type, les SCPI disponibles et la priorité fiscale
 */
export function buildPortfolio(
  portfolioType: PortfolioType,
  availableScpis: Scpi[],
  maxScpiCount: number,
  taxPriority?: 'yield' | 'balance' | 'tax-optimization' | 'neutral'
): Portfolio {
  const portfolios: Record<PortfolioType, Omit<Portfolio, 'scpis' | 'logic'>> = {
    'revenus-stables': {
      id: 'revenus-stables',
      name: 'Portefeuille Revenus Stables',
      description: 'Un portefeuille axé sur la génération de revenus réguliers avec une stabilité du capital.',
      riskLevel: 'faible',
    },
    'revenus-croissance': {
      id: 'revenus-croissance',
      name: 'Portefeuille Revenus & Croissance',
      description: 'Un équilibre entre revenus réguliers et croissance du capital sur le moyen terme.',
      riskLevel: 'modere',
    },
    'croissance-long-terme': {
      id: 'croissance-long-terme',
      name: 'Portefeuille Croissance Long Terme',
      description: 'Un portefeuille orienté vers la croissance du capital sur le long terme.',
      riskLevel: 'modere',
    },
    'opportunites-immobilieres': {
      id: 'opportunites-immobilieres',
      name: 'Portefeuille Opportunités Immobilières',
      description: 'Un portefeuille diversifié pour saisir les opportunités du marché immobilier.',
      riskLevel: 'dynamique',
    },
    'immobilier-europeen': {
      id: 'immobilier-europeen',
      name: 'Portefeuille Immobilier Européen',
      description: 'Un portefeuille diversifié géographiquement sur l\'Europe pour réduire les risques.',
      riskLevel: 'modere',
    },
  };

  const averageYield = availableScpis.reduce((sum, scpi) => sum + scpi.yield, 0) / (availableScpis.length || 1);
  const scoredScpis: ScpiWithScore[] = availableScpis.map(scpi => {
    const { score, maximusIndex } = computeQualityScore(scpi, averageYield);
    return { scpi, qualityScore: score, maximusIndex };
  });

  let selectedScpis: ScpiWithScore[] = [];
  let universe: ScpiWithScore[] = scoredScpis;
  const minScore = 65;
  const currentYear = new Date().getFullYear();

  switch (portfolioType) {
    case 'revenus-stables': {
      const baseUniverse = taxPriority === 'yield'
        ? scoredScpis.filter(item => item.scpi.geography === 'france')
        : taxPriority === 'tax-optimization'
          ? scoredScpis.filter(item => item.scpi.geography === 'europe' || item.scpi.european)
          : scoredScpis;
      universe = baseUniverse;
      selectedScpis = selectByScore(baseUniverse, maxScpiCount, { minScore });
      break;
    }
    case 'revenus-croissance': {
      if (taxPriority === 'tax-optimization') {
        const europeUniverse = scoredScpis.filter(item => item.scpi.geography === 'europe' || item.scpi.european);
        universe = europeUniverse;
        selectedScpis = selectByScore(europeUniverse, maxScpiCount, { minScore });
      } else {
        universe = scoredScpis;
        const franceCount = Math.ceil(maxScpiCount / 2);
        const europeCount = maxScpiCount - franceCount;
        const franceTop = selectByScore(
          scoredScpis.filter(item => item.scpi.geography === 'france'),
          franceCount,
          { minScore }
        );
        const europeTop = selectByScore(
          scoredScpis.filter(item => item.scpi.geography === 'europe' || item.scpi.european),
          europeCount,
          { minScore }
        );
        selectedScpis = [...franceTop, ...europeTop].slice(0, maxScpiCount);
      }
      break;
    }
    case 'croissance-long-terme': {
      const baseUniverse = taxPriority === 'tax-optimization'
        ? scoredScpis.filter(item => item.scpi.geography === 'europe' || item.scpi.european)
        : scoredScpis;
      const filtered = baseUniverse.filter(item => {
        if (!item.scpi.creation) return true;
        return currentYear - item.scpi.creation >= 3;
      });
      universe = filtered;
      selectedScpis = selectByScore(filtered, maxScpiCount, { minScore });
      break;
    }
    case 'opportunites-immobilieres': {
      const sectors: Array<Scpi['sector']> = ['bureaux', 'commerces', 'sante', 'logistique', 'diversifie'];
      const sectorUniverse = taxPriority === 'tax-optimization'
        ? scoredScpis.filter(item => item.scpi.geography === 'europe' || item.scpi.european)
        : scoredScpis;
      universe = sectorUniverse;

      selectedScpis = sectors
        .map(sector => {
          const candidates = sectorUniverse.filter(item => item.scpi.sector === sector);
          return candidates.sort((a, b) => b.qualityScore - a.qualityScore)[0];
        })
        .filter((item): item is ScpiWithScore => Boolean(item))
        .filter(item => item.qualityScore >= minScore)
        .slice(0, maxScpiCount);
      break;
    }
    case 'immobilier-europeen': {
      const europeUniverse = scoredScpis.filter(item => item.scpi.geography === 'europe' || item.scpi.european);
      universe = europeUniverse;
      selectedScpis = selectByScore(europeUniverse, maxScpiCount, { minScore });
      break;
    }
  }

  if (selectedScpis.length < maxScpiCount) {
    const selectedIds = new Set(selectedScpis.map(item => item.scpi.id));
    const fillCandidates = universe
      .filter(item => !selectedIds.has(item.scpi.id))
      .sort((a, b) => b.qualityScore - a.qualityScore);
    selectedScpis = [...selectedScpis, ...fillCandidates].slice(0, maxScpiCount);
  }

  const allocations = allocateByScore(selectedScpis, 25);

  const logic = "SCPI sélectionnées selon un score de qualité global (solidité, rendement durable, cohérence patrimoniale) avec contraintes strictes et fiscalité intégrée.";

  return {
    ...portfolios[portfolioType],
    scpis: allocations,
    logic,
  };
}

/**
 * Génère la recommandation complète pour le client
 */
export function generateRecommendation(
  answers: GuidedJourneyAnswers,
  allScpis: Scpi[]
): PortfolioRecommendation {
  // Filtrer les SCPI selon les critères stricts
  let eligibleScpis = filterScpiByStrictCriteria(allScpis);
  
  // Déterminer le portefeuille recommandé
  const portfolioType = determineRecommendedPortfolio(answers);
  
  // Déterminer la priorité fiscale à partir du montant d'impôt annuel
  const taxPriority = getTaxPriority(answers.taxSituation);
  const maxScpiCount = getMaxScpiCount(answers.investmentAmount || 50000);

  const tmiEstimate = answers.tmiEstimate;
  const tmiFromTaxSituation = mapTaxSituationToTMI(answers.taxSituation);
  const isHighTmi = tmiEstimate
    ? ['tmi-30', 'tmi-41', 'tmi-45'].includes(tmiEstimate)
    : tmiFromTaxSituation >= 30;

  if (isHighTmi) {
    eligibleScpis = eligibleScpis.filter(scpi => {
      const isEuropean = scpi.geography === 'europe' || scpi.european;
      const franceExposure = getFranceExposure(scpi);
      return isEuropean && franceExposure <= MAX_FRANCE_EXPOSURE_FOR_HIGH_TMI;
    });
  }
  
  // Construire le portefeuille en tenant compte de la priorité fiscale
  const portfolio = buildPortfolio(portfolioType, eligibleScpis, maxScpiCount, taxPriority);
  
  // Générer l'explication simple
  const explanation = generateSimpleExplanation(portfolio, answers);
  
  return {
    portfolio,
    explanation,
  };
}

/**
 * Génère une explication simple pour le client
 */
function generateSimpleExplanation(
  portfolio: Portfolio,
  answers: GuidedJourneyAnswers
): string {
  const { objective, horizon } = answers;
  
  let baseExplanation = `Nous vous recommandons le ${portfolio.name} car il correspond à votre situation. `;
  
  if (objective === 'revenus-reguliers' || answers.immediateIncome === 'oui') {
    baseExplanation += "Ce portefeuille est conçu pour générer des revenus réguliers tout en préservant votre capital. ";
  } else if (objective === 'croissance-long-terme' || horizon === 'plus-15-ans') {
    baseExplanation += "Ce portefeuille est orienté vers la croissance de votre capital sur le long terme. ";
  } else {
    baseExplanation += "Ce portefeuille équilibre revenus réguliers et croissance du capital. ";
  }
  
  baseExplanation += portfolio.logic;
  
  return baseExplanation;
}
