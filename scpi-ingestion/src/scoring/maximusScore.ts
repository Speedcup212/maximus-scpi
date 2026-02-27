/**
 * maximusScore.ts — MaximusSCPI Scoring Engine v1
 *
 * Exact port of the frontend algorithm defined in src/utils/scpiScoring.ts.
 * Formula, weights, thresholds and rounding are UNCHANGED.
 *
 * Key design decisions:
 *   - Reference cohort embedded as a frozen constant (n=51, 2025-01-09).
 *     Guarantees identical percentile ranking to the frontend regardless of
 *     which SCPI data is loaded at runtime.
 *   - `fromExtraction()` converts ExtractionResult units to the expected
 *     scoring units (decimal → %, EUR → M€, days → months).
 *   - `computeMaximusScore()` works on a single SCPI (not batch), using the
 *     same reference cohort the frontend uses via useReferencePercentile.ts.
 *   - `has_penalty` is set when all three critical fields (rendement, tof,
 *     capitalisation) are absent, signalling the score is a placeholder.
 *
 * Version: v1
 */

import type { ExtractionResult } from "../extractor.js";
import type { MaximusScoringInput, MaximusScoreResult } from "../types.js";

export { MaximusScoringInput, MaximusScoreResult };

// ─── Model version ────────────────────────────────────────────────────────────

export const SCORING_VERSION = "v1" as const;

// ─── Reference cohort ─────────────────────────────────────────────────────────
//
// Frozen copy of src/data/SCPI_REFERENCE_MARKET.json (meta.date: 2025-01-09,
// meta.count: 51).  Pre-sorted ascending — same order the frontend sorts them.
// Bump the version constant when this data is refreshed.

const REFERENCE_RENDEMENTS: readonly number[] = [
  3.18,  3.5,   3.67,  3.82,  3.91,  4.0,   4.1,   4.2,   4.26,  4.3,
  4.4,   4.5,   4.56,  4.61,  4.67,  4.75,  4.8,   4.87,  4.92,  5.0,
  5.1,   5.19,  5.25,  5.3,   5.4,   5.5,   5.56,  5.64,  5.7,   5.76,
  5.85,  5.92,  6.0,   6.08,  6.2,   6.37,  6.51,  6.75,  6.98,  7.16,
  7.5,   7.8,   8.0,   8.25,  8.5,   9.0,   9.5,   10.0,  10.5,  11.0,
  11.18,
]; // sorted ascending — must match SCPI_REFERENCE_MARKET.json

// ─── Internal scoring parameters ─────────────────────────────────────────────
// Exact copy of `defaultParams` from src/utils/scpiScoring.ts.

type ScoringParams = {
  barèmes: {
    secteur: Record<string, number>;
    geo: { france: number; europe: number; international: number };
  };
  seuils: {
    tof: { haut: number; moyen: number };
    ltv: { tres_faible: number; faible: number; moyen: number };
    ecart_reconst: { bonus: number; neutre: number };
  };
  fallbacks: {
    secteur_unknown: number;
    geo_missing_is_france: boolean;
    capi_null_points: number;
  };
};

const PARAMS: ScoringParams = {
  barèmes: {
    secteur: {
      // Santé / Éducation (1.00)
      "sant": 1.00, "health": 1.00, "sanitaire": 1.00, "social": 1.00,
      "éduc": 1.00, "educ": 1.00, "education": 1.00, "life science": 1.00,
      // Commerces (0.85)
      "commerce": 0.85, "retail": 0.85, "commerc": 0.85, "alimentaire": 0.85,
      "galerie": 0.85, "centre-ville": 0.85, "grocery": 0.85, "pied d'immeuble": 0.85,
      // Bureaux (0.70)
      "bureau": 0.70, "office": 0.70, "offices": 0.70, "tertiaire": 0.70,
      // Résidentiel (0.75)
      "résident": 0.75, "residen": 0.75, "residential": 0.75, "logement": 0.75,
      "habitation": 0.75, "résidence": 0.75,
      // Logistique / Activités (0.80)
      "logist": 0.80, "activit": 0.80, "entrep": 0.80, "industrial": 0.80,
      "warehouse": 0.80, "entrepôt": 0.80, "messagerie": 0.80,
      // Hôtellerie / Loisirs (0.60)
      "hôtel": 0.60, "hotel": 0.60, "hospitality": 0.60, "loisir": 0.60,
      "tourisme": 0.60, "séminaire": 0.60, "hébergement": 0.60,
      // Autres (0.70)
      "autre": 0.70, "other": 0.70, "divers": 0.70,
    },
    geo: { france: 1.0, europe: 0.8, international: 0.6 },
  },
  seuils: {
    tof:           { haut: 95, moyen: 90 },
    ltv:           { tres_faible: 15, faible: 30, moyen: 40 },
    ecart_reconst: { bonus: -0.02, neutre: 0.02 },
  },
  fallbacks: {
    secteur_unknown:       0.70,
    geo_missing_is_france: true,
    capi_null_points:      3,
  },
};

