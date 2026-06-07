/**
 * Logique partagée extraction reconstitution — scripts Node uniquement.
 */

import { z } from 'zod';

export const FieldSchema = z.object({
  value: z.number().nullable(),
  unit: z.enum(['EUR', 'EUR/part']).nullable(),
  confidence: z.number().min(0).max(1),
  extract: z.string().nullable(),
  source_document: z.string().nullable(),
  source_page: z.number().nullable(),
  status: z.enum(['verified', 'unverified', 'missing', 'manual_review']),
  comment: z.string().nullable().optional(),
});

export const LlmExtractionSchema = z.object({
  nom_scpi: z.string().nullable(),
  source_periode: z.string().nullable(),
  prix_souscription: FieldSchema,
  valeur_reconstitution: FieldSchema,
  valeur_realisation: FieldSchema,
  division_nominale: z.object({
    detected: z.boolean(),
    ratio: z.number().nullable(),
    date_effet: z.string().nullable(),
    prix_avant_split: z.number().nullable(),
    prix_apres_split: z.number().nullable(),
    vr_avant_split: z.number().nullable(),
    vr_apres_split: z.number().nullable(),
    comment: z.string().nullable(),
  }),
});

export type LlmExtraction = z.infer<typeof LlmExtractionSchema>;
export type ExtractField = z.infer<typeof FieldSchema>;

export type BatchStatut = 'verified' | 'verified_adjusted_split' | 'manual_review' | 'rejected';

export const SCHEMA_HINT = `Return a single JSON object:
{
  "nom_scpi": string|null,
  "source_periode": string|null,
  "prix_souscription": { "value": number|null, "unit": "EUR"|"EUR/part"|null, "confidence": 0-1, "extract": string|null, "source_document": string|null, "source_page": number|null, "status": "verified"|"unverified"|"missing"|"manual_review", "comment": string|null },
  "valeur_reconstitution": { same },
  "valeur_realisation": { same },
  "division_nominale": {
    "detected": boolean, "ratio": number|null, "date_effet": string|null,
    "prix_avant_split": number|null, "prix_apres_split": number|null,
    "vr_avant_split": number|null, "vr_apres_split": number|null, "comment": string|null
  }
}
Rules:
- Extract ONLY from provided pages. No extrapolation.
- EUR per part (not millions). French decimal commas already converted in source.
- source_document and source_page must match the page header given in input.
- If division par 2/3/etc., set detected=true and ratio=2 or 3.
- If prix is post-split (e.g. 70€) but VR is pre-split (e.g. 207,88€), store VR in valeur_reconstitution and vr_avant_split, prix in prix_apres_split.
- extract = verbatim quote (max 200 chars).`;

export const SYSTEM_PROMPT = `Tu es un extracteur de données SCPI pour MaximusSCPI.
Tu extrais des indicateurs factuels depuis bulletins trimestriels, rapports annuels ou notes d'information.
Aucune recommandation d'investissement. Performances passées ≠ performances futures.
Réponds uniquement en JSON valide.`;

const MIN_PART_EUR = 1;
const MAX_PART_EUR = 15_000;
/** Au-delà → écart implausible, non calculé. */
const ECART_PLAUSIBLE_MAX_PCT = 50;
/** Au-delà (mais ≤ 50) → décote calculée mais routée en manual_review (règle 3). */
const ECART_MANUAL_REVIEW_PCT = 20;
/** vr/prix ≥ ce seuil ⇒ bases différentes (VR pré-split vs prix post-split) → appliquer le split. */
const SPLIT_BASIS_RATIO = 1.5;

