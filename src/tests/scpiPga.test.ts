import { describe, expect, it } from 'vitest';
import { OFFICIAL_PGA_2025 } from '../data/scpiPgaOfficial2025';
import { formatPgaPercent, getVerifiedPga2025 } from '../utils/scpiPga';

describe('PGA annuelle ASPIM – source et période', () => {
  it('restitue les valeurs officielles du lot de 22 SCPI, sans les recalculer', () => {
    expect(Object.keys(OFFICIAL_PGA_2025)).toHaveLength(22);
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

  it('vérifie les évolutions de prix significatives, sans assimiler la PGA au TD', () => {
    expect(getVerifiedPga2025('Transitions Europe')?.pgaPct).toBe(8.60);
    expect(getVerifiedPga2025('Transitions Europe')?.distributionPct).toBe(7.60);
    expect(getVerifiedPga2025('Sofidynamic')?.pgaPct).toBe(14.04);
    expect(getVerifiedPga2025('Sofidynamic')?.distributionPct).toBe(9.04);
    expect(getVerifiedPga2025('Epsicap Nano')?.pgaPct).toBe(8.27);
    expect(getVerifiedPga2025('Epsicap Nano')?.distributionPct).toBe(7.01);
    expect(getVerifiedPga2025('Cœur d’Europe')?.pgaPct).toBe(8.25);
    expect(getVerifiedPga2025('Cœur d’Europe')?.distributionPct).toBe(6.25);
  });

  it('ne référence que des SCPI actives de la cohorte certifiée et des sources officielles', async () => {
    const cohort = (await import('../data/certified_scpi_cohort.json')).default;
    const allowed = new Set(cohort.slugs);
    const trusted = [
      'www.corum.fr', 'www.iroko.eu', 'alderan.fr', 'www.arkea-reim.com',
      'wemo-reim.fr', 'atland-voisin.com', 'www.sogenial.fr', 'www.sofidy.com',
      'www.altixia.fr', 'pages.inter-gestion.com', 'www.remake.fr', 'epsicap.fr',
    ];
    for (const [slug, record] of Object.entries(OFFICIAL_PGA_2025)) {
      expect(allowed.has(slug)).toBe(true);
      expect(record.sourceLabel.length).toBeGreaterThan(5);
      expect(trusted).toContain(new URL(record.sourceUrl).hostname);
      expect(Math.abs(record.pgaPct - record.distributionPct)).toBeLessThanOrEqual(100);
    }
  });

  it('formate les performances négatives sans masquer le signe', () => {
    expect(formatPgaPercent(-2)).toMatch(/-2,00\s%/);
  });
});
