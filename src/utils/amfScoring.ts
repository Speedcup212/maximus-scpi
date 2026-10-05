import type { Scpi } from '../types/scpi';

export interface AMFInvestorProfile {
  icon: string;
  color: string;
  name: string;
  description: string;
  characteristics: {
    horizon: string;
    objective: string;
    tolerance: string;
  };
}

export interface AMFESGProfile {
  icon: string;
  color: string;
  name: string;
  description: string;
  impactScore: number;
}

export interface AMFRecommendation {
  scpi: Scpi;
  allocation?: number;
}

export interface AMFProfileResult {
  profile: AMFInvestorProfile;
  esgProfile: AMFESGProfile;
  recommendations: AMFRecommendation[];
  simulation: {
    investmentAmount: number;
    annualIncome: number;
  };
}
