/**
 * Score de diversification structurelle de portefeuille SCPI.
 *
 * Indicateur pédagogique combinant :
 * - le nombre de SCPI
 * - la répartition sectorielle et sa concentration
 * - la répartition géographique et sa concentration
 * - le nombre de sociétés de gestion (si disponible)
 *
 * Retourne un score 0-100, un nombre d'étoiles 1-5 et un libellé.
 */

export interface DiversificationInput {
  /** Nombre de SCPI dans le portefeuille */
  scpiCount: number;
  /** Nombre de secteurs distincts après normalisation */
  sectorCount: number;
  /** Poids du plus gros secteur en % (0-100) */
  maxSectorWeight: number;
  /** Nombre de zones géographiques distinctes après normalisation */
  geographyCount: number;
  /** Poids de la plus grosse zone en % (0-100) */
  maxGeoWeight: number;
  /** Nombre de sociétés de gestion distinctes (optionnel) */
  managementCompanyCount?: number;
}

export interface DiversificationResult {
  /** Score normalisé de 0 à 100 */
  score: number;
  /** Nombre d'étoiles de 1 à 5 */
  stars: number;
  /** Libellé dynamique */
  label: string;
  /** Détail des sous-scores (pour affichage éventuel) */
  details: {
    scpiCount: number;
    sectorCount: number;
    geographyCount: number;
    maxSectorWeight: number;
    maxGeoWeight: number;
    managementCompanyCount: number;
  };
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function scpiCountScore(count: number): number {
  if (count >= 5) return 20;
  if (count >= 4) return 18;
  if (count >= 3) return 15;
  if (count >= 2) return 10;
  return 5;
}

function sectorCountScore(count: number): number {
  if (count >= 5) return 15;
  if (count >= 4) return 13;
  if (count >= 3) return 10;
  if (count >= 2) return 6;
  return 2;
}

function sectorConcentrationScore(maxWeight: number): number {
  if (maxWeight <= 30) return 25;
  if (maxWeight <= 40) return 20;
  if (maxWeight <= 50) return 14;
  if (maxWeight <= 60) return 8;
  return 3;
}

function geographyCountScore(count: number): number {
  if (count >= 4) return 10;
  if (count >= 3) return 8;
  if (count >= 2) return 5;
  return 2;
}

function geographyConcentrationScore(maxWeight: number): number {
  if (maxWeight <= 35) return 20;
  if (maxWeight <= 50) return 15;
  if (maxWeight <= 65) return 9;
  return 4;
}

function managementCompanyScore(count: number): number {
  if (count >= 4) return 10;
  if (count >= 3) return 7;
  if (count >= 2) return 4;
  return 2;
}

function scoreToStars(score: number): number {
  if (score >= 80) return 5;
  if (score >= 65) return 4;
  if (score >= 50) return 3;
  if (score >= 35) return 2;
  return 1;
}

function scoreToLabel(stars: number): string {
  switch (stars) {
    case 5: return 'Diversification élevée';
    case 4: return 'Portefeuille diversifié';
    case 3: return 'Diversification correcte';
    case 2: return 'Diversification limitée';
    default: return 'Portefeuille très concentré';
  }
}

export function computePortfolioDiversificationScore(
  input: DiversificationInput
): DiversificationResult {
  const {
    scpiCount,
    sectorCount,
    maxSectorWeight,
    geographyCount,
    maxGeoWeight,
    managementCompanyCount,
  } = input;

  const subScores = {
    scpi: scpiCountScore(clamp(scpiCount, 1, 999)),
    sectorCount: sectorCountScore(clamp(sectorCount, 1, 999)),
    sectorConcentration: sectorConcentrationScore(clamp(maxSectorWeight, 0, 100)),
    geographyCount: geographyCountScore(clamp(geographyCount, 1, 999)),
    geographyConcentration: geographyConcentrationScore(clamp(maxGeoWeight, 0, 100)),
    managementCompany: 0,
  };

  // Brique sociétés de gestion : incluse uniquement si la donnée est disponible
  const hasManagementCompany = managementCompanyCount != null && managementCompanyCount > 0;
  if (hasManagementCompany) {
    subScores.managementCompany = managementCompanyScore(clamp(managementCompanyCount!, 1, 999));
  }

  const rawMax = hasManagementCompany ? 100 : 90;
  const rawScore = subScores.scpi
    + subScores.sectorCount
    + subScores.sectorConcentration
    + subScores.geographyCount
    + subScores.geographyConcentration
    + subScores.managementCompany;

  const score = Math.round((rawScore / rawMax) * 100);
  const clampedScore = clamp(score, 1, 100);
  const stars = scoreToStars(clampedScore);
  const label = scoreToLabel(stars);

  return {
    score: clampedScore,
    stars,
    label,
    details: {
      scpiCount,
      sectorCount,
      geographyCount,
      maxSectorWeight,
      maxGeoWeight,
      managementCompanyCount: managementCompanyCount ?? 0,
    },
  };
}

/**
 * Helper : extrait les métriques de diversification depuis une liste de SCPI.
 * Chaque SCPI doit avoir `sectors?: Array<{name, value}>`, `geography?: Array<{name, value}>`
 * et `managementCompany?: string`.
 *
 * Pour un portefeuille à pondérations personnalisées, passer `percentages` (id -> %).
 * Sinon, répartition égale par défaut.
 */
export function extractDiversificationMetrics(
  scpis: Array<{
    id?: number;
    sectors?: Array<{ name: string; value: number }>;
    geography?: Array<{ name: string; value: number }>;
    managementCompany?: string;
    name?: string;
  }>,
  percentages?: Record<number, number>
): {
  scpiCount: number;
  sectorCount: number;
  maxSectorWeight: number;
  geographyCount: number;
  maxGeoWeight: number;
  managementCompanyCount: number;
} {
  const n = scpis.length;
  if (n === 0) {
    return {
      scpiCount: 0,
      sectorCount: 0,
      maxSectorWeight: 0,
      geographyCount: 0,
      maxGeoWeight: 0,
      managementCompanyCount: 0,
    };
  }

  const sectorMap = new Map<string, number>();
  const geoMap = new Map<string, number>();
  const companies = new Set<string>();
  let hasAnyManagementCompany = false;

  scpis.forEach((scpi, i) => {
    const weight = percentages && scpi.id != null
      ? (percentages[scpi.id] ?? (100 / n))
      : (100 / n);

    // Secteurs
    if (scpi.sectors && scpi.sectors.length > 0) {
      scpi.sectors.forEach(s => {
        const current = sectorMap.get(s.name) ?? 0;
        sectorMap.set(s.name, current + (s.value * weight) / 100);
      });
    }

    // Géographie
    if (scpi.geography && scpi.geography.length > 0) {
      scpi.geography.forEach(g => {
        const current = geoMap.get(g.name) ?? 0;
        geoMap.set(g.name, current + (g.value * weight) / 100);
      });
    }

    // Société de gestion
    if (scpi.managementCompany && scpi.managementCompany.trim()) {
      companies.add(scpi.managementCompany.trim());
      hasAnyManagementCompany = true;
    }
  });

  const sectorValues = Array.from(sectorMap.values());
  const geoValues = Array.from(geoMap.values());

  return {
    scpiCount: n,
    sectorCount: sectorMap.size,
    maxSectorWeight: sectorValues.length > 0 ? Math.round(Math.max(...sectorValues) * 10) / 10 : 0,
    geographyCount: geoMap.size,
    maxGeoWeight: geoValues.length > 0 ? Math.round(Math.max(...geoValues) * 10) / 10 : 0,
    managementCompanyCount: hasAnyManagementCompany ? companies.size : 0,
  };
}
