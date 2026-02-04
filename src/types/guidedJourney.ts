// Types pour le parcours guidé d'investissement

export type TaxSituation = 'moins-2000' | '2000-6000' | 'plus-6000' | 'je-ne-sais-pas';
export type InvestmentObjective = 'revenus-reguliers' | 'revenus-et-croissance' | 'croissance-long-terme' | 'etre-guide';
export type InvestmentHorizon = 'moins-8-ans' | '8-15-ans' | 'plus-15-ans' | 'je-ne-sais-pas';
export type ImmediateIncomeNeed = 'oui' | 'non' | 'je-ne-sais-pas';

export interface GuidedJourneyAnswers {
  taxSituation: TaxSituation;
  objective: InvestmentObjective;
  horizon: InvestmentHorizon;
  immediateIncome: ImmediateIncomeNeed;
  investmentAmount: number; // Montant d'investissement en euros
  patrimoineValue?: number;
  assetSplit?: string;
  scpiShare?: string;
  scpiExposure?: string;
  otherRealEstateIncome?: string;
  tmiEstimate?: string;
  realEstateIncomeExposure?: string;
  taxConstraintFeeling?: string;
  holdingStructure?: string;
  incomeUse?: string;
  priority?: string;
  temporaryDrawdown?: string;
  riskTolerance?: string;
  yieldStabilitySensitivity?: string;
  amountBand?: string;
  geoDiversification?: string;
  sectorPreference?: string;
  holdingMode?: string;
  scpiExperience?: string;
  autonomyLevel?: string;
  constraintsSimple?: string;
  yieldDropReaction?: string;
  debtSensitivity?: string;
  acceptRecentScpi?: string;
  cycleTolerance?: string;
  preferredZones?: string;
  sectorPreferences?: string;
  sectorsToLimit?: string;
  acceptSectorOverlap?: string;
  capitalizationImportance?: string;
  targetScpiCount?: string;
  maxPerScpi?: string;
  exclusions?: string;
  avoidCriteria?: string;
  postureUnderstanding?: string;
  expectedOutcome?: string;
}

export type PortfolioType = 
  | 'revenus-stables'
  | 'revenus-croissance'
  | 'croissance-long-terme'
  | 'opportunites-immobilieres'
  | 'immobilier-europeen';

export type RiskLevel = 'faible' | 'modere' | 'dynamique';

export interface Portfolio {
  id: PortfolioType;
  name: string;
  description: string;
  riskLevel: RiskLevel;
  scpis: Array<{
    scpiId: number;
    allocation: number; // Pourcentage (0-100)
    qualityScore?: number; // Score global (0-100)
    maximusIndex?: number; // Indice visuel MaximusSCPI (1-5)
  }>;
  logic: string; // Explication de la logique de sélection
}

export interface PortfolioRecommendation {
  portfolio: Portfolio;
  explanation: string; // Explication simple pour le client
}
