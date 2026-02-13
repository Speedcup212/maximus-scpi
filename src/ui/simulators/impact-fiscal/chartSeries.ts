import { ImpactFiscalResult } from '../../../domain/strategies/runScenario';

export type NetMetric = 'personal' | 'company' | 'total';

export const buildAnnualSeries = (result: ImpactFiscalResult, netMetric: NetMetric) => {
  const pick = (value: ImpactFiscalResult['directIR']['years'][number]) => {
    if (netMetric === 'company') return value.cashCompany;
    if (netMetric === 'total') return value.netTotal;
    return value.netPersonal;
  };
  return result.directIR.years.map((year, idx) => ({
    year: year.year,
    directIR: Number(pick(result.directIR.years[idx]).toFixed(2)),
    sciIR: Number(pick(result.sciIR.years[idx]).toFixed(2)),
    sciIS: Number(pick(result.sciIS.years[idx]).toFixed(2)),
    holdingIS: Number(pick(result.holdingIS.years[idx]).toFixed(2))
  }));
};

export const buildTaxesSeries = (result: ImpactFiscalResult) => [
  {
    label: 'Direct IR',
    personal: Number(result.directIR.taxesPersonalTotal.toFixed(2)),
    corporate: Number(result.directIR.taxesCorporateTotal.toFixed(2))
  },
  {
    label: 'SCI IR',
    personal: Number(result.sciIR.taxesPersonalTotal.toFixed(2)),
    corporate: Number(result.sciIR.taxesCorporateTotal.toFixed(2))
  },
  {
    label: 'SCI IS',
    personal: Number(result.sciIS.taxesPersonalTotal.toFixed(2)),
    corporate: Number(result.sciIS.taxesCorporateTotal.toFixed(2))
  },
  {
    label: 'Holding IS',
    personal: Number(result.holdingIS.taxesPersonalTotal.toFixed(2)),
    corporate: Number(result.holdingIS.taxesCorporateTotal.toFixed(2))
  }
];
