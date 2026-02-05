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
        "Vous avez besoin d’un cadre clair et rassurant avant toute décision. Pour vous, les SCPI ne sont pas un produit de rendement, mais un outil patrimonial qui s’inscrit dans le temps.",
      implications: [
        "Commencez toujours par le temps avant de regarder les chiffres.",
        "Raisonnez en portefeuille, pas en SCPI isolée.",
        "Considérez les revenus comme variables mais organisables, jamais comme garantis."
      ],
      vigilance: [
        "Chercher une SCPI “simple” en pensant qu’elle est “sans risque”.",
        "Attendre des revenus rapides avec un placement conçu pour durer.",
        "Décider sur un discours rassurant plutôt que sur une logique globale."
      ],
      nextStepHint:
        "Vous pouvez consolider cette logique avec une analyse de cohérence, ou vous arrêter ici avec un cadre plus clair."
    };
  }

  if (isDecide) {
    return {
      id: 'investisseur-decide',
      title: 'Investisseur déjà décidé',
      summary:
        "Vous avez déjà une idée claire de votre démarche. Votre attente porte surtout sur la vérification, la comparaison et le contrôle.",
      implications: [
        "Les données sont utiles si elles sont comparées dans un cadre cohérent.",
        "La discipline d’allocation est plus importante que le choix individuel.",
        "La régularité de la méthode prime sur l’intuition."
      ],
      vigilance: [
        "La sur-optimisation.",
        "La dispersion sans logique globale.",
        "Négliger les fondamentaux au profit des chiffres visibles."
      ],
      nextStepHint:
        "Le comparateur autonome vous permet d’explorer librement, ou de vérifier votre approche existante."
    };
  }

  if (isCurieux) {
    return {
      id: 'debutant-curieux',
      title: 'Débutant curieux',
      summary:
        "Vous êtes dans une phase d’apprentissage actif. Vous cherchez à comprendre les mécanismes avant de comparer ou d’agir.",
      implications: [
        "Une SCPI s’évalue par sa structure, pas par son rendement affiché.",
        "La diversification est une assurance intellectuelle avant d’être financière.",
        "Le long terme permet de lisser les cycles, pas de les éviter."
      ],
      vigilance: [
        "Comparer trop tôt sans cadre de lecture.",
        "Confondre performance passée et qualité durable.",
        "Multiplier les informations sans hiérarchie."
      ],
      nextStepHint:
        "Vous pouvez approfondir la cohérence de votre raisonnement ou explorer les SCPI en gardant cette grille en tête."
    };
  }

  return {
    id: 'investisseur-reflexion',
    title: 'Investisseur en réflexion',
    summary:
      "Votre réflexion est déjà avancée. Votre enjeu principal n’est plus “quoi choisir”, mais comment structurer une approche cohérente.",
    implications: [
      "Une bonne allocation réduit les erreurs avant de chercher la performance.",
      "La cohérence globale compte plus que l’optimisation ponctuelle.",
      "Les SCPI doivent s’intégrer dans une logique patrimoniale d’ensemble."
    ],
    vigilance: [
      "Sur-optimiser trop tôt.",
      "Se focaliser sur un critère unique (rendement, fiscalité, nouveauté).",
      "Sous-estimer l’impact des cycles dans le temps."
    ],
    nextStepHint:
      "Une analyse de cohérence permet de valider votre structure avant toute mise en œuvre."
  };
}
