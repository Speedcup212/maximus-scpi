import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { MATCHER_REVISION, METRIC_PATTERNS as MATCHER_PATTERNS, compactSnippet, evidenceForNumeric } from "./matcher.mjs";

// Ne pas changer sans migrer public.refresh_scpi_metric_certifications, qui n'accepte que cette version.
// La révision du rapprocheur est tracée séparément (matcher_revision).
const EVIDENCE_VERSION = "2026-09-30-v1-page-proof";
const UA = "Mozilla/5.0 (compatible; MaximusSCPI-EvidenceBot/1.0; +https://maximusscpi.com)";
const MAX_BATCH = 4;
const MAX_PDF_BYTES = 35 * 1024 * 1024;

type BulletinRow = {
  id: string;
  scpi_slug: string;
  period: string;
  source_url: string;
  qa_status: string | null;
  extraction_confidence: number | null;
  extraction_json: Record<string, unknown> | null;
};

type PageText = { page: number | null; text: string };
type Evidence = {
  page: number | null;
  text: string;
  method: "pdf_page_text_match" | "html_text_match";
  value_match: true;
  raw_value: number | string;
  unit: string | null;
  distance: number;
  zero_rule?: "explicit";
};

const METRIC_PATTERNS = MATCHER_PATTERNS as Record<string, RegExp[]>;

function isStrongQa(value: unknown): boolean {
  const s = String(value || "").toLowerCase();
  return s.includes("verified") && !s.includes("partial") && !s.includes("review");
}

function cleanText(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, " ")
    .replace(/\u00a0|\u202f/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
}

function stripHtml(html: string): string {
  return cleanText(
    html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>|<\/li>|<\/h[1-6]>|<\/div>|<\/section>|<\/tr>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;|&apos;/gi, "'")
  );
}

async function shaText(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((x) => x.toString(16).padStart(2, "0")).join("");
}

