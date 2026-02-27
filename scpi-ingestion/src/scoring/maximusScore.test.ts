/**
 * maximusScore.test.ts
 *
 * Unit tests for computeMaximusScore() and mapScoreToRating().
 *
 * All expected values were computed by hand against the algorithm in
 * maximusScore.ts to guarantee the implementation matches the spec.
 *
 * Run locally:
 *   node --import tsx/esm --test src/scoring/maximusScore.test.ts
 *
 * Or via package.json:
 *   npm test
 */

import { test, describe } from "node:test";
import { strict as assert } from "node:assert";
import { computeMaximusScore, mapScoreToRating } from "./maximusScore.js";
import type { MaximusScoringInput } from "../types.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Compare two numbers rounded to 2 decimal places. */
function assertScore(
  label: string,
  actual: number,
  expected: number
): void {
  assert.strictEqual(
    actual.toFixed(2),
    expected.toFixed(2),
    `${label}: expected ${expected.toFixed(2)}, got ${actual.toFixed(2)}`
  );
}

// ─── Fixtures ────────────────────────────────────────────────────────────────

/**
 * Fixture 1 — Mixed portfolio SCPI (mid-tier)
 *
 * rendement = 6.0  → percentRank = 32/50 = 0.64 → 40×0.64 = 25.6
 *   frais_gestion=12 → malus=(12−10)×0.5=1 → 24.6
 *   frais_souscription=9 (≠0) → no bonus
 *   score_rendement = 24.60
 *
 * repartition_sectorielle: Bureaux 60% (0.70), Commerces 40% (0.85)
 *   acc = 0.6×0.70 + 0.4×0.85 = 0.76  → score_secteur = 20×0.76 = 15.20
 *
 * repartition_geographique: France 50% (1.0), Allemagne 50% (0.8)
 *   coef = 0.5×1.0 + 0.5×0.8 = 0.9  → score_geo = 15×0.9 = 13.50
 *
 * tof=97 (≥95 → +7), endettement=20 (≤30 → +3), no prix/val → +1 fallback
 *   score_qualite = 11
 *
 * capitalisation=800 (∈[500;999] → +7), no delai → score_taille = 7
 *
 * total = 24.60 + 15.20 + 13.50 + 11 + 7 = 71.30
 * rating = 3 (65 ≤ 71.30 < 75)
 */
const fixture1: MaximusScoringInput = {
  scpi_slug:              "scpi-mixte",
  rendement:              6.0,
  tof:                    97,
  capitalisation:         800,
  endettement:            20,
  frais_gestion:          12,
  frais_souscription:     9,
  repartition_sectorielle:  { Bureaux: 60, Commerces: 40 },
  repartition_geographique: { France: 50, Allemagne: 50 },
};

/**
 * Fixture 2 — Pure fallback (all optional fields missing)
 *
 * score_rendement = 0       (rendement missing)
 * score_secteur   = 14      (20 × 0.70 unknown fallback)
 * score_geo       = 15      (15 × 1.0 France fallback)
 * score_qualite   = 5       (tof null→+2, endettement null→+2, no prix/val→+1)
 * score_taille    = 3       (capi null → capi_null_points=3)
 * total = 37   rating = 1
 */
const fixture2: MaximusScoringInput = {
  scpi_slug: "scpi-fallback",
};

/**
 * Fixture 3 — Perfect SCPI (maximum scores)
 *
 * rendement=11.18 (last in cohort → percentRank=1.0 → 40×1=40)
 *   frais_gestion=8 (malus=0), frais_souscription=0 (+1 bonus)
 *   score_rendement = clamp(41, 0, 40) = 40
 *
 * repartition_sectorielle: Santé 100% → coef=1.00 → score_secteur = 20
 *
 * repartition_geographique: Allemagne 40% + Espagne 30% + Pays-Bas 30%
 *   all EU → wEU=1.0 → coef=0.8 → score_geo = 15×0.8 = 12
 *
 * tof=97 (→+7), endettement=10 (≤15→+4),
 *   écart=(100-110)/110=−0.0909 ≤ −0.02 → +2,
 *   ISR oui→+1, SFDR Article 9→+1  → pts=15 → score_qualite=15
 *
 * capitalisation=2000 (≥1000→+9), no delai → score_taille=9
 *
 * total = 40 + 20 + 12 + 15 + 9 = 96   rating = 5 (≥85)
 */
