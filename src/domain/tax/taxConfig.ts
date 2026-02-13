import Decimal from 'decimal.js';
import { PvAbatementConfig, TaxYearConfig } from './taxTypes';
import { toDecimal } from '../finance/money';

export const DEFAULT_TAX_YEAR = 2024;

export const taxConfigByYear: Record<number, TaxYearConfig> = {
  2024: {
    year: 2024,
    tmiDefault: toDecimal(0.3),
    socialRate: toDecimal(0.172),
    corporateRate: toDecimal(0.25),
    corporateReducedRate: toDecimal(0.15),
    corporateReducedThreshold: toDecimal(42500),
    pfuRate: toDecimal(0.314),
    pvIrRate: toDecimal(0.19),
    pvPsRate: toDecimal(0.172)
  }
};

export const pvAbatement: PvAbatementConfig = {
  ir: [
    { yearStart: 6, yearEnd: 21, annualRate: toDecimal(0.06) },
    { yearStart: 22, yearEnd: 22, annualRate: toDecimal(0.04) }
  ],
  ps: [
    { yearStart: 6, yearEnd: 21, annualRate: toDecimal(0.0165) },
    { yearStart: 22, yearEnd: 22, annualRate: toDecimal(0.016) },
    { yearStart: 23, yearEnd: 30, annualRate: toDecimal(0.09) }
  ]
};

const getAbatement = (yearsHeld: number, table: PvAbatementConfig['ir']): Decimal => {
  if (yearsHeld <= 5) return toDecimal(0);
  let abatement = toDecimal(0);
  for (const row of table) {
    if (yearsHeld >= row.yearStart) {
      const maxYear = Math.min(yearsHeld, row.yearEnd);
      const count = maxYear - row.yearStart + 1;
      abatement = abatement.plus(row.annualRate.times(count));
    }
  }
  return Decimal.min(toDecimal(1), abatement);
};

export const getPvAbatementIR = (yearsHeld: number): Decimal =>
  getAbatement(yearsHeld, pvAbatement.ir);

export const getPvAbatementPS = (yearsHeld: number): Decimal =>
  getAbatement(yearsHeld, pvAbatement.ps);
