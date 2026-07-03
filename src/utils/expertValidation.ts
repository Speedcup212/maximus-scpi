/**
 * UTILITAIRE — Validation robuste espace Expert-Comptable
 *
 * Helpers pour éviter NaN, undefined, null dans les calculs et affichages.
 * Accepte les saisies françaises (virgule et point).
 */

import type { HoldingISInputs, HoldingISResult, CabinetCheck } from './holdingSimulation';

/* ─────────────────────────────────────────
   Parsing saisie française
   ───────────────────────────────────────── */

/** Parse une saisie utilisateur en nombre. Accepte virgule et point. Champ vide → null. */
export function parseFrenchDecimalInput(value: string): number | null {
  if (!value || value.trim() === '') return null;
  const cleaned = value.replace(',', '.').trim();
  if (cleaned === '.' || cleaned === '-') return null;
  const parsed = parseFloat(cleaned);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

/** Parse une saisie monétaire (entier positif uniquement). */
export function parseFrenchCurrencyInput(value: string): number | null {
  const parsed = parseFrenchDecimalInput(value);
  if (parsed === null || parsed < 0) return null;
  return Math.round(parsed);
}

/* ─────────────────────────────────────────
   Guards numériques
   ───────────────────────────────────────── */

/** Vérifie qu'une valeur est un nombre fini strictement positif (> 0). */
export function isValidPositiveNumber(value: number | null | undefined): boolean {
  if (value === null || value === undefined) return false;
  return Number.isFinite(value) && value > 0;
}

/** Vérifie qu'une clé usufruit est dans [1, 100]. */
export function isValidUsufruitKey(value: number | null | undefined): boolean {
  if (value === null || value === undefined) return false;
  return Number.isFinite(value) && value >= 1 && value <= 100;
}

/* ─────────────────────────────────────────
   Safe number / affichage
   ───────────────────────────────────────── */

/** Retourne un nombre sûr, ou un fallback (défaut 0). */
export function safeNumber(value: unknown, fallback: number = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const p = parseFrenchDecimalInput(value);
    if (p !== null) return p;
  }
  return fallback;
}

/** Formate un montant en euros, jamais "NaN €" ou "undefined €". */
export function safeCurrency(value: unknown): string {
  if (value === null || value === undefined) return '— €';
  const n = safeNumber(value, NaN);
  if (Number.isNaN(n)) return '— €';
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' Md€';
  if (n >= 1_000_000) return Math.round(n / 1_000_000) + ' M€';
  if (n >= 1_000) return Math.round(n / 1_000) + ' k€';
  return n.toLocaleString('fr-FR') + ' €';
}

