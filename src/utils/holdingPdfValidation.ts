import type { HoldingISInputs, HoldingISResult } from './holdingSimulation';

export type HoldingPdfSnapshot = { inputs: HoldingISInputs; results: HoldingISResult };

const record = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const numbers = (value: Record<string, unknown>, keys: readonly string[]): boolean =>
  keys.every((key) => typeof value[key] === 'number' && Number.isFinite(value[key]));
const strings = (value: Record<string, unknown>, keys: readonly string[]): boolean =>
  keys.every((key) => typeof value[key] === 'string');
const booleans = (value: Record<string, unknown>, keys: readonly string[]): boolean =>
  keys.every((key) => typeof value[key] === 'boolean');

const inputNumbers = [
  'availableCash', 'preTaxProfit', 'usufruitInvestment', 'usufruitDuration',
  'usufruitKeyPercent', 'grossYieldRate', 'revalorizationRate',
  'feesFixedAmount', 'feesPercentage', 'feesVatRate', 'vatRecoveryRate',
] as const;
const inputBooleans = ['reducedRateEligible', 'feesEnabled', 'feesVatRecoverable'] as const;
const inputStrings = ['companyType', 'feesMode', 'feesTreatment', 'feesVatMode', 'holdingVatProfile'] as const;

const inSet = (value: unknown, candidates: readonly string[]): boolean =>
  typeof value === 'string' && candidates.includes(value);

export const isHoldingISInputs = (value: unknown): value is HoldingISInputs => {
  if (!record(value) || !numbers(value, inputNumbers) || !booleans(value, inputBooleans) ||
      !strings(value, inputStrings)) return false;
  return inSet(value.companyType, ['SAS', 'SARL', 'SCI IS', 'Holding', 'Autre']) &&
    inSet(value.feesMode, ['fixed', 'percentage']) &&
    inSet(value.feesTreatment, ['not-integrated', 'deductible-year1', 'amortized', 'non-deductible']) &&
    inSet(value.feesVatMode, ['HT', 'TTC']) &&
    inSet(value.holdingVatProfile, ['to-qualify', 'animator', 'pure', 'mixed']) &&
    (value.dossierName === undefined || typeof value.dossierName === 'string') &&
    ['reducedRateThreshold', 'reducedTaxRate', 'standardTaxRate', 'alternativeGrossRate']
      .every((key) => value[key] === undefined || (typeof value[key] === 'number' && Number.isFinite(value[key]))) &&
    (value.alternativeType === undefined || inSet(value.alternativeType, ['compte_terme', 'fonds_monetaire', 'personnalise'])) &&
    (value.alternativeRateMode === undefined || inSet(value.alternativeRateMode, ['brut', 'net']));
};

const resultNumbers = [
  'reconstitutedFullProperty', 'annualGrossIncome', 'annualAmortization', 'amortizableBase',
  'feesHT', 'feesVAT', 'feesTTC', 'feesDeductible', 'feesFiscalYear1',
  'effortEconomique', 'effortTresorerie', 'feesEconomicOutflow',
  'annualFiscalResultOperationOnly', 'annualFiscalResultAfterOperation',
  'annualISBeforeOperation', 'annualISAfterOperation', 'annualISImpact',
  'annualNetCashFlow', 'annualNetCashFlowAfterFees', 'cumulativeNetCashFlow',
  'cumulativeNetCashFlowAfterFees', 'netCompanyYieldYear1', 'netCompanyYieldAvgAnnual',
  'netCompanyYieldTotal', 'netCompanyYield', 'economicInitialEffort',
  'economicGainAfterExtinction', 'netEconomicReturnAfterExtinction',
  'annualizedSimpleReturnAfterExtinction', 'cashFlowAverageReturn',
  'gainNetAfterUsufructExtinction', 'economicCumulativeNetCashFlow',
  'yearOneLaunchNetCashFlow', 'recoverableVatAmount', 'nonRecoverableVatAmount',
  'alternativeAnnualNetYield', 'alternativeCumulativeNetIncome',
  'alternativeEndingCapital', 'alternativeTotalValue', 'alternativeComparisonSpread',
] as const;
const projectionNumbers = [
  'year', 'grossIncome', 'amortization', 'amortizableBase', 'feesFiscal', 'feesCash',
  'fiscalResultOperationOnly', 'fiscalResultAfterOperation', 'isBeforeOperation',
  'isAfterOperation', 'isImpact', 'annualOperationalNetCashFlow',
  'yearOneLaunchNetCashFlow', 'netCashFlow', 'netCashFlowAfterFees',
  'cumulativeNetCashFlow', 'cumulativeNetCashFlowAfterFees',
] as const;

export const isHoldingISResult = (value: unknown): value is HoldingISResult => {
  if (!record(value) || !isHoldingISInputs(value.inputs) || !numbers(value, resultNumbers)) return false;
  if (value.isValid !== true || !Array.isArray(value.errors) || value.errors.length !== 0 ||
      !Array.isArray(value.warnings) || !value.warnings.every((x: unknown) => typeof x === 'string')) return false;
  if (value.indicativeIrr !== null &&
      !(typeof value.indicativeIrr === 'number' && Number.isFinite(value.indicativeIrr))) return false;
  if (typeof value.irrMethod !== 'string' || !Array.isArray(value.irrCashFlows) ||
      !value.irrCashFlows.every((x: unknown) => typeof x === 'number' && Number.isFinite(x))) return false;
  if (!Array.isArray(value.cabinetChecks) ||
      !value.cabinetChecks.every((x: unknown) => record(x) &&
        strings(x, ['id', 'title', 'message', 'category']) &&
        inSet(x.level, ['info', 'warning', 'critical']))) return false;
  return Array.isArray(value.projections) && value.projections.length > 0 &&
    value.projections.every((x: unknown) => record(x) && numbers(x, projectionNumbers));
};

/** Strict schema gate: no double casts and no missing-value financial defaults. */
export const isHoldingPdfSnapshot = (value: unknown): value is HoldingPdfSnapshot => {
  if (!record(value) || !isHoldingISInputs(value.inputs) || !isHoldingISResult(value.results)) return false;
  const inputs = value.inputs;
  const resultInputs = value.results.inputs;
  // Compare the stored calculation inputs, not just the two types.
  const savedResultEntries = new Map(Object.entries(resultInputs));
  return Object.entries(inputs).every(([key, value]) =>
    savedResultEntries.has(key) && Object.is(value, savedResultEntries.get(key)));
};
