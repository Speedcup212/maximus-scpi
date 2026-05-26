import { type Result, ok, err } from "./types.js";

// ─── Domain types ─────────────────────────────────────────────────────────────

export interface NormalizedPeriod {
  readonly year: number;
  readonly quarter: 1 | 2 | 3 | 4;
  /** Canonical form: "2025-T3" */
  readonly normalized: string;
}

export interface PeriodParseError {
  readonly reason: "PERIOD_NOT_FOUND";
  readonly input: string;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

const VALID_YEAR_MIN = 2000;
const VALID_YEAR_MAX = 2099;

function isValidYear(y: number): boolean {
  return y >= VALID_YEAR_MIN && y <= VALID_YEAR_MAX;
}

function toQuarter(raw: string): 1 | 2 | 3 | 4 | null {
  const n = parseInt(raw, 10);
  if (n === 1 || n === 2 || n === 3 || n === 4) return n;
  return null;
}

function make(year: number, quarter: 1 | 2 | 3 | 4): NormalizedPeriod {
  return { year, quarter, normalized: `${year}-T${quarter}` };
}

/**
 * Normalize accented characters so patterns can stay ASCII-only.
 * "3ème" → "3eme", "1er" stays "1er".
 */
function normalize(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ─── Pattern matchers ─────────────────────────────────────────────────────────
//
// Each matcher returns NormalizedPeriod | null.
// Applied in order — first non-null result wins.
// All operate on the accent-normalized string.

type Matcher = (s: string) => NormalizedPeriod | null;

/**
 * T3 2024 | T3-2024 | T3_2024 | Bulletin-T3-2024 (T<q> before year)
 */
const matchTQuarterYear: Matcher = (s) => {
  const m = /\bT([1-4])[\s_\-]+(\d{4})\b/i.exec(s);
  if (!m) return null;
  const q = toQuarter(m[1] ?? "");
  const y = parseInt(m[2] ?? "", 10);
  return q !== null && isValidYear(y) ? make(y, q) : null;
};

/**
 * 2024-T3 | 2024_T3 | 2024 T3 (year before T<q>)
 */
const matchYearTQuarter: Matcher = (s) => {
  const m = /\b(\d{4})[\s_\-]+T([1-4])\b/i.exec(s);
  if (!m) return null;
  const y = parseInt(m[1] ?? "", 10);
  const q = toQuarter(m[2] ?? "");
  return q !== null && isValidYear(y) ? make(y, q) : null;
};

/**
 * Q1 2025 | Q3-2024 (Q<q> before year)
 */
const matchQQuarterYear: Matcher = (s) => {
  const m = /\bQ([1-4])[\s_\-]+(\d{4})\b/i.exec(s);
  if (!m) return null;
  const q = toQuarter(m[1] ?? "");
  const y = parseInt(m[2] ?? "", 10);
  return q !== null && isValidYear(y) ? make(y, q) : null;
};

/**
 * 2025-Q1 | 2024 Q3 (year before Q<q>)
 */
const matchYearQQuarter: Matcher = (s) => {
  const m = /\b(\d{4})[\s_\-]+Q([1-4])\b/i.exec(s);
  if (!m) return null;
  const y = parseInt(m[1] ?? "", 10);
  const q = toQuarter(m[2] ?? "");
  return q !== null && isValidYear(y) ? make(y, q) : null;
};

/**
 * French ordinal before "trimestre":
 *   1er trimestre 2025
 *   2eme trimestre 2025
 *   3eme trimestre 2024
 *   4e trimestre 2025
 * (accents already stripped by normalize())
 */
const matchFrenchOrdinalTrimestre: Matcher = (s) => {
  const m = /\b([1-4])(?:er|ere|eme|e)\s+trimestre\s+(\d{4})\b/i.exec(s);
  if (!m) return null;
  const q = toQuarter(m[1] ?? "");
  const y = parseInt(m[2] ?? "", 10);
  return q !== null && isValidYear(y) ? make(y, q) : null;
};

/**
 * French bare ordinal: "3 trimestre 2024" (no suffix — rare but seen in filenames)
 */
const matchFrenchBareTrimestre: Matcher = (s) => {
  const m = /\b([1-4])\s+trimestre\s+(\d{4})\b/i.exec(s);
  if (!m) return null;
  const q = toQuarter(m[1] ?? "");
  const y = parseInt(m[2] ?? "", 10);
  return q !== null && isValidYear(y) ? make(y, q) : null;
};

/**
 * French reversed: "trimestre 3 2024"
 */
const matchFrenchTrimestre: Matcher = (s) => {
  const m = /\btrimestre\s+([1-4])\s+(\d{4})\b/i.exec(s);
  if (!m) return null;
  const q = toQuarter(m[1] ?? "");
  const y = parseInt(m[2] ?? "", 10);
  return q !== null && isValidYear(y) ? make(y, q) : null;
};

const MATCHERS: readonly Matcher[] = [
  matchTQuarterYear,
  matchYearTQuarter,
  matchQQuarterYear,
  matchYearQQuarter,
  matchFrenchOrdinalTrimestre,
  matchFrenchBareTrimestre,
  matchFrenchTrimestre,
];

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Attempts to extract a quarterly period from a free-form string.
 * Supports T/Q notation (with year before or after) and French "trimestre" forms.
 * Returns Err<PeriodParseError> with reason "PERIOD_NOT_FOUND" on failure.
 */
export function parsePeriod(input: string): Result<NormalizedPeriod, PeriodParseError> {
  const s = normalize(input);

  for (const matcher of MATCHERS) {
    const result = matcher(s);
    if (result !== null) return ok(result);
  }

  return err({ reason: "PERIOD_NOT_FOUND", input });
}

/**
 * Ascending comparator suitable for Array.sort().
 * Returns negative if a < b, 0 if equal, positive if a > b.
 */
export function comparePeriods(a: NormalizedPeriod, b: NormalizedPeriod): number {
  if (a.year !== b.year) return a.year - b.year;
  return a.quarter - b.quarter;
}

// ─── Annual report period ─────────────────────────────────────────────────────

/**
 * Canonical period for a rapport annuel: "YYYY-RA".
 * Not comparable to NormalizedPeriod (no quarter).
 */
export interface AnnualReportPeriod {
  readonly year: number;
  /** Canonical form: "2024-RA" */
  readonly normalized: string;
}

/**
 * Extracts a four-digit year (2000-2099) from a free-form string.
 * Prefers the most recent valid year found.
 * Returns null if no valid year found.
 */
export function parseAnnualYear(input: string): AnnualReportPeriod | null {
  const s = normalize(input);
  const yearRe = /\b(20\d{2})\b/g;
  let m: RegExpExecArray | null;
  let best: number | null = null;

  while ((m = yearRe.exec(s)) !== null) {
    const y = parseInt(m[1] ?? "", 10);
    if (isValidYear(y) && (best === null || y > best)) best = y;
  }

  if (best === null) return null;
  return { year: best, normalized: `${best}-RA` };
}

/**
 * Builds an AnnualReportPeriod from an explicit year.
 */
export function makeAnnualPeriod(year: number): AnnualReportPeriod {
  return { year, normalized: `${year}-RA` };
}
