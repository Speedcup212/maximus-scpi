import { computeIRR } from '../hooks/useIRRCalculator';

export type ISInputs = {
  investedAmount: number;
  grossYieldRate: number;
  corporateTaxRate: number;
  years: number;
  capitalize: boolean;
  revalorizeCapital?: boolean;
  revalorizationRate?: number;
  exitTaxEnabled?: boolean;
  exitTaxRate?: number;
  amortizationEnabled?: boolean;
  amortizationYears?: number;
  amortizationShare?: number;
  subscriptionFeesRate?: number;
  delaiJouissanceMonths?: number;
};

export type ISYearProjection = {
  year: number;
  grossIncome: number;
  amortizationAnnual: number;
  taxableResult: number;
  corporateTaxNoAmort: number;
  corporateTax: number;
  taxSaving: number;
  netIncome: number;
  cumulativeNetCash: number;
  capitalEnd: number;
  deficitReportable: number;
  deficitUsed: number;
  feesIncluded: number;
  productiveCapital: number;
};

export type ISSummary = {
  annualGrossIncome: number;
  annualCorporateTax: number;
  annualNetIncome: number;
  cumulativeNetCash: number;
  capitalFinal: number;
  capitalNetFinal: number;
  totalRecovered: number;
  totalCorporateTax: number;
  exitTax: number;
  vnc: number;
  plusValueTaxable: number;
  amortizationCumulated: number;
  capitalProductive: number;
  deficitReportableCumule: number;
  netYieldRate: number;
  simplifiedIrr: number | null;
  grossIrr: number | null;
  netIrrWithRevalo: number | null;
  netIrrAfterExitTax: number | null;
  irrImpact: number | null;
  amortizationTaxSaving: number;
  deltaIrrAmortizationPts: number | null;
  deltaCashCumule: number | null;
  deltaIsPaid: number | null;
  deltaIrrFeesPts: number | null;
};

