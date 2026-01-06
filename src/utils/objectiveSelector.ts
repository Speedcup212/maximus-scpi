import { Scpi, ObjectiveType } from '../types/scpi';
import { InvestmentObjective } from '../types/scpi';

export interface ObjectiveSelection {
  selectedScpi: Scpi[];
  message: string;
  strategy: string;
}

export const INVESTMENT_OBJECTIVES: InvestmentObjective[] = [
  {
    id: 'revenus',
    name: 'Générer des revenus',
    description: 'Privilégier les distributions régulières et élevées',
    icon: '💰',
    color: '#10b981',
    criteria: {
      minYield: 5.0,
      preferredSectors: ['commerces', 'sante', 'bureaux'],
      maxSingleAllocation: 30
    }
  },
  {
    id: 'capitaliser',
    name: 'Capitaliser',
    description: 'Optimiser la valorisation du patrimoine à long terme',
    icon: '📈',
    color: '#3b82f6',
    criteria: {
      minYield: 4.0,
      preferredSectors: ['bureaux', 'logistique', 'residentiel'],
      preferredGeography: ['europe', 'international'],
      maxSingleAllocation: 35
    }
  },
  {
    id: 'diversifier',
    name: 'Diversifier',
    description: 'Répartir les risques sur plusieurs secteurs et zones',
    icon: '🎯',
    color: '#8b5cf6',
    criteria: {
      minYield: 3.5,
      preferredSectors: ['bureaux', 'commerces', 'sante', 'logistique'],
      preferredGeography: ['france', 'europe'],
      maxSingleAllocation: 25
    }
  },
  {
    id: 'fiscalite',
    name: 'Optimiser la fiscalité',
    description: 'Minimiser l\'impact fiscal selon votre TMI',
    icon: '🏛️',
    color: '#f59e0b',
    criteria: {
      minYield: 4.5,
      preferredGeography: ['europe', 'international'],
      maxSingleAllocation: 40
    }
  }
];

export const applyObjective = (
  objective: ObjectiveType, 
  tmi: number, 
  availableScpi: Scpi[]
): ObjectiveSelection => {
  let filteredScpi: Scpi[] = [];
  let message = '';
  let strategy = '';

  // Filtrage selon la TMI
  const isLowTmi = tmi <= 11;
  const isHighTmi = tmi >= 30;

  if (isLowTmi) {
    // TMI ≤ 11% : privilégier SCPI françaises et européennes avec bons indicateurs
    filteredScpi = availableScpi.filter(scpi => {
      return (
        (scpi.geography === 'france' || scpi.geography === 'europe') &&
        scpi.capitalization >= 100000000 && // Capitalisation élevée
        scpi.tof >= 90 && // Bon taux d'occupation
        scpi.yield >= 4.0 // Rendement décent
      );
    });
    
    strategy = 'France + Europe, indicateurs solides';
    message = `Avec une TMI de ${tmi}%, voici une sélection équilibrée France + Europe, basée sur rendement et solidité.`;
  } else if (isHighTmi) {
    // TMI ≥ 30% : privilégier SCPI européennes (éviter purement françaises)
    filteredScpi = availableScpi.filter(scpi => {
      return (
        scpi.geography === 'europe' || 
        scpi.geography === 'international' ||
        scpi.european === true
      ) && scpi.yield >= 4.0;
    });
    
    strategy = 'Europe + International, optimisation fiscale';
    message = `Avec une TMI de ${tmi}%, nous vous orientons vers les SCPI européennes et internationales pour optimiser la fiscalité.`;
  } else {
    // TMI intermédiaire : équilibre
    filteredScpi = availableScpi.filter(scpi => 
      scpi.yield >= 4.5 && scpi.tof >= 90
    );
    
    strategy = 'Équilibre performance/fiscalité';
    message = `Avec une TMI de ${tmi}%, voici un équilibre entre performance et optimisation fiscale.`;
  }

  // Appliquer les critères spécifiques à l'objectif
  switch (objective) {
    case 'revenus':
      filteredScpi = filteredScpi
        .filter(scpi => scpi.yield >= 5.0)
        .sort((a, b) => b.yield - a.yield)
        .slice(0, 6);
      break;

    case 'capitaliser':
      filteredScpi = filteredScpi
        .filter(scpi =>
          scpi.capitalization >= 200000000 &&
          (scpi.sector === 'bureaux' || scpi.sector === 'logistique' || scpi.sector === 'residentiel')
        )
        .sort((a, b) => b.capitalization - a.capitalization)
        .slice(0, 6);
      break;

    case 'diversifier':
      // Sélectionner 1-2 SCPI par secteur principal
      const sectorGroups: Record<string, Scpi[]> = {};
      filteredScpi.forEach(scpi => {
        if (!sectorGroups[scpi.sector]) {
          sectorGroups[scpi.sector] = [];
        }
        sectorGroups[scpi.sector].push(scpi);
      });

      filteredScpi = [];
      Object.values(sectorGroups).forEach(group => {
        const sorted = group.sort((a, b) => b.yield - a.yield);
        filteredScpi.push(...sorted.slice(0, 2)); // Max 2 par secteur
      });

      filteredScpi = filteredScpi.slice(0, 6);
      break;

    case 'fiscalite':
      if (isHighTmi) {
        // Privilégier les SCPI européennes et internationales
        filteredScpi = filteredScpi
          .filter(scpi => scpi.geography !== 'france' || scpi.european)
          .sort((a, b) => {
            // Score fiscal : européennes > internationales > françaises européennes
            const getScore = (s: Scpi) => {
              if (s.geography === 'international') return 3;
              if (s.geography === 'europe') return 2;
              if (s.european) return 1;
              return 0;
            };
            return getScore(b) - getScore(a) || b.yield - a.yield;
          })
          .slice(0, 6);
      } else {
        // TMI faible : privilégier les meilleures performances
        filteredScpi = filteredScpi
          .sort((a, b) => b.yield - a.yield)
          .slice(0, 6);
      }
      break;
  }

  return {
    selectedScpi: filteredScpi,
    message,
    strategy
  };
};

export const getObjectiveInfo = (objective: ObjectiveType): InvestmentObjective => {
  return INVESTMENT_OBJECTIVES.find(obj => obj.id === objective) || INVESTMENT_OBJECTIVES[0];
};