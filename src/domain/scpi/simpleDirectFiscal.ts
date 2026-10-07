export const FRANCE_SOCIAL_CONTRIBUTION_RATE = 0.172;

export type ScpiIncomeOrigin = 'france' | 'international';

export type SimpleScpiFiscalInput = {
  grossIncome: number;
  origin: ScpiIncomeOrigin;
  tmiRate: number;
  foreignEffectiveTaxRate?: number | null;
};

export type SimpleScpiFiscalEstimate = {
  available: boolean;
  ir: number | null;
  socialContributions: number | null;
  totalTax: number | null;
  netIncome: number | null;
  effectiveTaxRate: number | null;
};

/**
 * Pedagogical estimate for SCPI held directly by a French tax resident.
 *
 * France:
 * - models ordinary property income at the marginal IR rate supplied by the user;
 * - adds 17.2% social contributions.
 *
 * International:
 * - never invents a treaty rate;
 * - returns no net estimate until the caller supplies an effective tax rate
 *   derived from the relevant tax treaty / investor situation.
 *
 * This intentionally does not model financial income, capital gains, micro-foncier,
 * deductible expenses, loan interest, CSG deductibility or treaty mechanics.
 */
export function estimateSimpleScpiIncomeTax(input: SimpleScpiFiscalInput): SimpleScpiFiscalEstimate {
  const { grossIncome, origin, tmiRate, foreignEffectiveTaxRate = null } = input;

  if (!Number.isFinite(grossIncome) || grossIncome < 0) {
    throw new Error('grossIncome must be a finite non-negative number');
  }
  if (!Number.isFinite(tmiRate) || tmiRate < 0 || tmiRate > 1) {
    throw new Error('tmiRate must be between 0 and 1');
  }

  if (origin === 'france') {
    const ir = grossIncome * tmiRate;
    const socialContributions = grossIncome * FRANCE_SOCIAL_CONTRIBUTION_RATE;
    const totalTax = ir + socialContributions;
    return {
      available: true,
      ir,
      socialContributions,
      totalTax,
      netIncome: grossIncome - totalTax,
      effectiveTaxRate: grossIncome > 0 ? totalTax / grossIncome : 0,
    };
  }

  if (foreignEffectiveTaxRate === null || foreignEffectiveTaxRate === undefined) {
    return {
      available: false,
      ir: null,
      socialContributions: null,
      totalTax: null,
      netIncome: null,
      effectiveTaxRate: null,
    };
  }

  if (!Number.isFinite(foreignEffectiveTaxRate) || foreignEffectiveTaxRate < 0 || foreignEffectiveTaxRate > 1) {
    throw new Error('foreignEffectiveTaxRate must be between 0 and 1');
  }

  const totalTax = grossIncome * foreignEffectiveTaxRate;
  return {
    available: true,
    ir: null,
    socialContributions: null,
    totalTax,
    netIncome: grossIncome - totalTax,
    effectiveTaxRate: foreignEffectiveTaxRate,
  };
}