export type ISSimulationResult = {
  summary: ISSummary;
  projections: ISYearProjection[];
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

// computeIRR moved to useIRRCalculator.ts

export const computeISSimulation = (inputs: ISInputs): ISSimulationResult => {
  const investedAmount = Math.max(0, inputs.investedAmount);
  const grossYieldRate = clamp(inputs.grossYieldRate, 0, 100);
  const corporateTaxRate = clamp(inputs.corporateTaxRate, 0, 100);
  const years = clamp(Math.round(inputs.years), 1, 15);
  const capitalize = inputs.capitalize;
  const revalorizeCapital = inputs.revalorizeCapital ?? false;
  const revalorizationRate = clamp(inputs.revalorizationRate ?? 0, 0, 20);
  const exitTaxEnabled = inputs.exitTaxEnabled ?? false;
  const exitTaxRate = clamp(inputs.exitTaxRate ?? 25, 0, 50);
  const amortizationEnabled = inputs.amortizationEnabled ?? false;
  const amortizationYears = clamp(Math.round(inputs.amortizationYears ?? 20), 1, 40);
  const amortizationShare = clamp(inputs.amortizationShare ?? 80, 0, 100);
  const subscriptionFeesRate = clamp(inputs.subscriptionFeesRate ?? 0, 0, 20);
  const delaiJouissanceMonths = clamp(Math.round(inputs.delaiJouissanceMonths ?? 0), 0, 12);
  const prorataYear1 = Math.max(0, (12 - delaiJouissanceMonths) / 12);

  const buildScenario = (useAmortization: boolean, feesRate: number) => {
    const projections: ISYearProjection[] = [];
    const capitalProductive = investedAmount * (1 - feesRate / 100);
    const feesAmount = investedAmount - capitalProductive;
    const amortizationAnnualBase = useAmortization
      ? (capitalProductive * (amortizationShare / 100)) / amortizationYears
      : 0;
    let capital = capitalProductive;
    let cumulativeNetCash = 0;
    let amortizationTaxSaving = 0;
    let totalCorporateTax = 0;
    let deficitReportable = 0;

    for (let year = 1; year <= years; year++) {
      const yearFactor = year === 1 ? prorataYear1 : 1;
      const productiveCapital = capital;
      const grossIncome = productiveCapital * (grossYieldRate / 100) * yearFactor;
      const amortizationAnnual =
        useAmortization && year <= amortizationYears
          ? amortizationAnnualBase
          : 0;
      const taxableResult = grossIncome - amortizationAnnual;
      let deficitUsed = 0;
      let taxableAfterDeficit = taxableResult;
      if (taxableAfterDeficit > 0 && deficitReportable > 0) {
        deficitUsed = Math.min(deficitReportable, taxableAfterDeficit);
        taxableAfterDeficit -= deficitUsed;
        deficitReportable -= deficitUsed;
      } else if (taxableAfterDeficit < 0) {
        deficitReportable += -taxableAfterDeficit;
        taxableAfterDeficit = 0;
      }
      const corporateTax = Math.max(0, taxableAfterDeficit * (corporateTaxRate / 100));
      const corporateTaxNoAmort = grossIncome * (corporateTaxRate / 100);
      const taxSaving = Math.max(0, corporateTaxNoAmort - corporateTax);
      const netIncome = grossIncome - corporateTax;

      cumulativeNetCash += netIncome;
      if (capitalize) {
        capital += netIncome;
      }

      amortizationTaxSaving += taxSaving;
      totalCorporateTax += corporateTax;

      projections.push({
        year,
        grossIncome,
        amortizationAnnual,
        taxableResult,
        corporateTaxNoAmort,
        corporateTax,
        taxSaving,
        netIncome,
        cumulativeNetCash,
        capitalEnd: capital,
        deficitReportable,
        deficitUsed,
        feesIncluded: year === 1 ? feesAmount : 0,
        productiveCapital
      });
    }

    const netFlowsBase = [
      -investedAmount,
      ...projections.map((item, index) =>
        index === projections.length - 1 ? item.netIncome + capitalProductive : item.netIncome
      )
    ];

    return {
      projections,
      cumulativeNetCash,
      amortizationTaxSaving,
      totalCorporateTax,
      deficitReportable,
      capitalProductive,
      irrNetBase: computeIRR(netFlowsBase)
    };
  };

  const scenarioWithAmort = buildScenario(amortizationEnabled, subscriptionFeesRate);
  const scenarioWithoutAmort = buildScenario(false, subscriptionFeesRate);
  const scenarioWithoutFees = buildScenario(amortizationEnabled, 0);

  const projections = scenarioWithAmort.projections;
  const cumulativeNetCash = scenarioWithAmort.cumulativeNetCash;
  const amortizationTaxSaving = scenarioWithAmort.amortizationTaxSaving;
  const totalCorporateTax = scenarioWithAmort.totalCorporateTax;

  const annualGrossIncome = scenarioWithAmort.capitalProductive * (grossYieldRate / 100);
  const annualAmortization = amortizationEnabled
    ? (scenarioWithAmort.capitalProductive * (amortizationShare / 100)) / amortizationYears
    : 0;
  const annualTaxableResult = annualGrossIncome - annualAmortization;
  const annualCorporateTax = Math.max(0, annualTaxableResult * (corporateTaxRate / 100));
  const annualNetIncome = annualGrossIncome - annualCorporateTax;

  const capitalFinalBase = scenarioWithAmort.capitalProductive;
  const capitalFinal = revalorizeCapital
    ? capitalFinalBase * Math.pow(1 + revalorizationRate / 100, years)
    : capitalFinalBase;
  const amortizationAnnual = amortizationEnabled
    ? (capitalFinalBase * (amortizationShare / 100)) / amortizationYears
    : 0;
  const amortizationCumulated = amortizationAnnual * Math.min(years, amortizationYears);
  const vnc = Math.max(0, capitalFinalBase - amortizationCumulated);
  const plusValueTaxable = Math.max(0, capitalFinal - vnc);
  const exitTax = exitTaxEnabled ? plusValueTaxable * (exitTaxRate / 100) : 0;
  const capitalNetFinal = capitalFinal - exitTax;
  const totalRecovered = cumulativeNetCash + capitalNetFinal;
  const netYieldRate = investedAmount > 0 ? annualNetIncome / investedAmount : 0;

  const netFlows = [
    -investedAmount,
    ...projections.map((item, index) =>
      index === projections.length - 1 ? item.netIncome + capitalFinal : item.netIncome
    )
  ];
  const irrNet = computeIRR(netFlows);
  const netFlowsWithExitTax = [
    -investedAmount,
    ...projections.map((item, index) =>
      index === projections.length - 1 ? item.netIncome + capitalNetFinal : item.netIncome
    )
  ];
  const irrNetAfterExitTax = computeIRR(netFlowsWithExitTax);

  const grossFlows = [
    -investedAmount,
    ...projections.map((item, index) =>
      index === projections.length - 1 ? item.grossIncome + capitalFinal : item.grossIncome
    )
  ];
  const irrGross = computeIRR(grossFlows);
  const irrImpact =
    irrGross !== null && scenarioWithAmort.irrNetBase !== null
      ? irrGross - scenarioWithAmort.irrNetBase
      : null;

  const deltaIrrAmortizationPts =
    amortizationEnabled &&
    scenarioWithAmort.irrNetBase !== null &&
    scenarioWithoutAmort.irrNetBase !== null
      ? scenarioWithAmort.irrNetBase - scenarioWithoutAmort.irrNetBase
      : null;
  const deltaCashCumule =
    amortizationEnabled
      ? scenarioWithAmort.cumulativeNetCash - scenarioWithoutAmort.cumulativeNetCash
      : null;
  const deltaIsPaid =
    amortizationEnabled ? scenarioWithoutAmort.totalCorporateTax - scenarioWithAmort.totalCorporateTax : null;
  const deltaIrrFeesPts =
    scenarioWithAmort.irrNetBase !== null && scenarioWithoutFees.irrNetBase !== null
      ? scenarioWithAmort.irrNetBase - scenarioWithoutFees.irrNetBase
      : null;

  return {
    summary: {
      annualGrossIncome,
      annualCorporateTax,
      annualNetIncome,
      cumulativeNetCash,
      capitalFinal,
      capitalNetFinal,
      totalRecovered,
      totalCorporateTax,
      exitTax,
      vnc,
      plusValueTaxable,
      amortizationCumulated,
      capitalProductive: scenarioWithAmort.capitalProductive,
      deficitReportableCumule: scenarioWithAmort.deficitReportable,
      netYieldRate,
      simplifiedIrr: scenarioWithAmort.irrNetBase,
      grossIrr: irrGross,
      netIrrWithRevalo: revalorizeCapital ? irrNet : null,
      netIrrAfterExitTax: exitTaxEnabled ? irrNetAfterExitTax : null,
      irrImpact,
      amortizationTaxSaving,
      deltaIrrAmortizationPts,
      deltaCashCumule,
      deltaIsPaid,
      deltaIrrFeesPts
    },
    projections
  };
};
