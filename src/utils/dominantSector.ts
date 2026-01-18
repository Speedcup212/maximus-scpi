import { SCPIExtended } from '../data/scpiDataExtended';

export interface DominantSectorInfo {
  sectorName: string;
  percentage: number;
  qualification: 'pure-player' | 'dominant' | 'diversified';
  label: string;
}

/**
 * Détermine le secteur dominant d'une SCPI
 * Un secteur est considéré comme dominant s'il représente ≥40% du patrimoine
 * Si aucun secteur n'atteint 40%, la SCPI est considérée comme "Diversifiée"
 */
export function getDominantSector(scpi: SCPIExtended): DominantSectorInfo {
  if (!scpi.sectors || scpi.sectors.length === 0) {
    return {
      sectorName: 'Diversifiée',
      percentage: 0,
      qualification: 'diversified',
      label: 'Diversifiée (aucun secteur > 35%)'
    };
  }

  // Trier les secteurs par pourcentage décroissant
  const sortedSectors = [...scpi.sectors].sort((a, b) => b.value - a.value);
  const topSector = sortedSectors[0];

  // Mapping des noms de secteurs vers les catégories principales
  const normalizeSectorName = (name: string): string => {
    const lower = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    if (lower.includes('sante') || lower.includes('ehpad') || lower.includes('clinique') || 
        lower.includes('hopital') || lower.includes('medical')) {
      return 'Santé';
    }
    if (lower.includes('bureau') && !lower.includes('commerce')) {
      return 'Bureaux';
    }
    if (lower.includes('logistique') || lower.includes('entrepot') || 
        lower.includes('activite') || lower.includes('transport')) {
      return 'Logistique';
    }
    if (lower.includes('commerce') || lower.includes('retail') || 
        lower.includes('alimentaire') || lower.includes('galerie')) {
      return 'Commerces';
    }
    if (lower.includes('residentiel') || lower.includes('logement') || 
        lower.includes('habitation') || lower.includes('residence')) {
      return 'Résidentiel';
    }
    if (lower.includes('hotel') || lower.includes('hotellerie') || 
        lower.includes('tourisme') || lower.includes('loisir') || lower.includes('seminaire')) {
      return 'Hôtellerie';
    }
    if (lower.includes('education') || lower.includes('enseignement') || 
        lower.includes('ecole') || lower.includes('universite')) {
      return 'Éducation';
    }
    
    return name; // Garder le nom original si non reconnu
  };

  const dominantSectorName = normalizeSectorName(topSector.name);
  const percentage = topSector.value;

  // Qualification selon le pourcentage
  if (percentage >= 80) {
    return {
      sectorName: dominantSectorName,
      percentage,
      qualification: 'pure-player',
      label: `${dominantSectorName} (pure player ≥80%)`
    };
  }

  if (percentage >= 40) {
    return {
      sectorName: dominantSectorName,
      percentage,
      qualification: 'dominant',
      label: `${dominantSectorName} (dominant ≥40%)`
    };
  }

  // Si aucun secteur n'atteint 40%, c'est diversifié
  return {
    sectorName: 'Diversifiée',
    percentage: 0,
    qualification: 'diversified',
    label: 'Diversifiée (aucun secteur > 35%)'
  };
}

/**
 * Groupe les SCPI par secteur dominant
 */
export function groupScpisByDominantSector(
  scpis: Array<{ scpi: SCPIExtended; slug?: string; scpiName?: string }>
): Record<string, Array<{ scpi: SCPIExtended; slug?: string; scpiName?: string }>> {
  const grouped: Record<string, Array<{ scpi: SCPIExtended; slug?: string; scpiName?: string }>> = {};

  scpis.forEach(item => {
    const dominantSector = getDominantSector(item.scpi);
    const sectorKey = dominantSector.sectorName;

    if (!grouped[sectorKey]) {
      grouped[sectorKey] = [];
    }

    grouped[sectorKey].push(item);
  });

  // Trier les SCPI dans chaque groupe par rendement décroissant
  Object.keys(grouped).forEach(sector => {
    grouped[sector].sort((a, b) => b.scpi.yield - a.scpi.yield);
  });

  return grouped;
}

/**
 * Ordre d'affichage des secteurs dans le menu
 */
export const SECTOR_DISPLAY_ORDER = [
  'Santé',
  'Bureaux',
  'Logistique',
  'Commerces',
  'Résidentiel',
  'Hôtellerie',
  'Éducation',
  'Diversifiée'
];
