// MaximusSCPI — Mapping quiz → libellés Calendly (questions custom a1..a4)
// Les libellés doivent correspondre EXACTEMENT aux options radio de l'event Calendly.

import type { QuizData } from '../types/quiz';

type CalendlyPrefillAnswers = {
  a1: string; // montant
  a2: string; // TMI
  a3: string; // horizon
  a4: string; // objectif
};

function mapMontant(value: QuizData['montant']): string {
  const map: Record<QuizData['montant'], string> = {
    'moins-10k': 'Moins de 10 000 €',
    '10k-50k': '10 000 € à 50 000 €',
    '50k-150k': '50 000 € à 150 000 €',
    'plus-150k': 'Plus de 150 000 €',
  };
  return map[value];
}

function mapTmi(value: QuizData['tmi']): string {
  const map: Record<QuizData['tmi'], string> = {
    '11': '11 %',
    '30': '30 %',
    '41': '41 %',
    '45': '45 %',
    'inconnu': 'Je ne sais pas',
  };
  return map[value];
}

function mapHorizon(value: QuizData['horizon']): string {
  const map: Record<QuizData['horizon'], string> = {
    'moins-5ans': 'Moins de 5 ans',
    '5-10ans': '5 à 10 ans',
    'plus-10ans': 'Plus de 10 ans',
  };
  return map[value];
}

function mapObjectif(value: QuizData['objectif']): string {
  const map: Record<QuizData['objectif'], string> = {
    'revenus': 'Générer des revenus complémentaires',
    'fiscalite': 'Réduire ma fiscalité',
    'diversification': 'Diversifier mon patrimoine',
    'transmission': 'Préparer une transmission',
    'croissance': 'Faire fructifier mon capital',
    'retraite': 'Préparer ma retraite',
  };
  return map[value];
}

export function buildCalendlyPrefillAnswers(quiz: QuizData): CalendlyPrefillAnswers {
  return {
    a1: mapMontant(quiz.montant),
    a2: mapTmi(quiz.tmi),
    a3: mapHorizon(quiz.horizon),
    a4: mapObjectif(quiz.objectif),
  };
}
