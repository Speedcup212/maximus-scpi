import https from "node:https";
import http from "node:http";
import { type Result, ok, err } from "./types.js";
import { type NormalizedPeriod, parsePeriod, comparePeriods, parseAnnualYear, type AnnualReportPeriod } from "./period.js";
import { stripTrackingParams } from "./utils/url.js";
import { logger } from "./logger.js";

// ─── Exclusion / inclusion patterns ───────────────────────────────────────────

/** Bulletin mode: exclude DIC, KIID, prospectus, rapport annuel, SFDR, etc. */
const BULLETIN_EXCLUDE = /\b(dic|kiid|prospectus|statuts|rapport\s*annuel|sfdr|notice|reglement|doc\s*pr[eé]alable)\b/i;

/** Rapport annuel mode: require link to mention rapport annuel or activité */
const RA_INCLUDE = /rapport\s*(?:annuel|d['']activit[eé]|de\s*gestion)|annual\s*report/i;

/** Rapport annuel mode: exclude quarterly bulletins */
const RA_EXCLUDE_BULLETIN = /\b(bulletin|trimestriel|quarterly|T[1-4]\b|Q[1-4]\b)/i;

/** A raw PDF link extracted from an HTML page. */
export interface PdfLink {
  readonly href: string;
  readonly text: string;
}

/** Period: normalized "YYYY-Tn" or "unknown". */
export interface PdfCandidate {
  readonly url: string;
  /** Canonical period string, or "unknown" if unparseable */
  readonly period: { readonly normalized: string };
  readonly linkText: string;
}

export type HtmlFetchErrorReason =
  | "FETCH_FAILED"       // network / transport error on static fetch
  | "HTTP_ERROR"         // non-2xx on static fetch
  | "NO_PDF_LINKS"       // page returned HTML but zero PDF links from any source
  | "PERIOD_NOT_FOUND"   // PDF links exist but none yielded a parseable period
  | "PLAYWRIGHT_FAILED"; // Playwright fallback also failed

export interface HtmlFetchError {
  readonly reason: HtmlFetchErrorReason;
  readonly message: string;
  readonly url: string;
}

// ─── Internal config ──────────────────────────────────────────────────────────

const TIMEOUT_MS     = 30_000;
const MAX_REDIRECTS  = 5;
const MAX_HTML_BYTES = 10 * 1024 * 1024; // 10 MB

// ─── HTML fetcher ─────────────────────────────────────────────────────────────

/**
 * Fetches a raw HTML page over HTTP/S with redirect following and a hard
 * size cap.  Sends realistic Accept / User-Agent headers so the target server
 * does not refuse the request as a bare bot.
 */
function fetchHtml(url: string, redirectsLeft: number): Promise<string> {
  return new Promise((resolve, reject) => {
    if (redirectsLeft < 0) {
      reject(new Error("too many redirects"));
      return;
    }

    const parsed   = new URL(url);
    const transport = parsed.protocol === "https:" ? https : http;

    let settled = false;
    const fail = (e: Error): void => {
      if (!settled) { settled = true; reject(e); }
    };

    const options = {
      timeout: TIMEOUT_MS,
      headers: {
        "User-Agent":      "Mozilla/5.0 (compatible; SCPI-Ingestion-Bot/1.0)",
        "Accept":          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
        "Cache-Control":   "no-cache",
      },
    };

    const req = transport.get(url, options, (res) => {
      const status = res.statusCode ?? 0;

      if (status >= 300 && status < 400 && res.headers.location) {
        res.resume();
        const next = new URL(res.headers.location, url).href;
        fetchHtml(next, redirectsLeft - 1).then(resolve).catch(reject);
        return;
      }

      if (status < 200 || status >= 300) {
        res.resume();
        fail(new Error(`HTTP ${status}`));
        return;
      }

      const chunks: Buffer[] = [];
      let totalBytes = 0;

      res.on("data", (chunk: Buffer) => {
        if (settled) return;
        totalBytes += chunk.length;
        if (totalBytes > MAX_HTML_BYTES) {
          req.destroy(new Error(`response exceeds ${MAX_HTML_BYTES} bytes`));
          return;
        }
        chunks.push(chunk);
      });

      res.on("end", () => {
        if (!settled) {
          settled = true;
          resolve(Buffer.concat(chunks).toString("utf-8"));
        }
      });

      res.on("error", fail);
    });

    req.on("timeout", () => req.destroy(new Error(`request timed out after ${TIMEOUT_MS}ms`)));
    req.on("error", fail);
  });
}

// ─── URL helpers ──────────────────────────────────────────────────────────────

