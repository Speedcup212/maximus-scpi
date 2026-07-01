/**
 * UTILITAIRE CENTRAL UNIQUE — Décote / Surcote SCPI
 *
 * Toutes les surfaces du site (comparateur public, espace Pro, fiches SCPI,
 * modales d'analyse) doivent passer par ce module pour afficher la décote/surcote.
 *
 * Formule : (prixSouscription / valeurReconstitution - 1) × 100
 *
 * Pas de QA guard, pas de legacy discount check, pas de champ précalculé.
 * Le calcul est refait à chaque appel à partir du prix et de la VR affichés.
 */

/* ── Types ── */

/** Objet minimal accepté pour le calcul décote/surcote. */
export interface DiscountPremiumInput {
  price?: number | null;
  prixSouscription?: number | null;
  subscriptionPrice?: number | null;
  reconstitutionValue?: number | null;
  valeurReconstitution?: number | null;
}

/** Résultat formaté de la décote/surcote. */
export interface DiscountPremiumResult {
  /** Valeur numérique, ou null si données absentes. */
  value: number | null;
  /** Libellé prêt à afficher : "-7,05 %", "+1,25 %", "N/D". */
  formatted: string;
  /** "decote" | "surcote" | "neutre" | "absent" */
  kind: 'decote' | 'surcote' | 'neutre' | 'absent';
}

/* ── Parser de nombres français ── */

/**
 * Parse un nombre depuis une chaîne française (virgule comme séparateur décimal,
 * espace insécable ou fine comme séparateur de milliers).
 *
 * Accepte aussi les formats : "204", "219.47", "204€", "1 250,50", "204,00 €".
 */
export function parseFrenchNumber(value: number | string | null | undefined): number | null {
  if (value == null) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  // Supprimer les symboles monétaires et espaces superflus
  let cleaned = value.trim().replace(/[€$£]/g, '').trim();

  // Normaliser les séparateurs de milliers (espaces, points hors contexte)
  // Stratégie : si la chaîne contient à la fois une virgule et un point,
  // la virgule est le séparateur décimal (format français : 1 250,50)
  // Si la chaîne contient uniquement un point sans virgule, le point est le séparateur décimal (format US)
  const hasComma = cleaned.includes(',');
  const hasDot = cleaned.includes('.');

  if (hasComma) {
    // Format français : virgule = décimal, points/espaces = milliers
    cleaned = cleaned.replace(/\./g, '').replace(/\s/g, '');
    cleaned = cleaned.replace(',', '.');
  } else if (hasDot) {
    // Format US ou simple point décimal
    cleaned = cleaned.replace(/\s/g, '');
  } else {
    cleaned = cleaned.replace(/\s/g, '');
  }

  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

/* ── Calcul central ── */

/**
 * Calcule la décote/surcote à partir du prix de souscription et de la
 * valeur de reconstitution.
 *
 * Formule : (prixSouscription / valeurReconstitution - 1) × 100
 *
 * @returns La valeur en points de pourcentage, ou null si données absentes.
 */
export function calculateScpiDiscountPremium(
  subscriptionPrice: number | string | null | undefined,
  reconstitutionValue: number | string | null | undefined
): number | null {
  const price = parseFrenchNumber(subscriptionPrice);
  const vr = parseFrenchNumber(reconstitutionValue);

  if (price == null || vr == null) return null;
  if (price <= 0 || vr <= 0) return null;

  return (price / vr - 1) * 100;
}

/* ── Formatage ── */

/**
 * Formate la valeur décote/surcote en français avec 2 décimales.
 *
 * Exemples : -7,05 %, +1,25 %, 0,00 %, N/D
 */
export function formatScpiDiscountPremium(value: number | null): string {
  if (value == null) return 'N/D';
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return `${value > 0 ? '+' : ''}${formatted}\u202f%`;
}

/**
 * Retourne le type de décote/surcote.
 */
export function getDiscountPremiumKind(value: number | null): DiscountPremiumResult['kind'] {
  if (value == null) return 'absent';
  if (value < -0.005) return 'decote';
  if (value > 0.005) return 'surcote';
  return 'neutre';
}

/** Classe CSS pour la valeur décote/surcote. */
export function getScpiDiscountPremiumClass(value: number | null): string {
  const kind = getDiscountPremiumKind(value);
  switch (kind) {
    case 'decote':  return 'text-emerald-400 font-semibold';
    case 'surcote': return 'text-amber-400 font-semibold';
    case 'neutre':  return 'text-slate-300 font-semibold';
    default:        return 'text-slate-500';
  }
}

/* ── Non-régression ── */

/**
 * Test de non-régression minimal.
 * Retourne true si les cas obligatoires passent.
 */
export function runDiscountPremiumTests(): { passed: boolean; failures: string[] } {
  const failures: string[] = [];

  function check(name: string, price: number, vr: number, expected: number, tolerance: number = 0.02) {
    const result = calculateScpiDiscountPremium(price, vr);
    if (result == null) {
      failures.push(`${name}: calcul a retourné null`);
      return;
    }
    if (Math.abs(result - expected) > tolerance) {
      failures.push(`${name}: attendu ${expected}%, obtenu ${result.toFixed(2)}%`);
    }
  }

  check('Cœur d\'Europe',  204, 219.47, -7.05);
  check('Comète',          210, 213.20, -1.50);
  check('Remake Live',     219, 207.12,  5.74);
  check('Transitions Europe', 202, 207.49, -2.65);
  check('Iroko Zen',       200, 203.67, -1.80);

  return { passed: failures.length === 0, failures };
}

/**
 * Fonction unique pour obtenir la décote/surcote formatée d'une SCPI.
 * À utiliser comme source unique sur tout le site.
 *
 * Extrait automatiquement le prix et la VR depuis l'objet :
 * - price, prixSouscription, subscriptionPrice
 * - reconstitutionValue, valeurReconstitution
 */
export function getScpiDiscountPremium(scpi: DiscountPremiumInput): DiscountPremiumResult {
  const price =
    scpi.price ??
    scpi.prixSouscription ??
    scpi.subscriptionPrice;

  const vr =
    scpi.reconstitutionValue ??
    scpi.valeurReconstitution;

  const value = calculateScpiDiscountPremium(price, vr);

  return {
    value,
    formatted: formatScpiDiscountPremium(value),
    kind: getDiscountPremiumKind(value),
  };
}
