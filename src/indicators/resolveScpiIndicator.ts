import {
  IndicatorId,
  ScpiLike,
  getIndicatorDefinition,
} from './scpiIndicatorRegistry';
import { resolveDisplayedDiscount } from '../utils/formatters';

/**
 * RÉSOLVEUR CENTRAL UNIQUE DES INDICATEURS SCPI
 * ------------------------------------------------------------------
 * `resolveScpiIndicator(scpi, indicatorId)` est le SEUL point d'entrée autorisé
 * pour obtenir la valeur affichable d'un indicateur SCPI.
 *
 * Garantit que toutes les surfaces (carte, tableau, modale, fiche, sidebar,
 * textes d'analyse) affichent une valeur strictement identique pour un
 * indicateur donné, validée et formatée par le registre.
 */

export type IndicatorStatus = 'OK' | 'WARNING' | 'CRITICAL';

export interface ResolvedIndicator {
  indicatorId: IndicatorId;
  /** Valeur brute résolue (numérique ou texte), ou null si absente/non fiable. */
  value: number | string | null;
  /** Valeur prête à afficher (formatée selon le registre, ou fallback). */
  displayValue: string;
  status: IndicatorStatus;
  /** Confiance [0..1] : QA + présence + validité. */
  confidence: number;
  /** Source effectivement retenue (champ/origine). */
  source: string;
  /** Explication courte (utile à l'audit et au debug). */
  reason: string;
  /** true si une valeur fiable est affichable (sinon fallback). */
  isReliable: boolean;
}

/** Statut QA décote/surcote → confiance/fiabilité. */
const isQaReliable = (qa: ScpiLike['discountQaStatus']): boolean =>
  qa !== 'manual_review' && qa !== 'excluded_non_scpi';

/**
 * Résolution spécifique de la décote/surcote : recalcul unique
 * (prix affiché vs VR affichée) via la source partagée `resolveDisplayedDiscount`.
 */
function resolveDecoteSurcote(scpi: ScpiLike): ResolvedIndicator {
  const def = getIndicatorDefinition('decote_surcote');
  const resolved = resolveDisplayedDiscount({
    price: scpi.price,
    reconstitutionValue: scpi.reconstitutionValue,
    valeurReconstitution: scpi.valeurReconstitution,
    discountQaStatus: scpi.discountQaStatus,
    discount: scpi.discount,
  });

  if (resolved.value == null) {
    const qaNeutral = !isQaReliable(scpi.discountQaStatus);
    return {
      indicatorId: 'decote_surcote',
      value: null,
      displayValue: def.fallback,
      status: 'WARNING',
      confidence: qaNeutral ? 0.3 : 0,
      source: 'calc(prix, valeur_reconstitution)',
      reason: qaNeutral
        ? `Statut QA ${scpi.discountQaStatus} → neutralisée (à vérifier)`
        : 'Prix ou valeur de reconstitution affichée absent/non comparable',
      isReliable: false,
    };
  }

  const validation = def.validate(resolved.value, scpi);
  return {
    indicatorId: 'decote_surcote',
    value: resolved.value,
    displayValue: def.format(resolved.value),
    status: validation.valid ? 'OK' : 'WARNING',
    confidence: validation.valid ? 0.9 : 0.5,
    source: 'calc(prix, valeur_reconstitution)',
    reason: validation.valid
      ? 'Recalculée (prix affiché vs VR affichée), QA publishable'
      : `Recalculée mais ${validation.reason}`,
    isReliable: true,
  };
}

/**
 * Résout un indicateur SCPI vers une valeur affichable, validée et tracée.
 */
export function resolveScpiIndicator(
  scpi: ScpiLike,
  indicatorId: IndicatorId
): ResolvedIndicator {
  if (indicatorId === 'decote_surcote') {
    return resolveDecoteSurcote(scpi);
  }

  const def = getIndicatorDefinition(indicatorId);
  const raw = def.read(scpi);

  // Donnée absente → masquée par le fallback (N/A). Non bloquant : WARNING.
  // (CRITICAL est réservé à une incohérence RÉELLEMENT affichée, ex. divergence KPI/texte.)
  if (raw == null || (typeof raw === 'string' && raw.trim() === '')) {
    return {
      indicatorId,
      value: null,
      displayValue: def.fallback,
      status: 'WARNING',
      confidence: 0,
      source: def.sources[0] ?? 'inconnue',
      reason: 'Donnée absente (aucune source disponible)',
      isReliable: false,
    };
  }

  const validation = def.validate(raw, scpi);

  if (!validation.valid) {
    // Valeur hors règle métier → masquée par le fallback (non affichée telle quelle).
    return {
      indicatorId,
      value: raw,
      displayValue: def.fallback,
      status: 'WARNING',
      confidence: 0.3,
      source: def.sources[0] ?? 'inconnue',
      reason: `Valeur invalide (masquée) : ${validation.reason ?? 'règle métier non respectée'}`,
      isReliable: false,
    };
  }

  return {
    indicatorId,
    value: raw,
    displayValue: def.format(raw),
    status: 'OK',
    confidence: 0.8,
    source: def.sources[0] ?? 'inconnue',
    reason: 'Valeur présente et validée',
    isReliable: true,
  };
}

/**
 * Aide d'affichage : renvoie directement la chaîne à afficher pour un indicateur.
 * À utiliser dans les composants à la place des accès bruts.
 */
export function displayScpiIndicator(scpi: ScpiLike, indicatorId: IndicatorId): string {
  return resolveScpiIndicator(scpi, indicatorId).displayValue;
}