/**
 * Returns true when href looks like a direct PDF link or a download endpoint.
 * Matches .pdf or common download paths.
 */
function isPdfUrl(href: string): boolean {
  if (/\.pdf(?:[?&#/]|$)/i.test(href)) return true;
  if (/\/download\/|\/download\?|\/telecharger\/|file\.asp|document\.asp/i.test(href)) return true;
  return false;
}

/** Returns true if link text/url indicates a non-bulletin doc (DIC, KIID, etc.) */
function shouldExcludeBulletin(href: string, text: string): boolean {
  const combined = `${href} ${text}`.toLowerCase();
  return BULLETIN_EXCLUDE.test(combined);
}

/** Returns true if link matches a rapport annuel in rapport_annuel mode */
function shouldIncludeRapportAnnuel(href: string, text: string): boolean {
  const combined = `${href} ${text}`;
  if (RA_EXCLUDE_BULLETIN.test(combined)) return false;
  return RA_INCLUDE.test(combined);
}

/**
 * Attempts to unwrap a tracking / redirect URL by inspecting each query
 * parameter value.  If any decoded param value is itself a PDF URL, returns
 * it.  Otherwise returns the original href unchanged.
 *
 * Handles patterns like:
 *   https://tracking.example.com/click?url=https%3A%2F%2F...bulletin.pdf
 *   https://go.scpi.fr/redirect?link=.../Bulletin-T3-2025.pdf&token=xyz
 */
function unwrapTrackingUrl(href: string, baseUrl: string): string {
  if (isPdfUrl(href)) return href;
  try {
    const url = new URL(href, baseUrl);
    for (const value of url.searchParams.values()) {
      const decoded = decodeURIComponent(value);
      if (isPdfUrl(decoded)) return decoded;
    }
  } catch {
    // not a valid URL — return as-is
  }
  return href;
}

// ─── Link collector ───────────────────────────────────────────────────────────

interface LinkCollector {
  add(rawHref: string, rawText: string): void;
  links(): PdfLink[];
}

type CollectorMode = 'bulletin_trimestriel' | 'rapport_annuel';

/**
 * Creates a deduplicating collector that resolves relative URLs, unwraps
 * tracking redirects, and strips HTML tags from link text.
 * mode='bulletin_trimestriel' excludes rapport annuel links (existing behaviour).
 * mode='rapport_annuel' only keeps links that look like rapport annuel.
 */
function makeLinkCollector(baseUrl: string, mode: CollectorMode = 'bulletin_trimestriel'): LinkCollector {
  const seen      = new Set<string>();
  const collected: PdfLink[] = [];

  return {
    add(rawHref: string, rawText: string): void {
      const actual = unwrapTrackingUrl(rawHref.trim(), baseUrl);
      if (!isPdfUrl(actual)) return;

      let resolved: string;
      try {
        resolved = new URL(actual, baseUrl).href;
      } catch {
        return;
      }
      resolved = stripTrackingParams(resolved);

      const text = rawText
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (mode === 'rapport_annuel') {
        if (!shouldIncludeRapportAnnuel(resolved, text)) return;
      } else {
        if (shouldExcludeBulletin(resolved, text)) return;
      }

      if (seen.has(resolved)) return;
      seen.add(resolved);

      collected.push({ href: resolved, text });
    },
    links(): PdfLink[] { return collected; },
  };
}

// ─── Extraction strategies ────────────────────────────────────────────────────

/**
 * Strategy 1 — <a href="..."> anchors.
 * Two-step regex: captures attribute block + inner content, then extracts href.
 * Handles both double and single quoted attributes and deeply nested inner HTML.
 */
function extractAnchorHrefs(html: string, col: LinkCollector): void {
  const anchorRe = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = anchorRe.exec(html)) !== null) {
    const attrs = m[1] ?? "";
    const inner = m[2] ?? "";
    const hm = /\bhref\s*=\s*(?:"([^"]*?)"|'([^']*?)')/i.exec(attrs);
    if (!hm) continue;
    const href = (hm[1] ?? hm[2] ?? "").trim();
    col.add(href, inner);
  }
}

/**
 * Strategy 2 — data-href attributes on any element.
 * Commonly used by JS-rendered link widgets and CMS download buttons.
 */
function extractDataHrefs(html: string, col: LinkCollector): void {
  const re = /\bdata-href\s*=\s*(?:"([^"]*?)"|'([^']*?)')/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const href = (m[1] ?? m[2] ?? "").trim();
    col.add(href, "");
  }
}

