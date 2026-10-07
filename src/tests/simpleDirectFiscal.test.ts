import { describe, expect, it } from 'vitest';
import {
  FRANCE_SOCIAL_CONTRIBUTION_RATE,
  estimateSimpleScpiIncomeTax,
} from '../domain/scpi/simpleDirectFiscal';

describe('estimateSimpleScpiIncomeTax', () => {
  it('models French direct SCPI income with TMI + 17.2% social contributions', () => {
    const result = estimateSimpleScpiIncomeTax({
      grossIncome: 5000,
      origin: 'france',
      tmiRate: 0.30,
    });

    expect(FRANCE_SOCIAL_CONTRIBUTION_RATE).toBe(0.172);
    expect(result.available).toBe(true);
    expect(result.ir).toBeCloseTo(1500, 8);
    expect(result.socialContributions).toBeCloseTo(860, 8);
    expect(result.totalTax).toBeCloseTo(2360, 8);
    expect(result.netIncome).toBeCloseTo(2640, 8);
    expect(result.effectiveTaxRate).toBeCloseTo(0.472, 8);
  });

  it('uses a simplified TMI-only estimate for international income', () => {
    const result = estimateSimpleScpiIncomeTax({
      grossIncome: 5000,
      origin: 'international',
      tmiRate: 0.30,
    });

    expect(result.available).toBe(true);
    expect(result.ir).toBeCloseTo(1500, 8);
    expect(result.socialContributions).toBe(0);
    expect(result.totalTax).toBeCloseTo(1500, 8);
    expect(result.netIncome).toBeCloseTo(3500, 8);
    expect(result.effectiveTaxRate).toBeCloseTo(0.30, 8);
  });

  it('uses an explicitly supplied effective treaty tax rate for foreign income', () => {
    const result = estimateSimpleScpiIncomeTax({
      grossIncome: 5000,
      origin: 'international',
      tmiRate: 0.30,
      foreignEffectiveTaxRate: 0.20,
    });

    expect(result.available).toBe(true);
    expect(result.ir).toBeCloseTo(1000, 8);
    expect(result.socialContributions).toBe(0);
    expect(result.totalTax).toBeCloseTo(1000, 8);
    expect(result.netIncome).toBeCloseTo(4000, 8);
    expect(result.effectiveTaxRate).toBeCloseTo(0.20, 8);
  });

  it('rejects impossible tax rates', () => {
    expect(() =>
      estimateSimpleScpiIncomeTax({
        grossIncome: 5000,
        origin: 'international',
        tmiRate: 0.30,
        foreignEffectiveTaxRate: 1.2,
      })
    ).toThrow();
  });
});
