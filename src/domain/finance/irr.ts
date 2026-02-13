import Decimal from 'decimal.js';
import { toDecimal } from './money';

export const computeIRR = (flows: Decimal[], guess = 0.1): Decimal | null => {
  if (flows.length < 2) return null;
  if (flows.every(flow => flow.isZero())) return null;

  const maxIterations = 100;
  const tolerance = new Decimal(1e-7);
  let rate = toDecimal(guess);

  const npvAt = (r: Decimal): Decimal =>
    flows.reduce((acc, flow, t) => {
      const denom = toDecimal(1).plus(r).pow(t);
      return acc.plus(flow.div(denom));
    }, toDecimal(0));

  for (let i = 0; i < maxIterations; i++) {
    let npv = toDecimal(0);
    let derivative = toDecimal(0);
    for (let t = 0; t < flows.length; t++) {
      const denom = toDecimal(1).plus(rate).pow(t);
      npv = npv.plus(flows[t].div(denom));
      if (t > 0) {
        const d = flows[t].times(t).div(denom.times(toDecimal(1).plus(rate))).neg();
        derivative = derivative.plus(d);
      }
    }
    if (npv.abs().lte(tolerance)) {
      return rate;
    }
    if (derivative.abs().lte(toDecimal(1e-12))) {
      break;
    }
    const nextRate = rate.minus(npv.div(derivative));
    if (!nextRate.isFinite()) {
      break;
    }
    if (nextRate.minus(rate).abs().lte(tolerance)) {
      return nextRate;
    }
    rate = nextRate;
  }

  let low = toDecimal(-0.99);
  let high = toDecimal(5);
  let npvLow = npvAt(low);
  let npvHigh = npvAt(high);
  if (npvLow.times(npvHigh).gt(0)) {
    return null;
  }

  for (let i = 0; i < maxIterations; i++) {
    const mid = low.plus(high).div(2);
    const npvMid = npvAt(mid);
    if (npvMid.abs().lte(tolerance)) {
      return mid;
    }
    if (npvLow.times(npvMid).lt(0)) {
      high = mid;
      npvHigh = npvMid;
    } else {
      low = mid;
      npvLow = npvMid;
    }
  }

  return null;
};
