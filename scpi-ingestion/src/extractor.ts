/**
 * extractor.ts
 *
 * Extracts all structured SCPI data blocks from raw bulletin PDF text.
 *
 * Input  : raw UTF-8 text string from a parsed PDF.
 * Output : ExtractionResult with 9 typed data blocks + confidence score.
 *
 * Normalisation rules applied to all fields:
 *   - Percentages  → decimal  [0, 1]         (e.g. "94,5 %" → 0.945)
 *   - Monetary     → absolute EUR integer     (e.g. "806 M€" → 806_000_000)
 *   - Lease durations → decimal years         (e.g. "18 mois" → 1.5)
 *   - Délai de jouissance → integer days
 *
 * Confidence = (non-null critical fields) / (total critical fields).
 * Critical fields (10): capitalisation, taux_distribution, TOF, TOP,
 *   prix_part, sector breakdown, geo breakdown, frais_gestion,
 *   WALB or bail duration, valeur_expertise.
 */

// ─── Exported types ───────────────────────────────────────────────────────────

export interface ChiffresCles {
  /** Total capitalisation in EUR (absolute integer). */
  capitalisation?:            number;
  /** Taux de Distribution — decimal [0, 1]. */
  taux_distribution?:         number;
  /** Taux d'Occupation Financier — decimal [0, 1]. */
  taux_occupation_financier?: number;
  /** Taux d'Occupation Physique — decimal [0, 1]. */
  taux_occupation_physique?:  number;
  /** Prix de souscription per share in EUR. */
  prix_part?:                 number;
  /** Total number of shares in circulation. */
  nombre_parts?:              number;
  /** Number of shareholders / associés. */
  nombre_associes?:           number;
  /** Year the SCPI was created (e.g. 2004). */
  annee_creation?:            number;
  /** Délai de jouissance — integer days. */
  delai_jouissance?:          number;
  /** Recommended holding period — decimal years. */
  journalisation?:            number;
}

export interface ProfilRisque {
  /** SRRI risk indicator level 1–7. */
  niveau?:      number;
  /** Context sentence extracted around the SRRI mention. */
  commentaire?: string;
}

export interface SecteurItem {
  readonly secteur: string;
  /** Weight — decimal [0, 1]. */
  readonly poids:   number;
}

export interface GeoItem {
  readonly pays:  string;
  /** Weight — decimal [0, 1]. */
  readonly poids: number;
}

export interface StructureFrais {
  /** Frais de souscription — decimal [0, 1]. */
  frais_souscription?:     number;
  /** Frais de gestion (annual) — decimal [0, 1]. */
  frais_gestion?:          number;
  /** Commission de performance — decimal [0, 1]. */
  commission_performance?: number;
  /** Frais de sortie / retrait — decimal [0, 1]. */
  frais_sortie?:           number;
}

export interface IndicateursLocatifs {
  /** Taux d'Occupation Financier — decimal [0, 1]. */
  taux_occupation_financier?: number;
  /** Taux d'Occupation Physique — decimal [0, 1]. */
  taux_occupation_physique?:  number;
  /** Remaining lease duration — decimal years (proxy when WALT absent). */
  duree_bail_restante?:       number;
  /** Weighted Average Lease Break — decimal years. */
  walb?:                      number;
  /** Weighted Average Lease Term — decimal years. */
  walt?:                      number;
}

export interface ValorisationRisque {
  /** Portfolio expert valuation in EUR (absolute). */
  valeur_expertise?:    number;
  /** Latent capital gain — decimal (e.g. 0.125 = 12.5 %). */
  plus_value_latente?:  number;
  /** Reconstitution price per share in EUR. */
  prix_reconstitution?: number;
  /** Premium (+) or décote (−) vs reconstitution price — decimal. */
  prime_decote?:        number;
}

export interface StrategieInvestissement {
  focus_geographique?:  string;
  focus_sectoriel?:     string;
  /** Target yield — decimal [0, 1]. */
  objectif_rendement?:  number;
  politique_dividende?: string;
}

export interface ActualiteTrimestrielle {
  acquisitions: string[];
  arbitrages:   string[];
  commentaire?: string;
}

export interface ExtractionMeta {
  readonly critical_fields_total: number;
  readonly critical_fields_found: number;
}

export interface ExtractionResult {
  readonly chiffres_cles:            ChiffresCles;
  readonly profil_risque:            ProfilRisque;
  readonly repartition_sectorielle:  SecteurItem[];
  readonly repartition_geographique: GeoItem[];
  readonly structure_frais:          StructureFrais;
  readonly indicateurs_locatifs:     IndicateursLocatifs;
  readonly valorisation_risque:      ValorisationRisque;
  readonly strategie_investissement: StrategieInvestissement;
  readonly actualite_trimestrielle:  ActualiteTrimestrielle;
  /** Confidence in [0, 1] = critical_fields_found / critical_fields_total. */
  readonly confidence:               number;
  readonly _meta:                    ExtractionMeta;
}

// ─── Number parsing primitives ────────────────────────────────────────────────

/**
 * Parses a French-formatted number string to a JS number.
 *
 * Handles:
 *   "1 234 567"    → 1234567   (spaces as thousands separator)
 *   "32,6"         → 32.6      (comma as decimal)
 *   "1.234,5"      → 1234.5    (dot-thousands / comma-decimal)
 *   "1,234.5"      → 1234.5    (comma-thousands / dot-decimal — English PDFs)
 *
 * The heuristic: whichever of comma/dot appears last is the decimal separator.
 * If only one type is present and it divides ≤ 2 digits, it's decimal;
 * otherwise it's a thousands separator.
 */
