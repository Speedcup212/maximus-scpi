import Decimal from 'decimal.js';
import { StrategyInputs, StrategyResult, StrategyYear } from './types';
import { applyCorporateTax, applyDistributionPolicy } from './utils';
import { roundMoney, toDecimal } from '../finance/money';
import { computeIRR } from '../finance/irr';

export type HoldingContext = {
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

export const runHoldingIS = (ctx: HoldingContext): StrategyResult => {
  const { inputs } = ctx;
  const years: StrategyYear[] = [];
  let companyCash = toDecimal(0);
  let cumulativeNetPersonal = toDecimal(0);

  for (let year = 1; year <= ctx.years; year++) {
    const income = ctx.revenues[year - 1];
    const charges = ctx.fees[year - 1].plus(inputs.accountingFeesAnnual);
    const interest = ctx.loanInterest[year - 1];
    const insurance = ctx.loanInsurance[year - 1];

    const taxable = income.minus(charges).minus(interest).minus(insurance);
    const isTax = applyCorporateTax(
      taxable,
      inputs.corporateRate,
      inputs.corporateReducedRate,
      inputs.corporateReducedThreshold,
      inputs.allowReducedIS
    );

    const netAfterTax = income.minus(charges).minus(interest).minus(insurance).minus(isTax);
    const annuityTarget = ctx.loanPrincipal[year - 1].plus(interest).plus(insurance);
    const taxTarget = netAfterTax.times(inputs.pfuRate);
    const distribution =
      inputs.distributionTiming === 'annual'
        ? applyDistributionPolicy(netAfterTax, inputs.distributionPolicy, annuityTarget, taxTarget)
        : toDecimal(0);
    const pfu = roundMoney(distribution.times(inputs.pfuRate));
    const netPersonal = roundMoney(distribution.minus(pfu));
    companyCash = companyCash.plus(netAfterTax.minus(distribution));
    const netTotal = netPersonal.plus(companyCash);
    cumulativeNetPersonal = roundMoney(cumulativeNetPersonal.plus(netPersonal));

    years.push({
      year,
      revenues: roundMoney(income),
      interest: roundMoney(interest),
      principalPaid: roundMoney(ctx.loanPrincipal[year - 1]),
      charges: roundMoney(charges.plus(insurance)),
      taxableBase: roundMoney(taxable),
      ir: toDecimal(0),
      ps: toDecimal(0),
      is: isTax,
      pfu,
      netPersonal,
      cumulativeNetPersonal,
      cashCompany: roundMoney(companyCash),
      netTotal,
      remainingDebt: ctx.remainingDebt[year - 1],
      partValue: ctx.partValues[year - 1],
      netWorth: roundMoney(ctx.partValues[year - 1].plus(companyCash).plus(cumulativeNetPersonal).minus(ctx.remainingDebt[year - 1])),
      taxBreakdown: {
        corporateIS: isTax,
        corporateISOnCapitalGain: toDecimal(0),
        personalIR: toDecimal(0),
        personalPS: toDecimal(0),
        personalPFU: pfu,
        totalTaxes: roundMoney(isTax.plus(pfu))
      }
    });
  }

  const plusValue = ctx.exitValue.minus(ctx.investedAmount);
  const exitPolicy = inputs.exitAssumptions.policy;
  let corporateISOnExit = toDecimal(0);
  let personalPFUOnExit = toDecimal(0);
  let personalCapitalGainTax = toDecimal(0);
  let netCompanyValue = toDecimal(0);
  let netPersonalValue = toDecimal(0);
  let exitNote: string | undefined;

  if (exitPolicy === 'HOLD') {
    netCompanyValue = roundMoney(companyCash.plus(ctx.exitValue).minus(ctx.remainingDebt[ctx.years - 1]));
    netPersonalValue = toDecimal(0);
  } else if (exitPolicy === 'SELL_SHARES') {
    const shareValue = companyCash.plus(ctx.exitValue).minus(ctx.remainingDebt[ctx.years - 1]);
    const pvShares = Decimal.max(toDecimal(0), shareValue.minus(ctx.initialOutflow));
    personalCapitalGainTax = roundMoney(pvShares.times(inputs.pfuRate));
    netPersonalValue = roundMoney(shareValue.minus(personalCapitalGainTax));
    netCompanyValue = toDecimal(0);
    exitNote = 'PV mobilière simplifiée (PFU sur plus-value).';
  } else {
    corporateISOnExit = applyCorporateTax(
      plusValue,
      inputs.corporateRate,
      inputs.corporateReducedRate,
      inputs.corporateReducedThreshold,
      inputs.allowReducedIS
    );
    const exitNet = ctx.exitValue.minus(corporateISOnExit).minus(ctx.remainingDebt[ctx.years - 1]);
    const totalCompanyCash = companyCash.plus(exitNet);
    if (inputs.exitAssumptions.distributeAtEnd) {
      const rate = inputs.exitAssumptions.distributionRateAtEnd ?? toDecimal(1);
      const distributed = roundMoney(totalCompanyCash.times(rate));
      personalPFUOnExit = roundMoney(distributed.times(inputs.pfuRate));
      netPersonalValue = roundMoney(distributed.minus(personalPFUOnExit));
      netCompanyValue = roundMoney(totalCompanyCash.minus(distributed));
      exitNote = 'Distribution finale simplifiée: tout distribué = dividende.';
    } else {
      netCompanyValue = roundMoney(totalCompanyCash);
      netPersonalValue = toDecimal(0);
    }
  }

  const flows = [
    ctx.initialOutflow.neg(),
    ...years.map(y => y.netPersonal),
    netPersonalValue
  ];
  const irr = computeIRR(flows);

  const cashflowNetAvg = roundMoney(
    years.reduce((acc, y) => acc.plus(y.netPersonal), toDecimal(0)).div(ctx.years)
  );
  const corporateISTotal = roundMoney(
    years.reduce((acc, y) => acc.plus(y.is), toDecimal(0)).plus(corporateISOnExit)
  );
  const personalPFUTotal = roundMoney(
    years.reduce((acc, y) => acc.plus(y.pfu), toDecimal(0)).plus(personalPFUOnExit)
  );
  const taxesPersonalTotal = roundMoney(personalPFUTotal.plus(personalCapitalGainTax));
  const taxesCorporateTotal = corporateISTotal;
  const taxesTotal = roundMoney(taxesPersonalTotal.plus(taxesCorporateTotal));
  const netWorthFinal = years.length > 0 ? years[years.length - 1].netWorth : roundMoney(netPersonalValue.plus(netCompanyValue));

  return {
    label: ctx.label,
    years,
    cashflowNetAvg,
    taxesTotal,
    taxesPersonalTotal,
    taxesCorporateTotal,
    taxesBreakdown: {
      personalIR: toDecimal(0),
      personalPS: toDecimal(0),
      personalPFU: personalPFUTotal,
      corporateIS: roundMoney(years.reduce((acc, y) => acc.plus(y.is), toDecimal(0))),
      corporateISOnExit
    },
    netWorthFinal,
    exit: {
      policy: exitPolicy,
      corporateISOnExit,
      personalPFUOnExit,
      personalCapitalGainTax,
      netCompanyValue,
      netPersonalValue,
      note: exitNote
    },
    irrNet: irr,
    breakEvenYear: null
  };
};
