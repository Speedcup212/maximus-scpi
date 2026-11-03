import { describe, expect, it } from 'vitest';
import { certifiedScpiCatalogDiscount } from '../utils/certifiedScpiCatalogDiscount';
import { getScpiDatedDiscount } from '../utils/scpiDatedDiscount';
import { scpiData } from '../data/scpiData';

describe('Netlify SCPI catalog sync: discount QA release gate', () => {
  it('keeps Sofidynamic derived catalog discount null under manual review, despite two official source values', () => {
    const price = 320;
    const reconstruction = 336.75;
    expect(certifiedScpiCatalogDiscount(price, reconstruction, false)).toBeNull();
    const scpi = scpiData.find((item) => item.name === 'Sofidynamic');
    expect(scpi?.discountQaStatus).toBe('manual_review');
    expect(scpi?.maximusDisabledFeatures).toContain('undated_valuation_comparison');
    const dated = getScpiDatedDiscount(scpi!);
    expect(dated?.label).toBe('Décote indicative');
    expect(dated?.formatted).toBe('4,97 %');
  });

  it('publishes a financial discount only when its semantics are certified', () => {
    expect(certifiedScpiCatalogDiscount(95, 100, true)).toBe(-5);
    expect(certifiedScpiCatalogDiscount(105, 100, true)).toBe(5);
    expect(certifiedScpiCatalogDiscount(100, 100, true)).toBe(0);
    expect(certifiedScpiCatalogDiscount(320, 336.75, true)).toBeCloseTo(-4.973, 2);
  });

  it('never turns invalid or zero prices into publishable percentages', () => {
    expect(certifiedScpiCatalogDiscount(NaN, 100, true)).toBeNull();
    expect(certifiedScpiCatalogDiscount(100, Infinity, true)).toBeNull();
    expect(certifiedScpiCatalogDiscount(0, 100, true)).toBeNull();
    expect(certifiedScpiCatalogDiscount(100, 0, true)).toBeNull();
    expect(certifiedScpiCatalogDiscount(100, 0, false)).toBeNull();
  });
});
