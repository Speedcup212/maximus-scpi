/* ── Types Dossier Client Expert-Comptable ── */

export interface ExpertSimulationSnapshot {
  id: string;
  createdAt: string;
  updatedAt: string;
  label: string;
  inputs: ExpertHoldingSimulationInputs;
  results: ExpertHoldingSimulationResults;
  summary: ExpertSimulationSummary;
}

export interface ExpertHoldingSimulationInputs {
  dossierName: string;
  companyType: string;
  availableCash: number;
  taxableResultBefore: number;
  useReducedCorporateTaxRate: boolean;
  usufruitAmount: number;
  usufruitDuration: number;
  usufruitKey: number;
  grossDistributionRate: number;
  incomeRevaluationRate: number;
  missionFeesEnabled: boolean;
  missionFeesAmount: number;
  missionFeesInputMode: 'fixed' | 'percent';
  missionFeesTaxMode: 'ht' | 'ttc';
  vatRate: number;
  vatRecoverable: boolean;
  missionFeesAccountingTreatment: string;
}

export interface ExpertHoldingSimulationResults {
  fullOwnershipValue: number;
  annualGrossIncome: number;
  annualAmortization: number;
  yearOneTaxableOperationResult: number;
  taxableResultAfterOperation: number;
  corporateTaxWithoutOperation: number;
  corporateTaxWithOperation: number;
  corporateTaxImpact: number;
  yearOneNetCashFlow: number;
  cumulativeNetCashFlow: number;
  averageAnnualNetReturn: number;
  residualCash: number;
  initialEffort: number;
  [key: string]: unknown; // compatibilité avec comparatif, projections, etc.
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
  clientName: string;
  companyType: string;
  createdAt: string;
  updatedAt: string;
  simulations: ExpertSimulationSnapshot[];
  notes?: string;
}