function parseFrNum(raw: string): number | null {
  const s = raw.trim();
  if (!s) return null;

  const dotPos   = s.lastIndexOf(".");
  const commaPos = s.lastIndexOf(",");

  let clean: string;

  if (commaPos > dotPos) {
    // comma is the decimal separator; dots / spaces are thousands separators
    clean = s
      .replace(/[\s\u00a0\u202f.]/g, "")
      .replace(",", ".");
  } else if (dotPos > commaPos) {
    // dot is the decimal separator; commas / spaces are thousands separators
    clean = s.replace(/[\s\u00a0\u202f,]/g, "");
  } else {
    // no mixed separators — spaces only (e.g. "1 234 567")
    clean = s.replace(/[\s\u00a0\u202f]/g, "");
  }

  const n = parseFloat(clean);
  return isNaN(n) ? null : n;
}

/** Monetary unit multipliers (lower-case key). */
const UNIT_MULT = new Map<string, number>([
  ["md€",       1_000_000_000],
  ["milliard",  1_000_000_000],
  ["milliards", 1_000_000_000],
  ["m€",        1_000_000],
  ["million",   1_000_000],
  ["millions",  1_000_000],
  ["k€",        1_000],
  ["millier",   1_000],
  ["milliers",  1_000],
]);

/**
 * Parses an amount with an optional French monetary unit to absolute EUR.
 *   "806 M€"          → 806_000_000
 *   "32,6 millions"   → 32_600_000
 *   "2,1 Md€"         → 2_100_000_000
 *   "1 234 567 €"     → 1_234_567
 */
function parseAmount(raw: string): number | null {
  const m = /^([0-9][0-9\s\u00a0,.]*)\s*(Md€|M€|milliards?|millions?|k€|milliers?|€)?$/i.exec(
    raw.trim()
  );
  if (!m) return null;

  const numPart  = m[1];
  const unitPart = m[2];
  if (!numPart) return null;

  const num = parseFrNum(numPart);
  if (num === null) return null;

  const unitKey = (unitPart ?? "").toLowerCase();
  const mult    = UNIT_MULT.get(unitKey) ?? 1;

  return Math.round(num * mult);
}

/**
 * Parses a percentage string to decimal [0, 1].
 * The `raw` argument should be the numeric part only (without or with %).
 * Values > 1 are assumed to be in "%" form and are divided by 100.
 *   "94,5"   → 0.945
 *   "5,67"   → 0.0567
 */
function parsePct(raw: string): number | null {
  const s   = raw.trim().replace("%", "");
  const n   = parseFrNum(s);
  if (n === null) return null;
  return n > 1 ? n / 100 : n;
}

/**
 * Parses a duration string (including unit) to decimal years.
 *   "4,2 ans"   → 4.2
 *   "18 mois"   → 1.5
 *   "547 jours" → 1.498…
 *   "4,2"       → 4.2  (unitless — assumed years)
 */
function parseDuration(raw: string): number | null {
  const s   = raw.trim().toLowerCase();
  const m   = /([0-9]+(?:[,\.][0-9]+)?)/.exec(s);
  if (!m) return null;

  const numStr = m[1];
  if (!numStr) return null;

  const n = parseFrNum(numStr);
  if (n === null) return null;

  if (/mois/.test(s))  return n / 12;
  if (/jour/.test(s))  return n / 365;
  return n; // default: already in years
}

// ─── Pattern search helpers ───────────────────────────────────────────────────

/**
 * Returns the first non-undefined captured group (default group 1) for the
 * first pattern that matches.  Returns null if nothing matches.
 */
function firstMatch(text: string, patterns: RegExp[], group = 1): string | null {
  for (const re of patterns) {
    const m = re.exec(text);
    if (!m) continue;
    const val = m[group];
    if (val !== undefined) return val.trim();
  }
  return null;
}

// ─── Section extractor ────────────────────────────────────────────────────────

/**
 * Major section header patterns that delimit bulletin sections.
 * Used to stop reading the current section when the next one starts.
 */
const SECTION_BOUNDARIES: RegExp[] = [
  /^\s*(?:chiffres?\s+cl[eé]s?|indicateurs?\s+cl[eé]s?)/im,
  /^\s*profil\s+de\s+risque/im,
  /^\s*r[eé]partition\s+(?:sectorielle|g[eé]ographique|par\s+(?:secteur|pays|zone))/im,
  /^\s*(?:structure\s+des?\s+frais|frais\s+(?:de\s+gestion|de\s+souscription))/im,
  /^\s*indicateurs?\s+locatifs/im,
  /^\s*valorisation/im,
  /^\s*strat[eé]gie\s+d[''']investissement/im,
  /^\s*politique\s+d[''']investissement/im,
  /^\s*actualit[eé]\s+(?:du\s+trimestre|trimestrielle)/im,
  /^\s*faits?\s+marquants/im,
  /^\s*(?:acquisitions?|arbitrages?|cessions?)\s*$/im,
];

/**
 * Extracts the text body of a bulletin section identified by startPatterns.
 * Stops at the next section boundary or after maxLength characters.
 */
function extractSection(
  text:          string,
  startPatterns: RegExp[],
  maxLength      = 3_000,
): string {
  let startIdx  = -1;
  let headerEnd = 0;

  for (const re of startPatterns) {
    const m = re.exec(text);
    if (m !== null && (startIdx === -1 || m.index < startIdx)) {
      startIdx  = m.index;
      headerEnd = m.index + m[0].length;
    }
  }

  if (startIdx === -1) return "";

  const body      = text.slice(headerEnd, headerEnd + maxLength);
  let   endOffset = body.length;

  for (const boundary of SECTION_BOUNDARIES) {
    const m = boundary.exec(body);
    // Skip boundary if it fires within 10 chars (might be the same header)
    if (m !== null && m.index > 10) {
      endOffset = Math.min(endOffset, m.index);
    }
  }

  return body.slice(0, endOffset).trim();
}

