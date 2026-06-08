/**
 * Qualification et contextualisation des taux de distribution.
 *
 * Règle métier (garde-fou marketing / conformité CIF/AMF) :
 *   < 2 %      → rendement faible / à analyser
 *   2 % – 4 %  → rendement modéré
 *   4 % – 6 %  → rendement courant
 *   6 % – 8 %  → rendement élevé
 *   > 8 %      → rendement atypique à contextualiser (+ alerte « Taux atypique — non garanti »)
 *
 * Interdit tout label marketing déconnecté de la donnée (ex. « Performance
 * exceptionnelle » sur une SCPI à 0,54 %).
 *
 * Helper partagé : cartes comparateur, pages SCPI, générateurs statiques.
 */

export type YieldTier = 'inconnu' | 'faible' | 'modere' | 'courant' | 'eleve' | 'atypique';

export interface YieldQualification {
  tier: YieldTier;
  /** Libellé neutre et factuel, utilisable en hero/badge. */
  label: string;
  /** Vrai si le taux dépasse le seuil atypique (> 8 %). */
  isAtypical: boolean;
  /** Alerte discrète à afficher pour les taux atypiques, sinon null. */
  alert: string | null;
}

/** Seuil au-delà duquel un TD est considéré comme atypique (en %). */
export const ATYPICAL_YIELD_THRESHOLD = 8;
/** @deprecated conservé pour compatibilité — aligné sur le seuil atypique. */
export const EXCEPTIONAL_YIELD_THRESHOLD = ATYPICAL_YIELD_THRESHOLD;

const ATYPICAL_ALERT = 'Taux atypique — non garanti';

export function qualifyYield(
  yieldValue: number | null | undefined
): YieldQualification {
  if (typeof yieldValue !== 'number' || !Number.isFinite(yieldValue)) {
    return { tier: 'inconnu', label: 'Rendement à vérifier', isAtypical: false, alert: null };
  }
  if (yieldValue < 2) {
    return { tier: 'faible', label: 'Rendement faible / à analyser', isAtypical: false, alert: null };
  }
  if (yieldValue < 4) {
    return { tier: 'modere', label: 'Rendement modéré', isAtypical: false, alert: null };
  }
  if (yieldValue < 6) {
    return { tier: 'courant', label: 'Rendement courant', isAtypical: false, alert: null };
  }
  if (yieldValue <= ATYPICAL_YIELD_THRESHOLD) {
    return { tier: 'eleve', label: 'Rendement élevé', isAtypical: false, alert: null };
  }
  return { tier: 'atypique', label: 'Rendement atypique à contextualiser', isAtypical: true, alert: ATYPICAL_ALERT };
}

export interface YieldContext {
  /** Vrai si le TD est atypique (> seuil). */
  isExceptional: boolean;
  /** Seuil utilisé (%). */
  threshold: number;
  /** Libellé court pour un badge. */
  badgeLabel: string;
  /** Note courte affichable directement sur la card (une seule ligne). */
  shortNote: string;
  /** Note complète de contextualisation / rappel de risque (tooltip, modale). */
  note: string;
}

/** Note courte affichée sur la card (compacte, une ligne). */
const ATYPICAL_SHORT_NOTE = 'Distribution non nécessairement récurrente.';

/** Note complète — réservée à une zone secondaire (tooltip / modale d'analyse). */
const ATYPICAL_FULL_NOTE =
  "Taux de distribution atypique, non nécessairement récurrent. Il peut refléter une SCPI récente dont le capital est en cours d'investissement, avec des parts en jouissance limitées. Donnée historique : aucune garantie de rendement futur, risque de perte en capital.";

/**
 * Contexte d'affichage pour la carte comparateur (badge + rappel de risque).
 * Repose sur la même règle que `qualifyYield`.
 * - `shortNote` : texte court affiché sur la card.
 * - `note`      : texte complet réservé à une zone secondaire (tooltip/modale).
 */
export function getYieldContext(
  yieldValue: number | null | undefined
): YieldContext {
  const q = qualifyYield(yieldValue);
  return {
    isExceptional: q.isAtypical,
    threshold: ATYPICAL_YIELD_THRESHOLD,
    badgeLabel: ATYPICAL_ALERT,
    shortNote: ATYPICAL_SHORT_NOTE,
    note: ATYPICAL_FULL_NOTE,
  };
}
