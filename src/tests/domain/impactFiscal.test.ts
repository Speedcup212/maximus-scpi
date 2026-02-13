import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import Decimal from 'decimal.js';
import { describe, expect, it } from 'vitest';
import { runImpactFiscalScenario } from '../../domain/strategies/runScenario';
import { buildAnnualSeries, buildTaxesSeries } from '../../ui/simulators/impact-fiscal/chartSeries';

const serialize = (value: unknown): unknown => {
  if (value instanceof Decimal) {
    return value.toFixed(2);
  }
  if (Array.isArray(value)) {
    return value.map(serialize);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, val]) => [key, serialize(val)])
    );
  }
  return value;
};

const loadGolden = (name: string) => {
  const file = resolve('src/tests/golden', `${name}.json`);
  return JSON.parse(readFileSync(file, 'utf-8'));
};

describe('impact fiscal scenarios', () => {
  it('case1: 100k sans credit, TMI 30, 10 ans', () => {
    const inputs = {
      taxYear: 2024,
      tmiRate: 0.3,
      socialRate: 0.172,
      pfuRate: 0.314,
      allowReducedIS: true,
      foreignTaxCreditRate: 0,
      investedAmount: 100000,
      subscriptionFeeRate: 0.1,
      exitFeeRate: 0.03,
      annualYieldRate: 0.05,
      annualRevaluationRate: 0.01,
      annualManagementFeeRate: 0,
      annualIndexationRate: 0,
      years: 10,
      loanAmount: 0,
      loanRate: 0.02,
      loanYears: 10,
      loanInsuranceRate: 0.002,
      equity: 100000,
      distributionPolicy: { type: 'rate', rate: 0 },
      distributionTiming: 'annual',
      accountingFeesAnnual: 1200,
      exitPolicy: 'SELL_ASSETS_DISTRIBUTE',
      exitDistributeAtEnd: true,
      exitDistributionRateAtEnd: 1,
      deficitMode: 'simplified',
      deficitGlobalCap: 10700
    } as const;
    const result = serialize(runImpactFiscalScenario(inputs));
    expect(result).toEqual(loadGolden('case1'));
  });

  it('case2: 100k credit 100%, TMI 41, 15 ans, IS distribution 0%', () => {
    const inputs = {
      taxYear: 2024,
      tmiRate: 0.41,
      socialRate: 0.172,
      pfuRate: 0.314,
      allowReducedIS: true,
      foreignTaxCreditRate: 0,
      investedAmount: 100000,
      subscriptionFeeRate: 0.1,
      exitFeeRate: 0.03,
      annualYieldRate: 0.05,
      annualRevaluationRate: 0.01,
      annualManagementFeeRate: 0,
      annualIndexationRate: 0,
      years: 15,
      loanAmount: 100000,
      loanRate: 0.03,
      loanYears: 15,
      loanInsuranceRate: 0.003,
      equity: 10000,
      distributionPolicy: { type: 'rate', rate: 0 },
      distributionTiming: 'annual',
      accountingFeesAnnual: 1500,
      exitPolicy: 'SELL_ASSETS_DISTRIBUTE',
      exitDistributeAtEnd: true,
      exitDistributionRateAtEnd: 1,
      deficitMode: 'simplified',
      deficitGlobalCap: 10700
    } as const;
    const result = serialize(runImpactFiscalScenario(inputs));
    expect(result).toEqual(loadGolden('case2'));
  });

  it('case3: 200k credit partiel, TMI 45, holding distribution 100%, 20 ans', () => {
    const inputs = {
      taxYear: 2024,
      tmiRate: 0.45,
      socialRate: 0.172,
      pfuRate: 0.314,
      allowReducedIS: true,
      foreignTaxCreditRate: 0,
      investedAmount: 200000,
      subscriptionFeeRate: 0.1,
      exitFeeRate: 0.03,
      annualYieldRate: 0.05,
      annualRevaluationRate: 0.01,
      annualManagementFeeRate: 0,
      annualIndexationRate: 0,
      years: 20,
      loanAmount: 140000,
      loanRate: 0.03,
      loanYears: 20,
      loanInsuranceRate: 0.003,
      equity: 60000,
      distributionPolicy: { type: 'rate', rate: 1 },
      distributionTiming: 'annual',
      accountingFeesAnnual: 1800,
      exitPolicy: 'SELL_ASSETS_DISTRIBUTE',
      exitDistributeAtEnd: true,
      exitDistributionRateAtEnd: 1,
      deficitMode: 'simplified',
      deficitGlobalCap: 10700
    } as const;
    const result = serialize(runImpactFiscalScenario(inputs));
    expect(result).toEqual(loadGolden('case3'));
  });

  it('SCI IS: HOLD vs SELL_ASSETS_DISTRIBUTE affects PFU final', () => {
    const baseInputs = {
      taxYear: 2024,
      tmiRate: 0.3,
      socialRate: 0.172,
      pfuRate: 0.314,
      allowReducedIS: true,
      foreignTaxCreditRate: 0,
      investedAmount: 100000,
      subscriptionFeeRate: 0.1,
      exitFeeRate: 0.03,
      annualYieldRate: 0.05,
      annualRevaluationRate: 0.01,
      annualManagementFeeRate: 0,
      annualIndexationRate: 0,
      years: 10,
      loanAmount: 0,
      loanRate: 0.02,
      loanYears: 10,
      loanInsuranceRate: 0.002,
      equity: 100000,
      distributionPolicy: { type: 'rate', rate: 0 },
      distributionTiming: 'annual',
      accountingFeesAnnual: 1200,
      deficitMode: 'simplified',
      deficitGlobalCap: 10700
    } as const;

    const hold = runImpactFiscalScenario({
      ...baseInputs,
      exitPolicy: 'HOLD',
      exitDistributeAtEnd: false
    });
    const sell = runImpactFiscalScenario({
      ...baseInputs,
      exitPolicy: 'SELL_ASSETS_DISTRIBUTE',
      exitDistributeAtEnd: true,
      exitDistributionRateAtEnd: 1
    });
    expect(Number(hold.sciIS.exit.personalPFUOnExit.toFixed(2))).toBe(0);
    expect(Number(sell.sciIS.exit.personalPFUOnExit.toFixed(2))).toBeGreaterThan(0);
  });

  it('Holding IS: distribution 0% keeps net perso annuel at 0', () => {
    const result = runImpactFiscalScenario({
      taxYear: 2024,
      tmiRate: 0.41,
      socialRate: 0.172,
      pfuRate: 0.314,
      allowReducedIS: true,
      foreignTaxCreditRate: 0,
      investedAmount: 100000,
      subscriptionFeeRate: 0.1,
      exitFeeRate: 0.03,
      annualYieldRate: 0.05,
      annualRevaluationRate: 0.01,
      annualManagementFeeRate: 0,
      annualIndexationRate: 0,
      years: 10,
      loanAmount: 0,
      loanRate: 0.02,
      loanYears: 10,
      loanInsuranceRate: 0.002,
      equity: 100000,
      distributionPolicy: { type: 'rate', rate: 0 },
      distributionTiming: 'annual',
      accountingFeesAnnual: 1500,
      exitPolicy: 'HOLD',
      exitDistributeAtEnd: false,
      deficitMode: 'simplified',
      deficitGlobalCap: 10700
    });
    const allZero = result.holdingIS.years.every(y => Number(y.netPersonal.toFixed(2)) === 0);
    expect(allZero).toBe(true);
  });

  it('Valeur nette finale == dernière ligne tableau pour Direct IR', () => {
    const result = runImpactFiscalScenario({
      taxYear: 2024,
      tmiRate: 0.3,
      socialRate: 0.172,
      pfuRate: 0.314,
      allowReducedIS: true,
      foreignTaxCreditRate: 0,
      investedAmount: 100000,
      subscriptionFeeRate: 0.1,
      exitFeeRate: 0.03,
      annualYieldRate: 0.05,
      annualRevaluationRate: 0.01,
      annualManagementFeeRate: 0,
      annualIndexationRate: 0,
      years: 10,
      loanAmount: 0,
      loanRate: 0.02,
      loanYears: 10,
      loanInsuranceRate: 0.002,
      equity: 100000,
      distributionPolicy: { type: 'rate', rate: 0 },
      distributionTiming: 'annual',
      accountingFeesAnnual: 1200,
      exitPolicy: 'SELL_ASSETS_DISTRIBUTE',
      exitDistributeAtEnd: true,
      exitDistributionRateAtEnd: 1,
      deficitMode: 'simplified',
      deficitGlobalCap: 10700
    });
    const last = result.directIR.years[result.directIR.years.length - 1];
    expect(Number(result.directIR.netWorthFinal.toFixed(2))).toBe(Number(last.netWorth.toFixed(2)));
  });

  it('Chart series always include 4 structures', () => {
    const result = runImpactFiscalScenario({
      taxYear: 2024,
      tmiRate: 0.3,
      socialRate: 0.172,
      pfuRate: 0.314,
      allowReducedIS: true,
      foreignTaxCreditRate: 0,
      investedAmount: 100000,
      subscriptionFeeRate: 0.1,
      exitFeeRate: 0.03,
      annualYieldRate: 0.05,
      annualRevaluationRate: 0.01,
      annualManagementFeeRate: 0,
      annualIndexationRate: 0,
      years: 10,
      loanAmount: 0,
      loanRate: 0.02,
      loanYears: 10,
      loanInsuranceRate: 0.002,
      equity: 100000,
      distributionPolicy: { type: 'rate', rate: 0 },
      distributionTiming: 'annual',
      accountingFeesAnnual: 1200,
      exitPolicy: 'HOLD',
      exitDistributeAtEnd: false,
      deficitMode: 'simplified',
      deficitGlobalCap: 10700
    });
    const annual = buildAnnualSeries(result, 'personal');
    expect(annual[0]).toHaveProperty('directIR');
    expect(annual[0]).toHaveProperty('sciIR');
    expect(annual[0]).toHaveProperty('sciIS');
    expect(annual[0]).toHaveProperty('holdingIS');
    const taxes = buildTaxesSeries(result);
    expect(taxes.map(t => t.label)).toEqual(['Direct IR', 'SCI IR', 'SCI IS', 'Holding IS']);
  });
});
