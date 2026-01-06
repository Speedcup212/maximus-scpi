import { SCPIExtended } from '../data/scpiDataExtended';

export type TMIValue = 0 | 11 | 30 | 41 | 45 | null;

export const isEuropeanSCPI = (scpi: SCPIExtended): boolean => {
  const totalFrance = scpi.geography
    .filter(geo => {
      const name = geo.name.toLowerCase();
      return name.includes('france') || name.includes('paris') || name.includes('région');
    })
    .reduce((sum, geo) => sum + geo.value, 0);

  return totalFrance < 50;
};

export const calculateNetYield = (grossYield: number, tmi: TMIValue, isEuropean: boolean): number => {
  if (tmi === null) return grossYield;

  if (isEuropean) {
    return grossYield * 0.85;
  } else {
    const tmiDecimal = tmi / 100;
    const totalTaxRate = tmiDecimal + 0.172;
    return grossYield * (1 - totalTaxRate);
  }
};

export const shouldOptimizeForTax = (tmi: TMIValue): boolean => {
  return tmi !== null && tmi >= 30;
};

export const getTaxOptimizationScore = (scpi: SCPIExtended, tmi: TMIValue): number => {
  if (!shouldOptimizeForTax(tmi)) return 0;

  const isEuropean = isEuropeanSCPI(scpi);

  if (isEuropean) {
    return 100;
  }

  return 0;
};

export const sortSCPIByTaxOptimization = (
  scpis: SCPIExtended[],
  tmi: TMIValue,
  sortBy: 'yield' | 'price'
): SCPIExtended[] => {
  const sorted = [...scpis];

  if (shouldOptimizeForTax(tmi)) {
    sorted.sort((a, b) => {
      const scoreA = getTaxOptimizationScore(a, tmi);
      const scoreB = getTaxOptimizationScore(b, tmi);

      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }

      if (sortBy === 'yield') {
        return b.yield - a.yield;
      }
      return a.price - b.price;
    });
  } else {
    sorted.sort((a, b) => {
      if (sortBy === 'yield') return b.yield - a.yield;
      return a.price - b.price;
    });
  }

  return sorted;
};
