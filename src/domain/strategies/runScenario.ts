import Decimal from 'decimal.js';
import { buildLoanSchedule } from '../finance/amortization';
import { roundMoney, toDecimal, max } from '../finance/money';
import { buildScpiProjection } from '../scpi/scpiModel';
import { taxConfigByYear } from '../tax/taxConfig';
import { runDirectIR } from './directIR';
import { runSciIR } from './sciIR';
import { runSciIS } from './sciIS';
import { runHoldingIS } from './holdingIS';
import { StrategyInputs, StrategyResult } from './types';

export type ImpactFiscalInputs = {
  taxYear: number;
  tmiRate: number;
  socialRate: number;
  pfuRate: number;
  allowReducedIS: boolean;
  foreignTaxCreditRate: number;
  investedAmount: number;
  subscriptionFeeRate: number;
  exitFeeRate: number;
  annualYieldRate: number;
  annualRevaluationRate: number;
  annualManagementFeeRate: number;
  annualIndexationRate: number;
  years: number;
  loanAmount: number;
  loanRate: number;
  loanYears: number;
  loanInsuranceRate: number;
  equity: number;
  distributionPolicy:
    | { type: 'rate'; rate: number }
    | { type: 'cover_annuity' }
    | { type: 'cover_taxes' };
  distributionTiming: 'annual' | 'end';
  accountingFeesAnnual: number;
  exitPolicy: 'HOLD' | 'SELL_ASSETS_DISTRIBUTE' | 'SELL_SHARES';
  exitDistributeAtEnd: boolean;
  exitDistributionRateAtEnd?: number;
  deficitMode: 'simplified' | 'strict';
  deficitGlobalCap: number;
};

export type ImpactFiscalResult = {
  inputs: ImpactFiscalInputs;
  directIR: StrategyResult;
  sciIR: StrategyResult;
  sciIS: StrategyResult;
  holdingIS: StrategyResult;
};

const toStrategyInputs = (inputs: ImpactFiscalInputs): StrategyInputs => {
  const config = taxConfigByYear[inputs.taxYear];
  return {
    years: inputs.years,
    tmiRate: toDecimal(inputs.tmiRate),
    socialRate: toDecimal(inputs.socialRate),
    corporateRate: config.corporateRate,
    corporateReducedRate: config.corporateReducedRate,
    corporateReducedThreshold: config.corporateReducedThreshold,
    pfuRate: toDecimal(inputs.pfuRate),
    pvIrRate: config.pvIrRate,
    pvPsRate: config.pvPsRate,
    foreignTaxCreditRate: toDecimal(inputs.foreignTaxCreditRate),
    distributionPolicy:
      inputs.distributionPolicy.type === 'rate'
        ? { type: 'rate', rate: toDecimal(inputs.distributionPolicy.rate) }
        : inputs.distributionPolicy,
    distributionTiming: inputs.distributionTiming,
    accountingFeesAnnual: toDecimal(inputs.accountingFeesAnnual),
    exitFeeRate: toDecimal(inputs.exitFeeRate),
    subscriptionFeeRate: toDecimal(inputs.subscriptionFeeRate),
    allowReducedIS: inputs.allowReducedIS,
    exitAssumptions: {
      policy: inputs.exitPolicy,
      distributeAtEnd: inputs.exitDistributeAtEnd,
      distributionRateAtEnd: inputs.exitDistributionRateAtEnd !== undefined
        ? toDecimal(inputs.exitDistributionRateAtEnd)
        : undefined
    },
    deficitMode: inputs.deficitMode,
    deficitGlobalCap: toDecimal(inputs.deficitGlobalCap)
  };
};

export const runImpactFiscalScenario = (inputs: ImpactFiscalInputs): ImpactFiscalResult => {
  const strategyInputs = toStrategyInputs(inputs);

  const scpiProjection = buildScpiProjection({
    investedAmount: toDecimal(inputs.investedAmount),
    subscriptionFeeRate: toDecimal(inputs.subscriptionFeeRate),
    annualYieldRate: toDecimal(inputs.annualYieldRate),
    annualRevaluationRate: toDecimal(inputs.annualRevaluationRate),
    annualManagementFeeRate: toDecimal(inputs.annualManagementFeeRate),
    annualIndexationRate: toDecimal(inputs.annualIndexationRate),
    years: inputs.years
  });

  const baseLoanSchedule =
    inputs.loanAmount > 0
      ? buildLoanSchedule({
          principal: toDecimal(inputs.loanAmount),
          annualRate: toDecimal(inputs.loanRate),
          years: inputs.loanYears,
          insuranceRateAnnual: toDecimal(inputs.loanInsuranceRate)
        })
      : [];
  const loanSchedule = Array.from({ length: inputs.years }, (_, idx) => {
    const existing = baseLoanSchedule[idx];
    if (existing) return existing;
    return {
      year: idx + 1,
      interest: toDecimal(0),
      principalPaid: toDecimal(0),
      insurance: toDecimal(0),
      remaining: toDecimal(0)
    };
  });

  const revenues = scpiProjection.map(p => p.grossIncome);
  const fees = scpiProjection.map(p => p.fees);
  const loanInterest = loanSchedule.map(l => l.interest);
  const loanPrincipal = loanSchedule.map(l => l.principalPaid);
  const loanInsurance = loanSchedule.map(l => l.insurance);
  const remainingDebt = loanSchedule.map(l => l.remaining);
  const partValues = scpiProjection.map(p => p.partValue);

  const investedAmount = toDecimal(inputs.investedAmount)
    .plus(toDecimal(inputs.subscriptionFeeRate).times(inputs.investedAmount));
  const equity = inputs.equity > 0
    ? toDecimal(inputs.equity)
    : max(toDecimal(0), investedAmount.minus(toDecimal(inputs.loanAmount)));
  const lastPartValue = partValues[partValues.length - 1];
  const exitValue = roundMoney(lastPartValue.times(toDecimal(1).minus(toDecimal(inputs.exitFeeRate))));

  const directIR = runDirectIR({
    label: 'Direct IR',
    inputs: strategyInputs,
    revenues,
    fees,
    loanInterest,
    loanPrincipal,
    loanInsurance,
    remainingDebt,
    partValues,
    investedAmount,
    initialOutflow: equity,
    exitValue,
    years: inputs.years
  });

  const sciIR = runSciIR({
    label: 'SCI IR',
    inputs: strategyInputs,
    revenues,
    fees,
    loanInterest,
    loanPrincipal,
    loanInsurance,
    remainingDebt,
    partValues,
    investedAmount,
    initialOutflow: equity,
    exitValue,
    years: inputs.years
  });

  const sciIS = runSciIS({
    label: 'SCI IS',
    inputs: strategyInputs,
    revenues,
    fees,
    loanInterest,
    loanPrincipal,
    loanInsurance,
    remainingDebt,
    partValues,
    investedAmount,
    initialOutflow: equity,
    exitValue,
    years: inputs.years
  });

  const holdingIS = runHoldingIS({
    label: 'Holding IS',
    inputs: strategyInputs,
    revenues,
    fees,
    loanInterest,
    loanPrincipal,
    loanInsurance,
    remainingDebt,
    partValues,
    investedAmount,
    initialOutflow: equity,
    exitValue,
    years: inputs.years
  });

  return {
    inputs,
    directIR,
    sciIR,
    sciIS,
    holdingIS
  };
};
