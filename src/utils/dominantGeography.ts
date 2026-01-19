import { SCPIExtended } from '../data/scpiDataExtended';

export interface DominantGeographyInfo {
  geographyName: string;
  percentage: number;
  qualification: 'pure-player' | 'dominant' | 'diversified';
  label: string;
}

/**
 * Détermine la géographie dominante d'une SCPI
 * Une géographie est considérée comme dominante si elle représente ≥50% du patrimoine
 * Si aucune géographie n'atteint 50%, la SCPI est considérée comme "Diversifiée géographiquement"
 */
export function getDominantGeography(scpi: SCPIExtended): DominantGeographyInfo {
  if (!scpi.geography || scpi.geography.length === 0) {
    return {
      geographyName: 'Non spécifiée',
      percentage: 0,
      qualification: 'diversified',
      label: 'Géographie non spécifiée'
    };
  }

  // Trier les géographies par pourcentage décroissant
  const sortedGeographies = [...scpi.geography].sort((a, b) => b.value - a.value);
  const topGeography = sortedGeographies[0];

  // Mapping des noms de géographies vers les catégories principales
  const normalizeGeographyName = (name: string): string => {
    const lower = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // France
    if (lower.includes('france') || lower.includes('paris') || lower.includes('région') || 
        lower.includes('region') || lower.includes('idf') || lower.includes('ile-de-france') ||
        lower.includes('dorsale') || lower.includes('métropol') || lower.includes('metropol') ||
        lower.includes('atlantique') || lower.includes('parisienne')) {
      return 'France';
    }
    
    // Europe (hors France)
    if (lower.includes('allemagne') || lower.includes('espagne') || lower.includes('italie') ||
        lower.includes('belgique') || lower.includes('pays-bas') || lower.includes('pays bas') ||
        lower.includes('portugal') || lower.includes('pologne') || lower.includes('irlande') ||
        lower.includes('pays-bas') || lower.includes('royaume') || lower.includes('uk') ||
        lower.includes('europe') && !lower.includes('france')) {
      return 'Europe';
    }
    
    // International (hors Europe)
    if (lower.includes('étranger') || lower.includes('etranger') || lower.includes('ocde') ||
        lower.includes('international') || lower.includes('usa') || lower.includes('etats-unis') ||
        lower.includes('asie') || lower.includes('singapour') || lower.includes('japon')) {
      return 'International';
    }
    
    return name; // Garder le nom original si non reconnu
  };

  const dominantGeographyName = normalizeGeographyName(topGeography.name);
  const percentage = topGeography.value;

  // Qualification selon le pourcentage
  if (percentage >= 80) {
    return {
      geographyName: dominantGeographyName,
      percentage,
      qualification: 'pure-player',
      label: `${dominantGeographyName} (pure player ≥80%)`
    };
  }

  if (percentage >= 50) {
    return {
      geographyName: dominantGeographyName,
      percentage,
      qualification: 'dominant',
      label: `${dominantGeographyName} (dominant ≥50%)`
    };
  }

  // Si aucune géographie n'atteint 50%, c'est diversifié
  return {
    geographyName: 'Diversifiée géographiquement',
    percentage: 0,
    qualification: 'diversified',
    label: 'Diversifiée géographiquement (aucune zone > 50%)'
  };
}

/**
 * Groupe les SCPI par géographie dominante
 * Note: "Diversifiée géographiquement" est regroupée avec "Europe"
 */
export function groupScpisByDominantGeography(
  scpis: Array<{ scpi: SCPIExtended; slug?: string; scpiName?: string }>
): Record<string, Array<{ scpi: SCPIExtended; slug?: string; scpiName?: string }>> {
  const grouped: Record<string, Array<{ scpi: SCPIExtended; slug?: string; scpiName?: string }>> = {};

  scpis.forEach(item => {
    const dominantGeography = getDominantGeography(item.scpi);
    let geographyKey = dominantGeography.geographyName;

    // Regrouper "Diversifiée géographiquement" avec "Europe"
    if (geographyKey === 'Diversifiée géographiquement') {
      geographyKey = 'Europe';
    }

    if (!grouped[geographyKey]) {
      grouped[geographyKey] = [];
    }

    grouped[geographyKey].push(item);
  });

  // Trier les SCPI dans chaque groupe par rendement décroissant
  Object.keys(grouped).forEach(geography => {
    grouped[geography].sort((a, b) => b.scpi.yield - a.scpi.yield);
  });

  return grouped;
}

/**
 * Ordre d'affichage des géographies dans le menu
 * Note: "Diversifiée géographiquement" est regroupée avec "Europe"
 */
export const GEOGRAPHY_DISPLAY_ORDER = [
  'France',
  'Europe', // Inclut aussi les SCPI "Diversifiée géographiquement"
  'International',
  'Non spécifiée'
];
