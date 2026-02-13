import Decimal from 'decimal.js';

export type DistributionPolicy =
  | { type: 'rate'; rate: Decimal }
  | { type: 'cover_annuity' }
  | { type: 'cover_taxes' };

export type DistributionTiming = 'annual' | 'end';

export type ExitPolicy = 'HOLD' | 'SELL_ASSETS_DISTRIBUTE' | 'SELL_SHARES';

export type ExitAssumptions = {
  policy: ExitPolicy;
  distributeAtEnd: boolean;
  distributionRateAtEnd?: Decimal;
};

export type TaxBreakdownAnnual = {
  corporateIS: Decimal;
  corporateISOnCapitalGain: Decimal;
  personalIR: Decimal;
  personalPS: Decimal;
  personalPFU: Decimal;
  totalTaxes: Decimal;
};

export type StrategyInputs = {
  years: number;
  tmiRate: Decimal;
  socialRate: Decimal;
  corporateRate: Decimal;
  corporateReducedRate: Decimal;
  corporateReducedThreshold: Decimal;
  pfuRate: Decimal;
  pvIrRate: Decimal;
  pvPsRate: Decimal;
  foreignTaxCreditRate: Decimal;
  distributionPolicy: DistributionPolicy;
  distributionTiming: DistributionTiming;
  accountingFeesAnnual: Decimal;
  exitFeeRate: Decimal;
  subscriptionFeeRate: Decimal;
  allowReducedIS: boolean;
  exitAssumptions: ExitAssumptions;
  deficitMode: 'simplified' | 'strict';
  deficitGlobalCap: Decimal;
};

export type StrategyYear = {
  year: number;
  revenues: Decimal;
  interest: Decimal;
  principalPaid: Decimal;
  charges: Decimal;
  taxableBase: Decimal;
  ir: Decimal;
  ps: Decimal;
  is: Decimal;
  pfu: Decimal;
  netPersonal: Decimal;
  cumulativeNetPersonal: Decimal;
  cashCompany: Decimal;
  netTotal: Decimal;
  remainingDebt: Decimal;
  partValue: Decimal;
  netWorth: Decimal;
  taxBreakdown: TaxBreakdownAnnual;
};

export type ExitSummary = {
  policy: ExitPolicy;
  corporateISOnExit: Decimal;
  personalPFUOnExit: Decimal;
  personalCapitalGainTax: Decimal;
  netCompanyValue: Decimal;
  netPersonalValue: Decimal;
  note?: string;
};

export type StrategyResult = {
  label: string;
  years: StrategyYear[];
  cashflowNetAvg: Decimal;
  taxesTotal: Decimal;
  taxesPersonalTotal: Decimal;
  taxesCorporateTotal: Decimal;
  taxesBreakdown: {
    personalIR: Decimal;
    personalPS: Decimal;
    personalPFU: Decimal;
    corporateIS: Decimal;
    corporateISOnExit: Decimal;
  };
  netWorthFinal: Decimal;
  exit: ExitSummary;
  irrNet: Decimal | null;
  breakEvenYear: number | null;
};
