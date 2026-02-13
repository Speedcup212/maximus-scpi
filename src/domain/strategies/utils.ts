import Decimal from 'decimal.js';
import { roundMoney, toDecimal, max } from '../finance/money';
import { getPvAbatementIR, getPvAbatementPS } from '../tax/taxConfig';

export const computePvTaxesIR = (
  plusValue: Decimal,
  yearsHeld: number,
  irRate: Decimal,
  psRate: Decimal
) => {
  const abIr = getPvAbatementIR(yearsHeld);
  const abPs = getPvAbatementPS(yearsHeld);
  const baseIr = max(toDecimal(0), plusValue.times(toDecimal(1).minus(abIr)));
  const basePs = max(toDecimal(0), plusValue.times(toDecimal(1).minus(abPs)));
  const ir = roundMoney(baseIr.times(irRate));
  const ps = roundMoney(basePs.times(psRate));
  return { ir, ps };
};

export const applyCorporateTax = (
  taxable: Decimal,
  rate: Decimal,
  reducedRate: Decimal,
  reducedThreshold: Decimal,
  allowReduced: boolean
) => {
  if (taxable.lte(0)) {
    return roundMoney(toDecimal(0));
  }
  if (!allowReduced) {
    return roundMoney(taxable.times(rate));
  }
  const lower = Decimal.min(taxable, reducedThreshold);
  const upper = Decimal.max(toDecimal(0), taxable.minus(reducedThreshold));
  return roundMoney(lower.times(reducedRate).plus(upper.times(rate)));
};

export const applyDistributionPolicy = (
  availableCash: Decimal,
  policy:
    | { type: 'rate'; rate: Decimal }
    | { type: 'cover_annuity' }
    | { type: 'cover_taxes' },
  annuityTarget: Decimal,
  taxTarget: Decimal
) => {
  if (policy.type === 'rate') {
    return roundMoney(availableCash.times(policy.rate));
  }
  if (policy.type === 'cover_annuity') {
    return roundMoney(Decimal.min(availableCash, annuityTarget));
  }
  return roundMoney(Decimal.min(availableCash, taxTarget));
};