// ─── Breakdown table parser ───────────────────────────────────────────────────

/** Stop words — lines whose labels consist entirely of these are skipped. */
const BREAKDOWN_STOPS = new Set([
  "au", "du", "le", "la", "les", "des", "de", "et", "en", "pour", "sur",
  "par", "avec", "total", "global", "ensemble", "dont", "hors", "taux",
  "pondération", "allocation", "secteur", "zone", "pays", "géographie",
  "source", "données", "répartition", "à", "note", "soit",
]);

/**
 * Parses a text section that may contain a breakdown table.
 * Recognises:
 *   - Line format:   "Bureaux  45,0 %"  /  "Bureaux : 45%"  /  "Bureaux | 45"
 *   - Inline format: "Bureaux (45%), Commerce (25%)"
 * Returns items sorted by poids descending, poids in decimal [0, 1].
 */
function parseBreakdown(section: string): { label: string; poids: number }[] {
  const seen  = new Set<string>();
  const items: { label: string; poids: number }[] = [];

  function addItem(rawLabel: string, pctStr: string): void {
    const label = rawLabel.trim().replace(/\s+/g, " ");
    if (label.length < 2 || label.length > 60) return;
    if (/^\d/.test(label)) return; // starts with digit

    const words = label.toLowerCase().split(/\s+/);
    if (words.every(w => BREAKDOWN_STOPS.has(w))) return;

    const poids = parsePct(pctStr);
    if (poids === null || poids <= 0 || poids > 1.001) return;

    const key = label.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      items.push({ label, poids });
    }
  }

  // ── Strategy 1: "Label  XX,X %" lines (with separator : | – or space) ──
  const lineRe =
    /^([\w\s\u00c0-\u024f\u2019\-\/'']+?)\s*[:|–\-]?\s*([0-9]+(?:[,\.][0-9]+)?)\s*%/gim;
  let m: RegExpExecArray | null;
  while ((m = lineRe.exec(section)) !== null) {
    const g1 = m[1]; const g2 = m[2];
    if (g1 !== undefined && g2 !== undefined) addItem(g1, g2);
  }

  // ── Strategy 2: "Label (XX%)" inline format ──────────────────────────────
  const inlineRe =
    /([\w\u00c0-\u024f]{3,}[\w\u00c0-\u024f\s\-]*?)\s*[(\[]\s*([0-9]+(?:[,\.][0-9]+)?)\s*%\s*[)\]]/gi;
  while ((m = inlineRe.exec(section)) !== null) {
    const g1 = m[1]; const g2 = m[2];
    if (g1 !== undefined && g2 !== undefined) addItem(g1, g2);
  }

  return items.sort((a, b) => b.poids - a.poids);
}

// ─── Bullet-point extractor ───────────────────────────────────────────────────

/** Unicode / ASCII bullet characters. */
const BULLET_RE  = /^[\u2022\u2023\u2043\u2219\u25cf\u25e6\u25aa\u25ab•‣⁃·▪▫–—\-*]\s+/;
const NUMBERED_RE = /^\d+[.)]\s+/;

/**
 * Extracts bullet-point strings from a section of text.
 * Handles • – — - * numbered lists and indented continuation lines.
 */
function extractBullets(section: string): string[] {
  const lines:   string[] = section.split("\n");
  const results: string[] = [];
  let   current           = "";

  const flush = (): void => {
    const s = current.trim();
    if (s.length > 5) results.push(s);
    current = "";
  };

  for (const raw of lines) {
    const line      = raw.trim();
    const isBullet  = BULLET_RE.test(line);
    const isNumber  = NUMBERED_RE.test(line);

    if (!line) {
      flush();
      continue;
    }
    if (isBullet || isNumber) {
      flush();
      current = line.replace(BULLET_RE, "").replace(NUMBERED_RE, "").trim();
    } else if (current && raw.startsWith("  ")) {
      // Indented continuation of the previous bullet
      current += " " + line;
    } else if (current) {
      flush();
    }
  }
  flush();

  return results;
}

// ─── Block extractors ─────────────────────────────────────────────────────────

