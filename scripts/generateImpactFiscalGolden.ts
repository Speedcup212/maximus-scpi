import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import Decimal from 'decimal.js';
import { runImpactFiscalScenario } from '../src/domain/strategies/runScenario';

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

const cases = [
  {
    name: 'case1',
    inputs: {
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
    }
  },
  {
    name: 'case2',
    inputs: {
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
    }
  },
  {
    name: 'case3',
    inputs: {
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
    }
  }
];

for (const entry of cases) {
  const result = runImpactFiscalScenario(entry.inputs);
  const payload = serialize(result);
  const outPath = resolve('src/tests/golden', `${entry.name}.json`);
  writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf-8');
  console.log(`Wrote ${outPath}`);
}
