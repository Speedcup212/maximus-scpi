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
  }

  const tmiDecimal = tmi / 100;
  const totalTaxRate = tmiDecimal + 0.172;
  return grossYield * (1 - totalTaxRate);
};

/**
 * La TMI reste une donnée informative du parcours, mais ne doit jamais
 * modifier automatiquement le classement du comparateur.
 *
 * Pourquoi : la fiscalité des revenus immobiliers étrangers dépend du pays,
 * de la convention fiscale applicable et de la situation personnelle. Une
 * préférence automatique pour les SCPI européennes créerait donc un biais
 * de classement trompeur.
 */
export const shouldOptimizeForTax = (_tmi: TMIValue): boolean => false;

export const getTaxOptimizationScore = (_scpi: SCPIExtended, _tmi: TMIValue): number => 0;

export const sortSCPIByTaxOptimization = (
  scpis: SCPIExtended[],
  _tmi: TMIValue,
  sortBy: 'yield' | 'price'
): SCPIExtended[] => {
  const sorted = [...scpis];

  sorted.sort((a, b) => {
    if (sortBy === 'yield') return b.yield - a.yield;
    return a.price - b.price;
  });

  return sorted;
};