function normalizeFr(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/** Marqueur de valeur globale (non par part) : M€, Md€, millions, milliards. */
function hasGlobalMarker(extract: string | null): boolean {
  if (!extract) return false;
  const n = normalizeFr(extract);
  return /\bm€|md€|millions?\b|milliards?\b/.test(n);
}

/** Marqueur explicite "par part". */
function hasPerPartMarker(extract: string | null): boolean {
  if (!extract) return false;
  const n = normalizeFr(extract);
  return /par part|\/ ?part|ramenee a une part|une part/.test(n);
}

/**
 * Règle 1/2 : la VR n'est publiable que si exprimée par part.
 * - rejetée si valeur absente ou hors plage par-part plausible ;
 * - rejetée si marqueur global (M€/Md€/million) SANS preuve "par part"
 *   (unit EUR/part, ou marqueur "par part" dans extract/commentaire).
 */
export function isPerPartReconstitution(field: ExtractField): boolean {
  if (field.value == null || !Number.isFinite(field.value)) return false;
  if (field.value < MIN_PART_EUR || field.value > MAX_PART_EUR) return false;
  const perPartEvidence =
    field.unit === 'EUR/part' ||
    hasPerPartMarker(field.extract) ||
    hasPerPartMarker(field.comment ?? null);
  if (hasGlobalMarker(field.extract) && !perPartEvidence) return false;
  return true;
}

/**
 * Règle 2 : VR globale (M€/Md€) ramenée par part via un calcul documenté.
 * Autorisée au calcul mais routée en manual_review (source nb de parts à valider).
 */
export function isDerivedGlobalReconstitution(field: ExtractField): boolean {
  if (field.value == null) return false;
  if (field.value < MIN_PART_EUR || field.value > MAX_PART_EUR) return false;
  return hasGlobalMarker(field.extract);
}

export function isReliableField(field: ExtractField): boolean {
  if (field.status === 'missing' || field.status === 'manual_review') return false;
  if (field.value == null || !Number.isFinite(field.value)) return false;
  if (field.value < MIN_PART_EUR || field.value > MAX_PART_EUR) return false;
  if (field.confidence < 0.7) return false;
  return true;
}

export function computeAdjustedReconstitution(extraction: LlmExtraction): {
  value: number | null;
  formula: string | null;
} {
  const split = extraction.division_nominale;
  if (!split.detected || split.ratio == null || split.ratio <= 1) {
    return { value: null, formula: null };
  }

  if (split.vr_apres_split != null && split.vr_apres_split > 0) {
    return {
      value: Math.round(split.vr_apres_split * 100) / 100,
      formula: `vr_apres_split = ${split.vr_apres_split}`,
    };
  }

  // Base pré-split = champ "valeur_reconstitution" en priorité (canonique).
  // vr_avant_split du LLM est ambigu (parfois confondu avec la réalisation) → fallback seulement.
  const vrBefore = extraction.valeur_reconstitution.value ?? split.vr_avant_split;
  // Prix courant de souscription (et non un prix post-split historique).
  const prix = extraction.prix_souscription.value;

  // Règle 4 : ne pas appliquer le split si prix et VR sont déjà sur la même base par part.
  // Bases différentes ⇒ vr/prix ≥ 1.5 (VR pré-split nettement > prix post-split courant).
  if (prix != null && prix > 0 && vrBefore != null && vrBefore / prix < SPLIT_BASIS_RATIO) {
    return { value: null, formula: null };
  }

  if (vrBefore != null && vrBefore > 0) {
    const adjusted = Math.round((vrBefore / split.ratio) * 100) / 100;
    return {
      value: adjusted,
      formula: `${vrBefore} / ${split.ratio} = ${adjusted}`,
    };
  }

  return { value: null, formula: null };
}

export function resolveComparableValues(
  extraction: LlmExtraction,
  vrAdjusted: number | null
): { prix: number | null; vr: number | null; note: string | null } {
  // Toujours comparer avec le prix de souscription COURANT (pas un prix post-split historique).
  const prix = extraction.prix_souscription.value;

  // VR ajustée fournie (split harmonisé) → l'utiliser.
  if (vrAdjusted != null && vrAdjusted > 0) {
    return {
      prix,
      vr: vrAdjusted,
      note: 'Valeur de reconstitution ajustée post-division nominale.',
    };
  }

  // Règle 4 : si split détecté mais pas d'ajustement, prix et VR sont déjà sur la même base part.
  const vr = extraction.valeur_reconstitution.value;
  const note = extraction.division_nominale.detected
    ? 'Split détecté mais prix et VR déjà sur la même base par part — pas d\'ajustement appliqué.'
    : null;
  return { prix, vr, note };
}

export interface DecoteSurcoteResult {
  computed: boolean;
  pct: number | null;
  label: 'decote' | 'surcote' | 'parite' | null;
  formula: string | null;
  reason_if_skipped: string | null;
  /** Règle 3 : décote calculée mais |écart| > 20 % → manual_review requis. */
  needs_manual_review?: boolean;
}

export function computeDecoteSurcote(
  extraction: LlmExtraction,
  vrAdjusted: number | null
): DecoteSurcoteResult {
  const prixOk = isReliableField(extraction.prix_souscription);
  const usingAdjusted = vrAdjusted != null && vrAdjusted > 0;
  // Règle 1/2 : la VR doit être par part (la VR ajustée post-split l'est par construction).
  const vrPerPart = usingAdjusted || isPerPartReconstitution(extraction.valeur_reconstitution);
  const vrOk = (isReliableField(extraction.valeur_reconstitution) || usingAdjusted) && vrPerPart;

  if (!prixOk || !vrOk) {
    const reasons: string[] = [];
    if (!prixOk) reasons.push('prix de souscription non fiable ou absent');
    if (!vrOk) {
      if (!vrPerPart) {
        reasons.push(
          'valeur de reconstitution non exprimée par part (valeur globale ou nb de parts non sourcé) — calcul non publié'
        );
      } else {
        reasons.push('valeur de reconstitution non fiable ou absente');
      }
    }
    return {
      computed: false,
      pct: null,
      label: null,
      formula: null,
      reason_if_skipped: reasons.join(' ; '),
    };
  }

  const { prix, vr, note } = resolveComparableValues(extraction, vrAdjusted);
  if (prix == null || vr == null || vr <= 0) {
    return {
      computed: false,
      pct: null,
      label: null,
      formula: null,
      reason_if_skipped: note ?? 'Valeurs comparables indisponibles.',
    };
  }

  const pct = ((prix - vr) / vr) * 100;
  const rounded = Math.round(pct * 100) / 100;

  if (Math.abs(rounded) > ECART_PLAUSIBLE_MAX_PCT) {
    return {
      computed: false,
      pct: null,
      label: null,
      formula: null,
      reason_if_skipped: `Écart ${rounded} % hors plage plausible (>|${ECART_PLAUSIBLE_MAX_PCT}| %).`,
    };
  }

  let label: DecoteSurcoteResult['label'];
  if (rounded < -0.01) label = 'decote';
  else if (rounded > 0.01) label = 'surcote';
  else label = 'parite';

  // Règle 3 : |écart| > 20 % → manual_review (justification source requise).
  const ecartTropEleve = Math.abs(rounded) > ECART_MANUAL_REVIEW_PCT;
  // Règle 2 : VR globale ramenée par part (calcul dérivé) → manual_review (source à valider).
  const vrDerivedGlobal = !usingAdjusted && isDerivedGlobalReconstitution(extraction.valeur_reconstitution);
  const needs_manual_review = ecartTropEleve || vrDerivedGlobal;

  let reviewReason: string | null = null;
  if (ecartTropEleve) {
    reviewReason = `Écart ${rounded} % > ${ECART_MANUAL_REVIEW_PCT} % — manual_review requis (justification source nécessaire).`;
  } else if (vrDerivedGlobal) {
    reviewReason =
      'VR globale (M€) ramenée par part via calcul dérivé — manual_review requis (source nb de parts à valider).';
  }

  const formula = `(prix ${prix} - VR comparable ${vr}) / VR ${vr} × 100 = ${rounded} %`;
  return {
    computed: true,
    pct: rounded,
    label,
    formula: note ? `${formula} (${note})` : formula,
    reason_if_skipped: reviewReason,
    needs_manual_review,
  };
}

export function determineStatut(
  extraction: LlmExtraction,
  decote: DecoteSurcoteResult,
  vrAdjusted: number | null,
  error?: string
): BatchStatut {
  if (error) return 'rejected';

  const hasPrix = extraction.prix_souscription.value != null;
  const hasVr = extraction.valeur_reconstitution.value != null || vrAdjusted != null;

  if (!hasPrix && !hasVr) return 'rejected';
  if (!decote.computed) {
    if (hasPrix || hasVr) return 'manual_review';
    return 'rejected';
  }

  // Règle 3 & 7 : écart > 20 % non justifié → manual_review.
  if (decote.needs_manual_review) return 'manual_review';

  const split = extraction.division_nominale.detected;
  if (split && vrAdjusted != null && decote.computed) {
    const sourced =
      extraction.prix_souscription.source_page != null &&
      (extraction.valeur_reconstitution.source_page != null ||
        extraction.division_nominale.comment != null);
    if (sourced && isReliableField(extraction.prix_souscription)) {
      return 'verified_adjusted_split';
    }
    return 'manual_review';
  }

  if (
    decote.computed &&
    isReliableField(extraction.prix_souscription) &&
    isReliableField(extraction.valeur_reconstitution)
  ) {
    return 'verified';
  }

  return 'manual_review';
}