async function fetchSource(url: string): Promise<{ isHtml: boolean; bytes?: Uint8Array; text?: string }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25_000);
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "User-Agent": UA, Accept: "application/pdf,text/html,*/*;q=0.5" },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status} ${url}`);
    const contentType = (response.headers.get("content-type") || "").toLowerCase();
    if (contentType.includes("text/html") || contentType.includes("application/xhtml")) {
      return { isHtml: true, text: await response.text() };
    }
    const buffer = await response.arrayBuffer();
    if (buffer.byteLength < 512 || buffer.byteLength > MAX_PDF_BYTES) {
      throw new Error(`Taille source invalide: ${buffer.byteLength} octets`);
    }
    const bytes = new Uint8Array(buffer);
    const signature = new TextDecoder().decode(bytes.slice(0, 4));
    if (signature !== "%PDF") {
      const decoded = new TextDecoder().decode(bytes);
      if (/<!doctype\s+html|<html/i.test(decoded.slice(0, 1000))) return { isHtml: true, text: decoded };
      throw new Error("Source non PDF et non HTML");
    }
    return { isHtml: false, bytes };
  } finally {
    clearTimeout(timer);
  }
}

async function extractPdfPages(bytes: Uint8Array): Promise<PageText[]> {
  const unpdf: any = await import("npm:unpdf@0.12.1");
  const pdf = await unpdf.getDocumentProxy(bytes);
  if (!pdf?.numPages || pdf.numPages > 80) throw new Error("Nombre de pages PDF invalide");
  const pages: PageText[] = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = cleanText(
      (content?.items || [])
        .map((item: any) => String(item?.str || ""))
        .filter(Boolean)
        .join(" ")
    );
    pages.push({ page: pageNumber, text });
    try { page.cleanup?.(); } catch { /* noop */ }
  }
  try { pdf.destroy?.(); } catch { /* noop */ }
  return pages;
}

function evidenceForCapitalType(value: string, pages: PageText[], isHtml: boolean): Evidence | null {
  const wanted = value.toLowerCase();
  const patterns = wanted === "variable"
    ? [/capital\s+variable/i, /scpi[^.\n]{0,120}[àa]\s+capital\s+variable/i]
    : [/capital\s+fixe/i, /variabilit[eé]\s+du\s+capital[^.\n]{0,100}suspend/i, /march[eé]\s+secondaire/i];
  for (const page of pages) {
    for (const re of patterns) {
      const m = re.exec(page.text);
      if (!m) continue;
      return {
        page: isHtml ? null : page.page,
        text: compactSnippet(page.text, m.index, m.index + m[0].length),
        method: isHtml ? "html_text_match" : "pdf_page_text_match",
        value_match: true,
        raw_value: value,
        unit: null,
        distance: 0,
      };
    }
  }
  return null;
}

function buildEvidence(metrics: Record<string, unknown>, pages: PageText[], isHtml: boolean): Record<string, Evidence> {
  const evidence: Record<string, Evidence> = {};
  for (const [metric, rawValue] of Object.entries(metrics || {})) {
    if (!METRIC_PATTERNS[metric]) continue;
    if (metric === "capital_type" && typeof rawValue === "string") {
      const proof = evidenceForCapitalType(rawValue, pages, isHtml);
      if (proof) evidence[metric] = proof;
      continue;
    }
    if (typeof rawValue === "number" && Number.isFinite(rawValue)) {
      const proof = evidenceForNumeric(metric, rawValue, pages, isHtml) as Evidence | null;
      if (proof) evidence[metric] = proof;
    }
  }
  return evidence;
}

async function processBulletin(db: any, row: BulletinRow) {
  const extraction = (row.extraction_json || {}) as Record<string, any>;
  const metrics = extraction.metrics;
  if (!metrics || typeof metrics !== "object") return { id: row.id, slug: row.scpi_slug, status: "no_metrics" };
  if (!row.source_url) return { id: row.id, slug: row.scpi_slug, status: "no_source_url" };

  const source = await fetchSource(row.source_url);
  let pages: PageText[];
  if (source.isHtml) {
    pages = [{ page: null, text: stripHtml(source.text || "") }];
  } else {
    pages = await extractPdfPages(source.bytes!);
  }
  const evidence = buildEvidence(metrics as Record<string, unknown>, pages, source.isHtml);
  const metricCount = Object.keys(metrics).length;
  const evidenceCount = Object.keys(evidence).length;
  const nextExtraction = {
    ...extraction,
    evidence,
    evidence_version: EVIDENCE_VERSION,
    matcher_revision: MATCHER_REVISION,
    evidence_generated_at: new Date().toISOString(),
    evidence_stats: {
      metric_count: metricCount,
      evidence_count: evidenceCount,
      coverage: metricCount ? Math.round((evidenceCount / metricCount) * 1000) / 1000 : 0,
      source_kind: source.isHtml ? "html" : "pdf",
      page_count: pages.length,
    },
  };

  const { error } = await db
    .from("scpi_bulletins")
    .update({ extraction_json: nextExtraction })
    .eq("id", row.id);
  if (error) throw new Error(error.message);

  return {
    id: row.id,
    slug: row.scpi_slug,
    period: row.period,
    status: "evidence_saved",
    metric_count: metricCount,
    evidence_count: evidenceCount,
    coverage: metricCount ? evidenceCount / metricCount : 0,
    source_kind: source.isHtml ? "html" : "pdf",
  };
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return Response.json({ error: "POST required" }, { status: 405 });

  const base = Deno.env.get("SUPABASE_URL") || "";
  let serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (!serviceKey) {
    try { serviceKey = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}").default || ""; } catch { /* noop */ }
  }
  if (!base || !serviceKey) return Response.json({ error: "admin credentials unavailable" }, { status: 500 });

  const db = createClient(base, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const token = req.headers.get("x-cron-token") || "";
  const tokenHash = await shaText(token);
  const { data: cfg } = await db
    .from("scpi_bulletin_runtime_config")
    .select("value")
    .eq("key", "cron_token_sha256")
    .maybeSingle();
  if (!token || !cfg || cfg.value !== tokenHash) return Response.json({ error: "unauthorized" }, { status: 401 });

  let body: any = {};
  try { body = await req.json(); } catch { /* noop */ }
  const requestedIds = Array.isArray(body?.bulletin_ids)
    ? body.bulletin_ids.map((x: unknown) => String(x)).filter(Boolean).slice(0, MAX_BATCH)
    : [];
  const limit = Math.max(1, Math.min(MAX_BATCH, Number(body?.limit || 2)));

  let query = db
    .from("scpi_bulletins")
    .select("id,scpi_slug,period,source_url,qa_status,extraction_confidence,extraction_json")
    .order("processed_at", { ascending: false, nullsFirst: false })
    .order("found_at", { ascending: false })
    .limit(200);
  if (requestedIds.length) query = query.in("id", requestedIds);

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const rows = ((data || []) as BulletinRow[])
    // En mode ciblé, documenter les preuves des bulletins partiels sans les promouvoir.
    // Les pièces invalides (mauvaise SCPI ou hors bulletin) restent toujours exclues.
    .filter((row) => requestedIds.length
      ? row.period === "2026-T3" && /^https:\/\//i.test(row.source_url || "") &&
        !/^invalid_|not_bulletin|wrong_document/i.test(String(row.qa_status || ""))
      : isStrongQa(row.qa_status))
    .filter((row) => {
      if (requestedIds.length) return true;
      const extraction = row.extraction_json as Record<string, any> | null;
      return extraction?.evidence_version !== EVIDENCE_VERSION;
    })
    .slice(0, requestedIds.length || limit);

  const results: unknown[] = [];
  for (const row of rows) {
    try {
      results.push(await processBulletin(db, row));
    } catch (error) {
      results.push({
        id: row.id,
        slug: row.scpi_slug,
        period: row.period,
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return Response.json({
    ok: true,
    evidence_version: EVIDENCE_VERSION,
    processed: results.length,
    results,
  });
});
