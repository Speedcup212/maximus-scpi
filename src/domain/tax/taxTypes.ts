import Decimal from 'decimal.js';

export type TaxYearConfig = {
  year: number;
  tmiDefault: Decimal;
  socialRate: Decimal;
  corporateRate: Decimal;
  corporateReducedRate: Decimal;
  corporateReducedThreshold: Decimal;
  pfuRate: Decimal;
  pvIrRate: Decimal;
  pvPsRate: Decimal;
};

export type AbatementTable = {
  yearStart: number;
  yearEnd: number;
  annualRate: Decimal;
};

export type PvAbatementConfig = {
  ir: AbatementTable[];
  ps: AbatementTable[];
};
