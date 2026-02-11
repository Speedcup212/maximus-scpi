import { GuidedJourneyAnswers } from '../types/guidedJourney';

export type BeginnerProfileId =
  | 'debutant-prudent'
  | 'debutant-curieux'
  | 'investisseur-reflexion'
  | 'investisseur-decide';

export interface BeginnerProfileResult {
  id: BeginnerProfileId;
  title: string;
  summary: string;
  implications: string[];
  vigilance: string[];
  nextStepHint: string;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function computeBeginnerProfile(
  answers: GuidedJourneyAnswers
): BeginnerProfileResult {
  const horizonScore = answers.projectionDuration === 'moins-5-ans'
    ? 0
    : answers.projectionDuration === '5-8-ans'
      ? 1
      : answers.projectionDuration === '8-12-ans'
        ? 2
        : answers.projectionDuration === 'plus-12-ans'
          ? 3
          : 1;

  const variationTolerance = answers.incomeDropFeeling === 'tres-inquiet'
    ? 0
    : answers.incomeDropFeeling === 'gene'
      ? 1
      : answers.incomeDropFeeling === 'serein'
        ? 2
        : answers.incomeDropFeeling === 'a-laise'
          ? 3
          : 1;

  const preferenceScore = answers.investmentPreference === 'stabilite'
    ? 0
    : answers.investmentPreference === 'equilibre'
      ? 1
      : answers.investmentPreference === 'potentiel'
        ? 2
        : 1;

  const toleranceScore = clamp((variationTolerance + preferenceScore) / 2, 0, 3);

  const incomeDependence = answers.incomeImportanceShortTerm === 'oui-rapidement'
    ? 0
    : answers.incomeImportanceShortTerm === 'utile'
      ? 1
      : answers.incomeImportanceShortTerm === 'non-long-terme'
        ? 2
        : 1;

  const experienceScore = answers.realEstateExperience === 'aucune'
    ? 0
    : answers.realEstateExperience === 'rp'
      ? 1
      : answers.realEstateExperience === 'locatif'
        ? 2
        : answers.realEstateExperience === 'plusieurs'
          ? 3
          : 1;

  const simplicityScore = answers.simplicityLevel === 'tres-simple'
    ? 0
    : answers.simplicityLevel === 'simple-structure'
      ? 1
      : answers.simplicityLevel === 'technique'
        ? 2
        : 1;

  const riskAwarenessScore = answers.riskAwareness === 'ne-connait-pas'
    ? 0
    : answers.riskAwareness === 'idee-generale'
      ? 1
      : answers.riskAwareness === 'cycles'
        ? 2
        : 1;

  const positioningScore = answers.selfPositioning === 'debutant-prudent'
    ? 0
    : answers.selfPositioning === 'debutant-curieux'
      ? 1
      : answers.selfPositioning === 'reflexion'
        ? 2
        : answers.selfPositioning === 'decide'
          ? 3
          : 1;

  const maturity = clamp((experienceScore + simplicityScore + riskAwarenessScore + positioningScore) / 4, 0, 3);

  const isPrudent = toleranceScore <= 1 && maturity <= 1;
  const isCurieux = toleranceScore <= 1.5 && maturity <= 2;
  const isDecide = toleranceScore >= 2 && maturity >= 2 && horizonScore >= 2;

  if (isPrudent) {
    return {
      id: 'debutant-prudent',
      title: 'Débutant prudent',
      summary:
        "Vous cherchez d’abord des repères simples avant de faire une sélection.",
      implications: [
        "Commencez par une shortlist courte et claire.",
        "Visez un portefeuille équilibré, pas trop concentré.",
        "Comparez secteurs et zones avant le rendement."
      ],
      vigilance: [
        "Choisir uniquement sur le rendement affiché.",
        "Multiplier les SCPI sans logique de sélection.",
        "Confondre performance passée et qualité durable."
      ],
      nextStepHint:
        "Vous pouvez comparer les SCPI ou faire le test complet (8 min) pour vérifier votre sélection."
    };
  }

  if (isDecide) {
    return {
      id: 'investisseur-decide',
      title: 'Investisseur déjà décidé',
      summary:
        "Vous avez une idée claire et souhaitez vérifier votre sélection.",
      implications: [
        "Comparez les SCPI au-delà du rendement.",
        "Visez une structure équilibrée, pas trop concentrée.",
        "Gardez une shortlist lisible et cohérente."
      ],
      vigilance: [
        "Aller trop vite sans comparer frais et structure.",
        "Multiplier les SCPI sans logique.",
        "Négliger secteurs et zones."
      ],
      nextStepHint:
        "Comparez les SCPI ou faites le test complet (8 min) pour valider la sélection."
    };
  }

  if (isCurieux) {
    return {
      id: 'debutant-curieux',
      title: 'Débutant curieux',
      summary:
        "Vous démarrez et cherchez surtout des repères simples pour faire une sélection sans vous perdre.",
      implications: [
        "Commencez par une shortlist claire, pas trop large.",
        "Visez un portefeuille équilibré, pas trop concentré.",
        "Comparez secteurs et zones, pas seulement le rendement."
      ],
      vigilance: [
        "Choisir uniquement sur le rendement affiché.",
        "Multiplier les SCPI sans logique de sélection.",
        "Ignorer les frais et la diversité des secteurs."
      ],
      nextStepHint:
        "Vous pouvez comparer les SCPI, ou faire le test complet (8 min) pour vérifier votre sélection."
    };
  }

  return {
    id: 'investisseur-reflexion',
    title: 'Investisseur en réflexion',
    summary:
      "Votre réflexion est avancée, mais vous voulez vérifier si la sélection reste équilibrée.",
    implications: [
      "Comparez les SCPI au-delà du rendement.",
      "Visez une structure équilibrée, pas trop concentrée.",
      "Gardez une shortlist lisible."
    ],
    vigilance: [
      "Choisir sur un seul critère.",
      "Multiplier les SCPI sans logique.",
      "Ignorer frais, secteurs ou zones."
    ],
    nextStepHint:
      "Comparez les SCPI ou faites le test complet (8 min) pour valider votre sélection."
  };
}
