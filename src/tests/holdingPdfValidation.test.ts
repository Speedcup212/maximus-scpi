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

  it('rejects a finite but manipulated output, not only NaN or missing fields', () => {
    const result = calculateHoldingISProjection(inputs);
    expect(isHoldingPdfSnapshot({
      inputs,
      results: { ...result, annualGrossIncome: result.annualGrossIncome + 500_000 },
    })).toBe(false);
    expect(isHoldingPdfSnapshot({
      inputs,
      results: { ...result, feesHT: result.feesHT + 100 },
    })).toBe(false);
    expect(isHoldingPdfSnapshot({
      inputs,
      results: {
        ...result,
        projections: result.projections.map((year, i) =>
          i === 0 ? { ...year, grossIncome: year.grossIncome + 1 } : year),
      },
    })).toBe(false);
    expect(isHoldingPdfSnapshot({
      inputs,
      results: { ...result, indicativeIrr: 95 },
    })).toBe(false);
  });

  it('rejects a hidden extra assumption in results.inputs, even when visible inputs match', () => {
    const result = calculateHoldingISProjection(inputs);
    expect(isHoldingPdfSnapshot({
      inputs,
      results: { ...result, inputs: { ...result.inputs, standardTaxRate: 17 } },
    })).toBe(false);
  });

  it('rejects simulated cabinet controls and nonmatching warnings', () => {
    const result = calculateHoldingISProjection(inputs);
    expect(isHoldingPdfSnapshot({
      inputs,
      results: { ...result, warnings: ['All financial information is verified'] },
    })).toBe(false);
    expect(isHoldingPdfSnapshot({
      inputs,
      results: { ...result, cabinetChecks: [] },
    })).toBe(false);
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