/** Formate un pourcentage, jamais "NaN %" ou "undefined %". */
export function safePercent(value: unknown): string {
  if (value === null || value === undefined) return '— %';
  const n = safeNumber(value, NaN);
  if (Number.isNaN(n)) return '— %';
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\u202f%`;
}

/* ─────────────────────────────────────────
   Validation métier simulateur
   ───────────────────────────────────────── */

export interface ExpertValidationWarning {
  id: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  field?: string;
}

/** Vérifie la validité des inputs du simulateur. */
export function getValidationWarnings(
  inputs: HoldingISInputs,
  _results: HoldingISResult
): ExpertValidationWarning[] {
  const w: ExpertValidationWarning[] = [];

  // Trésorerie
  if (!Number.isFinite(inputs.availableCash) || inputs.availableCash < 0) {
    w.push({ id: 'cash-invalid', message: 'Trésorerie disponible invalide.', severity: 'critical', field: 'availableCash' });
  }

  // Résultat fiscal
  if (!Number.isFinite(inputs.preTaxProfit)) {
    w.push({ id: 'profit-invalid', message: 'Résultat fiscal non numérique.', severity: 'critical', field: 'preTaxProfit' });
  }

  // Usufruit
  if (!isValidPositiveNumber(inputs.usufruitInvestment)) {
    w.push({ id: 'usufruit-zero', message: 'Montant investi en usufruit invalide ou nul.', severity: 'critical', field: 'usufruitInvestment' });
  }
  if (inputs.usufruitInvestment > inputs.availableCash && inputs.availableCash > 0) {
    w.push({ id: 'usufruit-exceeds-cash', message: `Le montant investi (${safeCurrency(inputs.usufruitInvestment)}) dépasse la trésorerie disponible (${safeCurrency(inputs.availableCash)}).`, severity: 'critical' });
  }
  if (!isValidUsufruitKey(inputs.usufruitKeyPercent)) {
    w.push({ id: 'key-invalid', message: 'Clé usufruit invalide (doit être entre 1 % et 100 %).', severity: 'critical', field: 'usufruitKeyPercent' });
  }
  if (!Number.isFinite(inputs.usufruitDuration) || inputs.usufruitDuration <= 0) {
    w.push({ id: 'duration-invalid', message: 'Durée d\'usufruit invalide.', severity: 'critical', field: 'usufruitDuration' });
  }

  // Taux distribution
  if (!Number.isFinite(inputs.grossYieldRate) || inputs.grossYieldRate < 0) {
    w.push({ id: 'yield-invalid', message: 'Taux de distribution invalide.', severity: 'critical', field: 'grossYieldRate' });
  }
  if (inputs.grossYieldRate === 0) {
    w.push({ id: 'yield-zero', message: 'Taux de distribution à 0 % — aucun revenu généré.', severity: 'warning' });
  }

  // Frais
  if (inputs.feesEnabled) {
    if (inputs.feesMode === 'fixed' && (!Number.isFinite(inputs.feesFixedAmount) || inputs.feesFixedAmount < 0)) {
      w.push({ id: 'fees-invalid', message: 'Montant des frais invalide.', severity: 'critical', field: 'feesFixedAmount' });
    }
    if (inputs.feesMode === 'percentage' && (!Number.isFinite(inputs.feesPercentage) || inputs.feesPercentage < 0)) {
      w.push({ id: 'fees-pct-invalid', message: 'Pourcentage des frais invalide.', severity: 'critical', field: 'feesPercentage' });
    }
    // TVA à qualifier + récupération activée
    if (inputs.holdingVatProfile === 'to-qualify' && inputs.feesVatRecoverable) {
      w.push({ id: 'tva-pending', message: 'Profil TVA à qualifier — la récupération doit être validée par le cabinet.', severity: 'warning' });
    }
  }

  // Comparaison alternative
  if (inputs.alternativeType && inputs.alternativeGrossRate !== undefined) {
    if (!Number.isFinite(inputs.alternativeGrossRate)) {
      w.push({ id: 'alt-rate-invalid', message: 'Taux alternatif invalide.', severity: 'warning', field: 'alternativeGrossRate' });
    } else if (inputs.alternativeGrossRate < 0) {
      w.push({ id: 'alt-rate-negative', message: 'Taux alternatif négatif — hypothèse à vérifier.', severity: 'warning' });
    }
  }

  return w;
}

/** Détermine si les inputs sont valides pour génération PDF / sauvegarde. */
export function areInputsValidForPdf(inputs: HoldingISInputs): boolean {
  const criticals = getValidationWarnings(inputs, {} as HoldingISResult)
    .filter(w => w.severity === 'critical');
  return criticals.length === 0;
}

/** Retourne les checks cabinet consolidés (validation + calculs). */
export function getConsolidatedChecks(
  inputs: HoldingISInputs,
  result: HoldingISResult
): CabinetCheck[] {
  const validationWarnings = getValidationWarnings(inputs, result);
  const cabinetChecks: CabinetCheck[] = validationWarnings.map(w => ({
    id: w.id,
    level: w.severity as 'info' | 'warning' | 'critical',
    title: w.field ? `Champ ${w.field}` : 'Validation',
    message: w.message,
    category: 'data' as const,
  }));

  // Fusionner avec les checks calculés
  if (result.cabinetChecks && result.cabinetChecks.length > 0) {
    cabinetChecks.push(...result.cabinetChecks);
  }

  return cabinetChecks;
}
