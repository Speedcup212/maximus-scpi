/**
 * Gestion du percentile de référence pour des scores stables et reproductibles
 *
 * Ce module charge une cohorte de référence de rendements SCPI du marché
 * pour calculer les percentiles de manière stable, indépendamment des SCPI
 * affichées à l'écran.
 */

import refData from '../data/SCPI_REFERENCE_MARKET.json';

/**
 * Construit la liste de référence des rendements depuis le fichier JSON
 * Cette liste est utilisée pour le calcul des percentiles
 */
export function buildRefRendements(): number[] {
  try {
    // Le fichier contient directement la liste des rendements
    if (Array.isArray(refData.rendements)) {
      const rendements = refData.rendements
        .map(r => Number(r))
        .filter(r => Number.isFinite(r) && r > 0);

      if (rendements.length > 0) {
        return rendements.sort((a, b) => a - b);
      }
    }

    console.warn('[useReferencePercentile] Cohorte de référence vide ou invalide');
    return [];
  } catch (error) {
    console.error('[useReferencePercentile] Erreur lors du chargement de la cohorte:', error);
    return [];
  }
}

/**
 * Récupère les métadonnées de la cohorte de référence
 */
export function getRefMetadata(): {
  description: string;
  date: string;
  count: number;
} | null {
  try {
    if (refData.meta) {
      return {
        description: refData.meta.description || 'Cohorte de référence',
        date: refData.meta.date || 'Date inconnue',
        count: refData.meta.count || 0
      };
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Vérifie si la cohorte de référence est disponible et valide
 */
export function isReferenceCohorteValid(): boolean {
  const rendements = buildRefRendements();
  return rendements.length >= 10; // Au moins 10 SCPI pour un percentile fiable
}

/**
 * Calcul du percentile avec la cohorte de référence
 * Retourne un nombre entre 0 et 1
 */
export function calculatePercentileWithReference(rendement: number): number {
  const refRendements = buildRefRendements();

  if (refRendements.length === 0) {
    console.warn('[useReferencePercentile] Cohorte vide, impossible de calculer le percentile');
    return 0;
  }

  if (!Number.isFinite(rendement)) {
    return 0;
  }

  // Méthode PERCENT_RANK SQL
  if (refRendements.length === 1) {
    return 1;
  }

  const min = refRendements[0];
  const max = refRendements[refRendements.length - 1];

  if (rendement <= min) return 0;
  if (rendement >= max) return 1;

  // Trouver la position dans la cohorte
  const idx = refRendements.findIndex(r => r >= rendement);
  return idx / (refRendements.length - 1);
}
