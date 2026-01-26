import { Scpi } from '../types/scpi';
import { SCPIExtended } from '../data/scpiDataExtended';

/**
 * Type pour le résultat de vérification de complétude des données SCPI
 */
export interface ScpiDataCompletenessResult {
  scpi: string;
  periode: string;
  donnees_completes_score: number;
  donnees_completes_niveau: 'completes' | 'partielles' | 'limitees';
  indicateurs_presents: string[];
  indicateurs_absents: string[];
  commentaire: string;
}

/**
 * Liste des 11 indicateurs critiques à vérifier
 */
const INDICATEURS_CRITIQUES = [
  'taux_de_distribution',
  'tof',
  'collecte_nette_trimestre',
  'capitalisation',
  'prix_part',
  'valeur_reconstitution',
  'decote_surcote',
  'walt',
  'walb',
  'nombre_locataires',
  'endettement',
] as const;

type IndicateurCritique = typeof INDICATEURS_CRITIQUES[number];

/**
 * Vérifie la présence d'un indicateur dans les données SCPI
 * Règle stricte : une donnée absente ou non explicitement publiée = absente
 */
function isIndicateurPresent(
  indicateur: IndicateurCritique,
  scpi: Scpi,
  scpiExtended?: SCPIExtended
): boolean {
  switch (indicateur) {
    case 'taux_de_distribution':
      // Taux de distribution / distribution
      return scpi.yield !== undefined && scpi.yield !== null && !isNaN(scpi.yield) ||
             (scpiExtended?.distribution !== undefined && scpiExtended.distribution !== null);

    case 'tof':
      // Taux d'occupation financier
      return scpi.tof !== undefined && scpi.tof !== null && !isNaN(scpi.tof);

    case 'collecte_nette_trimestre':
      // Collecte nette trimestrielle
      return scpi.collecteNetteTrimestre !== undefined && scpi.collecteNetteTrimestre !== null;

    case 'capitalisation':
      // Capitalisation
      return scpi.capitalization !== undefined && scpi.capitalization !== null && !isNaN(scpi.capitalization);

    case 'prix_part':
      // Prix de part
      return scpi.price !== undefined && scpi.price !== null && !isNaN(scpi.price);

    case 'valeur_reconstitution':
      // Valeur de reconstitution
      return scpi.valeurReconstitution !== undefined && scpi.valeurReconstitution !== null ||
             (scpiExtended?.reconstitutionValue !== undefined && scpiExtended.reconstitutionValue !== null);

    case 'decote_surcote':
      // Décote / Surcote
      // Règle spécifique : si explicitement indiquée OU si prix de part + VR présents (calculable)
      const hasDiscountExplicit = scpi.discount !== undefined && scpi.discount !== null && !isNaN(scpi.discount);
      const hasPrice = scpi.price !== undefined && scpi.price !== null && !isNaN(scpi.price);
      const hasVR = scpi.valeurReconstitution !== undefined && scpi.valeurReconstitution !== null ||
                   (scpiExtended?.reconstitutionValue !== undefined && scpiExtended.reconstitutionValue !== null);
      return hasDiscountExplicit || (hasPrice && hasVR);

    case 'walt':
      // WALT
      return scpi.walt !== undefined && scpi.walt !== null && !isNaN(scpi.walt);

    case 'walb':
      // WALB
      return scpi.walb !== undefined && scpi.walb !== null && !isNaN(scpi.walb);

    case 'nombre_locataires':
      // Nombre de locataires
      return scpi.nombreLocataires !== undefined && scpi.nombreLocataires !== null;

    case 'endettement':
      // Endettement
      return scpi.debt !== undefined && scpi.debt !== null && !isNaN(scpi.debt) ||
             (scpiExtended?.ltv !== undefined && scpiExtended.ltv !== null && !isNaN(scpiExtended.ltv));

    default:
      return false;
  }
}

/**
 * Détermine le niveau de complétude basé sur le score
 * 10 à 11 présents → 🟢 Données complètes
 * 7 à 9 présents → 🟠 Données partielles
 * 6 ou moins → 🔴 Données limitées
 */
function getCompletenessLevel(score: number): 'completes' | 'partielles' | 'limitees' {
  if (score >= 10) {
    return 'completes';
  } else if (score >= 7) {
    return 'partielles';
  } else {
    return 'limitees';
  }
}

/**
 * Convertit la période du bulletin (ex: "T3 2025") en format standardisé (ex: "2025-Q3")
 */
function normalizePeriode(periodeBulletin?: string): string {
  if (!periodeBulletin) {
    return 'N/A';
  }

  // Format attendu: "T3 2025" ou "T1 2024"
  const match = periodeBulletin.match(/T(\d)\s+(\d{4})/);
  if (match) {
    const trimestre = match[1];
    const annee = match[2];
    return `${annee}-Q${trimestre}`;
  }

  return periodeBulletin;
}

/**
 * Vérifie la complétude des données SCPI selon les règles strictes définies
 * 
 * @param scpi - Données SCPI de base
 * @param scpiExtended - Données SCPI étendues (optionnel)
 * @returns Résultat de la vérification de complétude au format JSON strict
 */
export function checkScpiDataCompleteness(
  scpi: Scpi,
  scpiExtended?: SCPIExtended
): ScpiDataCompletenessResult {
  const indicateursPresents: string[] = [];
  const indicateursAbsents: string[] = [];

  // Vérifier chaque indicateur critique
  for (const indicateur of INDICATEURS_CRITIQUES) {
    if (isIndicateurPresent(indicateur, scpi, scpiExtended)) {
      indicateursPresents.push(indicateur);
    } else {
      indicateursAbsents.push(indicateur);
    }
  }

  const score = indicateursPresents.length;
  const niveau = getCompletenessLevel(score);
  const periode = normalizePeriode(scpi.periodeBulletinTrimestriel);

  return {
    scpi: scpi.name,
    periode,
    donnees_completes_score: score,
    donnees_completes_niveau: niveau,
    indicateurs_presents: indicateursPresents,
    indicateurs_absents: indicateursAbsents,
    commentaire: 'Calcul basé uniquement sur les informations publiées dans le dernier bulletin trimestriel.',
  };
}

/**
 * Obtient l'emoji et la couleur associés au niveau de complétude
 */
export function getCompletenessDisplay(niveau: 'completes' | 'partielles' | 'limitees'): {
  emoji: string;
  color: string;
  bgColor: string;
  label: string;
} {
  switch (niveau) {
    case 'completes':
      return {
        emoji: '🟢',
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10',
        label: 'Données complètes',
      };
    case 'partielles':
      return {
        emoji: '🟠',
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10',
        label: 'Données partielles',
      };
    case 'limitees':
      return {
        emoji: '🔴',
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        label: 'Données limitées',
      };
  }
}
