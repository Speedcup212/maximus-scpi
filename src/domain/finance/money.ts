import Decimal from 'decimal.js';

Decimal.set({
  precision: 40,
  rounding: Decimal.ROUND_HALF_UP
});

export type Money = Decimal;

export const toDecimal = (value: Decimal.Value): Decimal => new Decimal(value || 0);

export const roundMoney = (value: Decimal): Decimal =>
  value.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

export const add = (a: Decimal, b: Decimal): Decimal => a.plus(b);
export const sub = (a: Decimal, b: Decimal): Decimal => a.minus(b);
export const mul = (a: Decimal, b: Decimal): Decimal => a.times(b);
export const div = (a: Decimal, b: Decimal): Decimal => (b.isZero() ? new Decimal(0) : a.div(b));

export const max = (a: Decimal, b: Decimal): Decimal => Decimal.max(a, b);
export const min = (a: Decimal, b: Decimal): Decimal => Decimal.min(a, b);

export const toNumber = (value: Decimal): number => value.toNumber();