// ─── Utilities (exact copy from scpiScoring.ts) ───────────────────────────────

const clamp = (x: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, x));

function normaliseWeights(
  map?: Record<string, number> | null
): Record<string, number> {
  if (!map || Object.keys(map).length === 0) return {};
  const total = Object.values(map).reduce(
    (acc, b) => acc + (Number(b) || 0),
    0
  );
  if (total <= 0) return {};
  const out: Record<string, number> = {};
  for (const k of Object.keys(map)) {
    out[k] = (Number(map[k] ?? 0) || 0) / total;
  }
  return out;
}

/**
 * Percent-rank SQL method — returns 0..1.
 * `values` must be pre-sorted ascending (as REFERENCE_RENDEMENTS is).
 */
function percentRank(values: readonly number[], v: number): number {
  if (values.length === 0) return 0;
  if (values.length === 1) return 1;

  const first = values[0];
  const last  = values[values.length - 1];
  if (first === undefined || last === undefined) return 0;

  if (v <= first) return 0;
  if (v >= last)  return 1;

  const idx = (values as number[]).findIndex(x => x >= v);
  if (idx === -1) return 1;
  return idx / (values.length - 1);
}

// ─── Sub-scorers (exact algorithm from scpiScoring.ts) ────────────────────────

function scoreRendement(
  input: MaximusScoringInput,
  audit: string[]
): number {
  const r = Number(input.rendement);
  if (!Number.isFinite(r)) {
    audit.push("Rendement manquant → percentile=0 → score 0");
    return 0;
  }
  const p     = percentRank(REFERENCE_RENDEMENTS, r);
  let   score = 40 * p;
  const fg    = Number(input.frais_gestion) || 0;
  const malus = Math.max(fg - 10, 0) * 0.5;
  score -= malus;
  const fs = Number(input.frais_souscription) || 0;
  if (fs === 0) score += 1;
  audit.push(
    `Rendement p=${p.toFixed(2)} → 40*p=${(40 * p).toFixed(2)} ; ` +
    `frais_gestion=${fg} ⇒ −${malus.toFixed(2)} ; ` +
    `frais_souscription=${fs} ⇒ ${fs === 0 ? "+1" : "0"}`
  );
  return clamp(score, 0, 40);
}

function scoreSecteur(
  input: MaximusScoringInput,
  params: ScoringParams,
  audit: string[]
): number {
  const weights = normaliseWeights(input.repartition_sectorielle ?? null);
  if (Object.keys(weights).length === 0) {
    const base = 20 * params.fallbacks.secteur_unknown;
    audit.push(
      `Secteur manquant → fallback ${(params.fallbacks.secteur_unknown * 20).toFixed(2)}`
    );
    return clamp(base, 0, 20);
  }
  let acc = 0;
  const explained: string[] = [];
  for (const k of Object.keys(weights)) {
    const key = k.toLowerCase();
    let   coef = params.fallbacks.secteur_unknown;
    for (const probe in params.barèmes.secteur) {
      if (key.includes(probe)) {
        coef = params.barèmes.secteur[probe] ?? params.fallbacks.secteur_unknown;
        break;
      }
    }
    const w = weights[k] ?? 0;
    acc += w * coef;
    explained.push(`${(w * 100).toFixed(0)}% ${k}(${coef.toFixed(2)})`);
  }
  const score = 20 * acc;
  audit.push(`Secteur: ${explained.join(" + ")} ⇒ ${(acc * 20).toFixed(2)}`);
  return clamp(score, 0, 20);
}

