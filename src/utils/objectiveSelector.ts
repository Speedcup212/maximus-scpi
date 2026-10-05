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
    description: 'Comparer la régularité des distributions et la solidité des fondamentaux',
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
    description: 'Rechercher une trajectoire patrimoniale cohérente à long terme',
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
    description: 'Répartir les risques entre plusieurs secteurs et zones',
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
    name: 'Comparer la fiscalité',
    description: 'Comparer les modes de détention et les flux fiscaux sans biais automatique par TMI',
    icon: '🏛️',
    color: '#f59e0b',
    criteria: {
      minYield: 4.0,
      maxSingleAllocation: 40
    }
  }
];

const safeNumber = (value: number | null | undefined, fallback = 0): number =>
  Number.isFinite(value) ? Number(value) : fallback;

const qualityScore = (scpi: Scpi): number => {
  const yieldScore = Math.min(Math.max(safeNumber(scpi.yield), 0), 10) * 4;
  const tofScore = Math.min(Math.max(safeNumber(scpi.tof), 0), 100) * 0.35;
  const capitalization = Math.max(safeNumber(scpi.capitalization), 0);
  const capitalizationScore = capitalization > 0 ? Math.min(Math.log10(capitalization), 10) * 2 : 0;

  return yieldScore + tofScore + capitalizationScore;
};

const byQuality = (a: Scpi, b: Scpi): number =>
  qualityScore(b) - qualityScore(a);

export const applyObjective = (
  objective: ObjectiveType,
  tmi: number,
  availableScpi: Scpi[]
): ObjectiveSelection => {
  let selectedScpi: Scpi[] = [];
  let message = '';
  let strategy = '';

  const rankedUniverse = [...availableScpi].sort(byQuality);

  switch (objective) {
    case 'revenus': {
      selectedScpi = [...rankedUniverse]
        .sort((a, b) => {
          const yieldDelta = safeNumber(b.yield) - safeNumber(a.yield);
          return yieldDelta !== 0 ? yieldDelta : byQuality(a, b);
        })
        .slice(0, 6);

      strategy = 'Distributions + fondamentaux';
      message = 'Sélection indicative fondée sur la distribution et les fondamentaux. Le revenu futur n’est pas garanti et doit être stressé dans plusieurs scénarios.';
      break;
    }

    case 'capitaliser': {
      selectedScpi = [...rankedUniverse]
        .sort((a, b) => {
          const capDelta = safeNumber(b.capitalization) - safeNumber(a.capitalization);
          return capDelta !== 0 ? capDelta : byQuality(a, b);
        })
        .slice(0, 6);

      strategy = 'Trajectoire patrimoniale + solidité';
      message = 'Sélection indicative orientée capitalisation et solidité. La valorisation future dépend des actifs, des valeurs d’expertise, de la dette et du prix de part.';
      break;
    }

    case 'diversifier': {
      const sectorGroups: Record<string, Scpi[]> = {};
      rankedUniverse.forEach(scpi => {
        const sector = scpi.sector || 'autres';
        if (!sectorGroups[sector]) sectorGroups[sector] = [];
        sectorGroups[sector].push(scpi);
      });

      const diversified: Scpi[] = [];
      Object.values(sectorGroups)
        .sort((a, b) => qualityScore(b[0]) - qualityScore(a[0]))
        .forEach(group => {
          const candidate = [...group].sort(byQuality)[0];
          if (candidate) diversified.push(candidate);
        });

      if (diversified.length < 6) {
        const alreadySelected = new Set(diversified.map(scpi => scpi.name));
        rankedUniverse.forEach(scpi => {
          if (diversified.length < 6 && !alreadySelected.has(scpi.name)) {
            diversified.push(scpi);
            alreadySelected.add(scpi.name);
          }
        });
      }

      selectedScpi = diversified.slice(0, 6);
      strategy = 'Diversification sectorielle + fondamentaux';
      message = 'Sélection indicative diversifiée par secteur. Il faut ensuite contrôler les expositions géographiques, locataires et risques réellement communs.';
      break;
    }

    case 'fiscalite': {
      selectedScpi = rankedUniverse.slice(0, 6);
      strategy = 'Comparaison fiscale sans filtre géographique automatique';
      message = `TMI ${tmi}% : la TMI seule ne justifie pas d’exclure les SCPI françaises ni de privilégier automatiquement l’Europe. Comparez les revenus par pays, les conventions fiscales et le mode de détention avant d’arbitrer.`;
      break;
    }

    default: {
      selectedScpi = rankedUniverse.slice(0, 6);
      strategy = 'Fondamentaux';
      message = 'Sélection indicative fondée sur les données disponibles.';
    }
  }

  return {
    selectedScpi,
    message,
    strategy
  };
};

export const getObjectiveInfo = (objective: ObjectiveType): InvestmentObjective => {
  return INVESTMENT_OBJECTIVES.find(obj => obj.id === objective) || INVESTMENT_OBJECTIVES[0];
};
