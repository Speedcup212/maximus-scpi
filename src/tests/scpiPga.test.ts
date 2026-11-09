import { describe, expect, it } from 'vitest';
import { OFFICIAL_PGA_2025, PGA_2025_DOCUMENTARY_EXCEPTIONS } from '../data/scpiPgaOfficial2025';
import { compareVerified2025Distribution, formatPgaPercent, getVerifiedPga2025, getPgaDocumentaryException } from '../utils/scpiPga';

describe('PGA annuelle ASPIM – source et période', () => {
  it('restitue les valeurs officielles du lot de 67 SCPI, sans les recalculer', () => {
    expect(Object.keys(OFFICIAL_PGA_2025)).toHaveLength(67);
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
      expect(record.distributionPct === null || Number.isFinite(record.distributionPct)).toBe(true);
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
      'www.aestiam.com', 'paref-gestion.com', 'www.perial.com', 'www.praemia-healthcare.fr',
      'www.sogenial.fr', 'atream.com', 'edr-europa.com', 'www.euryale-am.fr',
      'reim.bnpparibas-am.com', 'www.la-francaise.com',
      'www.altarea-im.com', 'www.fiducial-gerance.fr', 'www.normacapital.fr',
      'fr.swisslife-am.com', 'www.consultim-am.com', 'www.novaxia-investissement.fr', 'theoreim.com',
      'kyaneosam.com', 'www.groupemagellim.com', 'www.urban-coeurcommerce.com', 'www.praemiareim.fr',
      'www.amundi-immobilier.com', 'www.primaliance.com', 'www.lafrancaise-am-partenaires.com',
    ];
    for (const [slug, record] of Object.entries(OFFICIAL_PGA_2025)) {
      expect(allowed.has(slug)).toBe(true);
      expect(record.sourceLabel.length).toBeGreaterThan(5);
      expect(trusted).toContain(new URL(record.sourceUrl).hostname);
      if (record.distributionPct !== null) {
        expect(Math.abs(record.pgaPct - record.distributionPct)).toBeLessThanOrEqual(100);
      }
    }
  });

  it('expose des PGA négatives plutôt que de masquer la baisse du prix de part', () => {
    expect(getVerifiedPga2025('Paref Hexa')?.pgaPct).toBe(-12.10);
    expect(getVerifiedPga2025('Paref Hexa')?.distributionPct).toBe(6.00);
    expect(getVerifiedPga2025('Novapierre Résidentiel')?.pgaPct).toBe(-41.53);
    expect(getVerifiedPga2025('Novapierre Résidentiel')?.distributionPct).toBe(1.50);
    expect(getVerifiedPga2025('Primovie')?.pgaPct).toBe(-7.31);
    expect(getVerifiedPga2025('Primovie')?.distributionPct).toBe(4.04);
    expect(getVerifiedPga2025('Patrimmo Commerce')?.pgaPct).toBe(-5.71);
    expect(getVerifiedPga2025('Aestiam Agora')?.distributionPct).toBe(4.50);
    expect(getVerifiedPga2025('Aestiam Horizon')?.pgaPct).toBe(5.10);
  });

  it('associe les noms des sociétés de gestion aux slugs certifiés', () => {
    expect(getVerifiedPga2025('Cœur de Régions')?.distributionPct).toBe(6.20);
    expect(getVerifiedPga2025('Atream Hôtels')?.pgaPct).toBe(5.05);
    expect(getVerifiedPga2025('Edmond de Rothschild Europa')?.pgaPct).toBe(8.75);
    expect(getVerifiedPga2025('EdR Europa')?.pgaPct).toBe(8.75);
    expect(getVerifiedPga2025('Pierval Santé')?.pgaPct).toBe(4.06);
  });

  it('couple les TD/PGA historiques sans confondre les valeurs courantes des autres champs', () => {
    expect(getVerifiedPga2025('Accès Valeur Pierre')?.pgaPct).toBe(3.85);
    expect(getVerifiedPga2025('Accimmo Pierre')?.distributionPct).toBe(4.77);
    expect(getVerifiedPga2025('LF Europimmo')?.pgaPct).toBe(4.63);
    expect(getVerifiedPga2025('LF Grand Paris Patrimoine')?.pgaPct).toBe(4.66);
    expect(getVerifiedPga2025('LF Avenir Santé')?.distributionPct).toBe(5.08);
    expect(getVerifiedPga2025('Épargne Foncière')?.pgaPct).toBe(4.86);
  });

  it('retient l’appréciation annuelle réelle des gestionnaires', () => {
    expect(getVerifiedPga2025('Alta Convictions')?.pgaPct).toBe(7.55);
    expect(getVerifiedPga2025('Alta Convictions')?.distributionPct).toBe(6.57);
    expect(getVerifiedPga2025('Buroboutic Métropoles')?.pgaPct).toBe(5.10);
    expect(getVerifiedPga2025('Ficommerce Proximité')?.distributionPct).toBe(5.10);
    expect(getVerifiedPga2025('Sélectipierre 2')?.pgaPct).toBe(4.14);
  });

  it('ne confond jamais le TD 2025 et la PGA 2025 de NCAP Régions', () => {
    expect(getVerifiedPga2025('NCap Régions')?.pgaPct).toBe(7.51);
    expect(getVerifiedPga2025('NCap Régions')?.distributionPct).toBe(5.72);
    expect(getVerifiedPga2025('NCap Education Santé')?.distributionPct).toBe(4.52);
    expect(getVerifiedPga2025('NCap Continent')?.pgaPct).toBe(7.10);
  });

  it('prend les pertes de prix en compte et vérifie les quatre sources additionnelles', () => {
    expect(getVerifiedPga2025('ESG Pierre Capitale')?.pgaPct).toBe(-3.24);
    expect(getVerifiedPga2025('ESG Pierre Capitale')?.distributionPct).toBe(5.05);
    expect(getVerifiedPga2025('Optimale')?.pgaPct).toBe(8.50);
    expect(getVerifiedPga2025('Optimale')?.distributionPct).toBe(6.50);
    expect(getVerifiedPga2025('Novaxia NEO')?.pgaPct).toBe(5.50);
    expect(getVerifiedPga2025('LOG IN')?.pgaPct).toBe(8.21);
    expect(getVerifiedPga2025('LOG IN')?.distributionPct).toBe(6.21);
  });

  it('conserve les PGA 2025 sourcées, y compris quand le TD est non applicable', () => {
    expect(getVerifiedPga2025('Kyaneos Pierre')?.pgaPct).toBe(5.25);
    expect(getVerifiedPga2025('Kyaneos Pierre')?.distributionPct).toBe(4.35);
    expect(getVerifiedPga2025('Foncière des Praticiens')?.pgaPct).toBe(5.50);
    expect(getVerifiedPga2025('Urban Cœur de Commerce')?.pgaPct).toBe(6.30);
    expect(getVerifiedPga2025('Urban Cœur de Commerce')?.distributionPct).toBe(5.30);
    expect(getVerifiedPga2025('Patrimmo Croissance Impact')?.pgaPct).toBe(-7.68);
    expect(getVerifiedPga2025('Patrimmo Croissance Impact')?.distributionPct).toBeNull();
    expect(compareVerified2025Distribution('Patrimmo Croissance Impact', 'Iroko Zen')).toBe(1);
    expect(compareVerified2025Distribution('Patrimmo Croissance Impact', 'SCPI inconnue')).toBe(0);
  });

  it('vérifie Sofiprime à capital fixe et les deux SCPI de bureaux Amundi', () => {
    expect(getVerifiedPga2025('Sofiprime')?.pgaPct).toBe(0.54);
    expect(getVerifiedPga2025('Sofiprime')?.distributionPct).toBe(0.54);
    expect(getVerifiedPga2025('Edissimmo')?.pgaPct).toBe(-6.31);
    expect(getVerifiedPga2025('Edissimmo')?.distributionPct).toBe(3.63);
    expect(getVerifiedPga2025('Rivoli Avenir Patrimoine')?.pgaPct).toBe(-5.34);
    expect(getVerifiedPga2025('Rivoli Avenir Patrimoine')?.distributionPct).toBe(3.46);
    expect(getVerifiedPga2025('Crédit Mutuel Pierre 1')?.pgaPct).toBe(4.49);
    expect(getVerifiedPga2025('Crédit Mutuel Pierre 1')?.distributionPct).toBe(4.49);
  });

  it('classe les valeurs documentées avant les manquantes sans NaN', () => {
    expect(compareVerified2025Distribution('SCPI inconnue A', 'SCPI inconnue B')).toBe(0);
    expect(compareVerified2025Distribution('Iroko Zen', 'SCPI inconnue A')).toBe(-1);
    expect(compareVerified2025Distribution('SCPI inconnue A', 'Iroko Zen')).toBe(1);
    expect(compareVerified2025Distribution('Iroko Atlas', 'Iroko Zen')).toBeLessThan(0);
    expect(compareVerified2025Distribution('Cœur d’Europe', 'SCPI inconnue')).toBe(-1);
    expect(getVerifiedPga2025('Altixia Cadence XII')?.distributionPct).toBe(5.15);
  });

  it('garantit une situation explicite pour les 69 SCPI sans PGA inventée', async () => {
    const cohort = (await import('../data/certified_scpi_cohort.json')).default;
    const official = Object.keys(OFFICIAL_PGA_2025);
    const exceptions = Object.keys(PGA_2025_DOCUMENTARY_EXCEPTIONS);
    expect(official.length).toBe(67);
    expect(exceptions).toHaveLength(2);
    expect(new Set([...official, ...exceptions]).size).toBe(69);
    expect([...official, ...exceptions].sort()).toEqual([...cohort.slugs].sort());
    for (const slug of exceptions) {
      expect(getVerifiedPga2025(slug)).toBeNull();
      expect(getPgaDocumentaryException(slug)?.sourceUrl).toMatch(/^https:\/\//);
      expect(getPgaDocumentaryException(slug)?.reason.length).toBeGreaterThan(40);
    }
    expect(getVerifiedPga2025('Remake UK 2025')).toBeNull();
    expect(getPgaDocumentaryException('Remake UK 2025')?.reason).toContain('écourté');
  });

  it('formate les performances négatives sans masquer le signe', () => {
    expect(formatPgaPercent(-2)).toMatch(/-2,00\s%/);
  });
});
