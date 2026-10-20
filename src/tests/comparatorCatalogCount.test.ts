import { describe, expect, it } from 'vitest';
import certifiedScpiCohort from '../data/certified_scpi_cohort.json';
import { scpiDataExtended } from '../data/scpiDataExtended';
import { createSlugFromName } from '../utils/scpiSlugMapper';

describe('Comparateur : cohérence du catalogue publié et des résultats', () => {
  it('charge exactement les 65 fiches certifiées sans doublon', () => {
    const listed = scpiDataExtended.map((scpi) => createSlugFromName(scpi.name));
    expect(listed).toHaveLength(certifiedScpiCohort.count);
    expect(new Set(listed).size).toBe(listed.length);
    expect(new Set(listed)).toEqual(new Set(certifiedScpiCohort.slugs));
  });

  it.each(['corum-eurion', 'corum-origin', 'corum-usa', 'corum-xl'])(
    'publie %s dans les outils grand public avec les données nécessaires',
    (slug) => {
      const fund = scpiDataExtended.find((scpi) => createSlugFromName(scpi.name) === slug);
      expect(fund).toBeDefined();
      expect(fund!.price).toBeGreaterThan(0);
      expect(fund!.yield).toBeGreaterThan(0);
      expect(fund!.tof).toBeGreaterThanOrEqual(0);
      expect(fund!.geography.length).toBeGreaterThan(0);
      expect(fund!.sectors.length).toBeGreaterThan(0);
    }
  );
});
