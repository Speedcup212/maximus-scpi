import { describe, expect, it } from 'vitest';
import { calculateHoldingISProjection } from '../utils/holdingSimulation';
import type { HoldingISInputs } from '../utils/holdingSimulation';
import { isHoldingPdfSnapshot } from '../utils/holdingPdfValidation';

const inputs: HoldingISInputs = {
  companyType: 'SCI IS',
  availableCash: 50_000,
  preTaxProfit: 30_000,
  reducedRateEligible: true,
  usufruitInvestment: 25_000,
  usufruitDuration: 10,
  usufruitKeyPercent: 65,
  grossYieldRate: 5,
  revalorizationRate: 0,
  feesEnabled: false,
  feesMode: 'fixed',
  feesFixedAmount: 0,
  feesPercentage: 0,
  feesTreatment: 'not-integrated',
  feesVatMode: 'HT',
  feesVatRate: 20,
  feesVatRecoverable: false,
  holdingVatProfile: 'pure',
  vatRecoveryRate: 0,
};

describe('Holding IS PDF snapshot structural admission', () => {
  it('accepts a complete and internally consistent engine result', () => {
    const results = calculateHoldingISProjection(inputs);
    expect(results.isValid).toBe(true);
    expect(isHoldingPdfSnapshot({ inputs, results })).toBe(true);
  });

  it('refuses malformed financial fields and mismatched snapshot assumptions', () => {
    const results = calculateHoldingISProjection(inputs);
    expect(isHoldingPdfSnapshot({ inputs, results: { ...results, annualISBeforeOperation: undefined } })).toBe(false);
    expect(isHoldingPdfSnapshot({ inputs, results: { ...results, effortEconomique: NaN } })).toBe(false);
    expect(isHoldingPdfSnapshot({ inputs: { ...inputs, usufruitInvestment: 40_000 }, results })).toBe(false);
    expect(isHoldingPdfSnapshot({ inputs, results: { ...results, projections: [] } })).toBe(false);
    expect(isHoldingPdfSnapshot({ inputs, results: { ...results, isValid: false } })).toBe(false);
  });
});