/**
 * Strategy 3 — string literals in <script> tags.
 * Finds any quoted string containing `.pdf` inside inline JS or JSON-LD blocks.
 * Useful for pages that build PDF links from a JSON config embedded in the page.
 */
function extractScriptUrls(html: string, col: LinkCollector): void {
  const scriptRe = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  let sm: RegExpExecArray | null;
  while ((sm = scriptRe.exec(html)) !== null) {
    const content = sm[1] ?? "";
    // Match both "..." and '...' containing .pdf
    const urlRe = /["']([^"'\s]{4,500}\.pdf[^"']*?)["']/gi;
    let um: RegExpExecArray | null;
    while ((um = urlRe.exec(content)) !== null) {
      const href = (um[1] ?? "").trim();
      col.add(href, "");
    }
  }
}

/**
 * Runs all three extraction strategies against the HTML string and returns
 * a deduplicated list of PDF links in document order.
 *
 * Sources:
 *   1. <a href>       — static anchors (+ tracking-URL unwrapping)
 *   2. data-href      — CMS download widgets, JS-rendered buttons
 *   3. <script>       — inline JSON / JS variables that embed PDF paths
 *
 * mode controls which documents are kept:
 *   'bulletin_trimestriel' — excludes rapport annuel (default)
 *   'rapport_annuel'       — keeps only rapport annuel links
 */
export function extractPdfLinks(html: string, baseUrl: string, mode: CollectorMode = 'bulletin_trimestriel'): PdfLink[] {
  const col = makeLinkCollector(baseUrl, mode);
  extractAnchorHrefs(html, col);
  extractDataHrefs(html, col);
  extractScriptUrls(html, col);
  return col.links();
}

// ─── Period extraction from a link ───────────────────────────────────────────

interface ScoredCandidate {
  readonly link: PdfLink;
  readonly period: NormalizedPeriod | null; // null => "unknown"
  readonly documentIndex: number;
}

function extractPeriodFromLink(link: PdfLink): NormalizedPeriod | null {
  let filename = "";
  try {
    filename = decodeURIComponent(new URL(link.href).pathname.split("/").pop() ?? "");
  } catch {
    // keep empty
  }
  const filenameFriendly = filename.replace(/[-_]/g, " ");

  for (const source of [link.text, filenameFriendly, `${link.text} ${filenameFriendly}`] as const) {
    const r = parsePeriod(source);
    if (r.ok) return r.value;
  }
  return null;
}

// ─── Best-link selector ───────────────────────────────────────────────────────

/**
 * Selects the best PDF candidate from a list of links.
 * Algorithm:
 *   1. Discard links where no period can be extracted.
 *   2. Sort descending by period (year then quarter).
 *   3. Tie-break: link that appears latest in the document wins.
 */
function selectBestFromLinks(
  links: PdfLink[],
  pageUrl: string
): Result<PdfCandidate, HtmlFetchError> {
  if (links.length === 0) {
    return err({ reason: "NO_PDF_LINKS", message: "no PDF links found on page", url: pageUrl });
  }

  const scored: ScoredCandidate[] = [];
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    if (link === undefined) continue;
    const period = extractPeriodFromLink(link);
    scored.push({ link, period, documentIndex: i });
  }

  if (scored.length === 0) {
    return err({ reason: "NO_PDF_LINKS", message: "no bulletin PDF links found on page", url: pageUrl });
  }

  scored.sort((a, b) => {
    if (a.period !== null && b.period !== null) {
      const cmp = comparePeriods(b.period, a.period);
      if (cmp !== 0) return cmp;
    } else if (a.period !== null) return -1;
    else if (b.period !== null) return 1;
    return b.documentIndex - a.documentIndex;
  });

  const best = scored[0];
  if (best === undefined) {
    return err({ reason: "NO_PDF_LINKS", message: "internal: scored array empty", url: pageUrl });
  }

  const periodNorm = best.period !== null ? best.period.normalized : "unknown";
  return ok({ url: best.link.href, period: { normalized: periodNorm }, linkText: best.link.text });
}

// ─── Annual report link selector ─────────────────────────────────────────────

/**
 * Selects the best rapport annuel PDF link: most recent year wins.
 * Falls back to document order when no year can be extracted.
 */
