import { describe, expect, it } from 'vitest';
import { OFFICIAL_PGA_2025 } from '../data/scpiPgaOfficial2025';
import { formatPgaPercent, getVerifiedPga2025 } from '../utils/scpiPga';

describe('PGA annuelle ASPIM – source et période', () => {
  it('restitue les valeurs publiées pour les 7 SCPI pilotes, sans les recalculer', () => {
    expect(Object.keys(OFFICIAL_PGA_2025)).toHaveLength(7);
    expect(getVerifiedPga2025('Iroko Zen')?.pgaPct).toBe(8.13);
    expect(getVerifiedPga2025('Iroko Zen')?.distributionPct).toBe(7.14);
    expect(getVerifiedPga2025('CORUM USA')?.pgaPct).toBe(7.70);
    expect(getVerifiedPga2025('Activimmo')?.distributionPct).toBe(5.49);
  });

  it('affiche une absence réelle plutôt que 0 ou le taux de distribution', () => {
    expect(getVerifiedPga2025('SCPI non documentée')).toBeNull();
    expect(getVerifiedPga2025('')).toBeNull();
  });

  it('n’autorise que la période 2025, des valeurs finies et des sources HTTPS', () => {
    for (const record of Object.values(OFFICIAL_PGA_2025)) {
      expect(record.year).toBe(2025);
      expect(Number.isFinite(record.pgaPct)).toBe(true);
      expect(Number.isFinite(record.distributionPct)).toBe(true);
      expect(record.sourceUrl).toMatch(/^https:\/\//);
    }
  });

  it('formate les performances négatives sans masquer le signe', () => {
    expect(formatPgaPercent(-2)).toMatch(/-2,00\s%/);
  });
});
