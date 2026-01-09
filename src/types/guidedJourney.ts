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
  }>;
  logic: string; // Explication de la logique de sélection
}

export interface PortfolioRecommendation {
  portfolio: Portfolio;
  explanation: string; // Explication simple pour le client
}