const fixture3: MaximusScoringInput = {
  scpi_slug:              "scpi-parfaite",
  rendement:              11.18,
  tof:                    97,
  capitalisation:         2000,
  endettement:            10,
  frais_gestion:          8,
  frais_souscription:     0,
  prix_souscription:      100,
  valeur_reconstitution:  110,
  label_isr:              "oui",
  sfdr:                   "Article 9",
  repartition_sectorielle:  { "Santé": 100 },
  repartition_geographique: { Allemagne: 40, Espagne: 30, "Pays-Bas": 30 },
};

/**
 * Fixture 4 — Weak SCPI (all low scores)
 *
 * rendement=3.18 (min in cohort → percentRank=0 → score=0)
 *   frais_gestion=15 → malus=(15−10)×0.5=2.5 → −2.5 → clamp=0
 *   score_rendement = 0
 *
 * repartition_sectorielle: Hôtellerie 100% → coef=0.60 → score_secteur = 12
 *
 * repartition_geographique: Japon 50% + USA 50% → all INT
 *   coef = 1.0×0.6 = 0.6 → score_geo = 15×0.6 = 9
 *
 * tof=85 (<90→+1), endettement=50 (>40→+1), no prix/val→+1 fallback
 *   score_qualite = 3
 *
 * capitalisation=30 (<50→+1), no delai → score_taille = 1
 *
 * total = 0 + 12 + 9 + 3 + 1 = 25   rating = 1
 */
const fixture4: MaximusScoringInput = {
  scpi_slug:              "scpi-faible",
  rendement:              3.18,
  tof:                    85,
  capitalisation:         30,
  endettement:            50,
  frais_gestion:          15,
  frais_souscription:     10,
  repartition_sectorielle:  { "Hôtellerie": 100 },
  repartition_geographique: { Japon: 50, USA: 50 },
};

/**
 * Fixture 5 — No-fee SCPI with short délai de jouissance
 *
 * rendement=5.0 → percentRank = 19/50 = 0.38 → 40×0.38 = 15.2
 *   frais_gestion=10 → malus=max(10−10,0)×0.5=0
 *   frais_souscription=0 → +1 bonus
 *   score_rendement = 16.20
 *
 * repartition_sectorielle: Logistique 50% (0.80) + Bureaux 50% (0.70)
 *   acc = 0.5×0.80 + 0.5×0.70 = 0.75 → score_secteur = 15
 *
 * repartition_geographique: France 100% → score_geo = 15
 *
 * tof=93 (∈[90;95)→+4), endettement null→+2, no prix/val→+1 fallback
 *   score_qualite = 7
 *
 * capitalisation=250 (∈[100;499]→+5), delai_jouissance=1 (≤1→+1)
 *   score_taille = 6
 *
 * total = 16.20 + 15 + 15 + 7 + 6 = 59.20   rating = 2 (55 ≤ 59.20 < 65)
 */
