import { describe, expect, it } from 'vitest';
import { aggregatePortfolioExposure, resolveExposure, validatedExposure } from '../utils/clientPortfolioExposure';

describe('client portfolio exposures', () => {
  it('ne reprend jamais des pays comme secteurs', () => {
    expect(validatedExposure({ Espagne: 40, Belgique: 30, Portugal: 30 }, 'sector')).toEqual([]);
  });
  it('rejette la donnée partielle et le faux 100 % sur une catégorie principale', () => {
    expect(validatedExposure({ Bureaux: 100 }, 'sector')).toEqual([]);
    expect(validatedExposure({ Bureaux: 40, Commerces: 20 }, 'sector')).toEqual([]);
  });
  it('préfère la source structurée puis la fiche existante', () => {
    const catalog = [{ name: 'Bureaux', value: 60 }, { name: 'Commerces', value: 40 }];
    expect(resolveExposure({ Bureaux: 70, Commerces: 30 }, catalog, 'sector').source).toBe('structured');
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
    expect(result.structuredPercent).toBe(50);
    expect(result.catalogPercent).toBe(0);
  });

  it('distingue couverture structurée et reprise historique sans dire certifiée', () => {
    const structured = resolveExposure({ Bureaux: 60, Commerces: 40 }, null, 'sector');
    const catalog = resolveExposure(null, [{ name: 'Bureaux', value: 20 }, { name: 'Commerces', value: 80 }], 'sector');
    const result = aggregatePortfolioExposure([
      { currentValue: 2500, exposure: structured },
      { currentValue: 7500, exposure: catalog },
    ]);
    expect(result.coveredPercent).toBe(100);
    expect(result.structuredPercent).toBe(25);
    expect(result.catalogPercent).toBe(75);
    expect(result.missingPercent).toBe(0);
  });

  it('restaure la ventilation globale indicative lorsque seules les fiches historiques sont disponibles', () => {
    const one = resolveExposure(null, [
      { name: 'Logistique', value: 70 },
      { name: 'Bureaux', value: 30 },
    ], 'sector');
    const two = resolveExposure(null, [
      { name: 'Commerces', value: 60 },
      { name: 'Bureaux', value: 40 },
    ], 'sector');
    const aggregated = aggregatePortfolioExposure([
      { currentValue: 2295, exposure: one },
      { currentValue: 1795, exposure: two },
    ]);
    expect(aggregated.entries.length).toBeGreaterThan(0);
    expect(aggregated.catalogPercent).toBe(100);
    expect(aggregated.structuredPercent).toBe(0);
    expect(aggregated.coveredPercent).toBe(100);
    expect(aggregated.entries.reduce((sum, entry) => sum + entry.value, 0)).toBeCloseTo(100, 7);
  });

  it('conserve le manque de couverture sans gonfler les parts connues', () => {
    const catalogue = resolveExposure(null, [
      { name: 'France', value: 60 },
      { name: 'Espagne', value: 40 },
    ], 'geography');
    const breakdown = aggregatePortfolioExposure([
      { currentValue: 2000, exposure: catalogue },
      { currentValue: 2000, exposure: resolveExposure(null, null, 'geography') },
    ]);
    expect(breakdown.coveredPercent).toBe(50);
    expect(breakdown.catalogPercent).toBe(50);
    expect(breakdown.missingPercent).toBe(50);
    expect(breakdown.entries.reduce((sum, entry) => sum + entry.value, 0)).toBeCloseTo(50, 7);
  });
});
