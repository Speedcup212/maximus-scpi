import Decimal from 'decimal.js';
import { roundMoney, toDecimal } from './money';

export type LoanInputs = {
  principal: Decimal;
  annualRate: Decimal;
  years: number;
  insuranceRateAnnual: Decimal;
};

export type LoanYear = {
  year: number;
  interest: Decimal;
  principalPaid: Decimal;
  insurance: Decimal;
  remaining: Decimal;
};

export const buildLoanSchedule = (inputs: LoanInputs): LoanYear[] => {
  const monthlyRate = inputs.annualRate.div(12);
  const months = inputs.years * 12;
  const principal = inputs.principal;
  const insuranceMonthly = inputs.principal.times(inputs.insuranceRateAnnual).div(12);

  const payment = monthlyRate.isZero()
    ? principal.div(months)
    : principal.times(monthlyRate).div(
        toDecimal(1).minus(toDecimal(1).plus(monthlyRate).pow(-months))
      );

  let remaining = principal;
  const years: LoanYear[] = [];
  for (let y = 1; y <= inputs.years; y++) {
    let interestYear = toDecimal(0);
    let principalYear = toDecimal(0);
    let insuranceYear = toDecimal(0);
    for (let m = 1; m <= 12; m++) {
      const interest = remaining.times(monthlyRate);
      const principalPart = payment.minus(interest);
      remaining = Decimal.max(toDecimal(0), remaining.minus(principalPart));
      interestYear = interestYear.plus(interest);
      principalYear = principalYear.plus(principalPart);
      insuranceYear = insuranceYear.plus(insuranceMonthly);
    }
    years.push({
      year: y,
      interest: roundMoney(interestYear),
      principalPaid: roundMoney(principalYear),
      insurance: roundMoney(insuranceYear),
      remaining: roundMoney(remaining)
    });
  }
  return years;
};
