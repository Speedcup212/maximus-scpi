// RECOVERY-200 — rapprochement valeur extraite / texte paginé du document officiel.
//
// Module pur (sans réseau ni base), partagé par l'edge function et par les tests Node.
// Deux règles ajoutées le 10/11/2026 après les faux zéros Ficommerce Proximité, Primovie
// et Aestiam :
//   1. Un zéro n'est jamais prouvé par proximité. Il faut une formulation explicite
//      (« aucune part en attente », « 0 part en attente », « Taux d'endettement : 0 % »,
//      ligne de tableau entièrement nulle…). Sinon : pas de preuve, la valeur reste à revoir.
//   2. Une occurrence portant une unité incompatible avec la métrique est écartée
//      (un « 0,83 % » ne prouve pas un dividende de 0,83 €/part).

export const MATCHER_REVISION = "2026-11-10-explicit-zero-unit-consistent";
export const MAX_ALIAS_DISTANCE = 850;

export const METRIC_PATTERNS = {
  td: [/taux\s+de\s+distribution/i, /\bTD\b/i],
  td_annee: [/taux\s+de\s+distribution/i, /\bTD\b/i],
  tof: [/taux\s+d['’]?occupation\s+financier/i, /\bT\.?O\.?F\.?\b/i],
  capitalisation: [/capitalisation/i],
  prix_souscription: [/prix\s+de\s+souscription/i, /prix\s+de\s+la\s+part/i, /valeur\s+de\s+la\s+part/i],
  prix_reconstitution: [/valeur\s+de\s+reconstitution/i],
  prix_retrait: [/(?:prix|valeur)\s+de\s+retrait/i],
  valeur_realisation: [/valeur\s+de\s+r[eé]alisation/i],
  endettement: [/taux\s+d['’]?endettement/i, /ratio\s+(?:des\s+)?dettes/i, /\bendettement\b/i, /\bLTV\b/i, /dette\s+bancaire/i],
  walt: [/\bWALT\b/i, /dur[eé]e\s+moyenne\s+restante\s+des\s+baux/i],
  walb: [/\bWALB\b/i, /dur[eé]e\s+moyenne\s+ferme\s+des\s+baux/i],
  collecte_nette: [/collecte\s+nette/i, /capitaux\s+collect[eé]s\s+nets?/i],
  nombre_locataires: [/nombre\s+de\s+locataires/i, /\blocataires\b/i, /entreprises\s+locataires/i],
  nombre_immeubles: [/nombre\s+d['’]?immeubles/i, /\bimmeubles\b/i, /nombre\s+d['’]?actifs/i, /\bactifs\s+immobiliers\b/i],
  nombre_associes: [/nombre\s+d['’]?associ[eé]s/i, /\bassoci[eé]s\b/i],
  nombre_parts: [/nombre\s+de\s+parts/i, /parts\s+en\s+circulation/i, /capital\s+s['’]?\s*[eé]l[eè]ve\s+[àa]\s+.*parts/i],
  parts_attente_retrait: [/parts?\s+en\s+attente\s+de\s+retrait/i, /parts?\s+en\s+attente\s+au/i],
  distribution_par_part: [/dividende/i, /distribution\s+(?:brute|par\s+part|revenus)/i, /acompte/i],
  capital_type: [/capital\s+variable/i, /capital\s+fixe/i, /variabilit[eé]\s+du\s+capital/i, /march[eé]\s+secondaire/i],
};

export const METRIC_UNITS = {
  td: "%",
  td_annee: "année",
  tof: "%",
  capitalisation: "M€",
  prix_souscription: "€",
  prix_reconstitution: "€",
  prix_retrait: "€",
  valeur_realisation: "€",
  endettement: "%",
  walt: "ans",
  walb: "ans",
  collecte_nette: "€",
  nombre_locataires: "locataires",
  nombre_immeubles: "immeubles",
  nombre_associes: "associés",
  nombre_parts: "parts",
  parts_attente_retrait: "parts",
  distribution_par_part: "€/part",
  capital_type: null,
};

const PERCENT_METRICS = new Set(["td", "tof", "endettement"]);
const EURO_PER_SHARE_METRICS = new Set(["prix_souscription", "prix_reconstitution", "prix_retrait", "valeur_realisation", "distribution_par_part"]);
const AMOUNT_METRICS = new Set(["capitalisation", "collecte_nette"]);
const COUNT_METRICS = new Set(["nombre_locataires", "nombre_immeubles", "nombre_associes", "nombre_parts", "parts_attente_retrait"]);
const DURATION_METRICS = new Set(["walt", "walb"]);

export function parseFrNumber(raw) {
  const s = String(raw || "").trim().replace(/\u00a0|\u202f/g, " ");
  if (!s) return null;
  const dot = s.lastIndexOf(".");
  const comma = s.lastIndexOf(",");
  let clean = s;
  if (comma > dot) clean = s.replace(/[\s.]/g, "").replace(",", ".");
  else if (dot > comma) clean = s.replace(/[\s,]/g, "");
  else clean = s.replace(/\s/g, "");
  const value = Number.parseFloat(clean);
  return Number.isFinite(value) ? value : null;
}

export function unitMultiplier(unit) {
  const u = String(unit || "").toLowerCase();
  if (u.startsWith("md") || u.startsWith("milliard")) return 1e9;
  if (u === "m€" || u.startsWith("million")) return 1e6;
  if (u === "k€" || u.startsWith("millier")) return 1e3;
  return 1;
}

const UNIT_AFTER_RE = /^[ \u00a0\u202f]*(%|Md€|M€|k€|€|euros?\b|milliards?\b|millions?\b|milliers?\b|parts?\b|ans?\b|années?\b|mois\b|locataires?\b|immeubles?\b|actifs?\b|associ[ée]s?\b|m²|m2\b)/i;

/** Unité accolée à une occurrence numérique, normalisée : "%", "€", "parts", "ans", "count" ou null. */
export function unitAfter(text, end) {
  const m = UNIT_AFTER_RE.exec(text.slice(end, end + 16));
  if (!m) return null;
  const u = m[1].toLowerCase();
  if (u === "%") return "%";
  if (u.includes("€") || u.startsWith("euro") || u.startsWith("milli")) return "€";
  if (u.startsWith("part")) return "parts";
  if (u.startsWith("an") || u === "mois") return "ans";
  if (u === "m²" || u === "m2") return "m2";
  return "count";
}

/** Vrai si l'unité accolée contredit la nature de la métrique. Une absence d'unité ne contredit rien. */
export function unitConflicts(metric, unit) {
  if (!unit) return false;
  if (PERCENT_METRICS.has(metric)) return unit !== "%";
  if (EURO_PER_SHARE_METRICS.has(metric) || AMOUNT_METRICS.has(metric)) return unit !== "€";
  if (COUNT_METRICS.has(metric)) return unit === "%" || unit === "€" || unit === "ans" || unit === "m2";
  if (DURATION_METRICS.has(metric)) return unit !== "ans";
  return false;
}

export function numericOccurrences(text) {
  const out = [];
  const moneyRe = /(\d{1,3}(?:[ \u00a0\u202f]\d{3})+(?:[.,]\d+)?|\d+(?:[.,]\d+)?)\s*(Md€|M€|k€|€|milliards?|millions?|milliers?)/gi;
  let m;
  while ((m = moneyRe.exec(text)) !== null) {
    const parsed = parseFrNumber(m[1] || "");
    if (parsed !== null) {
      const end = m.index + m[0].length;
      out.push({ value: parsed * unitMultiplier(m[2] || ""), index: m.index, end, raw: m[0], unit: "€" });
      out.push({ value: parsed, index: m.index, end, raw: m[0], unit: "€" });
    }
  }
  const numberRe = /\b(\d{1,3}(?:[ \u00a0\u202f]\d{3})+(?:[.,]\d+)?|\d+(?:[.,]\d+)?)\b/g;
  while ((m = numberRe.exec(text)) !== null) {
    const parsed = parseFrNumber(m[1] || "");
    const end = m.index + m[0].length;
    if (parsed !== null) out.push({ value: parsed, index: m.index, end, raw: m[0], unit: unitAfter(text, end) });
  }
  return out;
}

export function expectedTargets(metric, value) {
  if (metric === "capitalisation") return [value, value * 1e6];
  if (metric === "collecte_nette") return [value, value / 1e6, value / 1e3];
  return [value];
}

export function tolerance(metric, expected) {
  if (["nombre_locataires", "nombre_immeubles", "nombre_associes", "nombre_parts", "parts_attente_retrait", "td_annee"].includes(metric)) return 0.49;
  if (PERCENT_METRICS.has(metric)) return Math.max(0.03, Math.abs(expected) * 0.0015);
  if (DURATION_METRICS.has(metric)) return Math.max(0.03, Math.abs(expected) * 0.005);
  if (EURO_PER_SHARE_METRICS.has(metric)) return Math.max(0.03, Math.abs(expected) * 0.0015);
  return Math.max(0.5, Math.abs(expected) * 0.003);
}

export function valueMatches(metric, expected, actual) {
  return expectedTargets(metric, expected).some((target) => Math.abs(actual - target) <= tolerance(metric, target));
}

function cloneRegex(re) {
  const flags = re.flags.includes("g") ? re.flags : re.flags + "g";
  return new RegExp(re.source, flags);
}

export function compactSnippet(text, start, end) {
  const left = Math.max(0, start - 180);
  const right = Math.min(text.length, end + 180);
  return text.slice(left, right).replace(/\s+/g, " ").trim().slice(0, 900);
}

// --- Zéro explicite ---------------------------------------------------------------

const ROW_TOKEN = String.raw`(?:\d{1,3}(?:[ \u00a0\u202f]\d{3})*(?:[.,]\d+)?|[-–—_])(?:[ \u00a0\u202f]*parts?\b)?`;
const FOOTNOTE = String.raw`(?:[ \u00a0\u202f]*\(\s*[^()]{0,40}\))?`;

/** Ligne de tableau qui suit un libellé : vraie seulement si elle contient au moins un nombre, uniquement des zéros, et aucun tiret (colonne vide = ambiguë). */
function rowIsAllZero(row) {
  const tokens = row.match(new RegExp(ROW_TOKEN, "g")) || [];
  if (!tokens.length) return false;
  let numeric = 0;
  for (const token of tokens) {
    const core = token.replace(/parts?/i, "").trim();
    if (/^[-–—_]$/.test(core)) return false;
    const value = parseFrNumber(core);
    if (value === null || value !== 0) return false;
    numeric++;
  }
  return numeric > 0;
}

/** Le zéro est-il précédé d'un autre nombre ou d'un tiret de la même ligne (cas « 0 0 0 Parts en attente ») ? */
function precededByRowValue(text, index) {
  const before = text.slice(Math.max(0, index - 14), index).replace(/[ \u00a0\u202f]+$/g, "");
  return /[\d\-–—]$/.test(before);
}

function hit(text, m) {
  return { index: m.index, end: m.index + m[0].length };
}

function firstExplicit(text, checks) {
  for (const check of checks) {
    const re = cloneRegex(check.re);
    let m;
    while ((m = re.exec(text)) !== null) {
      if (!check.accept || check.accept(m, text)) return hit(text, m);
      if (re.lastIndex === m.index) re.lastIndex++;
    }
  }
  return null;
}

const ZERO_CHECKS = {
  parts_attente_retrait: [
    { re: /(?:aucune|z[ée]ro)\s+parts?\s+(?:n['’]est\s+)?(?:en\s+)?attente/i },
    { re: /\b0\s+(?:parts?(?:\(s\))?\s+)?en\s+attente(?:\s+de)?\s+retrait/i, accept: (m, t) => !precededByRowValue(t, m.index) },
    { re: /\b0\s+parts?(?:\(s\))?\s+en\s+attente/i, accept: (m, t) => !precededByRowValue(t, m.index) },
    {
      re: /parts?\s+en\s+attente\s+de\s+retrait[^:\d\n]{0,60}(?:au\s+\d{1,2}[./]\d{1,2}[./]\d{2,4}\s*)?:\s*0(?![ \u00a0\u202f]*[\d.,])/i,
    },
    {
      re: new RegExp(String.raw`parts?\s+en\s+attente\s+de\s+retrait${FOOTNOTE}((?:[ \u00a0\u202f]+${ROW_TOKEN})+)`, "i"),
      accept: (m) => rowIsAllZero(m[1] || ""),
    },
  ],
  endettement: [
    { re: /aucun\s+(?:financement|emprunt|endettement|recours\s+[àa]\s+l['’]endettement)|pas\s+d['’]endettement|sans\s+endettement|aucune\s+dette/i },
    {
      re: /(?:taux\s+d['’]?endettement|ratio\s+(?:des\s+)?dettes(?:\s+et\s+autres\s+engagements)?|\bLTV\b|\bendettement\b)(?:[^\d%\n]|\(\d{1,2}\)|\d{1,2}[./]\d{1,2}[./]\d{2,4}){0,60}?\b0(?:[.,]0+)?[ \u00a0\u202f]*%/i,
    },
    { re: /dette\s+bancaire[^\d\n]{0,80}\b0(?:[.,]0+)?[ \u00a0\u202f]*M?€/i },
    {
      re: /\b0(?:[.,]0+)?[ \u00a0\u202f]*%[ \u00a0\u202f]*(?:de\s+)?(?:taux\s+d['’]?endettement|d['’]endettement|endettement)/i,
      accept: (m, t) => !precededByRowValue(t, m.index),
    },
  ],
  distribution_par_part: [
    { re: /aucun(?:e)?\s+(?:dividende|distribution|acompte)|pas\s+de\s+(?:dividende|distribution|versement)|distribution\s+(?:suspendue|nulle)|acompte\s+nul/i },
    {
      re: /(?:dividende|distribution|acompte)(?:[^\d€%\n]|T[1-4][ \u00a0\u202f]*\d{4}|\b\d{4}\b){0,60}?\b0(?:[.,]0+)?[ \u00a0\u202f]*(?:€|euros?\b)(?![ \u00a0\u202f]*\d)/i,
    },
  ],
};

/** Formulation explicite d'une valeur nulle pour la métrique, ou null. */
export function explicitZeroMatch(metric, text) {
  const checks = ZERO_CHECKS[metric];
  if (!checks || !text) return null;
  return firstExplicit(text, checks);
}

/**
 * Cherche la preuve paginée d'une valeur numérique. Retourne null quand la preuve est
 * insuffisante : la valeur reste alors non certifiée (jamais certifiée « par défaut »).
 */
export function evidenceForNumeric(metric, value, pages, isHtml) {
  const method = isHtml ? "html_text_match" : "pdf_page_text_match";
  const unit = METRIC_UNITS[metric] ?? null;

  if (value === 0) {
    for (const page of pages) {
      const found = explicitZeroMatch(metric, page.text || "");
      if (found) {
        return {
          page: isHtml ? null : page.page,
          text: compactSnippet(page.text, found.index, found.end),
          method,
          value_match: true,
          raw_value: value,
          unit,
          distance: 0,
          zero_rule: "explicit",
        };
      }
    }
    return null;
  }

  const patterns = METRIC_PATTERNS[metric] || [];
  let best = null;
  for (const page of pages) {
    if (!page.text) continue;
    const numbers = numericOccurrences(page.text)
      .filter((n) => valueMatches(metric, value, n.value))
      .filter((n) => !unitConflicts(metric, n.unit));
    if (!numbers.length) continue;
    for (const baseRe of patterns) {
      const re = cloneRegex(baseRe);
      let m;
      while ((m = re.exec(page.text)) !== null) {
        const aliasStart = m.index;
        const aliasEnd = m.index + m[0].length;
        for (const number of numbers) {
          const distance = number.index > aliasEnd
            ? number.index - aliasEnd
            : aliasStart > number.end
              ? aliasStart - number.end
              : 0;
          if (distance > MAX_ALIAS_DISTANCE) continue;
          if (!best || distance < best.distance) best = { page, aliasStart, aliasEnd, number, distance };
        }
        if (re.lastIndex === m.index) re.lastIndex++;
      }
    }
  }

  if (!best) return null;
  const start = Math.min(best.aliasStart, best.number.index);
  const end = Math.max(best.aliasEnd, best.number.end);
  return {
    page: isHtml ? null : best.page.page,
    text: compactSnippet(best.page.text, start, end),
    method,
    value_match: true,
    raw_value: value,
    unit,
    distance: best.distance,
  };
}
