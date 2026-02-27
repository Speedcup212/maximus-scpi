import {
  type ExtractedMetrics,
  type QaResult,
  type QaStatus,
  type QaWarning,
} from "./types.js";

// ─── Thresholds ───────────────────────────────────────────────────────────────

const TOF_MIN              = 0.70;
const TOF_MAX              = 1.00;
const TD_MAX               = 0.15;
const CAPITALISATION_MIN   = 5_000_000;
const CONFIDENCE_THRESHOLD = 0.50;

// ─── Formatting helpers ───────────────────────────────────────────────────────

function pct(v: number): string {
  return `${(v * 100).toFixed(2)} %`;
}

function eur(v: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(v);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Runs the QA ruleset against extracted bulletin metrics.
 *
 * Rules (applied in order):
 *   1. TOF < 0.70 or TOF > 1.00  → warning  (value present but suspicious)
 *   2. TD  > 0.15                 → warning  (distribution unusually high)
 *   3. capitalisation < 5 000 000 → warning  (very small fund)
 *   4. no TOF AND no TD           → NEEDS_REVIEW (key fields missing)
 *   5. confidence < 0.50          → NEEDS_REVIEW (extraction unreliable)
 *   6. otherwise                  → OK
 *
 * Rules 1–3 are informational warnings that never change the status by
 * themselves.  Rules 4–5 set status to NEEDS_REVIEW regardless of warnings.
 *
 * A result can be OK with warnings (e.g. a legitimately high TD is suspicious
 * but does not require manual review if confidence is high and fields are
 * present).
 */
export function runQa(metrics: ExtractedMetrics): QaResult {
  const warnings: QaWarning[] = [];

  // ── Rule 1: TOF range ────────────────────────────────────────────────────
  if (metrics.tof !== undefined) {
    if (metrics.tof < TOF_MIN || metrics.tof > TOF_MAX) {
      warnings.push({
        field: "tof",
        value: metrics.tof,
        message:
          `TOF ${pct(metrics.tof)} is outside the expected range ` +
          `[${pct(TOF_MIN)}, ${pct(TOF_MAX)}]`,
      });
    }
  }

  // ── Rule 2: TD ceiling ────────────────────────────────────────────────────
  if (metrics.td !== undefined) {
    if (metrics.td > TD_MAX) {
      warnings.push({
        field: "td",
        value: metrics.td,
        message:
          `TD ${pct(metrics.td)} exceeds the maximum threshold of ${pct(TD_MAX)}`,
      });
    }
  }

  // ── Rule 3: Capitalisation floor ──────────────────────────────────────────
  if (metrics.capitalisation !== undefined) {
    if (metrics.capitalisation < CAPITALISATION_MIN) {
      warnings.push({
        field: "capitalisation",
        value: metrics.capitalisation,
        message:
          `Capitalisation ${eur(metrics.capitalisation)} is below the minimum ` +
          `threshold of ${eur(CAPITALISATION_MIN)}`,
      });
    }
  }

  // ── Rules 4 & 5: status determination ────────────────────────────────────
  let status: QaStatus = "OK";

  if (metrics.tof === undefined && metrics.td === undefined) {
    // Rule 4: neither key occupancy nor distribution rate could be extracted
    status = "NEEDS_REVIEW";
  }

  if (metrics.confidence < CONFIDENCE_THRESHOLD) {
    // Rule 5: extraction confidence too low to trust any value
    status = "NEEDS_REVIEW";
  }

  return { status, warnings, metrics };
}