function extractChiffresCles(text: string): ChiffresCles {
  const result: ChiffresCles = {};

  // ── Capitalisation ────────────────────────────────────────────────────────
  const capStr = firstMatch(text, [
    /capitalisa(?:tion)?\s*(?:totale)?\s*[:\-=]\s*([\d\s\u00a0.,]+\s*(?:Md€|M€|milliards?|millions?|k€|€))/i,
    /patrimoine\s+(?:net|total)\s*[:\-=]\s*([\d\s\u00a0.,]+\s*(?:Md€|M€|milliards?|millions?|k€|€))/i,
    /actif\s+net\s*[:\-=]\s*([\d\s\u00a0.,]+\s*(?:Md€|M€|milliards?|millions?|k€|€))/i,
    /capitaux\s+propres\s*[:\-=]\s*([\d\s\u00a0.,]+\s*(?:Md€|M€|milliards?|millions?|k€|€))/i,
    /valeur\s+(?:totale\s+)?du\s+patrimoine\s*[:\-=]\s*([\d\s\u00a0.,]+\s*(?:Md€|M€|milliards?|millions?|k€|€))/i,
  ]);
  if (capStr !== null) {
    const v = parseAmount(capStr);
    if (v !== null) result.capitalisation = v;
  }

  // ── Taux de Distribution ─────────────────────────────────────────────────
  const tdStr = firstMatch(text, [
    /taux\s+de\s+distribution\s*(?:sur\s+valeur\s+de\s+march[eé])?\s*[:\-=]?\s*([\d,\.]+)\s*%/i,
    /\bTD\b\s*(?:\d{4})?\s*[:\-=]\s*([\d,\.]+)\s*%/i,
    /DVM\s*(?:\d{4})?\s*[:\-=]\s*([\d,\.]+)\s*%/i,
    /rendement\s+(?:net\s+)?distribu[eé]\s*[:\-=]\s*([\d,\.]+)\s*%/i,
  ]);
  if (tdStr !== null) {
    const v = parsePct(tdStr);
    if (v !== null) result.taux_distribution = v;
  }

  // ── Taux d'Occupation Financier ──────────────────────────────────────────
  const tofStr = firstMatch(text, [
    /taux\s+d[''']occupation\s+financier\s*[:\-=]?\s*([\d,\.]+)\s*%/i,
    /\bT\.?O\.?F\.?\b\s*[:\-=]\s*([\d,\.]+)\s*%/i,
    /occupation\s+financi[eè]re\s*[:\-=]\s*([\d,\.]+)\s*%/i,
  ]);
  if (tofStr !== null) {
    const v = parsePct(tofStr);
    if (v !== null) result.taux_occupation_financier = v;
  }

  // ── Taux d'Occupation Physique ───────────────────────────────────────────
  const topStr = firstMatch(text, [
    /taux\s+d[''']occupation\s+physique\s*[:\-=]?\s*([\d,\.]+)\s*%/i,
    /\bT\.?O\.?P\.?\b\s*[:\-=]\s*([\d,\.]+)\s*%/i,
    /occupation\s+physique\s*[:\-=]\s*([\d,\.]+)\s*%/i,
  ]);
  if (topStr !== null) {
    const v = parsePct(topStr);
    if (v !== null) result.taux_occupation_physique = v;
  }

  // ── Prix de part ──────────────────────────────────────────────────────────
  const prixStr = firstMatch(text, [
    /prix\s+de\s+(?:la\s+)?part\s*[:\-=]\s*([\d\s\u00a0.,]+)\s*€/i,
    /valeur\s+de\s+(?:la\s+)?part\s*[:\-=]\s*([\d\s\u00a0.,]+)\s*€/i,
    /prix\s+de\s+souscription\s*[:\-=]\s*([\d\s\u00a0.,]+)\s*€/i,
    /valeur\s+nominale\s*[:\-=]\s*([\d\s\u00a0.,]+)\s*€/i,
  ]);
  if (prixStr !== null) {
    const v = parseFrNum(prixStr);
    if (v !== null && v > 0) result.prix_part = v;
  }

  // ── Nombre de parts ───────────────────────────────────────────────────────
  const nbPartsStr = firstMatch(text, [
    /nombre\s+(?:total\s+)?de\s+parts?\s*(?:en\s+circulation)?\s*[:\-=]\s*([\d\s\u00a0]+)/i,
    /parts?\s+en\s+circulation\s*[:\-=]\s*([\d\s\u00a0]+)/i,
  ]);
  if (nbPartsStr !== null) {
    const v = parseFrNum(nbPartsStr.replace(/\s/g, ""));
    if (v !== null && v > 0) result.nombre_parts = Math.round(v);
  }

  // ── Nombre d'associés ─────────────────────────────────────────────────────
  const nbAssStr = firstMatch(text, [
    /nombre\s+(?:total\s+)?d[''']associ[eé][se]?\s*[:\-=]\s*([\d\s\u00a0]+)/i,
    /nombre\s+de\s+porteurs?\s+de\s+parts?\s*[:\-=]\s*([\d\s\u00a0]+)/i,
    /associ[eé][se]?\s*:\s*([\d\s\u00a0]{3,})/i,
  ]);
  if (nbAssStr !== null) {
    const v = parseFrNum(nbAssStr.replace(/\s/g, ""));
    if (v !== null && v > 0) result.nombre_associes = Math.round(v);
  }

  // ── Année de création ─────────────────────────────────────────────────────
  const anneeStr = firstMatch(text, [
    /ann[eé]e\s+de\s+cr[eé]ation\s*[:\-=]\s*((?:19|20)\d{2})/i,
    /cr[eé][eé]e?\s+en\s+((?:19|20)\d{2})/i,
    /agr[eé]ment\s+AMF\s+(?:en\s+)?((?:19|20)\d{2})/i,
    /date\s+de\s+cr[eé]ation\s*[:\-=]\s*\d{1,2}[\/\-]\d{1,2}[\/\-]((?:19|20)\d{2})/i,
  ]);
  if (anneeStr !== null) {
    const y = parseInt(anneeStr, 10);
    if (!isNaN(y)) result.annee_creation = y;
  }

  // ── Délai de jouissance ───────────────────────────────────────────────────
  const jourStr = firstMatch(text, [
    /d[eé]lai\s+de\s+jouissance\s*[:\-=]\s*([\d]+)\s*jours?/i,
    /jouissance\s*[:\-=]\s*([\d]+)\s*jours?/i,
  ]);
  if (jourStr !== null) {
    const v = parseInt(jourStr, 10);
    if (!isNaN(v)) result.delai_jouissance = v;
  } else {
    const moisStr = firstMatch(text, [
      /d[eé]lai\s+de\s+jouissance\s*[:\-=]\s*([\d]+)\s*mois/i,
    ]);
    if (moisStr !== null) {
      const v = parseInt(moisStr, 10);
      if (!isNaN(v)) result.delai_jouissance = Math.round(v * 30.44);
    }
  }

  // ── Durée de détention recommandée (journalisation) ───────────────────────
  const holdStr = firstMatch(text, [
    /dur[eé]e\s+de\s+d[eé]tention\s+recommand[eé]e?\s*[:\-=]\s*([\d,\.]+\s*ans?)/i,
    /horizon\s+de\s+placement\s*[:\-=]\s*([\d,\.]+\s*ans?)/i,
    /dur[eé]e\s+minimale\s+de\s+placement\s*[:\-=]\s*([\d,\.]+\s*ans?)/i,
    /dur[eé]e\s+recommand[eé]e?\s*[:\-=]\s*([\d,\.]+\s*ans?)/i,
  ]);
  if (holdStr !== null) {
    const v = parseDuration(holdStr);
    if (v !== null && v > 0) result.journalisation = v;
  }

  return result;
}

function extractProfilRisque(text: string): ProfilRisque {
  const result: ProfilRisque = {};

  const niveauStr = firstMatch(text, [
    /SRRI\s*[:\-=]?\s*([1-7])\s*(?:\/\s*7|sur\s*7)?/i,
    /indicateur\s+(?:de\s+risque|synth[eé]tique)\s*[:\-=]\s*([1-7])\s*(?:\/\s*7|sur\s*7)?/i,
    /profil\s+de\s+risque\s*[:\-=]\s*([1-7])\s*(?:\/\s*7|sur\s*7)?/i,
    /niveau\s+de\s+risque\s*[:\-=]?\s*([1-7])\s*(?:\/\s*7|sur\s*7)?/i,
    /risque\s+class[eé]\s+([1-7])\s*(?:\/\s*7|sur\s*7)/i,
    /\bSRI\b\s*[:\-=]?\s*([1-7])\s*(?:\/\s*7|sur\s*7)?/,
  ]);
  if (niveauStr !== null) {
    const v = parseInt(niveauStr, 10);
    if (v >= 1 && v <= 7) {
      result.niveau = v;

      // Extract the surrounding sentence as a comment
      const ctx = /(.{0,120}(?:SRRI|profil\s+de\s+risque|niveau\s+de\s+risque|SRI).{0,120})/i.exec(text);
      if (ctx !== null) {
        const s = ctx[1];
        if (s !== undefined) result.commentaire = s.trim().replace(/\s+/g, " ");
      }
    }
  }

  return result;
}

function extractRepartitionSectorielle(text: string): SecteurItem[] {
  const section = extractSection(text, [
    /r[eé]partition\s+sectorielle/i,
    /r[eé]partition\s+par\s+secteur(?:\s+d[''']activit[eé])?/i,
    /allocation\s+sectorielle/i,
    /ventilation\s+(?:par\s+)?sectorielle/i,
    /par\s+secteur\s+d[''']activit[eé]/i,
  ]);

  // Fall back to full text if no section header found
  const src = section.length > 0 ? section : text;
  const raw = parseBreakdown(src);

  // Heuristic: exclude items that look like country/region names
  const GEO_LABELS =
    /^(france|allemagne|pays-bas|espagne|italie|belgique|luxembourg|europe|royaume-uni|suisse|pologne|portugal|autriche|irlande|grande-bretagne|hollande|scandinavie|nordique|benelux)/i;

  return raw
    .filter(i => !GEO_LABELS.test(i.label))
    .map(i => ({ secteur: i.label, poids: i.poids }));
}

function extractRepartitionGeographique(text: string): GeoItem[] {
  const section = extractSection(text, [
    /r[eé]partition\s+g[eé]ographique/i,
    /r[eé]partition\s+par\s+pays/i,
    /r[eé]partition\s+par\s+zone/i,
    /allocation\s+g[eé]ographique/i,
    /ventilation\s+(?:par\s+)?g[eé]ographique/i,
    /localisation\s+du\s+patrimoine/i,
  ]);

  if (!section) return [];
  const raw = parseBreakdown(section);

  // Heuristic: exclude items that look like sector names
  const SECTOR_LABELS =
    /^(bureaux?|commerce|logistique|r[eé]sidentiel|h[oô]tellerie|sant[eé]|[eé]ducation|industrie|entrep[oô]ts?|mixte|divers|autres?)/i;

  return raw
    .filter(i => !SECTOR_LABELS.test(i.label))
    .map(i => ({ pays: i.label, poids: i.poids }));
}

function extractStructureFrais(text: string): StructureFrais {
  const result: StructureFrais = {};

  // Search in a dedicated section if available, otherwise full text
  const section = extractSection(text, [
    /structure\s+des?\s+frais/i,
    /frais\s+et\s+commissions/i,
    /commissions?\s+et\s+frais/i,
  ]);
  const src = section.length > 0 ? section : text;

  const souscStr = firstMatch(src, [
    /frais\s+de\s+souscription\s*[:\-=]\s*([\d,\.]+)\s*%/i,
    /commission\s+de\s+souscription\s*[:\-=]\s*([\d,\.]+)\s*%/i,
    /commission\s+d[''']entr[eé]e\s*[:\-=]\s*([\d,\.]+)\s*%/i,
    /frais\s+d[''']entr[eé]e\s*[:\-=]\s*([\d,\.]+)\s*%/i,
  ]);
  if (souscStr !== null) {
    const v = parsePct(souscStr);
    if (v !== null) result.frais_souscription = v;
  }

  const gestionStr = firstMatch(src, [
    /frais\s+de\s+gestion\s*[:\-=]\s*([\d,\.]+)\s*%/i,
    /taux\s+de\s+gestion\s*[:\-=]\s*([\d,\.]+)\s*%/i,
    /commission\s+de\s+gestion\s*[:\-=]\s*([\d,\.]+)\s*%/i,
    /frais\s+de\s+fonctionnement\s*[:\-=]\s*([\d,\.]+)\s*%/i,
  ]);
  if (gestionStr !== null) {
    const v = parsePct(gestionStr);
    if (v !== null) result.frais_gestion = v;
  }

  const perfStr = firstMatch(src, [
    /commission\s+de\s+performance\s*[:\-=]\s*([\d,\.]+)\s*%/i,
    /frais\s+de\s+performance\s*[:\-=]\s*([\d,\.]+)\s*%/i,
    /commission\s+de\s+sur-performance\s*[:\-=]\s*([\d,\.]+)\s*%/i,
  ]);
  if (perfStr !== null) {
    const v = parsePct(perfStr);
    if (v !== null) result.commission_performance = v;
  }

  const sortieStr = firstMatch(src, [
    /frais\s+de\s+(?:sortie|retrait)\s*[:\-=]\s*([\d,\.]+)\s*%/i,
    /commission\s+de\s+retrait\s*[:\-=]\s*([\d,\.]+)\s*%/i,
  ]);
  if (sortieStr !== null) {
    const v = parsePct(sortieStr);
    if (v !== null) result.frais_sortie = v;
  }

  return result;
}

function extractIndicateursLocatifs(text: string): IndicateursLocatifs {
  const result: IndicateursLocatifs = {};

  const section = extractSection(text, [
    /indicateurs?\s+locatifs?/i,
    /donn[eé]es?\s+locatives?/i,
  ]);
  const src = section.length > 0 ? section : text;

  // TOF
  const tofStr = firstMatch(src, [
    /taux\s+d[''']occupation\s+financier\s*[:\-=]?\s*([\d,\.]+)\s*%/i,
    /\bT\.?O\.?F\.?\b\s*[:\-=]\s*([\d,\.]+)\s*%/i,
  ]);
  if (tofStr !== null) {
    const v = parsePct(tofStr);
    if (v !== null) result.taux_occupation_financier = v;
  }

  // TOP
  const topStr = firstMatch(src, [
    /taux\s+d[''']occupation\s+physique\s*[:\-=]?\s*([\d,\.]+)\s*%/i,
    /\bT\.?O\.?P\.?\b\s*[:\-=]\s*([\d,\.]+)\s*%/i,
  ]);
  if (topStr !== null) {
    const v = parsePct(topStr);
    if (v !== null) result.taux_occupation_physique = v;
  }

  // WALB
  const walbStr = firstMatch(src, [
    /W\.?A\.?L\.?B\.?\s*[:\-=]\s*([\d,\.]+\s*ans?)/i,
    /dur[eé]e\s+r[eé]siduelle\s+(?:des?\s+baux?)?\s*(?:au\s+(?:premier\s+)?break)?\s*[:\-=]\s*([\d,\.]+\s*ans?)/i,
    /dur[eé]e\s+(?:moyenne\s+)?ferme\s*[:\-=]\s*([\d,\.]+\s*ans?)/i,
  ]);
  if (walbStr !== null) {
    const v = parseDuration(walbStr);
    if (v !== null && v > 0) result.walb = v;
  }

  // WALT
  const waltStr = firstMatch(src, [
    /W\.?A\.?L\.?T\.?\s*[:\-=]\s*([\d,\.]+\s*ans?)/i,
    /dur[eé]e\s+r[eé]siduelle\s+(?:des?\s+baux?)?\s*(?:au\s+terme)?\s*[:\-=]\s*([\d,\.]+\s*ans?)/i,
  ]);
  if (waltStr !== null) {
    const v = parseDuration(waltStr);
    if (v !== null && v > 0) result.walt = v;
  }

  // duree_bail_restante: prefer WALT, then WALB, then explicit mention
  if (result.walt !== undefined) {
    result.duree_bail_restante = result.walt;
  } else if (result.walb !== undefined) {
    result.duree_bail_restante = result.walb;
  } else {
    const bailStr = firstMatch(src, [
      /dur[eé]e\s+(?:r[eé]siduelle|restante|moyenne)\s+(?:des?\s+)?baux?\s*[:\-=]\s*([\d,\.]+\s*ans?)/i,
      /dur[eé]e\s+moyenne\s+des?\s+baux?\s*[:\-=]\s*([\d,\.]+\s*ans?)/i,
    ]);
    if (bailStr !== null) {
      const v = parseDuration(bailStr);
      if (v !== null && v > 0) result.duree_bail_restante = v;
    }
  }

  return result;
}

function extractValorisationRisque(text: string): ValorisationRisque {
  const result: ValorisationRisque = {};

  // Valeur d'expertise (portfolio level)
  const veStr = firstMatch(text, [
    /valeur\s+d[''']expertise\s*[:\-=]\s*([\d\s\u00a0.,]+\s*(?:Md€|M€|milliards?|millions?|k€|€))/i,
    /valeur\s+v[eé]nale\s*[:\-=]\s*([\d\s\u00a0.,]+\s*(?:Md€|M€|milliards?|millions?|k€|€))/i,
    /valeur\s+d['''][eé]valuation\s*[:\-=]\s*([\d\s\u00a0.,]+\s*(?:Md€|M€|milliards?|millions?|k€|€))/i,
    /expertise\s+immobili[eè]re\s*[:\-=]\s*([\d\s\u00a0.,]+\s*(?:Md€|M€|milliards?|millions?|k€|€))/i,
  ]);
  if (veStr !== null) {
    const v = parseAmount(veStr);
    if (v !== null) result.valeur_expertise = v;
  }

  // Plus-value latente (as %)
  const pvlStr = firstMatch(text, [
    /plus[-\s]value\s+latente\s*[:\-=]\s*([\d,\.]+)\s*%/i,
    /revalorisation\s*[:\-=]\s*([+\-]?[\d,\.]+)\s*%/i,
    /taux\s+de\s+revalorisation\s*[:\-=]\s*([\d,\.]+)\s*%/i,
  ]);
  if (pvlStr !== null) {
    const v = parsePct(pvlStr);
    if (v !== null) result.plus_value_latente = v;
  }

  // Prix de reconstitution (per share)
  const prStr = firstMatch(text, [
    /prix\s+de\s+reconstitution\s*[:\-=]\s*([\d\s\u00a0.,]+)\s*€/i,
    /valeur\s+de\s+reconstitution\s*[:\-=]\s*([\d\s\u00a0.,]+)\s*€/i,
    /valeur\s+de\s+r[eé]alisation\s*[:\-=]\s*([\d\s\u00a0.,]+)\s*€/i,
  ]);
  if (prStr !== null) {
    const v = parseFrNum(prStr);
    if (v !== null && v > 0) result.prix_reconstitution = v;
  }

  // Prime / décote vs reconstitution price
  const primeCtx = /(?:prime|d[eé]cote)\s*(?:\/\s*d[eé]cote)?\s*[:\-=]\s*([+\-]?[\d,\.]+)\s*%/i.exec(text);
  if (primeCtx !== null) {
    const valStr  = primeCtx[1];
    const fullCtx = primeCtx[0];
    if (valStr !== undefined) {
      const v = parseFrNum(valStr);
      if (v !== null) {
        const isDecote = /d[eé]cote/i.test(fullCtx);
        result.prime_decote = isDecote ? -Math.abs(v) / 100 : v / 100;
      }
    }
  }

  return result;
}

function extractStrategieInvestissement(text: string): StrategieInvestissement {
  const result: StrategieInvestissement = {};

  const section = extractSection(text, [
    /strat[eé]gie\s+d[''']investissement/i,
    /politique\s+d[''']investissement/i,
    /objectifs?\s+de\s+(?:la\s+)?(?:SCPI|soci[eé]t[eé])/i,
    /pr[eé]sentation\s+de\s+(?:la\s+)?SCPI/i,
  ], 4_000);
  const src = section.length > 0 ? section : text.slice(0, 3_000);

  // Focus géographique
  const geoStr = firstMatch(src, [
    /zones?\s+g[eé]ographiques?\s*[:\-=]\s*([^\n.;]{5,80})/i,
    /investissements?\s+(?:principalement\s+)?(?:en|sur)\s+([A-ZÀ-Ü][^\n.;]{3,60})/i,
    /patrimoine\s+(?:localis[eé]\s+)?(?:principalement\s+)?en\s+([^\n.;]{5,60})/i,
    /diversifi[eé]e?\s+en\s+([^\n.;]{5,60})/i,
  ]);
  if (geoStr !== null) result.focus_geographique = geoStr.trim();

  // Focus sectoriel
  const sectStr = firstMatch(src, [
    /secteurs?\s+d[''']activit[eé]\s*[:\-=]\s*([^\n.;]{5,80})/i,
    /sp[eé]cialiste\s+(?:des?\s+)?([^\n.;]{5,60})/i,
    /focus\s+(?:sur\s+(?:les?\s+)?)?([^\n.;]{5,60}(?:bureaux?|commerce|logistique|r[eé]sidentiel|sant[eé]))/i,
  ]);
  if (sectStr !== null) result.focus_sectoriel = sectStr.trim();

  // Objectif de rendement
  const rendStr = firstMatch(src, [
    /objectif\s+de\s+(?:rendement|distribution)\s*[:\-=]\s*([\d,\.]+)\s*%/i,
    /cible\s+(?:de\s+)?rendement\s*[:\-=]\s*([\d,\.]+)\s*%/i,
    /rendement\s+cible\s*[:\-=]\s*([\d,\.]+)\s*%/i,
    /performance\s+cible\s*[:\-=]\s*([\d,\.]+)\s*%/i,
  ]);
  if (rendStr !== null) {
    const v = parsePct(rendStr);
    if (v !== null) result.objectif_rendement = v;
  }

  // Politique de dividende
  const divStr = firstMatch(src, [
    /distribution\s+(?:mensuelle|trimestrielle|annuelle|semestrielle)[^\n.;]{0,80}/i,
    /dividendes?\s+vers[eé]s?\s+(?:mensuelle|trimestrielle|annuelle)[^\n.;]{0,60}/i,
    /politique\s+de\s+distribution\s*[:\-=]\s*([^\n.;]{5,120})/i,
  ]);
  if (divStr !== null) result.politique_dividende = divStr.trim();

  return result;
}

