import { SCPIExtended } from '../data/scpiDataExtended';

export type SectorThreshold = 'any' | '10' | '25' | '50' | '80';

export interface SectorExposure {
  sectorName: string;
  percentage: number;
}

export interface SectorQualification {
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

/**
 * Trouve l'exposition d'une SCPI à un secteur donné (en utilisant les keywords)
 */
export function getSectorExposure(
  scpi: SCPIExtended,
  sectorLabel: string
): SectorExposure | null {
  const sectorKeywords: Record<string, string[]> = {
    'Bureaux': ['bureau', 'tertiaire'],
    'Commerces': ['commerce', 'retail', 'alimentaire', 'galerie'],
    'Logistique': ['logistique', 'entrepôt', 'entrepot', 'activité', 'activite', 'transport', 'messagerie'],
    'Santé': ['santé', 'sante', 'ehpad', 'clinique', 'hôpital', 'hopital', 'médical', 'medical'],
    'Résidentiel': ['résidentiel', 'residentiel', 'logement', 'habitation', 'résidence', 'residence'],
    'Hôtellerie': ['hôtel', 'hotel', 'hotellerie', 'tourisme', 'loisir', 'séminaire', 'seminaire'],
    'Éducation': ['éducation', 'education', 'enseignement', 'école', 'ecole', 'université', 'universite']
  };

  const normalize = (str: string): string => {
    return str.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  };

  const keywords = sectorKeywords[sectorLabel] || [sectorLabel.toLowerCase()];
  let totalExposure = 0;

  // Vérifier dans les secteurs détaillés
  if (scpi.sectors && scpi.sectors.length > 0) {
    scpi.sectors.forEach(sector => {
      const normalizedSectorName = normalize(sector.name);
      keywords.forEach(keyword => {
        if (normalizedSectorName.includes(normalize(keyword))) {
          totalExposure += sector.value;
        }
      });
    });
  }

  // Vérifier aussi dans la catégorie
  const normalizedCategory = normalize(scpi.category);
  keywords.forEach(keyword => {
    if (normalizedCategory.includes(normalize(keyword))) {
      // Si la catégorie correspond, on considère une exposition significative
      // mais on ne l'ajoute pas si on a déjà trouvé des secteurs détaillés
      if (totalExposure === 0) {
        totalExposure = 50; // Estimation par défaut si seule la catégorie correspond
      }
    }
  });

  if (totalExposure === 0) {
    return null;
  }

  return {
    sectorName: sectorLabel,
    percentage: Math.min(100, totalExposure) // Cap à 100%
  };
}

/**
 * Qualifie une SCPI selon son exposition à un secteur donné
 */
export function qualifySectorExposure(
  exposure: SectorExposure | null
): SectorQualification | null {
  if (!exposure) {
    return null;
  }

  const percentage = exposure.percentage;

  if (percentage >= 80) {
    return {
      label: `Pure player ${exposure.sectorName.toLowerCase()}`,
      description: `${percentage.toFixed(0)}% d'exposition`,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20',
      borderColor: 'border-emerald-500/50'
    };
  }

  if (percentage >= 50) {
    return {
      label: `${exposure.sectorName} dominante`,
      description: `${percentage.toFixed(0)}% d'exposition`,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/50'
    };
  }

  if (percentage >= 25) {
    return {
      label: `${exposure.sectorName} significative`,
      description: `${percentage.toFixed(0)}% d'exposition`,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20',
      borderColor: 'border-amber-500/50'
    };
  }

  if (percentage >= 10) {
    return {
      label: `Exposition ${exposure.sectorName.toLowerCase()} modérée`,
      description: `${percentage.toFixed(0)}% d'exposition`,
      color: 'text-slate-400',
      bgColor: 'bg-slate-500/20',
      borderColor: 'border-slate-500/50'
    };
  }

  return {
    label: `Exposition ${exposure.sectorName.toLowerCase()} marginale`,
    description: `${percentage.toFixed(0)}% d'exposition`,
    color: 'text-slate-500',
    bgColor: 'bg-slate-600/10',
    borderColor: 'border-slate-600/30'
  };
}

/**
 * Vérifie si une SCPI correspond au filtre sectoriel avec seuil
 */
export function matchesSectorFilter(
  scpi: SCPIExtended,
  selectedSectors: string[],
  threshold: SectorThreshold
): boolean {
  if (selectedSectors.length === 0) {
    return true;
  }

  const thresholdValue = threshold === 'any' ? 0 : parseInt(threshold);

  // Au moins un secteur sélectionné doit correspondre avec le seuil
  return selectedSectors.some(sectorLabel => {
    const exposure = getSectorExposure(scpi, sectorLabel);
    if (!exposure) {
      return false;
    }
    return exposure.percentage >= thresholdValue;
  });
}

/**
 * Calcule un score de pertinence sectorielle (0-100)
 * Plus le score est élevé, plus la SCPI correspond à l'intention de l'utilisateur
 */
export function calculateSectorRelevanceScore(
  scpi: SCPIExtended,
  selectedSectors: string[],
  threshold: SectorThreshold
): number {
  if (selectedSectors.length === 0) {
    return 50; // Score neutre si aucun filtre
  }

  const thresholdValue = threshold === 'any' ? 0 : parseInt(threshold);
  let maxScore = 0;

  selectedSectors.forEach(sectorLabel => {
    const exposure = getSectorExposure(scpi, sectorLabel);
    if (exposure && exposure.percentage >= thresholdValue) {
      // Score basé sur la correspondance au seuil et le pourcentage
      let score = 50; // Base score
      
      // Bonus si on dépasse le seuil
      const excess = exposure.percentage - thresholdValue;
      score += Math.min(30, excess * 0.6); // Bonus jusqu'à 30 points
      
      // Bonus si pure player ou dominante
      if (exposure.percentage >= 80) {
        score += 20; // Pure player
      } else if (exposure.percentage >= 50) {
        score += 10; // Dominante
      }
      
      maxScore = Math.max(maxScore, score);
    }
  });

  return Math.min(100, maxScore);
}
