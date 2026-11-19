import { describe, expect, it } from 'vitest';
import { formatPga, getPgaDisplayInfo } from './scpiPga';

const valid = {
  pga: -2.5, pgaYear: 2025, pgaSourceUrl: 'https://exemple.fr/rapport-officiel.pdf',
  pgaQaStatus: 'qa_pass',
  distributionReferencePeriod: '2025-RA'
};

describe('PGA ASPIM — validation avant affichage', () => {
  it('accepte une PGA négative officielle de la même année que le TD', () => {
    expect(getPgaDisplayInfo(valid)).toMatchObject({ available: true, year: 2025, value: -2.5 });
  });
  it('rejette les années différentes, même si les valeurs existent', () => {
    expect(getPgaDisplayInfo({ ...valid, pgaYear: 2024 }).available).toBe(false);
  });
  it('rejette une PGA sans source ou validation QA', () => {
    expect(getPgaDisplayInfo({ ...valid, pgaSourceUrl: undefined }).available).toBe(false);
    expect(getPgaDisplayInfo({ ...valid, pgaQaStatus: undefined }).available).toBe(false);
  });
  it('rejette une donnée TD sans année identifiable', () => {
    expect(getPgaDisplayInfo({ ...valid, distributionReferencePeriod: undefined }).available).toBe(false);
  });
  it('ne transforme pas un 0 % vérifié en valeur absente', () => {
    expect(getPgaDisplayInfo({ ...valid, pga: 0 }).available).toBe(true);
  });
  it('formate les valeurs en français', () => {
    expect(formatPga(-2.5)).toContain('-2,50');
  });
});