function scoreGeo(
  input: MaximusScoringInput,
  params: ScoringParams,
  audit: string[]
): number {
  const raw = input.repartition_geographique ?? null;
  if (!raw || Object.keys(raw).length === 0) {
    if (params.fallbacks.geo_missing_is_france) {
      audit.push(
        `Géo manquante → France (fallback) ⇒ ${15 * params.barèmes.geo.france}`
      );
      return 15 * params.barèmes.geo.france;
    }
    return 15 * params.barèmes.geo.europe;
  }
  const w = normaliseWeights(raw);
  let wFR = 0, wEU = 0, wINT = 0;
  for (const k of Object.keys(w)) {
    const key = k.toLowerCase();
    const v   = w[k] ?? 0;
    if (
      /(paris|france|île|ile|idf|région|metropole|province|français|francais|hexagone)/.test(
        key
      )
    ) {
      wFR += v;
    } else if (
      /(allemagne|germany|espagne|spain|pays-bas|netherlands|irlande|ireland|belg|belgium|belgique|pologne|poland|italie|italy|royaume-uni|uk|londres|london|suisse|switzerland|autriche|austria|suede|sweden|norv|norway|danemark|denmark|finlande|finland|portugal|tche|czech|hongrie|hungary)/.test(
        key
      )
    ) {
      wEU += v;
    } else {
      wINT += v;
    }
  }
  const { france, europe, international } = params.barèmes.geo;
  const coef  = wFR * france + wEU * europe + wINT * international;
  const score = 15 * coef;
  audit.push(
    `Géo: FR ${(wFR * 100).toFixed(0)}% (1.00), ` +
    `EU ${(wEU * 100).toFixed(0)}% (0.80), ` +
    `INT ${(wINT * 100).toFixed(0)}% (0.60) ⇒ ${(coef * 15).toFixed(2)}`
  );
  return clamp(score, 0, 15);
}

function scoreQualite(
  input: MaximusScoringInput,
  params: ScoringParams,
  audit: string[]
): number {
  const {
    tof, endettement,
    prix_souscription, valeur_reconstitution,
    label_isr, sfdr,
  } = input;

  let pts = 0;

  // TOF
  if (tof == null) {
    pts += 2; audit.push("Qualité/TOF: null → +2");
  } else if (tof >= params.seuils.tof.haut) {
    pts += 7;
    audit.push(`Qualité/TOF: ${tof}% ≥ ${params.seuils.tof.haut}% → +7`);
  } else if (tof >= params.seuils.tof.moyen) {
    pts += 4;
    audit.push(
      `Qualité/TOF: ${tof}% ∈ [${params.seuils.tof.moyen}; ${params.seuils.tof.haut}) → +4`
    );
  } else {
    pts += 1;
    audit.push(`Qualité/TOF: ${tof}% < ${params.seuils.tof.moyen}% → +1`);
  }

  // LTV / endettement
  if (endettement == null) {
    pts += 2; audit.push("Qualité/LTV: null → +2");
  } else if (endettement <= params.seuils.ltv.tres_faible) {
    pts += 4;
    audit.push(`Qualité/LTV: ${endettement}% ≤ ${params.seuils.ltv.tres_faible}% → +4`);
  } else if (endettement <= params.seuils.ltv.faible) {
    pts += 3;
    audit.push(`Qualité/LTV: ${endettement}% ≤ ${params.seuils.ltv.faible}% → +3`);
  } else if (endettement <= params.seuils.ltv.moyen) {
    pts += 2;
    audit.push(`Qualité/LTV: ${endettement}% ≤ ${params.seuils.ltv.moyen}% → +2`);
  } else {
    pts += 1;
    audit.push(`Qualité/LTV: ${endettement}% > ${params.seuils.ltv.moyen}% → +1`);
  }

  // Écart prix / reconstitution
  let ecartUsed = false;
  if (
    valeur_reconstitution != null &&
    valeur_reconstitution > 0 &&
    prix_souscription != null
  ) {
    const e = (prix_souscription - valeur_reconstitution) / valeur_reconstitution;
    ecartUsed = true;
    if (e <= params.seuils.ecart_reconst.bonus) {
      pts += 2;
      audit.push(
        `Qualité/Ecart: décote ${(e * 100).toFixed(2)}% ≤ ${params.seuils.ecart_reconst.bonus * 100}% → +2`
      );
    } else if (Math.abs(e) <= params.seuils.ecart_reconst.neutre) {
      pts += 1;
      audit.push(
        `Qualité/Ecart: |${(e * 100).toFixed(2)}%| ≤ ${params.seuils.ecart_reconst.neutre * 100}% → +1`
      );
    } else {
      audit.push(
        `Qualité/Ecart: surcote ${(e * 100).toFixed(2)}% > ${params.seuils.ecart_reconst.neutre * 100}% → +0`
      );
    }
  }
  if (!ecartUsed) {
    pts += 1; audit.push("Qualité/Ecart: données manquantes → +1 (fallback)");
  }

  // ISR / SFDR
  if ((label_isr ?? "").toLowerCase() === "oui") {
    pts += 1; audit.push("Qualité/ISR: oui → +1");
  }
  const sfdrNorm = (sfdr ?? "").trim();
  if (sfdrNorm.includes("9"))      { pts += 1;   audit.push("Qualité/SFDR: 9 → +1"); }
  else if (sfdrNorm.includes("8")) { pts += 0.5; audit.push("Qualité/SFDR: 8 → +0.5"); }

  const score = clamp(pts, 0, 15);
  audit.push(`Qualité total (cap 15) = ${score.toFixed(2)}`);
  return score;
}