const fixture5: MaximusScoringInput = {
  scpi_slug:              "scpi-sansfees",
  rendement:              5.0,
  tof:                    93,
  capitalisation:         250,
  frais_gestion:          10,
  frais_souscription:     0,
  delai_jouissance:       1,
  repartition_sectorielle:  { Logistique: 50, Bureaux: 50 },
  repartition_geographique: { France: 100 },
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("mapScoreToRating", () => {
  test("score ≥ 85 → 5 stars", () => assert.strictEqual(mapScoreToRating(96), 5));
  test("score ≥ 75 → 4 stars", () => assert.strictEqual(mapScoreToRating(79), 4));
  test("score ≥ 65 → 3 stars", () => assert.strictEqual(mapScoreToRating(71.3), 3));
  test("score ≥ 55 → 2 stars", () => assert.strictEqual(mapScoreToRating(59.2), 2));
  test("score < 55 → 1 star",  () => assert.strictEqual(mapScoreToRating(25), 1));
  test("boundary 85 → 5",  () => assert.strictEqual(mapScoreToRating(85), 5));
  test("boundary 84.99 → 4",  () => assert.strictEqual(mapScoreToRating(84.99), 4));
});

describe("computeMaximusScore", () => {
  describe("fixture 1 — mixed SCPI (mid-tier)", () => {
    const result = computeMaximusScore(fixture1);

    test("score_total = 71.30", ()  => assertScore("score_total", result.score_total, 71.30));
    test("score_rendement = 24.60", () => assertScore("score_rendement", result.score_rendement, 24.60));
    test("score_secteur = 15.20",   () => assertScore("score_secteur", result.score_secteur, 15.20));
    test("score_geo = 13.50",       () => assertScore("score_geo", result.score_geo, 13.50));
    test("score_qualite = 11.00",   () => assertScore("score_qualite", result.score_qualite, 11.00));
    test("score_taille = 7.00",     () => assertScore("score_taille", result.score_taille, 7.00));
    test("rating = 3",              () => assert.strictEqual(result.rating, 3));
    test("has_penalty = false",     () => assert.strictEqual(result.has_penalty, false));
    test("version = v1",            () => assert.strictEqual(result.version, "v1"));
  });

  describe("fixture 2 — pure fallback (all fields missing)", () => {
    const result = computeMaximusScore(fixture2);

    test("score_total = 37.00", () => assertScore("score_total", result.score_total, 37.00));
    test("score_rendement = 0", () => assertScore("score_rendement", result.score_rendement, 0));
    test("score_secteur = 14",  () => assertScore("score_secteur", result.score_secteur, 14.00));
    test("score_geo = 15",      () => assertScore("score_geo", result.score_geo, 15.00));
    test("score_qualite = 5",   () => assertScore("score_qualite", result.score_qualite, 5.00));
    test("score_taille = 3",    () => assertScore("score_taille", result.score_taille, 3.00));
    test("rating = 1",          () => assert.strictEqual(result.rating, 1));
    test("has_penalty = true",  () => assert.strictEqual(result.has_penalty, true));
  });

  describe("fixture 3 — perfect SCPI (max scores)", () => {
    const result = computeMaximusScore(fixture3);

    test("score_total = 96.00", () => assertScore("score_total", result.score_total, 96.00));
    test("score_rendement = 40.00", () => assertScore("score_rendement", result.score_rendement, 40.00));
    test("score_secteur = 20.00",   () => assertScore("score_secteur", result.score_secteur, 20.00));
    test("score_geo = 12.00",       () => assertScore("score_geo", result.score_geo, 12.00));
    test("score_qualite = 15.00",   () => assertScore("score_qualite", result.score_qualite, 15.00));
    test("score_taille = 9.00",     () => assertScore("score_taille", result.score_taille, 9.00));
    test("rating = 5",              () => assert.strictEqual(result.rating, 5));
    test("has_penalty = false",     () => assert.strictEqual(result.has_penalty, false));
  });

  describe("fixture 4 — weak SCPI (all low)", () => {
    const result = computeMaximusScore(fixture4);

    test("score_total = 25.00",   () => assertScore("score_total", result.score_total, 25.00));
    test("score_rendement = 0",   () => assertScore("score_rendement", result.score_rendement, 0));
    test("score_secteur = 12.00", () => assertScore("score_secteur", result.score_secteur, 12.00));
    test("score_geo = 9.00",      () => assertScore("score_geo", result.score_geo, 9.00));
    test("score_qualite = 3.00",  () => assertScore("score_qualite", result.score_qualite, 3.00));
    test("score_taille = 1.00",   () => assertScore("score_taille", result.score_taille, 1.00));
    test("rating = 1",            () => assert.strictEqual(result.rating, 1));
  });

  describe("fixture 5 — no-fee SCPI with short délai", () => {
    const result = computeMaximusScore(fixture5);

    test("score_total = 59.20",   () => assertScore("score_total", result.score_total, 59.20));
    test("score_rendement = 16.20", () => assertScore("score_rendement", result.score_rendement, 16.20));
    test("score_secteur = 15.00",   () => assertScore("score_secteur", result.score_secteur, 15.00));
    test("score_geo = 15.00",       () => assertScore("score_geo", result.score_geo, 15.00));
    test("score_qualite = 7.00",    () => assertScore("score_qualite", result.score_qualite, 7.00));
    test("score_taille = 6.00",     () => assertScore("score_taille", result.score_taille, 6.00));
    test("rating = 2",              () => assert.strictEqual(result.rating, 2));
    test("has_penalty = false",     () => assert.strictEqual(result.has_penalty, false));
  });

  describe("output shape", () => {
    const result = computeMaximusScore(fixture1);
    test("has audit_trail array",   () => assert.ok(Array.isArray(result.audit_trail)));
    test("audit_trail non-empty",   () => assert.ok(result.audit_trail.length > 0));
    test("computed_at is ISO 8601", () => {
      assert.match(result.computed_at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });
});
