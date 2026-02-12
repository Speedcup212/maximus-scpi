import { useCallback } from 'react';

export const computeIRR = (flows: number[], guess = 0.1): number | null => {
  const maxIterations = 100;
  const tolerance = 1e-6;

  if (flows.length < 2) return null;
  if (flows.every(flow => flow === 0)) return null;

  // Newton-Raphson with fallback to bisection for stability
  let rate = guess;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let derivative = 0;

    for (let t = 0; t < flows.length; t++) {
      const denominator = Math.pow(1 + rate, t);
      npv += flows[t] / denominator;
      if (t > 0) {
        derivative -= (t * flows[t]) / (denominator * (1 + rate));
      }
    }

    if (Math.abs(npv) < tolerance) {
      return rate;
    }

    if (Math.abs(derivative) < 1e-10) {
      break;
    }

    const nextRate = rate - npv / derivative;
    if (!Number.isFinite(nextRate)) {
      break;
    }

    if (Math.abs(nextRate - rate) < tolerance) {
      return nextRate;
    }

    rate = nextRate;
  }

  // Bisection fallback
  let low = -0.99;
  let high = 5;
  let npvLow = 0;
  let npvHigh = 0;

  const computeNpv = (r: number) =>
    flows.reduce((acc, flow, t) => acc + flow / Math.pow(1 + r, t), 0);

  npvLow = computeNpv(low);
  npvHigh = computeNpv(high);

  if (npvLow * npvHigh > 0) {
    return null;
  }

  for (let i = 0; i < maxIterations; i++) {
    const mid = (low + high) / 2;
    const npvMid = computeNpv(mid);

    if (Math.abs(npvMid) < tolerance) {
      return mid;
    }

    if (npvLow * npvMid < 0) {
      high = mid;
      npvHigh = npvMid;
    } else {
      low = mid;
      npvLow = npvMid;
    }
  }

  return null;
};

export const useIRRCalculator = () => {
  const compute = useCallback((flows: number[], guess?: number) => computeIRR(flows, guess), []);
  return { computeIRR: compute };
};
