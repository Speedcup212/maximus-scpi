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
  siret?: string;
  managerName?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
  simulations: ExpertSimulationSnapshot[];
  notes?: string;
}

export interface ExpertGeneratedReport {
  id: string;
  dossierId: string;
  simulationId?: string;
  userId: string;
  reportType: string;
  fileName: string;
  storagePath: string;
  generatedAt: string;
}

/* ── Vérification cabinet Expert-Comptable ── */

export type ExpertVerificationStatus =
  | 'unverified'
  | 'siret_verified_accounting_activity'
  | 'siret_verified_non_accounting_activity'
  | 'siret_not_found'
  | 'declared_oec_registered';

export interface ExpertVerificationProfile {
  status: ExpertVerificationStatus;
  siret: string;
  siren: string;
  firmName: string;
  address: string;
  postalCode: string;
  city: string;
  apeCode: string;
  apeLabel: string;
  administrativeStatus: 'active' | 'closed' | 'unknown';
  professionalEmail: string;
  oecSelfDeclaration: boolean;
  oecSelfDeclaredAt?: string;
  verifiedAt?: string;
}

export interface SiretApiResponse {
  siret: string;
  siren: string;
  nic: string;
  siege_social: boolean;
  etat_administratif: string;
  personne_morale_attributs?: { raison_sociale: string };
  enseigne?: string;
  adresse: string;
  code_postal: string;
  libelle_commune: string;
  activite_principale: string;
  libelle_activite_principale: string;
  unite_legale?: {
    etat_administratif: string;
    personne_morale_attributs?: { raison_sociale: string };
  };
}
