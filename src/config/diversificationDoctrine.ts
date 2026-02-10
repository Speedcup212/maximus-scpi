export const DIVERSIFICATION_DOCTRINE = {
  thresholds: {
    concentratedMax: 4,
    moderateMin: 5,
    moderateMax: 6,
    wellDiversified: 7,
    veryWellDiversified: 8,
  },
  neutralizeAlertsAt: {
    sectors: 8,
    countries: 8,
  },
};

export const isVeryWellDiversified = (sectorCount: number, countryCount: number): boolean => {
  return (
    sectorCount >= DIVERSIFICATION_DOCTRINE.neutralizeAlertsAt.sectors &&
    countryCount >= DIVERSIFICATION_DOCTRINE.neutralizeAlertsAt.countries
  );
};
