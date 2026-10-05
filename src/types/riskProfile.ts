export interface RiskProfile {
  name: string;
  description?: string;
  riskLevel: number;
  targetYield: {
    min: number;
    max: number;
  };
  preferredSectors: string[];
  preferredGeography: string[];
  minDiversification: number;
  maxSingleAllocation: number;
  color: string;
  icon: string;
  characteristics: {
    horizon: string;
    objective: string;
    tolerance: string;
  };
}

export interface ClientPreferences {
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
  riskProfile: RiskProfile;
  preferences: ClientPreferences;
}
