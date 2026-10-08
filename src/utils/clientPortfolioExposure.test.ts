import { describe, expect, it } from 'vitest';
import { aggregatePortfolioExposure, resolveExposure, validatedExposure } from './clientPortfolioExposure';

describe('client portfolio exposures', () => {
  it('ne reprend jamais des pays comme secteurs', () => {
    expect(validatedExposure({ Espagne: 40, Belgique: 30, Portugal: 30 }, 'sector')).toEqual([]);
  });
  it('rejette la donnée partielle et le faux 100 % sur une catégorie principale', () => {
    expect(validatedExposure({ Bureaux: 100 }, 'sector')).toEqual([]);
    expect(validatedExposure({ Bureaux: 40, Commerces: 20 }, 'sector')).toEqual([]);
  });
  it('préfère la source validée puis la fiche existante', () => {
    const catalog = [{ name: 'Bureaux', value: 60 }, { name: 'Commerces', value: 40 }];
    expect(resolveExposure({ Bureaux: 70, Commerces: 30 }, catalog, 'sector').source).toBe('certified');
    expect(resolveExposure(null, catalog, 'sector').source).toBe('catalog');
    expect(resolveExposure(null, null, 'sector').source).toBe('missing');
  });
  it('préserve le pourcentage non documenté du portefeuille', () => {
    const known = resolveExposure({ Bureaux: 60, Logistique: 40 }, null, 'sector');
    const absent = resolveExposure(null, null, 'sector');
    const result = aggregatePortfolioExposure([
      { currentValue: 2000, exposure: known },
      { currentValue: 2000, exposure: absent },
    ]);
    expect(result.coveredPercent).toBe(50);
    expect(result.missingPercent).toBe(50);
    expect(result.entries.find(row => row.label === 'Bureaux')?.value).toBeCloseTo(30);
  });
});
