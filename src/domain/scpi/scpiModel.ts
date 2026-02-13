import Decimal from 'decimal.js';
import { roundMoney, toDecimal } from '../finance/money';

export type ScpiInputs = {
  investedAmount: Decimal;
  subscriptionFeeRate: Decimal;
  annualYieldRate: Decimal;
  annualRevaluationRate: Decimal;
  annualManagementFeeRate: Decimal;
  annualIndexationRate: Decimal;
  years: number;
};

export type ScpiYear = {
  year: number;
  grossIncome: Decimal;
  fees: Decimal;
  netIncome: Decimal;
  partValue: Decimal;
};

export const buildScpiProjection = (inputs: ScpiInputs): ScpiYear[] => {
  const years: ScpiYear[] = [];
  let partValue = inputs.investedAmount;
  let yieldRate = inputs.annualYieldRate;
  for (let year = 1; year <= inputs.years; year++) {
    const grossIncome = partValue.times(yieldRate);
    const fees = partValue.times(inputs.annualManagementFeeRate);
    const netIncome = grossIncome.minus(fees);
    years.push({
      year,
      grossIncome: roundMoney(grossIncome),
      fees: roundMoney(fees),
      netIncome: roundMoney(netIncome),
      partValue: roundMoney(partValue)
    });
    partValue = partValue.times(toDecimal(1).plus(inputs.annualRevaluationRate));
    if (!inputs.annualIndexationRate.isZero()) {
      yieldRate = yieldRate.times(toDecimal(1).plus(inputs.annualIndexationRate));
    }
  }
  return years;
};
