export const formatCurrency = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'N/A';
  }
  if (amount >= 1000000000) {
    return (amount / 1000000000).toFixed(1) + 'Md€';
  } else if (amount >= 1000000) {
    return Math.round(amount / 1000000) + 'M€';
  } else if (amount >= 1000) {
    return Math.round(amount / 1000) + 'k€';
  } else {
    return Math.round(amount).toLocaleString('fr-FR') + '€';
  }
};

export const formatPercentage = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return 'N/A';
  }
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
};

export const getPerformanceColor = (scpiYield: number | undefined | null): string => {
  if (scpiYield === undefined || scpiYield === null || isNaN(scpiYield)) {
    return 'text-gray-600 dark:text-gray-400';
  }
  if (scpiYield >= 7) return 'text-green-600 dark:text-green-400';
  if (scpiYield >= 5) return 'text-blue-600 dark:text-blue-400';
  if (scpiYield >= 3.5) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
};

export const getDiscountColor = (discount: number | undefined | null): string => {
  if (discount === undefined || discount === null || isNaN(discount)) {
    return 'bg-gray-100 dark:bg-gray-900/50 text-gray-800 dark:text-gray-300 px-2 py-1 rounded font-bold';
  }
  if (discount < 0) return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 px-2 py-1 rounded font-bold';
  if (discount > 0) return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 px-2 py-1 rounded font-bold';
  return 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300 px-2 py-1 rounded font-bold';
};

type DiscountQa = 'publishable' | 'manual_review' | 'excluded_non_scpi' | undefined;

const DISCOUNT_NEUTRAL_CLASS =
  'bg-gray-100 dark:bg-gray-900/50 text-gray-600 dark:text-gray-300 px-2 py-1 rounded font-semibold';

/**
 * Décote/surcote fiable et affichable ?
 * Non fiable (à vérifier) si 'manual_review' ou 'excluded_non_scpi'.
 */
export const isDiscountReliable = (qaStatus: DiscountQa): boolean => {
  return qaStatus !== 'manual_review' && qaStatus !== 'excluded_non_scpi';
};

/** Tolérance (points de %) entre décote recalculée et décote stockée pour les cas legacy. */
export const DISCOUNT_CONSISTENCY_TOLERANCE = 0.2;

/**
 * Décote/surcote RECALCULÉE à l'affichage à partir du prix actuellement affiché
 * et de la valeur de reconstitution comparable (par part).
 * Formule : (prix affiché - VR comparable) / VR comparable × 100.
 *
 * Objectif : ne jamais afficher une décote calculée avec un ancien prix snapshot,
 * ni une décote incohérente avec le prix/VR affichés.
 *
 * Retourne null (→ "à vérifier") si :
 *  - statut QA non fiable (manual_review / excluded_non_scpi) ;
 *  - prix affiché ou VR comparable absent ou non positif ;
 *  - cas legacy (statut QA indéfini) avec une décote stockée qui DIVERGE du recalcul
 *    (> tolérance) → les valeurs source ne sont pas comparables, on neutralise.
 *
 * Les SCPI 'publishable' (VR validée par part) sont toujours recalculées avec le prix courant,
 * même si la décote stockée (snapshot) diffère (cas d'une revalorisation de prix).
 *
 * @param storedDiscount décote stockée (snapshot) éventuelle, pour le garde-fou legacy.
 */
export const computeDisplayedDiscount = (
  price: number | undefined | null,
  reconstitutionValue: number | undefined | null,
  qaStatus: DiscountQa,
  storedDiscount?: number | null
): number | null => {
  if (!isDiscountReliable(qaStatus)) return null;
  if (price == null || reconstitutionValue == null) return null;
  if (!(price > 0) || !(reconstitutionValue > 0)) return null;

  const recalc = ((price - reconstitutionValue) / reconstitutionValue) * 100;

  // VR validée par part → on fait confiance au recalcul avec le prix courant.
  if (qaStatus === 'publishable') return recalc;

  // Cas legacy (statut QA indéfini) : n'afficher que si cohérent avec la décote stockée.
  if (storedDiscount == null) return recalc;
  if (Math.abs(storedDiscount - recalc) > DISCOUNT_CONSISTENCY_TOLERANCE) return null;
  return recalc;
};

/**
 * Objet minimal accepté par le résolveur unique de décote/surcote.
 * Couvre aussi bien `Scpi` (valeurReconstitution) que `SCPIExtended` (reconstitutionValue).
 */
export interface DiscountResolvable {
  price?: number | null;
  reconstitutionValue?: number | null;
  valeurReconstitution?: number | null;
  discountQaStatus?: DiscountQa;
  /** Décote stockée (snapshot), uniquement pour le garde-fou legacy. */
  discount?: number | null;
}

/** Résultat unique de la décote/surcote affichable, partagé par TOUTES les surfaces. */
export interface ResolvedDiscount {
  /** Valeur affichable (recalculée prix/VR), ou null si non affichable ("À vérifier"). */
  value: number | null;
  /** true si une valeur numérique fiable est affichable. */
  reliable: boolean;
  /** Libellé prêt à afficher : "x%" ou "À vérifier". */
  formatted: string;
  /** Classe couleur (signal opportunité/risque, ou neutre si non fiable). */
  colorClass: string;
}

/**
 * FONCTION UNIQUE de résolution de la décote/surcote affichable.
 *
 * Règle maître : (prix affiché - VR affichée) / VR affichée × 100, calculée UNE seule fois,
 * puis utilisée partout (carte comparateur, KPI, Lecture rapide, Analyse, fiche, tableau, textes).
 *
 * - VR affichée = `reconstitutionValue ?? valeurReconstitution` (centralisé ici).
 * - Jamais d'ancienne décote snapshot dans le rendu : on recalcule.
 * - null (→ "À vérifier") si VR ou prix absent, qa_status manual_review/excluded,
 *   ou cas legacy incohérent (garde-fou).
 */
export const resolveDisplayedDiscount = (scpi: DiscountResolvable): ResolvedDiscount => {
  const vr = scpi.reconstitutionValue ?? scpi.valeurReconstitution;
  const value = computeDisplayedDiscount(scpi.price, vr, scpi.discountQaStatus, scpi.discount);
  if (value == null) {
    return { value: null, reliable: false, formatted: 'À vérifier', colorClass: DISCOUNT_NEUTRAL_CLASS };
  }
  return { value, reliable: true, formatted: formatPercentage(value), colorClass: getDiscountColor(value) };
};

/**
 * Normalise une chaîne de caractères en supprimant les accents et en la mettant en minuscules
 * Utilisé pour la recherche insensible aux accents
 */
export const normalizeString = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};