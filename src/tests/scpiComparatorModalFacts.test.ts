import { describe, expect, it } from 'vitest';
import { scpiData } from '../data/scpiData';
import { aggregateCountryGeographyRows } from '../utils/scpiGeography';
import { buildScpiForAnalysis } from '../utils/buildScpiForAnalysis';
import { getScpiDatedDiscount } from '../utils/scpiDatedDiscount';

describe('modale comparateur : sources officielles et granularité pays', () => {
  it('regroupe les régions en France sans modifier les lignes sources', () => {
    const raw = [
      { name: 'Pays-Bas', value: 36.9 },
      { name: 'Paris', value: 9.9 },
      { name: 'Région parisienne', value: 15.5 },
      { name: 'Régions', value: 29.4 },
      { name: 'Espagne', value: 8.2 },
    ];
    const original = JSON.stringify(raw);
    expect(aggregateCountryGeographyRows(raw)).toEqual([
      { name: 'France', value: 54.8 },
      { name: 'Pays-Bas', value: 36.9 },
      { name: 'Espagne', value: 8.2 },
    ]);
    expect(JSON.stringify(raw)).toBe(original);
    expect(aggregateCountryGeographyRows(null)).toEqual([]);
  });

  it('réutilise la décote datée de la fiche sans lever la restriction de certification', () => {
    const source = scpiData.find(item => item.name === 'Sofidynamic');
    expect(source).toBeDefined();
    const forModal = buildScpiForAnalysis({
      name: 'Sofidynamic',
      price: source!.price,
      reconstitutionValue: source!.valeurReconstitution,
      discountQaStatus: 'manual_review',
    }, scpiData);
    expect(forModal).not.toBeNull();
    const dated = getScpiDatedDiscount(forModal!);
    expect(dated?.label).toBe('Décote indicative');
    expect(dated?.formatted).toBe('4,97 %');
    expect(dated?.priceDate).toBe('30/06/2026');
    expect(dated?.valuationDate).toBe('31/12/2025');
    expect(forModal?.discountQaStatus).toBe('manual_review');
    expect(forModal?.maximusDisabledFeatures).toContain('undated_valuation_comparison');
  });
});
