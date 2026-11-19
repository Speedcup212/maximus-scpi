import { describe, expect, it } from 'vitest';
import { scpiData } from '../data/scpiData';
import certifiedPga from '../data/pga_certified_2025.json';
import { getPgaDisplayInfo } from '../utils/scpiPga';

describe('certified PGA 2025 across the published 69-SCPI catalog', () => {
  const byName = new Map(scpiData.map(scpi => [scpi.name, scpi]));
  const slug = (name: string) => name.toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const bySlug = new Map(scpiData.map(scpi => [slug(scpi.name), scpi]));

  it('does not publish a PGA without an issuer source and matching 2025 TD', () => {
    expect(certifiedPga.length).toBeGreaterThanOrEqual(33);
    for (const proof of certifiedPga) {
      const scpi = bySlug.get(proof.slug);
      expect(scpi, 'missing SCPI ' + proof.slug).toBeDefined();
      expect(scpi?.yield).toBeCloseTo(proof.td);
      const display = getPgaDisplayInfo(scpi!);
      expect(display.available, 'unavailable PGA ' + proof.slug).toBe(true);
      expect(display.year).toBe(2025);
      expect(display.value).toBeCloseTo(proof.pga);
      expect(display.sourceUrl).toBe(proof.sourceUrl);
    }
  });

  it('shows historic capital losses instead of repeating TD as performance', () => {
    expect(getPgaDisplayInfo(byName.get('Novapierre Résidentiel')!).value).toBeCloseTo(-41.53);
    expect(getPgaDisplayInfo(byName.get('Paref Hexa')!).value).toBeCloseTo(-12.10);
    expect(getPgaDisplayInfo(byName.get('Primovie')!).value).toBeCloseTo(-7.31);
  });

  it('corrects accidentally misidentified annual TD values with issuer evidence', () => {
    expect(byName.get('Pierval Santé')?.yield).toBeCloseTo(4.06);
    expect(byName.get('Coeur de Région')?.yield).toBeCloseTo(6.20);
    expect(getPgaDisplayInfo(byName.get('Transitions Europe')!).value).toBeCloseTo(8.60);
  });
});
