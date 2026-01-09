export interface ScpiRepartition {
  name: string;
  value: number;
}

export interface Scpi {
  id: number;
  name: string;
  sector: 'bureaux' | 'commerces' | 'residentiel' | 'sante' | 'logistique' | 'hotellerie' | 'diversifie';
  geography: 'france' | 'europe' | 'international';
  yield: number;
  capitalization: number;
  tof: number;
  price: number;
  discount: number;
  fees: number;
  isr: boolean;
  european: boolean;
  company: string;
  creation: number;
  minInvest: number;
  repartitionSector?: ScpiRepartition[];
  repartitionGeo?: ScpiRepartition[];
  allocation?: number;
  rating?: number;
  isRecommended?: boolean;
  debt?: number; // Ratio d'endettement en pourcentage
}

export type QuickFilterType = 'tous' | 'europeennes' | 'francaises' | 'isr' | 'high-yield';

export type ObjectiveType = 'revenus' | 'capitaliser' | 'diversifier' | 'fiscalite';

export type PurchaseMethod = 'pleine-propriete' | 'nue-propriete' | 'usufruit' | 'credit';

export interface PurchaseMethodInfo {
  id: PurchaseMethod;
  name: string;
  description: string;
  icon: string;
  fiscalAdvantage: string;
  minInvestment: number;
  targetTmi: number[];
  yieldMultiplier: number;
  taxOptimization: number;
}

export interface InvestmentObjective {
  id: ObjectiveType;
  name: string;
  description: string;
  icon: string;
  color: string;
  criteria: {
    minYield?: number;
    maxRisk?: number;
    preferredSectors?: string[];
    preferredGeography?: string[];
    maxSingleAllocation?: number;
  };
}

export interface Filters {
  sector: string;
  geography: string;
  minYield: number;
  minCapitalization: number;
}