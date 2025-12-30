/**
 * Module commun pour le calcul des rendements et revalorisations SCPI
 * selon la répartition géographique France / Europe
 */

// ============================================================================
// CONSTANTES DE RENDEMENT PAR ZONE GÉOGRAPHIQUE
// ============================================================================

export const GROSS_YIELD_FRANCE_DEFAULT = 0.055; // 5,5 % brut annuel
export const GROSS_YIELD_EUROPE_DEFAULT = 0.065; // 6,5 % brut annuel

export const REVAL_FRANCE_DEFAULT = 0.00; // 0 % revalorisation annuelle
export const REVAL_EUROPE_DEFAULT = 0.00; // 0 % revalorisation annuelle

// ============================================================================
// SCÉNARIOS GÉOGRAPHIQUES PRÉ-PARAMÉTRÉS
// ============================================================================

export type GeoScenarioId = "FR_100" | "EU_100" | "FR50_EU50" | "FR30_EU70" | "FR70_EU30";

export interface GeoScenario {
  id: GeoScenarioId;
  label: string;
  description: string;
  partFrance: number; // 0 à 1
  partEurope: number; // 0 à 1
}

export const GEO_SCENARIOS: GeoScenario[] = [
  {
    id: "FR_100",
    label: "100 % France",
    description: "Patrimoine immobilier exclusivement français",
    partFrance: 1.0,
    partEurope: 0.0
  },
  {
    id: "EU_100",
    label: "100 % Europe",
    description: "Patrimoine immobilier exclusivement européen (hors France)",
    partFrance: 0.0,
    partEurope: 1.0
  },
  {
    id: "FR50_EU50",
    label: "50 % France / 50 % Europe",
    description: "Répartition équilibrée France/Europe",
    partFrance: 0.5,
    partEurope: 0.5
  },
  {
    id: "FR70_EU30",
    label: "70 % France / 30 % Europe",
    description: "Dominante française avec diversification européenne",
    partFrance: 0.7,
    partEurope: 0.3
  },
  {
    id: "FR30_EU70",
    label: "30 % France / 70 % Europe",
    description: "Dominante européenne avec ancrage français",
    partFrance: 0.3,
    partEurope: 0.7
  }
];

// ============================================================================
// FONCTION DE CALCUL PONDÉRÉ
// ============================================================================

export interface YieldRevalParams {
  geoScenario: GeoScenario;
  grossYieldFrance?: number;   // optionnel, sinon défaut 5,5 %
  grossYieldEurope?: number;   // optionnel, sinon défaut 6,5 %
  revalFrance?: number;        // optionnel, sinon REVAL_FRANCE_DEFAULT
  revalEurope?: number;        // optionnel, sinon REVAL_EUROPE_DEFAULT
}

export interface YieldRevalResult {
  grossYieldWeighted: number;  // rendement brut annuel pondéré (0-1)
  revalWeighted: number;       // revalorisation annuelle pondérée (0-1)
  partFrance: number;          // part France (0-1)
  partEurope: number;          // part Europe (0-1)
  grossYieldFranceUsed: number; // rendement France utilisé
  grossYieldEuropeUsed: number; // rendement Europe utilisé
}

/**
 * Calcule le rendement brut et la revalorisation pondérés selon la répartition géographique
 */
export function computeYieldAndReval(params: YieldRevalParams): YieldRevalResult {
  const {
    geoScenario,
    grossYieldFrance = GROSS_YIELD_FRANCE_DEFAULT,
    grossYieldEurope = GROSS_YIELD_EUROPE_DEFAULT,
    revalFrance = REVAL_FRANCE_DEFAULT,
    revalEurope = REVAL_EUROPE_DEFAULT,
  } = params;

  const { partFrance, partEurope } = geoScenario;

  // Calcul pondéré du rendement brut
  const grossYieldWeighted =
    partFrance * grossYieldFrance + partEurope * grossYieldEurope;

  // Calcul pondéré de la revalorisation
  const revalWeighted =
    partFrance * revalFrance + partEurope * revalEurope;

  return {
    grossYieldWeighted,
    revalWeighted,
    partFrance,
    partEurope,
    grossYieldFranceUsed: grossYieldFrance,
    grossYieldEuropeUsed: grossYieldEurope
  };
}

/**
 * Helper pour obtenir un scénario géographique par son ID
 */
export function getGeoScenarioById(id: GeoScenarioId): GeoScenario {
  const scenario = GEO_SCENARIOS.find(s => s.id === id);
  if (!scenario) {
    throw new Error(`Scénario géographique introuvable : ${id}`);
  }
  return scenario;
}

/**
 * Helper pour formater le rendement en pourcentage
 */
export function formatYieldPercent(value: number): string {
  return `${(value * 100).toFixed(2)} %`;
}
