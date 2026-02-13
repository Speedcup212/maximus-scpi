import Decimal from 'decimal.js';
import { StrategyInputs, StrategyResult, StrategyYear } from './types';
import { computePvTaxesIR } from './utils';
import { roundMoney, toDecimal, max } from '../finance/money';
import { computeIRR } from '../finance/irr';

export type SciIrContext = {
  label: string;
  inputs: StrategyInputs;
  revenues: Decimal[];
  fees: Decimal[];
  loanInterest: Decimal[];
  loanPrincipal: Decimal[];
  loanInsurance: Decimal[];
  remainingDebt: Decimal[];
  partValues: Decimal[];
  investedAmount: Decimal;
  exitValue: Decimal;
  initialOutflow: Decimal;
  years: number;
};

export const runSciIR = (ctx: SciIrContext): StrategyResult => {
  const { inputs } = ctx;
  const years: StrategyYear[] = [];
  let deficitCarry = toDecimal(0);
  let deficitInterest = toDecimal(0);
  let cumulativeNetPersonal = toDecimal(0);

  for (let year = 1; year <= ctx.years; year++) {
    const income = ctx.revenues[year - 1];
    const charges = ctx.fees[year - 1].plus(inputs.accountingFeesAnnual);
    const interest = ctx.loanInterest[year - 1];
    const insurance = ctx.loanInsurance[year - 1];

    let taxable = income.minus(charges).minus(interest).minus(insurance);
    if (inputs.deficitMode === 'simplified') {
      taxable = taxable.minus(deficitCarry);
      if (taxable.lt(0)) {
        deficitCarry = taxable.abs();
        taxable = toDecimal(0);
      } else {
        deficitCarry = toDecimal(0);
      }
    } else {
      const nonInterest = income.minus(charges).minus(insurance);
      if (nonInterest.lt(0)) {
        const absorb = Decimal.min(nonInterest.abs(), inputs.deficitGlobalCap);
        deficitCarry = deficitCarry.plus(absorb);
      }
      deficitInterest = deficitInterest.plus(max(toDecimal(0), interest.minus(income)));
      taxable = taxable.minus(deficitCarry).minus(deficitInterest);
      if (taxable.lt(0)) {
        deficitCarry = taxable.abs();
        taxable = toDecimal(0);
      } else {
        deficitCarry = toDecimal(0);
      }
    }

    const irGross = roundMoney(taxable.times(inputs.tmiRate));
    const foreignCredit = roundMoney(income.times(inputs.foreignTaxCreditRate));
    const ir = roundMoney(Decimal.max(toDecimal(0), irGross.minus(foreignCredit)));
    const ps = roundMoney(taxable.times(inputs.socialRate));
    const taxTotal = ir.plus(ps);
    const netPersonal = roundMoney(income.minus(charges).minus(interest).minus(insurance).minus(taxTotal));
    const cashCompany = toDecimal(0);
    const netTotal = netPersonal.plus(cashCompany);
    cumulativeNetPersonal = roundMoney(cumulativeNetPersonal.plus(netPersonal));

    years.push({
      year,
      revenues: roundMoney(income),
      interest: roundMoney(interest),
      principalPaid: roundMoney(ctx.loanPrincipal[year - 1]),
      charges: roundMoney(charges.plus(insurance)),
      taxableBase: roundMoney(taxable),
      ir,
      ps,
      is: toDecimal(0),
      pfu: toDecimal(0),
      netPersonal,
      cumulativeNetPersonal,
      cashCompany,
      netTotal,
      remainingDebt: ctx.remainingDebt[year - 1],
      partValue: ctx.partValues[year - 1],
      netWorth: roundMoney(ctx.partValues[year - 1].plus(cashCompany).plus(cumulativeNetPersonal).minus(ctx.remainingDebt[year - 1])),
      taxBreakdown: {
        corporateIS: toDecimal(0),
        corporateISOnCapitalGain: toDecimal(0),
        personalIR: ir,
        personalPS: ps,
        personalPFU: toDecimal(0),
        totalTaxes: roundMoney(taxTotal)
      }
    });
  }

  const plusValue = ctx.exitValue.minus(ctx.investedAmount);
  const pvTaxes = computePvTaxesIR(plusValue, ctx.years, inputs.pvIrRate, inputs.pvPsRate);
  const exitNet = ctx.exitValue.minus(pvTaxes.ir).minus(pvTaxes.ps).minus(ctx.remainingDebt[ctx.years - 1]);

  const flows = [
    ctx.initialOutflow.neg(),
    ...years.map(y => y.netPersonal),
    roundMoney(exitNet)
  ];
  const irr = computeIRR(flows);

  const cashflowNetAvg = roundMoney(
    years.reduce((acc, y) => acc.plus(y.netPersonal), toDecimal(0)).div(ctx.years)
  );
  const personalIRTotal = roundMoney(years.reduce((acc, y) => acc.plus(y.ir), toDecimal(0)).plus(pvTaxes.ir));
  const personalPSTotal = roundMoney(years.reduce((acc, y) => acc.plus(y.ps), toDecimal(0)).plus(pvTaxes.ps));
  const personalPFUTotal = toDecimal(0);
  const corporateISTotal = toDecimal(0);
  const corporateISOnExit = toDecimal(0);
  const taxesPersonalTotal = roundMoney(personalIRTotal.plus(personalPSTotal).plus(personalPFUTotal));
  const taxesCorporateTotal = roundMoney(corporateISTotal.plus(corporateISOnExit));
  const taxesTotal = roundMoney(taxesPersonalTotal.plus(taxesCorporateTotal));
  const netWorthFinal = years.length > 0 ? years[years.length - 1].netWorth : roundMoney(exitNet);

  return {
    label: ctx.label,
    years,
    cashflowNetAvg,
    taxesTotal,
    taxesPersonalTotal,
    taxesCorporateTotal,
    taxesBreakdown: {
      personalIR: personalIRTotal,
      personalPS: personalPSTotal,
      personalPFU: personalPFUTotal,
      corporateIS: corporateISTotal,
      corporateISOnExit
    },
    netWorthFinal,
    exit: {
      policy: 'SELL_ASSETS_DISTRIBUTE',
      corporateISOnExit: toDecimal(0),
      personalPFUOnExit: toDecimal(0),
      personalCapitalGainTax: roundMoney(pvTaxes.ir.plus(pvTaxes.ps)),
      netCompanyValue: toDecimal(0),
      netPersonalValue: netWorthFinal
    },
    irrNet: irr,
    breakEvenYear: null
  };
};
