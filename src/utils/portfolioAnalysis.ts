import { Scpi } from '../types/scpi';
import { normalizeGeoLabel, normalizeSectorLabel } from './labelNormalization';

export interface PortfolioAnalysis {
  // Rendement
  averageYield: number; // Rendement moyen pondéré
  
  // Diversification
  scpiCount: number;
  sectors: string[];
  sectorCount: number;
  geographies: string[];
  geographyCount: number;
  
  // Qualité locative
  averageTof: number; // TOF moyen pondéré
  
  // Endettement
  averageDebt: number | null; // Endettement moyen pondéré (peut être null si non disponible)
  
  // Décote
  averageDiscount: number; // Décote moyenne pondérée
  
  // Labels et caractéristiques
  isrCount: number;
  noFeesCount: number;
  
  // Répartition sectorielle (pourcentage)
  sectorDistribution: Record<string, number>;
  
  // Répartition géographique (pourcentage)
  geoDistribution: Record<string, number>;
}

/**
 * Calcule les indicateurs d'analyse d'un portefeuille SCPI
 * @param portfolioScpis Liste des SCPI avec leurs allocations
 * @returns Analyse complète du portefeuille
 */
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
      averageDiscount: 0,
      isrCount: 0,
      noFeesCount: 0,
      sectorDistribution: {},
      geoDistribution: {},
    };
  }

  // Rendement moyen pondéré
  const averageYield = portfolioScpis.reduce(
    (sum, item) => sum + (item.scpi.yield * item.allocation / 100),
    0
  );

  // TOF moyen pondéré
  const averageTof = portfolioScpis.reduce(
    (sum, item) => sum + (item.scpi.tof * item.allocation / 100),
    0
  );

  // Endettement moyen pondéré (si disponible)
  const debtValues = portfolioScpis
    .map(item => item.scpi.debt !== undefined ? item.scpi.debt * item.allocation / 100 : null)
    .filter((d): d is number => d !== null);
  const averageDebt = debtValues.length > 0
    ? debtValues.reduce((sum, d) => sum + d, 0)
    : null;

  // Décote moyenne pondérée
  const averageDiscount = portfolioScpis.reduce(
    (sum, item) => sum + (item.scpi.discount * item.allocation / 100),
    0
  );

  // Diversification
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

  // Labels
  const isrCount = portfolioScpis.filter(item => item.scpi.isr).length;
  const noFeesCount = portfolioScpis.filter(item => item.scpi.fees === 0).length;

  // Répartition sectorielle pondérée
  const sectorDistribution: Record<string, number> = {};
  portfolioScpis.forEach(({ scpi, allocation }) => {
    if (scpi.repartitionSector && scpi.repartitionSector.length > 0) {
      scpi.repartitionSector.forEach(sector => {
        const sectorName = normalizeSectorLabel(sector.name).label;
        if (!sectorDistribution[sectorName]) {
          sectorDistribution[sectorName] = 0;
        }
        sectorDistribution[sectorName] += (sector.value * allocation) / 100;
      });
    } else if (scpi.sector) {
      const sectorName = normalizeSectorLabel(getSectorDisplayName(scpi.sector)).label;
      if (!sectorDistribution[sectorName]) {
        sectorDistribution[sectorName] = 0;
      }
      sectorDistribution[sectorName] += allocation;
    }
  });

  // Répartition géographique pondérée
  const geoDistribution: Record<string, number> = {};
  portfolioScpis.forEach(({ scpi, allocation }) => {
    if (scpi.repartitionGeo && scpi.repartitionGeo.length > 0) {
      scpi.repartitionGeo.forEach(geo => {
        const geoName = normalizeGeoLabel(geo.name).label;
        if (!geoDistribution[geoName]) {
          geoDistribution[geoName] = 0;
        }
        geoDistribution[geoName] += (geo.value * allocation) / 100;
      });
    } else if (scpi.geography) {
      const geoName = normalizeGeoLabel(getGeographyDisplayName(scpi.geography)).label;
      if (!geoDistribution[geoName]) {
        geoDistribution[geoName] = 0;
      }
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
    'bureaux': 'Bureaux',
    'commerces': 'Commerces',
    'residentiel': 'Résidentiel',
    'sante': 'Santé',
    'logistique': 'Logistique',
    'hotellerie': 'Hôtellerie',
    'diversifie': 'Diversifié'
  };
  return sectorNames[sector] || 'Autres';
}

function getGeographyDisplayName(geography: string): string {
  const geoNames: Record<string, string> = {
    'france': 'France',
    'europe': 'Europe',
    'international': 'International'
  };
  return geoNames[geography] || 'Autres';
}