function selectBestAnnualLink(
  links: PdfLink[],
  pageUrl: string,
  preferredYear?: number,
): Result<PdfCandidate, HtmlFetchError> {
  if (links.length === 0) {
    return err({ reason: "NO_PDF_LINKS", message: "no rapport annuel PDF links found on page", url: pageUrl });
  }

  interface ScoredAnnual {
    link: PdfLink;
    period: AnnualReportPeriod | null;
    documentIndex: number;
  }

  const scored: ScoredAnnual[] = links.map((link, i) => {
    let filename = "";
    try {
      filename = decodeURIComponent(new URL(link.href).pathname.split("/").pop() ?? "");
    } catch { /* ignore */ }
    const combined = `${link.text} ${filename}`;
    const period = parseAnnualYear(combined);
    return { link, period, documentIndex: i };
  });

  // Prefer the exact ra_year if provided, else take the most recent
  scored.sort((a, b) => {
    if (a.period !== null && b.period !== null) {
      if (preferredYear !== undefined) {
        const aMatch = a.period.year === preferredYear ? -1 : 0;
        const bMatch = b.period.year === preferredYear ? -1 : 0;
        if (aMatch !== bMatch) return aMatch - bMatch;
      }
      if (a.period.year !== b.period.year) return b.period.year - a.period.year;
    } else if (a.period !== null) return -1;
    else if (b.period !== null) return 1;
    return b.documentIndex - a.documentIndex;
  });

  const best = scored[0];
  if (best === undefined) {
    return err({ reason: "NO_PDF_LINKS", message: "internal: scored array empty", url: pageUrl });
  }

  const periodNorm = best.period !== null ? best.period.normalized : "unknown";
  return ok({ url: best.link.href, period: { normalized: periodNorm }, linkText: best.link.text });
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Loads pageUrl, extracts bulletin PDF links, selects the most recent by
 * year then trimester. Try static fetch first (cheap), fallback to Playwright
 * for JS-rendered pages.
 */
export async function fetchBestPdfLink(
  pageUrl: string,
  mode: CollectorMode = 'bulletin_trimestriel',
  preferredYear?: number,
): Promise<Result<PdfCandidate, HtmlFetchError>> {
  logger.info("page_fetch_started", { url: pageUrl });
  // ── 1. Static HTML fetch (fast path) ─────────────────────────────────────
  let html: string;
  try {
    html = await fetchHtml(pageUrl, MAX_REDIRECTS);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const reason: HtmlFetchErrorReason = message.startsWith("HTTP ") ? "HTTP_ERROR" : "FETCH_FAILED";
    logger.warn("html_fetch_failed", { url: pageUrl, reason, message });
    // Fall through to Playwright
    html = "";
  }

  const selectBest = (links: PdfLink[]): Result<PdfCandidate, HtmlFetchError> =>
    mode === 'rapport_annuel'
      ? selectBestAnnualLink(links, pageUrl, preferredYear)
      : selectBestFromLinks(links, pageUrl);

  if (html) {
    const staticLinks = extractPdfLinks(html, pageUrl, mode);
    logger.info("page_fetch_done", { mode: "fetch", url: pageUrl, linkCount: staticLinks.length, document_type: mode });
    if (staticLinks.length > 0) {
      logger.info("pdf_candidates", { url: pageUrl, count: staticLinks.length, topUrls: staticLinks.slice(0, 5).map((l) => l.href) });
    }
    const staticResult = selectBest(staticLinks);
    if (staticResult.ok) return staticResult;
  }

  // ── 2. Playwright fallback (JS/SPA pages) ─────────────────────────────────
  let fetchRenderedHtml: (url: string) => Promise<Result<string, { reason: string; message: string; url: string }>>;
  try {
    const pw = await import("./playwright.js");
    fetchRenderedHtml = pw.fetchRenderedHtml;
  } catch (e) {
    const message = `failed to load Playwright: ${e instanceof Error ? e.message : String(e)}`;
    logger.warn("playwright_module_load_failed", { url: pageUrl, message });
    if (!html) return err({ reason: "PLAYWRIGHT_FAILED", message, url: pageUrl });
    return err({ reason: "NO_PDF_LINKS", message: "no PDF found (static) and Playwright unavailable", url: pageUrl });
  }

  const renderResult = await fetchRenderedHtml(pageUrl);
  if (!renderResult.ok) {
    return err({ reason: "PLAYWRIGHT_FAILED", message: renderResult.error.message, url: pageUrl });
  }

  const pwLinks  = extractPdfLinks(renderResult.value, pageUrl, mode);
  logger.info("page_fetch_done", { mode: "playwright", url: pageUrl, linkCount: pwLinks.length, document_type: mode });
  if (pwLinks.length > 0) {
    logger.info("pdf_candidates", { url: pageUrl, count: pwLinks.length, topUrls: pwLinks.slice(0, 5).map((l) => l.href) });
  }
  const pwResult = selectBest(pwLinks);
  return pwResult;
}