function scoreTaille(
  input: MaximusScoringInput,
  params: ScoringParams,
  audit: string[]
): number {
  const cap = Number(input.capitalisation);
  let pts = 0;

  if (!Number.isFinite(cap)) {
    pts += params.fallbacks.capi_null_points;
    audit.push(`Taille: capi=null → +${params.fallbacks.capi_null_points}`);
  } else if (cap >= 1000) {
    pts += 9; audit.push(`Taille: capi=${cap} ≥ 1000 → +9`);
  } else if (cap >= 500) {
    pts += 7; audit.push(`Taille: capi=${cap} ∈ [500;999] → +7`);
  } else if (cap >= 100) {
    pts += 5; audit.push(`Taille: capi=${cap} ∈ [100;499] → +5`);
  } else if (cap >= 50) {
    pts += 3; audit.push(`Taille: capi=${cap} ∈ [50;99] → +3`);
  } else {
    pts += 1; audit.push(`Taille: capi=${cap} < 50 → +1`);
  }

  const dj = Number(input.delai_jouissance);
  if (Number.isFinite(dj)) {
    if (dj <= 1)      { pts += 1;   audit.push(`Taille: délai=${dj.toFixed(1)} mois ≤1 → +1`); }
    else if (dj <= 6) { pts += 0.5; audit.push(`Taille: délai=${dj.toFixed(1)} mois ∈ [2;6] → +0.5`); }
    else              { audit.push(`Taille: délai=${dj.toFixed(1)} mois >6 → +0`); }
  } else {
    audit.push("Taille: délai=null → +0");
  }

  const score = clamp(pts, 0, 10);
  audit.push(`Taille total (cap 10) = ${score.toFixed(2)}`);
  return score;
}

// ─── Penalty flag ─────────────────────────────────────────────────────────────

/**
 * Returns true when all three critical quantitative fields are absent.
 * A score computed in this state is technically valid (fallbacks apply) but
 * unreliable enough to warrant a NEEDS_REVIEW flag in the pipeline.
 */
function hasMissingCriticalFields(input: MaximusScoringInput): boolean {
  return (
    input.rendement      == null &&
    input.tof            == null &&
    input.capitalisation == null
  );
}

// ─── Star rating ──────────────────────────────────────────────────────────────

/**
 * Maps a 0-100 score to a 1-5 star rating.
 * Thresholds are identical to mapScoreToIndex() in guidedJourneyLogic.ts.
 */
