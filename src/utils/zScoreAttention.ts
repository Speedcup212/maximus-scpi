import { isVeryWellDiversified } from '../config/diversificationDoctrine';

export type ZScoreAttentionLevel =
  | 'neutre'
  | 'vigilance'
  | 'concentration'
  | 'dispersion'
  | 'dispersion-excessive'
  | 'coherence-elevee';

export type ZScoreAttention = {
  level: ZScoreAttentionLevel;
  shortLabel: string;
  message: string;
};

const ZSCORE_THRESHOLDS = {
  balanced: 0.5,
  vigilance: 1.5,
  concentration: 2.0,
  dispersion: -1.5,
  dispersionExcessive: -2.0,
};

export const getZScoreAttention = (
  zScore: number,
  sectorCount?: number,
  geoCount?: number
): ZScoreAttention | null => {
  const hasHighDiversification =
    typeof sectorCount === 'number' &&
    typeof geoCount === 'number' &&
    isVeryWellDiversified(sectorCount, geoCount);

  if (zScore >= ZSCORE_THRESHOLDS.concentration && hasHighDiversification) {
    return {
      level: 'coherence-elevee',
      shortLabel: 'Cohérence structurelle élevée',
      message:
        'Diversification sectorielle et géographique élevée. Le Z-score reflète une structure homogène et diversifiée, sans concentration dominante.'
    };
  }

  if (zScore >= ZSCORE_THRESHOLDS.vigilance && hasHighDiversification) {
    return {
      level: 'coherence-elevee',
      shortLabel: 'Structure homogène et diversifiée',
      message:
        'Diversification sectorielle et géographique élevée. L’écart reste compatible avec une lecture globale équilibrée.'
    };
  }

  if (zScore >= ZSCORE_THRESHOLDS.concentration) {
    return {
      level: 'concentration',
      shortLabel: 'Concentration marquée',
      message:
        'Exposition renforcée sur un nombre limité d’axes (secteurs, zones ou typologies). L’écart est structurel et traduit une concentration globale.'
    };
  }

  if (zScore >= ZSCORE_THRESHOLDS.vigilance) {
    return {
      level: 'vigilance',
      shortLabel: 'Vigilance structurelle',
      message:
        'Le portefeuille s’écarte d’une structure équilibrée. L’exposition est renforcée sur certains axes (secteurs, zones ou typologies).'
    };
  }

  if (zScore <= ZSCORE_THRESHOLDS.dispersionExcessive) {
    return {
      level: 'dispersion-excessive',
      shortLabel: 'Dispersion excessive',
      message:
        'Allocation très étalée entre de nombreux axes. La lecture globale devient plus diffuse, l’écart est structurel.'
    };
  }

  if (zScore <= ZSCORE_THRESHOLDS.dispersion) {
    return {
      level: 'dispersion',
      shortLabel: 'Dispersion structurelle',
      message:
        'Allocation étalée entre plusieurs axes. La lecture globale est moins lisible, l’écart reste structurel.'
    };
  }

  return null;
};

export const getZScoreGrid = () => ({
  thresholds: ZSCORE_THRESHOLDS,
  levels: [
    {
      level: 'neutre' as const,
      shortLabel: 'Structure équilibrée',
      message:
        'Le portefeuille reste proche d’une structure équilibrée. Les écarts sont contenus et lisibles.'
    },
    {
      level: 'coherence-elevee' as const,
      shortLabel: 'Cohérence structurelle élevée',
      message:
        'Diversification sectorielle et géographique élevée. Le Z-score reflète une structure homogène et diversifiée.'
    },
    {
      level: 'vigilance' as const,
      shortLabel: 'Vigilance structurelle',
      message:
        'Le portefeuille s’écarte d’une structure équilibrée. L’exposition est renforcée sur certains axes (secteurs, zones ou typologies).'
    },
    {
      level: 'concentration' as const,
      shortLabel: 'Concentration marquée',
      message:
        'Exposition renforcée sur un nombre limité d’axes (secteurs, zones ou typologies). L’écart est structurel et traduit une concentration globale.'
    },
    {
      level: 'dispersion' as const,
      shortLabel: 'Dispersion structurelle',
      message:
        'Allocation étalée entre plusieurs axes. La lecture globale est moins lisible, l’écart reste structurel.'
    },
    {
      level: 'dispersion-excessive' as const,
      shortLabel: 'Dispersion excessive',
      message:
        'Allocation très étalée entre de nombreux axes. La lecture globale devient plus diffuse, l’écart est structurel.'
    }
  ]
});
