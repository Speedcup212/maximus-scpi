/* ── Types Dossier Client Expert-Comptable ── */

export interface ExpertSimulationSnapshot {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
  summary: ExpertSimulationSummary;
}

export interface ExpertSimulationSummary {
  companyType: string;
  treasuryAvailable: number;
  totalCashEffort: number;
  residualTreasury: number;
  usufruitAmount: number;
  usufruitDuration: number;
  usufruitKey: number;
  grossDistributionRate: number;
  yearOneNetCashFlow: number;
  yearOneTaxImpact: number;
  averageAnnualNetYield: number;
  cumulativeNetCashFlow: number;
}

export interface ExpertClientDossier {
  id: string;
  name: string;
  companyType: string;
  createdAt: string;
  updatedAt: string;
  simulations: ExpertSimulationSnapshot[];
}