export function mapScoreToRating(score: number): number {
  if (score >= 85) return 5;
  if (score >= 75) return 4;
  if (score >= 65) return 3;
  if (score >= 55) return 2;
  return 1;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Computes the MaximusSCPI score for a single SCPI.
 *
 * Algorithm: exact port of `scoreScpiBatch()` from src/utils/scpiScoring.ts.
 * Percentile ranking uses the embedded reference cohort (n=51, 2025-01-09).
 *
 * Input units expected:
 *   rendement, tof, endettement, frais_gestion, frais_souscription  → %
 *   capitalisation                                                   → M€
 *   delai_jouissance                                                 → months
 *   prix_souscription, valeur_reconstitution                        → €
 */
export function computeMaximusScore(
  input: MaximusScoringInput
): MaximusScoreResult {
  const audit: string[] = [];

  const score_rendement = scoreRendement(input, audit);
  const score_secteur   = scoreSecteur(input, PARAMS, audit);
  const score_geo       = scoreGeo(input, PARAMS, audit);
  const score_qualite   = scoreQualite(input, PARAMS, audit);
  const score_taille    = scoreTaille(input, PARAMS, audit);
  const raw_total       = score_rendement + score_secteur + score_geo + score_qualite + score_taille;
  const score_total     = +clamp(raw_total, 0, 100).toFixed(2);

  audit.push(`Total = ${score_total}`);

  return {
    score_total,
    score_rendement: +score_rendement.toFixed(2),
    score_secteur:   +score_secteur.toFixed(2),
    score_geo:       +score_geo.toFixed(2),
    score_qualite:   +score_qualite.toFixed(2),
    score_taille:    +score_taille.toFixed(2),
    rating:          mapScoreToRating(score_total),
    audit_trail:     audit,
    version:         SCORING_VERSION,
    has_penalty:     hasMissingCriticalFields(input),
    computed_at:     new Date().toISOString(),
  };
}

/**
 * Converts an ExtractionResult (all values in bulletin-native units) to
 * MaximusScoringInput (scoring-expected units).
 *
 * Unit conversions applied:
 *   taux_distribution     [decimal 0-1]  → rendement [%]     × 100
 *   taux_occupation_financier [decimal]  → tof       [%]     × 100
 *   capitalisation        [EUR absolute] → capitalisation [M€] ÷ 1_000_000
 *   prix_part             [€]            → prix_souscription [€] (same)
 *   delai_jouissance      [days]         → delai_jouissance [months] ÷ 30.44
 *   frais_gestion         [decimal 0-1]  → frais_gestion [%]  × 100
 *   frais_souscription    [decimal 0-1]  → frais_souscription [%] × 100
 *   prix_reconstitution   [€/part]       → valeur_reconstitution [€] (same)
 *   repartition_sectorielle [{secteur,poids}] → Record<string, number>
 *   repartition_geographique [{pays, poids}]  → Record<string, number>
 *
 * Fields not available from bulletins (endettement, label_isr, sfdr) are
 * left undefined; the algorithm applies fallback values for those.
 */
export function fromExtraction(
  scpiSlug: string,
  extraction: ExtractionResult
): MaximusScoringInput {
  const c = extraction.chiffres_cles;
  const f = extraction.structure_frais;
  const v = extraction.valorisation_risque;

  const sectorMap: Record<string, number> | undefined =
    extraction.repartition_sectorielle.length > 0
      ? Object.fromEntries(
          extraction.repartition_sectorielle.map(i => [i.secteur, i.poids])
        )
      : undefined;

  const geoMap: Record<string, number> | undefined =
    extraction.repartition_geographique.length > 0
      ? Object.fromEntries(
          extraction.repartition_geographique.map(i => [i.pays, i.poids])
        )
      : undefined;

  // Build incrementally, omitting undefined fields (exactOptionalPropertyTypes)
  const input: {
    scpi_slug:               string;
    rendement?:              number;
    tof?:                    number;
    capitalisation?:         number;
    prix_souscription?:      number;
    delai_jouissance?:       number;
    frais_gestion?:          number;
    frais_souscription?:     number;
    valeur_reconstitution?:  number;
    repartition_sectorielle?: Record<string, number>;
    repartition_geographique?: Record<string, number>;
  } = { scpi_slug: scpiSlug };

  if (c.taux_distribution            !== undefined) input.rendement             = c.taux_distribution            * 100;
  if (c.taux_occupation_financier    !== undefined) input.tof                  = c.taux_occupation_financier    * 100;
  if (c.capitalisation               !== undefined) input.capitalisation        = c.capitalisation               / 1_000_000;
  if (c.prix_part                    !== undefined) input.prix_souscription     = c.prix_part;
  if (c.delai_jouissance             !== undefined) input.delai_jouissance      = c.delai_jouissance             / 30.44;
  if (f.frais_gestion                !== undefined) input.frais_gestion         = f.frais_gestion                * 100;
  if (f.frais_souscription           !== undefined) input.frais_souscription    = f.frais_souscription           * 100;
  if (v.prix_reconstitution          !== undefined) input.valeur_reconstitution = v.prix_reconstitution;
  if (sectorMap                      !== undefined) input.repartition_sectorielle  = sectorMap;
  if (geoMap                         !== undefined) input.repartition_geographique = geoMap;

  return input;
}