function extractActualiteTrimestrielle(text: string): ActualiteTrimestrielle {
  const section = extractSection(text, [
    /actualit[eé]\s+(?:du\s+trimestre|trimestrielle)/i,
    /faits?\s+marquants?\s+(?:du\s+trimestre)?/i,
    /[eé]v[eé]nements?\s+(?:du\s+trimestre|marquants?)/i,
    /op[eé]rations?\s+r[eé]alis[eé]es?\s+(?:au\s+cours\s+du\s+trimestre)?/i,
  ], 5_000);

  const acquisitions: string[] = [];
  const arbitrages:   string[] = [];

  if (!section) {
    return { acquisitions, arbitrages };
  }

  // ── Sub-section: Acquisitions ────────────────────────────────────────────
  const acqSection = extractSection(section, [
    /^\s*acquisitions?\s*$/im,
    /^\s*achats?\s*$/im,
    /investissements?\s+r[eé]alis[eé]s?/i,
    /op[eé]rations?\s+d[''']acquisition/i,
    /actifs?\s+acquis/i,
  ], 2_000);

  if (acqSection.length > 0) {
    acquisitions.push(...extractBullets(acqSection));
  }

  // ── Sub-section: Arbitrages ───────────────────────────────────────────────
  const arbSection = extractSection(section, [
    /^\s*arbitrages?\s*$/im,
    /^\s*cessions?\s*$/im,
    /^\s*ventes?\s*$/im,
    /d[eé]sinvestissements?/i,
    /actifs?\s+c[eé]d[eé]s?/i,
  ], 2_000);

  if (arbSection.length > 0) {
    arbitrages.push(...extractBullets(arbSection));
  }

  // ── General commentaire: text before the first sub-section ───────────────
  const subStarts = [
    section.search(/acquisitions?/i),
    section.search(/arbitrages?/i),
    section.search(/cessions?/i),
  ]
    .filter(i => i > 0)
    .sort((a, b) => a - b);

  const firstSub = subStarts[0];
  let commentaire: string | undefined;

  if (firstSub !== undefined && firstSub > 30) {
    const intro = section.slice(0, firstSub).trim().replace(/\s+/g, " ");
    if (intro.length > 20) commentaire = intro;
  }

  const result: ActualiteTrimestrielle = { acquisitions, arbitrages };
  if (commentaire !== undefined) result.commentaire = commentaire;

  return result;
}

// ─── Confidence calculation ───────────────────────────────────────────────────

/**
 * 10 critical fields used to compute confidence.
 * confidence = found / total.
 */
function computeConfidence(
  r: Omit<ExtractionResult, "confidence" | "_meta">
): { confidence: number; _meta: ExtractionMeta } {
  const checks: boolean[] = [
    r.chiffres_cles.capitalisation            !== undefined,
    r.chiffres_cles.taux_distribution         !== undefined,
    r.chiffres_cles.taux_occupation_financier !== undefined,
    r.chiffres_cles.taux_occupation_physique  !== undefined,
    r.chiffres_cles.prix_part                 !== undefined,
    r.repartition_sectorielle.length          >  0,
    r.repartition_geographique.length         >  0,
    r.structure_frais.frais_gestion           !== undefined,
    (r.indicateurs_locatifs.walb              !== undefined ||
     r.indicateurs_locatifs.duree_bail_restante !== undefined),
    r.valorisation_risque.valeur_expertise    !== undefined,
  ];

  const found = checks.filter(Boolean).length;

  return {
    confidence: found / checks.length,
    _meta: {
      critical_fields_total: checks.length,
      critical_fields_found: found,
    },
  };
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Extracts all structured SCPI data from raw bulletin PDF text.
 *
 * The function is pure and side-effect free.
 * Input text must be UTF-8 (as produced by pdf-parse or equivalent).
 */
export function extractFromText(text: string): ExtractionResult {
  // Normalise whitespace and Unicode before any pattern matching
  const t = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u00a0/g, " ")       // non-breaking space
    .replace(/\u202f/g, " ")       // narrow no-break space
    .replace(/\u2019/g, "'")       // right single quotation mark → apostrophe
    .replace(/\u2018/g, "'")       // left single quotation mark
    .normalize("NFC");

  const chiffres_cles            = extractChiffresCles(t);
  const profil_risque            = extractProfilRisque(t);
  const repartition_sectorielle  = extractRepartitionSectorielle(t);
  const repartition_geographique = extractRepartitionGeographique(t);
  const structure_frais          = extractStructureFrais(t);
  const indicateurs_locatifs     = extractIndicateursLocatifs(t);
  const valorisation_risque      = extractValorisationRisque(t);
  const strategie_investissement = extractStrategieInvestissement(t);
  const actualite_trimestrielle  = extractActualiteTrimestrielle(t);

  const partial: Omit<ExtractionResult, "confidence" | "_meta"> = {
    chiffres_cles,
    profil_risque,
    repartition_sectorielle,
    repartition_geographique,
    structure_frais,
    indicateurs_locatifs,
    valorisation_risque,
    strategie_investissement,
    actualite_trimestrielle,
  };

  const { confidence, _meta } = computeConfidence(partial);

  return { ...partial, confidence, _meta };
}

/**
 * Bridge to the existing QA layer.
 * Converts ExtractionResult to the ExtractedMetrics shape expected by runQa().
 *
 * Usage:
 *   import { runQa } from "./qa.js";
 *   const extraction = extractFromText(pdfText);
 *   const qaResult   = runQa(toExtractedMetrics(extraction));
 */
export function toExtractedMetrics(r: ExtractionResult): {
  tof?:           number;
  td?:            number;
  capitalisation?: number;
  confidence:     number;
} {
  const metrics: {
    tof?:            number;
    td?:             number;
    capitalisation?: number;
    confidence:      number;
  } = { confidence: r.confidence };

  if (r.chiffres_cles.taux_occupation_financier !== undefined) {
    metrics.tof = r.chiffres_cles.taux_occupation_financier;
  }
  if (r.chiffres_cles.taux_distribution !== undefined) {
    metrics.td = r.chiffres_cles.taux_distribution;
  }
  if (r.chiffres_cles.capitalisation !== undefined) {
    metrics.capitalisation = r.chiffres_cles.capitalisation;
  }

  return metrics;
}
