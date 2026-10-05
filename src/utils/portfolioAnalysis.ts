import { Scpi } from '../types/scpi';
import { normalizeGeoLabel, normalizeSectorLabel } from './labelNormalization';

export interface PortfolioAnalysis {
  averageYield: number;
  scpiCount: number;
  sectors: string[];
  sectorCount: number;
  geographies: string[];
  geographyCount: number;
  averageTof: number;
  averageDebt: number | null;
  averageDiscount: number | null;
  isrCount: number;
  noFeesCount: number;
  sectorDistribution: Record<string, number>;
  geoDistribution: Record<string, number>;
}

export function analyzePortfolio(
  portfolioScpis: Array<{ scpi: Scpi; allocation: number }>
): PortfolioAnalysis {
  if (portfolioScpis.length === 0) {
    return {
      averageYield: 0,
      scpiCount: 0,
      sectors: [],
      sectorCount: 0,
      geographies: [],
      geographyCount: 0,
      averageTof: 0,
      averageDebt: null,
      averageDiscount: null,
      isrCount: 0,
      noFeesCount: 0,
      sectorDistribution: {},
      geoDistribution: {},
    };
  }

  const averageYield = portfolioScpis.reduce(
    (sum, item) => sum + (item.scpi.yield * item.allocation / 100),
    0
  );

  const averageTof = portfolioScpis.reduce(
    (sum, item) => sum + (item.scpi.tof * item.allocation / 100),
    0
  );

  const debtValues = portfolioScpis
    .map(item => item.scpi.debt !== undefined ? item.scpi.debt * item.allocation / 100 : null)
    .filter((d): d is number => d !== null);
  const averageDebt = debtValues.length > 0
    ? debtValues.reduce((sum, d) => sum + d, 0)
    : null;

  // Une décote non certifiée ne doit pas être transformée implicitement en 0 %.
  const discountEligible = portfolioScpis.filter(item => item.scpi.discountQaStatus === 'publishable');
  const discountWeight = discountEligible.reduce((sum, item) => sum + item.allocation, 0);
  const averageDiscount = discountWeight > 0
    ? discountEligible.reduce((sum, item) => sum + item.scpi.discount * item.allocation, 0) / discountWeight
    : null;

  const sectors = [
    ...new Set(
      portfolioScpis
        .map(item => normalizeSectorLabel(getSectorDisplayName(item.scpi.sector)).label)
        .filter(Boolean)
    )
  ];
  const geographies = [
    ...new Set(
      portfolioScpis
        .map(item => normalizeGeoLabel(getGeographyDisplayName(item.scpi.geography)).label)
        .filter(Boolean)
    )
  ];

  const isrCount = portfolioScpis.filter(item => item.scpi.isr).length;
  const noFeesCount = portfolioScpis.filter(item => item.scpi.fees === 0).length;

  const sectorDistribution: Record<string, number> = {};
  portfolioScpis.forEach(({ scpi, allocation }) => {
    if (scpi.repartitionSector && scpi.repartitionSector.length > 0) {
      scpi.repartitionSector.forEach(sector => {
        const sectorName = normalizeSectorLabel(sector.name).label;
        if (!sectorDistribution[sectorName]) sectorDistribution[sectorName] = 0;
        sectorDistribution[sectorName] += (sector.value * allocation) / 100;
      });
    } else if (scpi.sector) {
      const sectorName = normalizeSectorLabel(getSectorDisplayName(scpi.sector)).label;
      if (!sectorDistribution[sectorName]) sectorDistribution[sectorName] = 0;
      sectorDistribution[sectorName] += allocation;
    }
  });

  const geoDistribution: Record<string, number> = {};
  portfolioScpis.forEach(({ scpi, allocation }) => {
    if (scpi.repartitionGeo && scpi.repartitionGeo.length > 0) {
      scpi.repartitionGeo.forEach(geo => {
        const geoName = normalizeGeoLabel(geo.name).label;
        if (!geoDistribution[geoName]) geoDistribution[geoName] = 0;
        geoDistribution[geoName] += (geo.value * allocation) / 100;
      });
    } else if (scpi.geography) {
      const geoName = normalizeGeoLabel(getGeographyDisplayName(scpi.geography)).label;
      if (!geoDistribution[geoName]) geoDistribution[geoName] = 0;
      geoDistribution[geoName] += allocation;
    }
  });

  return {
    averageYield,
    scpiCount: portfolioScpis.length,
    sectors,
    sectorCount: sectors.length,
    geographies,
    geographyCount: geographies.length,
    averageTof,
    averageDebt,
    averageDiscount,
    isrCount,
    noFeesCount,
    sectorDistribution,
    geoDistribution,
  };
}

function getSectorDisplayName(sector: string): string {
  const sectorNames: Record<string, string> = {
    bureaux: 'Bureaux',
    commerces: 'Commerces',
    residentiel: 'Résidentiel',
    sante: 'Santé',
    logistique: 'Logistique',
    hotellerie: 'Hôtellerie',
    diversifie: 'Diversifié',
  };
  return sectorNames[sector] || 'Autres';
}

function getGeographyDisplayName(geography: string): string {
  const geoNames: Record<string, string> = {
    france: 'France',
    europe: 'Europe',
    international: 'International',
  };
  return geoNames[geography] || 'Autres';
}
