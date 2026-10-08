import { describe, expect, it } from 'vitest';
import { estimateAnnualizedScpiIncome } from '../utils/clientPortfolioMath';

describe('estimateAnnualizedScpiIncome', () => {
  it('utilise le TD annuel plutôt que le dernier versement par part', () => {
    const login = estimateAnnualizedScpiIncome(10, 255, 6.21);
    const coeur = estimateAnnualizedScpiIncome(10, 204, 6.25);
    expect(login).toBeCloseTo(158.355, 3);
    expect(coeur).toBeCloseTo(127.5, 3);
    expect((login ?? 0) + (coeur ?? 0)).toBeCloseTo(285.855, 3);
  });

  it('additionne correctement plusieurs lots d’une même SCPI', () => {
    expect(estimateAnnualizedScpiIncome(7 + 3, 255, 6.21)).toBeCloseTo(158.355, 3);
  });

  it('ne calcule rien sans TD certifié ou prix de référence', () => {
    expect(estimateAnnualizedScpiIncome(10, 255, null)).toBeNull();
    expect(estimateAnnualizedScpiIncome(10, null, 6.21)).toBeNull();
    expect(estimateAnnualizedScpiIncome(0, 255, 6.21)).toBeNull();
  });

  it('rejette les données incohérentes', () => {
    expect(estimateAnnualizedScpiIncome(10, 255, -1)).toBeNull();
    expect(estimateAnnualizedScpiIncome(10, 255, 101)).toBeNull();
    expect(estimateAnnualizedScpiIncome(10, Number.NaN, 6.21)).toBeNull();
  });
});
