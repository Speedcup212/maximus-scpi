/**
 * Qualification factuelle des taux de distribution.
 *
 * Règle métier (garde-fou marketing / conformité CIF/AMF) :
 *   < 2 %      → rendement faible / à analyser
 *   2 % – 4 %  → rendement modéré
 *   4 % – 6 %  → rendement courant
 *   ≥ 6 %      → rendement élevé
 *
 * Interdit tout label marketing déconnecté de la donnée (ex. « Performance
 * exceptionnelle » sur une SCPI à 0,54 %).
 *
 * NB : l'ancienne pastille d'alerte au-delà de 8 % a été retirée de l'interface.
 * Les rappels de risque généraux (perte en capital, absence de garantie de
 * rendement, liquidité, horizon long) restent gérés par les mentions
 * réglementaires existantes du comparateur et des fiches.
 *
 * Helper partagé : cartes comparateur, pages SCPI, générateurs statiques.
 */

export type YieldTier = 'inconnu' | 'faible' | 'modere' | 'courant' | 'eleve';

export interface YieldQualification {
  tier: YieldTier;
  /** Libellé neutre et factuel, utilisable en hero/badge. */
  label: string;
  /** Conservé pour compatibilité — toujours false (règle d'alerte retirée). */
  isAtypical: boolean;
  /** Conservé pour compatibilité — toujours null (alerte retirée de l'UI). */
  alert: string | null;
}

/** @deprecated conservé pour compatibilité — seuil historique (en %). */
export const ATYPICAL_YIELD_THRESHOLD = 8;
/** @deprecated conservé pour compatibilité — aligné sur le seuil historique. */
export const EXCEPTIONAL_YIELD_THRESHOLD = ATYPICAL_YIELD_THRESHOLD;

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
  return { tier: 'eleve', label: 'Rendement élevé', isAtypical: false, alert: null };
}
