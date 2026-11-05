/**
 * Legacy portfolio UI shape. This file only specifies types already consumed by
 * existing components; it does not assign a risk category, generate suitability
 * advice, or certify any SCPI financial metric.
 *
 * The actual investment profile must be determined from validated client inputs.
 */
export interface RiskProfile {
  name: string;
  description: string;
  icon: string;
  color: string;
  riskLevel: number;
  targetYield: {
    min: number;
    max: number;
  };
  minDiversification: number;
  maxSingleAllocation: number;
  preferredSectors: string[];
  preferredGeography: string[];
  characteristics: {
    horizon: string;
    objective: string;
    tolerance: string;
  };
}

export interface ClientInvestmentPreferences {
  isr: boolean;
  european: boolean;
  noFees: boolean;
  sectors: string[];
  excludedSectors: string[];
}

export interface ClientProfile {
  name: string;
  age: number;
  investmentAmount: number;
  investmentHorizon: number;
  tmi?: number;
  riskProfile: RiskProfile;
  preferences: ClientInvestmentPreferences;
}
